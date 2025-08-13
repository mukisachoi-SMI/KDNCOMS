-- ============================================
-- 교회 헌금관리시스템 - 헌금 종류 및 헌금방법 업데이트
-- Version 2.0 - 2025-01-08
-- ============================================
-- 변경사항:
-- 1. 헌금 종류 4개 → 10개로 확대
-- 2. 헌금방법(payment_method) 간소화: 현금/온라인 2개만
-- 3. 기존 데이터 안전한 마이그레이션
-- ============================================

-- ============================================
-- PART 1: 헌금 종류 테이블 생성 (없는 경우)
-- ============================================
CREATE TABLE IF NOT EXISTS donation_types (
    type_id VARCHAR(50) PRIMARY KEY,
    church_id VARCHAR(50) NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    type_code VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (church_id) REFERENCES churches(church_id) ON DELETE CASCADE,
    UNIQUE(church_id, type_code)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_donation_types_church ON donation_types(church_id);
CREATE INDEX IF NOT EXISTS idx_donation_types_active ON donation_types(is_active);
CREATE INDEX IF NOT EXISTS idx_donation_types_sort ON donation_types(sort_order);

-- ============================================
-- PART 2: 새로운 교회용 - 기본 헌금 종류 삽입 함수
-- ============================================
CREATE OR REPLACE FUNCTION insert_default_donation_types(church_id_param VARCHAR(50))
RETURNS TABLE(
    inserted_count INTEGER,
    message TEXT
) AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- 이미 데이터가 있는지 확인
    SELECT COUNT(*) INTO v_count 
    FROM donation_types 
    WHERE church_id = church_id_param;
    
    IF v_count > 0 THEN
        RETURN QUERY SELECT 0, '이미 헌금 종류가 설정되어 있습니다. update_donation_types_v2 함수를 사용하세요.'::TEXT;
        RETURN;
    END IF;
    
    -- 새로운 헌금 종류 삽입
    INSERT INTO donation_types (type_id, church_id, type_name, type_code, description, sort_order, is_active) VALUES
    (church_id_param || '_dt_001', church_id_param, '주정헌금', 'WEEKLY_OFFERING', '매주 정기적으로 드리는 헌금', 1, true),
    (church_id_param || '_dt_002', church_id_param, '감사헌금', 'THANKSGIVING', '감사의 마음을 담아 드리는 헌금', 2, true),
    (church_id_param || '_dt_003', church_id_param, '십일조', 'TITHE', '수입의 십분의 일을 드리는 헌금', 3, true),
    (church_id_param || '_dt_004', church_id_param, '선교헌금', 'MISSION', '선교 사역을 위한 헌금', 4, true),
    (church_id_param || '_dt_005', church_id_param, '절기헌금', 'SEASONAL', '성탄절, 부활절 등 절기 헌금', 5, true),
    (church_id_param || '_dt_006', church_id_param, '건축헌금', 'BUILDING', '교회 건축 및 시설을 위한 헌금', 6, true),
    (church_id_param || '_dt_007', church_id_param, '임직헌금', 'ORDINATION', '임직식 관련 헌금', 7, true),
    (church_id_param || '_dt_008', church_id_param, '장학헌금', 'SCHOLARSHIP', '장학 사업을 위한 헌금', 8, true),
    (church_id_param || '_dt_009', church_id_param, '주일헌금', 'SUNDAY_OFFERING', '주일 예배시 드리는 헌금', 9, true),
    (church_id_param || '_dt_010', church_id_param, '목적헌금', 'PURPOSE_OFFERING', '특정 목적을 위한 헌금', 10, true)
    ON CONFLICT (type_id) DO NOTHING;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN QUERY SELECT v_count, ('성공: ' || v_count::TEXT || '개의 헌금 종류가 추가되었습니다.')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 3: 기존 교회용 - 헌금 종류 업데이트 함수
-- ============================================
CREATE OR REPLACE FUNCTION update_donation_types_v2(church_id_param VARCHAR(50))
RETURNS TABLE(
    deactivated_count INTEGER,
    inserted_count INTEGER,
    updated_count INTEGER,
    message TEXT
) AS $$
DECLARE
    v_deactivated INTEGER := 0;
    v_inserted INTEGER := 0;
    v_updated INTEGER := 0;
BEGIN
    -- 트랜잭션 시작
    
    -- 1단계: 기존 구버전 헌금 종류 비활성화 (삭제하지 않고 보존)
    UPDATE donation_types 
    SET is_active = false, 
        updated_at = NOW(),
        description = COALESCE(description, '') || ' [v1.0에서 비활성화됨]'
    WHERE church_id = church_id_param 
    AND type_code IN ('WEEKLY', 'SPECIAL')  -- 구버전 코드
    AND is_active = true;
    
    GET DIAGNOSTICS v_deactivated = ROW_COUNT;
    
    -- 2단계: 새로운 헌금 종류 삽입 또는 업데이트
    INSERT INTO donation_types (type_id, church_id, type_name, type_code, description, sort_order, is_active) VALUES
    (church_id_param || '_dt_v2_001', church_id_param, '주정헌금', 'WEEKLY_OFFERING', '매주 정기적으로 드리는 헌금', 1, true),
    (church_id_param || '_dt_v2_002', church_id_param, '감사헌금', 'THANKSGIVING', '감사의 마음을 담아 드리는 헌금', 2, true),
    (church_id_param || '_dt_v2_003', church_id_param, '십일조', 'TITHE', '수입의 십분의 일을 드리는 헌금', 3, true),
    (church_id_param || '_dt_v2_004', church_id_param, '선교헌금', 'MISSION', '선교 사역을 위한 헌금', 4, true),
    (church_id_param || '_dt_v2_005', church_id_param, '절기헌금', 'SEASONAL', '성탄절, 부활절 등 절기 헌금', 5, true),
    (church_id_param || '_dt_v2_006', church_id_param, '건축헌금', 'BUILDING', '교회 건축 및 시설을 위한 헌금', 6, true),
    (church_id_param || '_dt_v2_007', church_id_param, '임직헌금', 'ORDINATION', '임직식 관련 헌금', 7, true),
    (church_id_param || '_dt_v2_008', church_id_param, '장학헌금', 'SCHOLARSHIP', '장학 사업을 위한 헌금', 8, true),
    (church_id_param || '_dt_v2_009', church_id_param, '주일헌금', 'SUNDAY_OFFERING', '주일 예배시 드리는 헌금', 9, true),
    (church_id_param || '_dt_v2_010', church_id_param, '목적헌금', 'PURPOSE_OFFERING', '특정 목적을 위한 헌금', 10, true)
    ON CONFLICT (type_id) DO UPDATE
    SET 
        type_name = EXCLUDED.type_name,
        type_code = EXCLUDED.type_code,
        description = EXCLUDED.description,
        sort_order = EXCLUDED.sort_order,
        is_active = true,
        updated_at = NOW();
    
    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    
    -- 3단계: 기존 헌금 종류 중 계속 사용할 것들 업데이트
    UPDATE donation_types
    SET sort_order = CASE type_code
            WHEN 'THANKSGIVING' THEN 2
            WHEN 'TITHE' THEN 3
            WHEN 'MISSION' THEN 4
            WHEN 'BUILDING' THEN 6
            ELSE sort_order
        END,
        is_active = true,
        updated_at = NOW()
    WHERE church_id = church_id_param
    AND type_code IN ('THANKSGIVING', 'TITHE', 'MISSION', 'BUILDING');
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    
    RETURN QUERY SELECT 
        v_deactivated, 
        v_inserted, 
        v_updated,
        ('성공: ' || v_deactivated::TEXT || '개 비활성화, ' || 
         v_inserted::TEXT || '개 추가/갱신, ' || 
         v_updated::TEXT || '개 업데이트')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 4: 헌금방법(payment_method) 정리
-- ============================================

-- 기존 헌금 데이터의 payment_method 값 표준화
CREATE OR REPLACE FUNCTION standardize_payment_methods(church_id_param VARCHAR(50) DEFAULT NULL)
RETURNS TABLE(
    updated_count INTEGER,
    message TEXT
) AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- 특정 교회 또는 전체 교회 대상
    IF church_id_param IS NOT NULL THEN
        UPDATE donations 
        SET payment_method = CASE 
            WHEN LOWER(payment_method) IN ('계좌이체', '카드', '온라인', '송금', 'online', 'card', 'transfer') THEN '온라인'
            WHEN LOWER(payment_method) IN ('현금', 'cash') THEN '현금'
            ELSE '현금'  -- 기본값
        END,
        updated_at = NOW()
        WHERE church_id = church_id_param
        AND payment_method NOT IN ('현금', '온라인');
    ELSE
        UPDATE donations 
        SET payment_method = CASE 
            WHEN LOWER(payment_method) IN ('계좌이체', '카드', '온라인', '송금', 'online', 'card', 'transfer') THEN '온라인'
            WHEN LOWER(payment_method) IN ('현금', 'cash') THEN '현금'
            ELSE '현금'  -- 기본값
        END,
        updated_at = NOW()
        WHERE payment_method NOT IN ('현금', '온라인');
    END IF;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN QUERY SELECT v_count, ('성공: ' || v_count::TEXT || '개의 헌금방법이 표준화되었습니다.')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 5: 데이터 마이그레이션 헬퍼 함수들
-- ============================================

-- 헌금 종류별 통계 조회
CREATE OR REPLACE FUNCTION get_donation_type_statistics(church_id_param VARCHAR(50))
RETURNS TABLE(
    type_name VARCHAR(100),
    type_code VARCHAR(50),
    donation_count BIGINT,
    total_amount NUMERIC,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dt.type_name,
        dt.type_code,
        COUNT(d.donation_id) as donation_count,
        COALESCE(SUM(d.amount), 0) as total_amount,
        dt.is_active
    FROM donation_types dt
    LEFT JOIN donations d ON dt.type_id = d.donation_type_id
    WHERE dt.church_id = church_id_param
    GROUP BY dt.type_id, dt.type_name, dt.type_code, dt.is_active
    ORDER BY dt.sort_order;
END;
$$ LANGUAGE plpgsql;

-- 헌금방법별 통계 조회
CREATE OR REPLACE FUNCTION get_payment_method_statistics(church_id_param VARCHAR(50))
RETURNS TABLE(
    payment_method VARCHAR(50),
    donation_count BIGINT,
    total_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.payment_method,
        COUNT(*) as donation_count,
        SUM(d.amount) as total_amount
    FROM donations d
    WHERE d.church_id = church_id_param
    AND d.status = 'active'
    GROUP BY d.payment_method
    ORDER BY donation_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 6: 백업 및 복구 함수
-- ============================================

-- 헌금 종류 백업 테이블 생성
CREATE TABLE IF NOT EXISTS donation_types_backup AS 
SELECT * FROM donation_types WHERE FALSE;

-- 백업 함수
CREATE OR REPLACE FUNCTION backup_donation_types(church_id_param VARCHAR(50))
RETURNS TABLE(
    backed_up_count INTEGER,
    message TEXT
) AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- 기존 백업 삭제
    DELETE FROM donation_types_backup 
    WHERE church_id = church_id_param;
    
    -- 새로운 백업 생성
    INSERT INTO donation_types_backup
    SELECT * FROM donation_types 
    WHERE church_id = church_id_param;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN QUERY SELECT v_count, ('백업 완료: ' || v_count::TEXT || '개의 헌금 종류가 백업되었습니다.')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 복구 함수
CREATE OR REPLACE FUNCTION restore_donation_types(church_id_param VARCHAR(50))
RETURNS TABLE(
    restored_count INTEGER,
    message TEXT
) AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- 현재 데이터 삭제
    DELETE FROM donation_types 
    WHERE church_id = church_id_param;
    
    -- 백업에서 복구
    INSERT INTO donation_types
    SELECT * FROM donation_types_backup 
    WHERE church_id = church_id_param;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN QUERY SELECT v_count, ('복구 완료: ' || v_count::TEXT || '개의 헌금 종류가 복구되었습니다.')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 7: 검증 및 체크 함수
-- ============================================

-- 데이터 무결성 체크
CREATE OR REPLACE FUNCTION check_donation_data_integrity(church_id_param VARCHAR(50))
RETURNS TABLE(
    check_type VARCHAR(100),
    status VARCHAR(20),
    details TEXT
) AS $$
BEGIN
    -- 헌금 종류 체크
    RETURN QUERY
    SELECT 
        '헌금 종류 설정'::VARCHAR(100),
        CASE WHEN COUNT(*) > 0 THEN '정상'::VARCHAR(20) ELSE '오류'::VARCHAR(20) END,
        ('활성화된 헌금 종류: ' || COUNT(*)::TEXT || '개')::TEXT
    FROM donation_types
    WHERE church_id = church_id_param AND is_active = true;
    
    -- 헌금방법 체크
    RETURN QUERY
    SELECT 
        '헌금방법 표준화'::VARCHAR(100),
        CASE WHEN COUNT(*) = 0 THEN '정상'::VARCHAR(20) ELSE '주의'::VARCHAR(20) END,
        ('비표준 헌금방법: ' || COUNT(*)::TEXT || '개')::TEXT
    FROM donations
    WHERE church_id = church_id_param 
    AND payment_method NOT IN ('현금', '온라인');
    
    -- 연결되지 않은 헌금 체크
    RETURN QUERY
    SELECT 
        '헌금-종류 연결'::VARCHAR(100),
        CASE WHEN COUNT(*) = 0 THEN '정상'::VARCHAR(20) ELSE '오류'::VARCHAR(20) END,
        ('종류 없는 헌금: ' || COUNT(*)::TEXT || '개')::TEXT
    FROM donations d
    WHERE d.church_id = church_id_param
    AND NOT EXISTS (
        SELECT 1 FROM donation_types dt 
        WHERE dt.type_id = d.donation_type_id
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 8: 실행 가이드 및 예제
-- ============================================

/*
========== 실행 순서 ==========

1. 백업 (권장)
   SELECT * FROM backup_donation_types('YOUR_CHURCH_ID');

2. 새로운 교회 등록시:
   SELECT * FROM insert_default_donation_types('YOUR_CHURCH_ID');

3. 기존 교회 업데이트시:
   SELECT * FROM update_donation_types_v2('YOUR_CHURCH_ID');

4. 헌금방법 표준화:
   SELECT * FROM standardize_payment_methods('YOUR_CHURCH_ID');

5. 데이터 무결성 체크:
   SELECT * FROM check_donation_data_integrity('YOUR_CHURCH_ID');

6. 통계 확인:
   -- 헌금 종류별 통계
   SELECT * FROM get_donation_type_statistics('YOUR_CHURCH_ID');
   
   -- 헌금방법별 통계  
   SELECT * FROM get_payment_method_statistics('YOUR_CHURCH_ID');

7. 문제 발생시 복구:
   SELECT * FROM restore_donation_types('YOUR_CHURCH_ID');

========== 조회 쿼리 예제 ==========

-- 현재 활성화된 헌금 종류 조회
SELECT type_name, type_code, description, sort_order 
FROM donation_types 
WHERE church_id = 'YOUR_CHURCH_ID' 
AND is_active = true
ORDER BY sort_order;

-- 헌금방법 분포 확인
SELECT payment_method, COUNT(*) as count, SUM(amount) as total
FROM donations 
WHERE church_id = 'YOUR_CHURCH_ID'
AND status = 'active'
GROUP BY payment_method;

-- 최근 헌금 내역 (새 헌금 종류 포함)
SELECT 
    d.donation_date,
    dt.type_name,
    d.amount,
    d.payment_method,
    COALESCE(m.member_name, d.donor_name) as donor
FROM donations d
JOIN donation_types dt ON d.donation_type_id = dt.type_id
LEFT JOIN members m ON d.member_id = m.member_id
WHERE d.church_id = 'YOUR_CHURCH_ID'
ORDER BY d.donation_date DESC
LIMIT 20;

========== 트러블슈팅 ==========

-- 중복 헌금 종류 제거
DELETE FROM donation_types a
USING donation_types b
WHERE a.church_id = b.church_id
AND a.type_code = b.type_code
AND a.created_at < b.created_at;

-- 고아 헌금 레코드 찾기
SELECT d.* 
FROM donations d
LEFT JOIN donation_types dt ON d.donation_type_id = dt.type_id
WHERE dt.type_id IS NULL
AND d.church_id = 'YOUR_CHURCH_ID';

*/

-- ============================================
-- END OF SCRIPT
-- ============================================