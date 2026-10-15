'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { getAuthenticatedUserWithRole } from '@/lib/auth.server'
import { ensureBnspProgress } from '@/lib/bnsp.server'
import { hasCapability, Tier } from '@/lib/access-tier'
import { revalidatePath } from 'next/cache'

export interface AssessBnspStudentPayload {
  enrollmentId: string
  portfolioStatus: 'under_review' | 'revision_needed' | 'accepted'
  assessorStatus: 'kompeten' | 'belum_kompeten'
  assessorNotes?: string
}

export interface BnspBatchOption {
  id: string
  name: string
}

export interface BnspTaskSubmissionDetail {
  taskId: string
  taskTitle: string
  fileUrl: string | null
  submittedAt: string | null
}

export interface BnspStudentDetail {
  enrollmentId: string
  userId: string
  name: string
  email: string
  tier: 'complete' | 'bootcamp'
  theoryStatus: string
  theoryScore: number | null
  portfolioStatus: string
  assessorStatus: string
  assessorNotes: string | null
  assessedAt: string | null
  assessedBy: string | null
  submissions: BnspTaskSubmissionDetail[]
}

/**
 * Server action untuk penilaian BNSP oleh Admin atau Mentor batch tersebut.
 * Verifikasi login + role di server SEBELUM query:
 * - Admin/Super Admin boleh menilai semua batch.
 * - Mentor hanya boleh menilai batch miliknya (terdaftar di batch_mentors).
 * - Siswa ditolak.
 */
export async function assessBnspStudent(payload: AssessBnspStudentPayload) {
  const { enrollmentId, portfolioStatus, assessorStatus, assessorNotes } = payload

  // 1. Validasi input status
  const validPortfolioStatuses = ['under_review', 'revision_needed', 'accepted'] as const
  const validAssessorStatuses = ['kompeten', 'belum_kompeten'] as const

  if (!validPortfolioStatuses.includes(portfolioStatus)) {
    return { success: false, error: 'Status portofolio tidak valid.' }
  }

  if (!validAssessorStatuses.includes(assessorStatus)) {
    return { success: false, error: 'Status keputusan asesor tidak valid.' }
  }

  // 2. Verifikasi login + role di server SEBELUM query apa pun
  const { user, isAdmin, isMentor } = await getAuthenticatedUserWithRole()
  if (!user) {
    return { success: false, error: 'UNAUTHORIZED: Silakan masuk terlebih dahulu.' }
  }

  if (!isAdmin && !isMentor) {
    return { success: false, error: 'FORBIDDEN: Hanya admin atau mentor yang memiliki akses penilaian.' }
  }

  const supabaseAdmin = createAdminClient()

  // 3. Ambil data enrollment siswa
  const { data: enrollment, error: enrollmentError } = await supabaseAdmin
    .from('enrollments')
    .select(`
      id,
      batch_id,
      user_id,
      enrollment_source,
      checkout_order_id,
      checkout_orders ( tier_type )
    `)
    .eq('id', enrollmentId)
    .single()

  if (enrollmentError || !enrollment) {
    return { success: false, error: 'Enrollment siswa tidak ditemukan.' }
  }

  const co = Array.isArray(enrollment.checkout_orders)
    ? enrollment.checkout_orders[0]
    : enrollment.checkout_orders
  const studentTier: Tier = (co?.tier_type as Tier) || 'bootcamp'

  // 3b. Tolak jika siswa tidak memiliki kapabilitas bnsp_exam (Paket 2 'expert' tidak berhak)
  if (!hasCapability(studentTier, 'bnsp_exam')) {
    return { success: false, error: 'FORBIDDEN: Siswa dengan tier ini tidak memenuhi syarat penilaian BNSP.' }
  }

  // 4. Otorisasi batch: jika bukan admin (berarti mentor), pastikan terdaftar di batch_mentors
  if (!isAdmin) {
    const { data: mentorLink, error: mentorLinkError } = await supabaseAdmin
      .from('batch_mentors')
      .select('batch_id')
      .eq('batch_id', enrollment.batch_id)
      .eq('mentor_id', user.id)
      .maybeSingle()

    if (mentorLinkError || !mentorLink) {
      return { success: false, error: 'FORBIDDEN: Anda bukan mentor untuk batch siswa ini.' }
    }
  }

  // 5. Pastikan record bnsp_progress telah diinisialisasi
  await ensureBnspProgress(enrollmentId)

  // 6. Update status penilaian BNSP dengan admin client
  const nowIso = new Date().toISOString()
  const { error: updateError } = await supabaseAdmin
    .from('bnsp_progress')
    .update({
      portfolio_status: portfolioStatus,
      assessor_status: assessorStatus,
      assessor_notes: assessorNotes || '',
      assessed_at: nowIso,
      assessed_by: user.id,
      updated_at: nowIso,
    })
    .eq('enrollment_id', enrollmentId)

  if (updateError) {
    console.error('[assessBnspStudent] Gagal mengupdate bnsp_progress:', updateError)
    return { success: false, error: `Gagal menyimpan penilaian BNSP: ${updateError.message}` }
  }

  revalidatePath('/admin/bnsp')
  revalidatePath('/mentor/bnsp')

  return { success: true }
}

/**
 * Server action untuk mengambil data siswa BNSP pada batch tertentu.
 * Dipanggil dari client component saat batch dipilih.
 * Verifikasi login + role di server SEBELUM query apa pun:
 * - Admin boleh mengakses batch mana pun.
 * - Mentor hanya boleh mengakses batch jika terdaftar di batch_mentors untuk batchId itu.
 * - Siswa TIDAK boleh memanggilnya.
 */
export async function getBnspStudentsForBatch(batchId: string): Promise<BnspStudentDetail[]> {
  if (!batchId) return []

  // 1. Verifikasi login + role di server SEBELUM query apa pun
  const { user, isAdmin, isMentor } = await getAuthenticatedUserWithRole()
  if (!user) {
    throw new Error('UNAUTHORIZED: Silakan masuk terlebih dahulu.')
  }

  if (!isAdmin && !isMentor) {
    throw new Error('FORBIDDEN: Siswa tidak diizinkan mengakses data penilaian BNSP.')
  }

  const supabaseAdmin = createAdminClient()

  // 2. Otorisasi batch: jika bukan admin, pastikan mentor terdaftar di batch_mentors untuk batchId ini
  if (!isAdmin) {
    const { data: mentorLink, error: mentorLinkError } = await supabaseAdmin
      .from('batch_mentors')
      .select('batch_id')
      .eq('batch_id', batchId)
      .eq('mentor_id', user.id)
      .maybeSingle()

    if (mentorLinkError || !mentorLink) {
      throw new Error('FORBIDDEN: Anda bukan mentor yang terdaftar untuk batch ini.')
    }
  }

  // 3. Ambil semua sesi di batch ini
  const { data: sessions, error: sessionError } = await supabaseAdmin
    .from('sessions')
    .select('id')
    .eq('batch_id', batchId)

  if (sessionError) {
    console.error('[getBnspStudentsForBatch] Error fetching sessions:', sessionError)
    return []
  }

  const sessionIds = sessions?.map(s => s.id) || []

  // 4. Ambil tugas BNSP (is_bnsp = true) di batch ini
  let bnspTasks: { id: string; title: string }[] = []
  if (sessionIds.length > 0) {
    const { data: tasksData, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('id, title')
      .in('session_id', sessionIds)
      .eq('is_bnsp', true)

    if (taskError) {
      console.error('[getBnspStudentsForBatch] Error fetching bnsp tasks:', taskError)
    } else if (tasksData) {
      bnspTasks = tasksData
    }
  }

  // 5. Ambil siswa di batch ini yang memenuhi syarat BNSP (Paket 3 'complete' atau inputan admin 'bootcamp')
  const { data: rawEnrollments, error: enrollError } = await supabaseAdmin
    .from('enrollments')
    .select(`
      id,
      user_id,
      enrollment_source,
      checkout_order_id,
      checkout_orders ( tier_type ),
      users ( id, full_name, email )
    `)
    .eq('batch_id', batchId)
    .eq('status', 'aktif')

  if (enrollError) {
    console.error('[getBnspStudentsForBatch] Error fetching enrollments:', enrollError)
    return []
  }

  // Filter siswa yang berhak:
  // - Siswa checkout: hanya Paket 3 ('complete') atau 'bootcamp' (Paket 2 'expert' tidak masuk BNSP)
  // - Siswa input manual Admin: otomatis 'bootcamp'
  const enrollments = (rawEnrollments || [])
    .filter((enr: any) => {
      const co = Array.isArray(enr.checkout_orders) ? enr.checkout_orders[0] : enr.checkout_orders
      if (co?.tier_type) {
        return co.tier_type === 'complete' || co.tier_type === 'bootcamp'
      }
      return true // manual admin / bulk import otomatis bootcamp
    })
    .map((enr: any) => {
      const co = Array.isArray(enr.checkout_orders) ? enr.checkout_orders[0] : enr.checkout_orders
      return {
        ...enr,
        tier: (co?.tier_type as Tier) || 'bootcamp'
      }
    })

  if (enrollments.length === 0) {
    return []
  }

  const enrollmentIds = enrollments.map(e => e.id)
  const userIds = enrollments.map(e => e.user_id)

  // 6. Ambil data bnsp_progress
  const { data: progressList, error: progError } = await supabaseAdmin
    .from('bnsp_progress')
    .select('*')
    .in('enrollment_id', enrollmentIds)

  if (progError) {
    console.error('[getBnspStudentsForBatch] Error fetching bnsp_progress:', progError)
  }

  const progressMap = new Map<string, any>()
  progressList?.forEach(p => progressMap.set(p.enrollment_id, p))

  // 7. Ambil data submissions tugas BNSP untuk siswa-siswa ini
  let submissionsList: any[] = []
  if (bnspTasks.length > 0 && userIds.length > 0) {
    const taskIds = bnspTasks.map(t => t.id)
    const { data: subs, error: subsError } = await supabaseAdmin
      .from('task_submissions')
      .select('task_id, user_id, file_url, submitted_at')
      .in('task_id', taskIds)
      .in('user_id', userIds)

    if (subsError) {
      console.error('[getBnspStudentsForBatch] Error fetching task_submissions:', subsError)
    } else if (subs) {
      submissionsList = subs
    }
  }

  // 8. Susun data gabungan per siswa
  return enrollments.map((enr: any) => {
    const prog = progressMap.get(enr.id) || {}
    const userSubs = submissionsList.filter(s => s.user_id === enr.user_id)
    
    const taskSubmissions: BnspTaskSubmissionDetail[] = bnspTasks.map(task => {
      const sub = userSubs.find(s => s.task_id === task.id)
      return {
        taskId: task.id,
        taskTitle: task.title,
        fileUrl: sub?.file_url || null,
        submittedAt: sub?.submitted_at ? new Date(sub.submitted_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : null,
      }
    })

    return {
      enrollmentId: enr.id,
      userId: enr.user_id,
      name: enr.users?.full_name || 'Siswa',
      email: enr.users?.email || '-',
      tier: enr.tier as 'complete' | 'bootcamp',
      theoryStatus: prog.theory_status || 'not_started',
      theoryScore: prog.theory_score ?? null,
      portfolioStatus: prog.portfolio_status || 'not_submitted',
      assessorStatus: prog.assessor_status || 'pending',
      assessorNotes: prog.assessor_notes || null,
      assessedAt: prog.assessed_at ? new Date(prog.assessed_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : null,
      assessedBy: prog.assessed_by || null,
      submissions: taskSubmissions,
    }
  })
}
