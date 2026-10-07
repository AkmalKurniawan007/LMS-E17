-- 1. Buat bucket penyimpan gambar bukti bayar
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'payment-proofs', 
  'payment-proofs', 
  false, 
  5242880, -- limit 5MB
  '{image/png, image/jpeg, application/pdf}'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Izinkan pembeli (yang sudah login) untuk mengunggah gambar ke bucket ini
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

-- 3. Izinkan pembeli untuk membaca/melihat gambarnya
CREATE POLICY "Allow authenticated view"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-proofs');
