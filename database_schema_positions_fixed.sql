-- ============================================
-- 교회 헌금관리시스템 - 직분 관리 추가 스키마
-- ============================================

-- 1. 직분 테이블 생성
CREATE TABLE IF NOT EXISTS positions (
    position_id VARCHAR(50) PRIMARY KEY,
    church_id VARCHAR(50) NOT NULL,
    position_name VARCHAR(100) NOT NULL,
    position_code VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_positions_church 
        FOREIGN KEY (church_id) REFERENCES churches(church_id) ON DELETE CASCADE
);

-- 2. 직분 상태 테이블 생성 (시무/은퇴/협동/원로/직원)
CREATE TABLE IF NOT EXISTS position_statuses (
    status_id VARCHAR(50) PRIMARY KEY,
    church_id VARCHAR(50) NOT NULL,
    status_name VARCHAR(100) NOT NULL,
    status_code VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_position_statuses_church 
        FOREIGN KEY (church_id) REFERENCES churches(church_id) ON DELETE CASCADE
);

-- 3. Members 테이블에 직분 관련 컬럼 추가
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS position_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS position_status_id VARCHAR(50);

-- 4. Members 테이블에 외래키 제약조건 추가 (IF NOT EXISTS 대신 DO 블록 사용)
DO $$ 
BEGIN
    -- position_id 외래키 제약조건 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_members_position'
    ) THEN
        ALTER TABLE members 
        ADD CONSTRAINT fk_members_position 
            FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE SET NULL;
    END IF;
    
    -- position_status_id 외래키 제약조건 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_members_position_status'
    ) THEN
        ALTER TABLE members 
        ADD CONSTRAINT fk_members_position_status 
            FOREIGN KEY (position_status_id) REFERENCES position_statuses(status_id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_positions_church_id ON positions(church_id);
CREATE INDEX IF NOT EXISTS idx_positions_active ON positions(church_id, is_active);
CREATE INDEX IF NOT EXISTS idx_position_statuses_church_id ON position_statuses(church_id);
CREATE INDEX IF NOT EXISTS idx_position_statuses_active ON position_statuses(church_id, is_active);
CREATE INDEX IF NOT EXISTS idx_members_position ON members(position_id);
CREATE INDEX IF NOT EXISTS idx_members_position_status ON members(position_status_id);

-- 6. RLS (Row Level Security) 정책 설정
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_statuses ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Users can view positions from their church" ON positions;
DROP POLICY IF EXISTS "Users can insert positions to their church" ON positions;
DROP POLICY IF EXISTS "Users can update positions from their church" ON positions;
DROP POLICY IF EXISTS "Users can delete positions from their church" ON positions;

DROP POLICY IF EXISTS "Users can view position statuses from their church" ON position_statuses;
DROP POLICY IF EXISTS "Users can insert position statuses to their church" ON position_statuses;
DROP POLICY IF EXISTS "Users can update position statuses from their church" ON position_statuses;
DROP POLICY IF EXISTS "Users can delete position statuses from their church" ON position_statuses;

-- Positions 테이블 RLS 정책
CREATE POLICY "Users can view positions from their church" ON positions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert positions to their church" ON positions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update positions from their church" ON positions
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete positions from their church" ON positions
    FOR DELETE USING (true);

-- Position Statuses 테이블 RLS 정책
CREATE POLICY "Users can view position statuses from their church" ON position_statuses
    FOR SELECT USING (true);

CREATE POLICY "Users can insert position statuses to their church" ON position_statuses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update position statuses from their church" ON position_statuses
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete position statuses from their church" ON position_statuses
    FOR DELETE USING (true);

-- 7. 기본 직분 데이터 삽입 함수
CREATE OR REPLACE FUNCTION insert_default_positions(church_id_param VARCHAR(50))
RETURNS VOID AS $$
BEGIN
    -- 기본 직분 삽입
    INSERT INTO positions (position_id, church_id, position_name, position_code, sort_order) VALUES
    (church_id_param || '_pos_001', church_id_param, '목사', 'PASTOR', 1),
    (church_id_param || '_pos_002', church_id_param, '부목사', 'ASSOC_PASTOR', 2),
    (church_id_param || '_pos_003', church_id_param, '전도사', 'EVANGELIST', 3),
    (church_id_param || '_pos_004', church_id_param, '장로', 'ELDER', 4),
    (church_id_param || '_pos_005', church_id_param, '권사', 'DEACONESS', 5),
    (church_id_param || '_pos_006', church_id_param, '안수집사', 'ORDAINED_DEACON', 6),
    (church_id_param || '_pos_007', church_id_param, '집사', 'DEACON', 7),
    (church_id_param || '_pos_008', church_id_param, '성도', 'MEMBER', 8)
    ON CONFLICT (position_id) DO NOTHING;
    
    -- 기본 직분 상태 삽입
    INSERT INTO position_statuses (status_id, church_id, status_name, status_code, sort_order) VALUES
    (church_id_param || '_status_001', church_id_param, '시무', 'ACTIVE', 1),
    (church_id_param || '_status_002', church_id_param, '은퇴', 'RETIRED', 2),
    (church_id_param || '_status_003', church_id_param, '협동', 'ASSOCIATE', 3),
    (church_id_param || '_status_004', church_id_param, '원로', 'EMERITUS', 4),
    (church_id_param || '_status_005', church_id_param, '직원', 'STAFF', 5)
    ON CONFLICT (status_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 8. 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 트리거 생성 (기존 것 삭제 후 재생성)
DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
DROP TRIGGER IF EXISTS update_position_statuses_updated_at ON position_statuses;

CREATE TRIGGER update_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_position_statuses_updated_at
    BEFORE UPDATE ON position_statuses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 실행 순서:
-- 1. 위 스크립트를 Supabase SQL Editor에서 실행
-- 2. 아래 명령으로 실제 church_id 확인:
--    SELECT church_id FROM churches;
-- 3. 확인된 church_id로 기본 데이터 삽입:
--    SELECT insert_default_positions('실제_교회_ID_여기에');
-- ============================================

-- 예시 사용법:
-- SELECT church_id FROM churches;
-- SELECT insert_default_positions('YOUR_ACTUAL_CHURCH_ID_HERE');