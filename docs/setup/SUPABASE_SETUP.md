# Supabase Setup Guide

Complete guide for setting up Supabase for Daily Ticker archive storage.

---

## Step 1: Create Supabase Project (5 minutes)

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Enter project details:**
   - Name: `daily-ticker` (or your choice)
   - Database Password: **Save this securely!**
   - Region: Choose closest to your users (e.g., `us-east-1`)
4. **Click "Create new project"**
5. **Wait ~2 minutes** for project to provision

---

## Step 2: Run Database Schema (2 minutes)

1. **In Supabase Dashboard, click "SQL Editor"** (left sidebar)
2. **Click "New Query"**
3. **Copy the entire contents** of `/supabase/schema.sql` from your project
4. **Paste into the query editor**
5. **Click "Run"** (or press Cmd/Ctrl + Enter)
6. **Verify success:** You should see "Success. No rows returned"

This creates:
- `briefs` table (stores daily market briefs)
- `stocks` table (stores stock recommendations)
- Indexes for fast queries
- Row Level Security policies
- Auto-update triggers

---

## Step 3: Get API Credentials (1 minute)

1. **In Supabase Dashboard, click "Settings"** → **"API"**
2. **Copy these values:**
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** Long string starting with `eyJ...`

---

## Step 4: Add to Vercel (2 minutes)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Select your `daily-ticker` project**
3. **Click "Settings"** → **"Environment Variables"**
4. **Add two variables:**

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://xxxxx.supabase.co` (your Project URL)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJ...` (your anon/public key)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. **Click "Save"** for each

---

## Step 5: Redeploy (1 minute)

1. **Go to "Deployments" tab** in Vercel dashboard
2. **Click the three dots** on the latest deployment
3. **Click "Redeploy"**
4. **Wait ~2 minutes** for deployment

Or trigger a redeploy by pushing a commit:
```bash
git commit --allow-empty -m "Trigger redeploy with Supabase env vars"
git push
```

---

## Step 6: Test Integration (2 minutes)

### Test Archive List API
```bash
curl https://daily-ticker.vercel.app/api/archive/list
```

**Expected Response:**
```json
{
  "success": true,
  "data": [],
  "total": 0,
  "limit": 10,
  "offset": 0,
  "hasMore": false
}
```

### Test Webhook Endpoint
```bash
curl -X POST https://daily-ticker.vercel.app/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-27",
    "subject": "🧪 Test Brief — Supabase Integration",
    "htmlContent": "<h1>Test Brief</h1><p>Testing Supabase integration</p>",
    "tldr": "Testing archive with Supabase",
    "actionableCount": 1,
    "stocks": [{
      "ticker": "TEST",
      "sector": "Tech",
      "confidence": 100,
      "riskLevel": "Low",
      "action": "HOLD",
      "entryPrice": 1.00,
      "summary": "Test stock",
      "whyMatters": "Testing",
      "momentumCheck": "Testing",
      "actionableInsight": "This is a test"
    }]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Brief for 2025-10-27 stored successfully",
  "data": {
    "date": "2025-10-27",
    "stockCount": 1,
    "actionableCount": 1
  }
}
```

### Verify in Browser
1. Visit: https://daily-ticker.vercel.app/archive
2. Should see the test brief
3. Click on it → Should show full brief with stock details

---

## Step 7: Verify in Supabase (Optional)

1. **Go to Supabase Dashboard** → **"Table Editor"**
2. **Click on "briefs" table**
3. **You should see 1 row** with your test brief
4. **Click on "stocks" table**
5. **You should see 1 row** with the TEST stock

---

## Step 8: Update Gumloop (5 minutes)

Send this to Gumloop support:

```
Hi Gumloop team,

The Daily Ticker archive is now working with Supabase! Please update the webhook URLs:

Node 20 (Save Stock Brief to Database) - xkJWdvmiKW9CACruhG8ygQ:
URL: https://daily-ticker.vercel.app/api/archive/store

Node 7b (Get Historical Data) - giA6E9EQuq2xp3herHmjae:
URL: https://daily-ticker.vercel.app/api/archive/list?limit=30

All field mappings and configuration remain the same.

Thanks!
```

---

## Local Development (Optional)

To test locally:

1. **Add to `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

2. **Start dev server:**
```bash
npm run dev
```

3. **Visit:**
- http://localhost:3000/archive
- Test webhook: `curl -X POST http://localhost:3000/api/archive/store ...`

---

## Troubleshooting

### "Failed to store brief" Error

**Check:**
1. Environment variables are set correctly in Vercel
2. Database schema was run successfully
3. Supabase project status is "Active" (not paused)
4. API keys are correct (anon key, not service_role key)

**Solution:**
- Re-run the schema: Supabase Dashboard → SQL Editor → Paste schema → Run
- Verify env vars: Vercel → Settings → Environment Variables
- Check Supabase logs: Dashboard → Logs

### "Brief not found" Error

**Check:**
1. Brief was actually created (check Supabase Table Editor)
2. Date format is YYYY-MM-DD
3. Archive API works: `curl https://daily-ticker.vercel.app/api/archive/list`

### Schema Already Exists Errors

**Solution:**
```sql
-- Drop existing tables (only if you need to reset)
DROP TABLE IF EXISTS stocks CASCADE;
DROP TABLE IF EXISTS briefs CASCADE;

-- Then re-run the full schema from schema.sql
```

---

## Database Maintenance

### View All Briefs
```sql
SELECT date, subject, actionable_count
FROM briefs
ORDER BY date DESC;
```

### Count Total Briefs
```sql
SELECT COUNT(*) FROM briefs;
```

### Search by Ticker
```sql
SELECT b.date, b.subject, s.ticker, s.action
FROM briefs b
JOIN stocks s ON s.brief_id = b.id
WHERE s.ticker = 'AAPL'
ORDER BY b.date DESC;
```

### Delete Test Data
```sql
DELETE FROM briefs WHERE subject LIKE '%Test%';
-- stocks automatically deleted due to CASCADE
```

---

## Next Steps

1. ✅ Supabase project created
2. ✅ Schema deployed
3. ✅ Environment variables set in Vercel
4. ✅ Integration tested
5. ⏳ **Update Gumloop webhook URLs**
6. ⏳ **Run first automation test**
7. ⏳ **Monitor for 3 days**
8. ⏳ **Remove Google Sheets integration**

---

## Storage Capacity

- **Supabase Free Tier:** 500 MB database storage
- **Daily Ticker Brief:** ~8 KB each
- **Capacity:** ~62,500 briefs
- **Years at 1/day:** 171 years
- **Plus:** Unlimited rows, just storage limit

You're all set for decades of archive storage! 🚀
