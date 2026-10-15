'use server'

import { createClient } from '@/utils/supabase/server'
import { syncUserRoleIfEnrolled } from '@/lib/auth.server'

export async function checkAndSyncStudentRole(): Promise<{ success: boolean; role?: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false }
    }

    const role = await syncUserRoleIfEnrolled(user.id)
    return { success: true, role }
  } catch (err) {
    console.error('Error in checkAndSyncStudentRole action:', err)
    return { success: false }
  }
}
