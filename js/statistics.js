/**
 * Statistics Engine for Statistical Spreadsheet App
 * Cung cấp các thuật toán tính toán thống kê mô tả:
 * - Trung bình (Mean)
 * - Trung vị (Median)
 * - Mốt / Yếu vị (Mode - hỗ trợ đơn mốt, đa mốt, không có mốt)
 * - Phương sai, độ lệch chuẩn, tứ phân vị, khoảng biến thiên
 * - Bảng phân phối tần số & hướng dẫn chi tiết từng bước tính
 */

class StatisticsEngine {
    /**
     * Chuyển đổi giá trị thô thành số thực (hỗ trợ định dạng Việt Nam/Mỹ, phần trăm, tiền tệ)
     */
    static parseNumber(val) {
        if (val === null || val === undefined) return null;
        if (typeof val === 'number') {
            return isNaN(val) ? null : val;
        }
        
        let str = String(val).trim();
        if (str === '') return null;
        
        // Bỏ ký hiệu tiền tệ hoặc %
        str = str.replace(/[₫$€£¥%]/g, '').trim();
        
        // Xử lý dấu phân cách hàng nghìn và dấu thập phân
        // TH1: 1.234.567,89 (Chuẩn VN/Châu Âu)
        if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(str)) {
            str = str.replace(/\./g, '').replace(',', '.');
        }
        // TH2: 1,234,567.89 (Chuẩn US)
        else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(str)) {
            str = str.replace(/,/g, '');
        }
        // TH3: 1234,56 (Dấu phẩy thập phân đơn giản)
        else if (/^-?\d+,\d+$/.test(str)) {
            str = str.replace(',', '.');
        }
        
        const num = Number(str);
        return isNaN(num) ? null : num;
    }

    /**
     * Tính toán toàn diện các chỉ số thống kê
     * @param {Array} rawValues Mảng giá trị từ cột hoặc vùng chọn
     * @param {string} columnName Tên cột dữ liệu
     */
    static analyze(rawValues, columnName = 'Dữ liệu') {
        const totalCount = rawValues.length;
        const validNumbers = [];
        const nonNumericValues = [];
        let emptyCount = 0;

        for (const item of rawValues) {
            if (item === null || item === undefined || String(item).trim() === '') {
                emptyCount++;
                continue;
            }
            const parsed = this.parseNumber(item);
            if (parsed !== null) {
                validNumbers.push(parsed);
            } else {
                nonNumericValues.push(String(item).trim());
            }
        }

        const validCount = validNumbers.length;

        // Nếu không có số hợp lệ
        if (validCount === 0) {
            return {
                columnName,
                totalCount,
                validCount: 0,
                emptyCount,
                nonNumericCount: nonNumericValues.length,
                hasNumericData: false,
                textMode: this.calculateTextMode(nonNumericValues),
                message: 'Không có dữ liệu số để tính toán.'
            };
        }

        // Sắp xếp tăng dần cho trung vị, tứ phân vị, min, max
        const sorted = [...validNumbers].sort((a, b) => a - b);
        const sum = validNumbers.reduce((acc, v) => acc + v, 0);
        const mean = sum / validCount;

        // Trung vị
        const medianResult = this.calculateMedian(sorted);

        // Mốt
        const modeResult = this.calculateMode(validNumbers);

        // Min, Max, Range
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const range = max - min;

        // Phương sai & Độ lệch chuẩn (Mẫu n-1 và Tổng thể N)
        let sumSquaredDiff = 0;
        for (const val of validNumbers) {
            sumSquaredDiff += Math.pow(val - mean, 2);
        }
        const populationVariance = sumSquaredDiff / validCount;
        const populationStdDev = Math.sqrt(populationVariance);
        const sampleVariance = validCount > 1 ? sumSquaredDiff / (validCount - 1) : 0;
        const sampleStdDev = Math.sqrt(sampleVariance);

        // Tứ phân vị
        const q1 = this.calculatePercentile(sorted, 0.25);
        const q2 = medianResult.value;
        const q3 = this.calculatePercentile(sorted, 0.75);
        const iqr = q3 - q1;

        // Bảng tần số & phân nhóm cho biểu đồ histogram
        const frequencyDistribution = this.createFrequencyDistribution(sorted, min, max);

        // Chi tiết giải thích từng bước (Step-by-step breakdown)
        const stepByStep = this.generateStepByStep({
            validNumbers,
            sorted,
            sum,
            mean,
            medianResult,
            modeResult,
            validCount
        });

        return {
            columnName,
            totalCount,
            validCount,
            emptyCount,
            nonNumericCount: nonNumericValues.length,
            hasNumericData: true,
            mean,
            median: medianResult.value,
            medianDetails: medianResult,
            mode: modeResult.modes,
            modeType: modeResult.type, // 'none', 'unimodal', 'bimodal', 'multimodal'
            modeFrequency: modeResult.frequency,
            modeDescription: modeResult.description,
            sum,
            min,
            max,
            range,
            sampleVariance,
            sampleStdDev,
            populationVariance,
            populationStdDev,
            q1,
            q2,
            q3,
            iqr,
            sortedSample: sorted.slice(0, 50),
            frequencyDistribution,
            stepByStep
        };
    }

    /**
     * Tính trung vị và ghi lại vị trí chỉ số
     */
    static calculateMedian(sorted) {
        const n = sorted.length;
        if (n === 0) return { value: 0, index: -1, isEven: false, formula: '' };

        if (n % 2 === 1) {
            // Lẻ: Giá trị ở vị trí (n + 1) / 2 (0-indexed: (n - 1) / 2)
            const midIndex = Math.floor(n / 2);
            return {
                value: sorted[midIndex],
                index: midIndex,
                isEven: false,
                middleValues: [sorted[midIndex]],
                formula: `Vì N = ${n} (lẻ), trung vị là giá trị tại vị trí (N + 1)/2 = ${(n + 1) / 2} (giá trị: ${sorted[midIndex]}).`
            };
        } else {
            // Chẵn: Trung bình cộng của 2 giá trị giữa n/2 và n/2 + 1
            const mid1 = (n / 2) - 1;
            const mid2 = n / 2;
            const val1 = sorted[mid1];
            const val2 = sorted[mid2];
            const medianVal = (val1 + val2) / 2;
            return {
                value: medianVal,
                indices: [mid1, mid2],
                isEven: true,
                middleValues: [val1, val2],
                formula: `Vì N = ${n} (chẵn), trung vị là trung bình cộng của 2 giá trị tại vị trí N/2 = ${n/2} (${val1}) và N/2+1 = ${n/2+1} (${val2}): (${val1} + ${val2})/2 = ${medianVal}.`
            };
        }
    }

    /**
     * Tính mốt (Mode) với hỗ trợ đơn mốt, đa mốt, hoặc không có mốt
     */
    static calculateMode(values) {
        if (values.length === 0) {
            return { modes: [], frequency: 0, type: 'none', description: 'Không có dữ liệu' };
        }

        const freqMap = new Map();
        for (const v of values) {
            // Làm tròn số rất nhỏ để tránh sai số dấu phẩy động
            const key = Math.round(v * 1000000) / 1000000;
            freqMap.set(key, (freqMap.get(key) || 0) + 1);
        }

        let maxFreq = 0;
        for (const count of freqMap.values()) {
            if (count > maxFreq) maxFreq = count;
        }

        // Nếu tất cả các giá trị chỉ xuất hiện 1 lần và tổng số > 1
        // Hoặc tất cả giá trị đều có tần số bằng nhau
        const allCounts = Array.from(freqMap.values());
        const allSameFreq = allCounts.every(c => c === maxFreq);

        if ((maxFreq === 1 && values.length > 1) || (allSameFreq && freqMap.size > 1)) {
            return {
                modes: [],
                frequency: maxFreq,
                type: 'none',
                freqMap,
                description: 'Không có mốt (tất cả các giá trị đều có tần số xuất hiện như nhau).'
            };
        }

        const modes = [];
        for (const [val, count] of freqMap.entries()) {
            if (count === maxFreq) {
                modes.push(val);
            }
        }

        // Sắp xếp các giá trị mốt tăng dần
        modes.sort((a, b) => a - b);

        let type = 'unimodal';
        let desc = '';
        if (modes.length === 1) {
            type = 'unimodal';
            desc = `Đơn mốt (Unimodal): Giá trị ${modes[0]} xuất hiện nhiều nhất với ${maxFreq} lần.`;
        } else if (modes.length === 2) {
            type = 'bimodal';
            desc = `Hai mốt (Bimodal): Các giá trị [${modes.join(', ')}] cùng xuất hiện nhiều nhất (${maxFreq} lần).`;
        } else {
            type = 'multimodal';
            desc = `Đa mốt (Multimodal): Có ${modes.length} giá trị [${modes.slice(0, 5).join(', ')}${modes.length > 5 ? '...' : ''}] cùng xuất hiện nhiều nhất (${maxFreq} lần).`;
        }

        return {
            modes,
            frequency: maxFreq,
            type,
            freqMap,
            description: desc
        };
    }

    /**
     * Tính mốt cho dữ liệu dạng chữ (Text)
     */
    static calculateTextMode(values) {
        if (!values || values.length === 0) return null;
        const freqMap = new Map();
        for (const v of values) {
            freqMap.set(v, (freqMap.get(v) || 0) + 1);
        }
        let maxFreq = 0;
        for (const count of freqMap.values()) {
            if (count > maxFreq) maxFreq = count;
        }
        const modes = [];
        for (const [val, count] of freqMap.entries()) {
            if (count === maxFreq) modes.push(val);
        }
        return {
            modes,
            frequency: maxFreq,
            totalTextItems: values.length
        };
    }

    /**
     * Tính phân vị (Percentile)
     */
    static calculatePercentile(sorted, p) {
        if (sorted.length === 0) return 0;
        if (sorted.length === 1) return sorted[0];
        const index = p * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    /**
     * Tạo bảng tần số phân nhóm cho biểu đồ Histogram
     */
    static createFrequencyDistribution(sorted, min, max) {
        const n = sorted.length;
        if (n === 0) return { bins: [], counts: [], labels: [] };

        const distinctValues = Array.from(new Set(sorted));
        
        // Nếu số lượng giá trị phân biệt nhỏ (<= 15), dùng tần số chính xác
        if (distinctValues.length <= 15) {
            const freqMap = new Map();
            for (const v of sorted) {
                freqMap.set(v, (freqMap.get(v) || 0) + 1);
            }
            const labels = [];
            const counts = [];
            for (const val of distinctValues.sort((a, b) => a - b)) {
                labels.push(String(val));
                counts.push(freqMap.get(val));
            }
            return {
                isDiscrete: true,
                labels,
                counts,
                bins: distinctValues.map(v => ({ label: String(v), count: freqMap.get(v), min: v, max: v }))
            };
        }

        // Với dữ liệu liên tục: Tính số nhóm theo công thức Sturges k = 1 + 3.322 * log10(n)
        const k = Math.min(12, Math.max(5, Math.ceil(1 + 3.322 * Math.log10(n))));
        const binWidth = (max - min) / k || 1;
        
        const bins = [];
        const labels = [];
        const counts = new Array(k).fill(0);

        for (let i = 0; i < k; i++) {
            const binStart = min + i * binWidth;
            const binEnd = (i === k - 1) ? max : min + (i + 1) * binWidth;
            const label = `${this.roundAdaptive(binStart)} - ${this.roundAdaptive(binEnd)}`;
            labels.push(label);
            bins.push({ label, min: binStart, max: binEnd, count: 0 });
        }

        for (const val of sorted) {
            let placed = false;
            for (let i = 0; i < k; i++) {
                if (i === k - 1) {
                    if (val >= bins[i].min && val <= bins[i].max) {
                        counts[i]++;
                        bins[i].count++;
                        placed = true;
                        break;
                    }
                } else {
                    if (val >= bins[i].min && val < bins[i].max) {
                        counts[i]++;
                        bins[i].count++;
                        placed = true;
                        break;
                    }
                }
            }
            if (!placed && counts.length > 0) {
                counts[counts.length - 1]++;
                bins[bins.length - 1].count++;
            }
        }

        return {
            isDiscrete: false,
            labels,
            counts,
            bins
        };
    }

    /**
     * Sinh lời giải thích chi tiết từng bước tính toán (Step-by-step breakdown)
     */
    static generateStepByStep({ validNumbers, sorted, sum, mean, medianResult, modeResult, validCount }) {
        // Step 1: Mean
        const sampleValuesStr = validNumbers.length <= 10 
            ? validNumbers.join(' + ') 
            : `${validNumbers.slice(0, 6).join(' + ')} + ... + ${validNumbers.slice(-2).join(' + ')}`;

        const meanStep = {
            title: '1. Tính Giá Trị Trung Bình (Mean / Average)',
            formula: 'x̄ = (∑ xᵢ) / N',
            explanation: `Lấy tổng tất cả các phần tử hợp lệ chia cho tổng số phần tử (N = ${validCount}).`,
            calculation: `x̄ = (${sampleValuesStr}) / ${validCount} = ${this.roundAdaptive(sum)} / ${validCount} = ${this.roundAdaptive(mean)}`
        };

        // Step 2: Median
        const sortedDisplay = sorted.length <= 15
            ? sorted.join(', ')
            : `${sorted.slice(0, 7).join(', ')}, ..., ${sorted.slice(-5).join(', ')}`;

        const medianStep = {
            title: '2. Tính Trung Vị (Median)',
            formula: validCount % 2 === 1 ? 'Median = x_((N+1)/2)' : 'Median = (x_(N/2) + x_(N/2 + 1)) / 2',
            explanation: `Bước 1: Sắp xếp dãy số tăng dần:\n[ ${sortedDisplay} ]\nBước 2: Tìm vị trí giữa dãy số:`,
            calculation: medianResult.formula
        };

        // Step 3: Mode
        const topFreqItems = [];
        if (modeResult.freqMap) {
            const entries = Array.from(modeResult.freqMap.entries())
                .sort((a, b) => b[1] - a[1] || a[0] - b[0])
                .slice(0, 8);
            for (const [val, count] of entries) {
                topFreqItems.push({ val, count, isMode: modeResult.modes.includes(val) });
            }
        }

        const modeStep = {
            title: '3. Tính Mốt (Mode / Yếu vị)',
            formula: 'Mode = Giá trị có tần số xuất hiện lớn nhất trong tập dữ liệu',
            explanation: `Đếm số lần xuất hiện của từng phần tử trong bảng:`,
            table: topFreqItems,
            calculation: modeResult.description
        };

        return { meanStep, medianStep, modeStep };
    }

    /**
     * Làm tròn số thích ứng (adaptive rounding)
     */
    static roundAdaptive(num, decimals = 3) {
        if (num === null || num === undefined || isNaN(num)) return '-';
        if (Number.isInteger(num)) return String(num);
        const rounded = Number(num.toFixed(decimals));
        return String(rounded);
    }
}

// Xuất ra toàn cục cho trình duyệt
window.StatisticsEngine = StatisticsEngine;
