import 'server-only'

import { createAdminClient } from '@/utils/supabase/admin'
import { Tier, Capability, TIER_RANK, hasCapability, getHighestTier } from './access-tier'

export interface RequireCapabilityResult {
  tier: Tier
  enrollmentId: string | null
}

/**
 * Server-side guard untuk Server Actions / Route Handlers.
 * Memeriksa hak akses kapabilitas berdasarkan enrollment aktif atau video_access user.
 *
 * Perilaku:
 * - Jika batchId ada: pakai tier dari enrollment aktif pada batch itu SAJA (K5).
 * - Jika batchId null: pakai tier dengan rank tertinggi dari semua enrollment aktif.
 * - Jika tidak ada enrollment aktif: cek video_access. Ada -> tier 'junior'. Tidak ada -> tolak (unauthorized).
 * - Definisi "enrollment aktif" sama dengan (lms)/layout.tsx: status = 'aktif'.
 * - Jika hasCapability false -> throw Error("FORBIDDEN_TIER_ACCESS").
 * - Mengembalikan { tier, enrollmentId }.
 */
export async function requireCapability(
  userId: string,
  batchId: string | null,
  cap: Capability
): Promise<RequireCapabilityResult> {
  if (!userId) {
    throw new Error('UNAUTHORIZED_NO_USER')
  }

  const supabaseAdmin = createAdminClient()

  let activeTier: Tier | null = null
  let matchedEnrollmentId: string | null = null

  const VALID_TIERS: Tier[] = ['junior', 'expert', 'complete', 'bootcamp']
  const isValidTier = (t: unknown): t is Tier => typeof t === 'string' && (VALID_TIERS as string[]).includes(t)

  if (batchId) {
    // 1. Jika batchId diberikan, cari enrollment aktif pada batch spesifik tersebut saja
    const { data: enrollment, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        status,
        enrollment_source,
        checkout_order_id,
        checkout_orders (
          tier_type
        )
      `)
      .eq('user_id', userId)
      .eq('batch_id', batchId)
      .eq('status', 'aktif')
      .maybeSingle()

    if (error) {
      console.error('requireCapability enrollment query error:', error)
      throw new Error(`DATABASE_QUERY_ERROR: ${error.message}`)
    }

    if (enrollment) {
      const co = Array.isArray(enrollment.checkout_orders)
        ? enrollment.checkout_orders[0]
        : enrollment.checkout_orders

      let resolvedTier: Tier = 'bootcamp'
      if (co?.tier_type) {
        resolvedTier = co.tier_type as Tier
      } else {
        // Siswa inputan Admin (manual_admin / bulk_import / null checkout_order) -> 'bootcamp'
        resolvedTier = 'bootcamp'
      }

      if (!isValidTier(resolvedTier)) {
        throw new Error('UNAUTHORIZED_NO_ACCESS')
      }
      activeTier = resolvedTier
      matchedEnrollmentId = enrollment.id
    }
  } else {
    // 2. Jika batchId null, cari semua enrollment aktif dan ambil tier dengan TIER_RANK tertinggi
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        status,
        enrollment_source,
        checkout_order_id,
        checkout_orders (
          tier_type
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'aktif')

    if (error) {
      console.error('requireCapability all enrollments query error:', error)
      throw new Error(`DATABASE_QUERY_ERROR: ${error.message}`)
    }

    if (enrollments && enrollments.length > 0) {
      // Map setiap enrollment ke tier yang sesuai
      const candidateList = enrollments.map((enr: any) => {
        const co = Array.isArray(enr.checkout_orders)
          ? enr.checkout_orders[0]
          : enr.checkout_orders

        let tier: Tier = 'bootcamp'
        if (co?.tier_type) {
          tier = co.tier_type as Tier
        } else {
          tier = 'bootcamp'
        }
        return {
          id: enr.id,
          tier,
          rank: TIER_RANK[tier] ?? 1,
        }
      })

      // Urutkan berdasarkan rank tertinggi
      candidateList.sort((a, b) => b.rank - a.rank)
      activeTier = candidateList[0].tier
      matchedEnrollmentId = candidateList[0].id
    }
  }

  // 3. Jika tidak ditemukan enrollment aktif, periksa apakah memiliki video_access (Paket 1 / junior)
  if (!activeTier) {
    const { data: videoAccess, error: vaError } = await supabaseAdmin
      .from('video_access')
      .select('id, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)

    if (vaError) {
      console.error('requireCapability video_access query error:', vaError)
      throw new Error(`DATABASE_QUERY_ERROR: ${vaError.message}`)
    }

    if (videoAccess && videoAccess.length > 0) {
      activeTier = 'junior'
      matchedEnrollmentId = null
    }
  }

  // 4. Jika tetap tidak memiliki akses apa pun -> tolak (unauthorized)
  if (!activeTier) {
    throw new Error('UNAUTHORIZED_NO_ACCESS')
  }

  // 5. Periksa apakah tier memiliki capability yang diminta
  if (!hasCapability(activeTier, cap)) {
    throw new Error('FORBIDDEN_TIER_ACCESS')
  }

  return {
    tier: activeTier,
    enrollmentId: matchedEnrollmentId,
  }
}
