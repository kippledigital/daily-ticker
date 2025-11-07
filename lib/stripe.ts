import Stripe from 'stripe'

// Initialize Stripe with secret key (lazy initialization to avoid build-time errors)
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// Backwards compatibility export
export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => {
    return (getStripe() as any)[prop]
  },
})

// Pricing configuration
export const PRICING = {
  standard: {
    price: 9600, // $96.00 in cents
    displayPrice: '$96',
    interval: 'year' as const,
    description: 'Standard Annual',
  },
  earlyBird: {
    price: 4800, // $48.00 in cents (50% off)
    displayPrice: '$48',
    interval: 'year' as const,
    description: 'Early Bird Annual (50% off)',
  },
}

// Stripe product and price IDs (will be set after creating in Stripe Dashboard)
export const STRIPE_PRODUCTS = {
  premium: process.env.STRIPE_PREMIUM_PRODUCT_ID || '',
  earlyBird: process.env.STRIPE_EARLY_BIRD_PRODUCT_ID || '',
}

export const STRIPE_PRICES = {
  standard: process.env.STRIPE_STANDARD_PRICE_ID || '',
  earlyBird: process.env.STRIPE_EARLY_BIRD_PRICE_ID || '',
}
