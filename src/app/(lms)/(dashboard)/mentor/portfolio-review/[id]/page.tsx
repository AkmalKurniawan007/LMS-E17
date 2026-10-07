"use client"

import * as React from "react"
import { ArrowLeft, Award, ExternalLink, CheckCircle2, XCircle, FileText, Layout, Clock, Check } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock Data
const MOCK_PORTFOLIO = {
  id: 'p1', 
  student: 'Budi Santoso', 
  studentEmail: 'budi.santoso@example.com',
  batch: 'Fullstack JS - Batch 3',
  status: 'pending', // pending, approved, rejected
  submittedAt: '10 menit yang lalu', 
  portfolioUrl: 'https://budi.dev/portfolio',
  githubUrl: 'https://github.com/budisantoso',
  progress: 100,
  finalProjectScore: 92,
  averageTaskScore: 88,
  notes: 'Halo Kak, ini portofolio akhir saya yang merangkum semua proyek selama bootcamp. Mohon direview untuk penerbitan sertifikat.',
  feedback: ''
}

export default function MentorPortfolioReviewDetailPage() {
  const params = useParams()
  // In real app, fetch data based on params.id
  const review = MOCK_PORTFOLIO

  const [feedbackInput, setFeedbackInput] = React.useState(review.feedback || "")

  const handleApprove = () => {
    alert(`Portofolio ${review.student} disetujui. Sertifikat siap diterbitkan.`)
    // redirect or update state in real app
  }

  const handleReject = () => {
    if (!feedbackInput) {
      alert("Mohon isi catatan revisi sebelum menolak pengajuan.")
      return
    }
    alert(`Pengajuan ${review.student} ditolak dengan catatan: ${feedbackInput}`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-4">
        <Link href="/mentor/portfolio-review" className="text-sm font-semibold text-slate-500 hover:text-e17-navy flex items-center w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Pengajuan
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                review.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                review.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {review.status === 'approved' && <><Check className="w-3 h-3 mr-1" /> Disetujui (Sertifikat Siap)</>}
                {review.status === 'rejected' && <><XCircle className="w-3 h-3 mr-1" /> Perlu Revisi</>}
                {review.status === 'pending' && <><Clock className="w-3 h-3 mr-1" /> Menunggu Validasi</>}
              </span>
              <span className="text-sm font-medium text-slate-500 flex items-center">
                Dikumpulkan {review.submittedAt}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-e17-dark">Pengajuan Validasi Portofolio</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Oleh <span className="font-bold text-slate-700">{review.student}</span> ({review.studentEmail}) • {review.batch}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Left Column: Details & Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tautan Portofolio */}
          <div className="card-clean p-6">
            <h3 className="font-bold text-lg text-e17-dark mb-4 flex items-center">
              <Layout className="w-5 h-5 mr-2 text-e17-navy" /> Tautan Hasil Karya
            </h3>
            
            <div className="space-y-4">
              <a href={review.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-e17-navy hover:bg-slate-50 transition-all group">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors mr-4">
                    <ExternalLink className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Website Portofolio Utama</p>
                    <p className="text-sm text-blue-600 font-medium">{review.portfolioUrl}</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-slate-300 transform rotate-135 group-hover:text-e17-navy" />
              </a>

              <a href={review.githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-e17-navy hover:bg-slate-50 transition-all group">
                <div className="flex items-center">
                  <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-slate-200 transition-colors mr-4">
                    <FileText className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Repositori Kode (GitHub/GitLab)</p>
                    <p className="text-sm text-blue-600 font-medium">{review.githubUrl}</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-slate-300 transform rotate-135 group-hover:text-e17-navy" />
              </a>
            </div>
            
            {review.notes && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Catatan Tambahan Siswa</p>
                <p className="text-sm text-slate-700 leading-relaxed">"{review.notes}"</p>
              </div>
            )}
          </div>

          {/* Syarat Kelulusan */}
          <div className="card-clean p-6">
            <h3 className="font-bold text-lg text-e17-dark mb-4 border-b border-slate-100 pb-3 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-e17-primary" /> Checklist Syarat Kelulusan
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Progres Belajar 100%</p>
                  <p className="text-xs text-slate-500">Telah menyelesaikan semua sesi materi.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Tugas Modul Selesai ({review.averageTaskScore}/100)</p>
                  <p className="text-xs text-slate-500">Semua tugas harian telah dikumpulkan dan dinilai (Rata-rata 88).</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Proyek Akhir Selesai ({review.finalProjectScore}/100)</p>
                  <p className="text-xs text-slate-500">Proyek akhir telah dinilai dan memenuhi standar kelulusan minimum.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Validation Panel */}
        <div className="lg:col-span-1">
          <div className="card-clean p-6 sticky top-6">
            <h3 className="font-bold text-lg text-e17-dark mb-4 border-b border-slate-100 pb-3 flex items-center">
              <Award className="w-5 h-5 mr-2 text-amber-500" /> Aksi Validasi
            </h3>

            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Perhatian</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Menyetujui validasi ini akan mengubah status siswa menjadi <b>Lulus</b> dan sertifikat digital akan otomatis diterbitkan.
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Catatan / Masukan (Wajib jika menolak)
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan alasan revisi atau apresiasi..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  disabled={review.status !== 'pending'}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 resize-none disabled:bg-slate-50 disabled:text-slate-500"
                ></textarea>
              </div>

              {review.status === 'pending' ? (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleApprove}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-all transform hover:-translate-y-0.5 hover:shadow-lg flex justify-center items-center"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Setujui & Terbitkan
                  </button>
                  <button 
                    onClick={handleReject}
                    className="w-full bg-white border-2 border-rose-500 text-rose-500 hover:bg-rose-50 font-bold py-3 rounded-lg transition-all flex justify-center items-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Tolak (Revisi)
                  </button>
                </div>
              ) : (
                <div className={`p-4 rounded-lg text-center ${review.status === 'approved' ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
                  <p className={`text-sm font-bold ${review.status === 'approved' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    Validasi Selesai
                  </p>
                  <p className={`text-xs mt-1 ${review.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {review.status === 'approved' ? 'Sertifikat telah diterbitkan.' : 'Menunggu revisi dari siswa.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
