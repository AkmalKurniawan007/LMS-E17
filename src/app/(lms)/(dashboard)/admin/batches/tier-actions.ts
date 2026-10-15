'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { getAuthenticatedUserWithRole } from '@/lib/auth.server'
import { revalidatePath } from 'next/cache'

/**
 * Server action untuk Admin mengubah tier siswa pada suatu enrollment.
 * Sesuai spesifikasi T6:
 * - Verifikasi role admin di server via helper getAuthenticatedUserWithRole.
 * - newTier hanya 'expert' | 'complete' | 'bootcamp'.
 * - Update enrollments.tier.
 * - Tulis audit_logs (action_type: 'tier_change', entity_type: 'enrollment', entity_id = enrollmentId, old_values: { tier }, new_values: { tier }).
 * - Progress, absensi, dan nilai tidak disentuh.
 */
export async function updateStudentTier(
  enrollmentId: string,
  newTier: 'expert' | 'complete' | 'bootcamp'
) {
  // 1. Validasi newTier
  const validTiers = ['expert', 'complete', 'bootcamp'] as const
  if (!validTiers.includes(newTier)) {
    return {
      success: false,
      error: 'Tier baru tidak valid. Hanya expert, complete, atau bootcamp yang diperbolehkan.'
    }
  }

  // 2. Verifikasi user dan role admin di server via helper tunggal
  const { user, isAdmin } = await getAuthenticatedUserWithRole()
  if (!user) {
    return { success: false, error: 'UNAUTHORIZED: Silakan login terlebih dahulu.' }
  }

  if (!isAdmin) {
    return { success: false, error: 'FORBIDDEN: Hanya admin yang dapat mengubah tier siswa.' }
  }

  // 3. Ambil data enrollment yang ada
  const supabaseAdmin = createAdminClient()
  const { data: enrollment, error: fetchError } = await supabaseAdmin
    .from('enrollments')
    .select('id, tier, batch_id, user_id')
    .eq('id', enrollmentId)
    .single()

  if (fetchError || !enrollment) {
    return { success: false, error: 'Data pendaftaran siswa tidak ditemukan.' }
  }

  const oldTier = enrollment.tier || 'bootcamp'

  if (oldTier === newTier) {
    return {
      success: true,
      message: 'Tier sudah sesuai, tidak ada perubahan.',
      oldTier,
      newTier
    }
  }

  // 4. Update enrollments.tier (progress, absensi, nilai tidak disentuh)
  const { error: updateError } = await supabaseAdmin
    .from('enrollments')
    .update({ tier: newTier })
    .eq('id', enrollmentId)

  if (updateError) {
    console.error('[updateStudentTier] Error updating enrollment tier:', updateError)
    return { success: false, error: `Gagal memperbarui tier: ${updateError.message}` }
  }

  // 5. Tulis audit_logs
  const { error: auditError } = await supabaseAdmin
    .from('audit_logs')
    .insert({
      user_id: user.id,
      action_type: 'tier_change',
      entity_type: 'enrollment',
      entity_id: enrollmentId,
      old_values: { tier: oldTier },
      new_values: { tier: newTier }
    })

  if (auditError) {
    console.error('[updateStudentTier] Error writing audit_logs:', auditError)
  }

  if (enrollment.batch_id) {
    revalidatePath(`/admin/batches/${enrollment.batch_id}`)
  }
  revalidatePath('/admin/batches')

  return {
    success: true,
    oldTier,
    newTier
  }
}
