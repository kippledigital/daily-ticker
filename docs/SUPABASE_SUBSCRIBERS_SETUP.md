# Supabase Subscriber System Setup Guide

**Status:** Complete replacement for Beehiiv
**Time Required:** 10 minutes

---

## What We Built

A complete email subscriber management system using:
- **Supabase** (PostgreSQL) for subscriber data storage
- **Resend** for email delivery with built-in analytics
- **No Beehiiv** - saved $49/month and gained full control!

---

## Features

✅ **Subscriber Management**
- Subscribe/unsubscribe functionality
- UTM tracking (source, medium, campaign)
- Email engagement metrics (sent, opened, clicked)
- Status tracking (active, unsubscribed, bounced)

✅ **Email Analytics**
- Resend dashboard shows open rates & click rates automatically
- Supabase stores detailed engagement data
- Analytics views for aggregate statistics

✅ **Compliance**
- One-click unsubscribe (CAN-SPAM compliant)
- Unsubscribe page with UI
- Email footer includes unsubscribe link
- GDPR-friendly (data stored in Supabase, easy to export/delete)

---

## Step 1: Run Database Schema (2 minutes)

1. Go to your Supabase dashboard: https://app.supabase.com/project/dmnbqxbddtdfndvanxyv

2. Click **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy the entire contents of `/supabase/subscribers-schema.sql`

5. Paste into the query editor

6. Click **Run** (bottom right)

7. Verify success:
   - You should see "Success. No rows returned"
   - Go to **Table Editor** → you should see:
     - `subscribers` table
     - `email_events` table

---

## Step 2: Verify Tables Created (1 minute)

Run this query to verify:

```sql
-- Check subscribers table
SELECT * FROM subscribers LIMIT 1;

-- Check email_events table
SELECT * FROM email_events LIMIT 1;

-- Check analytics view
SELECT * FROM subscriber_stats;
```

Expected result: Empty tables (no rows), but no errors.

---

## Step 3: Test Subscribe Endpoint (2 minutes)

### Local Testing

```bash
# Test subscribe
curl -X POST "http://localhost:3001/api/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected response:
# {"success":true,"message":"Successfully subscribed!"}

# Verify in Supabase
# Go to Table Editor → subscribers → you should see test@example.com
```

### Production Testing

```bash
# Test subscribe
curl -X POST "https://daily-ticker.vercel.app/api/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

---

## Step 4: Test Unsubscribe Endpoint (2 minutes)

### Via API

```bash
# Test unsubscribe
curl -X POST "http://localhost:3001/api/unsubscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected response:
# {"success":true,"message":"Successfully unsubscribed. We're sorry to see you go!","email":"test@example.com"}
```

### Via UI

1. Go to http://localhost:3001/unsubscribe
2. Enter `test@example.com`
3. Click **Unsubscribe**
4. Should see success message

---

## Step 5: Verify Email Sending (3 minutes)

```bash
# Test email sending
curl "http://localhost:3001/api/test/send-email?email=your@email.com"

# Expected response:
# {"success":true,"message":"Test email sent successfully to your@email.com"}

# Check your inbox (might be in spam for onboarding@resend.dev)
```

**Note:** Emails from `onboarding@resend.dev` often go to spam. To fix:
- Verify custom domain in Resend (https://resend.com/domains)
- Set `RESEND_FROM_EMAIL='Daily Ticker <brief@dailyticker.co>'`

---

## Step 6: Update Environment Variables (2 minutes)

### Remove Beehiiv Variables

~~BEEHIIV_API_KEY~~
~~BEEHIIV_PUBLICATION_ID~~

### Keep These Variables

```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://dmnbqxbddtdfndvanxyv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Resend (already configured)
RESEND_API_KEY=re_j2nS8J2y_...

# Optional: Custom domain email
RESEND_FROM_EMAIL='Daily Ticker <brief@dailyticker.co>'
```

### Update Vercel Environment Variables

1. Go to https://vercel.com/kippledigital/daily-ticker/settings/environment-variables
2. **Delete:** `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`
3. **Keep:** All Supabase and Resend variables
4. Redeploy: `vercel --prod`

---

## Database Schema Overview

### `subscribers` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | Unique email address |
| `status` | TEXT | `active`, `unsubscribed`, or `bounced` |
| `subscribed_at` | TIMESTAMPTZ | When they subscribed |
| `unsubscribed_at` | TIMESTAMPTZ | When they unsubscribed (if applicable) |
| `utm_source` | TEXT | Traffic source (e.g., `website`, `twitter`) |
| `utm_medium` | TEXT | Traffic medium (e.g., `organic`, `paid`) |
| `utm_campaign` | TEXT | Campaign name |
| `emails_sent` | INTEGER | Total emails sent to this subscriber |
| `emails_opened` | INTEGER | Total emails opened (tracked via Resend) |
| `emails_clicked` | INTEGER | Total links clicked (tracked via Resend) |
| `last_opened_at` | TIMESTAMPTZ | Last time they opened an email |
| `last_clicked_at` | TIMESTAMPTZ | Last time they clicked a link |
| `ip_address` | TEXT | IP address at signup (optional) |
| `user_agent` | TEXT | Browser/device at signup (optional) |

### `email_events` Table

Detailed event tracking for:
- `sent` - Email sent
- `delivered` - Email delivered
- `opened` - Email opened
- `clicked` - Link clicked
- `bounced` - Email bounced
- `complained` - Marked as spam

### Analytics Views

**`subscriber_stats`** - Aggregate metrics:
```sql
SELECT * FROM subscriber_stats;

-- Returns:
-- active_subscribers | unsubscribed | bounced | total_subscribers | avg_open_rate | avg_click_rate
```

**`recent_subscribers`** - Last 100 subscribers with engagement:
```sql
SELECT * FROM recent_subscribers LIMIT 10;
```

---

## Email Analytics in Resend

Resend automatically tracks:
- ✅ **Delivery rate** - % of emails successfully delivered
- ✅ **Open rate** - % of recipients who opened the email
- ✅ **Click rate** - % of recipients who clicked a link
- ✅ **Bounce rate** - % of emails that bounced
- ✅ **Complaint rate** - % marked as spam

**Access Analytics:**
1. Go to https://resend.com/emails
2. Click on any sent email
3. View detailed metrics

---

## SQL Queries for Analytics

### Total Active Subscribers
```sql
SELECT COUNT(*) FROM subscribers WHERE status = 'active';
```

### Subscriber Growth (Last 30 Days)
```sql
SELECT
  DATE(subscribed_at) as date,
  COUNT(*) as new_subscribers
FROM subscribers
WHERE subscribed_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(subscribed_at)
ORDER BY date DESC;
```

### Top Performing Emails (Highest Open Rate)
```sql
SELECT
  email,
  emails_sent,
  emails_opened,
  ROUND((emails_opened::DECIMAL / NULLIF(emails_sent, 0) * 100), 1) as open_rate_percent
FROM subscribers
WHERE emails_sent > 0
ORDER BY open_rate_percent DESC
LIMIT 20;
```

### Unsubscribe Rate
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
  COUNT(*) as total,
  ROUND((COUNT(*) FILTER (WHERE status = 'unsubscribed')::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2) as unsubscribe_rate_percent
FROM subscribers;
```

---

## Testing Checklist

Before deploying to production, verify:

- [ ] Subscribe form works (website)
- [ ] Unsubscribe link works (email footer)
- [ ] Unsubscribe page UI works
- [ ] Duplicate email handling works (reactivate if unsubscribed)
- [ ] Email sending fetches from Supabase correctly
- [ ] `emails_sent` counter increments after sending
- [ ] Analytics views return data
- [ ] Resend dashboard shows email analytics
- [ ] Environment variables removed: BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID

---

## Troubleshooting

### "Email not found in subscriber list" when unsubscribing

**Cause:** Email doesn't exist in database
**Fix:** Check spelling, verify email exists in Supabase

### Subscribe returns "Failed to subscribe"

**Cause:** Supabase client not initialized or table doesn't exist
**Fix:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
2. Run the schema SQL in Supabase dashboard

### Email sent count not incrementing

**Cause:** Postgres function `increment_emails_sent` not created
**Fix:** Re-run the schema SQL, specifically the function definition

### Emails going to spam

**Cause:** Using `onboarding@resend.dev` sender address
**Fix:**
1. Verify custom domain in Resend
2. Set `RESEND_FROM_EMAIL='Daily Ticker <brief@dailyticker.co>'`

---

## What Changed from Beehiiv

| Feature | Beehiiv | Supabase |
|---------|---------|----------|
| **Subscriber storage** | Beehiiv API | Supabase Postgres |
| **Subscribe form** | Beehiiv API (broken) | Supabase API ✅ |
| **Email sending** | Resend | Resend (no change) |
| **Email analytics** | Beehiiv dashboard | Resend dashboard ✅ |
| **Subscriber export** | Limited | Full SQL access ✅ |
| **Unsubscribe** | Beehiiv managed | Custom endpoint ✅ |
| **Custom fields** | Limited | Unlimited ✅ |
| **Cost (>2,500 subs)** | $49/month | $0 (free tier) ✅ |

---

## Next Steps

1. ✅ Run database schema in Supabase
2. ✅ Test subscribe/unsubscribe locally
3. ✅ Remove Beehiiv environment variables
4. ✅ Deploy to production
5. ✅ Test subscribe form on live site
6. ✅ Monitor Resend dashboard for analytics
7. (Optional) Verify custom domain in Resend for inbox delivery

---

## Success!

You now have a complete email subscriber system with:
- Full control over subscriber data
- Free email analytics from Resend
- No $49/month Beehiiv subscription
- GDPR/CAN-SPAM compliant unsubscribe flow
- Unlimited custom fields and queries

🎉 **One less software to manage!**
