import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase-auth'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.checkout)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMITS.checkout.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      )
    }

    const { priceType, email } = await request.json()

    // Validate price type
    if (!priceType || !['standard', 'monthly', 'earlyBird'].includes(priceType)) {
      return NextResponse.json(
        { error: 'Invalid price type' },
        { status: 400 }
      )
    }

    // Get authenticated user (optional - can checkout without account)
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    // Use session email or provided email
    const customerEmail = session?.user?.email || email

    // Get the appropriate price ID
    let priceId: string
    if (priceType === 'earlyBird') {
      priceId = STRIPE_PRICES.earlyBird
    } else if (priceType === 'monthly') {
      priceId = STRIPE_PRICES.monthly
    } else {
      priceId = STRIPE_PRICES.standard
    }

    // Trim any whitespace/newlines (extra safety)
    priceId = priceId.trim()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Validate price ID format (should start with 'price_')
    if (!priceId.startsWith('price_')) {
      console.error('[CHECKOUT] Invalid price ID format:', priceId)
      return NextResponse.json(
        { error: 'Invalid price ID format. Please contact support.' },
        { status: 500 }
      )
    }

    console.log('[CHECKOUT] Using price ID:', priceId, '(length:', priceId.length, ')')

    // Get site URL from environment or fallback to dailyticker.co
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dailyticker.co'
    
    // Ensure siteUrl doesn't have trailing slash and is valid
    siteUrl = siteUrl.replace(/\/$/, '')
    
    // Validate URL format
    try {
      new URL(siteUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid site URL configuration. Please contact support.' },
        { status: 500 }
      )
    }

    console.log('[CHECKOUT] Site URL:', siteUrl)
    console.log('[CHECKOUT] Env var:', process.env.NEXT_PUBLIC_SITE_URL)

    // Prepare checkout session config
    const sessionConfig: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?canceled=true`, // Removed hash fragment - Stripe doesn't support it
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      // Customize the subscription description based on price type
      subscription_data: {
        description: priceType === 'monthly' 
          ? 'Daily Ticker Pro - Monthly Subscription'
          : 'Daily Ticker Pro - Annual Subscription',
      },
    }

    // If we have an email, try to use existing customer or create new one
    if (customerEmail) {
      // Check if subscriber already exists
      const { data: existingSubscriber } = await supabase
        .from('subscribers')
        .select('email, tier, stripe_customer_id')
        .eq('email', customerEmail)
        .single()

      // Create or retrieve Stripe customer
      let customerId = existingSubscriber?.stripe_customer_id

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            supabase_email: customerEmail,
          },
        })
        customerId = customer.id
      }

      sessionConfig.customer = customerId
      sessionConfig.customer_update = {
        address: 'auto',
      }
      sessionConfig.subscription_data = {
        description: priceType === 'monthly' 
          ? 'Daily Ticker Pro - Monthly Subscription'
          : 'Daily Ticker Pro - Annual Subscription',
        metadata: {
          supabase_email: customerEmail,
          price_type: priceType,
        },
      }
      sessionConfig.metadata = {
        supabase_email: customerEmail,
        price_type: priceType,
      }
    } else {
      // No email - let Stripe collect it during checkout
      sessionConfig.customer_email = undefined // Stripe will prompt for email
      sessionConfig.subscription_data = {
        description: priceType === 'monthly' 
          ? 'Daily Ticker Pro - Monthly Subscription'
          : 'Daily Ticker Pro - Annual Subscription',
        metadata: {
          price_type: priceType,
        },
      }
      sessionConfig.metadata = {
        price_type: priceType,
      }
    }

    // Create Checkout Session
    console.log('[CHECKOUT] Creating Stripe session with config:', JSON.stringify({
      line_items: sessionConfig.line_items,
      mode: sessionConfig.mode,
      success_url: sessionConfig.success_url,
      cancel_url: sessionConfig.cancel_url,
    }))

    const session_stripe = await stripe.checkout.sessions.create(sessionConfig)

    // Validate that we got a URL back from Stripe
    if (!session_stripe.url) {
      console.error('[CHECKOUT] Stripe session created but URL is null:', session_stripe.id)
      return NextResponse.json(
        { error: 'Failed to generate checkout URL. Please try again or contact support.' },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      success: true,
      sessionId: session_stripe.id,
      url: session_stripe.url,
    })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMITS.checkout.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())

    return response
  } catch (error: any) {
    console.error('[CHECKOUT] Full error:', error)
    console.error('[CHECKOUT] Error message:', error.message)
    console.error('[CHECKOUT] Error type:', error.type)
    console.error('[CHECKOUT] Error code:', error.code)
    return NextResponse.json(
      {
        error: error.message || 'Failed to create checkout session',
        details: error.type || 'unknown',
        code: error.code || 'unknown'
      },
      { status: 500 }
    )
  }
}
