"use client"

import * as React from "react"
import { Search, Filter, CheckCircle2, Clock, FileText, X, Check, BookOpen, AlertCircle } from "lucide-react"

// Mock Data
const MOCK_QUIZZES = [
  { id: 'q1', student: 'Budi Santoso', quiz: 'Kuis Modul 1: React Hooks', batch: 'Fullstack JS - Batch 3', status: 'completed', time: '1 jam yang lalu', score: 95 },
  { id: 'q2', student: 'Siti Aminah', quiz: 'Kuis Modul 1: React Hooks', batch: 'Fullstack JS - Batch 3', status: 'completed', time: '2 jam yang lalu', score: 80 },
  { id: 'q3', student: 'Andi Wijaya', quiz: 'Kuis Pengenalan UI/UX', batch: 'UI/UX Design - Batch 2', status: 'completed', time: '1 hari yang lalu', score: 100 },
  { id: 'q4', student: 'Dewi Lestari', quiz: 'Kuis Modul 2: State Management', batch: 'Fullstack JS - Batch 3', status: 'completed', time: '2 hari yang lalu', score: 65 },
  { id: 'q5', student: 'Eko Prasetyo', quiz: 'Kuis Modul 2: State Management', batch: 'Fullstack JS - Batch 3', status: 'failed', time: '2 hari yang lalu', score: 40 },
]

export default function MentorQuizzesPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const filteredQuizzes = React.useMemo(() => {
    return MOCK_QUIZZES.filter(sub => {
      const matchesSearch = sub.student.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            sub.quiz.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || sub.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Penilaian Kuis</h1>
          <p className="text-sm text-slate-500 mt-1">
            Lihat rekapitulasi nilai kuis pilihan ganda yang dinilai otomatis oleh sistem.
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
            placeholder="Cari nama siswa atau kuis..."
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 focus:border-e17-navy"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'all' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semua Kuis
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'completed' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Lulus KKM
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'failed' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Remedial (Gagal)
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card-clean overflow-hidden">
        {filteredQuizzes.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada riwayat kuis</h3>
            <p className="text-sm text-slate-500 mt-2">Tidak ditemukan data yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Judul Kuis</th>
                  <th className="px-6 py-4 font-semibold">Siswa & Kelas</th>
                  <th className="px-6 py-4 font-semibold text-center">Waktu Pengerjaan</th>
                  <th className="px-6 py-4 font-semibold text-center">Nilai Akhir</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <p className="font-bold text-slate-800">{quiz.quiz}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700">{quiz.student}</p>
                      <p className="text-xs text-slate-500">{quiz.batch}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-xs font-medium">
                      {quiz.time}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-black ${
                        quiz.score >= 60 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {quiz.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        quiz.score >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {quiz.score >= 60 ? (
                          <><Check className="w-3 h-3 mr-1" /> Lulus</>
                        ) : (
                          <><AlertCircle className="w-3 h-3 mr-1" /> Remedial</>
                        )}
                      </span>
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
