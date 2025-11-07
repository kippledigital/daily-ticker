# Daily Ticker Automation - Quick Start

Get the automation running in 15 minutes.

---

## Prerequisites Checklist

- [ ] OpenAI API key
- [ ] Resend API key (domain verified)
- [ ] Twitter API credentials (4 keys)
- [ ] Supabase database (already set up)
- [ ] Polygon.io API key (already have)
- [ ] Beehiiv API key (already have)

---

## 5-Minute Setup

### 1. Get API Keys (5 min)

**OpenAI:**
```
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy key starting with sk-...
```

**Resend:**
```
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Copy key starting with re_...
```

**Twitter:**
```
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create project + app
3. Set permissions to "Read and Write"
4. Generate keys (you'll get 4 keys total)
```

### 2. Configure Environment (2 min)

```bash
cd /Users/20649638/daily-ticker

# Copy example
cp .env.example .env.local

# Edit with your keys
nano .env.local  # or use your editor

# Minimum required:
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
TEST_EMAIL=your-email@example.com
```

### 3. Test Locally (3 min)

```bash
# Start dev server
npm run dev

# In another terminal, test automation:
curl http://localhost:3000/api/manual/test-brief
```

**Expected output:**
```json
{
  "success": true,
  "brief": {
    "date": "2025-10-27",
    "subject": "☀️ ...",
    "stockCount": 3,
    "actionableCount": 2
  },
  "steps": {
    "stockDiscovery": true,
    "aiAnalysis": true,
    "emailGeneration": true,
    ...
  }
}
```

### 4. Deploy to Vercel (5 min)

```bash
# Add env vars to Vercel
vercel env add OPENAI_API_KEY
vercel env add RESEND_API_KEY
vercel env add TWITTER_API_KEY
vercel env add TWITTER_API_SECRET
vercel env add TWITTER_ACCESS_TOKEN
vercel env add TWITTER_ACCESS_SECRET
vercel env add TEST_EMAIL

# Generate secrets
vercel env add CRON_SECRET
# Paste: $(openssl rand -base64 32)

vercel env add MANUAL_TRIGGER_KEY
# Paste: $(openssl rand -base64 32)

# Deploy
git add .
git commit -m "Enable automation"
git push

# Or deploy directly
vercel --prod
```

### 5. Test Production (2 min)

```bash
# Get your manual trigger key
MANUAL_KEY=$(vercel env pull .env.production.local && grep MANUAL_TRIGGER_KEY .env.production.local | cut -d '=' -f2)

# Test production endpoint
curl "https://dailyticker.co/api/manual/test-brief?key=$MANUAL_KEY"
```

---

## Verify Everything Works

### ✅ Checklist

- [ ] Local test returns `"success": true`
- [ ] Email received at TEST_EMAIL
- [ ] Tweet posted to Twitter
- [ ] Brief appears at https://dailyticker.co/archive
- [ ] Vercel cron is scheduled (check Vercel dashboard > Cron)

---

## What Happens Daily?

**Every weekday at 8:00 AM EST:**

1. Vercel Cron triggers `/api/cron/daily-brief`
2. Automation discovers 3 trending stocks
3. AI analyzes each stock
4. Email generated with "Scout" persona
5. Email sent to all Beehiiv subscribers
6. Tweet posted to @GetDailyTicker
7. Brief archived in Supabase

**Check logs:**
```bash
vercel logs --since 2h | grep "daily-brief"
```

---

## Common Issues

### "No response from OpenAI"

**Fix:** Add credits to OpenAI account
- Go to https://platform.openai.com/account/billing
- Add $10-20 credit

### Email not sending

**Fix:** Verify Resend domain
- Go to https://resend.com/domains
- Ensure dailyticker.co is verified (green checkmark)

### Twitter post fails

**Fix:** Check app permissions
- Go to https://developer.twitter.com/en/portal/dashboard
- Ensure app has "Read and Write" permissions
- Regenerate access tokens after changing permissions

### Cron not running

**Fix:** Check vercel.json deployed
```bash
git status
git add vercel.json
git commit -m "Add cron config"
git push
```

---

## Quick Commands

```bash
# Test locally
npm run dev
curl http://localhost:3000/api/manual/test-brief

# View logs
vercel logs --since 1h

# Check cron status
vercel crons ls

# Test specific component
curl -X POST http://localhost:3000/api/manual/test-brief \
  -H "Content-Type: application/json" \
  -d '{"component": "stock-discovery"}'

# Deploy
git push  # (if connected to Vercel GitHub integration)
# or
vercel --prod
```

---

## Next Steps

✅ System is running!

Now:

1. **Monitor first automated run** (tomorrow at 8 AM EST)
2. **Check email** - did subscribers receive it?
3. **Check Twitter** - did it post?
4. **Check archive** - is it stored?
5. **Run for 1 week** alongside Gumloop
6. **Migrate fully** - cancel Gumloop

---

## Need Help?

- Full docs: [AUTOMATION_SETUP.md](./AUTOMATION_SETUP.md)
- Code: [/lib/automation/](../lib/automation/)
- Logs: `vercel logs --since 24h`
