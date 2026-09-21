"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, Calendar, Video, FileText, CheckSquare, Users, Play, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import QuizBuilderClient from "./quiz-builder-client"
import { logAction } from "@/utils/logger-actions"

export default function MentorSessionDetailPage({
  params,
}: {
  params: Promise<{ batchId: string, sessionId: string }>
}) {
  const { batchId, sessionId } = use(params)
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = React.useState<"info" | "materials" | "attendance">("info")
  const [session, setSession] = React.useState<any>(null)
  const [students, setStudents] = React.useState<any[]>([])
  const [attendances, setAttendances] = React.useState<Record<string, any>>({})
  
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false)
  const [isAddingMaterial, setIsAddingMaterial] = React.useState(false)

  const [uploadType, setUploadType] = React.useState<"material" | "task" | "quiz">("material")
  const [newMaterial, setNewMaterial] = React.useState({ title: "", type: "pdf", url: "" })
  const [newTask, setNewTask] = React.useState({ title: "", description: "", deadline: "", is_final_project: false })
  const [newQuiz, setNewQuiz] = React.useState({ title: "", passingGrade: 70, maxRetries: 3, deadline: "" })
  const [managingQuizId, setManagingQuizId] = React.useState<string | null>(null)

  // Edit states
  const [editingTask, setEditingTask] = React.useState<any>(null)
  const [editingQuiz, setEditingQuiz] = React.useState<any>(null)

  React.useEffect(() => {
    fetchSessionData()
  }, [sessionId])

  const fetchSessionData = async () => {
    setIsLoading(true)
    
    // Fetch session details + materials
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        batches ( name, start_date, end_date, programs(name) ),
        materials ( * ),
        tasks ( * ),
        quizzes ( * )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      console.error("Error fetching session:", sessionError)
      toast.error("Gagal memuat data sesi")
    } else {
      setSession(sessionData)
    }

    // Fetch enrolled students
    const { data: enrollmentsData } = await supabase
      .from('enrollments')
      .select(`
        id,
        users ( id, full_name, email )
      `)
      .eq('batch_id', batchId)
      
    if (enrollmentsData) {
      setStudents(enrollmentsData.map((e: any) => ({
        id: e.users?.id,
        name: e.users?.full_name,
        email: e.users?.email
      })))
    }

    // Fetch attendances for this session
    const { data: attData } = await supabase
      .from('attendances')
      .select('*')
      .eq('session_id', sessionId)

    if (attData) {
      const attMap: Record<string, any> = {}
      attData.forEach((att: any) => {
        attMap[att.user_id] = att
      })
      setAttendances(attMap)
    }

    setIsLoading(false)
  }

  const handleUpdateStatus = async (newStatus: 'not_started' | 'ongoing' | 'completed') => {
    if (!confirm(`Ubah status sesi menjadi ${newStatus === 'ongoing' ? 'Sedang Berjalan' : 'Selesai'}?`)) return
    
    setIsUpdatingStatus(true)
    
    const updates: any = { status: newStatus }
    if (newStatus === 'ongoing') updates.started_at = new Date().toISOString()
    if (newStatus === 'completed') updates.ended_at = new Date().toISOString()

    const { error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)

    if (error) {
      toast.error("Gagal mengubah status sesi: " + error.message)
    } else {
      const { data: authData } = await supabase.auth.getUser()
      if (authData.user) {
        await logAction('mentor', 'Ubah Status Sesi', `Mengubah status sesi menjadi ${newStatus}`, { user_id: authData.user.id, target_id: sessionId })
      }
      toast.success("Status sesi berhasil diperbarui")
      fetchSessionData()
    }
    setIsUpdatingStatus(false)
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMaterial.title) return toast.error("Judul materi wajib diisi")

    const { error } = await supabase
      .from('materials')
      .insert({
        session_id: sessionId,
        title: newMaterial.title,
        type: newMaterial.type,
        content_url: newMaterial.url || '#',
        order_number: 1
      })

    if (error) {
      toast.error("Gagal menambahkan materi: " + error.message)
    } else {
      toast.success("Materi berhasil ditambahkan")
      setNewMaterial({ title: "", type: "pdf", url: "" })
      setIsAddingMaterial(false)
      fetchSessionData()
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title || !newTask.deadline) return toast.error("Judul dan deadline wajib diisi")

    const { error } = await supabase
      .from('tasks')
      .insert({
        session_id: sessionId,
        title: newTask.title,
        description: newTask.description,
        deadline: new Date(newTask.deadline).toISOString(),
        order_number: 1,
        is_final_project: newTask.is_final_project
      })

    if (error) {
      toast.error("Gagal menambahkan tugas: " + error.message)
    } else {
      toast.success("Tugas berhasil ditambahkan")
      setNewTask({ title: "", description: "", deadline: "", is_final_project: false })
      setIsAddingMaterial(false)
      fetchSessionData()
    }
  }

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuiz.title) return toast.error("Judul kuis wajib diisi")

    const insertData: any = {
      session_id: sessionId,
      title: newQuiz.title,
      passing_grade: newQuiz.passingGrade,
      max_retries: newQuiz.maxRetries,
      order_number: 1
    }

    if (newQuiz.deadline) {
      insertData.deadline = new Date(newQuiz.deadline).toISOString()
    }

    const { error } = await supabase
      .from('quizzes')
      .insert(insertData)

    if (error) {
      toast.error("Gagal menambahkan kuis: " + error.message)
    } else {
      toast.success("Kuis berhasil ditambahkan")
      setNewQuiz({ title: "", passingGrade: 70, maxRetries: 3, deadline: "" })
      setIsAddingMaterial(false)
      fetchSessionData()
    }
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask.title || !editingTask.deadline) return toast.error("Judul dan deadline wajib diisi")

    const { error } = await supabase
      .from('tasks')
      .update({
        title: editingTask.title,
        description: editingTask.description,
        deadline: new Date(editingTask.deadline).toISOString(),
        is_final_project: editingTask.is_final_project
      })
      .eq('id', editingTask.id)

    if (error) {
      toast.error("Gagal memperbarui tugas: " + error.message)
    } else {
      toast.success("Tugas berhasil diperbarui")
      setEditingTask(null)
      fetchSessionData()
    }
  }

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingQuiz.title) return toast.error("Judul kuis wajib diisi")

    const updateData: any = {
      title: editingQuiz.title,
      passing_grade: editingQuiz.passingGrade,
      max_retries: editingQuiz.maxRetries,
    }

    if (editingQuiz.deadline) {
       updateData.deadline = new Date(editingQuiz.deadline).toISOString()
    } else {
       updateData.deadline = null
    }

    const { error } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('id', editingQuiz.id)

    if (error) {
      toast.error("Gagal memperbarui kuis: " + error.message)
    } else {
      toast.success("Kuis berhasil diperbarui")
      setEditingQuiz(null)
      fetchSessionData()
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Hapus materi ini?")) return
    const { error } = await supabase.from('materials').delete().eq('id', materialId)
    if (error) toast.error("Gagal menghapus materi")
    else { toast.success("Materi dihapus"); fetchSessionData() }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Hapus tugas ini?")) return
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) toast.error("Gagal menghapus tugas")
    else { toast.success("Tugas dihapus"); fetchSessionData() }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Hapus kuis ini?")) return
    const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
    if (error) toast.error("Gagal menghapus kuis")
    else { toast.success("Kuis dihapus"); fetchSessionData() }
  }

  const handleManualAttendance = async (userId: string, sourceValue: string) => {
    const { data: userData } = await supabase.auth.getUser()
    const recordedBy = userData.user?.id

    const existingAtt = attendances[userId]
    
    if (sourceValue === 'alpha') {
      if (existingAtt) {
        const { error } = await supabase.from('attendances').delete().eq('id', existingAtt.id)
        if (error) toast.error("Gagal menghapus absensi")
        else fetchSessionData()
      }
      return
    }

    if (existingAtt) {
      // Update
      const { error } = await supabase
        .from('attendances')
        .update({ source: sourceValue, recorded_by: recordedBy })
        .eq('id', existingAtt.id)
        
      if (error) toast.error("Gagal mengubah absensi")
      else fetchSessionData()
    } else {
      // Insert
      const { error } = await supabase
        .from('attendances')
        .insert({
          session_id: sessionId,
          user_id: userId,
          source: sourceValue,
          recorded_by: recordedBy
        })
        
      if (error) toast.error("Gagal mencatat absensi: " + error.message)
      else fetchSessionData()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-e17-navy mb-4" />
        <p className="text-slate-500 font-medium">Memuat detail sesi...</p>
      </div>
    )
  }

  if (!session) return <div>Sesi tidak ditemukan.</div>

  const isBeforeBatchStart = session.batches?.start_date ? new Date() < new Date(session.batches.start_date) : false;
  
  // Format dates for min/max attributes on inputs
  const minDateTime = session.batches?.start_date ? new Date(session.batches.start_date).toISOString().slice(0, 16) : undefined;
  const maxDateTime = session.batches?.end_date ? new Date(session.batches.end_date).toISOString().slice(0, 16) : undefined;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center space-x-4 border-b border-slate-200 pb-5">
        <Link href={`/mentor/batches/${batchId}`}>
          <Button variant="ghost" size="icon" className="shrink-0 bg-white border border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </Button>
        </Link>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-e17-dark">{session.title}</h1>
              {session.status === 'ongoing' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> Sedang Berjalan
                </span>
              ) : session.status === 'completed' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-700 uppercase">
                  Selesai
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 uppercase">
                  Belum Mulai
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              Batch: {session.batches?.name} • Program: {session.batches?.programs?.name}
            </p>
          </div>
          
          <div className="flex gap-2">
            {session.status === 'not_started' && (
              <Button 
                onClick={() => handleUpdateStatus('ongoing')} 
                disabled={isUpdatingStatus || isBeforeBatchStart} 
                className={`font-bold ${isBeforeBatchStart ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-e17-primary text-e17-navy hover:bg-yellow-400'}`}
                title={isBeforeBatchStart ? 'Batch belum dimulai' : ''}
              >
                <Play className="w-4 h-4 mr-2" /> {isBeforeBatchStart ? 'Menunggu Batch Dimulai' : 'Mulai Sesi Sekarang'}
              </Button>
            )}
            {session.status === 'ongoing' && (
              <Button onClick={() => handleUpdateStatus('completed')} disabled={isUpdatingStatus} className="bg-slate-800 text-white hover:bg-slate-700 font-bold">
                 Selesaikan Sesi
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("info")}
            className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "info"
                ? "border-e17-navy text-e17-navy font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Clock className={`mr-2 h-5 w-5 ${activeTab === "info" ? "text-e17-navy" : ""}`} />
            Informasi Sesi
          </button>
          <button
            onClick={() => setActiveTab("materials")}
            className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "materials"
                ? "border-e17-navy text-e17-navy font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <FileText className={`mr-2 h-5 w-5 ${activeTab === "materials" ? "text-e17-navy" : ""}`} />
            Materi & Tugas
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "attendance"
                ? "border-e17-navy text-e17-navy font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Users className={`mr-2 h-5 w-5 ${activeTab === "attendance" ? "text-e17-navy" : ""}`} />
            Absensi Siswa
          </button>
        </nav>
      </div>

      <div className="card-clean overflow-hidden">
        
        {/* TAB 1: INFO */}
        {activeTab === "info" && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-e17-dark mb-4">Informasi Sesi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Deskripsi</h3>
                  <p className="text-slate-700">{session.description || "Tidak ada deskripsi."}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Penjadwalan</h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Tanggal</p>
                        <p className="font-semibold text-slate-800">
                          {session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Belum ditentukan'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Format & Lokasi</h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Tipe Sesi</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${session.session_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {session.session_type === 'online' ? 'Daring (Online)' : 'Tatap Muka (Offline)'}
                      </span>
                    </div>
                    {session.session_type === 'online' && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Link Pertemuan</p>
                        {session.meeting_link ? (
                          <a href={session.meeting_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium break-all flex items-start gap-2">
                            <Video className="h-4 w-4 mt-0.5 shrink-0" />
                            {session.meeting_link}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-slate-500 italic">Belum ada link yang disediakan</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MATERIALS */}
        {activeTab === "materials" && (
          <div className="p-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-e17-dark">Materi, Tugas & Kuis</h2>
                <p className="text-sm text-slate-500">Kelola konten pembelajaran, penugasan, dan kuis untuk sesi ini.</p>
              </div>
              <Button onClick={() => setIsAddingMaterial(!isAddingMaterial)} variant="outline" className="font-bold">
                {isAddingMaterial ? "Batal" : <><Plus className="w-4 h-4 mr-2" /> Tambah Konten</>}
              </Button>
            </div>
            
            {isAddingMaterial && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 space-y-4">
                <div className="flex space-x-2 border-b border-slate-200 pb-4 mb-4">
                  <button onClick={() => setUploadType('material')} className={`px-4 py-2 text-sm font-bold rounded-lg ${uploadType === 'material' ? 'bg-e17-navy text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>Materi Pembelajaran</button>
                  <button onClick={() => setUploadType('task')} className={`px-4 py-2 text-sm font-bold rounded-lg ${uploadType === 'task' ? 'bg-e17-navy text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>Penugasan (Task)</button>
                  <button onClick={() => setUploadType('quiz')} className={`px-4 py-2 text-sm font-bold rounded-lg ${uploadType === 'quiz' ? 'bg-e17-navy text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>Kuis (Quiz)</button>
                </div>

                {uploadType === 'material' && (
                  <form onSubmit={handleAddMaterial} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Judul Materi</label>
                        <input required value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" placeholder="Contoh: Slide Presentasi Modul 1"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tipe</label>
                        <select value={newMaterial.type} onChange={e => setNewMaterial({...newMaterial, type: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm">
                          <option value="pdf">Dokumen / PDF</option>
                          <option value="video">Video</option>
                          <option value="link">Tautan Referensi</option>
                          <option value="slide">Slide Presentasi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">URL (Opsional)</label>
                        <input value={newMaterial.url} onChange={e => setNewMaterial({...newMaterial, url: e.target.value})} type="url" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" placeholder="https://..."/>
                      </div>
                    </div>
                    <Button type="submit" className="bg-e17-navy text-white hover:bg-blue-900 w-full md:w-auto">Simpan Materi</Button>
                  </form>
                )}

                {uploadType === 'task' && (
                  <form onSubmit={handleAddTask} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Judul Tugas</label>
                        <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" placeholder="Contoh: Tugas Praktik 1"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Link PDF Soal (Opsional)</label>
                        <input value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} type="url" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" placeholder="https://..."/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Batas Waktu (Deadline)</label>
                        <input required min={minDateTime} max={maxDateTime} value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} type="datetime-local" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                      </div>
                      <div className="col-span-1 md:col-span-2 flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="is_final_project"
                          checked={newTask.is_final_project}
                          onChange={e => setNewTask({...newTask, is_final_project: e.target.checked})}
                          className="h-4 w-4 rounded border-slate-300 text-e17-navy focus:ring-e17-navy"
                        />
                        <label htmlFor="is_final_project" className="text-sm font-medium text-slate-700 cursor-pointer">
                          Tandai sebagai Proyek Akhir
                        </label>
                      </div>
                    </div>
                    <Button type="submit" className="bg-e17-navy text-white hover:bg-blue-900 w-full md:w-auto">Simpan Tugas</Button>
                  </form>
                )}

                {uploadType === 'quiz' && (
                  <form onSubmit={handleAddQuiz} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kuis</label>
                        <input required value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" placeholder="Contoh: Kuis Evaluasi Sesi 1"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Kelulusan (KUM)</label>
                        <input required value={newQuiz.passingGrade || ''} onChange={e => setNewQuiz({...newQuiz, passingGrade: parseInt(e.target.value) || 0})} type="number" min="0" max="100" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Maksimal Percobaan</label>
                        <input required value={newQuiz.maxRetries || ''} onChange={e => setNewQuiz({...newQuiz, maxRetries: parseInt(e.target.value) || 0})} type="number" min="1" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                      </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Batas Waktu (Deadline) - Opsional</label>
                        <input min={minDateTime} max={maxDateTime} value={newQuiz.deadline} onChange={e => setNewQuiz({...newQuiz, deadline: e.target.value})} type="datetime-local" className="w-full max-w-sm px-3 py-2 border border-slate-200 rounded-md text-sm" />
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm mb-4 flex items-start gap-3">
                       <span className="text-lg">💡</span>
                       <p><b>Tips:</b> Simpan kuis ini terlebih dahulu. Setelah tersimpan, Anda bisa menambahkan pertanyaan dan pilihan ganda (A, B, C, D) dengan mengklik tombol <b>"Kelola Soal"</b> pada daftar kuis di bawah.</p>
                    </div>

                    <Button type="submit" className="bg-e17-navy text-white hover:bg-blue-900 w-full md:w-auto">Simpan Kuis</Button>
                  </form>
                )}
              </div>
            )}

            {(!session.materials?.length && !session.tasks?.length && !session.quizzes?.length) ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">Belum Ada Konten</h3>
                <p className="text-sm text-slate-500 mb-4">Materi, Tugas, atau Kuis yang diunggah akan tampil di sini.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Materi List */}
                {session.materials?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">Materi Pembelajaran</h3>
                    <div className="space-y-3">
                      {session.materials.map((mat: any) => (
                        <div key={mat.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                              {mat.type === 'video' ? <Video className="w-5 h-5"/> : <FileText className="w-5 h-5"/>}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{mat.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{mat.type.toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-0 flex gap-2">
                            {mat.content_url && mat.content_url !== '#' && (
                              <a href={mat.content_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">Lihat URL</a>
                            )}
                            <button onClick={() => handleDeleteMaterial(mat.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks List */}
                {session.tasks?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">Penugasan (Task)</h3>
                    <div className="space-y-3">
                      {session.tasks.map((task: any) => (
                        <div key={task.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                              <CheckSquare className="w-5 h-5"/>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-800">{task.title}</p>
                                {task.is_final_project && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded uppercase">Proyek Akhir</span>
                                )}
                              </div>
                              <p className="text-xs text-amber-600 font-bold mt-0.5">Deadline: {new Date(task.deadline).toLocaleString('id-ID')}</p>
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-0 flex gap-2">
                            {task.description && (
                              <a href={task.description} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">Lihat Soal PDF</a>
                            )}
                            <button onClick={() => {
                              const dt = new Date(task.deadline);
                              dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
                              const localDeadline = dt.toISOString().slice(0, 16);
                              setEditingTask({ ...task, deadline: localDeadline, is_final_project: task.is_final_project || false });
                            }} className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quizzes List */}
                {session.quizzes?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">Kuis (Quiz)</h3>
                    <div className="space-y-3">
                      {session.quizzes.map((quiz: any) => (
                        <div key={quiz.id} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                                <CheckSquare className="w-5 h-5"/>
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{quiz.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">KUM: {quiz.passing_grade} | Max Percobaan: {quiz.max_retries}x</p>
                                {quiz.deadline && <p className="text-xs text-rose-600 font-bold mt-0.5">Deadline: {new Date(quiz.deadline).toLocaleString('id-ID')}</p>}
                              </div>
                            </div>
                            <div className="mt-3 sm:mt-0 flex gap-2">
                              <button onClick={() => setManagingQuizId(quiz.id)} className="px-3 py-1.5 text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100">
                                Kelola Soal
                              </button>
                              <button onClick={() => {
                                let localDeadline = "";
                                if (quiz.deadline) {
                                  const dt = new Date(quiz.deadline);
                                  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
                                  localDeadline = dt.toISOString().slice(0, 16);
                                }
                                setEditingQuiz({ 
                                  id: quiz.id, 
                                  title: quiz.title, 
                                  passingGrade: quiz.passing_grade, 
                                  maxRetries: quiz.max_retries, 
                                  deadline: localDeadline 
                                });
                              }} className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {managingQuizId === quiz.id && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <QuizBuilderClient quizId={quiz.id} onClose={() => setManagingQuizId(null)} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ATTENDANCE */}
        {activeTab === "attendance" && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-e17-dark">Daftar Hadir Siswa</h2>
                <p className="text-sm text-slate-500">
                  Siswa dapat klik absen saat status sesi berjalan. Mentor dapat mengubah kehadiran secara manual.
                </p>
              </div>
            </div>
            
            {session.status === 'not_started' ? (
               <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">Sesi Belum Dimulai</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Mulai sesi di Header agar siswa dapat mengisi absensinya (Klik Absen).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                      <th className="px-6 py-4 font-semibold text-center">Status Absensi</th>
                      <th className="px-6 py-4 font-semibold text-right">Manual Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {students.map(student => {
                      const att = attendances[student.id]
                      const isPresent = att?.source === 'roll_call_online' || att?.source === 'manual_override' || att?.source === 'manual'
                      const isAlpha = !att

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isPresent && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">Hadir</span>}
                            {isAlpha && <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded">Alpha</span>}
                            {att && <p className="text-[10px] text-slate-400 mt-1">Via: {att.source}</p>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => handleManualAttendance(student.id, 'manual_override')} className="px-2 py-1 border border-emerald-200 text-emerald-600 rounded text-xs font-bold hover:bg-emerald-50">Hadir</button>
                              <button onClick={() => handleManualAttendance(student.id, 'alpha')} className="px-2 py-1 border border-rose-200 text-rose-600 rounded text-xs font-bold hover:bg-rose-50">Alpha</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-e17-dark">Edit Tugas</h3>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600">
                 X
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateTask} className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-700 mb-1">Judul Tugas</label>
                   <input required value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-700 mb-1">Link PDF Soal</label>
                   <input value={editingTask.description || ''} onChange={e => setEditingTask({...editingTask, description: e.target.value})} type="url" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                 </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Batas Waktu</label>
                    <input 
                      required 
                      type="datetime-local" 
                      min={minDateTime}
                      max={maxDateTime}
                      value={editingTask.deadline} 
                      onChange={e => setEditingTask({...editingTask, deadline: e.target.value})} 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" 
                    />
                  </div>
                 <div className="flex items-center space-x-2 py-2">
                    <input 
                      type="checkbox" 
                      id="edit_is_final_project"
                      checked={editingTask.is_final_project}
                      onChange={e => setEditingTask({...editingTask, is_final_project: e.target.checked})}
                      className="h-4 w-4 rounded border-slate-300 text-e17-navy focus:ring-e17-navy"
                    />
                    <label htmlFor="edit_is_final_project" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Tandai sebagai Proyek Akhir
                    </label>
                  </div>
                 <div className="flex justify-end gap-2 pt-4">
                   <Button type="button" variant="ghost" onClick={() => setEditingTask(null)}>Batal</Button>
                   <Button type="submit" className="bg-e17-navy text-white hover:bg-blue-900">Simpan Perubahan</Button>
                 </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {editingQuiz && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-e17-dark">Edit Kuis</h3>
              <button onClick={() => setEditingQuiz(null)} className="text-slate-400 hover:text-slate-600">
                 X
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateQuiz} className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kuis</label>
                   <input required value={editingQuiz.title} onChange={e => setEditingQuiz({...editingQuiz, title: e.target.value})} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Kelulusan (KUM)</label>
                     <input required value={editingQuiz.passingGrade || ''} onChange={e => setEditingQuiz({...editingQuiz, passingGrade: parseInt(e.target.value) || 0})} type="number" min="0" max="100" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1">Max Percobaan</label>
                     <input required value={editingQuiz.maxRetries || ''} onChange={e => setEditingQuiz({...editingQuiz, maxRetries: parseInt(e.target.value) || 0})} type="number" min="1" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                   </div>
                 </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Batas Waktu (Opsional)</label>
                    <input 
                      type="datetime-local" 
                      min={minDateTime}
                      max={maxDateTime}
                      value={editingQuiz.deadline} 
                      onChange={e => setEditingQuiz({...editingQuiz, deadline: e.target.value})} 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" 
                    />
                  </div>
                 <div className="flex justify-end gap-2 pt-4">
                   <Button type="button" variant="ghost" onClick={() => setEditingQuiz(null)}>Batal</Button>
                   <Button type="submit" className="bg-e17-navy text-white hover:bg-blue-900">Simpan Perubahan</Button>
                 </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
