# Data Quality Guarantee

## 🎯 No Sample Data Policy

**CRITICAL:** This service guarantees **100% real, accurate stock data**. Sample/fake data is **NEVER** used. If real data cannot be fetched from any source, the automation **fails** rather than sending inaccurate information to paying customers.

## 🔄 Multi-Source Fallback Strategy

The system uses a **2-tier fallback** approach to ensure data availability:

### 1. **Primary: Polygon.io** (Free Tier)
- **Rate Limit:** 5 calls/minute = 7,200 calls/day
- **Usage:** ~20-30 calls/day for stock discovery + 3 calls for final stocks
- **Cost:** $0/month (free tier)
- **Upgrade Option:** $29/month for 100 calls/minute (Starter plan)

### 2. **Backup #1: Alpha Vantage** (Free Tier)
- **Rate Limit:** 25 calls/day
- **Usage:** Only used for final 3 stocks if Polygon fails (saves quota)
- **Cost:** $0/month (free tier)
- **Upgrade Option:** $49.99/month for 500 calls/day

**Note:** IEX Cloud shut down on August 31, 2024, so it's no longer available as a backup source.

## 📋 Required API Keys

### Minimum Setup (Primary Only)
```env
POLYGON_API_KEY=your_polygon_api_key
```

### Recommended Setup (With Backup)
```env
POLYGON_API_KEY=your_polygon_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

## 🔑 Getting API Keys

### Polygon.io
1. Visit [polygon.io](https://polygon.io)
2. Sign up for free account
3. Go to Dashboard → API Keys
4. Copy your API key

### Alpha Vantage
1. Visit [alphavantage.co](https://www.alphavantage.co/support/#api-key)
2. Request free API key (instant)
3. Copy your API key

**Note:** IEX Cloud shut down on August 31, 2024, so it's no longer available.

## 🚨 What Happens If All Sources Fail?

If **both** API sources fail to return real data:

1. **Automation stops immediately**
2. **Error logged** with details
3. **Admin notification sent** via email
4. **Cron run marked as FAILED** in database
5. **NO EMAILS SENT** (prevents sending bad data)

This ensures **zero tolerance** for inaccurate data.

## 💰 Cost Analysis

### Current Setup (All Free Tiers)
- **Total Cost:** $0/month
- **Daily Usage:** ~25-30 API calls
- **Monthly Usage:** ~750 calls (well within all free tier limits)

### If You Need More Reliability

**Option 1: Upgrade Polygon Only** ($29/month)
- 100 calls/minute (vs 5 calls/minute)
- Eliminates rate limit issues
- Still uses Alpha Vantage as backup

**Option 2: Upgrade Alpha Vantage** ($49.99/month)
- 500 calls/day (vs 25 calls/day)
- Better backup coverage
- Still uses Polygon as primary

**Recommendation:** Start with free tiers. If you see failures, upgrade Polygon to $29/month first (most cost-effective).

## 📊 Data Quality Monitoring

The system logs detailed data quality metrics:

```
✅ Quote fetch complete:
   Sources used: Polygon, Alpha Vantage
   Successful: 3/3 (100%)
   Failed: 0
```

If failures occur:
```
🚨 POLYGON DATA QUALITY WARNING:
   Total requested: 20
   Successful: 15 (75.0%)
   Failed: 5 (25.0%)
   Failed symbols: XOM, CVX, COP, SLB, EOG
   ⚠️ Trying backup sources...
```

## ✅ Verification

To verify your setup:

1. **Check logs** after cron runs for data quality metrics
2. **Monitor Vercel logs** for "✅ Real data fetched" messages
3. **Check cron_runs table** in Supabase for success/failure status
4. **Verify API keys** are set in Vercel environment variables

## 🔧 Troubleshooting

### "CRITICAL: Failed to fetch real data"
- **Cause:** All API sources failed
- **Fix:** 
  1. Check API keys are set in Vercel
  2. Verify API keys are valid (not expired)
  3. Check API provider status pages
  4. Consider upgrading to paid tier

### "Polygon rate limit hit"
- **Cause:** Exceeding 5 calls/minute
- **Fix:** 
  1. Current delays are 13 seconds (safe)
  2. If still hitting limits, upgrade Polygon to $29/month
  3. Or reduce max candidates in stock discovery

### "Alpha Vantage quota exceeded"
- **Cause:** Using more than 25 calls/day
- **Fix:** 
  1. Alpha Vantage only used for final 3 stocks (should be fine)
  2. If needed, upgrade to $49.99/month plan

## 📝 Summary

- ✅ **No sample data** - system fails if no real data available
- ✅ **2-tier fallback** - Polygon → Alpha Vantage
- ✅ **Free tier sufficient** - ~$0/month for current usage
- ✅ **Upgrade options** - $9-50/month if needed
- ✅ **Automatic monitoring** - logs show data quality metrics
- ✅ **Fail-safe design** - stops automation rather than sending bad data

