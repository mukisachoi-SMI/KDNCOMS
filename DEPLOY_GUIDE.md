# COMS 배포 가이드 (Netlify)

## 📝 배포 전 체크리스트

### 1. GitHub 저장소 생성 및 푸시
```bash
# 1. GitHub에서 새 저장소 생성 (mukisachoi-SMI/COMS)

# 2. 로컬에서 Git 초기화 (이미 되어있다면 스킵)
git init

# 3. 원격 저장소 추가
git remote add origin https://github.com/mukisachoi-SMI/COMS.git

# 4. 코드 커밋 및 푸시
git add .
git commit -m "Initial commit: Church Offering Management System"
git branch -M main
git push -u origin main
```

### 2. Netlify 환경변수 설정

Netlify 대시보드에서 다음 환경변수를 설정하세요:

1. **Site settings** → **Environment variables** 클릭
2. 다음 변수 추가:
   - `REACT_APP_SUPABASE_URL`: Supabase 프로젝트 URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Supabase Anon Key

### 3. Netlify 배포 연결

1. Netlify 대시보드에서 COMS 프로젝트 선택
2. **Site configuration** → **Build & deploy** → **Continuous deployment**
3. **Link site to Git** 클릭
4. GitHub 저장소 선택: `mukisachoi-SMI/COMS`
5. 배포 설정:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. **Deploy site** 클릭

### 4. 빌드 상태 확인

- 빌드 로그 모니터링
- 에러 발생 시 로그 확인 및 수정

## 🔐 보안 설정

### Supabase RLS (Row Level Security) 확인
- 모든 테이블에 RLS 활성화 확인
- 적절한 정책(Policy) 설정 확인

### 환경변수 보안
- `.env` 파일은 절대 Git에 커밋하지 않기
- 모든 중요 정보는 Netlify 환경변수로 관리

## 🌐 배포 후 설정

### 1. 커스텀 도메인 (선택사항)
- Netlify에서 커스텀 도메인 추가
- DNS 설정
- HTTPS 자동 적용

### 2. 성능 최적화
- Netlify Analytics 활성화
- 빌드 플러그인 추가 (필요시)

### 3. 모니터링
- Netlify Functions 로그 확인
- 에러 트래킹 설정 (Sentry 등)

## 📱 PWA 설정 확인

### 다크/라이트 모드 아이콘 설정
1. **아이콘 파일 준비**
   - 원본 아이콘 준비:
     - `coms_b_original.png` (브라이트 모드용 - 밝은 배경)
     - `coms_d_original.png` (다크 모드용 - 어두운 배경)
   
2. **아이콘 자동 생성**
   ```bash
   # Windows에서 실행
   generate-icons.bat
   ```
   
   생성되는 파일들 (`/public/icons/` 폴더):
   - 브라이트 모드: coms_b-16x16.png ~ coms_b-512x512.png
   - 다크 모드: coms_d-16x16.png ~ coms_d-512x512.png

3. **manifest 파일 확인**
   - `manifest.json`: 브라이트 모드용 (기본)
   - `manifest-dark.json`: 다크 모드용
   - 시스템 테마에 따라 자동 전환
   - 모든 아이콘 경로가 `/icons/` 폴더를 가리키는지 확인

4. **Service Worker 확인**
   - `service-worker.js`가 모든 아이콘을 캐싱하는지 확인
   - 테마 변경 메시지 처리 로직 확인

5. **브라우저 호환성**
   - Chrome/Edge: 설치 버튼 표시
   - Safari (iOS): 홈 화면에 추가
   - Samsung Internet: 자동 설치 배너

### 배포 후 테스트:
- [ ] PWA 설치 프롬프트 작동
- [ ] 설치된 앱 아이콘이 올바른 이미지로 표시
- [ ] **라이트 모드에서 coms_b 아이콘 표시 확인**
- [ ] **다크 모드에서 coms_d 아이콘 표시 확인**
- [ ] **시스템 테마 변경 시 아이콘 자동 전환 확인**
- [ ] 오프라인 모드 테스트
- [ ] 푸시 알림 (구현 시)
- [ ] 모바일 반응형 디자인
- [ ] iOS Safari에서 홈 화면 추가 테스트
- [ ] Android Chrome에서 설치 테스트
- [ ] Samsung Internet에서 설치 테스트

## 🚀 자동 배포 워크플로우

GitHub main 브랜치에 푸시하면:
1. Netlify가 자동으로 감지
2. 빌드 프로세스 시작
3. 테스트 통과 시 자동 배포
4. 배포 완료 알림

## 📊 배포 URL

배포 완료 후:
- **Production**: `https://coms.netlify.app` (또는 커스텀 도메인)
- **Preview**: 각 PR마다 자동 생성

## 🆘 문제 해결

### 빌드 실패 시
1. Node 버전 확인 (18.x 권장)
2. 패키지 의존성 확인
3. 환경변수 설정 확인

### 404 에러 발생 시
- `netlify.toml`의 리다이렉트 설정 확인
- SPA 라우팅 설정 확인

### Supabase 연결 실패 시
- 환경변수 값 확인
- Supabase 프로젝트 상태 확인
- CORS 설정 확인

## 📝 유지보수

- 정기적인 패키지 업데이트
- 보안 패치 적용
- 백업 주기 설정
- 로그 모니터링
