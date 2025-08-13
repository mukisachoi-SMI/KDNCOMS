import os
import shutil
from pathlib import Path

# 아이콘 디렉토리 경로
ICONS_DIR = r"C:\users\user\church-donation-system\public\icons"

# 필수 아이콘 크기 목록
REQUIRED_SIZES = [
    "16x16", "32x32", "44x44", "72x72", "96x96", 
    "128x128", "144x144", "150x150", "152x152", 
    "180x180", "192x192", "310x310", "384x384", "512x512"
]

def rename_files():
    """아이콘 파일명을 일관성 있게 변경"""
    
    os.chdir(ICONS_DIR)
    
    # 변경 매핑 정의
    rename_mappings = {
        # === 밝은 테마 아이콘 (coms_b) ===
        # 기본 크기들
        "coms_b-16.png": "coms_b-16x16.png",
        "coms_b-20.png": "coms_b-20x20.png",
        "coms_b-29.png": "coms_b-29x29.png",
        "coms_b-32.png": "coms_b-32x32.png",
        "coms_b-40.png": "coms_b-40x40.png",
        "coms_b-50.png": "coms_b-50x50.png",
        "coms_b-57.png": "coms_b-57x57.png",
        "coms_b-58.png": "coms_b-58x58.png",
        "coms_b-60.png": "coms_b-60x60.png",
        "coms_b-64.png": "coms_b-64x64.png",
        "coms_b-72.png": "coms_b-72x72.png",
        "coms_b-76.png": "coms_b-76x76.png",
        "coms_b-80.png": "coms_b-80x80.png",
        "coms_b-87.png": "coms_b-87x87.png",
        "coms_b-100.png": "coms_b-100x100.png",
        "coms_b-114.png": "coms_b-114x114.png",
        "coms_b-120.png": "coms_b-120x120.png",
        "coms_b-128.png": "coms_b-128x128.png",
        "coms_b-144.png": "coms_b-144x144.png",
        "coms_b-152.png": "coms_b-152x152.png",
        "coms_b-167.png": "coms_b-167x167.png",
        "coms_b-180.png": "coms_b-180x180.png",
        "coms_b-192.png": "coms_b-192x192.png",
        "coms_b-256.png": "coms_b-256x256.png",
        "coms_b-512.png": "coms_b-512x512.png",
        "coms_b-1024.png": "coms_b-1024x1024.png",
        
        # 중복된 크기 표시 제거
        "coms_b-48-48.png": "coms_b-48x48.png",
        "coms_b-72-72.png": "coms_b-72x72.png",
        "coms_b-96-96.png": "coms_b-96x96.png",
        "coms_b-144-144.png": "coms_b-144x144.png",
        "coms_b-192-192.png": "coms_b-192x192.png",
        "coms_b-512-512.png": "coms_b-512x512.png",
        
        # 특수 크기들
        "coms_b-44x44-72.png": "coms_b-44x44.png",
        "coms_b-150x150-100.png": "coms_b-150x150.png",
        "coms_b-150x150-150.png": "coms_b-150x150.png",
        "coms_b-310x150-100.png": "coms_b-310x310.png",
        
        # === 다크 테마 아이콘 (coms-d → coms_d) ===
        # 하이픈을 언더스코어로 변경하면서 크기 정리
        "coms-d-16.png": "coms_d-16x16.png",
        "coms-d-20.png": "coms_d-20x20.png",
        "coms-d-29.png": "coms_d-29x29.png",
        "coms-d-32.png": "coms_d-32x32.png",
        "coms-d-40.png": "coms_d-40x40.png",
        "coms-d-50.png": "coms_d-50x50.png",
        "coms-d-57.png": "coms_d-57x57.png",
        "coms-d-58.png": "coms_d-58x58.png",
        "coms-d-60.png": "coms_d-60x60.png",
        "coms-d-64.png": "coms_d-64x64.png",
        "coms-d-72.png": "coms_d-72x72.png",
        "coms-d-76.png": "coms_d-76x76.png",
        "coms-d-80.png": "coms_d-80x80.png",
        "coms-d-87.png": "coms_d-87x87.png",
        "coms-d-100.png": "coms_d-100x100.png",
        "coms-d-114.png": "coms_d-114x114.png",
        "coms-d-120.png": "coms_d-120x120.png",
        "coms-d-128.png": "coms_d-128x128.png",
        "coms-d-144.png": "coms_d-144x144.png",
        "coms-d-152.png": "coms_d-152x152.png",
        "coms-d-167.png": "coms_d-167x167.png",
        "coms-d-180.png": "coms_d-180x180.png",
        "coms-d-192.png": "coms_d-192x192.png",
        "coms-d-256.png": "coms_d-256x256.png",
        "coms-d-512.png": "coms_d-512x512.png",
        "coms-d-1024.png": "coms_d-1024x1024.png",
        
        # 중복된 크기 표시 제거
        "coms-d-48-48.png": "coms_d-48x48.png",
        "coms-d-72-72.png": "coms_d-72x72.png",
        "coms-d-96-96.png": "coms_d-96x96.png",
        "coms-d-144-144.png": "coms_d-144x144.png",
        "coms-d-192-192.png": "coms_d-192x192.png",
        "coms-d-512-512.png": "coms_d-512x512.png",
        
        # 특수 크기들
        "coms-d-44x44-72.png": "coms_d-44x44.png",
        "coms-d-150x150-100.png": "coms_d-150x150.png",
        "coms-d-150x150-125.png": "coms_d-150x150.png",
        "coms-d-310x150-100.png": "coms_d-310x310.png",
    }
    
    print("=" * 50)
    print("아이콘 파일명 정리 시작")
    print("=" * 50)
    print()
    
    # 파일명 변경 실행
    renamed_count = 0
    error_count = 0
    
    for old_name, new_name in rename_mappings.items():
        if os.path.exists(old_name):
            try:
                # 동일한 파일명이면 스킵
                if old_name == new_name:
                    continue
                    
                # 대상 파일이 이미 존재하면 백업
                if os.path.exists(new_name):
                    backup_name = f"{new_name}.backup"
                    print(f"⚠️  {new_name} 이미 존재 - 백업: {backup_name}")
                    if os.path.exists(backup_name):
                        os.remove(backup_name)
                    shutil.move(new_name, backup_name)
                
                # 파일명 변경
                os.rename(old_name, new_name)
                print(f"✅ {old_name} → {new_name}")
                renamed_count += 1
                
            except Exception as e:
                print(f"❌ {old_name} 변경 실패: {e}")
                error_count += 1
    
    print()
    print("=" * 50)
    print(f"파일명 정리 완료! (성공: {renamed_count}, 실패: {error_count})")
    print("=" * 50)
    print()
    
    # 현재 파일 목록 확인
    print("[정리된 파일 목록]")
    print()
    
    print("--- 밝은 테마 아이콘 (coms_b) ---")
    bright_icons = sorted([f for f in os.listdir('.') if f.startswith('coms_b-')])
    for icon in bright_icons:
        print(f"  {icon}")
    
    print()
    print("--- 다크 테마 아이콘 (coms_d) ---")
    dark_icons = sorted([f for f in os.listdir('.') if f.startswith('coms_d-')])
    for icon in dark_icons:
        print(f"  {icon}")
    
    print()
    print("=" * 50)
    print("[필수 아이콘 확인]")
    print("=" * 50)
    print()
    
    # 필수 아이콘 확인
    missing_bright = []
    missing_dark = []
    
    for size in REQUIRED_SIZES:
        bright_file = f"coms_b-{size}.png"
        dark_file = f"coms_d-{size}.png"
        
        if os.path.exists(bright_file):
            print(f"✅ {bright_file}")
        else:
            print(f"❌ {bright_file} - 누락")
            missing_bright.append(size)
        
        if os.path.exists(dark_file):
            print(f"✅ {dark_file}")
        else:
            print(f"❌ {dark_file} - 누락")
            missing_dark.append(size)
        
        print()
    
    # 누락된 아이콘 요약
    if missing_bright or missing_dark:
        print("=" * 50)
        print("[누락된 필수 아이콘 요약]")
        print("=" * 50)
        
        if missing_bright:
            print(f"\n밝은 테마 누락: {', '.join(missing_bright)}")
        
        if missing_dark:
            print(f"\n다크 테마 누락: {', '.join(missing_dark)}")
        
        print("\n💡 누락된 아이콘은 기존 아이콘을 리사이징하여 생성해야 합니다.")
        print("   가장 큰 아이콘(512x512 또는 1024x1024)을 기준으로 리사이징하세요.")
    else:
        print("✨ 모든 필수 아이콘이 준비되었습니다!")

if __name__ == "__main__":
    rename_files()