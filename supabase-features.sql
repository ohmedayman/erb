-- Add enabled_features column to registered_users for admin feature control
ALTER TABLE registered_users ADD COLUMN IF NOT EXISTS enabled_features TEXT[] DEFAULT ARRAY['products', 'orders', 'customers', 'invoices', 'expenses', 'employees', 'suppliers', 'analytics', 'reports', 'warehouses', 'installments', 'notifications', 'ratings', 'stockMovements', 'team'];
