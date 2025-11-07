# Phase 2: Archive Gating + Stripe Integration (Controlled Rollout)

## Strategy

**Keep the waitlist landing page as-is** and build Stripe infrastructure in parallel. Roll out premium access to waitlist users gradually (50/day) before public launch.

## Why This Approach?

1. ✅ **Higher conversion**: Waitlist converts 2-3x better than direct payment
2. ✅ **Test with real users**: Fix bugs with small group before scaling
3. ✅ **Early bird scarcity**: 50% discount only works with waitlist exclusivity
4. ✅ **Existing signups preserved**: Don't throw away collected emails
5. ✅ **Q1 2026 messaging**: Already set expectations, builds anticipation

## Phase 2 Tasks

### 1. Archive Tier Gating (Week 1)

**Goal**: Show free users what they're missing without giving it away.

#### A. Tier Detection System
- [ ] Create middleware to detect user's subscription tier
- [ ] Check if user is authenticated (magic link)
- [ ] Query Supabase for user's tier (free/premium)
- [ ] Pass tier to archive pages via context

#### B. BlurredPremium Component
```tsx
<BlurredPremium tier={userTier}>
  <div>
    <p>Confidence: 88%</p>
    <p>Stop Loss: $824.73</p>
    <p>Profit Target: $1,040.13</p>
  </div>
</BlurredPremium>
```

**Features**:
- Blur filter over premium content for free users
- Lock icon overlay with "Premium Feature" badge
- CTA: "Upgrade to Premium" → payment page
- Premium users see content unblurred

#### C. Archive Page Updates
- [ ] `/archive` - Show all briefs, premium content blurred for free users
- [ ] `/archive/[date]` - Show full detail, blur confidence/stop-loss/targets
- [ ] Email preview component - Already shows premium features (good teaser)

**What's Blurred for Free Users**:
- ❌ Confidence scores (88%)
- ❌ Stop-loss levels ($824.73)
- ❌ Profit targets ($1,040.13)
- ❌ Entry zones ($510-$515)
- ❌ Portfolio allocation % (8%)
- ❌ Risk/reward ratios (2:1)

**What Free Users See**:
- ✅ Ticker symbols (NVDA, AMD, MSFT)
- ✅ Sectors (Technology, Healthcare)
- ✅ Entry prices ($521.45)
- ✅ General market commentary
- ✅ "What to watch" guidance
- ✅ Learning Corner content

---

### 2. Magic Link Authentication (Week 1-2)

**Goal**: Users authenticate via email link to access archive.

#### A. Auth System
- [ ] Install NextAuth.js or Supabase Auth
- [ ] Email provider (Resend - already integrated)
- [ ] Session management (JWT tokens)
- [ ] Protected routes middleware

#### B. Login Flow
1. User visits `/archive` → prompted to log in
2. Enter email → magic link sent
3. Click link → authenticated → redirected to archive
4. Session stored (7 days)
5. Archive shows content based on tier

#### C. User Experience
- Free users: Log in → see blurred premium content → CTA to upgrade
- Premium users: Log in → see everything unblurred
- No passwords needed (magic link only)

**Auth Pages**:
- `/login` - Email input, send magic link
- `/auth/verify` - Token verification, set session
- `/auth/error` - Invalid/expired link handling

---

### 3. Stripe Integration (Week 2-3)

**Goal**: Accept payments, manage subscriptions, update user tiers.

#### A. Stripe Setup
- [ ] Create Stripe account (or use existing)
- [ ] Create product: "Daily Ticker Premium"
- [ ] Create price: $96/year (or $8/month)
- [ ] Early bird price: $48/year (50% off - coupon code)
- [ ] Test mode for development
- [ ] Get API keys (test + live)

#### B. Payment Flow
```
/premium/checkout → Stripe Checkout → /premium/success
                                    → /premium/cancel
```

**Pages**:
1. `/premium/checkout` - Stripe Checkout Session
   - Pre-fill email from magic link session
   - Show: $96/year or $48/year (early bird)
   - Stripe hosted checkout (no PCI compliance needed)

2. `/premium/success` - Post-payment
   - "Welcome to Premium!"
   - Check email for access
   - Link to archive

3. `/premium/cancel` - Payment cancelled
   - "No problem, you can upgrade anytime"
   - Link back to waitlist

#### C. Stripe Webhooks
- [ ] Create webhook endpoint: `/api/webhooks/stripe`
- [ ] Verify webhook signatures
- [ ] Handle events:
  - `checkout.session.completed` → Create subscriber, set tier=premium
  - `customer.subscription.created` → Store subscription_id
  - `customer.subscription.updated` → Update subscription status
  - `customer.subscription.deleted` → Downgrade to free tier
  - `invoice.payment_failed` → Mark as past_due
  - `invoice.payment_succeeded` → Mark as active

#### D. Database Updates
Already have these columns from Phase 1:
- `tier` (free/premium)
- `stripe_customer_id`
- `stripe_subscription_id`
- `subscription_status` (active/canceled/past_due)
- `current_period_start`
- `current_period_end`
- `cancel_at_period_end`

**Webhook Handler Flow**:
```typescript
1. Receive webhook from Stripe
2. Verify signature
3. Parse event type
4. Update Supabase subscribers table:
   - Set tier = 'premium'
   - Store stripe_customer_id
   - Store stripe_subscription_id
   - Set subscription_status = 'active'
   - Store period dates
5. Send welcome email (Resend)
```

---

### 4. Waitlist Rollout System (Week 3-4)

**Goal**: Gradually send payment links to waitlist users (50/day).

#### A. Rollout Script
```typescript
// scripts/send-premium-invites.ts
- Fetch 50 users from premium_waitlist (ORDER BY created_at, notified = false)
- Generate unique payment link for each (Stripe Checkout with email pre-filled)
- Send email: "You're in! Get 50% off Premium"
- Mark users as notified
- Run daily via cron
```

#### B. Email Template
**Subject**: "Your Daily Ticker Premium Access is Ready! 🎉"

**Body**:
```
Hey [Name],

You're off the waitlist! As an early supporter, you get 50% off for life.

Premium Features:
✅ AI Confidence Scores (know which picks to trust)
✅ Stop-Loss Levels (protect your capital)
✅ Profit Targets (know when to take profits)
✅ Entry Zones (save 3-5% on entries)
✅ Portfolio Allocation % (proper position sizing)

Your Early Bird Price: $48/year (normally $96)

[Get Premium Access →]

This offer expires in 48 hours.

- Scout & the Daily Ticker team

P.S. Questions? Just reply to this email.
```

#### C. Rollout Schedule
- **Day 1-7**: 50 users/day (350 total)
- **Day 8-14**: 100 users/day (700 total)
- **Day 15-21**: 200 users/day (1,400 total)
- **Day 22+**: All remaining waitlist users
- **Monitor**: Conversion rate, payment failures, support requests

#### D. Success Metrics
- **Target conversion**: 10-15% of waitlist → paid
- **Payment success rate**: >95%
- **Support tickets**: <5% of invites
- **Churn (first month)**: <10%

---

### 5. Testing Checklist (Before Rollout)

#### Payment Flow
- [ ] Test card: 4242 4242 4242 4242
- [ ] Successful payment → tier updated to premium
- [ ] Login → archive shows unblurred content
- [ ] Failed payment → error handling
- [ ] Cancelled payment → redirect to cancel page

#### Webhook Testing
- [ ] Use Stripe CLI to trigger test events
- [ ] `stripe listen --forward-to localhost:3004/api/webhooks/stripe`
- [ ] Trigger: `stripe trigger checkout.session.completed`
- [ ] Verify: Database updated, tier = premium
- [ ] Test subscription cancellation
- [ ] Test subscription renewal

#### Archive Gating
- [ ] Free user: Log in → see blurred content → CTA works
- [ ] Premium user: Log in → see everything unblurred
- [ ] Unauthenticated: Prompted to log in
- [ ] Expired session: Re-authenticate

#### Email Flow
- [ ] Magic link sends successfully
- [ ] Link works within 15 minutes
- [ ] Expired link shows error
- [ ] Payment success email sends
- [ ] Welcome email with archive link

---

## Implementation Order

### Week 1: Foundation
1. ✅ Create BlurredPremium component
2. ✅ Add tier detection to archive pages
3. ✅ Update archive UI to blur premium features
4. ✅ Test with manual tier toggle (no auth yet)

### Week 2: Authentication
1. ✅ Implement magic link auth (NextAuth or Supabase Auth)
2. ✅ Protected archive routes
3. ✅ Login/logout flow
4. ✅ Session management

### Week 3: Stripe
1. ✅ Stripe account setup, products/prices
2. ✅ Checkout page with session creation
3. ✅ Webhook handler for subscription events
4. ✅ Database tier updates via webhooks
5. ✅ Success/cancel pages

### Week 4: Testing & Rollout
1. ✅ End-to-end testing (test@example.com)
2. ✅ Test with your email (nikki.kipple@gmail.com)
3. ✅ Rollout script for waitlist invites
4. ✅ Send first 50 invites
5. ✅ Monitor, fix bugs, iterate

---

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Auth** | Supabase Auth or NextAuth.js | Magic links, session mgmt |
| **Payments** | Stripe Checkout | Hosted, no PCI compliance |
| **Webhooks** | Stripe webhooks | Real-time subscription updates |
| **Email** | Resend (already integrated) | Magic links, welcome emails |
| **Database** | Supabase (already setup) | Tier, subscription tracking |
| **UI Components** | Radix UI + Tailwind | Blur overlays, modals |

---

## Pricing Strategy

### Early Bird (Waitlist Only)
- **Annual**: $48/year (50% off)
- **Lifetime discount**: They keep 50% off forever (as long as subscribed)
- **Limited time**: 48 hours after receiving invite
- **Scarcity**: "Only for early supporters"

### Public Pricing (After Rollout)
- **Annual**: $96/year ($8/month equivalent)
- **Monthly**: $12/month (25% more expensive to incentivize annual)
- **No discount**: Regular price, no early bird offer

---

## Migration Path (Later: Phase 3)

Once most waitlist converted:
1. Add "Upgrade to Premium" CTA to landing page
2. Remove "Launching Q1 2026" badge
3. Open direct Stripe payments to public
4. Keep waitlist for "early access to new features"

---

## Questions to Consider

1. **Auth provider**: Supabase Auth (already using Supabase) or NextAuth.js (more flexible)?
2. **Stripe pricing**: Annual only ($96) or offer monthly ($12)?
3. **Early bird discount**: 50% off first year or lifetime?
4. **Rollout pace**: Start with 50/day or slower (25/day)?
5. **Magic link expiry**: 15 minutes or 1 hour?

**Recommendation**:
- Supabase Auth (easier integration)
- Annual only ($96) with early bird ($48 lifetime discount)
- Start with 50/day, monitor closely
- 15 minute magic link expiry (security)

---

## Success Criteria

**Phase 2 Complete When**:
- ✅ Archive shows blurred content for free users
- ✅ Premium users see everything unblurred
- ✅ Magic link auth working
- ✅ Stripe payment flow complete
- ✅ Webhooks updating database correctly
- ✅ First 50 waitlist users invited
- ✅ At least 5 paying customers
- ✅ No critical bugs or payment failures

**Target**: 10-15% conversion from waitlist (50-75 paying customers from first 500 invites)

---

## Next Steps (Right Now)

Want to start with:
1. **Archive gating UI** (BlurredPremium component)?
2. **Magic link auth** (get that working first)?
3. **Stripe setup** (products, prices, test checkout)?

Which would you like to tackle first?
