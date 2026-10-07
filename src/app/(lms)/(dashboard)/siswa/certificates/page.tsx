"use client"

import * as React from "react"
import { Award, Download, CheckCircle2, AlertCircle, Loader2, Link as LinkIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"

export default function SiswaCertificatesPage() {
  const supabase = createClient()
  const [certificates, setCertificates] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setIsLoading(false)
      return
    }

    const userId = userData.user.id

    // 1. Fetch Enrollments
    const { data: enrollmentsData } = await supabase
      .from('enrollments')
      .select('id, batch_id')
      .eq('user_id', userId)

    if (!enrollmentsData || enrollmentsData.length === 0) {
      setIsLoading(false)
      return
    }

    const enrollmentIds = enrollmentsData.map((e: any) => e.id)

    // 2. Fetch Certificates for these enrollments
    const { data: certsData } = await supabase
      .from('certificates')
      .select(`
        id, certificate_number, verification_code, pdf_url, issued_at, status,
        enrollments (
          batch_id,
          batches ( name, programs ( name ) )
        )
      `)
      .in('enrollment_id', enrollmentIds)
      .order('issued_at', { ascending: false })

    if (certsData) {
      setCertificates(certsData.map((c: any) => ({
        id: c.id,
        number: c.certificate_number,
        verifyCode: c.verification_code,
        url: c.pdf_url,
        date: new Date(c.issued_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        batchName: c.enrollments?.batches?.name || 'Batch',
        programName: c.enrollments?.batches?.programs?.name || 'Program',
        status: c.status
      })))
    }
    
    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center py-32"><Loader2 className="h-8 w-8 animate-spin text-e17-navy" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-e17-dark">Sertifikat Kelulusan</h1>
          <p className="text-sm text-slate-500 mt-1">Unduh sertifikat kelulusan Anda sebagai bukti penyelesaian program.</p>
        </div>
      </div>

      <div className="space-y-6 mt-6">
        {certificates.length === 0 ? (
           <div className="card-clean p-12 flex flex-col items-center justify-center text-center">
             <div className="bg-slate-50 p-4 rounded-full mb-4">
               <Award className="w-12 h-12 text-slate-300" />
             </div>
             <h3 className="text-lg font-bold text-slate-700">Belum Ada Sertifikat</h3>
             <p className="text-sm text-slate-500 mt-2 max-w-md">
               Sertifikat akan diterbitkan secara otomatis setelah Anda menyelesaikan semua kewajiban di program dan dinyatakan lulus oleh Mentor.
             </p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="card-clean overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                <div className="bg-e17-navy/5 p-6 border-b border-slate-100 flex items-center justify-center relative">
                  <div className="absolute top-3 right-3">
                     {cert.status === 'valid' ? (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                         <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
                       </span>
                     ) : (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                         <AlertCircle className="w-3 h-3 mr-1" /> Dicabut
                       </span>
                     )}
                  </div>
                  <Award className="w-16 h-16 text-e17-navy opacity-80" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{cert.programName}</span>
                  <h3 className="text-base font-bold text-e17-dark mb-1 leading-snug">Sertifikat Kelulusan</h3>
                  <p className="text-sm text-slate-600 mb-4">{cert.batchName}</p>
                  
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2 mb-6 flex-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">No. Sertifikat</span>
                      <span className="font-bold font-mono text-slate-700">{cert.number}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Tanggal Terbit</span>
                      <span className="font-bold text-slate-700">{cert.date}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <a 
                      href={cert.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 flex justify-center items-center px-3 py-2 bg-e17-navy hover:bg-blue-900 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1.5" /> Unduh PDF
                    </a>
                    <Link
                      href={`/verify/${cert.verifyCode}`}
                      className="flex-1 flex justify-center items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 mr-1.5" /> Verifikasi
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
