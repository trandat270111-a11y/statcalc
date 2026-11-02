#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
StatCalc Pro - Native Desktop Application Wrapper
Chạy ứng dụng trong cửa sổ Desktop độc lập hoặc trình duyệt
"""

import os
import sys
import threading
import http.server
import socketserver
import socket

# Thiết lập đường dẫn thư mục gốc (xử lý cả khi đóng gói thành file .exe qua PyInstaller)
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Tìm một port trống ngẫu nhiên
def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

PORT = find_free_port()

class SilentHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format, *args):
        # Tắt log để giữ ứng dụng yên tĩnh
        pass

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', PORT), SilentHTTPHandler) as httpd:
        httpd.serve_forever()

def main():
    # Chạy server ở thread ngầm
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    url = f"http://127.0.0.1:{PORT}/index.html"
    icon_path = os.path.join(BASE_DIR, "assets", "icon.ico")
    if not os.path.exists(icon_path):
        icon_path = None

    # Thử khởi chạy cửa sổ Desktop bằng pywebview (sử dụng Edge WebView2 native của Windows)
    use_webview = True
    try:
        import webview
        window = webview.create_window(
            title="StatCalc Pro - Bảng Tính & Thống Kê Thông Minh",
            url=url,
            width=1280,
            height=820,
            min_size=(900, 600),
            background_color='#090d16'
        )
        webview.start(icon=icon_path)
    except Exception as e:
        print(f"pywebview không khả dụng: {e}. Đang mở bằng trình duyệt mặc định...")
        use_webview = False

    if not use_webview:
        import webbrowser
        import time
        webbrowser.open(url)
        # Giữ process sống khi chạy qua trình duyệt
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            sys.exit(0)

if __name__ == "__main__":
    main()
