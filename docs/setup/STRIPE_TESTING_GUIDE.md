# Stripe Payment Testing Guide

Complete guide for testing Stripe payments in **test mode**.

## Prerequisites

1. ✅ Stripe account in **test mode** (you'll see "TEST MODE" badge in Stripe Dashboard)
2. ✅ Test API keys configured in `.env.local`:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - `STRIPE_STANDARD_PRICE_ID=price_...`
   - `STRIPE_MONTHLY_PRICE_ID=price_...` (if using monthly)
3. ✅ Stripe CLI installed (for webhook testing)

---

## Step 1: Set Up Webhook Listener (Local Testing)

For local development, you need to forward Stripe webhooks to your local server:

```bash
# Install Stripe CLI (if not installed)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

**Important:** The CLI will output a webhook signing secret (starts with `whsec_...`). Add this to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Note:** If your dev server runs on a different port (e.g., 3004), adjust the URL accordingly.

---

## Step 2: Start Your Development Server

```bash
npm run dev
```

Your app should be running at `http://localhost:3000` (or your configured port).

---

## Step 3: Test the Checkout Flow

### 3.1: Navigate to Pricing

1. Go to your homepage: `http://localhost:3000`
2. Scroll to the pricing section (or click "Go Pro" in header)
3. You should see the toggle switch for Monthly/Yearly

### 3.2: Click Checkout Button

1. Select either "Monthly" or "Yearly" using the toggle
2. Click the checkout button (e.g., "$96/year (Save 20%)" or "$10/month")
3. You should be redirected to Stripe Checkout page

### 3.3: Use Test Card Numbers

On the Stripe Checkout page, use these **test card numbers**:

#### ✅ Success Cards

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | **Most common** - Always succeeds |
| `5555 5555 5555 4444` | Mastercard - Always succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |

#### ❌ Failure Cards

| Card Number | Description |
|------------|-------------|
| `4000 0000 0000 0002` | Card declined (generic decline) |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0341` | Payment requires authentication (3D Secure) |

#### 📝 Test Card Details

For all test cards, use:
- **Expiry Date**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP Code**: Any 5 digits (e.g., `12345`)

### 3.4: Complete Checkout

1. Enter test card: `4242 4242 4242 4242`
2. Enter any future expiry date
3. Enter any CVC
4. Enter any ZIP code
5. Click "Subscribe" or "Pay"

---

## Step 4: Verify Payment Success

### 4.1: Check Redirect

After successful payment, you should be redirected to:
```
http://localhost:3000/checkout/success?session_id=cs_test_...
```

You should see the success page with:
- ✅ "Welcome to Premium! 🎉" message
- ✅ List of premium features
- ✅ Session ID displayed at bottom

### 4.2: Check Stripe CLI Output

In your Stripe CLI terminal, you should see events like:
```
2025-11-07 13:30:15   --> checkout.session.completed [evt_...]
2025-11-07 13:30:15   --> customer.subscription.created [evt_...]
2025-11-07 13:30:15   --> invoice.payment_succeeded [evt_...]
```

### 4.3: Check Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test)
2. Navigate to **Payments** → You should see the test payment
3. Navigate to **Customers** → You should see a new customer
4. Navigate to **Subscriptions** → You should see an active subscription

### 4.4: Check Your Database

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor** → `subscribers` table
3. Find the subscriber by email (the one you used in checkout)
4. Verify:
   - ✅ `tier` = `'premium'`
   - ✅ `stripe_customer_id` = `cus_...` (not null)
   - ✅ `stripe_subscription_id` = `sub_...` (not null)
   - ✅ `stripe_subscription_status` = `'active'`

---

## Step 5: Test Webhook Events

### 5.1: View Webhook Logs

In Stripe Dashboard:
1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View **Events** tab to see all webhook events

### 5.2: Test Different Scenarios

#### Test Payment Failure

1. Use card: `4000 0000 0000 0002` (declined)
2. Complete checkout
3. Check webhook events for `invoice.payment_failed`
4. Verify database: `stripe_subscription_status` = `'past_due'`

#### Test 3D Secure

1. Use card: `4000 0025 0000 3155`
2. Complete checkout
3. You'll be prompted for 3D Secure authentication
4. Use test authentication code: `1234`
5. Payment should succeed

---

## Step 6: Test Subscription Management

### 6.1: Cancel Subscription (via Stripe Dashboard)

1. Go to Stripe Dashboard → **Subscriptions**
2. Find the test subscription
3. Click **Cancel subscription**
4. Check webhook events: `customer.subscription.deleted`
5. Verify database: `tier` = `'free'` (or `stripe_subscription_status` = `'canceled'`)

### 6.2: Test Subscription Renewal

For monthly subscriptions, you can simulate renewal:
1. Go to Stripe Dashboard → **Subscriptions**
2. Find the subscription
3. Click **Actions** → **Update subscription**
4. Change billing cycle or trigger invoice

---

## Step 7: Test on Production URL (Vercel)

If you want to test on your deployed site:

### 7.1: Set Up Production Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
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

### 7.2: Test on Production

1. Visit your production URL: `https://yourdomain.com`
2. Go through checkout flow
3. Use test card: `4242 4242 4242 4242`
4. Verify webhook events in Stripe Dashboard
5. Check Vercel logs for webhook processing

---

## Common Issues & Solutions

### Issue: Webhook not processing

**Symptoms:** Payment succeeds but database not updated

**Solutions:**
1. Check webhook secret is correct in `.env.local`
2. Check Stripe CLI is running (for local testing)
3. Check Vercel logs for webhook errors (for production)
4. Verify webhook endpoint URL is correct

### Issue: "Invalid price ID"

**Symptoms:** Error when clicking checkout button

**Solutions:**
1. Verify `STRIPE_STANDARD_PRICE_ID` and `STRIPE_MONTHLY_PRICE_ID` are set
2. Verify price IDs start with `price_`
3. Verify prices are in **test mode** (not live mode)
4. Check for trailing newlines in environment variables

### Issue: Redirect not working

**Symptoms:** Stuck on Stripe checkout page

**Solutions:**
1. Verify `NEXT_PUBLIC_SITE_URL` is set correctly
2. Check `success_url` and `cancel_url` in checkout session
3. Verify URLs don't have hash fragments (`#`)

---

## Test Checklist

- [ ] Checkout button redirects to Stripe
- [ ] Test card `4242 4242 4242 4242` works
- [ ] Success page displays after payment
- [ ] Webhook events fire (check Stripe CLI or Dashboard)
- [ ] Database updated (`tier` = `'premium'`)
- [ ] Customer created in Stripe Dashboard
- [ ] Subscription created in Stripe Dashboard
- [ ] Payment appears in Stripe Dashboard
- [ ] Monthly and yearly options both work
- [ ] Cancel subscription works (via Stripe Dashboard)

---

## Additional Test Cards

For more scenarios, see [Stripe Test Cards Documentation](https://stripe.com/docs/testing#cards)

### International Cards
- `4000 0000 0000 3220` - 3D Secure (Visa)
- `5200 8282 8282 8210` - Mastercard (3D Secure)

### Special Scenarios
- `4000 0000 0000 3055` - Requires authentication
- `4000 0000 0000 9995` - Insufficient funds
- `4000 0000 0000 0002` - Card declined

---

## Next Steps

Once testing is complete:
1. ✅ Verify all test scenarios work
2. ✅ Check database updates correctly
3. ✅ Test subscription cancellation
4. ✅ Ready to switch to **live mode** (when ready)

**Important:** Never use test cards in production. Stripe will automatically use live mode when you switch your API keys to live keys.


