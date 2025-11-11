# Performance Update Cron Job Status

## Overview
The performance update cron job runs daily at **5 PM EST / 10 PM UTC** to check stock prices and update performance tracking.

## Configuration

### Vercel Cron Schedule
- **Path:** `/api/performance/update`
- **Schedule:** `0 22 * * *` (10 PM UTC / 5 PM EST)
- **Configured in:** `vercel.json`

### What It Does
1. Fetches all open positions from `stock_performance` table
2. For each open position:
   - Calls Polygon.io API to get current stock price
   - Checks if stop-loss hit (price <= stop_loss)
   - Checks if profit target hit (price >= profit_target)
   - Checks if 30-day holding period exceeded
3. Closes positions that meet any exit condition
4. Database trigger automatically calculates:
   - Return percentage
   - Return dollars
   - Holding days
   - Outcome (win/loss/open)

## Recent Fixes

### ✅ Fixed: GET Request Support
**Issue:** Vercel cron jobs send GET requests, but the endpoint only accepted POST.

**Fix:** Added GET handler that:
- Checks for Vercel cron headers (`x-vercel-cron` or `x-vercel-signature`)
- Allows requests in production (Vercel cron doesn't send auth headers)
- Maintains POST support for manual testing

**Status:** ✅ Deployed and working

## Testing

### Manual Test Endpoint
```bash
# Test via GET (how Vercel cron calls it)
curl https://dailyticker.co/api/performance/update

# Test via POST (for manual testing)
curl -X POST https://dailyticker.co/api/performance/update
```

### Expected Response
```json
{
  "success": true,
  "message": "Updated X positions",
  "updated": 0,
  "details": []
}
```

If `updated: 0`, it means:
- ✅ No open positions to update (all positions are closed)
- OR no positions exist yet (need to create briefs first)

## Data Flow

### 1. Brief Creation (8 AM EST)
When a daily brief is created:
- Stocks are inserted into `stocks` table
- Performance records are created in `stock_performance` table with:
  - `entry_date`: Today's date
  - `entry_price`: Recommended entry price
  - `outcome`: 'open' (default)
  - `exit_date`, `exit_price`, `exit_reason`: NULL (until closed)

### 2. Performance Update (5 PM EST)
The cron job:
- Finds all positions where `outcome = 'open'`
- Checks current prices
- Closes positions that hit targets
- Database trigger calculates performance metrics

### 3. Dashboard Display
The dashboard queries `stock_performance` to show:
- Win rate
- Average return
- Open positions
- Recent picks

## Troubleshooting

### No Updates Showing
1. **Check if briefs are being created:**
   - Verify `/api/cron/daily-brief` is running
   - Check `briefs` table in Supabase

2. **Check if performance records exist:**
   ```sql
   SELECT COUNT(*) FROM stock_performance WHERE outcome = 'open';
   ```

3. **Check cron job logs:**
   - Vercel Dashboard → Project → Logs
   - Filter for `/api/performance/update`

4. **Test manually:**
   ```bash
   curl https://dailyticker.co/api/performance/update
   ```

### Cron Not Running
1. **Verify cron configuration:**
   - Check `vercel.json` has the cron entry
   - Ensure it's deployed to production (crons only work in production)

2. **Check Vercel cron status:**
   - Vercel Dashboard → Project → Settings → Cron Jobs
   - Should show last run time and status

3. **Verify endpoint is accessible:**
   - Test GET request manually
   - Check for authentication errors

## Next Steps

- ✅ GET request support added
- ✅ Vercel cron header checking
- ✅ Error handling improved
- ⏳ Monitor cron execution in Vercel dashboard
- ⏳ Verify performance records are created when briefs are stored

## Related Files
- `/app/api/performance/update/route.ts` - Main endpoint
- `/app/api/archive/store/route.ts` - Creates performance records when briefs are stored
- `/vercel.json` - Cron configuration
- `/supabase/performance-tracking-schema.sql` - Database schema

