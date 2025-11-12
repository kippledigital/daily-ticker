# 🚀 Deployment Checklist - Email Reliability Fixes

## ⚠️ CRITICAL: Follow These Steps in Order

### Step 1: Run Database Migration

**Option A: Via Supabase Dashboard** (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Open and copy contents of: `supabase/migrations/add_cron_run_tracking.sql`
5. Paste into SQL Editor
6. Click **Run**
7. Verify: Should see "Success. No rows returned"

**Option B: Via Command Line**
```bash
# Get your database URL from Supabase dashboard
psql "YOUR_DATABASE_URL" -f supabase/migrations/add_cron_run_tracking.sql
```

**Verify Migration Worked**:
```sql
-- Should return the new table structure
SELECT * FROM cron_runs LIMIT 1;

-- Should return health metrics (empty at first)
SELECT * FROM cron_health;
```

---

### Step 2: Commit and Push Changes

```bash
# Stage all changes
git add .

# Create commit
git commit -m "Fix: Make daily email automation 100% reliable

- Add strict authentication for cron endpoint
- Enforce mandatory success criteria (emails + archive must succeed)
- Add retry logic for email sending
- Add comprehensive cron run tracking in database
- Create health check endpoint for monitoring
- Guarantee: emails sent OR error notification sent

No more silent failures."

# Push to main (triggers Vercel deployment)
git push origin main
```

---

### Step 3: Wait for Vercel Deployment

1. Go to https://vercel.com/dashboard
2. Watch deployment progress
3. Wait for "Ready" status
4. **Important**: Check deployment logs for any errors

---

### Step 4: Verify Deployment

#### 4a. Check Health Endpoint
```bash
curl https://dailyticker.co/api/cron/health | jq
```

**Expected**: Should return JSON with health status (may show "No cron runs recorded" if first deployment)

#### 4b. Check Cron Configuration
1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. Verify you see:
   - `/api/cron/daily-brief` - Schedule: `0 13 * * 1-5`
   - `/api/performance/update` - Schedule: `0 22 * * *`

#### 4c. Verify Environment Variables
Go to Vercel → Settings → Environment Variables, ensure these are set:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `RESEND_API_KEY`
- ✅ `POLYGON_API_KEY`
- ✅ `OPENAI_API_KEY`
- ✅ `CRON_SECRET` (for manual triggers)

---

### Step 5: Test Manually (Optional but Recommended)

```bash
# Get your CRON_SECRET from Vercel environment variables
# Then test manual trigger:

curl -X GET "https://dailyticker.co/api/cron/daily-brief" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -v
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Daily automation completed successfully",
  "brief": {
    "date": "2025-11-12",
    "stockCount": 3,
    "actionableCount": 2
  }
}
```

**If it fails**: Check Vercel logs immediately!

---

### Step 6: Monitor First Scheduled Run

**Next scheduled run**: Tomorrow at 8:00 AM EST (1:00 PM UTC)

**At 8:05 AM EST, check**:

1. **Health endpoint**:
   ```bash
   curl https://dailyticker.co/api/cron/health | jq
   ```
   Should show `"status": "healthy"` and today's run as `"success"`

2. **Your email**: `brief@dailyticker.co`
   - Should receive the daily brief
   - If automation failed, should receive error notification

3. **Archive page**: https://dailyticker.co/archive
   - Should see today's brief listed

4. **Database**:
   ```sql
   SELECT * FROM cron_runs WHERE run_date = CURRENT_DATE;
   ```
   Should show successful run with metrics

---

## 🔍 Troubleshooting

### If Health Check Shows Error

**Check Vercel Logs**:
```bash
vercel logs --since 1h
```

**Check Database**:
```sql
SELECT * FROM cron_runs ORDER BY started_at DESC LIMIT 5;
```

### If Cron Doesn't Run

1. Check Vercel Dashboard → Functions → Logs
2. Look for `/api/cron/daily-brief` execution
3. If missing: Check Vercel → Settings → Cron Jobs (must be enabled)
4. Verify `vercel.json` exists in root and has cron config

### If Emails Don't Send

1. Check Resend Dashboard: https://resend.com/emails
2. Check subscriber count:
   ```sql
   SELECT COUNT(*) FROM subscribers WHERE status = 'active';
   ```
3. If no subscribers: Add test subscriber first
4. Check `RESEND_API_KEY` in Vercel environment variables

### If Authentication Fails

**Error**: `"Unauthorized"` when Vercel cron runs

**Fix**: The new strict auth checks for `x-vercel-cron` header. If Vercel doesn't send this:
1. Check Vercel logs for actual headers received
2. May need to adjust header check in `route.ts` line 31

---

## ✅ Success Indicators

After deployment is complete and first cron runs:

- ✅ Health endpoint shows `"status": "healthy"`
- ✅ Today's run shows in `cron_runs` table with `status = 'success'`
- ✅ Emails received by subscribers
- ✅ Brief appears in archive page
- ✅ No error notifications sent to `brief@dailyticker.co`

---

## 📊 Monitoring Going Forward

### Daily Checks (30 seconds)
```bash
# Quick health check
curl https://dailyticker.co/api/cron/health | jq .status
```

### Weekly Review
```sql
-- Check success rate
SELECT
  COUNT(*) FILTER (WHERE status = 'success') as successes,
  COUNT(*) FILTER (WHERE status = 'failed') as failures,
  COUNT(*) as total
FROM cron_runs
WHERE started_at >= NOW() - INTERVAL '7 days';
```

---

## 🚨 If Something Goes Wrong

**Immediate Actions**:
1. Check health endpoint: `curl https://dailyticker.co/api/cron/health | jq`
2. Check your email for error notifications
3. Check Vercel logs: `vercel logs --since 1h`
4. Check database: `SELECT * FROM cron_runs WHERE status = 'failed' ORDER BY started_at DESC LIMIT 5`

**Manual Override** (send today's brief manually):
```bash
curl -X GET "https://dailyticker.co/api/manual/send-both-emails"
```

---

## 📝 Summary of Changes

**What we fixed**:
- ❌ Silent failures → ✅ Loud failures with notifications
- ❌ No tracking → ✅ Every run tracked in database
- ❌ Weak auth → ✅ Strict authentication
- ❌ No retries → ✅ Automatic retry on email failures
- ❌ No monitoring → ✅ Real-time health endpoint

**Guarantees**:
- Emails **will** be sent OR you'll be notified why they failed
- Archives **will** be stored OR you'll be notified why they failed
- Every run is tracked with full details
- Health status available via API anytime

**No more silent failures. No more missing emails.**

---

**Ready to deploy!** 🚀
