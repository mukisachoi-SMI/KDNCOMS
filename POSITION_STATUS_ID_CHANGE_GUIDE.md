# Position Status ID 체계 변경 가이드

## 📋 변경 내용

### 이전: UUID (예: 123e4567-e89b-12d3-a456-426614174000)
### 이후: 체계적 코드 (예: 교회ID_status_001)

| 직분 상태 | 코드 | 이전 ID (UUID) | 새 ID |
|-----------|------|----------------|--------|
| 시무 | ACTIVE | UUID | 교회ID_status_001 |
| 청년 | YOUNG | UUID | 교회ID_status_002 |
| 은퇴 | RETIRED | UUID | 교회ID_status_003 |
| 협동 | ASSOCIATE | UUID | 교회ID_status_004 |
| 원로 | EMERITUS | UUID | 교회ID_status_005 |
| 직원 | STAFF | UUID | 교회ID_status_006 |

## 🚀 실행 순서

### 1단계: Position Status ID 변경
```sql
-- Supabase SQL Editor에서 실행
-- CHANGE_POSITION_STATUS_ID_ONLY.sql 내용 실행
```

이 스크립트는:
- ✅ position_statuses 테이블의 ID를 체계적으로 변경
- ✅ 백업 테이블 자동 생성
- ✅ ID 매핑 정보 저장
- ⚠️ members 테이블은 변경하지 않음

### 2단계: Members 테이블 업데이트
```sql
-- UPDATE_MEMBERS_POSITION_STATUS_ID.sql 내용 실행
```

이 스크립트는:
- ✅ 매핑 정보를 이용해 members 테이블 업데이트
- ✅ 외래키 제약조건 재생성
- ✅ 데이터 무결성 검증

## ⚠️ 실행 전 확인사항

1. **백업 필수**
   - 스크립트가 자동으로 백업 테이블을 생성하지만, 전체 DB 백업 권장

2. **순서 준수**
   - 반드시 1단계 → 2단계 순서로 실행

3. **검증 확인**
   - 각 단계마다 검증 결과 확인
   - 오류가 있으면 ROLLBACK 실행

## 📊 영향 범위

### 변경되는 것:
- position_statuses.status_id (UUID → VARCHAR)
- members.position_status_id (UUID → VARCHAR)

### 변경되지 않는 것:
- 데이터 내용 (이름, 코드 등)
- 다른 테이블들
- 애플리케이션 로직 (ID 타입만 변경)

## 🔍 확인 방법

### SQL로 확인:
```sql
-- Position Status 확인
SELECT status_id, status_name, status_code 
FROM position_statuses 
ORDER BY sort_order;

-- Members 연결 확인
SELECT 
    ps.status_id,
    ps.status_name,
    COUNT(m.member_id) as member_count
FROM position_statuses ps
LEFT JOIN members m ON ps.status_id = m.position_status_id
GROUP BY ps.status_id, ps.status_name
ORDER BY ps.status_id;
```

## 🔧 문제 해결

### 문제: COMMIT 후 오류 발견
```sql
-- 백업에서 복구
DROP TABLE position_statuses CASCADE;
CREATE TABLE position_statuses AS 
SELECT * FROM position_statuses_backup_before_id_change;

-- Members도 복구 필요시
UPDATE members m
SET position_status_id = map.old_id
FROM position_status_id_mapping map
WHERE m.position_status_id = map.new_id;
```

### 문제: 외래키 오류
```sql
-- 고아 레코드 확인
SELECT m.* 
FROM members m
LEFT JOIN position_statuses ps ON m.position_status_id = ps.status_id
WHERE m.position_status_id IS NOT NULL 
AND ps.status_id IS NULL;

-- NULL로 설정
UPDATE members 
SET position_status_id = NULL
WHERE position_status_id NOT IN (
    SELECT status_id FROM position_statuses
);
```

## ✅ 장점

1. **체계적 관리**
   - ID만 봐도 어떤 직분 상태인지 파악 가능
   - 정렬이 자연스럽게 됨

2. **디버깅 용이**
   - UUID보다 읽기 쉬움
   - 교회별로 구분 명확

3. **확장성**
   - 새로운 상태 추가시 007, 008... 순차 부여

## 📝 주의사항

- 이 변경은 **되돌리기 어려움** (백업 필수!)
- 애플리케이션 코드에서 UUID 타입 체크하는 부분 확인 필요
- TypeScript 타입 정의 수정 필요할 수 있음

---

**작성일:** 2025년 1월  
**파일:**
- `CHANGE_POSITION_STATUS_ID_ONLY.sql` - Step 1
- `UPDATE_MEMBERS_POSITION_STATUS_ID.sql` - Step 2