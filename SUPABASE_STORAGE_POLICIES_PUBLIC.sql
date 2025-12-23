-- ============================================
-- Supabase Storage Policies cho Bucket 'products'
-- Cho phép mọi người dùng (public) thêm, sửa, xóa ảnh
-- ============================================

-- Xóa các policies cũ nếu có
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- Policy 1: Cho phép PUBLIC upload file (INSERT)
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');

-- Policy 2: Cho phép PUBLIC đọc file (SELECT)
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Policy 3: Cho phép PUBLIC sửa file (UPDATE)
CREATE POLICY "Allow public update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Policy 4: Cho phép PUBLIC xóa file (DELETE)
CREATE POLICY "Allow public delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'products');

-- ============================================
-- Kiểm tra policies đã được tạo
-- ============================================
-- Chạy query sau để xem tất cả policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

