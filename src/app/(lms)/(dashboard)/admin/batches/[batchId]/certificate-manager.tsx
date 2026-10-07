"use client"

import * as React from "react"
import { UploadCloud, FileText, CheckCircle2, Loader2, Award, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import jsPDF from "jspdf"
import { v4 as uuidv4 } from "uuid"

// Kita butuh fungsi qr supaya bisa di-render jadi string image atau data URI
// Untuk disederhanakan, kita gunakan library pihak ketiga untuk men-generate QR Code Data URL.
import QRCode from "qrcode"

interface CertificateManagerProps {
  batchId: string
  initialTemplateUrl: string | null
  students: any[]
}

export default function CertificateManager({ batchId, initialTemplateUrl, students }: CertificateManagerProps) {
  const supabase = createClient()
  const [templateUrl, setTemplateUrl] = React.useState<string | null>(initialTemplateUrl)
  const [isUploadingTemplate, setIsUploadingTemplate] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [progress, setProgress] = React.useState({ current: 0, total: 0 })
  const [certificates, setCertificates] = React.useState<any[]>([])
  const [isLoadingCerts, setIsLoadingCerts] = React.useState(true)

  React.useEffect(() => {
    fetchCertificates()
  }, [batchId])

  const fetchCertificates = async () => {
    setIsLoadingCerts(true)
    const { data } = await supabase
      .from('certificates')
      .select('*, enrollments!inner(user_id, users(full_name))')
      .eq('enrollments.batch_id', batchId)
      
    if (data) {
      setCertificates(data)
    }
    setIsLoadingCerts(false)
  }

  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
       toast.error("Template harus berupa file JPG/JPEG")
       return
    }

    setIsUploadingTemplate(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `template_${batchId}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('certificate-templates')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('certificate-templates')
        .getPublicUrl(fileName)

      const publicUrl = publicUrlData.publicUrl

      // Update batch
      const { error: updateError } = await supabase
        .from('batches')
        .update({ certificate_template_url: publicUrl })
        .eq('id', batchId)

      if (updateError) throw updateError

      setTemplateUrl(publicUrl)
      toast.success("Template sertifikat berhasil diunggah!")
    } catch (err: any) {
      toast.error("Gagal mengunggah template: " + err.message)
    } finally {
      setIsUploadingTemplate(false)
    }
  }

  const generateBulkCertificates = async () => {
    if (!templateUrl) {
      toast.error("Silakan unggah template sertifikat terlebih dahulu.")
      return
    }

    // Ambil siswa yang lulus
    const graduatedStudents = students.filter(s => s.status === 'lulus' || s.status === 'selesai' || s.status === 'aktif') // Sesuaikan logika lulus
    if (graduatedStudents.length === 0) {
      toast.error("Tidak ada siswa yang memenuhi syarat untuk diterbitkan sertifikat.")
      return
    }

    if (!confirm(`Terbitkan sertifikat untuk ${graduatedStudents.length} siswa?`)) return

    setIsGenerating(true)
    setProgress({ current: 0, total: graduatedStudents.length })

    try {
      // Pre-load image
      const imgData = await fetchImageAsBase64(templateUrl)

      for (let i = 0; i < graduatedStudents.length; i++) {
        const student = graduatedStudents[i]
        
        // Cek apakah sudah punya sertifikat
        const existing = certificates.find(c => c.enrollments?.user_id === student.user_id)
        if (existing) {
           setProgress(p => ({ ...p, current: i + 1 }))
           continue
        }

        const certNumber = `E17-${batchId.slice(0,4).toUpperCase()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
        const verifyCode = uuidv4()
        const verifyUrl = `${window.location.origin}/verify/${verifyCode}`

        // Generate QR
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 })

        // Create PDF
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        })

        // Draw Template (A4 Landscape: 297 x 210 mm)
        doc.addImage(imgData, 'JPEG', 0, 0, 297, 210)

        // Draw Name (Tengah)
        doc.setFontSize(36)
        doc.setTextColor(0, 0, 0)
        doc.text(student.name, 297 / 2, 110, { align: 'center' })

        // Draw Certificate Number
        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        doc.text(`No: ${certNumber}`, 20, 190)

        // Draw QR Code
        doc.addImage(qrDataUrl, 'PNG', 247, 160, 30, 30)

        // Output as Blob
        const pdfBlob = doc.output('blob')

        // Upload to Storage
        const pdfName = `cert_${verifyCode}.pdf`
        const { error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(pdfName, pdfBlob)

        if (uploadError) throw uploadError

        const { data: pdfUrlData } = supabase.storage
          .from('certificates')
          .getPublicUrl(pdfName)

        // Insert to DB
        const { error: insertError } = await supabase
          .from('certificates')
          .insert({
            enrollment_id: student.id,
            certificate_number: certNumber,
            verification_code: verifyCode,
            pdf_url: pdfUrlData.publicUrl,
            status: 'valid'
          })

        if (insertError) throw insertError

        setProgress(p => ({ ...p, current: i + 1 }))
      }

      toast.success("Sertifikat berhasil diterbitkan!")
      fetchCertificates()
    } catch (err: any) {
      toast.error("Terjadi kesalahan: " + err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper to load image from URL to Base64 (bypassing CORS if same origin or properly configured)
  const fetchImageAsBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  return (
    <div className="space-y-6">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-e17-dark flex items-center">
          <Award className="w-5 h-5 mr-2 text-e17-navy" /> Manajemen Sertifikat
        </h2>
        <p className="text-sm text-slate-500 mt-1">Unggah template (JPG) dan terbitkan sertifikat untuk siswa yang telah lulus.</p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Template Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700">1. Template Sertifikat</h3>
          
          {templateUrl ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden relative group">
              <img src={templateUrl} alt="Template Sertifikat" className="w-full h-auto object-cover border-b border-slate-200" />
              <div className="p-3 bg-white flex justify-between items-center">
                 <span className="text-xs font-bold text-emerald-600 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Template Aktif</span>
                 <label className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded cursor-pointer transition-colors">
                   <input type="file" accept=".jpg,.jpeg" className="hidden" onChange={handleTemplateUpload} disabled={isUploadingTemplate} />
                   {isUploadingTemplate ? 'Mengganti...' : 'Ganti Template'}
                 </label>
              </div>
            </div>
          ) : (
            <label className="w-full border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="file" accept=".jpg,.jpeg" className="hidden" onChange={handleTemplateUpload} disabled={isUploadingTemplate} />
              {isUploadingTemplate ? (
                <>
                  <Loader2 className="h-8 w-8 text-slate-400 mb-3 animate-spin" />
                  <span className="text-sm font-bold text-slate-700">Mengunggah Template...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-10 w-10 text-slate-300 mb-3" />
                  <span className="text-sm font-bold text-slate-700">Unggah Template JPG (Lanskap A4)</span>
                  <span className="text-xs text-slate-500 mt-1">Kosongkan area tengah untuk nama siswa</span>
                </>
              )}
            </label>
          )}
        </div>

        {/* Action Section */}
        <div className="space-y-4">
           <h3 className="font-bold text-slate-700">2. Terbitkan Masal</h3>
           <div className="bg-white border border-slate-200 rounded-lg p-5">
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Sistem akan otomatis membubuhkan nama siswa di tengah template, menambahkan QR Code verifikasi, dan menerbitkan dokumen PDF untuk setiap siswa.
              </p>
              
              {isGenerating ? (
                 <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold text-slate-500">
                     <span>Proses: {progress.current} / {progress.total} Sertifikat</span>
                     <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                     <div className="bg-e17-navy h-2.5 rounded-full transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                   </div>
                 </div>
              ) : (
                 <Button onClick={generateBulkCertificates} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12">
                   <Award className="w-5 h-5 mr-2" /> Terbitkan Sertifikat Sekarang
                 </Button>
              )}
           </div>

           <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mt-6">
              <h4 className="font-bold text-sm text-slate-700 flex items-center mb-3">
                <FileText className="w-4 h-4 mr-2" /> Riwayat Penerbitan
              </h4>
              {isLoadingCerts ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
              ) : certificates.length === 0 ? (
                <p className="text-xs text-slate-500">Belum ada sertifikat yang diterbitkan untuk kelas ini.</p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                   {certificates.map(c => (
                     <div key={c.id} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded text-xs">
                        <div>
                          <p className="font-bold text-slate-700">{c.enrollments?.users?.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.certificate_number}</p>
                        </div>
                        <a href={c.pdf_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">Lihat PDF</a>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
