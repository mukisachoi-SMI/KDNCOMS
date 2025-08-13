-- ============================================
-- 실패한 변경 롤백 스크립트
-- 이전 상태로 복구
-- ============================================

-- 현재 상태 확인
SELECT 
    '=== 현재 문제 상황 ===' as info,
    status_id,
    status_name,
    status_code
FROM position_statuses
ORDER BY church_id, sort_order;

-- 백업 테이블 확인
SELECT 
    '=== 백업 테이블 확인 ===' as info,
    COUNT(*) as backup_count
FROM position_statuses_backup_before_id_change;

-- ============================================
-- 옵션 1: 백업에서 복구
-- ============================================

-- position_statuses 테이블 초기화 및 백업에서 복구
BEGIN;

-- 현재 테이블 삭제
DROP TABLE IF EXISTS position_statuses CASCADE;

-- 백업에서 복구
CREATE TABLE position_statuses AS 
SELECT * FROM position_statuses_backup_before_id_change;

-- Primary Key 재생성
ALTER TABLE position_statuses ADD PRIMARY KEY (status_id);

-- 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_position_statuses_church_id ON position_statuses(church_id);
CREATE INDEX IF NOT EXISTS idx_position_statuses_active ON position_statuses(church_id, is_active);

-- RLS 재활성화
ALTER TABLE position_statuses ENABLE ROW LEVEL SECURITY;

-- 정책 재생성
CREATE POLICY "position_statuses_select" ON position_statuses FOR SELECT USING (true);
CREATE POLICY "position_statuses_insert" ON position_statuses FOR INSERT WITH CHECK (true);
CREATE POLICY "position_statuses_update" ON position_statuses FOR UPDATE USING (true);
CREATE POLICY "position_statuses_delete" ON position_statuses FOR DELETE USING (true);

COMMIT;

-- ============================================
-- 옵션 2: 중복 제거만 하기
-- ============================================

-- 중복된 레코드 확인
SELECT 
    church_id,
    status_code,
    COUNT(*) as count,
    STRING_AGG(status_id::text, ', ') as ids
FROM position_statuses
GROUP BY church_id, status_code
HAVING COUNT(*) > 1;

-- 중복 제거 (최초 레코드만 유지)
DELETE FROM position_statuses p1
WHERE EXISTS (
    SELECT 1 
    FROM position_statuses p2 
    WHERE p1.church_id = p2.church_id 
    AND p1.status_code = p2.status_code 
    AND p1.ctid > p2.ctid
);

-- ============================================
-- 정리
-- ============================================

-- 임시 테이블들 제거
DROP TABLE IF EXISTS position_status_id_mapping;

-- 확인
SELECT 
    '=== 복구 완료 ===' as info,
    COUNT(*) as total_records,
    COUNT(DISTINCT church_id) as churches,
    COUNT(DISTINCT status_code) as status_types
FROM position_statuses;