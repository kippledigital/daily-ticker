# Performance Dashboard Setup Guide

Complete setup instructions for launching the Performance Dashboard.

## Step 1: Database Setup ✅
You've already run the SQL schema in Supabase!

## Step 2: Environment Variables Setup

### 2.1 Get Supabase Service Role Key

1. Go to your Supabase project: https://supabase.com/dashboard/project/dmnbqxbddtdfndvanxyv
2. Click **Settings** (gear icon in left sidebar)
3. Click **API** in the settings menu
4. Scroll down to **Project API keys**
5. Copy the **service_role** key (NOT the anon key - it's the secret one below)

### 2.2 Add Environment Variables Locally

Add these two lines to your `.env.local` file:

```bash
# Supabase Service Role Key (for performance tracking)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Cron Secret (for protecting the performance update endpoint)
CRON_SECRET=XrWC3jeUfe0si/qQOCqm99JBYIu15BDDvdXCGGMD0Ko=
```

### 2.3 Add Environment Variables to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to: https://vercel.com/nikkikipple-gmailcoms-projects/daily-ticker/settings/environment-variables
2. Add two new environment variables:

   **First Variable:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [paste your service role key from Supabase]
   - Environments: Check **Production**, **Preview**, and **Development**
   - Click **Save**

   **Second Variable:**
   - Key: `CRON_SECRET`
   - Value: `XrWC3jeUfe0si/qQOCqm99JBYIu15BDDvdXCGGMD0Ko=`
   - Environments: Check **Production**, **Preview**, and **Development**
   - Click **Save**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Add the variables
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your service role key when prompted
# Select: Production, Preview, Development

vercel env add CRON_SECRET
# Paste: XrWC3jeUfe0si/qQOCqm99JBYIu15BDDvdXCGGMD0Ko=
# Select: Production, Preview, Development
```

## Step 3: Add Sample Performance Data (Optional - for testing)

This will let you see the dashboard in action before real picks are tracked.

Run this SQL in your Supabase SQL Editor:

```sql
-- Insert some sample stocks (if they don't exist)
INSERT INTO stocks (ticker, company_name, sector, current_price, stop_loss, profit_target, confidence, recommendation, risk_level, ideal_entry_zone, suggested_allocation)
VALUES
  ('NVDA', 'NVIDIA Corporation', 'Technology', 521.00, 480.00, 604.00, 87, 'BUY', 'Medium', '$510-$515', '8%'),
  ('AMD', 'Advanced Micro Devices', 'Technology', 147.00, 135.00, 175.00, 82, 'BUY', 'Medium', '$142-$145', '6%'),
  ('MSFT', 'Microsoft Corporation', 'Technology', 415.00, 385.00, 465.00, 91, 'HOLD', 'Low', '$375-$380', '10%')
ON CONFLICT (ticker) DO NOTHING;

-- Get the stock IDs
WITH stock_ids AS (
  SELECT id, ticker FROM stocks WHERE ticker IN ('NVDA', 'AMD', 'MSFT')
)

-- Insert sample performance data
INSERT INTO stock_performance (stock_id, entry_date, entry_price, exit_date, exit_price, exit_reason)
SELECT
  s.id,
  '2025-10-15'::date,
  CASE
    WHEN s.ticker = 'NVDA' THEN 495.00
    WHEN s.ticker = 'AMD' THEN 140.00
    WHEN s.ticker = 'MSFT' THEN 390.00
  END,
  '2025-10-30'::date,
  CASE
    WHEN s.ticker = 'NVDA' THEN 604.00  -- Hit profit target (win)
    WHEN s.ticker = 'AMD' THEN 147.00   -- Still open
    WHEN s.ticker = 'MSFT' THEN 385.00  -- Hit stop loss (loss)
  END,
  CASE
    WHEN s.ticker = 'NVDA' THEN 'profit_target'
    WHEN s.ticker = 'AMD' THEN NULL
    WHEN s.ticker = 'MSFT' THEN 'stop_loss'
  END
FROM stock_ids s;

-- Verify the data
SELECT * FROM performance_summary;
SELECT * FROM stock_performance ORDER BY entry_date DESC;
```

This creates:
- 1 winning pick (NVDA: +22% gain)
- 1 open pick (AMD: currently tracking)
- 1 losing pick (MSFT: -1.3% loss via stop-loss)

**Win Rate:** 50% (1 win out of 2 closed)
**Average Return:** ~10.4%

## Step 4: Set Up Vercel Cron Job

This automatically checks stock prices daily and closes positions when targets are hit.

### 4.1 Create the cron configuration file

Create `/vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/performance/update",
      "schedule": "0 22 * * *"
    }
  ]
}
```

This runs daily at 10 PM UTC (5 PM EST / 2 PM PST after market close).

### 4.2 Configure the cron request

The cron job needs to send the authorization header. Vercel automatically does this if you configure it correctly.

Update your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/performance/update",
      "schedule": "0 22 * * *"
    }
  ],
  "env": {
    "CRON_SECRET": "@cron_secret"
  }
}
```

### 4.3 Deploy to activate cron

Cron jobs only work in production. Once you merge the feature branch and deploy:

```bash
# Option 1: Merge to main
git checkout main
git merge feature/performance-dashboard
git push origin main

# Option 2: Push the branch and Vercel will auto-deploy preview
# The cron will activate once merged to main
```

### 4.4 Verify cron is working

After deployment:
1. Go to: https://vercel.com/nikkikipple-gmailcoms-projects/daily-ticker/settings/crons
2. You should see your cron job listed
3. Check the execution logs to verify it's running

## Testing the Dashboard

### Test Locally

```bash
# Start your dev server
npm run dev

# Visit the homepage
open http://localhost:3001

# Scroll down to "Our Picks, Your Proof" section
# You should see the performance dashboard with your sample data
```

### Test the API Endpoints

```bash
# Test GET endpoint (fetch performance)
curl http://localhost:3001/api/performance

# Test POST endpoint (update performance)
curl -X POST http://localhost:3001/api/performance/update \
  -H "Authorization: Bearer XrWC3jeUfe0si/qQOCqm99JBYIu15BDDvdXCGGMD0Ko="
```

## Launch Checklist

- [ ] SQL schema run in Supabase ✅
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to Vercel
- [ ] `CRON_SECRET` added to Vercel
- [ ] Sample data added (optional)
- [ ] `vercel.json` created with cron config
- [ ] Dashboard tested locally
- [ ] Feature branch merged to main
- [ ] Cron job verified in Vercel dashboard

## Troubleshooting

### Dashboard shows "No performance data available"
- Check if stock_performance table has data: Run `SELECT * FROM stock_performance;` in Supabase
- Add sample data using the SQL above

### API returns "supabaseKey is required"
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- Redeploy after adding the env variable

### Cron job not running
- Cron jobs only work in production (not preview/development)
- Check the cron is configured in `vercel.json`
- Check Vercel dashboard under Settings → Crons

### Performance not updating automatically
- Verify cron job is running in Vercel logs
- Check the cron schedule (currently 10 PM UTC)
- Manually trigger: `curl -X POST https://dailyticker.co/api/performance/update -H "Authorization: Bearer YOUR_CRON_SECRET"`

## Next Steps After Launch

1. Monitor the performance dashboard for accurate data
2. Set up alerts if cron job fails (Vercel Integrations → Monitoring)
3. Consider Phase 2 enhancements:
   - S&P 500 benchmark comparison
   - Dedicated /performance page
   - Monthly performance breakdown
   - Historical data backfill for cold start

## Support

If you run into issues:
- Check Vercel deployment logs: https://vercel.com/nikkikipple-gmailcoms-projects/daily-ticker/deployments
- Check Supabase logs: https://supabase.com/dashboard/project/dmnbqxbddtdfndvanxyv/logs/explorer
- Test API endpoints manually using curl commands above
