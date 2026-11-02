@echo off
chcp 65001 > nul
set PYTHONIOENCODING=utf-8
title StatCalc Pro - Bảng Tính & Thống Kê Toán Học

echo =========================================================
echo    Khởi động ứng dụng Bảng Tính Thống Kê StatCalc Pro
echo =========================================================
echo Đang mở trình duyệt tại http://localhost:8080/index.html ...
echo.

cd /d "%~dp0"
python app.py

pause
