import { createMiddlewareClient } from './lib/supabase-auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // DISABLED: www redirect handled at Vercel/DNS level to prevent redirect loops
  // The redirect in vercel.json handles www → non-www at edge level

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
     * - _next (all Next.js internal paths - static files, chunks, etc.)
     * - favicon.ico (favicon file)
     * - icon (icon route)
     * - manifest (manifest route)
     * - public (public files)
     * - static files (images, etc.)
     */
    '/((?!_next|favicon.ico|icon|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
