'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface InAppNotification {
  id: string
  user_id: string
  title: string
  message: string
  action_url: string | null
  is_read: boolean
  created_at: string
}

/**
 * Mengirimkan notifikasi in-app ke pengguna tertentu.
 * Menggunakan admin client agar dapat dipanggil dari server actions transaksi dengan aman.
 */
export async function sendInAppNotification({
  userId,
  title,
  message,
  actionUrl,
}: {
  userId: string
  title: string
  message: string
  actionUrl?: string | null
}) {
  try {
    if (!userId || !title || !message) {
      return { success: false, error: 'userId, title, dan message wajib diisi.' }
    }

    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase
      .from('in_app_notifications')
      .insert({
        user_id: userId,
        title,
        message,
        action_url: actionUrl || null,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('sendInAppNotification error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/siswa')
    revalidatePath('/pembeli/kelas-saya')
    return { success: true, notification: data }
  } catch (err: any) {
    console.error('sendInAppNotification exception:', err)
    return { success: false, error: err?.message || 'Gagal mengirim notifikasi.' }
  }
}

/**
 * Mengirim notifikasi ke seluruh administrator (role admin / super_admin)
 */
export async function notifyAdmins({
  title,
  message,
  actionUrl,
}: {
  title: string
  message: string
  actionUrl?: string | null
}) {
  try {
    const adminSupabase = createAdminClient()

    // 1. Cari semua admin
    const { data: admins, error: adminErr } = await adminSupabase
      .from('users')
      .select('id')
      .in('role', ['admin', 'super_admin'])

    if (adminErr || !admins || admins.length === 0) {
      return { success: false, error: 'Tidak ditemukan akun admin.' }
    }

    // 2. Buat notifikasi untuk setiap admin
    const payload = admins.map(a => ({
      user_id: a.id,
      title,
      message,
      action_url: actionUrl || null,
      is_read: false,
    }))

    const { error: insertErr } = await adminSupabase
      .from('in_app_notifications')
      .insert(payload)

    if (insertErr) {
      console.error('notifyAdmins error:', insertErr)
      return { success: false, error: insertErr.message }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/marketing/orders')
    return { success: true, count: admins.length }
  } catch (err: any) {
    console.error('notifyAdmins exception:', err)
    return { success: false, error: err?.message || 'Gagal mengirim notifikasi admin.' }
  }
}

/**
 * Mengambil daftar notifikasi milik user yang sedang login
 */
export async function getMyNotifications(limit = 15): Promise<InAppNotification[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('getMyNotifications error:', error)
      return []
    }

    return (data || []) as InAppNotification[]
  } catch (err) {
    console.error('getMyNotifications exception:', err)
    return []
  }
}

/**
 * Menandai satu notifikasi sebagai telah dibaca
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
      .from('in_app_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}

/**
 * Menandai semua notifikasi milik user sebagai telah dibaca
 */
export async function markAllNotificationsAsRead() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
      .from('in_app_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message }
  }
}
