-- Fix ALL RLS policies to allow both anon and authenticated
-- Run this in Supabase SQL Editor

-- registered_users
DROP POLICY IF EXISTS "Allow all for anon on registered_users" ON registered_users;
DROP POLICY IF EXISTS "Allow all for everyone on registered_users" ON registered_users;
CREATE POLICY "Allow all for everyone on registered_users" ON registered_users
FOR ALL USING (true) WITH CHECK (true);

-- stores
DROP POLICY IF EXISTS "Allow all for anon on stores" ON stores;
CREATE POLICY "Allow all for everyone on stores" ON stores
FOR ALL USING (true) WITH CHECK (true);

-- subscription_orders
DROP POLICY IF EXISTS "Allow all for anon on subscription_orders" ON subscription_orders;
CREATE POLICY "Allow all for everyone on subscription_orders" ON subscription_orders
FOR ALL USING (true) WITH CHECK (true);

-- subscription_plans
DROP POLICY IF EXISTS "Allow all for anon on subscription_plans" ON subscription_plans;
CREATE POLICY "Allow all for everyone on subscription_plans" ON subscription_plans
FOR ALL USING (true) WITH CHECK (true);

-- products
DROP POLICY IF EXISTS "Allow all for anon on products" ON products;
CREATE POLICY "Allow all for everyone on products" ON products
FOR ALL USING (true) WITH CHECK (true);

-- orders
DROP POLICY IF EXISTS "Allow all for anon on orders" ON orders;
CREATE POLICY "Allow all for everyone on orders" ON orders
FOR ALL USING (true) WITH CHECK (true);

-- invoices
DROP POLICY IF EXISTS "Allow all for anon on invoices" ON invoices;
CREATE POLICY "Allow all for everyone on invoices" ON invoices
FOR ALL USING (true) WITH CHECK (true);

-- customers
DROP POLICY IF EXISTS "Allow all for anon on customers" ON customers;
CREATE POLICY "Allow all for everyone on customers" ON customers
FOR ALL USING (true) WITH CHECK (true);

-- expenses
DROP POLICY IF EXISTS "Allow all for anon on expenses" ON expenses;
CREATE POLICY "Allow all for everyone on expenses" ON expenses
FOR ALL USING (true) WITH CHECK (true);

-- employees
DROP POLICY IF EXISTS "Allow all for anon on employees" ON employees;
CREATE POLICY "Allow all for everyone on employees" ON employees
FOR ALL USING (true) WITH CHECK (true);

-- notifications
DROP POLICY IF EXISTS "Allow all for anon on notifications" ON notifications;
CREATE POLICY "Allow all for everyone on notifications" ON notifications
FOR ALL USING (true) WITH CHECK (true);

-- activity_log
DROP POLICY IF EXISTS "Allow all for anon on activity_log" ON activity_log;
CREATE POLICY "Allow all for everyone on activity_log" ON activity_log
FOR ALL USING (true) WITH CHECK (true);
