"use client"

import Link from "next/link"
import { ArrowLeft, Save, UploadCloud, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function MentorCreateAssignmentPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-4">
          <Link href="/mentor/assignments">
            <Button variant="ghost" size="icon" className="shrink-0 bg-white border border-slate-200 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Pemberian Tugas Baru</h1>
            <p className="text-sm text-slate-500 mt-1">Buat tugas terstruktur untuk sesi kelas yang Anda ampu.</p>
          </div>
        </div>
        <div>
          <Button variant="orange" className="font-bold shadow-sm">
            <Save className="mr-2 h-4 w-4" /> Distribusikan Tugas
          </Button>
        </div>
      </div>

      <div className="card-clean p-6 md:p-8">
        <form className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-e17-dark border-b border-slate-100 pb-2">Target & Jadwal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Pilih Batch Kelas <span className="text-red-500">*</span></label>
                <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy">
                  <option value="">-- Pilih Batch --</option>
                  <option value="1">Full-Stack Web Development - Batch 3</option>
                  <option value="2">UI/UX Design Masterclass - Batch 1</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tugaskan untuk Sesi <span className="text-red-500">*</span></label>
                <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy">
                  <option value="">-- Pilih Sesi (Pilih Batch Dulu) --</option>
                  <option value="s1">Sesi 1: HTML Basic</option>
                  <option value="s2">Sesi 2: CSS Layouting</option>
                  <option value="s4">Sesi 4: React State (Saat Ini)</option>
                  <option value="final">Tugas Akhir (Portofolio)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Batas Pengumpulan (Deadline) <span className="text-red-500">*</span></label>
                <Input type="datetime-local" className="bg-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-e17-dark border-b border-slate-100 pb-2">Detail Instruksi</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Judul Tugas <span className="text-red-500">*</span></label>
                <Input placeholder="Contoh: Membuat Aplikasi Counter Sederhana" className="bg-white" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Deskripsi / Instruksi (Ketik Manual)</label>
                <textarea 
                  className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy min-h-[150px]"
                  placeholder="Tuliskan instruksi langkah demi langkah, kriteria penilaian, atau format pengumpulan di sini..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-e17-dark border-b border-slate-100 pb-2">Lampiran Dokumen Tambahan</h3>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors group">
              <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-6 w-6 text-e17-navy" />
              </div>
              <h3 className="text-base font-bold text-e17-dark mb-1">Upload Modul / Dataset (PDF/ZIP)</h3>
              <p className="text-xs text-slate-500 mb-4">Opsional. Klik atau seret file ke area ini jika tugas membutuhkan file referensi.</p>
              <Button variant="outline" size="sm" type="button" className="pointer-events-none bg-white border-slate-200">Pilih File</Button>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  )
}
