-- Premium Waitlist Table
-- Tracks users who want to be notified when Premium launches

CREATE TABLE IF NOT EXISTS premium_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contact preferences
  name TEXT,
  interested_features TEXT[], -- Array of features they're most interested in

  -- Marketing data
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Status tracking
  notified BOOLEAN DEFAULT FALSE, -- Has been notified of premium launch
  converted BOOLEAN DEFAULT FALSE, -- Actually subscribed to premium
  notified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_premium_waitlist_email ON premium_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_premium_waitlist_created_at ON premium_waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_premium_waitlist_notified ON premium_waitlist(notified) WHERE notified = FALSE;

-- RLS Policies
ALTER TABLE premium_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to join the waitlist (INSERT)
CREATE POLICY "Anyone can join premium waitlist"
  ON premium_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users (admin) can view waitlist
CREATE POLICY "Admin can view premium waitlist"
  ON premium_waitlist
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users (admin) can update (mark as notified/converted)
CREATE POLICY "Admin can update premium waitlist"
  ON premium_waitlist
  FOR UPDATE
  TO authenticated
  USING (true);

-- Analytics view for waitlist growth
CREATE OR REPLACE VIEW premium_waitlist_stats AS
SELECT
  COUNT(*) as total_signups,
  COUNT(*) FILTER (WHERE notified = TRUE) as notified_count,
  COUNT(*) FILTER (WHERE converted = TRUE) as converted_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as signups_last_7_days,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as signups_last_30_days,
  ROUND(
    (COUNT(*) FILTER (WHERE converted = TRUE)::numeric /
     NULLIF(COUNT(*) FILTER (WHERE notified = TRUE), 0)) * 100,
    2
  ) as conversion_rate_percent
FROM premium_waitlist;

-- Comment the table
COMMENT ON TABLE premium_waitlist IS 'Premium tier waitlist - tracks users interested in premium features when it launches Q1 2026';
