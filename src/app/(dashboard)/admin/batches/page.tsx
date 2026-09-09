"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { createClient } from "@/utils/supabase/client"

export default function AdminBatchesPage() {
  const supabase = createClient()
  const [batches, setBatches] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("Semua")
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const filteredBatches = React.useMemo(() => {
    return batches.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.program.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === "Semua" ? true : b.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [batches, searchQuery, statusFilter])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const paginatedBatches = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredBatches.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredBatches, currentPage, itemsPerPage])

  React.useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('batches')
      .select(`
        id,
        name,
        start_date,
        end_date,
        programs ( name ),
        batch_mentors ( users ( full_name ) ),
        enrollments ( id )
      `)
      .order('start_date', { ascending: false })

    if (data) {
      const formatted = data.map((b: any) => {
        const today = new Date().toISOString().split('T')[0]
        let status = "Akan Datang"
        if (b.start_date <= today && (!b.end_date || b.end_date >= today)) {
          status = "Berjalan"
        } else if (b.end_date && b.end_date < today) {
          status = "Selesai"
        }

        return {
          id: b.id,
          name: b.name,
          program: b.programs?.name || "Program Dihapus",
          mentor: b.batch_mentors?.[0]?.users?.full_name || "Belum Ada",
          startDate: new Date(b.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          endDate: b.end_date ? new Date(b.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "TBA",
          students: b.enrollments?.length || 0,
          status: status
        }
      })
      setBatches(formatted)
    }
    setIsLoading(false)
  }

  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    if (!confirm(`Hapus batch "${batchName}" secara permanen? Semua data terkait (siswa, sesi) mungkin terpengaruh.`)) return
    
    // Check if there are enrollments
    const { count } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('batch_id', batchId)
    if (count && count > 0) {
      alert(`Gagal menghapus: Batch ini memiliki ${count} siswa terdaftar. Keluarkan siswa terlebih dahulu.`)
      return
    }

    setIsLoading(true)
    const { error } = await supabase.from('batches').delete().eq('id', batchId)
    if (error) {
      alert("Gagal menghapus batch: " + error.message)
    } else {
      alert("Batch berhasil dihapus.")
      fetchBatches()
    }
    setIsLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Akan Datang":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Akan Datang</span>
      case "Berjalan":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Berjalan</span>
      case "Selesai":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Selesai</span>
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Manajemen Batch</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola kelas / angkatan pelatihan (CRUD).</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/admin/batches/create">
            <Button variant="orange" className="font-bold shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Buat Batch Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between card-clean p-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            type="text" 
            placeholder="Cari nama batch atau program..." 
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              className="flex h-10 w-full sm:w-48 rounded-md border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="Akan Datang">Akan Datang</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card-clean overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Batch</th>
                <th className="px-6 py-4 font-semibold">Program</th>
                <th className="px-6 py-4 font-semibold">Mentor</th>
                <th className="px-6 py-4 font-semibold">Jadwal</th>
                <th className="px-6 py-4 font-semibold text-center">Siswa</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-e17-navy" />
                    Memuat data batch...
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada batch yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/batches/${batch.id}`} className="font-bold text-e17-dark hover:text-e17-navy transition-colors">
                        {batch.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{batch.program}</td>
                    <td className="px-6 py-4 text-slate-600">{batch.mentor}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <div className="font-medium">{batch.startDate}</div>
                      <div className="text-slate-400">s.d {batch.endDate}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{batch.students}</td>
                    <td className="px-6 py-4">{getStatusBadge(batch.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <Link href={`/admin/batches/${batch.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-e17-navy hover:bg-slate-100" title="Edit Batch">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" 
                          title="Hapus Batch"
                          onClick={() => handleDeleteBatch(batch.id, batch.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/batches/${batch.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-e17-navy hover:bg-slate-100" title="Detail Batch">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredBatches.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredBatches.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={filteredBatches.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>
    </div>
  )
}
