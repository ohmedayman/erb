-- User Activity Tracking Table
-- Tracks IP, location, device, browser for each user on signup/login

CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  event_type TEXT NOT NULL DEFAULT 'signup', -- signup, login, logout
  ip_address TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  screen_resolution TEXT,
  language TEXT,
  timezone TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_email ON user_activity(user_email);
CREATE INDEX IF NOT EXISTS idx_user_activity_event ON user_activity(event_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at DESC);

-- RLS policies
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own activity
CREATE POLICY "Users can insert own activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow reading all activity (for admin)
CREATE POLICY "Allow read all activity" ON user_activity
  FOR SELECT USING (true);

-- Add country/city columns to registered_users if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registered_users' AND column_name = 'last_ip') THEN
    ALTER TABLE registered_users ADD COLUMN last_ip TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registered_users' AND column_name = 'last_country') THEN
    ALTER TABLE registered_users ADD COLUMN last_country TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registered_users' AND column_name = 'last_city') THEN
    ALTER TABLE registered_users ADD COLUMN last_city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registered_users' AND column_name = 'last_device') THEN
    ALTER TABLE registered_users ADD COLUMN last_device TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registered_users' AND column_name = 'last_browser') THEN
    ALTER TABLE registered_users ADD COLUMN last_browser TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registered_users' AND column_name = 'last_os') THEN
    ALTER TABLE registered_users ADD COLUMN last_os TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registered_users' AND column_name = 'signup_at') THEN
    ALTER TABLE registered_users ADD COLUMN signup_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registered_users' AND column_name = 'last_login_at') THEN
    ALTER TABLE registered_users ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;
END $$;
