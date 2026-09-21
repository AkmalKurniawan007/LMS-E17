'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function resetPassword(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim()

  if (!email) {
    return { error: 'Email wajib diisi.', success: false }
  }

  const supabase = await createClient()
  const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/update-password`,
  })

  if (error) {
    console.error('Reset Password Error:', error.message)
    // Jangan beritahu user apakah email terdaftar atau tidak untuk alasan keamanan
    return { error: 'Terjadi kesalahan sistem. Silakan coba lagi nanti.', success: false }
  }

  return { success: true, error: null }
}
