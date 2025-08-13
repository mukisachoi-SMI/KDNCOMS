-- ============================================
-- Position Status ID 변경 - 안전 버전
-- 중복 처리 및 롤백 가능
-- ============================================

-- 트랜잭션 시작
BEGIN;

-- ============================================
-- STEP 1: 현재 상태 확인
-- ============================================

-- 이미 변경되었는지 확인
SELECT 
    '=== 현재 상태 확인 ===' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN status_id LIKE '%_status_%' THEN 1 END) as new_format,
    COUNT(CASE WHEN status_id NOT LIKE '%_status_%' THEN 1 END) as old_format
FROM position_statuses;

-- 중복된 status_code 확인
SELECT 
    church_id,
    status_code,
    COUNT(*) as count
FROM position_statuses
GROUP BY church_id, status_code
HAVING COUNT(*) > 1;

-- ============================================
-- STEP 2: 백업 (이미 있으면 스킵)
-- ============================================

-- 백업 테이블이 없을 때만 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'position_statuses_backup_before_id_change'
    ) THEN
        CREATE TABLE position_statuses_backup_before_id_change AS 
        SELECT * FROM position_statuses;
    END IF;
END $$;

-- ============================================
-- STEP 3: 중복 제거
-- ============================================

-- 중복된 청년 상태 등 제거 (sort_order가 큰 것 삭제)
DELETE FROM position_statuses p1
WHERE EXISTS (
    SELECT 1 
    FROM position_statuses p2 
    WHERE p1.church_id = p2.church_id 
    AND p1.status_code = p2.status_code 
    AND p1.ctid > p2.ctid
);

-- ============================================
-- STEP 4: 외래키 제약조건 제거
-- ============================================

ALTER TABLE members 
DROP CONSTRAINT IF EXISTS fk_members_position_status;

-- ============================================
-- STEP 5: 컬럼 타입 변경
-- ============================================

-- position_statuses의 status_id 타입 변경
DO $$
BEGIN
    -- 이미 VARCHAR인지 확인
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'position_statuses' 
        AND column_name = 'status_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE position_statuses 
        ALTER COLUMN status_id TYPE VARCHAR(100) USING status_id::text;
    END IF;
END $$;

-- members의 position_status_id 타입 변경
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' 
        AND column_name = 'position_status_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE members 
        ALTER COLUMN position_status_id TYPE VARCHAR(100) USING position_status_id::text;
    END IF;
END $$;

-- ============================================
-- STEP 6: 임시 컬럼으로 새 ID 생성
-- ============================================

-- 임시 컬럼 추가
ALTER TABLE position_statuses 
ADD COLUMN IF NOT EXISTS new_status_id VARCHAR(100);

-- 새 ID 생성
UPDATE position_statuses 
SET new_status_id = church_id || '_status_' || 
    CASE 
        WHEN status_code = 'ACTIVE' THEN '001'
        WHEN status_code = 'YOUNG' THEN '002'
        WHEN status_code = 'RETIRED' THEN '003'
        WHEN status_code = 'ASSOCIATE' THEN '004'
        WHEN status_code = 'EMERITUS' THEN '005'
        WHEN status_code = 'STAFF' THEN '006'
        ELSE 'XXX'
    END;

-- 새 ID 확인
SELECT 
    status_id as old_id,
    new_status_id,
    status_name,
    status_code
FROM position_statuses
ORDER BY church_id, 
    CASE status_code
        WHEN 'ACTIVE' THEN 1
        WHEN 'YOUNG' THEN 2
        WHEN 'RETIRED' THEN 3
        WHEN 'ASSOCIATE' THEN 4
        WHEN 'EMERITUS' THEN 5
        WHEN 'STAFF' THEN 6
    END;

-- ============================================
-- STEP 7: 매핑 테이블 생성
-- ============================================

DROP TABLE IF EXISTS position_status_id_mapping;
CREATE TABLE position_status_id_mapping AS
SELECT 
    status_id as old_id,
    new_status_id as new_id,
    status_name,
    status_code,
    church_id
FROM position_statuses;

-- ============================================
-- STEP 8: Primary Key 임시 해제 및 ID 변경
-- ============================================

-- Primary Key 제거
ALTER TABLE position_statuses DROP CONSTRAINT position_statuses_pkey;

-- status_id 업데이트
UPDATE position_statuses 
SET status_id = new_status_id;

-- Primary Key 재생성
ALTER TABLE position_statuses ADD PRIMARY KEY (status_id);

-- 임시 컬럼 제거
ALTER TABLE position_statuses DROP COLUMN new_status_id;

-- ============================================
-- STEP 9: sort_order 업데이트
-- ============================================

UPDATE position_statuses 
SET sort_order = CASE 
    WHEN status_code = 'ACTIVE' THEN 1
    WHEN status_code = 'YOUNG' THEN 2
    WHEN status_code = 'RETIRED' THEN 3
    WHEN status_code = 'ASSOCIATE' THEN 4
    WHEN status_code = 'EMERITUS' THEN 5
    WHEN status_code = 'STAFF' THEN 6
    ELSE sort_order
END,
updated_at = NOW();

-- ============================================
-- STEP 10: 결과 확인
-- ============================================

-- 변경 결과
SELECT 
    '=== 변경 완료 ===' as info,
    status_id,
    status_name,
    status_code,
    sort_order
FROM position_statuses
ORDER BY church_id, sort_order;

-- 검증
SELECT 
    status_name,
    CASE 
        WHEN status_id LIKE '%_status_001' AND status_code = 'ACTIVE' THEN '✅'
        WHEN status_id LIKE '%_status_002' AND status_code = 'YOUNG' THEN '✅'
        WHEN status_id LIKE '%_status_003' AND status_code = 'RETIRED' THEN '✅'
        WHEN status_id LIKE '%_status_004' AND status_code = 'ASSOCIATE' THEN '✅'
        WHEN status_id LIKE '%_status_005' AND status_code = 'EMERITUS' THEN '✅'
        WHEN status_id LIKE '%_status_006' AND status_code = 'STAFF' THEN '✅'
        ELSE '❌'
    END as valid
FROM position_statuses
ORDER BY sort_order;

-- Members 업데이트 SQL 생성
SELECT 
    '-- Members 업데이트:' as info,
    'UPDATE members SET position_status_id = ''' || new_id || 
    ''' WHERE position_status_id = ''' || old_id || ''';' as sql
FROM position_status_id_mapping
WHERE old_id != new_id
ORDER BY new_id;

-- ============================================
-- 정상이면:
COMMIT;

-- 문제있으면:
-- ROLLBACK;
-- ============================================