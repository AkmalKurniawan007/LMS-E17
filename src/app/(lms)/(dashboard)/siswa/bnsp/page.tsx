import * as React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireCapability } from '@/lib/access-tier.server'
import { ensureBnspProgress } from '@/lib/bnsp.server'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function SiswaBnspPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Guard hak akses capability bnsp_exam
  let enrollmentId: string
  try {
    const result = await requireCapability(user.id, null, 'bnsp_exam')
    if (!result.enrollmentId) {
      throw new Error('UNAUTHORIZED_NO_ACCESS')
    }
    enrollmentId = result.enrollmentId
  } catch {
    redirect('/siswa/courses?locked=bnsp')
  }

  // Pastikan record bnsp_progress telah diinisialisasi
  await ensureBnspProgress(enrollmentId)

  const supabaseAdmin = createAdminClient()

  // 1. Ambil data bnsp_progress
  const { data: progress } = await supabaseAdmin
    .from('bnsp_progress')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .maybeSingle()

  // 2. Ambil informasi enrollment & batch
  const { data: enrollment } = await supabaseAdmin
    .from('enrollments')
    .select('id, batch_id, batches(name, programs(name))')
    .eq('id', enrollmentId)
    .single()

  const batchId = enrollment?.batch_id
  const batchName = (enrollment?.batches as any)?.name ?? 'Batch Aktif'
  const programName = (enrollment?.batches as any)?.programs?.name ?? 'Program Pelatihan'

  // 3. Ambil daftar kuis BNSP pada batch ini
  const { data: bnspQuizzes } = await supabaseAdmin
    .from('quizzes')
    .select('id, title, passing_grade, max_retries, deadline, session_id, sessions!inner(batch_id, title)')
    .eq('is_bnsp', true)
    .eq('sessions.batch_id', batchId)

  // 4. Ambil daftar tugas / portofolio BNSP pada batch ini
  const { data: bnspTasks } = await supabaseAdmin
    .from('tasks')
    .select('id, title, deadline, is_final_project, session_id, sessions!inner(batch_id, title)')
    .eq('is_bnsp', true)
    .eq('sessions.batch_id', batchId)

  // 5. Ambil data submission siswa untuk tugas BNSP
  const taskIds = (bnspTasks || []).map((t: any) => t.id)
  let userSubmissions: any[] = []
  if (taskIds.length > 0) {
    const { data: subs } = await supabaseAdmin
      .from('task_submissions')
      .select('id, task_id, file_url, submitted_at')
      .eq('user_id', user.id)
      .in('task_id', taskIds)
    if (subs) userSubmissions = subs
  }

  // Mapping label & status Ujian Teori
  const theoryStatus = progress?.theory_status || 'not_started'
  const theoryScore = progress?.theory_score !== null && progress?.theory_score !== undefined
    ? Number(progress.theory_score)
    : null
  const isTheoryPassed = theoryStatus === 'passed'

  // Mapping label & status Portofolio
  const portfolioStatus = progress?.portfolio_status || 'not_started'

  // Mapping status Asesor
  const assessorStatus = progress?.assessor_status || 'pending'
  const assessorNotes = progress?.assessor_notes || null

  const firstQuiz = bnspQuizzes && bnspQuizzes.length > 0 ? bnspQuizzes[0] : null

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Utama */}
      <div className="bg-gradient-to-r from-e17-navy via-[#1e2e4a] to-e17-navy text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-amber-300 border border-white/20 mb-3">
            <Award className="w-3.5 h-3.5" /> Sertifikasi Resmi BNSP
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">Portal Sertifikasi Profesi BNSP</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Pantau seluruh progres uji kompetensi Badan Nasional Sertifikasi Profesi (BNSP). Selesaikan ujian teori, lengkapi berkas portofolio APL-01 & APL-02, dan dapatkan sertifikat berstandar nasional.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">Program: <strong>{programName}</strong></span>
            <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">Kelas: <strong>{batchName}</strong></span>
          </div>
        </div>
      </div>

      {/* 3 Tahap Alur Sertifikasi BNSP */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-e17-dark flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-e17-navy" /> Tahapan Sertifikasi BNSP
          </h2>
          <span className="text-xs text-slate-500 font-medium">3 Tahapan Utama</span>
        </div>

        {/* TAHAP 1: Ujian Teori */}
        <div className="card-clean rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                isTheoryPassed 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : theoryStatus === 'failed' 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                1
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tahap 1</span>
                <h3 className="text-base sm:text-lg font-bold text-e17-dark">Ujian Teori BNSP</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ujian pilihan ganda untuk menguji pemahaman standar kompetensi kerja.</p>
              </div>
            </div>

            {/* Badge Status Teori */}
            <div className="flex items-center gap-3 shrink-0">
              {theoryStatus === 'passed' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lulus
                </span>
              )}
              {theoryStatus === 'failed' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <XCircle className="w-3.5 h-3.5" /> Tidak Lulus
                </span>
              )}
              {theoryStatus === 'in_progress' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> Sedang Dikerjakan
                </span>
              )}
              {theoryStatus === 'not_started' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <Clock className="w-3.5 h-3.5" /> Belum Mulai
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-medium text-slate-500">Nilai Teori Anda</p>
              <p className="text-xl font-black text-e17-dark mt-1">
                {theoryScore !== null ? `${theoryScore} / 100` : 'Belum Ada Nilai'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Syarat Kelulusan</p>
              <p className="text-sm font-bold text-slate-700 mt-1">
                Minimal {firstQuiz?.passing_grade ?? 70} dari 100
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Waktu Kelulusan</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                {progress?.theory_passed_at 
                  ? new Date(progress.theory_passed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '-'}
              </p>
            </div>
          </div>

          {/* Tombol Menuju Kuis BNSP (Hanya jika belum lulus) */}
          {!isTheoryPassed && firstQuiz && (
            <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                Kuis: <strong className="text-slate-800">{firstQuiz.title}</strong>
              </div>
              <Link href={`/siswa/quiz/${firstQuiz.id}`}>
                <Button className="bg-e17-navy hover:bg-slate-800 text-white font-bold text-xs">
                  {theoryStatus === 'failed' ? 'Ulangi Ujian Teori' : 'Mulai Ujian Teori'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* TAHAP 2: Dokumen Portofolio APL-01 & APL-02 */}
        <div className="card-clean rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                portfolioStatus === 'accepted'
                  ? 'bg-emerald-100 text-emerald-700'
                  : portfolioStatus === 'revision_needed'
                  ? 'bg-rose-100 text-rose-700'
                  : portfolioStatus === 'under_review' || portfolioStatus === 'uploaded'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                2
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tahap 2</span>
                <h3 className="text-base sm:text-lg font-bold text-e17-dark">Dokumen Portofolio APL-01 & APL-02</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pengumpulan berkas formulir permohonan sertifikasi dan asesmen mandiri serta bukti portofolio kerja.</p>
              </div>
            </div>

            {/* Badge Status Portofolio */}
            <div className="flex items-center gap-3 shrink-0">
              {portfolioStatus === 'accepted' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Diterima
                </span>
              )}
              {portfolioStatus === 'revision_needed' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Perlu Revisi
                </span>
              )}
              {portfolioStatus === 'under_review' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> Sedang Ditinjau
                </span>
              )}
              {portfolioStatus === 'uploaded' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <FileCheck className="w-3.5 h-3.5" /> Diunggah
                </span>
              )}
              {portfolioStatus === 'not_started' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <Clock className="w-3.5 h-3.5" /> Belum Diunggah
                </span>
              )}
            </div>
          </div>

          {/* Daftar Berkas Tugas BNSP */}
          <div className="mt-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Berkas Tugas & Dokumen BNSP:</p>
            {(!bnspTasks || bnspTasks.length === 0) ? (
              <p className="text-xs text-slate-400 italic">Belum ada tugas portofolio BNSP yang ditentukan mentor pada batch ini.</p>
            ) : (
              bnspTasks.map((task: any) => {
                const sub = userSubmissions.find((s: any) => s.task_id === task.id)
                const isSubmitted = !!sub
                const destination = task.is_final_project 
                  ? `/siswa/projects/${task.id}` 
                  : `/siswa/assignments/${task.id}`

                return (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{task.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {task.is_final_project ? 'Proyek Akhir BNSP' : 'Tugas Mandiri BNSP'} • Sesi: {task.sessions?.title || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isSubmitted ? (
                        <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Terkumpul
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 mr-1" /> Belum Terkumpul
                        </span>
                      )}

                      <Link href={destination}>
                        <Button variant="outline" size="sm" className="h-7 text-xs border-slate-200 font-semibold">
                          Buka Halaman <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* TAHAP 3: Keputusan Asesor BNSP */}
        <div className="card-clean rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                assessorStatus === 'kompeten'
                  ? 'bg-emerald-100 text-emerald-700'
                  : assessorStatus === 'belum_kompeten'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                3
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tahap 3</span>
                <h3 className="text-base sm:text-lg font-bold text-e17-dark">Keputusan Asesor BNSP</h3>
                <p className="text-xs text-slate-500 mt-0.5">Penilaian final hasil uji kompetensi dan verifikasi berkas oleh Asesor Lisensi BNSP.</p>
              </div>
            </div>

            {/* Badge Status Asesor */}
            <div className="flex items-center gap-3 shrink-0">
              {assessorStatus === 'kompeten' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Kompeten (K)
                </span>
              )}
              {assessorStatus === 'belum_kompeten' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <XCircle className="w-3.5 h-3.5" /> Belum Kompeten (BK)
                </span>
              )}
              {assessorStatus === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> Menunggu Asesmen
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Catatan Asesor:</p>
            {assessorNotes ? (
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {assessorNotes}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Belum ada catatan dari asesor. Keputusan akan diterbitkan setelah verifikasi berkas dan wawancara asesmen selesai.
              </p>
            )}

            {progress?.assessed_at && (
              <p className="text-[11px] text-slate-400 pt-1">
                Waktu Asesmen: {new Date(progress.assessed_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
