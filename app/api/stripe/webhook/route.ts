import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'
import { sendWelcomeEmail } from '@/lib/emails/send-welcome-email'
import { sendSignupNotification } from '@/lib/emails/admin-notifications'

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

  // Get subscription details to get period dates
  let currentPeriodStart: string | undefined
  let currentPeriodEnd: string | undefined
  
  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any
      if (subscription?.current_period_start) {
        currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString()
      }
      if (subscription?.current_period_end) {
        currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()
      }
    } catch (err) {
      console.error('Error fetching subscription details:', err)
    }
  }

  // Check if subscriber exists
  const { data: existingSubscriber } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', email)
    .single()

  let isNewPremiumSubscriber = false;

  if (existingSubscriber) {
    // Update existing subscriber to premium
    const updateData: any = {
      tier: 'premium',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    }
    
    if (currentPeriodStart) updateData.current_period_start = currentPeriodStart
    if (currentPeriodEnd) updateData.current_period_end = currentPeriodEnd

    const { error } = await supabase
      .from('subscribers')
      .update(updateData)
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
    const insertData: any = {
      email,
      tier: 'premium',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    if (currentPeriodStart) insertData.current_period_start = currentPeriodStart
    if (currentPeriodEnd) insertData.current_period_end = currentPeriodEnd

    const { error } = await supabase
      .from('subscribers')
      .insert(insertData)

    if (error) {
      console.error('Error creating subscriber:', error)
    } else {
      console.log(`✅ Created premium subscriber: ${email}`)
      isNewPremiumSubscriber = true;
    }
  }

  // Send welcome email for new premium subscribers (await to catch errors)
  if (isNewPremiumSubscriber) {
    try {
      const emailResult = await sendWelcomeEmail({ email, tier: 'premium' });
      if (emailResult.success) {
        console.log(`✅ Premium welcome email sent successfully to ${email} (ID: ${emailResult.emailId})`);
      } else {
        console.error(`❌ Failed to send premium welcome email to ${email}:`, emailResult.error);
      }
    } catch (err) {
      console.error('❌ Exception sending premium welcome email:', err);
      // Don't fail the webhook if email fails
    }

    // Internal admin notification for new / upgraded premium signup (non-blocking)
    try {
      await sendSignupNotification({
        email,
        tier: 'premium',
        status: existingSubscriber ? 'upgraded' : 'new',
        source: 'stripe-webhook',
        timestamp: new Date(),
      });
    } catch (notifyError) {
      console.error('❌ Failed to send signup admin notification (premium):', notifyError);
    }
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

  // Update subscription status with period dates
  // Use type assertion to access period dates
  const sub = subscription as any
  const updateData: any = {
    subscription_status: status,
    tier: status === 'active' || status === 'trialing' ? 'premium' : 'free',
    updated_at: new Date().toISOString(),
  }

  if (sub.current_period_start) {
    updateData.current_period_start = new Date(sub.current_period_start * 1000).toISOString()
  }
  if (sub.current_period_end) {
    updateData.current_period_end = new Date(sub.current_period_end * 1000).toISOString()
  }
  if (sub.cancel_at_period_end !== undefined) {
    updateData.cancel_at_period_end = sub.cancel_at_period_end
  }

  const { error } = await supabase
    .from('subscribers')
    .update(updateData)
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

  // Use type assertion to access period dates
  const sub = subscription as any
  const updateData: any = {
    tier: 'free',
    subscription_status: 'canceled',
    updated_at: new Date().toISOString(),
  }

  if (sub.current_period_end) {
    updateData.current_period_end = new Date(sub.current_period_end * 1000).toISOString()
  }

  const { error } = await supabase
    .from('subscribers')
    .update(updateData)
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
      subscription_status: 'active',
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
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error updating after payment failure:', error)
  }
}
