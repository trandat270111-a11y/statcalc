/**
 * Interactive Data Visualization with Chart.js
 * Hiển thị trực quan hóa dữ liệu thống kê:
 * - Biểu đồ phân phối tần số (Histogram / Frequency Distribution)
 * - Đánh dấu trực quan các vị trí Trung Bình, Trung Vị, Mốt
 * - Hỗ trợ chuyển đổi giữa biểu đồ cột, biểu đồ đường phân phối
 * - Tự động đồng bộ màu sắc theo theme Sáng / Tối
 */

class StatisticsChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.chartInstance = null;
        this.currentStats = null;
        this.chartType = 'bar'; // 'bar' hoặc 'line'
    }

    /**
     * Lấy màu sắc phù hợp với giao diện hiện tại (Dark / Light)
     */
    getThemeColors() {
        const isDark = document.body.classList.contains('dark-theme');
        return {
            textColor: isDark ? '#94a3b8' : '#475569',
            gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            barBg: isDark ? 'rgba(99, 102, 241, 0.65)' : 'rgba(79, 70, 229, 0.75)',
            barBorder: isDark ? '#818cf8' : '#4f46e5',
            modeBg: isDark ? 'rgba(244, 63, 94, 0.85)' : 'rgba(225, 29, 72, 0.85)',
            meanLine: '#f59e0b',   // Amber
            medianLine: '#10b981', // Emerald
            modeLine: '#ec4899',   // Pink / Rose
            tooltipBg: isDark ? '#1e293b' : '#ffffff',
            tooltipText: isDark ? '#f8fafc' : '#0f172a'
        };
    }

    /**
     * Vẽ biểu đồ phân phối tần số cho cột đang được chọn
     */
    renderDistribution(stats) {
        if (!this.canvas || typeof Chart === 'undefined') return;
        this.currentStats = stats;

        if (!stats || !stats.hasNumericData || !stats.frequencyDistribution) {
            this.clear();
            return;
        }

        const colors = this.getThemeColors();
        const dist = stats.frequencyDistribution;
        const labels = dist.labels;
        const dataCounts = dist.counts;

        // Xác định cột nào chứa giá trị Mốt để tô màu nổi bật
        const backgroundColors = [];
        const borderColors = [];

        labels.forEach((label, idx) => {
            let isModeBin = false;
            if (dist.isDiscrete) {
                const val = Number(label);
                if (stats.mode && stats.mode.includes(val)) {
                    isModeBin = true;
                }
            } else {
                const bin = dist.bins[idx];
                if (stats.mode && stats.mode.some(m => m >= bin.min && m <= bin.max)) {
                    isModeBin = true;
                }
            }

            if (isModeBin) {
                backgroundColors.push(colors.modeBg);
                borderColors.push('#ffffff');
            } else {
                backgroundColors.push(colors.barBg);
                borderColors.push(colors.barBorder);
            }
        });

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const ctx = this.canvas.getContext('2d');
        this.chartInstance = new Chart(ctx, {
            type: this.chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: `Tần số xuất hiện (${stats.columnName})`,
                    data: dataCounts,
                    backgroundColor: this.chartType === 'line' ? 'rgba(99, 102, 241, 0.2)' : backgroundColors,
                    borderColor: this.chartType === 'line' ? colors.barBorder : borderColors,
                    borderWidth: 2,
                    borderRadius: this.chartType === 'bar' ? 6 : 0,
                    fill: this.chartType === 'line',
                    tension: 0.35,
                    pointBackgroundColor: backgroundColors,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 600,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        titleColor: colors.tooltipText,
                        bodyColor: colors.tooltipText,
                        borderColor: colors.gridColor,
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                const count = context.raw;
                                const pct = ((count / stats.validCount) * 100).toFixed(1);
                                return ` Tần số: ${count} lần (${pct}% tổng dữ liệu)`;
                            },
                            afterLabel: (context) => {
                                const idx = context.dataIndex;
                                const isModeHighlight = (backgroundColors[idx] === colors.modeBg);
                                return isModeHighlight ? ' ⭐ Chứa giá trị Mốt (Mode)' : '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: colors.gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: colors.textColor,
                            font: { family: 'Plus Jakarta Sans, sans-serif', size: 11 },
                            maxRotation: 45
                        },
                        title: {
                            display: true,
                            text: `${stats.columnName} (${dist.isDiscrete ? 'Giá trị' : 'Khoảng giá trị'})`,
                            color: colors.textColor,
                            font: { family: 'Plus Jakarta Sans, sans-serif', size: 12, weight: '600' }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: colors.gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: colors.textColor,
                            font: { family: 'Plus Jakarta Sans, sans-serif', size: 11 },
                            precision: 0
                        },
                        title: {
                            display: true,
                            text: 'Số lần xuất hiện (Tần số)',
                            color: colors.textColor,
                            font: { family: 'Plus Jakarta Sans, sans-serif', size: 12, weight: '600' }
                        }
                    }
                }
            }
        });
    }

    /**
     * Đổi loại biểu đồ (cột hoặc đường)
     */
    setChartType(type) {
        this.chartType = type;
        if (this.currentStats) {
            this.renderDistribution(this.currentStats);
        }
    }

    /**
     * Xóa biểu đồ
     */
    clear() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

window.StatisticsChart = StatisticsChart;
