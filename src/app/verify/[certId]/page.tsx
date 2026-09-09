"use client"

import * as React from "react"
import Link from "next/link"
import { use } from "react"
import { ShieldCheck, ShieldOff, AlertTriangle, Award, Calendar, Hash, BookOpen, Star, ExternalLink, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

type VerifyState = "valid" | "revoked" | "not_found"

const MOCK_CERTIFICATES: Record<string, {
  state: VerifyState; studentName: string; program: string; batch: string
  issuedDate: string; score: number; certNumber: string; revokedReason?: string
}> = {
  "E17-UIUX-BATCH02-VIII-2026-0001": {
    state: "valid", studentName: "Rina Wijaya", program: "UI/UX Design Masterclass",
    batch: "Batch 2 — 2026", issuedDate: "01 Agustus 2026", score: 92,
    certNumber: "E17/UIUX/BATCH-02/VIII/2026/0001",
  },
  "V-A8X9K2": {
    state: "valid", studentName: "Budi Santoso", program: "Full-Stack Web Development",
    batch: "Batch 1 — 2026", issuedDate: "04 September 2026", score: 95,
    certNumber: "E17/FSWD/BATCH-01/IX/2026/0099",
  },
  "E17-FSWD-BATCH01-I-2026-0042": {
    state: "revoked", studentName: "Budi Santoso", program: "Full-Stack Web Development",
    batch: "Batch 1 — 2026", issuedDate: "15 Januari 2026", score: 88,
    certNumber: "E17/FSWD/BATCH-01/I/2026/0042",
    revokedReason: "Terdapat kekeliruan data nama pada sertifikat. Sertifikat baru akan diterbitkan ulang.",
  },
}

function DetailRow({ icon, label, value, bold, mono }: {
  icon: React.ReactNode; label: string; value: string; bold?: boolean; mono?: boolean
}) {
  return (
    <div className="py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium shrink-0">{icon} {label}</div>
      <span className={`text-sm text-right ${bold ? "font-bold text-e17-dark" : "text-slate-700"} ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  )
}

export default function VerifyCertificatePage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = use(params)
  const supabase = createClient()
  const [cert, setCert] = React.useState<any>(null)
  const [state, setState] = React.useState<VerifyState | "loading">("loading")

  React.useEffect(() => {
    const fetchCert = async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          certificate_number, 
          verification_code, 
          status, 
          created_at, 
          revoked_reason,
          enrollments(users(full_name), batches(name, programs(name)))
        `)
        .or(`verification_code.eq.${certId},certificate_number.eq.${certId}`)
        .single()
        
      if (!error && data) {
        setCert({
          state: data.status,
          studentName: (data.enrollments as any)?.users?.full_name || 'Peserta',
          program: (data.enrollments as any)?.batches?.programs?.name || 'Program Pelatihan',
          batch: (data.enrollments as any)?.batches?.name || 'Batch',
          issuedDate: new Date(data.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
          score: 100, // Or fetch from enrollments if available
          certNumber: data.certificate_number,
          revokedReason: data.revoked_reason
        })
        setState(data.status as VerifyState)
      } else {
        // Fallback to mock
        const mockCert = MOCK_CERTIFICATES[certId]
        if (mockCert) {
          setCert(mockCert)
          setState(mockCert.state)
        } else {
          setState("not_found")
        }
      }
    }
    
    fetchCert()
  }, [certId])

  if (state === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-e17-navy mb-4" />
        <p className="text-slate-500 font-medium">Memverifikasi Sertifikat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-e17-navy rounded-lg flex items-center justify-center shadow-sm">
              <Award className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <span className="text-base font-black text-e17-dark tracking-tight">E17 Course</span>
              <p className="text-[10px] text-slate-500 leading-none font-medium">Learning Management System</p>
            </div>
          </Link>
          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">Halaman Verifikasi Publik</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-6">

          {state === "valid" && cert && (
            <>
              <div className="bg-emerald-600 text-white rounded-2xl p-6 flex items-center gap-5 shadow-lg">
                <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-9 w-9 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">Status Verifikasi</p>
                  <h1 className="text-2xl font-black">Sertifikat Valid dan Sah</h1>
                  <p className="text-sm opacity-80 mt-1">Sertifikat ini diterbitkan secara resmi oleh E17 Course dan belum pernah dicabut.</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-900 p-8 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl -translate-y-12 translate-x-12 pointer-events-none" />
                  <Award className="h-14 w-14 text-yellow-400 mb-3" />
                  <h2 className="text-white text-xl font-black mb-1">{cert.program}</h2>
                  <p className="text-slate-300 text-sm">{cert.batch}</p>
                </div>
                <div className="p-6 divide-y divide-slate-100">
                  <DetailRow icon={<Star className="h-4 w-4 text-amber-500" />} label="Nama Penerima" value={cert.studentName} bold />
                  <DetailRow icon={<Hash className="h-4 w-4 text-blue-800" />} label="Nomor Sertifikat" value={cert.certNumber} mono />
                  <DetailRow icon={<BookOpen className="h-4 w-4 text-blue-800" />} label="Program" value={cert.program} />
                  <DetailRow icon={<Calendar className="h-4 w-4 text-blue-800" />} label="Tanggal Terbit" value={cert.issuedDate} />
                  <div className="py-4 flex items-center justify-between">
                    <span className="text-sm text-slate-500 font-medium">Nilai Akhir</span>
                    <span className="text-2xl font-black text-emerald-600">{cert.score} <span className="text-sm font-normal text-slate-400">/ 100</span></span>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400">Diverifikasi oleh sistem E17 Course</p>
            </>
          )}

          {state === "revoked" && cert && (
            <>
              <div className="bg-red-600 text-white rounded-2xl p-6 flex items-center gap-5 shadow-lg">
                <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <ShieldOff className="h-9 w-9 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">Status Verifikasi</p>
                  <h1 className="text-2xl font-black">Sertifikat Telah Dicabut</h1>
                  <p className="text-sm opacity-80 mt-1">Sertifikat ini tidak lagi berlaku dan tidak dapat digunakan sebagai bukti kompetensi yang sah.</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="bg-slate-900 p-8 flex flex-col items-center text-center relative">
                  <Award className="h-14 w-14 text-slate-500 mb-3 opacity-30" />
                  <h2 className="text-white text-xl font-black mb-1 opacity-30">{cert.program}</h2>
                  <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                    <span className="text-3xl font-black text-red-300 rotate-[-12deg] tracking-widest border-4 border-red-300 px-6 py-2 rounded">DICABUT</span>
                  </div>
                </div>
                <div className="p-6 divide-y divide-slate-100">
                  <DetailRow icon={<Star className="h-4 w-4 text-slate-400" />} label="Nama Penerima" value={cert.studentName} bold />
                  <DetailRow icon={<Hash className="h-4 w-4 text-slate-400" />} label="Nomor Sertifikat" value={cert.certNumber} mono />
                  <DetailRow icon={<BookOpen className="h-4 w-4 text-slate-400" />} label="Program" value={cert.program} />
                </div>
                {cert.revokedReason && (
                  <div className="px-6 pb-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Alasan Pencabutan</p>
                      <p className="text-sm text-red-800">{cert.revokedReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {state === "not_found" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10 text-slate-400" />
              </div>
              <h1 className="text-xl font-bold text-e17-dark mb-2">Sertifikat Tidak Ditemukan</h1>
              <p className="text-sm text-slate-500 mb-2 max-w-sm leading-relaxed">
                Nomor sertifikat tidak ditemukan dalam database E17 Course.
              </p>
              <p className="text-xs text-slate-400">Periksa kembali nomor sertifikat atau hubungi penyelenggara E17 Course.</p>
            </div>
          )}

          <div className="text-center">
            <Link href="/login" className="text-xs text-blue-700 hover:underline font-medium inline-flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> Masuk ke E17 Course
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center">
        <p className="text-xs text-slate-400">Hak Cipta 2026 E17 Course. Halaman ini dapat diakses publik tanpa login.</p>
      </footer>
    </div>
  )
}