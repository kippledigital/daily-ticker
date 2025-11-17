import { createMiddlewareClient } from './lib/supabase-auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Redirect www to non-www (301 permanent redirect for SEO)
  const hostname = request.headers.get('host') || ''
  
  // Only redirect if hostname starts with www. and we're in production
  if (hostname.startsWith('www.') && !hostname.includes('localhost') && !hostname.includes('vercel.app')) {
    const url = request.nextUrl.clone()
    // Construct the non-www URL properly
    url.hostname = hostname.replace('www.', '')
    url.protocol = 'https:'
    return NextResponse.redirect(url, 301)
  }

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
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
