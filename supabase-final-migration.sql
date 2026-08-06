-- ============================================
-- StockFlow Final Migration
-- Run ALL of this in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================

-- 1. admin_notifications table
-- ============================================
CREATE TABLE IF NOT EXISTS admin_notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  user_name TEXT DEFAULT '',
  user_email TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for anon on admin_notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Allow all for everyone on admin_notifications" ON admin_notifications;
CREATE POLICY "Allow all for everyone on admin_notifications" ON admin_notifications
FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);

-- 2. Add missing columns to subscription_orders
-- ============================================
DO $$ BEGIN
  ALTER TABLE subscription_orders ADD COLUMN IF NOT EXISTS id_card_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscription_orders ADD COLUMN IF NOT EXISTS selected_features TEXT[] DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 3. Update subscription_plans with 3 tiers
-- ============================================
DELETE FROM subscription_plans WHERE id IN ('plan-pro', 'plan-basic', 'plan-enterprise');

INSERT INTO subscription_plans (id, name, price, duration, features) VALUES
  ('plan-starter', 'StockFlow Starter', 3000.00, 'yearly', '["100 منتج", "50 زبون", "100 أوردر شهرياً", "فواتير وإيصالات", "نقطة بيع POS", "باركود وطباعة", "تقارير مبيعات أساسية", "إدارة المنتجات", "حساب المخزون", "طباعة فواتير PDF", "دعم فني"]'),
  ('plan-growth', 'StockFlow Growth', 6000.00, 'yearly', '["500 منتج", "500 زبون", "1000 أوردر شهرياً", "كل مميزات Starter", "المصروفات اليومية", "إدارة الموظفين والرواتب", "المستودعات المتعددة", "حركات المخزون", "إدارة الموردين", "إشعارات فورية", "تقارير أرباح وخسائر", "تقارير المخزون", "تصدير Excel", "إدارة العملاء والموردين", "دعم فني أولوي"]'),
  ('plan-enterprise', 'StockFlow Enterprise', 9000.00, 'yearly', '["منتجات غير محدودة", "زبائن غير محدودين", "أوردرات غير محدودة", "كل مميزات Growth", "تكاليف الشحن والتوصيل", "نظام الأقساط والتقسيط", "تقييمات العملاء", "إدارة الفريق والأدوار", "تحليلات مبيعات متقدمة", "تقارير PDF احترافية", "نقاط بيع متعددة", "سجل النشاطات", "إعدادات متقدمة", "دعم 24/7", "تكامل مع أنظمة الدفع"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  features = EXCLUDED.features;

-- 4. Product images storage bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read for product images'
  ) THEN
    CREATE POLICY "Public read for product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anon upload for product images'
  ) THEN
    CREATE POLICY "Anon upload for product images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

-- 5. Add missing columns to registered_users
-- ============================================
DO $$ BEGIN
  ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_ip TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_country TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_city TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_device TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_browser TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_os TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS signup_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS enabled_features TEXT[] DEFAULT ARRAY['products', 'orders', 'customers', 'invoices', 'expenses', 'employees', 'suppliers', 'analytics', 'reports', 'warehouses', 'installments', 'notifications', 'ratings', 'stockMovements', 'team'];
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 6. Signup trigger: auto-create registered_users row
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.registered_users (id, full_name, email, role, subscription_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    'user',
    'pending'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, registered_users.full_name),
    email = COALESCE(EXCLUDED.email, registered_users.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Disable RLS on all main tables (fixes anon key issues)
-- ============================================
ALTER TABLE registered_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE returns DISABLE ROW LEVEL SECURITY;
ALTER TABLE installments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications DISABLE ROW LEVEL SECURITY;
