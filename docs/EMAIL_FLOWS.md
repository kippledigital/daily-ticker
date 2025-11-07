# Email Flows Documentation

This document maps out all email flows in the Daily Ticker system, including welcome emails and daily briefs.

## Overview

Daily Ticker sends three types of emails:
1. **Welcome Emails** - Sent immediately after signup (transactional)
2. **Daily Briefs** - Sent daily at 8 AM EST (automated)
3. **Magic Link Emails** - Sent when users request archive access (authentication)

---

## Welcome Email Flows

### Free Tier Signup Flow

```
User submits email → /api/subscribe
  ↓
Validate email format
  ↓
Insert/update in Supabase (tier: 'free', status: 'active')
  ↓
Send Free Welcome Email (non-blocking)
  ↓
Return success response
```

**Trigger:** `POST /api/subscribe`  
**Email Template:** `generateFreeWelcomeEmail()`  
**Subject:** "🎉 Welcome to Daily Ticker — Your first brief arrives tomorrow!"  
**Content:**
- Welcome message
- What they'll get (free tier features)
- Upgrade to Pro CTA
- Next steps (first brief at 8 AM EST)
- Footer with links

**Files:**
- `app/api/subscribe/route.ts` - Handles signup and triggers email
- `lib/emails/welcome-email-templates.ts` - Generates email HTML
- `lib/emails/send-welcome-email.ts` - Sends via Resend

---

### Premium Tier Signup Flow

```
User completes Stripe checkout
  ↓
Stripe webhook: checkout.session.completed
  ↓
Update/create in Supabase (tier: 'premium', status: 'active')
  ↓
Send Premium Welcome Email (non-blocking)
  ↓
Return webhook success
```

**Trigger:** Stripe webhook `checkout.session.completed`  
**Handler:** `handleCheckoutCompleted()` in `app/api/stripe/webhook/route.ts`  
**Email Template:** `generatePremiumWelcomeEmail()`  
**Subject:** "🚀 Welcome to Daily Ticker Pro — You now have the full toolkit!"  
**Content:**
- Welcome message with Pro badge
- Pro toolkit features (confidence scores, stop-losses, etc.)
- Example preview of Pro brief format
- Next steps
- 60-day money-back guarantee
- Footer with links

**Files:**
- `app/api/stripe/webhook/route.ts` - Handles webhook and triggers email
- `lib/emails/welcome-email-templates.ts` - Generates email HTML
- `lib/emails/send-welcome-email.ts` - Sends via Resend

**Note:** Welcome email only sent if:
- New premium subscriber (didn't exist before), OR
- Existing subscriber upgrading from free to premium

---

## Magic Link Authentication Email Flow

### Archive Access Flow

```
User visits /archive or /login
  ↓
User enters email on /login page
  ↓
Supabase Auth sends magic link email (via Supabase, not Resend)
  ↓
User clicks magic link in email
  ↓
Redirected to /auth/callback?code=xxx
  ↓
Supabase verifies token
  ↓
User authenticated → redirected to /archive (or requested page)
```

**Trigger:** User clicks "Send Magic Link" on `/login` page  
**Handler:** `app/login/page.tsx` → `supabase.auth.signInWithOtp()`  
**Email Sender:** Supabase Auth (not Resend)  
**Subject:** "Confirm your signup" (default, can be customized)  
**Content:** Magic link button that expires in 15 minutes  
**Redirect URL:** `/auth/callback` → then to `/archive` or requested page

**Files:**
- `app/login/page.tsx` - Login UI and magic link request
- `app/auth/callback/route.ts` - Handles magic link verification
- `lib/supabase-auth.ts` - Supabase client configuration

**Note:** The magic link email template can be customized in Supabase Dashboard under Authentication → Email Templates. You can match it to Daily Ticker branding.

---

## Daily Brief Email Flows

### Free Tier Daily Brief

```
Cron job runs daily at 8 AM EST
  ↓
Generate free email content (stripped-down version)
  ↓
Query Supabase for all active free tier subscribers
  ↓
Send email to all free subscribers via Resend
  ↓
Store in archive
```

**Trigger:** Automated cron job (Vercel Cron or similar)  
**Handler:** `lib/automation/orchestrator.ts` → `runDailyAutomation()`  
**Email Generator:** `lib/automation/email-generator-free.ts`  
**Content Includes:**
- Stock tickers and prices
- Sector analysis
- What happened & why it matters
- Basic risk assessment
- Learning corner
- ❌ NO confidence scores
- ❌ NO stop-loss/profit targets
- ❌ NO entry zones
- ❌ NO allocation %

---

### Premium Tier Daily Brief

```
Cron job runs daily at 8 AM EST
  ↓
Generate premium email content (full-featured version)
  ↓
Query Supabase for all active premium tier subscribers
  ↓
Send email to all premium subscribers via Resend
  ↓
Store in archive
```

**Trigger:** Automated cron job (Vercel Cron or similar)  
**Handler:** `lib/automation/orchestrator.ts` → `runDailyAutomation()`  
**Email Generator:** `lib/automation/email-generator.ts`  
**Content Includes:**
- ✅ Everything from free tier, PLUS:
- ✅ AI confidence scores (0-100%)
- ✅ Stop-loss levels
- ✅ Profit targets
- ✅ Precise entry zones
- ✅ Portfolio allocation %
- ✅ Full risk breakdown
- ✅ Daily learning moments

---

## Email Branding

All emails use consistent branding matching the Daily Ticker website:

**Colors:**
- Background: `#0B1E32` (dark blue)
- Accent: `#00ff88` (green)
- Secondary: `#1a3a52` (darker blue)
- Text: `#F0F0F0` (light gray)

**Typography:**
- Headers: `Space Mono` (monospace)
- Body: `Inter` (sans-serif)

**Structure:**
- Header with logo and tagline
- Main content area with sections
- Footer with links (archive, privacy, unsubscribe)

---

## Email Sending Infrastructure

**Service:** Resend (`resend.com`)  
**From Address:** `brief@dailyticker.co` (configured via `RESEND_FROM_EMAIL` env var)  
**API Key:** `RESEND_API_KEY` env var

**Email Tags (for analytics):**
- `campaign`: 'welcome-email' or 'morning-brief'
- `tier`: 'free' or 'premium'
- `date`: ISO date string
- `type`: 'transactional' or 'automated'

---

## Error Handling

**Welcome Emails:**
- Sent asynchronously (non-blocking)
- Failures logged but don't fail the API request
- User still gets success response even if email fails

**Daily Briefs:**
- Failures logged in automation orchestrator
- Retry logic handled by cron job
- Both free and premium emails must succeed for step to be marked complete

---

## Testing

### Test Welcome Emails

1. **Free tier:**
   ```bash
   curl -X POST http://localhost:3000/api/subscribe \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. **Premium tier:**
   - Complete Stripe checkout in test mode
   - Or manually trigger webhook with test data

### Test Daily Briefs

Use the test endpoint:
```bash
curl -X GET http://localhost:3000/api/test/send-email?email=test@example.com
```

---

## Unsubscribe Flow

**URL:** `/unsubscribe?email={email}`  
**Action:** Updates subscriber status to 'unsubscribed' in Supabase  
**Result:** User no longer receives daily briefs or marketing emails

**Note:** Welcome emails are transactional and sent immediately, so they may still arrive if unsubscribe happens during signup flow.

---

## Future Enhancements

Potential additions to email flows:
- [ ] Reactivation email for unsubscribed users who resubscribe
- [ ] Upgrade reminder emails for free users (after X days)
- [ ] Payment confirmation emails (handled by Stripe)
- [ ] Subscription renewal reminders
- [ ] Cancellation confirmation emails
- [ ] Win rate performance emails (monthly for premium users)

---

## File Structure

```
lib/
  emails/
    welcome-email-templates.ts    # Email HTML templates
    send-welcome-email.ts         # Resend integration
  automation/
    email-generator.ts            # Premium daily brief generator
    email-generator-free.ts        # Free daily brief generator
    email-sender.ts               # Daily brief sender
    orchestrator.ts               # Daily automation runner

app/
  api/
    subscribe/
      route.ts                    # Free signup endpoint
    stripe/
      webhook/
        route.ts                  # Premium signup webhook
```

---

## Environment Variables Required

```bash
# Resend
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=brief@dailyticker.co

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=https://daily-ticker.vercel.app
```

---

## Summary

**Welcome Emails:**
- ✅ Free: Sent on `/api/subscribe` success
- ✅ Premium: Sent on Stripe `checkout.session.completed`
- ✅ Branded to match site design
- ✅ Non-blocking (don't fail requests)

**Daily Briefs:**
- ✅ Free: Stripped-down version daily at 8 AM EST
- ✅ Premium: Full-featured version daily at 8 AM EST
- ✅ Both stored in archive
- ✅ Sent via Resend with analytics tags

