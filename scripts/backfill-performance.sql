-- Backfill Performance Tracking for Archived Briefs
-- This creates performance records for all historical picks that don't have them yet

-- Step 1: Check current state
SELECT
  b.date,
  b.subject,
  COUNT(s.id) as stock_count,
  COUNT(sp.id) as performance_records
FROM briefs b
LEFT JOIN stocks s ON s.brief_id = b.id
LEFT JOIN stock_performance sp ON sp.stock_id = s.id
GROUP BY b.date, b.subject
ORDER BY b.date DESC;

-- Step 2: Insert performance records for stocks that don't have them
INSERT INTO stock_performance (stock_id, entry_date, entry_price)
SELECT
  s.id as stock_id,
  b.date as entry_date,
  s.entry_price
FROM stocks s
JOIN briefs b ON b.id = s.brief_id
LEFT JOIN stock_performance sp ON sp.stock_id = s.id
WHERE sp.id IS NULL  -- Only insert if no performance record exists
RETURNING *;

-- Step 3: Verify all stocks now have performance records
SELECT
  b.date,
  COUNT(s.id) as total_stocks,
  COUNT(sp.id) as tracked_stocks,
  CASE
    WHEN COUNT(s.id) = COUNT(sp.id) THEN '✅ All tracked'
    ELSE '❌ Missing records'
  END as status
FROM briefs b
LEFT JOIN stocks s ON s.brief_id = b.id
LEFT JOIN stock_performance sp ON sp.stock_id = s.id
GROUP BY b.date
ORDER BY b.date DESC;
