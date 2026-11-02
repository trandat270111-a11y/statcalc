#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
StatCalc Pro - Release Packager
1. Biên dịch desktop_app.py thành file thực thi độc lập StatCalc_Pro.exe
2. Đóng gói thư mục thành file ZIP StatCalc_Pro_Portable.zip để chia sẻ cho người khác tải về
"""

import os
import sys
import shutil
import subprocess
import zipfile

# Đảm bảo in tiếng Việt và emoji không bị lỗi trên Windows console
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "dist")
RELEASES_DIR = os.path.join(BASE_DIR, "releases")

def build_executable():
    print("=" * 60)
    print("🚀 BẮT ĐẦU ĐÓNG GÓI ỨNG DỤNG STATCALC PRO THÀNH FILE .EXE")
    print("=" * 60)

    icon_path = os.path.join(BASE_DIR, "assets", "icon.ico")
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--noconsole",
        "--name", "StatCalc_Pro",
        "--icon", icon_path,
        "--add-data", f"{os.path.join(BASE_DIR, 'index.html')};.",
        "--add-data", f"{os.path.join(BASE_DIR, 'style.css')};.",
        "--add-data", f"{os.path.join(BASE_DIR, 'manifest.json')};.",
        "--add-data", f"{os.path.join(BASE_DIR, 'sw.js')};.",
        "--add-data", f"{os.path.join(BASE_DIR, 'assets')};assets",
        "--add-data", f"{os.path.join(BASE_DIR, 'js')};js",
        "--add-data", f"{os.path.join(BASE_DIR, 'vendor')};vendor",
        "--add-data", f"{os.path.join(BASE_DIR, 'sample_data')};sample_data",
        "--distpath", DIST_DIR,
        "--workpath", os.path.join(BASE_DIR, "build"),
        "--specpath", BASE_DIR,
        os.path.join(BASE_DIR, "desktop_app.py")
    ]

    print("Đang chạy PyInstaller...")
    result = subprocess.run(cmd, cwd=BASE_DIR)
    if result.returncode == 0:
        exe_path = os.path.join(DIST_DIR, "StatCalc_Pro.exe")
        print(f"\n✅ Đã tạo thành công file .exe tại: {exe_path}")
        print(f"   Kích thước: {os.path.getsize(exe_path) / (1024*1024):.2f} MB")
        return exe_path
    else:
        print(f"\n❌ Lỗi khi đóng gói PyInstaller (Mã lỗi: {result.returncode})")
        return None

def build_portable_zip():
    print("\n" + "=" * 60)
    print("📦 ĐÓNG GÓI BẢN PORTABLE ZIP ĐỂ CHIA SẺ VÀ TẢI VỀ")
    print("=" * 60)

    os.makedirs(RELEASES_DIR, exist_ok=True)
    zip_path = os.path.join(RELEASES_DIR, "StatCalc_Pro_Portable_Windows.zip")

    # Các file và thư mục cần đưa vào bản phân phối
    include_files = [
        "index.html",
        "style.css",
        "manifest.json",
        "sw.js",
        "app.py",
        "desktop_app.py",
        "run_app.bat",
        "README.md"
    ]
    include_dirs = ["assets", "js", "vendor", "sample_data"]

    # Nếu có file .exe vừa build, đưa luôn vào root của ZIP
    exe_file = os.path.join(DIST_DIR, "StatCalc_Pro.exe")
    if os.path.exists(exe_file):
        include_files.append(os.path.relpath(exe_file, BASE_DIR))

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for f in include_files:
            full_path = os.path.join(BASE_DIR, f)
            if os.path.exists(full_path):
                zipf.write(full_path, arcname=f)
                print(f" + Đã thêm file: {f}")

        for d in include_dirs:
            full_dir = os.path.join(BASE_DIR, d)
            if os.path.exists(full_dir):
                for root, _, files in os.walk(full_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, BASE_DIR)
                        zipf.write(file_path, arcname=arcname)
                print(f" + Đã thêm thư mục: {d}/")

    print(f"\n🎉 ĐÃ TẠO GÓI PHÂN PHỐI HOÀN CHỈNH TẠI:")
    print(f"👉 {zip_path}")
    print(f"   Kích thước: {os.path.getsize(zip_path) / (1024*1024):.2f} MB")
    print("   Bạn có thể gửi file ZIP này cho bất kỳ ai hoặc tải lên Google Drive, GitHub Releases để người khác tải về.")

if __name__ == "__main__":
    exe = build_executable()
    build_portable_zip()
