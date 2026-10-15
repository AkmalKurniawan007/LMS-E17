import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  SESSION_ACTIVITY_COOKIE_NAME,
  SESSION_IDLE_TIMEOUT_MS,
  isSessionIdleExpired,
} from '@/lib/session-idle'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Route classifications
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/forgot-password') || request.nextUrl.pathname.startsWith('/pembeli/login') || request.nextUrl.pathname.startsWith('/pembeli/register')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/admin') || 
                          request.nextUrl.pathname.startsWith('/mentor') || 
                          request.nextUrl.pathname.startsWith('/siswa') ||
                          request.nextUrl.pathname.startsWith('/profile')

  const isBuyerRoute = request.nextUrl.pathname.startsWith('/checkout')

  // Enforce 12-hour inactivity timeout for authenticated users
  if (user) {
    const lastActivityCookie = request.cookies.get(SESSION_ACTIVITY_COOKIE_NAME)?.value
    const now = Date.now()

    if (lastActivityCookie) {
      const lastActivity = parseInt(lastActivityCookie, 10)
      if (isSessionIdleExpired(lastActivity, now)) {
        // Inactivity timeout exceeded (> 12 hours) -> Sign out and redirect
        await supabase.auth.signOut()

        const redirectUrl = request.nextUrl.clone()
        if (isDashboardPage) {
          redirectUrl.pathname = '/login'
        } else {
          redirectUrl.pathname = '/pembeli/login'
        }
        redirectUrl.searchParams.set('reason', 'idle')
        redirectUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)

        const response = NextResponse.redirect(redirectUrl)
        response.cookies.delete(SESSION_ACTIVITY_COOKIE_NAME)
        return response
      }
    }

    // Refresh last activity cookie on response
    supabaseResponse.cookies.set(SESSION_ACTIVITY_COOKIE_NAME, now.toString(), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Math.floor(SESSION_IDLE_TIMEOUT_MS / 1000),
    })
  } else {
    // If not authenticated, ensure no stale activity cookie remains
    if (request.cookies.has(SESSION_ACTIVITY_COOKIE_NAME)) {
      supabaseResponse.cookies.delete(SESSION_ACTIVITY_COOKIE_NAME)
    }
  }

  if (!user) {
    if (isDashboardPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    if (isBuyerRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/pembeli/login'
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  if (user && isAuthPage) {
    // Check if there is a 'next' query parameter to redirect back to
    const nextPath = request.nextUrl.searchParams.get('next')
    if (nextPath && nextPath.startsWith('/')) {
      return NextResponse.redirect(new URL(nextPath, request.url))
    }

    // Otherwise, redirect to their dashboard based on role
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    let role = userData?.role

    if (!role) {
      const { data: activeEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'aktif')
        .limit(1)
        .maybeSingle()

      if (activeEnrollment) {
        role = 'siswa'
      }
    }
    
    const url = request.nextUrl.clone()
    if (!role) {
      // Ini murni akun marketing (guest login via Google).
      url.pathname = '/'
    } else {
      url.pathname = `/${role}`
    }
    
    return NextResponse.redirect(url)
  }

  // Basic Role-Based Protection for specific routes
  if (user && isDashboardPage) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    let role = userData?.role

    // Jika role masih null, periksa apakah user memiliki enrollment batch aktif di LMS
    if (!role) {
      const { data: activeEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'aktif')
        .limit(1)
        .maybeSingle()

      if (activeEnrollment) {
        role = 'siswa'
      }
    }
    
    // Jika user tidak punya role dan tidak punya enrollment aktif, berarti murni akun marketing (belum beli kelas/diberi akses LMS)
    if (!role) {
      const url = request.nextUrl.clone()
      url.pathname = '/pembeli/kelas-saya'
      url.searchParams.set('error', 'no_lms_access')
      return NextResponse.redirect(url)
    }

    const path = request.nextUrl.pathname
    if (path.startsWith('/admin') && role !== 'admin' && role !== 'superadmin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
    if (path.startsWith('/mentor') && role !== 'mentor') {
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
    if (path.startsWith('/siswa') && role !== 'siswa') {
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
  }

  return supabaseResponse
}
