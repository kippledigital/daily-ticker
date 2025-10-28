-- Subscribers table for Daily Ticker
-- Replaces Beehiiv with Supabase email storage

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),

  -- Tracking
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,

  -- Source tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Email engagement (tracked via Resend webhooks)
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  last_opened_at TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at DESC);

-- Email analytics table (for detailed tracking)
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL, -- Resend email ID
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')),

  -- Event data
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  link_clicked TEXT, -- For click events

  -- Metadata from Resend
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for email events
CREATE INDEX IF NOT EXISTS idx_email_events_subscriber_id ON email_events(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON email_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_occurred_at ON email_events(occurred_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment emails_sent count for a list of emails
CREATE OR REPLACE FUNCTION increment_emails_sent(email_list TEXT[])
RETURNS VOID AS $$
BEGIN
  UPDATE subscribers
  SET emails_sent = emails_sent + 1
  WHERE email = ANY(email_list);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Optional but recommended
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert (subscribe)
CREATE POLICY "Allow public subscribe" ON subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all
CREATE POLICY "Allow authenticated read subscribers" ON subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update subscribers" ON subscribers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Allow public to read their own subscription (for unsubscribe page)
CREATE POLICY "Allow public read own subscription" ON subscribers
  FOR SELECT
  TO anon
  USING (true);

-- Helpful views for analytics
CREATE OR REPLACE VIEW subscriber_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
  COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
  COUNT(*) as total_subscribers,
  ROUND(AVG(emails_opened::DECIMAL / NULLIF(emails_sent, 0) * 100), 2) as avg_open_rate,
  ROUND(AVG(emails_clicked::DECIMAL / NULLIF(emails_sent, 0) * 100), 2) as avg_click_rate
FROM subscribers;

-- View for recent activity
CREATE OR REPLACE VIEW recent_subscribers AS
SELECT
  email,
  status,
  subscribed_at,
  utm_source,
  utm_medium,
  emails_sent,
  emails_opened,
  emails_clicked,
  CASE
    WHEN emails_sent > 0 THEN ROUND((emails_opened::DECIMAL / emails_sent * 100), 1)
    ELSE 0
  END as open_rate_percent
FROM subscribers
ORDER BY created_at DESC
LIMIT 100;

COMMENT ON TABLE subscribers IS 'Email subscribers for Daily Ticker newsletter';
COMMENT ON TABLE email_events IS 'Email engagement events tracked from Resend webhooks';
COMMENT ON VIEW subscriber_stats IS 'Overall subscriber and engagement statistics';
COMMENT ON VIEW recent_subscribers IS 'Most recent subscribers with engagement metrics';
