-- ===================================================================
-- 교회 정보 테이블 업데이트 - 전화번호, 주소, 카카오톡 ID 필드 추가
-- ===================================================================
-- 실행 방법: Supabase SQL Editor에서 실행
-- ===================================================================

-- 1. churches 테이블에 새 필드 추가
ALTER TABLE churches 
ADD COLUMN IF NOT EXISTS church_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS church_address TEXT,
ADD COLUMN IF NOT EXISTS kakao_id VARCHAR(100);

-- 2. 필드에 대한 코멘트 추가
COMMENT ON COLUMN churches.church_phone IS '교회 대표 전화번호';
COMMENT ON COLUMN churches.church_address IS '교회 주소';
COMMENT ON COLUMN churches.kakao_id IS '교회 카카오톡 ID (상담 및 문의용)';

-- 3. 필드 추가 확인
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'churches'
    AND column_name IN ('church_phone', 'church_address', 'kakao_id')
ORDER BY ordinal_position;

-- 4. RLS (Row Level Security) 정책은 기존 정책이 이미 적용되어 있음
-- 새 필드도 자동으로 기존 정책에 포함됨

-- 5. 테스트 데이터 업데이트 (선택사항)
-- UPDATE churches 
-- SET 
--     church_phone = '02-1234-5678',
--     church_address = '서울시 강남구 테헤란로 123',
--     kakao_id = 'church_kakao_id'
-- WHERE church_id = '[YOUR_CHURCH_ID]';

-- ===================================================================
-- 실행 완료 메시지
-- ===================================================================
-- 이 스크립트를 실행하면:
-- 1. churches 테이블에 church_phone, church_address, kakao_id 필드가 추가됩니다.
-- 2. 기존 데이터는 영향을 받지 않으며, 새 필드는 NULL 값으로 초기화됩니다.
-- 3. Settings 화면에서 이 정보들을 입력하고 저장할 수 있습니다.
-- ==================================================================