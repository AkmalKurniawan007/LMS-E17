'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import {
  SESSION_ACTIVITY_COOKIE_NAME,
  SESSION_IDLE_TIMEOUT_MS,
  isSessionIdleExpired,
} from '@/lib/session-idle';

/**
 * Memperbarui timestamp aktivitas sesi di server cookie (httpOnly).
 * Jika sesi terbukti sudah expired (> 12 jam tanpa aktivitas), otomatis signOut.
 */
export async function touchSession(): Promise<{ success: boolean; expired?: boolean; timestamp?: number }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false };
    }

    const cookieStore = await cookies();
    const lastActivityStr = cookieStore.get(SESSION_ACTIVITY_COOKIE_NAME)?.value;
    const now = Date.now();

    if (lastActivityStr) {
      const lastActivity = parseInt(lastActivityStr, 10);
      if (isSessionIdleExpired(lastActivity, now)) {
        await supabase.auth.signOut();
        cookieStore.delete(SESSION_ACTIVITY_COOKIE_NAME);
        return { success: false, expired: true };
      }
    }

    // Perbarui cookie last activity (masa berlaku 12 jam)
    cookieStore.set(SESSION_ACTIVITY_COOKIE_NAME, now.toString(), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Math.floor(SESSION_IDLE_TIMEOUT_MS / 1000),
    });

    return { success: true, timestamp: now };
  } catch (err) {
    console.error('touchSession error:', err);
    return { success: false };
  }
}

/**
 * Menghapus cookie penanda aktivitas saat user melakukan logout manual.
 */
export async function clearSessionActivity(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_ACTIVITY_COOKIE_NAME);
  } catch (err) {
    console.error('clearSessionActivity error:', err);
  }
}
