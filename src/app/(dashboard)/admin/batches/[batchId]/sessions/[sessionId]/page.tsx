"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, Calendar, Video, FileText, CheckSquare, Users, Play, Square, Loader2 } from "lucide-react"
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

  React.useEffect(() => {
    fetchSessionData()
  }, [sessionId])

  const fetchSessionData = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        batches ( name, programs(name) )
      `)
      .eq('id', sessionId)
      .single()

    if (error) {
      console.error("Error fetching session:", error)
      toast.error("Gagal memuat data sesi")
    } else {
      setSession(data)
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
      fetchSessionData() // Refresh data
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
          </div>
        )}

        {/* TAB 2: MATERIALS */}
        {activeTab === "materials" && (
          <div className="p-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-e17-dark">Materi & Tugas</h2>
                <p className="text-sm text-slate-500">Materi pembelajaran dan penugasan untuk sesi ini.</p>
              </div>
            </div>
            
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">Belum Ada Materi</h3>
              <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                Admin hanya dalam mode pantau. Hanya Mentor yang berhak mengunggah materi dan tugas di sesi ini.
              </p>
            </div>
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
