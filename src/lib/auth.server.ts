import 'server-only'
import { createClient } from '@/utils/supabase/server'

/**
 * Cek apakah string role termasuk role admin.
 * Memakai string role yang sudah ada di codebase ('admin', 'superadmin', 'super_admin').
 * Tidak menambah varian string role baru.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false
  return role === 'admin' || role === 'superadmin' || role === 'super_admin'
}

/**
 * Cek apakah string role adalah mentor.
 */
export function isMentorRole(role: string | null | undefined): boolean {
  return role === 'mentor'
}

/**
 * Helper tunggal server-only untuk memverifikasi login dan role pengguna dari public.users.
 */
export async function getAuthenticatedUserWithRole() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { user: null, role: null, isAdmin: false, isMentor: false }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    return { user, role: null, isAdmin: false, isMentor: false }
  }

  const role = userData.role
  return {
    user,
    role,
    isAdmin: isAdminRole(role),
    isMentor: isMentorRole(role),
  }
}

/**
 * Memastikan user yang terdaftar dalam batch pembelajaran memiliki role 'siswa'
 * di tabel public.users jika sebelumnya bernilai NULL.
 */
export async function syncUserRoleIfEnrolled(userId: string): Promise<string | null> {
  try {
    const { createAdminClient } = await import('@/utils/supabase/admin')
    const adminClient = createAdminClient()
    const { data: userData, error: userError } = await adminClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !userData) return null

    if (userData.role) return userData.role

    const { data: activeEnrollment } = await adminClient
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'aktif')
      .limit(1)
      .maybeSingle()

    if (activeEnrollment) {
      await adminClient
        .from('users')
        .update({ role: 'siswa' })
        .eq('id', userId)
      return 'siswa'
    }

    return null
  } catch (err) {
    console.error('Error syncUserRoleIfEnrolled:', err)
    return null
  }
}

