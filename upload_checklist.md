# GitHub 업로드 체크리스트

## ✅ 반드시 업로드해야 할 파일/폴더:

### 📁 폴더
- [ ] `/src` - 모든 소스 코드
- [ ] `/public` - PWA 파일, 아이콘 등
- [ ] `/.github` - GitHub Actions 설정

### 📄 루트 파일들
- [ ] `package.json` - 프로젝트 설정
- [ ] `package-lock.json` - 의존성 잠금
- [ ] `tsconfig.json` - TypeScript 설정
- [ ] `tailwind.config.js` - Tailwind CSS 설정
- [ ] `postcss.config.js` - PostCSS 설정
- [ ] `netlify.toml` - Netlify 배포 설정
- [ ] `.gitignore` - Git 제외 설정
- [ ] `README.md` - 프로젝트 설명
- [ ] 기타 `.md` 파일들 (문서)
- [ ] 기타 `.sql` 파일들 (DB 스키마)

## ❌ 업로드하면 안 되는 폴더:
- [ ] `/node_modules` - 패키지 (자동 설치됨)
- [ ] `/build` - 빌드 결과물 (자동 생성됨)
- [ ] `.env` - 환경변수 (보안상 제외)

## 📝 업로드 순서:
1. 위 체크리스트의 파일/폴더 선택
2. GitHub 저장소 페이지에서 드래그 앤 드롭
3. Commit message: "Initial commit: Church Offering Management System"
4. **Commit directly to the main branch** 선택
5. **Commit changes** 클릭

## 🔗 업로드 후:
1. Netlify 대시보드로 이동
2. COMS 프로젝트 선택
3. GitHub 저장소 연결
4. 환경변수 설정
5. 배포 시작!
