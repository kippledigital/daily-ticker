import { createServerSupabaseClient } from '@/lib/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/archive'

  if (code) {
    const supabase = await createServerSupabaseClient()

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful login - redirect to archive or requested page
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If there's an error, redirect to login with error message
  return NextResponse.redirect(
    new URL('/login?error=Unable to verify magic link', request.url)
  )
}
