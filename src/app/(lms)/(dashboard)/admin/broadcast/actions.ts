'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type BroadcastHistory = {
  id: string
  subject: string
  target: string
  created_at: string
}

export async function getBatches() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('batches')
    .select('id, name')
    .order('created_at', { ascending: false })
    
  return data || []
}

export async function getBroadcastHistory(): Promise<BroadcastHistory[]> {
  const supabase = await createClient()
  
  // Verify admin role
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return []
  
  const { data: userData } = await supabase.from('users').select('role').eq('id', authData.user.id).single()
  if (userData?.role !== 'admin' && userData?.role !== 'Super Admin') return []

  const { data, error } = await supabase
    .from('broadcasts')
    .select('id, subject, target, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching broadcast history:", error)
    return []
  }

  return data
}

export async function sendBroadcast(data: {
  target: string
  subject: string
  message: string
}): Promise<{success: boolean, error?: string}> {
  const supabase = await createClient()
  
  // 1. Verify admin role
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { success: false, error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('role').eq('id', authData.user.id).single()
  if (userData?.role !== 'admin' && userData?.role !== 'Super Admin') return { success: false, error: 'Unauthorized' }

  // 2. Identify target user IDs
  let userIds: string[] = []
  
  if (data.target === 'all') {
    const { data: users } = await supabase.from('users').select('id').in('role', ['siswa', 'mentor'])
    if (users) userIds = users.map(u => u.id)
  } 
  else if (data.target === 'students') {
    const { data: users } = await supabase.from('users').select('id').eq('role', 'siswa')
    if (users) userIds = users.map(u => u.id)
  }
  else if (data.target === 'mentors') {
    const { data: users } = await supabase.from('users').select('id').eq('role', 'mentor')
    if (users) userIds = users.map(u => u.id)
  }
  else {
    // Specific batch
    // Get students in this batch
    const { data: enrollments } = await supabase.from('enrollments').select('user_id').eq('batch_id', data.target).eq('status', 'aktif')
    if (enrollments) userIds.push(...enrollments.map(e => e.user_id))
    
    // Get mentors in this batch
    const { data: mentors } = await supabase.from('batch_mentors').select('mentor_id').eq('batch_id', data.target)
    if (mentors) userIds.push(...mentors.map(m => m.mentor_id))
  }
  
  // Deduplicate
  userIds = [...new Set(userIds)]
  
  if (userIds.length === 0) {
    return { success: false, error: 'Tidak ada penerima yang ditemukan untuk target ini.' }
  }

  let targetLabel = data.target
  if (data.target === 'all') targetLabel = 'Semua Siswa & Mentor'
  else if (data.target === 'students') targetLabel = 'Semua Siswa'
  else if (data.target === 'mentors') targetLabel = 'Semua Mentor'
  else {
    // Resolve batch name
    const { data: batchData } = await supabase.from('batches').select('name').eq('id', data.target).single()
    if (batchData) targetLabel = batchData.name
  }

  // 3. Save to broadcast history
  const { error: broadcastError } = await supabase
    .from('broadcasts')
    .insert({
      subject: data.subject,
      message: data.message,
      target: targetLabel,
      created_by: authData.user.id
    })
    
  if (broadcastError) {
    console.error("Error creating broadcast record:", broadcastError)
    // We can still try to send notifications, but it's better to fail if we can't record it
  }

  // 4. Bulk insert to in_app_notifications
  const notifications = userIds.map(userId => ({
    user_id: userId,
    title: data.subject,
    message: data.message,
    is_read: false
  }))
  
  // Supabase insert handles arrays for bulk insert
  const { error: notifError } = await supabase
    .from('in_app_notifications')
    .insert(notifications)
    
  if (notifError) {
    console.error("Error inserting notifications:", notifError)
    return { success: false, error: 'Gagal mengirim notifikasi.' }
  }

  revalidatePath('/admin/broadcast')
  return { success: true }
}
