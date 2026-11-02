# 📊 StatCalc Pro - Bảng Tính & Thống Kê Toán Học Thông Minh

Ứng dụng web bảng tính tương tác mạnh mẽ, hiện đại hỗ trợ tính toán **Giá Trị Trung Bình (Mean)**, **Trung Vị (Median)**, và **Mốt (Mode)**, tích hợp khả năng **đọc/ghi file Excel (.xlsx, .xls, .csv)** cùng bảng tính tự làm trực tiếp trong ứng dụng.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🧮 Tính Toán Thống Kê Chính Xác & Chi Tiết
- **Giá Trị Trung Bình (Mean / Average):**
  - Công thức: $\bar{x} = \frac{\sum x_i}{N}$
  - Tính toán tự động theo thời gian thực khi chỉnh sửa ô số liệu.
- **Trung Vị (Median):**
  - Xử lý chính xác cả 2 trường hợp:
    - Cỡ mẫu $N$ lẻ: Giá trị nằm tại vị trí chính giữa $(N+1)/2$.
    - Cỡ mẫu $N$ chẵn: Trung bình cộng 2 giá trị tại vị trí $N/2$ và $N/2+1$.
- **Mốt (Mode / Yếu vị):**
  - Hỗ trợ đầy đủ: Đơn mốt (Unimodal), Đa mốt (Bimodal / Multimodal), hoặc nhận diện khi tập dữ liệu không có mốt.
  - Hỗ trợ tìm mốt cho cả dữ liệu dạng chữ (Text) và dữ liệu dạng số.
- **Các chỉ số thống kê mô tả toàn diện:**
  - Tổng $(\sum X)$, Min, Max, Khoảng biến thiên (Range)
  - Phương sai mẫu ($s^2$) và Độ lệch chuẩn mẫu ($s$)
  - Tứ phân vị ($Q_1, Q_2, Q_3$) và Độ trải giữa ($IQR$)
- **Giải Thích Từng Bước (Step-by-Step Breakdown):**
  - Hiển thị công thức, dãy số sau khi sắp xếp, vị trí trung tâm và bảng tần số xuất hiện giúp người học hiểu rõ bản chất toán học.

### 2. 📝 Bảng Tính Tương Tác Trực Tiếp Ngay Trong App
- **Giao diện dạng lưới (Grid):** Đánh số hàng (1, 2, 3...) và chữ cái cột (A, B, C...).
- **Chỉnh sửa linh hoạt:**
  - Nhấp đúp vào ô hoặc chọn ô và gõ trực tiếp.
  - Phím mũi tên `↑`, `↓`, `←`, `→` để di chuyển nhanh.
  - Phím `Enter` để xác nhận và xuống dòng, `Tab` để sang ô tiếp theo.
  - Phím `Delete` / `Backspace` để xóa nhanh nội dung ô.
- **Thao tác cấu trúc bảng:**
  - Thêm hàng mới, thêm 5 hàng trống một lúc, thêm cột mới.
  - Xóa hàng, xóa cột, xóa trắng nội dung hoặc đặt lại bảng mặc định.
  - Nhấp đúp vào tiêu đề cột để đổi tên cột (ví dụ: "Toán", "Lương", "Doanh Thu").
- **Hỗ trợ Copy & Paste:**
  - Sao chép bảng nhiều dòng/cột từ Excel hoặc Google Sheets và dán (Ctrl + V) thẳng vào bảng tính trong ứng dụng.

### 3. 📥 Nhận Dữ Liệu Từ File Excel (.xlsx, .xls) & CSV
- **Nhập dữ liệu kéo thả (Drag & Drop):**
  - Thả file Excel hoặc CSV vào bất kỳ đâu trên màn hình.
  - Hỗ trợ chọn file qua nút **"Nhập Excel / CSV"**.
- **Chọn Sheet:**
  - Khi file Excel chứa nhiều sheet, ứng dụng hiển thị hộp thoại cho phép chọn đúng sheet cần phân tích.
- **Tự động nhận diện Header:**
  - Tự động tách dòng đầu tiên làm tên cột nếu chứa tiêu đề chữ.
- **Bộ dữ liệu mẫu tích hợp (1-Click):**
  - Bảng Điểm Thi Khảo Sát Học Sinh (Toán, Văn, Ngoại ngữ, Tin học)
  - Khảo Sát Thu Nhập & Lương Thưởng
  - Doanh Số Bán Hàng & Đánh Giá Khách Hàng

### 4. 📤 Xuất Dữ Liệu & Báo Cáo Chuyên Nghiệp
- **Xuất Excel (.xlsx):** Lưu toàn bộ bảng tính hiện tại về file Excel.
- **Xuất Báo Cáo Thống Kê (.xlsx):** Tạo file Excel gồm 2 sheet: "Dữ Liệu Gốc" và "Báo Cáo Thống Kê" tổng hợp Mean, Median, Mode của tất cả các cột.
- **Xuất CSV:** Hỗ trợ định dạng CSV chuẩn UTF-8.

### 5. 📈 Trực Quan Hóa & Giao Diện Sang Trọng
- **Biểu đồ phân phối tần số (Histogram):**
  - Biểu đồ tương tác vẽ bằng Chart.js.
  - Tự động đánh dấu nổi bật các cột chứa giá trị **Mốt (Mode)**.
  - Chuyển đổi giữa dạng biểu đồ Cột (Bar) và biểu đồ Đường (Line).
- **Thiết kế UI/UX cao cấp:**
  - Chế độ Tối (Dark Theme) làm mặc định và chế độ Sáng (Light Theme) tùy chọn.
  - Hiệu ứng kính mờ (Glassmorphism), viền gradient, bóng đổ mềm mại.
  - Thẻ chỉ số nổi bật với màu sắc quy ước: Hổ phách (Mean), Ngọc lục bảo (Median), Hồng cánh sen (Mode).


---

## 📁 Cấu Trúc Thư Mục Dự Án

```
statistical_calculator/
├── dist/
│   └── StatCalc_Pro.exe         # ỨNG DỤNG WINDOWS ĐỘC LẬP (.EXE)
├── releases/
│   └── StatCalc_Pro_Portable_Windows.zip # GÓI ZIP ĐỂ GỬI & TẢI VỀ
├── index.html                   # Giao diện chính của ứng dụng
├── style.css                    # Thiết kế giao diện Glassmorphism & Dark/Light mode
├── manifest.json                # Cấu hình PWA để cài app lên điện thoại/máy tính
├── sw.js                        # Service Worker hỗ trợ chạy 100% offline
├── desktop_app.py               # Wrapper khởi chạy cửa sổ Desktop bằng pywebview
├── app.py                       # Máy chủ Python cục bộ
├── build_release.py             # Script tự động đóng gói file .exe và .zip
├── run_app.bat                  # Phím tắt khởi động 1-click cho Windows
├── assets/
│   ├── icon.ico                 # Icon chuẩn Windows ICO cho file .exe
│   ├── icon-192.png             # Icon app cho di động
│   └── icon-512.png             # Icon app độ phân giải cao
├── js/
│   ├── statistics.js            # Thuật toán tính Mean, Median, Mode, Variance, IQR...
│   ├── spreadsheet.js           # Động cơ bảng tính tương tác, phím tắt, dán dữ liệu
│   ├── excel.js                 # Đọc/ghi file Excel (.xlsx) & CSV bằng SheetJS
│   ├── charts.js                # Vẽ biểu đồ phân phối tần số bằng Chart.js
│   └── app.js                   # Điều phối ứng dụng & dữ liệu mẫu
├── vendor/
│   ├── xlsx.full.min.js         # Thư viện SheetJS đọc/ghi Excel offline
│   └── chart.umd.min.js         # Thư viện Chart.js vẽ biểu đồ offline
└── sample_data/
    ├── bang_diem_hoc_sinh.csv   # File dữ liệu mẫu điểm thi học sinh
    └── khao_sat_luong.csv       # File dữ liệu mẫu khảo sát thu nhập
```
