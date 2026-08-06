-- Rate limiting table for Supabase-backed rate limiting
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  is_block BOOLEAN DEFAULT false,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_key ON rate_limit_log(key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_created ON rate_limit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_key_created ON rate_limit_log(key, created_at DESC);

-- RLS: only service role can access (bypasses RLS)
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

-- No policies = only service role can read/write (bypasses RLS)
-- Client-side requests will be blocked by RLS, which is correct
-- Rate limiting should only happen server-side or via service role

-- Auto-cleanup: delete entries older than 1 hour
CREATE OR REPLACE FUNCTION cleanup_rate_limit_log()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limit_log WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run cleanup every hour (schedule this in Supabase or use pg_cron)
-- SELECT cron.schedule('cleanup-rate-limit', '0 * * * *', 'SELECT cleanup_rate_limit_log()');
