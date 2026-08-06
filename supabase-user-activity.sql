-- Add columns to registered_users (safe version)

ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_ip TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_country TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_city TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_device TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_browser TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_os TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS signup_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Create user_activity table for tracking login/signup events
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_activity
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
