# 직분 상태 순서 변경 가이드 (v3.0)

## 📋 변경 내용

### 이전 순서 (v2.x)
1. 시무 → 은퇴 → 협동 → 원로 → 직원 → 청년

### ✨ 새로운 순서 (v3.0)
1. **시무 → 청년 → 은퇴 → 협동 → 원로 → 직원**

청년이 2번째로 이동하여 더 논리적인 순서가 되었습니다.

## 🚀 적용 방법

### 방법 1: 간단한 업데이트 (기존 시스템이 있는 경우)

1. **Supabase SQL Editor에서 실행:**

```sql
-- UPDATE_POSITION_STATUS_ORDER_v3.sql 파일 내용 실행
```

이 스크립트는:
- 청년 상태를 추가 (없는 경우)
- 모든 직분 상태 순서를 새롭게 정렬
- 기존 데이터는 모두 보존

### 방법 2: 전체 스키마 재설치 (새 설치 또는 완전 재정비)

1. **Supabase SQL Editor에서 실행:**

```sql
-- database_complete_schema_v3.0.sql 파일 내용 실행
```

### 2. **앱 재시작:**

```bash
# 터미널에서
Ctrl + C  # 중지
npm start # 재시작
```

## ✅ 확인사항

### 1. 설정 페이지 - 직분 상태 탭
- [ ] 시무 (1번)
- [ ] 청년 (2번) ← **새 위치**
- [ ] 은퇴 (3번)
- [ ] 협동 (4번)
- [ ] 원로 (5번)
- [ ] 직원 (6번)

### 2. 교인 관리 페이지
- [ ] 교인 등록/수정 시 직분 상태 드롭다운 순서 확인
- [ ] 기존 교인 데이터 정상 표시

### 3. 보고서/통계
- [ ] 청년 통계가 정상적으로 표시

## 🔍 데이터 확인 SQL

```sql
-- 직분 상태 순서 확인
SELECT 
    status_name,
    status_code,
    sort_order
FROM position_statuses
WHERE church_id = (SELECT church_id FROM churches LIMIT 1)
ORDER BY sort_order;

-- 각 직분 상태별 교인 수
SELECT 
    ps.status_name,
    ps.sort_order,
    COUNT(m.member_id) as member_count
FROM position_statuses ps
LEFT JOIN members m ON ps.status_id = m.position_status_id
GROUP BY ps.status_name, ps.sort_order
ORDER BY ps.sort_order;
```

## ⚠️ 주의사항

1. **기존 데이터는 모두 보존됩니다**
   - 교인 정보 변경 없음
   - 헌금 기록 변경 없음
   - 단순히 표시 순서만 변경

2. **청년 상태가 자동 추가됩니다**
   - 이미 있으면 무시
   - 없으면 자동 생성

3. **롤백이 필요한 경우**
   ```sql
   -- 이전 순서로 되돌리기
   UPDATE position_statuses 
   SET sort_order = CASE 
       WHEN status_code = 'ACTIVE' THEN 1
       WHEN status_code = 'RETIRED' THEN 2  
       WHEN status_code = 'ASSOCIATE' THEN 3
       WHEN status_code = 'EMERITUS' THEN 4
       WHEN status_code = 'STAFF' THEN 5
       WHEN status_code = 'YOUNG' THEN 6
   END;
   ```

## 📊 영향 범위

### 영향 받는 부분:
- ✅ 설정 페이지 - 직분 상태 목록
- ✅ 교인 관리 - 직분 상태 선택 드롭다운
- ✅ 보고서 - 직분 상태별 통계

### 영향 없는 부분:
- ✔️ 교인 데이터
- ✔️ 헌금 기록
- ✔️ 직분 데이터
- ✔️ 로그인/권한

## 🆘 문제 해결

### 문제: 순서가 변경되지 않음
```sql
-- 강제 업데이트
UPDATE position_statuses 
SET sort_order = CASE status_code
    WHEN 'ACTIVE' THEN 1
    WHEN 'YOUNG' THEN 2
    WHEN 'RETIRED' THEN 3
    WHEN 'ASSOCIATE' THEN 4
    WHEN 'EMERITUS' THEN 5
    WHEN 'STAFF' THEN 6
END,
updated_at = NOW();
```

### 문제: 청년이 중복됨
```sql
-- 중복 제거
WITH duplicates AS (
    SELECT status_id,
           ROW_NUMBER() OVER (
               PARTITION BY church_id, status_code 
               ORDER BY sort_order
           ) as rn
    FROM position_statuses
    WHERE status_code = 'YOUNG'
)
DELETE FROM position_statuses
WHERE status_id IN (
    SELECT status_id FROM duplicates WHERE rn > 1
);
```

---

**작성일:** 2025년 1월  
**버전:** 3.0  
**작성자:** 교회헌금관리시스템 팀
