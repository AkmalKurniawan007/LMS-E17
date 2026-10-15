'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// ================================================================
// TYPES
// ================================================================

export type MarketingProgram = {
  id: string
  slug: string
  name: string
  short_name: string
  description: string | null
  sessions_count: number
  modules_count: number
  rating: number
  students_count: number
  thumbnail_text: string | null
  is_active: boolean
  sort_order: number
  updated_at: string
  lms_program_id: string | null
  tiers?: MarketingProgramTier[]
  curriculum?: MarketingCurriculumItem[]
}

export type MarketingProgramTier = {
  id: string
  program_id: string
  tier_type: 'junior' | 'expert' | 'complete' | 'bootcamp'
  label: string
  price: number
  original_price: number
  is_popular: boolean
  is_active: boolean
  sort_order: number
  features: string[]
  excludes: string[]
}

export type MarketingCurriculumItem = {
  id: string
  program_id: string
  title: string
  description: string | null
  duration: string | null
  video_url: string | null
  preview_video_url: string | null
  sort_order: number
  access_tiers?: string[]
  program_session_id?: string | null
}

// ================================================================
// READ
// ================================================================

export async function getAllMarketingPrograms(): Promise<MarketingProgram[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('marketing_programs')
      .select(`
        *,
        tiers: marketing_program_tiers(* ),
        curriculum: marketing_program_curriculum(*)
      `)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return (data || []).map((p) => ({
      ...p,
      tiers: (p.tiers || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
      curriculum: (p.curriculum || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    })) as MarketingProgram[]
  } catch (err) {
    console.error('getAllMarketingPrograms error:', err)
    return []
  }
}

export async function getActiveMarketingPrograms(): Promise<MarketingProgram[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('marketing_programs')
      .select(`
        *,
        tiers: marketing_program_tiers(*),
        curriculum: marketing_program_curriculum(*)
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return (data || []).map((p) => ({
      ...p,
      tiers: (p.tiers || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
      curriculum: (p.curriculum || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    })) as MarketingProgram[]
  } catch (err) {
    console.error('getActiveMarketingPrograms error:', err)
    return []
  }
}

// ================================================================
// PROGRAM CRUD
// ================================================================

export async function getAllLmsPrograms() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('programs')
      .select('id, name')
      .order('name')
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('getAllLmsPrograms error:', err)
    return []
  }
}

export async function createMarketingProgram(data: {
  slug: string
  name: string
  shortName: string
  description?: string
  sessionsCount?: number
  modulesCount?: number
  rating?: number
  studentsCount?: number
  thumbnailText?: string
  sortOrder?: number
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: created, error } = await supabase
      .from('marketing_programs')
      .insert({
        slug: data.slug,
        name: data.name,
        short_name: data.shortName,
        description: data.description ?? null,
        sessions_count: data.sessionsCount ?? 0,
        modules_count: data.modulesCount ?? 0,
        rating: data.rating ?? 5.0,
        students_count: data.studentsCount ?? 0,
        thumbnail_text: data.thumbnailText ?? null,
        sort_order: data.sortOrder ?? 0,
        updated_by: user?.id ?? null,
      })
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/marketing/programs')
    return { success: true, id: created.id }
  } catch (err) {
    console.error('createMarketingProgram error:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function updateMarketingProgram(
  programId: string,
  data: Partial<{
    name: string
    shortName: string
    description: string
    sessionsCount: number
    modulesCount: number
    rating: number
    studentsCount: number
    thumbnailText: string
    isActive: boolean
    sortOrder: number
    lmsProgramId: string | null
  }>
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: user?.id ?? null }
    if (data.name !== undefined) payload.name = data.name
    if (data.shortName !== undefined) payload.short_name = data.shortName
    if (data.description !== undefined) payload.description = data.description
    if (data.sessionsCount !== undefined) payload.sessions_count = data.sessionsCount
    if (data.modulesCount !== undefined) payload.modules_count = data.modulesCount
    if (data.rating !== undefined) payload.rating = data.rating
    if (data.studentsCount !== undefined) payload.students_count = data.studentsCount
    if (data.thumbnailText !== undefined) payload.thumbnail_text = data.thumbnailText
    if (data.isActive !== undefined) payload.is_active = data.isActive
    if (data.sortOrder !== undefined) payload.sort_order = data.sortOrder
    if (data.lmsProgramId !== undefined) payload.lms_program_id = data.lmsProgramId

    const { error } = await supabase
      .from('marketing_programs')
      .update(payload)
      .eq('id', programId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/marketing/programs')
    return { success: true }
  } catch (err) {
    console.error('updateMarketingProgram error:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function deleteMarketingProgram(programId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('marketing_programs')
      .delete()
      .eq('id', programId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/marketing/programs')
    return { success: true }
  } catch (err) {
    console.error('deleteMarketingProgram error:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

// ================================================================
// TIER CRUD
// ================================================================

export async function upsertMarketingTier(data: {
  programId: string
  tierType: 'junior' | 'expert' | 'complete' | 'bootcamp'
  label: string
  price: number
  originalPrice: number
  isPopular?: boolean
  isActive?: boolean
  sortOrder?: number
  features: string[]
  excludes: string[]
}) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('marketing_program_tiers')
      .upsert({
        program_id: data.programId,
        tier_type: data.tierType,
        label: data.label,
        price: data.price,
        original_price: data.originalPrice,
        is_popular: data.isPopular ?? false,
        is_active: data.isActive ?? true,
        sort_order: data.sortOrder ?? 0,
        features: data.features,
        excludes: data.excludes,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'program_id,tier_type' })

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/marketing/programs')
    return { success: true }
  } catch (err) {
    console.error('upsertMarketingTier error:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

// ================================================================
// CURRICULUM CRUD
// ================================================================

export async function addCurriculumItem(data: {
  programId: string
  title: string
  description?: string
  duration?: string
  videoUrl?: string
  previewVideoUrl?: string
  sortOrder?: number
  accessTiers?: string[]
  programSessionId?: string | null
}) {
  try {
    const supabase = await createClient()

    const insertPayload: Record<string, any> = {
      program_id: data.programId,
      title: data.title,
      description: data.description ?? null,
      duration: data.duration ?? null,
      video_url: data.videoUrl ?? null,
      preview_video_url: data.previewVideoUrl ?? null,
      sort_order: data.sortOrder ?? 0,
      access_tiers: data.accessTiers ?? ['junior', 'expert', 'bootcamp'],
    }
    if (data.programSessionId) {
      insertPayload.program_session_id = data.programSessionId
    }

    const { data: created, error } = await supabase
      .from('marketing_program_curriculum')
      .insert(insertPayload)
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/marketing/programs')
    return { success: true, id: created.id }
  } catch (err) {
    console.error('addCurriculumItem error:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function updateCurriculumItem(
  itemId: string,
  data: Partial<{
    title: string
    description: string
    duration: string
    videoUrl: string
    previewVideoUrl: string
    sortOrder: number
    accessTiers: string[]
    programSessionId: string | null
  }>
) {
  try {
    const supabase = await createClient()

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (data.title !== undefined) payload.title = data.title
    if (data.description !== undefined) payload.description = data.description
    if (data.duration !== undefined) payload.duration = data.duration
    if (data.videoUrl !== undefined) payload.video_url = data.videoUrl
    if (data.previewVideoUrl !== undefined) payload.preview_video_url = data.previewVideoUrl
    if (data.sortOrder !== undefined) payload.sort_order = data.sortOrder
    if (data.accessTiers !== undefined) payload.access_tiers = data.accessTiers
    if (data.programSessionId !== undefined) payload.program_session_id = data.programSessionId

    const { data: updatedItem, error } = await supabase
      .from('marketing_program_curriculum')
      .update(payload)
      .eq('id', itemId)
      .select('id, program_id, program_session_id, title, description, duration, video_url, preview_video_url')
      .single()

    if (error) return { success: false, error: error.message }

    // If linked to a program_session, sync fields back to LMS blueprint as well
    if (updatedItem?.program_session_id) {
      const sessPayload: Record<string, any> = {}
      if (data.title !== undefined) sessPayload.title = data.title
      if (data.description !== undefined) sessPayload.description = data.description
      if (data.duration !== undefined) sessPayload.duration = data.duration
      if (data.videoUrl !== undefined) sessPayload.video_url = data.videoUrl
      if (data.previewVideoUrl !== undefined) sessPayload.preview_video_url = data.previewVideoUrl

      if (Object.keys(sessPayload).length > 0) {
        try {
          await supabase
            .from('program_sessions')
            .update(sessPayload)
            .eq('id', updatedItem.program_session_id)
        } catch {
          // ignore if column doesn't exist yet
        }
      }
    }

    revalidatePath('/')
    revalidatePath('/admin/marketing/programs')
    return { success: true }
  } catch (err) {
    console.error('updateCurriculumItem error:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

export async function deleteCurriculumItem(itemId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('marketing_program_curriculum')
      .delete()
      .eq('id', itemId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/marketing/programs')
    return { success: true }
  } catch (err) {
    console.error('deleteCurriculumItem error:', err)
    return { success: false, error: 'Terjadi kesalahan server.' }
  }
}

// ================================================================
// CURRICULUM UNIFICATION & SYNCHRONIZATION
// ================================================================

export async function syncMarketingCurriculumWithLms(
  marketingProgramId: string,
  direction: 'pull_from_lms' | 'push_to_lms' = 'pull_from_lms'
) {
  try {
    const supabase = await createClient()

    // 1. Fetch marketing program
    const { data: mp, error: mpErr } = await supabase
      .from('marketing_programs')
      .select('id, name, lms_program_id')
      .eq('id', marketingProgramId)
      .single()

    if (mpErr || !mp) {
      return { success: false, error: 'Program marketing tidak ditemukan.' }
    }

    if (!mp.lms_program_id) {
      return {
        success: false,
        error: 'Program marketing ini belum dipetakan ke program LMS (lms_program_id kosong). Silakan pilih Program LMS terlebih dahulu di bagian Informasi Program.'
      }
    }

    // 2. Try calling RPC function if already applied in database
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('sync_curriculum_lms_and_marketing', {
        p_marketing_program_id: marketingProgramId,
        p_direction: direction,
      })
      if (!rpcErr && rpcData?.success) {
        revalidatePath('/')
        revalidatePath('/admin/marketing/programs')
        revalidatePath(`/admin/programs/${mp.lms_program_id}`)
        return { success: true, syncedCount: rpcData.synced_count, direction }
      }
    } catch {
      // Fallback to JS implementation
    }

    // 3. JS Fallback implementation
    if (direction === 'pull_from_lms') {
      const { data: lmsSessions, error: sessErr } = await supabase
        .from('program_sessions')
        .select('*')
        .eq('program_id', mp.lms_program_id)
        .order('order_number', { ascending: true })

      if (sessErr) throw sessErr

      if (!lmsSessions || lmsSessions.length === 0) {
        return { success: false, error: 'Program LMS ini belum memiliki sesi kurikulum.' }
      }

      const { data: currentCurriculum } = await supabase
        .from('marketing_program_curriculum')
        .select('*')
        .eq('program_id', marketingProgramId)

      const currList = currentCurriculum || []
      let count = 0

      for (const sess of lmsSessions) {
        const existing = currList.find(
          c => (c.program_session_id && c.program_session_id === sess.id) || c.sort_order === sess.order_number
        )

        if (existing) {
          const updatePayload: Record<string, any> = {
            title: sess.title,
            sort_order: sess.order_number,
            updated_at: new Date().toISOString(),
          }
          try { updatePayload.program_session_id = sess.id } catch {}
          if (sess.description) updatePayload.description = sess.description
          if (sess.duration) updatePayload.duration = sess.duration
          if (sess.video_url) updatePayload.video_url = sess.video_url
          if (sess.preview_video_url) updatePayload.preview_video_url = sess.preview_video_url

          await supabase.from('marketing_program_curriculum').update(updatePayload).eq('id', existing.id)
        } else {
          const newRow: Record<string, any> = {
            program_id: marketingProgramId,
            title: sess.title,
            description: sess.description || null,
            duration: sess.duration || '30:00',
            video_url: sess.video_url || null,
            preview_video_url: sess.preview_video_url || null,
            sort_order: sess.order_number,
            access_tiers: ['junior', 'expert', 'bootcamp'],
          }
          try { newRow.program_session_id = sess.id } catch {}

          await supabase.from('marketing_program_curriculum').insert(newRow)
        }
        count++
      }

      // Update sessions_count
      await supabase
        .from('marketing_programs')
        .update({ sessions_count: lmsSessions.length, updated_at: new Date().toISOString() })
        .eq('id', marketingProgramId)

      revalidatePath('/')
      revalidatePath('/admin/marketing/programs')
      revalidatePath(`/admin/programs/${mp.lms_program_id}`)
      return { success: true, syncedCount: count, direction }
    } else {
      // push_to_lms
      const { data: currList, error: currErr } = await supabase
        .from('marketing_program_curriculum')
        .select('*')
        .eq('program_id', marketingProgramId)
        .order('sort_order', { ascending: true })

      if (currErr) throw currErr

      if (!currList || currList.length === 0) {
        return { success: false, error: 'Kurikulum web marketing masih kosong.' }
      }

      const { data: existingSessions } = await supabase
        .from('program_sessions')
        .select('*')
        .eq('program_id', mp.lms_program_id)

      const sessList = existingSessions || []
      let count = 0

      for (const item of currList) {
        const matched = sessList.find(
          s => (item.program_session_id && s.id === item.program_session_id) || s.order_number === item.sort_order
        )

        const sessPayload: Record<string, any> = {
          title: item.title,
          description: item.description || '',
          order_number: item.sort_order,
          format: 'online',
        }
        if (item.video_url) sessPayload.video_url = item.video_url
        if (item.preview_video_url) sessPayload.preview_video_url = item.preview_video_url
        if (item.duration) sessPayload.duration = item.duration

        if (matched) {
          try {
            await supabase.from('program_sessions').update(sessPayload).eq('id', matched.id)
          } catch {
            delete sessPayload.video_url
            delete sessPayload.preview_video_url
            delete sessPayload.duration
            await supabase.from('program_sessions').update(sessPayload).eq('id', matched.id)
          }

          if (!item.program_session_id || item.program_session_id !== matched.id) {
            try {
              await supabase
                .from('marketing_program_curriculum')
                .update({ program_session_id: matched.id })
                .eq('id', item.id)
            } catch {}
          }
        } else {
          try {
            const { data: insertedSess } = await supabase
              .from('program_sessions')
              .insert({ ...sessPayload, program_id: mp.lms_program_id })
              .select('id')
              .single()

            if (insertedSess) {
              try {
                await supabase
                  .from('marketing_program_curriculum')
                  .update({ program_session_id: insertedSess.id })
                  .eq('id', item.id)
              } catch {}
            }
          } catch {
            delete sessPayload.video_url
            delete sessPayload.preview_video_url
            delete sessPayload.duration
            const { data: insertedSess } = await supabase
              .from('program_sessions')
              .insert({ ...sessPayload, program_id: mp.lms_program_id })
              .select('id')
              .single()

            if (insertedSess) {
              try {
                await supabase
                  .from('marketing_program_curriculum')
                  .update({ program_session_id: insertedSess.id })
                  .eq('id', item.id)
              } catch {}
            }
          }
        }
        count++
      }

      revalidatePath('/')
      revalidatePath('/admin/marketing/programs')
      revalidatePath(`/admin/programs/${mp.lms_program_id}`)
      return { success: true, syncedCount: count, direction }
    }
  } catch (err: any) {
    console.error('syncMarketingCurriculumWithLms error:', err)
    return { success: false, error: err?.message || 'Terjadi kesalahan sinkronisasi.' }
  }
}

export async function syncCurriculumToMarketing(lmsProgramId: string) {
  try {
    const supabase = await createClient()
    const { data: mp } = await supabase
      .from('marketing_programs')
      .select('id')
      .eq('lms_program_id', lmsProgramId)
      .maybeSingle()

    if (!mp) return { success: false, error: 'Tidak ada program marketing yang terhubung dengan program LMS ini.' }

    return await syncMarketingCurriculumWithLms(mp.id, 'pull_from_lms')
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal sinkronisasi ke marketing.' }
  }
}

