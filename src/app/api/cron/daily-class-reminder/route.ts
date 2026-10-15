import { NextRequest, NextResponse } from 'next/server'
import { sendDailyClassReminders } from '@/app/actions/class-reminder-actions'
import { createClient } from '@/utils/supabase/server'

/**
 * Endpoint Cron untuk Pengingat Kelas Harian Otomatis (07:00 WIB)
 * Dapat dipicu oleh Vercel Cron, Supabase pg_cron, GitHub Actions, atau cURL admin.
 */
export async function GET(request: NextRequest) {
  return handleCronTrigger(request)
}

export async function POST(request: NextRequest) {
  return handleCronTrigger(request)
}

async function handleCronTrigger(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const url = new URL(request.url)
    const secretQuery = url.searchParams.get('secret')
    const forceResend = url.searchParams.get('force') === 'true'
    const targetDate = url.searchParams.get('date') || undefined

    const cronSecret = process.env.CRON_SECRET

    // 1. Verifikasi Keamanan (jika CRON_SECRET disetel di environment)
    let isAuthorized = false

    if (cronSecret) {
      if (authHeader === `Bearer ${cronSecret}` || secretQuery === cronSecret) {
        isAuthorized = true
      }
    } else {
      // Jika CRON_SECRET belum diset, izinkan pemanggilan dari Vercel Cron header atau periksa sesi admin
      const isVercelCron = request.headers.get('x-vercel-cron') === '1'
      if (isVercelCron) {
        isAuthorized = true
      } else {
        // Cek apakah user yang memanggil adalah admin login
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

          if (profile?.role === 'admin' || profile?.role === 'super_admin') {
            isAuthorized = true
          }
        }
      }
    }

    // Jika tetap belum terotorisasi, tolak permintaan
    if (cronSecret && !isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: CRON_SECRET tidak valid atau sesi admin tidak ditemukan.' },
        { status: 401 }
      )
    }

    // 2. Jalankan pengiriman pengingat kelas hari ini
    const result = await sendDailyClassReminders({
      targetDate,
      forceResend,
    })

    return NextResponse.json({
      message: 'Eksekusi pengingat kelas harian selesai.',
      data: result,
      executedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[API CRON REMINDER] Exception:', err)
    return NextResponse.json(
      { error: err?.message || 'Terjadi kesalahan pada cron pengingat kelas.' },
      { status: 500 }
    )
  }
}
