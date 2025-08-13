-- ============================================
-- Members 테이블 Position Status ID 업데이트 스크립트
-- position_statuses ID 변경 후 실행
-- ============================================

-- 1. 먼저 매핑 정보 확인
SELECT 
    '=== 매핑 정보 확인 ===' as info,
    status_name,
    old_id,
    new_id
FROM position_status_id_mapping
ORDER BY new_id;

-- 2. 업데이트 전 현재 상태 확인
SELECT 
    '=== 현재 Members 상태 ===' as info,
    position_status_id,
    COUNT(*) as member_count
FROM members
WHERE position_status_id IS NOT NULL
GROUP BY position_status_id;

-- 3. Members 테이블 업데이트 (트랜잭션으로 안전하게)
BEGIN;

-- 각 직분 상태별로 업데이트
UPDATE members m
SET position_status_id = map.new_id
FROM position_status_id_mapping map
WHERE m.position_status_id = map.old_id;

-- 4. 업데이트 결과 확인
SELECT 
    '=== 업데이트 후 상태 ===' as info,
    m.position_status_id,
    ps.status_name,
    COUNT(*) as member_count
FROM members m
LEFT JOIN position_statuses ps ON m.position_status_id = ps.status_id
WHERE m.position_status_id IS NOT NULL
GROUP BY m.position_status_id, ps.status_name
ORDER BY m.position_status_id;

-- 5. 외래키 제약조건 재생성
ALTER TABLE members 
ADD CONSTRAINT fk_members_position_status 
    FOREIGN KEY (position_status_id) 
    REFERENCES position_statuses(status_id) 
    ON DELETE SET NULL;

-- 6. 최종 검증
SELECT 
    '=== 최종 검증 ===' as check_type,
    COUNT(DISTINCT m.member_id) as total_members,
    COUNT(CASE WHEN m.position_status_id IS NOT NULL THEN 1 END) as with_status,
    COUNT(CASE WHEN m.position_status_id IS NULL THEN 1 END) as without_status,
    COUNT(CASE WHEN ps.status_id IS NULL AND m.position_status_id IS NOT NULL THEN 1 END) as orphaned_refs
FROM members m
LEFT JOIN position_statuses ps ON m.position_status_id = ps.status_id;

-- 모든 것이 정상이면:
COMMIT;

-- 문제가 있으면:
-- ROLLBACK;

-- ============================================
-- 7. 정리 작업 (선택사항)
-- ============================================

-- 매핑 테이블 보관 (나중에 참조용)
-- DROP TABLE IF EXISTS position_status_id_mapping;

-- 백업 테이블 보관 (안전을 위해 당분간 유지 권장)
-- DROP TABLE IF EXISTS position_statuses_backup_before_id_change;