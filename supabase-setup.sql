CREATE TABLE IF NOT EXISTS subscription_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  plan_name TEXT NOT NULL DEFAULT 'StockFlow Pro',
  plan_price DECIMAL(12,2) NOT NULL DEFAULT 3000.00,
  plan_duration TEXT NOT NULL DEFAULT 'yearly',
  payment_method TEXT NOT NULL,
  payment_details TEXT,
  transaction_id TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending',
  admin_note TEXT,
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for anon on subscription_orders'
  ) THEN
    CREATE POLICY "Allow all for anon on subscription_orders" ON subscription_orders
    FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'stores', 'products', 'customers', 'orders', 'invoices',
    'expenses', 'employees', 'suppliers', 'accounts', 'journal_entries',
    'purchase_orders', 'stock_movements', 'shipments', 'returns',
    'installments', 'notifications', 'warehouses', 'team_members', 'activity_log'
  ])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for anon on ' || tbl
    ) THEN
      EXECUTE format('CREATE POLICY "Allow all for anon on %I" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END IF;
  END LOOP;
END $$;

INSERT INTO stores (id, name, owner_name, owner_email)
VALUES ('store-001', 'StockFlow', 'Admin', 'admin@stockflow.com')
ON CONFLICT (id) DO NOTHING;
