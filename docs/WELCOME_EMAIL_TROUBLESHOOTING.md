# Welcome Email Troubleshooting Guide

## Issue: New Subscribers Not Receiving Welcome Emails

### Symptoms
- User successfully subscribes (added to Supabase)
- No welcome email received
- Subscription endpoint returns success

### Root Causes

1. **Resend API Key Not Configured**
   - Check: `RESEND_API_KEY` environment variable
   - Should start with `re_`
   - Location: Vercel Environment Variables

2. **From Email Not Verified**
   - Check: `RESEND_FROM_EMAIL` environment variable
   - Domain must be verified in Resend dashboard
   - Default: `brief@dailyticker.co`

3. **Email Going to Spam**
   - Check spam/junk folder
   - Verify SPF/DKIM records for domain
   - Check Resend dashboard for delivery status

4. **Silent Failures**
   - Welcome email is non-blocking (doesn't fail subscription)
   - Errors logged but not surfaced to user
   - Check Vercel logs for error messages

### Verification Steps

#### Step 1: Check Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Verify:
   - `RESEND_API_KEY` is set and starts with `re_`
   - `RESEND_FROM_EMAIL` is set (e.g., `brief@dailyticker.co`)

#### Step 2: Test Welcome Email Endpoint

```bash
curl 'https://dailyticker.co/api/test/welcome-email?email=your@email.com&tier=free'
```

Expected response:
```json
{
  "success": true,
  "emailId": "re_xxxxx",
  "environment": {
    "RESEND_API_KEY": "re_xxxx...",
    "RESEND_FROM_EMAIL": "brief@dailyticker.co"
  }
}
```

#### Step 3: Check Vercel Logs

```bash
vercel logs --since 1h | grep -E "(Welcome email|RESEND|Failed to send)"
```

Look for:
- `✅ Welcome email sent successfully`
- `❌ Failed to send welcome email`
- `❌ RESEND_API_KEY is not configured`

#### Step 4: Check Resend Dashboard

1. Go to https://resend.com/emails
2. Look for recent emails to your test address
3. Check delivery status (sent, delivered, bounced, etc.)

### Fixes Applied

1. **Made welcome email await** - Now catches errors properly
2. **Added test endpoint** - `/api/test/welcome-email` for testing
3. **Enhanced logging** - Better error messages in logs

### Testing After Fix

1. Subscribe with a test email: `curl -X POST https://dailyticker.co/api/subscribe -H "Content-Type: application/json" -d '{"email":"test@example.com"}'`
2. Check logs immediately: `vercel logs --since 1m | grep -E "(Welcome|email)"`
3. Check Resend dashboard for email delivery
4. Check spam folder if email not in inbox

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `RESEND_API_KEY is not configured` | Missing API key | Add `RESEND_API_KEY` to Vercel env vars |
| `Invalid API key format` | API key doesn't start with `re_` | Verify correct API key from Resend |
| `Domain not verified` | From email domain not verified | Verify domain in Resend dashboard |
| `Rate limit exceeded` | Too many emails sent | Wait or upgrade Resend plan |

### Next Steps

If welcome emails still don't work:
1. Verify Resend account is active
2. Check domain verification status
3. Review Resend dashboard for bounce/spam reports
4. Test with a different email provider (Gmail, Outlook, etc.)

