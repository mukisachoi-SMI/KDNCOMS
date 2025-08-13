@echo off
setlocal enabledelayedexpansion

cd /d C:\users\user\church-donation-system\public\icons

echo ====================================
echo 아이콘 파일명 정리 시작
echo ====================================
echo.

REM === 밝은 테마 아이콘 (coms_b) ===
echo [밝은 테마 아이콘 정리]

REM 기본 크기들
ren "coms_b-16.png" "coms_b-16x16.png" 2>nul
ren "coms_b-20.png" "coms_b-20x20.png" 2>nul
ren "coms_b-29.png" "coms_b-29x29.png" 2>nul
ren "coms_b-32.png" "coms_b-32x32.png" 2>nul
ren "coms_b-40.png" "coms_b-40x40.png" 2>nul
ren "coms_b-50.png" "coms_b-50x50.png" 2>nul
ren "coms_b-57.png" "coms_b-57x57.png" 2>nul
ren "coms_b-58.png" "coms_b-58x58.png" 2>nul
ren "coms_b-60.png" "coms_b-60x60.png" 2>nul
ren "coms_b-64.png" "coms_b-64x64.png" 2>nul
ren "coms_b-72.png" "coms_b-72x72.png" 2>nul
ren "coms_b-76.png" "coms_b-76x76.png" 2>nul
ren "coms_b-80.png" "coms_b-80x80.png" 2>nul
ren "coms_b-87.png" "coms_b-87x87.png" 2>nul
ren "coms_b-100.png" "coms_b-100x100.png" 2>nul
ren "coms_b-114.png" "coms_b-114x114.png" 2>nul
ren "coms_b-120.png" "coms_b-120x120.png" 2>nul
ren "coms_b-128.png" "coms_b-128x128.png" 2>nul
ren "coms_b-144.png" "coms_b-144x144.png" 2>nul
ren "coms_b-152.png" "coms_b-152x152.png" 2>nul
ren "coms_b-167.png" "coms_b-167x167.png" 2>nul
ren "coms_b-180.png" "coms_b-180x180.png" 2>nul
ren "coms_b-192.png" "coms_b-192x192.png" 2>nul
ren "coms_b-256.png" "coms_b-256x256.png" 2>nul
ren "coms_b-512.png" "coms_b-512x512.png" 2>nul
ren "coms_b-1024.png" "coms_b-1024x1024.png" 2>nul

REM 중복된 크기 표시 제거
ren "coms_b-48-48.png" "coms_b-48x48.png" 2>nul
ren "coms_b-72-72.png" "coms_b-72x72.png" 2>nul
ren "coms_b-96-96.png" "coms_b-96x96.png" 2>nul
ren "coms_b-144-144.png" "coms_b-144x144.png" 2>nul
ren "coms_b-192-192.png" "coms_b-192x192.png" 2>nul
ren "coms_b-512-512.png" "coms_b-512x512.png" 2>nul

REM 특수 크기들
ren "coms_b-44x44-72.png" "coms_b-44x44.png" 2>nul
ren "coms_b-150x150-100.png" "coms_b-150x150.png" 2>nul
ren "coms_b-150x150-150.png" "coms_b-150x150.png" 2>nul
ren "coms_b-310x150-100.png" "coms_b-310x310.png" 2>nul

echo.

REM === 다크 테마 아이콘 (coms-d → coms_d) ===
echo [다크 테마 아이콘 정리]

REM 하이픈을 언더스코어로 변경하면서 크기 정리
ren "coms-d-16.png" "coms_d-16x16.png" 2>nul
ren "coms-d-20.png" "coms_d-20x20.png" 2>nul
ren "coms-d-29.png" "coms_d-29x29.png" 2>nul
ren "coms-d-32.png" "coms_d-32x32.png" 2>nul
ren "coms-d-40.png" "coms_d-40x40.png" 2>nul
ren "coms-d-50.png" "coms_d-50x50.png" 2>nul
ren "coms-d-57.png" "coms_d-57x57.png" 2>nul
ren "coms-d-58.png" "coms_d-58x58.png" 2>nul
ren "coms-d-60.png" "coms_d-60x60.png" 2>nul
ren "coms-d-64.png" "coms_d-64x64.png" 2>nul
ren "coms-d-72.png" "coms_d-72x72.png" 2>nul
ren "coms-d-76.png" "coms_d-76x76.png" 2>nul
ren "coms-d-80.png" "coms_d-80x80.png" 2>nul
ren "coms-d-87.png" "coms_d-87x87.png" 2>nul
ren "coms-d-100.png" "coms_d-100x100.png" 2>nul
ren "coms-d-114.png" "coms_d-114x114.png" 2>nul
ren "coms-d-120.png" "coms_d-120x120.png" 2>nul
ren "coms-d-128.png" "coms_d-128x128.png" 2>nul
ren "coms-d-144.png" "coms_d-144x144.png" 2>nul
ren "coms-d-152.png" "coms_d-152x152.png" 2>nul
ren "coms-d-167.png" "coms_d-167x167.png" 2>nul
ren "coms-d-180.png" "coms_d-180x180.png" 2>nul
ren "coms-d-192.png" "coms_d-192x192.png" 2>nul
ren "coms-d-256.png" "coms_d-256x256.png" 2>nul
ren "coms-d-512.png" "coms_d-512x512.png" 2>nul
ren "coms-d-1024.png" "coms_d-1024x1024.png" 2>nul

REM 중복된 크기 표시 제거
ren "coms-d-48-48.png" "coms_d-48x48.png" 2>nul
ren "coms-d-72-72.png" "coms_d-72x72.png" 2>nul
ren "coms-d-96-96.png" "coms_d-96x96.png" 2>nul
ren "coms-d-144-144.png" "coms_d-144x144.png" 2>nul
ren "coms-d-192-192.png" "coms_d-192x192.png" 2>nul
ren "coms-d-512-512.png" "coms_d-512x512.png" 2>nul

REM 특수 크기들
ren "coms-d-44x44-72.png" "coms_d-44x44.png" 2>nul
ren "coms-d-150x150-100.png" "coms_d-150x150.png" 2>nul
ren "coms-d-150x150-125.png" "coms_d-150x150.png" 2>nul
ren "coms-d-310x150-100.png" "coms_d-310x310.png" 2>nul

echo.
echo ====================================
echo 파일명 정리 완료!
echo ====================================
echo.

REM 현재 파일 목록 표시
echo [정리된 파일 목록]
echo.
echo --- 밝은 테마 아이콘 (coms_b) ---
dir /b coms_b-*.png 2>nul
echo.
echo --- 다크 테마 아이콘 (coms_d) ---
dir /b coms_d-*.png 2>nul
echo.

REM 필수 아이콘 확인
echo ====================================
echo [필수 아이콘 확인]
echo ====================================
echo.

set sizes=16x16 32x32 44x44 72x72 96x96 128x128 144x144 150x150 152x152 180x180 192x192 310x310 384x384 512x512

for %%s in (%sizes%) do (
    if exist "coms_b-%%s.png" (
        echo [OK] coms_b-%%s.png
    ) else (
        echo [누락] coms_b-%%s.png
    )
    
    if exist "coms_d-%%s.png" (
        echo [OK] coms_d-%%s.png
    ) else (
        echo [누락] coms_d-%%s.png
    )
    echo.
)

pause