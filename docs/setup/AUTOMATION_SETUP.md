# Daily Ticker In-House Automation Setup

Complete guide for setting up and running the Daily Ticker automation system (replaces Gumloop).

---

## Overview

This automation system replicates your entire Gumloop workflow in-house, running daily to:

1. ✅ Discover 3 trending stocks from focus sectors
2. ✅ Fetch historical analysis data (last 30 days)
3. ✅ Gather comprehensive financial news & data
4. ✅ Analyze stocks with AI (exact Gumloop prompts)
5. ✅ Validate JSON output
6. ✅ Inject trend symbols (📈/📉/→)
7. ✅ Generate beginner-friendly email (Scout persona)
8. ✅ Send email to subscribers via Resend
9. ✅ Post daily watchlist to Twitter
10. ✅ Store in Supabase archive

**Runs automatically** Monday-Friday at 8:00 AM EST via Vercel Cron.

---

## Prerequisites

### Required API Keys

1. **OpenAI API** - For AI stock analysis and content generation
   - Sign up: https://platform.openai.com/signup
   - Get API key: https://platform.openai.com/api-keys
   - Cost: ~$0.50-2.00 per day (GPT-4 usage)

2. **Resend API** - For sending emails
   - Sign up: https://resend.com/signup
   - Get API key: https://resend.com/api-keys
   - Verify domain: brief@dailyticker.co
   - Cost: Free for first 3,000 emails/month

3. **Twitter API v2** - For posting daily watchlist
   - Apply for access: https://developer.twitter.com/en/portal/petition/essential/basic-info
   - Create app and get keys
   - Cost: Free (Essential tier)

4. **Polygon.io API** (Already have)
   - Stock market data
   - Free tier: 5 API calls/minute

5. **Supabase** (Already set up)
   - Database for archive storage

6. **Beehiiv API** (Already have)
   - Subscriber management

---

## Setup Steps

### 1. Install Dependencies

Already done! You have:
- `openai` - OpenAI SDK
- `resend` - Email sending
- `twitter-api-v2` - Twitter posting
- `@supabase/supabase-js` - Database

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all required variables:

```bash
# Database (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI Services
OPENAI_API_KEY=sk-...  # Get from OpenAI dashboard

# Email
RESEND_API_KEY=re_...  # Get from Resend dashboard
BEEHIIV_API_KEY=...    # Already have
BEEHIIV_PUBLICATION_ID=...  # Already have
TEST_EMAIL=your-email@example.com  # For testing

# Twitter
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...

# Security
CRON_SECRET=$(openssl rand -base64 32)
MANUAL_TRIGGER_KEY=$(openssl rand -base64 32)

# Site
NEXT_PUBLIC_SITE_URL=https://dailyticker.co

# Stock Data (already have)
POLYGON_API_KEY=...
```

### 3. Set Up Resend Domain

1. Go to https://resend.com/domains
2. Add domain: `dailyticker.co`
3. Add DNS records (provided by Resend):
   - SPF record
   - DKIM record
   - DMARC record
4. Verify domain
5. Set "From" email: `brief@dailyticker.co`

### 4. Set Up Twitter API Access

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create new project: "Daily Ticker Automation"
3. Create app: "Daily Ticker Bot"
4. Enable "Read and Write" permissions
5. Generate API keys:
   - API Key & Secret (app-level)
   - Access Token & Secret (user-level)
6. Copy all 4 keys to `.env.local`

### 5. Deploy to Vercel

```bash
# Add environment variables to Vercel
vercel env add OPENAI_API_KEY
vercel env add RESEND_API_KEY
vercel env add TWITTER_API_KEY
vercel env add TWITTER_API_SECRET
vercel env add TWITTER_ACCESS_TOKEN
vercel env add TWITTER_ACCESS_SECRET
vercel env add CRON_SECRET
vercel env add MANUAL_TRIGGER_KEY
# ... add all other variables

# Deploy
git add .
git commit -m "Add in-house automation system"
git push

# Or deploy directly
vercel --prod
```

### 6. Enable Vercel Cron

Cron is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-brief",
      "schedule": "0 13 * * 1-5"
    }
  ]
}
```

**Schedule:** Monday-Friday at 1:00 PM UTC (8:00 AM EST)

Vercel automatically runs this after deployment.

---

## Testing

### Option 1: Manual Test (Development)

Run locally:

```bash
npm run dev

# In another terminal:
curl http://localhost:3000/api/manual/test-brief
```

This will run the full automation and return results.

### Option 2: Manual Test (Production)

```bash
curl "https://dailyticker.co/api/manual/test-brief?key=YOUR_MANUAL_TRIGGER_KEY"
```

### Option 3: Test Individual Components

```bash
# Test stock discovery
curl -X POST http://localhost:3000/api/manual/test-brief \
  -H "Content-Type: application/json" \
  -d '{"component": "stock-discovery", "params": {}}'

# Test news gathering
curl -X POST http://localhost:3000/api/manual/test-brief \
  -H "Content-Type: application/json" \
  -d '{"component": "news-gathering", "params": {"ticker": "AAPL"}}'

# Test email generation
curl -X POST http://localhost:3000/api/manual/test-brief \
  -H "Content-Type: application/json" \
  -d '{
    "component": "email-generation",
    "params": {
      "stocks": [...],
      "date": "2025-10-27"
    }
  }'
```

---

## Monitoring

### Check Cron Logs

```bash
# View recent logs
vercel logs --since 1h

# Follow live logs
vercel logs --follow
```

### Monitor Daily Runs

1. Go to Vercel dashboard
2. Navigate to your project
3. Click "Logs" tab
4. Filter by `/api/cron/daily-brief`

You'll see:
- 🚀 Starting daily automation...
- ✅ Step completions
- 🎉 Success message
- Or ❌ error details

### Set Up Alerts

Create a monitoring endpoint:

```typescript
// app/api/health/automation/route.ts
export async function GET() {
  // Check last successful run from database
  // Return status
}
```

Use a service like:
- Better Uptime (https://betteruptime.com)
- UptimeRobot (https://uptimerobot.com)
- Vercel Monitoring (built-in)

---

## Customization

### Change Stock Selection

Edit `lib/automation/stock-discovery.ts`:

```typescript
const DEFAULT_CONFIG = {
  numberOfTickers: 3,  // Change to 5
  focusSectors: ['Technology', 'Healthcare'],  // Focus only on these
  minPriceChangePercent: 2,  // Require 2% move
};
```

### Change Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-brief",
      "schedule": "0 14 * * 1-5"  // 9 AM EST instead of 8 AM
    }
  ]
}
```

Cron syntax: `minute hour day month weekday`
- `0 13 * * 1-5` = 1 PM UTC, Mon-Fri (8 AM EST)
- `0 14 * * 1-5` = 2 PM UTC, Mon-Fri (9 AM EST)

### Modify AI Prompts

Edit prompts in:
- `lib/automation/ai-analyzer.ts` - Stock analysis
- `lib/automation/email-generator.ts` - Email generation, subject lines, TL;DR

### Change Email Template

The email is generated by AI using the "Scout" persona prompt in `lib/automation/email-generator.ts`.

To modify the format, edit the system prompt in that file.

---

## Troubleshooting

### Automation fails with "No response from OpenAI"

**Solution:** Check OpenAI API key and account credits

```bash
# Verify key is set
echo $OPENAI_API_KEY

# Check usage: https://platform.openai.com/usage
```

### Email not sending

**Solution:** Check Resend domain verification

1. Go to https://resend.com/domains
2. Ensure domain is verified (green checkmark)
3. Check DNS records are correct
4. Test with Resend's email testing tool

### Twitter post fails

**Solution:** Check Twitter API permissions

1. App must have "Read and Write" permissions
2. Access token must be regenerated after changing permissions
3. Check rate limits (50 tweets per 24 hours)

### Cron not running

**Solution:** Check Vercel cron configuration

```bash
# View cron deployments
vercel crons ls

# Check logs
vercel logs --since 24h | grep cron
```

### Stock discovery returns same stocks

**Solution:** Historical data is filtering recently analyzed stocks

Either:
1. Wait 7 days for rotation
2. Temporarily disable filtering in `lib/automation/stock-discovery.ts`
3. Clear recent entries from Supabase database

---

## Cost Breakdown

### Monthly Costs (Estimated)

| Service | Usage | Cost |
|---------|-------|------|
| OpenAI GPT-4 | ~20 requests/day × 22 days | $30-40/month |
| Resend | 500 emails/day × 22 days | Free (under 3k/month) |
| Twitter API | 22 posts/month | Free |
| Polygon.io | Stock data | Free tier |
| Supabase | Database storage | Free tier |
| Vercel | Hosting + Cron | Free tier |
| **Total** | | **~$30-40/month** |

**Savings vs Gumloop:** $10-20/month (depending on Gumloop plan)

---

## Migration from Gumloop

### Parallel Running (Week 1)

Run both systems simultaneously:

1. Keep Gumloop running as-is
2. Enable in-house automation
3. Compare outputs daily
4. Verify email quality, Twitter posts, archive storage

### Cutover (Week 2)

Once confident:

1. **Monday morning:** Disable Gumloop automation
2. **Monitor:** Watch Vercel logs for in-house automation run
3. **Verify:** Check email inbox, Twitter feed, archive page
4. **Ready:** Cancel Gumloop subscription

### Rollback Plan

If issues arise:

1. Re-enable Gumloop immediately
2. Pause Vercel cron (comment out in `vercel.json`)
3. Debug in-house system
4. Try again when fixed

---

## Support & Maintenance

### Weekly Tasks

- Review Vercel logs for errors
- Check OpenAI usage/costs
- Verify emails are sending
- Monitor Twitter engagement

### Monthly Tasks

- Review and adjust stock selection criteria
- Update AI prompts based on user feedback
- Check for new API features (OpenAI, Resend, Twitter)
- Optimize costs if needed

### Emergency Contacts

- Vercel support: https://vercel.com/help
- OpenAI support: https://help.openai.com
- Resend support: https://resend.com/support
- Twitter API support: https://twittercommunity.com/

---

## Next Steps

1. ✅ Complete setup checklist above
2. ✅ Run manual test
3. ✅ Deploy to Vercel
4. ✅ Monitor first automated run
5. ✅ Run in parallel with Gumloop for 1 week
6. ✅ Migrate fully and cancel Gumloop

**Questions?** Check the code comments or create an issue in the GitHub repo.
