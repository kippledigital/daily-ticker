# Vercel Deployment URLs Guide

Your Daily Ticker site has two URLs during the deployment process. Here's how to handle testing and production.

---

## 🌐 Understanding Your URLs

### Vercel Deployment URL (Current)
- **Format:** `https://daily-ticker-[hash].vercel.app` or `https://daily-ticker.vercel.app`
- **Status:** Available immediately after connecting GitHub to Vercel
- **Use For:** Testing before domain goes live
- **Production Deployments:** `https://daily-ticker.vercel.app` (no hash)
- **Preview Deployments:** `https://daily-ticker-git-[branch]-[team].vercel.app`

### Custom Domain (After DNS Setup)
- **Production:** `https://dailyticker.co`
- **Status:** Pending DNS configuration
- **Use For:** Final production use, public sharing

---

## 📍 Find Your Current Vercel URL

### Method 1: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **daily-ticker** project
3. Look for the **Domains** section
4. Your deployment URLs are listed (copy the `.vercel.app` URL)

### Method 2: GitHub Actions
1. Go to your GitHub repo: https://github.com/kippledigital/daily-ticker
2. Click **Actions** tab
3. Click on the latest deployment
4. Look for "Preview URL" or "Deployment URL" in the logs

### Method 3: Check Latest Commit
1. Go to your GitHub repo
2. Click on the latest commit
3. Look for the Vercel bot comment with deployment URL

**Your Vercel URL will look like:**
- `https://daily-ticker.vercel.app` (most likely)
- OR `https://daily-ticker-kippledigital.vercel.app`

---

## 🧪 Phase 1: Test with Vercel URL

### Update Gumloop Node 20 (Temporarily)

**Before Domain Goes Live, Use Vercel URL:**

In Gumloop Node 20 (Save Stock Brief to Database):
- **URL:** `https://daily-ticker.vercel.app/api/archive/store`
  - ⚠️ Replace `daily-ticker.vercel.app` with YOUR actual Vercel URL

### Update Gumloop Node 7b (Temporarily)

In Gumloop Node 7b (Get Historical Data):
- **URL:** `https://daily-ticker.vercel.app/api/archive/list?limit=30`
  - ⚠️ Replace `daily-ticker.vercel.app` with YOUR actual Vercel URL

### Test with Vercel URL

```bash
# Replace YOUR_VERCEL_URL with your actual Vercel deployment URL
curl -X POST https://YOUR_VERCEL_URL.vercel.app/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-27",
    "subject": "🧪 Test Brief — Vercel URL Test",
    "htmlContent": "<h1>Testing with Vercel URL</h1>",
    "actionableCount": 1,
    "stocks": [{
      "ticker": "TEST",
      "sector": "Test",
      "confidence": 100,
      "riskLevel": "Low",
      "action": "HOLD",
      "entryPrice": 1.00,
      "summary": "Test",
      "whyMatters": "Test",
      "momentumCheck": "Test",
      "actionableInsight": "Test"
    }]
  }'
```

**Expected Response:** `201` status with success message

### Verify Archive Works on Vercel URL

Visit your Vercel URL:
- Archive page: `https://YOUR_VERCEL_URL.vercel.app/archive`
- Individual brief: `https://YOUR_VERCEL_URL.vercel.app/archive/2025-10-27`

---

## 🚀 Phase 2: Switch to Production Domain

Once `dailyticker.co` DNS is configured and live:

### 1. Verify Domain is Live

Test that your domain works:
```bash
curl -I https://dailyticker.co
# Should return 200 OK
```

Visit: https://dailyticker.co
- Site should load (not show DNS error)

### 2. Update Gumloop URLs

**Node 20: Save Stock Brief to Database**
- **Old:** `https://daily-ticker.vercel.app/api/archive/store`
- **New:** `https://dailyticker.co/api/archive/store`

**Node 7b: Get Historical Data**
- **Old:** `https://daily-ticker.vercel.app/api/archive/list?limit=30`
- **New:** `https://dailyticker.co/api/archive/list?limit=30`

### 3. Test Production URLs

```bash
curl -X POST https://dailyticker.co/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-28",
    "subject": "🎉 Production Test — Domain Live",
    "htmlContent": "<h1>Testing with production domain</h1>",
    "actionableCount": 1,
    "stocks": [{
      "ticker": "PROD",
      "sector": "Test",
      "confidence": 100,
      "riskLevel": "Low",
      "action": "HOLD",
      "entryPrice": 1.00,
      "summary": "Production test",
      "whyMatters": "Domain is live",
      "momentumCheck": "Testing",
      "actionableInsight": "Production ready"
    }]
  }'
```

### 4. Verify on Production Domain

- Archive: https://dailyticker.co/archive
- Brief: https://dailyticker.co/archive/2025-10-28

---

## 🔄 Data Migration (If Needed)

If you tested with Vercel URL and created briefs before domain went live:

### Option 1: Keep Test Data (Recommended)
- Briefs created during testing will remain in the database
- They'll be accessible on both Vercel URL and production domain
- Same Vercel KV database is used for both URLs
- No migration needed!

### Option 2: Clear Test Data
Only if you want to start fresh:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Delete test briefs
vercel kv del brief:2025-10-27
vercel kv zrem briefs:dates 2025-10-27
```

---

## 📝 Documentation Updates Needed

After domain goes live, update these docs:

### Files to Update:
1. **TESTING_ARCHIVE.md** - Replace `dailyticker.co` with production URL (if different)
2. **GUMLOOP_WEBHOOK.md** - Update webhook URL examples
3. **GUMLOOP_DATABASE_MIGRATION.md** - Update URL in prompt
4. **GUMLOOP_SIMPLE_PROMPT.txt** - Update URL
5. **GUMLOOP_TESTING_CHECKLIST.md** - Update all URL references

### Quick Find & Replace:
```bash
# When domain is live, run this in your terminal:
cd /Users/20649638/daily-ticker/docs
grep -r "dailyticker.co" . | grep -v ".git"
# Update each file to use your actual production domain
```

---

## 🎯 Current Testing Plan

### Right Now (Before Domain Live):
1. ✅ Find your Vercel deployment URL
2. ✅ Update Gumloop Node 20 URL: `https://[YOUR-VERCEL-URL].vercel.app/api/archive/store`
3. ✅ Update Gumloop Node 7b URL: `https://[YOUR-VERCEL-URL].vercel.app/api/archive/list?limit=30`
4. ✅ Run test with Vercel URL (follow GUMLOOP_TESTING_CHECKLIST.md)
5. ✅ Verify briefs appear at `https://[YOUR-VERCEL-URL].vercel.app/archive`

### When Domain Goes Live:
1. ⏳ Configure DNS for `dailyticker.co`
2. ⏳ Wait for DNS propagation (5 minutes to 48 hours)
3. ⏳ Verify `https://dailyticker.co` loads correctly
4. ⏳ Update Gumloop URLs to use `dailyticker.co`
5. ⏳ Test webhook with production domain
6. ⏳ Share archive with subscribers!

---

## 🔍 Troubleshooting

### Vercel URL Returns 404
**Cause:** Project not deployed yet or URL incorrect

**Solution:**
- Check Vercel dashboard for actual deployment URL
- Verify latest commit triggered deployment
- Check GitHub Actions for deployment status

### Domain Not Live Yet
**Symptoms:**
- `dailyticker.co` shows DNS error
- "This site can't be reached"
- "DNS_PROBE_FINISHED_NXDOMAIN"

**Solution:**
- Use Vercel URL for testing (`.vercel.app`)
- Wait for DNS configuration
- Don't update Gumloop to production domain yet

### Both URLs Work
**This is normal!** After domain goes live:
- Vercel URL continues to work: `https://daily-ticker.vercel.app`
- Production domain also works: `https://dailyticker.co`
- Both point to same deployment
- Same database (Vercel KV)
- Use production domain for Gumloop (cleaner URL)

---

## 💡 Pro Tips

1. **Bookmark your Vercel URL** - You'll use it for testing
2. **Test thoroughly on Vercel URL first** - Before domain goes live
3. **No data loss when switching** - Same database for both URLs
4. **Update docs after domain live** - So future you doesn't get confused
5. **Keep Vercel URL working** - Good for debugging and previews

---

## 🎬 Quick Start (Right Now)

1. **Find your Vercel URL:**
   - Go to https://vercel.com/dashboard
   - Click on "daily-ticker" project
   - Copy the `.vercel.app` URL

2. **Tell Gumloop support:**
   ```
   Update Node 20 URL to: https://[YOUR-VERCEL-URL].vercel.app/api/archive/store
   Update Node 7b URL to: https://[YOUR-VERCEL-URL].vercel.app/api/archive/list?limit=30

   We'll switch to dailyticker.co once DNS is configured.
   ```

3. **Run first test** following [GUMLOOP_TESTING_CHECKLIST.md](./GUMLOOP_TESTING_CHECKLIST.md)

---

## 📧 Contact Gumloop

Send this message to Gumloop support:

```
Hi Gumloop team,

Quick update on the Daily Ticker integration:

My production domain (dailyticker.co) isn't live yet, so please update the URLs to my Vercel deployment URL for testing:

Node 20 (Save Stock Brief to Database):
- URL: https://[YOUR-VERCEL-URL].vercel.app/api/archive/store

Node 7b (Get Historical Data):
- URL: https://[YOUR-VERCEL-URL].vercel.app/api/archive/list?limit=30

Once my domain goes live, I'll ask you to switch these to:
- https://dailyticker.co/api/archive/store
- https://dailyticker.co/api/archive/list?limit=30

All other configuration remains the same.

Thanks!
```

---

**Next Step:** Find your Vercel URL and update Gumloop with it!
