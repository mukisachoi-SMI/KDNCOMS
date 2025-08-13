@echo off
echo ====================================
echo GitHub 업로드 준비 스크립트
echo ====================================
echo.

REM 업로드 폴더 생성
if exist github_upload rmdir /s /q github_upload
mkdir github_upload

echo [1/4] 소스 파일 복사 중...

REM src 폴더
xcopy /E /I /Y /Q src github_upload\src

REM public 폴더  
xcopy /E /I /Y /Q public github_upload\public

echo [2/4] 설정 파일 복사 중...

REM 루트 파일들 (환경변수 제외)
copy /Y package.json github_upload\ >nul
copy /Y package-lock.json github_upload\ >nul 2>nul
copy /Y tsconfig.json github_upload\ >nul
copy /Y tailwind.config.js github_upload\ >nul
copy /Y postcss.config.js github_upload\ >nul
copy /Y netlify.toml github_upload\ >nul
copy /Y .gitignore github_upload\ >nul
copy /Y README.md github_upload\ >nul 2>nul

echo [3/4] SQL 및 문서 파일 복사 중...

copy /Y *.sql github_upload\ >nul 2>nul
copy /Y *.md github_upload\ >nul 2>nul

echo [4/4] 완료!
echo.
echo ====================================
echo ✅ github_upload 폴더가 준비되었습니다!
echo ====================================
echo.
echo 📋 다음 단계:
echo.
echo 1. 웹 브라우저에서 GitHub 열기:
echo    https://github.com/mukisachoi-SMI/COMS
echo.
echo 2. "Add file" → "Upload files" 클릭
echo.
echo 3. github_upload 폴더 내용 전체를 드래그 앤 드롭
echo.
echo 4. 커밋 메시지 입력:
echo    "Update: Church donation system files"
echo.
echo 5. "Commit changes" 클릭
echo.
echo ⚠️  주의: .env 파일은 포함되지 않았습니다 (보안)
echo.
pause
