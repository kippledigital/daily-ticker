# Gumloop Webhook Integration Guide

This document explains how to connect your Gumloop automation to Daily Ticker's archive system.

## Overview

Add a webhook node (Node 20) to your Gumloop automation that sends each Morning Brief to Daily Ticker for storage and display in the archive.

---

## Setup Steps

### 1. Add Webhook Node to Gumloop

In your Gumloop automation, add a new **HTTP Request** node after Node 18 (Gmail Sender):

- **Node Name:** "Send to Daily Ticker Archive"
- **Type:** POST Request
- **URL:** `https://dailyticker.co/api/archive/store`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```

### 2. Configure Webhook Payload

The webhook must send a JSON payload with the following structure:

```json
{
  "date": "2025-10-27",
  "subject": "☀️ Apple Holds Steady | Energy Cools Off",
  "htmlContent": "<div>...Full Morning Brief HTML...</div>",
  "tldr": "Market opened mixed with tech holding steady while energy cooled off after recent gains.",
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
}
```

---

## Field Definitions

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `date` | string | Brief date in YYYY-MM-DD format | `"2025-10-27"` |
| `subject` | string | Email subject line with emoji | `"☀️ Apple Holds Steady"` |
| `htmlContent` | string | Full Morning Brief HTML content | `"<div>...</div>"` |
| `stocks` | array | Array of stock recommendation objects | See below |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `tldr` | string | Brief summary/TL;DR | `"Market opened mixed..."` |
| `actionableCount` | number | Number of actionable recommendations | `2` |

### Stock Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ticker` | string | ✅ Yes | Stock symbol (uppercase) |
| `sector` | string | ✅ Yes | Market sector (Tech, Healthcare, Energy, Finance) |
| `confidence` | number | ✅ Yes | Confidence score 0-100 |
| `riskLevel` | string | ✅ Yes | "Low", "Medium", or "High" |
| `action` | string | ✅ Yes | "BUY", "WATCH", "HOLD", or "AVOID" |
| `entryPrice` | number | ✅ Yes | Current/entry price |
| `summary` | string | ✅ Yes | Brief summary of the stock |
| `whyMatters` | string | ✅ Yes | Why this stock matters now |
| `momentumCheck` | string | ✅ Yes | Momentum indicator (e.g., "📈", "→", "📉") |
| `actionableInsight` | string | ✅ Yes | Specific actionable recommendation |
| `entryZoneLow` | number | ⬜ No | Lower bound of entry zone |
| `entryZoneHigh` | number | ⬜ No | Upper bound of entry zone |
| `allocation` | string | ⬜ No | Suggested portfolio allocation |
| `cautionNotes` | string | ⬜ No | Risk warnings or cautions |
| `learningMoment` | string | ⬜ No | Educational insight |

---

## Mapping Gumloop Outputs to Webhook Payload

Here's how to map your existing Gumloop nodes to the webhook payload:

| Gumloop Node Output | Webhook Field | Notes |
|---------------------|---------------|-------|
| Current date | `date` | Format as YYYY-MM-DD |
| Subject Line Generator (26DvM73c) | `subject` | Use generated subject with emoji |
| Morning Brief Output (tS7RbU8L) | `htmlContent` | Full HTML email content |
| Create TL;DR Brief (qh2dowHt) | `tldr` | Extract TL;DR section |
| Action Confidence Scoring (ah6n2a59) | `actionableCount` | Actionable count output |
| Stock Analysis JSON Parser (pC9DouEY) | `stocks` array | Map each analyzed stock |

### Stock Array Mapping

For each stock from Stock Analysis AI (3q9Ly5Ff):

```javascript
{
  ticker: stock.ticker,
  sector: stock.sector,
  confidence: stock.confidence,
  riskLevel: stock.risk_level,
  action: stock.action, // From Investment Decision Filter
  entryPrice: stock.current_price,
  entryZoneLow: stock.ideal_entry_low,
  entryZoneHigh: stock.ideal_entry_high,
  summary: stock.summary,
  whyMatters: stock.why_matters,
  momentumCheck: stock.momentum_check + " " + stock.trend_symbol,
  actionableInsight: stock.actionable_insight,
  allocation: stock.suggested_allocation,
  cautionNotes: stock.caution,
  learningMoment: stock.learning_moment
}
```

---

## Response Handling

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Brief for 2025-10-27 stored successfully",
  "data": {
    "date": "2025-10-27",
    "stockCount": 3,
    "actionableCount": 2
  }
}
```

### Error Responses

**400 Bad Request** - Missing required fields
```json
{
  "error": "Missing required fields: date, subject, htmlContent, stocks"
}
```

**409 Conflict** - Brief already exists
```json
{
  "error": "Brief for 2025-10-27 already exists"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to store brief. Please try again."
}
```

---

## Testing

### Test with Sample Data

Use this curl command to test the webhook:

```bash
curl -X POST https://dailyticker.co/api/archive/store \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-27",
    "subject": "📈 Test Brief",
    "htmlContent": "<div><h1>Test Brief</h1><p>This is a test.</p></div>",
    "tldr": "Testing the archive webhook integration.",
    "actionableCount": 1,
    "stocks": [
      {
        "ticker": "TEST",
        "sector": "Tech",
        "confidence": 75,
        "riskLevel": "Medium",
        "action": "WATCH",
        "entryPrice": 100.00,
        "summary": "Test stock for webhook validation.",
        "whyMatters": "Testing integration.",
        "momentumCheck": "Testing →",
        "actionableInsight": "This is a test recommendation."
      }
    ]
  }'
```

### Verify in Archive

After sending a test webhook:
1. Visit https://dailyticker.co/archive
2. Look for your test brief in the list
3. Click to view the full brief page
4. Verify all stock data displays correctly

---

## Troubleshooting

### Common Issues

**Issue:** "Brief already exists" error
- **Solution:** Change the `date` field or delete the existing brief

**Issue:** "Invalid date format" error
- **Solution:** Ensure date is in `YYYY-MM-DD` format (e.g., `2025-10-27`, not `10/27/2025`)

**Issue:** Stocks not displaying
- **Solution:** Verify `stocks` is an array with at least one stock object

**Issue:** Missing required fields
- **Solution:** Check that all required stock fields are present (ticker, sector, confidence, etc.)

### Debug Logs

Check Vercel logs for webhook processing:
1. Go to Vercel dashboard
2. Navigate to your project
3. Click "Logs" tab
4. Filter by `/api/archive/store`
5. Look for error messages or validation failures

---

## Production Checklist

Before going live:

- [ ] Test webhook with sample data
- [ ] Verify brief appears in archive list
- [ ] Verify individual brief page renders correctly
- [ ] Test search by ticker functionality
- [ ] Confirm all stock fields display properly
- [ ] Check mobile responsiveness
- [ ] Verify SEO meta tags on brief pages
- [ ] Test social sharing links

---

## Support

For issues or questions:
- Email: brief@dailyticker.co
- Check Vercel logs for error details
- Review API response codes and error messages
