# All Emails Overview

Complete list of all emails sent by Daily Ticker system, including implemented and planned emails.

---

## ✅ Currently Implemented Emails

### 1. Welcome Emails (Transactional)

**Free Tier Welcome Email**
- **Trigger:** User signs up via `/api/subscribe`
- **When:** Immediately after successful subscription
- **Subject:** "🎉 Welcome to Daily Ticker — Your first brief arrives tomorrow!"
- **Recipient:** New free subscribers
- **Status:** ✅ Implemented
- **File:** `lib/emails/welcome-email-templates.ts` → `generateFreeWelcomeEmail()`

**Premium Tier Welcome Email**
- **Trigger:** Stripe webhook `checkout.session.completed`
- **When:** Immediately after successful premium purchase
- **Subject:** "🚀 Welcome to Daily Ticker Pro — You now have the full toolkit!"
- **Recipient:** New premium subscribers (or free users upgrading)
- **Status:** ✅ Implemented
- **File:** `lib/emails/welcome-email-templates.ts` → `generatePremiumWelcomeEmail()`

---

### 2. Daily Brief Emails (Automated)

**Free Tier Daily Brief**
- **Trigger:** Cron job daily at 8 AM EST
- **When:** Every weekday morning
- **Subject:** AI-generated (e.g., "🚀 NVDA Surges | Tech Leads Market Rally")
- **Recipient:** All active free tier subscribers
- **Content:** Stock picks, prices, sectors, basic analysis
- **Status:** ✅ Implemented
- **File:** `lib/automation/email-generator-free.ts`

**Premium Tier Daily Brief**
- **Trigger:** Cron job daily at 8 AM EST
- **When:** Every weekday morning
- **Subject:** AI-generated (same format as free)
- **Recipient:** All active premium tier subscribers
- **Content:** Full features (confidence scores, stop-losses, profit targets, entry zones, allocation %)
- **Status:** ✅ Implemented
- **File:** `lib/automation/email-generator.ts`

---

### 3. Test/Preview Emails (Development)

**Test Email**
- **Trigger:** Manual API call `/api/test/send-email?email=test@example.com`
- **When:** On-demand for testing
- **Subject:** "[TEST] 📈 Daily Ticker Test Email"
- **Recipient:** Specified test email
- **Status:** ✅ Implemented
- **File:** `app/api/test/send-email/route.ts`

**Brief Preview Email**
- **Trigger:** Manual API call `/api/manual/send-brief-preview?email=test@example.com`
- **When:** On-demand for previewing email design
- **Subject:** Generated brief subject + "(Preview)"
- **Recipient:** Specified test email
- **Content:** Sample stock data with full premium format
- **Status:** ✅ Implemented
- **File:** `app/api/manual/send-brief-preview/route.ts`

---

### 4. Admin/System Emails (Internal)

**Error Notification Email**
- **Trigger:** Daily automation fails
- **When:** When any step in automation fails
- **Recipient:** Admin email (`ADMIN_EMAIL` env var, defaults to `nikki.kipple@gmail.com`)
- **Subject:** "🚨 Daily Ticker Automation Failed - [Step Name]"
- **Content:** Error details, failed step, troubleshooting steps
- **Status:** ✅ Implemented
- **File:** `lib/automation/error-notifier.ts` → `sendErrorNotification()`

**Success Notification Email**
- **Trigger:** Daily automation completes successfully
- **When:** Only if `SEND_SUCCESS_NOTIFICATIONS` env var is set
- **Recipient:** Admin email
- **Subject:** "✅ Daily Ticker Brief Sent - [Tickers]"
- **Content:** Automation stats (stocks discovered, emails sent, execution time)
- **Status:** ✅ Implemented (optional)
- **File:** `lib/automation/error-notifier.ts` → `sendSuccessNotification()`

---

### 5. Magic Link Authentication Email (Handled by Supabase Auth)

**Magic Link Email**
- **Trigger:** User requests magic link via `/login` page
- **When:** User clicks "Send Magic Link" button
- **Recipient:** Email address entered by user
- **Subject:** "Confirm your signup" (default Supabase template)
- **Content:** Magic link button that expires in 15 minutes
- **Redirect:** `/auth/callback` → then redirects to `/archive` or requested page
- **Status:** ✅ Implemented (Supabase Auth handles sending)
- **Note:** Email template can be customized in Supabase Dashboard under Authentication → Email Templates
- **File:** `app/login/page.tsx` triggers via `supabase.auth.signInWithOtp()`

---

### 6. Stripe Emails (Handled by Stripe, Not Resend)

**Payment Confirmation Email**
- **Trigger:** Stripe automatically sends after successful payment
- **When:** Immediately after checkout completion
- **Recipient:** Customer email
- **Subject:** "Payment received: Daily Ticker Premium"
- **Content:** Receipt, invoice, billing details
- **Status:** ✅ Automatic (Stripe handles this)
- **Note:** You don't need to implement this - Stripe sends it automatically

**Invoice Emails**
- **Trigger:** Stripe automatically sends for recurring payments
- **When:** Monthly/annual billing cycle
- **Recipient:** Customer email
- **Status:** ✅ Automatic (Stripe handles this)

**Payment Failed Email**
- **Trigger:** Stripe automatically sends when payment fails
- **When:** When subscription payment fails
- **Recipient:** Customer email
- **Status:** ✅ Automatic (Stripe handles this)

---

## 📋 Planned but Not Yet Implemented

Based on your documentation, these emails are mentioned but not yet built:

### Transactional Emails

1. **Payment Confirmation Email (Custom)**
   - **Planned in:** `black-friday-2025-launch-strategy.md`
   - **When:** Within 5 minutes of purchase
   - **Content:** Custom confirmation beyond Stripe's automatic email
   - **Status:** ❌ Not implemented (Stripe handles basic confirmation)

2. **Cancellation Confirmation Email**
   - **Planned in:** `EMAIL_FLOWS.md`
   - **When:** User cancels subscription
   - **Content:** "Sorry to see you go" + resubscribe CTA
   - **Status:** ❌ Not implemented

3. **Reactivation Email**
   - **Planned in:** `EMAIL_FLOWS.md`
   - **When:** User resubscribes after unsubscribing
   - **Content:** "Welcome back!" message
   - **Status:** ❌ Not implemented (currently just sends free welcome email)

### Marketing/Engagement Emails

4. **Upgrade Reminder Emails**
   - **Planned in:** `EMAIL_FLOWS.md`
   - **When:** After X days for free users
   - **Content:** Highlight premium features, special offer
   - **Status:** ❌ Not implemented

5. **Performance Review Email**
   - **Planned in:** `black-friday-2025-launch-strategy.md`
   - **When:** Monthly for premium users
   - **Content:** Win rate, average returns, risk-adjusted metrics
   - **Status:** ❌ Not implemented

6. **Win Rate Email**
   - **Planned in:** `EMAIL_FLOWS.md`
   - **When:** Periodic updates
   - **Content:** Track record, performance stats
   - **Status:** ❌ Not implemented

### Launch/Marketing Campaign Emails

7. **Black Friday Launch Emails** (Multiple)
   - **Planned in:** `black-friday-2025-launch-strategy.md`
   - **Types:**
     - Pre-launch announcement emails
     - "Founding 50" availability emails
     - Urgency emails ("Only X spots left")
     - Social proof emails
     - Sold out notifications
   - **Status:** ❌ Not implemented (campaign-specific)

8. **Waitlist Invitation Emails**
   - **Planned in:** `PHASE_2_PLAN.md`
   - **When:** Gradual rollout to waitlist users
   - **Content:** "You're in! Get 50% off Premium" with checkout link
   - **Status:** ❌ Not implemented

---

## 📊 Email Summary Table

| Email Type | Recipient | Frequency | Status | Sender |
|------------|-----------|-----------|--------|--------|
| Free Welcome | New free subscribers | One-time | ✅ Implemented | Resend |
| Premium Welcome | New premium subscribers | One-time | ✅ Implemented | Resend |
| Free Daily Brief | All free subscribers | Daily (8 AM EST) | ✅ Implemented | Resend |
| Premium Daily Brief | All premium subscribers | Daily (8 AM EST) | ✅ Implemented | Resend |
| Test Email | Test addresses | On-demand | ✅ Implemented | Resend |
| Brief Preview | Test addresses | On-demand | ✅ Implemented | Resend |
| Error Notification | Admin | On failure | ✅ Implemented | Resend |
| Success Notification | Admin | Daily (optional) | ✅ Implemented | Resend |
| Magic Link | Users requesting login | On-demand | ✅ Implemented | Supabase Auth |
| Payment Confirmation | Customers | After purchase | ✅ Automatic | Stripe |
| Invoice | Customers | Monthly/Annual | ✅ Automatic | Stripe |
| Payment Failed | Customers | On failure | ✅ Automatic | Stripe |
| Cancellation Confirmation | Cancelled users | On cancellation | ❌ Planned | - |
| Reactivation Email | Resubscribed users | On reactivation | ❌ Planned | - |
| Upgrade Reminders | Free users | Periodic | ❌ Planned | - |
| Performance Reviews | Premium users | Monthly | ❌ Planned | - |

---

## 🎯 Recommendations

### High Priority (Consider Implementing Soon)

1. **Cancellation Confirmation Email**
   - Good user experience
   - Opportunity to win back users
   - Simple to implement

2. **Reactivation Email** (Enhanced)
   - Currently sends free welcome, but could be more personalized
   - "Welcome back! Here's what you missed..."

### Medium Priority

3. **Upgrade Reminder Emails**
   - Can drive conversions from free to premium
   - Should be carefully timed (not too aggressive)

4. **Performance Review Emails** (Premium)
   - Adds value for premium subscribers
   - Shows ROI and builds trust

### Low Priority (Campaign-Specific)

5. **Black Friday Launch Emails**
   - Only needed for specific campaigns
   - Can be built when needed

6. **Waitlist Invitation Emails**
   - Only needed if you implement a waitlist system
   - Can be built when needed

---

## 🔧 Email Infrastructure

**Email Services:**
- **Resend** (`resend.com`) - Welcome emails, daily briefs, admin notifications
- **Supabase Auth** - Magic link authentication emails
- **Stripe** - Payment confirmations, invoices

**From Addresses:**
- Resend: `brief@dailyticker.co` (configured via `RESEND_FROM_EMAIL`)
- Supabase Auth: Configured in Supabase Dashboard (Authentication → Email Templates)
- Stripe: Automatic (uses your Stripe account email settings)

**Admin Email:** `nikki.kipple@gmail.com` (configured via `ADMIN_EMAIL`)

**Email Tags (for Analytics):**
- `campaign`: 'welcome-email', 'morning-brief', 'test-brief'
- `tier`: 'free', 'premium'
- `date`: ISO date string
- `type`: 'transactional', 'automated'

---

## 📝 Notes

- **Stripe emails** are handled automatically by Stripe - you don't need to implement these
- **Magic link emails** are handled by Supabase Auth - template can be customized in Supabase Dashboard
- **Daily briefs** are the core product emails - these are fully implemented
- **Welcome emails** are now implemented for both tiers
- **Admin notifications** help you monitor system health
- **Planned emails** can be added incrementally as needed

## 🎨 Customizing Magic Link Email

The magic link email is sent by Supabase Auth, but you can customize it:

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Edit the "Magic Link" template
3. Customize:
   - Subject line
   - Email body
   - Button text
   - Styling (matches your brand)

**Current Flow:**
- User visits `/login` → enters email
- Supabase sends magic link email
- User clicks link → redirected to `/auth/callback`
- Callback verifies token → redirects to `/archive` (or requested page)

**Recommendation:** Customize the Supabase magic link email template to match Daily Ticker branding (dark theme, green accent, etc.)

---

## 🚀 Next Steps

If you want to implement any of the planned emails, I can help you:
1. Create email templates matching your branding
2. Set up triggers (webhooks, cron jobs, etc.)
3. Integrate with your existing email infrastructure
4. Test and deploy

Let me know which emails you'd like to prioritize!

