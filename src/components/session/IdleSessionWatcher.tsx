"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_TOUCH_INTERVAL_MS,
  SESSION_STORAGE_KEY,
  SESSION_LOGOUT_EVENT_KEY,
  isSessionIdleExpired,
} from "@/lib/session-idle";
import { touchSession } from "@/app/actions/session-actions";

/**
 * IdleSessionWatcher
 * Komponen client untuk memonitor aktivitas pengguna di seluruh web marketing dan LMS.
 * - Mengukur idle time selama 12 jam.
 * - Mensinkronkan aktivitas dan logout antar tab browser via localStorage.
 * - Menjaga sesi aktif di server via ping touchSession berkala (maks. 1x per 5 menit).
 * - Menghitung interaksi user (klik, ketik, scroll, touch, dan pemutaran video).
 */
export default function IdleSessionWatcher() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isAuthUserRef = useRef<boolean>(false);
  const lastLocalRecordRef = useRef<number>(0);
  const lastServerTouchRef = useRef<number>(0);
  const isLoggingOutRef = useRef<boolean>(false);

  const getLoginRedirectUrl = useCallback(() => {
    const isDashboard =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/mentor") ||
      pathname.startsWith("/siswa") ||
      pathname.startsWith("/profile");

    const targetLogin = isDashboard ? "/login" : "/pembeli/login";
    return `${targetLogin}?reason=idle&next=${encodeURIComponent(pathname)}`;
  }, [pathname]);

  const performAutoLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        // Beritahu tab lain bahwa sesi telah logout karena idle
        window.localStorage.setItem(SESSION_LOGOUT_EVENT_KEY, Date.now().toString());
      }
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Auto logout error:", err);
    } finally {
      isAuthUserRef.current = false;
      const redirectUrl = getLoginRedirectUrl();
      router.push(redirectUrl);
      router.refresh();
    }
  }, [supabase, router, getLoginRedirectUrl]);

  // Handler saat ada aktivitas dari user
  const handleUserActivity = useCallback(() => {
    if (!isAuthUserRef.current || isLoggingOutRef.current) return;

    const now = Date.now();

    // Throttle update localStorage: maks 1x setiap 5 detik
    if (now - lastLocalRecordRef.current > 5000) {
      lastLocalRecordRef.current = now;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SESSION_STORAGE_KEY, now.toString());
      }
    }

    // Throttle server touch cookie: maks 1x setiap SESSION_TOUCH_INTERVAL_MS (5 menit)
    if (now - lastServerTouchRef.current > SESSION_TOUCH_INTERVAL_MS) {
      lastServerTouchRef.current = now;
      touchSession().then((res) => {
        if (res.expired) {
          performAutoLogout();
        }
      });
    }
  }, [performAutoLogout]);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;

    // 1. Periksa status login awal & subscribe ke auth state
    const checkInitialAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        isAuthUserRef.current = false;
        return;
      }

      isAuthUserRef.current = true;
      const now = Date.now();

      // Cek apakah sudah expired berdasarkan localStorage sebelumnya
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const lastTs = parseInt(stored, 10);
        if (isSessionIdleExpired(lastTs, now)) {
          performAutoLogout();
          return;
        }
      }

      // Inisialisasi timestamp aktivitas awal
      window.localStorage.setItem(SESSION_STORAGE_KEY, now.toString());
      lastLocalRecordRef.current = now;
      lastServerTouchRef.current = now;
      touchSession();
    };

    checkInitialAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        isAuthUserRef.current = true;
        isLoggingOutRef.current = false;
        const now = Date.now();
        window.localStorage.setItem(SESSION_STORAGE_KEY, now.toString());
        lastLocalRecordRef.current = now;
        lastServerTouchRef.current = now;
        touchSession();
      } else if (event === "SIGNED_OUT") {
        isAuthUserRef.current = false;
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    });

    // 2. Sinkronisasi antar Tab browser
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === SESSION_STORAGE_KEY && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime)) {
          lastLocalRecordRef.current = Math.max(lastLocalRecordRef.current, remoteTime);
        }
      } else if (e.key === SESSION_LOGOUT_EVENT_KEY && isAuthUserRef.current) {
        // Tab lain mentrigger logout karena idle
        isAuthUserRef.current = false;
        const redirectUrl = getLoginRedirectUrl();
        router.push(redirectUrl);
        router.refresh();
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    // 3. Pasang Event Listeners Aktivitas Pengguna
    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    const onEvent = () => handleUserActivity();

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, onEvent, { passive: true });
    });

    // Event video: play dan timeupdate (video berjalan dihitung aktif)
    document.addEventListener("play", onEvent, true);
    document.addEventListener("timeupdate", onEvent, true);

    // Event visibility (misal user kembali ke tab setelah minimize)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const lastTs = parseInt(stored, 10);
          if (isSessionIdleExpired(lastTs, now)) {
            performAutoLogout();
            return;
          }
        }
        handleUserActivity();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // 4. Interval pengecekan berkala (setiap 60 detik)
    checkInterval = setInterval(() => {
      if (!isAuthUserRef.current || isLoggingOutRef.current) return;

      const now = Date.now();
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      const lastActivity = stored ? parseInt(stored, 10) : lastLocalRecordRef.current;

      if (isSessionIdleExpired(lastActivity, now)) {
        performAutoLogout();
      }
    }, 60 * 1000);

    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageEvent);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, onEvent);
      });
      document.removeEventListener("play", onEvent, true);
      document.removeEventListener("timeupdate", onEvent, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [supabase, performAutoLogout, handleUserActivity, getLoginRedirectUrl, router]);

  return null; // Komponen murni listener headless (tanpa visual UI)
}
