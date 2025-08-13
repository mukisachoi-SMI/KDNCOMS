# 🎯 Git 버전 관리 가이드

## 📌 Phase 1 마일스톤 설정 방법

### 1. Git 초기화 (이미 되어있다면 스킵)
```bash
git init
```

### 2. 현재 상태 커밋
```bash
# 모든 변경사항 추가
git add .

# Phase 1 완료 커밋
git commit -m "feat: Phase 1 Complete - Foundation Release v1.0.0

- ✅ Authentication & Session Management
- ✅ Member Management with Positions
- ✅ Donation Management System  
- ✅ Reports & Analytics Dashboard
- ✅ Church Settings & Customization
- ✅ Church Logo System
- ✅ Responsive UI Design

This marks the completion of Phase 1 with all core features implemented and tested."
```

### 3. 버전 태그 생성
```bash
# 버전 태그 추가
git tag -a v1.0.0 -m "Version 1.0.0 - Phase 1 Foundation Release

Major Features:
- Multi-tenant church management system
- Complete member and donation tracking
- Comprehensive reporting and analytics
- Church branding with logo support
- Fully responsive design

Test Churches:
- 서울교회 (seoulch)
- 가나안 한인교회 (kanaanch)  
- 시드니 갈릴리교회 (galileech)

Release Date: 2025-01-13"

# 태그 확인
git tag -l
```

### 4. GitHub 저장소 연결 (새 저장소인 경우)
```bash
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/[username]/church-donation-system.git

# 기본 브랜치 이름 설정
git branch -M main

# 푸시
git push -u origin main

# 태그도 푸시
git push origin v1.0.0
```

### 5. GitHub Release 생성
1. GitHub 저장소 페이지로 이동
2. "Releases" 클릭
3. "Create a new release" 클릭
4. Tag 선택: `v1.0.0`
5. Release title: `v1.0.0 - Phase 1 Foundation Release`
6. Description에 CHANGELOG 내용 복사
7. "Publish release" 클릭

---

## 📊 브랜치 전략

### Git Flow 적용
```
main (production)
  └── develop (개발)
       ├── feature/phase2-email-notifications
       ├── feature/phase2-pdf-export
       └── feature/phase2-sms-integration
```

### 브랜치 생성 예시
```bash
# develop 브랜치 생성
git checkout -b develop

# Phase 2 기능 개발 시
git checkout -b feature/phase2-email-notifications

# 작업 완료 후 develop에 병합
git checkout develop
git merge feature/phase2-email-notifications

# 릴리즈 준비
git checkout -b release/v1.1.0

# 테스트 완료 후 main 병합
git checkout main
git merge release/v1.1.0
git tag -a v1.1.0 -m "Version 1.1.0 - Phase 2 Communication Features"
```

---

## 📝 커밋 메시지 규칙

### Conventional Commits 사용
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 업무, 패키지 매니저 수정 등
```

### 예시
```bash
git commit -m "feat: 이메일 알림 기능 추가"
git commit -m "fix: 로고 업로드 시 발생하는 메모리 누수 수정"
git commit -m "docs: README에 설치 방법 추가"
```

---

## 🔄 package.json 버전 업데이트

### 1. package.json 수정
```json
{
  "name": "church-donation-system",
  "version": "1.0.0",
  "description": "Korean Church Donation Management System - Phase 1 Complete",
  "author": "Korean Diaspora Network",
  "license": "PRIVATE",
  "keywords": [
    "church",
    "donation",
    "management",
    "korean",
    "헌금관리",
    "교회"
  ],
  "homepage": "https://github.com/[username]/church-donation-system",
  "repository": {
    "type": "git",
    "url": "https://github.com/[username]/church-donation-system.git"
  },
  "bugs": {
    "url": "https://github.com/[username]/church-donation-system/issues"
  }
}
```

### 2. 버전 관리 스크립트 추가
```json
{
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major",
    "release": "npm run build && git push && git push --tags"
  }
}
```

---

## 📅 릴리즈 주기

### 버전 넘버링 (Semantic Versioning)
- **Major (X.0.0)**: 큰 변경사항, 호환성 깨짐
- **Minor (1.X.0)**: 새 기능 추가, 하위 호환
- **Patch (1.0.X)**: 버그 수정, 작은 개선

### 릴리즈 일정
- **Patch**: 필요시 즉시
- **Minor**: 월 1회 (매월 첫째 주 월요일)
- **Major**: 분기별 또는 Phase 완료 시

---

## 🔍 버전 확인 방법

### 현재 버전 확인
```bash
# Git 태그 확인
git describe --tags

# package.json 확인
npm version

# VERSION 파일 확인
cat VERSION
```

### 변경 이력 확인
```bash
# 태그 간 차이 확인
git log v0.9.0..v1.0.0 --oneline

# 상세 변경사항
git diff v0.9.0 v1.0.0
```

---

## 🚀 자동화 도구 (선택사항)

### semantic-release 설치
```bash
npm install --save-dev semantic-release
```

### standard-version 사용
```bash
npm install --save-dev standard-version

# package.json에 추가
"scripts": {
  "release": "standard-version"
}

# 사용
npm run release
```

---

## 📋 체크리스트

### Phase 1 완료 체크리스트 ✅
- [x] 모든 기능 구현 완료
- [x] README.md 업데이트
- [x] CHANGELOG.md 생성
- [x] ROADMAP.md 작성
- [x] VERSION 파일 생성
- [x] 버전 태그 생성 (v1.0.0)
- [ ] GitHub Release 생성
- [ ] 팀 공유 및 피드백 수집

### Phase 2 시작 준비
- [ ] develop 브랜치 생성
- [ ] Phase 2 이슈 생성
- [ ] 마일스톤 설정
- [ ] 스프린트 계획

---

**작성일**: 2025-01-13  
**버전**: 1.0.0  
**작성자**: Church System Development Team
