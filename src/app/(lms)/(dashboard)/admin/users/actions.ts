'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { logAction } from '@/utils/logger-actions'

export async function getAdminAndMentorUsers() {
  try {
    const supabaseAdmin = createAdminClient()
    const { data: publicUsers, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('role', ['admin', 'mentor'])
      .order('created_at', { ascending: false })
      
    if (error) throw error

    // Fetch auth users to see who is banned
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) throw authError

    const bannedUserIds = new Set(
      authUsers.users.filter(u => u.banned_until).map(u => u.id)
    )

    const mappedUsers = publicUsers.map(u => ({
      ...u,
      is_suspended: bannedUserIds.has(u.id)
    }))

    return { success: true, data: mappedUsers }
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal memuat pengguna.' }
  }
}

export async function createInternalUser(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string // 'admin' or 'mentor'

  if (!email || !name || !role) {
    return { success: false, message: 'Semua field harus diisi.' }
  }

  try {
    const supabaseAdmin = createAdminClient()

    // Create user in Supabase Auth bypassing email verification
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: 'password123', // Default password for new staff
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: role
      }
    })

    if (authError) {
      if (authError.message.includes('already exists')) {
        return { success: false, message: 'Email sudah terdaftar di sistem.' }
      }
      return { success: false, message: `Gagal membuat akun: ${authError.message}` }
    }

    // Since we have a Postgres trigger (handle_new_user) that automatically creates 
    // the public.users record based on user_metadata, we don't need to manually insert it.
    // However, just to be safe, if the trigger is missing or we want to force the role:
    
    // Check if the user is in public.users
    const userId = authData.user.id
    
    // We can also ensure the role is updated correctly in case the trigger missed it
    await supabaseAdmin
      .from('users')
      .update({ role: role })
      .eq('id', userId)

    await logAction('admin', 'Pembuatan Akun Staf', `Membuat akun ${role} baru untuk ${email}`, { target_id: userId })

    return { success: true, message: `Akun ${role} berhasil dibuat dengan sandi default: password123` }
  } catch (error: any) {
    return { success: false, message: error.message || 'Terjadi kesalahan sistem.' }
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  if (!userId || !newRole) {
    return { success: false, message: 'Data tidak lengkap.' }
  }

  try {
    const supabaseAdmin = createAdminClient()
    
    // Update role in public.users table
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (dbError) throw new Error(`Database error: ${dbError.message}`)

    // Update role in auth user metadata
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole }
    })

    if (authError) throw new Error(`Auth error: ${authError.message}`)

    await logAction('admin', 'Perubahan Peran', `Mengubah peran user ${userId} menjadi ${newRole}`, { target_id: userId })

    return { success: true, message: `Role berhasil diubah menjadi ${newRole === 'admin' ? 'Admin' : 'Mentor'}.` }
  } catch (error: any) {
    return { success: false, message: error.message || 'Terjadi kesalahan sistem.' }
  }
}

export async function revokeUserAccess(userId: string) {
  if (!userId) return { success: false, message: 'ID User tidak valid.' }

  try {
    const supabaseAdmin = createAdminClient()
    
    // Ban user in Supabase Auth (ban for a very long time e.g., 87600h = 10 years)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: '87600h'
    })

    if (authError) throw new Error(`Auth error: ${authError.message}`)

    await logAction('admin', 'Pencabutan Akses', `Mencabut akses (suspend) untuk user ID: ${userId}`, { target_id: userId })

    return { success: true, message: 'Akses login pengguna berhasil dicabut.' }
  } catch (error: any) {
    return { success: false, message: error.message || 'Terjadi kesalahan sistem.' }
  }
}

export async function assignBatchesToMentor(mentorId: string, batchIds: string[]) {
  if (!mentorId) {
    return { success: false, message: 'ID mentor tidak valid.' }
  }

  const supabaseAdmin = createAdminClient()

  try {
    // Get current batch assignments
    const { data: currentAssignments } = await supabaseAdmin
      .from('batch_mentors')
      .select('batch_id')
      .eq('mentor_id', mentorId)

    const currentBatchIds = currentAssignments?.map(a => a.batch_id) || []

    // Batches to remove
    const toRemove = currentBatchIds.filter(id => !batchIds.includes(id))
    // Batches to add
    const toAdd = batchIds.filter(id => !currentBatchIds.includes(id))

    // Remove old assignments
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('batch_mentors')
        .delete()
        .eq('mentor_id', mentorId)
        .in('batch_id', toRemove)

      if (deleteError) throw deleteError
    }

    // Add new assignments
    if (toAdd.length > 0) {
      const newAssignments = toAdd.map(batchId => ({
        mentor_id: mentorId,
        batch_id: batchId
      }))

      const { error: insertError } = await supabaseAdmin
        .from('batch_mentors')
        .insert(newAssignments)

      if (insertError) throw insertError
    }

    await logAction('admin', 'Assign Batch ke Mentor', `Mengassign ${batchIds.length} batch kepada mentor ID: ${mentorId}`, { target_id: mentorId })

    return { success: true, message: 'Batch assignment berhasil diperbarui.' }
  } catch (error: any) {
    return { success: false, message: error.message || 'Terjadi kesalahan saat assign batch.' }
  }
}
