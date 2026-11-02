/**
 * Excel & CSV Import/Export Handler using SheetJS
 * Quản lý đọc và ghi file Excel (.xlsx, .xls) và CSV:
 * - Kéo thả file trực tiếp vào giao diện
 * - Chọn sheet khi file có nhiều sheet
 * - Tự động nhận diện dòng tiêu đề (Header)
 * - Xuất dữ liệu bảng tính ra Excel (.xlsx) / CSV
 * - Xuất báo cáo kết quả thống kê (Trung bình, Trung vị, Mốt...) ra Excel
 */

class ExcelHandler {
    constructor(spreadsheet, onDataLoaded, showToast) {
        this.spreadsheet = spreadsheet;
        this.onDataLoaded = onDataLoaded;
        this.showToast = showToast || console.log;
        this.currentWorkbook = null;
    }

    /**
     * Khởi tạo các sự kiện kéo thả (Drag and drop) và nút tải file
     */
    initEventListeners(fileInputId, dropZoneId) {
        const fileInput = document.getElementById(fileInputId);
        const dropZone = document.getElementById(dropZoneId);

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.processFile(file);
                    fileInput.value = ''; // Reset input để có thể chọn lại cùng 1 file
                }
            });
        }

        if (dropZone) {
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.add('drag-active');
                });
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.remove('drag-active');
                });
            });

            dropZone.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const file = dt.files[0];
                if (file) {
                    this.processFile(file);
                }
            });
        }

        // Hỗ trợ kéo thả vào toàn màn hình
        window.addEventListener('dragover', (e) => e.preventDefault());
        window.addEventListener('drop', (e) => {
            // Nếu không thả vào vùng dropzone thì kiểm tra xem có phải file không
            if (e.target.closest('#' + dropZoneId)) return;
            e.preventDefault();
            if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                this.processFile(file);
            }
        });
    }

    /**
     * Xử lý file người dùng tải lên
     */
    processFile(file) {
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.xlsx', '.xls', '.csv', '.tsv', '.ods'];
        const isValid = validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValid) {
            this.showToast('⚠️ Vui lòng chọn file Excel (.xlsx, .xls) hoặc file .csv', 'warning');
            return;
        }

        this.showToast(`⏳ Đang đọc file "${file.name}"...`, 'info');

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                if (typeof XLSX === 'undefined') {
                    throw new Error('Thư viện SheetJS chưa được tải.');
                }

                const workbook = XLSX.read(data, {
                    type: 'array',
                    cellDates: true,
                    cellNF: false,
                    cellText: false
                });

                this.currentWorkbook = workbook;
                this.handleWorkbookLoaded(workbook, file.name);
            } catch (err) {
                console.error('Lỗi khi đọc file Excel:', err);
                this.showToast(`❌ Không thể mở file: ${err.message}`, 'error');
            }
        };

        reader.onerror = () => {
            this.showToast('❌ Lỗi khi đọc file từ máy tính!', 'error');
        };

        reader.readAsArrayBuffer(file);
    }

    /**
     * Xử lý workbook sau khi đọc thành công
     */
    handleWorkbookLoaded(workbook, fileName) {
        const sheetNames = workbook.SheetNames;
        if (!sheetNames || sheetNames.length === 0) {
            this.showToast('⚠️ File Excel không chứa sheet dữ liệu nào!', 'warning');
            return;
        }

        // Nếu file có nhiều sheet, cho phép chọn sheet qua modal hoặc nạp sheet đầu tiên
        if (sheetNames.length > 1) {
            this.showSheetPickerModal(sheetNames, fileName, (selectedSheet) => {
                this.loadSheet(workbook, selectedSheet, fileName);
            });
        } else {
            this.loadSheet(workbook, sheetNames[0], fileName);
        }
    }

    /**
     * Hiển thị modal chọn Sheet khi file Excel có nhiều tab
     */
    showSheetPickerModal(sheetNames, fileName, onSelect) {
        const modal = document.getElementById('sheet-picker-modal');
        const select = document.getElementById('sheet-select');
        const confirmBtn = document.getElementById('confirm-sheet-btn');

        if (!modal || !select || !confirmBtn) {
            // Fallback nếu không có modal: nạp luôn sheet đầu tiên
            onSelect(sheetNames[0]);
            return;
        }

        select.innerHTML = '';
        sheetNames.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            select.appendChild(opt);
        });

        modal.classList.add('active');

        const handleConfirm = () => {
            modal.classList.remove('active');
            confirmBtn.removeEventListener('click', handleConfirm);
            onSelect(select.value);
        };

        confirmBtn.addEventListener('click', handleConfirm);
    }

    /**
     * Nạp dữ liệu từ một Sheet vào Spreadsheet
     */
    loadSheet(workbook, sheetName, fileName) {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
            this.showToast(`⚠️ Không tìm thấy sheet "${sheetName}"`, 'warning');
            return;
        }

        // Chuyển worksheet thành mảng 2D (header: 1 nghĩa là mảng 2D thô)
        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false
        });

        if (!rawRows || rawRows.length === 0) {
            this.showToast(`⚠️ Sheet "${sheetName}" không có dữ liệu!`, 'warning');
            return;
        }

        // Kiểm tra hàng đầu tiên có phải là tiêu đề (header) không
        const firstRow = rawRows[0];
        let headers = [];
        let dataRows = [];

        // Kiểm tra xem dòng 1 có nhiều chuỗi văn bản không
        const hasTextHeader = firstRow.some(cell => typeof cell === 'string' && isNaN(Number(cell)) && cell.trim() !== '');

        if (hasTextHeader && rawRows.length > 1) {
            headers = firstRow.map(h => String(h || '').trim());
            dataRows = rawRows.slice(1);
        } else {
            // Không có header, để bảng tự sinh A, B, C...
            headers = null;
            dataRows = rawRows;
        }

        // Lọc bỏ các dòng hoàn toàn rỗng ở cuối
        while (dataRows.length > 0 && dataRows[dataRows.length - 1].every(c => c === '' || c === null || c === undefined)) {
            dataRows.pop();
        }

        this.spreadsheet.loadData(headers, dataRows);
        this.showToast(`✅ Đã nhập thành công ${dataRows.length} dòng dữ liệu từ sheet "${sheetName}"!`, 'success');

        if (this.onDataLoaded) {
            this.onDataLoaded(fileName, sheetName, dataRows.length);
        }
    }

    /**
     * Xuất toàn bộ bảng tính hiện tại ra file Excel (.xlsx)
     */
    exportToExcel(customFilename = 'du_lieu_thong_ke.xlsx') {
        if (typeof XLSX === 'undefined') {
            this.showToast('❌ Thư viện SheetJS chưa sẵn sàng!', 'error');
            return;
        }

        const exportData = this.spreadsheet.getExportData();
        if (exportData.length <= 1) {
            this.showToast('⚠️ Bảng tính chưa có dữ liệu để xuất!', 'warning');
            return;
        }

        const ws = XLSX.utils.aoa_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Dữ Liệu');

        XLSX.writeFile(wb, customFilename);
        this.showToast(`✅ Đã xuất file "${customFilename}" thành công!`, 'success');
    }

    /**
     * Xuất bảng tính ra định dạng CSV
     */
    exportToCSV(customFilename = 'du_lieu_thong_ke.csv') {
        if (typeof XLSX === 'undefined') {
            this.showToast('❌ Thư viện SheetJS chưa sẵn sàng!', 'error');
            return;
        }

        const exportData = this.spreadsheet.getExportData();
        const ws = XLSX.utils.aoa_to_sheet(exportData);
        const csvContent = XLSX.utils.sheet_to_csv(ws);

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = customFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast(`✅ Đã tải xuống file CSV "${customFilename}"!`, 'success');
    }

    /**
     * Xuất Báo Cáo Thống Kê Toàn Diện ra Excel
     * Tạo 2 sheet: "Dữ Liệu Gốc" và "Báo Cáo Thống Kê" (Chứa Mean, Median, Mode, Min, Max...)
     */
    exportStatisticalReport(statsSummaryArray, customFilename = 'Bao_Cao_Thong_Ke.xlsx') {
        if (typeof XLSX === 'undefined') {
            this.showToast('❌ Thư viện SheetJS chưa sẵn sàng!', 'error');
            return;
        }

        const wb = XLSX.utils.book_new();

        // Sheet 1: Dữ liệu bảng tính
        const rawData = this.spreadsheet.getExportData();
        const wsData = XLSX.utils.aoa_to_sheet(rawData);
        XLSX.utils.book_append_sheet(wb, wsData, 'Dữ Liệu Gốc');

        // Sheet 2: Bảng thống kê chi tiết
        const reportRows = [
            ['BÁO CÁO PHÂN TÍCH THỐNG KÊ (MEAN - MEDIAN - MODE)'],
            ['Ngày tạo:', new Date().toLocaleString('vi-VN')],
            [],
            [
                'Tên Cột / Biến',
                'Số Quan Sát (N)',
                'Trung Bình (Mean)',
                'Trung Vị (Median)',
                'Mốt (Mode)',
                'Tần Số Mốt',
                'Giá Trị Nhỏ Nhất (Min)',
                'Giá Trị Lớn Nhất (Max)',
                'Khoảng Biến Thiên (Range)',
                'Phương Sai Mẫu (s²)',
                'Độ Lệch Chuẩn (s)',
                'Tứ Phân Vị Q1',
                'Tứ Phân Vị Q3'
            ]
        ];

        statsSummaryArray.forEach(st => {
            if (st.hasNumericData) {
                const modeStr = st.mode && st.mode.length > 0 ? st.mode.join(', ') : 'Không có';
                reportRows.push([
                    st.columnName,
                    st.validCount,
                    StatisticsEngine.roundAdaptive(st.mean),
                    StatisticsEngine.roundAdaptive(st.median),
                    modeStr,
                    st.modeFrequency || 0,
                    st.min,
                    st.max,
                    st.range,
                    StatisticsEngine.roundAdaptive(st.sampleVariance),
                    StatisticsEngine.roundAdaptive(st.sampleStdDev),
                    StatisticsEngine.roundAdaptive(st.q1),
                    StatisticsEngine.roundAdaptive(st.q3)
                ]);
            } else {
                reportRows.push([
                    st.columnName,
                    st.validCount,
                    'N/A (Chữ)',
                    'N/A',
                    st.textMode && st.textMode.modes.length > 0 ? st.textMode.modes.join(', ') : 'N/A',
                    st.textMode ? st.textMode.frequency : 0,
                    'N/A',
                    'N/A',
                    'N/A',
                    'N/A',
                    'N/A',
                    'N/A',
                    'N/A'
                ]);
            }
        });

        const wsReport = XLSX.utils.aoa_to_sheet(reportRows);

        // Đặt độ rộng các cột báo cáo cho đẹp mắt
        wsReport['!cols'] = [
            { wch: 22 }, // Tên cột
            { wch: 15 }, // N
            { wch: 18 }, // Mean
            { wch: 18 }, // Median
            { wch: 20 }, // Mode
            { wch: 12 }, // Freq
            { wch: 14 }, // Min
            { wch: 14 }, // Max
            { wch: 14 }, // Range
            { wch: 18 }, // Var
            { wch: 18 }, // StdDev
            { wch: 14 }, // Q1
            { wch: 14 }  // Q3
        ];

        XLSX.utils.book_append_sheet(wb, wsReport, 'Báo Cáo Thống Kê');
        XLSX.writeFile(wb, customFilename);
        this.showToast(`📊 Đã xuất Báo cáo Thống kê thành công vào file "${customFilename}"!`, 'success');
    }
}

window.ExcelHandler = ExcelHandler;
