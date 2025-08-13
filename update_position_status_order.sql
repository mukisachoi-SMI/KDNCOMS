-- ============================================
-- 직분 상태 순서 변경 스크립트
-- 시무(1) → 청년(2) → 은퇴(3) → 협동(4) → 원로(5) → 직원(6)
-- ============================================

-- 1. 현재 모든 교회의 직분 상태 확인
-- ============================================
SELECT 
    c.church_name as "교회명",
    ps.status_id as "상태ID",
    ps.status_name as "직분상태",
    ps.status_code as "코드",
    ps.sort_order as "현재순서"
FROM position_statuses ps
JOIN churches c ON ps.church_id = c.church_id
ORDER BY c.church_name, ps.sort_order;

-- 2. 모든 교회의 직분 상태 순서 일괄 업데이트
-- ============================================
-- 시무 → 1번
UPDATE position_statuses 
SET sort_order = 1 
WHERE status_code = 'ACTIVE';

-- 청년 → 2번
UPDATE position_statuses 
SET sort_order = 2 
WHERE status_code = 'YOUNG';

-- 은퇴 → 3번
UPDATE position_statuses 
SET sort_order = 3 
WHERE status_code = 'RETIRED';

-- 협동 → 4번
UPDATE position_statuses 
SET sort_order = 4 
WHERE status_code = 'ASSOCIATE';

-- 원로 → 5번
UPDATE position_statuses 
SET sort_order = 5 
WHERE status_code = 'EMERITUS';

-- 직원 → 6번
UPDATE position_statuses 
SET sort_order = 6 
WHERE status_code = 'STAFF';

-- 3. 업데이트 결과 확인
-- ============================================
SELECT 
    c.church_name as "교회명",
    ps.sort_order as "순서",
    ps.status_name as "직분상태",
    ps.status_code as "코드",
    ps.status_id as "상태ID"
FROM position_statuses ps
JOIN churches c ON ps.church_id = c.church_id
ORDER BY c.church_name, ps.sort_order;

-- 4. 특정 교회만 확인하고 싶을 때
-- ============================================
/*
SELECT 
    sort_order as "순서",
    status_name as "직분상태",
    status_code as "코드",
    status_id as "ID"
FROM position_statuses 
WHERE church_id = (SELECT church_id FROM churches WHERE church_name = '여기에_교회이름')
ORDER BY sort_order;
*/

-- 5. 청년 상태가 없는 교회에 추가
-- ============================================
-- 먼저 청년이 없는 교회 확인
SELECT DISTINCT c.church_id, c.church_name
FROM churches c
WHERE NOT EXISTS (
    SELECT 1 FROM position_statuses ps 
    WHERE ps.church_id = c.church_id 
    AND ps.status_code = 'YOUNG'
);

-- 청년이 없는 교회에 청년 추가
INSERT INTO position_statuses (church_id, status_name, status_code, sort_order, is_active)
SELECT 
    c.church_id,
    '청년' as status_name,
    'YOUNG' as status_code,
    2 as sort_order,
    true as is_active
FROM churches c
WHERE NOT EXISTS (
    SELECT 1 FROM position_statuses ps 
    WHERE ps.church_id = c.church_id 
    AND ps.status_code = 'YOUNG'
);

-- 6. status_id 형식이 다른 경우 (ch2025001_status_001 형태)
-- ============================================
-- 만약 status_id가 특정 형식이면 아래 사용
/*
-- 시무 (ch2025001_status_001 형태)
UPDATE position_statuses 
SET sort_order = 1 
WHERE status_id LIKE '%_status_001';

-- 청년 (새로 추가되었거나 _status_006 형태)
UPDATE position_statuses 
SET sort_order = 2 
WHERE status_code = 'YOUNG' OR status_id LIKE '%_status_006';

-- 은퇴 (ch2025001_status_002 형태)
UPDATE position_statuses 
SET sort_order = 3 
WHERE status_id LIKE '%_status_002';

-- 협동 (ch2025001_status_003 형태)
UPDATE position_statuses 
SET sort_order = 4 
WHERE status_id LIKE '%_status_003';

-- 원로 (ch2025001_status_004 형태)
UPDATE position_statuses 
SET sort_order = 5 
WHERE status_id LIKE '%_status_004';

-- 직원 (ch2025001_status_005 형태)
UPDATE position_statuses 
SET sort_order = 6 
WHERE status_id LIKE '%_status_005';
*/

-- 7. 최종 검증
-- ============================================
-- 모든 교회가 올바른 순서인지 확인
SELECT 
    c.church_name as "교회",
    STRING_AGG(
        ps.sort_order || '.' || ps.status_name, 
        ' → ' ORDER BY ps.sort_order
    ) as "직분상태순서"
FROM position_statuses ps
JOIN churches c ON ps.church_id = c.church_id
GROUP BY c.church_id, c.church_name
ORDER BY c.church_name;

-- 예상 결과: 1.시무 → 2.청년 → 3.은퇴 → 4.협동 → 5.원로 → 6.직원