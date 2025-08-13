# 교회 정보 필드 업데이트 가이드

## 개요
교회 정보 관리를 개선하여 전화번호, 주소, 카카오톡 ID를 저장하고 관리할 수 있도록 업데이트했습니다.

## 주요 변경사항

### 1. 추가된 필드
- **전화번호** (`church_phone`): 교회 대표 전화번호
- **주소** (`church_address`): 교회 주소 
- **카카오톡 ID** (`kakao_id`): 카카오톡 오픈채팅 또는 플러스친구 ID

### 2. 기능 개선
- 교회 정보를 Supabase에 실제로 저장/불러오기
- 헌금 종류, 직분, 직분 상태도 Supabase와 연동
- 저장된 정보를 카드 형태로 표시
- 아이콘 추가로 시각적 개선

## 설치 방법

### 1. Supabase 테이블 업데이트
Supabase SQL Editor에서 다음 SQL 실행:

```sql
-- churches 테이블에 새 필드 추가
ALTER TABLE churches 
ADD COLUMN IF NOT EXISTS church_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS church_address TEXT,
ADD COLUMN IF NOT EXISTS kakao_id VARCHAR(100);

-- 필드에 대한 코멘트 추가
COMMENT ON COLUMN churches.church_phone IS '교회 대표 전화번호';
COMMENT ON COLUMN churches.church_address IS '교회 주소';
COMMENT ON COLUMN churches.kakao_id IS '교회 카카오톡 ID (상담 및 문의용)';
```

### 2. 코드 업데이트
이미 업데이트된 파일:
- `src/types/index.ts` - Church 인터페이스에 kakao_id 필드 추가
- `src/components/Settings.tsx` - 교회 정보 관리 기능 개선

### 3. 빌드 및 배포
```bash
# 빌드
npm run build

# Netlify 배포
git add .
git commit -m "feat: Add church contact fields (phone, address, kakao_id)"
git push
```

## 사용 방법

### 교회 정보 입력
1. 설정 > 교회 정보 탭으로 이동
2. 다음 정보 입력:
   - 교회명
   - 이메일
   - 전화번호 (예: 02-1234-5678)
   - 카카오톡 ID (오픈채팅방 ID 또는 플러스친구 ID)
   - 주소
3. 저장 버튼 클릭

### 카카오톡 ID 활용 예시
- **오픈채팅방**: 교인들과의 소통 채널
- **플러스친구**: 교회 공식 계정
- **상담용 ID**: 목회 상담 전용 카카오톡

## 데이터베이스 스키마

### churches 테이블 구조
```sql
CREATE TABLE churches (
  church_id UUID PRIMARY KEY,
  church_name VARCHAR(200) NOT NULL,
  admin_id UUID,
  login_id VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(200),
  church_phone VARCHAR(50),        -- 새로 추가
  church_address TEXT,              -- 새로 추가
  kakao_id VARCHAR(100),           -- 새로 추가
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 화면 구성

### 교회 정보 탭
- **기본 정보 섹션**
  - 교회명, 이메일 (필수)
  - 전화번호, 카카오톡 ID (선택)
  - 주소 (선택)
  
- **정보 표시 카드**
  - 저장된 연락처 정보를 한눈에 확인
  - 아이콘으로 구분 (📱 전화, 💬 카카오톡, 📍 주소)

## 보안 고려사항
- 개인정보 보호를 위해 카카오톡 개인 ID 대신 오픈채팅/플러스친구 사용 권장
- RLS 정책으로 교회별 데이터 격리
- 민감한 정보는 암호화하여 저장

## 향후 개선 계획
- [ ] 카카오톡 링크 자동 생성 (오픈채팅방 URL)
- [ ] 지도 API 연동으로 주소 검색 기능
- [ ] 다중 연락처 관리 (부서별)
- [ ] QR 코드 생성 (카카오톡 친구 추가용)

## 문제 해결

### 저장이 안 되는 경우
1. Supabase 연결 확인
2. 테이블 필드 추가 여부 확인
3. RLS 정책 확인
4. 콘솔 에러 메시지 확인

### 데이터가 표시되지 않는 경우
1. 새로고침 후 재시도
2. 네트워크 연결 상태 확인
3. Supabase 대시보드에서 데이터 직접 확인

## 참고 자료
- [Supabase Documentation](https://supabase.com/docs)
- [카카오톡 오픈채팅 가이드](https://open.kakao.com)
- [카카오톡 채널 관리자센터](https://center-pf.kakao.com)