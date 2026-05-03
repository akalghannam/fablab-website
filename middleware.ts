import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Guard: if env vars are missing, let the request through — pages will
  // show their own error state rather than the whole edge runtime crashing.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const pathname = request.nextUrl.pathname

  // Wrap all Supabase calls so a network/auth error never crashes the middleware
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // If Supabase itself errored (bad key, network), let the request pass
    if (userError && userError.message !== 'Auth session missing!') {
      return supabaseResponse
    }

    const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
    const isAuthPage = pathname === '/login' || pathname === '/signup'

    // Unauthenticated user hitting a protected route → redirect to login
    if (!user && isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    if (user) {
      // Fetch role once and reuse for both checks below
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = userData?.role ?? 'member'

      // Non-admin hitting /admin → redirect to dashboard
      if (pathname.startsWith('/admin') && role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }

      // Logged-in user hitting login/signup → redirect to their home
      if (isAuthPage) {
        const url = request.nextUrl.clone()
        url.pathname = role === 'admin' ? '/admin' : '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  } catch {
    // Any unexpected error (timeout, parse failure, etc.) → pass through
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
