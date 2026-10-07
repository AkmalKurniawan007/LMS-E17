"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, Calendar, Video, FileText, CheckSquare, Users, Play, Square, Loader2, Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function AdminSessionDetailPage({
  params,
}: {
  params: Promise<{ batchId: string, sessionId: string }>
}) {
  const { batchId, sessionId } = use(params)
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = React.useState<"info" | "materials" | "attendance">("info")
  const [session, setSession] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false)
  const [isEditingInfo, setIsEditingInfo] = React.useState(false)
  const [editForm, setEditForm] = React.useState({
    description: "",
    scheduled_at: "",
    start_time: "",
    end_time: "",
    session_type: "online",
    meeting_link: ""
  })

  React.useEffect(() => {
    fetchSessionData()
  }, [sessionId])

  const fetchSessionData = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        batches ( name, programs(name) ),
        materials ( * ),
        tasks ( * ),
        quizzes ( * )
      `)
      .eq('id', sessionId)
      .single()

    if (error) {
      console.error("Error fetching session:", error)
      toast.error("Gagal memuat data sesi")
    } else if (data) {
      setSession(data)
      setEditForm({
        description: data.description || "",
        scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString().split('T')[0] : "",
        start_time: data.start_time || "",
        end_time: data.end_time || "",
        session_type: data.session_type || "online",
        meeting_link: data.meeting_link || ""
      })
    }
    setIsLoading(false)
  }

  const handleUpdateStatus = async (newStatus: 'not_started' | 'ongoing' | 'completed') => {
    if (!confirm(`Ubah status sesi menjadi ${newStatus}?`)) return
    
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
      toast.success("Status sesi berhasil diperbarui")
      fetchSessionData()
    }
    setIsUpdatingStatus(false)
  }

  const handleSaveInfo = async () => {
    setIsUpdatingStatus(true)
    const { error } = await supabase
      .from('sessions')
      .update({
        description: editForm.description,
        scheduled_at: editForm.scheduled_at ? new Date(editForm.scheduled_at).toISOString() : null,
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        session_type: editForm.session_type,
        meeting_link: editForm.meeting_link
      })
      .eq('id', sessionId)

    if (error) {
      toast.error("Gagal menyimpan informasi sesi: " + error.message)
    } else {
      toast.success("Informasi sesi berhasil diperbarui")
      setIsEditingInfo(false)
      fetchSessionData()
    }
    setIsUpdatingStatus(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-e17-navy mb-4" />
        <p className="text-slate-500 font-medium">Memuat detail sesi...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="text-xl font-bold text-slate-700">Sesi Tidak Ditemukan</h2>
        <Link href={`/admin/batches/${batchId}`} className="text-e17-navy hover:underline mt-2">Kembali ke Batch</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center space-x-4 border-b border-slate-200 pb-5">
        <Link href={`/admin/batches/${batchId}`}>
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
            <span className="text-xs text-slate-400 border border-slate-200 rounded-md px-3 py-1.5 bg-slate-50 flex items-center">
              Mode Pantau (Hanya Mentor yang dapat memulai sesi)
            </span>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-e17-dark">Informasi Sesi</h2>
              {!isEditingInfo ? (
                <Button onClick={() => setIsEditingInfo(true)} variant="outline" size="sm" className="font-bold">
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Informasi
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditingInfo(false)} variant="ghost" size="sm">Batal</Button>
                  <Button onClick={handleSaveInfo} disabled={isUpdatingStatus} size="sm" className="bg-e17-navy hover:bg-blue-900 text-white font-bold">
                    <Save className="w-4 h-4 mr-2" /> Simpan
                  </Button>
                </div>
              )}
            </div>
            
            {!isEditingInfo ? (
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
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                      <Clock className="h-5 w-5 text-slate-400" />
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-xs text-slate-500">Jam Mulai</p>
                          <p className="font-semibold text-slate-800">{session.start_time || '--:--'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Jam Selesai</p>
                          <p className="font-semibold text-slate-800">{session.end_time || '--:--'}</p>
                        </div>
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
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Deskripsi Sesi</label>
                    <textarea 
                      value={editForm.description} 
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm min-h-[120px]"
                      placeholder="Masukkan deskripsi sesi..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Tanggal</label>
                    <input 
                      type="date" 
                      value={editForm.scheduled_at} 
                      onChange={e => setEditForm({...editForm, scheduled_at: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Jam Mulai</label>
                      <input 
                        type="time" 
                        value={editForm.start_time} 
                        onChange={e => setEditForm({...editForm, start_time: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Jam Selesai</label>
                      <input 
                        type="time" 
                        value={editForm.end_time} 
                        onChange={e => setEditForm({...editForm, end_time: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Tipe Sesi</label>
                    <select 
                      value={editForm.session_type} 
                      onChange={e => setEditForm({...editForm, session_type: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                    >
                      <option value="online">Daring (Online)</option>
                      <option value="offline">Tatap Muka (Offline)</option>
                    </select>
                  </div>
                  
                  {editForm.session_type === 'online' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Link Pertemuan</label>
                      <input 
                        type="url" 
                        value={editForm.meeting_link} 
                        onChange={e => setEditForm({...editForm, meeting_link: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MATERIALS */}
        {activeTab === "materials" && (
          <div className="p-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-e17-dark">Materi, Tugas & Kuis</h2>
                <p className="text-sm text-slate-500">Daftar materi pembelajaran, penugasan, dan kuis (Mode Pantau).</p>
              </div>
            </div>
            
            {(!session.materials?.length && !session.tasks?.length && !session.quizzes?.length) ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">Belum Ada Konten</h3>
                <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                  Admin hanya dalam mode pantau. Belum ada konten yang diunggah oleh mentor.
                </p>
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
                              <p className="font-bold text-slate-800">{task.title}</p>
                              <p className="text-xs text-amber-600 font-bold mt-0.5">Deadline: {new Date(task.deadline).toLocaleString('id-ID')}</p>
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-0 flex gap-2">
                            {task.description && (
                              <a href={task.description} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">Lihat Soal PDF</a>
                            )}
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
                        <div key={quiz.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                              <CheckSquare className="w-5 h-5"/>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{quiz.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">KUM: {quiz.passing_grade} | Max Percobaan: {quiz.max_retries}x</p>
                            </div>
                          </div>
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
                <h2 className="text-lg font-bold text-e17-dark">Absensi Siswa</h2>
                <p className="text-sm text-slate-500">
                  {session.status === 'not_started' 
                    ? "Absensi terkunci karena sesi belum dimulai."
                    : "Pantau kehadiran siswa pada sesi ini."}
                </p>
              </div>
            </div>
            
            {session.status === 'not_started' ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">Sesi Belum Dimulai</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Siswa baru dapat melakukan absensi setelah sesi ini dimulai oleh Mentor. Admin hanya bersifat memantau.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">Tabel Absensi (Mock)</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Sesi sedang berjalan atau sudah selesai. Tabel kehadiran (berdasarkan tabel `attendances`) akan ditampilkan di sini.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
