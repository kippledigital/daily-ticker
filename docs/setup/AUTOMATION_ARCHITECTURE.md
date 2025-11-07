# Daily Ticker Automation Architecture

Technical overview of the in-house automation system.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Vercel Cron (M-F 8 AM EST)                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  /api/cron/daily-brief/route.ts                 │
│                    (Orchestrator Entry Point)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                lib/automation/orchestrator.ts                   │
│                    (Main Workflow Logic)                        │
└─────────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │Step 1        │ │Step 2        │ │Step 3        │
    │Stock         │ │Historical    │ │News          │
    │Discovery     │ │Data Fetch    │ │Gathering     │
    └──────────────┘ └──────────────┘ └──────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │Step 4        │ │Step 5        │ │Step 6        │
    │AI Analysis   │ │Validation    │ │Trend         │
    │(GPT-4)       │ │Check         │ │Injection     │
    └──────────────┘ └──────────────┘ └──────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │Step 7        │ │Step 8        │ │Step 9        │
    │Email         │ │Send Email    │ │Post to       │
    │Generation    │ │(Resend)      │ │Twitter       │
    └──────────────┘ └──────────────┘ └──────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │Step 10       │
                    │Archive       │
                    │(Supabase)    │
                    └──────────────┘
```

---

## Module Breakdown

### 1. Stock Discovery
**File:** `lib/automation/stock-discovery.ts`

**Purpose:** Find 3 trending stocks from focus sectors

**Inputs:**
- Focus sectors (Technology, Healthcare, Energy, Finance)
- Stock universe (predefined list of liquid stocks)
- Recent analysis history (to avoid repeats)

**Process:**
1. Get all tickers from focus sectors
2. Remove recently analyzed stocks (last 7 days)
3. Fetch real-time quotes from Polygon.io
4. Score stocks by momentum + volume
5. Select top 3

**Outputs:**
```typescript
['AAPL', 'NVDA', 'MSFT']
```

**Gumloop equivalent:** Enhanced Stock Discovery node

---

### 2. Historical Data Fetch
**File:** `lib/automation/historical-data.ts`

**Purpose:** Get last 30 days of stock analysis to avoid repetition

**Inputs:**
- None (queries Supabase)

**Process:**
1. Query `briefs` table for last 30 days
2. Extract all analyzed tickers with summaries
3. Format as readable text for AI context

**Outputs:**
```
Date: 2025-10-26
- AAPL (Technology): HOLD | Confidence: 85% | Apple holds steady...
- NVDA (Technology): WATCH | Confidence: 72% | Pullback after rally...

Date: 2025-10-25
...
```

**Gumloop equivalent:** Get Historical Data (Last 30 Days) node

---

### 3. News Gathering
**File:** `lib/automation/news-gatherer.ts`

**Purpose:** Gather comprehensive financial data for each ticker

**Inputs:**
- Ticker symbol (e.g., "AAPL")

**Process:**
1. Build search query: "Comprehensive financial analysis for {ticker}..."
2. Use OpenAI GPT-4 to research (simulates Perplexity web search)
3. Extract: price, market cap, P/E, earnings, news, ratings, etc.

**Outputs:**
```
Apple Inc (AAPL) - Current Analysis:
Price: $178.45
Market Cap: $2.8T
P/E Ratio: 29.5
Recent Earnings: Beat by 8%...
Latest News: iPhone 15 Pro exceeds expectations in China...
Analyst Ratings: 15 Buy, 3 Hold, 0 Sell
```

**Gumloop equivalent:** Gather Financial Data & News (Perplexity) node

---

### 4. AI Stock Analysis
**File:** `lib/automation/ai-analyzer.ts`

**Purpose:** Analyze each stock using AI with exact Gumloop prompt

**Inputs:**
- Ticker symbol
- Financial data from news gatherer
- Historical watchlist data

**Process:**
1. Build prompt with exact Gumloop format
2. Call OpenAI GPT-4 with JSON mode
3. Extract structured stock analysis

**Outputs:**
```json
{
  "ticker": "AAPL",
  "confidence": 85,
  "risk_level": "Low",
  "last_price": 178.45,
  "avg_volume": 50000000,
  "sector": "Technology",
  "summary": "Apple holds steady as iPhone demand remains strong...",
  "why_matters": "China sales exceeded expectations by 12%...",
  "momentum_check": "Sideways →",
  "actionable_insight": "Wait for dip to $175 before adding to position",
  "suggested_allocation": "5-10%",
  "why_trust": "Strong fundamentals, proven track record...",
  "caution_notes": "Watch for potential earnings miss in Q4...",
  "ideal_entry_zone": "$175-$180",
  "mini_learning_moment": "P/E ratios help compare valuations..."
}
```

**Gumloop equivalent:** Ask AI node

---

### 5. Validation Check
**File:** `lib/automation/validator.ts`

**Purpose:** Ensure AI output has all required fields with valid data

**Inputs:**
- Raw AI response (JSON)

**Process:**
1. Parse JSON (handle arrays/wrappers)
2. Check all 15 required fields exist
3. Validate field types (number, string, enum)
4. Reject if any field is UNKNOWN/N/A/null
5. Return validated stock or null

**Outputs:**
- Valid stock object (same structure as input)
- Or `null` if validation fails

**Gumloop equivalent:** Validation Check node

---

### 6. Trend Symbol Injection
**File:** `lib/automation/trend-injector.ts`

**Purpose:** Add momentum emoji (📈/📉/→) based on analysis

**Inputs:**
- Validated stock object

**Process:**
1. Analyze `momentum_check` field for keywords
2. Bullish keywords → 📈
3. Bearish keywords → 📉
4. Sideways/neutral → →
5. Add `trend_symbol` field to stock

**Outputs:**
```json
{
  ...stock fields,
  "trend_symbol": "📈"
}
```

**Gumloop equivalent:** Trend Symbol Injector node

---

### 7. Email Generation
**File:** `lib/automation/email-generator.ts`

**Purpose:** Generate beginner-friendly HTML email with "Scout" persona

**Inputs:**
- Array of validated stocks with trend symbols
- Date

**Process:**
1. Format stock data for AI prompt
2. Call OpenAI with "Scout" system prompt (exact Gumloop prompt)
3. Generate HTML email content
4. Generate subject line (exact Gumloop prompt)
5. Generate TL;DR summary

**Outputs:**
```json
{
  "subject": "☀️ Apple Holds Steady | Energy Cools Off",
  "htmlContent": "<div>...full HTML email...</div>",
  "tldr": "Market opened mixed with tech holding steady..."
}
```

**Gumloop equivalent:** Email generation node + Subject line generator

---

### 8. Email Sending
**File:** `lib/automation/email-sender.ts`

**Purpose:** Send email to all subscribers via Resend

**Inputs:**
- Subject line
- HTML content
- Optional: recipient list override

**Process:**
1. Fetch subscriber emails from Beehiiv API
2. Format email with Resend API
3. Send to all subscribers
4. Track delivery via Resend dashboard

**Outputs:**
- Boolean: success/failure
- Resend email ID for tracking

**Gumloop equivalent:** Gmail Sender node

---

### 9. Twitter Posting
**File:** `lib/automation/twitter-poster.ts`

**Purpose:** Post daily watchlist to Twitter

**Inputs:**
- Array of stocks with trend symbols
- Date

**Process:**
1. Format tweet using "Daily 3" format
2. Show: ticker, action, confidence, brief summary
3. Withhold: entry prices, full analysis
4. Include link to dailyticker.co
5. Post via Twitter API v2

**Outputs:**
```
📊 Daily 3 (Oct 27)

📈 AAPL • HOLD • 85/100
Strong enterprise demand signals

👀 NVDA • WATCH • 72/100
Pullback after recent rally

🔥 TSLA • BUY • 78/100
Production ramp beats targets

Full analysis + entry zones: dailyticker.co
```

**Gumloop equivalent:** (New feature - not in Gumloop)

---

### 10. Archive Storage
**File:** `lib/automation/orchestrator.ts` (storeInArchive function)

**Purpose:** Store brief in Supabase for archive page

**Inputs:**
- Date, subject, HTML content, TL;DR, stocks array

**Process:**
1. Format stocks for archive API schema
2. Call `/api/archive/store` endpoint
3. Supabase stores in `briefs` and `stocks` tables

**Outputs:**
- Boolean: success/failure
- Brief visible at https://dailyticker.co/archive/[date]

**Gumloop equivalent:** Save Stock Brief to Database node

---

## Data Flow

### Input Sources

1. **Polygon.io API** → Stock prices, volume, tickers
2. **Supabase Database** → Historical analysis (last 30 days)
3. **OpenAI GPT-4** → Financial research, stock analysis, content generation
4. **Beehiiv API** → Subscriber email list

### Output Destinations

1. **Resend** → Email delivery to subscribers
2. **Twitter API** → Daily watchlist posts
3. **Supabase Database** → Archive storage

---

## Error Handling

### Graceful Degradation

If a step fails, the automation continues with remaining steps:

```typescript
result.steps = {
  stockDiscovery: true,     // ✅
  aiAnalysis: true,         // ✅
  emailGeneration: true,    // ✅
  emailSending: false,      // ❌ Failed but continue
  twitterPosting: true,     // ✅ Still runs
  archiveStorage: true,     // ✅ Still runs
};
```

### Retry Logic

Critical failures (stock discovery, AI analysis) halt the automation:

```typescript
if (tickers.length === 0) {
  throw new Error('No tickers discovered');
}

if (validatedStocks.length === 0) {
  throw new Error('No valid analyses');
}
```

### Monitoring

All steps logged to console:

```
🚀 Starting daily automation...
📊 Step 1: Discovering trending stocks...
✅ Discovered: AAPL, NVDA, MSFT
📜 Step 2: Fetching historical data...
✅ Historical data retrieved
...
🎉 Daily automation completed successfully!
```

View in Vercel logs:

```bash
vercel logs --since 2h | grep "daily-brief"
```

---

## API Dependencies

### Required APIs

| API | Purpose | Rate Limit | Cost |
|-----|---------|------------|------|
| OpenAI | AI analysis | 10k TPM | ~$1-2/day |
| Polygon.io | Stock data | 5 req/min (free) | Free |
| Resend | Email sending | 100 req/sec | Free (< 3k emails) |
| Twitter v2 | Tweet posting | 50 tweets/day | Free |
| Supabase | Database | Unlimited | Free tier |
| Beehiiv | Subscribers | 60 req/min | Free |

### Fallback Strategies

**OpenAI fails:**
- Use cached analysis from previous day
- Or skip automation and alert admin

**Resend fails:**
- Store email in database for manual send
- Alert admin via SMS/Slack

**Twitter fails:**
- Log failure but continue
- Can manually post later

**Polygon.io fails:**
- Use fallback ticker list (AAPL, MSFT, GOOGL)
- Or use yesterday's picks

---

## Performance

### Execution Time

| Step | Duration | Parallelizable |
|------|----------|----------------|
| Stock Discovery | 5-10s | No |
| Historical Data | 1-2s | No |
| News Gathering | 10-15s | Yes (3 stocks) |
| AI Analysis | 15-20s | Yes (3 stocks) |
| Validation | <1s | Yes |
| Trend Injection | <1s | Yes |
| Email Generation | 10-15s | No |
| Email Sending | 2-5s | No |
| Twitter Posting | 1-2s | No |
| Archive Storage | 1-2s | No |

**Total:** ~60-90 seconds (under 2 minutes)

### Optimization

Parallel processing for independent tasks:

```typescript
// Parallel news gathering
const promises = tickers.map(ticker => gatherFinancialData(ticker));
const results = await Promise.all(promises);

// Parallel AI analysis
const analyses = await Promise.all(
  tickers.map(ticker => analyzeStock({ ticker, ... }))
);
```

---

## Security

### Authentication

**Cron endpoint:**
```typescript
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return 401 Unauthorized;
}
```

**Manual trigger:**
```typescript
if (process.env.NODE_ENV === 'production') {
  if (key !== process.env.MANUAL_TRIGGER_KEY) {
    return 401 Unauthorized;
  }
}
```

### Secrets Management

All secrets stored in Vercel environment variables:
- Never committed to git
- Encrypted at rest
- Only accessible in serverless functions

### Rate Limiting

Vercel automatically limits:
- 100 requests/10 seconds per IP (edge functions)
- 5 minutes max execution time

---

## Comparison: In-House vs Gumloop

| Feature | Gumloop | In-House |
|---------|---------|----------|
| **Setup Time** | 10 min | 30 min |
| **Monthly Cost** | $30-50 | $30-40 |
| **Control** | Limited | Full |
| **Customization** | GUI only | Code-level |
| **Debugging** | Limited logs | Full stack traces |
| **Dependencies** | Gumloop platform | Self-hosted |
| **Reliability** | Gumloop SLA | Vercel 99.99% |
| **Scalability** | Platform limits | Fully scalable |
| **Maintenance** | Zero | Minimal |

---

## Future Enhancements

### Potential Additions

1. **Investment Decision Filter** - Add the Gumloop prompt for BUY/WATCH/HOLD/AVOID classification
2. **Sentiment Analysis** - Analyze news sentiment for stocks
3. **Performance Tracking** - Track stock recommendations vs. actual performance
4. **A/B Testing** - Test different email formats, subject lines
5. **SMS Notifications** - Send alerts for high-confidence picks
6. **Slack Integration** - Post daily brief to Slack channel
7. **Advanced Discovery** - Use AI to find stocks from news, not just predefined list
8. **Multi-language** - Generate briefs in Spanish, French, etc.

### Code Structure for Extensions

```
lib/automation/
├── orchestrator.ts           # Main workflow
├── discovery/
│   ├── stock-discovery.ts    # Current
│   ├── news-discovery.ts     # NEW: AI-powered stock finder
│   └── sentiment-discovery.ts # NEW: Sentiment-based selection
├── analysis/
│   ├── ai-analyzer.ts        # Current
│   ├── decision-filter.ts    # NEW: Investment decision classifier
│   └── performance-tracker.ts # NEW: Track pick accuracy
├── distribution/
│   ├── email-sender.ts       # Current
│   ├── twitter-poster.ts     # Current
│   ├── sms-sender.ts         # NEW: Twilio integration
│   └── slack-poster.ts       # NEW: Slack webhooks
└── ...
```

---

## Maintenance

### Weekly

- Review Vercel logs for errors
- Check OpenAI usage/costs
- Monitor email deliverability (Resend dashboard)

### Monthly

- Review and tune stock discovery criteria
- Optimize AI prompts based on feedback
- Check API rate limits and costs
- Update dependencies

### Quarterly

- Evaluate new AI models (GPT-5, etc.)
- Consider new data sources
- Review and update documentation

---

## Contact & Support

- **Code:** `/lib/automation/`
- **Docs:** `/docs/AUTOMATION_*.md`
- **Logs:** `vercel logs`
- **Issues:** GitHub Issues

