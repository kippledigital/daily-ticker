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

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

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

    // Create Checkout Session
    const session_stripe = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/premium?canceled=true`,
      subscription_data: {
        metadata: {
          supabase_email: customerEmail,
          price_type: priceType,
        },
      },
      metadata: {
        supabase_email: customerEmail,
        price_type: priceType,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
      },
    })

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
