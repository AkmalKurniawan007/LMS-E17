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
    
    const url = request.nextUrl.clone()
    if (!userData) {
      // Ini murni akun marketing (guest login via Google).
      // Jangan redirect ke /siswa, tapi kembali ke halaman utama atau biarkan di halaman profil marketing
      url.pathname = '/'
    } else {
      url.pathname = `/${userData.role}`
    }
    
    return NextResponse.redirect(url)
  }

  // Basic Role-Based Protection for specific routes
  if (user && isDashboardPage) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    
    // Jika user tidak ada di tabel public.users, berarti ini murni akun marketing (belum beli kelas/diberi akses LMS)
    if (!userData) {
      // Bolehkan akses ke halaman checkout atau profil marketing, tapi block dashboard LMS
      const url = request.nextUrl.clone()
      url.pathname = '/'
      // Bisa tambahkan query parameter untuk memunculkan notifikasi "Anda belum punya akses LMS"
      url.searchParams.set('error', 'no_lms_access')
      return NextResponse.redirect(url)
    }

    const role = userData.role

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
