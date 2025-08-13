# 교회헌금관리시스템 - 누락된 아이콘 자동 생성 스크립트
# PowerShell 5.0 이상 필요

param(
    [string]$IconsPath = "C:\users\user\church-donation-system\public\icons"
)

# 필수 아이콘 크기 정의
$requiredSizes = @(
    16, 32, 44, 48, 72, 96, 128, 144, 150, 152, 180, 192, 310, 384, 512
)

# 추가 iOS 크기
$iosSizes = @(
    20, 29, 40, 57, 58, 60, 76, 80, 87, 114, 120, 167
)

# 모든 크기 합치기
$allSizes = $requiredSizes + $iosSizes | Sort-Object -Unique

function Resize-Image {
    param(
        [string]$sourcePath,
        [string]$destinationPath,
        [int]$width,
        [int]$height
    )
    
    try {
        Add-Type -AssemblyName System.Drawing
        
        $sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
        $resizedImage = New-Object System.Drawing.Bitmap($width, $height)
        
        $graphics = [System.Drawing.Graphics]::FromImage($resizedImage)
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        
        $graphics.DrawImage($sourceImage, 0, 0, $width, $height)
        
        $resizedImage.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $graphics.Dispose()
        $resizedImage.Dispose()
        $sourceImage.Dispose()
        
        return $true
    }
    catch {
        Write-Host "Error resizing image: $_" -ForegroundColor Red
        return $false
    }
}

function Generate-MissingIcons {
    param(
        [string]$prefix,
        [string]$themeName
    )
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "$themeName 테마 아이콘 생성" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    # 소스 이미지 찾기 (가장 큰 이미지 사용)
    $sourceImage = $null
    $preferredSources = @(1024, 512, 256, 192, 144, 128)
    
    foreach ($size in $preferredSources) {
        $testPath = Join-Path $IconsPath "${prefix}-${size}x${size}.png"
        if (Test-Path $testPath) {
            $sourceImage = $testPath
            Write-Host "소스 이미지: ${prefix}-${size}x${size}.png" -ForegroundColor Green
            break
        }
    }
    
    if (-not $sourceImage) {
        Write-Host "❌ 소스 이미지를 찾을 수 없습니다!" -ForegroundColor Red
        return
    }
    
    $generatedCount = 0
    $skippedCount = 0
    
    foreach ($size in $allSizes) {
        $targetFile = "${prefix}-${size}x${size}.png"
        $targetPath = Join-Path $IconsPath $targetFile
        
        if (Test-Path $targetPath) {
            Write-Host "⏭️  $targetFile - 이미 존재" -ForegroundColor Gray
            $skippedCount++
        }
        else {
            Write-Host "🔨 $targetFile 생성 중..." -NoNewline
            if (Resize-Image -sourcePath $sourceImage -destinationPath $targetPath -width $size -height $size) {
                Write-Host " ✅" -ForegroundColor Green
                $generatedCount++
            }
            else {
                Write-Host " ❌" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "`n결과: $generatedCount 개 생성, $skippedCount 개 건너뜀" -ForegroundColor Yellow
}

# 메인 실행
Write-Host "===================================================" -ForegroundColor Magenta
Write-Host "교회헌금관리시스템 아이콘 생성기" -ForegroundColor Magenta
Write-Host "===================================================" -ForegroundColor Magenta
Write-Host "경로: $IconsPath" -ForegroundColor White

# 디렉토리 확인
if (-not (Test-Path $IconsPath)) {
    Write-Host "❌ 아이콘 디렉토리를 찾을 수 없습니다!" -ForegroundColor Red
    exit 1
}

Set-Location $IconsPath

# 밝은 테마 아이콘 생성
Generate-MissingIcons -prefix "coms_b" -themeName "밝은(Bright)"

# 다크 테마 아이콘 생성
Generate-MissingIcons -prefix "coms_d" -themeName "다크(Dark)"

# 특수 크기 처리 (384x384는 필수이지만 소스가 없을 수 있음)
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "특수 크기 아이콘 확인" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$specialSizes = @(384)
foreach ($size in $specialSizes) {
    foreach ($prefix in @("coms_b", "coms_d")) {
        $targetFile = "${prefix}-${size}x${size}.png"
        $targetPath = Join-Path $IconsPath $targetFile
        
        if (-not (Test-Path $targetPath)) {
            Write-Host "⚠️  $targetFile 누락 - 512x512에서 생성 시도..." -ForegroundColor Yellow
            
            $source512 = Join-Path $IconsPath "${prefix}-512x512.png"
            if (Test-Path $source512) {
                if (Resize-Image -sourcePath $source512 -destinationPath $targetPath -width $size -height $size) {
                    Write-Host "✅ $targetFile 생성 완료" -ForegroundColor Green
                }
            }
        }
    }
}

# 최종 검증
Write-Host "`n===================================================" -ForegroundColor Magenta
Write-Host "최종 아이콘 상태 확인" -ForegroundColor Magenta
Write-Host "===================================================" -ForegroundColor Magenta

$brightIcons = Get-ChildItem -Path $IconsPath -Filter "coms_b-*.png" | Measure-Object
$darkIcons = Get-ChildItem -Path $IconsPath -Filter "coms_d-*.png" | Measure-Object

Write-Host "밝은 테마 아이콘: $($brightIcons.Count)개" -ForegroundColor Cyan
Write-Host "다크 테마 아이콘: $($darkIcons.Count)개" -ForegroundColor Cyan

# PWA 필수 크기 확인
Write-Host "`nPWA 필수 크기 확인:" -ForegroundColor Yellow
$pwaRequired = @(72, 96, 128, 144, 152, 192, 384, 512)
$allPresent = $true

foreach ($size in $pwaRequired) {
    $brightFile = "coms_b-${size}x${size}.png"
    $darkFile = "coms_d-${size}x${size}.png"
    
    $brightExists = Test-Path (Join-Path $IconsPath $brightFile)
    $darkExists = Test-Path (Join-Path $IconsPath $darkFile)
    
    if ($brightExists -and $darkExists) {
        Write-Host "[✓] ${size}x${size}" -ForegroundColor Green
    }
    else {
        Write-Host "[✗] ${size}x${size}" -ForegroundColor Red
        if (-not $brightExists) { Write-Host "    - $brightFile 누락" -ForegroundColor Red }
        if (-not $darkExists) { Write-Host "    - $darkFile 누락" -ForegroundColor Red }
        $allPresent = $false
    }
}

if ($allPresent) {
    Write-Host "`n✨ 모든 PWA 필수 아이콘이 준비되었습니다!" -ForegroundColor Green
}
else {
    Write-Host "`n⚠️  일부 PWA 필수 아이콘이 누락되었습니다." -ForegroundColor Yellow
}

Write-Host "`n작업 완료!" -ForegroundColor Magenta
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "1. rename_icons_fix.bat 실행하여 파일명 정리" -ForegroundColor White
Write-Host "2. manifest.json 및 manifest-dark.json 파일 확인" -ForegroundColor White
Write-Host "3. index.html의 아이콘 링크 확인" -ForegroundColor White