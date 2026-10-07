'use server'

import { createAdminClient } from '@/utils/supabase/admin'

export async function addManualStudent(formData: FormData) {
  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone_number') as string
  const institution = formData.get('institution') as string
  const address = formData.get('address') as string
  const batchId = formData.get('batch_id') as string

  if (!fullName || !email || !batchId) {
    return { success: false, error: 'Nama, Email, dan Batch wajib diisi.' }
  }

  const supabaseAdmin = createAdminClient()

  try {
    // 1. Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: 'password123', // Default password
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        role: 'siswa',
        phone_number: phone?.trim() || null,
        institution: institution?.trim() || null,
        address: address?.trim() || null
      }
    })

    if (authError) throw new Error(authError.message)
    const userId = authData.user.id

    // 2. Create enrollment with 'aktif' status
    const { error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        user_id: userId,
        batch_id: batchId,
        status: 'aktif'
      })

    if (enrollError) throw new Error(`Gagal mendaftarkan siswa ke batch: ${enrollError.message}`)

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Terjadi kesalahan sistem.' }
  }
}

export async function resendActivationEmail(email: string) {
  if (!email) return { success: false, message: 'Email tidak valid.' }

  try {
    const supabaseAdmin = createAdminClient()
    
    // We send a password reset email so the user can set their own password securely
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email)
    
    // If you prefer to send a magic link or invite, you can use:
    // await supabaseAdmin.auth.admin.inviteUserByEmail(email)
    // Note: resetPasswordForEmail is often preferred for "activation" 
    // when users are already created with default passwords.

    if (error) {
      if (error.message.includes('not found')) {
        return { success: false, message: 'Akun dengan email ini tidak ditemukan di sistem Auth.' }
      }
      throw new Error(error.message)
    }

    return { success: true, message: `Email aktivasi berhasil dikirim ulang ke ${email}.` }
  } catch (error: any) {
    return { success: false, message: error.message || 'Terjadi kesalahan saat mengirim email.' }
  }
}
