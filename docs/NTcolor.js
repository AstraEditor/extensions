// Name: NTcolor
// ID: NTcolor
// Description: URL-Only High-Performance Color Analyzer
// By: NTUN<https://space.bilibili.com/3546570106604381>
// License: MIT
(function () {
    "use strict";
    
    // 颜色分析功能
    const autohue = (function() {
        "use strict";

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

        function labDistance(lab1, lab2) {
            const dL = lab1[0] - lab2[0];
            const da = lab1[1] - lab2[1];
            const db = lab1[2] - lab2[2];
            return Math.sqrt(dL * dL + da * da + db * db);
        }

        function rgbToHex(rgb) {
            return "#" + rgb.map((v) => {
                const hex = Math.round(v).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            }).join("");
        }

        function loadImage(imageSource) {
            return new Promise((resolve, reject) => {
                let img;
                if (typeof imageSource === "string") {
                    img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = imageSource;
                    
                    // 超时处理
                    const timeout = setTimeout(() => {
                        reject(new Error("网络有点坏了qwq"));
                    }, 10000);
                    
                    img.onload = () => {
                        clearTimeout(timeout);
                        resolve(img);
                    };
                    
                    img.onerror = (err) => {
                        clearTimeout(timeout);
                        reject(new Error(`呃，好尴尬，因为: ${err.message}`));
                    };
                } else {
                    img = imageSource;
                    if (img.complete) resolve(img);
                    else {
                        img.onload = () => resolve(img);
                        img.onerror = (err) => reject(err);
                    }
                }
            });
        }

        function getImageDataFromImage(img, maxSize = 100) {
            const canvas = document.createElement("canvas");
            let width = img.naturalWidth;
            let height = img.naturalHeight;
            if (width > maxSize || height > maxSize) {
                const scale = Math.min(maxSize / width, maxSize / height);
                width = Math.floor(width * scale);
                height = Math.floor(height * scale);
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("无法获取摄像机颜色");
            ctx.drawImage(img, 0, 0, width, height);
            return ctx.getImageData(0, 0, width, height);
        }

        function clusterPixelsByCondition(imageData, condition, threshold = 10) {
            const clusters = [];
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
                if (!condition(x, y)) continue;
                const index = (y * width + x) * 4;
                if (data[index + 3] === 0) continue;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const lab = rgbToLab(r, g, b);
                let added = false;
                for (const cluster of clusters) {
                    const d = labDistance(lab, cluster.averageLab);
                    if (d < threshold) {
                        cluster.count++;
                        cluster.sumRgb[0] += r;
                        cluster.sumRgb[1] += g;
                        cluster.sumRgb[2] += b;
                        cluster.sumLab[0] += lab[0];
                        cluster.sumLab[1] += lab[1];
                        cluster.sumLab[2] += lab[2];
                        cluster.averageRgb = [
                            cluster.sumRgb[0] / cluster.count,
                            cluster.sumRgb[1] / cluster.count,
                            cluster.sumRgb[2] / cluster.count
                        ];
                        cluster.averageLab = [
                            cluster.sumLab[0] / cluster.count,
                            cluster.sumLab[1] / cluster.count,
                            cluster.sumLab[2] / cluster.count
                        ];
                        added = true;
                        break;
                    }
                }
                if (!added) clusters.push({
                    count: 1,
                    sumRgb: [r, g, b],
                    sumLab: [lab[0], lab[1], lab[2]],
                    averageRgb: [r, g, b],
                    averageLab: [lab[0], lab[1], lab[2]]
                });
            }
            return clusters;
        }

        function __handleAutoHueOptions(options) {
            if (!options) options = {};
            const { maxSize = 100 } = options;
            let threshold = options.threshold || 10;
            if (typeof threshold === "number") threshold = {
                primary: threshold,
                left: threshold,
                right: threshold,
                top: threshold,
                bottom: threshold
            };
            else threshold = {
                primary: threshold.primary || 10,
                left: threshold.left || 10,
                right: threshold.right || 10,
                top: threshold.top || 10,
                bottom: threshold.bottom || 10
            };
            return { maxSize, threshold };
        }

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
        }

        getInfo() {
            return {
                id: "NTcolor",
                name: "NT的颜色分析",
                color1: "#4c97ff",
                color2: "#4c97ff",
                color3: "#4c97ff",

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
                    ]
                },

                blocks: [
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: '颜色分析'
                    },
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
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: "autohue_getPrimaryColor",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "主色调",
                    },
                    {
                        opcode: "autohue_getSecondaryColor",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "辅助色调",
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
                        }
                    },
                    {
                        opcode: "autohue_getColorEffectValue",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "[COLOR_TYPE] 颜色特效值 (0-200)",
                        arguments: {
                            COLOR_TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "autohue_colorTypes"
                            }
                        }
                    },
                    {
                        opcode: "autohue_getBrightnessValue",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "[COLOR_TYPE] 亮度值 (-100-100)",
                        arguments: {
                            COLOR_TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "autohue_colorTypes"
                            }
                        }
                    },
                    {
                        opcode: "autohue_getStatus",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "提取状态",
                    }
                ]
            };
        }

        async autohue_extractColors(args) {
            try {
                this.autohue_status = "处理中";
                // 验证图片URL
                if (!args.IMAGE.startsWith("http://") && !args.IMAGE.startsWith("https://")) {
                    throw new Error("图片URL必须以http://或https://开头");
                }
                
                const result = await autohue(args.IMAGE, {
                    threshold: parseInt(args.THRESHOLD, 10)
                });
                
                // 确保颜色值是有效的十六进制格式
                const validateAndSetColor = (key, value) => {
                    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
                        this.autohue_colors[key] = value;
                    } else {
                        console.warn(`颜色值无效 ${value} 被忽略，所以用了默认值`);
                    }
                };
                
                validateAndSetColor("主色调", result.primaryColor);
                validateAndSetColor("辅助色调", result.secondaryColor);
                validateAndSetColor("顶部边缘色", result.backgroundColor.top);
                validateAndSetColor("右侧边缘色", result.backgroundColor.right);
                validateAndSetColor("底部边缘色", result.backgroundColor.bottom);
                validateAndSetColor("左侧边缘色", result.backgroundColor.left);
                
                this.autohue_status = "提取成功";
            } catch (error) {
                this.autohue_status = `提取失败: ${error.message}`;
                console.error("qwq，提取颜色失败了:", error);
            }
        }

        autohue_getPrimaryColor() {
            const color = this.autohue_colors["主色调"] || "#000000";
            console.log("返回主色调:", color, "类型:", typeof color);
            return color;
        }

        autohue_getSecondaryColor() {
            const color = this.autohue_colors["辅助色调"] || "#FFFFFF";
            console.log("返回辅助色调:", color, "类型:", typeof color);
            return color;
        }

        autohue_getEdgeColor(args) {
            const color = this.autohue_colors[args.EDGE] || "#000000";
            console.log(`返回${args.EDGE}:`, color, "类型:", typeof color);
            return color;
        }

        // 获取颜色特效值（0~200）
        autohue_getColorEffectValue(args) {
            try {
                const colorType = args.COLOR_TYPE || "主色调";
                const color = this.autohue_colors[colorType] || "#000000";
                const rgb = this.autohue_hexToRgb(color);
                
                if (!rgb) {
                    console.warn("无法解析颜色，返回默认特效值0");
                    return 0;
                }
                
                // 计算色相值并映射到0~200范围
                const hue = this.autohue_rgbToHue(rgb.r, rgb.g, rgb.b);
                const effectValue = Math.round((hue / 100) * 200);
                const clampedValue = Math.max(0, Math.min(200, effectValue));
                
                console.log(`${colorType} 颜色特效值:`, clampedValue, "类型:", typeof clampedValue);
                return clampedValue;
            } catch (error) {
                this.autohue_status = `获取颜色特效值失败: ${error.message}`;
                console.error("获取颜色特效值失败:", error);
                return 0;
            }
        }

        // 获取亮度值（-100~100）
        autohue_getBrightnessValue(args) {
            try {
                const colorType = args.COLOR_TYPE || "主色调";
                const color = this.autohue_colors[colorType] || "#000000";
                const rgb = this.autohue_hexToRgb(color);
                
                if (!rgb) {
                    console.warn("无法解析颜色，返回默认亮度值0");
                    return 0;
                }
                
                // 计算相对亮度并映射到-100~100范围
                const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
                let brightnessValue = Math.round((luminance * 200) - 100);
                brightnessValue = Math.max(-100, Math.min(100, brightnessValue));
                
                console.log(`${colorType} 亮度值:`, brightnessValue, "类型:", typeof brightnessValue);
                return brightnessValue;
            } catch (error) {
                this.autohue_status = `获取亮度值失败: ${error.message}`;
                console.error("获取亮度值失败:", error);
                return 0;
            }
        }

        autohue_getStatus() {
            console.log("返回提取状态:", this.autohue_status);
            return this.autohue_status;
        }

        // 辅助方法：将十六进制颜色转换为 RGB
        autohue_hexToRgb(hex) {
            try {
                if (!/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
                    throw new Error(`无效的颜色格式: ${hex}`);
                }
                
                // 处理3位和6位颜色代码
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
                
                // 验证RGB值范围
                if (isNaN(rgb.r) || isNaN(rgb.g) || isNaN(rgb.b) ||
                    rgb.r < 0 || rgb.r > 255 ||
                    rgb.g < 0 || rgb.g > 255 ||
                    rgb.b < 0 || rgb.b > 255) {
                    throw new Error(`无效的RGB值: ${JSON.stringify(rgb)}`);
                }
                
                return rgb;
            } catch (error) {
                console.error("颜色转换失败:", error);
                return null;
            }
        }

        // 辅助方法：将 RGB 转换为色相值
        autohue_rgbToHue(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0;
            
            if (max !== min) {
                const d = max - min;
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            
            // 转换为 0-100 范围
            const hueValue = Math.round(h * 100);
            return Number(hueValue);
        }
    }

    Scratch.extensions.register(new ColorAnalyzerExtension());
})();