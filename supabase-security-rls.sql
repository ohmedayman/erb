-- ============================================
-- StockFlow Enterprise Security - RLS Policies
-- Complete Row Level Security for ALL tables
-- ============================================

-- ============================================
-- Helper function: get current user ID
-- ============================================
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'userId',
    ''
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- Helper function: get current user email
-- ============================================
CREATE OR REPLACE FUNCTION auth.user_email() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    ''
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- Helper function: check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION auth.is_admin() RETURNS BOOLEAN AS $$
  SELECT auth.user_email() IN (
    'admin@stockflow.com',
    'm44408335@gmail.com',
    'admin@stockflow.vexonet.online'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 1. stores (المتاجر)
-- ============================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own store" ON stores;
CREATE POLICY "Users can view own store" ON stores
  FOR SELECT USING (
    id = auth.user_id() OR auth.is_admin()
  );

DROP POLICY IF EXISTS "Users can update own store" ON stores;
CREATE POLICY "Users can update own store" ON stores
  FOR UPDATE USING (
    id = auth.user_id() OR auth.is_admin()
  );

DROP POLICY IF EXISTS "Users can insert own store" ON stores;
CREATE POLICY "Users can insert own store" ON stores
  FOR INSERT WITH CHECK (
    id = auth.user_id() OR auth.is_admin()
  );

-- ============================================
-- 2. products (المنتجات)
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own products" ON products;
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (
    store_id = auth.user_id() OR auth.is_admin()
  );

DROP POLICY IF EXISTS "Users can insert own products" ON products;
CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (
    store_id = auth.user_id() OR auth.is_admin()
  );

DROP POLICY IF EXISTS "Users can update own products" ON products;
CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (
    store_id = auth.user_id() OR auth.is_admin()
  );

DROP POLICY IF EXISTS "Users can delete own products" ON products;
CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (
    store_id = auth.user_id() OR auth.is_admin()
  );

-- ============================================
-- 3. customers (الزبائن)
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own customers" ON customers;
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can update own customers" ON customers;
CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can delete own customers" ON customers;
CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 4. orders (الأوردرات)
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can delete own orders" ON orders;
CREATE POLICY "Users can delete own orders" ON orders
  FOR DELETE USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 5. invoices (الفواتير)
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 6. expenses (المصروفات)
-- ============================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 7. employees (الموظفين)
-- ============================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own employees" ON employees;
CREATE POLICY "Users can view own employees" ON employees
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can insert own employees" ON employees;
CREATE POLICY "Users can insert own employees" ON employees
  FOR INSERT WITH CHECK (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can update own employees" ON employees;
CREATE POLICY "Users can update own employees" ON employees
  FOR UPDATE USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can delete own employees" ON employees;
CREATE POLICY "Users can delete own employees" ON employees
  FOR DELETE USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 8. suppliers (الموردين)
-- ============================================
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own suppliers" ON suppliers;
CREATE POLICY "Users can view own suppliers" ON suppliers
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can insert own suppliers" ON suppliers;
CREATE POLICY "Users can insert own suppliers" ON suppliers
  FOR INSERT WITH CHECK (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
CREATE POLICY "Users can update own suppliers" ON suppliers
  FOR UPDATE USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;
CREATE POLICY "Users can delete own suppliers" ON suppliers
  FOR DELETE USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 9. accounts (الحسابات العامة)
-- ============================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can manage own accounts" ON accounts;
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 10. journal_entries (القيود اليومية)
-- ============================================
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own journal_entries" ON journal_entries;
CREATE POLICY "Users can view own journal_entries" ON journal_entries
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can manage own journal_entries" ON journal_entries;
CREATE POLICY "Users can manage own journal_entries" ON journal_entries
  FOR ALL USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 11. purchase_orders (أوردرات الشراء)
-- ============================================
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchase_orders" ON purchase_orders;
CREATE POLICY "Users can view own purchase_orders" ON purchase_orders
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can manage own purchase_orders" ON purchase_orders;
CREATE POLICY "Users can manage own purchase_orders" ON purchase_orders
  FOR ALL USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 12. stock_movements (حركات المخزون)
-- ============================================
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stock_movements" ON stock_movements;
CREATE POLICY "Users can view own stock_movements" ON stock_movements
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can manage own stock_movements" ON stock_movements;
CREATE POLICY "Users can manage own stock_movements" ON stock_movements
  FOR ALL USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 13. shipments (الشحن)
-- ============================================
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own shipments" ON shipments;
CREATE POLICY "Users can view own shipments" ON shipments
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can manage own shipments" ON shipments;
CREATE POLICY "Users can manage own shipments" ON shipments
  FOR ALL USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 14. returns (المرتجعات)
-- ============================================
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own returns" ON returns;
CREATE POLICY "Users can view own returns" ON returns
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can manage own returns" ON returns;
CREATE POLICY "Users can manage own returns" ON returns
  FOR ALL USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 15. installments (الأقساط)
-- ============================================
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own installments" ON installments;
CREATE POLICY "Users can view own installments" ON installments
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can manage own installments" ON installments;
CREATE POLICY "Users can manage own installments" ON installments
  FOR ALL USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 16. notifications (الإشعارات)
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 17. warehouses (المستودعات)
-- ============================================
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own warehouses" ON warehouses;
CREATE POLICY "Users can view own warehouses" ON warehouses
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can manage own warehouses" ON warehouses;
CREATE POLICY "Users can manage own warehouses" ON warehouses
  FOR ALL USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 18. team_members (أعضاء الفريق)
-- ============================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own team_members" ON team_members;
CREATE POLICY "Users can view own team_members" ON team_members
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can manage own team_members" ON team_members;
CREATE POLICY "Users can manage own team_members" ON team_members
  FOR ALL USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 19. activity_log (سجل النشاطات)
-- ============================================
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity_log" ON activity_log;
CREATE POLICY "Users can view own activity_log" ON activity_log
  FOR SELECT USING (store_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can manage own activity_log" ON activity_log;
CREATE POLICY "Users can manage own activity_log" ON activity_log
  FOR ALL USING (store_id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 20. subscription_orders (طلبات الاشتراك)
-- ============================================
ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription_orders" ON subscription_orders;
CREATE POLICY "Users can view own subscription_orders" ON subscription_orders
  FOR SELECT USING (user_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can insert subscription_orders" ON subscription_orders;
CREATE POLICY "Users can insert subscription_orders" ON subscription_orders
  FOR INSERT WITH CHECK (user_id = auth.user_id());

DROP POLICY IF EXISTS "Admins can update subscription_orders" ON subscription_orders;
CREATE POLICY "Admins can update subscription_orders" ON subscription_orders
  FOR UPDATE USING (auth.is_admin());

-- ============================================
-- 21. registered_users (المستخدمين المسجلين)
-- ============================================
ALTER TABLE registered_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON registered_users;
CREATE POLICY "Users can view own profile" ON registered_users
  FOR SELECT USING (id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON registered_users;
CREATE POLICY "Users can update own profile" ON registered_users
  FOR UPDATE USING (id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON registered_users;
CREATE POLICY "Users can insert own profile" ON registered_users
  FOR INSERT WITH CHECK (id = auth.user_id() OR auth.is_admin());

-- ============================================
-- 22. user_activity (نشاطات المستخدمين)
-- ============================================
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity" ON user_activity;
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (user_id = auth.user_id() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity;
CREATE POLICY "Users can insert own activity" ON user_activity
  FOR INSERT WITH CHECK (user_id = auth.user_id());

-- ============================================
-- 23. security_audit_log (سجل الأمان)
-- ============================================
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON security_audit_log;
CREATE POLICY "Admins can view audit logs" ON security_audit_log
  FOR SELECT USING (auth.is_admin());

DROP POLICY IF EXISTS "System can insert audit logs" ON security_audit_log;
CREATE POLICY "System can insert audit logs" ON security_audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 24. subscription_plans (خطط الاشتراك)
-- ============================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view plans" ON subscription_plans;
CREATE POLICY "Anyone can view plans" ON subscription_plans
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage plans" ON subscription_plans;
CREATE POLICY "Admins can manage plans" ON subscription_plans
  FOR ALL USING (auth.is_admin());

-- ============================================
-- 25. products (storage policies)
-- ============================================
-- These are already in supabase-product-images.sql
-- But let's add authenticated-only policies

-- ============================================
-- Disable anonymous access for all tables
-- ============================================
-- The current setup allows anonymous access via "Allow all for anon"
-- We need to REMOVE those policies and rely on authenticated-only

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'stores', 'products', 'customers', 'orders', 'invoices',
    'expenses', 'employees', 'suppliers', 'accounts', 'journal_entries',
    'purchase_orders', 'stock_movements', 'shipments', 'returns',
    'installments', 'notifications', 'warehouses', 'team_members', 'activity_log'
  ])
  LOOP
    -- Drop the permissive anon policies
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for anon on %I" ON %I', tbl, tbl);
  END LOOP;
END $$;
