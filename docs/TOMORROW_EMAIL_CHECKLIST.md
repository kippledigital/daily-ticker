# Tomorrow Morning Email Checklist ✅

## Cron Job Configuration

### ✅ Daily Brief Cron
- **Path:** `/api/cron/daily-brief`
- **Schedule:** `0 13 * * 1-5` (1 PM UTC / 8 AM EST, Monday-Friday)
- **Status:** ✅ Configured in `vercel.json`
- **Authentication:** ✅ Fixed to accept Vercel cron requests

### ✅ Performance Update Cron
- **Path:** `/api/performance/update`
- **Schedule:** `0 22 * * *` (10 PM UTC / 5 PM EST, Daily)
- **Status:** ✅ Configured and working

## Email Sending Flow

### 1. Cron Triggers (8 AM EST)
```
Vercel Cron → /api/cron/daily-brief → runDailyAutomation()
```

### 2. Automation Process
1. ✅ Fetches market data
2. ✅ Generates AI brief with stock picks
3. ✅ Stores brief in archive (`/api/archive/store`)
4. ✅ Creates performance tracking records
5. ✅ Sends emails via `sendMorningBrief()`

### 3. Email Sending
- **Free Tier:** Sends to all active subscribers with `tier = 'free'`
- **Premium Tier:** Sends to all active subscribers with `tier = 'premium'`
- **Status:** ✅ Both email types configured and tested

## Verification Steps

### ✅ Pre-Launch Checks (Completed)
- [x] Cron endpoint accepts GET requests (Vercel cron format)
- [x] Vercel cron header checking implemented
- [x] Email sending logic tested (`/api/test/all-emails`)
- [x] Welcome emails working (`/api/test/welcome-email`)
- [x] Both free and premium briefs tested (`/api/manual/send-both-emails`)
- [x] Admin email set to `brief@dailyticker.co`
- [x] Error notifications configured

### 🔍 Tomorrow Morning Checks

1. **Check Vercel Cron Logs** (after 8 AM EST):
   - Vercel Dashboard → Project → Logs
   - Filter for `/api/cron/daily-brief`
   - Should see: "✅ Daily automation completed successfully"

2. **Check Email Delivery**:
   - Check `brief@dailyticker.co` inbox
   - Check Resend Dashboard → Emails
   - Verify both free and premium emails were sent

3. **Check Archive**:
   - Visit `/archive` page
   - Today's brief should appear
   - Verify stocks are listed

4. **Check Performance Tracking**:
   - Query `stock_performance` table
   - Should see new records with `outcome = 'open'`

## Troubleshooting

### If Emails Don't Send

1. **Check Cron Execution:**
   ```bash
   # View Vercel logs
   vercel logs --since 2h
   ```

2. **Manual Trigger (for testing):**
   ```bash
   curl -X GET "https://dailyticker.co/api/manual/send-both-emails"
   ```

3. **Check Subscribers:**
   ```sql
   SELECT email, tier, status FROM subscribers 
   WHERE status = 'active' AND tier IN ('free', 'premium');
   ```

4. **Check Brief Creation:**
   ```sql
   SELECT * FROM briefs WHERE date = CURRENT_DATE;
   ```

### Common Issues

**Issue:** Cron not running
- **Check:** Vercel Dashboard → Settings → Cron Jobs
- **Fix:** Ensure cron is deployed to production (not preview)

**Issue:** No subscribers found
- **Check:** Supabase `subscribers` table
- **Fix:** Verify `status = 'active'` and `tier` is set correctly

**Issue:** Email sending fails
- **Check:** Resend Dashboard → API Logs
- **Fix:** Verify `RESEND_API_KEY` and domain verification

**Issue:** Brief not created
- **Check:** Vercel logs for errors
- **Fix:** Check `POLYGON_API_KEY` and `OPENAI_API_KEY` are set

## Environment Variables Required

### ✅ Email Configuration
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - `brief@dailyticker.co`
- `ADMIN_EMAIL` - `brief@dailyticker.co` (default)

### ✅ Database
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### ✅ APIs
- `POLYGON_API_KEY` - Polygon.io API key (for market data)
- `OPENAI_API_KEY` - OpenAI API key (for AI brief generation)

### ✅ Optional
- `SEND_SUCCESS_NOTIFICATIONS` - Enable success notifications
- `CRON_SECRET` - For manual cron triggers (optional)

## Expected Timeline

- **8:00 AM EST:** Cron job triggers
- **8:00-8:05 AM EST:** Brief generation and email sending
- **8:05 AM EST:** Emails delivered to subscribers
- **8:05 AM EST:** Brief appears in archive

## Manual Testing (If Needed)

### Test Brief Generation
```bash
curl -X GET "https://dailyticker.co/api/manual/send-both-emails"
```

### Test Email Sending Only
```bash
# Send free brief
curl -X GET "https://dailyticker.co/api/manual/send-both-emails"

# Send premium brief to specific email
curl -X GET "https://dailyticker.co/api/manual/send-premium-brief?email=your@email.com"
```

### Test All Email Types
```bash
curl -X GET "https://dailyticker.co/api/test/all-emails?email=test@example.com"
```

## Success Indicators

✅ **Everything Working:**
- Vercel cron logs show successful execution
- Both free and premium emails sent
- Brief appears in archive
- Performance records created
- No error notifications sent

❌ **Something Wrong:**
- Error notification email sent to `brief@dailyticker.co`
- Vercel logs show errors
- Brief missing from archive
- Emails not delivered

## Next Steps

1. **Tonight:** Double-check all environment variables are set in Vercel
2. **Tomorrow 8 AM:** Check Vercel logs and email inbox
3. **If Issues:** Use manual endpoints to trigger and debug
4. **Monitor:** Check Resend dashboard for delivery status

---

**Last Updated:** $(date)
**Status:** ✅ Ready for tomorrow morning

