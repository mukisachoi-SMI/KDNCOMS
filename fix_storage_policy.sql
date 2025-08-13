-- =============================================
-- Storage RLS 정책 설정 (즉시 실행용)
-- 이 SQL을 Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. 기존 정책 모두 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- 2. 새로운 정책 생성 (가장 간단한 설정 - 모든 권한 허용)

-- 모든 사용자가 읽기 가능
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'church-logos');

-- 모든 사용자가 업로드 가능
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'church-logos');

-- 모든 사용자가 수정 가능
CREATE POLICY "Allow public update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'church-logos')
WITH CHECK (bucket_id = 'church-logos');

-- 모든 사용자가 삭제 가능
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'church-logos');

-- 3. 정책이 제대로 생성되었는지 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 4. 버킷 상태 확인
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'church-logos';
