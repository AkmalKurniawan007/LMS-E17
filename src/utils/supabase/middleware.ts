import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Protect routes
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/forgot-password')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/admin') || 
                          request.nextUrl.pathname.startsWith('/mentor') || 
                          request.nextUrl.pathname.startsWith('/siswa') ||
                          request.nextUrl.pathname.startsWith('/profile')

  if (!user && isDashboardPage) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    // User is logged in, but trying to access login page. Redirect to their dashboard.
    // We need to know their role. We can fetch it from public.users table.
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = userData?.role || 'siswa' // default
    
    const url = request.nextUrl.clone()
    url.pathname = `/${role}`
    return NextResponse.redirect(url)
  }

  // Basic Role-Based Protection for specific routes
  if (user && isDashboardPage) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = userData?.role || 'siswa'

    const path = request.nextUrl.pathname
    if (path.startsWith('/admin') && role !== 'admin') {
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
