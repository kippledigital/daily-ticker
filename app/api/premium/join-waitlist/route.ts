import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, interestedFeatures } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Extract UTM parameters from headers/referrer
    const url = new URL(request.url)
    const utmSource = url.searchParams.get('utm_source')
    const utmMedium = url.searchParams.get('utm_medium')
    const utmCampaign = url.searchParams.get('utm_campaign')

    // Get IP and user agent for analytics
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Insert into premium_waitlist
    const { data, error } = await supabase
      .from('premium_waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        interested_features: interestedFeatures || [],
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (error) {
      // Check for duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'You\'re already on the waitlist! We\'ll notify you when Premium launches in Q1 2026.',
          },
          { status: 409 }
        )
      }

      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      )
    }

    // Success!
    return NextResponse.json({
      success: true,
      message: 'You\'re on the list! We\'ll notify you when Premium launches in Q1 2026.',
      data: {
        email: data.email,
        position: null, // Could calculate position if needed
      },
    })
  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if email is on waitlist (optional)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter required' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from('premium_waitlist')
      .select('email, created_at')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !data) {
      return NextResponse.json({
        success: true,
        onWaitlist: false,
      })
    }

    return NextResponse.json({
      success: true,
      onWaitlist: true,
      joinedAt: data.created_at,
    })
  } catch (error) {
    console.error('Waitlist check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check waitlist status' },
      { status: 500 }
    )
  }
}
