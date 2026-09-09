'use client'

import * as React from "react"
import { X, Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addManualStudent } from "@/app/(dashboard)/admin/students/actions"

interface BatchOption {
  id: string
  name: string
}

interface AddStudentSlideoverProps {
  isOpen: boolean
  onClose: () => void
  batches: BatchOption[]
  onSuccess: () => void
}

export function AddStudentSlideover({ isOpen, onClose, batches, onSuccess }: AddStudentSlideoverProps) {
  const [isPending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await addManualStudent(formData)
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.error || 'Terjadi kesalahan sistem')
      }
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-e17-navy/10 rounded-full flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-e17-navy" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-e17-dark">Tambah Siswa Baru</h2>
              <p className="text-xs text-slate-500">Isi kelengkapan data diri siswa secara manual.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="add-student-form" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
              <Input name="full_name" required placeholder="Contoh: Budi Santoso" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Email <span className="text-red-500">*</span></label>
              <Input name="email" type="email" required placeholder="budi@example.com" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Nomor WhatsApp</label>
              <Input name="phone_number" placeholder="081234567890" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Asal Sekolah / Kampus</label>
              <Input name="institution" placeholder="Universitas Indonesia" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Alamat Lengkap</label>
              <textarea 
                name="address" 
                rows={3} 
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy resize-none"
                placeholder="Jl. Merdeka No. 1..."
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-700">Daftarkan ke Batch <span className="text-red-500">*</span></label>
              <select 
                name="batch_id" 
                required 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy"
              >
                <option value="">-- Pilih Batch Tujuan --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Status enroll otomatis: <b>Aktif</b>. <br/>Password otomatis: <b>password123</b>.</p>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <Button type="button" variant="outline" className="flex-1 bg-white border-slate-300" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="add-student-form" variant="orange" className="flex-1 font-bold shadow-md" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Simpan Siswa
          </Button>
        </div>
      </div>
    </>
  )
}
