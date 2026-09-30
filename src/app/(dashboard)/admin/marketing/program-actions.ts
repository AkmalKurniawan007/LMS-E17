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
  tiers?: MarketingProgramTier[]
  curriculum?: MarketingCurriculumItem[]
}

export type MarketingProgramTier = {
  id: string
  program_id: string
  tier_type: 'junior' | 'expert' | 'complete'
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
  sort_order: number
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
  tierType: 'junior' | 'expert' | 'complete'
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
  sortOrder?: number
}) {
  try {
    const supabase = await createClient()

    const { data: created, error } = await supabase
      .from('marketing_program_curriculum')
      .insert({
        program_id: data.programId,
        title: data.title,
        description: data.description ?? null,
        duration: data.duration ?? null,
        sort_order: data.sortOrder ?? 0,
      })
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
  data: Partial<{ title: string; description: string; duration: string; sortOrder: number }>
) {
  try {
    const supabase = await createClient()

    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (data.title !== undefined) payload.title = data.title
    if (data.description !== undefined) payload.description = data.description
    if (data.duration !== undefined) payload.duration = data.duration
    if (data.sortOrder !== undefined) payload.sort_order = data.sortOrder

    const { error } = await supabase
      .from('marketing_program_curriculum')
      .update(payload)
      .eq('id', itemId)

    if (error) return { success: false, error: error.message }

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
