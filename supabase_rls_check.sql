-- Supabase RLS 정책 확인 및 설정 스크립트
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. 현재 RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public';

-- 2. 모든 테이블에 RLS 활성화 (필요한 경우)
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_positions ENABLE ROW LEVEL SECURITY;

-- 3. 기본 정책 생성 (개발/테스트용)
-- 주의: 프로덕션에서는 더 엄격한 정책 필요

-- Churches 테이블 정책
CREATE POLICY "Churches are viewable by authenticated users" 
ON churches FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Churches are insertable by authenticated users" 
ON churches FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Churches are updatable by church admin" 
ON churches FOR UPDATE 
TO authenticated 
USING (id IN (
    SELECT church_id FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
));

-- Users 테이블 정책
CREATE POLICY "Users can view their own data" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id OR church_id IN (
    SELECT church_id FROM users WHERE id = auth.uid()
));

-- Members 테이블 정책
CREATE POLICY "Members viewable by church users" 
ON members FOR SELECT 
TO authenticated 
USING (church_id IN (
    SELECT church_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Members insertable by church admin" 
ON members FOR INSERT 
TO authenticated 
WITH CHECK (church_id IN (
    SELECT church_id FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
));

-- Donations 테이블 정책
CREATE POLICY "Donations viewable by church users" 
ON donations FOR SELECT 
TO authenticated 
USING (church_id IN (
    SELECT church_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Donations insertable by church users" 
ON donations FOR INSERT 
TO authenticated 
WITH CHECK (church_id IN (
    SELECT church_id FROM users WHERE id = auth.uid()
));

-- 4. Anonymous 접근용 임시 정책 (개발 중일 때만)
-- 주의: 테스트 후 반드시 제거할 것!
CREATE POLICY "Temporary anonymous read for testing" 
ON churches FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Temporary anonymous read donations" 
ON donations FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Temporary anonymous read members" 
ON members FOR SELECT 
TO anon 
USING (true);

-- 5. 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
