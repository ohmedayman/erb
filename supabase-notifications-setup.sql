-- Enhanced notifications table for StockFlow
-- Run this in Supabase Dashboard → SQL Editor

-- Drop old notifications table if exists
DROP TABLE IF EXISTS notifications;

-- Create enhanced notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  category TEXT DEFAULT 'system',
  priority TEXT DEFAULT 'normal',
  read BOOLEAN DEFAULT false,
  user_id TEXT,
  store_id TEXT,
  entity_type TEXT,
  entity_id TEXT,
  action_url TEXT,
  metadata JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_store_id ON notifications(store_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_store_read ON notifications(store_id, read);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for anon notifications" ON notifications;
CREATE POLICY "Allow all for anon notifications" ON notifications
  FOR ALL USING (true) WITH CHECK (true);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  store_id TEXT NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  order_alerts BOOLEAN DEFAULT true,
  low_stock_alerts BOOLEAN DEFAULT true,
  payment_alerts BOOLEAN DEFAULT true,
  system_alerts BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon notif_prefs" ON notification_preferences;
CREATE POLICY "Allow all for anon notif_prefs" ON notification_preferences
  FOR ALL USING (true) WITH CHECK (true);
