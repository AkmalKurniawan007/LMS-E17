'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, Plus, Save, Trash2, GripVertical, BookOpen, Loader2, 
  Video, Clock, RefreshCw, ExternalLink, CheckCircle2, ChevronDown, ChevronUp, AlertCircle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { syncCurriculumToMarketing } from "@/app/(lms)/(dashboard)/admin/marketing/program-actions"

interface Session {
  id: string
  title: string
  description: string
  order_number: number
  video_url?: string | null
  preview_video_url?: string | null
  duration?: string | null
  isExpanded?: boolean
}

export default function ProgramCurriculumBuilder({ params: paramsPromise }: { params: Promise<{ programId: string }> }) {
  const params = React.use(paramsPromise)
  const router = useRouter()
  const supabase = createClient()
  
  const [program, setProgram] = React.useState<any>(null)
  const [marketingProgram, setMarketingProgram] = React.useState<any>(null)
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [initialDbIds, setInitialDbIds] = React.useState<string[]>([])
  const [deletedIds, setDeletedIds] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [syncMessage, setSyncMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetchData()
  }, [params.programId])

  const fetchData = async () => {
    setIsLoading(true)
    
    // Fetch program info
    const { data: progData } = await supabase
      .from('programs')
      .select('id, name, description')
      .eq('id', params.programId)
      .single()
      
    if (progData) setProgram(progData)

    // Check if linked to marketing program
    const { data: mpData } = await supabase
      .from('marketing_programs')
      .select('id, name, slug, lms_program_id')
      .eq('lms_program_id', params.programId)
      .maybeSingle()

    if (mpData) setMarketingProgram(mpData)

    // Fetch sessions
    const { data: sessData } = await supabase
      .from('program_sessions')
      .select('*')
      .eq('program_id', params.programId)
      .order('order_number', { ascending: true })

    if (sessData) {
      setSessions(sessData)
      setInitialDbIds(sessData.map(s => s.id))
      setDeletedIds([])
    }
    
    setIsLoading(false)
  }

  const handleAddSession = () => {
    const newSession: Session = {
      id: `temp-${Date.now()}`,
      title: `Sesi ${sessions.length + 1}`,
      description: "",
      order_number: sessions.length + 1,
      video_url: "",
      preview_video_url: "",
      duration: "30:00",
      isExpanded: true
    }
    setSessions([...sessions, newSession])
  }

  const handleUpdateSession = (index: number, field: keyof Session, value: any) => {
    const newSessions = [...sessions]
    newSessions[index] = { ...newSessions[index], [field]: value }
    setSessions(newSessions)
  }

  const handleToggleExpand = (index: number) => {
    const newSessions = [...sessions]
    newSessions[index] = { ...newSessions[index], isExpanded: !newSessions[index].isExpanded }
    setSessions(newSessions)
  }

  const handleRemoveSession = (index: number) => {
    const sessionToRemove = sessions[index]
    if (sessionToRemove && !sessionToRemove.id.startsWith('temp-')) {
      setDeletedIds(prev => [...prev, sessionToRemove.id])
    }
    const newSessions = sessions.filter((_, i) => i !== index)
    // Re-index
    const reindexed = newSessions.map((s, i) => ({ ...s, order_number: i + 1 }))
    setSessions(reindexed)
  }

  const handleSaveCurriculum = async () => {
    setIsSaving(true)
    setSyncMessage(null)
    try {
      // 1. Delete removed sessions safely
      if (deletedIds.length > 0) {
        await supabase.from('program_sessions').delete().in('id', deletedIds)
      }

      // 2. Separate existing sessions (UPDATE) and new sessions (INSERT) to preserve Foreign Key integrity
      for (const s of sessions) {
        const payload: Record<string, any> = {
          program_id: params.programId,
          title: s.title,
          description: s.description || "",
          order_number: s.order_number,
          format: 'online'
        }
        if (s.video_url !== undefined) payload.video_url = s.video_url || null
        if (s.preview_video_url !== undefined) payload.preview_video_url = s.preview_video_url || null
        if (s.duration !== undefined) payload.duration = s.duration || null

        if (s.id.startsWith('temp-')) {
          // Insert new session
          try {
            await supabase.from('program_sessions').insert(payload)
          } catch {
            delete payload.video_url
            delete payload.preview_video_url
            delete payload.duration
            await supabase.from('program_sessions').insert(payload)
          }
        } else {
          // Update existing session, preserving ID and FK relations!
          try {
            await supabase.from('program_sessions').update(payload).eq('id', s.id)
          } catch {
            delete payload.video_url
            delete payload.preview_video_url
            delete payload.duration
            await supabase.from('program_sessions').update(payload).eq('id', s.id)
          }
        }
      }

      // 3. Auto-sync to Web Marketing if mapped
      if (marketingProgram?.id) {
        try {
          const syncRes = await syncCurriculumToMarketing(params.programId)
          if (syncRes.success) {
            setSyncMessage(`Kurikulum tersimpan dan berhasil disinkronkan ke Web Marketing (${syncRes.syncedCount} sesi).`)
          }
        } catch (syncErr) {
          console.warn("Auto sync to marketing warning:", syncErr)
        }
      }
      
      alert("Struktur Sesi Kurikulum berhasil disimpan!")
      fetchData()
    } catch (error: any) {
      alert("Gagal menyimpan kurikulum: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleManualSyncToMarketing = async () => {
    if (!marketingProgram?.id) return
    setIsSyncing(true)
    setSyncMessage(null)
    try {
      const res = await syncCurriculumToMarketing(params.programId)
      if (res.success) {
        setSyncMessage(`Sinkronisasi berhasil! ${res.syncedCount} sesi kurikulum diselaraskan dengan Web Marketing.`)
      } else {
        alert("Gagal sinkronisasi: " + (res.error || "Terjadi kesalahan"))
      }
    } catch (err: any) {
      alert("Error sinkronisasi: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-e17-navy mb-4" />
        <p className="text-slate-500 font-medium">Memuat data kurikulum...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/programs">
            <Button variant="ghost" size="icon" className="shrink-0 bg-white border border-slate-200 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Builder Sesi Kurikulum</h1>
            <p className="text-sm text-slate-500 mt-1">Mengelola sesi untuk program: <span className="font-bold text-e17-navy">{program?.name}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-300 font-semibold" onClick={handleAddSession}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Sesi
          </Button>
          <Button variant="orange" className="font-bold shadow-sm" onClick={handleSaveCurriculum} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">{syncMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Info Program & Sinkronisasi */}
        <div className="md:col-span-1 space-y-4">
          <div className="card-clean p-6 bg-slate-50 border-t-4 border-t-e17-navy">
             <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
               <BookOpen className="h-6 w-6 text-e17-navy" />
             </div>
             <h3 className="font-bold text-lg text-e17-dark mb-1">{program?.name}</h3>
             <p className="text-sm text-slate-500 mb-6">{program?.description}</p>
             
             <div className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center mb-4">
               <span className="text-xs font-semibold text-slate-500 uppercase">Total Sesi</span>
               <span className="text-xl font-black text-e17-dark">{sessions.length}</span>
             </div>

             {/* Status Relasi Web Marketing */}
             <div className="pt-3 border-t border-slate-200">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Integrasi Web Marketing</label>
               {marketingProgram ? (
                 <div className="space-y-3 bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs">
                   <div className="flex items-center gap-2">
                     <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-xs font-bold text-slate-800 line-clamp-1">{marketingProgram.name}</span>
                   </div>
                   <p className="text-[11px] text-slate-500 leading-relaxed">
                     Program LMS ini terhubung dengan silabus publik web marketing. Perubahan sesi akan disinkronkan.
                   </p>
                   <Button 
                     size="sm" 
                     variant="outline" 
                     className="w-full text-xs font-semibold border-blue-300 text-blue-700 hover:bg-blue-50"
                     onClick={handleManualSyncToMarketing}
                     disabled={isSyncing}
                   >
                     {isSyncing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
                     Sinkronkan ke Marketing
                   </Button>
                 </div>
               ) : (
                 <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500">
                   Belum dipetakan ke program marketing. Anda dapat memetakan di menu <strong>Web Marketing &gt; Programs</strong>.
                 </div>
               )}
             </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span>Blueprint Kurikulum LMS</span>
            </div>
            <p className="leading-relaxed">
              Setiap sesi yang Anda simpan di sini menjadi standar blueprint. Saat Batch baru dibuat di menu Batches, 
              seluruh sesi dan video materi secara otomatis disalin ke dalam kurikulum kelas tersebut.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Sesi Builder */}
        <div className="md:col-span-2">
           <div className="card-clean overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
               <h3 className="font-bold flex items-center">
                 Daftar Sesi Kurikulum
               </h3>
               <span className="text-xs bg-slate-700 px-2 py-1 rounded-md">{sessions.length} Sesi</span>
             </div>
             
             <div className="p-4 space-y-3 bg-slate-50/50 min-h-[400px]">
               {sessions.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                   <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                     <Plus className="h-8 w-8 text-slate-300" />
                   </div>
                   <h4 className="text-lg font-bold text-slate-700">Belum Ada Sesi</h4>
                   <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">Program ini masih kosong. Tambahkan sesi pertama untuk mulai menyusun kurikulum.</p>
                   <Button variant="outline" className="border-e17-navy text-e17-navy font-semibold" onClick={handleAddSession}>
                     Tambah Sesi Pertama
                   </Button>
                 </div>
               ) : (
                 sessions.map((session, index) => (
                   <div key={session.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="flex gap-3">
                       <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 mt-2">
                         <GripVertical className="h-5 w-5" />
                       </div>
                       <div className="flex-1 space-y-2">
                         <div className="flex items-center gap-2">
                           <span className="bg-e17-navy text-white text-xs font-bold px-2 py-1 rounded-md">
                             SESI {index + 1}
                           </span>
                           <Input 
                             value={session.title} 
                             onChange={(e) => handleUpdateSession(index, 'title', e.target.value)}
                             className="h-8 font-semibold border-slate-200 text-e17-dark"
                             placeholder="Judul Sesi (misal: Fundamental Javascript)"
                           />
                         </div>
                         <div>
                           <Input 
                             value={session.description || ""}
                             onChange={(e) => handleUpdateSession(index, 'description', e.target.value)}
                             className="h-8 text-xs border-slate-200 bg-slate-50"
                             placeholder="Deskripsi Singkat Materi..."
                           />
                         </div>
                       </div>
                       <div className="flex items-start gap-1 pt-1">
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="h-8 px-2 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                           onClick={() => handleToggleExpand(index)}
                           title="Pengaturan Video & Durasi"
                         >
                           <Video className="h-3.5 w-3.5 mr-1" />
                           {session.isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemoveSession(index)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>

                     {/* Collapsible Details: Video URL & Duration */}
                     {session.isExpanded && (
                       <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/70 p-3 rounded-lg text-xs">
                         <div className="md:col-span-2 space-y-1">
                           <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                             <Video className="h-3 w-3 text-blue-600" /> URL Video Materi
                           </label>
                           <Input 
                             value={session.video_url || ""}
                             onChange={(e) => handleUpdateSession(index, 'video_url', e.target.value)}
                             placeholder="https://youtube.com/... atau URL video"
                             className="h-7 text-xs bg-white border-slate-200"
                           />
                         </div>
                         <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                             <Clock className="h-3 w-3 text-amber-600" /> Estimasi Durasi
                           </label>
                           <Input 
                             value={session.duration || ""}
                             onChange={(e) => handleUpdateSession(index, 'duration', e.target.value)}
                             placeholder="Contoh: 15:30 atau 45 Menit"
                             className="h-7 text-xs bg-white border-slate-200"
                           />
                         </div>
                       </div>
                     )}
                   </div>
                 ))
               )}
               
               {sessions.length > 0 && (
                 <button 
                   onClick={handleAddSession}
                   className="w-full mt-4 border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 text-slate-500 hover:text-e17-navy transition-colors rounded-xl py-3 flex items-center justify-center font-semibold text-sm cursor-pointer"
                 >
                   <Plus className="mr-2 h-4 w-4" /> Tambah Sesi Berikutnya
                 </button>
               )}
             </div>
           </div>
        </div>

      </div>
    </div>
  )
}
