# 교회 로고 기능 설정 가이드

## 개요
교회 로고 업로드 및 표시 기능을 구현하였습니다. 이 기능을 통해 각 교회는 자신의 로고를 업로드하고 시스템 전체에서 표시할 수 있습니다.

## 설정 순서

### 1. 데이터베이스 업데이트
`database_logo_update.sql` 파일을 Supabase SQL Editor에서 실행하여 필요한 컬럼을 추가합니다.

```sql
-- churches 테이블에 로고 관련 컬럼 추가
ALTER TABLE churches 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS logo_updated_at TIMESTAMP;
```

### 2. Supabase Storage 버킷 생성

#### 방법 1: Supabase 대시보드에서 수동 생성 (권장)
1. Supabase 대시보드에 로그인
2. Storage 섹션으로 이동
3. "New bucket" 클릭
4. 다음 설정으로 버킷 생성:
   - Name: `church-logos`
   - Public bucket: ✅ (체크)
   - File size limit: `500KB`
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

#### 방법 2: SQL로 생성 (선택사항)
`supabase_storage_setup.sql` 파일을 SQL Editor에서 실행

### 3. Storage 정책 설정
Storage 버킷의 Policies 탭에서 다음 정책들을 추가:

- **Public Access (SELECT)**: 모든 사용자가 로고를 볼 수 있도록 허용
- **Authenticated Upload (INSERT)**: 인증된 사용자만 업로드 가능
- **Authenticated Update (UPDATE)**: 인증된 사용자만 수정 가능  
- **Authenticated Delete (DELETE)**: 인증된 사용자만 삭제 가능

## 기능 사용 방법

### 로고 업로드
1. 설정 페이지로 이동
2. "교회 정보" 탭 선택
3. "교회 로고" 섹션에서 "로고 업로드" 버튼 클릭
4. 이미지 파일 선택 (JPG, PNG, WebP / 최대 500KB)
5. 자동으로 200x200px로 리사이징되어 업로드됨

### 로고가 표시되는 위치
- 좌측 사이드바 (데스크톱)
- 모바일 사이드바
- 상단 헤더 우측 (사용자 정보 옆)
- 로그인 화면 (향후 추가 가능)
- 보고서 헤더 (향후 추가 가능)

## 기술 구현 세부사항

### 컴포넌트 구조
- `ChurchLogo.tsx`: 로고 표시 컴포넌트 (크기 조절 가능)
- `ChurchLogoUpload.tsx`: 로고 업로드 컴포넌트 (리사이징, 업로드, 삭제 기능)
- `Settings.tsx`: 설정 페이지에 로고 업로드 섹션 추가
- `Layout.tsx`: 로고 표시 위치 구현
- `auth.ts`: 로그인 시 로고 URL을 세션에 포함

### 이미지 최적화
- 업로드 시 자동으로 200x200px로 리사이징
- JPEG 포맷으로 변환 (품질 90%)
- 최대 파일 크기: 500KB

### 파일 구조
```
church-logos/
├── {church_id}/
│   └── {church_id}_{timestamp}.jpg
```

## 주의사항

1. **Storage 버킷 생성**: Supabase Storage에 `church-logos` 버킷이 반드시 생성되어 있어야 합니다.
2. **Public 설정**: 버킷은 Public으로 설정되어야 로고가 정상적으로 표시됩니다.
3. **파일 크기**: 500KB를 초과하는 이미지는 업로드되지 않습니다.
4. **이미지 포맷**: JPG, PNG, WebP 포맷만 지원됩니다.
5. **브라우저 호환성**: 모던 브라우저 (Chrome, Firefox, Safari, Edge) 지원

## 문제 해결

### 로고가 업로드되지 않는 경우
1. Supabase Storage 버킷이 생성되었는지 확인
2. 버킷이 Public으로 설정되었는지 확인
3. 파일 크기가 500KB 이하인지 확인
4. 지원되는 이미지 포맷인지 확인

### 로고가 표시되지 않는 경우
1. 브라우저 캐시 삭제 후 재시도
2. 로컬 스토리지의 세션 정보 확인
3. 재로그인 시도

## 향후 개선 사항
- [ ] 로고 크롭 기능 추가
- [ ] 다양한 종횡비 지원
- [ ] SVG 포맷 지원
- [ ] 로고 히스토리 관리
- [ ] 로고 미리보기 개선
