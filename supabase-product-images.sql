-- Create storage bucket for product images
-- Run this in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read for product images'
  ) THEN
    CREATE POLICY "Public read for product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');
  END IF;
END $$;

-- Allow authenticated users to upload
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated upload for product images'
  ) THEN
    CREATE POLICY "Authenticated upload for product images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

-- Allow anyone to upload (for anon users during signup)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anon upload for product images'
  ) THEN
    CREATE POLICY "Anon upload for product images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;
