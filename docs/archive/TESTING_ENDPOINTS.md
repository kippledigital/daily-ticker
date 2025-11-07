# Testing Endpoints Documentation

Complete guide to testing the Daily Ticker automation system with real API data.

## Overview

Three testing endpoints to validate data quality, AI validation layer, and the full automation pipeline.

## 1. Data Quality Test

**Endpoint:** `GET /api/test/data-quality?ticker=AAPL`

**Purpose:** Validate aggregated data from all sources (Polygon, Alpha Vantage, Finnhub)

**What it tests:**
- Price verification across multiple sources
- Fundamental data completeness (P/E ratio, EPS, market cap, etc.)
- News availability and sentiment analysis
- Social sentiment (Reddit + Twitter)
- Insider trading activity
- Analyst recommendations
- Data quality scoring (0-100)

**Example usage:**
```bash
# Test Apple stock data quality
curl http://localhost:3000/api/test/data-quality?ticker=AAPL

# Test NVIDIA
curl http://localhost:3000/api/test/data-quality?ticker=NVDA

# Test Tesla
curl http://localhost:3000/api/test/data-quality?ticker=TSLA
```

**Response structure:**
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "timestamp": "2025-10-28T12:00:00.000Z",

  "priceValidation": {
    "currentPrice": 178.45,
    "priceSource": "Alpha Vantage",
    "priceVerified": true,
    "change": 2.15,
    "changePercent": 1.22,
    "volume": 52345678,
    "dayRange": "$176.50 - $179.20",
    "fiftyTwoWeekRange": "$124.17 - $199.62"
  },

  "fundamentals": {
    "marketCap": "$2750.35B",
    "peRatio": "28.45",
    "eps": "6.27",
    "revenue": "$385.71B",
    "profitMargin": "25.31%",
    "dividendYield": "0.52%",
    "beta": "1.28",
    "sector": "Technology",
    "industry": "Consumer Electronics"
  },

  "news": {
    "totalArticles": 10,
    "overallSentiment": "bullish",
    "recentHeadlines": [...]
  },

  "socialSentiment": {
    "score": "0.42",
    "trend": "rising",
    "totalMentions": 1234,
    "summary": "Highly bullish (1234 mentions, +42% sentiment)"
  },

  "insiderActivity": {
    "recentBuys": 3,
    "recentSells": 8,
    "netActivity": "selling"
  },

  "analystRatings": {
    "strongBuy": 12,
    "buy": 18,
    "hold": 8,
    "sell": 2,
    "strongSell": 0,
    "consensus": "buy"
  },

  "dataQuality": {
    "overallScore": 90,
    "scoreBreakdown": {
      "priceVerified": "✅ 30/30",
      "fundamentalsComplete": "✅ 30/30",
      "newsAvailable": "✅ 20/20",
      "socialDataAvailable": "✅ 20/20"
    },
    "warnings": [],
    "status": "✅ EXCELLENT"
  },

  "investmentReady": {
    "priceAccurate": true,
    "hasFundamentals": true,
    "hasRecentNews": true,
    "qualityScore": 90,
    "readyToAnalyze": true,
    "recommendation": "Safe to include in daily brief"
  }
}
```

**Quality Score Interpretation:**
- **80-100:** ✅ EXCELLENT - Safe to use
- **70-79:** ⚠️ GOOD - Use with confidence
- **50-69:** ⚠️ FAIR - Use with caution
- **0-49:** ❌ POOR - Do not use

---

## 2. AI Validation Test

**Endpoint:** `GET /api/test/validation?ticker=AAPL`

**Purpose:** Test the AI validation layer that prevents hallucinations

**What it tests:**
- Price accuracy (AI vs real verified price)
- Confidence adjustment based on data quality
- Risk level adjustment for micro-cap stocks
- Social sentiment integration
- Analyst recommendations integration
- Insider trading warnings
- Sector validation

**Example usage:**
```bash
# Test AI validation for Apple
curl http://localhost:3000/api/test/validation?ticker=AAPL

# Test with a stock that might have low data quality
curl http://localhost:3000/api/test/validation?ticker=GME
```

**Response structure:**
```json
{
  "ticker": "AAPL",
  "timestamp": "2025-10-28T12:00:00.000Z",

  "realData": {
    "price": 178.45,
    "priceVerified": true,
    "volume": 52345678,
    "sector": "Technology",
    "peRatio": 28.45,
    "marketCap": 2750350000000,
    "dataQualityScore": 90,
    "warnings": []
  },

  "aiWithoutValidation": {
    "price": 179.22,
    "volume": 50000000,
    "sector": "Technology",
    "confidence": 85,
    "riskLevel": "Medium"
  },

  "aiWithValidation": {
    "price": 178.45,
    "volume": 52345678,
    "sector": "Technology",
    "confidence": 85,
    "riskLevel": "Medium",
    "whyTrust": "Strong fundamentals with P/E of 28.45. Highly bullish social sentiment on Reddit/Twitter (1234 mentions). Analyst consensus: buy.",
    "cautionNotes": "Watch Q4 guidance."
  },

  "validationImpact": {
    "priceAdjusted": true,
    "priceDifference": "$-0.77",
    "confidenceAdjusted": false,
    "confidenceDifference": 0,
    "riskLevelAdjusted": false,
    "socialSentimentAdded": true,
    "analystRatingsAdded": true,
    "insiderWarningAdded": false
  },

  "qualityAssessment": {
    "dataQualityScore": 90,
    "finalConfidence": 85,
    "confidenceAdjustedForQuality": true,
    "priceMatchesRealData": true,
    "validationWorking": "✅ PASS - Price matches real data"
  },

  "recommendation": "✅ SAFE TO USE - High quality data + confident analysis"
}
```

**Validation Checks:**
1. **Price Validation:** Replaces AI price with verified price if discrepancy > 2%
2. **Volume Validation:** Uses real volume if AI estimate is > 50% off
3. **Sector Validation:** Enforces valid sector types
4. **Confidence Adjustment:** Caps confidence at 75 if data quality < 70
5. **Price Verification Penalty:** Reduces confidence by 10 if price not verified
6. **P/E Ratio Check:** Flags unusual P/E ratios (<0.1 or >500)
7. **Market Cap Risk:** Upgrades risk level for micro-cap stocks (<$100M)
8. **Social Sentiment:** Adds to `why_trust` if >100 mentions
9. **Analyst Ratings:** Adds consensus to `why_trust`
10. **Insider Trading:** Adds warning if selling > 2x buying

---

## 3. Full Pipeline Test

**Endpoint:** `GET /api/test/full-pipeline?tickers=AAPL,NVDA,MSFT`
**Alternative:** `GET /api/test/full-pipeline` (auto-discovers 3 tickers)

**Purpose:** Test the complete automation pipeline from discovery to validated analysis

**What it tests:**
- Stock discovery (if no tickers provided)
- Financial data gathering
- Data aggregation and validation
- AI analysis with validation layer
- JSON validation
- Trend symbol injection
- End-to-end processing time
- Success/failure rates

**Example usage:**
```bash
# Test with specific tickers
curl "http://localhost:3000/api/test/full-pipeline?tickers=AAPL,NVDA,MSFT"

# Test with auto-discovery
curl http://localhost:3000/api/test/full-pipeline

# Test with single ticker
curl "http://localhost:3000/api/test/full-pipeline?tickers=TSLA"
```

**Response structure:**
```json
{
  "timestamp": "2025-10-28T12:00:00.000Z",
  "totalProcessingTime": "12.45s",
  "tickersProcessed": 3,
  "successful": 3,
  "failed": 0,

  "results": [
    {
      "ticker": "AAPL",
      "status": "SUCCESS",
      "processingTime": "4.12s",

      "dataQuality": {
        "score": 90,
        "priceVerified": true,
        "warnings": []
      },

      "analysis": {
        "price": 178.45,
        "confidence": 85,
        "riskLevel": "Medium",
        "sector": "Technology",
        "summary": "Apple holds steady with strong iPhone demand and services growth.",
        "momentumCheck": "Sideways → (consolidating after recent gains)",
        "actionableInsight": "Hold steady - wait for dip to $175 before adding"
      },

      "validation": {
        "priceMatchesReal": true,
        "confidenceAdjustedForQuality": true,
        "hasSocialSentiment": true,
        "hasAnalystRatings": true,
        "hasInsiderWarnings": false
      },

      "recommendation": "✅ SAFE TO USE"
    },
    // ... more tickers
  ],

  "summary": {
    "averageDataQuality": 88.33,
    "averageConfidence": 82.67,
    "priceVerificationRate": "100%",
    "socialSentimentCoverage": "100%",
    "analystCoverage": "100%"
  },

  "pipelineStatus": "✅ ALL PASSED"
}
```

**Pipeline Status:**
- **✅ ALL PASSED:** All tickers successfully processed
- **⚠️ PARTIAL SUCCESS:** Some tickers failed
- **❌ ALL FAILED:** All tickers failed

---

## Testing Workflow

### Step 1: Test Data Quality
Start by testing individual stocks to ensure data is being fetched correctly:

```bash
curl http://localhost:3000/api/test/data-quality?ticker=AAPL
```

**Look for:**
- `dataQuality.overallScore` >= 70
- `priceValidation.priceVerified` = true
- No critical warnings

### Step 2: Test AI Validation
Verify the validation layer is working:

```bash
curl http://localhost:3000/api/test/validation?ticker=AAPL
```

**Look for:**
- `validationImpact.priceAdjusted` = true (if AI was wrong)
- `qualityAssessment.validationWorking` = "✅ PASS"
- `validationImpact.socialSentimentAdded` = true
- `validationImpact.analystRatingsAdded` = true

### Step 3: Test Full Pipeline
Run the complete automation:

```bash
curl http://localhost:3000/api/test/full-pipeline?tickers=AAPL,NVDA,MSFT
```

**Look for:**
- `pipelineStatus` = "✅ ALL PASSED"
- `successful` = number of tickers
- `summary.priceVerificationRate` >= 80%
- `summary.averageDataQuality` >= 70

---

## Troubleshooting

### Issue: Low data quality scores
**Solution:**
1. Check API keys are valid (Alpha Vantage, Finnhub, Polygon)
2. Verify you haven't hit API rate limits
3. Try a different ticker (some stocks have limited data)

### Issue: Price not verified
**Solution:**
1. Check that both Alpha Vantage and Polygon APIs are working
2. Verify ticker symbol is correct
3. Markets may be closed (prices update during trading hours)

### Issue: No social sentiment
**Solution:**
1. Normal for small-cap stocks (<$1B market cap)
2. Check Finnhub API key is valid
3. Some stocks have low social media activity

### Issue: High processing time (>10s per ticker)
**Solution:**
1. Normal for first request (cold start)
2. Check network latency to APIs
3. Consider parallel processing (already implemented in orchestrator)

---

## Production Deployment

Before deploying to production:

1. ✅ Test all three endpoints with real API keys
2. ✅ Verify `dataQuality.overallScore` >= 70 for most stocks
3. ✅ Confirm `priceVerificationRate` >= 80%
4. ✅ Check `socialSentimentCoverage` >= 60%
5. ✅ Ensure `totalProcessingTime` < 15s for 3 tickers

**Example test script:**
```bash
#!/bin/bash

echo "Testing Daily Ticker Automation..."

# Test 1: Data Quality
echo "\n1. Testing data quality for AAPL..."
curl -s "http://localhost:3000/api/test/data-quality?ticker=AAPL" | jq '.dataQuality.status'

# Test 2: AI Validation
echo "\n2. Testing AI validation for NVDA..."
curl -s "http://localhost:3000/api/test/validation?ticker=NVDA" | jq '.qualityAssessment.validationWorking'

# Test 3: Full Pipeline
echo "\n3. Testing full pipeline..."
curl -s "http://localhost:3000/api/test/full-pipeline?tickers=AAPL,NVDA,MSFT" | jq '.pipelineStatus'

echo "\nDone!"
```

---

## Next Steps

After testing endpoints successfully:

1. **Collect real API keys** (user is doing this)
2. **Update `.env.local`** with production keys
3. **Run full pipeline test** with real keys
4. **Monitor logs** for validation warnings
5. **Deploy to Vercel** and test cron endpoint

See [AUTOMATION_SETUP.md](./AUTOMATION_SETUP.md) for deployment guide.
