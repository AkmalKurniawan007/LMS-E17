"use client"

import * as React from "react"
import Link from "next/link"
import { use } from "react"
import { Award, CheckCircle, ExternalLink, Copy, Check, BookOpen, Calendar, Star, User, Loader2, ShieldAlert } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

const MOCK_PROFILES: Record<string, {
  name: string; tagline: string; bio: string; avatarInitial: string; joinYear: string
  certificates: { id: string; program: string; batch: string; date: string; score: number; certNumber: string }[]
  achievements: string[]
  portfolio_status: boolean
}> = {
  "rina-wijaya": {
    name: "Rina Wijaya",
    tagline: "UI/UX Designer & Frontend Developer",
    bio: "Lulusan program UI/UX Design Masterclass E17 Course. Bersemangat menciptakan pengalaman pengguna yang intuitif dan estetik.",
    avatarInitial: "RW",
    joinYear: "2026",
    portfolio_status: true,
    certificates: [
      { id: "E17-UIUX-BATCH02-VIII-2026-0001", program: "UI/UX Design Masterclass", batch: "Batch 2", date: "01 Agu 2026", score: 92, certNumber: "E17/UIUX/BATCH-02/VIII/2026/0001" },
    ],
    achievements: ["Nilai Tertinggi Angkatan Batch 2", "Kehadiran 100%", "Proyek Akhir Terpilih sebagai Best Project"],
  },
}

export default function PublicPortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const supabase = createClient()
  const [profile, setProfile] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, full_name, tagline, bio, created_at, portfolio_status')
        .eq('username', username)
        .single()
        
      if (userError || !user) {
        // Fallback to MOCK for testing
        const mockProfile = MOCK_PROFILES[username]
        if (mockProfile) {
          setProfile(mockProfile)
        } else {
          setProfile(null)
        }
        setIsLoading(false)
        return
      }
      
      if (user.portfolio_status === false) {
        setProfile({ ...user, isSuspended: true })
        setIsLoading(false)
        return
      }
      
      const { data: certs } = await supabase
        .from('certificates')
        .select(`
          id, 
          certificate_number, 
          verification_code,
          created_at,
          final_score,
          manual_image_url,
          enrollments!inner(user_id, batches(name, programs(name)))
        `)
        .eq('status', 'valid')
        .eq('enrollments.user_id', user.id)

      const certificates = (certs || []).map(cert => ({
        id: cert.verification_code || cert.id,
        program: (cert.enrollments as any)?.batches?.programs?.name || 'Program',
        batch: (cert.enrollments as any)?.batches?.name || 'Batch',
        date: new Date(cert.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        score: cert.final_score || 100,
        certNumber: cert.certificate_number,
        manualImageUrl: cert.manual_image_url
      }))

      setProfile({
        name: user.full_name,
        tagline: user.tagline || 'Siswa E17 Course',
        bio: user.bio || 'Portofolio publik siswa E17 Course.',
        avatarInitial: user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
        joinYear: new Date(user.created_at).getFullYear().toString(),
        certificates: certificates,
        achievements: [`Telah menyelesaikan ${certificates.length} program pelatihan di E17 Course`],
        portfolio_status: true
      })
      setIsLoading(false)
    }
    
    fetchProfile()
  }, [username])

  const handleCopyUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-e17-navy" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 font-sans">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center max-w-sm w-full">
          <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <User className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-e17-dark mb-2">Profil Tidak Ditemukan</h1>
          <p className="text-sm text-slate-500">Username yang Anda cari tidak tersedia di E17 Course.</p>
          <Link href="/login" className="mt-6 text-xs text-blue-700 hover:underline font-medium">Masuk ke E17 Course</Link>
        </div>
      </div>
    )
  }

  if (profile.isSuspended || profile.portfolio_status === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 font-sans">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-12 flex flex-col items-center text-center max-w-sm w-full">
          <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Portofolio Ditangguhkan</h1>
          <p className="text-sm text-slate-500 mb-6">Halaman portofolio ini sementara dinonaktifkan oleh Administrator karena melanggar pedoman komunitas E17 Course.</p>
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">Kembali ke Beranda</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 font-sans">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-e17-navy rounded-lg flex items-center justify-center shadow-sm">
              <Award className="h-5 w-5 text-yellow-400" />
            </div>
            <span className="text-base font-black text-e17-dark tracking-tight">E17 Course</span>
          </Link>
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-full border border-slate-200 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Tersalin!" : "Bagikan Profil"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Profile Card Hero */}
        <div className="bg-e17-navy rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-yellow-400 flex items-center justify-center text-3xl font-black text-e17-dark shrink-0 shadow-lg border-4 border-white/20">
              {profile.avatarInitial}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-black">{profile.name}</h1>
                <span className="bg-yellow-400 text-e17-dark text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Alumni</span>
              </div>
              <p className="text-slate-300 font-medium mb-2">{profile.tagline}</p>
              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">{profile.bio}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Kiri: Sertifikat */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-e17-dark flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" /> Sertifikat Kelulusan
            </h2>
            {profile.certificates.map((cert: any) => (
              <div key={cert.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="bg-slate-900 px-6 py-5 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl translate-x-10 -translate-y-10 pointer-events-none" />
                  <Award className="h-10 w-10 text-yellow-400 shrink-0" />
                  <div>
                    <h3 className="text-white font-black text-base">{cert.program}</h3>
                    <p className="text-slate-400 text-sm">{cert.batch}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle className="h-3 w-3" /> Valid
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Tanggal Terbit</p>
                      <p className="font-semibold text-e17-dark">{cert.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> Nilai Akhir</p>
                      <p className="text-2xl font-black text-emerald-600">{cert.score}<span className="text-xs font-normal text-slate-400"> /100</span></p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 font-medium mb-1">Nomor Sertifikat</p>
                      <p className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1.5 rounded border border-slate-200">{cert.certNumber}</p>
                    </div>
                  </div>
                  <Link
                    href={`/verify/${cert.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all"
                  >
                    <ExternalLink className="h-4 w-4" /> Verifikasi Keaslian Sertifikat
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Kanan: Pencapaian */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-e17-dark flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" /> Pencapaian
            </h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              {profile.achievements.map((ach: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-amber-50 rounded-full flex items-center justify-center shrink-0 border border-amber-100 mt-0.5">
                    <Star className="h-3 w-3 text-amber-500" />
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-tight">{ach}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" /> Info Program
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bergabung</span>
                  <span className="font-semibold text-e17-dark">{profile.joinYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sertifikat</span>
                  <span className="font-semibold text-emerald-600">{profile.certificates.length} Sertifikat</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center mt-10">
        <p className="text-xs text-slate-400">Portofolio publik E17 Course — dapat diakses tanpa login</p>
      </footer>
    </div>
  )
}