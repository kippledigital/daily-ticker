# Email Delivery Verification Guide

## Issue Summary

You received TWO free emails but NO premium email. This document explains how to verify and fix email delivery.

## Root Causes

1. **Duplicate Automation Runs**: The automation may have run twice (cron + manual trigger), causing duplicate free emails
2. **Premium Email Not Sending**: Premium email send is failing silently, likely because:
   - No premium subscribers found in database
   - Premium account not properly marked as `tier = 'premium'` in database

## Fixes Implemented

### 1. Duplicate Prevention ✅
- Added check at start of automation to prevent running if brief already exists for today
- Prevents duplicate emails from being sent

### 2. Enhanced Logging ✅
- Added detailed logging for subscriber tier breakdown
- Logs show exactly which emails are being sent to which subscribers
- Logs show if premium/free subscribers are found

### 3. Manual Premium Email Endpoint ✅
- Created `/api/manual/send-premium-brief` endpoint
- Can send premium email to all premium subscribers OR specific email address
- Usage: `curl 'https://dailyticker.co/api/manual/send-premium-brief?email=your@email.com'`

## Verification Steps

### Step 1: Check Subscriber Tiers in Database

Run this query in Supabase SQL Editor:

```sql
SELECT 
  email, 
  tier, 
  status,
  created_at
FROM subscribers
WHERE status = 'active'
ORDER BY tier, created_at DESC;
```

**Expected Result:**
- Your free account email should have `tier = 'free'`
- Your premium account email should have `tier = 'premium'`

**If premium account shows `tier = 'free'`:**
```sql
UPDATE subscribers
SET tier = 'premium'
WHERE email = 'your-premium-email@example.com';
```

### Step 2: Check Vercel Logs

After the next cron run (8 AM PST), check logs:

```bash
vercel logs --since 1h | grep -E "(Found|subscribers|Premium|Free|Sending)"
```

Look for:
- `✅ Found X active free tier subscriber(s): [emails]`
- `✅ Found X active premium tier subscriber(s): [emails]`
- `📧 Sending free tier email to X subscriber(s): [emails]`
- `📧 Sending premium tier email to X subscriber(s): [emails]`

### Step 3: Manual Test Premium Email

Test sending premium email to your premium account:

```bash
curl 'https://dailyticker.co/api/manual/send-premium-brief?email=YOUR_PREMIUM_EMAIL'
```

This should send the premium brief directly to your email.

## Expected Behavior Going Forward

### Every Weekday Morning (8 AM PST):

1. **Cron Job Runs** (`/api/cron/daily-brief`)
2. **Checks for Duplicate**: If brief exists for today, skips (prevents duplicates)
3. **Generates Brief**: Creates both free and premium versions
4. **Sends Emails**:
   - Free email → All subscribers with `tier = 'free'` AND `status = 'active'`
   - Premium email → All subscribers with `tier = 'premium'` AND `status = 'active'`
5. **Stores in Archive**: Both versions saved to `briefs` table

### What You Should Receive:

- **Free Account**: 1 free email per day
- **Premium Account**: 1 premium email per day (with stop-loss, profit targets, confidence scores, etc.)

## Troubleshooting

### Problem: Still receiving duplicate free emails

**Solution**: Check if automation is being triggered multiple times:
- Check Vercel cron job schedule (should be once per day)
- Check if manual triggers are happening
- Check logs for multiple automation starts

### Problem: Premium email still not sending

**Solution**: 
1. Verify premium account has `tier = 'premium'` in database
2. Verify premium account has `status = 'active'` in database
3. Check logs for: `⚠️  No active premium tier subscribers found`
4. Use manual endpoint to send: `/api/manual/send-premium-brief?email=YOUR_PREMIUM_EMAIL`

### Problem: Emails not being archived

**Solution**:
- Check `briefs` table in Supabase
- Verify `archiveStorage: true` in automation response
- Check logs for archive storage errors

## Monitoring

### Daily Checklist:

1. ✅ Check email inbox for both free and premium emails
2. ✅ Verify brief appears in archive at `/archive`
3. ✅ Check Vercel logs for any errors
4. ✅ Verify subscriber counts match expectations

### Weekly Review:

1. Check subscriber tier distribution
2. Review email delivery rates in Resend dashboard
3. Verify archive has all briefs for the week

## Support

If issues persist:
1. Check Vercel logs: `vercel logs --since 24h`
2. Check Supabase database for subscriber tiers
3. Use manual endpoints to test email sending
4. Check Resend dashboard for email delivery status

