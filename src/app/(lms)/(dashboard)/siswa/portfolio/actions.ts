'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/utils/logger-actions'

export type PortfolioProject = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  project_url: string | null
  status: 'draft' | 'pending' | 'validated' | 'rejected'
  batch_id: string | null
  feedback: string | null
  created_at: string
  batch?: {
    program?: {
      name: string
    }
  }
}

export async function getStudentPortfolios(): Promise<PortfolioProject[]> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return []
  }
  
  const userId = authData.user.id

  const { data: portfolios, error } = await supabase
    .from('portfolio_projects')
    .select(`
      id,
      title,
      description,
      image_url,
      project_url,
      status,
      batch_id,
      feedback,
      created_at,
      batches (
        programs (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !portfolios) {
    console.error("Error fetching portfolios:", error)
    return []
  }

  return portfolios.map((p: any) => ({
    ...p,
    batch: p.batches ? { program: p.batches.programs } : undefined
  }))
}

export async function createPortfolio(data: {
  title: string
  description?: string
  project_url?: string
  batch_id?: string
}): Promise<{success: boolean, error?: string}> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { success: false, error: 'Unauthorized' }
  const userId = authData.user.id

  const { error } = await supabase
    .from('portfolio_projects')
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description || null,
      project_url: data.project_url || null,
      batch_id: data.batch_id || null,
      status: 'draft'
    })

  if (error) {
    console.error("Error creating portfolio:", error)
    return { success: false, error: error.message }
  }

  await logAction('siswa', 'Pembuatan Portofolio', `Membuat draf portofolio: "${data.title}"`, { user_id: userId })

  revalidatePath('/siswa/portfolio')
  return { success: true }
}

export async function updatePortfolio(id: string, data: {
  title: string
  description?: string
  project_url?: string
  batch_id?: string
}): Promise<{success: boolean, error?: string}> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { success: false, error: 'Unauthorized' }
  const userId = authData.user.id

  const { error } = await supabase
    .from('portfolio_projects')
    .update({
      title: data.title,
      description: data.description || null,
      project_url: data.project_url || null,
      batch_id: data.batch_id || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .eq('status', 'draft') // can only update drafts

  if (error) {
    console.error("Error updating portfolio:", error)
    return { success: false, error: error.message }
  }

  await logAction('siswa', 'Pembaruan Portofolio', `Mengubah portofolio: "${data.title}"`, { user_id: userId })

  revalidatePath('/siswa/portfolio')
  return { success: true }
}

export async function deletePortfolio(id: string): Promise<{success: boolean, error?: string}> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { success: false, error: 'Unauthorized' }
  const userId = authData.user.id

  const { error } = await supabase
    .from('portfolio_projects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .eq('status', 'draft') // can only delete drafts

  if (error) {
    console.error("Error deleting portfolio:", error)
    return { success: false, error: error.message }
  }

  await logAction('siswa', 'Penghapusan Portofolio', `Menghapus draf portofolio`, { user_id: userId })

  revalidatePath('/siswa/portfolio')
  return { success: true }
}

export async function requestValidation(id: string): Promise<{success: boolean, error?: string}> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { success: false, error: 'Unauthorized' }
  const userId = authData.user.id

  const { error } = await supabase
    .from('portfolio_projects')
    .update({
      status: 'pending',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .in('status', ['draft', 'rejected']) // Can request validation if draft or previously rejected

  if (error) {
    console.error("Error requesting validation:", error)
    return { success: false, error: error.message }
  }

  await logAction('siswa', 'Permintaan Validasi Portofolio', `Mengirim portofolio untuk divalidasi mentor`, { user_id: userId, target_id: id })

  revalidatePath('/siswa/portfolio')
  return { success: true }
}

export async function getStudentBatches() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return []
  const userId = authData.user.id

  const { data } = await supabase
    .from('enrollments')
    .select(`
      batch_id,
      batches (
        programs (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'aktif')

  if (!data) return []

  return data.map((d: any) => ({
    id: d.batch_id,
    name: d.batches?.programs?.name || 'Unknown Program'
  }))
}
