"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, Layers, Plus, Settings, CheckCircle, X, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createProgram, updateProgram } from "./actions"

export interface ProgramType {
  id: string
  title: string
  description: string
  active: boolean
  sessions: number
  totalBatches: number
  program_sessions?: any[]
}

export function ProgramsClient({ initialPrograms }: { initialPrograms: ProgramType[] }) {
  const [selectedProgramId, setSelectedProgramId] = React.useState<string | null>(
    initialPrograms.length > 0 ? initialPrograms[0].id : null
  )
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [activatingId, setActivatingId] = React.useState<string | null>(null)

  // Form State
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    isActive: true
  })

  // Sync selectedProgramId if initialPrograms changes and selected isn't there anymore
  React.useEffect(() => {
    if (initialPrograms.length > 0 && (!selectedProgramId || !initialPrograms.find(p => p.id === selectedProgramId))) {
      setSelectedProgramId(initialPrograms[0].id)
    }
  }, [initialPrograms, selectedProgramId])

  const handleCreateProgram = async () => {
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    
    try {
      const result = await createProgram(formData)
      
      if (result?.error) {
        toast.error("Gagal menambahkan program", {
          description: result.error
        })
      } else {
        toast.success("Program berhasil ditambahkan!")
        setIsModalOpen(false)
        setFormData({ name: "", description: "", isActive: true })
      }
    } catch (error: any) {
      toast.error("Terjadi kesalahan sistem", {
        description: error.message
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleActivateProgram = async (program: ProgramType) => {
    setActivatingId(program.id)
    
    try {
      const result = await updateProgram(program.id, {
        name: program.title,
        description: program.description,
        isActive: true
      })
      
      if (result?.error) {
        toast.error("Gagal mengaktifkan program", {
          description: result.error
        })
      } else {
        toast.success("Program berhasil diaktifkan!")
      }
    } catch (error: any) {
      toast.error("Terjadi kesalahan sistem", {
        description: error.message
      })
    } finally {
      setActivatingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Kurikulum Baku (Master Programs)</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola program utama E17 Course.</p>
        </div>
        <Button variant="orange" className="font-bold shadow-sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Program Baru
        </Button>
      </div>

      {initialPrograms.length === 0 ? (
        <div className="card-clean py-16 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Program</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">Silakan klik "Tambah Program Baru" untuk mulai membuat kurikulum pelatihan pertama Anda.</p>
          <Button variant="orange" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Program Sekarang
          </Button>
        </div>
      ) : (

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialPrograms.map(program => (
          <div key={program.id} className="card-clean flex flex-col hover:border-e17-navy transition-colors">
             <div className="p-6 border-b border-slate-100 flex-1">
                <div className="flex justify-between items-start mb-4">
                   <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${program.active ? 'bg-e17-navy' : 'bg-slate-200'}`}>
                     <BookOpen className={`h-6 w-6 ${program.active ? 'text-white' : 'text-slate-400'}`} />
                   </div>
                   {program.active ? (
                     <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                       <CheckCircle className="w-3 h-3 mr-1" /> Aktif
                     </span>
                   ) : (
                     <button 
                       onClick={() => handleActivateProgram(program)}
                       disabled={activatingId === program.id}
                       className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                     >
                       {activatingId === program.id ? (
                         <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                       ) : null}
                       Draft / Aktifkan
                     </button>
                   )}
                </div>
                
                <h2 className="text-lg font-bold text-e17-dark mb-2 leading-tight">{program.title}</h2>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                  {program.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                     <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Struktur Baku</p>
                     <p className="text-lg font-black text-e17-dark">{program.sessions} <span className="text-sm font-medium text-slate-500">Sesi</span></p>
                   </div>
                   <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                     <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Histori Batch</p>
                     <p className="text-lg font-black text-blue-900">{program.totalBatches} <span className="text-sm font-medium text-blue-700">Batch</span></p>
                   </div>
                </div>
             </div>
             
             <div className="p-4 bg-slate-50/50 flex flex-wrap flex-col sm:flex-row items-center justify-between gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedProgramId(program.id)}
                  className={`w-full sm:w-auto font-bold text-xs border ${selectedProgramId === program.id ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'}`}
                >
                  <BookOpen className="h-4 w-4 mr-1.5" /> Pratinjau
                </Button>
                
                <div className="flex flex-wrap gap-2 w-full sm:w-auto flex-1 justify-end">
                  <Link href={`/admin/programs/${program.id}`} className="flex-1 sm:flex-none">
                    <Button variant="outline" size="sm" className="w-full bg-white border-slate-200 text-slate-600 hover:text-e17-navy">
                      <Settings className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Edit Struktur</span>
                    </Button>
                  </Link>
                  {program.sessions > 0 ? (
                    <Link href={`/admin/batches?programId=${program.id}`} className="flex-1 sm:flex-none">
                      <Button variant="default" size="sm" className="w-full bg-e17-navy hover:bg-slate-800 text-white font-bold px-4">
                        <Layers className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Buat Batch Baru</span>
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="default" size="sm" className="flex-1 sm:flex-none bg-slate-300 text-slate-500 font-bold pointer-events-none px-4">
                      <Layers className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Buat Batch Baru</span>
                    </Button>
                  )}
                </div>
             </div>
          </div>
        ))}
      </div>
      )}
      
      {/* Visualisasi Preview Sesi Baku */}
      {selectedProgramId && initialPrograms.length > 0 && (
        (() => {
          const selectedProgram = initialPrograms.find(p => p.id === selectedProgramId) || initialPrograms[0]
          const sessions = selectedProgram.program_sessions || []
          
          return (
            <div className="mt-12 card-clean overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-e17-primary" /> Pratinjau Struktur Baku
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Struktur untuk program <strong className="text-white">{selectedProgram.title}</strong> yang akan disalin (copy) ke setiap batch baru.
                  </p>
                </div>
                <div className="hidden sm:flex text-right flex-col items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Sesi</span>
                  <span className="text-xl font-black text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">{sessions.length}</span>
                </div>
              </div>
              <div className="p-6">
                 {sessions.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-10 text-center">
                     <BookOpen className="h-10 w-10 text-slate-200 mb-3" />
                     <p className="text-sm font-bold text-slate-500">Struktur Belum Dibuat</p>
                     <p className="text-xs text-slate-400 max-w-sm mt-1">Anda belum menambahkan sesi apapun pada kurikulum ini. Silakan klik tombol "Edit Struktur" pada program di atas.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {sessions.map((session: any, index: number) => (
                        <div key={session.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-e17-navy/30 transition-all flex flex-col group shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            Sesi {session.order_number || index + 1}
                            <span className="bg-slate-200 w-2 h-2 rounded-full group-hover:bg-e17-primary transition-colors"></span>
                          </span>
                          <p className="text-sm font-bold text-e17-dark mb-2 leading-snug line-clamp-2">{session.title}</p>
                          {session.description && (
                             <p className="text-xs text-slate-500 line-clamp-2 mb-3 mt-auto">{session.description}</p>
                          )}
                          <div className="mt-auto pt-3 border-t border-slate-100 flex gap-1.5 opacity-60">
                            <div className="h-1 flex-1 bg-blue-300 rounded-full"></div>
                            <div className="h-1 w-1/3 bg-e17-primary rounded-full"></div>
                          </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
            </div>
          )
        })()
      )}
      {/* Modal Tambah Program Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-e17-dark text-lg">Tambah Program Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Program <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="Contoh: Mobile App Development" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full focus:ring-e17-navy border-slate-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi Singkat</label>
                <textarea 
                  rows={3}
                  placeholder="Deskripsikan fokus dari program ini..." 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy resize-none"
                />
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-e17-primary focus:ring-e17-primary"
                />
                <div>
                  <label htmlFor="isActive" className="font-bold text-sm text-slate-800 block cursor-pointer">Langsung Aktifkan Program</label>
                  <p className="text-xs text-slate-500">Program yang aktif dapat segera dibuatkan Batch (Gelombang) baru.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-slate-300">
                Batal
              </Button>
              <Button 
                variant="orange" 
                className="font-bold shadow-sm min-w-[120px]" 
                onClick={handleCreateProgram}
                disabled={!formData.name.trim() || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan Program
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
