# Archive System Testing Guide

This guide walks through testing the complete archive system after Vercel KV is connected.

---

## Prerequisites

1. Vercel KV database connected in Vercel dashboard
2. Environment variables set automatically by Vercel:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
3. Production deployment completed (auto-deploys after KV connection)

---

## Step 1: Verify Archive Page is Live

### Production URL
Visit: https://dailyticker.co/archive

**Expected Behavior:**
- Page loads successfully
- Shows "No briefs available yet. Check back soon!" message
- Search bar is functional
- "Subscribe to Daily Ticker" button is visible

### Local Testing (Optional)
```bash
npm run dev
# Visit http://localhost:3000/archive
```

---

## Step 2: Test Webhook Endpoint

### Using curl (Recommended)

Run this command in your terminal:

```bash
curl -X POST https://dailyticker.co/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-27",
    "subject": "📈 Test Brief — Apple & Nvidia Analysis",
    "htmlContent": "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\"><h1>Test Morning Brief</h1><p>This is a test brief to validate the archive integration.</p><h2>Market Overview</h2><p>Testing the webhook endpoint with sample data.</p></div>",
    "tldr": "Testing the archive webhook integration with sample stock data.",
    "actionableCount": 2,
    "stocks": [
      {
        "ticker": "AAPL",
        "sector": "Tech",
        "confidence": 85,
        "riskLevel": "Low",
        "action": "HOLD",
        "entryPrice": 178.45,
        "entryZoneLow": 175.00,
        "entryZoneHigh": 180.00,
        "summary": "Apple holds steady as iPhone demand remains strong in Asian markets.",
        "whyMatters": "China sales exceeded expectations by 12%, driven by iPhone 15 Pro adoption.",
        "momentumCheck": "Sideways →",
        "actionableInsight": "Wait for dip to $175 before adding to position.",
        "allocation": "5-10%",
        "cautionNotes": "Watch for potential earnings miss in Q4 guidance.",
        "learningMoment": "P/E ratios help compare valuation across similar companies."
      },
      {
        "ticker": "NVDA",
        "sector": "Tech",
        "confidence": 72,
        "riskLevel": "Medium",
        "action": "WATCH",
        "entryPrice": 495.22,
        "entryZoneLow": 480.00,
        "entryZoneHigh": 500.00,
        "summary": "Slight pullback after recent rally, investors taking profits.",
        "whyMatters": "Stock up 40% over past quarter, some profit-taking expected.",
        "momentumCheck": "Cooling 📉",
        "actionableInsight": "Dip below $480 may present buying opportunity for long-term holders.",
        "allocation": "3-8%",
        "cautionNotes": "High valuation makes it sensitive to market corrections.",
        "learningMoment": "RSI above 70 often signals overbought conditions."
      }
    ]
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Brief for 2025-10-27 stored successfully",
  "data": {
    "date": "2025-10-27",
    "stockCount": 2,
    "actionableCount": 2
  }
}
```

**HTTP Status:** `201 Created`

---

## Step 3: Verify Brief in Archive

### Check Archive List
1. Visit: https://dailyticker.co/archive
2. You should now see **1 brief** in the list
3. Verify the card shows:
   - Date: October 27, 2025
   - Subject: "📈 Test Brief — Apple & Nvidia Analysis"
   - Stock count: 2 stocks analyzed
   - Actionable count: 2 actionable
   - Ticker badges: AAPL, NVDA

### Check Individual Brief Page
1. Click on the brief card
2. Should navigate to: https://dailyticker.co/archive/2025-10-27
3. Verify the page shows:
   - Full subject line in header
   - Date: October 27, 2025
   - TL;DR summary
   - Full HTML content rendered
   - 2 stock summary cards (AAPL and NVDA)
   - Each stock card shows:
     - Ticker, sector, confidence %
     - Risk level badge (color-coded)
     - Action badge (HOLD for AAPL, WATCH for NVDA)
     - Entry price and entry zone
     - All recommendation details
   - Social sharing buttons at bottom
   - Subscribe CTA

---

## Step 4: Test Search Functionality

### Search by Ticker
1. Go back to: https://dailyticker.co/archive
2. Enter "AAPL" in the search box
3. Click "Search"
4. Should show: "Showing 1 of 1 briefs for AAPL"
5. Brief card should still be visible

### Search for Non-Existent Ticker
1. Enter "TSLA" in the search box
2. Click "Search"
3. Should show: "No briefs found for TSLA"

### Clear Search
1. Click "Clear search" button
2. Should reset to showing all briefs (1 total)

---

## Step 5: Test Error Handling

### Duplicate Brief (Expected 409 Conflict)
Run the same curl command again:
```bash
curl -X POST https://dailyticker.co/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-10-27", ...}' # (same data as before)
```

**Expected Response:**
```json
{
  "error": "Brief for 2025-10-27 already exists"
}
```
**HTTP Status:** `409 Conflict`

### Missing Required Fields (Expected 400 Bad Request)
```bash
curl -X POST https://dailyticker.co/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-28",
    "subject": "Test"
  }'
```

**Expected Response:**
```json
{
  "error": "Missing required fields: date, subject, htmlContent, stocks"
}
```
**HTTP Status:** `400 Bad Request`

---

## Step 6: Test with Second Brief

Create a second test brief for a different date:

```bash
curl -X POST https://dailyticker.co/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-28",
    "subject": "⚡ Energy Surge — Oil Stocks Rally",
    "htmlContent": "<div><h1>Energy Sector Heats Up</h1><p>Oil stocks rally on supply concerns.</p></div>",
    "tldr": "Energy stocks surge as oil prices climb on OPEC supply cuts.",
    "actionableCount": 1,
    "stocks": [
      {
        "ticker": "XOM",
        "sector": "Energy",
        "confidence": 78,
        "riskLevel": "Medium",
        "action": "BUY",
        "entryPrice": 112.50,
        "entryZoneLow": 110.00,
        "entryZoneHigh": 115.00,
        "summary": "ExxonMobil benefits from rising oil prices and strong refining margins.",
        "whyMatters": "OPEC+ extended production cuts through Q2 2025.",
        "momentumCheck": "Rising 📈",
        "actionableInsight": "Enter position in $110-115 zone with stop loss at $105.",
        "allocation": "5-7%",
        "cautionNotes": "Sensitive to geopolitical risks and demand fluctuations.",
        "learningMoment": "Refining margins often lag crude oil price changes."
      }
    ]
  }'
```

### Verify Archive List Shows Both Briefs
1. Visit: https://dailyticker.co/archive
2. Should show: "Showing 2 of 2 briefs"
3. Briefs should be ordered **newest first** (2025-10-28 then 2025-10-27)

### Test Search Across Multiple Briefs
1. Search for "AAPL" — should show only Oct 27 brief
2. Search for "XOM" — should show only Oct 28 brief
3. Clear search — should show both briefs

---

## Step 7: Test Pagination (Optional)

To test the "Load More" functionality, you would need 11+ briefs. For now, verify:

1. Archive list API endpoint: https://dailyticker.co/api/archive/list
   ```bash
   curl https://dailyticker.co/api/archive/list?limit=1&offset=0
   ```
2. Should return first brief only
3. Change `offset=1` to get second brief

---

## Step 8: Test SEO and Social Sharing

### Open Graph Tags
1. Visit: https://dailyticker.co/archive/2025-10-27
2. View page source (right-click → "View Page Source")
3. Verify meta tags exist:
   ```html
   <meta property="og:title" content="📈 Test Brief — Apple & Nvidia Analysis — Daily Ticker" />
   <meta property="og:description" content="Testing the archive webhook integration..." />
   <meta property="og:url" content="https://dailyticker.co/archive/2025-10-27" />
   <meta property="og:image" content="https://dailyticker.co/opengraph-image" />
   ```

### Social Sharing Links
1. Test "Share on Twitter" button
2. Test "Share on LinkedIn" button
3. Test "Copy Link" button (should show "Copied!" confirmation)

---

## Step 9: Verify in Vercel Logs

1. Go to Vercel dashboard
2. Navigate to your Daily Ticker project
3. Click "Logs" tab
4. Filter by `/api/archive/store`
5. You should see:
   - `201` status codes for successful webhook calls
   - `409` status code for duplicate brief attempt
   - `400` status code for missing fields test

---

## Step 10: Clean Up Test Data (Optional)

To delete test briefs from KV storage, you would need to:

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Access KV:
   ```bash
   vercel kv del brief:2025-10-27
   vercel kv del brief:2025-10-28
   vercel kv zrem briefs:dates 2025-10-27
   vercel kv zrem briefs:dates 2025-10-28
   ```

Or simply leave them as example data for your archive!

---

## Troubleshooting

### "Failed to store brief" error
- **Check Vercel KV environment variables are set**
- Verify in Vercel dashboard → Project → Settings → Environment Variables
- Redeploy if variables were just added

### Archive page shows error
- **Check browser console for errors**
- Verify API endpoint is accessible: https://dailyticker.co/api/archive/list
- Check Vercel logs for function errors

### Brief doesn't appear in archive
- **Verify webhook returned 201 status**
- Check the brief was actually stored: `curl https://dailyticker.co/api/archive/list`
- Look for errors in Vercel function logs

### Search returns no results
- **Ticker search is case-sensitive internally but auto-uppercases**
- Verify the ticker exists in the brief's stocks array
- Check browser network tab for API response

---

## Success Criteria Checklist

- [ ] Archive page loads at https://dailyticker.co/archive
- [ ] Webhook endpoint accepts POST requests and returns 201
- [ ] Brief appears in archive list after webhook call
- [ ] Individual brief page renders correctly at /archive/[date]
- [ ] Search by ticker works correctly
- [ ] Stock summary cards display all data
- [ ] Social sharing buttons are functional
- [ ] Pagination works (if 10+ briefs exist)
- [ ] Duplicate brief returns 409 error
- [ ] Missing fields return 400 error
- [ ] SEO meta tags are present on brief pages

---

## Next Steps

Once testing is complete and successful:

1. **Configure Gumloop Node 20** (see [GUMLOOP_WEBHOOK.md](./GUMLOOP_WEBHOOK.md))
2. **Run your Gumloop automation once** to send real brief
3. **Verify real brief appears in archive**
4. **Monitor for first few days** to ensure automation runs daily
5. **Share archive link** with subscribers!

---

## Support

If you encounter issues:
- Check [GUMLOOP_WEBHOOK.md](./GUMLOOP_WEBHOOK.md) for webhook configuration
- Review Vercel function logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure Vercel KV database is in "Ready" state
