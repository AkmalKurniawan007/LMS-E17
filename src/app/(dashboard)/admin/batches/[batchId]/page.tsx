"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Users, Calendar, Settings, FileUp, Plus, Edit, Loader2, Save, Award, Trash2, GripVertical, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import CertificateManager from "./certificate-manager"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { id } from "date-fns/locale"

export default function AdminBatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = use(params)
  const supabase = createClient()
  const [activeTab, setActiveTab] = React.useState<"students" | "sessions" | "settings" | "certificates">("students")

  const [batchData, setBatchData] = React.useState<any>(null)
  const [students, setStudents] = React.useState<any[]>([])
  const [sessions, setSessions] = React.useState<any[]>([])
  const [mentors, setMentors] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  
  const [isAddManualOpen, setIsAddManualOpen] = React.useState(false)
  const [availableStudents, setAvailableStudents] = React.useState<any[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const [editingSessionId, setEditingSessionId] = React.useState<string | null>(null)
  const [sessionForm, setSessionForm] = React.useState({
    scheduled_at: "",
    start_time: "",
    end_time: "",
    session_type: "offline",
    meeting_link: ""
  })

  const [editForm, setEditForm] = React.useState({
    name: "",
    start_date: "",
    end_date: "",
    mentor_id: ""
  })

  React.useEffect(() => {
    fetchData()
  }, [batchId])

  const fetchData = async () => {
    setIsLoading(true)
    
    // Fetch batch data
    const { data: batch } = await supabase
      .from('batches')
      .select(`
        id, name, start_date, end_date, program_id, certificate_template_url,
        programs ( name ),
        batch_mentors ( mentor_id, users ( full_name ) )
      `)
      .eq('id', batchId)
      .single()

    if (batch) {
      let status = "Akan Datang"
      const today = new Date().toISOString().split('T')[0]
      if (batch.start_date <= today && (!batch.end_date || batch.end_date >= today)) {
        status = "Berjalan"
      } else if (batch.end_date && batch.end_date < today) {
        status = "Selesai"
      }

      setBatchData({
        ...batch,
        program: (batch.programs as any)?.name || "-",
        mentor: (batch.batch_mentors as any)?.[0]?.users?.full_name || "Belum Ada",
        status
      })
      setEditForm({
        name: batch.name,
        start_date: batch.start_date,
        end_date: batch.end_date || "",
        mentor_id: (batch.batch_mentors as any)?.[0]?.mentor_id || ""
      })
    }

    // Fetch students
    const { data: enrolls } = await supabase
      .from('enrollments')
      .select(`
        id, created_at, status,
        users ( id, full_name, email )
      `)
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false })
      
    if (enrolls) {
      setStudents(enrolls.map((enr: any) => ({
        id: enr.id,
        user_id: enr.users?.id,
        name: enr.users?.full_name || "Siswa",
        email: enr.users?.email || "-",
        phone: "-",
        status: enr.status,
        joinedAt: new Date(enr.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      })))
    }

    // Fetch sessions
    const { data: sessData } = await supabase
      .from('sessions')
      .select('*')
      .eq('batch_id', batchId)
      .order('order_number', { ascending: true })
    if (sessData) setSessions(sessData)

    // Fetch mentors
    const { data: mentorsList } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'mentor')
    if (mentorsList) setMentors(mentorsList)

    setIsLoading(false)
  }

  const handleUpdateBatch = async () => {
    setIsSaving(true)
    const { error } = await supabase
      .from('batches')
      .update({
        name: editForm.name,
        start_date: editForm.start_date,
        end_date: editForm.end_date || null
      })
      .eq('id', batchId)

    if (error) {
      alert("Gagal update batch: " + error.message)
    } else {
      if (editForm.mentor_id) {
        await supabase.from('batch_mentors').delete().eq('batch_id', batchId)
        await supabase.from('batch_mentors').insert({
          batch_id: batchId,
          mentor_id: editForm.mentor_id
        })
      }
      alert("Pengaturan batch berhasil disimpan!")
      fetchData()
    }
    setIsSaving(false)
  }

  const handleUpdateSession = async (sessionId: string) => {
    setIsSaving(true)
    const { error } = await supabase
      .from('sessions')
      .update({
        scheduled_at: sessionForm.scheduled_at || null,
        start_time: sessionForm.start_time || null,
        end_time: sessionForm.end_time || null,
        session_type: sessionForm.session_type,
        meeting_link: sessionForm.meeting_link || null,
        meeting_link_status: sessionForm.meeting_link ? 'approved' : 'pending',
        meeting_link_provider: 'admin'
      })
      .eq('id', sessionId)
      
    if (error) {
      alert("Gagal memperbarui sesi: " + error.message)
    } else {
      setEditingSessionId(null)
      fetchData()
    }
    setIsSaving(false)
  }

  const handleApproveLink = async (sessionId: string, status: string) => {
    const { error } = await supabase
      .from('sessions')
      .update({ meeting_link_status: status })
      .eq('id', sessionId)
      
    if (error) alert("Gagal update status: " + error.message)
    else fetchData()
  }

  const handleGenerateSessions = async () => {
    if (!confirm("Generate sesi berdasarkan kurikulum program?")) return
    setIsSaving(true)
    
    // 1. Fetch program sessions
    const { data: progSess } = await supabase
      .from('program_sessions')
      .select('*')
      .eq('program_id', batchData?.program_id || null)
      .order('order_number', { ascending: true })
      
    if (!progSess || progSess.length === 0) {
      alert("Program ini belum memiliki sesi kurikulum (program_sessions kosong).")
      setIsSaving(false)
      return
    }

    // 2. Insert into sessions
    const newSessions = progSess.map(ps => ({
      batch_id: batchId,
      order_number: ps.order_number,
      title: ps.title,
      description: ps.description,
      format: ps.format
    }))

    const { error } = await supabase.from('sessions').insert(newSessions)
    if (error) {
      alert("Gagal generate sesi: " + error.message)
    } else {
      fetchData()
    }
    setIsSaving(false)
  }

  const handleResetSessions = async () => {
    if (!confirm("PERINGATAN: Mereset sesi akan MENGHAPUS semua sesi yang ada saat ini beserta materi, tugas, kuis, dan absensi di dalamnya. Apakah Anda yakin ingin mengambil ulang data sesi dari Program?")) return
    setIsSaving(true)
    
    // 1. Hapus semua sesi saat ini
    const { error: deleteErr } = await supabase.from('sessions').delete().eq('batch_id', batchId)
    if (deleteErr) {
       alert("Gagal menghapus sesi lama: " + deleteErr.message)
       setIsSaving(false)
       return
    }

    // 2. Fetch program sessions
    const { data: progSess } = await supabase
      .from('program_sessions')
      .select('*')
      .eq('program_id', batchData?.program_id || null)
      .order('order_number', { ascending: true })
      
    if (!progSess || progSess.length === 0) {
      alert("Program ini belum memiliki sesi kurikulum. Sesi lama telah terhapus.")
      fetchData()
      setIsSaving(false)
      return
    }

    // 3. Insert into sessions
    const newSessions = progSess.map(ps => ({
      batch_id: batchId,
      order_number: ps.order_number,
      title: ps.title,
      description: ps.description,
      format: ps.format
    }))

    const { error } = await supabase.from('sessions').insert(newSessions)
    if (error) {
      alert("Gagal generate sesi baru: " + error.message)
    } else {
      alert("Sesi berhasil di-reset dan disinkronkan dengan Program.")
      fetchData()
    }
    setIsSaving(false)
  }

  const handleRemoveStudent = async (enrollId: string, studentName: string) => {
    if (!confirm(`Keluarkan ${studentName} dari batch ini?`)) return
    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'mengundurkan diri' })
      .eq('id', enrollId)
      
    if (error) alert("Gagal mengeluarkan siswa: " + error.message)
    else {
      alert("Siswa berhasil dikeluarkan.")
      fetchData()
    }
  }

  const handleOpenAddManual = async () => {
    setIsAddManualOpen(true)
    setSearchQuery("")
    const { data: allSiswa } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'siswa')
      
    if (allSiswa) {
      const enrolledIds = students.map(s => s.user_id)
      setAvailableStudents(allSiswa.filter(s => !enrolledIds.includes(s.id)))
    }
  }

  const handleAddManualSubmit = async () => {
    if (selectedStudentIds.length === 0) return alert("Pilih minimal satu siswa terlebih dahulu")
    setIsSaving(true)
    
    const enrollmentsToInsert = selectedStudentIds.map(id => ({
        user_id: id,
        batch_id: batchId,
        status: 'aktif'
    }))
    
    const { error } = await supabase
      .from('enrollments')
      .insert(enrollmentsToInsert)
      
    if (error) {
      alert("Gagal menambahkan siswa: " + error.message)
    } else {
      alert(`${selectedStudentIds.length} siswa berhasil ditambahkan ke batch!`)
      setIsAddManualOpen(false)
      setSelectedStudentIds([])
      setSearchQuery("")
      fetchData()
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-e17-navy mb-4" />
        <p className="text-slate-500 font-medium">Memuat data batch...</p>
      </div>
    )
  }

  if (!batchData) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="text-xl font-bold text-slate-700">Batch Tidak Ditemukan</h2>
        <Link href="/admin/batches" className="text-e17-navy hover:underline mt-2">Kembali ke daftar batch</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center space-x-4 border-b border-slate-200 pb-5">
        <Link href="/admin/batches">
          <Button variant="ghost" size="icon" className="shrink-0 bg-white border border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-e17-dark">{batchData.name}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {batchData.status}
            </span>
          </div>
          <p className="text-sm text-slate-500">Program: {batchData.program} • Mentor: {batchData.mentor}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("students")}
            className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "students"
                ? "border-e17-navy text-e17-navy font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Users className={`mr-2 h-5 w-5 ${activeTab === "students" ? "text-e17-navy" : ""}`} />
            Siswa Terdaftar ({students.length})
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "sessions"
                ? "border-e17-navy text-e17-navy font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Calendar className={`mr-2 h-5 w-5 ${activeTab === "sessions" ? "text-e17-navy" : ""}`} />
            Jadwal Sesi
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "settings"
                ? "border-e17-navy text-e17-navy font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Settings className={`mr-2 h-5 w-5 ${activeTab === "settings" ? "text-e17-navy" : ""}`} />
            Pengaturan Batch
          </button>
          <button
            onClick={() => setActiveTab("certificates")}
            className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "certificates"
                ? "border-e17-navy text-e17-navy font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Award className={`mr-2 h-5 w-5 ${activeTab === "certificates" ? "text-e17-navy" : ""}`} />
            Sertifikat
          </button>
        </nav>
      </div>

      <div className="card-clean overflow-hidden">
        
        {/* TAB 1: STUDENTS */}
        {activeTab === "students" && (
          <div className="p-0">
             <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-e17-dark">Daftar Siswa</h2>
                <p className="text-sm text-slate-500">Kelola siswa yang terdaftar pada batch ini.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href="/admin/students/import">
                  <Button variant="outline" className="border-slate-200 bg-white text-slate-700"><FileUp className="h-4 w-4 mr-2" /> Import CSV</Button>
                </Link>
                <Button variant="orange" className="font-bold shadow-sm" onClick={handleOpenAddManual}>
                  <Plus className="h-4 w-4 mr-2" /> Tambah Manual
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-white uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">No. HP</th>
                    <th className="px-6 py-4 font-semibold">Tgl Daftar</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        Belum ada siswa yang terdaftar di batch ini.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-e17-dark">{student.name}</div>
                          {student.status === 'mengundurkan diri' && (
                            <span className="text-[10px] font-bold text-red-500 uppercase">Mengundurkan Diri</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{student.email}</td>
                        <td className="px-6 py-4 text-slate-500">{student.phone}</td>
                        <td className="px-6 py-4 text-slate-500">{student.joinedAt}</td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleRemoveStudent(student.id, student.name)}
                            disabled={student.status === 'mengundurkan diri'}
                          >
                            Keluarkan
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {isAddManualOpen && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-e17-dark">Tambah Siswa Manual</h3>
                    <button onClick={() => setIsAddManualOpen(false)} className="text-slate-400 hover:text-slate-600">
                      X
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-slate-700">Pilih Siswa</label>
                        <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{selectedStudentIds.length} terpilih</span>
                      </div>
                      
                      <div className="mb-3">
                        <Input 
                          placeholder="Cari nama atau email..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 bg-slate-50/50">
                        {availableStudents
                          .filter(s => s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(s => (
                          <label key={s.id} className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-md cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                            <input 
                              type="checkbox"
                              checked={selectedStudentIds.includes(s.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentIds([...selectedStudentIds, s.id])
                                } else {
                                  setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id))
                                }
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-e17-navy focus:ring-e17-navy"
                            />
                            <div>
                               <span className="block text-sm font-semibold text-slate-800">{s.full_name}</span>
                               <span className="block text-xs text-slate-500">{s.email}</span>
                            </div>
                          </label>
                        ))}
                        {availableStudents.length === 0 && (
                          <p className="text-xs text-rose-500 p-2 text-center font-medium">Tidak ada siswa yang tersedia (Semua siswa sudah masuk batch ini).</p>
                        )}
                        {availableStudents.length > 0 && availableStudents.filter(s => s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                          <p className="text-xs text-slate-500 p-2 text-center font-medium">Tidak ada siswa yang cocok dengan pencarian.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddManualOpen(false)}>Batal</Button>
                    <Button className="bg-e17-navy hover:bg-slate-800 text-white" onClick={handleAddManualSubmit} disabled={isSaving || selectedStudentIds.length === 0}>
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Tambahkan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SESSIONS */}
        {activeTab === "sessions" && (
          <div className="p-0">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-e17-dark">Jadwal Sesi</h2>
                <p className="text-sm text-slate-500">Sesi yang akan dipelajari dalam batch ini. Biasanya di-copy dari program.</p>
              </div>
              {sessions.length > 0 && (
                <Button 
                   variant="outline" 
                   onClick={handleResetSessions}
                   disabled={isSaving}
                   className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                   {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                   Reset & Sinkronkan
                </Button>
              )}
            </div>
            <div className="p-6 space-y-3 bg-slate-50 min-h-[300px]">
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-700">Belum Ada Sesi</h3>
                  <p className="text-sm text-slate-500 mb-4">Sesi belum digenerate untuk batch ini.</p>
                  <Button onClick={handleGenerateSessions} disabled={isSaving} className="bg-e17-navy hover:bg-slate-800 text-white font-bold">
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calendar className="h-4 w-4 mr-2" />}
                    Generate Sesi dari Program
                  </Button>
                </div>
              ) : (
                sessions.map((session, idx) => (
                  <div key={session.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800">{session.title}</h4>
                          <p className="text-sm text-slate-500 mb-2">{session.description || "Tidak ada deskripsi"}</p>
                        </div>
                        {editingSessionId !== session.id && (
                          <div className="flex gap-2">
                            <Link href={`/admin/batches/${batchId}/sessions/${session.id}`}>
                              <Button variant="outline" size="sm" className="h-8">
                                Kelola Detail
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => {
                               setEditingSessionId(session.id);
                               setSessionForm({
                                 scheduled_at: session.scheduled_at ? new Date(session.scheduled_at).toISOString().slice(0, 16) : "",
                                 start_time: session.start_time || "",
                                 end_time: session.end_time || "",
                                 session_type: session.session_type || 'offline',
                                 meeting_link: session.meeting_link || ""
                               })
                            }}>
                               <Edit className="h-4 w-4 text-slate-500" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {editingSessionId === session.id ? (
                        <div className="bg-slate-50 p-4 rounded-lg mt-2 border border-slate-200 space-y-4">
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                             <div className="lg:col-span-2 relative">
                               <label className="text-xs font-semibold text-slate-600 block mb-1">Tanggal Sesi</label>
                               <div className="custom-datepicker-wrapper">
                                 <DatePicker
                                   selected={sessionForm.scheduled_at ? new Date(sessionForm.scheduled_at) : null}
                                   onChange={(date: Date | null) => {
                                     // Preserve the time if it exists, or just save the date part
                                     const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0] : "";
                                     setSessionForm({...sessionForm, scheduled_at: formattedDate});
                                   }}
                                   dateFormat="dd MMMM yyyy"
                                   locale={id}
                                   placeholderText="Pilih Tanggal Sesi"
                                   className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                                   wrapperClassName="w-full"
                                   showPopperArrow={false}
                                 />
                               </div>
                             </div>
                             <div>
                               <label className="text-xs font-semibold text-slate-600 block mb-1">Jam Mulai</label>
                               <Input type="time" value={sessionForm.start_time} onChange={(e) => setSessionForm({...sessionForm, start_time: e.target.value})} className="h-8 text-sm" />
                             </div>
                             <div>
                               <label className="text-xs font-semibold text-slate-600 block mb-1">Jam Selesai</label>
                               <Input type="time" value={sessionForm.end_time} onChange={(e) => setSessionForm({...sessionForm, end_time: e.target.value})} className="h-8 text-sm" />
                             </div>
                             <div className="sm:col-span-2 lg:col-span-4">
                               <label className="text-xs font-semibold text-slate-600 block mb-1">Tipe Sesi</label>
                               <select className="w-full border-slate-300 rounded-md text-sm h-8 px-2" value={sessionForm.session_type} onChange={(e) => setSessionForm({...sessionForm, session_type: e.target.value})}>
                                 <option value="offline">Tatap Muka (Offline)</option>
                                 <option value="online">Daring (Online)</option>
                               </select>
                             </div>
                           </div>
                           {sessionForm.session_type === 'online' && (
                             <div>
                               <label className="text-xs font-semibold text-slate-600 block mb-1">Link Pertemuan (Zoom/Meet)</label>
                               <Input value={sessionForm.meeting_link} onChange={(e) => setSessionForm({...sessionForm, meeting_link: e.target.value})} placeholder="https://..." className="h-8 text-sm" />
                               <p className="text-[10px] text-slate-500 mt-1">Kosongkan jika mentor yang akan menyediakan link ini.</p>
                             </div>
                           )}
                           <div className="flex gap-2 justify-end mt-2">
                             <Button variant="outline" size="sm" onClick={() => setEditingSessionId(null)}>Batal</Button>
                             <Button size="sm" onClick={() => handleUpdateSession(session.id)} disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan'}</Button>
                           </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {/* Badge Status */}
                          {session.status === 'ongoing' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                              Sedang Berjalan
                            </span>
                          ) : session.status === 'completed' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                              Selesai
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
                              Belum Mulai
                            </span>
                          )}

                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            {session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString('id-ID', {dateStyle: 'medium'}) : 'Belum Dijadwalkan'}
                            {(session.start_time || session.end_time) && ` • ${session.start_time || '??:??'} - ${session.end_time || '??:??'}`}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${session.session_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {session.session_type === 'online' ? 'Online' : 'Offline'}
                          </span>
                          
                          {session.session_type === 'online' && session.meeting_link_status === 'pending' && session.meeting_link_provider === 'mentor' && (
                            <div className="w-full bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2 flex justify-between items-center">
                              <div>
                                <p className="text-xs font-bold text-amber-800">Mentor Mengajukan Link Meeting</p>
                                <a href={session.meeting_link} target="_blank" rel="noreferrer" className="text-xs text-amber-600 hover:underline">{session.meeting_link}</a>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-7 text-xs border-amber-200 text-amber-700 hover:bg-amber-100" onClick={() => handleApproveLink(session.id, 'rejected')}>Tolak</Button>
                                <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={() => handleApproveLink(session.id, 'approved')}>Setujui</Button>
                              </div>
                            </div>
                          )}
                          
                          {session.session_type === 'online' && session.meeting_link_status === 'approved' && session.meeting_link && (
                             <a href={session.meeting_link} target="_blank" rel="noreferrer" className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 hover:underline border border-blue-200">
                               Link Meeting (Disetujui)
                             </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === "settings" && (
          <div className="p-0">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-e17-dark">Pengaturan Batch</h2>
              <p className="text-sm text-slate-500">Ubah informasi dasar batch dan penugasan mentor.</p>
            </div>
            <div className="p-6 max-w-2xl space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Batch</label>
                <Input 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tanggal Mulai</label>
                  <Input 
                    type="date"
                    value={editForm.start_date} 
                    onChange={(e) => setEditForm({...editForm, start_date: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tanggal Selesai</label>
                  <Input 
                    type="date"
                    value={editForm.end_date} 
                    onChange={(e) => setEditForm({...editForm, end_date: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mentor Utama</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy"
                  value={editForm.mentor_id}
                  onChange={(e) => setEditForm({...editForm, mentor_id: e.target.value})}
                >
                  <option value="">-- Pilih Mentor --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button variant="orange" className="font-bold shadow-sm" onClick={handleUpdateBatch} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CERTIFICATES */}
        {activeTab === "certificates" && (
          <div className="p-0">
             <CertificateManager 
               batchId={batchId} 
               initialTemplateUrl={batchData.certificate_template_url || null}
               students={students}
             />
          </div>
        )}

      </div>
    </div>
  )
}
