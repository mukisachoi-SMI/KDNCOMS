@echo off
echo GitHub 업로드를 위한 파일 준비 중...

REM 임시 폴더 생성
mkdir github_upload 2>nul

REM src 폴더 복사
xcopy /E /I /Y src github_upload\src

REM public 폴더 복사  
xcopy /E /I /Y public github_upload\public

REM 루트 파일들 복사
copy package.json github_upload\
copy package-lock.json github_upload\
copy tsconfig.json github_upload\
copy tailwind.config.js github_upload\
copy postcss.config.js github_upload\
copy netlify.toml github_upload\
copy .gitignore github_upload\
copy README.md github_upload\
copy *.sql github_upload\
copy *.md github_upload\

echo.
echo ✅ github_upload 폴더가 생성되었습니다!
echo.
echo 다음 단계:
echo 1. GitHub.com에서 COMS 저장소 열기
echo 2. "uploading an existing file" 클릭
echo 3. github_upload 폴더 내용 전체 드래그 앤 드롭
echo 4. "Commit changes" 클릭
echo.
pause
