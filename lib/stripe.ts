import Stripe from 'stripe'

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
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
