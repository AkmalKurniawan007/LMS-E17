'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Save, Trash2, GripVertical, BookOpen, Loader2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"

interface Session {
  id: string
  title: string
  description: string
  order_number: number
}

export default function ProgramCurriculumBuilder({ params: paramsPromise }: { params: Promise<{ programId: string }> }) {
  const params = React.use(paramsPromise)
  const router = useRouter()
  const supabase = createClient()
  
  const [program, setProgram] = React.useState<any>(null)
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)

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

    // Fetch sessions
    const { data: sessData } = await supabase
      .from('program_sessions')
      .select('id, title, description, order_number')
      .eq('program_id', params.programId)
      .order('order_number', { ascending: true })

    if (sessData) setSessions(sessData)
    
    setIsLoading(false)
  }

  const handleAddSession = () => {
    const newSession: Session = {
      id: `temp-${Date.now()}`,
      title: `Sesi ${sessions.length + 1}`,
      description: "",
      order_number: sessions.length + 1
    }
    setSessions([...sessions, newSession])
  }

  const handleUpdateSession = (index: number, field: keyof Session, value: string) => {
    const newSessions = [...sessions]
    newSessions[index] = { ...newSessions[index], [field]: value }
    setSessions(newSessions)
  }

  const handleRemoveSession = (index: number) => {
    const newSessions = sessions.filter((_, i) => i !== index)
    // Re-index
    const reindexed = newSessions.map((s, i) => ({ ...s, order_number: i + 1 }))
    setSessions(reindexed)
  }

  const handleSaveCurriculum = async () => {
    setIsSaving(true)
    try {
      // 1. Delete all existing sessions for this program (simple sync approach)
      await supabase.from('program_sessions').delete().eq('program_id', params.programId)

      // 2. Insert new sessions if any
      if (sessions.length > 0) {
        const payload = sessions.map(s => ({
          program_id: params.programId,
          title: s.title,
          description: s.description,
          order_number: s.order_number,
          format: 'online'
        }))
        const { error } = await supabase.from('program_sessions').insert(payload)
        if (error) throw error
      }
      
      alert("Struktur Sesi Kurikulum berhasil disimpan!")
      fetchData()
    } catch (error: any) {
      alert("Gagal menyimpan kurikulum: " + error.message)
    } finally {
      setIsSaving(false)
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Info Program */}
        <div className="md:col-span-1 space-y-4">
          <div className="card-clean p-6 bg-slate-50 border-t-4 border-t-e17-navy">
             <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
               <BookOpen className="h-6 w-6 text-e17-navy" />
             </div>
             <h3 className="font-bold text-lg text-e17-dark mb-1">{program?.name}</h3>
             <p className="text-sm text-slate-500 mb-6">{program?.description}</p>
             
             <div className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center">
               <span className="text-xs font-semibold text-slate-500 uppercase">Total Sesi</span>
               <span className="text-xl font-black text-e17-dark">{sessions.length}</span>
             </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <strong>Catatan Penting:</strong>
            <p className="mt-1">
              Setiap sesi yang Anda tambahkan di sini akan berlaku sebagai standar (blueprint). 
              Saat Batch baru dibuat, sesi-sesi ini otomatis disalin ke dalam kurikulum kelas tersebut.
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
                   <div key={session.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 mt-2">
                       <GripVertical className="h-5 w-5" />
                     </div>
                     <div className="flex-1 space-y-3">
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
                           value={session.description}
                           onChange={(e) => handleUpdateSession(index, 'description', e.target.value)}
                           className="h-8 text-sm border-slate-200 bg-slate-50"
                           placeholder="Deskripsi Singkat (Opsional)"
                         />
                       </div>
                     </div>
                     <div className="pt-2">
                       <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemoveSession(index)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                   </div>
                 ))
               )}
               
               {sessions.length > 0 && (
                 <button 
                   onClick={handleAddSession}
                   className="w-full mt-4 border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 text-slate-500 hover:text-e17-navy transition-colors rounded-xl py-3 flex items-center justify-center font-semibold text-sm"
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
