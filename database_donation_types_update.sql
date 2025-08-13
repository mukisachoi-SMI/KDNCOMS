-- ============================================
-- 교회 헌금관리시스템 - 헌금 종류 업데이트
-- ============================================

-- 기존 기본 헌금 종류 삽입 함수 업데이트
CREATE OR REPLACE FUNCTION insert_default_donation_types(church_id_param VARCHAR(50))
RETURNS VOID AS $$
BEGIN
    -- 기존 기본 헌금 종류 삭제 (필요한 경우)
    -- DELETE FROM donation_types WHERE church_id = church_id_param;
    
    -- 새로운 헌금 종류 삽입
    INSERT INTO donation_types (type_id, church_id, type_name, type_code, sort_order, is_active) VALUES
    (church_id_param || '_dt_001', church_id_param, '주정헌금', 'WEEKLY_OFFERING', 1, true),
    (church_id_param || '_dt_002', church_id_param, '감사헌금', 'THANKSGIVING', 2, true),
    (church_id_param || '_dt_003', church_id_param, '십일조', 'TITHE', 3, true),
    (church_id_param || '_dt_004', church_id_param, '선교헌금', 'MISSION', 4, true),
    (church_id_param || '_dt_005', church_id_param, '절기헌금', 'SEASONAL', 5, true),
    (church_id_param || '_dt_006', church_id_param, '건축헌금', 'BUILDING', 6, true),
    (church_id_param || '_dt_007', church_id_param, '임직헌금', 'ORDINATION', 7, true),
    (church_id_param || '_dt_008', church_id_param, '장학헌금', 'SCHOLARSHIP', 8, true),
    (church_id_param || '_dt_009', church_id_param, '주일헌금', 'SUNDAY_OFFERING', 9, true),
    (church_id_param || '_dt_010', church_id_param, '목적헌금', 'PURPOSE_OFFERING', 10, true)
    ON CONFLICT (type_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 기존 교회의 헌금 종류 업데이트 (기존 것 삭제 후 새로 삽입)
CREATE OR REPLACE FUNCTION update_donation_types(church_id_param VARCHAR(50))
RETURNS VOID AS $$
BEGIN
    -- 기존 기본 헌금 종류 비활성화
    UPDATE donation_types 
    SET is_active = false, updated_at = NOW()
    WHERE church_id = church_id_param 
    AND type_code IN ('WEEKLY', 'TITHE', 'THANKSGIVING', 'SPECIAL', 'MISSION', 'BUILDING');
    
    -- 새로운 헌금 종류 삽입
    INSERT INTO donation_types (type_id, church_id, type_name, type_code, sort_order, is_active) VALUES
    (church_id_param || '_dt_new_001', church_id_param, '주정헌금', 'WEEKLY_OFFERING', 1, true),
    (church_id_param || '_dt_new_002', church_id_param, '감사헌금', 'THANKSGIVING', 2, true),
    (church_id_param || '_dt_new_003', church_id_param, '십일조', 'TITHE', 3, true),
    (church_id_param || '_dt_new_004', church_id_param, '선교헌금', 'MISSION', 4, true),
    (church_id_param || '_dt_new_005', church_id_param, '절기헌금', 'SEASONAL', 5, true),
    (church_id_param || '_dt_new_006', church_id_param, '건축헌금', 'BUILDING', 6, true),
    (church_id_param || '_dt_new_007', church_id_param, '임직헌금', 'ORDINATION', 7, true),
    (church_id_param || '_dt_new_008', church_id_param, '장학헌금', 'SCHOLARSHIP', 8, true),
    (church_id_param || '_dt_new_009', church_id_param, '주일헌금', 'SUNDAY_OFFERING', 9, true),
    (church_id_param || '_dt_new_010', church_id_param, '목적헌금', 'PURPOSE_OFFERING', 10, true)
    ON CONFLICT (type_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 실행 방법:
-- 
-- 1. 기존 교회에 새로운 헌금 종류 추가:
--    SELECT update_donation_types('YOUR_CHURCH_ID_HERE');
--
-- 2. 새로운 교회에 기본 헌금 종류 추가:
--    SELECT insert_default_donation_types('YOUR_CHURCH_ID_HERE');
--
-- 3. 현재 헌금 종류 확인:
--    SELECT * FROM donation_types WHERE church_id = 'YOUR_CHURCH_ID_HERE' ORDER BY sort_order;
-- ============================================