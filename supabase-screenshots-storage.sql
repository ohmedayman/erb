-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage
-- Anyone can upload (authenticated users)
CREATE POLICY "Authenticated users can upload screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-screenshots'
  AND auth.uid() IS NOT NULL
);

-- Anyone can view screenshots (public bucket)
CREATE POLICY "Public can view screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-screenshots');

-- Users can delete their own screenshots
CREATE POLICY "Users can delete own screenshots"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'payment-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
