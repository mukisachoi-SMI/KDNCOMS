# 교회 헌금관리시스템 - 설정 페이지 업데이트 가이드

## 📋 수정 내용 요약

1. **교회 정보 페이지 개선**
   - ✅ 전화번호 필드 추가
   - ✅ 주소 필드 추가  
   - ✅ 카카오톡 ID 필드 추가
   - ✅ Supabase와 데이터 연동 강화
   - ✅ 저장 기능 개선

2. **직분 상태 순서 수정**
   - ✅ 기본 순서: 시무 → 은퇴 → 협동 → 원로 → 직원 → 청년
   - ✅ 청년 상태 추가

## 🚀 적용 방법

### 1단계: Supabase 데이터베이스 업데이트

Supabase 대시보드 SQL Editor에서 다음 파일 내용을 실행하세요:

```sql
-- IMMEDIATE_FIX_v2.sql 파일 내용을 복사하여 실행
```

이 SQL은:
- 교회 테이블에 누락된 컬럼 추가 (phone, address, kakao_id)
- 직분 상태 순서 정정
- 중복 데이터 제거

### 2단계: 앱 재시작

```bash
# 개발 서버 중지 (Ctrl+C)
# 다시 시작
npm start
```

### 3단계: 데이터 확인

1. 설정 페이지로 이동
2. 교회 정보 탭 확인
   - 전화번호, 주소, 카카오톡 ID 필드가 표시되는지 확인
   - 정보 입력 후 저장 테스트

3. 직분 상태 탭 확인
   - 순서가 올바른지 확인
   - 시무 → 은퇴 → 협동 → 원로 → 직원 → 청년

## 🔧 문제 해결

### 문제 1: 데이터가 저장되지 않는 경우

```sql
-- Supabase에서 실행
SELECT * FROM churches;
-- church_id 확인 후 수동으로 업데이트
UPDATE churches 
SET 
  church_phone = '02-1234-5678',
  church_address = '서울시 강남구...',
  kakao_id = 'church_kakao'
WHERE church_id = '확인한_ID';
```

### 문제 2: 직분 상태 순서가 잘못된 경우

```sql
-- Supabase에서 실행
UPDATE position_statuses 
SET sort_order = CASE 
    WHEN status_code = 'ACTIVE' THEN 1
    WHEN status_code = 'RETIRED' THEN 2
    WHEN status_code = 'ASSOCIATE' THEN 3
    WHEN status_code = 'EMERITUS' THEN 4
    WHEN status_code = 'STAFF' THEN 5
    WHEN status_code = 'YOUNG' THEN 6
    ELSE sort_order
END;
```

### 문제 3: 청년 상태가 없는 경우

```sql
-- Supabase에서 실행
INSERT INTO position_statuses (church_id, status_name, status_code, is_active, sort_order)
SELECT DISTINCT church_id, '청년', 'YOUNG', true, 6
FROM position_statuses
WHERE church_id NOT IN (
    SELECT church_id FROM position_statuses WHERE status_code = 'YOUNG'
);
```

## ✅ 체크리스트

- [ ] Supabase SQL 실행 완료
- [ ] 앱 재시작 완료
- [ ] 교회 정보 입력 및 저장 테스트 완료
- [ ] 직분 상태 순서 확인 완료
- [ ] 교인 관리에서 직분 상태 선택 테스트 완료

## 📞 추가 지원

문제가 계속되면 다음 정보를 확인해주세요:

1. 브라우저 개발자 도구 Console 에러
2. Supabase 대시보드에서 테이블 구조 확인
3. .env 파일의 Supabase 연결 정보 확인

## 🎯 업데이트 완료 후 예상 결과

1. **교회 정보 페이지**
   - 전화번호, 주소, 카카오톡 ID 입력 가능
   - 저장 버튼 클릭 시 Supabase에 저장
   - 새로고침 후에도 데이터 유지

2. **직분 상태 페이지**
   - 올바른 순서로 표시
   - 새 상태 추가 가능
   - 삭제 기능 정상 작동

3. **교인 관리 페이지**
   - 직분 상태 선택 시 올바른 순서로 표시
   - 통계에 청년 수 표시

---

작성일: 2025년 1월
버전: 2.4
