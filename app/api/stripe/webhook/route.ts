import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'
import { sendWelcomeEmail } from '@/lib/emails/send-welcome-email'

// Disable body parsing so we can verify the webhook signature
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email = session.metadata?.supabase_email || session.customer_email
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!email) {
    console.error('No email found in checkout session')
    return
  }

  console.log(`Checkout completed for ${email}`)

  // Check if subscriber exists
  const { data: existingSubscriber } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', email)
    .single()

  let isNewPremiumSubscriber = false;

  if (existingSubscriber) {
    // Update existing subscriber to premium
    const { error } = await supabase
      .from('subscribers')
      .update({
        tier: 'premium',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)

    if (error) {
      console.error('Error updating subscriber:', error)
    } else {
      console.log(`✅ Updated ${email} to premium tier`)
      // Only send welcome email if they were previously free (not already premium)
      isNewPremiumSubscriber = existingSubscriber.tier !== 'premium';
    }
  } else {
    // Create new premium subscriber
    const { error } = await supabase
      .from('subscribers')
      .insert({
        email,
        tier: 'premium',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error creating subscriber:', error)
    } else {
      console.log(`✅ Created premium subscriber: ${email}`)
      isNewPremiumSubscriber = true;
    }
  }

  // Send welcome email for new premium subscribers (non-blocking)
  if (isNewPremiumSubscriber) {
    sendWelcomeEmail({ email, tier: 'premium' }).catch((err) => {
      console.error('Failed to send premium welcome email:', err);
      // Don't fail the webhook if email fails
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id
  const status = subscription.status

  console.log(`Subscription ${subscriptionId} updated: ${status}`)

  // Find subscriber by stripe_customer_id
  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!subscriber) {
    console.error(`No subscriber found for customer ${customerId}`)
    return
  }

  // Update subscription status
  const { error } = await supabase
    .from('subscribers')
    .update({
      stripe_subscription_status: status,
      tier: status === 'active' || status === 'trialing' ? 'premium' : 'free',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error updating subscription status:', error)
  } else {
    console.log(`✅ Updated subscription status for ${subscriber.email}: ${status}`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id

  console.log(`Subscription ${subscriptionId} deleted`)

  // Find subscriber and downgrade to free
  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!subscriber) {
    console.error(`No subscriber found for customer ${customerId}`)
    return
  }

  const { error } = await supabase
    .from('subscribers')
    .update({
      tier: 'free',
      stripe_subscription_status: 'canceled',
      subscription_end_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error downgrading subscriber:', error)
  } else {
    console.log(`✅ Downgraded ${subscriber.email} to free tier`)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  console.log(`Payment succeeded for customer ${customerId}`)

  // Update subscription status to ensure it's active
  const { error } = await supabase
    .from('subscribers')
    .update({
      stripe_subscription_status: 'active',
      tier: 'premium',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error updating after payment success:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  console.log(`Payment failed for customer ${customerId}`)

  // Update subscription status
  const { error } = await supabase
    .from('subscribers')
    .update({
      stripe_subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error updating after payment failure:', error)
  }
}
