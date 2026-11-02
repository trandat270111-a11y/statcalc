/**
 * Interactive In-App Spreadsheet Engine
 * Quản lý bảng tính trực tiếp trong ứng dụng:
 * - Lưới ô bảng tính với số hàng 1, 2, 3... và cột A, B, C...
 * - Chỉnh sửa ô nhanh, điều hướng bằng phím mũi tên, Enter, Tab
 * - Đổi tên tiêu đề cột trực tiếp
 * - Thêm / Xóa hàng, cột
 * - Dán dữ liệu (Paste) từ Excel hoặc clipboard nhiều dòng/cột
 * - Tự động phát sự kiện thay đổi dữ liệu theo thời gian thực
 */

class Spreadsheet {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = Object.assign({
            initialRows: 15,
            initialCols: 6,
            defaultColPrefix: '',
            onDataChange: null,
            onColumnSelect: null
        }, options);

        this.headers = []; // ['Cột A', 'Cột B', ...]
        this.data = [];    // 2D Array [ [r0c0, r0c1, ...], [r1c0, ...] ]
        this.selectedCell = { row: 0, col: 0 };
        this.activeColumnIndex = 0; // Cột đang được chọn để phân tích thống kê
        this.isEditing = false;

        this.init();
    }

    init() {
        this.initEmptyGrid(this.options.initialRows, this.options.initialCols);
        this.render();
        this.bindGlobalKeyboard();
    }

    /**
     * Tạo bảng trống mặc định
     */
    initEmptyGrid(numRows, numCols) {
        this.headers = [];
        for (let c = 0; c < numCols; c++) {
            this.headers.push(this.getColumnLetter(c));
        }

        this.data = [];
        for (let r = 0; r < numRows; r++) {
            const row = new Array(numCols).fill('');
            this.data.push(row);
        }
    }

    /**
     * Đổi chỉ số cột sang chữ cái: 0 -> A, 1 -> B, 25 -> Z, 26 -> AA...
     */
    getColumnLetter(colIndex) {
        let temp = colIndex;
        let letter = '';
        while (temp >= 0) {
            letter = String.fromCharCode((temp % 26) + 65) + letter;
            temp = Math.floor(temp / 26) - 1;
        }
        return letter;
    }

    /**
     * Nạp dữ liệu mới vào bảng (từ file Excel hoặc dữ liệu mẫu)
     */
    loadData(headers, rows) {
        if (!rows || rows.length === 0) {
            rows = [['']];
        }

        const maxCols = Math.max(
            headers ? headers.length : 0,
            ...rows.map(r => r.length)
        );

        this.headers = [];
        for (let c = 0; c < maxCols; c++) {
            if (headers && headers[c] !== undefined && String(headers[c]).trim() !== '') {
                this.headers.push(String(headers[c]).trim());
            } else {
                this.headers.push(this.getColumnLetter(c));
            }
        }

        this.data = rows.map(row => {
            const newRow = new Array(maxCols).fill('');
            for (let c = 0; c < maxCols; c++) {
                newRow[c] = (row[c] !== undefined && row[c] !== null) ? String(row[c]).trim() : '';
            }
            return newRow;
        });

        // Đảm bảo tối thiểu 10 hàng để nhìn thoáng đãng
        while (this.data.length < 10) {
            this.data.push(new Array(maxCols).fill(''));
        }

        this.selectedCell = { row: 0, col: 0 };
        this.activeColumnIndex = 0;
        this.render();
        this.triggerDataChange();
    }

    /**
     * Vẽ toàn bộ giao diện bảng tính
     */
    render() {
        if (!this.container) return;

        const table = document.createElement('table');
        table.className = 'spreadsheet-table';
        table.id = 'spreadsheet-grid';

        // Render Thead
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Góc trên cùng bên trái (Ô giao giữa chỉ số dòng và cột)
        const cornerTh = document.createElement('th');
        cornerTh.className = 'corner-header';
        cornerTh.innerHTML = '<span class="grid-icon">#</span>';
        cornerTh.title = 'Chọn toàn bộ bảng';
        cornerTh.addEventListener('click', () => {
            if (this.options.onColumnSelect) {
                this.options.onColumnSelect(-1); // -1 nghĩa là toàn bộ bảng
            }
        });
        headerRow.appendChild(cornerTh);

        // Header các cột
        this.headers.forEach((headerText, colIdx) => {
            const th = document.createElement('th');
            th.className = 'col-header' + (colIdx === this.activeColumnIndex ? ' active-stat-col' : '');
            th.dataset.col = colIdx;

            const headerContainer = document.createElement('div');
            headerContainer.className = 'col-header-content';

            const colLetter = document.createElement('span');
            colLetter.className = 'col-letter';
            colLetter.textContent = this.getColumnLetter(colIdx);

            const titleSpan = document.createElement('span');
            titleSpan.className = 'col-title';
            titleSpan.textContent = headerText;
            titleSpan.title = 'Nhấp đúp để đổi tên cột';

            // Đổi tên cột khi nhấp đúp
            titleSpan.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.startEditHeader(colIdx, titleSpan);
            });

            const statBadge = document.createElement('button');
            statBadge.className = 'col-stat-btn' + (colIdx === this.activeColumnIndex ? ' active' : '');
            statBadge.title = 'Chọn cột này để phân tích thống kê';
            statBadge.innerHTML = '📊';
            statBadge.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setActiveColumn(colIdx);
            });

            headerContainer.appendChild(colLetter);
            headerContainer.appendChild(titleSpan);
            headerContainer.appendChild(statBadge);

            th.appendChild(headerContainer);

            // Nhấp vào tiêu đề cột để chọn phân tích
            th.addEventListener('click', () => {
                this.setActiveColumn(colIdx);
            });

            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Render Tbody
        const tbody = document.createElement('tbody');
        this.data.forEach((row, rowIdx) => {
            const tr = document.createElement('tr');
            tr.dataset.row = rowIdx;

            // Header số dòng (1, 2, 3...)
            const rowTh = document.createElement('th');
            rowTh.className = 'row-header' + (rowIdx === this.selectedCell.row ? ' row-highlight' : '');
            rowTh.textContent = rowIdx + 1;
            rowTh.title = `Dòng ${rowIdx + 1}`;
            rowTh.addEventListener('click', () => {
                this.selectCell(rowIdx, 0);
            });
            tr.appendChild(rowTh);

            // Các ô dữ liệu
            row.forEach((cellVal, colIdx) => {
                const td = document.createElement('td');
                td.className = 'grid-cell';
                if (rowIdx === this.selectedCell.row && colIdx === this.selectedCell.col) {
                    td.classList.add('cell-selected');
                }
                if (colIdx === this.activeColumnIndex) {
                    td.classList.add('stat-col-cell');
                }
                td.dataset.row = rowIdx;
                td.dataset.col = colIdx;
                td.textContent = cellVal;

                // Xử lý sự kiện click & dblclick
                td.addEventListener('click', (e) => {
                    this.selectCell(rowIdx, colIdx);
                });

                td.addEventListener('dblclick', () => {
                    this.startEditCell(rowIdx, colIdx, td);
                });

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        this.container.innerHTML = '';
        this.container.appendChild(table);

        // Đảm bảo bắt sự kiện dán Paste vào bảng
        this.container.onpaste = (e) => this.handlePaste(e);
    }

    /**
     * Chọn ô
     */
    selectCell(row, col) {
        if (row < 0 || row >= this.data.length || col < 0 || col >= this.headers.length) return;
        this.selectedCell = { row, col };
        this.updateCellSelectionStyles();
    }

    /**
     * Đặt cột đang phân tích thống kê
     */
    setActiveColumn(colIdx) {
        this.activeColumnIndex = colIdx;
        this.render();
        if (this.options.onColumnSelect) {
            this.options.onColumnSelect(colIdx);
        }
    }

    /**
     * Cập nhật các class active/selected mà không cần re-render toàn bộ DOM
     */
    updateCellSelectionStyles() {
        const cells = this.container.querySelectorAll('.grid-cell');
        cells.forEach(c => c.classList.remove('cell-selected'));

        const currentCell = this.container.querySelector(`.grid-cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);
        if (currentCell) {
            currentCell.classList.add('cell-selected');
            currentCell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }

        const rowHeaders = this.container.querySelectorAll('.row-header');
        rowHeaders.forEach((h, idx) => {
            if (idx === this.selectedCell.row) {
                h.classList.add('row-highlight');
            } else {
                h.classList.remove('row-highlight');
            }
        });
    }

    /**
     * Bắt đầu chỉnh sửa ô
     */
    startEditCell(row, col, tdElement) {
        if (this.isEditing) return;
        this.isEditing = true;

        const originalText = this.data[row][col] || '';
        tdElement.innerHTML = '';
        tdElement.classList.add('editing');

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cell-input';
        input.value = originalText;
        tdElement.appendChild(input);
        input.focus();
        input.select();

        const commit = () => {
            if (!this.isEditing) return;
            const newVal = input.value.trim();
            this.data[row][col] = newVal;
            tdElement.classList.remove('editing');
            tdElement.textContent = newVal;
            this.isEditing = false;
            this.triggerDataChange();
        };

        const cancel = () => {
            if (!this.isEditing) return;
            tdElement.classList.remove('editing');
            tdElement.textContent = originalText;
            this.isEditing = false;
        };

        input.addEventListener('blur', commit);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                commit();
                this.selectCell(Math.min(this.data.length - 1, row + 1), col);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                commit();
                if (e.shiftKey) {
                    this.selectCell(row, Math.max(0, col - 1));
                } else {
                    this.selectCell(row, Math.min(this.headers.length - 1, col + 1));
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
            }
        });
    }

    /**
     * Đổi tên tiêu đề cột
     */
    startEditHeader(colIdx, titleSpan) {
        const originalName = this.headers[colIdx];
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'header-input';
        input.value = originalName;

        titleSpan.innerHTML = '';
        titleSpan.appendChild(input);
        input.focus();
        input.select();

        const commitHeader = () => {
            const newName = input.value.trim() || this.getColumnLetter(colIdx);
            this.headers[colIdx] = newName;
            titleSpan.textContent = newName;
            this.triggerDataChange();
        };

        input.addEventListener('blur', commitHeader);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            } else if (e.key === 'Escape') {
                titleSpan.textContent = originalName;
            }
        });
    }

    /**
     * Lắng nghe bàn phím điều hướng khi không ở chế độ edit
     */
    bindGlobalKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Không can thiệp nếu đang gõ trong input khác ngoài bảng tính
            if (this.isEditing) return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }

            const { row, col } = this.selectedCell;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectCell(Math.max(0, row - 1), col);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectCell(Math.min(this.data.length - 1, row + 1), col);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.selectCell(row, Math.max(0, col - 1));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.selectCell(row, Math.min(this.headers.length - 1, col + 1));
                    break;
                case 'Tab':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.selectCell(row, Math.max(0, col - 1));
                    } else {
                        this.selectCell(row, Math.min(this.headers.length - 1, col + 1));
                    }
                    break;
                case 'Enter':
                case 'F2':
                    e.preventDefault();
                    const td = this.container.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
                    if (td) this.startEditCell(row, col, td);
                    break;
                case 'Delete':
                case 'Backspace':
                    // Xóa nhanh nội dung ô đang chọn
                    this.data[row][col] = '';
                    const cellToClear = this.container.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
                    if (cellToClear) cellToClear.textContent = '';
                    this.triggerDataChange();
                    break;
                default:
                    // Nếu bấm phím chữ/số thông thường, tự động mở edit với ký tự đó
                    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                        const tdDirect = this.container.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
                        if (tdDirect) {
                            this.data[row][col] = '';
                            this.startEditCell(row, col, tdDirect);
                            const activeInput = tdDirect.querySelector('input');
                            if (activeInput) activeInput.value = e.key;
                        }
                    }
                    break;
            }
        });
    }

    /**
     * Dán dữ liệu từ Clipboard (hỗ trợ nhiều dòng, nhiều cột từ Excel/Google Sheets)
     */
    handlePaste(e) {
        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        const pastedText = clipboardData.getData('Text');
        if (!pastedText) return;

        e.preventDefault();

        // Tách dòng
        const lines = pastedText.split(/\r\n|\n|\r/).filter(l => l.length > 0);
        if (lines.length === 0) return;

        const startRow = this.selectedCell.row;
        const startCol = this.selectedCell.col;

        let neededRows = startRow + lines.length;
        let neededCols = startCol;

        // Mở rộng bảng nếu vùng dán vượt quá kích thước hiện tại
        lines.forEach(line => {
            const cells = line.split('\t');
            if (startCol + cells.length > neededCols) {
                neededCols = startCol + cells.length;
            }
        });

        while (this.headers.length < neededCols) {
            this.headers.push(this.getColumnLetter(this.headers.length));
        }

        while (this.data.length < neededRows) {
            this.data.push(new Array(this.headers.length).fill(''));
        }

        // Cập nhật từng ô
        lines.forEach((line, rOffset) => {
            const cells = line.split('\t');
            cells.forEach((val, cOffset) => {
                const targetR = startRow + rOffset;
                const targetC = startCol + cOffset;
                if (targetR < this.data.length && targetC < this.headers.length) {
                    this.data[targetR][targetC] = val.trim();
                }
            });
        });

        this.render();
        this.triggerDataChange();
    }

    /**
     * Thêm 1 hàng mới vào cuối bảng hoặc sau hàng đang chọn
     */
    addRow(afterSelected = false) {
        const newRow = new Array(this.headers.length).fill('');
        if (afterSelected && this.selectedCell.row >= 0) {
            this.data.splice(this.selectedCell.row + 1, 0, newRow);
            this.selectedCell.row++;
        } else {
            this.data.push(newRow);
            this.selectedCell.row = this.data.length - 1;
        }
        this.render();
        this.triggerDataChange();
    }

    /**
     * Thêm N hàng trống
     */
    addMultipleRows(count = 5) {
        for (let i = 0; i < count; i++) {
            this.data.push(new Array(this.headers.length).fill(''));
        }
        this.render();
        this.triggerDataChange();
    }

    /**
     * Thêm 1 cột mới
     */
    addColumn(customName = null) {
        const newColIndex = this.headers.length;
        const colName = customName || this.getColumnLetter(newColIndex);
        this.headers.push(colName);
        this.data.forEach(row => row.push(''));
        this.render();
        this.triggerDataChange();
    }

    /**
     * Xóa hàng đang được chọn
     */
    deleteSelectedRow() {
        if (this.data.length <= 1) {
            alert('Bảng phải có ít nhất 1 hàng.');
            return;
        }
        this.data.splice(this.selectedCell.row, 1);
        this.selectedCell.row = Math.max(0, this.selectedCell.row - 1);
        this.render();
        this.triggerDataChange();
    }

    /**
     * Xóa cột đang được chọn
     */
    deleteSelectedColumn() {
        if (this.headers.length <= 1) {
            alert('Bảng phải có ít nhất 1 cột.');
            return;
        }
        const colToDelete = this.activeColumnIndex;
        this.headers.splice(colToDelete, 1);
        this.data.forEach(row => row.splice(colToDelete, 1));
        this.activeColumnIndex = Math.max(0, colToDelete - 1);
        this.selectedCell.col = Math.max(0, this.selectedCell.col - 1);
        this.render();
        this.triggerDataChange();
        if (this.options.onColumnSelect) {
            this.options.onColumnSelect(this.activeColumnIndex);
        }
    }

    /**
     * Xóa toàn bộ nội dung trong bảng (giữ lại cấu trúc cột)
     */
    clearAllData() {
        this.data = this.data.map(() => new Array(this.headers.length).fill(''));
        this.render();
        this.triggerDataChange();
    }

    /**
     * Đặt lại bảng về trạng thái ban đầu
     */
    resetGrid() {
        this.initEmptyGrid(15, 6);
        this.selectedCell = { row: 0, col: 0 };
        this.activeColumnIndex = 0;
        this.render();
        this.triggerDataChange();
        if (this.options.onColumnSelect) {
            this.options.onColumnSelect(0);
        }
    }

    /**
     * Lấy mảng dữ liệu của một cột cụ thể
     */
    getColumnData(colIdx) {
        if (colIdx < 0 || colIdx >= this.headers.length) return [];
        return this.data.map(row => row[colIdx]);
    }

    /**
     * Lấy tên của một cột
     */
    getColumnName(colIdx) {
        return this.headers[colIdx] || `Cột ${colIdx + 1}`;
    }

    /**
     * Lấy toàn bộ dữ liệu bảng dưới dạng mảng 2D (Header + Rows) để xuất Excel/CSV
     */
    getExportData() {
        return [
            [...this.headers],
            ...this.data.filter(row => row.some(cell => cell !== ''))
        ];
    }

    /**
     * Kích hoạt callback khi dữ liệu thay đổi
     */
    triggerDataChange() {
        if (this.options.onDataChange) {
            this.options.onDataChange();
        }
    }
}

window.Spreadsheet = Spreadsheet;
