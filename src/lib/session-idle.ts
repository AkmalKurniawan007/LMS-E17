/**
 * Konfigurasi dan helper untuk sesi idle (inactivity timeout).
 * Durasi: 12 jam tanpa aktivitas untuk seluruh role (admin, mentor, siswa, pembeli).
 */

export const SESSION_IDLE_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 jam dalam milidetik
export const SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;      // 5 menit throttle ping
export const SESSION_ACTIVITY_COOKIE_NAME = 'e17_last_activity';
export const SESSION_STORAGE_KEY = 'e17_last_activity';
export const SESSION_LOGOUT_EVENT_KEY = 'e17_session_logged_out';

/**
 * Memeriksa apakah timestamp aktivitas terakhir sudah melewati batas 12 jam.
 */
export function isSessionIdleExpired(lastActivityTimestamp: number | null | undefined, now: number = Date.now()): boolean {
  if (!lastActivityTimestamp || isNaN(lastActivityTimestamp)) {
    return false;
  }
  return now - lastActivityTimestamp > SESSION_IDLE_TIMEOUT_MS;
}
