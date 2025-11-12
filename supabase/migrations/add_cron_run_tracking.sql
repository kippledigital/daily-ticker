-- Cron run tracking table
-- Tracks every cron execution for monitoring and debugging

CREATE TABLE IF NOT EXISTS cron_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date DATE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'partial')),

  -- Execution details
  trigger_source TEXT, -- 'vercel-cron', 'manual', etc
  steps_completed JSONB DEFAULT '{}'::jsonb,

  -- Results
  stocks_discovered INTEGER,
  stocks_validated INTEGER,
  emails_sent_free INTEGER DEFAULT 0,
  emails_sent_premium INTEGER DEFAULT 0,
  archive_stored BOOLEAN DEFAULT false,

  -- Error tracking
  error_message TEXT,
  error_details JSONB,

  -- Performance
  execution_time_ms INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cron_runs_date ON cron_runs(run_date DESC);
CREATE INDEX IF NOT EXISTS idx_cron_runs_status ON cron_runs(status);
CREATE INDEX IF NOT EXISTS idx_cron_runs_started_at ON cron_runs(started_at DESC);

-- Unique constraint: only one successful run per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_cron_runs_successful_date
  ON cron_runs(run_date)
  WHERE status = 'success';

-- Auto-update updated_at
CREATE TRIGGER update_cron_runs_updated_at
  BEFORE UPDATE ON cron_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for monitoring recent runs
CREATE OR REPLACE VIEW recent_cron_runs AS
SELECT
  run_date,
  status,
  started_at,
  completed_at,
  EXTRACT(EPOCH FROM (completed_at - started_at))::INTEGER as duration_seconds,
  stocks_discovered,
  stocks_validated,
  emails_sent_free + emails_sent_premium as total_emails_sent,
  archive_stored,
  error_message
FROM cron_runs
ORDER BY started_at DESC
LIMIT 30;

-- View for cron health monitoring
CREATE OR REPLACE VIEW cron_health AS
SELECT
  COUNT(*) FILTER (WHERE status = 'success') as successful_runs_30d,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_runs_30d,
  COUNT(*) FILTER (WHERE status = 'partial') as partial_runs_30d,
  MAX(started_at) FILTER (WHERE status = 'success') as last_success_at,
  MAX(started_at) FILTER (WHERE status = 'failed') as last_failure_at,
  AVG(execution_time_ms) FILTER (WHERE status = 'success') as avg_execution_time_ms,
  SUM(emails_sent_free + emails_sent_premium) as total_emails_sent_30d
FROM cron_runs
WHERE started_at >= NOW() - INTERVAL '30 days';

COMMENT ON TABLE cron_runs IS 'Tracks every daily automation cron execution for monitoring';
COMMENT ON VIEW recent_cron_runs IS 'Recent 30 cron runs with key metrics';
COMMENT ON VIEW cron_health IS 'Overall cron health metrics for last 30 days';
