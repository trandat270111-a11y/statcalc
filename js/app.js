/**
 * Application Orchestrator for Statistical Spreadsheet App
 * Điều phối dữ liệu, giao diện, bảng tính, tính toán thống kê và biểu đồ
 */

// Bộ dữ liệu mẫu có sẵn để người dùng thử nghiệm tức thì
const SAMPLE_DATASETS = {
    students: {
        name: 'Bảng Điểm Thi Khảo Sát Học Sinh',
        headers: ['STT', 'Họ Và Tên', 'Toán', 'Ngữ Văn', 'Ngoại Ngữ', 'Tin Học', 'Điểm TB'],
        rows: [
            ['1', 'Nguyễn Văn An', '8.5', '7.0', '9.0', '9.5', '8.5'],
            ['2', 'Trần Thị Bích', '9.0', '8.5', '8.0', '8.5', '8.5'],
            ['3', 'Lê Hoàng Cường', '6.5', '6.0', '7.0', '8.0', '6.9'],
            ['4', 'Phạm Minh Đức', '8.0', '7.5', '8.5', '9.0', '8.3'],
            ['5', 'Hoàng Thu Giang', '9.5', '8.0', '9.0', '10.0', '9.1'],
            ['6', 'Vũ Quốc Huy', '7.0', '7.5', '7.0', '8.0', '7.4'],
            ['7', 'Đỗ Thanh Hương', '8.5', '8.0', '8.5', '9.0', '8.5'],
            ['8', 'Bùi Anh Khoa', '5.5', '6.5', '6.0', '7.0', '6.3'],
            ['9', 'Ngô Hải Long', '8.0', '7.0', '8.0', '8.5', '7.9'],
            ['10', 'Dương Thảo Mai', '9.0', '8.5', '9.5', '9.0', '9.0'],
            ['11', 'Lý Gia Nam', '7.5', '7.0', '7.5', '8.0', '7.5'],
            ['12', 'Phan Yến Nhi', '8.5', '9.0', '8.5', '9.5', '8.9'],
            ['13', 'Đặng Tuấn Phong', '6.0', '6.5', '7.0', '7.5', '6.8'],
            ['14', 'Võ Như Quỳnh', '8.5', '8.0', '8.0', '8.5', '8.3'],
            ['15', 'Trịnh Quốc Trung', '10.0', '8.5', '9.0', '9.5', '9.3']
        ]
    },
    salary: {
        name: 'Khảo Sát Lương & Thu Nhập (Triệu VNĐ)',
        headers: ['Mã NV', 'Vị Trí', 'Kinh Nghiệm (Năm)', 'Lương Cơ Bản', 'Thưởng Doanh Số', 'Tổng Thu Nhập'],
        rows: [
            ['NV01', 'Lập trình viên', '2', '15.5', '3.0', '18.5'],
            ['NV02', 'Thiết kế UI/UX', '3', '16.0', '2.5', '18.5'],
            ['NV03', 'Chuyên viên Marketing', '1', '12.0', '4.5', '16.5'],
            ['NV04', 'Quản lý Dự án', '6', '28.0', '7.0', '35.0'],
            ['NV05', 'Kỹ sư Dữ liệu', '4', '22.5', '4.0', '26.5'],
            ['NV06', 'Chuyên viên Sales', '2', '11.0', '9.5', '20.5'],
            ['NV07', 'Lập trình viên', '3', '18.0', '3.5', '21.5'],
            ['NV08', 'Kế toán viên', '4', '14.5', '2.0', '16.5'],
            ['NV09', 'Lập trình viên', '1', '13.5', '2.0', '15.5'],
            ['NV10', 'Trưởng phòng Kỹ thuật', '8', '38.0', '10.0', '48.0'],
            ['NV11', 'Chuyên viên Marketing', '2', '13.5', '5.0', '18.5'],
            ['NV12', 'Nhân sự HR', '3', '14.0', '2.5', '16.5']
        ]
    },
    sales: {
        name: 'Doanh Số Bán Hàng & Đánh Giá Khách Hàng',
        headers: ['Tháng', 'Số Đơn Hàng', 'Khách Mới', 'Doanh Thu (Triệu)', 'Đánh Giá Sao'],
        rows: [
            ['Tháng 1', '120', '35', '145.0', '4.5'],
            ['Tháng 2', '135', '42', '168.5', '4.8'],
            ['Tháng 3', '150', '48', '190.0', '4.7'],
            ['Tháng 4', '140', '39', '175.2', '4.6'],
            ['Tháng 5', '165', '55', '210.0', '4.8'],
            ['Tháng 6', '180', '60', '235.5', '4.9'],
            ['Tháng 7', '175', '58', '225.0', '4.8'],
            ['Tháng 8', '190', '65', '248.0', '4.7'],
            ['Tháng 9', '185', '62', '240.0', '4.8'],
            ['Tháng 10', '210', '75', '280.5', '5.0'],
            ['Tháng 11', '230', '85', '310.0', '4.9'],
            ['Tháng 12', '260', '95', '350.0', '5.0']
        ]
    }
};

class App {
    constructor() {
        this.spreadsheet = null;
        this.excelHandler = null;
        this.chart = null;
        this.currentColumnIdx = 2; // Mặc định phân tích cột số đầu tiên (Ví dụ Toán)
        this.viewMode = 'single';  // 'single' (chi tiết 1 cột) hoặc 'all' (tổng hợp tất cả cột)
        this.statsCache = [];
    }

    start() {
        this.initTheme();
        this.initComponents();
        this.bindEvents();
        this.initPWA();
        // Nạp dữ liệu mẫu ban đầu để bảng luôn có sẵn số liệu đẹp
        this.loadSample('students');
    }

    /**
     * Khởi tạo PWA (Progressive Web App) và Service Worker
     */
    initPWA() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(() => console.log('StatCalc ServiceWorker đã đăng ký thành công.'))
                    .catch((err) => console.log('ServiceWorker đăng ký thất bại:', err));
            });
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPWAEvent = e;
            const statusText = document.getElementById('pwa-status-text');
            if (statusText) {
                statusText.textContent = '✅ Đã sẵn sàng! Bấm nút bên trái để cài đặt.';
                statusText.style.color = 'var(--accent-emerald)';
            }
        });

        window.addEventListener('appinstalled', () => {
            window.deferredPWAEvent = null;
            this.showToast('🎉 Đã cài đặt StatCalc Pro thành công vào thiết bị!', 'success');
            document.getElementById('install-modal')?.classList.remove('active');
        });
    }

    /**
     * Khởi tạo giao diện sáng / tối
     */
    initTheme() {
        const savedTheme = localStorage.getItem('stat_app_theme') || 'dark';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }

        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = savedTheme === 'dark' ? '☀️ Giao diện Sáng' : '🌙 Giao diện Tối';
            themeToggleBtn.addEventListener('click', () => {
                const isCurrentlyDark = document.body.classList.contains('dark-theme');
                if (isCurrentlyDark) {
                    document.body.classList.remove('dark-theme');
                    document.body.classList.add('light-theme');
                    localStorage.setItem('stat_app_theme', 'light');
                    themeToggleBtn.innerHTML = '🌙 Giao diện Tối';
                } else {
                    document.body.classList.remove('light-theme');
                    document.body.classList.add('dark-theme');
                    localStorage.setItem('stat_app_theme', 'dark');
                    themeToggleBtn.innerHTML = '☀️ Giao diện Sáng';
                }
                // Vẽ lại biểu đồ theo màu theme mới
                if (this.chart && this.statsCache[this.currentColumnIdx]) {
                    this.chart.renderDistribution(this.statsCache[this.currentColumnIdx]);
                }
            });
        }
    }

    /**
     * Khởi tạo các thành phần cốt lõi
     */
    initComponents() {
        // Khởi tạo bảng tính
        this.spreadsheet = new Spreadsheet('spreadsheet-container', {
            initialRows: 15,
            initialCols: 6,
            onDataChange: () => this.handleDataChange(),
            onColumnSelect: (colIdx) => {
                if (colIdx === -1) {
                    this.setViewMode('all');
                } else {
                    this.currentColumnIdx = colIdx;
                    this.setViewMode('single');
                    this.updateColumnDropdown();
                    this.recalculateAndRender();
                }
            }
        });

        // Khởi tạo biểu đồ
        this.chart = new StatisticsChart('distribution-chart');

        // Khởi tạo xử lý Excel
        this.excelHandler = new ExcelHandler(
            this.spreadsheet,
            (fileName, sheetName, rowCount) => {
                const infoEl = document.getElementById('current-file-info');
                if (infoEl) {
                    infoEl.textContent = `File: ${fileName} | Sheet: ${sheetName} (${rowCount} dòng)`;
                    infoEl.style.display = 'inline-flex';
                }
            },
            (msg, type) => this.showToast(msg, type)
        );
        this.excelHandler.initEventListeners('excel-file-input', 'drop-zone-overlay');
    }

    /**
     * Lắng nghe các nút bấm trên thanh công cụ
     */
    bindEvents() {
        // Nút thêm/xóa hàng, cột
        document.getElementById('btn-add-row')?.addEventListener('click', () => {
            this.spreadsheet.addRow();
            this.showToast('Đã thêm 1 hàng mới', 'info');
        });

        document.getElementById('btn-add-rows-5')?.addEventListener('click', () => {
            this.spreadsheet.addMultipleRows(5);
            this.showToast('Đã thêm 5 hàng trống', 'info');
        });

        document.getElementById('btn-add-col')?.addEventListener('click', () => {
            this.spreadsheet.addColumn();
            this.showToast('Đã thêm 1 cột mới', 'info');
        });

        document.getElementById('btn-delete-row')?.addEventListener('click', () => {
            this.spreadsheet.deleteSelectedRow();
        });

        document.getElementById('btn-delete-col')?.addEventListener('click', () => {
            this.spreadsheet.deleteSelectedColumn();
        });

        document.getElementById('btn-clear-table')?.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn xóa toàn bộ nội dung trong bảng không?')) {
                this.spreadsheet.clearAllData();
                this.showToast('Đã xóa trắng dữ liệu bảng', 'info');
            }
        });

        document.getElementById('btn-reset-table')?.addEventListener('click', () => {
            if (confirm('Khôi phục bảng tính về kích thước mặc định?')) {
                this.spreadsheet.resetGrid();
                const infoEl = document.getElementById('current-file-info');
                if (infoEl) infoEl.style.display = 'none';
                this.showToast('Đã đặt lại bảng tính', 'info');
            }
        });

        // Chọn bộ dữ liệu mẫu
        document.getElementById('select-sample-data')?.addEventListener('change', (e) => {
            const key = e.target.value;
            if (key && SAMPLE_DATASETS[key]) {
                this.loadSample(key);
                e.target.value = ''; // Reset select
            }
        });

        // Dropdown chọn cột thống kê
        document.getElementById('column-selector')?.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'ALL_COLUMNS') {
                this.setViewMode('all');
            } else {
                this.currentColumnIdx = parseInt(val, 10);
                this.spreadsheet.activeColumnIndex = this.currentColumnIdx;
                this.spreadsheet.render();
                this.setViewMode('single');
                this.recalculateAndRender();
            }
        });

        // Chuyển tab xem: Chi tiết cột vs Tổng hợp tất cả cột
        document.getElementById('tab-single-col')?.addEventListener('click', () => {
            this.setViewMode('single');
        });

        document.getElementById('tab-all-cols')?.addEventListener('click', () => {
            this.setViewMode('all');
        });

        // Xuất file Excel / CSV
        document.getElementById('btn-export-excel')?.addEventListener('click', () => {
            this.excelHandler.exportToExcel('Bang_Tinh_Du_Lieu.xlsx');
        });

        document.getElementById('btn-export-csv')?.addEventListener('click', () => {
            this.excelHandler.exportToCSV('Bang_Tinh_Du_Lieu.csv');
        });

        document.getElementById('btn-export-report')?.addEventListener('click', () => {
            this.calculateAllColumnsStats();
            this.excelHandler.exportStatisticalReport(this.statsCache, 'Bao_Cao_Thong_Ke_Mean_Median_Mode.xlsx');
        });

        // Đổi loại biểu đồ (Cột / Đường)
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const type = btn.dataset.type;
                this.chart.setChartType(type);
            });
        });

        // Modal hướng dẫn sử dụng
        const helpModal = document.getElementById('help-modal');
        document.getElementById('btn-open-help')?.addEventListener('click', () => {
            helpModal?.classList.add('active');
        });
        document.getElementById('btn-close-help')?.addEventListener('click', () => {
            helpModal?.classList.remove('active');
        });
        helpModal?.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.classList.remove('active');
        });

        // Modal Tải & Cài Đặt App
        const installModal = document.getElementById('install-modal');
        document.getElementById('btn-install-app')?.addEventListener('click', () => {
            installModal?.classList.add('active');
        });
        document.getElementById('btn-close-install')?.addEventListener('click', () => {
            installModal?.classList.remove('active');
        });
        installModal?.addEventListener('click', (e) => {
            if (e.target === installModal) installModal.classList.remove('active');
        });

        // Kích hoạt cài đặt PWA
        document.getElementById('btn-trigger-pwa-install')?.addEventListener('click', async () => {
            if (window.deferredPWAEvent) {
                window.deferredPWAEvent.prompt();
                const choiceResult = await window.deferredPWAEvent.userChoice;
                if (choiceResult.outcome === 'accepted') {
                    this.showToast('🎉 Đang tiến hành cài đặt ứng dụng...', 'success');
                    installModal?.classList.remove('active');
                }
                window.deferredPWAEvent = null;
            } else {
                this.showToast('💡 Nếu trình duyệt không tự mở hộp thoại, bạn có thể nhấp vào biểu tượng Cài Đặt ⊕ ở góc phải thanh địa chỉ trình duyệt!', 'info');
            }
        });

        // Đóng modal chọn Sheet nếu click ngoài
        const sheetModal = document.getElementById('sheet-picker-modal');
        document.getElementById('close-sheet-modal')?.addEventListener('click', () => {
            sheetModal?.classList.remove('active');
        });
    }

    /**
     * Nạp dữ liệu mẫu
     */
    loadSample(key) {
        const sample = SAMPLE_DATASETS[key];
        if (!sample) return;

        this.spreadsheet.loadData(sample.headers, sample.rows);
        
        // Chọn cột điểm số đầu tiên (hoặc cột 2) để phân tích
        this.currentColumnIdx = Math.min(2, sample.headers.length - 1);
        this.spreadsheet.activeColumnIndex = this.currentColumnIdx;
        this.spreadsheet.render();

        const infoEl = document.getElementById('current-file-info');
        if (infoEl) {
            infoEl.textContent = `Dữ liệu mẫu: ${sample.name}`;
            infoEl.style.display = 'inline-flex';
        }

        this.showToast(`📊 Đã nạp dữ liệu mẫu: ${sample.name}`, 'success');
        this.handleDataChange();
    }

    /**
     * Xử lý khi dữ liệu trong bảng thay đổi (gõ ô, dán, thêm hàng...)
     */
    handleDataChange() {
        this.updateColumnDropdown();
        this.calculateAllColumnsStats();
        this.recalculateAndRender();
    }

    /**
     * Cập nhật danh sách các cột trong menu Dropdown
     */
    updateColumnDropdown() {
        const select = document.getElementById('column-selector');
        if (!select) return;

        const currentVal = this.viewMode === 'all' ? 'ALL_COLUMNS' : String(this.currentColumnIdx);
        select.innerHTML = '';

        const allOpt = document.createElement('option');
        allOpt.value = 'ALL_COLUMNS';
        allOpt.textContent = '📑 Tổng Hợp Tất Cả Các Cột';
        select.appendChild(allOpt);

        this.spreadsheet.headers.forEach((h, idx) => {
            const opt = document.createElement('option');
            opt.value = String(idx);
            opt.textContent = `Cột ${this.spreadsheet.getColumnLetter(idx)}: ${h}`;
            select.appendChild(opt);
        });

        select.value = currentVal;
    }

    /**
     * Chuyển đổi giữa chế độ xem chi tiết 1 cột và xem tổng hợp toàn bộ bảng
     */
    setViewMode(mode) {
        this.viewMode = mode;
        const singleContainer = document.getElementById('single-col-analysis-view');
        const allContainer = document.getElementById('all-cols-summary-view');
        const tabSingle = document.getElementById('tab-single-col');
        const tabAll = document.getElementById('tab-all-cols');
        const select = document.getElementById('column-selector');

        if (mode === 'single') {
            singleContainer?.classList.remove('hidden');
            allContainer?.classList.add('hidden');
            tabSingle?.classList.add('active');
            tabAll?.classList.remove('active');
            if (select) select.value = String(this.currentColumnIdx);
            this.recalculateAndRender();
        } else {
            singleContainer?.classList.add('hidden');
            allContainer?.classList.remove('hidden');
            tabSingle?.classList.remove('active');
            tabAll?.classList.add('active');
            if (select) select.value = 'ALL_COLUMNS';
            this.renderAllColumnsSummary();
        }
    }

    /**
     * Tính toán thống kê cho tất cả các cột và lưu cache
     */
    calculateAllColumnsStats() {
        this.statsCache = [];
        this.spreadsheet.headers.forEach((header, idx) => {
            const rawColData = this.spreadsheet.getColumnData(idx);
            const stats = StatisticsEngine.analyze(rawColData, header);
            this.statsCache.push(stats);
        });
    }

    /**
     * Tính toán và hiển thị cho cột hiện tại
     */
    recalculateAndRender() {
        if (this.currentColumnIdx < 0 || this.currentColumnIdx >= this.spreadsheet.headers.length) {
            this.currentColumnIdx = 0;
        }

        const rawData = this.spreadsheet.getColumnData(this.currentColumnIdx);
        const colName = this.spreadsheet.getColumnName(this.currentColumnIdx);
        const stats = StatisticsEngine.analyze(rawData, colName);
        this.statsCache[this.currentColumnIdx] = stats;

        this.renderSingleColumnCards(stats);
        this.renderStepByStep(stats);
        this.chart.renderDistribution(stats);
    }

    /**
     * Cập nhật các thẻ chỉ số (Mean, Median, Mode + Phụ)
     */
    renderSingleColumnCards(stats) {
        const titleEl = document.getElementById('active-column-title');
        if (titleEl) {
            titleEl.textContent = `Cột ${this.spreadsheet.getColumnLetter(this.currentColumnIdx)}: ${stats.columnName}`;
        }

        const countBadge = document.getElementById('active-column-count');
        if (countBadge) {
            countBadge.textContent = `${stats.validCount} giá trị hợp lệ / ${stats.totalCount} dòng`;
        }

        if (!stats.hasNumericData) {
            document.getElementById('val-mean').textContent = 'N/A';
            document.getElementById('val-median').textContent = 'N/A';
            
            if (stats.textMode && stats.textMode.modes.length > 0) {
                document.getElementById('val-mode').textContent = stats.textMode.modes.join(', ');
                document.getElementById('val-mode-desc').textContent = `Mốt dạng chữ (xuất hiện ${stats.textMode.frequency} lần)`;
            } else {
                document.getElementById('val-mode').textContent = 'N/A';
                document.getElementById('val-mode-desc').textContent = 'Không có dữ liệu số';
            }

            document.getElementById('val-sum').textContent = '-';
            document.getElementById('val-min').textContent = '-';
            document.getElementById('val-max').textContent = '-';
            document.getElementById('val-range').textContent = '-';
            document.getElementById('val-variance').textContent = '-';
            document.getElementById('val-stddev').textContent = '-';
            document.getElementById('val-q1').textContent = '-';
            document.getElementById('val-q3').textContent = '-';
            document.getElementById('val-iqr').textContent = '-';
            return;
        }

        // Cập nhật 3 Thẻ Lớn Trọng Tâm
        // 1. Mean
        document.getElementById('val-mean').textContent = StatisticsEngine.roundAdaptive(stats.mean, 4);
        const meanDiff = stats.mean - stats.median;
        const meanDiffSign = meanDiff > 0 ? `+${StatisticsEngine.roundAdaptive(meanDiff, 2)}` : StatisticsEngine.roundAdaptive(meanDiff, 2);
        document.getElementById('val-mean-diff').textContent = `So với Trung vị: ${meanDiffSign}`;

        // 2. Median
        document.getElementById('val-median').textContent = StatisticsEngine.roundAdaptive(stats.median, 4);
        document.getElementById('val-median-type').textContent = stats.medianDetails.isEven 
            ? `Cỡ mẫu chẵn (N=${stats.validCount}): TB của 2 số ở giữa` 
            : `Cỡ mẫu lẻ (N=${stats.validCount}): Số chính giữa`;

        // 3. Mode
        if (stats.mode && stats.mode.length > 0) {
            document.getElementById('val-mode').textContent = stats.mode.join(', ');
            document.getElementById('val-mode-desc').textContent = `${stats.modeDescription} (Tần số: ${stats.modeFrequency} lần)`;
        } else {
            document.getElementById('val-mode').textContent = 'Không có mốt';
            document.getElementById('val-mode-desc').textContent = 'Tất cả các số có tần số xuất hiện như nhau.';
        }

        // Cập nhật các chỉ số bổ sung
        document.getElementById('val-sum').textContent = StatisticsEngine.roundAdaptive(stats.sum, 3);
        document.getElementById('val-min').textContent = StatisticsEngine.roundAdaptive(stats.min, 3);
        document.getElementById('val-max').textContent = StatisticsEngine.roundAdaptive(stats.max, 3);
        document.getElementById('val-range').textContent = StatisticsEngine.roundAdaptive(stats.range, 3);
        document.getElementById('val-variance').textContent = StatisticsEngine.roundAdaptive(stats.sampleVariance, 4);
        document.getElementById('val-stddev').textContent = StatisticsEngine.roundAdaptive(stats.sampleStdDev, 4);
        document.getElementById('val-q1').textContent = StatisticsEngine.roundAdaptive(stats.q1, 3);
        document.getElementById('val-q3').textContent = StatisticsEngine.roundAdaptive(stats.q3, 3);
        document.getElementById('val-iqr').textContent = StatisticsEngine.roundAdaptive(stats.iqr, 3);
    }

    /**
     * Hiển thị bảng giải thích từng bước tính toán (Step-by-step breakdown)
     */
    renderStepByStep(stats) {
        const container = document.getElementById('step-by-step-content');
        if (!container) return;

        if (!stats.hasNumericData || !stats.stepByStep) {
            container.innerHTML = `
                <div class="empty-notice">
                    <p>Cột này chứa dữ liệu chữ hoặc trống. Vui lòng chọn cột có dữ liệu số để xem từng bước giải toán.</p>
                </div>
            `;
            return;
        }

        const { meanStep, medianStep, modeStep } = stats.stepByStep;

        // Bảng tần số cho Mode
        let modeTableHtml = '';
        if (modeStep.table && modeStep.table.length > 0) {
            modeTableHtml = `
                <div class="step-freq-table-wrapper">
                    <table class="step-freq-table">
                        <thead>
                            <tr>
                                <th>Giá trị</th>
                                <th>Số lần xuất hiện (Tần số)</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${modeStep.table.map(item => `
                                <tr class="${item.isMode ? 'highlight-mode-row' : ''}">
                                    <td><strong>${item.val}</strong></td>
                                    <td>${item.count} lần</td>
                                    <td>${item.isMode ? '<span class="mode-badge">⭐ Mốt (Mode)</span>' : '<span class="text-muted">-</span>'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="step-box">
                <div class="step-header">
                    <span class="step-number-badge">1</span>
                    <h4>${meanStep.title}</h4>
                </div>
                <div class="step-formula"><code>${meanStep.formula}</code></div>
                <p class="step-desc">${meanStep.explanation}</p>
                <div class="step-calc-box">${meanStep.calculation}</div>
            </div>

            <div class="step-box">
                <div class="step-header">
                    <span class="step-number-badge">2</span>
                    <h4>${medianStep.title}</h4>
                </div>
                <div class="step-formula"><code>${medianStep.formula}</code></div>
                <p class="step-desc" style="white-space: pre-line;">${medianStep.explanation}</p>
                <div class="step-calc-box">${medianStep.calculation}</div>
            </div>

            <div class="step-box">
                <div class="step-header">
                    <span class="step-number-badge">3</span>
                    <h4>${modeStep.title}</h4>
                </div>
                <div class="step-formula"><code>${modeStep.formula}</code></div>
                <p class="step-desc">${modeStep.explanation}</p>
                ${modeTableHtml}
                <div class="step-calc-box">${modeStep.calculation}</div>
            </div>
        `;
    }

    /**
     * Hiển thị bảng tổng hợp toàn bộ các cột trong bảng tính
     */
    renderAllColumnsSummary() {
        const tableBody = document.getElementById('all-columns-table-body');
        if (!tableBody) return;

        this.calculateAllColumnsStats();
        tableBody.innerHTML = '';

        this.statsCache.forEach((st, idx) => {
            const tr = document.createElement('tr');
            tr.className = st.hasNumericData ? 'summary-row' : 'summary-row text-col-row';

            if (st.hasNumericData) {
                const modeStr = st.mode && st.mode.length > 0 ? st.mode.join(', ') : 'Không có';
                tr.innerHTML = `
                    <td><strong>Cột ${this.spreadsheet.getColumnLetter(idx)}</strong>: ${st.columnName}</td>
                    <td><span class="badge-tag">${st.validCount}</span></td>
                    <td class="stat-highlight"><strong>${StatisticsEngine.roundAdaptive(st.mean)}</strong></td>
                    <td class="stat-highlight-emerald"><strong>${StatisticsEngine.roundAdaptive(st.median)}</strong></td>
                    <td class="stat-highlight-pink"><strong>${modeStr}</strong> ${st.modeFrequency ? `<small>(${st.modeFrequency} lần)</small>` : ''}</td>
                    <td>${st.min}</td>
                    <td>${st.max}</td>
                    <td>${StatisticsEngine.roundAdaptive(st.sampleStdDev)}</td>
                    <td>
                        <button class="btn-inspect-col" data-col="${idx}">🔍 Xem Chi Tiết</button>
                    </td>
                `;
            } else {
                tr.innerHTML = `
                    <td><strong>Cột ${this.spreadsheet.getColumnLetter(idx)}</strong>: ${st.columnName}</td>
                    <td><span class="badge-tag">${st.validCount}</span></td>
                    <td colspan="6" class="text-muted">Cột dữ liệu văn bản / Không có dữ liệu số</td>
                    <td>
                        <button class="btn-inspect-col" data-col="${idx}">🔍 Xem Chi Tiết</button>
                    </td>
                `;
            }

            tableBody.appendChild(tr);
        });

        // Bắt sự kiện nhấp nút "Xem Chi Tiết" cho từng hàng
        tableBody.querySelectorAll('.btn-inspect-col').forEach(btn => {
            btn.addEventListener('click', () => {
                const colIdx = parseInt(btn.dataset.col, 10);
                this.currentColumnIdx = colIdx;
                this.spreadsheet.setActiveColumn(colIdx);
                this.setViewMode('single');
            });
        });
    }

    /**
     * Hiển thị thông báo Toast nhanh góc dưới màn hình
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'warning') icon = '⚠️';
        if (type === 'error') icon = '❌';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-msg">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    window.statApp = new App();
    window.statApp.start();
});
