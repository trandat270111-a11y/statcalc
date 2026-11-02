#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
StatCalc Pro Launcher
Máy chủ cục bộ phục vụ ứng dụng Bảng tính & Thống kê Mean, Median, Mode
"""

import os
import sys
import webbrowser
import http.server
import socketserver

# Đảm bảo mã hóa console là UTF-8 trên Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Lọc bớt log tĩnh để màn hình console sạch sẽ
        if len(args) > 0 and ("vendor" in str(args[0]) or ".css" in str(args[0]) or ".js" in str(args[0])):
            return
        super().log_message(format, *args)

def main():
    os.chdir(DIRECTORY)
    url = f"http://localhost:{PORT}/index.html"
    
    print("=" * 65)
    print("  STATCALC PRO - BẢNG TÍNH & THỐNG KÊ TOÁN HỌC THÔNG MINH")
    print(f"  Đang khởi động ứng dụng tại: {url}")
    print("  Chức năng: Tính Trung Bình, Trung Vị, Mốt, Đọc file Excel (.xlsx, .csv)")
    print("=" * 65)
    print("  Nhấn Ctrl + C để dừng máy chủ.\n")

    # Mở trình duyệt web tự động
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"  Không thể tự mở trình duyệt: {e}")
        print(f"  Vui lòng truy cập thủ công: {url}")

    # Khởi chạy HTTP server
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPHandler) as httpd:
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n  Đã dừng máy chủ. Tạm biệt!")
                sys.exit(0)
    except OSError as err:
        print(f"  Cổng {PORT} đang được sử dụng (có thể máy chủ đã chạy).")
        print(f"  Bạn có thể mở trực tiếp đường dẫn: {url}")

if __name__ == "__main__":
    main()
