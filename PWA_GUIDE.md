# 📱 PWA (Progressive Web App) 가이드

## ✅ PWA 지원 현황

교회 헌금관리시스템은 **완전한 PWA**로 구현되어 있습니다!

### 🎯 PWA 기능 체크리스트

| 기능 | 상태 | 파일/컴포넌트 |
|------|------|--------------|
| **Manifest** | ✅ | `public/manifest.json` |
| **Service Worker** | ✅ | `public/service-worker.js` |
| **HTTPS** | ✅ | Production 필수 |
| **반응형 디자인** | ✅ | 모든 컴포넌트 |
| **오프라인 지원** | ✅ | Service Worker 캐싱 |
| **설치 프롬프트** | ✅ | `PWAInstallPrompt.tsx` |
| **아이콘 세트** | ✅ | 16x16 ~ 512x512 |
| **다크모드 대응** | ✅ | `manifest-dark.json` |
| **iOS 지원** | ✅ | Apple 메타태그 |
| **스플래시 스크린** | ✅ | 자동 생성 |

---

## 📱 앱 설치 방법

### Android (Chrome/Samsung Internet)
1. Chrome으로 사이트 접속
2. **"앱으로 설치하기"** 팝업 자동 표시
3. **"설치"** 버튼 클릭
4. 홈 화면에 앱 아이콘 생성

### iPhone/iPad (Safari)
1. Safari로 사이트 접속
2. 하단 **공유 버튼** (□↑) 탭
3. **"홈 화면에 추가"** 선택
4. 오른쪽 상단 **"추가"** 탭

### Desktop (Chrome/Edge)
1. 주소창 오른쪽 **설치 아이콘** (⊕) 클릭
2. 또는 메뉴(⋮) > **"앱 설치"**
3. 데스크톱 앱으로 실행

---

## 🚀 빌드 및 배포

### 개발 환경 테스트
```bash
# 개발 서버 (PWA 일부 기능 제한)
npm start

# Production 빌드
npm run build

# HTTPS로 로컬 테스트 (PWA 전체 기능)
npm run serve:pwa
# http://localhost:3000 접속
```

### Production 배포 체크리스트
- [x] HTTPS 인증서 설정
- [x] manifest.json 접근 가능
- [x] service-worker.js 접근 가능
- [x] 모든 아이콘 파일 업로드
- [x] 도메인 설정

---

## 🎨 PWA 특징

### 1. 오프라인 지원
- 기본 페이지 캐싱
- 정적 리소스 캐싱
- 네트워크 재연결 시 자동 동기화

### 2. 앱처럼 동작
- 전체화면 모드
- 스플래시 스크린
- 네이티브 앱 느낌
- 시스템 트레이 아이콘

### 3. 빠른 실행
- 홈 화면에서 바로 실행
- 브라우저 UI 없음
- 빠른 로딩 속도

### 4. 자동 업데이트
- Service Worker 자동 업데이트
- 새 버전 알림
- 백그라운드 업데이트

---

## 📊 Lighthouse PWA 테스트

### 테스트 방법
```bash
# Lighthouse CLI 설치
npm install -g lighthouse

# PWA 테스트 실행
lighthouse http://localhost:3000 --view
```

### Chrome DevTools에서 테스트
1. F12 > Lighthouse 탭
2. Categories: PWA 체크
3. "Analyze page load" 클릭

### 예상 점수
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 100
- **SEO**: 90+
- **PWA**: ✅ 모든 항목 통과

---

## 🔧 PWA 디버깅

### Chrome DevTools
1. F12 > Application 탭
2. 확인 항목:
   - **Manifest**: 정상 로드 확인
   - **Service Workers**: 활성화 상태
   - **Cache Storage**: 캐시된 파일 목록
   - **Storage**: 용량 사용량

### 일반적인 문제 해결

#### "설치할 수 없음" 오류
- HTTPS 연결 확인
- manifest.json 접근 가능 확인
- 192x192, 512x512 아이콘 필수

#### Service Worker 미작동
- HTTPS 환경 필수
- 캐시 삭제 후 재시도
- Console 에러 확인

#### iOS 설치 안됨
- Safari 사용 필수
- Private 모드 해제
- 메타태그 확인

---

## 📈 PWA 업그레이드 (Phase 2)

### 계획된 기능
- [ ] 푸시 알림
- [ ] 백그라운드 동기화
- [ ] 위치 기반 서비스
- [ ] 카메라 API (영수증 스캔)
- [ ] Web Share API
- [ ] Web Payment API

---

## 🌐 브라우저 지원

| 브라우저 | PWA 설치 | 오프라인 | 푸시 알림 |
|---------|----------|---------|-----------|
| Chrome 93+ | ✅ | ✅ | 🔄 |
| Edge 93+ | ✅ | ✅ | 🔄 |
| Safari 11.3+ | ✅ | ✅ | ❌ |
| Firefox 57+ | ⚠️ | ✅ | 🔄 |
| Samsung Internet | ✅ | ✅ | 🔄 |

✅ 완전 지원 | ⚠️ 부분 지원 | ❌ 미지원 | 🔄 개발 예정

---

## 📱 모바일 최적화

### 완료된 최적화
- ✅ 터치 최적화 UI
- ✅ 하단 네비게이션
- ✅ 스와이프 제스처 준비
- ✅ 모바일 키보드 대응
- ✅ 안전영역 (Safe Area) 대응
- ✅ 뷰포트 최적화

### 권장 사양
- **최소**: Android 5.0+ / iOS 11.3+
- **권장**: Android 8.0+ / iOS 14+
- **네트워크**: 3G 이상
- **메모리**: 2GB 이상

---

## 🎯 사용자 경험 팁

### 설치 유도 방법
1. 로그인 성공 후 설치 프롬프트
2. 설정 메뉴에 설치 가이드
3. 첫 방문 시 안내 팝업

### PWA 장점 안내
- "더 빠른 접속"
- "오프라인에서도 사용"
- "홈 화면에서 바로 실행"
- "알림 받기" (Phase 2)

---

## 📞 지원

PWA 관련 문의사항은 시스템 관리자에게 연락하세요.

**Version**: 1.0.0  
**Last Updated**: 2025-01-13
