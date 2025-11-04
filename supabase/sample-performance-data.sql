-- Sample Performance Data for Testing Dashboard
-- This creates a sample brief with 3 stocks and performance tracking data

-- Step 1: Create a sample brief for testing
INSERT INTO briefs (date, subject, html_content, tldr, actionable_count)
VALUES (
  '2025-10-15',
  'Tech Rally Continues: AI Stocks Lead Market Higher',
  '<html><body><h1>Daily Ticker Brief</h1><p>Tech sector showing strong momentum as AI stocks continue their rally. Market sentiment remains bullish despite volatility.</p></body></html>',
  'AI stocks rally continues with NVDA, AMD, and MSFT showing strength',
  3
)
ON CONFLICT (date) DO NOTHING
RETURNING id;

-- Step 2: Get the brief ID (you'll need to run this query first to get the ID)
-- Run this to get your brief ID:
-- SELECT id FROM briefs WHERE date = '2025-10-15';

-- Step 3: Insert sample stocks (replace 'YOUR_BRIEF_ID_HERE' with the actual ID from step 2)
-- For easier setup, we'll use a WITH clause to get the brief_id automatically

WITH sample_brief AS (
  SELECT id FROM briefs WHERE date = '2025-10-15' LIMIT 1
),
inserted_stocks AS (
  INSERT INTO stocks (
    brief_id,
    ticker,
    sector,
    confidence,
    risk_level,
    action,
    entry_price,
    entry_zone_low,
    entry_zone_high,
    stop_loss,
    profit_target,
    summary,
    why_matters,
    momentum_check,
    actionable_insight,
    allocation,
    caution_notes
  )
  SELECT
    sample_brief.id,
    ticker,
    sector,
    confidence,
    risk_level,
    action,
    entry_price,
    entry_zone_low,
    entry_zone_high,
    stop_loss,
    profit_target,
    summary,
    why_matters,
    momentum_check,
    actionable_insight,
    allocation,
    caution_notes
  FROM sample_brief,
  (VALUES
    (
      'NVDA',
      'Technology',
      87,
      'Medium',
      'BUY',
      495.00,
      510.00,
      515.00,
      480.00,
      604.00,
      'NVIDIA continues AI dominance with strong data center growth',
      'Leading the AI chip market with 80%+ market share. Q3 earnings beat expectations.',
      'Stock up 15% in past month. Volume 2x average. RSI at 65 (bullish but not overbought).',
      'Buy on dips to $510-515 range. Target $604 (profit target). Stop loss at $480.',
      '8%',
      'High volatility expected around earnings. Options premiums elevated.'
    ),
    (
      'AMD',
      'Technology',
      82,
      'Medium',
      'BUY',
      140.00,
      142.00,
      145.00,
      135.00,
      175.00,
      'AMD gains market share in data center CPUs',
      'New Zen 5 architecture showing strong performance. MI300 AI chips ramping production.',
      'Stock consolidating after recent rally. Breaking above $145 would signal continuation.',
      'Enter at $142-145. Currently trading at entry zone. Target $175 over 30 days.',
      '6%',
      'Intel competition increasing. Watch for margin pressure.'
    ),
    (
      'MSFT',
      'Technology',
      91,
      'Low',
      'HOLD',
      390.00,
      375.00,
      380.00,
      385.00,
      465.00,
      'Microsoft Azure growth accelerating with AI services',
      'Cloud revenue up 29% YoY. Copilot AI showing strong enterprise adoption.',
      'Steady uptrend. Institutional buying evident. Low volatility compared to peers.',
      'Hold current positions. Add on pullback to $375-380. Target $465.',
      '10%',
      'Regulatory scrutiny on OpenAI partnership. Watch for updates.'
    )
  ) AS stock_data(
    ticker, sector, confidence, risk_level, action, entry_price,
    entry_zone_low, entry_zone_high, stop_loss, profit_target,
    summary, why_matters, momentum_check, actionable_insight,
    allocation, caution_notes
  )
  RETURNING id, ticker
)

-- Step 4: Insert performance tracking data
-- NVDA: Closed position (hit profit target - WIN)
-- AMD: Still open position
-- MSFT: Closed position (hit stop loss - LOSS)
INSERT INTO stock_performance (stock_id, entry_date, entry_price, exit_date, exit_price, exit_reason)
SELECT
  s.id,
  '2025-10-15'::date,
  CASE
    WHEN s.ticker = 'NVDA' THEN 495.00
    WHEN s.ticker = 'AMD' THEN 140.00
    WHEN s.ticker = 'MSFT' THEN 390.00
  END,
  CASE
    WHEN s.ticker = 'NVDA' THEN '2025-10-30'::date
    WHEN s.ticker = 'MSFT' THEN '2025-10-28'::date
    ELSE NULL  -- AMD still open
  END,
  CASE
    WHEN s.ticker = 'NVDA' THEN 604.00  -- Hit profit target
    WHEN s.ticker = 'MSFT' THEN 385.00  -- Hit stop loss
    ELSE NULL  -- AMD still open
  END,
  CASE
    WHEN s.ticker = 'NVDA' THEN 'profit_target'
    WHEN s.ticker = 'MSFT' THEN 'stop_loss'
    ELSE NULL  -- AMD still open
  END
FROM inserted_stocks s;

-- Step 5: Verify the data was inserted correctly
SELECT
  'Performance Summary' as check_type,
  total_closed_picks,
  total_open_picks,
  total_wins,
  total_losses,
  win_rate_percent,
  avg_return_percent
FROM performance_summary

UNION ALL

SELECT
  'Stock Performance Detail' as check_type,
  COUNT(*)::text as total_closed_picks,
  NULL as total_open_picks,
  NULL as total_wins,
  NULL as total_losses,
  NULL as win_rate_percent,
  NULL as avg_return_percent
FROM stock_performance;

-- Expected Results:
-- Win Rate: 50% (1 win out of 2 closed positions)
-- Avg Return: ~10.4% ((+22% NVDA + -1.3% MSFT) / 2)
-- Best Pick: NVDA +22%
-- Open Positions: 1 (AMD)
