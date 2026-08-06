-- ============================================
-- StockFlow Enterprise Security - RLS Policies
-- انسخ الكود ده كله والصقه في Supabase → SQL Editor → Run
-- ============================================

-- ============================================
-- Helper functions في public schema
-- ============================================

-- get current user ID from JWT
CREATE OR REPLACE FUNCTION public.get_user_id() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'userId',
    ''
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- get current user email from JWT
CREATE OR REPLACE FUNCTION public.get_user_email() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    ''
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT public.get_user_email() IN (
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
  FOR SELECT USING (id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own store" ON stores;
CREATE POLICY "Users can update own store" ON stores
  FOR UPDATE USING (id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own store" ON stores;
CREATE POLICY "Users can insert own store" ON stores
  FOR INSERT WITH CHECK (id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 2. products (المنتجات)
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own products" ON products;
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own products" ON products;
CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own products" ON products;
CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own products" ON products;
CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 3. customers (الزبائن)
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own customers" ON customers;
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own customers" ON customers;
CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own customers" ON customers;
CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 4. orders (الأوردرات)
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own orders" ON orders;
CREATE POLICY "Users can delete own orders" ON orders
  FOR DELETE USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 5. invoices (الفواتير)
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 6. expenses (المصروفات)
-- ============================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 7. employees (الموظفين)
-- ============================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own employees" ON employees;
CREATE POLICY "Users can view own employees" ON employees
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own employees" ON employees;
CREATE POLICY "Users can insert own employees" ON employees
  FOR INSERT WITH CHECK (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own employees" ON employees;
CREATE POLICY "Users can update own employees" ON employees
  FOR UPDATE USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own employees" ON employees;
CREATE POLICY "Users can delete own employees" ON employees
  FOR DELETE USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 8. suppliers (الموردين)
-- ============================================
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own suppliers" ON suppliers;
CREATE POLICY "Users can view own suppliers" ON suppliers
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own suppliers" ON suppliers;
CREATE POLICY "Users can insert own suppliers" ON suppliers
  FOR INSERT WITH CHECK (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
CREATE POLICY "Users can update own suppliers" ON suppliers
  FOR UPDATE USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;
CREATE POLICY "Users can delete own suppliers" ON suppliers
  FOR DELETE USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 9. accounts (الحسابات العامة)
-- ============================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own accounts" ON accounts;
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 10. journal_entries (القيود اليومية)
-- ============================================
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own journal_entries" ON journal_entries;
CREATE POLICY "Users can view own journal_entries" ON journal_entries
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own journal_entries" ON journal_entries;
CREATE POLICY "Users can manage own journal_entries" ON journal_entries
  FOR ALL USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 11. purchase_orders (أوردرات الشراء)
-- ============================================
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchase_orders" ON purchase_orders;
CREATE POLICY "Users can view own purchase_orders" ON purchase_orders
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own purchase_orders" ON purchase_orders;
CREATE POLICY "Users can manage own purchase_orders" ON purchase_orders
  FOR ALL USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 12. stock_movements (حركات المخزون)
-- ============================================
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stock_movements" ON stock_movements;
CREATE POLICY "Users can view own stock_movements" ON stock_movements
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own stock_movements" ON stock_movements;
CREATE POLICY "Users can manage own stock_movements" ON stock_movements
  FOR ALL USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 13. shipments (الشحن)
-- ============================================
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own shipments" ON shipments;
CREATE POLICY "Users can view own shipments" ON shipments
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own shipments" ON shipments;
CREATE POLICY "Users can manage own shipments" ON shipments
  FOR ALL USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 14. returns (المرتجعات)
-- ============================================
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own returns" ON returns;
CREATE POLICY "Users can view own returns" ON returns
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own returns" ON returns;
CREATE POLICY "Users can manage own returns" ON returns
  FOR ALL USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 15. installments (الأقساط)
-- ============================================
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own installments" ON installments;
CREATE POLICY "Users can view own installments" ON installments
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own installments" ON installments;
CREATE POLICY "Users can manage own installments" ON installments
  FOR ALL USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 16. notifications (الإشعارات)
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 17. warehouses (المستودعات)
-- ============================================
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own warehouses" ON warehouses;
CREATE POLICY "Users can view own warehouses" ON warehouses
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own warehouses" ON warehouses;
CREATE POLICY "Users can manage own warehouses" ON warehouses
  FOR ALL USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 18. team_members (أعضاء الفريق)
-- ============================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own team_members" ON team_members;
CREATE POLICY "Users can view own team_members" ON team_members
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own team_members" ON team_members;
CREATE POLICY "Users can manage own team_members" ON team_members
  FOR ALL USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 19. activity_log (سجل النشاطات)
-- ============================================
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity_log" ON activity_log;
CREATE POLICY "Users can view own activity_log" ON activity_log
  FOR SELECT USING (store_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own activity_log" ON activity_log;
CREATE POLICY "Users can manage own activity_log" ON activity_log
  FOR ALL USING (store_id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 20. subscription_orders (طلبات الاشتراك)
-- ============================================
ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription_orders" ON subscription_orders;
CREATE POLICY "Users can view own subscription_orders" ON subscription_orders
  FOR SELECT USING (user_id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert subscription_orders" ON subscription_orders;
CREATE POLICY "Users can insert subscription_orders" ON subscription_orders
  FOR INSERT WITH CHECK (user_id = public.get_user_id());

DROP POLICY IF EXISTS "Admins can update subscription_orders" ON subscription_orders;
CREATE POLICY "Admins can update subscription_orders" ON subscription_orders
  FOR UPDATE USING (public.is_admin());

-- ============================================
-- 21. registered_users (المستخدمين المسجلين)
-- ============================================
ALTER TABLE registered_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON registered_users;
CREATE POLICY "Users can view own profile" ON registered_users
  FOR SELECT USING (id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON registered_users;
CREATE POLICY "Users can update own profile" ON registered_users
  FOR UPDATE USING (id = public.get_user_id() OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON registered_users;
CREATE POLICY "Users can insert own profile" ON registered_users
  FOR INSERT WITH CHECK (id = public.get_user_id() OR public.is_admin());

-- ============================================
-- 22. user_activity
-- ============================================
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity;

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (user_id = public.get_user_id() OR public.is_admin());

CREATE POLICY "Users can insert own activity" ON user_activity
  FOR INSERT WITH CHECK (user_id = public.get_user_id());

-- ============================================
-- 23. security_audit_log
-- ============================================
DROP POLICY IF EXISTS "Admins can view audit logs" ON security_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON security_audit_log;

ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON security_audit_log
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert audit logs" ON security_audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 24. subscription_plans
-- ============================================
DROP POLICY IF EXISTS "Anyone can view plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON subscription_plans;

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plans" ON subscription_plans
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage plans" ON subscription_plans
  FOR ALL USING (public.is_admin());

-- ============================================
-- شيل policies القديمة
-- ============================================
DROP POLICY IF EXISTS "Allow all for anon on stores" ON stores;
DROP POLICY IF EXISTS "Allow all for authenticated on stores" ON stores;
DROP POLICY IF EXISTS "Allow all for anon on products" ON products;
DROP POLICY IF EXISTS "Allow all for authenticated on products" ON products;
DROP POLICY IF EXISTS "Allow all for anon on customers" ON customers;
DROP POLICY IF EXISTS "Allow all for authenticated on customers" ON customers;
DROP POLICY IF EXISTS "Allow all for anon on orders" ON orders;
DROP POLICY IF EXISTS "Allow all for authenticated on orders" ON orders;
DROP POLICY IF EXISTS "Allow all for anon on invoices" ON invoices;
DROP POLICY IF EXISTS "Allow all for authenticated on invoices" ON invoices;
DROP POLICY IF EXISTS "Allow all for anon on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow all for authenticated on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow all for anon on employees" ON employees;
DROP POLICY IF EXISTS "Allow all for authenticated on employees" ON employees;
DROP POLICY IF EXISTS "Allow all for anon on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow all for authenticated on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow all for anon on accounts" ON accounts;
DROP POLICY IF EXISTS "Allow all for authenticated on accounts" ON accounts;
DROP POLICY IF EXISTS "Allow all for anon on journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Allow all for authenticated on journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Allow all for anon on purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "Allow all for authenticated on purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "Allow all for anon on stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow all for authenticated on stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow all for anon on shipments" ON shipments;
DROP POLICY IF EXISTS "Allow all for authenticated on shipments" ON shipments;
DROP POLICY IF EXISTS "Allow all for anon on returns" ON returns;
DROP POLICY IF EXISTS "Allow all for authenticated on returns" ON returns;
DROP POLICY IF EXISTS "Allow all for anon on installments" ON installments;
DROP POLICY IF EXISTS "Allow all for authenticated on installments" ON installments;
DROP POLICY IF EXISTS "Allow all for anon on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all for authenticated on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all for anon on warehouses" ON warehouses;
DROP POLICY IF EXISTS "Allow all for authenticated on warehouses" ON warehouses;
DROP POLICY IF EXISTS "Allow all for anon on team_members" ON team_members;
DROP POLICY IF EXISTS "Allow all for authenticated on team_members" ON team_members;
DROP POLICY IF EXISTS "Allow all for anon on activity_log" ON activity_log;
DROP POLICY IF EXISTS "Allow all for authenticated on activity_log" ON activity_log;

-- ============================================
-- اتأكد إن كل الجداول عندها RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE registered_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
