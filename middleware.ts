import { createMiddlewareClient } from './lib/supabase-auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED: www redirect causing redirect loops
  // TODO: Fix redirect properly - likely need to handle at DNS/Vercel level instead
  /*
  // Redirect www to non-www FIRST (before any other processing)
  // This prevents redirect loops and ensures clean redirects
  const hostname = request.headers.get('host') || ''
  
  // Only redirect if hostname starts with www. and we're in production
  if (hostname.startsWith('www.') && !hostname.includes('localhost') && !hostname.includes('vercel.app')) {
    const nonWwwHostname = hostname.replace('www.', '')
    // Construct URL properly - use the request URL but change hostname
    const url = new URL(request.url)
    url.host = nonWwwHostname
    url.protocol = 'https:'
    // Return redirect immediately - don't process anything else
    return NextResponse.redirect(url.toString(), 301)
  }
  */

  // Create Supabase client
  const { supabase, response } = createMiddlewareClient(request)

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Optional: Protect specific routes
  // TEMPORARILY DISABLED - Archive is public until Supabase Auth is configured
  /*
  const protectedRoutes = ['/archive']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If not logged in, redirect to login with the requested page as 'next'
    if (!session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }
  */

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon (icon route)
     * - manifest (manifest route)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
