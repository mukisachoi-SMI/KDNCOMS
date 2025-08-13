-- ============================================
-- 교회 헌금관리시스템 - 즉시 수정 스크립트
-- 실행일: 2025년 1월
-- ============================================
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. 먼저 교회 ID 확인
SELECT church_id, church_name, email FROM churches;

-- 2. 교회 정보 확인 (카카오톡 ID, 전화번호, 주소)
SELECT 
    church_id,
    church_name,
    email,
    church_phone,
    church_address,
    kakao_id
FROM churches;

-- 3. 현재 직분 상태 확인 (순서대로)
SELECT 
    ps.church_id,
    c.church_name,
    ps.status_name,
    ps.status_code,
    ps.sort_order,
    ps.is_active
FROM position_statuses ps
JOIN churches c ON ps.church_id = c.church_id
ORDER BY ps.church_id, ps.sort_order;

-- 4. 직분 상태 순서를 올바르게 수정 (시무-은퇴-협동-원로-직원)
UPDATE position_statuses 
SET 
    sort_order = CASE 
        WHEN status_code = 'ACTIVE' THEN 1      -- 시무
        WHEN status_code = 'RETIRED' THEN 2     -- 은퇴
        WHEN status_code = 'ASSOCIATE' THEN 3   -- 협동
        WHEN status_code = 'EMERITUS' THEN 4    -- 원로
        WHEN status_code = 'STAFF' THEN 5       -- 직원
        WHEN status_code = 'YOUNG' THEN 6       -- 청년 (있다면 맨 뒤로)
        ELSE sort_order
    END,
    updated_at = NOW();

-- 5. 수정 후 확인
SELECT 
    status_name,
    status_code,
    sort_order,
    is_active
FROM position_statuses
WHERE church_id = (SELECT church_id FROM churches LIMIT 1)
ORDER BY sort_order;

-- 6. 헌금 종류 확인
SELECT 
    type_name,
    type_code,
    sort_order,
    is_active
FROM donation_types
WHERE church_id = (SELECT church_id FROM churches LIMIT 1)
ORDER BY sort_order;

-- 7. 직분 목록 확인
SELECT 
    position_name,
    position_code,
    sort_order,
    is_active
FROM positions
WHERE church_id = (SELECT church_id FROM churches LIMIT 1)
ORDER BY sort_order;

-- 8. 교회 정보가 없다면 기본값 추가 (필요시)
-- UPDATE churches 
-- SET 
--     church_phone = '02-1234-5678',
--     church_address = '서울시 강남구 ...',
--     kakao_id = 'church_kakao_id'
-- WHERE church_id = '여기에_교회_ID_입력';

-- 9. 누락된 테이블이 있다면 생성
-- churches 테이블에 컬럼이 없다면 추가
ALTER TABLE churches 
ADD COLUMN IF NOT EXISTS church_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS church_address TEXT,
ADD COLUMN IF NOT EXISTS kakao_id VARCHAR(100);

-- 10. 중복된 직분 상태 제거 (필요시)
-- 먼저 중복 확인
SELECT 
    church_id,
    status_code,
    COUNT(*) as count
FROM position_statuses
GROUP BY church_id, status_code
HAVING COUNT(*) > 1;

-- 중복이 있다면 제거 (sort_order가 큰 것을 삭제)
DELETE FROM position_statuses p1
WHERE EXISTS (
    SELECT 1 
    FROM position_statuses p2 
    WHERE p1.church_id = p2.church_id 
    AND p1.status_code = p2.status_code 
    AND p1.sort_order > p2.sort_order
);
