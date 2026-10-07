import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 1. Run Supabase auth middleware
  const supabaseResponse = await updateSession(request)

  // If Supabase redirects, return early
  if (supabaseResponse.status >= 300 && supabaseResponse.status < 400) {
    return supabaseResponse
  }

  const pathname = request.nextUrl.pathname

  // 2. Identify if the current route is a marketing page (needs i18n)
  const isMarketing = 
    !pathname.startsWith('/api') && 
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/verify') &&
    !pathname.startsWith('/mentor') &&
    !pathname.startsWith('/siswa') &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/forgot-password') &&
    !pathname.startsWith('/pembeli/login') &&
    !pathname.startsWith('/pembeli/register') &&
    !pathname.startsWith('/_next') &&
    !pathname.includes('.')

  if (!isMarketing) {
    return supabaseResponse
  }

  // 3. Apply next-intl middleware for marketing pages
  const intlResponse = intlMiddleware(request)
  
  // Merge cookies from Supabase to intlResponse so auth remains valid
  supabaseResponse.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie)
  })

  return intlResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
