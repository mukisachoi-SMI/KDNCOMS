-- 교회 로고 기능을 위한 데이터베이스 업데이트
-- 실행 날짜: 2025-01-13

-- churches 테이블에 로고 URL 컬럼 추가
ALTER TABLE churches 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS logo_updated_at TIMESTAMP;

-- 로고 업로드 이력 테이블 (선택사항)
CREATE TABLE IF NOT EXISTS church_logos (
    logo_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID NOT NULL REFERENCES churches(church_id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES users(user_id),
    is_active BOOLEAN DEFAULT true
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_church_logos_church_id ON church_logos(church_id);

-- 확인 쿼리
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'churches' 
AND column_name IN ('logo_url', 'logo_updated_at');