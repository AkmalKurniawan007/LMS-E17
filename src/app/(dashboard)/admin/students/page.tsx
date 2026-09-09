"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Search, Filter, FileUp, X, AlertTriangle, CheckCircle, Loader2, Mail, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { AddStudentSlideover } from "@/components/admin/AddStudentSlideover"
import { Pagination } from "@/components/ui/pagination"
import { resendActivationEmail } from "./actions"

type EnrollmentStatus = "Aktif" | "Lulus" | "Tidak Lulus" | "Mengundurkan Diri"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  batch: string
  status: EnrollmentStatus
  joinedAt: string
}

interface PendingChange {
  student: Student
  newStatus: EnrollmentStatus
}

export default function AdminStudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const supabase = createClient()

  const [isAddSlideoverOpen, setIsAddSlideoverOpen] = React.useState(false)

  // Portfolio Management State
  const [portfolioStudent, setPortfolioStudent] = React.useState<Student | null>(null)
  const [portfolioForm, setPortfolioForm] = React.useState({ username: "", tagline: "", bio: "", status: true })
  const [isSavingPortfolio, setIsSavingPortfolio] = React.useState(false)

  const handleSavePortfolio = async () => {
    setIsSavingPortfolio(true)
    // Simulate API call to update user's portfolio data
    await new Promise(r => setTimeout(r, 1000))
    setIsSavingPortfolio(false)
    setPortfolioStudent(null)
    alert("Data portofolio berhasil disimpan.")
  }
  const [batches, setBatches] = React.useState<{id: string, name: string}[]>([])
  const [isResending, setIsResending] = React.useState<string | null>(null)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [batchFilter, setBatchFilter] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const filteredStudents = React.useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.batch.toLowerCase().includes(searchQuery.toLowerCase())
      const matchBatch = batchFilter ? s.batch === batchFilter : true
      const matchStatus = statusFilter ? s.status === statusFilter : true
      return matchSearch && matchBatch && matchStatus
    })
  }, [students, searchQuery, batchFilter, statusFilter])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, batchFilter, statusFilter])

  const paginatedStudents = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredStudents, currentPage, itemsPerPage])

  React.useEffect(() => {
    fetchStudents()
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    const { data } = await supabase.from('batches').select('id, name').order('created_at', { ascending: false })
    if (data) setBatches(data)
  }

  const fetchStudents = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        status,
        created_at,
        users!inner ( id, full_name, email ),
        batches!inner ( name )
      `)
      .order('created_at', { ascending: false })
      
    if (data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.users.full_name,
        email: item.users.email,
        phone: "-", // TODO: Add phone to users table if needed
        batch: item.batches.name,
        status: capitalizeStatus(item.status),
        joinedAt: new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      }))
      setStudents(formatted)
    }
    setIsLoading(false)
  }

  const capitalizeStatus = (status: string): EnrollmentStatus => {
    if (status === 'aktif') return 'Aktif'
    if (status === 'lulus') return 'Lulus'
    if (status === 'tidak lulus') return 'Tidak Lulus'
    if (status === 'mengundurkan diri') return 'Mengundurkan Diri'
    return 'Aktif'
  }

  const [pendingChange, setPendingChange] = React.useState<PendingChange | null>(null)
  const [reason, setReason]               = React.useState("")
  const [reasonError, setReasonError]     = React.useState(false)
  const [successMsg, setSuccessMsg]       = React.useState<string | null>(null)

  const allStatuses: EnrollmentStatus[] = ["Aktif", "Lulus", "Tidak Lulus", "Mengundurkan Diri"]

  const statusConfig: Record<EnrollmentStatus, { bg: string; text: string; border: string }> = {
    "Aktif":             { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    "Lulus":             { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
    "Tidak Lulus":       { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200"     },
    "Mengundurkan Diri": { bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-300"   },
  }

  const getStatusBadge = (status: EnrollmentStatus) => {
    const cfg = statusConfig[status]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
        {status}
      </span>
    )
  }

  const handleStatusSelect = (student: Student, newStatus: string) => {
    if (newStatus === student.status) return
    setPendingChange({ student, newStatus: newStatus as EnrollmentStatus })
    setReason("")
    setReasonError(false)
  }

  const handleResendEmail = async (email: string) => {
    if (!confirm(`Kirim ulang email aktivasi ke ${email}?`)) return
    setIsResending(email)
    const result = await resendActivationEmail(email)
    
    if (result.success) {
      setSuccessMsg(result.message)
      setTimeout(() => setSuccessMsg(null), 4000)
    } else {
      alert("Gagal mengirim email: " + result.message)
    }
    setIsResending(null)
  }

  const handleConfirm = async () => {
    if (!reason.trim()) { setReasonError(true); return }
    if (!pendingChange) return
    
    // Update to database
    const dbStatus = pendingChange.newStatus.toLowerCase()
    const { error } = await supabase
      .from('enrollments')
      .update({ status: dbStatus, status_reason: reason })
      .eq('id', pendingChange.student.id)

    if (error) {
      alert("Gagal merubah status: " + error.message)
      return
    }

    setStudents(prev => prev.map(s => s.id === pendingChange.student.id ? { ...s, status: pendingChange.newStatus } : s))
    const msg = `Status ${pendingChange.student.name} diubah menjadi "${pendingChange.newStatus}".`
    setPendingChange(null)
    setReason("")
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 4000)
  }

  const handleCancel = () => { setPendingChange(null); setReason(""); setReasonError(false) }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Manajemen Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data peserta pelatihan di seluruh program.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Link href="/admin/students/import">
            <Button variant="outline" className="border-slate-200 bg-white text-slate-700">
              <FileUp className="mr-2 h-4 w-4" /> Import CSV
            </Button>
          </Link>
          <Button variant="orange" className="font-bold shadow-sm" onClick={() => setIsAddSlideoverOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Manual
          </Button>
        </div>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between card-clean p-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            type="text" 
            placeholder="Cari nama, email, atau batch..." 
            className="pl-10 w-full" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select 
            className="flex h-10 items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy cursor-pointer hover:border-slate-400 text-e17-dark"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          >
            <option value="">Semua Batch</option>
            {batches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
          <select 
            className="flex h-10 items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy cursor-pointer hover:border-slate-400 text-e17-dark"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="card-clean overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama & Email</th>
                <th className="px-6 py-4 font-semibold">No. Telepon</th>
                <th className="px-6 py-4 font-semibold">Batch</th>
                <th className="px-6 py-4 font-semibold">Status Enrollment</th>
                <th className="px-6 py-4 font-semibold">Tgl Daftar</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-e17-navy" />
                    Memuat data siswa...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada siswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-e17-dark">{student.name}</div>
                      <div className="text-slate-500 text-xs">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{student.batch}</td>
                    <td className="px-6 py-4">{getStatusBadge(student.status)}</td>
                    <td className="px-6 py-4 text-slate-500">{student.joinedAt}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-e17-navy hover:bg-slate-100" 
                          title="Kirim Ulang Email Aktivasi"
                          onClick={() => handleResendEmail(student.email)}
                          disabled={isResending === student.email}
                        >
                          {isResending === student.email ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50" 
                          title="Kelola Portofolio Publik"
                          onClick={() => {
                            setPortfolioStudent(student)
                            setPortfolioForm({ 
                              username: student.name.toLowerCase().replace(/\s+/g, '-'), 
                              tagline: "Siswa E17 Course", 
                              bio: "",
                              status: true
                            })
                          }}
                        >
                          <UserCircle className="h-4 w-4" />
                        </Button>
                        <select
                          value={student.status}
                          onChange={(e) => handleStatusSelect(student, e.target.value)}
                          className="h-8 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-e17-navy cursor-pointer hover:border-slate-400"
                        >
                          {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredStudents.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredStudents.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={filteredStudents.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* ── Modal Konfirmasi Ubah Status (FR-30) ── */}
      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-e17-dark text-base">Konfirmasi Perubahan Status</h3>
                  <p className="text-xs text-slate-500">Tindakan ini akan tercatat dalam audit log sistem.</p>
                </div>
              </div>
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Siswa</span>
                  <span className="font-bold text-e17-dark">{pendingChange.student.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Batch</span>
                  <span className="text-slate-700">{pendingChange.student.batch}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Dari Status</span>
                  {getStatusBadge(pendingChange.student.status)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Ke Status Baru</span>
                  {getStatusBadge(pendingChange.newStatus)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Alasan / Keterangan <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-slate-400 ml-1">(wajib untuk keperluan audit)</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setReasonError(false) }}
                  placeholder={
                    pendingChange.newStatus === "Mengundurkan Diri"
                      ? "Contoh: Siswa mengundurkan diri karena alasan pribadi (konfirmasi via email tgl 1 Sep 2026)."
                      : "Jelaskan alasan perubahan status ini..."
                  }
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 transition-colors ${
                    reasonError ? "border-red-400 focus:ring-red-400 bg-red-50" : "border-slate-300 focus:ring-e17-navy"
                  }`}
                />
                {reasonError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">Alasan wajib diisi sebelum mengkonfirmasi perubahan.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <Button variant="outline" className="flex-1 border-slate-300 text-slate-700" onClick={handleCancel}>
                Batal
              </Button>
              <Button variant="orange" className="flex-1 font-bold shadow-sm" onClick={handleConfirm}>
                Konfirmasi Perubahan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Kelola Portofolio ── */}
      {portfolioStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-e17-dark text-base">Kelola Portofolio Publik</h3>
                  <p className="text-xs text-slate-500">{portfolioStudent.name}</p>
                </div>
              </div>
              <button onClick={() => setPortfolioStudent(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Username (URL Tautan)</label>
                <div className="flex items-center border border-slate-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="bg-slate-100 px-3 py-2 text-sm text-slate-500 border-r border-slate-300">e17course.com/portfolio/</span>
                  <input 
                    type="text" 
                    value={portfolioForm.username}
                    onChange={(e) => setPortfolioForm({...portfolioForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                    className="flex-1 px-3 py-2 text-sm focus:outline-none"
                    placeholder="budi-santoso"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tagline</label>
                <input 
                  type="text" 
                  value={portfolioForm.tagline}
                  onChange={(e) => setPortfolioForm({...portfolioForm, tagline: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="UI/UX Designer"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Bio / Deskripsi</label>
                <textarea 
                  value={portfolioForm.bio}
                  onChange={(e) => setPortfolioForm({...portfolioForm, bio: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Ceritakan tentang siswa ini..."
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div>
                  <p className="text-sm font-bold text-slate-800">Status Portofolio</p>
                  <p className="text-xs text-slate-500">Tentukan apakah portofolio ini dapat diakses oleh publik.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPortfolioForm({...portfolioForm, status: !portfolioForm.status})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${portfolioForm.status ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${portfolioForm.status ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {!portfolioForm.status && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-800"><b>Portofolio Ditangguhkan (Suspended):</b> Tautan portofolio tidak akan bisa diakses publik dan akan menampilkan halaman peringatan takedown.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <Button variant="outline" className="flex-1" onClick={() => setPortfolioStudent(null)}>Batal</Button>
              <Button variant="orange" className="flex-1 font-bold" onClick={handleSavePortfolio} disabled={isSavingPortfolio}>
                {isSavingPortfolio ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Simpan Portofolio
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Slideover Tambah Manual Siswa */}
      <AddStudentSlideover 
        isOpen={isAddSlideoverOpen}
        onClose={() => setIsAddSlideoverOpen(false)}
        batches={batches}
        onSuccess={() => {
          setSuccessMsg("Siswa berhasil ditambahkan dan didaftarkan ke kelas!")
          setTimeout(() => setSuccessMsg(null), 4000)
          fetchStudents()
        }}
      />
    </div>
  )
}

