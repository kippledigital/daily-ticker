# Free vs Premium Tier Implementation Plan

## Current State Analysis

### What's Currently Being Sent (✅ Confirmed Premium Data)
**Email includes ALL premium features:**
- Stop Loss prices
- Profit Target prices
- Confidence scores (0-100%)
- Risk/Reward ratios
- Ideal Entry Zone (price ranges)
- Suggested Portfolio Allocation (%)
- Risk levels
- Specific actionable insights

**Current Subscriber Structure:**
- Single `subscribers` table with `status` field (active/unsubscribed/bounced)
- No `tier` or `subscription_type` field
- No payment integration
- No authentication system
- Public archive (anyone can view)

---

## Implementation Strategy Overview

### Phase 1: Database & Email Generation (Foundation)
**Goal:** Create separate free and premium email content + subscriber tiers

### Phase 2: Stripe Integration (Payments)
**Goal:** Accept payments and manage subscriptions

### Phase 3: Authentication & Gated Content (Access Control)
**Goal:** Protect premium archive and enable account management

---

## Phase 1: Database & Email Generation

### 1.1 Update Subscribers Schema

**Add to `subscribers` table:**
```sql
ALTER TABLE subscribers
ADD COLUMN tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium'));

ADD COLUMN stripe_customer_id TEXT UNIQUE;
ADD COLUMN stripe_subscription_id TEXT UNIQUE;
ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing'));
ADD COLUMN current_period_end TIMESTAMPTZ;
ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
```

**Create indexes:**
```sql
CREATE INDEX idx_subscribers_tier ON subscribers(tier);
CREATE INDEX idx_subscribers_stripe_customer_id ON subscribers(stripe_customer_id);
CREATE INDEX idx_subscribers_subscription_status ON subscribers(subscription_status);
```

**Migration strategy:**
- All existing subscribers default to `tier = 'free'`
- Premium waitlist subscribers can be manually upgraded or auto-upgraded when premium launches

### 1.2 Create Dual Email Generation System

**Option A: Two Separate Templates (Recommended)**
```typescript
// lib/automation/email-generator.ts

export async function generateFreeEmail(params: EmailGenerationParams): Promise<EmailOutput> {
  // FREE VERSION:
  // - Stock tickers ✅
  // - Company descriptions ✅
  // - Recent price movements ✅
  // - What's happening ✅
  // - Current price ✅
  // - Sector info ✅
  // - General "what to watch" guidance ✅
  //
  // REMOVED:
  // - Stop Loss ❌
  // - Profit Target ❌
  // - Confidence scores ❌
  // - Ideal Entry Zone ❌
  // - Suggested Allocation ❌
  // - Risk/Reward ratios ❌
  // - Specific entry prices ❌
}

export async function generatePremiumEmail(params: EmailGenerationParams): Promise<EmailOutput> {
  // PREMIUM VERSION (current email):
  // Everything included ✅
}
```

**Option B: Single Template with Conditional Rendering**
```typescript
export async function generateEmail(params: EmailGenerationParams, tier: 'free' | 'premium'): Promise<EmailOutput> {
  const systemPrompt = tier === 'premium'
    ? PREMIUM_SYSTEM_PROMPT
    : FREE_SYSTEM_PROMPT;

  // ...
}
```

**Recommendation:** Option A (separate functions) for cleaner code and easier maintenance.

### 1.3 Update Daily Brief Cron Job

**Current:** `/api/cron/daily-brief` generates 1 email, sends to all subscribers

**New:** Generate 2 emails, send to segmented lists

```typescript
// app/api/cron/daily-brief/route.ts (Updated)

export async function POST(request: Request) {
  // 1. Fetch & validate stocks (same as now)
  const validatedStocks = await fetchAndValidateStocks();

  // 2. Generate BOTH emails
  const freeEmail = await generateFreeEmail({ stocks: validatedStocks, date });
  const premiumEmail = await generatePremiumEmail({ stocks: validatedStocks, date });

  // 3. Store BOTH in briefs table
  await storeBrief({
    date,
    subject_free: freeEmail.subject,
    html_content_free: freeEmail.htmlContent,
    subject_premium: premiumEmail.subject,
    html_content_premium: premiumEmail.htmlContent,
    tldr: premiumEmail.tldr, // Same for both
    stocks: validatedStocks
  });

  // 4. Send to segmented lists
  const freeSubscribers = await supabase
    .from('subscribers')
    .select('email')
    .eq('tier', 'free')
    .eq('status', 'active');

  const premiumSubscribers = await supabase
    .from('subscribers')
    .select('email')
    .eq('tier', 'premium')
    .eq('status', 'active');

  // 5. Send emails via Resend
  await sendBatchEmails(freeSubscribers, freeEmail);
  await sendBatchEmails(premiumSubscribers, premiumEmail);
}
```

### 1.4 Update Briefs Schema

**Add columns for free version:**
```sql
ALTER TABLE briefs
ADD COLUMN subject_free TEXT;
ADD COLUMN html_content_free TEXT;

-- Rename existing columns for clarity
ALTER TABLE briefs
RENAME COLUMN subject TO subject_premium;
RENAME COLUMN html_content TO html_content_premium;
```

**OR** (simpler approach):
```sql
-- Keep current structure, just store premium version
-- Free version generated on-the-fly when needed
-- Pro: Less storage, Con: Need to regenerate for archive access
```

**Recommendation:** Store both versions in database for:
- Faster archive page loads
- Audit trail of what was sent
- No risk of regeneration inconsistencies

---

## Phase 2: Stripe Integration

### 2.1 Stripe Setup

**Pricing Model:**
- **Free:** $0/month (current landing page positioning)
- **Premium:** $96/year ($8/month, billed annually)
- **Early Bird (optional):** $48/year for waitlist signups (50% off)

**Stripe Products to Create:**
1. "Daily Ticker Premium" - Annual subscription ($96/year)
2. "Daily Ticker Premium - Early Bird" - Annual subscription ($48/year, coupon-based or separate product)

### 2.2 Stripe Webhook Handler

**Create:** `/app/api/webhooks/stripe/route.ts`

**Handle events:**
```typescript
// Key Stripe events to handle:
- checkout.session.completed → Create/upgrade subscriber to premium
- customer.subscription.created → Set subscription_status = 'active'
- customer.subscription.updated → Update subscription details
- customer.subscription.deleted → Downgrade to free (cancel_at_period_end)
- invoice.payment_succeeded → Confirm renewal
- invoice.payment_failed → Set to 'past_due'
```

**Logic:**
```typescript
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      // Update or create subscriber
      await supabase
        .from('subscribers')
        .upsert({
          email: session.customer_email,
          tier: 'premium',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_status: 'active',
          current_period_end: session.subscription.current_period_end
        });

      // Send welcome email
      await sendPremiumWelcomeEmail(session.customer_email);
      break;

    case 'customer.subscription.deleted':
      // Downgrade to free at end of period
      await supabase
        .from('subscribers')
        .update({
          tier: 'free',
          subscription_status: 'canceled',
          cancel_at_period_end: true
        })
        .eq('stripe_subscription_id', event.data.object.id);
      break;
  }
}
```

### 2.3 Premium Waitlist Migration

**When launching premium:**
```typescript
// Script to migrate waitlist to premium with early bird pricing
const waitlistEmails = await supabase
  .from('premium_waitlist')
  .select('email, name');

for (const user of waitlistEmails) {
  // Create Stripe checkout session with early bird price
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{
      price: EARLY_BIRD_PRICE_ID, // $48/year
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${baseUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/premium`
  });

  // Send email with checkout link
  await sendEarlyBirdOfferEmail(user.email, session.url);
}
```

### 2.4 Checkout Flow

**Update premium waitlist page to payment page:**

**Option A:** Replace `/premium` waitlist page with Stripe checkout
```tsx
// app/premium/page.tsx (Updated)
export default function PremiumPage() {
  const handleCheckout = async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        priceId: PREMIUM_ANNUAL_PRICE_ID,
        email: userEmail
      })
    });

    const { url } = await response.json();
    window.location.href = url; // Redirect to Stripe checkout
  };

  return (
    // Show pricing, features, then checkout button
  );
}
```

**Option B:** Keep waitlist, send checkout links via email when ready
- More control over launch timing
- Can stagger invites
- Better for testing payment flow

---

## Phase 3: Authentication & Gated Content

### 3.1 Do You Need Authentication?

**Current State:**
- Archive is fully public (anyone can view past briefs)
- No user accounts
- No login system

**Questions:**
1. **Should free users be able to access the archive?**
   - Option A: Yes, but show free version of briefs
   - Option B: No, archive is premium-only
   - **Recommendation:** Option A (more user-friendly, shows value)

2. **Should premium users have accounts?**
   - Option A: Email-only (magic link authentication)
   - Option B: Email/password accounts
   - Option C: No accounts needed (just send premium emails)
   - **Recommendation:** Option C initially, add Option A later if needed

### 3.2 Archive Access Control

**If archive should show different content by tier:**

**Option A: Cookie-based identification (simple, no auth)**
```typescript
// When user subscribes (free or premium), set a secure cookie
// Cookie stores: { email, tier, signature }

// /api/archive/[date]/route.ts
export async function GET(request: Request) {
  const cookie = request.cookies.get('dt_subscriber');
  const tier = cookie ? verifyAndGetTier(cookie.value) : 'free';

  const brief = await supabase
    .from('briefs')
    .select(tier === 'premium' ? 'html_content_premium' : 'html_content_free')
    .eq('date', date)
    .single();

  return NextResponse.json({ data: brief });
}
```

**Option B: Email-based magic link (better UX)**
```typescript
// /app/archive/[date]/page.tsx
// If user not identified, show email input
// Send magic link: /archive/[date]?token=xyz
// Token verifies email and tier, sets cookie
// User can browse archive with proper tier content
```

**Option C: Keep archive public, gate only certain features**
```typescript
// Show everyone the free version of briefs in archive
// Premium users get:
// - Premium emails delivered daily
// - "View Premium Version" button in archive (requires magic link)
// - Access to performance data, analysis tools, etc.
```

**Recommendation:** Start with Option C (simplest), add Option B later if needed.

### 3.3 Supabase Auth vs Custom Auth vs No Auth

**Supabase Auth (Full Auth System):**
- ✅ Built-in authentication
- ✅ Password reset, email verification
- ✅ Social logins (Google, Twitter, etc.)
- ❌ More complex to implement
- ❌ Requires user account management UI
- ❌ Overkill if just showing different email versions

**Magic Link Only (Email-based, no passwords):**
- ✅ Frictionless UX
- ✅ No password management
- ✅ Easy to implement
- ✅ Good for gating archive access
- ❌ Requires email sending for every access
- ✅ Recommended for Phase 3

**No Auth (Stripe-only):**
- ✅ Simplest implementation
- ✅ Premium users just get better emails
- ✅ No account management needed
- ❌ Can't gate archive by tier
- ❌ Can't offer "manage subscription" portal
- ✅ Recommended for initial launch

---

## Implementation Phases Summary

### Phase 1: Email Tiers (2-3 days)
**Must-haves:**
1. Add `tier` column to subscribers table
2. Create `generateFreeEmail()` function (stripped-down version)
3. Update daily brief cron to generate both versions
4. Update briefs table to store both versions
5. Send segmented emails based on tier

**Deliverable:** Free users get limited emails, premium users get full emails (but no payment yet)

### Phase 2: Stripe Payments (3-4 days)
**Must-haves:**
1. Create Stripe products and prices
2. Build checkout flow (`/api/checkout` endpoint)
3. Create Stripe webhook handler (`/api/webhooks/stripe`)
4. Update premium page to show checkout button
5. Handle subscription lifecycle (active, canceled, past_due)
6. Test payment flow end-to-end

**Deliverable:** Users can pay $96/year for premium tier and receive premium emails

### Phase 3: Archive Access Control (2-3 days, OPTIONAL)
**Nice-to-haves:**
1. Add tier detection in archive API
2. Serve appropriate content based on tier
3. Add magic link authentication for archive access
4. Create "Upgrade to Premium" prompts in free archive view
5. Add "Manage Subscription" link for premium users

**Deliverable:** Archive shows free or premium content based on user tier

---

## What You're Missing (Additional Considerations)

### 1. **Stripe Customer Portal**
Allow premium users to:
- Update payment method
- View invoices
- Cancel subscription
- Update billing address

**Implementation:**
```typescript
// /api/create-portal-session/route.ts
export async function POST(request: Request) {
  const { customerId } = await request.json();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/account`
  });

  return NextResponse.json({ url: session.url });
}
```

Add link in premium emails: "Manage Subscription"

### 2. **Downgrade Flow**
What happens when premium subscriber cancels?
- Immediate downgrade? ❌ (bad UX, they paid for the month/year)
- Downgrade at period end? ✅ (recommended)
- Keep premium access until subscription expires

**Implementation:**
```typescript
// Stripe webhook handles this
case 'customer.subscription.updated':
  if (subscription.cancel_at_period_end) {
    await supabase
      .from('subscribers')
      .update({
        cancel_at_period_end: true,
        // Keep tier as 'premium' until current_period_end
      })
      .eq('stripe_subscription_id', subscription.id);
  }
  break;

// Daily cron job checks for expired subscriptions
// If current_period_end < now, downgrade tier to 'free'
```

### 3. **Upgrade Flow**
What happens when free user upgrades?
- Move from `free` → `premium` tier immediately
- Start sending premium emails next day
- Grant access to premium archive

**Implementation:**
```typescript
// Handled in checkout.session.completed webhook
// Update tier immediately upon successful payment
```

### 4. **Trial Period** (Optional)
Offer 7-day free trial of premium?
- Pros: Lower barrier, more conversions
- Cons: More complexity, need to handle trial_end

**Stripe Setup:**
```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  subscription_data: {
    trial_period_days: 7 // Free trial
  },
  // ...
});
```

### 5. **Prorated Upgrades** (Not needed for annual billing)
If you add monthly billing later, handle pro-rating:
- User signs up mid-month
- Stripe automatically handles this with `proration_behavior: 'create_prorations'`

### 6. **Tax Collection** (Important!)
**Stripe Tax** can automatically calculate and collect sales tax/VAT:
```typescript
const session = await stripe.checkout.sessions.create({
  automatic_tax: { enabled: true },
  // ...
});
```

Set this up in Stripe Dashboard: Settings → Tax

### 7. **Refund Policy & Handling**
- What's your refund policy? (30-day money-back guarantee?)
- How do you handle refunds?
  - Stripe dashboard manual refund
  - Downgrade user to free tier
  - Send "sorry to see you go" email

### 8. **Email Deliverability**
Premium emails have more content (stop-loss, targets, etc.)
- Might trigger spam filters more than free emails
- Monitor bounce rates separately for free vs premium
- Consider separate Resend domains for free vs premium

### 9. **Analytics & Tracking**
Track conversion metrics:
- Free → Premium conversion rate
- Premium churn rate
- Revenue per subscriber
- Email open rates (free vs premium)

**Add to Supabase:**
```sql
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id),
  event_type TEXT, -- 'subscribed_free', 'upgraded_premium', 'canceled', 'renewed'
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

### 10. **Performance Dashboard Visibility**
Current plan: Show only closed picks (public)
Premium plan:
- Should premium users see open positions in dashboard?
- Or is performance dashboard public for trust-building?

**Recommendation:** Keep performance dashboard public (closed picks only) for conversion. Premium users get the picks in their email before they're public.

---

## Recommended Implementation Order

### Week 1: Foundation
1. ✅ Add `tier` column to subscribers
2. ✅ Create free email template
3. ✅ Update cron to generate both emails
4. ✅ Test email segmentation locally

### Week 2: Payments
1. ✅ Set up Stripe account, create products
2. ✅ Build checkout flow
3. ✅ Implement webhook handler
4. ✅ Update premium page to accept payments
5. ✅ Test full payment cycle

### Week 3: Launch & Polish
1. ✅ Migrate premium waitlist users
2. ✅ Send early bird offers
3. ✅ Add Stripe Customer Portal
4. ✅ Monitor for issues
5. ✅ (Optional) Add archive tier detection

---

## Estimated Timeline

**Phase 1 (Email Tiers):** 2-3 days
**Phase 2 (Stripe Integration):** 3-4 days
**Phase 3 (Archive Gating, Optional):** 2-3 days

**Total:** ~1-2 weeks for core functionality

---

## Questions to Decide Before Implementation

1. **Should free users have access to the archive at all?**
   - A) Yes, show free version of briefs
   - B) No, archive is premium-only
   - C) Yes, show teaser with upgrade prompt

   **Recommendation:** Option A

2. **Do you want to offer a free trial?**
   - A) Yes, 7 days free
   - B) No, payment required immediately

   **Recommendation:** Option B (simpler, you're already cheap at $8/month)

3. **How should free emails look different?**
   - Remove all premium data (stop-loss, targets, confidence, allocation)
   - Show tickers and general insights
   - Add "Upgrade to Premium" CTA at bottom
   - Maybe show 1 stock fully, blur others with "Premium Only" overlay?

   **Recommendation:** Show all tickers but remove actionable data (entry zones, stop-loss, targets, allocation)

4. **When should you migrate the premium waitlist?**
   - A) Immediately after Stripe integration
   - B) After testing thoroughly
   - C) Gradually (50 users/day to test)

   **Recommendation:** Option C (staged rollout)

5. **Should archive be gated?**
   - A) No, keep public (trust-building)
   - B) Yes, require magic link to view premium briefs
   - C) Hybrid: Free version public, premium version gated

   **Recommendation:** Option C

---

## Next Steps

1. **Decide on answers to the 5 questions above**
2. **Review this plan and confirm approach**
3. **Create feature branch: `feature/free-vs-premium`**
4. **Start with Phase 1: Database schema + email generation**

Let me know which direction you want to go and I'll start implementing!
