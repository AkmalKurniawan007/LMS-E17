"use client"

import * as React from "react"
import { Search, CheckCircle2, AlertCircle, FileText, Check, Download, FileSpreadsheet, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { SubmissionItem } from "./actions"

interface AssignmentsClientProps {
  initialSubmissions: SubmissionItem[]
}

export default function AssignmentsClient({ initialSubmissions }: AssignmentsClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "pending" | "graded">("pending")

  const pendingCount = React.useMemo(() => {
    return initialSubmissions.filter(s => s.status === 'pending').length
  }, [initialSubmissions])

  const gradedCount = React.useMemo(() => {
    return initialSubmissions.filter(s => s.status === 'graded').length
  }, [initialSubmissions])

  const filteredSubmissions = React.useMemo(() => {
    return initialSubmissions.filter(sub => {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        sub.student.toLowerCase().includes(query) ||
        sub.studentEmail.toLowerCase().includes(query) ||
        sub.task.toLowerCase().includes(query) ||
        sub.batch.toLowerCase().includes(query)

      const matchesStatus = statusFilter === "all" || sub.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [initialSubmissions, searchQuery, statusFilter])

  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast.error("Tidak ada data untuk diekspor")
      return
    }

    const headers = ["Nama Siswa", "Email", "Tugas", "Batch", "Waktu Pengumpulan", "Status", "Nilai", "Tautan Tugas", "Catatan"]
    const rows = filteredSubmissions.map(s => [
      `"${s.student.replace(/"/g, '""')}"`,
      `"${s.studentEmail.replace(/"/g, '""')}"`,
      `"${s.task.replace(/"/g, '""')}"`,
      `"${s.batch.replace(/"/g, '""')}"`,
      `"${s.submittedAt}"`,
      `"${s.status === 'graded' ? 'Selesai' : 'Menunggu'}"`,
      `"${s.score !== null ? s.score : '-'}"`,
      `"${s.link.replace(/"/g, '""')}"`,
      `"${(s.comment || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `penilaian_tugas_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Data tugas berhasil diekspor ke CSV")
  }

  const handleDownloadAll = () => {
    const urls = filteredSubmissions.filter(s => s.link && s.link.startsWith('http')).map(s => s.link)
    if (urls.length === 0) {
      toast.error("Tidak ada tautan/file yang dapat diunduh pada filter saat ini")
      return
    }
    toast.info(`Ditemukan ${urls.length} tautan tugas siswa. Mengunduh data...`)
    // If fewer than 5 urls, open in separate tabs
    if (urls.length <= 5) {
      urls.forEach(url => window.open(url, '_blank'))
    } else {
      // Prompt user or export csv with links
      handleExportCSV()
    }
  }

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
            placeholder="Cari nama siswa, email, atau tugas..."
            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy/50 focus:border-e17-navy"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors flex-1 sm:flex-none ${
                statusFilter === 'pending' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Menunggu ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('graded')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors flex-1 sm:flex-none ${
                statusFilter === 'graded' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Selesai ({gradedCount})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors flex-1 sm:flex-none ${
                statusFilter === 'all' ? 'bg-white text-e17-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Semua ({initialSubmissions.length})
            </button>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleDownloadAll}
              className="flex-1 sm:flex-none flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 mr-1" /> Unduh Lampiran
            </button>
            <button 
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
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
            <p className="text-sm text-slate-500 mt-2">
              {initialSubmissions.length === 0 
                ? "Belum ada pengumpulan tugas dari siswa untuk kelas yang Anda ampu." 
                : "Tidak ada data tugas yang sesuai dengan filter atau kata kunci pencarian Anda."}
            </p>
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs font-medium text-slate-600">{sub.student}</p>
                            <span className="text-[10px] text-slate-400">({sub.studentEmail})</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-semibold">{sub.batch}</p>
                      {sub.program && (
                        <p className="text-xs text-slate-400">{sub.program}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-slate-700 font-medium text-xs">{sub.time}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{sub.submittedAt}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {sub.status === 'graded' ? (
                          <><Check className="w-3 h-3 mr-1" /> {sub.score !== null ? sub.score : 0}/100</>
                        ) : (
                          <><AlertCircle className="w-3 h-3 mr-1" /> Menunggu</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/mentor/assignments/${sub.id}`}
                        className={`inline-block text-center text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors ${
                          sub.status === 'graded' 
                            ? 'text-e17-navy border border-e17-navy/30 hover:bg-blue-50' 
                            : 'bg-e17-primary hover:bg-yellow-400 text-e17-navy shadow-sm'
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
