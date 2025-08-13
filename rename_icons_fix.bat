@echo off
setlocal enabledelayedexpansion
cd /d "C:\users\user\church-donation-system\public\icons"

echo ==================================================
echo 교회헌금관리시스템 아이콘 파일명 정리
echo ==================================================
echo.

REM === STEP 1: coms-d를 coms_d로 변경 (다크 모드) ===
echo [1단계] 다크 모드 아이콘 (coms-d를 coms_d로 변경)
echo --------------------------------------------------

REM 숫자만 있는 파일들
if exist "coms-d-20.png" ren "coms-d-20.png" "coms_d-20x20.png"
if exist "coms-d-29.png" ren "coms-d-29.png" "coms_d-29x29.png"
if exist "coms-d-32.png" ren "coms-d-32.png" "coms_d-32x32.png"
if exist "coms-d-40.png" ren "coms-d-40.png" "coms_d-40x40.png"
if exist "coms-d-50.png" ren "coms-d-50.png" "coms_d-50x50.png"
if exist "coms-d-57.png" ren "coms-d-57.png" "coms_d-57x57.png"
if exist "coms-d-58.png" ren "coms-d-58.png" "coms_d-58x58.png"
if exist "coms-d-60.png" ren "coms-d-60.png" "coms_d-60x60.png"
if exist "coms-d-64.png" ren "coms-d-64.png" "coms_d-64x64.png"
if exist "coms-d-72.png" ren "coms-d-72.png" "coms_d-72x72.png"
if exist "coms-d-76.png" ren "coms-d-76.png" "coms_d-76x76.png"
if exist "coms-d-80.png" ren "coms-d-80.png" "coms_d-80x80.png"
if exist "coms-d-87.png" ren "coms-d-87.png" "coms_d-87x87.png"
if exist "coms-d-100.png" ren "coms-d-100.png" "coms_d-100x100.png"
if exist "coms-d-114.png" ren "coms-d-114.png" "coms_d-114x114.png"
if exist "coms-d-120.png" ren "coms-d-120.png" "coms_d-120x120.png"
if exist "coms-d-128.png" ren "coms-d-128.png" "coms_d-128x128.png"
if exist "coms-d-144.png" ren "coms-d-144.png" "coms_d-144x144.png"
if exist "coms-d-152.png" ren "coms-d-152.png" "coms_d-152x152.png"
if exist "coms-d-167.png" ren "coms-d-167.png" "coms_d-167x167.png"
if exist "coms-d-180.png" ren "coms-d-180.png" "coms_d-180x180.png"
if exist "coms-d-192.png" ren "coms-d-192.png" "coms_d-192x192.png"
if exist "coms-d-256.png" ren "coms-d-256.png" "coms_d-256x256.png"
if exist "coms-d-512.png" ren "coms-d-512.png" "coms_d-512x512.png"
if exist "coms-d-1024.png" ren "coms-d-1024.png" "coms_d-1024x1024.png"

REM 중복된 크기 표시 제거
if exist "coms-d-48-48.png" ren "coms-d-48-48.png" "coms_d-48x48.png"
if exist "coms-d-72-72.png" ren "coms-d-72-72.png" "coms_d-72x72.png"
if exist "coms-d-96-96.png" ren "coms-d-96-96.png" "coms_d-96x96.png"
if exist "coms-d-144-144.png" ren "coms-d-144-144.png" "coms_d-144x144.png"
if exist "coms-d-192-192.png" ren "coms-d-192-192.png" "coms_d-192x192.png"
if exist "coms-d-512-512.png" ren "coms-d-512-512.png" "coms_d-512x512.png"

REM 특수 크기들
if exist "coms-d-44x44-72.png" ren "coms-d-44x44-72.png" "coms_d-44x44.png"
if exist "coms-d-150x150-100.png" ren "coms-d-150x150-100.png" "coms_d-150x150.png"
if exist "coms-d-150x150-125.png" (
    if exist "coms_d-150x150.png" (
        echo 경고: coms_d-150x150.png 이미 존재 - coms-d-150x150-125.png 건너뜀
    ) else (
        ren "coms-d-150x150-125.png" "coms_d-150x150.png"
    )
)
if exist "coms-d-310x150-100.png" ren "coms-d-310x150-100.png" "coms_d-310x310.png"

echo.
echo [2단계] 밝은 모드 아이콘 (coms_b 크기 정리)
echo --------------------------------------------------

REM 숫자만 있는 파일들
if exist "coms_b-16.png" ren "coms_b-16.png" "coms_b-16x16.png"
if exist "coms_b-20.png" ren "coms_b-20.png" "coms_b-20x20.png"
if exist "coms_b-29.png" ren "coms_b-29.png" "coms_b-29x29.png"
if exist "coms_b-32.png" ren "coms_b-32.png" "coms_b-32x32.png"
if exist "coms_b-40.png" ren "coms_b-40.png" "coms_b-40x40.png"
if exist "coms_b-50.png" ren "coms_b-50.png" "coms_b-50x50.png"
if exist "coms_b-57.png" ren "coms_b-57.png" "coms_b-57x57.png"
if exist "coms_b-58.png" ren "coms_b-58.png" "coms_b-58x58.png"
if exist "coms_b-60.png" ren "coms_b-60.png" "coms_b-60x60.png"
if exist "coms_b-64.png" ren "coms_b-64.png" "coms_b-64x64.png"
if exist "coms_b-72.png" ren "coms_b-72.png" "coms_b-72x72.png"
if exist "coms_b-76.png" ren "coms_b-76.png" "coms_b-76x76.png"
if exist "coms_b-80.png" ren "coms_b-80.png" "coms_b-80x80.png"
if exist "coms_b-87.png" ren "coms_b-87.png" "coms_b-87x87.png"
if exist "coms_b-100.png" ren "coms_b-100.png" "coms_b-100x100.png"
if exist "coms_b-114.png" ren "coms_b-114.png" "coms_b-114x114.png"
if exist "coms_b-120.png" ren "coms_b-120.png" "coms_b-120x120.png"
if exist "coms_b-128.png" ren "coms_b-128.png" "coms_b-128x128.png"
if exist "coms_b-144.png" ren "coms_b-144.png" "coms_b-144x144.png"
if exist "coms_b-152.png" ren "coms_b-152.png" "coms_b-152x152.png"
if exist "coms_b-167.png" ren "coms_b-167.png" "coms_b-167x167.png"
if exist "coms_b-180.png" ren "coms_b-180.png" "coms_b-180x180.png"
if exist "coms_b-192.png" ren "coms_b-192.png" "coms_b-192x192.png"
if exist "coms_b-256.png" ren "coms_b-256.png" "coms_b-256x256.png"
if exist "coms_b-512.png" ren "coms_b-512.png" "coms_b-512x512.png"
if exist "coms_b-1024.png" ren "coms_b-1024.png" "coms_b-1024x1024.png"

REM 중복된 크기 표시 제거
if exist "coms_b-48-48.png" ren "coms_b-48-48.png" "coms_b-48x48.png"
if exist "coms_b-72-72.png" ren "coms_b-72-72.png" "coms_b-72x72.png"
if exist "coms_b-96-96.png" ren "coms_b-96-96.png" "coms_b-96x96.png"
if exist "coms_b-144-144.png" ren "coms_b-144-144.png" "coms_b-144x144.png"
if exist "coms_b-192-192.png" ren "coms_b-192-192.png" "coms_b-192x192.png"
if exist "coms_b-512-512.png" ren "coms_b-512-512.png" "coms_b-512x512.png"

REM 특수 크기들
if exist "coms_b-44x44-72.png" ren "coms_b-44x44-72.png" "coms_b-44x44.png"
if exist "coms_b-150x150-100.png" ren "coms_b-150x150-100.png" "coms_b-150x150.png"
if exist "coms_b-150x150-150.png" (
    if exist "coms_b-150x150.png" (
        echo 경고: coms_b-150x150.png 이미 존재 - coms_b-150x150-150.png 건너뜀
    ) else (
        ren "coms_b-150x150-150.png" "coms_b-150x150.png"
    )
)
if exist "coms_b-310x150-100.png" ren "coms_b-310x150-100.png" "coms_b-310x310.png"

REM 이미 x 형식인 파일 처리 (coms_b-16x16.png 등)
if exist "coms_b-16x16.png" echo coms_b-16x16.png - 이미 올바른 형식

echo.
echo ==================================================
echo [3단계] 파일 목록 확인
echo ==================================================
echo.

echo --- 밝은 테마 아이콘 (coms_b) ---
dir /b coms_b-*.png 2>nul | sort
echo.

echo --- 다크 테마 아이콘 (coms_d) ---
dir /b coms_d-*.png 2>nul | sort
echo.

echo ==================================================
echo [4단계] 필수 아이콘 확인
echo ==================================================
echo.

set REQUIRED_SIZES=16x16 32x32 44x44 72x72 96x96 128x128 144x144 150x150 152x152 180x180 192x192 310x310 384x384 512x512

echo 필수 아이콘 체크:
echo.

for %%s in (%REQUIRED_SIZES%) do (
    if exist "coms_b-%%s.png" (
        echo [O] coms_b-%%s.png
    ) else (
        echo [X] coms_b-%%s.png - 누락
    )
    if exist "coms_d-%%s.png" (
        echo [O] coms_d-%%s.png
    ) else (
        echo [X] coms_d-%%s.png - 누락
    )
    echo.
)

echo ==================================================
echo 아이콘 파일명 정리 완료!
echo ==================================================
echo.
echo 누락된 아이콘은 기존 큰 아이콘(512x512 또는 1024x1024)을
echo 리사이징하여 생성해야 합니다.
echo.

pause