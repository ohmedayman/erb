-- Fix registered_users RLS to allow authenticated users too
-- Run this in Supabase SQL Editor

-- Drop old policy
DROP POLICY IF EXISTS "Allow all for anon on registered_users" ON registered_users;

-- Create new policy that allows BOTH anon and authenticated
CREATE POLICY "Allow all for everyone on registered_users" ON registered_users
FOR ALL USING (true) WITH CHECK (true);

-- Also make sure the trigger exists and works
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
