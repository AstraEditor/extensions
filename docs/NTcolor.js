// Name: NTcolor
// ID: NTcolor
// Description: URL-Only High-Performance Color Analyzer
// By: NTUN<https://space.bilibili.com/3546570106604381>
// License: MIT
const autohue = (function () {
    "use strict";

    // RGB to Lab 转换
    function rgbToLab(r, g, b) {
        let R = r / 255, G = g / 255, B = b / 255;
        R = R > .04045 ? Math.pow((R + .055) / 1.055, 2.4) : R / 12.92;
        G = G > .04045 ? Math.pow((G + .055) / 1.055, 2.4) : G / 12.92;
        B = B > .04045 ? Math.pow((B + .055) / 1.055, 2.4) : B / 12.92;
        let X = R * .4124 + G * .3576 + B * .1805;
        let Y = R * .2126 + G * .7152 + B * .0722;
        let Z = R * .0193 + G * .1192 + B * .9505;
        X = X / .95047;
        Y = Y / 1;
        Z = Z / 1.08883;
        const f = (t) => t > .008856 ? Math.pow(t, .3333333333333333) : 7.787 * t + .13793103448275862;
        const fx = f(X);
        const fy = f(Y);
        const fz = f(Z);
        const L = 116 * fy - 16;
        const a = 500 * (fx - fy);
        const bVal = 200 * (fy - fz);
        return [L, a, bVal];
    }

    // Lab 距离计算
    function labDistance(lab1, lab2) {
        const dL = lab1[0] - lab2[0];
        const da = lab1[1] - lab2[1];
        const db = lab1[2] - lab2[2];
        return Math.sqrt(dL * dL + da * da + db * db);
    }

    // RGB to Hex
    function rgbToHex(rgb) {
        return "#" + rgb.map((v) => {
            const hex = Math.round(v).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

    // 加载图片
    function loadImage(imageSource) {
        return new Promise((resolve, reject) => {
            let img;

            // 检查是否为Base64或data:url格式
            if (typeof imageSource === "string") {
                // data:url 或 base64 格式
                if (imageSource.startsWith("data:")) {
                    img = new Image();
                    img.src = imageSource;
                    if (img.complete) resolve(img);
                    else {
                        img.onload = () => resolve(img);
                        img.onerror = (err) => reject(err);
                    }
                }
                // 纯Base64字符串（无data:前缀）
                else if (/^[A-Za-z0-9+/]+={0,2}$/.test(imageSource.trim())) {
                    img = new Image();
                    img.src = `data:image/png;base64,${imageSource.trim()}`;
                    if (img.complete) resolve(img);
                    else {
                        img.onload = () => resolve(img);
                        img.onerror = (err) => reject(err);
                    }
                }
                // URL图片
                else if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
                    img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = imageSource;

                    const timeout = setTimeout(() => {
                        reject(new Error("qwq 网络有点坏了"));
                    }, 10000);

                    img.onload = () => {
                        clearTimeout(timeout);
                        resolve(img);
                    };

                    img.onerror = (err) => {
                        clearTimeout(timeout);
                        reject(new Error(`ToT 好尴尬，因为: ${err.message}`));
                    };
                }
                // 无效格式
                else {
                    reject(new Error("awa 无效的图片格式"));
                }
            }
            // 本地图片对象
            else {
                if (imageSource && typeof imageSource === "object" && imageSource.dataURL) {
                    img = new Image();
                    img.src = imageSource.dataURL;
                    if (img.complete) resolve(img);
                    else {
                        img.onload = () => resolve(img);
                        img.onerror = (err) => reject(err);
                    }
                } else if (imageSource instanceof HTMLImageElement) {
                    img = imageSource;
                    if (img.complete) resolve(img);
                    else {
                        img.onload = () => resolve(img);
                        img.onerror = (err) => reject(err);
                    }
                } else if (imageSource instanceof File) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        img = new Image();
                        img.src = e.target.result;
                        if (img.complete) resolve(img);
                        else {
                            img.onload = () => resolve(img);
                            img.onerror = (err) => reject(err);
                        }
                    };
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(imageSource);
                } else {
                    reject(new Error("awa 无效的图片格式"));
                }
            }
        });
    }

    // 获取图片数据
    function getImageDataFromImage(img, maxSize = 100) {
        const canvas = document.createElement("canvas");
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        // 动态调整尺寸优化性能
        let adjustedMaxSize = maxSize;
        if (navigator.hardwareConcurrency) {
            if (navigator.hardwareConcurrency <= 2) {
                adjustedMaxSize = Math.min(maxSize, 200);
            } else if (navigator.hardwareConcurrency >= 8) {
                adjustedMaxSize = Math.min(maxSize, 150);
            }
        }

        if ('deviceMemory' in navigator) {
            if (navigator.deviceMemory <= 2) {
                adjustedMaxSize = Math.min(adjustedMaxSize, 50);
            }
        }

        if (width > adjustedMaxSize || height > adjustedMaxSize) {
            const scale = Math.min(adjustedMaxSize / width, adjustedMaxSize / height);
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("ToT 无法获取图像数据");
        ctx.drawImage(img, 0, 0, width, height);
        return ctx.getImageData(0, 0, width, height);
    }

    // 像素聚类
    function clusterPixelsByCondition(imageData, condition, threshold = 100) {
        const clusters = [];
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        const pixelCount = width * height;
        const processed = new Uint8Array(pixelCount);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;
                if (processed[pixelIndex]) continue;

                if (!condition(x, y)) continue;
                const index = pixelIndex * 4;
                if (data[index + 3] === 0) continue;

                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const lab = rgbToLab(r, g, b);

                const newCluster = {
                    count: 1,
                    sumRgb: [r, g, b],
                    sumLab: [lab[0], lab[1], lab[2]],
                    averageRgb: [r, g, b],
                    averageLab: [lab[0], lab[1], lab[2]]
                };

                for (let ny = Math.max(0, y - 2); ny < Math.min(height, y + 3); ny++) {
                    for (let nx = Math.max(0, x - 2); nx < Math.min(width, x + 3); nx++) {
                        const nPixelIndex = ny * width + nx;
                        if (processed[nPixelIndex]) continue;

                        if (!condition(nx, ny)) continue;
                        const nIndex = nPixelIndex * 4;
                        if (data[nIndex + 3] === 0) continue;

                        const nr = data[nIndex];
                        const ng = data[nIndex + 1];
                        const nb = data[nIndex + 2];
                        const nLab = rgbToLab(nr, ng, nb);

                        const d = labDistance(lab, nLab);
                        if (d < threshold) {
                            newCluster.count++;
                            newCluster.sumRgb[0] += nr;
                            newCluster.sumRgb[1] += ng;
                            newCluster.sumRgb[2] += nb;
                            newCluster.sumLab[0] += nLab[0];
                            newCluster.sumLab[1] += nLab[1];
                            newCluster.sumLab[2] += nLab[2];
                            newCluster.averageRgb = [
                                newCluster.sumRgb[0] / newCluster.count,
                                newCluster.sumRgb[1] / newCluster.count,
                                newCluster.sumRgb[2] / newCluster.count
                            ];
                            newCluster.averageLab = [
                                newCluster.sumLab[0] / newCluster.count,
                                newCluster.sumLab[1] / newCluster.count,
                                newCluster.sumLab[2] / newCluster.count
                            ];
                            processed[nPixelIndex] = 1;
                        }
                    }
                }

                clusters.push(newCluster);
                processed[pixelIndex] = 1;
            }
        }

        return clusters;
    }

    // 处理选项
    function __handleAutoHueOptions(options) {
        if (!options) options = {};
        const { maxSize = 100 } = options;
        let threshold = options.threshold || 100;
        if (typeof threshold === "number") threshold = {
            primary: threshold,
            left: threshold,
            right: threshold,
            top: threshold,
            bottom: threshold
        };
        else threshold = {
            primary: threshold.primary || 100,
            left: threshold.left || 100,
            right: threshold.right || 100,
            top: threshold.top || 100,
            bottom: threshold.bottom || 100
        };
        return { maxSize, threshold };
    }

    // 颜色提取主函数
    async function colorPicker(imageSource, options) {
        const { maxSize, threshold } = __handleAutoHueOptions(options);
        const img = await loadImage(imageSource);
        const imageData = getImageDataFromImage(img, maxSize);

        let clusters = clusterPixelsByCondition(imageData, () => true, threshold.primary);
        clusters.sort((a, b) => b.count - a.count);
        const primaryCluster = clusters[0];
        const secondaryCluster = clusters.length > 1 ? clusters[1] : clusters[0];

        const primaryColor = rgbToHex(primaryCluster.averageRgb);
        const secondaryColor = rgbToHex(secondaryCluster.averageRgb);

        const margin = 10;
        const width = imageData.width;
        const height = imageData.height;

        const topClusters = clusterPixelsByCondition(imageData, (_x, y) => y < margin, threshold.top);
        topClusters.sort((a, b) => b.count - a.count);
        const topColor = topClusters.length > 0 ? rgbToHex(topClusters[0].averageRgb) : primaryColor;

        const bottomClusters = clusterPixelsByCondition(imageData, (_x, y) => y >= height - margin, threshold.bottom);
        bottomClusters.sort((a, b) => b.count - a.count);
        const bottomColor = bottomClusters.length > 0 ? rgbToHex(bottomClusters[0].averageRgb) : primaryColor;

        const leftClusters = clusterPixelsByCondition(imageData, (x, _y) => x < margin, threshold.left);
        leftClusters.sort((a, b) => b.count - a.count);
        const leftColor = leftClusters.length > 0 ? rgbToHex(leftClusters[0].averageRgb) : primaryColor;

        const rightClusters = clusterPixelsByCondition(imageData, (x, _y) => x >= width - margin, threshold.right);
        rightClusters.sort((a, b) => b.count - a.count);
        const rightColor = rightClusters.length > 0 ? rgbToHex(rightClusters[0].averageRgb) : primaryColor;

        return {
            primaryColor,
            secondaryColor,
            backgroundColor: { top: topColor, right: rightColor, bottom: bottomColor, left: leftColor }
        };
    }

    return colorPicker;
})();

// ============ 颜色计算工具类 ============
class ColorUtils {
    // Hex to RGB
    static hexToRgb(hex) {
        try {
            if (!/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
                throw new Error(`awa 无效的颜色格式: ${hex}`);
            }

            let rHex, gHex, bHex;
            if (hex.length === 4) {
                rHex = hex[1] + hex[1];
                gHex = hex[2] + hex[2];
                bHex = hex[3] + hex[3];
            } else {
                rHex = hex.slice(1, 3);
                gHex = hex.slice(3, 5);
                bHex = hex.slice(5, 7);
            }

            const rgb = {
                r: parseInt(rHex, 16),
                g: parseInt(gHex, 16),
                b: parseInt(bHex, 16)
            };

            if (isNaN(rgb.r) || isNaN(rgb.g) || isNaN(rgb.b) ||
                rgb.r < 0 || rgb.r > 255 ||
                rgb.g < 0 || rgb.g > 255 ||
                rgb.b < 0 || rgb.b > 255) {
                throw new Error(`awa 无效的RGB值: ${JSON.stringify(rgb)}`);
            }

            return rgb;
        } catch (error) {
            console.error("qwq 颜色转换失败:", error);
            return null;
        }
    }

    // RGB to Hex
    static rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = Math.round(c).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return toHex(r) + toHex(g) + toHex(b);
    }

    // RGB to HSL
    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    // HSL to RGB
    static hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
        const g = Math.round(hue2rgb(p, q, h) * 255);
        const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

        return { r, g, b };
    }

    // RGB to HSV
    static rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;

        let h = 0;
        if (d !== 0) {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        const s = max === 0 ? 0 : d / max;
        const v = max;

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        };
    }

    // HSV to RGB
    static hsvToRgb(h, s, v) {
        h /= 360;
        s /= 100;
        v /= 100;

        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        let r, g, b;
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    // HSL to HSV
    static hslToHsv(h, s, l) {
        s /= 100;
        l /= 100;

        const v = l + s * Math.min(l, 1 - l);
        const s_hsv = v === 0 ? 0 : 2 * (1 - l / v);

        return {
            h: h,
            s: Math.round(s_hsv * 100),
            v: Math.round(v * 100)
        };
    }

    // HSV to HSL
    static hsvToHsl(h, s, v) {
        s /= 100;
        v /= 100;

        const l = v * (1 - s / 2);
        const s_hsl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

        return {
            h: h,
            s: Math.round(s_hsl * 100),
            l: Math.round(l * 100)
        };
    }

    // 计算亮度值（相对亮度）
    static getBrightness(rgb) {
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return Math.round((luminance * 200) - 100);
    }

    // 计算颜色特效值（色相）
    static getColorEffect(rgb) {
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        return Math.round((hsl.h / 360) * 200);
    }

    // 计算饱和度（0-100）
    static getSaturation(rgb) {
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        return hsl.s;
    }

    // 计算对比度（相对于白色）
    static getContrast(rgb) {
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return Math.round(luminance * 100);
    }

    // 计算暖色度（基于色相）
    static getWarmth(rgb) {
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        let warmth = 0;
        if (hsl.h >= 0 && hsl.h <= 60) {
            warmth = 100 - (hsl.h / 60) * 50;
        } else if (hsl.h > 60 && hsl.h < 180) {
            warmth = 50 - ((hsl.h - 60) / 120) * 50;
        } else if (hsl.h >= 180 && hsl.h <= 240) {
            warmth = 0;
        } else if (hsl.h > 240 && hsl.h < 300) {
            warmth = ((hsl.h - 240) / 60) * 50;
        } else {
            warmth = 50 + ((hsl.h - 300) / 60) * 50;
        }
        return Math.round(warmth);
    }

    // 计算互补色
    static getComplementaryColor(rgb) {
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const compHue = (hsl.h + 180) % 360;
        const compRgb = this.hslToRgb(compHue, hsl.s, hsl.l);
        return this.rgbToHex(compRgb.r, compRgb.g, compRgb.b);
    }
}

// ============ 高级颜色工具箱 ============
class AdvancedColorToolbox {
    constructor() {
        this.colorNames = [
            { name: '红色', hex: '#FF0000' },
            { name: '绿色', hex: '#00FF00' },
            { name: '蓝色', hex: '#0000FF' },
            { name: '黄色', hex: '#FFFF00' },
            { name: '青色', hex: '#00FFFF' },
            { name: '品红', hex: '#FF00FF' },
            { name: '白色', hex: '#FFFFFF' },
            { name: '黑色', hex: '#000000' },
            { name: '橙色', hex: '#FFA500' },
            { name: '紫色', hex: '#800080' },
            { name: '粉色', hex: '#FFC0CB' },
            { name: '棕色', hex: '#A52A2A' },
            { name: '灰色', hex: '#808080' },
            { name: '深蓝', hex: '#00008B' },
            { name: '浅蓝', hex: '#ADD8E6' },
            { name: '浅绿', hex: '#90EE90' },
            { name: '深红', hex: '#8B0000' },
            { name: '深绿', hex: '#006400' },
            { name: '金色', hex: '#FFD700' },
            { name: '银色', hex: '#C0C0C0' }
        ];
    }

    // 辅助方法
    _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    _rgbToHex(r, g, b) {
        const componentToHex = (c) => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    _rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic 
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }

        return {
            h: Math.round(h),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    _hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return this._rgbToHex(
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        );
    }

    _getClosestColor(hex) {
        const rgb = this._hexToRgb(hex);
        if (!rgb) return '未知';

        let closest = null;
        let minDistance = Infinity;

        for (const color of this.colorNames) {
            const targetRgb = this._hexToRgb(color.hex);
            const distance = Math.sqrt(
                Math.pow(rgb.r - targetRgb.r, 2) +
                Math.pow(rgb.g - targetRgb.g, 2) +
                Math.pow(rgb.b - targetRgb.b, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closest = color.name;
            }
        }

        return closest;
    }

    // 高级颜色工具箱功能
    lightenColor(args) {
        const { HEX, PERCENT } = args;
        const rgb = this._hexToRgb(HEX);
        if (!rgb) return '#000000';

        const amount = Math.round(2.55 * PERCENT);
        const r = Math.min(255, rgb.r + amount);
        const g = Math.min(255, rgb.g + amount);
        const b = Math.min(255, rgb.b + amount);

        return this._rgbToHex(r, g, b);
    }

    darkenColor(args) {
        const { HEX, PERCENT } = args;
        const rgb = this._hexToRgb(HEX);
        if (!rgb) return '#000000';

        const amount = Math.round(2.55 * PERCENT);
        const r = Math.max(0, rgb.r - amount);
        const g = Math.max(0, rgb.g - amount);
        const b = Math.max(0, rgb.b - amount);

        return this._rgbToHex(r, g, b);
    }

    complementaryColor(args) {
        const { HEX } = args;
        const rgb = this._hexToRgb(HEX);
        if (!rgb) return '#000000';

        const r = 255 - rgb.r;
        const g = 255 - rgb.g;
        const b = 255 - rgb.b;

        return this._rgbToHex(r, g, b);
    }

    analogousColors(args) {
        const { HEX } = args;
        const hsl = this._rgbToHsl(...Object.values(this._hexToRgb(HEX)));

        const color1 = this._hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l);
        const color2 = this._hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l);

        return `${color1},${HEX},${color2}`;
    }

    triadicColors(args) {
        const { HEX } = args;
        const hsl = this._rgbToHsl(...Object.values(this._hexToRgb(HEX)));

        const color1 = this._hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);
        const color2 = this._hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l);

        return `${HEX},${color1},${color2}`;
    }

    blendColors(args) {
        const { HEX1, HEX2, RATIO } = args;
        const rgb1 = this._hexToRgb(HEX1);
        const rgb2 = this._hexToRgb(HEX2);
        if (!rgb1 || !rgb2) return '#000000';

        const ratio = RATIO / 100;
        const r = Math.round(rgb1.r * ratio + rgb2.r * (1 - ratio));
        const g = Math.round(rgb1.g * ratio + rgb2.g * (1 - ratio));
        const b = Math.round(rgb1.b * ratio + rgb2.b * (1 - ratio));

        return this._rgbToHex(r, g, b);
    }

    randomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return this._rgbToHex(r, g, b);
    }

    colorTemperature(args) {
        const { HEX } = args;
        const rgb = this._hexToRgb(HEX);
        if (!rgb) return 0;

        // 简化算法：计算色温近似值 
        const temp = (rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11) / 255;
        return Math.round(2000 + (1 - temp) * 13000);
    }

    colorName(args) {
        const { HEX } = args;
        return this._getClosestColor(HEX);
    }

    colorContrast(args) {
        const { HEX1, HEX2 } = args;
        const rgb1 = this._hexToRgb(HEX1);
        const rgb2 = this._hexToRgb(HEX2);
        if (!rgb1 || !rgb2) return 0;

        // 计算对比度 (WCAG 标准)
        const luminance1 = (0.2126 * rgb1.r + 0.7152 * rgb1.g + 0.0722 * rgb1.b) / 255;
        const luminance2 = (0.2126 * rgb2.r + 0.7152 * rgb2.g + 0.0722 * rgb2.b) / 255;
        const contrast = (Math.max(luminance1, luminance2) + 0.05) /
            (Math.min(luminance1, luminance2) + 0.05);

        return Math.round(contrast * 100) / 100;
    }

    isDark(args) {
        const { HEX } = args;
        const rgb = this._hexToRgb(HEX);
        if (!rgb) return false;

        // 计算亮度 
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance < 0.5;
    }

    isLight(args) {
        const { HEX } = args;
        const rgb = this._hexToRgb(HEX);
        if (!rgb) return false;

        // 计算亮度 
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance >= 0.5;
    }

    setAlpha(args) {
        const { HEX, ALPHA } = args;
        const rgb = this._hexToRgb(HEX);
        if (!rgb) return HEX;

        const alphaHex = Math.round(ALPHA / 100 * 255).toString(16).padStart(2, '0');
        return HEX.substring(0, 7) + alphaHex;
    }

    gradient(args) {
        const { HEX1, HEX2, STEPS } = args;
        const steps = Math.max(2, Math.min(STEPS, 50));
        const rgb1 = this._hexToRgb(HEX1);
        const rgb2 = this._hexToRgb(HEX2);
        if (!rgb1 || !rgb2) return HEX1;

        const colors = [];
        for (let i = 0; i < steps; i++) {
            const ratio = i / (steps - 1);
            const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
            const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
            const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
            colors.push(this._rgbToHex(r, g, b));
        }

        return colors.join(',');
    }

    invertColor(args) {
        const { HEX } = args;
        const rgb = this._hexToRgb(HEX);
        if (!rgb) return '#000000';

        return this._rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
    }

    grayscale(args) {
        const { HEX } = args;
        const rgb = this._hexToRgb(HEX);
        if (!rgb) return '#000000';

        const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
        return this._rgbToHex(gray, gray, gray);
    }

    // 色温转颜色（简化算法）
    temperatureToColor(args) {
        const { KELVIN } = args;
        let temp = KELVIN / 100;
        let r, g, b;

        // 色温计算逻辑 
        if (temp <= 66) {
            r = 255;
            g = Math.min(99.4708025861 * Math.log(temp) - 161.1195681661, 255);
            b = temp <= 19 ? 0 : Math.min(138.5177312231 * Math.log(temp - 10) - 305.0447927307, 255);
        } else {
            r = Math.min(329.698727446 * Math.pow(temp - 60, -0.1332047592), 255);
            g = Math.min(288.1221695283 * Math.pow(temp - 60, -0.0755148492), 255);
            b = 255;
        }
        return this._rgbToHex(Math.round(r), Math.round(g), Math.round(b));
    }

    // 正片叠底混合模式 
    multiplyColors(args) {
        const { HEX1, HEX2 } = args;
        const rgb1 = this._hexToRgb(HEX1);
        const rgb2 = this._hexToRgb(HEX2);
        const r = Math.round(rgb1.r * rgb2.r / 255);
        const g = Math.round(rgb1.g * rgb2.g / 255);
        const b = Math.round(rgb1.b * rgb2.b / 255);
        return this._rgbToHex(r, g, b);
    }

    calculateTextColor(args) {
        const { HEX } = args;
        const rgb = this._hexToRgb(HEX);
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF'; // 根据亮度返回黑/白 
    }

    // 示例：浅蓝背景 #ADD8E6 → 黑色文字，深蓝背景 #00008B → 白色文字 
    isWarmColor(args) {
        const { HEX } = args;
        const hsl = this._rgbToHsl(...Object.values(this._hexToRgb(HEX)));
        // 色相在红-黄-橙范围内视为暖色（0-60度）
        return hsl.h >= 0 && hsl.h <= 60;
    }

    // 示例：#FF0000 → true，#0000FF → false 
    addNoise(args) {
        const { HEX, PERCENT } = args;
        const rgb = this._hexToRgb(HEX);
        const noise = (v) => {
            const maxNoise = Math.round(255 * PERCENT / 100);
            return v + (Math.random() * 2 - 1) * maxNoise;
        };

        const r = Math.max(0, Math.min(255, noise(rgb.r)));
        const g = Math.max(0, Math.min(255, noise(rgb.g)));
        const b = Math.max(0, Math.min(255, noise(rgb.b)));
        return this._rgbToHex(Math.round(r), Math.round(g), Math.round(b));
    }

    // 示例：为 #000000 添加10%噪点可能生成 #0A0807 
    randomPastelColor() {
        // 柔和色通过降低饱和度并提高亮度实现 
        const h = Math.floor(Math.random() * 360);
        return this._hslToHex(h, 70, 85); // 固定饱和度和亮度范围 
    }

    // 示例输出：类似 #FFD1DC 的粉彩色 
    cmykToHex(args) {
        const { C, M, Y, K } = args;
        const r = 255 * (1 - C / 100) * (1 - K / 100);
        const g = 255 * (1 - M / 100) * (1 - K / 100);
        const b = 255 * (1 - Y / 100) * (1 - K / 100);
        return this._rgbToHex(Math.round(r), Math.round(g), Math.round(b));
    }

    // 示例：将 0%,100%,100%,0% 转换为 #FF00FF 

    hexToCmyk(args) {
        const { HEX } = args;
        const rgb = this._hexToRgb(HEX);
        if (!rgb) return '0%,0%,0%,100%';

        // CMYK转换公式 
        const k = 1 - Math.max(rgb.r / 255, rgb.g / 255, rgb.b / 255);
        const c = (1 - rgb.r / 255 - k) / (1 - k) || 0;
        const m = (1 - rgb.g / 255 - k) / (1 - k) || 0;
        const y = (1 - rgb.b / 255 - k) / (1 - k) || 0;

        return `${Math.round(c * 100)},${Math.round(m * 100)},${Math.round(y * 100)},${Math.round(k * 100)}`;
    }

    overlayColors(args) {
        const { HEX1, HEX2 } = args;
        const rgb1 = this._hexToRgb(HEX1);
        const rgb2 = this._hexToRgb(HEX2);

        const overlay = (a, b) =>
            b <= 128 ? (2 * a * b / 255) : (255 - 2 * (255 - a) * (255 - b) / 255);

        const r = Math.round(overlay(rgb1.r, rgb2.r));
        const g = Math.round(overlay(rgb1.g, rgb2.g));
        const b = Math.round(overlay(rgb1.b, rgb2.b));
        return this._rgbToHex(r, g, b);
    }

    // 示例：叠加 #FF0000 和 #00FF00 生成 #FF8000 
    sepiaEffect(args) {
        const { HEX } = args;
        const rgb = this._hexToRgb(HEX);
        if (!rgb) return HEX;

        // 棕褐色滤镜算法 
        const r = Math.min(255, (rgb.r * 0.393) + (rgb.g * 0.769) + (rgb.b * 0.189));
        const g = Math.min(255, (rgb.r * 0.349) + (rgb.g * 0.686) + (rgb.b * 0.168));
        const b = Math.min(255, (rgb.r * 0.272) + (rgb.g * 0.534) + (rgb.b * 0.131));
        return this._rgbToHex(Math.round(r), Math.round(g), Math.round(b));
    }

    // 示例：将 #FF0000 转换为 #FFD6B2 
}

// ============ 扩展主类 ============
class ColorAnalyzerExtension {
    constructor() {
        this.autohue_colors = {
            "主色调": "#000000",
            "辅助色调": "#FFFFFF",
            "顶部边缘色": "#000000",
            "右侧边缘色": "#000000",
            "底部边缘色": "#000000",
            "左侧边缘色": "#000000"
        };
        this.autohue_status = "未初始化";
        this.advancedColor = new AdvancedColorToolbox(); // 集成高级颜色工具箱
    }

    getInfo() {
        return {
            id: "NTcolor",
            name: "颜色分析v2",
            color1: "#4c97ff",
            color2: "#3373cc",
            color3: "#2e5daa",
            menus: {
                autohue_edges: [
                    { text: "顶部", value: "顶部边缘色" },
                    { text: "右侧", value: "右侧边缘色" },
                    { text: "底部", value: "底部边缘色" },
                    { text: "左侧", value: "左侧边缘色" }
                ],
                autohue_colorTypes: [
                    { text: "主色调", value: "主色调" },
                    { text: "辅助色调", value: "辅助色调" },
                    { text: "顶部边缘色", value: "顶部边缘色" },
                    { text: "右侧边缘色", value: "右侧边缘色" },
                    { text: "底部边缘色", value: "底部边缘色" },
                    { text: "左侧边缘色", value: "左侧边缘色" }
                ],
                colorConversionType: [
                    { text: " Hex", value: "rgbToHex" },
                    { text: " HSL", value: "rgbToHsl" },
                    { text: " HSV", value: "rgbToHsv" },
                    { text: "RGB", value: "hexToRgb" },
                    { text: "HSL", value: "hexToHsl" },
                    { text: "HSV", value: "hexToHsv" },
                    { text: "RGB", value: "hslToRgb" },
                    { text: "Hex", value: "hslToHex" },
                    { text: "HSV", value: "hslToHsv" },
                    { text: "RGB", value: "hsvToRgb" },
                    { text: "Hex", value: "hsvToHex" },
                    { text: "HSL", value: "hsvToHsl" }
                ],
                colorConversionType1: [
                    { text: "Hex", value: "rgbToHex" },
                    { text: "HSL", value: "rgbToHsl" },
                    { text: "HSV", value: "rgbToHsv" },
                    { text: "CMYK", value: "rgbToCmyk" }
                ],
                colorConversionType2: [
                    { text: "RGB", value: "hexToRgb" },
                    { text: "HSL", value: "hexToHsl" },
                    { text: "HSV", value: "hexToHsv" },
                    { text: "CMYK", value: "hexToCmyk" }
                ],
                colorConversionType3: [
                    { text: "RGB", value: "hslToRgb" },
                    { text: "Hex", value: "hslToHex" },
                    { text: "HSV", value: "hslToHsv" },
                    { text: "CMYK", value: "hslToCmyk" }
                ],
                colorConversionType4: [
                    { text: "RGB", value: "hsvToRgb" },
                    { text: "Hex", value: "hsvToHex" },
                    { text: "HSL", value: "hsvToHsl" },
                    { text: "CMYK", value: "hsvToCmyk" }
                ]
            },
            blocks: [
                // ===== 颜色分析 =====
                {
                    opcode: "autohue_extractColors",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "从图片 [IMAGE] 提取颜色，阈值 [THRESHOLD]",
                    arguments: {
                        IMAGE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "https://example.com/image.jpg"
                        },
                        THRESHOLD: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 100,
                            minValue: 1,
                            maxValue: 200
                        }
                    }
                },
                {
                    opcode: "autohue_extractLocalColors",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "从本地图片 [FILE] 提取颜色，阈值 [THRESHOLD]",
                    arguments: {
                        FILE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: ""
                        },
                        THRESHOLD: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 100,
                            minValue: 1,
                            maxValue: 200
                        }
                    }
                },

                // ===== 颜色获取 =====
                {
                    opcode: "autohue_getPrimaryColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "主色调",
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getSecondaryColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "辅助色调",
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getEdgeColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[EDGE] 颜色",
                    arguments: {
                        EDGE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "autohue_edges"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },

                // ===== 颜色特效计算awa=====
                {
                    opcode: "autohue_getColorEffectValue",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR_TYPE] 的颜色特效值 (0-200)",
                    arguments: {
                        COLOR_TYPE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "autohue_colorTypes"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getBrightnessValue",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR_TYPE] 的亮度值 (-100-100)",
                    arguments: {
                        COLOR_TYPE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "autohue_colorTypes"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getSaturationValue",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR_TYPE] 的饱和度 (0-100)",
                    arguments: {
                        COLOR_TYPE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "autohue_colorTypes"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getContrastValue",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR_TYPE] 的对比度 (0-100)",
                    arguments: {
                        COLOR_TYPE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "autohue_colorTypes"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getWarmthValue",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR_TYPE] 的暖色度 (0-100)",
                    arguments: {
                        COLOR_TYPE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "autohue_colorTypes"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getComplementaryColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR_TYPE] 的互补色",
                    arguments: {
                        COLOR_TYPE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "autohue_colorTypes"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },

                // ===== 颜色特效计算（直接输入）=====
                {
                    opcode: "autohue_getColorEffectValueDirect",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR] 的颜色特效值 (0-200)",
                    arguments: {
                        COLOR: {
                            type: Scratch.ArgumentType.COLOR,
                            defaultValue: "#FF0000"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getBrightnessValueDirect",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR] 的亮度值 (-100-100)",
                    arguments: {
                        COLOR: {
                            type: Scratch.ArgumentType.COLOR,
                            defaultValue: "#FF0000"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getSaturationValueDirect",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR] 的饱和度 (0-100)",
                    arguments: {
                        COLOR: {
                            type: Scratch.ArgumentType.COLOR,
                            defaultValue: "#FF0000"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getContrastValueDirect",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR] 的对比度 (0-100)",
                    arguments: {
                        COLOR: {
                            type: Scratch.ArgumentType.COLOR,
                            defaultValue: "#FF0000"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getWarmthValueDirect",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR] 的暖色度 (0-100)",
                    arguments: {
                        COLOR: {
                            type: Scratch.ArgumentType.COLOR,
                            defaultValue: "#FF0000"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },
                {
                    opcode: "autohue_getComplementaryColorDirect",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "[COLOR] 的互补色",
                    arguments: {
                        COLOR: {
                            type: Scratch.ArgumentType.COLOR,
                            defaultValue: "#FF0000"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },

                // ===== 高级颜色工具箱块 =====
                {
                    opcode: "lightenColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "将 [HEX] 变亮 [PERCENT]%",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' },
                        PERCENT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
                    }
                },
                {
                    opcode: "darkenColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "将 [HEX] 变暗 [PERCENT]%",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' },
                        PERCENT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
                    }
                },
                {
                    opcode: "setAlpha",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "设置 [HEX] 透明度为 [ALPHA]%",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' },
                        ALPHA: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
                    }
                },
                {
                    opcode: "invertColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "反转颜色 [HEX]",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' }
                    }
                },
                {
                    opcode: "grayscale",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "将 [HEX] 转换为灰度",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' }
                    }
                },
                {
                    opcode: "complementaryColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "获取 [HEX] 的互补色",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' }
                    }
                },
                {
                    opcode: "analogousColors",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "获取 [HEX] 的类比色",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' }
                    }
                },
                {
                    opcode: "triadicColors",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "获取 [HEX] 的三元色",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' }
                    }
                },
                {
                    opcode: "blendColors",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "混合 [HEX1] 和 [HEX2] 比例 [RATIO]%",
                    arguments: {
                        HEX1: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' },
                        HEX2: { type: Scratch.ArgumentType.STRING, defaultValue: '#0000FF' },
                        RATIO: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
                    }
                },
                {
                    opcode: "gradient",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "生成 [HEX1] 到 [HEX2] 的渐变 [STEPS]步",
                    arguments: {
                        HEX1: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' },
                        HEX2: { type: Scratch.ArgumentType.STRING, defaultValue: '#0000FF' },
                        STEPS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 }
                    }
                },
                {
                    opcode: "randomColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "生成随机颜色",
                    arguments: {}
                },
                {
                    opcode: "colorTemperature",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "获取 [HEX] 的色温(K)",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' }
                    }
                },
                {
                    opcode: "colorName",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "获取 [HEX] 的近似名称",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' }
                    }
                },
                {
                    opcode: "colorContrast",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "计算 [HEX1] 和 [HEX2] 的对比度",
                    arguments: {
                        HEX1: { type: Scratch.ArgumentType.STRING, defaultValue: '#000000' },
                        HEX2: { type: Scratch.ArgumentType.STRING, defaultValue: '#FFFFFF' }
                    }
                },
                {
                    opcode: "isDark",
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: "[HEX] 是深色吗",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#000000' }
                    }
                },
                {
                    opcode: "isLight",
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: "[HEX] 是浅色吗",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FFFFFF' }
                    }
                },
                {
                    opcode: "temperatureToColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "将色温 [KELVIN]K 转换为颜色",
                    arguments: {
                        KELVIN: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5500 }
                    }
                },
                {
                    opcode: "randomPastelColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "生成随机柔和颜色",
                    arguments: {}
                },
                {
                    opcode: "addNoise",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "为 [HEX] 添加 [PERCENT]% 噪点",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' },
                        PERCENT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
                    }
                },
                {
                    opcode: "sepiaEffect",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "将 [HEX] 转换为复古棕褐色",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' }
                    }
                },
                {
                    opcode: "isWarmColor",
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: "[HEX] 是暖色调吗",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' }
                    }
                },
                {
                    opcode: "calculateTextColor",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "根据背景色 [HEX] 计算最佳文字颜色",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#000000' }
                    }
                },
                {
                    opcode: "multiplyColors",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "混合 [HEX1] 和 [HEX2]（正片叠底）",
                    arguments: {
                        HEX1: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' },
                        HEX2: { type: Scratch.ArgumentType.STRING, defaultValue: '#0000FF' }
                    }
                },
                {
                    opcode: "overlayColors",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "混合 [HEX1] 和 [HEX2]（叠加模式）",
                    arguments: {
                        HEX1: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' },
                        HEX2: { type: Scratch.ArgumentType.STRING, defaultValue: '#00FF00' }
                    }
                },
                {
                    opcode: "hexToCmyk",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "将 [HEX] 转换为 CMYK",
                    arguments: {
                        HEX: { type: Scratch.ArgumentType.STRING, defaultValue: '#FF0000' }
                    }
                },
                {
                    opcode: "cmykToHex",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "将 CMYK [C],[M],[Y],[K] 转换为 HEX",
                    arguments: {
                        C: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
                        M: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                        Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
                        K: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
                    }
                },

                // ===== 颜色互相转换qwq=====
                // 第一块转换积木 - RGB相关
                {
                    opcode: "colorConverter1",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "RGB [R], [G], [B] → [CONVERSION_TYPE1]",
                    arguments: {
                        CONVERSION_TYPE1: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "colorConversionType1"
                        },
                        R: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 255,
                            minValue: 0,
                            maxValue: 255
                        },
                        G: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0,
                            minValue: 0,
                            maxValue: 255
                        },
                        B: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0,
                            minValue: 0,
                            maxValue: 255
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },

                // 第二块转换积木 - Hex相关
                {
                    opcode: "colorConverter2",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Hex [HEX] → [CONVERSION_TYPE2]",
                    arguments: {
                        CONVERSION_TYPE2: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "colorConversionType2"
                        },
                        HEX: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "#FF0000"
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },

                // 第三块转换积木 - HSL相关
                {
                    opcode: "colorConverter3",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "HSL [H], [S], [L] → [CONVERSION_TYPE3]",
                    arguments: {
                        CONVERSION_TYPE3: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "colorConversionType3"
                        },
                        H: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0,
                            minValue: 0,
                            maxValue: 360
                        },
                        S: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 100,
                            minValue: 0,
                            maxValue: 100
                        },
                        L: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 50,
                            minValue: 0,
                            maxValue: 100
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                },

                // 第四块转换积木 - HSV相关
                {
                    opcode: "colorConverter4",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "HSV [H], [S], [V] → [CONVERSION_TYPE4]",
                    arguments: {
                        CONVERSION_TYPE4: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "colorConversionType4"
                        },
                        H: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0,
                            minValue: 0,
                            maxValue: 360
                        },
                        S: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 100,
                            minValue: 0,
                            maxValue: 100
                        },
                        V: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 100,
                            minValue: 0,
                            maxValue: 100
                        }
                    },
                    outputShape: Scratch.BlockType.OUTPUT_SHAPE_ROUND
                }
            ]
        };
    }

    // ===== 颜色分析方法 =====
    async autohue_extractColors(args) {
        try {
            const result = await autohue(args.IMAGE, { threshold: args.THRESHOLD });
            this.autohue_colors["主色调"] = result.primaryColor;
            this.autohue_colors["辅助色调"] = result.secondaryColor;
            this.autohue_colors["顶部边缘色"] = result.backgroundColor.top;
            this.autohue_colors["右侧边缘色"] = result.backgroundColor.right;
            this.autohue_colors["底部边缘色"] = result.backgroundColor.bottom;
            this.autohue_colors["左侧边缘色"] = result.backgroundColor.left;
            this.autohue_status = "成功提取";
            return result;
        } catch (error) {
            console.error("颜色提取失败:", error);
            this.autohue_status = "提取失败";
            throw error;
        }
    }

    async autohue_extractLocalColors(args) {
        try {
            // 检查是否有文件被上传
            const file = args.FILE;
            if (!file || file === "") {
                throw new Error("awa 请选择一个本地图片文件");
            }

            // 创建File对象并加载图片
            const result = await autohue(file, { threshold: args.THRESHOLD });
            this.autohue_colors["主色调"] = result.primaryColor;
            this.autohue_colors["辅助色调"] = result.secondaryColor;
            this.autohue_colors["顶部边缘色"] = result.backgroundColor.top;
            this.autohue_colors["右侧边缘色"] = result.backgroundColor.right;
            this.autohue_colors["底部边缘色"] = result.backgroundColor.bottom;
            this.autohue_colors["左侧边缘色"] = result.backgroundColor.left;
            this.autohue_status = "成功提取";
            return result;
        } catch (error) {
            console.error("本地颜色提取失败:", error);
            this.autohue_status = "提取失败";
            throw error;
        }
    }

    // ===== 颜色获取方法 =====
    autohue_getPrimaryColor() {
        return this.autohue_colors["主色调"];
    }

    autohue_getSecondaryColor() {
        return this.autohue_colors["辅助色调"];
    }

    autohue_getEdgeColor(args) {
        return this.autohue_colors[args.EDGE];
    }

    // ===== 颜色特效计算（从已提取的颜色）=====
    autohue_getColorEffectValue(args) {
        const color = this.autohue_colors[args.COLOR_TYPE];
        const rgb = ColorUtils.hexToRgb(color);
        if (!rgb) return 0;
        return ColorUtils.getColorEffect(rgb);
    }

    autohue_getBrightnessValue(args) {
        const color = this.autohue_colors[args.COLOR_TYPE];
        const rgb = ColorUtils.hexToRgb(color);
        if (!rgb) return 0;
        return ColorUtils.getBrightness(rgb);
    }

    autohue_getSaturationValue(args) {
        const color = this.autohue_colors[args.COLOR_TYPE];
        const rgb = ColorUtils.hexToRgb(color);
        if (!rgb) return 0;
        return ColorUtils.getSaturation(rgb);
    }

    autohue_getContrastValue(args) {
        const color = this.autohue_colors[args.COLOR_TYPE];
        const rgb = ColorUtils.hexToRgb(color);
        if (!rgb) return 0;
        return ColorUtils.getContrast(rgb);
    }

    autohue_getWarmthValue(args) {
        const color = this.autohue_colors[args.COLOR_TYPE];
        const rgb = ColorUtils.hexToRgb(color);
        if (!rgb) return 0;
        return ColorUtils.getWarmth(rgb);
    }

    autohue_getComplementaryColor(args) {
        const color = this.autohue_colors[args.COLOR_TYPE];
        const rgb = ColorUtils.hexToRgb(color);
        if (!rgb) return "#000000";
        return ColorUtils.getComplementaryColor(rgb);
    }

    // ===== 颜色特效计算（直接输入）=====
    autohue_getColorEffectValueDirect(args) {
        const rgb = ColorUtils.hexToRgb(args.COLOR);
        if (!rgb) return 0;
        return ColorUtils.getColorEffect(rgb);
    }

    autohue_getBrightnessValueDirect(args) {
        const rgb = ColorUtils.hexToRgb(args.COLOR);
        if (!rgb) return 0;
        return ColorUtils.getBrightness(rgb);
    }

    autohue_getSaturationValueDirect(args) {
        const rgb = ColorUtils.hexToRgb(args.COLOR);
        if (!rgb) return 0;
        return ColorUtils.getSaturation(rgb);
    }

    autohue_getContrastValueDirect(args) {
        const rgb = ColorUtils.hexToRgb(args.COLOR);
        if (!rgb) return 0;
        return ColorUtils.getContrast(rgb);
    }

    autohue_getWarmthValueDirect(args) {
        const rgb = ColorUtils.hexToRgb(args.COLOR);
        if (!rgb) return 0;
        return ColorUtils.getWarmth(rgb);
    }

    autohue_getComplementaryColorDirect(args) {
        const rgb = ColorUtils.hexToRgb(args.COLOR);
        if (!rgb) return "#000000";
        return ColorUtils.getComplementaryColor(rgb);
    }

    // ===== 高级颜色工具箱方法代理 =====
    lightenColor(args) {
        return this.advancedColor.lightenColor(args);
    }

    darkenColor(args) {
        return this.advancedColor.darkenColor(args);
    }

    setAlpha(args) {
        return this.advancedColor.setAlpha(args);
    }

    invertColor(args) {
        return this.advancedColor.invertColor(args);
    }

    grayscale(args) {
        return this.advancedColor.grayscale(args);
    }

    complementaryColor(args) {
        return this.advancedColor.complementaryColor(args);
    }

    analogousColors(args) {
        return this.advancedColor.analogousColors(args);
    }

    triadicColors(args) {
        return this.advancedColor.triadicColors(args);
    }

    blendColors(args) {
        return this.advancedColor.blendColors(args);
    }

    randomColor() {
        return this.advancedColor.randomColor();
    }

    colorTemperature(args) {
        return this.advancedColor.colorTemperature(args);
    }

    colorName(args) {
        return this.advancedColor.colorName(args);
    }

    colorContrast(args) {
        return this.advancedColor.colorContrast(args);
    }

    isDark(args) {
        return this.advancedColor.isDark(args);
    }

    isLight(args) {
        return this.advancedColor.isLight(args);
    }

    gradient(args) {
        return this.advancedColor.gradient(args);
    }

    temperatureToColor(args) {
        return this.advancedColor.temperatureToColor(args);
    }

    randomPastelColor() {
        return this.advancedColor.randomPastelColor();
    }

    addNoise(args) {
        return this.advancedColor.addNoise(args);
    }

    sepiaEffect(args) {
        return this.advancedColor.sepiaEffect(args);
    }

    isWarmColor(args) {
        return this.advancedColor.isWarmColor(args);
    }

    calculateTextColor(args) {
        return this.advancedColor.calculateTextColor(args);
    }

    multiplyColors(args) {
        return this.advancedColor.multiplyColors(args);
    }

    overlayColors(args) {
        return this.advancedColor.overlayColors(args);
    }

    hexToCmyk(args) {
        return this.advancedColor.hexToCmyk(args);
    }

    cmykToHex(args) {
        return this.advancedColor.cmykToHex(args);
    }

    // ===== 颜色互相转换（简化版）=====
    // RGB相关的颜色转换方法
    colorConverter1(args) {
        const conversionType = args.CONVERSION_TYPE1;
        const r = args.R;
        const g = args.G;
        const b = args.B;

        switch (conversionType) {
            case "rgbToHex":
                return ColorUtils.rgbToHex(r, g, b);
            case "rgbToHsl":
                const hsl = ColorUtils.rgbToHsl(r, g, b);
                return `${hsl.h},${hsl.s},${hsl.l}`;
            case "rgbToHsv":
                const hsv = ColorUtils.rgbToHsv(r, g, b);
                return `${hsv.h},${hsv.s},${hsv.v}`;
            case "rgbToCmyk":
                // CMYK
                const k = 1 - Math.max(r / 255, g / 255, b / 255);
                const c = (1 - r / 255 - k) / (1 - k) || 0;
                const m = (1 - g / 255 - k) / (1 - k) || 0;
                const y = (1 - b / 255 - k) / (1 - k) || 0;
                return `${Math.round(c * 100)},${Math.round(m * 100)},${Math.round(y * 100)},${Math.round(k * 100)}`;
        }

        return "#000000"; // 默认返回黑色
    }

    // Hex相关的颜色转换方法
    colorConverter2(args) {
        const conversionType = args.CONVERSION_TYPE2;
        const hex = args.HEX;

        switch (conversionType) {
            case "hexToRgb":
                const rgb = ColorUtils.hexToRgb(hex);
                if (!rgb) return "0,0,0";
                return `${rgb.r},${rgb.g},${rgb.b}`;
            case "hexToHsl":
                const hexRgb = ColorUtils.hexToRgb(hex);
                if (!hexRgb) return "0,0,0";
                const hexHsl = ColorUtils.rgbToHsl(hexRgb.r, hexRgb.g, hexRgb.b);
                return `${hexHsl.h},${hexHsl.s},${hexHsl.l}`;
            case "hexToHsv":
                const hexHsvRgb = ColorUtils.hexToRgb(hex);
                if (!hexHsvRgb) return "0,0,0";
                const hexHsv = ColorUtils.rgbToHsv(hexHsvRgb.r, hexHsvRgb.g, hexHsvRgb.b);
                return `${hexHsv.h},${hexHsv.s},${hexHsv.v}`;
            case "hexToCmyk":
                const hexCmykRgb = ColorUtils.hexToRgb(hex);
                if (!hexCmykRgb) return "0%,0%,0%,100%";
                const k = 1 - Math.max(hexCmykRgb.r / 255, hexCmykRgb.g / 255, hexCmykRgb.b / 255);
                const c = (1 - hexCmykRgb.r / 255 - k) / (1 - k) || 0;
                const m = (1 - hexCmykRgb.g / 255 - k) / (1 - k) || 0;
                const y = (1 - hexCmykRgb.b / 255 - k) / (1 - k) || 0;
                return `${Math.round(c * 100)},${Math.round(m * 100)},${Math.round(y * 100)},${Math.round(k * 100)}`;
        }

        return "0,0,0"; // 默认返回黑色RGB
    }

    // HSL相关的颜色转换方法
    colorConverter3(args) {
        const conversionType = args.CONVERSION_TYPE3;
        const h = args.H;
        const s = args.S;
        const l = args.L;

        switch (conversionType) {
            case "hslToRgb":
                const hslRgb = ColorUtils.hslToRgb(h, s, l);
                return `${hslRgb.r},${hslRgb.g},${hslRgb.b}`;
            case "hslToHex":
                const hslHexRgb = ColorUtils.hslToRgb(h, s, l);
                return ColorUtils.rgbToHex(hslHexRgb.r, hslHexRgb.g, hslHexRgb.b);
            case "hslToHsv":
                const hslHsv = ColorUtils.hslToHsv(h, s, l);
                return `${hslHsv.h},${hslHsv.s},${hslHsv.v}`;
            case "hslToCmyk":
                const hslRgbCmyk = ColorUtils.hslToRgb(h, s, l);
                const k = 1 - Math.max(hslRgbCmyk.r / 255, hslRgbCmyk.g / 255, hslRgbCmyk.b / 255);
                const c = (1 - hslRgbCmyk.r / 255 - k) / (1 - k) || 0;
                const m = (1 - hslRgbCmyk.g / 255 - k) / (1 - k) || 0;
                const y = (1 - hslRgbCmyk.b / 255 - k) / (1 - k) || 0;
                return `${Math.round(c * 100)},${Math.round(m * 100)},${Math.round(y * 100)},${Math.round(k * 100)}`;
        }

        return "#000000"; // 默认返回黑色
    }

    // HSV相关的颜色转换方法
    colorConverter4(args) {
        const conversionType = args.CONVERSION_TYPE4;
        const h = args.H;
        const s = args.S;
        const v = args.V;

        switch (conversionType) {
            case "hsvToRgb":
                const hsvRgb = ColorUtils.hsvToRgb(h, s, v);
                return `${hsvRgb.r},${hsvRgb.g},${hsvRgb.b}`;
            case "hsvToHex":
                const hsvHexRgb = ColorUtils.hsvToRgb(h, s, v);
                return ColorUtils.rgbToHex(hsvHexRgb.r, hsvHexRgb.g, hsvHexRgb.b);
            case "hsvToHsl":
                const hsvHsl = ColorUtils.hsvToHsl(h, s, v);
                return `${hsvHsl.h},${hsvHsl.s},${hsvHsl.l}`;
            case "hsvToCmyk":
                const hsvRgbCmyk = ColorUtils.hsvToRgb(h, s, v);
                const k = 1 - Math.max(hsvRgbCmyk.r / 255, hsvRgbCmyk.g / 255, hsvRgbCmyk.b / 255);
                const c = (1 - hsvRgbCmyk.r / 255 - k) / (1 - k) || 0;
                const m = (1 - hsvRgbCmyk.g / 255 - k) / (1 - k) || 0;
                const y = (1 - hsvRgbCmyk.b / 255 - k) / (1 - k) || 0;
                return `${Math.round(c * 100)},${Math.round(m * 100)},${Math.round(y * 100)},${Math.round(k * 100)}`;
        }

        return "#000000"; // 默认返回黑色
    }
}

// 注册扩展
Scratch.extensions.register(new ColorAnalyzerExtension());