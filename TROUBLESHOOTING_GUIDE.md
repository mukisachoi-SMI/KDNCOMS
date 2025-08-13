# 🔧 설정 화면 문제 해결 가이드

## 📌 문제 상황
1. 카카오톡 ID 항목이 보이지 않음
2. 연락처와 주소가 Supabase와 연동 안됨
3. 직분 상태 청년이 안보이고 순서가 다름

## 🔍 진단 방법

### 1단계: Supabase에서 테이블 구조 확인

```sql
-- 1. Churches 테이블 컬럼 확인 (이것부터 실행!)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'churches'
ORDER BY ordinal_position;
```

**예상 결과:**
- church_phone 컬럼이 있어야 함
- church_address 컬럼이 있어야 함
- kakao_id 컬럼이 있어야 함

**만약 없다면:**
```sql
-- 컬럼 추가
ALTER TABLE churches 
ADD COLUMN IF NOT EXISTS church_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS church_address TEXT,
ADD COLUMN IF NOT EXISTS kakao_id VARCHAR(100);
```

### 2단계: 교회 ID 확인

```sql
-- 교회 정보와 ID 확인
SELECT church_id, church_name, email, church_phone, church_address, kakao_id 
FROM churches;
```

**교회 ID를 복사해두세요!** (예: `d0f5c5c4-8b1b-4c7f-9e6a-123456789abc`)

### 3단계: 직분 상태 데이터 확인

```sql
-- 직분 상태 확인
SELECT status_name, status_code, sort_order 
FROM position_statuses 
WHERE church_id = '여기에_교회_ID_붙여넣기'
ORDER BY sort_order;
```

## 🛠️ 해결 방법

### 방법 1: 전체 스키마 재실행

```sql
-- database_complete_schema_v2.3.sql 전체 내용 실행
-- (위에 제공된 SQL 전체 복사 후 실행)
```

### 방법 2: 기본 데이터 재삽입

```sql
-- 1. 기존 데이터 삭제 (선택사항)
DELETE FROM position_statuses WHERE church_id = '여기에_교회_ID';

-- 2. 기본 데이터 삽입
SELECT insert_default_church_data('여기에_교회_ID');

-- 3. 또는 직분 상태만 수동 삽입
INSERT INTO position_statuses (church_id, status_name, status_code, sort_order, is_active) VALUES
('여기에_교회_ID', '시무', 'ACTIVE', 1, true),
('여기에_교회_ID', '청년', 'YOUNG', 2, true),
('여기에_교회_ID', '은퇴', 'RETIRED', 3, true),
('여기에_교회_ID', '협동', 'ASSOCIATE', 4, true),
('여기에_교회_ID', '원로', 'EMERITUS', 5, true),
('여기에_교회_ID', '직원', 'STAFF', 6, true)
ON CONFLICT (church_id, status_code) 
DO UPDATE SET 
  sort_order = EXCLUDED.sort_order,
  status_name = EXCLUDED.status_name;
```

### 방법 3: 순서만 업데이트

```sql
-- 직분 상태 순서만 업데이트
UPDATE position_statuses SET sort_order = 1 WHERE church_id = '여기에_교회_ID' AND status_code = 'ACTIVE';
UPDATE position_statuses SET sort_order = 2 WHERE church_id = '여기에_교회_ID' AND status_code = 'YOUNG';
UPDATE position_statuses SET sort_order = 3 WHERE church_id = '여기에_교회_ID' AND status_code = 'RETIRED';
UPDATE position_statuses SET sort_order = 4 WHERE church_id = '여기에_교회_ID' AND status_code = 'ASSOCIATE';
UPDATE position_statuses SET sort_order = 5 WHERE church_id = '여기에_교회_ID' AND status_code = 'EMERITUS';
UPDATE position_statuses SET sort_order = 6 WHERE church_id = '여기에_교회_ID' AND status_code = 'STAFF';
```

## 🔄 브라우저에서 확인

### 1. 캐시 강제 새로고침
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 2. localStorage 초기화
브라우저 콘솔(F12)에서:
```javascript
// localStorage 확인
console.log(localStorage.getItem('church-session'));

// 필요시 초기화
localStorage.clear();
location.reload();
```

### 3. 설정 화면 새로고침
- 설정 > 교회 정보 탭에서 🔄 새로고침 버튼 클릭
- 각 탭 이동하며 데이터 확인

## 📊 데이터 확인 SQL

```sql
-- 모든 데이터 한번에 확인
SELECT 
  '=== Churches ===' as section,
  church_id, church_name, church_phone, church_address, kakao_id 
FROM churches
UNION ALL
SELECT 
  '=== Position Statuses ===',
  church_id::text, status_name, status_code, sort_order::text, is_active::text
FROM position_statuses
WHERE church_id = (SELECT church_id FROM churches LIMIT 1)
ORDER BY 1, 4;
```

## ⚠️ 주의사항

1. **church_id 형식**
   - UUID 형식이어야 함 (예: `d0f5c5c4-8b1b-4c7f-9e6a-123456789abc`)
   - VARCHAR 형식인 경우 타입 변환 필요

2. **RLS 정책**
   - 모든 테이블에 RLS가 활성화되어 있어야 함
   - 정책이 너무 제한적이면 데이터 접근 불가

3. **브라우저 콘솔 확인**
   - F12 > Console 탭에서 에러 확인
   - 네트워크 탭에서 Supabase API 호출 확인

## 🆘 그래도 안되면?

1. **Supabase 대시보드에서 직접 확인**
   - Table Editor에서 데이터 직접 수정
   - SQL Editor에서 쿼리 실행

2. **전체 리셋 (최후의 수단)**
```sql
-- 주의: 모든 설정 데이터 삭제됨!
TRUNCATE donation_types, positions, position_statuses CASCADE;

-- 다시 기본 데이터 삽입
SELECT insert_default_church_data('여기에_교회_ID');
```

3. **스크린샷 제공**
   - 브라우저 콘솔 에러
   - Supabase 테이블 구조
   - 설정 화면 캡처

## ✅ 정상 작동 확인 리스트

- [ ] Churches 테이블에 church_phone, church_address, kakao_id 컬럼 존재
- [ ] 교회 정보 탭에서 카카오톡 ID 필드 표시
- [ ] 전화번호, 주소 저장 후 새로고침해도 유지
- [ ] 직분 상태에 청년 표시
- [ ] 직분 상태 순서: 시무→청년→은퇴→협동→원로→직원
- [ ] 헌금 종류 추가/삭제 정상 작동
- [ ] 직분 추가/삭제 정상 작동