"use client"

import * as React from "react"
import { Search, Filter, CheckCircle2, AlertCircle, Award, Check, FileText, X } from "lucide-react"
import Link from "next/link"

// Mock Data
const MOCK_REVIEWS = [
  { id: 'p1', student: 'Budi Santoso', batch: 'Fullstack JS - Batch 3', status: 'pending', submittedAt: '10 menit yang lalu', portfolioUrl: 'https://budi.dev/portfolio' },
  { id: 'p2', student: 'Siti Aminah', batch: 'Fullstack JS - Batch 3', status: 'pending', submittedAt: '1 jam yang lalu', portfolioUrl: 'https://siti.my.id' },
  { id: 'p3', student: 'Andi Wijaya', batch: 'UI/UX Design - Batch 2', status: 'approved', submittedAt: '1 hari yang lalu', portfolioUrl: 'https://behance.net/andiw' },
  { id: 'p4', student: 'Dewi Lestari', batch: 'Fullstack JS - Batch 3', status: 'rejected', submittedAt: '2 hari yang lalu', portfolioUrl: 'https://dewi.tech' },
]

export default function MentorPortfolioReviewPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("pending")

  const filteredReviews = React.useMemo(() => {
    return MOCK_REVIEWS.filter(rev => {
      const matchesSearch = rev.student.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            rev.batch.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || rev.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Validasi Portofolio & Sertifikat</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tinjau portofolio akhir siswa dan terbitkan kelulusan untuk mencetak sertifikat mereka.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card-clean p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari nama siswa atau kelas..."
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 focus:border-e17-navy"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto w-full sm:w-auto shrink-0">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'pending' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Menunggu ({MOCK_REVIEWS.filter(s => s.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'approved' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Disetujui
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'rejected' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Revisi
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'all' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semua
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card-clean overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Award className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada pengajuan</h3>
            <p className="text-sm text-slate-500 mt-2">Tidak ditemukan pengajuan portofolio dengan filter saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Siswa & Batch</th>
                  <th className="px-6 py-4 font-semibold">Tautan Portofolio</th>
                  <th className="px-6 py-4 font-semibold text-center">Waktu Pengajuan</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-1 shrink-0 ${
                          rev.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                          rev.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{rev.student}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{rev.batch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={rev.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold flex items-center text-xs">
                        {rev.portfolioUrl}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-xs">
                      {rev.submittedAt}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        rev.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                        rev.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {rev.status === 'approved' && <><Check className="w-3 h-3 mr-1" /> Lulus</>}
                        {rev.status === 'rejected' && <><X className="w-3 h-3 mr-1" /> Revisi</>}
                        {rev.status === 'pending' && <><AlertCircle className="w-3 h-3 mr-1" /> Review</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/mentor/portfolio-review/${rev.id}`}
                        className={`inline-block text-center text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                          rev.status !== 'pending' 
                            ? 'text-e17-navy border border-e17-navy hover:bg-blue-50' 
                            : 'bg-e17-primary hover:bg-yellow-400 text-e17-navy'
                        }`}
                      >
                        {rev.status !== 'pending' ? 'Lihat Detail' : 'Tinjau Kelayakan'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
