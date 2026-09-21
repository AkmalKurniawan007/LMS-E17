'use client'

import React, { useEffect, useState } from 'react'
import { Shield, ShieldAlert, History, UserCog, Search, Filter, Download } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { getAuditLogs } from '@/utils/logger-actions'
import { AuditLog, LogRole } from '@/utils/logger'

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState<LogRole | 'all'>('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const itemsPerPage = 15

  const getSeverity = (action: string) => {
    const act = action.toLowerCase()
    if (act.includes('hapus') || act.includes('delete') || act.includes('drop')) return 'CRITICAL'
    if (act.includes('gagal') || act.includes('ubah peran') || act.includes('reset') || act.includes('batal')) return 'WARNING'
    return 'INFO'
  }

  const downloadCSV = () => {
    if (filteredLogs.length === 0) return
    
    const headers = ['Waktu', 'Peran', 'Aktor', 'Tingkat', 'Aktivitas', 'Detail']
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => {
        const date = new Date(log.created_at).toLocaleString('id-ID').replace(/,/g, '')
        const role = log.role
        const actor = log.user_email || 'Sistem'
        const severity = getSeverity(log.action)
        const action = `"${log.action.replace(/"/g, '""')}"`
        const details = `"${log.details.replace(/"/g, '""')}"`
        return `${date},${role},${actor},${severity},${action},${details}`
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    const data = await getAuditLogs()
    setLogs(data)
    setLoading(false)
  }

  const filteredLogs = React.useMemo(() => {
    return logs.filter(log => {
      const matchesRole = filterRole === 'all' || log.role === filterRole
      const matchesSearch = log.details.toLowerCase().includes(search.toLowerCase()) || 
                            log.action.toLowerCase().includes(search.toLowerCase()) ||
                            (log.user_email && log.user_email.toLowerCase().includes(search.toLowerCase()))
      
      let matchesDate = true
      if (dateFrom || dateTo) {
        const logDate = new Date(log.created_at)
        logDate.setHours(0, 0, 0, 0)
        
        if (dateFrom) {
          const from = new Date(dateFrom)
          from.setHours(0, 0, 0, 0)
          if (logDate < from) matchesDate = false
        }
        if (dateTo) {
          const to = new Date(dateTo)
          to.setHours(23, 59, 59, 999)
          if (logDate > to) matchesDate = false
        }
      }
                            
      return matchesRole && matchesSearch && matchesDate
    })
  }, [logs, filterRole, search, dateFrom, dateTo])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterRole, search, dateFrom, dateTo])

  const paginatedLogs = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredLogs, currentPage, itemsPerPage])

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark flex items-center">
            <Shield className="w-7 h-7 mr-3 text-e17-navy" />
            Sistem Log Audit (Keamanan)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Pantau seluruh aktivitas Admin, Mentor, dan Siswa untuk mencegah pelanggaran.</p>
        </div>
        <button 
          onClick={downloadCSV}
          disabled={filteredLogs.length === 0}
          className="flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center text-sm uppercase tracking-wide">
              <Filter className="w-4 h-4 mr-2" /> Filter Peran
            </h2>
            <div className="space-y-2">
              <button 
                onClick={() => setFilterRole('all')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${filterRole === 'all' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                Semua Peran
              </button>
              <button 
                onClick={() => setFilterRole('admin')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${filterRole === 'admin' ? 'bg-red-50 text-red-700 border border-red-200' : 'hover:bg-slate-100 text-slate-600 border border-transparent'}`}
              >
                <ShieldAlert className="w-4 h-4 mr-2" /> Admin
              </button>
              <button 
                onClick={() => setFilterRole('mentor')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${filterRole === 'mentor' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-slate-100 text-slate-600 border border-transparent'}`}
              >
                <UserCog className="w-4 h-4 mr-2" /> Mentor
              </button>
              <button 
                onClick={() => setFilterRole('siswa')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${filterRole === 'siswa' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'hover:bg-slate-100 text-slate-600 border border-transparent'}`}
              >
                <History className="w-4 h-4 mr-2" /> Siswa
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center text-sm uppercase tracking-wide">
              <History className="w-4 h-4 mr-2" /> Waktu
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Dari Tanggal</label>
                <input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:border-e17-navy focus:ring-1 focus:ring-e17-navy"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button 
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="w-full text-xs font-bold text-red-600 hover:text-red-800 transition-colors py-1"
                >
                  Reset Tanggal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Cari berdasarkan email, aksi, atau detail log..." 
                  className="pl-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-500 bg-white border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-bold w-40">Waktu (WIB)</th>
                    <th className="px-6 py-3 font-bold w-28">Peran</th>
                    <th className="px-6 py-3 font-bold w-40">Aktor (Email)</th>
                    <th className="px-6 py-3 font-bold w-32">Tingkat</th>
                    <th className="px-6 py-3 font-bold">Aktivitas & Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        Memuat data audit trail...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic bg-slate-50">
                        Tidak ada log yang ditemukan untuk kriteria ini.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            log.role === 'admin' ? 'bg-red-100 text-red-700' :
                            log.role === 'mentor' ? 'bg-blue-100 text-blue-700' :
                            log.role === 'siswa' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700 truncate max-w-[150px]">
                          {log.user_email || 'Sistem'}
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const sev = getSeverity(log.action)
                            if (sev === 'CRITICAL') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">CRITICAL</span>
                            if (sev === 'WARNING') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">WARNING</span>
                            return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">INFO</span>
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-sm mb-1">{log.action}</div>
                          <div className="text-slate-500 text-xs leading-relaxed">{log.details}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredLogs.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredLogs.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                totalItems={filteredLogs.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
