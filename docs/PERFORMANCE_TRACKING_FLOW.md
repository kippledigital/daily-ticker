# Performance Tracking Flow - Complete Documentation

This document explains how stock picks are tracked from creation to the performance dashboard, ensuring transparency and data quality.

## The Complete Flow

### 1. Daily Brief Creation (Every Weekday at 8 AM EST)

**Trigger:** `/api/cron/daily-brief` (runs via Vercel cron Mon-Fri at 1 PM UTC / 8 AM EST)

**What Happens:**
1. AI analyzes market data and generates 1-3 stock picks
2. Creates daily brief with:
   - Subject line, HTML content, TL;DR
   - Market context and insights
   - Stock recommendations with full data

**Data Created in Database:**
```sql
-- Creates 1 row in briefs table
INSERT INTO briefs (date, subject, html_content, tldr, actionable_count)

-- Creates 1-3 rows in stocks table (one per pick)
INSERT INTO stocks (
  ticker, sector, confidence, risk_level, action,
  entry_price, entry_zone_low, entry_zone_high,
  stop_loss, profit_target,
  summary, why_matters, momentum_check, actionable_insight
)

-- NEW: Creates 1-3 rows in stock_performance table (tracking records)
INSERT INTO stock_performance (
  stock_id,        -- Links to the stock
  entry_date,      -- Today's date
  entry_price      -- The recommended entry price
  -- exit_date, exit_price, exit_reason start as NULL (position is "open")
)
```

**Key Fields for Performance Tracking:**
- `entry_price`: The price we recommend entering at
- `stop_loss`: Auto-sell if price drops to this level (protect capital)
- `profit_target`: Auto-sell if price rises to this level (take profits)
- `confidence`: AI confidence score (0-100)

---

### 2. Performance Update (Every Day at 10 PM UTC / 5 PM EST)

**Trigger:** `/api/performance/update` (runs via Vercel cron daily after market close)

**What Happens:**
1. Fetches all open positions from `stock_performance` table
2. For each open position:
   - Calls Polygon.io API to get current stock price
   - Checks if stop-loss hit (price <= stop_loss)
   - Checks if profit target hit (price >= profit_target)
   - Checks if 30-day holding period exceeded
3. If any condition is met, closes the position:
   ```sql
   UPDATE stock_performance SET
     exit_date = '2025-11-04',
     exit_price = 604.00,
     exit_reason = 'profit_target'  -- or 'stop_loss' or '30_day_limit'
   WHERE id = ...
   ```

**Auto-Calculation Trigger:**
When a position is updated, the database trigger automatically calculates:
```sql
-- Calculates return percentage
return_percent = ((exit_price - entry_price) / entry_price) * 100

-- Calculates return in dollars
return_dollars = exit_price - entry_price

-- Calculates holding days
holding_days = exit_date - entry_date

-- Determines outcome
outcome = 'win'   if return_percent > 0
outcome = 'loss'  if return_percent <= 0
outcome = 'open'  if exit_price IS NULL
```

**Example:**
- **Entry:** NVDA at $495 on Oct 15
- **Stop Loss:** $480 (protect against -3% loss)
- **Profit Target:** $604 (aim for +22% gain)
- **Check on Oct 30:** Price is $604 → **Hit profit target!**
- **Auto-Update:** Close position, record +22% win, 15-day hold

---

### 3. Performance Dashboard Display (Real-time)

**Trigger:** User visits homepage, dashboard loads via `/api/performance`

**What Happens:**
1. Fetches aggregated metrics from `performance_summary` view:
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE outcome = 'win') as total_wins,
     COUNT(*) FILTER (WHERE outcome = 'loss') as total_losses,
     COUNT(*) FILTER (WHERE outcome = 'open') as total_open_picks,
     win_rate_percent,  -- wins / closed positions * 100
     avg_return_percent -- average return across all closed positions
   FROM stock_performance
   ```

2. Fetches recent picks with details:
   ```sql
   SELECT
     sp.*,
     s.ticker,
     s.sector,
     s.stop_loss,
     s.profit_target
   FROM stock_performance sp
   JOIN stocks s ON s.id = sp.stock_id
   ORDER BY entry_date DESC
   LIMIT 10
   ```

3. Displays on homepage:
   - **4 Key Metrics** (Win Rate, Avg Return, Best Pick, Avg Hold Time)
   - **Recent Picks Table** (All stocks with outcomes, filterable)
   - **Real-time Status** (Win ✓, Loss ✗, Open •)

---

## Data Integrity & Quality Checks

### ✅ What We Track

**1. Entry Data (Set at brief creation):**
- ✅ Entry date (when pick was recommended)
- ✅ Entry price (recommended buy price)
- ✅ Stop loss (downside protection level)
- ✅ Profit target (upside goal)
- ✅ Confidence score (AI conviction 0-100)
- ✅ Sector, risk level, allocation %

**2. Exit Data (Set when position closes):**
- ✅ Exit date (when target was hit or 30 days passed)
- ✅ Exit price (actual sell price)
- ✅ Exit reason (profit_target | stop_loss | 30_day_limit)

**3. Performance Metrics (Auto-calculated):**
- ✅ Return % ((exit - entry) / entry * 100)
- ✅ Return $ (exit - entry)
- ✅ Holding days (exit_date - entry_date)
- ✅ Outcome (win | loss | open)

### ✅ Ensuring Good Advice

**1. Transparent Tracking**
- Every pick is tracked from day 1
- Can't cherry-pick or hide losses
- All data visible on public dashboard

**2. Risk Management**
- Stop loss protects against major losses
- Profit targets enforce discipline
- 30-day limit prevents dead positions

**3. Realistic Expectations**
- Win rate shown (not always 100%)
- Losses displayed alongside wins
- Average return across all picks

**4. Quality Signals**
- Confidence scores (higher = more conviction)
- Risk levels (Low/Medium/High transparency)
- Sector diversification visible

### ✅ Helping Users Understand

**Dashboard Shows:**
1. **Win Rate** → "Do your picks work?"
   - 50% = 1 win per 2 picks
   - 70% = 7 wins per 10 picks

2. **Avg Return** → "How much profit on average?"
   - +10% = $10,000 → $11,000 per pick on average
   - Includes both wins and losses

3. **Best Pick** → "What's your best performance?"
   - Shows potential upside
   - +22% = $10,000 → $12,200 on one pick

4. **Avg Hold Time** → "How long until exit?"
   - 14 days = 2 weeks average
   - Helps plan position sizes

5. **Individual Picks** → "See every trade"
   - Entry/exit prices
   - Return %
   - Win/loss/open status
   - Days held

**User Actions:**
- Filter by Wins/Losses/Open
- See actual outcomes, not projections
- Track real money impact

### ✅ Visual Performance Tracking

**Design Elements:**
1. **Color-Coded Returns**
   - 🟢 Green = Positive return (win)
   - 🔴 Red = Negative return (loss)
   - ⚪ Gray = Open position (pending)

2. **Status Badges**
   - ✓ Win (green badge)
   - ✗ Loss (red badge)
   - • Open (gray badge)

3. **Animated Counters**
   - NumberTicker components count up
   - Creates engagement and trust
   - Premium feel

4. **Filterable Table**
   - All picks visible
   - Filter by outcome
   - Sortable by date

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  DAILY BRIEF AUTOMATION (8 AM EST Mon-Fri)                 │
│  /api/cron/daily-brief                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─► 1. Analyze market data (AI)
                   ├─► 2. Generate 1-3 stock picks
                   ├─► 3. Create email brief
                   │
                   ▼
         ┌─────────────────────┐
         │  /api/archive/store │
         └─────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   ┌─────────┐         ┌──────────┐
   │ briefs  │         │  stocks  │
   │  table  │         │   table  │
   └─────────┘         └────┬─────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │ stock_performance    │
                  │ (NEW tracking record)│
                  │                      │
                  │ entry_date: today    │
                  │ entry_price: $495    │
                  │ exit_date: NULL      │
                  │ outcome: 'open'      │
                  └──────────────────────┘
                            │
                            │ (Position is OPEN)
                            │
┌─────────────────────────────────────────────────────────────┐
│  PERFORMANCE UPDATE (10 PM UTC / 5 PM EST Daily)           │
│  /api/performance/update                                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─► 1. Fetch all open positions
                   ├─► 2. Get current prices (Polygon.io)
                   ├─► 3. Check stop-loss/profit targets
                   │
                   ▼
         ┌─────────────────────┐
         │ Price check:        │
         │ NVDA = $604         │
         │ Target = $604 ✓     │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ UPDATE stock_perf   │
         │                     │
         │ exit_date: Oct 30   │
         │ exit_price: $604    │
         │ exit_reason:        │
         │   'profit_target'   │
         └─────────┬───────────┘
                   │
                   ▼ (DB Trigger Auto-Calculates)
         ┌─────────────────────┐
         │ return_percent: 22% │
         │ return_dollars: $109│
         │ holding_days: 15    │
         │ outcome: 'win'      │
         └─────────────────────┘
                   │
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD DISPLAY (Real-time on homepage)                  │
│  /api/performance → components/performance-dashboard.tsx     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─► 1. Fetch performance_summary view
                   ├─► 2. Calculate win rate, avg return
                   ├─► 3. Fetch recent picks with outcomes
                   │
                   ▼
         ┌─────────────────────┐
         │   USER SEES:        │
         │                     │
         │ Win Rate: 50%       │
         │ Avg Return: +10.4%  │
         │ Best Pick: +22%     │
         │                     │
         │ NVDA: +22% ✓ Win    │
         │ AMD: Open           │
         │ MSFT: -1.3% ✗ Loss  │
         └─────────────────────┘
```

---

## Verification Checklist

### ✅ Data Collection
- [x] Entry prices tracked automatically
- [x] Exit prices updated daily via cron
- [x] Stop-loss and profit targets enforced
- [x] 30-day limit prevents stale positions
- [x] All picks tracked (no cherry-picking)

### ✅ Data Quality
- [x] Timestamps accurate (entry_date, exit_date)
- [x] Prices from reliable source (Polygon.io)
- [x] Calculations verified (return %, outcome)
- [x] Database triggers ensure consistency
- [x] Error handling and logging

### ✅ User Experience
- [x] Dashboard shows real-time data
- [x] Metrics easy to understand
- [x] Visual feedback (colors, badges)
- [x] Filterable and interactive
- [x] Mobile responsive

### ✅ Transparency
- [x] All picks visible on dashboard
- [x] Wins and losses both shown
- [x] Can't hide bad performance
- [x] Real outcomes, not projections
- [x] Public track record

---

## Next Steps for Even Better Tracking

### Phase 2 Enhancements (Future):
1. **S&P 500 Benchmark Comparison**
   - Track market performance alongside picks
   - Show alpha (outperformance vs market)

2. **Monthly Performance Breakdown**
   - Month-by-month win rates
   - Performance trends over time

3. **Sector Performance Analysis**
   - Which sectors perform best
   - Diversification insights

4. **Historical Backfill**
   - Import past picks for longer track record
   - Cold start problem solution

### Monitoring & Alerts:
1. **Daily Health Checks**
   - Verify cron jobs ran successfully
   - Alert if update fails

2. **Data Quality Monitoring**
   - Check for missing performance records
   - Validate price data accuracy

3. **Performance Notifications**
   - Email when position closes
   - Weekly performance summary

---

## FAQ

**Q: When does a pick get added to the dashboard?**
A: Immediately when the daily brief is created (8 AM EST). It starts as an "open" position.

**Q: When does a pick close?**
A: When stop-loss is hit, profit target is hit, or 30 days pass—whichever comes first.

**Q: What if the market is closed?**
A: The update cron runs at 5 PM EST (after market close) and checks prices from that day's close.

**Q: Can picks be edited or deleted after creation?**
A: No. All picks are permanent and tracked from creation. This ensures transparency.

**Q: What if Polygon.io API fails?**
A: The update cron logs errors but doesn't fail. It will retry the next day. No data is lost.

**Q: How accurate are the returns?**
A: Returns are calculated based on stop-loss/profit-target prices (not current market price) to reflect realistic exits.

---

## Summary

✅ **Every pick is tracked automatically** from the moment it's created
✅ **Performance updates daily** via automated cron job checking prices
✅ **Dashboard shows real outcomes** with wins, losses, and open positions
✅ **Transparent and auditable** - can't hide bad performance
✅ **Users understand the data** through clear metrics and visual design
✅ **Quality advice proven** through real track record over time

This system ensures that Daily Ticker maintains credibility, helps users make informed decisions, and proves that the AI-powered picks actually work.
