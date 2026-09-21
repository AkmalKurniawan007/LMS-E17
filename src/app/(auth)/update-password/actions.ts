'use server'

import { createClient } from '@/utils/supabase/server'

export async function updatePassword(prevState: any, formData: FormData) {
  const code = formData.get('code') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Semua kolom wajib diisi.', success: false }
  }

  if (password !== confirmPassword) {
    return { error: 'Konfirmasi kata sandi tidak cocok.', success: false }
  }

  if (password.length < 6) {
    return { error: 'Kata sandi minimal 6 karakter.', success: false }
  }

  const supabase = await createClient()

  // Jika ada kode (baru pertama kali klik link), tukar dengan sesi terlebih dahulu
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('Exchange Code Error:', exchangeError.message)
      return { error: 'Tautan sudah kedaluwarsa atau tidak valid.', success: false }
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    console.error('Update Password Error:', error.message)
    return { error: 'Gagal memperbarui kata sandi. Pastikan tautan belum kedaluwarsa.', success: false }
  }

  return { success: true, error: null }
}
