-- ========================================
-- Supabase Storage 버킷 및 정책 설정
-- 실행 날짜: 2025-01-13
-- ========================================

-- 📌 중요: 이 스크립트는 두 가지 방법으로 실행할 수 있습니다:
-- 1. Supabase 대시보드에서 직접 버킷 생성 (권장)
-- 2. SQL Editor에서 이 스크립트 실행

-- ========================================
-- 방법 1: Supabase 대시보드에서 수동 생성 (권장)
-- ========================================
/*
1. Supabase 대시보드 접속
2. 왼쪽 메뉴에서 "Storage" 클릭
3. "New bucket" 버튼 클릭
4. 다음과 같이 설정:
   - Bucket name: church-logos
   - Public bucket: ✅ (반드시 체크!)
   - File size limit: 500 (KB 단위)
   - Allowed MIME types: image/jpeg,image/png,image/webp
5. "Create bucket" 클릭
*/

-- ========================================
-- 방법 2: SQL로 버킷 생성 (실험적)
-- ========================================
-- 주의: 이 방법은 Supabase 버전에 따라 작동하지 않을 수 있습니다.

-- 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'church-logos',
  'church-logos', 
  true,  -- Public 버킷
  524288, -- 500KB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 524288,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ========================================
-- RLS (Row Level Security) 정책 설정
-- ========================================
-- 이 부분은 SQL Editor에서 실행하세요

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;

-- 1. 모든 사용자가 이미지를 볼 수 있도록 허용 (SELECT)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'church-logos');

-- 2. 모든 사용자가 업로드할 수 있도록 허용 (INSERT)
-- 주의: 실제 운영환경에서는 인증된 사용자만 허용하도록 변경 권장
CREATE POLICY "Anyone can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'church-logos');

-- 3. 모든 사용자가 수정할 수 있도록 허용 (UPDATE)
CREATE POLICY "Anyone can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'church-logos')
WITH CHECK (bucket_id = 'church-logos');

-- 4. 모든 사용자가 삭제할 수 있도록 허용 (DELETE)
CREATE POLICY "Anyone can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'church-logos');

-- ========================================
-- 확인 쿼리
-- ========================================

-- 버킷이 생성되었는지 확인
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'church-logos';

-- 정책이 설정되었는지 확인
SELECT name, definition 
FROM storage.policies 
WHERE bucket_id = 'church-logos';

-- ========================================
-- 문제 해결
-- ========================================
/*
1. "버킷을 찾을 수 없음" 오류:
   - Supabase 대시보드에서 Storage 섹션 확인
   - church-logos 버킷이 있는지 확인
   - 없다면 위의 방법 1을 따라 생성

2. "권한 오류" 또는 "Policy violation" 오류:
   - 버킷이 Public으로 설정되어 있는지 확인
   - RLS 정책이 제대로 설정되어 있는지 확인
   - 위의 RLS 정책 SQL을 다시 실행

3. "파일 크기 초과" 오류:
   - 이미지가 500KB 이하인지 확인
   - 필요시 file_size_limit을 늘려서 재생성

4. "지원하지 않는 파일 형식" 오류:
   - JPG, PNG, WebP 형식만 지원
   - 다른 형식 필요시 allowed_mime_types 수정
*/

-- ========================================
-- 인증 기반 정책 (선택사항 - 보안 강화)
-- ========================================
/*
-- 더 안전한 정책을 원한다면 아래 SQL을 사용하세요:

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'church-logos' 
  AND auth.role() = 'authenticated'
);

-- 인증된 사용자만 수정 가능
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'church-logos' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'church-logos' 
  AND auth.role() = 'authenticated'
);

-- 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'church-logos' 
  AND auth.role() = 'authenticated'
);
*/
