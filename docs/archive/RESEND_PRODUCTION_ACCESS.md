# Resend Production Access & Deliverability Guide

## Current Status

✅ **Email System Working:** Successfully sending to `brief@dailyticker.co`
✅ **Domain Verified:** All DNS records (DKIM, SPF, DMARC) verified
❌ **Sandbox Mode Active:** Can only send to `brief@dailyticker.co`
⚠️ **Deliverability Issue:** Emails going to spam (normal for new domains)

---

## Issue 1: Sandbox Mode (CRITICAL - Blocks External Sends)

**Problem:** Resend only allows sending to `brief@dailyticker.co` in sandbox mode.

**Error Message:**
```
"You can only send testing emails to your own email address (brief@dailyticker.co).
To send emails to other recipients, please verify a domain at resend.com/domains,
and change the `from` address to an email using this domain."
```

### Solution: Request Production Access

#### Option A: Check API Key Type (Fastest)
1. Go to https://resend.com/api-keys
2. Check if your current key says "Test" or "Development"
3. If so, create a new **Production API Key**
4. Update in Vercel:
   ```bash
   vercel env add RESEND_API_KEY production
   # Paste the new production key
   ```
5. Redeploy and test

#### Option B: Request Production Access
1. Go to https://resend.com/overview or https://resend.com/settings
2. Look for banner saying "Sandbox Mode" or "Testing Mode"
3. Click "Request Production Access" or "Upgrade Account"
4. Fill out the form:
   - **Use case:** Newsletter/Marketing emails for financial market analysis
   - **Sending volume:** ~100-500 emails per day
   - **Domain:** dailyticker.co
   - **Purpose:** Daily stock market brief for subscribers
5. Submit and wait for approval (usually instant to a few hours)

#### Option C: Contact Resend Support
If you don't see either option above:
1. Go to https://resend.com/support
2. Email: support@resend.com
3. Subject: "Request Production Access for dailyticker.co"
4. Message:
   ```
   Hi Resend team,

   I've successfully verified my domain (dailyticker.co) with all DNS records
   (DKIM, SPF, DMARC) but I'm still in sandbox mode and can only send to my
   own domain email address.

   I'd like to request production access to send daily market analysis emails
   to my subscriber list (~100-500 recipients per day).

   Domain: dailyticker.co
   API Key: re_******** (last 8 characters of your key)

   Thank you!
   ```

---

## Issue 2: Spam Folder Deliverability (Not Blocking, Just Low Reputation)

**Problem:** Emails to `brief@dailyticker.co` are being delivered but landing in spam.

**Why This Happens:**
- Brand new domain with no sending history
- Low sender reputation (starts at 0, builds over time)
- Gmail/Yahoo/Outlook are cautious with new senders
- Email providers use reputation to filter spam

### Solution: Build Sender Reputation (Takes 2-4 Weeks)

#### Immediate Actions (Today)

1. **Warm Up Slowly**
   - Days 1-7: Send to 10-20 recipients per day
   - Days 8-14: Send to 50-100 recipients per day
   - Days 15+: Send to full list (500+)
   - This tells email providers you're legitimate

2. **Add SPF and DMARC Alignment Check**
   Go to https://mxtoolbox.com/SuperTool.aspx and check:
   ```
   SPF: dailyticker.co
   DMARC: dailyticker.co
   DKIM: resend._domainkey.dailyticker.co
   ```
   All should show ✅ PASS

3. **Test Your Email Score**
   - Go to https://www.mail-tester.com/
   - Send test email to the provided address
   - Check your spam score (aim for 8+/10)
   - Fix any issues shown

4. **Authenticate with Google Postmaster**
   - Go to https://postmaster.google.com/
   - Add and verify `dailyticker.co`
   - Monitor spam rate and reputation over time

#### Content Improvements (Reduce Spam Triggers)

Update your emails to avoid spam filters:

**Avoid:**
- ❌ ALL CAPS SUBJECT LINES
- ❌ Multiple exclamation marks!!!
- ❌ Spammy words: "FREE", "URGENT", "ACT NOW", "LIMITED TIME"
- ❌ Too many links (max 2-3 per email)
- ❌ Large images (keep images under 1MB total)
- ❌ Misleading subject lines

**Include:**
- ✅ Plain text version (Resend auto-generates this)
- ✅ Unsubscribe link (already implemented ✅)
- ✅ Physical mailing address in footer (consider adding)
- ✅ Consistent FROM name and email
- ✅ Personalization when possible

#### Week 1-2 Strategy

**Goal:** Get early subscribers to engage with emails

1. **Send Welcome Email to First 10 Subscribers**
   - Ask them to reply or click a link
   - Gmail tracks engagement - replies boost reputation significantly
   - Add to contacts or whitelist

2. **Send from Personal Email First (Optional)**
   - Week 1: Send daily brief from your personal Gmail/Outlook
   - Include: "Coming soon: Get this delivered automatically via Daily Ticker!"
   - This builds initial engagement before domain reputation matters

3. **Get Feedback from Test Users**
   - Send to 5-10 friends/colleagues first
   - Ask them to:
     - Check spam folder
     - Mark as "Not Spam" if there
     - Reply to the email
     - Click the archive link
   - These actions boost reputation

#### Email Content Best Practices

```html
<!-- Good Subject Lines (Avoid Spam) -->
✅ Your Daily Market Brief - October 28, 2025
✅ 3 Stocks Moving Today: AAPL, NVDA, MSFT
✅ Market Insights for Tuesday

<!-- Bad Subject Lines (Trigger Spam Filters) -->
❌ 🚨 URGENT: These Stocks Are EXPLODING! ACT NOW!
❌ FREE Stock Tips - 1000% Gains Guaranteed!!!
❌ RE: RE: FW: Important Stock Alert

<!-- Add Physical Address to Footer (CAN-SPAM Requirement) -->
<p style="font-size:11px;color:#999;margin-top:20px;">
  Daily Ticker<br>
  [Your Business Address or PO Box]<br>
  [City, State ZIP]
</p>
```

#### Monitor Progress

**Check These Metrics Weekly:**

1. **Resend Dashboard** (https://resend.com/emails)
   - Delivery rate (should be 95%+)
   - Open rate (aim for 15-25% for newsletters)
   - Bounce rate (should be < 2%)
   - Spam rate (should be < 0.1%)

2. **Google Postmaster Tools** (https://postmaster.google.com/)
   - Domain reputation (Low → Medium → High over 2-4 weeks)
   - IP reputation
   - Spam rate
   - Feedback loop

3. **Email Deliverability Test**
   - Use https://www.mail-tester.com/ weekly
   - Aim for 8+/10 score
   - Fix any issues flagged

---

## Testing Guide

### Test 1: Verify Sandbox Mode Status

```bash
# Test sending to external email (should fail in sandbox mode)
curl "https://daily-ticker.vercel.app/api/test/send-email?email=nikki.kipple@gmail.com"

# Expected Response (Sandbox Mode):
{
  "success": false,
  "error": "You can only send testing emails to your own email address (brief@dailyticker.co)...",
  "errorDetails": {
    "name": "validation_error",
    "statusCode": 403
  }
}

# Expected Response (Production Mode):
{
  "success": true,
  "message": "Test email sent successfully to nikki.kipple@gmail.com",
  "emailId": "abc123..."
}
```

### Test 2: Verify Domain Email Works

```bash
# Test sending to verified domain email (should work)
curl "https://daily-ticker.vercel.app/api/test/send-email?email=brief@dailyticker.co"

# Expected Response:
{
  "success": true,
  "message": "Test email sent successfully to brief@dailyticker.co",
  "emailId": "xyz789..."
}
```

### Test 3: Check Spam Score

1. Go to https://www.mail-tester.com/
2. Copy the unique test email address shown
3. Send test email:
   ```bash
   curl "https://daily-ticker.vercel.app/api/test/send-email?email=test-abc123@srv1.mail-tester.com"
   ```
4. Click "Then check your score" on mail-tester.com
5. Review spam score (aim for 8+/10)

---

## Timeline

| Week | Action | Expected Result |
|------|--------|----------------|
| **Today** | Request Resend production access | Instant to 24 hours |
| **Day 1-3** | Send to 10 test users, get engagement | Build initial reputation |
| **Week 1** | Send to 20-50 subscribers daily | Emails may still go to spam |
| **Week 2** | Send to 100-200 subscribers daily | Deliverability improving |
| **Week 3-4** | Send to full list (500+) | Inbox delivery 70-80%+ |
| **Month 2+** | Continue consistent sending | Inbox delivery 85-95%+ |

---

## Success Criteria

✅ **Production Access Granted:**
- Can send to any email address (not just brief@dailyticker.co)
- Test with: `curl "https://daily-ticker.vercel.app/api/test/send-email?email=nikki.kipple@gmail.com"`
- Should return: `"success": true`

✅ **Inbox Delivery (Not Spam):**
- Emails landing in inbox (not spam folder)
- Open rate > 15%
- Spam rate < 0.1%
- Google Postmaster shows "Medium" or "High" reputation

✅ **Automation Working:**
- Daily brief sending M-F at 8 AM EST
- Subscribers receiving emails
- Archive storing briefs correctly
- No errors in Vercel logs

---

## Current Next Steps (Priority Order)

1. ✅ **DONE:** Domain verified with all DNS records
2. ✅ **DONE:** Email sending working (to domain email)
3. ✅ **DONE:** Improved error handling to show sandbox mode error
4. 🔄 **IN PROGRESS:** Request Resend production access (you need to do this)
5. ⏳ **PENDING:** Build sender reputation over 2-4 weeks
6. ⏳ **PENDING:** Deploy cron automation for daily sends

**Action Required:** Go to https://resend.com/api-keys or https://resend.com/settings and request production access now!
