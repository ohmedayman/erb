-- Add columns to registered_users (safe version)

ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_ip TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_country TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_city TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_device TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_browser TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_os TEXT;
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS signup_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
