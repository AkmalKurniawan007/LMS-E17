"use client"

import * as React from "react"
import { Search, Filter, CheckCircle2, AlertCircle, FileText, X, Check, Eye, Download, FileSpreadsheet } from "lucide-react"
import Link from "next/link"

// Mock Data
const MOCK_SUBMISSIONS = [
  { id: 's1', student: 'Budi Santoso', task: 'Tugas Modul 1: React Basic', type: 'task', batch: 'Fullstack JS - Batch 3', status: 'pending', time: '10 menit yang lalu', link: 'https://github.com/budisantoso/react-basic', comment: '' },
  { id: 's2', student: 'Siti Aminah', task: 'Tugas Modul 1: React Basic', type: 'task', batch: 'Fullstack JS - Batch 3', status: 'pending', time: '1 jam yang lalu', link: 'https://github.com/sitiaminah/react-basic', comment: 'Maaf pak ada sedikit bug di bagian counter.' },
  { id: 's4', student: 'Dewi Lestari', task: 'Tugas Modul 2: State Management', type: 'task', batch: 'Fullstack JS - Batch 3', status: 'graded', time: '1 hari yang lalu', link: 'https://github.com/dewilestari/state-mgmt', score: 90, comment: '' },
  { id: 's5', student: 'Eko Prasetyo', task: 'Tugas Modul 2: State Management', type: 'task', batch: 'Fullstack JS - Batch 3', status: 'graded', time: '2 hari yang lalu', link: 'https://github.com/eko/state-mgmt', score: 75, comment: '' },
]

export default function MentorAssignmentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("pending")

  const filteredSubmissions = React.useMemo(() => {
    return MOCK_SUBMISSIONS.filter(sub => {
      const matchesSearch = sub.student.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            sub.task.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || sub.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Penilaian Tugas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tinjau dan berikan nilai untuk tugas harian dan modul yang dikumpulkan oleh siswa.
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
            placeholder="Cari nama siswa atau tugas..."
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 focus:border-e17-navy"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors flex-1 sm:flex-none ${statusFilter === 'pending' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Menunggu ({MOCK_SUBMISSIONS.filter(s => s.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('graded')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors flex-1 sm:flex-none ${statusFilter === 'graded' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Selesai
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors flex-1 sm:flex-none ${statusFilter === 'all' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semua
            </button>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
              <Download className="w-3 h-3 mr-1" /> Unduh ZIP
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
              <FileSpreadsheet className="w-3 h-3 mr-1" /> Ekspor CSV
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card-clean overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada tugas</h3>
            <p className="text-sm text-slate-500 mt-2">Semua tugas sudah dinilai atau tidak ditemukan dengan filter saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100 uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tugas & Siswa</th>
                  <th className="px-6 py-4 font-semibold">Kelas (Batch)</th>
                  <th className="px-6 py-4 font-semibold text-center">Waktu Kumpul</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-1 shrink-0 ${sub.status === 'graded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{sub.task}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{sub.student}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {sub.batch}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-xs">
                      {sub.time}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {sub.status === 'graded' ? (
                          <><Check className="w-3 h-3 mr-1" /> {sub.score}/100</>
                        ) : (
                          <><AlertCircle className="w-3 h-3 mr-1" /> Pending</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/mentor/assignments/${sub.id}`}
                        className={`inline-block text-center text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                          sub.status === 'graded' 
                            ? 'text-e17-navy border border-e17-navy hover:bg-blue-50' 
                            : 'bg-e17-primary hover:bg-yellow-400 text-e17-navy'
                        }`}
                      >
                        {sub.status === 'graded' ? 'Lihat Detail' : 'Beri Nilai'}
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
