@echo off
echo ===========================================
echo PWA 아이콘 생성 스크립트
echo ===========================================
echo.
echo 이 스크립트를 실행하기 전에:
echo 1. ImageMagick이 설치되어 있어야 합니다
echo    다운로드: https://imagemagick.org/script/download.php
echo.
echo 2. 원본 아이콘 파일이 필요합니다:
echo    - coms_b_original.png (브라이트 모드)
echo    - coms_d_original.png (다크 모드)
echo.
echo 준비가 되었으면 아무 키나 누르세요...
pause > nul

REM icons 디렉토리 생성
if not exist "public\icons" mkdir "public\icons"

echo.
echo 브라이트 모드 아이콘 생성 중...
echo -------------------------------

if exist "coms_b_original.png" (
    magick convert "coms_b_original.png" -resize 16x16 "public\icons\coms_b-16x16.png"
    echo [완료] coms_b-16x16.png
    
    magick convert "coms_b_original.png" -resize 32x32 "public\icons\coms_b-32x32.png"
    echo [완료] coms_b-32x32.png
    
    magick convert "coms_b_original.png" -resize 72x72 "public\icons\coms_b-72x72.png"
    echo [완료] coms_b-72x72.png
    
    magick convert "coms_b_original.png" -resize 96x96 "public\icons\coms_b-96x96.png"
    echo [완료] coms_b-96x96.png
    
    magick convert "coms_b_original.png" -resize 128x128 "public\icons\coms_b-128x128.png"
    echo [완료] coms_b-128x128.png
    
    magick convert "coms_b_original.png" -resize 144x144 "public\icons\coms_b-144x144.png"
    echo [완료] coms_b-144x144.png
    
    magick convert "coms_b_original.png" -resize 152x152 "public\icons\coms_b-152x152.png"
    echo [완료] coms_b-152x152.png
    
    magick convert "coms_b_original.png" -resize 192x192 "public\icons\coms_b-192x192.png"
    echo [완료] coms_b-192x192.png
    
    magick convert "coms_b_original.png" -resize 384x384 "public\icons\coms_b-384x384.png"
    echo [완료] coms_b-384x384.png
    
    magick convert "coms_b_original.png" -resize 512x512 "public\icons\coms_b-512x512.png"
    echo [완료] coms_b-512x512.png
    
    REM favicon.ico 생성
    magick convert "coms_b_original.png" -resize 16x16 -resize 32x32 -resize 48x48 "public\favicon.ico"
    echo [완료] favicon.ico
) else (
    echo [경고] coms_b_original.png 파일을 찾을 수 없습니다!
)

echo.
echo 다크 모드 아이콘 생성 중...
echo -------------------------------

if exist "coms_d_original.png" (
    magick convert "coms_d_original.png" -resize 16x16 "public\icons\coms_d-16x16.png"
    echo [완료] coms_d-16x16.png
    
    magick convert "coms_d_original.png" -resize 32x32 "public\icons\coms_d-32x32.png"
    echo [완료] coms_d-32x32.png
    
    magick convert "coms_d_original.png" -resize 72x72 "public\icons\coms_d-72x72.png"
    echo [완료] coms_d-72x72.png
    
    magick convert "coms_d_original.png" -resize 96x96 "public\icons\coms_d-96x96.png"
    echo [완료] coms_d-96x96.png
    
    magick convert "coms_d_original.png" -resize 128x128 "public\icons\coms_d-128x128.png"
    echo [완료] coms_d-128x128.png
    
    magick convert "coms_d_original.png" -resize 144x144 "public\icons\coms_d-144x144.png"
    echo [완료] coms_d-144x144.png
    
    magick convert "coms_d_original.png" -resize 152x152 "public\icons\coms_d-152x152.png"
    echo [완료] coms_d-152x152.png
    
    magick convert "coms_d_original.png" -resize 192x192 "public\icons\coms_d-192x192.png"
    echo [완료] coms_d-192x192.png
    
    magick convert "coms_d_original.png" -resize 384x384 "public\icons\coms_d-384x384.png"
    echo [완료] coms_d-384x384.png
    
    magick convert "coms_d_original.png" -resize 512x512 "public\icons\coms_d-512x512.png"
    echo [완료] coms_d-512x512.png
) else (
    echo [경고] coms_d_original.png 파일을 찾을 수 없습니다!
)

echo.
echo ===========================================
echo 아이콘 생성 완료!
echo ===========================================
echo.
echo 다음 단계:
echo 1. npm run build 실행
echo 2. Netlify에 배포
echo 3. PWA 설치 테스트
echo.
echo 아무 키나 누르면 종료합니다...
pause > nul