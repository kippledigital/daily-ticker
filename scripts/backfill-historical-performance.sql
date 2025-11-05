-- Backfill Performance Records for All Historical Stocks
-- Run this in Supabase SQL Editor to populate performance tracking

-- Step 1: Insert performance records for stocks that don't have them
INSERT INTO stock_performance (stock_id, entry_date, entry_price)
SELECT
  s.id as stock_id,
  b.date as entry_date,
  s.entry_price
FROM stocks s
JOIN briefs b ON b.id = s.brief_id
WHERE NOT EXISTS (
  SELECT 1 FROM stock_performance sp WHERE sp.stock_id = s.id
);

-- Step 2: Show what was created
SELECT
  COUNT(*) as records_created,
  MIN(entry_date) as earliest_pick,
  MAX(entry_date) as latest_pick
FROM stock_performance;

-- Step 3: View all performance records grouped by date
SELECT
  sp.entry_date,
  COUNT(*) as picks_count,
  COUNT(CASE WHEN sp.outcome = 'win' THEN 1 END) as wins,
  COUNT(CASE WHEN sp.outcome = 'loss' THEN 1 END) as losses,
  COUNT(CASE WHEN sp.outcome = 'open' THEN 1 END) as open_positions
FROM stock_performance sp
GROUP BY sp.entry_date
ORDER BY sp.entry_date DESC;

-- Step 4: Show current performance summary
SELECT * FROM performance_summary;
