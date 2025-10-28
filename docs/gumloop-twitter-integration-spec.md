---
title: "Gumloop Twitter Integration Specification"
date: 2025-10-27
version: 1.0
audience: "Automation/Technical Implementation"
---

# Gumloop Twitter Integration Specification

This document provides technical specifications for modifying your Gumloop workflow to output Twitter-optimized content.

---

## Current State Analysis

### What You Have Now
Based on your codebase, your current Gumloop output structure includes:
```typescript
{
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  summary: string;
  context: string;
  riskLevel: 'low' | 'medium' | 'high';
  actionableTakeaway: string;
}
```

### What's Missing for Twitter
- No Twitter-optimized summary (current `summary` is likely too long/detailed)
- No action classification (BUY/WATCH/HOLD)
- No confidence score
- No emoji indicators
- No pre-formatted tweet output

---

## Required Changes

### 1. Extend Data Model

Add these fields to your Gumloop output:

```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "sector": "Technology",
  "currentPrice": 178.45,
  "change": 2.34,
  "changePercent": 1.33,

  // EXISTING FIELDS
  "summary": "Apple rises on strong iPhone demand in Asia. China sales exceeded expectations...",
  "context": "Detailed context for email subscribers...",
  "riskLevel": "low",
  "actionableTakeaway": "Watch for earnings call commentary on Q4 guidance.",

  // NEW FIELDS FOR TWITTER
  "action": "BUY",                    // BUY | WATCH | HOLD
  "confidence": 85,                   // Integer 1-100
  "twitterSummary": "Strong enterprise demand signals",  // 5-7 words
  "twitterEmoji": "📈",               // Single emoji for sentiment
  "entryPrice": 178.50,               // For email only
  "entryZone": "177.20 - 179.80"      // For email only
}
```

---

## Implementation Guide

### Step 1: Add Action Classifier Node

**Node Name:** `Determine-Stock-Action`

**Input:** Stock analysis data (fundamentals, technicals, momentum)

**Logic:**
```
IF confidence >= 80 AND risk_level == "low" AND momentum_positive:
  action = "BUY"

ELSE IF confidence >= 70 AND risk_level <= "medium":
  action = "WATCH"

ELSE:
  action = "HOLD"
```

**Detailed Decision Tree:**

```
BUY Criteria (All must be true):
- Confidence score >= 80
- Risk level: Low or Medium
- Momentum: Positive trend confirmed
- Fundamentals: Strong or improving
- Technical: Above key support, no major resistance nearby

WATCH Criteria (One or more true):
- Confidence score 70-79
- Risk level: Medium
- Momentum: Mixed or consolidating
- Fundamentals: Solid but waiting for catalyst
- Technical: Near support/resistance, needs confirmation

HOLD Criteria:
- Confidence score < 70
- Risk level: High
- Momentum: Negative or unclear
- Fundamentals: Deteriorating or uncertain
- Technical: Below support or major resistance overhead
```

**Output:** `action` field (string: "BUY", "WATCH", or "HOLD")

---

### Step 2: Add Confidence Score Calculator Node

**Node Name:** `Calculate-Confidence-Score`

**Input:** All analytical factors

**Formula:**
```
Confidence =
  (Fundamental_Score × 0.40) +
  (Technical_Score × 0.30) +
  (Momentum_Score × 0.20) +
  (Market_Condition_Score × 0.10)

Round to integer (1-100)
```

**Component Breakdowns:**

**Fundamental Score (0-100):**
- Revenue growth trend: 25 points
- Earnings quality: 25 points
- Sector strength: 25 points
- Valuation reasonableness: 25 points

**Technical Score (0-100):**
- Price vs moving averages: 30 points
- Support/resistance positioning: 30 points
- Volume confirmation: 20 points
- Chart pattern quality: 20 points

**Momentum Score (0-100):**
- Short-term trend (5-day): 30 points
- Medium-term trend (20-day): 40 points
- Relative strength vs sector: 30 points

**Market Condition Score (0-100):**
- Overall market trend: 50 points
- Volatility environment: 30 points
- Sector rotation: 20 points

**Output:** `confidence` field (integer 1-100)

---

### Step 3: Add Twitter Summary Generator Node

**Node Name:** `Generate-Twitter-Summary`

**Node Type:** AI/LLM Node (GPT-4 or Claude)

**Prompt Template:**
```
You are creating Twitter-friendly summaries for Daily Ticker's stock analysis.

CONTEXT:
Daily Ticker posts stock picks on Twitter to drive email signups. We need to provide enough value to build authority while withholding detailed analysis to create curiosity.

INPUT DATA:
- Stock: {symbol} - {name}
- Sector: {sector}
- Action: {action}
- Confidence: {confidence}/100
- Full analysis: {summary}
- Context: {context}

YOUR TASK:
Generate a 5-7 word Twitter summary that:

1. **Captures the KEY catalyst or reason** for the rating
   - Focus on "why now" not "why generally good"
   - Example: "Enterprise sales accelerating" not "Strong company"

2. **Uses plain English** (no jargon)
   - BAD: "RSI showing overbought conditions"
   - GOOD: "Consolidating after strong rally"
   - BAD: "QoQ revenue growth of 12%"
   - GOOD: "Revenue growth accelerating"

3. **Is specific enough to show expertise**
   - BAD: "Good stock"
   - GOOD: "Cloud revenue beating expectations"

4. **Creates curiosity (not complete story)**
   - BAD: "Q4 earnings beat by 15%, raising guidance, buyback announced" (too much detail)
   - GOOD: "Strong earnings momentum building" (enough to intrigue)

5. **Matches the action type**
   - BUY summaries: Emphasize strength, momentum, opportunity
   - WATCH summaries: Emphasize caution, waiting, confirmation needed
   - HOLD summaries: Emphasize neutrality, patience, clarity needed

EMOJI SELECTION:
Also assign ONE emoji based on the action:
- BUY (bullish): 📈 or 🚀 or 💪
- WATCH (cautious): ⚠️ or 👀 or 📊
- HOLD (neutral): 📊 or 🔍 or ⏸️

GOOD EXAMPLES:

Input: BUY, High confidence, "Apple beat earnings on strong iPhone 15 Pro sales in Asia, particularly China where sales were up 12% QoQ..."
Output: {
  "twitterSummary": "Strong enterprise demand signals",
  "twitterEmoji": "📈"
}

Input: WATCH, Medium confidence, "NVIDIA pulled back 2% after a 40% rally. Technicals show RSI at 78 (overbought). Waiting for consolidation..."
Output: {
  "twitterSummary": "Consolidating after major rally",
  "twitterEmoji": "⚠️"
}

Input: HOLD, Lower confidence, "AMD fundamentals remain solid but technical setup unclear. Testing 50-day MA with mixed volume..."
Output: {
  "twitterSummary": "Waiting for clearer trend direction",
  "twitterEmoji": "📊"
}

BAD EXAMPLES (Don't do this):

❌ "Revenue beat expectations by 12%" - Too specific/detailed
❌ "Good buying opportunity" - Too vague
❌ "RSI showing overbought conditions" - Jargon
❌ "Testing 50-day moving average" - Technical jargon
❌ "Great company with solid fundamentals" - Generic
❌ "This is going to moon" - Unprofessional

OUTPUT FORMAT:
Return ONLY valid JSON:
{
  "twitterSummary": "[your 5-7 word summary]",
  "twitterEmoji": "[single emoji]"
}

Now generate the summary:
```

**Validation Rules:**
- Summary must be 3-10 words
- Summary cannot contain: %, $, numbers (except in context like "Q4")
- Summary cannot contain jargon: RSI, MACD, QoQ, YoY, MA, EPS
- Emoji must be exactly 1 character
- Must return valid JSON

**Output:** `twitterSummary` and `twitterEmoji` fields

---

### Step 4: Add Tweet Formatter Node

**Node Name:** `Format-Daily-Tweet`

**Input:** Array of 3 stocks with all fields populated

**Logic:**
```javascript
function formatDailyTweet(stocks, date) {
  const stockLines = stocks.map((stock, index) => {
    return `${index + 1}. $${stock.symbol} → ${stock.action}
   Confidence: ${stock.confidence}/100
   ${stock.twitterEmoji} ${stock.twitterSummary}`
  }).join('\n\n');

  const tweet = `Market Open 🔔 | ${date}

Today's watchlist:

${stockLines}

Full analysis + entry zones:
https://dailyticker.co/brief?utm_source=twitter&utm_medium=daily_pick&utm_campaign=${getCurrentMonth()}

Not financial advice | Educational only`;

  return tweet;
}

function getCurrentMonth() {
  const date = new Date();
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return `${months[date.getMonth()]}_${date.getFullYear()}`;
}
```

**Character Count Validation:**
- Total tweet must be < 280 characters
- If over, truncate summaries or use abbreviated format

**Alternative Format (if over 280 chars):**
```
Market Open 🔔

$AAPL → BUY (85) 📈 Strong demand
$NVDA → WATCH (72) ⚠️ Consolidating
$AMD → HOLD (68) 📊 Unclear trend

Full analysis: [link]
```

**Output:** `formattedTweet` (string)

---

### Step 5: Add Quality Control Node

**Node Name:** `Tweet-Quality-Check`

**Validation Checks:**

```javascript
function validateTweet(data) {
  const errors = [];

  // Check all required fields exist
  const requiredFields = ['symbol', 'action', 'confidence', 'twitterSummary', 'twitterEmoji'];
  data.stocks.forEach((stock, i) => {
    requiredFields.forEach(field => {
      if (!stock[field]) {
        errors.push(`Stock ${i+1}: Missing ${field}`);
      }
    });
  });

  // Check confidence in range
  data.stocks.forEach((stock, i) => {
    if (stock.confidence < 1 || stock.confidence > 100) {
      errors.push(`Stock ${i+1}: Confidence ${stock.confidence} out of range (1-100)`);
    }
  });

  // Check action is valid
  const validActions = ['BUY', 'WATCH', 'HOLD'];
  data.stocks.forEach((stock, i) => {
    if (!validActions.includes(stock.action)) {
      errors.push(`Stock ${i+1}: Invalid action ${stock.action}`);
    }
  });

  // Check summary length
  data.stocks.forEach((stock, i) => {
    const wordCount = stock.twitterSummary.split(' ').length;
    if (wordCount < 3 || wordCount > 10) {
      errors.push(`Stock ${i+1}: Summary word count ${wordCount} (should be 3-10)`);
    }
  });

  // Check tweet character count
  if (data.formattedTweet.length > 280) {
    errors.push(`Tweet too long: ${data.formattedTweet.length} chars (max 280)`);
  }

  // Check for jargon in summaries
  const jargonTerms = ['RSI', 'MACD', 'QoQ', 'YoY', 'MA', 'EPS', 'PE ratio', 'overbought', 'oversold'];
  data.stocks.forEach((stock, i) => {
    jargonTerms.forEach(term => {
      if (stock.twitterSummary.toLowerCase().includes(term.toLowerCase())) {
        errors.push(`Stock ${i+1}: Contains jargon: ${term}`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
```

**If Validation Fails:**
- Log errors to monitoring system
- Send alert to admin
- Do NOT post to Twitter
- Use fallback template

**Output:** Validation status + error log

---

## Complete Output Schema

### Final JSON Structure

```json
{
  "date": "2025-10-27",
  "generatedAt": "2025-10-27T06:00:00Z",
  "marketSummary": "Markets opened mixed today as investors digest earnings reports.",

  "stocks": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "sector": "Technology",
      "currentPrice": 178.45,
      "change": 2.34,
      "changePercent": 1.33,

      "action": "BUY",
      "confidence": 85,
      "riskLevel": "low",

      "twitterSummary": "Strong enterprise demand signals",
      "twitterEmoji": "📈",

      "summary": "[Full summary for email - 2-3 sentences]",
      "context": "[Detailed context for email - why it matters]",
      "actionableTakeaway": "[What to do - for email]",
      "momentumCheck": "[Technical analysis - for email]",

      "entryPrice": 178.50,
      "entryZone": "177.20 - 179.80",
      "allocationPercent": 5,
      "cautionNotes": "[Risk factors - for email]",
      "learningMoment": "[Educational insight - for email]"
    },
    {
      "symbol": "NVDA",
      "name": "NVIDIA Corporation",
      "sector": "Semiconductors",
      "currentPrice": 875.28,
      "change": -5.67,
      "changePercent": -0.64,

      "action": "WATCH",
      "confidence": 72,
      "riskLevel": "medium",

      "twitterSummary": "Consolidating after rally",
      "twitterEmoji": "⚠️",

      "summary": "[Full summary for email]",
      "context": "[Detailed context for email]",
      "actionableTakeaway": "[What to do - for email]",
      "momentumCheck": "[Technical analysis - for email]",

      "entryPrice": 875.00,
      "entryZone": "850.00 - 870.00",
      "allocationPercent": 3,
      "cautionNotes": "[Risk factors - for email]",
      "learningMoment": "[Educational insight - for email]"
    },
    {
      "symbol": "AMD",
      "name": "Advanced Micro Devices",
      "sector": "Semiconductors",
      "currentPrice": 142.30,
      "change": -0.85,
      "changePercent": -0.59,

      "action": "HOLD",
      "confidence": 68,
      "riskLevel": "medium",

      "twitterSummary": "Waiting for clearer trend",
      "twitterEmoji": "📊",

      "summary": "[Full summary for email]",
      "context": "[Detailed context for email]",
      "actionableTakeaway": "[What to do - for email]",
      "momentumCheck": "[Technical analysis - for email]",

      "entryPrice": 142.30,
      "entryZone": "140.00 - 145.00",
      "allocationPercent": 2,
      "cautionNotes": "[Risk factors - for email]",
      "learningMoment": "[Educational insight - for email]"
    }
  ],

  "twitter": {
    "formattedTweet": "[Complete formatted tweet ready to post]",
    "characterCount": 275,
    "trackingUrl": "https://dailyticker.co/brief?utm_source=twitter&utm_medium=daily_pick&utm_campaign=oct_2025",
    "scheduledPostTime": "2025-10-27T08:00:00-05:00"
  },

  "validation": {
    "passed": true,
    "errors": [],
    "warnings": []
  }
}
```

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ START: Daily Stock Analysis Workflow                        │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│ Node 1: Fetch Stock Data                                  │
│ - Get price data, fundamentals, news                      │
└───────────────┬───────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│ Node 2: Analyze Stocks                                    │
│ - Calculate scores                                        │
│ - Generate full analysis                                  │
└───────────────┬───────────────────────────────────────────┘
                │
                ├──────────────────────────────┐
                │                              │
                ▼                              ▼
┌───────────────────────────┐    ┌────────────────────────────┐
│ Node 3a: Determine Action │    │ Node 3b: Calculate         │
│ - BUY/WATCH/HOLD          │    │   Confidence Score         │
└───────────┬───────────────┘    └────────────┬───────────────┘
            │                                  │
            └──────────────┬───────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│ Node 4: Generate Twitter Summary (AI/LLM)                 │
│ - Create 5-7 word summary                                 │
│ - Assign emoji                                            │
└───────────────┬───────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│ Node 5: Format Tweet                                      │
│ - Use template                                            │
│ - Add UTM parameters                                      │
└───────────────┬───────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│ Node 6: Quality Check                                     │
│ - Validate all fields                                     │
│ - Check character count                                   │
│ - Verify no jargon                                        │
└───────────────┬───────────────────────────────────────────┘
                │
                ├─────────────────────┐
                │                     │
          [PASS]│                     │[FAIL]
                │                     │
                ▼                     ▼
┌───────────────────────┐   ┌────────────────────────┐
│ Node 7a: Output       │   │ Node 7b: Alert Admin   │
│ - Save to database    │   │ - Log errors           │
│ - Send to email       │   │ - Use fallback         │
│ - Post to Twitter     │   └────────────────────────┘
└───────────────────────┘
```

---

## Testing Checklist

Before going live, test:

### Unit Tests
- [ ] Action classifier returns valid actions for various inputs
- [ ] Confidence calculator produces scores 1-100
- [ ] Twitter summary generator stays under word limit
- [ ] Tweet formatter produces valid tweets under 280 chars
- [ ] Quality check catches all validation errors

### Integration Tests
- [ ] Full workflow runs end-to-end without errors
- [ ] Output JSON matches schema exactly
- [ ] Twitter summaries are different for each stock (no repetition)
- [ ] Formatted tweet is readable and accurate
- [ ] UTM parameters are correctly formatted

### Edge Case Tests
- [ ] What if stock data is missing?
- [ ] What if AI summary generator fails?
- [ ] What if tweet is >280 characters?
- [ ] What if all 3 stocks get same action?
- [ ] What if confidence scores are very close?

### Manual Review Tests
- [ ] Do summaries make sense to non-experts?
- [ ] Do summaries avoid jargon?
- [ ] Do actions align with analysis?
- [ ] Does tweet format look good on mobile?
- [ ] Are emojis appropriate?

---

## Fallback Mechanisms

### If AI Summary Generator Fails

Use rule-based summary generation:

```javascript
function generateFallbackSummary(stock) {
  const templates = {
    BUY: {
      high_confidence: [
        "Strong momentum building",
        "Breaking through resistance",
        "Positive catalyst emerging"
      ],
      medium_confidence: [
        "Solid technical setup",
        "Fundamental strength showing",
        "Trending upward"
      ]
    },
    WATCH: {
      high_confidence: [
        "Consolidating recent gains",
        "Testing key support level",
        "Awaiting confirmation"
      ],
      medium_confidence: [
        "Mixed signals present",
        "Waiting for clarity",
        "Range-bound trading"
      ]
    },
    HOLD: {
      any: [
        "Unclear trend direction",
        "Waiting for better entry",
        "Neutral technical setup"
      ]
    }
  };

  // Select random template from appropriate category
  let category = stock.action;
  let subcategory = stock.confidence >= 80 ? 'high_confidence' : 'medium_confidence';

  if (stock.action === 'HOLD') {
    return templates.HOLD.any[Math.floor(Math.random() * templates.HOLD.any.length)];
  }

  return templates[category][subcategory][
    Math.floor(Math.random() * templates[category][subcategory].length)
  ];
}
```

### If Tweet Formatter Produces >280 Chars

Use abbreviated format:

```javascript
function formatAbbreviatedTweet(stocks, date) {
  const stockLines = stocks.map((stock, index) => {
    return `$${stock.symbol} → ${stock.action} (${stock.confidence})`
  }).join('\n');

  const tweet = `Market Open 🔔

${stockLines}

Analysis + entry zones:
[short URL]

Educational only`;

  return tweet;
}
```

---

## Monitoring & Alerts

### Set Up Alerts For:

**Critical (Page immediately):**
- Workflow fails to complete
- Quality check fails 2+ days in a row
- Tweet not posted by 8:15 AM EST

**Warning (Email alert):**
- Confidence scores all below 70
- Same emoji used for all 3 stocks
- Summary contains detected jargon

**Info (Log only):**
- Tweet >260 characters (near limit)
- Unusual sector distribution
- Stock repeats from previous day

### Daily Health Check

Every morning at 6:00 AM EST, run:

```javascript
function healthCheck(workflowOutput) {
  return {
    timestamp: new Date().toISOString(),
    checksRun: {
      allStocksHaveData: checkAllStocksHaveData(workflowOutput),
      actionsValid: checkActionsValid(workflowOutput),
      confidencesInRange: checkConfidencesInRange(workflowOutput),
      summariesGenerated: checkSummariesGenerated(workflowOutput),
      tweetUnder280: checkTweetLength(workflowOutput),
      noJargonDetected: checkForJargon(workflowOutput),
      utmParamsValid: checkUTMParams(workflowOutput)
    },
    overallHealth: 'PASS' | 'WARN' | 'FAIL'
  };
}
```

---

## Performance Optimization

### For Faster Workflow Execution:

1. **Parallelize where possible:**
   - Run action classifier and confidence calculator simultaneously
   - Generate all 3 Twitter summaries in parallel (if using API)

2. **Cache market data:**
   - Don't fetch same market data multiple times
   - Cache for 5 minutes

3. **Batch AI calls:**
   - If using AI for summaries, send all 3 stocks in one API call
   - Use structured output for faster parsing

4. **Pre-generate templates:**
   - Load tweet templates once at workflow start
   - Don't regenerate on every run

---

## Version Control

### Track Changes to:
- Node configurations
- Prompt templates (especially AI summary generator)
- Validation rules
- Fallback logic

### Before Modifying Production:
1. Test in staging environment
2. Generate 7 days of sample outputs
3. Manually review sample tweets
4. Get approval from content owner
5. Deploy during low-traffic time (weekend)

---

## API Integration (Phase 2)

### When Ready to Automate Posting:

**Twitter API v2 Setup:**

1. Apply for Elevated Access at developer.twitter.com
2. Create new app and get credentials
3. Store in environment variables:
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_SECRET`

**Add to Gumloop:**

```javascript
// Node: Post to Twitter
async function postToTwitter(formattedTweet) {
  const Twitter = require('twitter-api-v2').default;

  const client = new Twitter({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  try {
    const tweet = await client.v2.tweet(formattedTweet);

    return {
      success: true,
      tweetId: tweet.data.id,
      tweetUrl: `https://twitter.com/GetDailyTicker/status/${tweet.data.id}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

---

## Sample Implementation Timeline

### Week 1: Setup
- [ ] Day 1-2: Add action classifier node
- [ ] Day 3-4: Add confidence calculator node
- [ ] Day 5-7: Test and validate new fields

### Week 2: AI Integration
- [ ] Day 1-2: Set up AI summary generator node
- [ ] Day 3-4: Test prompt templates
- [ ] Day 5-7: Refine based on output quality

### Week 3: Formatting & QC
- [ ] Day 1-2: Build tweet formatter
- [ ] Day 3-4: Add quality checks
- [ ] Day 5-7: End-to-end testing

### Week 4: Production
- [ ] Day 1-2: Deploy to staging, generate 7 days of samples
- [ ] Day 3-4: Review and approve samples
- [ ] Day 5: Deploy to production
- [ ] Day 6-7: Monitor first real outputs

---

## Support & Questions

**If you get stuck:**

1. **Check sample output first** - Does it match the schema above?
2. **Review validation errors** - Quality check will tell you what's wrong
3. **Test individual nodes** - Isolate which node is failing
4. **Use fallback logic** - Better to post simple tweet than no tweet

**Common Issues:**

**Issue:** AI summary too long
**Fix:** Add explicit word count to prompt: "Use EXACTLY 5-7 words, no more"

**Issue:** Summaries too generic
**Fix:** Improve prompt with more specific examples of good vs bad

**Issue:** Tweet >280 characters
**Fix:** Use abbreviated format or shorten summaries to 4-5 words

**Issue:** Same emoji for all stocks
**Fix:** Add variety requirement to prompt: "Use different emojis for variety"

---

## Quick Start Command

To implement this quickly, prioritize:

1. Add `action` field (simple rule-based logic)
2. Add `confidence` field (weighted formula)
3. Add `twitterSummary` using templates (fallback approach)
4. Add `twitterEmoji` using simple rules:
   - BUY → 📈
   - WATCH → ⚠️
   - HOLD → 📊
5. Format tweet using template

Get this working FIRST, then enhance with AI later.

---

*For questions about this specification, contact the product team.*
