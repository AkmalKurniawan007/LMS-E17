"use client"

import * as React from "react"
import { Award, Search, ShieldBan, FileCheck2, Loader2, CheckCircle2, ShieldAlert, X, AlertTriangle, Settings, Upload, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { createClient } from "@/utils/supabase/client"
import { logAction } from "@/utils/logger-actions"
import QRCode from "react-qr-code"

type Certificate = {
  id: string
  certificate_number: string
  verification_code: string
  status: 'valid' | 'revoked'
  created_at: string
  revoked_reason?: string
  student_name: string
  student_email: string
  batch_name: string
}

export default function AdminCertificatesPage() {
  const supabase = createClient()
  const [certificates, setCertificates] = React.useState<Certificate[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10
  
  const [revokeModalOpen, setRevokeModalOpen] = React.useState(false)
  const [selectedCert, setSelectedCert] = React.useState<Certificate | null>(null)
  const [revokeReason, setRevokeReason] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = React.useState(false)
  const [templateUrl, setTemplateUrl] = React.useState<string | null>('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')
  const [templateTexts, setTemplateTexts] = React.useState({
    title: "SERTIFIKAT KELULUSAN",
    subtitle: "Diberikan secara membanggakan kepada:",
    description: "Telah berhasil menyelesaikan program pelatihan [Program] dengan predikat Sangat Memuaskan."
  })

  // Bulk Upload Modal State
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = React.useState(false)
  const [uploadedFiles, setUploadedFiles] = React.useState<any[]>([])
  const [isProcessingUpload, setIsProcessingUpload] = React.useState(false)

  // Preview Student Cert Modal
  const [previewCert, setPreviewCert] = React.useState<Certificate | null>(null)

  React.useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    setIsLoading(true)
    
    // In a real scenario with full data, we'd query the certificates table.
    // For this demonstration, since the table might be empty or missing relations in dev, 
    // we will fetch enrollments with 'lulus' status if available, or just mock it.
    
    // First try to fetch real certificates
    const { data: certData, error } = await supabase
      .from('certificates')
      .select('id, certificate_number, verification_code, status, created_at, revoked_reason, enrollments(users(full_name, email), batches(name))')
      .order('created_at', { ascending: false })

    if (!error && certData && certData.length > 0) {
      const formatted = certData.map(c => ({
        id: c.id,
        certificate_number: c.certificate_number,
        verification_code: c.verification_code,
        status: c.status,
        created_at: c.created_at,
        revoked_reason: c.revoked_reason,
        student_name: (c.enrollments as any)?.users?.full_name || 'Unknown',
        student_email: (c.enrollments as any)?.users?.email || 'Unknown',
        batch_name: (c.enrollments as any)?.batches?.name || 'Unknown'
      }))
      setCertificates(formatted)
    } else {
      setCertificates([])
    }
    
    setIsLoading(false)
  }

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCert || !revokeReason) return

    setIsSubmitting(true)

    // Update real db
    const { error } = await supabase
      .from('certificates')
      .update({ status: 'revoked', revoked_reason: revokeReason })
      .eq('id', selectedCert.id)
      
    if (!error) {
      await logAction('admin', 'Pencabutan Sertifikat', `Mencabut sertifikat ${selectedCert.certificate_number} milik ${selectedCert.student_name}. Alasan: ${revokeReason}`, { target_id: selectedCert.id })
      fetchCertificates()
    }

    setIsSubmitting(false)
    setRevokeModalOpen(false)
    setRevokeReason("")
  }

  const filtered = React.useMemo(() => {
    return certificates.filter(c => 
      c.certificate_number.toLowerCase().includes(search.toLowerCase()) ||
      c.student_name.toLowerCase().includes(search.toLowerCase()) ||
      c.verification_code.toLowerCase().includes(search.toLowerCase())
    )
  }, [certificates, search])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const paginatedCertificates = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filtered.slice(startIndex, startIndex + itemsPerPage)
  }, [filtered, currentPage, itemsPerPage])

  const validCount = certificates.filter(c => c.status === 'valid').length
  const revokedCount = certificates.filter(c => c.status === 'revoked').length

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Registry Sertifikat</h1>
          <p className="text-sm text-slate-500 mt-1">Pusat audit dan pelacakan keaslian sertifikat kelulusan.</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-3">
          <Button variant="outline" className="font-bold shadow-sm" onClick={() => setBulkUploadModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload Manual
          </Button>
          <Button variant="outline" className="font-bold shadow-sm border-e17-navy text-e17-navy hover:bg-blue-50" onClick={() => setTemplateModalOpen(true)}>
            <Settings className="mr-2 h-4 w-4" /> Pengaturan Template
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-clean p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
            <Award className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Diterbitkan</p>
            <p className="text-2xl font-black text-e17-dark">{certificates.length}</p>
          </div>
        </div>
        
        <div className="card-clean p-5 flex items-center gap-4 border-b-4 border-b-emerald-500">
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sertifikat Valid</p>
            <p className="text-2xl font-black text-e17-dark">{validCount}</p>
          </div>
        </div>

        <div className="card-clean p-5 flex items-center gap-4 border-b-4 border-b-red-500">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Telah Dicabut</p>
            <p className="text-2xl font-black text-e17-dark">{revokedCount}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card-clean overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input 
              type="text" 
              placeholder="Cari No. Seri, Kode Verifikasi, atau Nama..." 
              className="pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-white uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Identitas Sertifikat</th>
                <th className="px-6 py-4 font-semibold">Nama Peserta & Kelas</th>
                <th className="px-6 py-4 font-semibold">Tanggal Terbit</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                    Mencari *registry* sertifikat...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    Sertifikat tidak ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedCertificates.map((cert) => (
                  <tr key={cert.id} className={`hover:bg-slate-50 transition-colors ${cert.status === 'revoked' ? 'bg-red-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm tracking-wide">{cert.certificate_number}</div>
                      <div className="text-slate-500 text-[11px] font-mono mt-0.5">Kode: {cert.verification_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-e17-dark">{cert.student_name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{cert.batch_name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                      {new Date(cert.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {cert.status === 'valid' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1.5" /> Sah
                        </span>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            <ShieldBan className="w-3 h-3 mr-1.5" /> Dicabut
                          </span>
                          <span className="text-[10px] text-red-600 max-w-[150px] truncate" title={cert.revoked_reason}>
                            Alasan: {cert.revoked_reason}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs font-semibold border-slate-300"
                          onClick={() => setPreviewCert(cert)}
                        >
                          <FileCheck2 className="h-3 w-3 mr-1.5" /> Lihat PDF
                        </Button>
                        {cert.status === 'valid' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-transparent hover:border-red-600"
                            onClick={() => { setSelectedCert(cert); setRevokeModalOpen(true); }}
                          >
                            Cabut Hak
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filtered.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* Revoke Modal */}
      {revokeModalOpen && selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-t-4 border-t-red-600">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-black text-center text-slate-800 mb-2">Cabut Sertifikat?</h2>
              <p className="text-sm text-center text-slate-500 mb-6">
                Tindakan ini akan membatalkan status kelulusan <strong>{selectedCert.student_name}</strong> untuk sertifikat <strong>{selectedCert.certificate_number}</strong>. Jika kode QR dipindai, akan muncul peringatan "Telah Dicabut".
              </p>
              
              <form onSubmit={handleRevoke} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Alasan Pencabutan (Wajib)</label>
                  <textarea 
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" 
                    rows={3}
                    placeholder="Contoh: Ditemukan bukti kecurangan tugas akhir..."
                    required
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                  />
                </div>
                
                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => { setRevokeModalOpen(false); setRevokeReason(""); }} disabled={isSubmitting}>Batal</Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Ya, Cabut Sertifikat
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Template Settings Modal */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-e17-dark flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-e17-navy" /> Pengaturan Template Sertifikat
                </h2>
                <p className="text-xs text-slate-500 mt-1">Unggah desain kosong (tanpa nama), sistem akan menimpa teks secara dinamis.</p>
              </div>
              <button onClick={() => setTemplateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Controls */}
              <div className="md:col-span-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">1. Unggah Desain Background</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
                    // Simulate upload by setting a dummy modern cert background
                    setTemplateUrl('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')
                  }}>
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600">Klik untuk upload gambar</p>
                    <p className="text-xs text-slate-400 mt-1">PNG atau JPG (Landscape)</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">2. Kustomisasi Teks</label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 font-semibold mb-1 block">Judul Sertifikat</label>
                      <Input value={templateTexts.title} onChange={(e) => setTemplateTexts({...templateTexts, title: e.target.value})} className="h-8 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-semibold mb-1 block">Sub-judul</label>
                      <Input value={templateTexts.subtitle} onChange={(e) => setTemplateTexts({...templateTexts, subtitle: e.target.value})} className="h-8 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-semibold mb-1 block">Teks Deskripsi</label>
                      <textarea className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 min-h-[80px]" value={templateTexts.description} onChange={(e) => setTemplateTexts({...templateTexts, description: e.target.value})} />
                      <p className="text-[10px] text-slate-400 mt-1">Gunakan <b>[Program]</b> atau <b>[Batch]</b> untuk teks dinamis.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>Tips:</strong> Sistem akan otomatis menempatkan <em>Nama Siswa</em> di tengah, dan <em>Kode Verifikasi</em> di pojok kanan bawah. Pastikan area tersebut kosong pada desain gambarmu.
                  </p>
                </div>

                <Button className="w-full font-bold shadow-sm" variant="orange" onClick={() => {
                  alert("Template berhasil disimpan!");
                  setTemplateModalOpen(false);
                }}>
                  Simpan Template
                </Button>
              </div>

              {/* Live Preview */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">2. Live Preview (Simulasi)</label>
                <div className="w-full aspect-[1.414/1] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative shadow-inner flex flex-col items-center justify-center">
                  {templateUrl ? (
                    <>
                      <img src={templateUrl} alt="Template" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      
                      {/* Dynamic Text Overlay Simulation */}
                      <div className="relative z-10 text-center w-full px-12 mt-12">
                        <h3 className="text-slate-800 text-xl md:text-3xl font-serif mb-1">{templateTexts.title}</h3>
                        <p className="text-slate-600 text-xs md:text-sm mb-8">{templateTexts.subtitle}</p>
                        
                        <h1 className="text-3xl md:text-5xl font-black text-e17-dark font-sans tracking-tight border-b-2 border-slate-300 pb-2 inline-block px-8">
                          BUDI SANTOSO
                        </h1>
                        
                        <p className="text-slate-700 mt-6 text-sm md:text-base max-w-lg mx-auto leading-relaxed"
                           dangerouslySetInnerHTML={{
                             __html: templateTexts.description
                               .replace('[Program]', '<strong>Full Stack Web Development</strong>')
                               .replace('[Batch]', '<strong>Batch 1 2026</strong>')
                           }}
                        />

                        <p className="text-slate-500 mt-8 text-xs font-semibold">
                          Diterbitkan pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>

                      {/* Verification Code & QR Code */}
                      <div className="absolute bottom-6 right-8 text-right z-10 flex items-end gap-3">
                        <div>
                          <p className="text-[10px] text-slate-500 font-semibold mb-0.5">KODE VERIFIKASI:</p>
                          <p className="text-xs font-mono font-bold bg-white/80 px-2 py-1 rounded border border-slate-300">V-A8X9K2</p>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-300 opacity-80">
                          <QRCode
                            value={`https://e17course.com/verify/V-A8X9K2`}
                            size={40}
                            level="L"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">Belum ada template diunggah</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {bulkUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-e17-dark flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-e17-navy" /> Upload Sertifikat Manual
                </h2>
                <p className="text-xs text-slate-500 mt-1">Sistem akan membaca nama file (format: namasiswa_namabatch_namaprogram.jpg) secara otomatis.</p>
              </div>
              <button onClick={() => setBulkUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {uploadedFiles.length === 0 ? (
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    // Simulate file drop
                    setUploadedFiles([
                      { file: 'budi_santoso_batch1_fswd.jpg', student: 'Budi Santoso', batch: 'Batch 1', program: 'Full-Stack Web Development', status: 'matched' },
                      { file: 'rina_wijaya_batch2_uiux.jpg', student: 'Rina Wijaya', batch: 'Batch 2', program: 'UI/UX Design Masterclass', status: 'matched' },
                      { file: 'unknown_student_batch3.jpg', student: 'Tidak Ditemukan', batch: 'Tidak Ditemukan', program: 'Tidak Ditemukan', status: 'unmatched' },
                    ])
                  }}
                >
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">Drag & Drop file gambar di sini</h3>
                  <p className="text-sm text-slate-500 mt-2">atau klik untuk memilih file dari komputer Anda (Simulasi klik saja)</p>
                  <p className="text-xs text-slate-400 mt-4 bg-slate-100 inline-block px-3 py-1.5 rounded-full border border-slate-200">Format Wajib: namasiswa_batch_program.jpg/png</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-700">Preview & Persetujuan ({uploadedFiles.length} File)</h3>
                    <Button variant="outline" size="sm" onClick={() => setUploadedFiles([])}>Batal Upload</Button>
                  </div>
                  
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Nama File</th>
                          <th className="px-4 py-3">Deteksi Siswa</th>
                          <th className="px-4 py-3">Deteksi Program & Batch</th>
                          <th className="px-4 py-3">Status Pencocokan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {uploadedFiles.map((f, i) => (
                          <tr key={i} className={f.status === 'unmatched' ? 'bg-red-50/50' : 'bg-white'}>
                            <td className="px-4 py-3 font-mono text-xs text-slate-600">{f.file}</td>
                            <td className="px-4 py-3 font-semibold text-e17-dark">{f.student}</td>
                            <td className="px-4 py-3 text-slate-600">{f.program} — {f.batch}</td>
                            <td className="px-4 py-3">
                              {f.status === 'matched' ? (
                                <span className="inline-flex items-center text-xs font-bold text-emerald-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Berhasil</span>
                              ) : (
                                <span className="inline-flex items-center text-xs font-bold text-red-600"><AlertTriangle className="w-3 h-3 mr-1" /> Siswa Tidak Ada</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
                    <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-900">Konfirmasi Distribusi</p>
                      <p className="text-xs text-blue-800 mt-1">Sistem hanya akan mendistribusikan file yang berstatus <strong className="text-emerald-700">Berhasil</strong>. File akan langsung tampil di portofolio siswa bersangkutan.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
              <Button variant="outline" onClick={() => setBulkUploadModalOpen(false)} disabled={isProcessingUpload}>Tutup</Button>
              <Button 
                variant="orange" 
                className="font-bold shadow-sm" 
                disabled={uploadedFiles.length === 0 || isProcessingUpload}
                onClick={async () => {
                  setIsProcessingUpload(true)
                  await new Promise(r => setTimeout(r, 1500)) 
                  setIsProcessingUpload(false)
                  setUploadedFiles([])
                  setBulkUploadModalOpen(false)
                  alert("Berhasil! Sertifikat telah dikaitkan dan didistribusikan ke portofolio siswa.")
                }}
              >
                {isProcessingUpload ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Setujui & Distribusikan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Student Certificate Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-20">
              <h2 className="text-lg font-bold text-e17-dark flex items-center">
                <FileCheck2 className="w-5 h-5 mr-2 text-e17-navy" /> Pratinjau Sertifikat: {previewCert.student_name}
              </h2>
              <button onClick={() => setPreviewCert(null)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 bg-slate-200 flex justify-center items-center">
              <div className="w-full aspect-[1.414/1] bg-white relative shadow-2xl flex flex-col items-center justify-center max-w-[800px] overflow-hidden">
                {templateUrl ? (
                  <>
                    <img src={templateUrl} alt="Template Background" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    
                    {/* Dynamic Text Overlay */}
                    <div className="relative z-10 text-center w-full px-12 mt-12">
                      <h3 className="text-slate-800 text-2xl md:text-4xl font-serif mb-2">{templateTexts.title}</h3>
                      <p className="text-slate-700 text-sm md:text-lg mb-10">{templateTexts.subtitle}</p>
                      
                      <h1 className="text-4xl md:text-6xl font-black text-e17-dark font-sans tracking-tight border-b-4 border-slate-400/50 pb-3 inline-block px-12 uppercase">
                        {previewCert.student_name}
                      </h1>
                      
                      <p className="text-slate-800 mt-8 text-base md:text-xl max-w-2xl mx-auto leading-relaxed"
                         dangerouslySetInnerHTML={{
                           __html: templateTexts.description
                             .replace('[Program]', `<strong class="text-e17-navy">${previewCert.batch_name.split(' - ')[0] || previewCert.batch_name}</strong>`)
                             .replace('[Batch]', `<strong>${previewCert.batch_name}</strong>`)
                         }}
                      />

                      <p className="text-slate-600 mt-12 text-sm md:text-base font-semibold">
                        Diterbitkan pada: {new Date(previewCert.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Verification Code & QR Code */}
                    <div className="absolute bottom-8 right-12 text-right z-10 flex items-end gap-4">
                      <div>
                        <p className="text-xs text-slate-600 font-bold mb-1">KODE VERIFIKASI:</p>
                        <p className="text-sm md:text-base font-mono font-black bg-white/90 px-3 py-1.5 rounded border-2 border-slate-400 tracking-wider shadow-sm">
                          {previewCert.verification_code}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-300">
                        <QRCode
                          value={`${window.location.origin}/verify/${previewCert.verification_code}`}
                          size={64}
                          level="M"
                        />
                      </div>
                    </div>

                    {/* Revoked Watermark */}
                    {previewCert.status === 'revoked' && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-red-900/10 backdrop-blur-[1px]">
                        <div className="border-8 border-red-600 text-red-600 text-6xl md:text-8xl font-black uppercase tracking-widest transform -rotate-12 opacity-80 px-8 py-4 rounded-3xl">
                          DICABUT
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-slate-400">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                    <p className="text-lg font-bold text-slate-600 mb-2">Template Belum Diatur</p>
                    <p className="text-sm">Silakan unggah gambar background di Pengaturan Template terlebih dahulu.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPreviewCert(null)}>Tutup</Button>
              <Button variant="orange" className="font-bold shadow-sm" disabled={!templateUrl}>
                Unduh PDF
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
