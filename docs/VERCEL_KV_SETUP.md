# Vercel KV Setup Guide

Quick reference for connecting Vercel KV (Redis) to Daily Ticker archive system.

---

## Storage Capacity

- **Free Tier:** 30 MB storage
- **Estimated Capacity:** ~3,750 daily briefs (8 KB per brief)
- **Time Coverage:** 14+ years of daily briefs
- **Conclusion:** More than sufficient for Daily Ticker's needs

---

## Setup in Vercel Dashboard

### Step 1: Create KV Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **KV (Redis)**
5. Name it: `daily-ticker-archive`
6. Choose region closest to your users (e.g., `us-east-1`)
7. Click **Create**

### Step 2: Connect to Project

1. In the KV database page, click **Connect to Project**
2. Select your **daily-ticker** project
3. Choose environments to connect:
   - ✅ **Production** (required)
   - ✅ **Preview** (optional, recommended)
   - ⬜ **Development** (optional, for local testing)
4. Environment variable prefix:
   - Default: `KV_` (recommended)
   - Or custom: `STORAGE_` (if you prefer)
5. Click **Connect**

### Step 3: Verify Connection

After connecting, Vercel will automatically set these environment variables:

```bash
KV_URL=redis://default:***@region.upstash.io:port
KV_REST_API_URL=https://region.upstash.io
KV_REST_API_TOKEN=***
KV_REST_API_READ_ONLY_TOKEN=***
```

**Automatic Deployment:**
- Vercel will automatically redeploy your project with the new environment variables
- Wait 1-2 minutes for deployment to complete

---

## Verify It's Working

### Check Environment Variables

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Environment Variables**
3. Verify all 4 KV variables are present for Production environment

### Test the Archive

1. Wait for automatic deployment to finish
2. Visit: https://dailyticker.co/archive
3. Should load successfully (empty state initially)

---

## Local Development (Optional)

To test archive locally with Vercel KV:

### Option 1: Use Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables (includes KV credentials)
vercel env pull .env.local

# Start dev server
npm run dev
```

Now your local environment can connect to the production KV database.

### Option 2: Manual Setup

1. Go to Vercel Dashboard → Storage → daily-ticker-archive
2. Click **Settings** tab
3. Copy the environment variables
4. Add to your local `.env.local` file:
   ```bash
   KV_URL=your_kv_url
   KV_REST_API_URL=your_rest_api_url
   KV_REST_API_TOKEN=your_token
   KV_REST_API_READ_ONLY_TOKEN=your_read_only_token
   ```
5. Restart your dev server: `npm run dev`

**Warning:** Be careful not to commit `.env.local` to Git! It's already in `.gitignore`.

---

## Testing the Integration

See [TESTING_ARCHIVE.md](./TESTING_ARCHIVE.md) for complete testing guide.

**Quick Test:**

```bash
curl -X POST https://dailyticker.co/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-27",
    "subject": "📈 Test Brief",
    "htmlContent": "<h1>Test</h1>",
    "stocks": [{"ticker": "AAPL", "sector": "Tech", "confidence": 85, "riskLevel": "Low", "action": "HOLD", "entryPrice": 178.45, "summary": "Test", "whyMatters": "Test", "momentumCheck": "Test", "actionableInsight": "Test"}]
  }'
```

Expected response: `{"success": true, "message": "Brief for 2025-10-27 stored successfully"}`

---

## Monitoring Storage Usage

### View KV Database Metrics

1. Go to Vercel Dashboard → Storage → daily-ticker-archive
2. Click **Metrics** tab
3. Monitor:
   - **Storage Used** (of 30 MB)
   - **Daily Requests** (free tier: 10,000/day)
   - **Data Transfer**

### Check Current Data

Using Vercel CLI:

```bash
# List all brief dates
vercel kv zrange briefs:dates 0 -1

# Get total count
vercel kv zcard briefs:dates

# Get a specific brief
vercel kv get brief:2025-10-27

# Check storage size estimate
vercel kv memory usage brief:2025-10-27
```

---

## Data Management

### Delete Individual Brief

```bash
# Delete brief data
vercel kv del brief:2025-10-27

# Remove from dates index
vercel kv zrem briefs:dates 2025-10-27
```

### Delete All Briefs (Caution!)

```bash
# Get all dates
vercel kv zrange briefs:dates 0 -1

# Delete each brief (run for each date)
vercel kv del brief:YYYY-MM-DD

# Clear dates index
vercel kv del briefs:dates
```

---

## Migration to Postgres (Future)

When you're ready to add performance analytics:

1. **Create Supabase/Vercel Postgres database**
2. **Migrate existing briefs:**
   ```bash
   # Export from KV
   vercel kv get brief:YYYY-MM-DD > brief.json

   # Import to Postgres
   # (Use migration script - will provide when needed)
   ```
3. **Update API routes** to use Postgres instead of KV
4. **Keep KV as cache layer** (optional optimization)

---

## Troubleshooting

### "Cannot connect to KV" errors

**Solution:**
- Verify environment variables are set in Vercel
- Check database status in Vercel Dashboard → Storage
- Redeploy project: `vercel --prod`

### "KV connection timeout"

**Solution:**
- Check Upstash status: https://status.upstash.com/
- Verify region is correct
- Try recreating database if persistent

### Local development can't connect

**Solution:**
- Run `vercel env pull .env.local` to get latest credentials
- Verify `.env.local` has all 4 KV variables
- Restart dev server after adding variables

---

## Best Practices

1. **Don't commit credentials** - `.env.local` is gitignored
2. **Use Read-Only token** for read operations (future optimization)
3. **Monitor storage usage** - Set up Vercel alerts at 80% capacity
4. **Backup important data** - Export briefs periodically using CLI
5. **Test before production** - Use Preview environment for webhook testing

---

## Next Steps

1. ✅ Complete Vercel KV setup (this guide)
2. ⏭️ Test archive system ([TESTING_ARCHIVE.md](./TESTING_ARCHIVE.md))
3. ⏭️ Configure Gumloop webhook ([GUMLOOP_WEBHOOK.md](./GUMLOOP_WEBHOOK.md))
4. ⏭️ Monitor first few days of automation
5. ⏭️ Share archive with subscribers!

---

## Support Resources

- **Vercel KV Docs:** https://vercel.com/docs/storage/vercel-kv
- **Upstash Redis Docs:** https://upstash.com/docs/redis
- **Daily Ticker Support:** brief@dailyticker.co
