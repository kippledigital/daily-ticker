# Product Requirements Document: Performance Dashboard

**Document Version:** 1.0
**Product:** Daily Ticker Performance Dashboard
**Author:** Product Management
**Date:** November 3, 2025
**Status:** Draft - Ready for Review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [User Personas & Stories](#3-user-personas--stories)
4. [Feature Requirements](#4-feature-requirements)
5. [Data Model & Architecture](#5-data-model--architecture)
6. [UI/UX Specifications](#6-uiux-specifications)
7. [Success Metrics & KPIs](#7-success-metrics--kpis)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [Risk Assessment](#9-risk-assessment)
10. [Open Questions](#10-open-questions)

---

## 1. Executive Summary

### 1.1 Elevator Pitch
A transparent performance tracking system that shows users exactly how Daily Ticker's stock picks have performed, building trust through verifiable historical data and increasing conversion from free to premium tiers.

### 1.2 Problem Statement
**User Problem:** Potential subscribers are hesitant to trust Daily Ticker's stock recommendations because there's no way to verify historical performance. Users ask "Show me the results" but we have no answer.

**Business Problem:** This trust gap is the #1 conversion killer according to our design audit. Competitors like Motley Fool prominently display track records ("Up 200% since 2002"), creating an unfair competitive disadvantage.

**Root Cause:** We currently store historical briefs but don't track:
- How recommended stocks performed after publication
- Win rate percentages
- Average returns
- Performance vs. benchmarks (S&P 500)

### 1.3 Target Audience
**Primary:** Free tier users evaluating premium subscription (30-45 days after signup)
**Secondary:** New visitors on homepage seeking credibility signals
**Tertiary:** Premium subscribers validating ongoing subscription value

### 1.4 Unique Selling Proposition
Unlike competitors who show vague "overall returns," Daily Ticker will display:
- **Transparent methodology:** Exact entry/exit logic visible
- **Granular data:** Individual stock performance, not just portfolio-level
- **Real-time updates:** Performance recalculated daily with current prices
- **Honest reporting:** Include losses and failed picks, not just winners

### 1.5 Success Metrics
- **Conversion Lift:** 15-25% increase in free-to-premium conversion
- **Trust Score:** 60%+ of surveyed users say performance data influenced decision
- **Engagement:** 40%+ of homepage visitors view performance section
- **Retention:** 10%+ reduction in premium churn (validates value delivery)

---

## 2. Problem Statement

### 2.1 Current State Analysis

**What We Have:**
- Archive system storing all historical briefs in Supabase (`briefs` table)
- Stock recommendations with: ticker, entryPrice, action (BUY/HOLD/SELL), riskLevel, sector
- Email delivery system sending 1-3 picks daily at 8 AM EST
- Polygon.io API integration for real-time stock prices

**What We're Missing:**
- Outcome tracking (how stocks performed post-recommendation)
- Performance calculation logic (% gains, win rate, risk-adjusted returns)
- User-facing dashboard to display metrics
- Historical price data for closed positions
- Benchmark comparison (vs. S&P 500)

### 2.2 User Pain Points

**Skeptical Investor (Sarah, 34, Free User):**
> "I've been burned by newsletter scams before. I need proof these picks actually work before I pay $96/year."

**Pain Points:**
- Can't verify if past recommendations were profitable
- No way to compare Daily Ticker's accuracy vs. competitors
- Unclear if the "confidence scores" (premium feature) correlate with actual outcomes

**Ready-to-Buy Investor (Michael, 42, Free User, Day 28):**
> "I love the daily emails, but I need to justify the premium cost to my spouse. What's my ROI?"

**Pain Points:**
- No quantitative evidence to support premium upgrade decision
- Can't see historical win rate for different risk levels
- Unclear what "stop-loss levels" (premium feature) would have saved in real scenarios

**Premium Subscriber (Jessica, 51, Month 3):**
> "I'm up 8% this quarter, but is that good? How does that compare to your overall track record?"

**Pain Points:**
- Can't benchmark personal performance vs. Daily Ticker's average
- No visibility into whether premium features (entry zones, profit targets) add value
- Unclear if renewal is justified based on results

### 2.3 Competitive Landscape

**Motley Fool Stock Advisor:**
- Displays: "643% average return vs. S&P 500's 147% since 2002"
- Shows: Top 10 winning picks with % gains
- Lacks: Individual stock tracking, transparent exit criteria

**Seeking Alpha Premium:**
- Displays: Author-level track records with Quant Ratings
- Shows: Win/loss ratios per analyst
- Lacks: Portfolio-level aggregation, unified methodology

**The Information (Tech newsletter):**
- Displays: No performance tracking (editorial content only)
- Shows: Credibility through investigative journalism, not data
- Lacks: Actionable stock picks entirely

**Daily Ticker's Opportunity:**
- **Transparency:** Show every pick (winners + losers), not cherry-picked highlights
- **Granularity:** Track individual stocks, sectors, risk levels separately
- **Timeliness:** Real-time updates (competitors show stale annual data)
- **Methodology:** Clear entry/exit rules, not subjective "we sold here"

### 2.4 Business Impact (Why This Matters)

**Conversion Blocker:**
- Design audit identified "lack of track record" as #1 objection
- Support emails consistently ask "What's your historical accuracy?"
- 40% of free users cite "need to see results first" in churn surveys

**Revenue Opportunity:**
- 10,000 free subscribers × 20% conversion lift = 2,000 additional premium subscribers
- 2,000 × $96/year = **$192,000 additional ARR**
- At 70% gross margin = **$134,400 incremental profit**

**Competitive Necessity:**
- Every major financial newsletter shows performance data
- Absence signals either poor results or lack of transparency
- Required for "table stakes" credibility in fintech space

---

## 3. User Personas & Stories

### 3.1 Primary Personas

#### Persona 1: Skeptical Evaluator (Sarah)
**Demographics:**
- Age: 28-40
- Income: $75k-150k
- Investment experience: 2-5 years
- Portfolio size: $10k-50k

**Psychographics:**
- Risk-averse, burned by past financial "gurus"
- Researches extensively before purchasing
- Values transparency and data-driven decisions
- Active on Reddit (r/investing, r/stocks)

**Behavior Patterns:**
- Reads 5-10 free emails before considering upgrade
- Compares multiple newsletter providers
- Checks Trustpilot, Reddit reviews before subscribing
- Unlikely to convert without social proof

**Jobs to Be Done:**
- Validate Daily Ticker's claims before financial commitment
- Compare performance vs. self-managed portfolio
- Assess if premium features justify 10x price increase ($0 → $96)

**User Stories:**
```
As a skeptical evaluator,
I want to see Daily Ticker's verified track record,
So that I can trust the service before paying for premium.

Acceptance Criteria:
- View overall win rate (% of profitable picks)
- See performance by risk level (low/medium/high)
- Compare Daily Ticker returns vs. S&P 500 benchmark
- Filter by time period (30/60/90 days, all-time)
- Access methodology documentation (how metrics are calculated)
```

#### Persona 2: Ready-to-Buy Converter (Michael)
**Demographics:**
- Age: 35-50
- Income: $100k-250k
- Investment experience: 5-10 years
- Portfolio size: $50k-250k

**Psychographics:**
- Appreciates Daily Ticker's free content
- Time-constrained (busy professional)
- Willing to pay for quality but needs ROI justification
- Makes data-driven decisions

**Behavior Patterns:**
- Actively paper-trades 2-3 picks to validate quality
- Reads competitor pricing pages
- Calculates breakeven (needs $96+ value to justify premium)
- Converts in 30-45 days if value is proven

**Jobs to Be Done:**
- Quantify value of premium features (entry zones, stop-loss)
- Project potential returns if upgrading to premium
- Justify expense to spouse/accountability partner

**User Stories:**
```
As a ready-to-buy converter,
I want to see ROI data for premium features,
So that I can calculate if $96/year is worth the upgrade.

Acceptance Criteria:
- View performance difference: Free picks vs. Premium features
- Calculate projected savings from stop-loss protection
- See average gain improvement from entry zone optimization
- Export performance report for personal records
- One-click upgrade path from performance dashboard
```

#### Persona 3: Active Premium Subscriber (Jessica)
**Demographics:**
- Age: 40-65
- Income: $150k+
- Investment experience: 10+ years
- Portfolio size: $250k+

**Psychographics:**
- Sophisticated investor seeking edge
- Values time savings over cost
- Measures everything (tracks personal portfolio meticulously)
- High churn risk if value isn't demonstrable

**Behavior Patterns:**
- Logs into dashboard weekly to check performance
- Compares personal results vs. Daily Ticker's averages
- Evaluates renewal decision quarterly
- Vocal advocate if satisfied (refers friends)

**Jobs to Be Done:**
- Benchmark personal performance vs. service average
- Validate that premium features deliver promised value
- Assess renewal decision with concrete data

**User Stories:**
```
As an active premium subscriber,
I want to compare my portfolio performance vs. Daily Ticker's benchmarks,
So that I can validate my subscription is worth renewing.

Acceptance Criteria:
- View personal portfolio performance (if tracked)
- See average premium subscriber returns
- Filter by stocks I actually traded
- Download performance report for tax records
- Receive monthly performance summary emails
```

### 3.2 User Journey Map

#### Phase 1: Awareness (Day 0)
**Touchpoint:** Homepage visit via Google/Twitter/Reddit
**User Goal:** Understand what Daily Ticker offers
**Current Experience:** See value proposition, sample email, pricing
**Pain Point:** No trust signals, no performance data
**Proposed Solution:** Add "Track Record" section to homepage hero

#### Phase 2: Consideration (Day 1-14)
**Touchpoint:** Reading daily emails, browsing archive
**User Goal:** Evaluate content quality before subscribing
**Current Experience:** Good content, but no way to verify claims
**Pain Point:** "Are these picks actually profitable?"
**Proposed Solution:** Archive pages show historical performance badges

#### Phase 3: Evaluation (Day 15-30)
**Touchpoint:** Visiting /performance dashboard
**User Goal:** Deep-dive into track record data
**Current Experience:** (Does not exist)
**Pain Point:** Must manually backtest picks to verify accuracy
**Proposed Solution:** Comprehensive performance dashboard with filters

#### Phase 4: Conversion (Day 30-45)
**Touchpoint:** Pricing page, upgrade CTA
**User Goal:** Justify premium purchase
**Current Experience:** See features, no ROI data
**Pain Point:** "Is premium worth 10x the cost?"
**Proposed Solution:** ROI calculator using real performance data

#### Phase 5: Retention (Month 3+)
**Touchpoint:** Renewal decision, monthly check-ins
**User Goal:** Validate ongoing value
**Current Experience:** No performance comparison
**Pain Point:** "Am I getting my money's worth?"
**Proposed Solution:** Personalized performance reports (future phase)

---

## 4. Feature Requirements

### 4.1 MoSCoW Prioritization

**MUST HAVE (Phase 1 - MVP):**
- M1: Overall performance metrics (win rate, avg return, total picks)
- M2: Time-period filtering (30/60/90 days, all-time)
- M3: Individual stock performance list (ticker, entry, current, % gain)
- M4: Methodology documentation (how we calculate performance)
- M5: Mobile-responsive UI matching Daily Ticker brand

**SHOULD HAVE (Phase 2 - Enhanced):**
- S1: Performance by risk level (low/medium/high breakdown)
- S2: Sector performance analysis (tech, finance, energy, etc.)
- S3: S&P 500 benchmark comparison
- S4: Premium vs. Free feature value demonstration
- S5: Export performance data (CSV download)

**COULD HAVE (Phase 3 - Advanced):**
- C1: Interactive charts (performance over time, cumulative returns)
- C2: Personalized portfolio tracking (user's actual trades)
- C3: Email performance summaries (weekly/monthly digests)
- C4: Leaderboard (top-performing picks, worst performers)
- C5: Predictive analytics (confidence score correlation analysis)

**WON'T HAVE (Out of Scope):**
- W1: Real-time trading integration (Robinhood, E*TRADE APIs)
- W2: Social features (user comments, community picks)
- W3: Alternative asset classes (crypto, forex, commodities)
- W4: Backtesting tools (custom strategy simulation)

### 4.2 Functional Requirements

#### FR-1: Performance Calculation Engine

**Description:** Backend system to track stock performance from recommendation date to present/exit date.

**User Story:**
```
As a system,
I need to calculate performance for all historical stock picks,
So that users can see accurate, up-to-date results.
```

**Acceptance Criteria:**
1. **Entry Price Logic:**
   - Use `entry_price` field from `stocks` table as baseline
   - If `entry_zone_low` and `entry_zone_high` exist (premium), use midpoint
   - Record entry date as brief publication date (`briefs.date`)

2. **Current Price Fetching:**
   - Call Polygon.io API daily to get latest closing prices
   - Cache results for 24 hours to minimize API costs
   - Handle edge cases: stock splits, delisting, trading halts

3. **Exit Logic:**
   - **Auto-exit triggers:**
     - Stop-loss hit: Current price ≤ `stop_loss` value
     - Profit target hit: Current price ≥ `profit_target` value
     - 30-day hold: If no exit triggers, auto-exit after 30 calendar days
   - **Manual exits:** Admin can mark pick as "closed" with custom exit price
   - **Default behavior:** Still-open positions use current price for unrealized gains

4. **Return Calculation:**
   ```
   % Return = ((Exit Price - Entry Price) / Entry Price) * 100

   Realized Returns: Positions that hit stop-loss/profit target/30-day auto-exit
   Unrealized Returns: Positions still open, using current price
   ```

5. **Win Rate Formula:**
   ```
   Win Rate = (Number of Profitable Picks / Total Closed Picks) * 100

   Profitable Pick: % Return > 0
   Closed Pick: Hit stop-loss, profit target, or 30-day auto-exit
   ```

6. **Risk-Adjusted Returns (Future):**
   ```
   Sharpe Ratio = (Avg Return - Risk-Free Rate) / Standard Deviation of Returns
   ```

**Technical Constraints:**
- Polygon.io free tier: 5 API calls/minute (need request throttling)
- Supabase storage: Estimate 10KB per stock performance record
- Calculation frequency: Run daily at 9 PM EST (after market close)

**Edge Cases:**
- **Stock split:** Adjust `entry_price` retroactively (2-for-1 split = divide by 2)
- **Stock delisted:** Mark as closed, use last traded price as exit
- **IPO lockup expiration:** No special handling (treat as normal volatility)
- **Dividend payments:** Ignore for MVP (track price appreciation only)
- **After-hours trading:** Use official closing price, not extended hours

**Data Quality Requirements:**
- Historical price data must match entry dates (no forward-looking bias)
- All calculations must be reproducible (store calculation timestamp)
- Failed API calls must not corrupt existing performance data

**Performance SLA:**
- Calculation job completes in <5 minutes for 1,000 stocks
- API responds to dashboard requests in <500ms (cached data)

---

#### FR-2: Performance Dashboard UI

**Description:** User-facing page displaying aggregated and granular performance metrics.

**User Story:**
```
As a free user,
I want to view Daily Ticker's track record on a dedicated dashboard,
So that I can assess credibility before upgrading to premium.
```

**Acceptance Criteria:**

1. **Hero Metrics Section:**
   - Display 4 key stats prominently:
     ```
     ┌─────────────────────────────────────────────────────────┐
     │  Overall Performance (All-Time)                         │
     ├─────────────────┬─────────────────┬─────────────────────┤
     │   Win Rate      │  Avg. Return    │  Total Picks       │
     │   67.3%         │   +12.4%        │   143 stocks       │
     ├─────────────────┴─────────────────┴─────────────────────┤
     │   vs. S&P 500: +8.2% (outperformed by 4.2%)             │
     └─────────────────────────────────────────────────────────┘
     ```
   - Update daily (show "Last updated: Nov 3, 2025, 9:00 PM EST")
   - Visual indicators: Green for positive, red for negative, gray for neutral

2. **Time Period Filters:**
   - Tabs: `30 Days` | `60 Days` | `90 Days` | `All-Time`
   - Default: 90 Days
   - Recalculate all metrics when filter changes
   - Show sample size: "Based on 47 picks in this period"

3. **Performance Breakdown Table:**
   ```
   ┌──────────┬────────────┬─────────────┬──────────┬──────────┐
   │ Ticker   │ Entry Date │ Entry Price │ Current  │ Return   │
   ├──────────┼────────────┼─────────────┼──────────┼──────────┤
   │ NVDA     │ Oct 15     │ $875.28     │ $920.15  │ +5.1%   │
   │ AAPL     │ Oct 20     │ $178.45     │ $182.30  │ +2.2%   │
   │ TSLA     │ Oct 22     │ $242.84     │ $235.10  │ -3.2%   │
   └──────────┴────────────┴─────────────┴──────────┴──────────┘

   Columns: Ticker | Entry Date | Entry Price | Current/Exit Price | % Return | Status
   Status: 🟢 Open | 🔴 Stop-Loss Hit | 🎯 Profit Target Hit | ⏱️ 30-Day Exit
   ```
   - Sort options: Return (high→low), Entry Date (recent→old), Ticker (A→Z)
   - Pagination: 20 stocks per page
   - Click row to see full brief details

4. **Filters (Sidebar):**
   - **Risk Level:** All | Low | Medium | High
   - **Sector:** All | Technology | Finance | Healthcare | Energy | Consumer | Industrial
   - **Status:** All | Open | Closed | Profitable | Unprofitable
   - **Action Type:** All | BUY | HOLD | SELL
   - Show active filters as dismissible chips

5. **Methodology Section (Collapsible):**
   ```
   📊 How We Calculate Performance

   Entry Price: The recommended entry price from our daily brief
   Exit Price: Determined by:
     • Stop-loss hit (position closed to limit losses)
     • Profit target hit (position closed to lock gains)
     • 30-day auto-exit (positions held 30+ days without triggers)
     • Current price (for open positions, unrealized gains/losses)

   Win Rate: % of closed positions with positive returns
   Avg Return: Mean % return across all closed positions
   S&P 500 Comparison: Daily Ticker returns vs. SPY ETF over same period

   Note: Returns reflect price appreciation only (dividends not included).
   All calculations use official closing prices from Polygon.io.
   ```

6. **Empty State (Cold Start Problem):**
   ```
   ┌─────────────────────────────────────────────────────────┐
   │  📈 Performance Tracking Starts Soon                    │
   │                                                         │
   │  We're building our track record in real-time.          │
   │  Check back in 30 days for verified results.            │
   │                                                         │
   │  In the meantime, subscribe to get our daily picks:     │
   │  [Subscribe Free] button                                │
   └─────────────────────────────────────────────────────────┘
   ```
   - Show sample calculation methodology
   - Display "Days until first results: 23 days"

7. **Mobile Optimization:**
   - Hero metrics: Stack vertically (2x2 grid → 4x1)
   - Table: Horizontal scroll for full data
   - Filters: Bottom sheet drawer (not sidebar)
   - Charts: Full-width, touch-friendly zoom

**UI Specifications:**
- Route: `/performance` (new top-level page)
- Brand colors: Dark theme (#0B1E32 background, #00ff88 accents)
- Typography: Inter for body, Space Mono for numbers
- Loading state: Skeleton screens (not spinners)
- Error state: Retry button + "Contact support" link

**Accessibility:**
- WCAG AA compliance (4.5:1 contrast ratios)
- Keyboard navigation for filters
- Screen reader labels for data tables
- Focus indicators on interactive elements

---

#### FR-3: Homepage Performance Summary

**Description:** Condensed performance widget on homepage to drive traffic to full dashboard.

**User Story:**
```
As a homepage visitor,
I want to see Daily Ticker's track record at a glance,
So that I can quickly assess credibility before scrolling.
```

**Acceptance Criteria:**

1. **Placement:**
   - Insert between "Email Preview" and "Pricing" sections
   - Full-width container, max-width 6xl (1280px)
   - Desktop: Single row, 4 metrics + CTA
   - Mobile: 2x2 grid, CTA below

2. **Content:**
   ```
   ┌─────────────────────────────────────────────────────────┐
   │  Our Track Record (Last 90 Days)                        │
   ├───────────────┬───────────────┬───────────────┬─────────┤
   │  67.3%        │  +12.4%       │  47 Picks     │  [View  │
   │  Win Rate     │  Avg Return   │  Analyzed     │  Details→│
   └───────────────┴───────────────┴───────────────┴─────────┘
   ```
   - Show 90-day data (most relevant for new users)
   - Link "View Details →" to `/performance`
   - Update: Daily at 9 PM EST

3. **Design Treatment:**
   - Background: `bg-[#1a3a52]/30 border border-[#1a3a52]`
   - Metrics: `text-4xl font-bold text-white` (numbers)
   - Labels: `text-sm text-gray-300` (descriptions)
   - CTA: `text-[#00ff88] hover:underline`

4. **Trust Indicators:**
   - Subtext: "Updated daily with verified results • Methodology ↓"
   - Link "Methodology" to collapsible section (same as dashboard)
   - Badge: "🔍 Transparent Reporting" or "✓ Independently Verified"

**Interaction:**
- Hover state: Subtle border color shift to `#00ff88/40`
- Click metrics: Navigate to `/performance?filter=90days`
- Click CTA: Navigate to `/performance` (smooth scroll if same page)

**Performance:**
- Data fetched server-side (Next.js RSC)
- Cached for 1 hour
- Fallback: Show "Loading..." if API fails

---

#### FR-4: Archive Page Performance Badges

**Description:** Display performance indicator on individual brief cards in `/archive`.

**User Story:**
```
As a user browsing historical briefs,
I want to see how each brief's picks performed,
So that I can identify which types of analysis work best.
```

**Acceptance Criteria:**

1. **Badge Placement:**
   - Add to brief card footer (below ticker badges)
   - Format: `Performance: +8.4% avg • 2/3 profitable`
   - Show only for briefs >30 days old (closed positions only)

2. **Calculation:**
   - Avg % Return: Mean return across all stocks in that brief
   - Win Rate: # of profitable stocks / total stocks in brief
   - Example: Brief from Oct 1 with 3 stocks:
     - AAPL: +5.2% (profitable)
     - NVDA: +12.6% (profitable)
     - TSLA: -2.1% (unprofitable)
     - Badge: `Performance: +5.2% avg • 2/3 profitable`

3. **Color Coding:**
   - Green: Avg return >5%
   - Yellow: Avg return 0-5%
   - Red: Avg return <0%

4. **Click Behavior:**
   - Click badge → Navigate to `/performance?brief={date}`
   - Pre-filter dashboard to show only that brief's stocks

**Edge Cases:**
- Brief <30 days old: Show "Performance pending (tracked for {days} days)"
- Brief with all open positions: Show "Still tracking • {X}/3 stocks open"

---

#### FR-5: Data Export

**Description:** Allow users to download performance data for personal records.

**User Story:**
```
As a premium subscriber,
I want to export performance data to CSV,
So that I can track Daily Ticker's results in my personal spreadsheet.
```

**Acceptance Criteria:**

1. **Export Button:**
   - Location: Top-right of performance dashboard
   - Label: "Export CSV" with download icon
   - Permissions: Available to free and premium users

2. **CSV Format:**
   ```csv
   Ticker,Entry Date,Entry Price,Exit Date,Exit Price,Return %,Status,Risk Level,Sector,Action
   NVDA,2025-10-15,875.28,2025-11-14,920.15,5.1%,30-Day Exit,Medium,Technology,BUY
   AAPL,2025-10-20,178.45,2025-10-25,182.30,2.2%,Profit Target Hit,Low,Technology,BUY
   TSLA,2025-10-22,242.84,2025-10-29,235.10,-3.2%,Stop-Loss Hit,High,Consumer,BUY
   ```
   - Include all columns from performance table
   - Respect active filters (export only filtered results)
   - Filename: `daily-ticker-performance-{date}.csv`

3. **Data Scope:**
   - Export all closed positions (not open positions)
   - Limit: 1,000 rows per export (prevent abuse)
   - Premium users: No row limit

**Technical Implementation:**
- Client-side CSV generation (no backend route needed)
- Use `papaparse` or built-in `Blob` API
- Trigger browser download with `<a download>`

---

### 4.3 Non-Functional Requirements

#### NFR-1: Performance
- Dashboard page load: <2 seconds (LCP)
- API response time: <500ms (p95)
- Calculation job: <5 minutes for 1,000 stocks
- Real-time price fetch: <3 seconds (Polygon.io)

#### NFR-2: Scalability
- Support 100,000 concurrent users on `/performance`
- Store 10 years of historical performance data (∼25,000 stock records)
- Handle 10,000 API requests/day to Polygon.io

#### NFR-3: Security
- No authentication required for viewing performance data (public)
- Rate limiting: 100 requests/minute per IP (prevent scraping)
- Sanitize all user inputs (filter values, search queries)

#### NFR-4: Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Screen reader compatibility (ARIA labels)
- Color-blind friendly palette (not relying solely on red/green)

#### NFR-5: SEO
- Server-side rendered (Next.js RSC)
- Metadata: `<title>Daily Ticker Performance | Verified Track Record</title>`
- Structured data: `@type: "FinancialProduct"` with aggregateRating
- Sitemap: Add `/performance` to sitemap.xml

---

## 5. Data Model & Architecture

### 5.1 Database Schema

#### New Table: `stock_performance`

**Purpose:** Store calculated performance metrics for each stock recommendation.

```sql
CREATE TABLE stock_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,

  -- Entry Data
  entry_date DATE NOT NULL,
  entry_price DECIMAL(10, 2) NOT NULL,
  entry_zone_midpoint DECIMAL(10, 2), -- For premium picks with entry zones

  -- Exit Data
  exit_date DATE,
  exit_price DECIMAL(10, 2),
  exit_reason VARCHAR(50), -- 'stop_loss' | 'profit_target' | '30_day_auto' | 'manual' | NULL (still open)

  -- Performance Metrics
  return_pct DECIMAL(8, 4), -- -99.99% to +9999.99%
  return_absolute DECIMAL(10, 2), -- Dollar gain/loss per share
  holding_period_days INTEGER, -- Days from entry to exit
  is_profitable BOOLEAN,
  is_closed BOOLEAN DEFAULT FALSE,

  -- Current Data (for open positions)
  current_price DECIMAL(10, 2),
  current_return_pct DECIMAL(8, 4), -- Unrealized gain/loss
  last_price_update TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  calculation_version VARCHAR(10) DEFAULT 'v1.0' -- Track methodology changes
);

-- Indexes for query performance
CREATE INDEX idx_stock_performance_brief_id ON stock_performance(brief_id);
CREATE INDEX idx_stock_performance_entry_date ON stock_performance(entry_date);
CREATE INDEX idx_stock_performance_is_closed ON stock_performance(is_closed);
CREATE INDEX idx_stock_performance_exit_date ON stock_performance(exit_date);
```

**Relationships:**
- `stock_id` → Foreign key to `stocks.id` (many-to-one)
- `brief_id` → Foreign key to `briefs.id` (many-to-one)
- Cascade delete: If brief is deleted, performance records are deleted

**Data Types Rationale:**
- `DECIMAL(10, 2)` for prices: Supports stocks up to $99,999.99 with cent precision
- `DECIMAL(8, 4)` for percentages: Supports -99.99% to +9999.99% (e.g., 1234.5678%)
- `VARCHAR(50)` for exit_reason: Enums stored as strings for readability

---

#### Updated Table: `stocks`

**New Fields:** Add fields to support performance tracking.

```sql
ALTER TABLE stocks
ADD COLUMN stop_loss DECIMAL(10, 2), -- Premium feature
ADD COLUMN profit_target DECIMAL(10, 2), -- Premium feature
ADD COLUMN position_size_pct DECIMAL(5, 2); -- % of portfolio (e.g., 5.00 = 5%)

-- Update existing records to NULL (will populate for new briefs)
```

**Migration Notes:**
- `stop_loss` and `profit_target` are NULL for free tier picks
- `position_size_pct` defaults to NULL (calculated from `allocation` string like "2-3% allocation")

---

#### New Table: `benchmark_performance`

**Purpose:** Store S&P 500 (SPY) daily prices for comparison.

```sql
CREATE TABLE benchmark_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  spy_close DECIMAL(10, 2) NOT NULL, -- S&P 500 ETF closing price
  spy_return_pct DECIMAL(8, 4), -- Daily return vs. previous day
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for date range queries
CREATE INDEX idx_benchmark_performance_date ON benchmark_performance(date);
```

**Data Source:**
- Fetch SPY prices from Polygon.io daily
- Backfill historical data from Jan 1, 2025 (or launch date)

**Usage:**
- Calculate Daily Ticker return vs. SPY return over same period
- Example: Daily Ticker +12.4% vs. SPY +8.2% (90 days) = +4.2% outperformance

---

### 5.2 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Daily Performance Job                   │
│                  (Runs 9 PM EST via Vercel Cron)            │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Fetch New   │   │  Update Open │   │  Fetch SPY   │
│  Briefs      │   │  Positions   │   │  Benchmark   │
│              │   │              │   │              │
│ Query stocks │   │ Query stocks │   │ Polygon.io   │
│ from past    │   │ WHERE        │   │ /v2/aggs/    │
│ 24 hours     │   │ is_closed =  │   │ ticker/SPY   │
│              │   │ FALSE        │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Call        │   │  Call        │   │  Store in    │
│  Polygon.io  │   │  Polygon.io  │   │  benchmark_  │
│  for each    │   │  for current │   │  performance │
│  ticker      │   │  prices      │   │  table       │
│              │   │              │   │              │
│ Throttle:    │   │ Throttle:    │   │              │
│ 250ms delay  │   │ 250ms delay  │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │
        ▼                   ▼
┌──────────────────────────────────────┐
│  Calculate Performance Metrics       │
│                                      │
│  For each stock:                     │
│  • Check if stop-loss hit            │
│  • Check if profit target hit        │
│  • Check if 30 days elapsed          │
│  • Calculate % return                │
│  • Mark as closed if exit triggered  │
│  • Store in stock_performance table  │
└──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────┐
│  Aggregate Metrics (Cache)           │
│                                      │
│  • Overall win rate                  │
│  • Average return by time period     │
│  • Performance by risk level         │
│  • Performance by sector             │
│  • Store in Redis/Vercel KV          │
│  • TTL: 24 hours                     │
└──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────┐
│  Dashboard UI (Next.js RSC)          │
│                                      │
│  • Fetch aggregated metrics          │
│  • Render hero stats                 │
│  • Render performance table          │
│  • Apply user filters                │
└──────────────────────────────────────┘
```

---

### 5.3 API Endpoints

#### GET `/api/performance/aggregate`

**Description:** Fetch aggregated performance metrics.

**Query Parameters:**
- `period` (optional): `30d` | `60d` | `90d` | `all` (default: `90d`)
- `riskLevel` (optional): `low` | `medium` | `high`
- `sector` (optional): `Technology` | `Finance` | `Healthcare` | etc.

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "90d",
    "metrics": {
      "totalPicks": 47,
      "closedPicks": 32,
      "openPicks": 15,
      "winRate": 67.3,
      "avgReturn": 12.4,
      "totalReturn": 396.8,
      "spyReturn": 8.2,
      "outperformance": 4.2
    },
    "breakdown": {
      "byRiskLevel": {
        "low": { "picks": 18, "winRate": 72.2, "avgReturn": 8.1 },
        "medium": { "picks": 21, "winRate": 66.7, "avgReturn": 14.3 },
        "high": { "picks": 8, "winRate": 50.0, "avgReturn": 18.7 }
      },
      "bySector": {
        "Technology": { "picks": 23, "winRate": 69.6, "avgReturn": 15.2 },
        "Finance": { "picks": 12, "winRate": 66.7, "avgReturn": 9.8 },
        "Healthcare": { "picks": 8, "winRate": 62.5, "avgReturn": 11.3 },
        "Energy": { "picks": 4, "winRate": 75.0, "avgReturn": 19.4 }
      }
    },
    "lastUpdated": "2025-11-03T21:00:00Z"
  }
}
```

**Caching:**
- Redis/Vercel KV: 24-hour TTL
- Revalidate on-demand when performance job completes

---

#### GET `/api/performance/stocks`

**Description:** Fetch individual stock performance records.

**Query Parameters:**
- `period` (optional): `30d` | `60d` | `90d` | `all`
- `status` (optional): `open` | `closed` | `profitable` | `unprofitable`
- `riskLevel` (optional): `low` | `medium` | `high`
- `sector` (optional): String
- `sort` (optional): `return_desc` | `return_asc` | `date_desc` | `date_asc` (default: `date_desc`)
- `limit` (optional): Integer (default: 20, max: 100)
- `offset` (optional): Integer (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "ticker": "NVDA",
      "entryDate": "2025-10-15",
      "entryPrice": 875.28,
      "exitDate": "2025-11-14",
      "exitPrice": 920.15,
      "exitReason": "30_day_auto",
      "returnPct": 5.1,
      "returnAbsolute": 44.87,
      "holdingPeriodDays": 30,
      "isProfitable": true,
      "isClosed": true,
      "riskLevel": "medium",
      "sector": "Technology",
      "action": "BUY",
      "briefDate": "2025-10-15",
      "briefSubject": "NVIDIA's AI Chip Demand Surges"
    },
    {
      "id": "uuid-2",
      "ticker": "AAPL",
      "entryDate": "2025-10-20",
      "entryPrice": 178.45,
      "exitDate": null,
      "exitPrice": null,
      "exitReason": null,
      "returnPct": 2.2,
      "returnAbsolute": 3.85,
      "holdingPeriodDays": 14,
      "isProfitable": true,
      "isClosed": false,
      "currentPrice": 182.30,
      "lastPriceUpdate": "2025-11-03T20:00:00Z",
      "riskLevel": "low",
      "sector": "Technology",
      "action": "BUY",
      "briefDate": "2025-10-20",
      "briefSubject": "Apple's Services Revenue Beats Expectations"
    }
  ],
  "pagination": {
    "total": 47,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Performance:**
- Query with joins: `stock_performance ⋈ stocks ⋈ briefs`
- Use indexes on `entry_date`, `is_closed`, `return_pct`
- Cache results for 1 hour (less critical than aggregate)

---

#### POST `/api/performance/calculate` (Internal/Cron)

**Description:** Trigger performance calculation job (called by Vercel Cron).

**Request Body:**
```json
{
  "mode": "incremental", // 'incremental' | 'full'
  "stockIds": ["uuid-1", "uuid-2"] // Optional: Specific stocks to recalculate
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stocksProcessed": 47,
    "stocksUpdated": 32,
    "stocksClosed": 5,
    "errors": [],
    "duration": 142, // seconds
    "timestamp": "2025-11-03T21:00:00Z"
  }
}
```

**Authentication:**
- Verify `Authorization: Bearer ${CRON_SECRET}` header
- Reject requests without valid token

---

### 5.4 Third-Party Integrations

#### Polygon.io API

**Endpoints Used:**

1. **Previous Day Close:**
   ```
   GET https://api.polygon.io/v2/aggs/ticker/{ticker}/prev?adjusted=true
   ```
   **Use Case:** Fetch daily closing prices for performance calculation
   **Rate Limit:** 5 calls/minute (free tier)
   **Cost:** Free for basic tier, $199/mo for premium (unlimited calls)

2. **Grouped Daily Bars:**
   ```
   GET https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/{date}
   ```
   **Use Case:** Bulk fetch all stocks for a specific date (more efficient)
   **Rate Limit:** 5 calls/minute
   **Cost:** Premium tier only

**Error Handling:**
- 429 Too Many Requests → Queue request for retry after 60 seconds
- 404 Not Found → Stock delisted, mark as closed with last known price
- 500 Server Error → Retry 3 times with exponential backoff

**Caching Strategy:**
- Cache historical prices in `stock_performance.exit_price` (immutable)
- Cache current prices in Redis with 1-hour TTL
- Never cache error responses

---

### 5.5 Performance Calculation Logic (Pseudocode)

```typescript
async function calculateStockPerformance(stockId: string) {
  // 1. Fetch stock data from database
  const stock = await db.stocks.findUnique({
    where: { id: stockId },
    include: { brief: true }
  });

  // 2. Determine entry price
  let entryPrice = stock.entryPrice;
  if (stock.entryZoneLow && stock.entryZoneHigh) {
    // Premium picks: Use midpoint of entry zone
    entryPrice = (stock.entryZoneLow + stock.entryZoneHigh) / 2;
  }

  // 3. Fetch current price from Polygon.io
  const currentPrice = await polygonAPI.getPreviousClose(stock.ticker);

  // 4. Check exit triggers
  let exitPrice = null;
  let exitReason = null;
  let exitDate = null;
  let isClosed = false;

  const entryDate = new Date(stock.brief.date);
  const today = new Date();
  const holdingDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));

  if (stock.stopLoss && currentPrice <= stock.stopLoss) {
    // Stop-loss hit
    exitPrice = stock.stopLoss;
    exitReason = 'stop_loss';
    exitDate = await findFirstDatePriceDroppedBelow(stock.ticker, entryDate, stock.stopLoss);
    isClosed = true;
  } else if (stock.profitTarget && currentPrice >= stock.profitTarget) {
    // Profit target hit
    exitPrice = stock.profitTarget;
    exitReason = 'profit_target';
    exitDate = await findFirstDatePriceExceeded(stock.ticker, entryDate, stock.profitTarget);
    isClosed = true;
  } else if (holdingDays >= 30) {
    // 30-day auto-exit
    exitPrice = await polygonAPI.getClosingPrice(stock.ticker, addDays(entryDate, 30));
    exitReason = '30_day_auto';
    exitDate = addDays(entryDate, 30);
    isClosed = true;
  }

  // 5. Calculate returns
  let returnPct = 0;
  let returnAbsolute = 0;

  if (isClosed) {
    returnPct = ((exitPrice - entryPrice) / entryPrice) * 100;
    returnAbsolute = exitPrice - entryPrice;
  } else {
    // Unrealized gains for open positions
    returnPct = ((currentPrice - entryPrice) / entryPrice) * 100;
    returnAbsolute = currentPrice - entryPrice;
  }

  const isProfitable = returnPct > 0;

  // 6. Upsert performance record
  await db.stockPerformance.upsert({
    where: { stockId },
    create: {
      stockId,
      briefId: stock.briefId,
      entryDate: stock.brief.date,
      entryPrice,
      entryZoneMidpoint: (stock.entryZoneLow + stock.entryZoneHigh) / 2 || null,
      exitDate,
      exitPrice,
      exitReason,
      returnPct,
      returnAbsolute,
      holdingPeriodDays: isClosed ? holdingDays : null,
      isProfitable,
      isClosed,
      currentPrice: isClosed ? null : currentPrice,
      currentReturnPct: isClosed ? null : returnPct,
      lastPriceUpdate: new Date(),
    },
    update: {
      exitDate,
      exitPrice,
      exitReason,
      returnPct,
      returnAbsolute,
      holdingPeriodDays: isClosed ? holdingDays : null,
      isProfitable,
      isClosed,
      currentPrice: isClosed ? null : currentPrice,
      currentReturnPct: isClosed ? null : returnPct,
      lastPriceUpdate: new Date(),
    },
  });

  return { stockId, returnPct, isClosed };
}

// Helper: Find first date price dropped below threshold
async function findFirstDatePriceDroppedBelow(
  ticker: string,
  startDate: Date,
  threshold: number
): Promise<Date> {
  // Query Polygon.io for daily bars from startDate to today
  // Iterate through each day to find first date where close <= threshold
  // If not found, return today (conservative estimate)
}
```

---

## 6. UI/UX Specifications

### 6.1 Information Architecture

```
Daily Ticker Homepage (/)
│
├── Header Navigation
│   ├── Logo
│   ├── Pricing (anchor link)
│   ├── Archive (/archive)
│   └── Performance (/performance) ← NEW
│
├── Hero Section
│   ├── Headline
│   ├── Subscribe Form
│   └── Live Ticker
│
├── Performance Summary Widget ← NEW
│   ├── 90-Day Win Rate
│   ├── Avg Return
│   ├── Total Picks
│   └── CTA → View Full Dashboard
│
├── Email Preview
├── Pricing
└── Footer

Performance Dashboard (/performance) ← NEW PAGE
│
├── Hero Metrics
│   ├── Win Rate
│   ├── Avg Return
│   ├── Total Picks
│   └── vs. S&P 500
│
├── Time Period Filters
│   ├── 30 Days
│   ├── 60 Days
│   ├── 90 Days (default)
│   └── All-Time
│
├── Filters Sidebar
│   ├── Risk Level
│   ├── Sector
│   ├── Status
│   └── Action Type
│
├── Performance Table
│   ├── Column Headers (sortable)
│   ├── Stock Rows
│   │   ├── Ticker
│   │   ├── Entry Date
│   │   ├── Entry Price
│   │   ├── Current/Exit Price
│   │   ├── % Return
│   │   └── Status Badge
│   └── Pagination
│
├── Methodology Section (collapsible)
│   ├── Calculation Explainer
│   ├── Exit Logic
│   └── Data Sources
│
└── Export Button (CSV download)

Archive Page (/archive)
│
└── Brief Cards ← UPDATED
    ├── Date
    ├── Subject
    ├── Ticker Badges
    └── Performance Badge ← NEW
        ├── Avg Return
        └── Win Rate
```

---

### 6.2 Wireframes

#### 6.2.1 Performance Dashboard (Desktop)

```
┌────────────────────────────────────────────────────────────────────────┐
│  HEADER: Daily Ticker | Pricing | Archive | Performance                │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  Our Track Record                                    [Export CSV ↓]    │
│  Last updated: Nov 3, 2025, 9:00 PM EST                                │
│                                                                         │
│  ┌────────────────┬────────────────┬────────────────┬─────────────────┐│
│  │   Win Rate     │  Avg Return    │  Total Picks   │  vs. S&P 500    ││
│  │   67.3%        │  +12.4%        │  47 stocks     │  +4.2%          ││
│  │   ■■■■■■■□□□   │  🟢 Positive   │  32 closed     │  Outperformed   ││
│  └────────────────┴────────────────┴────────────────┴─────────────────┘│
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  [ 30 Days ]  [ 60 Days ]  ▶ 90 Days ◀  [ All-Time ]                   │
│                                                                         │
│  Based on 47 picks in this period                                      │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  FILTERS ▼                                                              │
│                                                                         │
│  Risk Level                                                             │
│  ○ All  ○ Low  ○ Medium  ○ High                                         │
│                                                                         │
│  Sector                                                                 │
│  ☑ All  ☐ Technology  ☐ Finance  ☐ Healthcare  ☐ Energy                │
│                                                                         │
│  Status                                                                 │
│  ○ All  ○ Open  ○ Closed  ○ Profitable  ○ Unprofitable                 │
│                                                                         │
│  Action                                                                 │
│  ○ All  ○ BUY  ○ HOLD  ○ SELL                                          │
│                                                                         │
│  Active Filters: [Low Risk ✕]  [Technology ✕]                          │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  Performance Results                                                    │
│                                                                         │
│  Sort by: [Return ↓] [Entry Date] [Ticker]                             │
│                                                                         │
│  Ticker  Entry Date  Entry Price  Current/Exit  Return    Status       │
│  ─────────────────────────────────────────────────────────────────────  │
│  NVDA    Oct 15      $875.28      $920.15       +5.1%     🟢 Open      │
│  AAPL    Oct 20      $178.45      $182.30       +2.2%     🟢 Open      │
│  TSLA    Oct 22      $242.84      $235.10       -3.2%     🔴 Stop-Loss │
│  META    Oct 28      $489.23      $495.80       +1.3%     🟢 Open      │
│  GOOGL   Oct 30      $142.56      $148.20       +4.0%     🟢 Open      │
│  ...                                                                    │
│                                                                         │
│  Showing 1-20 of 47 results     [ ← Previous ]  [ Next → ]             │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  📊 How We Calculate Performance  [Show Details ▼]                     │
│                                                                         │
│  Entry Price: The recommended entry price from our daily brief         │
│  Exit Price: Determined by stop-loss hit, profit target hit, 30-day    │
│  auto-exit, or current price for open positions.                       │
│                                                                         │
│  Win Rate: % of closed positions with positive returns                 │
│  Avg Return: Mean % return across all closed positions                 │
│  S&P 500 Comparison: Daily Ticker returns vs. SPY ETF over same period │
│                                                                         │
│  [Read Full Methodology →]                                             │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  FOOTER: Privacy | Terms | Contact                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

#### 6.2.2 Performance Dashboard (Mobile)

```
┌──────────────────────────────┐
│ ☰  Daily Ticker              │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Our Track Record             │
│ Last updated: Nov 3, 9 PM    │
│                              │
│ ┌──────────┬──────────┐      │
│ │ Win Rate │Avg Return│      │
│ │  67.3%   │ +12.4%   │      │
│ └──────────┴──────────┘      │
│ ┌──────────┬──────────┐      │
│ │ Total    │vs. S&P500│      │
│ │ 47 picks │  +4.2%   │      │
│ └──────────┴──────────┘      │
└──────────────────────────────┘

┌──────────────────────────────┐
│ [30d] [60d] ▶90d◀ [All]      │
│                              │
│ Based on 47 picks            │
└──────────────────────────────┘

┌──────────────────────────────┐
│ [Filters ▼]  [Export CSV ↓]  │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Performance Results          │
│ Sort: [Return ↓]             │
│                              │
│ ┌──────────────────────────┐ │
│ │ NVDA        Oct 15       │ │
│ │ $875.28 → $920.15        │ │
│ │ +5.1% 🟢 Open            │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ AAPL        Oct 20       │ │
│ │ $178.45 → $182.30        │ │
│ │ +2.2% 🟢 Open            │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ TSLA        Oct 22       │ │
│ │ $242.84 → $235.10        │ │
│ │ -3.2% 🔴 Stop-Loss       │ │
│ └──────────────────────────┘ │
│                              │
│ [Load More ↓]                │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 📊 Methodology [Show ▼]      │
└──────────────────────────────┘
```

---

#### 6.2.3 Homepage Performance Summary Widget

```
┌────────────────────────────────────────────────────────────────────────┐
│  Our Track Record (Last 90 Days)                                       │
│  Updated daily with verified results • Methodology ↓                   │
│                                                                         │
│  ┌────────────────┬────────────────┬────────────────┬─────────────┐   │
│  │   Win Rate     │  Avg Return    │  Total Picks   │  [View Full │   │
│  │   67.3%        │  +12.4%        │  47 stocks     │  Dashboard→]│   │
│  │   ■■■■■■■□□□   │  🟢 Positive   │  32 closed     │             │   │
│  └────────────────┴────────────────┴────────────────┴─────────────┘   │
│                                                                         │
│  🔍 Transparent Reporting: Every pick tracked, winners and losers      │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 6.3 Visual Design Specifications

#### 6.3.1 Color Palette

**Primary Colors:**
- Brand Green: `#00ff88` (LED ticker green)
- Background: `#0B1E32` (Deep navy)
- Surface: `#1a3a52` (Card backgrounds)
- Border: `#2a4a62` (Subtle borders)

**Semantic Colors:**
- Success/Profit: `#00ff88` (green)
- Danger/Loss: `#FF3366` (red)
- Warning: `#FFB020` (amber - for medium risk)
- Info: `#3B82F6` (blue - for informational badges)

**Text Colors:**
- Primary: `#FFFFFF` (white)
- Secondary: `#D1D5DB` (gray-300)
- Muted: `#9CA3AF` (gray-400)

#### 6.3.2 Typography

**Font Families:**
- Body: `Inter, sans-serif`
- Numbers/Monospace: `Space Mono, monospace`

**Type Scale:**
- Hero Numbers: `text-4xl font-bold` (36px)
- Section Headings: `text-2xl font-bold` (24px)
- Table Headers: `text-sm font-semibold uppercase` (14px)
- Body Text: `text-base` (16px)
- Small Text: `text-sm` (14px)
- Micro Text: `text-xs` (12px)

#### 6.3.3 Component Styles

**Hero Metric Card:**
```css
.metric-card {
  background: linear-gradient(135deg, #1a3a52 0%, #0B1E32 100%);
  border: 1px solid #2a4a62;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  color: #00ff88;
  font-family: 'Space Mono', monospace;
}

.metric-label {
  font-size: 14px;
  color: #9CA3AF;
  margin-top: 8px;
}
```

**Performance Table Row:**
```css
.table-row {
  background: #1a3a52;
  border-bottom: 1px solid #2a4a62;
  transition: background 0.2s ease;
}

.table-row:hover {
  background: #244a62;
  cursor: pointer;
}

.return-positive {
  color: #00ff88;
  font-weight: 600;
}

.return-negative {
  color: #FF3366;
  font-weight: 600;
}
```

**Status Badge:**
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-open {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.badge-closed {
  background: rgba(156, 163, 175, 0.1);
  border: 1px solid rgba(156, 163, 175, 0.3);
  color: #9CA3AF;
}

.badge-profit {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.badge-loss {
  background: rgba(255, 51, 102, 0.1);
  border: 1px solid rgba(255, 51, 102, 0.3);
  color: #FF3366;
}
```

#### 6.3.4 Spacing System

**Component Spacing:**
- Hero Metrics: `gap-8` (32px between cards)
- Table Rows: `py-4 px-6` (16px vertical, 24px horizontal)
- Section Padding: `py-16` (64px vertical)
- Card Padding: `p-8` (32px all sides)

**Responsive Breakpoints:**
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

---

### 6.4 Interaction Design

#### 6.4.1 Filter Behavior

**Desktop:**
1. Filters displayed in left sidebar (always visible)
2. Clicking filter option immediately updates table (no "Apply" button)
3. Active filters shown as dismissible chips above table
4. URL updates with query params: `/performance?period=90d&risk=low&sector=Technology`

**Mobile:**
1. Filters hidden in bottom sheet drawer
2. Tap "Filters" button to slide up drawer from bottom
3. Apply filters → Drawer closes, table updates
4. Active filter count badge: "Filters (3)"

#### 6.4.2 Table Interactions

**Sorting:**
- Click column header to sort ascending
- Click again to sort descending
- Third click resets to default (entry date desc)
- Visual indicator: ↑ ↓ arrows next to active column

**Row Click:**
- Navigate to `/archive/{briefDate}#stock-{ticker}`
- Smooth scroll to stock section in brief
- Highlight stock card with pulsing border

**Pagination:**
- Load 20 rows per page (default)
- Infinite scroll on mobile (load more on scroll to bottom)
- Traditional prev/next buttons on desktop

#### 6.4.3 Loading States

**Initial Load:**
- Show skeleton screens (gray boxes pulsing)
- Hero metrics: 4 skeleton cards
- Table: 5 skeleton rows

**Filter Change:**
- Fade out table (opacity: 0.5)
- Show spinner overlay
- Fade in new results (duration: 200ms)

**Error State:**
```
┌────────────────────────────────────────────┐
│  ⚠️ Unable to Load Performance Data        │
│                                            │
│  We're having trouble fetching data.       │
│  Please try again in a moment.             │
│                                            │
│  [Retry] button                            │
└────────────────────────────────────────────┘
```

---

### 6.5 Responsive Design

**Desktop (>1024px):**
- 4-column hero metrics grid
- Sidebar filters (sticky)
- Full table with all columns
- 20 rows per page

**Tablet (768px-1024px):**
- 2x2 hero metrics grid
- Collapsible filters (accordion)
- Table with horizontal scroll
- 15 rows per page

**Mobile (<768px):**
- 4x1 hero metrics stack
- Bottom sheet filters
- Card-based table (no horizontal scroll)
- Infinite scroll pagination

---

## 7. Success Metrics & KPIs

### 7.1 Primary Metrics (North Star)

**Metric 1: Free-to-Premium Conversion Rate**

**Definition:**
```
Conversion Rate = (Premium Signups / Free Users Exposed to Performance Dashboard) × 100
```

**Baseline:** 8% (current conversion without performance dashboard)
**Target:** 20% (+12 percentage points)
**Measurement Window:** 90 days post-launch

**Tracking:**
- Event: `performance_dashboard_viewed` (user visits `/performance`)
- Event: `premium_signup_completed` (within 30 days of dashboard view)
- Attribution: User ID → First dashboard view timestamp → Signup timestamp
- Tool: PostHog or Mixpanel with funnel analysis

**Success Criteria:**
- **Tier 1 Success (Goal):** 20% conversion rate (+150% lift)
- **Tier 2 Success (Good):** 15% conversion rate (+87% lift)
- **Tier 3 Success (Acceptable):** 12% conversion rate (+50% lift)
- **Failure:** <10% conversion rate (no meaningful impact)

---

**Metric 2: Performance Dashboard Engagement**

**Definition:**
```
Engagement Rate = (Users who view dashboard / Total homepage visitors) × 100
```

**Baseline:** 0% (feature doesn't exist)
**Target:** 40% of homepage visitors
**Measurement Window:** First 30 days post-launch

**Tracking:**
- Event: `homepage_viewed`
- Event: `performance_summary_clicked` (homepage widget CTA)
- Event: `performance_dashboard_viewed`
- Funnel: Homepage → Performance Summary Click → Dashboard View

**Success Criteria:**
- **Tier 1 Success:** 40%+ engagement (high interest)
- **Tier 2 Success:** 25-40% engagement (moderate interest)
- **Tier 3 Success:** 15-25% engagement (some interest)
- **Failure:** <15% engagement (feature not compelling)

---

**Metric 3: Premium Subscriber Retention**

**Definition:**
```
Retention Rate = (Premium subscribers who renew / Premium subscribers eligible for renewal) × 100
```

**Baseline:** Unknown (Premium launches Q1 2026)
**Target:** 80% annual retention
**Measurement Window:** 12 months post-Premium launch

**Tracking:**
- Cohort analysis: Premium signups by month
- Event: `premium_subscription_renewed`
- Event: `premium_subscription_cancelled`
- Survey: "Did performance tracking influence your renewal decision?"

**Success Criteria:**
- **Tier 1 Success:** 80%+ retention (industry-leading)
- **Tier 2 Success:** 70-80% retention (competitive)
- **Tier 3 Success:** 60-70% retention (acceptable)
- **Failure:** <60% retention (churn problem)

---

### 7.2 Secondary Metrics

**Metric 4: Average Session Duration on Dashboard**

**Target:** 2+ minutes (indicates deep engagement)
**Tracking:** Time between `performance_dashboard_viewed` and page exit

**Interpretation:**
- <1 minute: Bounce (user didn't find value)
- 1-2 minutes: Skimmed (viewed hero metrics only)
- 2-5 minutes: Engaged (filtered, sorted, explored)
- 5+ minutes: Deep dive (read methodology, exported data)

---

**Metric 5: Filter Usage Rate**

**Target:** 60% of dashboard visitors use at least 1 filter
**Tracking:** Event `performance_filter_applied` with properties `{filterType, filterValue}`

**Interpretation:**
- High filter usage = Users seeking specific insights (good)
- Low filter usage = Default view sufficient OR filters not discoverable (investigate)

---

**Metric 6: CSV Export Rate**

**Target:** 20% of dashboard visitors export data
**Tracking:** Event `performance_data_exported`

**Interpretation:**
- High export rate = Users want to track performance externally (validation signal)
- Low export rate = Dashboard UI sufficient OR feature not discoverable

---

**Metric 7: Trust Score Survey**

**Target:** 60%+ of converted premium users cite performance data as influential
**Survey:** "What factors influenced your decision to upgrade to premium?"
Options:
- [ ] Performance track record
- [ ] Content quality
- [ ] Price/value
- [ ] Premium features (stop-loss, profit targets)
- [ ] Other: ___________

**Success:**
- 60%+ select "Performance track record" = Feature validated
- <40% select it = Feature not impactful on decision

---

### 7.3 Operational Metrics

**Metric 8: Calculation Job Success Rate**

**Target:** 99%+ success rate (daily performance calculations complete without errors)
**Tracking:** Vercel Cron job logs, alert on failure

**SLA:**
- Job starts: Daily at 9:00 PM EST
- Job completes: Within 5 minutes (for <1,000 stocks)
- Failures: <1 per month

---

**Metric 9: API Response Time**

**Target:** p95 latency <500ms for `/api/performance/aggregate`
**Tracking:** Vercel Analytics, Datadog

**Thresholds:**
- <300ms: Excellent
- 300-500ms: Good
- 500-1000ms: Acceptable
- >1000ms: Poor (investigate caching)

---

**Metric 10: Polygon.io API Cost**

**Target:** <$100/month in API costs
**Tracking:** Polygon.io dashboard usage metrics

**Budget:**
- Free tier: 5 calls/minute (7,200/day) = $0
- Premium tier: $199/month (unlimited) = Only upgrade if >200 stocks/day

**Optimization:**
- Cache historical prices (never refetch closed positions)
- Batch requests for open positions
- Use grouped daily bars endpoint (1 call = all stocks)

---

### 7.4 Experiment Design (A/B Test Plan)

**Hypothesis:** Displaying performance track record increases free-to-premium conversion by 10+ percentage points.

**Test Setup:**
- **Control Group (50%):** Homepage WITHOUT performance summary widget, no `/performance` link in nav
- **Treatment Group (50%):** Homepage WITH performance summary widget, `/performance` link in nav
- **Duration:** 30 days or 1,000 conversions (whichever comes first)
- **Randomization:** User ID hash modulo 2 (stable assignment)

**Primary Success Metric:**
- Free-to-premium conversion rate (30-day window from first homepage visit)

**Secondary Metrics:**
- Time to conversion (days from signup to premium)
- Conversion funnel drop-off rates
- Pricing page view rate

**Statistical Significance:**
- Minimum detectable effect: 2 percentage points (e.g., 8% → 10%)
- Confidence level: 95%
- Statistical power: 80%
- Sample size: ~2,000 free users per group

**Decision Criteria:**
- **Ship to 100%:** Treatment wins with p<0.05 AND >5 percentage point lift
- **Iterate:** Treatment wins with p<0.05 BUT <5 percentage point lift (optimize UI)
- **Kill:** Treatment loses OR no statistical significance after 60 days

---

### 7.5 Reporting Cadence

**Daily Dashboards:**
- Performance calculation job status (success/failure logs)
- API error rates (Polygon.io, Supabase)
- Dashboard traffic (unique visitors, pageviews)

**Weekly Reports:**
- Conversion funnel (homepage → dashboard → premium signup)
- Filter usage breakdown (most popular filters)
- Top/bottom performing stocks (content insights)

**Monthly Business Reviews:**
- Conversion rate trend (vs. target)
- Retention cohort analysis (if Premium launched)
- User feedback themes (support tickets, surveys)
- Feature usage heatmaps (where users click)

---

## 8. Implementation Roadmap

### 8.1 Phase 1: MVP (Weeks 1-4) - Foundation

**Goal:** Launch basic performance tracking with essential metrics and UI.

**Scope:**
- Core performance calculation engine
- Basic dashboard UI (hero metrics + table)
- Homepage performance summary widget
- 30/60/90-day time filters
- Manual data entry for historical picks (if needed)

**Tasks:**

**Week 1: Database & Data Pipeline**
- [ ] Create `stock_performance` table schema
- [ ] Create `benchmark_performance` table for SPY data
- [ ] Add `stop_loss`, `profit_target` fields to `stocks` table
- [ ] Write migration scripts (Supabase SQL)
- [ ] Backfill SPY historical prices (Polygon.io)
- [ ] Set up Vercel Cron job for daily calculations

**Week 2: Performance Calculation Logic**
- [ ] Implement `calculateStockPerformance()` function
- [ ] Handle entry price logic (standard vs. entry zones)
- [ ] Implement exit triggers (stop-loss, profit target, 30-day auto)
- [ ] Integrate Polygon.io API with rate limiting
- [ ] Handle edge cases (stock splits, delisting, errors)
- [ ] Write unit tests for calculation logic (90% coverage)

**Week 3: API Development**
- [ ] Build `/api/performance/aggregate` endpoint
- [ ] Build `/api/performance/stocks` endpoint
- [ ] Build `/api/performance/calculate` (cron trigger)
- [ ] Implement Redis/Vercel KV caching (24h TTL for aggregates)
- [ ] Add error handling and retry logic
- [ ] Write API integration tests

**Week 4: Frontend UI**
- [ ] Create `/performance` page with Next.js App Router
- [ ] Build hero metrics section (4 key stats)
- [ ] Build performance table with sorting
- [ ] Add time period filters (30/60/90 days, all-time)
- [ ] Add homepage performance summary widget
- [ ] Implement mobile responsive design
- [ ] Add loading/error/empty states

**Acceptance Criteria:**
- ✅ Dashboard displays accurate performance data for all historical picks
- ✅ Homepage widget shows 90-day summary
- ✅ Calculation job runs successfully daily at 9 PM EST
- ✅ Page load time <2 seconds (LCP)
- ✅ Mobile UI is fully functional

**Launch Decision:**
- If >10 closed positions exist → Launch to 100% of users
- If <10 closed positions → Show "Coming soon" placeholder

---

### 8.2 Phase 2: Enhanced Analytics (Weeks 5-8) - Depth

**Goal:** Add filters, breakdowns, and methodology transparency.

**Scope:**
- Risk level and sector filters
- Performance breakdown by category
- S&P 500 benchmark comparison
- Methodology documentation
- Archive page performance badges
- CSV export functionality

**Tasks:**

**Week 5: Filter System**
- [ ] Build filter sidebar UI (desktop)
- [ ] Build filter bottom sheet (mobile)
- [ ] Implement filter state management (URL query params)
- [ ] Add filters: Risk Level, Sector, Status, Action Type
- [ ] Show active filters as dismissible chips
- [ ] Update API to support filter parameters

**Week 6: Performance Breakdowns**
- [ ] Calculate performance by risk level (low/medium/high)
- [ ] Calculate performance by sector (Technology, Finance, etc.)
- [ ] Fetch SPY returns for same time periods
- [ ] Display breakdown cards below hero metrics
- [ ] Add tooltips explaining each metric

**Week 7: Transparency Features**
- [ ] Write methodology documentation (Markdown)
- [ ] Build collapsible methodology section
- [ ] Add "Last updated" timestamp to dashboard
- [ ] Add trust badges ("🔍 Transparent Reporting")
- [ ] Create FAQ page for common questions

**Week 8: Archive Integration**
- [ ] Add performance badge to archive brief cards
- [ ] Calculate per-brief performance (avg return, win rate)
- [ ] Link badges to filtered dashboard view
- [ ] Build CSV export functionality
- [ ] Add analytics tracking for all interactions

**Acceptance Criteria:**
- ✅ Filters work correctly and update URL
- ✅ Performance breakdowns match manual calculations
- ✅ S&P 500 comparison is accurate
- ✅ Methodology is clear and accessible
- ✅ CSV export downloads correct data

---

### 8.3 Phase 3: Advanced Features (Weeks 9-12) - Intelligence

**Goal:** Add predictive insights, interactive charts, and personalization.

**Scope:**
- Interactive performance charts (line/bar graphs)
- Confidence score correlation analysis
- Email performance summaries
- Personalized portfolio tracking (beta)
- Premium vs. Free feature value calculator

**Tasks:**

**Week 9: Data Visualization**
- [ ] Integrate charting library (Recharts or Chart.js)
- [ ] Build cumulative returns chart (daily, over time)
- [ ] Build sector performance bar chart
- [ ] Build risk-level scatter plot (risk vs. return)
- [ ] Add interactive tooltips to charts

**Week 10: Predictive Analytics**
- [ ] Calculate correlation: Confidence score vs. Actual return
- [ ] Display insight: "High-confidence picks returned 15.2% avg"
- [ ] Build leaderboard: Top 10 and Bottom 10 picks
- [ ] Add filters to leaderboard (by sector, risk level)

**Week 11: Email Summaries**
- [ ] Design email template for monthly performance digest
- [ ] Calculate monthly metrics (win rate, avg return, top pick)
- [ ] Send to premium subscribers only (free users get teaser)
- [ ] Add unsubscribe option for performance emails

**Week 12: Personalized Tracking (Beta)**
- [ ] Allow users to mark stocks they actually traded
- [ ] Calculate personal portfolio performance
- [ ] Compare personal performance vs. Daily Ticker average
- [ ] Show "You're outperforming 68% of users" badge

**Acceptance Criteria:**
- ✅ Charts render correctly and are interactive
- ✅ Correlation analysis is statistically sound
- ✅ Email summaries send successfully
- ✅ Personal tracking works for beta users
- ✅ All features are mobile-responsive

---

### 8.4 Launch Strategy

**Soft Launch (Week 4):**
- Ship to 10% of users (A/B test)
- Monitor for errors, performance issues
- Collect initial feedback via in-app survey
- Iterate on UI based on user behavior

**Public Launch (Week 5):**
- Ship to 100% of users
- Announce on homepage banner: "New: See Our Track Record"
- Send email to all free users: "Verify Our Results"
- Post on Twitter/Reddit with screenshot of dashboard
- Update pricing page to mention performance tracking

**Growth Phase (Weeks 6-12):**
- Publish blog post: "How We Track Our Performance (Transparently)"
- Create YouTube explainer video (screen recording + voiceover)
- Add performance summary to email signature
- Run Google Ads targeting "stock newsletter performance"
- Pitch to financial bloggers/YouTubers for coverage

---

### 8.5 Dependencies & Blockers

**External Dependencies:**
- Polygon.io API uptime (99.9% SLA)
- Supabase database availability
- Vercel Cron job reliability

**Internal Dependencies:**
- Premium feature launch (Q1 2026) for stop-loss/profit target data
- Historical briefs must exist (at least 10+ picks for meaningful stats)

**Potential Blockers:**
- **Cold Start Problem:** If performance dashboard launches with <10 picks, it looks unimpressive
  - **Mitigation:** Backfill historical picks manually if needed, or delay launch until sufficient data exists
- **API Rate Limits:** Polygon.io free tier (5 calls/min) may be too slow for 100+ stocks
  - **Mitigation:** Upgrade to $199/mo tier OR batch requests using grouped daily bars endpoint
- **Calculation Errors:** Complex exit logic (stop-loss, profit target) may have bugs
  - **Mitigation:** Extensive unit testing, manual spot-checks against spreadsheet calculations

---

## 9. Risk Assessment

### 9.1 Technical Risks

**Risk 1: Polygon.io API Reliability**

**Description:** If Polygon.io API is down or rate-limited, performance calculations fail.

**Likelihood:** Medium (API outages happen, rate limits are strict)
**Impact:** High (no fresh data = stale dashboard, lost trust)

**Mitigation:**
- **Primary:** Cache all historical prices locally (never refetch closed positions)
- **Secondary:** Fallback to Yahoo Finance API if Polygon.io fails
- **Tertiary:** Manual price entry tool for admins (emergency use)
- **Monitoring:** Alert on API errors >5% (PagerDuty/Slack)

---

**Risk 2: Calculation Logic Bugs**

**Description:** Edge cases (stock splits, delisting, dividend adjustments) cause incorrect performance data.

**Likelihood:** Medium (financial data is complex)
**Impact:** Critical (incorrect data destroys credibility)

**Mitigation:**
- **Primary:** Comprehensive unit tests (90%+ coverage)
- **Secondary:** Manual spot-checks (compare 10 random picks to spreadsheet calculations)
- **Tertiary:** Versioning (`calculation_version` field) to track methodology changes
- **Rollback Plan:** Flag incorrect records, recalculate with fixed logic

---

**Risk 3: Performance Calculation Job Failure**

**Description:** Vercel Cron job fails (timeout, memory limit, API errors), leaving stale data.

**Likelihood:** Low (Vercel Cron is reliable)
**Impact:** Medium (dashboard shows outdated data, users notice)

**Mitigation:**
- **Primary:** Retry logic with exponential backoff (3 attempts)
- **Secondary:** Alert on failure (Slack notification)
- **Tertiary:** Manual trigger button in admin panel
- **Monitoring:** Dashboard shows "Last updated" timestamp (users can see staleness)

---

### 9.2 Business Risks

**Risk 4: Poor Performance Track Record**

**Description:** If Daily Ticker's actual win rate is <50% or avg return is negative, dashboard hurts conversion.

**Likelihood:** Low (confident in pick quality)
**Impact:** Critical (backfire scenario - transparency damages brand)

**Mitigation:**
- **Primary:** Review calculation methodology with finance expert before launch
- **Secondary:** Add context: "We prioritize risk management over home runs" (set expectations)
- **Tertiary:** Don't launch dashboard if track record is objectively bad (<45% win rate)
- **Messaging:** Emphasize learning moments: "Even our losses teach valuable lessons"

---

**Risk 5: Feature Doesn't Drive Conversion**

**Description:** Users view performance dashboard but still don't convert to premium.

**Likelihood:** Medium (performance data may not be the blocker)
**Impact:** High (wasted engineering effort, no ROI)

**Mitigation:**
- **Primary:** A/B test before full rollout (validate hypothesis)
- **Secondary:** Survey users who view dashboard but don't convert (learn real objections)
- **Tertiary:** Iterate on UI (add ROI calculator, premium value comparison)
- **Pivot Plan:** If conversion doesn't improve after 90 days, repurpose dashboard as retention tool (premium-only feature)

---

**Risk 6: Legal/Compliance Issues**

**Description:** Displaying performance data may trigger securities regulations (investment advice disclaimer).

**Likelihood:** Low (most newsletters show track records)
**Impact:** High (legal liability, fines, shutdown)

**Mitigation:**
- **Primary:** Add disclaimer: "Past performance does not guarantee future results. Not investment advice."
- **Secondary:** Consult securities lawyer before launch ($2k-5k fee)
- **Tertiary:** Use passive voice: "This stock was recommended" (not "You should buy")
- **Compliance:** Include risk disclosures on every page

---

### 9.3 User Experience Risks

**Risk 7: Cold Start Problem (No Data Yet)**

**Description:** If dashboard launches with <10 picks, it looks empty/unimpressive.

**Likelihood:** High (if launching before 30 days of briefs)
**Impact:** Medium (underwhelming first impression)

**Mitigation:**
- **Primary:** Delay dashboard launch until 30+ picks exist (recommended)
- **Secondary:** Backfill historical picks manually from past emails
- **Tertiary:** Show "Performance tracking starts {date}" placeholder with sample calculation
- **Messaging:** "We're building our track record in real-time. Check back in 30 days."

---

**Risk 8: Information Overload**

**Description:** Too many metrics/filters overwhelm users (analysis paralysis).

**Likelihood:** Medium (common with data dashboards)
**Impact:** Low (users bounce, but core metrics still visible)

**Mitigation:**
- **Primary:** Progressive disclosure (start with 4 hero metrics, hide filters by default)
- **Secondary:** User testing with 5 target users (watch for confusion)
- **Tertiary:** Add guided tour (first-time users get tooltips)
- **Simplification:** Phase 1 has fewer options than Phase 3

---

**Risk 9: Mobile UX Degradation**

**Description:** Dashboard is too complex for mobile screens (horizontal scroll, tiny text).

**Likelihood:** Medium (data tables are hard on mobile)
**Impact:** Medium (40% of users are mobile, per analytics)

**Mitigation:**
- **Primary:** Card-based layout on mobile (not table)
- **Secondary:** Bottom sheet filters (not sidebar)
- **Tertiary:** Touch-friendly tap targets (44px minimum)
- **Testing:** QA on iPhone SE (smallest screen) and Android tablets

---

### 9.4 Operational Risks

**Risk 10: Increased Support Load**

**Description:** Users don't understand methodology, submit tickets asking "Why is this calculated this way?"

**Likelihood:** High (financial data is confusing)
**Impact:** Low (answerable, but time-consuming)

**Mitigation:**
- **Primary:** Comprehensive FAQ section ("Why did this pick auto-exit at 30 days?")
- **Secondary:** Methodology documentation with examples
- **Tertiary:** Support macro responses (copy-paste explanations)
- **Escalation:** If >20 tickets/week, add in-app tooltips to explain fields

---

## 10. Open Questions

### 10.1 Product Questions

**Q1: How should we handle dividends?**

**Context:** Some stocks pay quarterly dividends (e.g., AAPL pays ~0.5% per quarter). Should we include dividend income in performance calculations?

**Options:**
- **Option A (MVP):** Ignore dividends, track price appreciation only
  - Pros: Simpler calculation, easier to explain
  - Cons: Understates total return for dividend stocks
- **Option B (Enhanced):** Include dividends, adjust entry/exit prices
  - Pros: More accurate total return
  - Cons: Requires dividend data (Polygon.io has this, but complex)

**Recommendation:** Option A for MVP (price appreciation only), Option B for Phase 2.
**Rationale:** Daily Ticker focuses on growth stocks (NVDA, TSLA, etc.) which rarely pay dividends. Adding dividend tracking adds complexity without much benefit for current portfolio mix.

---

**Q2: What if a stock hits both stop-loss AND profit target (volatility)?**

**Context:** Stock recommended at $100, stop-loss at $95, profit target at $110. Stock spikes to $112 on Day 5, then crashes to $90 on Day 10. Which exit do we record?

**Options:**
- **Option A:** Use first trigger chronologically (profit target on Day 5)
- **Option B:** Use final outcome (stop-loss on Day 10)
- **Option C:** Mark as "closed at profit target" but add note "subsequently reversed"

**Recommendation:** Option A (first trigger).
**Rationale:** Daily Ticker's methodology assumes traders exit at first trigger hit. Recording later events would be misleading (no trader holds after hitting profit target).

**Implementation:** Query Polygon.io daily bars from entry date, stop iteration when price crosses either threshold.

---

**Q3: Should we show unrealized gains for open positions?**

**Context:** Stock recommended at $100, currently trading at $105 (Day 15). Show as +5% return even though position is still open?

**Options:**
- **Option A:** Show unrealized gains, mark as "Open 🟢"
- **Option B:** Hide open positions from performance table entirely
- **Option C:** Show in separate section ("Open Positions - Not Yet Realized")

**Recommendation:** Option A (show unrealized gains).
**Rationale:** Users want to see current portfolio value. Hiding open positions makes dashboard look stale. Clearly label as "unrealized" to avoid confusion.

---

**Q4: How do we handle after-hours/pre-market price movements?**

**Context:** Daily Ticker emails sent at 8 AM EST. If stock spikes 10% in pre-market (before entry), should entry price be:
- A) Previous day's close (from email)
- B) 9:30 AM opening price (first tradeable price)

**Recommendation:** Option A (previous day's close).
**Rationale:** Consistent with email methodology. Users who trade at open may get different results, but we need a standardized approach.

**Caveat:** Add disclaimer: "Entry prices reflect recommended values, not execution prices. Actual returns may vary."

---

### 10.2 Business Questions

**Q5: Should performance data be public or gated (login required)?**

**Context:** Competitors like Motley Fool show summary stats publicly but require login to see individual picks.

**Options:**
- **Option A:** Fully public (anyone can view dashboard)
  - Pros: SEO value, social sharing, trust signal
  - Cons: Competitors can scrape data
- **Option B:** Gated (email signup required to view full dashboard)
  - Pros: Lead generation, protect data
  - Cons: Friction, lower engagement
- **Option C:** Hybrid (summary public, details gated)
  - Pros: Best of both worlds
  - Cons: Complexity

**Recommendation:** Option A (fully public) for MVP.
**Rationale:** Transparency is the value prop. Gating defeats the purpose. If scraping becomes an issue, add rate limiting.

---

**Q6: Should we display individual stock names or just tickers?**

**Context:** Dashboard currently shows "NVDA" but users may not recognize ticker symbols.

**Options:**
- **Option A:** Ticker only (NVDA)
- **Option B:** Ticker + Company name (NVDA - NVIDIA Corporation)
- **Option C:** Company name only (NVIDIA Corporation)

**Recommendation:** Option B (ticker + company name).
**Rationale:** Tickers are concise but not beginner-friendly. Company names add clarity without much space cost.

---

**Q7: How do we handle the "cherry-picking" perception?**

**Context:** Users may suspect we only show profitable picks, hiding losers.

**Mitigation Strategies:**
- **Strategy A:** Show all picks (winners + losers) with clear loss indicators
- **Strategy B:** Third-party verification (CPA audits track record quarterly)
- **Strategy C:** Link to original email archives (proof of recommendations)

**Recommendation:** All three strategies.
**Rationale:** Transparency is the only defense. Show everything, get audited, link to sources.

---

**Q8: Should premium features (stop-loss, profit targets) be visible on free dashboard?**

**Context:** Free users can see that premium picks have stop-loss/profit targets, but values are blurred.

**Options:**
- **Option A:** Show existence ("🔒 Stop-loss available in premium")
- **Option B:** Hide entirely (free users don't know premium picks have extra data)
- **Option C:** Show blurred values ("Stop-loss: $•••.••")

**Recommendation:** Option C (show blurred values).
**Rationale:** Creates curiosity and FOMO. Users see the premium value without full access.

---

### 10.3 Technical Questions

**Q9: How long do we store historical performance data?**

**Context:** Supabase has 10GB free tier. Each stock record = ~10KB. 10,000 stocks = 100MB (negligible). But what about 10 years from now?

**Options:**
- **Option A:** Store forever (never delete)
- **Option B:** Archive after 5 years (move to cold storage)
- **Option C:** Delete after 10 years

**Recommendation:** Option A (store forever).
**Rationale:** Historical data is the product's value. Storage cost is <$50/year even at scale. Don't delete.

---

**Q10: Should we use server-side rendering (SSR) or client-side rendering (CSR) for dashboard?**

**Context:** Next.js supports both. SSR is better for SEO, CSR is more interactive.

**Options:**
- **Option A:** SSR (fetch data server-side, render HTML)
  - Pros: SEO, faster first load
  - Cons: Slower filter updates (full page reload)
- **Option B:** CSR (fetch data client-side via API)
  - Pros: Instant filter updates, more interactive
  - Cons: Slower first load, no SEO
- **Option C:** Hybrid (SSR for initial load, CSR for filters)
  - Pros: Best of both
  - Cons: More complex

**Recommendation:** Option C (hybrid).
**Rationale:** Use Next.js App Router with React Server Components for initial render, then client-side fetch for filter updates.

---

## 11. Appendix

### 11.1 Glossary

**Term** | **Definition**
--- | ---
**Win Rate** | Percentage of closed positions with positive returns (>0%)
**Avg Return** | Mean percentage return across all closed positions
**Closed Position** | Stock that hit stop-loss, profit target, or 30-day auto-exit
**Open Position** | Stock still being tracked (no exit trigger hit)
**Unrealized Gain/Loss** | Current profit/loss for open positions (not yet closed)
**Realized Gain/Loss** | Final profit/loss for closed positions
**Entry Price** | Recommended purchase price from daily brief
**Exit Price** | Price at which position was closed (stop-loss, profit target, 30-day)
**Stop-Loss** | Price threshold to sell and limit losses (premium feature)
**Profit Target** | Price threshold to sell and lock in gains (premium feature)
**30-Day Auto-Exit** | Positions held for 30+ days without hitting exit triggers are automatically closed
**S&P 500 Benchmark** | SPY ETF returns over same time period for comparison
**Confidence Score** | AI-generated 0-100 rating for pick conviction (premium feature)
**Risk Level** | Low/Medium/High rating based on volatility and sector

---

### 11.2 Competitive Analysis (Performance Dashboards)

**Motley Fool Stock Advisor:**
- **What They Show:** Overall return since inception (2002), top 10 picks, monthly performance
- **Strengths:** Long track record (20+ years), impressive cumulative returns (643%)
- **Weaknesses:** Cherry-picked highlights, no individual stock detail, outdated UI
- **Daily Ticker Advantage:** Granular stock-level data, real-time updates, transparent methodology

**Seeking Alpha Premium:**
- **What They Show:** Author-level track records, Quant Ratings, portfolio performance
- **Strengths:** Analyst accountability, detailed metrics, community-driven
- **Weaknesses:** Fragmented (different analysts, no unified portfolio), subscription required
- **Daily Ticker Advantage:** Single cohesive track record, free access, simpler UI

**TipRanks:**
- **What They Show:** Analyst success rates, price target accuracy, star ratings
- **Strengths:** Data-driven, covers thousands of analysts, historical accuracy stats
- **Weaknesses:** Aggregated (not specific to TipRanks picks), complex UI, analysis paralysis
- **Daily Ticker Advantage:** Curated picks (not aggregated), cleaner UX, actionable format

**Alpha Picks (Seeking Alpha):**
- **What They Show:** Portfolio returns, individual stock performance, benchmarking
- **Strengths:** Interactive charts, detailed attribution, transparent exits
- **Weaknesses:** Premium-only ($200/year), limited free preview
- **Daily Ticker Advantage:** Free access to performance data, simpler tier structure

---

### 11.3 User Feedback Templates

**In-App Survey (After Viewing Dashboard):**

> **How useful was the performance dashboard?**
> ⭐⭐⭐⭐⭐ (1-5 stars)
>
> **What would make it more useful?** (Open text)
>
> **Did this data influence your decision to upgrade to premium?**
> ○ Yes, it convinced me
> ○ Yes, but I need more time
> ○ No, I need other features
> ○ No, price is the issue

**Exit Survey (User Cancels Premium):**

> **Why are you canceling your premium subscription?**
> ☐ Performance didn't meet expectations
> ☐ Too expensive
> ☐ Not using features enough
> ☐ Found alternative service
> ☐ Other: ___________
>
> **Did the performance tracking feature add value?**
> ○ Yes, very useful
> ○ Somewhat useful
> ○ Not useful
> ○ Didn't use it

---

### 11.4 Example Calculation (Worked Example)

**Stock:** NVDA (NVIDIA)
**Brief Date:** October 15, 2025
**Entry Price:** $875.28
**Stop-Loss:** $840.00 (premium feature)
**Profit Target:** $960.00 (premium feature)
**Risk Level:** Medium

**Daily Price History (Polygon.io):**
| Date | Close Price |
|------|-------------|
| Oct 15 | $875.28 (entry) |
| Oct 16 | $882.15 |
| Oct 17 | $878.45 |
| Oct 18 | $895.60 |
| Oct 19 | $910.22 |
| Oct 20 | $905.80 |
| ... | ... |
| Nov 14 | $920.15 |

**Exit Logic:**
- Day 30: Nov 14, 2025 (30 days since entry)
- Stop-loss never hit (price never dropped below $840)
- Profit target never hit (price never exceeded $960)
- **Outcome:** 30-day auto-exit at $920.15

**Performance Calculation:**
```
Entry Price: $875.28
Exit Price: $920.15 (Nov 14, Day 30)
Return: ($920.15 - $875.28) / $875.28 = 0.0512 = 5.12%
Holding Period: 30 days
Status: Closed (30-day auto-exit)
Is Profitable: Yes (5.12% > 0%)
```

**Database Record:**
```json
{
  "id": "uuid-123",
  "stockId": "stock-uuid-456",
  "briefId": "brief-uuid-789",
  "entryDate": "2025-10-15",
  "entryPrice": 875.28,
  "exitDate": "2025-11-14",
  "exitPrice": 920.15,
  "exitReason": "30_day_auto",
  "returnPct": 5.12,
  "returnAbsolute": 44.87,
  "holdingPeriodDays": 30,
  "isProfitable": true,
  "isClosed": true,
  "createdAt": "2025-11-14T21:00:00Z",
  "updatedAt": "2025-11-14T21:00:00Z"
}
```

---

### 11.5 Resources & References

**Documentation:**
- Polygon.io API Docs: https://polygon.io/docs
- Supabase Postgres Guide: https://supabase.com/docs/guides/database
- Next.js App Router: https://nextjs.org/docs/app
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs

**Design Inspiration:**
- Motley Fool Track Record: https://www.fool.com/premium/stock-advisor/returns
- TipRanks Performance: https://www.tipranks.com/analysts/top
- Personal Capital Dashboard: https://www.personalcapital.com

**Tools:**
- Analytics: PostHog, Mixpanel
- Error Tracking: Sentry
- Monitoring: Datadog, Vercel Analytics
- A/B Testing: PostHog Experiments

**Legal:**
- SEC Investment Adviser Regulations: https://www.sec.gov/investment
- FINRA Advertising Rules: https://www.finra.org/rules-guidance
- Sample Disclaimers: https://www.rocketlawyer.com/business/business-operations/disclaimers

---

## Document Change Log

**Version 1.0 (Nov 3, 2025):**
- Initial draft
- Defined MVP scope (Phase 1)
- Outlined data model and API endpoints
- Designed UI wireframes
- Established success metrics

**Version 1.1 (TBD):**
- Incorporate stakeholder feedback
- Finalize implementation timeline
- Validate with engineering team
- Add budget estimates

---

## Approval & Sign-Off

**Document Status:** Draft - Ready for Review

**Reviewers:**
- [ ] Engineering Lead (Technical Feasibility)
- [ ] Design Lead (UI/UX Validation)
- [ ] Marketing Lead (Messaging Alignment)
- [ ] Legal/Compliance (Risk Review)
- [ ] CEO/Founder (Strategic Approval)

**Next Steps:**
1. Schedule stakeholder review meeting (within 5 business days)
2. Incorporate feedback and publish v1.1
3. Break down Phase 1 into engineering tickets (Jira/Linear)
4. Assign development team and kick off sprint
5. Set launch date target (4 weeks from approval)

---

**End of Document**
