'use client'

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, UploadCloud, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Send, RefreshCw, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { processBulkImport, getActiveBatches } from "./actions"

type PreviewRow = {
  id: number;
  name: string;
  email: string;
  status: 'valid' | 'invalid';
  error: string | null;
}

type BatchOption = {
  id: string;
  name: string;
}

export default function AdminBulkImportPage() {
  const [importStatus, setImportStatus] = React.useState<"idle" | "preview" | "success">("idle")
  const [isPending, startTransition] = React.useTransition()
  
  const [previewData, setPreviewData] = React.useState<PreviewRow[]>([])
  const [batches, setBatches] = React.useState<BatchOption[]>([])
  const [selectedBatchId, setSelectedBatchId] = React.useState<string>("")
  const [fileName, setFileName] = React.useState<string>("")
  const [importResult, setImportResult] = React.useState<any>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Fetch batches on mount
  React.useEffect(() => {
    getActiveBatches().then(data => {
      if (data) setBatches(data)
    })
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    const processData = (rawData: any[]) => {
      const parsedRows: PreviewRow[] = rawData.map((row: any, index: number) => {
        const email = row.email?.trim()
        const name = row.full_name?.trim()
        
        let status: 'valid' | 'invalid' = 'valid'
        let error = null

        if (!email || !name) {
          status = 'invalid'
          error = 'Data email/nama kosong'
        } else if (!email.includes('@')) {
          status = 'invalid'
          error = 'Format email tidak valid'
        }

        return {
          id: index + 1,
          name: name || '-',
          email: email || '-',
          status,
          error
        }
      })
      
      setPreviewData(parsedRows)
      setImportStatus("preview")
    }
    
    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data)
        },
        error: (error) => {
          alert("Gagal membaca file CSV: " + error.message)
        }
      })
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader()
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result
          const wb = XLSX.read(bstr, { type: 'binary' })
          const wsname = wb.SheetNames[0]
          const ws = wb.Sheets[wsname]
          const data = XLSX.utils.sheet_to_json(ws)
          processData(data)
        } catch (err) {
          alert("Gagal memproses file Excel. Pastikan format sudah benar.")
        }
      }
      reader.onerror = () => alert("Gagal membaca file Excel.")
      reader.readAsBinaryString(file)
    } else {
      alert("Format file tidak didukung. Harap unggah file .csv atau .xlsx")
    }
  }

  const handleProcess = () => {
    if (!selectedBatchId) {
      alert("Silakan pilih Batch Tujuan terlebih dahulu.")
      return
    }

    const validStudents = previewData
      .filter(row => row.status === 'valid')
      .map(row => ({ email: row.email, full_name: row.name }))

    if (validStudents.length === 0) {
      alert("Tidak ada baris data yang valid untuk diproses.")
      return
    }

    startTransition(async () => {
      // TODO: Replace adminId with actual logged in admin UUID
      // For now, passing a mock uuid or getting it from session would be better, but we can pass a dummy or let the action handle it.
      // Since it's required for the bulk_import_jobs table, let's just pass a default uuid if we don't have one, or fetch it.
      const adminId = '00000000-0000-0000-0000-000000000000' // FIXME: Use actual admin ID
      
      const result = await processBulkImport(validStudents, selectedBatchId, adminId)
      
      setImportResult(result)
      setImportStatus("success")
    })
  }

  const validCount = previewData.filter(d => d.status === 'valid').length

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/students">
            <Button variant="ghost" size="icon" className="shrink-0 bg-white border border-slate-200 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Bulk Import Siswa</h1>
            <p className="text-sm text-slate-500 mt-1">Daftarkan ratusan siswa sekaligus menggunakan CSV atau Excel.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/template_siswa.csv" download>
            <Button variant="outline" className="border-e17-navy text-e17-navy hover:bg-blue-50 font-semibold bg-white">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Unduh Template CSV
            </Button>
          </a>
          <a href="/template_siswa.xlsx" download>
            <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold bg-white">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Unduh Template Excel
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Upload & Preview */}
        <div className="lg:col-span-2 space-y-6">
          
          {importStatus === "idle" && (
            <div 
              className="card-clean p-8 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              <div className="h-20 w-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                <UploadCloud className="h-10 w-10 text-e17-navy" />
              </div>
              <h2 className="text-xl font-bold text-e17-dark mb-2">Pilih File CSV/Excel atau Drag & Drop</h2>
              <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
                Gunakan template standar kami. Pastikan file berformat .csv atau .xlsx dan memiliki kolom <strong>email</strong> dan <strong>full_name</strong>.
              </p>
              <Button className="bg-slate-800 hover:bg-slate-900 text-white pointer-events-none">Jelajahi File</Button>
            </div>
          )}

          {importStatus === "preview" && (
            <div className="card-clean overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                 <h2 className="text-lg font-bold text-e17-dark flex items-center">
                    <FileSpreadsheet className="w-5 h-5 mr-2 text-e17-navy" /> Pratinjau Data ({fileName})
                 </h2>
                 <p className="text-sm text-slate-500 mt-1">Sistem menemukan {previewData.length} baris. Tinjau error sebelum memproses.</p>
               </div>
               
               <div className="p-6 border-b border-slate-100 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Batch Tujuan <span className="text-red-500">*</span></label>
                    <select 
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="flex h-10 w-full md:w-1/2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-e17-navy"
                    >
                      <option value="">-- Pilih Batch --</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                     <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                     <div className="text-sm text-amber-800">
                       <p className="font-bold mb-1">Perhatian</p>
                       <p>Baris yang tidak valid (merah) <strong>akan diabaikan</strong>. Sistem tetap akan memproses sisa baris yang valid (hijau). Anda tidak perlu membatalkan seluruh proses.</p>
                     </div>
                  </div>
               </div>

               <div className="overflow-x-auto max-h-[400px]">
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-y border-slate-200 sticky top-0 z-10">
                     <tr>
                       <th className="px-4 py-3 font-semibold">Status</th>
                       <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                       <th className="px-4 py-3 font-semibold">Email</th>
                       <th className="px-4 py-3 font-semibold">Keterangan Error</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {previewData.map(row => (
                       <tr key={row.id} className={row.status === 'valid' ? 'bg-white' : 'bg-red-50/30'}>
                         <td className="px-4 py-3">
                           {row.status === 'valid' 
                             ? <CheckCircle className="w-5 h-5 text-emerald-500" /> 
                             : <XCircle className="w-5 h-5 text-red-500" />}
                         </td>
                         <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                         <td className="px-4 py-3 text-slate-600">{row.email}</td>
                         <td className="px-4 py-3">
                           {row.error 
                             ? <span className="text-xs font-bold text-red-600">{row.error}</span> 
                             : <span className="text-xs text-slate-400 italic">Valid (Siap Proses)</span>}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               
               <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                  <Button variant="outline" className="border-slate-300" onClick={() => setImportStatus("idle")} disabled={isPending}>Batal</Button>
                  <Button variant="orange" className="font-bold shadow-md px-8" onClick={handleProcess} disabled={isPending || validCount === 0 || !selectedBatchId}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Proses {validCount} Data Valid
                  </Button>
               </div>
            </div>
          )}

          {importStatus === "success" && importResult && (
            <div className="card-clean p-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 min-h-[400px]">
               <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 ${importResult.success ? 'bg-emerald-100' : 'bg-red-100'}`}>
                 {importResult.success ? <CheckCircle className="h-12 w-12 text-emerald-600" /> : <XCircle className="h-12 w-12 text-red-600" />}
               </div>
               <h2 className="text-2xl font-bold text-e17-dark mb-2">{importResult.success ? 'Proses Import Selesai!' : 'Import Gagal'}</h2>
               <p className="text-slate-500 mb-6 max-w-md font-medium">
                 {importResult.message}
               </p>
               
               {importResult.details && importResult.details.length > 0 && (
                 <div className="w-full max-w-2xl text-left bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-8 max-h-[250px] overflow-y-auto">
                   <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-sm text-slate-700 sticky top-0">Rincian Hasil per Siswa</div>
                   <ul className="divide-y divide-slate-100 text-sm">
                     {importResult.details.map((detail: any, idx: number) => (
                       <li key={idx} className="px-4 py-3 flex items-start gap-3">
                         {detail.status === 'success' ? (
                           <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                         ) : (
                           <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                         )}
                         <div>
                           <p className="font-semibold text-slate-800">{detail.email}</p>
                           <p className={`text-xs mt-0.5 ${detail.status === 'success' ? 'text-emerald-600' : 'text-red-600 font-bold'}`}>
                             {detail.status === 'success' ? (detail.message || 'Sukses') : (detail.reason || 'Gagal')}
                           </p>
                         </div>
                       </li>
                     ))}
                   </ul>
                 </div>
               )}

               <div className="flex gap-4">
                 <Button variant="outline" className="border-slate-300" onClick={() => { setImportStatus("idle"); setPreviewData([]); setFileName(""); }}>Import File Lain</Button>
                 <Link href="/admin/students">
                   <Button variant="orange" className="font-bold shadow-md">Lihat Daftar Siswa</Button>
                 </Link>
               </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Resend Activation Panel (FR-13A) */}
        <div className="lg:col-span-1">
           <div className="card-clean overflow-hidden sticky top-6 border-t-4 border-t-e17-navy shadow-sm">
             <div className="p-5 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-bold text-e17-dark text-lg flex items-center">
                 <Send className="w-4 h-4 mr-2 text-e17-navy" /> Info & Bantuan
               </h3>
             </div>
             
             <div className="p-5 space-y-4 text-sm text-slate-600">
               <p>Gunakan fitur ini untuk mempercepat pendaftaran siswa dalam jumlah besar.</p>
               <ul className="list-disc pl-5 space-y-2">
                 <li>Pastikan header CSV menggunakan format <strong>email</strong> dan <strong>full_name</strong>.</li>
                 <li>Password bawaan (*default*) untuk akun baru adalah <strong>password123</strong>.</li>
                 <li>Siswa tidak perlu lagi verifikasi email (langsung aktif).</li>
               </ul>
             </div>
             
             <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <Link href="/admin/students" className="text-xs font-bold text-e17-navy hover:underline">
                   Lihat Seluruh Siswa &rarr;
                </Link>
             </div>
           </div>
        </div>

      </div>
    </div>
  )
}
