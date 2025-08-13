-- ============================================
-- 🚨 즉시 실행 SQL - 문제 해결 스크립트
-- ============================================
-- Supabase SQL Editor에서 아래 순서대로 실행하세요
-- ============================================

-- ====== STEP 1: 테이블 구조 확인 ======
-- 이 쿼리를 실행하고 결과를 확인하세요
SELECT 
    'churches 테이블 컬럼' as info,
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'churches'
ORDER BY ordinal_position;

-- church_phone, church_address, kakao_id가 없으면 아래 실행
/*
ALTER TABLE churches 
ADD COLUMN IF NOT EXISTS church_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS church_address TEXT,
ADD COLUMN IF NOT EXISTS kakao_id VARCHAR(100);
*/

-- ====== STEP 2: 교회 ID 확인 (중요!) ======
-- 아래 결과에서 church_id를 복사해두세요
SELECT 
    church_id as "교회ID_복사하세요",
    church_name as "교회이름",
    email,
    church_phone as "전화번호",
    church_address as "주소",
    kakao_id as "카카오톡"
FROM churches;

-- ====== STEP 3: 직분 상태 현황 확인 ======
-- 위에서 복사한 church_id를 '여기' 부분에 붙여넣고 실행
/*
SELECT 
    sort_order as "순서",
    status_name as "직분상태",
    status_code as "코드"
FROM position_statuses 
WHERE church_id = '여기에_교회ID_붙여넣기'
ORDER BY sort_order;
*/

-- ====== STEP 4: 직분 상태 완전 초기화 (청년 포함) ======
-- church_id를 실제 값으로 변경 후 실행
/*
-- 1. 기존 직분 상태 삭제
DELETE FROM position_statuses 
WHERE church_id = '여기에_교회ID_붙여넣기';

-- 2. 새로운 직분 상태 삽입 (청년 포함, 올바른 순서)
INSERT INTO position_statuses (church_id, status_name, status_code, sort_order, is_active) VALUES
('여기에_교회ID_붙여넣기', '시무', 'ACTIVE', 1, true),
('여기에_교회ID_붙여넣기', '청년', 'YOUNG', 2, true),
('여기에_교회ID_붙여넣기', '은퇴', 'RETIRED', 3, true),
('여기에_교회ID_붙여넣기', '협동', 'ASSOCIATE', 4, true),
('여기에_교회ID_붙여넣기', '원로', 'EMERITUS', 5, true),
('여기에_교회ID_붙여넣기', '직원', 'STAFF', 6, true);

-- 3. 결과 확인
SELECT 
    sort_order as "순서",
    status_name as "직분상태",
    status_code as "코드"
FROM position_statuses 
WHERE church_id = '여기에_교회ID_붙여넣기'
ORDER BY sort_order;
*/

-- ====== STEP 5: 헌금 종류 초기화 ======
-- church_id를 실제 값으로 변경 후 실행
/*
-- 1. 기존 헌금 종류 확인
SELECT * FROM donation_types 
WHERE church_id = '여기에_교회ID_붙여넣기'
ORDER BY sort_order;

-- 2. 데이터가 없으면 삽입
INSERT INTO donation_types (church_id, type_name, type_code, sort_order, is_active) VALUES
('여기에_교회ID_붙여넣기', '주정헌금', 'WEEKLY_OFFERING', 1, true),
('여기에_교회ID_붙여넣기', '감사헌금', 'THANKSGIVING', 2, true),
('여기에_교회ID_붙여넣기', '십일조', 'TITHE', 3, true),
('여기에_교회ID_붙여넣기', '선교헌금', 'MISSION', 4, true),
('여기에_교회ID_붙여넣기', '절기헌금', 'SEASONAL', 5, true),
('여기에_교회ID_붙여넣기', '건축헌금', 'BUILDING', 6, true),
('여기에_교회ID_붙여넣기', '임직헌금', 'ORDINATION', 7, true),
('여기에_교회ID_붙여넣기', '장학헌금', 'SCHOLARSHIP', 8, true),
('여기에_교회ID_붙여넣기', '주일헌금', 'SUNDAY_OFFERING', 9, true),
('여기에_교회ID_붙여넣기', '목적헌금', 'PURPOSE_OFFERING', 10, true)
ON CONFLICT (church_id, type_code) DO NOTHING;
*/

-- ====== STEP 6: 직분 초기화 ======
-- church_id를 실제 값으로 변경 후 실행
/*
-- 1. 기존 직분 확인
SELECT * FROM positions 
WHERE church_id = '여기에_교회ID_붙여넣기'
ORDER BY sort_order;

-- 2. 데이터가 없으면 삽입
INSERT INTO positions (church_id, position_name, position_code, sort_order, is_active) VALUES
('여기에_교회ID_붙여넣기', '목사', 'PASTOR', 1, true),
('여기에_교회ID_붙여넣기', '부목사', 'ASSOC_PASTOR', 2, true),
('여기에_교회ID_붙여넣기', '전도사', 'EVANGELIST', 3, true),
('여기에_교회ID_붙여넣기', '장로', 'ELDER', 4, true),
('여기에_교회ID_붙여넣기', '권사', 'DEACONESS', 5, true),
('여기에_교회ID_붙여넣기', '안수집사', 'ORDAINED_DEACON', 6, true),
('여기에_교회ID_붙여넣기', '집사', 'DEACON', 7, true),
('여기에_교회ID_붙여넣기', '성도', 'MEMBER', 8, true)
ON CONFLICT (church_id, position_code) DO NOTHING;
*/

-- ====== STEP 7: 최종 확인 ======
-- 모든 데이터가 제대로 들어갔는지 확인
/*
SELECT 
    '교회정보' as 구분,
    church_name as 데이터,
    church_phone as 전화,
    church_address as 주소,
    kakao_id as 카카오톡
FROM churches
WHERE church_id = '여기에_교회ID_붙여넣기'

UNION ALL

SELECT 
    '직분상태(' || sort_order || ')',
    status_name,
    status_code,
    '',
    ''
FROM position_statuses
WHERE church_id = '여기에_교회ID_붙여넣기'
ORDER BY 1;
*/

-- ============================================
-- 📌 실행 순서 요약
-- ============================================
-- 1. STEP 1 실행 → 컬럼 확인
-- 2. STEP 2 실행 → church_id 복사
-- 3. STEP 3~6의 주석(/* */)을 제거하고 
--    '여기에_교회ID_붙여넣기'를 실제 ID로 변경
-- 4. 각 STEP 실행
-- 5. 브라우저 새로고침 (Ctrl+Shift+R)
-- ============================================