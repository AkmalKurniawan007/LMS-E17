"use client"

import * as React from "react"
import { CheckCircle2, Star, Trash2, ExternalLink, Search, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAllPortfolios, toggleShowcase, deletePortfolioAdmin, type AdminPortfolio } from "./actions"

export default function AdminPortfoliosPage() {
  const [portfolios, setPortfolios] = React.useState<AdminPortfolio[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const data = await getAllPortfolios()
    setPortfolios(data)
    setIsLoading(false)
  }

  const handleToggleShowcase = async (id: string, currentStatus: boolean, pStatus: string) => {
    if (!currentStatus && pStatus !== 'validated') {
      if (!confirm("Portofolio ini belum divalidasi oleh mentor. Yakin ingin menjadikannya Showcase?")) return
    }
    const res = await toggleShowcase(id, !currentStatus)
    if (res.success) {
      loadData()
    } else {
      alert(res.error || "Terjadi kesalahan")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus portofolio ini secara permanen? Tindakan ini tidak dapat dibatalkan.")) return
    const res = await deletePortfolioAdmin(id)
    if (res.success) {
      loadData()
    } else {
      alert(res.error || "Terjadi kesalahan")
    }
  }

  const filteredPortfolios = portfolios.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                        (p.user?.full_name?.toLowerCase() || "").includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || 
                        (statusFilter === 'showcase' && p.is_showcase) ||
                        (statusFilter === p.status)
    return matchSearch && matchStatus
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Direktori Portofolio</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola seluruh karya siswa dan pilih karya terbaik untuk ditampilkan (Showcase).</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari judul karya atau nama siswa..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy min-w-[200px]"
        >
          <option value="all">Semua Status</option>
          <option value="validated">Sudah Divalidasi</option>
          <option value="pending">Menunggu Review</option>
          <option value="draft">Draft Siswa</option>
          <option value="showcase">✨ Showcase (Terpilih)</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500">Memuat direktori portofolio...</div>
      ) : filteredPortfolios.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
          Tidak ada portofolio yang cocok dengan pencarian Anda.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="px-6 py-4">Karya</th>
                  <th className="px-6 py-4">Siswa</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Showcase</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPortfolios.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-e17-dark max-w-[250px] truncate" title={item.title}>
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 max-w-[250px] truncate" title={item.batch?.program?.name || "Karya Mandiri"}>
                        {item.batch?.program?.name || "Karya Mandiri"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {item.user?.full_name}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'validated' && <span className="inline-flex items-center text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded"><CheckCircle2 className="w-3 h-3 mr-1" /> Divalidasi</span>}
                      {item.status === 'pending' && <span className="inline-flex items-center text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">Menunggu Review</span>}
                      {item.status === 'draft' && <span className="inline-flex items-center text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">Draft</span>}
                      {item.status === 'rejected' && <span className="inline-flex items-center text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded">Revisi</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleShowcase(item.id, item.is_showcase, item.status)}
                        className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                          item.is_showcase 
                            ? "bg-amber-400 text-amber-900 hover:bg-amber-500" 
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        <Star className={`w-4 h-4 mr-1 ${item.is_showcase ? "fill-amber-900" : ""}`} />
                        {item.is_showcase ? "Tampil" : "Sembunyikan"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        {item.project_url && (
                          <a href={item.project_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:bg-blue-50">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Button onClick={() => handleDelete(item.id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
