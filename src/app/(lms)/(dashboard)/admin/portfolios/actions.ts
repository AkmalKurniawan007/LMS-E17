'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type AdminPortfolio = {
  id: string
  title: string
  description: string | null
  project_url: string | null
  status: string
  created_at: string
  is_showcase: boolean
  user_id: string
  user?: {
    full_name: string
  }
  batch?: {
    program?: {
      name: string
    }
  }
}

export async function getAllPortfolios(): Promise<AdminPortfolio[]> {
  const supabase = await createClient()

  // Verify admin role
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return []
  
  const { data: userData } = await supabase.from('users').select('role').eq('id', authData.user.id).single()
  if (userData?.role !== 'admin' && userData?.role !== 'Super Admin') return []

  const { data: portfolios, error } = await supabase
    .from('portfolio_projects')
    .select(`
      id,
      title,
      description,
      project_url,
      status,
      created_at,
      is_showcase,
      user_id,
      users:user_id (
        full_name
      ),
      batches (
        programs (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error || !portfolios) {
    console.error("Error fetching admin portfolios:", error)
    return []
  }

  return portfolios.map((p: any) => ({
    ...p,
    user: p.users ? { full_name: p.users.full_name } : { full_name: 'Unknown Student' },
    batch: p.batches ? { program: p.batches.programs } : undefined
  }))
}

export async function toggleShowcase(id: string, is_showcase: boolean): Promise<{success: boolean, error?: string}> {
  const supabase = await createClient()
  
  // Verify admin role
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { success: false, error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('role').eq('id', authData.user.id).single()
  if (userData?.role !== 'admin' && userData?.role !== 'Super Admin') return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('portfolio_projects')
    .update({
      is_showcase,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    // Only validated items should ideally be showcased, but we let admin decide

  if (error) {
    console.error("Error updating showcase:", error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/portfolios')
  return { success: true }
}

export async function deletePortfolioAdmin(id: string): Promise<{success: boolean, error?: string}> {
  const supabase = await createClient()
  
  // Verify admin role
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { success: false, error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('role').eq('id', authData.user.id).single()
  if (userData?.role !== 'admin' && userData?.role !== 'Super Admin') return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('portfolio_projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Error deleting portfolio:", error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/portfolios')
  return { success: true }
}
