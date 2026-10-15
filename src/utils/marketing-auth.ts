import { createClient } from "@/utils/supabase/server"

export type PurchasedProgramInfo = {
  programId: string
  tier: string
  source: 'enrollment' | 'video_access' | 'checkout_order'
  lmsProgramId?: string | null
  expiresAt?: string | null
}

export type MarketingSession = {
  isLoggedIn: boolean
  userId: string | null
  purchasedProgramId: string | undefined
  purchasedTier: string | undefined
  purchasedProgramIds: string[]
  purchasedPrograms: PurchasedProgramInfo[]
  role: string | null
  hasLmsAccess: boolean
}

export async function getMarketingSession(): Promise<MarketingSession> {
  let isLoggedIn = false
  let userId: string | null = null
  let purchasedProgramId: string | undefined = undefined
  let purchasedTier: string | undefined = undefined
  const purchasedPrograms: PurchasedProgramInfo[] = []
  const purchasedProgramIdsSet = new Set<string>()
  let role: string | null = null
  let hasLmsAccess = false

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      isLoggedIn = true
      userId = user.id
      
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData) {
        role = userData.role
      }

      if (role === 'admin' || role === 'super_admin' || role === 'mentor') {
        hasLmsAccess = true
      }

      // 1. Ambil SEMUA enrollments aktif di LMS
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, tier, batch_id, batches(id, program_id, programs(id, name))")
        .eq("user_id", user.id)
        .eq("status", "aktif")

      if (enrollments && enrollments.length > 0) {
        hasLmsAccess = true
        enrollments.forEach((en: any) => {
          const batch = Array.isArray(en.batches) ? en.batches[0] : en.batches
          const progId = batch?.program_id || batch?.programs?.id
          if (progId) {
            purchasedPrograms.push({
              programId: progId,
              tier: en.tier || 'bootcamp',
              source: 'enrollment',
              lmsProgramId: progId
            })
            purchasedProgramIdsSet.add(progId)
          }
        })
      }

      // 2. Ambil SEMUA video_access aktif
      const { data: videoAccessList } = await supabase
        .from("video_access")
        .select("program_id, tier, expires_at")
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (videoAccessList && videoAccessList.length > 0) {
        videoAccessList.forEach((va) => {
          const isNotExpired = !va.expires_at || new Date(va.expires_at) > new Date()
          if (isNotExpired && va.program_id) {
            purchasedPrograms.push({
              programId: va.program_id,
              tier: va.tier || 'junior',
              source: 'video_access',
              expiresAt: va.expires_at
            })
            purchasedProgramIdsSet.add(va.program_id)
          }
        })
      }

      // 3. Ambil pesanan yang berstatus confirmed atau paid
      const { data: confirmedOrders } = await supabase
        .from("checkout_orders")
        .select("program_id, tier_type")
        .eq("user_id", user.id)
        .in("status", ["confirmed", "paid"])

      if (confirmedOrders && confirmedOrders.length > 0) {
        confirmedOrders.forEach((co) => {
          if (co.program_id) {
            purchasedPrograms.push({
              programId: co.program_id,
              tier: co.tier_type || 'junior',
              source: 'checkout_order'
            })
            purchasedProgramIdsSet.add(co.program_id)
          }
        })
      }

      // 4. Sinkronkan dengan pemetaan marketing_programs (slug <-> id <-> lms_program_id)
      const { data: mpList } = await supabase
        .from("marketing_programs")
        .select("id, slug, lms_program_id")

      if (mpList && mpList.length > 0) {
        mpList.forEach((mp) => {
          const match = purchasedProgramIdsSet.has(mp.id) ||
                        (mp.slug && purchasedProgramIdsSet.has(mp.slug)) ||
                        (mp.lms_program_id && purchasedProgramIdsSet.has(mp.lms_program_id))

          if (match) {
            purchasedProgramIdsSet.add(mp.id)
            if (mp.slug) purchasedProgramIdsSet.add(mp.slug)
            if (mp.lms_program_id) purchasedProgramIdsSet.add(mp.lms_program_id)
          }
        })
      }

      // Tetapkan default program pertama untuk backward compatibility
      if (purchasedPrograms.length > 0) {
        purchasedProgramId = purchasedPrograms[0].programId
        purchasedTier = purchasedPrograms[0].tier
      }
    }
  } catch (error) {
    console.error("Error fetching user session in marketing:", error)
  }

  const purchasedProgramIds = Array.from(purchasedProgramIdsSet)

  return { 
    isLoggedIn, 
    userId, 
    purchasedProgramId, 
    purchasedTier, 
    purchasedProgramIds,
    purchasedPrograms,
    role, 
    hasLmsAccess 
  }
}

/**
 * Memeriksa secara spesifik apakah user memiliki hak akses ke program tertentu.
 * Menghindari bug di mana akses LMS satu program membuka seluruh program lain.
 */
export async function checkProgramAccess(
  userId: string,
  program: { id: string; slug?: string | null; lms_program_id?: string | null },
  role?: string | null
): Promise<boolean> {
  if (!userId) return false

  // 1. Admin, Super Admin, dan Mentor selalu memiliki hak akses
  if (role === 'admin' || role === 'super_admin' || role === 'mentor') {
    return true
  }

  try {
    const supabase = await createClient()

    const candidateIds = [program.id]
    if (program.slug) candidateIds.push(program.slug)
    if (program.lms_program_id) candidateIds.push(program.lms_program_id)

    // 2. Periksa video_access yang aktif dan belum kedaluwarsa
    const { data: vaList, error: vaErr } = await supabase
      .from('video_access')
      .select('id, expires_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .in('program_id', candidateIds)

    if (!vaErr && vaList && vaList.length > 0) {
      const hasValidVa = vaList.some((va) => {
        if (!va.expires_at) return true
        return new Date(va.expires_at) > new Date()
      })
      if (hasValidVa) return true
    }

    // 3. Periksa pesanan checkout_orders yang sudah lunas / dikonfirmasi
    const { data: coList, error: coErr } = await supabase
      .from('checkout_orders')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['confirmed', 'paid'])
      .in('program_id', candidateIds)
      .limit(1)

    if (!coErr && coList && coList.length > 0) {
      return true
    }

    // 4. Periksa enrollments LMS aktif jika program ini dipetakan ke program LMS
    if (program.lms_program_id) {
      const { data: enList, error: enErr } = await supabase
        .from('enrollments')
        .select(`
          id,
          batch_id,
          batches (
            id,
            program_id
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'aktif')

      if (!enErr && enList && enList.length > 0) {
        const hasMatchingEnrollment = enList.some((en: any) => {
          const batch = Array.isArray(en.batches) ? en.batches[0] : en.batches
          return batch?.program_id === program.lms_program_id
        })
        if (hasMatchingEnrollment) return true
      }
    }
  } catch (err) {
    console.error('Error in checkProgramAccess:', err)
  }

  return false
}
