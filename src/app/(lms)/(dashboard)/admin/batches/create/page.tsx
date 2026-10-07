"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"

function CreateBatchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedProgramId = searchParams.get('programId') || ""

  const supabase = createClient()
  const [programs, setPrograms] = React.useState<any[]>([])
  const [mentors, setMentors] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState({
    program_id: preselectedProgramId,
    name: "",
    mentor_id: "",
    start_date: "",
    end_date: "",
    timezone: "WIB",
    quiz_weight: 40,
    task_weight: 60
  })

  React.useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    setIsLoading(true)
    const [programsRes, mentorsRes] = await Promise.all([
      supabase.from('programs').select('id, name').eq('is_active', true),
      supabase.from('users').select('id, full_name').eq('role', 'mentor')
    ])

    if (programsRes.data) setPrograms(programsRes.data)
    if (mentorsRes.data) setMentors(mentorsRes.data)
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.program_id || !formData.name || !formData.mentor_id || !formData.start_date) {
      alert("Mohon lengkapi field yang diwajibkan (*)")
      return
    }
    if (formData.quiz_weight + formData.task_weight !== 100) {
      alert("Total bobot kelulusan harus 100%.")
      return
    }

    setIsSubmitting(true)
    
    // 1. Insert into batches
    const { data: batchData, error: batchError } = await supabase
      .from('batches')
      .insert({
        program_id: formData.program_id,
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        timezone: formData.timezone,
        quiz_weight: formData.quiz_weight,
        task_weight: formData.task_weight
      })
      .select('id')
      .single()

    if (batchError || !batchData) {
      alert("Gagal membuat batch: " + (batchError?.message || "Unknown error"))
      setIsSubmitting(false)
      return
    }

    // 2. Insert into batch_mentors
    const { error: mentorError } = await supabase
      .from('batch_mentors')
      .insert({
        batch_id: batchData.id,
        mentor_id: formData.mentor_id
      })

    if (mentorError) {
      alert("Batch berhasil dibuat, tetapi gagal menetapkan mentor. Silakan atur manual nanti.")
    }

    // Done
    router.push('/admin/batches')
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-4">
          <Link href="/admin/batches">
            <Button variant="ghost" size="icon" className="shrink-0 bg-white border border-slate-200 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Buat Batch Baru</h1>
            <p className="text-sm text-slate-500 mt-1">Tambahkan angkatan kelas baru ke dalam sistem.</p>
          </div>
        </div>
        <div>
          <Button variant="orange" className="font-bold shadow-sm" onClick={handleSubmit} disabled={isSubmitting || isLoading}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Batch
          </Button>
        </div>
      </div>

      <div className="card-clean p-6 md:p-8">
        <form className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-e17-dark border-b border-slate-100 pb-2">Informasi Umum</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Pilih Program <span className="text-red-500">*</span></label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy"
                  value={formData.program_id}
                  onChange={e => setFormData({...formData, program_id: e.target.value})}
                  disabled={isLoading}
                >
                  <option value="">-- Pilih Program --</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Batch <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="Contoh: Batch 5 - Weekend" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mentor Utama <span className="text-red-500">*</span></label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy"
                  value={formData.mentor_id}
                  onChange={e => setFormData({...formData, mentor_id: e.target.value})}
                  disabled={isLoading}
                >
                  <option value="">-- Pilih Mentor --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-e17-dark border-b border-slate-100 pb-2">Jadwal Pelaksanaan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tanggal Mulai <span className="text-red-500">*</span></label>
                <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tanggal Selesai (Perkiraan)</label>
                <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Zona Waktu <span className="text-red-500">*</span></label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy"
                  value={formData.timezone}
                  onChange={e => setFormData({...formData, timezone: e.target.value})}
                >
                  <option value="WIB">WIB (Waktu Indonesia Barat)</option>
                  <option value="WITA">WITA (Waktu Indonesia Tengah)</option>
                  <option value="WIT">WIT (Waktu Indonesia Timur)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-e17-dark border-b border-slate-100 pb-2">Aturan Bobot Kelulusan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Bobot Kuis (%) <span className="text-red-500">*</span></label>
                <Input 
                  type="number" 
                  min={0} max={100}
                  value={formData.quiz_weight} 
                  onChange={e => {
                    const qv = parseInt(e.target.value) || 0
                    setFormData({...formData, quiz_weight: qv, task_weight: 100 - qv})
                  }} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Bobot Tugas Praktik (%) <span className="text-red-500">*</span></label>
                <Input 
                  type="number" 
                  min={0} max={100}
                  value={formData.task_weight} 
                  onChange={e => {
                    const tv = parseInt(e.target.value) || 0
                    setFormData({...formData, task_weight: tv, quiz_weight: 100 - tv})
                  }} 
                />
              </div>
            </div>
            {formData.quiz_weight + formData.task_weight !== 100 && (
               <p className="text-sm text-red-600 font-bold">Total bobot harus tepat 100%.</p>
            )}
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600">
              <strong>Catatan:</strong> Setelah batch dibuat, Anda dapat menambahkan jadwal sesi terperinci dan memasukkan siswa (Import) melalui halaman Detail Batch.
            </p>
          </div>

        </form>
      </div>
    </div>
  )
}

export default function AdminCreateBatchPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>}>
      <CreateBatchForm />
    </React.Suspense>
  )
}
