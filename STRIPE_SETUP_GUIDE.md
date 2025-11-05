# Stripe Payment Integration Setup Guide

Complete guide for setting up Stripe payments for Daily Ticker Premium.

## Overview

This implementation includes:
- Two pricing tiers: Standard ($96/year) and Early Bird ($48/year)
- Stripe Checkout for hosted payment page
- Webhook handlers for subscription lifecycle
- Automatic tier upgrades in Supabase database
- Success/cancel pages for post-checkout UX

---

## Step 1: Create Stripe Account and Get API Keys

1. Go to [stripe.com](https://stripe.com) and create an account
2. Go to **Developers → API Keys**
3. Copy your **Publishable key** and **Secret key**
4. Add to `.env.local`:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Step 2: Create Products and Prices in Stripe Dashboard

### Option A: Via Stripe Dashboard (Recommended for first time)

1. Go to **Products** → **Add Product**
2. Create **Premium Annual** product:
   - Name: `Daily Ticker Premium`
   - Description: `AI-powered stock analysis with confidence scores, stop-loss levels, profit targets, and portfolio allocation guidance`
   - Pricing:
     - **Standard Price**: $96.00 USD / year (recurring annually)
     - **Early Bird Price**: $48.00 USD / year (recurring annually)

3. After creating, copy the Price IDs:
   - Click on each price → Copy the `price_...` ID
   - Add to `.env.local`:

```bash
# Stripe Product and Price IDs
STRIPE_PREMIUM_PRODUCT_ID=prod_...
STRIPE_STANDARD_PRICE_ID=price_...
STRIPE_EARLY_BIRD_PRICE_ID=price_...
```

### Option B: Via Stripe CLI (Automated)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create product and prices
stripe products create \
  --name="Daily Ticker Premium" \
  --description="AI-powered stock analysis with confidence scores, stop-loss levels, profit targets, and portfolio allocation guidance"

# Note the product ID (prod_...), then create prices:

# Standard price ($96/year)
stripe prices create \
  --product=prod_... \
  --unit-amount=9600 \
  --currency=usd \
  --recurring[interval]=year \
  --nickname="Standard Annual"

# Early bird price ($48/year)
stripe prices create \
  --product=prod_... \
  --unit-amount=4800 \
  --currency=usd \
  --recurring[interval]=year \
  --nickname="Early Bird Annual"
```

Copy the Price IDs to `.env.local` as shown above.

---

## Step 3: Set Up Webhook Endpoint

### 3.1: Configure Webhook Secret

For **local testing** with Stripe CLI:

```bash
# Forward webhooks to local server
stripe listen --forward-to http://localhost:3004/api/stripe/webhook

# CLI will output webhook signing secret (whsec_...)
# Add to .env.local:
STRIPE_WEBHOOK_SECRET=whsec_...
```

For **production** (Vercel):

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click **Add Endpoint**
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing Secret** (whsec_...)
6. Add to Vercel environment variables:

```bash
vercel env add STRIPE_WEBHOOK_SECRET
# Paste: whsec_...
```

---

## Step 4: Test the Payment Flow Locally

### 4.1: Start Development Server

```bash
npm run dev
```

### 4.2: Start Stripe Webhook Listener

In a **second terminal**:

```bash
stripe listen --forward-to http://localhost:3004/api/stripe/webhook
```

### 4.3: Test Checkout

1. Visit `http://localhost:3004/premium`
2. You'll need to add a checkout button (see Step 5)
3. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

### 4.4: Verify Webhook Events

Check the Stripe CLI terminal - you should see:
```
✓ checkout.session.completed
✓ customer.subscription.created
✓ invoice.payment_succeeded
```

Check your Supabase `subscribers` table:
- Tier should update to `premium`
- `stripe_customer_id`, `stripe_subscription_id`, and `stripe_subscription_status` should be populated

---

## Step 5: Add Checkout Button to Premium Page

Update `app/premium/page.tsx` to add a "Subscribe Now" button (for users who are ready to pay immediately):

```tsx
// Add this function inside the component
const handleCheckout = async (priceType: 'standard' | 'earlyBird') => {
  setLoading(true)
  try {
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceType, email }),
    })

    const data = await response.json()

    if (data.success && data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url
    } else {
      alert(data.error || 'Failed to create checkout session')
    }
  } catch (error) {
    alert('Something went wrong. Please try again.')
  } finally {
    setLoading(false)
  }
}

// Add button below the waitlist form
<button
  onClick={() => handleCheckout('earlyBird')}
  className="w-full px-6 py-4 bg-[#00ff88] text-[#0B1E32] font-bold rounded-lg hover:bg-[#00dd77] transition-colors"
>
  Subscribe Now - $48/year (Early Bird)
</button>
```

---

## Step 6: Deploy to Production

### 6.1: Add Environment Variables to Vercel

```bash
# Stripe keys
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Product/Price IDs
vercel env add STRIPE_PREMIUM_PRODUCT_ID
vercel env add STRIPE_STANDARD_PRICE_ID
vercel env add STRIPE_EARLY_BIRD_PRICE_ID

# Webhook secret (from Stripe Dashboard webhook endpoint)
vercel env add STRIPE_WEBHOOK_SECRET
```

### 6.2: Deploy

```bash
git push origin feature/free-vs-premium
# Merge to main and deploy, or deploy branch directly
vercel --prod
```

### 6.3: Verify Production Webhook

1. Go to Stripe Dashboard → Webhooks
2. Click on your production webhook endpoint
3. Send a test event: `checkout.session.completed`
4. Check logs - should return HTTP 200

---

## Step 7: Test End-to-End in Production

1. Visit your production site `/premium`
2. Click "Subscribe Now"
3. Complete checkout with test card
4. Verify redirect to `/checkout/success`
5. Check Supabase `subscribers` table for tier update
6. Try logging in with magic link
7. Visit `/archive/[date]` and verify premium features are unblurred

---

## Pricing Strategy

| Tier | Price | Annual Cost | Who Gets It |
|------|-------|-------------|-------------|
| **Free** | $0 | $0 | All new signups |
| **Premium (Early Bird)** | $4/mo | $48/year | Waitlist users only (50% off) |
| **Premium (Standard)** | $8/mo | $96/year | Public after waitlist |

**Early Bird Discount:**
- Exclusive to waitlist members
- 50% off for life (not just first year)
- Creates urgency and rewards early adopters
- Converts waitlist to paying customers

---

## Rollout Plan (Week 4)

1. **Days 1-7**: Send 50 invites/day from waitlist (350 total)
   - Include magic link + early bird checkout link
   - Subject: "You're off the waitlist! Get 50% off Premium"

2. **Days 8-14**: Scale to 100/day (700 more = 1,050 total)
   - Monitor conversion rate and support tickets

3. **Days 15-21**: Scale to 200/day (1,400 more = 2,450 total)
   - Fix any bugs and improve messaging

4. **Days 22+**: Send to all remaining waitlist
   - Announce "last chance" for early bird pricing

**Target Metrics:**
- 10-15% conversion from waitlist
- If 3,000 on waitlist → 300-450 paying customers
- $14,400 - $21,600 MRR ($48 * 300-450)

---

## Troubleshooting

### Webhook Not Firing

```bash
# Check webhook logs in Stripe Dashboard
# Verify signing secret matches .env.local
# Ensure URL is correct (no trailing slash)
# Test locally with Stripe CLI first
```

### Tier Not Updating

```bash
# Check webhook handler logs in Vercel
# Verify Supabase service role key is correct
# Check subscribers table RLS policies (should allow updates)
# Test webhook manually in Stripe Dashboard
```

### Checkout Session Not Creating

```bash
# Verify all environment variables are set
# Check that price IDs are correct
# Ensure NEXT_PUBLIC_SITE_URL is set correctly
# Check API logs in Vercel
```

---

## Security Notes

- Never expose `STRIPE_SECRET_KEY` in client-side code
- Always verify webhook signatures
- Use Stripe Checkout (hosted) to avoid PCI compliance
- Store only Stripe IDs in database, not payment details
- Set up billing alerts in Stripe Dashboard

---

## Support

For issues:
1. Check Stripe Dashboard → Logs
2. Check Vercel → Functions → Logs
3. Check Supabase → Logs
4. Email: brief@dailyticker.co

---

**🎉 Stripe integration complete! Ready to accept payments.**
