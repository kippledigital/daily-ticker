-- Performance Tracking Schema for Daily Ticker
-- This schema tracks the actual performance of stock recommendations over time

-- Create stock_performance table
CREATE TABLE IF NOT EXISTS stock_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,

  -- Entry details
  entry_date DATE NOT NULL,
  entry_price DECIMAL(10, 2) NOT NULL,

  -- Exit details (NULL until position is closed)
  exit_date DATE,
  exit_price DECIMAL(10, 2),
  exit_reason TEXT, -- 'stop_loss' | 'profit_target' | '30_day_limit' | 'manual'

  -- Performance metrics
  return_percent DECIMAL(10, 4),
  return_dollars DECIMAL(10, 2),
  holding_days INTEGER,
  outcome TEXT, -- 'win' | 'loss' | 'open'

  -- Tracking metadata
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_exit_reason CHECK (exit_reason IN ('stop_loss', 'profit_target', '30_day_limit', 'manual')),
  CONSTRAINT valid_outcome CHECK (outcome IN ('win', 'loss', 'open'))
);

-- Create benchmark_performance table (for S&P 500 comparison)
CREATE TABLE IF NOT EXISTS benchmark_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  sp500_close DECIMAL(10, 2) NOT NULL,
  sp500_change_percent DECIMAL(10, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance queries
CREATE INDEX IF NOT EXISTS idx_stock_performance_stock_id ON stock_performance(stock_id);
CREATE INDEX IF NOT EXISTS idx_stock_performance_entry_date ON stock_performance(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_performance_exit_date ON stock_performance(exit_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_performance_outcome ON stock_performance(outcome);
CREATE INDEX IF NOT EXISTS idx_benchmark_performance_date ON benchmark_performance(date DESC);

-- Create updated_at trigger for stock_performance
DROP TRIGGER IF EXISTS update_stock_performance_updated_at ON stock_performance;
CREATE TRIGGER update_stock_performance_updated_at
  BEFORE UPDATE ON stock_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE stock_performance IS 'Tracks actual performance of each stock recommendation';
COMMENT ON COLUMN stock_performance.entry_date IS 'Date the stock was recommended';
COMMENT ON COLUMN stock_performance.entry_price IS 'Price at entry (from brief or entry zone midpoint)';
COMMENT ON COLUMN stock_performance.exit_date IS 'Date position was closed (NULL if still open)';
COMMENT ON COLUMN stock_performance.exit_price IS 'Price at exit (stop-loss, profit target, or 30-day close)';
COMMENT ON COLUMN stock_performance.exit_reason IS 'Why the position was closed';
COMMENT ON COLUMN stock_performance.return_percent IS 'Percentage return (exit_price - entry_price) / entry_price * 100';
COMMENT ON COLUMN stock_performance.outcome IS 'Whether the trade was a win, loss, or still open';

COMMENT ON TABLE benchmark_performance IS 'Daily S&P 500 closes for benchmark comparison';
COMMENT ON COLUMN benchmark_performance.sp500_close IS 'S&P 500 closing price';
COMMENT ON COLUMN benchmark_performance.sp500_change_percent IS 'Daily change percentage';

-- Enable Row Level Security
ALTER TABLE stock_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_performance ENABLE ROW LEVEL SECURITY;

-- Create policies (public read access, server-side write access)
CREATE POLICY "Allow public read on stock_performance" ON stock_performance FOR SELECT USING (true);
CREATE POLICY "Allow public read on benchmark_performance" ON benchmark_performance FOR SELECT USING (true);

-- Create view for aggregated performance metrics
CREATE OR REPLACE VIEW performance_summary AS
SELECT
  COUNT(*) FILTER (WHERE outcome != 'open') as total_closed_picks,
  COUNT(*) FILTER (WHERE outcome = 'open') as total_open_picks,
  COUNT(*) FILTER (WHERE outcome = 'win') as total_wins,
  COUNT(*) FILTER (WHERE outcome = 'loss') as total_losses,
  ROUND(
    COUNT(*) FILTER (WHERE outcome = 'win')::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE outcome != 'open'), 0) * 100,
    2
  ) as win_rate_percent,
  ROUND(AVG(return_percent) FILTER (WHERE outcome != 'open'), 2) as avg_return_percent,
  ROUND(AVG(return_percent) FILTER (WHERE outcome = 'win'), 2) as avg_win_percent,
  ROUND(AVG(return_percent) FILTER (WHERE outcome = 'loss'), 2) as avg_loss_percent,
  ROUND(AVG(holding_days) FILTER (WHERE outcome != 'open'), 1) as avg_holding_days,
  MAX(return_percent) FILTER (WHERE outcome != 'open') as best_pick_percent,
  MIN(return_percent) FILTER (WHERE outcome != 'open') as worst_pick_percent
FROM stock_performance;

-- Grant access to views
GRANT SELECT ON performance_summary TO anon, authenticated;

-- Create function to calculate performance for a stock
CREATE OR REPLACE FUNCTION calculate_stock_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate return percentage
  IF NEW.exit_price IS NOT NULL AND NEW.entry_price IS NOT NULL THEN
    NEW.return_percent := ((NEW.exit_price - NEW.entry_price) / NEW.entry_price) * 100;
    NEW.return_dollars := NEW.exit_price - NEW.entry_price;
  END IF;

  -- Calculate holding days
  IF NEW.exit_date IS NOT NULL AND NEW.entry_date IS NOT NULL THEN
    NEW.holding_days := NEW.exit_date - NEW.entry_date;
  END IF;

  -- Determine outcome
  IF NEW.exit_price IS NULL THEN
    NEW.outcome := 'open';
  ELSIF NEW.return_percent > 0 THEN
    NEW.outcome := 'win';
  ELSE
    NEW.outcome := 'loss';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate performance metrics
DROP TRIGGER IF EXISTS auto_calculate_performance ON stock_performance;
CREATE TRIGGER auto_calculate_performance
  BEFORE INSERT OR UPDATE ON stock_performance
  FOR EACH ROW
  EXECUTE FUNCTION calculate_stock_performance();
