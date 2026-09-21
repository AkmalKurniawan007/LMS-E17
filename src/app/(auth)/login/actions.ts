'use server'

import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const rememberMe = formData.get('remember-me') === 'on'

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.', success: false, redirectUrl: null }
  }

  // Jika Ingat Saya dicentang: 8 jam (28800 detik), jika tidak: session cookie (undefined)
  const cookieMaxAge = rememberMe ? 8 * 60 * 60 : undefined
  const supabase = await createClient(cookieMaxAge)

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: 'Email atau password salah.', success: false, redirectUrl: null }
  }

  // Fetch user role
  if (authData.user) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      console.error('Supabase User Error:', userError?.message || 'Data not found')
      // Default fallback or handle error
      return { error: 'Tidak dapat menemukan profil pengguna.', success: false, redirectUrl: null }
    }

    const role = userData?.role

    let redirectPath = '/siswa'
    if (role === 'admin') {
      redirectPath = '/admin'
    } else if (role === 'mentor') {
      redirectPath = '/mentor'
    }

    return { success: true, redirectUrl: redirectPath, error: null }
  }
  
  return { error: 'Terjadi kesalahan sistem.', success: false, redirectUrl: null }
}
