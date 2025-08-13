# 설정 화면 Supabase 연동 문제 해결 가이드

## 문제 상황
1. 교회 정보에서 전화번호, 주소 정보가 제대로 로드되지 않음
2. 헌금 종류, 직분 관리, 직분 상태 추가 시 Supabase에 저장되지 않음

## 해결 방법

### 1. 데이터베이스 스키마 업데이트

#### Supabase SQL Editor에서 실행:
```sql
-- database_complete_schema_v2.1.sql 파일의 내용을 실행
-- 또는 아래 명령 직접 실행

-- 1. Churches 테이블 업데이트
ALTER TABLE churches 
ADD COLUMN IF NOT EXISTS church_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS church_address TEXT,
ADD COLUMN IF NOT EXISTS kakao_id VARCHAR(100);

-- 2. Donation Types 테이블 생성
CREATE TABLE IF NOT EXISTS donation_types (
    type_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    type_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Positions 테이블 생성
CREATE TABLE IF NOT EXISTS positions (
    position_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID NOT NULL,
    position_name VARCHAR(100) NOT NULL,
    position_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Position Statuses 테이블 생성
CREATE TABLE IF NOT EXISTS position_statuses (
    status_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID NOT NULL,
    status_name VARCHAR(100) NOT NULL,
    status_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. RLS 정책 설정

```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE donation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_statuses ENABLE ROW LEVEL SECURITY;

-- 모든 작업 허용 (개발 단계)
CREATE POLICY "Allow all" ON donation_types FOR ALL USING (true);
CREATE POLICY "Allow all" ON positions FOR ALL USING (true);
CREATE POLICY "Allow all" ON position_statuses FOR ALL USING (true);
```

### 3. 기본 데이터 삽입

```sql
-- 교회 ID 확인
SELECT church_id, church_name FROM churches;

-- 기본 데이터 삽입 (church_id를 실제 값으로 변경)
INSERT INTO donation_types (church_id, type_name, type_code, sort_order) VALUES
('YOUR_CHURCH_ID', '주정헌금', 'WEEKLY_OFFERING', 1),
('YOUR_CHURCH_ID', '감사헌금', 'THANKSGIVING', 2),
('YOUR_CHURCH_ID', '십일조', 'TITHE', 3),
('YOUR_CHURCH_ID', '선교헌금', 'MISSION', 4),
('YOUR_CHURCH_ID', '절기헌금', 'SEASONAL', 5),
('YOUR_CHURCH_ID', '건축헌금', 'BUILDING', 6),
('YOUR_CHURCH_ID', '임직헌금', 'ORDINATION', 7),
('YOUR_CHURCH_ID', '장학헌금', 'SCHOLARSHIP', 8),
('YOUR_CHURCH_ID', '주일헌금', 'SUNDAY_OFFERING', 9),
('YOUR_CHURCH_ID', '목적헌금', 'PURPOSE_OFFERING', 10)
ON CONFLICT DO NOTHING;

-- 직분 데이터 삽입
INSERT INTO positions (church_id, position_name, position_code, sort_order) VALUES
('YOUR_CHURCH_ID', '목사', 'PASTOR', 1),
('YOUR_CHURCH_ID', '부목사', 'ASSOC_PASTOR', 2),
('YOUR_CHURCH_ID', '전도사', 'EVANGELIST', 3),
('YOUR_CHURCH_ID', '장로', 'ELDER', 4),
('YOUR_CHURCH_ID', '권사', 'DEACONESS', 5),
('YOUR_CHURCH_ID', '안수집사', 'ORDAINED_DEACON', 6),
('YOUR_CHURCH_ID', '집사', 'DEACON', 7),
('YOUR_CHURCH_ID', '성도', 'MEMBER', 8)
ON CONFLICT DO NOTHING;

-- 직분 상태 데이터 삽입
INSERT INTO position_statuses (church_id, status_name, status_code, sort_order) VALUES
('YOUR_CHURCH_ID', '시무', 'ACTIVE', 1),
('YOUR_CHURCH_ID', '은퇴', 'RETIRED', 2),
('YOUR_CHURCH_ID', '협동', 'ASSOCIATE', 3),
('YOUR_CHURCH_ID', '원로', 'EMERITUS', 4),
('YOUR_CHURCH_ID', '직원', 'STAFF', 5)
ON CONFLICT DO NOTHING;
```

### 4. 코드 업데이트 확인

Settings.tsx가 업데이트되어 있는지 확인:
- ✅ 디버깅 로그 추가 (Console에서 확인 가능)
- ✅ 에러 메시지 상세 표시
- ✅ 코드 자동 생성 기능
- ✅ 새로고침 버튼 추가

### 5. 브라우저 디버깅

Chrome DevTools Console에서 확인할 사항:
1. 네트워크 탭에서 Supabase API 호출 확인
2. Console 탭에서 에러 메시지 확인
3. 다음과 같은 로그 확인:
   - "Loading church info for: [church_id]"
   - "Church info query result: {data, error}"
   - "Loading donation types for: [church_id]"

### 6. 문제별 해결 방법

#### 교회 정보가 로드되지 않는 경우:
1. churches 테이블에 필드가 추가되었는지 확인
2. 교회 정보 탭에서 새로고침 버튼 클릭
3. 저장 버튼을 눌러 데이터 업데이트

#### 헌금 종류/직분/직분 상태가 저장되지 않는 경우:
1. 테이블이 생성되었는지 확인
2. RLS 정책이 설정되었는지 확인
3. UUID 형식이 맞는지 확인 (church_id)
4. 코드를 입력하지 않으면 자동 생성됨

### 7. 테스트 순서

1. **교회 정보 저장 테스트**:
   - 전화번호: 02-1234-5678
   - 주소: 서울시 강남구 테스트로 123
   - 카카오톡 ID: test_church_kakao
   - 저장 버튼 클릭

2. **헌금 종류 추가 테스트**:
   - 헌금 종류명: 특별헌금
   - 코드: (비워두면 자동생성)
   - 추가 버튼 클릭

3. **직분 추가 테스트**:
   - 직분명: 협동목사
   - 코드: (비워두면 자동생성)
   - 추가 버튼 클릭

4. **직분 상태 추가 테스트**:
   - 직분 상태명: 임시
   - 코드: (비워두면 자동생성)
   - 추가 버튼 클릭

## 주의사항

1. **Primary Key 형식**:
   - 기존: VARCHAR(50)으로 되어 있을 수 있음
   - 권장: UUID 형식 사용

2. **church_id 확인**:
   - 로그인한 교회의 실제 church_id 값 확인
   - UUID 형식인지 확인

3. **브라우저 캐시**:
   - 강제 새로고침 (Ctrl+Shift+R)
   - localStorage 확인 및 정리

## 배포

```bash
# 빌드
npm run build

# Git 커밋
git add .
git commit -m "fix: Settings Supabase integration and add church info fields"
git push

# Netlify 자동 배포
```

## 지원

문제가 계속되면:
1. Supabase 대시보드에서 직접 데이터 확인
2. Console 로그 스크린샷 첨부하여 문의
3. 네트워크 탭 에러 메시지 확인