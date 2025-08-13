-- ============================================
-- 교회 헌금관리시스템 - 전체 스키마 업데이트 (v2.3)
-- 실행일: 2025년 1월
-- ============================================
-- 이 스크립트는 Supabase SQL Editor에서 전체를 한 번에 실행하세요.
-- 기존 데이터는 100% 안전합니다!
-- ============================================

-- 1. Churches 테이블에 새 필드 추가 (전화번호, 주소, 카카오톡 ID)
ALTER TABLE churches 
ADD COLUMN IF NOT EXISTS church_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS church_address TEXT,
ADD COLUMN IF NOT EXISTS kakao_id VARCHAR(100);

COMMENT ON COLUMN churches.church_phone IS '교회 대표 전화번호';
COMMENT ON COLUMN churches.church_address IS '교회 주소';
COMMENT ON COLUMN churches.kakao_id IS '교회 카카오톡 ID (상담 및 문의용)';

-- 2. Donation Types 테이블 생성 (헌금 종류)
CREATE TABLE IF NOT EXISTS donation_types (
    type_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    type_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_donation_types_church 
        FOREIGN KEY (church_id) REFERENCES churches(church_id) ON DELETE CASCADE,
    CONSTRAINT uq_donation_type_code 
        UNIQUE (church_id, type_code)
);

-- 3. Positions 테이블 생성 (직분)
CREATE TABLE IF NOT EXISTS positions (
    position_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID NOT NULL,
    position_name VARCHAR(100) NOT NULL,
    position_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_positions_church 
        FOREIGN KEY (church_id) REFERENCES churches(church_id) ON DELETE CASCADE,
    CONSTRAINT uq_position_code 
        UNIQUE (church_id, position_code)
);

-- 4. Position Statuses 테이블 생성 (직분 상태)
CREATE TABLE IF NOT EXISTS position_statuses (
    status_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID NOT NULL,
    status_name VARCHAR(100) NOT NULL,
    status_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_position_statuses_church 
        FOREIGN KEY (church_id) REFERENCES churches(church_id) ON DELETE CASCADE,
    CONSTRAINT uq_position_status_code 
        UNIQUE (church_id, status_code)
);

-- 5. Donations 테이블에 donation_type_id 추가 (없다면)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' AND column_name = 'donation_type_id'
    ) THEN
        ALTER TABLE donations ADD COLUMN donation_type_id UUID;
        
        ALTER TABLE donations ADD CONSTRAINT fk_donations_type 
            FOREIGN KEY (donation_type_id) REFERENCES donation_types(type_id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Members 테이블에 직분 관련 컬럼 추가
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS position_id UUID,
ADD COLUMN IF NOT EXISTS position_status_id UUID;

-- 7. Members 테이블에 외래키 제약조건 추가
DO $$ 
BEGIN
    -- position_id 외래키 제약조건
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_members_position'
    ) THEN
        ALTER TABLE members 
        ADD CONSTRAINT fk_members_position 
            FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE SET NULL;
    END IF;
    
    -- position_status_id 외래키 제약조건
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_members_position_status'
    ) THEN
        ALTER TABLE members 
        ADD CONSTRAINT fk_members_position_status 
            FOREIGN KEY (position_status_id) REFERENCES position_statuses(status_id) ON DELETE SET NULL;
    END IF;
END $$;

-- 8. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_donation_types_church_id ON donation_types(church_id);
CREATE INDEX IF NOT EXISTS idx_donation_types_active ON donation_types(church_id, is_active);
CREATE INDEX IF NOT EXISTS idx_positions_church_id ON positions(church_id);
CREATE INDEX IF NOT EXISTS idx_positions_active ON positions(church_id, is_active);
CREATE INDEX IF NOT EXISTS idx_position_statuses_church_id ON position_statuses(church_id);
CREATE INDEX IF NOT EXISTS idx_position_statuses_active ON position_statuses(church_id, is_active);
CREATE INDEX IF NOT EXISTS idx_members_position ON members(position_id);
CREATE INDEX IF NOT EXISTS idx_members_position_status ON members(position_status_id);
CREATE INDEX IF NOT EXISTS idx_donations_type ON donations(donation_type_id);

-- 9. RLS (Row Level Security) 정책 설정
ALTER TABLE donation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_statuses ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "donation_types_select" ON donation_types;
DROP POLICY IF EXISTS "donation_types_insert" ON donation_types;
DROP POLICY IF EXISTS "donation_types_update" ON donation_types;
DROP POLICY IF EXISTS "donation_types_delete" ON donation_types;

DROP POLICY IF EXISTS "positions_select" ON positions;
DROP POLICY IF EXISTS "positions_insert" ON positions;
DROP POLICY IF EXISTS "positions_update" ON positions;
DROP POLICY IF EXISTS "positions_delete" ON positions;

DROP POLICY IF EXISTS "position_statuses_select" ON position_statuses;
DROP POLICY IF EXISTS "position_statuses_insert" ON position_statuses;
DROP POLICY IF EXISTS "position_statuses_update" ON position_statuses;
DROP POLICY IF EXISTS "position_statuses_delete" ON position_statuses;

-- Donation Types RLS 정책
CREATE POLICY "donation_types_select" ON donation_types FOR SELECT USING (true);
CREATE POLICY "donation_types_insert" ON donation_types FOR INSERT WITH CHECK (true);
CREATE POLICY "donation_types_update" ON donation_types FOR UPDATE USING (true);
CREATE POLICY "donation_types_delete" ON donation_types FOR DELETE USING (true);

-- Positions RLS 정책
CREATE POLICY "positions_select" ON positions FOR SELECT USING (true);
CREATE POLICY "positions_insert" ON positions FOR INSERT WITH CHECK (true);
CREATE POLICY "positions_update" ON positions FOR UPDATE USING (true);
CREATE POLICY "positions_delete" ON positions FOR DELETE USING (true);

-- Position Statuses RLS 정책
CREATE POLICY "position_statuses_select" ON position_statuses FOR SELECT USING (true);
CREATE POLICY "position_statuses_insert" ON position_statuses FOR INSERT WITH CHECK (true);
CREATE POLICY "position_statuses_update" ON position_statuses FOR UPDATE USING (true);
CREATE POLICY "position_statuses_delete" ON position_statuses FOR DELETE USING (true);

-- 10. 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. 트리거 생성
DROP TRIGGER IF EXISTS update_donation_types_updated_at ON donation_types;
DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
DROP TRIGGER IF EXISTS update_position_statuses_updated_at ON position_statuses;

CREATE TRIGGER update_donation_types_updated_at
    BEFORE UPDATE ON donation_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_position_statuses_updated_at
    BEFORE UPDATE ON position_statuses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. 기본 데이터 삽입 함수 (🔥 순서 변경: 시무-청년-은퇴-협동-원로-직원)
CREATE OR REPLACE FUNCTION insert_default_church_data(church_id_param UUID)
RETURNS VOID AS $$
BEGIN
    -- 기본 헌금 종류 삽입
    INSERT INTO donation_types (church_id, type_name, type_code, sort_order) VALUES
    (church_id_param, '주정헌금', 'WEEKLY_OFFERING', 1),
    (church_id_param, '감사헌금', 'THANKSGIVING', 2),
    (church_id_param, '십일조', 'TITHE', 3),
    (church_id_param, '선교헌금', 'MISSION', 4),
    (church_id_param, '절기헌금', 'SEASONAL', 5),
    (church_id_param, '건축헌금', 'BUILDING', 6),
    (church_id_param, '임직헌금', 'ORDINATION', 7),
    (church_id_param, '장학헌금', 'SCHOLARSHIP', 8),
    (church_id_param, '주일헌금', 'SUNDAY_OFFERING', 9),
    (church_id_param, '목적헌금', 'PURPOSE_OFFERING', 10)
    ON CONFLICT (church_id, type_code) DO NOTHING;
    
    -- 기본 직분 삽입
    INSERT INTO positions (church_id, position_name, position_code, sort_order) VALUES
    (church_id_param, '목사', 'PASTOR', 1),
    (church_id_param, '부목사', 'ASSOC_PASTOR', 2),
    (church_id_param, '전도사', 'EVANGELIST', 3),
    (church_id_param, '장로', 'ELDER', 4),
    (church_id_param, '권사', 'DEACONESS', 5),
    (church_id_param, '안수집사', 'ORDAINED_DEACON', 6),
    (church_id_param, '집사', 'DEACON', 7),
    (church_id_param, '성도', 'MEMBER', 8)
    ON CONFLICT (church_id, position_code) DO NOTHING;
    
    -- 기본 직분 상태 삽입 (🔥 순서 변경: 시무-청년-은퇴-협동-원로-직원)
    INSERT INTO position_statuses (church_id, status_name, status_code, sort_order) VALUES
    (church_id_param, '시무', 'ACTIVE', 1),
    (church_id_param, '청년', 'YOUNG', 2),      -- 2번째로 이동
    (church_id_param, '은퇴', 'RETIRED', 3),    -- 3번째로 이동
    (church_id_param, '협동', 'ASSOCIATE', 4),  -- 4번째로 이동
    (church_id_param, '원로', 'EMERITUS', 5),   -- 5번째로 이동
    (church_id_param, '직원', 'STAFF', 6)       -- 6번째로 이동
    ON CONFLICT (church_id, status_code) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 13. 🆕 청년 상태 개별 추가 함수 (이미 데이터가 있는 교회용)
CREATE OR REPLACE FUNCTION add_young_status(church_id_param UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO position_statuses (church_id, status_name, status_code, sort_order, is_active) 
    VALUES (church_id_param, '청년', 'YOUNG', 2, true)
    ON CONFLICT (church_id, status_code) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 14. 🔥 기존 직분 상태 순서 업데이트 함수 (이미 데이터가 있는 교회용)
CREATE OR REPLACE FUNCTION update_position_status_order(church_id_param UUID)
RETURNS VOID AS $$
BEGIN
    -- 시무-청년-은퇴-협동-원로-직원 순서로 업데이트
    UPDATE position_statuses SET sort_order = 1 WHERE church_id = church_id_param AND status_code = 'ACTIVE';
    UPDATE position_statuses SET sort_order = 2 WHERE church_id = church_id_param AND status_code = 'YOUNG';
    UPDATE position_statuses SET sort_order = 3 WHERE church_id = church_id_param AND status_code = 'RETIRED';
    UPDATE position_statuses SET sort_order = 4 WHERE church_id = church_id_param AND status_code = 'ASSOCIATE';
    UPDATE position_statuses SET sort_order = 5 WHERE church_id = church_id_param AND status_code = 'EMERITUS';
    UPDATE position_statuses SET sort_order = 6 WHERE church_id = church_id_param AND status_code = 'STAFF';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 15. 실행 후 확인 스크립트
-- ============================================
-- 테이블 생성 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('donation_types', 'positions', 'position_statuses')
ORDER BY table_name;

-- 컬럼 추가 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'churches' 
AND column_name IN ('church_phone', 'church_address', 'kakao_id');

-- ============================================
-- 16. 기본 데이터 삽입 (교회별로 실행)
-- ============================================
-- 먼저 교회 ID 확인:
-- SELECT church_id, church_name FROM churches;

-- 그 다음 각 교회에 대해 기본 데이터 삽입:
-- SELECT insert_default_church_data('여기에_교회_ID_입력');

-- 예시:
-- SELECT insert_default_church_data('123e4567-e89b-12d3-a456-426614174000');

-- ============================================
-- 17. 🔥 이미 데이터가 있는 교회의 순서 업데이트
-- ============================================
-- SELECT update_position_status_order('여기에_교회_ID_입력');

-- ============================================
-- 18. 데이터 확인
-- ============================================
-- SELECT * FROM donation_types WHERE church_id = '여기에_교회_ID_입력' ORDER BY sort_order;
-- SELECT * FROM positions WHERE church_id = '여기에_교회_ID_입력' ORDER BY sort_order;
-- SELECT * FROM position_statuses WHERE church_id = '여기에_교회_ID_입력' ORDER BY sort_order;