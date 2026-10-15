import 'server-only'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { getAuthenticatedUserWithRole } from './auth.server'

export interface BnspBatchOption {
  id: string
  name: string
}

/**
 * Helper server-only untuk memastikan record bnsp_progress ada untuk enrollment tertentu.
 * DILARANG diekspor dari file 'use server' demi keamanan server action.
 */
export async function ensureBnspProgress(enrollmentId: string): Promise<string | null> {
  const supabaseAdmin = createAdminClient()

  // Cek apakah sudah ada record progress untuk enrollment ini
  const { data: existing } = await supabaseAdmin
    .from('bnsp_progress')
    .select('id')
    .eq('enrollment_id', enrollmentId)
    .maybeSingle()

  if (existing) {
    return existing.id
  }

  // Jika belum ada, buat baru
  const { data: inserted, error } = await supabaseAdmin
    .from('bnsp_progress')
    .insert({
      enrollment_id: enrollmentId,
    })
    .select('id')
    .maybeSingle()

  // Abaikan error duplicate key jika terjadi race condition (PostgreSQL code 23505)
  if (error && error.code !== '23505') {
    console.error('Error in ensureBnspProgress:', error)
    throw new Error(`Gagal menginisialisasi progress BNSP: ${error.message}`)
  }

  return inserted?.id ?? null
}

/**
 * Fetch daftar batch untuk Admin (Server-only query).
 * Memverifikasi login + role admin SEBELUM query.
 */
export async function getAdminBnspBatches(): Promise<BnspBatchOption[]> {
  const { user, isAdmin } = await getAuthenticatedUserWithRole()
  if (!user || !isAdmin) {
    throw new Error('FORBIDDEN_NOT_ADMIN: Hanya admin yang dapat mengakses daftar batch penilaian BNSP.')
  }

  const supabase = await createClient()
  const { data: batches, error } = await supabase
    .from('batches')
    .select('id, name')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getAdminBnspBatches] Error fetching batches:', error)
    return []
  }

  return batches || []
}

/**
 * Fetch daftar batch untuk Mentor (Server-only query).
 * Memverifikasi login + role mentor SEBELUM query, hanya batch miliknya via batch_mentors.
 */
export async function getMentorBnspBatches(): Promise<BnspBatchOption[]> {
  const { user, isMentor } = await getAuthenticatedUserWithRole()
  if (!user || !isMentor) {
    throw new Error('FORBIDDEN_NOT_MENTOR: Hanya mentor yang dapat mengakses batch penilaian BNSP.')
  }

  const supabase = await createClient()
  const { data: mentorBatches, error } = await supabase
    .from('batch_mentors')
    .select(`
      batch_id,
      batches ( id, name, created_at )
    `)
    .eq('mentor_id', user.id)

  if (error) {
    console.error('[getMentorBnspBatches] Error fetching mentor batches:', error)
    return []
  }

  if (!mentorBatches) return []

  return mentorBatches
    .map((mb: any) => mb.batches)
    .filter(Boolean)
    .map((b: any) => ({ id: b.id, name: b.name }))
}
