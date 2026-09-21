'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type PendingPortfolio = {
  id: string
  title: string
  description: string | null
  project_url: string | null
  status: string
  created_at: string
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

export async function getPendingPortfolios(): Promise<PendingPortfolio[]> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return []
  const mentorId = authData.user.id

  // Get all batches taught by this mentor
  const { data: mentorBatches } = await supabase
    .from('batch_mentors')
    .select('batch_id')
    .eq('mentor_id', mentorId)
    
  if (!mentorBatches || mentorBatches.length === 0) return []
  
  const batchIds = [...new Set(mentorBatches.map(b => b.batch_id))]

  const { data: portfolios, error } = await supabase
    .from('portfolio_projects')
    .select(`
      id,
      title,
      description,
      project_url,
      status,
      created_at,
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
    .eq('status', 'pending')
    .or(`batch_id.in.(${batchIds.join(',')}),batch_id.is.null`)
    .order('created_at', { ascending: false })

  if (error || !portfolios) return []

  return portfolios.map((p: any) => ({
    ...p,
    user: p.users ? { full_name: p.users.full_name } : { full_name: 'Unknown Student' },
    batch: p.batches ? { program: p.batches.programs } : undefined
  }))
}

export async function reviewPortfolio(
  id: string, 
  action: 'approve' | 'reject', 
  feedback?: string
): Promise<{success: boolean, error?: string}> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) return { success: false, error: 'Unauthorized' }
  const mentorId = authData.user.id

  const status = action === 'approve' ? 'validated' : 'rejected'
  
  const { error } = await supabase
    .from('portfolio_projects')
    .update({
      status,
      feedback: feedback || null,
      validated_by: mentorId,
      validated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('status', 'pending')

  if (error) {
    console.error("Error reviewing portfolio:", error)
    return { success: false, error: error.message }
  }

  revalidatePath('/mentor/portfolio-review')
  return { success: true }
}
