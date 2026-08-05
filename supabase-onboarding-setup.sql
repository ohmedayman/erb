-- Add onboarding columns to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'retail';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS team_size TEXT DEFAULT 'solo';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY['products','orders','invoices','customers','inventory'];
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shipping_enabled BOOLEAN DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS installments_enabled BOOLEAN DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT false;

-- Ensure RLS is enabled
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Ensure RLS policy exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for anon on stores'
  ) THEN
    CREATE POLICY "Allow all for anon on stores" ON stores
    FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
