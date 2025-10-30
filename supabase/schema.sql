-- Daily Ticker Archive Schema for Supabase

-- Create briefs table
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  tldr TEXT,
  actionable_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  sector TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  risk_level TEXT NOT NULL,
  action TEXT NOT NULL,
  entry_price DECIMAL(10, 2) NOT NULL,
  entry_zone_low DECIMAL(10, 2),
  entry_zone_high DECIMAL(10, 2),
  stop_loss DECIMAL(10, 2),
  profit_target DECIMAL(10, 2),
  summary TEXT NOT NULL,
  why_matters TEXT NOT NULL,
  momentum_check TEXT NOT NULL,
  actionable_insight TEXT NOT NULL,
  allocation TEXT,
  caution_notes TEXT,
  learning_moment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add columns to existing stocks table (if table already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks' AND column_name = 'stop_loss'
  ) THEN
    ALTER TABLE stocks ADD COLUMN stop_loss DECIMAL(10, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stocks' AND column_name = 'profit_target'
  ) THEN
    ALTER TABLE stocks ADD COLUMN profit_target DECIMAL(10, 2);
  END IF;
END $$;

-- Add comments for new columns
COMMENT ON COLUMN stocks.stop_loss IS 'Price level where trader should exit to limit losses';
COMMENT ON COLUMN stocks.profit_target IS 'Price level where trader should take profits (2:1 reward-to-risk ratio)';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_briefs_date ON briefs(date DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_brief_id ON stocks(brief_id);
CREATE INDEX IF NOT EXISTS idx_stocks_ticker ON stocks(ticker);
CREATE INDEX IF NOT EXISTS idx_stocks_action ON stocks(action);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for briefs table
DROP TRIGGER IF EXISTS update_briefs_updated_at ON briefs;
CREATE TRIGGER update_briefs_updated_at
  BEFORE UPDATE ON briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now, can restrict later)
CREATE POLICY "Allow all operations on briefs" ON briefs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stocks" ON stocks FOR ALL USING (true) WITH CHECK (true);
