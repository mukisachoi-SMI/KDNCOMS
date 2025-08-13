-- ============================================
-- 직분 상태 순서 변경 스크립트 (v3.0)
-- 새로운 순서: 시무 → 청년 → 은퇴 → 협동 → 원로 → 직원
-- 실행일: 2025년 1월
-- ============================================
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요
-- 기존 데이터는 모두 보존되며, 순서만 변경됩니다
-- ============================================

-- 1. 백업을 위한 현재 상태 확인 (실행 전 기록용)
SELECT 
    c.church_name,
    ps.status_name,
    ps.status_code,
    ps.sort_order as old_sort_order,
    COUNT(m.member_id) as member_count
FROM position_statuses ps
JOIN churches c ON ps.church_id = c.church_id
LEFT JOIN members m ON ps.status_id = m.position_status_id
GROUP BY c.church_name, ps.status_name, ps.status_code, ps.sort_order
ORDER BY c.church_name, ps.sort_order;

-- 2. 청년 상태가 없는 교회에 먼저 추가
INSERT INTO position_statuses (church_id, status_name, status_code, is_active, sort_order)
SELECT DISTINCT 
    ps.church_id, 
    '청년', 
    'YOUNG', 
    true, 
    99  -- 임시 순서 (나중에 수정됨)
FROM position_statuses ps
WHERE ps.church_id NOT IN (
    SELECT church_id 
    FROM position_statuses 
    WHERE status_code = 'YOUNG'
)
ON CONFLICT (church_id, status_code) DO NOTHING;

-- 3. 직분 상태 순서 업데이트 (새로운 순서)
UPDATE position_statuses 
SET 
    sort_order = CASE 
        WHEN status_code = 'ACTIVE' THEN 1      -- 시무 (1번)
        WHEN status_code = 'YOUNG' THEN 2       -- 청년 (2번) ★변경
        WHEN status_code = 'RETIRED' THEN 3     -- 은퇴 (3번)
        WHEN status_code = 'ASSOCIATE' THEN 4   -- 협동 (4번)
        WHEN status_code = 'EMERITUS' THEN 5    -- 원로 (5번)
        WHEN status_code = 'STAFF' THEN 6       -- 직원 (6번)
        ELSE sort_order
    END,
    updated_at = NOW()
WHERE church_id IN (SELECT church_id FROM churches);

-- 4. 변경 후 상태 확인
SELECT 
    '=== 변경 후 순서 ===' as info,
    c.church_name,
    ps.status_name,
    ps.status_code,
    ps.sort_order as new_sort_order,
    ps.is_active,
    COUNT(m.member_id) as member_count
FROM position_statuses ps
JOIN churches c ON ps.church_id = c.church_id
LEFT JOIN members m ON ps.status_id = m.position_status_id
GROUP BY c.church_name, ps.status_name, ps.status_code, ps.sort_order, ps.is_active
ORDER BY c.church_name, ps.sort_order;

-- 5. 각 직분 상태별 교인 수 통계
SELECT 
    ps.status_name,
    ps.status_code,
    ps.sort_order,
    COUNT(DISTINCT m.member_id) as total_members,
    COUNT(DISTINCT ps.church_id) as church_count
FROM position_statuses ps
LEFT JOIN members m ON ps.status_id = m.position_status_id
GROUP BY ps.status_name, ps.status_code, ps.sort_order
ORDER BY ps.sort_order;

-- 6. 데이터 무결성 확인
SELECT 
    '데이터 무결성 체크' as check_type,
    COUNT(DISTINCT church_id) as total_churches,
    COUNT(CASE WHEN status_code = 'ACTIVE' THEN 1 END) as active_count,
    COUNT(CASE WHEN status_code = 'YOUNG' THEN 1 END) as young_count,
    COUNT(CASE WHEN status_code = 'RETIRED' THEN 1 END) as retired_count,
    COUNT(CASE WHEN status_code = 'ASSOCIATE' THEN 1 END) as associate_count,
    COUNT(CASE WHEN status_code = 'EMERITUS' THEN 1 END) as emeritus_count,
    COUNT(CASE WHEN status_code = 'STAFF' THEN 1 END) as staff_count
FROM position_statuses;

-- ============================================
-- 실행 완료!
-- 새로운 순서: 시무 → 청년 → 은퇴 → 협동 → 원로 → 직원
-- ============================================