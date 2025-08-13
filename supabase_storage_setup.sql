-- Supabase Storage 버킷 생성 스크립트
-- 실행 날짜: 2025-01-13

-- ================================================
-- 이 스크립트는 Supabase 대시보드의 Storage 섹션에서
-- 직접 버킷을 생성하거나, SQL Editor를 통해 실행할 수 있습니다.
-- ================================================

-- 1. Storage 버킷 생성 (Supabase 대시보드 > Storage에서 실행)
-- - 버킷 이름: church-logos
-- - Public 버킷: Yes (체크)
-- - File size limit: 500KB
-- - Allowed MIME types: image/jpeg, image/png, image/webp

-- 2. RLS (Row Level Security) 정책 설정
-- 아래 SQL은 Supabase SQL Editor에서 실행

-- 교회 로고 버킷에 대한 정책
-- 모든 사용자가 로고를 볼 수 있도록 허용
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
    'Public Access',
    'church-logos',
    '{"Select": {"expression": "true"}}'
) ON CONFLICT DO NOTHING;

-- 인증된 사용자만 업로드/수정/삭제 가능
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
    'Authenticated users can upload',
    'church-logos',
    '{"Insert": {"expression": "auth.role() = ''authenticated''"}}'
) ON CONFLICT DO NOTHING;

INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
    'Authenticated users can update',
    'church-logos',
    '{"Update": {"expression": "auth.role() = ''authenticated''"}}'
) ON CONFLICT DO NOTHING;

INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
    'Authenticated users can delete',
    'church-logos',
    '{"Delete": {"expression": "auth.role() = ''authenticated''"}}'
) ON CONFLICT DO NOTHING;

-- 3. 버킷 생성 (프로그래밍 방식 - 선택사항)
-- 주의: 이 방법은 Supabase의 버전에 따라 작동하지 않을 수 있습니다.
-- 대신 Supabase 대시보드에서 수동으로 버킷을 생성하는 것을 권장합니다.

/*
-- 버킷이 없으면 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('church-logos', 'church-logos', true)
ON CONFLICT (id) DO NOTHING;
*/

-- 4. 확인 쿼리
-- 버킷이 제대로 생성되었는지 확인
SELECT * FROM storage.buckets WHERE id = 'church-logos';

-- 정책이 제대로 설정되었는지 확인
SELECT * FROM storage.policies WHERE bucket_id = 'church-logos';
