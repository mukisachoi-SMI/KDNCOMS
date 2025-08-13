-- ============================================
-- 직분 상태 순서 수정 및 청년 상태 추가
-- ============================================

-- 1. 모든 교회의 직분 상태 순서를 올바르게 업데이트
UPDATE position_statuses 
SET sort_order = CASE 
    WHEN status_code = 'ACTIVE' THEN 1      -- 시무
    WHEN status_code = 'YOUNG' THEN 2       -- 청년 (새로 추가)
    WHEN status_code = 'RETIRED' THEN 3     -- 은퇴
    WHEN status_code = 'ASSOCIATE' THEN 4   -- 협동
    WHEN status_code = 'EMERITUS' THEN 5    -- 원로
    WHEN status_code = 'STAFF' THEN 6       -- 직원
    ELSE sort_order
END,
updated_at = NOW();

-- 2. 청년 상태가 없는 교회에 추가
INSERT INTO position_statuses (church_id, status_name, status_code, is_active, sort_order)
SELECT DISTINCT church_id, '청년', 'YOUNG', true, 2
FROM position_statuses
WHERE church_id NOT IN (
    SELECT church_id FROM position_statuses WHERE status_code = 'YOUNG'
)
ON CONFLICT (church_id, status_code) DO NOTHING;

-- 3. 확인 쿼리
SELECT 
    church_id,
    status_name,
    status_code,
    sort_order,
    is_active
FROM position_statuses
ORDER BY church_id, sort_order;
