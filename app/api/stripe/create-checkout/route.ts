import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const { priceType, email } = await request.json()

    // Validate price type
    if (!priceType || !['standard', 'earlyBird'].includes(priceType)) {
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
    const priceId = priceType === 'earlyBird'
      ? STRIPE_PRICES.earlyBird
      : STRIPE_PRICES.standard

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Get site URL from environment or fallback to dailyticker.co
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dailyticker.co'

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
      cancel_url: `${siteUrl}/#pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
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
        metadata: {
          price_type: priceType,
        },
      }
      sessionConfig.metadata = {
        price_type: priceType,
      }
    }

    // Create Checkout Session
    const session_stripe = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({
      success: true,
      sessionId: session_stripe.id,
      url: session_stripe.url,
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
