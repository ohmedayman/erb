CREATE TABLE IF NOT EXISTS registered_users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'user',
  subscription_status TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE registered_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for anon on registered_users'
  ) THEN
    CREATE POLICY "Allow all for anon on registered_users" ON registered_users
    FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  duration TEXT NOT NULL DEFAULT 'yearly',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for anon on subscription_plans'
  ) THEN
    CREATE POLICY "Allow all for anon on subscription_plans" ON subscription_plans
    FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

INSERT INTO subscription_plans (id, name, price, duration, features) VALUES
  ('plan-basic', 'StockFlow Basic', 1500.00, 'yearly', '["منتجات غير محدودة", "زبائن وموردين", "فواتير بسيطة", "تقارير أساسية"]'),
  ('plan-pro', 'StockFlow Pro', 3000.00, 'yearly', '["منتجات غير محدودة", "زبائن وموردين", "فواتير وأوردرات", "تقارير وتحليلات", "شحن وتوصيل", "باركود وطباعة", "إشعارات فورية", "إعدادات كاملة"]'),
  ('plan-enterprise', 'StockFlow Enterprise', 6000.00, 'yearly', '["كل مميزات Pro", "فريق عمل غير محدود", "تقارير متقدمة", "API كامل", "دعم فني أولوي", "تخصيص كامل"]')
ON CONFLICT (id) DO NOTHING;
