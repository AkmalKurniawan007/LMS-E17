'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireCapability } from '@/lib/access-tier.server'
import { ensureBnspProgress } from '@/lib/bnsp.server'

/**
 * Server action submit tugas / portofolio BNSP:
 * - Guard requireCapability('bnsp_exam')
 * - Insert ke task_submissions
 * - Set bnsp_progress.portfolio_status = 'uploaded' dan portfolio_uploaded_at = now()
 */
export async function submitBnspTask(
  taskId: string,
  fileUrl: string,
  submissionType: 'file_upload' | 'text' = 'file_upload'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Anda harus login terlebih dahulu.')
  }

  const supabaseAdmin = createAdminClient()

  // Ambil task untuk memperoleh batch_id
  const { data: task, error: taskError } = await supabaseAdmin
    .from('tasks')
    .select('id, is_bnsp, session_id, sessions(batch_id)')
    .eq('id', taskId)
    .single()

  if (taskError || !task) {
    throw new Error('Tugas tidak ditemukan.')
  }

  const batchId = (task.sessions as any)?.batch_id ?? null
  const { enrollmentId } = await requireCapability(user.id, batchId, 'bnsp_exam')

  if (!enrollmentId) {
    throw new Error('Enrollment aktif tidak ditemukan untuk tugas ini.')
  }

  // 1. Insert ke task_submissions
  const { data: submission, error: subError } = await supabaseAdmin
    .from('task_submissions')
    .insert({
      task_id: taskId,
      user_id: user.id,
      file_url: fileUrl,
      submission_type: submissionType,
    })
    .select('id')
    .single()

  if (subError) {
    throw new Error(`Gagal menyimpan pengumpulan tugas: ${subError.message}`)
  }

  // 2. Pastikan bnsp_progress ada dan update status portofolio
  await ensureBnspProgress(enrollmentId)

  const now = new Date().toISOString()
  const { error: updateProgressErr } = await supabaseAdmin
    .from('bnsp_progress')
    .update({
      portfolio_status: 'uploaded',
      portfolio_uploaded_at: now,
      updated_at: now,
    })
    .eq('enrollment_id', enrollmentId)

  if (updateProgressErr) {
    // Cleanup submission jika gagal update bnsp_progress
    if (submission?.id) {
      await supabaseAdmin
        .from('task_submissions')
        .delete()
        .eq('id', submission.id)
    }
    throw new Error(`Gagal memperbarui status portofolio BNSP: ${updateProgressErr.message}`)
  }

  return {
    success: true,
    submissionId: submission?.id,
  }
}
