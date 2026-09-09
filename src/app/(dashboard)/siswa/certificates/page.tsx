"use client"

import { Award, Download, CheckCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SiswaCertificatesPage() {
  const certificates = [
    { 
      id: "E17/UIUX/BATCH-02/VIII/2026/0001", 
      program: "UI/UX Design Masterclass", 
      batch: "Batch 2", 
      date: "01 Agu 2026", 
      status: "Valid",
      score: 92
    }
  ]

  const activeProgram = {
    program: "Full-Stack Web Development",
    batch: "Batch 3",
    progress: "Sesi 4 dari 10",
    status: "Sedang Berjalan",
    requirements: [
      { name: "Kehadiran Minimal 80%", current: "100%", met: true },
      { name: "Selesaikan Semua Tugas", current: "3 / 10", met: false },
      { name: "Lulus Ujian Akhir", current: "-", met: false },
    ]
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Sertifikat Saya</h1>
          <p className="text-sm text-slate-500 mt-1">Unduh sertifikat kelulusan dari program yang telah Anda selesaikan.</p>
        </div>
      </div>

      {/* Available Certificates */}
      <div className="card-clean overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center bg-slate-50/50">
          <Award className="h-6 w-6 text-e17-navy mr-3" />
          <h2 className="text-lg font-bold text-e17-dark">Sertifikat Kelulusan Resmi</h2>
        </div>
        
        {certificates.length > 0 ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col group">
                <div className="h-40 bg-slate-900 relative p-6 flex flex-col items-center justify-center border-b border-slate-200">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-e17-primary/10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
                  
                  <Award className="h-12 w-12 text-e17-primary mb-2 drop-shadow-sm" />
                  <h3 className="text-center font-bold text-white text-lg px-4 leading-tight">{cert.program}</h3>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <Button variant="orange" className="font-bold">
                      <Search className="h-4 w-4 mr-2" /> Pratinjau Sertifikat
                    </Button>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Nomor Sertifikat</p>
                      <p className="text-sm font-mono font-medium text-e17-dark mt-0.5">{cert.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Nilai Akhir</p>
                      <p className="text-lg font-black text-e17-dark">{cert.score}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-600 mb-6 space-y-1">
                    <p><strong>Angkatan:</strong> {cert.batch}</p>
                    <p><strong>Diterbitkan:</strong> {cert.date}</p>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-auto font-semibold border-slate-200 text-slate-700 hover:bg-slate-50">
                    <Download className="mr-2 h-4 w-4 text-slate-500" /> Unduh PDF High-Res
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Award className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Belum Ada Sertifikat</h3>
            <p className="text-sm text-slate-500">Sertifikat akan muncul di sini setelah Anda menyelesaikan program dan dinyatakan lulus.</p>
          </div>
        )}
      </div>

      {/* Active Program Status */}
      <div className="card-clean overflow-hidden mt-6 bg-white">
        <div className="p-6">
          <h2 className="text-base font-bold text-e17-dark mb-1">Progres Program Saat Ini</h2>
          <p className="text-sm text-slate-500 mb-6">{activeProgram.program} - {activeProgram.batch}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeProgram.requirements.map((req, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-sm flex items-start">
                <div className={`mt-0.5 mr-3 shrink-0 ${req.met ? "text-emerald-500" : "text-slate-300"}`}>
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-e17-dark">{req.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Saat ini: {req.current}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Pertahankan semangat belajar Anda!</p>
              <p className="text-xs text-slate-600 mt-0.5">Selesaikan program dengan nilai terbaik untuk mendapatkan sertifikat kelulusan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
