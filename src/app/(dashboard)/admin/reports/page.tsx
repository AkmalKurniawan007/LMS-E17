"use client"

import * as React from "react"
import { PieChart, Download, GraduationCap, Users, ShieldCheck, ChevronDown, Loader2, X, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import * as XLSX from 'xlsx'

export default function AdminReportsPage() {
  const supabase = createClient()
  
  // Modals state
  const [activeModal, setActiveModal] = React.useState<'academic' | 'growth' | 'audit' | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)

  // Data for filters
  const [batches, setBatches] = React.useState<any[]>([])
  const [selectedBatch, setSelectedBatch] = React.useState("")
  
  const [monthFilter, setMonthFilter] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
  })

  const [auditFilter, setAuditFilter] = React.useState("all") // all, valid, revoked

  React.useEffect(() => {
    // Fetch filter options when component mounts
    const fetchBatches = async () => {
      const { data } = await supabase.from('batches').select('id, name').order('created_at', { ascending: false })
      if (data) {
        setBatches(data)
        if (data.length > 0) setSelectedBatch(data[0].id)
      }
    }
    fetchBatches()
  }, [])

  // --- REPORT GENERATORS ---

  const generateAcademicReport = async () => {
    if (!selectedBatch) return alert("Pilih batch terlebih dahulu")
    setIsGenerating(true)

    try {
      const batchName = batches.find(b => b.id === selectedBatch)?.name || 'Batch'
      
      const { data: enrolls } = await supabase
        .from('enrollments')
        .select('id, status, final_grade, attendance_percentage, users(full_name, email)')
        .eq('batch_id', selectedBatch)

      if (!enrolls || enrolls.length === 0) {
        alert("Tidak ada siswa di batch ini.")
        setIsGenerating(false)
        return
      }

      // Format data for Excel
      const excelData = enrolls.map((enr: any) => {
        const finalGrade = typeof enr.final_grade === 'number' ? enr.final_grade : 0
        const attendance = typeof enr.attendance_percentage === 'number' ? enr.attendance_percentage : 0

        return {
          "Nama Siswa": enr.users?.full_name || 'Tanpa Nama',
          "Email": enr.users?.email || '-',
          "Kehadiran (%)": attendance,
          "Rata-rata Kuis (30%)": "N/A",
          "Rata-rata Tugas (30%)": "N/A",
          "Final Project (40%)": "N/A",
          "Nilai Akhir": finalGrade,
          "Status Lulus": finalGrade >= 70 ? "LULUS" : "GAGAL",
          "Status Sistem": enr.status?.toUpperCase() || 'TERDAFTAR'
        }
      })

      downloadExcel(excelData, `Laporan_Akademik_${batchName.replace(/\\s+/g, '_')}`)
      setActiveModal(null)
    } catch (error) {
      console.error(error)
      alert("Gagal membuat laporan")
    }
    setIsGenerating(false)
  }

  const generateGrowthReport = async () => {
    setIsGenerating(true)
    try {
      // monthFilter is YYYY-MM
      const [year, month] = monthFilter.split('-')
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString()
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59).toISOString()

      const { data: enrolls } = await supabase
        .from('enrollments')
        .select('created_at, status, users(full_name, email), batches(name, programs(name))')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true })

      if (!enrolls || enrolls.length === 0) {
        alert(`Tidak ada pendaftaran baru di bulan ${monthFilter}.`)
        setIsGenerating(false)
        return
      }

      const excelData = enrolls.map((enr: any) => ({
        "Tanggal Daftar": new Date(enr.created_at).toLocaleDateString('id-ID'),
        "Waktu": new Date(enr.created_at).toLocaleTimeString('id-ID'),
        "Nama Siswa": enr.users?.full_name || '-',
        "Email": enr.users?.email || '-',
        "Program": enr.batches?.programs?.name || '-',
        "Batch (Kelas)": enr.batches?.name || '-',
        "Status": enr.status?.toUpperCase() || '-'
      }))

      downloadExcel(excelData, `Laporan_Pendaftaran_${monthFilter}`)
      setActiveModal(null)
    } catch (error) {
      console.error(error)
      alert("Gagal membuat laporan")
    }
    setIsGenerating(false)
  }

  const generateAuditReport = async () => {
    setIsGenerating(true)
    try {
      let query = supabase
        .from('certificates')
        .select('certificate_number, verification_code, status, created_at, revoked_reason, enrollments(users(full_name, email), batches(name))')
        .order('created_at', { ascending: false })

      if (auditFilter !== 'all') {
        query = query.eq('status', auditFilter)
      }

      const { data: certs } = await query

      if (!certs || certs.length === 0) {
        alert("Tidak ada data sertifikat ditemukan untuk filter ini.")
        setIsGenerating(false)
        return
      }

      const excelData = certs.map((c: any) => ({
        "No. Sertifikat": c.certificate_number,
        "Kode Verifikasi": c.verification_code,
        "Nama Penerima": (c.enrollments as any)?.users?.full_name || '-',
        "Email": (c.enrollments as any)?.users?.email || '-',
        "Lulusan Batch": (c.enrollments as any)?.batches?.name || '-',
        "Tanggal Terbit": new Date(c.created_at).toLocaleDateString('id-ID'),
        "Status Validitas": c.status === 'valid' ? 'SAH' : 'DICABUT',
        "Alasan Dicabut": c.revoked_reason || '-'
      }))

      downloadExcel(excelData, `Laporan_Audit_Sertifikat_${auditFilter.toUpperCase()}`)
      setActiveModal(null)
    } catch (error) {
      console.error(error)
      alert("Gagal membuat laporan")
    }
    setIsGenerating(false)
  }

  // Helper to trigger Excel download
  const downloadExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    
    // Auto-size columns slightly
    const colWidths = Object.keys(data[0] || {}).map(k => ({ wch: Math.max(k.length, 15) }))
    worksheet['!cols'] = colWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan")
    
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Pusat Laporan & Analitik</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau tren pendaftaran dan unduh laporan fundamental ke dalam format Excel.</p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Akademik */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-full shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-lg font-black text-e17-dark mb-2">Laporan Kelulusan & Nilai Akhir</h3>
          <p className="text-sm text-slate-500 flex-grow mb-6 leading-relaxed">
            Data lengkap akademik per Batch. Berisi absensi, rincian nilai Kuis/Tugas, hingga penentuan lulus/gagal siswa. Sangat cocok diserahkan ke klien/kampus mitra.
          </p>
          <Button onClick={() => setActiveModal('academic')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
            Pilih Filter Laporan
          </Button>
        </div>

        {/* Card 2: Growth */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-full shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
          <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Users className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-lg font-black text-e17-dark mb-2">Laporan Pertumbuhan (Enrollment)</h3>
          <p className="text-sm text-slate-500 flex-grow mb-6 leading-relaxed">
            Menganalisis tren pendaftaran siswa dari waktu ke waktu. Laporan bulanan ini sangat berguna untuk tim Marketing dan Manajemen mengevaluasi performa platform.
          </p>
          <Button onClick={() => setActiveModal('growth')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            Pilih Filter Laporan
          </Button>
        </div>

        {/* Card 3: Audit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-full shadow-sm hover:shadow-md hover:border-amber-300 transition-all group">
          <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-black text-e17-dark mb-2">Laporan Audit Sertifikat</h3>
          <p className="text-sm text-slate-500 flex-grow mb-6 leading-relaxed">
            Untuk keperluan legalitas (Compliance). Berisi daftar seluruh sertifikat yang pernah terbit, kode verifikasi, serta sertifikat bermasalah yang pernah dicabut.
          </p>
          <Button onClick={() => setActiveModal('audit')} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold">
            Pilih Filter Laporan
          </Button>
        </div>

      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Academic Modal */}
      {activeModal === 'academic' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-blue-50/50">
              <h2 className="text-base font-bold text-blue-900 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-blue-600" /> Ekspor Laporan Akademik
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Angkatan (Batch)</label>
                <div className="relative">
                  <select 
                    value={selectedBatch} 
                    onChange={e => setSelectedBatch(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    {batches.length === 0 && <option value="">Tidak ada batch</option>}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-600">
                <p>Format yang didukung: <strong>.XLSX (Microsoft Excel)</strong></p>
                <p className="mt-1 mb-2">Kolom: Nama, Absensi, Nilai, Status.</p>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded text-[11px]">
                  <strong>Catatan:</strong> Saat ini sistem belum menyimpan rincian nilai komponen Kuis, Tugas, dan Final Project. Kolom tersebut akan diisi dengan <strong>"N/A"</strong>. Nilai Akhir ditarik langsung dari sistem.
                </div>
              </div>
              <Button onClick={generateAcademicReport} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11">
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileSpreadsheet className="w-5 h-5 mr-2" />}
                Unduh File Excel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Growth Modal */}
      {activeModal === 'growth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-emerald-50/50">
              <h2 className="text-base font-bold text-emerald-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-emerald-600" /> Ekspor Laporan Pertumbuhan
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Bulan & Tahun Pendaftaran</label>
                <input 
                  type="month" 
                  value={monthFilter}
                  onChange={e => setMonthFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-600">
                <p>Mengekstrak data seluruh siswa yang mendaftar pada bulan terpilih ke semua program.</p>
              </div>
              <Button onClick={generateGrowthReport} disabled={isGenerating} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11">
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileSpreadsheet className="w-5 h-5 mr-2" />}
                Unduh File Excel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Audit Modal */}
      {activeModal === 'audit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-amber-50/50">
              <h2 className="text-base font-bold text-amber-900 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-amber-600" /> Ekspor Audit Sertifikat
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Filter Status Sertifikat</label>
                <div className="relative">
                  <select 
                    value={auditFilter} 
                    onChange={e => setAuditFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">Semua Sertifikat (Valid & Dicabut)</option>
                    <option value="valid">Hanya yang Valid (Sah)</option>
                    <option value="revoked">Hanya yang Dicabut (Bermasalah)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-600">
                <p>Penting untuk pelaporan legal. Termasuk alasan pencabutan jika ada.</p>
              </div>
              <Button onClick={generateAuditReport} disabled={isGenerating} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-11">
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileSpreadsheet className="w-5 h-5 mr-2" />}
                Unduh File Excel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
