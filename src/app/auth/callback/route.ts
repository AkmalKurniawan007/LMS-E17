import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Ensure marketing profile exists (this will insert to users and marketing_leads if guest)
      await supabase.rpc('ensure_marketing_profile')

      // Validate 'next' is an internal path to prevent open redirect
      if (next.startsWith('/') && !next.startsWith('//')) {
        return NextResponse.redirect(new URL(next, request.url))
      } else {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  // URL to redirect to after sign in process fails
  return NextResponse.redirect(new URL('/pembeli/login?error=true', request.url))
}
