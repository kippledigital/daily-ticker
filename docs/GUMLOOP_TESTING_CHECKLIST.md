# Gumloop Integration Testing Checklist

Gumloop has successfully added database integration to your Daily Ticker automation. Use this checklist to test before removing Google Sheets.

---

## ✅ What Gumloop Implemented

### Node 7b: Get Historical Data
- **ID:** giA6E9EQuq2xp3herHmjae
- **Type:** HTTP GET
- **URL:** https://dailyticker.co/api/archive/list?limit=30
- **Purpose:** Retrieve last 30 days of briefs
- **Connected to:** Node 3q9Ly5FfQjpXu2AVrqJspP (Stock Analysis AI)
- **Benefit:** AI can reference past recommendations, avoid repetition, note trends

### Node 20: Save Stock Brief to Database
- **ID:** xkJWdvmiKW9CACruhG8ygQ
- **Type:** HTTP POST
- **URL:** https://dailyticker.co/api/archive/store
- **Inputs Mapped:**
  - `subject` ← Node 26DvM73cLyAQmrj8aTPXtd (Subject Line Generator)
  - `html_content` ← Node qh2dowHtBd6EFwtqkKiXnJ (Morning Brief HTML)
  - `tldr` ← Node qh2dowHtBd6EFwtqkKiXnJ (Morning Brief HTML)
  - `actionable_count` ← Node ah6n2a59YCDnvMK962k9eR (Actionable Count)
  - `stocks_json` ← Node 2KuA89TjEEbB7DeJAAKQjZ (Investment Decision Filter)
- **Auto-generated:** Current date in YYYY-MM-DD format
- **Error Handling:** Won't block workflow if API fails

---

## 🧪 Pre-Flight Checklist

Before running your first test:

### 1. Verify Vercel KV is Connected
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Navigate to Storage → daily-ticker-archive
- [ ] Status should be "Ready"
- [ ] Environment variables set (KV_URL, KV_REST_API_URL, etc.)

### 2. Verify Archive Page is Live
- [ ] Visit https://dailyticker.co/archive
- [ ] Page loads successfully (may show empty state initially)
- [ ] No errors in browser console (F12 → Console)

### 3. Test Webhook Endpoint Manually (Optional)
Run this curl command to verify the API works:

```bash
curl -X POST https://dailyticker.co/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-26",
    "subject": "🧪 Test Brief — Manual Test",
    "htmlContent": "<h1>Manual Test</h1><p>Testing before Gumloop integration.</p>",
    "actionableCount": 1,
    "stocks": [{
      "ticker": "TEST",
      "sector": "Test",
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
  "message": "Brief for 2025-10-26 stored successfully",
  "data": {
    "date": "2025-10-26",
    "stockCount": 1,
    "actionableCount": 1
  }
}
```

- [ ] Verify test brief appears at https://dailyticker.co/archive

---

## 🚀 Test Run #1: Manual Execution

### Step 1: Run Gumloop Automation Once
- [ ] Go to your Gumloop dashboard
- [ ] Find Daily Ticker automation
- [ ] Click "Run" to execute manually (don't wait for scheduled 6am run)
- [ ] Monitor the flow execution

### Step 2: Check Node 7b (Get Historical Data)
- [ ] Node executed successfully
- [ ] Output shows JSON array of briefs (may be empty if first run)
- [ ] No errors in node logs
- [ ] If empty: This is normal for first run, continue testing

### Step 3: Check Node 20 (Save to Database)
In Gumloop's node output, verify:
- [ ] `response_status` = `"201"` (success)
- [ ] `success` = `"true"`
- [ ] `response_body` contains success message
- [ ] No error messages in logs

**If Node 20 fails, check:**
- Error message in `response_body`
- Verify date format is YYYY-MM-DD
- Confirm all required fields are present
- Check Vercel function logs for details

### Step 4: Verify Email Was Sent
- [ ] Check nikki.kipple@gmail.com inbox
- [ ] Morning Brief email received
- [ ] Email content looks correct
- [ ] Subject line matches Node 20's `subject` value

### Step 5: Verify Archive Updated
- [ ] Visit https://dailyticker.co/archive
- [ ] Brief appears in the list
- [ ] Date shows today's date
- [ ] Subject line matches email
- [ ] Click on the brief card

### Step 6: Verify Individual Brief Page
- [ ] URL is https://dailyticker.co/archive/YYYY-MM-DD (today's date)
- [ ] Page loads successfully
- [ ] Subject line displays correctly
- [ ] TL;DR summary is visible
- [ ] Stock summary cards show all stocks from analysis
- [ ] Each stock card shows:
  - Ticker, sector, confidence %
  - Risk level badge (color-coded)
  - Action badge (BUY/WATCH/HOLD/AVOID)
  - Entry price and zone
  - All recommendation details
- [ ] Social sharing buttons work
- [ ] Subscribe CTA visible at bottom

---

## 🔁 Test Run #2: Next Day Test

### Purpose
Verify historical data (Node 7b) works correctly when there's data from previous day.

### Steps
- [ ] Wait 24 hours OR manually run automation again with different stocks
- [ ] Node 7b should now return yesterday's brief in the array
- [ ] Check Stock Analysis AI prompt includes historical context
- [ ] Verify new brief doesn't repeat yesterday's stocks (unless legitimately trending)
- [ ] New brief appears in archive
- [ ] Archive now shows 2 briefs, sorted newest first

---

## 🔍 Verification Checklist

### Database Storage
- [ ] Briefs are being saved to Vercel KV (check Vercel Storage metrics)
- [ ] Storage usage is increasing (see Vercel dashboard)
- [ ] No duplicate date errors (each day should be unique)

### Historical Data Usage
- [ ] Stock Analysis AI references past recommendations
- [ ] TL;DR mentions trending patterns when applicable
- [ ] Subject lines reference recent winners when relevant
- [ ] No exact duplicate stock recommendations within 7 days (unless intentional)

### Error Handling
- [ ] If Node 20 fails, email still sends (workflow continues)
- [ ] Errors are logged but don't block daily operation
- [ ] Failed briefs don't appear in archive (expected)

### Google Sheets Comparison
- [ ] Compare data saved in Google Sheets vs database
- [ ] Verify all fields are captured correctly
- [ ] Confirm no data loss during migration
- [ ] Once verified, Google Sheets nodes can be removed

---

## ✅ Success Criteria

All of these should be true before removing Google Sheets:

- [ ] **3 consecutive days** of successful automation runs
- [ ] **3 briefs** appear in archive (https://dailyticker.co/archive)
- [ ] **Historical data** is being used in stock analysis (verify in email content)
- [ ] **No errors** in Gumloop Node 20 logs
- [ ] **Email delivery** continues uninterrupted
- [ ] **Archive pages** load correctly for all 3 briefs
- [ ] **Search functionality** works (search by ticker from any brief)
- [ ] **Data completeness** matches Google Sheets entries

---

## 🗑️ Remove Google Sheets (After Success)

Once all tests pass for 3 consecutive days:

### Nodes to Remove:
1. **Node kVpKrp5keKFeucu9HsF1Yk** - Google Sheets Reader
2. **Node 3ZJKf14g5WDntfbDexenNP** - Google Sheets Writer

### Steps:
1. Take a final backup export from Google Sheets (download as CSV)
2. In Gumloop, delete the two Google Sheets nodes
3. Verify no broken connections in the workflow
4. Run one more test to confirm workflow still works
5. Archive or delete the Google Sheet (keep as backup for 30 days)

---

## 🐛 Troubleshooting

### Node 20 Returns 400 Error
**Possible Causes:**
- Missing required fields (date, subject, htmlContent, stocks)
- Invalid date format (must be YYYY-MM-DD)
- stocks array is empty or malformed
- Missing stock fields (ticker, sector, confidence, etc.)

**Solution:**
- Check Gumloop's Node 20 input mapping
- Verify each field is connected correctly
- Check Vercel function logs for detailed error message

### Node 20 Returns 409 Error
**Cause:** Duplicate brief for same date (already exists)

**Solution:**
- Brief was already saved (check archive)
- If testing, delete previous test brief from KV
- If real duplicate, investigate why automation ran twice

### Node 20 Returns 500 Error
**Possible Causes:**
- Vercel KV database connection issue
- Environment variables not set
- Function timeout or error

**Solution:**
- Check Vercel dashboard → Storage → Status
- Verify KV environment variables are set
- Check Vercel function logs for stack trace

### Node 7b Returns Empty Array
**First Run:** This is normal - no historical data yet

**After First Run:**
- Check Vercel KV has data: `curl https://dailyticker.co/api/archive/list`
- Verify Node 20 successfully saved previous brief
- Check Vercel function logs for errors

### Brief Doesn't Appear in Archive
**Check:**
1. Node 20 returned 201 status (success)
2. Visit archive API directly: https://dailyticker.co/api/archive/list
3. Check Vercel function logs for errors
4. Verify date format in Node 20 output

### Email Sends But Database Doesn't Save
**This is OK!** Error handling is working correctly.

**Steps:**
1. Check Node 20 error message in Gumloop logs
2. Fix the issue (likely field mapping or format)
3. Run automation again
4. Previous email recipients won't be affected

---

## 📊 Monitoring

### Daily (First Week)
- Check archive page shows new brief each morning
- Verify email was sent
- Monitor Vercel function logs for errors
- Check Vercel KV storage usage

### Weekly (Ongoing)
- Review historical data quality in email content
- Analyze archive traffic in Google Analytics
- Check for any duplicate or missing briefs
- Monitor Vercel KV storage approaching limits (though 14+ years capacity)

### Monthly (Ongoing)
- Compare Google Sheets backup to archive data
- Review most popular archive pages
- Assess quality improvement from historical data
- Plan for future analytics features

---

## 🎯 Next Steps After Testing

Once all tests pass:

1. **Remove Google Sheets** (nodes kVpKrp5keKFeucu9HsF1Yk and 3ZJKf14g5WDntfbDexenNP)
2. **Schedule daily automation** (if not already scheduled for 6am)
3. **Monitor for 1 week** to ensure stability
4. **Share archive link** with subscribers
5. **Plan Phase 2:** Performance tracking (win rates, % gains)

---

## 📞 Support

### If Node 20 Issues Persist:
- **Check:** [GUMLOOP_WEBHOOK.md](./GUMLOOP_WEBHOOK.md) for field mappings
- **Test:** Use curl command to test API directly
- **Logs:** Check Vercel dashboard → Functions → Logs
- **Contact:** brief@dailyticker.co

### If Historical Data (Node 7b) Issues:
- **Verify:** https://dailyticker.co/api/archive/list returns data
- **Check:** Date range (limit=30 gets last 30 briefs)
- **Test:** Visit archive page to see if briefs are visible

---

## 📋 Final Checklist Summary

- [ ] Vercel KV connected and ready
- [ ] Archive page accessible
- [ ] Manual curl test successful (optional)
- [ ] First Gumloop test run completed
- [ ] Node 7b executed without errors
- [ ] Node 20 returned 201 status
- [ ] Email delivered successfully
- [ ] Brief appears in archive
- [ ] Individual brief page loads correctly
- [ ] Second test run shows historical data working
- [ ] Third test run confirms consistency
- [ ] All data matches Google Sheets
- [ ] Ready to remove Google Sheets nodes

**Status:** Ready for first test run! ✅
