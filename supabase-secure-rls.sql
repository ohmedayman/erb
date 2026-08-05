-- ============================================
-- SECURE RLS POLICIES
-- Each user can only access their own store's data
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. registered_users — users can read their own record, admins read all
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on registered_users" ON registered_users;
DROP POLICY IF EXISTS "Allow all for anon on registered_users" ON registered_users;

CREATE POLICY "Users read own record" ON registered_users
  FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY "Users insert own record" ON registered_users
  FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users update own record" ON registered_users
  FOR UPDATE USING (id = auth.uid()::text);

-- ============================================
-- 2. stores — owner can CRUD their own store
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on stores" ON stores;
DROP POLICY IF EXISTS "Allow all for anon on stores" ON stores;

CREATE POLICY "Owner read own store" ON stores
  FOR SELECT USING (id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Owner insert own store" ON stores
  FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Owner update own store" ON stores
  FOR UPDATE USING (id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ============================================
-- 3. products — store owner can CRUD their products
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on products" ON products;
DROP POLICY IF EXISTS "Allow all for anon on products" ON products;

CREATE POLICY "Store owner read products" ON products
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner insert products" ON products
  FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner update products" ON products
  FOR UPDATE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner delete products" ON products
  FOR DELETE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

-- ============================================
-- 4. orders
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on orders" ON orders;
DROP POLICY IF EXISTS "Allow all for anon on orders" ON orders;

CREATE POLICY "Store owner read orders" ON orders
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner insert orders" ON orders
  FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner update orders" ON orders
  FOR UPDATE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner delete orders" ON orders
  FOR DELETE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

-- ============================================
-- 5. invoices
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on invoices" ON invoices;
DROP POLICY IF EXISTS "Allow all for anon on invoices" ON invoices;

CREATE POLICY "Store owner read invoices" ON invoices
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner insert invoices" ON invoices
  FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner update invoices" ON invoices
  FOR UPDATE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner delete invoices" ON invoices
  FOR DELETE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

-- ============================================
-- 6. customers
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on customers" ON customers;
DROP POLICY IF EXISTS "Allow all for anon on customers" ON customers;

CREATE POLICY "Store owner read customers" ON customers
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner insert customers" ON customers
  FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner update customers" ON customers
  FOR UPDATE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner delete customers" ON customers
  FOR DELETE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

-- ============================================
-- 7. expenses
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow all for anon on expenses" ON expenses;

CREATE POLICY "Store owner read expenses" ON expenses
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner insert expenses" ON expenses
  FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner update expenses" ON expenses
  FOR UPDATE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner delete expenses" ON expenses
  FOR DELETE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

-- ============================================
-- 8. employees
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on employees" ON employees;
DROP POLICY IF EXISTS "Allow all for anon on employees" ON employees;

CREATE POLICY "Store owner read employees" ON employees
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner insert employees" ON employees
  FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner update employees" ON employees
  FOR UPDATE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner delete employees" ON employees
  FOR DELETE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

-- ============================================
-- 9. notifications
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all for anon on notifications" ON notifications;

CREATE POLICY "Store owner read notifications" ON notifications
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
    OR user_id = auth.uid()::text
  );

CREATE POLICY "Store owner insert notifications" ON notifications
  FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
    OR user_id = auth.uid()::text
  );

CREATE POLICY "Store owner update notifications" ON notifications
  FOR UPDATE USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
    OR user_id = auth.uid()::text
  );

-- ============================================
-- 10. activity_log
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on activity_log" ON activity_log;
DROP POLICY IF EXISTS "Allow all for anon on activity_log" ON activity_log;

CREATE POLICY "Store owner read activity_log" ON activity_log
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

CREATE POLICY "Store owner insert activity_log" ON activity_log
  FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE id = auth.uid()::text OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    OR store_id = auth.uid()::text
  );

-- ============================================
-- 11. subscription_orders
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on subscription_orders" ON subscription_orders;
DROP POLICY IF EXISTS "Allow all for anon on subscription_orders" ON subscription_orders;

CREATE POLICY "User read own subscriptions" ON subscription_orders
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "User insert own subscriptions" ON subscription_orders
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "User update own subscriptions" ON subscription_orders
  FOR UPDATE USING (user_id = auth.uid()::text);

-- ============================================
-- 12. subscription_plans — public read only
-- ============================================
DROP POLICY IF EXISTS "Allow all for everyone on subscription_plans" ON subscription_plans;
DROP POLICY IF EXISTS "Allow all for anon on subscription_plans" ON subscription_plans;

CREATE POLICY "Anyone can read plans" ON subscription_plans
  FOR SELECT USING (true);

-- ============================================
-- 13. Storage bucket policies
-- ============================================
-- product-images bucket
DROP POLICY IF EXISTS "Public read for product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload for product images" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload for product images" ON storage.objects;

CREATE POLICY "Public read for product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated upload for product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
