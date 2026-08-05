-- ============================================
-- StockFlow Database Schema for Supabase
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. stores (المتاجر)
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  owner_name TEXT,
  owner_email TEXT,
  phone TEXT,
  address TEXT,
  currency TEXT DEFAULT 'EGP',
  tax_rate DECIMAL(5,2) DEFAULT 15.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. products (المنتجات)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  category TEXT,
  description TEXT,
  price DECIMAL(12,2) DEFAULT 0,
  cost_price DECIMAL(12,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  status TEXT DEFAULT 'Active',
  store_id TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. customers (الزبائن)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  type TEXT DEFAULT 'individual',
  balance DECIMAL(12,2) DEFAULT 0,
  store_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. orders (الأوردرات)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT,
  customer_name TEXT,
  customer_id TEXT,
  items INTEGER DEFAULT 1,
  total DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  payment TEXT DEFAULT 'Pending',
  notes TEXT,
  store_id TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. invoices (الفواتير)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_number TEXT,
  customer_name TEXT,
  customer_id TEXT,
  items JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'Unpaid',
  payment_status TEXT DEFAULT 'Unpaid',
  paid_amount DECIMAL(12,2) DEFAULT 0,
  due_date TIMESTAMPTZ,
  notes TEXT,
  store_id TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. expenses (المصروفات)
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  category TEXT,
  payment_method TEXT DEFAULT 'Cash',
  receipt_url TEXT,
  notes TEXT,
  store_id TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. employees (الموظفين)
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  phone TEXT,
  email TEXT,
  salary DECIMAL(12,2) DEFAULT 0,
  hire_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Active',
  store_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. suppliers (الموردين)
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  contact_person TEXT,
  balance DECIMAL(12,2) DEFAULT 0,
  store_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. accounts (الحسابات العامة)
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT,
  code TEXT,
  balance DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  store_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. journal_entries (القيود اليومية)
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  entry_number TEXT,
  description TEXT,
  debit_account TEXT,
  credit_account TEXT,
  amount DECIMAL(12,2) DEFAULT 0,
  reference TEXT,
  store_id TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. purchase_orders (أوردرات الشراء)
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT,
  supplier_name TEXT,
  supplier_id TEXT,
  items JSONB DEFAULT '[]',
  total DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  notes TEXT,
  store_id TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. stock_movements (حركات المخزون)
-- ============================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT,
  product_name TEXT,
  type TEXT,
  quantity INTEGER DEFAULT 0,
  from_location TEXT,
  to_location TEXT,
  notes TEXT,
  store_id TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. shipments (الشحن)
-- ============================================
CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT,
  order_number TEXT,
  carrier TEXT,
  tracking_number TEXT,
  status TEXT DEFAULT 'Pending',
  estimated_delivery TIMESTAMPTZ,
  notes TEXT,
  store_id TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. returns (المرتجعات)
-- ============================================
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT,
  order_number TEXT,
  customer_name TEXT,
  product_name TEXT,
  quantity INTEGER DEFAULT 1,
  reason TEXT,
  status TEXT DEFAULT 'Pending',
  refund_amount DECIMAL(12,2) DEFAULT 0,
  store_id TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 15. installments (الأقساط)
-- ============================================
CREATE TABLE IF NOT EXISTS installments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_name TEXT,
  customer_id TEXT,
  total_amount DECIMAL(12,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  remaining_amount DECIMAL(12,2) DEFAULT 0,
  installment_count INTEGER DEFAULT 1,
  installment_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'Active',
  notes TEXT,
  store_id TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 16. notifications (الإشعارات)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  store_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 17. warehouses (المستودعات)
-- ============================================
CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  location TEXT,
  manager TEXT,
  capacity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active',
  store_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 18. team_members (أعضاء الفريق)
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  status TEXT DEFAULT 'Active',
  store_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 19. activity_log (سجل النشاطات)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  user_name TEXT,
  store_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
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

-- ============================================
-- RLS Policies - Allow all for authenticated users
-- ============================================
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
    -- Allow anonymous read access (for development)
    EXECUTE format('
      CREATE POLICY "Allow all for anon on %I" ON %I
      FOR ALL
      USING (true)
      WITH CHECK (true)
    ', tbl, tbl);
  END LOOP;
END $$;

-- ============================================
-- Insert default store
-- ============================================
INSERT INTO stores (id, name, owner_name, owner_email)
VALUES ('store-001', 'المتجر الرئيسي', 'مدير النظام', 'admin@stockflow.com')
ON CONFLICT (id) DO NOTHING;
