// Name: ningqiCollection 1.4mini
// ID: ningqiCollect
// Description: Maybe this a collection?
// By: ningqi <https://github.com/ningqi24>
// License: Creative Commons Zero v1.0 Universal

//ningqiCollect!!

(function (Scratch) {
    'use strict';
    if (!(Scratch && Scratch.extensions && Scratch.extensions.register)) {
        throw new Error('此环境不支持！请在Scratch3+扩展环境中加载');
    }
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("this extension must be run unsandboxed");
    }
    const NC_ICON = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMDkuMTk0NzIiIGhlaWdodD0iMzAyLjUzMzgxIiB2aWV3Qm94PSIwLDAsMzA5LjE5NDcyLDMwMi41MzM4MSI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTkzLjk5MDQsLTI3LjczMzEpIj48ZyBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiPjxwYXRoIGQ9Ik05My45OTA0LDE1Ny4zODg3NWMwLC03MS42MDc0NCA1OC4wNDgyMiwtMTI5LjY1NTY1IDEyOS42NTU2NSwtMTI5LjY1NTY1YzcxLjYwNzQ0LDAgMTI5LjY1NTY1LDU4LjA0ODIyIDEyOS42NTU2NSwxMjkuNjU1NjVjMCw3MS42MDc0NCAtNTguMDQ4MjIsMTI5LjY1NTY1IC0xMjkuNjU1NjUsMTI5LjY1NTY1Yy03MS42MDc0NCwwIC0xMjkuNjU1NjUsLTU4LjA0ODIyIC0xMjkuNjU1NjUsLTEyOS42NTU2NXoiIGZpbGw9IiNiN2U4ZmEiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTIxMC4wNDE0OCwyMDAuMDU3NjJjMCwtNTMuMzkxNzQgNDMuMjM1NzMsLTk2LjY3NDg4IDk2LjU3MTgyLC05Ni42NzQ4OGM1My4zMzYwOSwwIDk2LjU3MTgyLDQzLjI4MzE0IDk2LjU3MTgyLDk2LjY3NDg4YzAsNTMuMzkxNzQgLTQzLjIzNTczLDk2LjY3NDg4IC05Ni41NzE4Miw5Ni42NzQ4OGMtNTMuMzM2MDksMCAtOTYuNTcxODIsLTQzLjI4MzE0IC05Ni41NzE4MiwtOTYuNjc0ODh6IiBmaWxsPSIjYjdlOGZhIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0iYnV0dCIvPjxwYXRoIGQ9Ik0zNTUuMDczNTEsMjE4LjU4MjIzYy0wLjAzODA5LDEuMDc2MjIgLTMuOTQyMDcsNC42OTAzOCAtOC40MzM5MSw3LjU3MDY3Yy00LjMxMDU2LDIuNzYzOTkgLTkuMjAwNjEsNC44MTQyMiAtOS45NTk4OCw1LjA3MTMzYy00LjI4NzUyLDEuNDUxOTQgLTYuNTg3MSwyLjU3NTUyIC0xMS41Njc5MywzLjMxMDA0Yy0yLjk4Njg5LDAuNDQwMzEgLTYuOTM3ODUsMC43NDA4MSAtMTIuODU5OTksMC44ODc4NWMtMTQuNTYyODUsMC4zNjE2NiAtMzAuODgzNjEsLTguNzYwNjggLTQwLjM4NTExLC0yMC4zMTkxMmMtMTAuMTg4MTcsLTEyLjM5MzkxIC0xMi41NTg5NSwtMjcuMDM1NjQgLTEyLjU0MDU2LC0zNC4wNTAxMWMwLjAwNzczLC0yLjg5OTA2IDAuMjQ0ODgsLTEwLjc2NTIyIDMuMjY4MDcsLTE5LjMxMDQ4YzIuMjkyLC02LjQ3ODM0IDUuNDI3NzMsLTEzLjM0NzI5IDExLjA2NDAxLC0xOC43MzgyMWMyLjY1ODQ0LC0yLjU0MjY5IDUuODgzOSwtNS43MzMxMyA5LjI1MTUxLC04LjE4Njg0YzQuNTI3OTEsLTMuMjk4ODQgOS43OTM2NSwtNS42NTQ1OCAxMy44MDI4MSwtNy4wMDMzN2M5LjE4Njg1LC0zLjA5MDY3IDE5LjcwNzcsLTMuMDA0MzggMjAuMDE3NzIsLTIuOTcwNTJjMC40MTI0LDAuMDQ0OTMgNS40MjYxOSwwLjA0Mzc3IDExLjI0MzUzLDEuMzI2MDFjMi43OTI4NCwwLjYxNTY5IDUuNzcwODQsMS44OTc1MSA4LjUxMzc1LDIuOTIzNjdjNC4yNTM3OSwxLjU5MTU5IDcuNzM3MTIsMy45OTEzOSAxMC45MjgyMSw2LjU2Njc4YzEuNjM2MjYsMS4zMjA1OSAzLjMyMjE0LDIuNjg3MTcgNS4yNTE3MSw0LjAxNDY5IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iIzYxY2JmZCIgc3Ryb2tlLXdpZHRoPSIyMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTE3Ny40MTUyNiwyMDMuNzU3MTFjMzQuODY0OCwzLjEzOTM2IDYwLjU3OTQ5LDMzLjk0NzUyIDU3LjQ0MDEzLDY4LjgxMDI1Yy0zLjEzOTM2LDM0Ljg2Mjc0IC0zMy45NDc1Miw2MC41Nzk0OSAtNjguODEyMzIsNTcuNDQwMTNjLTM0Ljg2MjEyLC0zLjE0MTQyIC02MC41Nzg2NywtMzMuOTQ5NTggLTU3LjQzODQ4LC02OC44MTIzMmMzLjE0MDM5LC0zNC44NjI3NCAzMy45NDc5MywtNjAuNTc5NDkgNjguODEwNjcsLTU3LjQzODA3eiIgZmlsbD0iI2I3ZThmYSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iIzYxY2JmZCIgc3Ryb2tlLXdpZHRoPSIyMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48cGF0aCBkPSJNMTQ0LjkyNjQ5LDEyMi45MjQ3djExNC40NTYyNiIvPjxwYXRoIGQ9Ik0yMjUuMTUyODMsMTIyLjYxOTA0djExNC40NTYyNiIvPjxwYXRoIGQ9Ik0xNTAuMTkwODcsMTI4Ljc2NTZsNzEuNDU0NDYsMTAyLjAwMjA1Ii8+PC9nPjwvZz48L2c+PC9zdmc+PCEtLXJvdGF0aW9uQ2VudGVyOjE0Ni4wMDk2OjE1Mi4yNjY5LS0+";

    const A = Scratch.ArgumentType;
    const B = Scratch.BlockType;
    const Cast = Scratch.Cast || { toString: x => String(x), toNumber: x => Number(x), toBoolean: x => !!x };
    const clampLen = (s, n) => (String(s).length > n ? String(s).slice(0, n) : String(s));
    const isNumStr = (v) => {
        const s = String(v).trim();
        if (!s) return false;
        return /^-?\d+(\.\d+)?$/.test(s) && isFinite(Number(s));
    };
    const nowMs = () => Date.now();
    const PROTOCOL_ID = 'ningqiCollect';
    const NS_PREFIX = `☁ ${PROTOCOL_ID}.`;
    const MANIFEST_NAME = `${NS_PREFIX}_manifest`;
    const VERSION = '2.0.1';
    const MODE_MODAL = "显示确认窗";
    const MODE_IMMEDIATELY_SHOW_SELECTOR = "打开选择器";
    const MODE_ONLY_SELECTOR = "仅显示选择器";
    const ALL_MODES = [MODE_MODAL, MODE_IMMEDIATELY_SHOW_SELECTOR, MODE_ONLY_SELECTOR];
    const AS_TEXT = "txt";
    const AS_DATA_URL = "dataURL";
    let openFileSelectorMode = MODE_MODAL;
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    let countdownInterval = null;
    let countdownValue = 0;

    const encodeBinary = (bytes) => {
        const buffer = new Uint8Array(Math.ceil((bytes.length * 8) / 3));
        let ptr = 0;

        for (var i = 0; i <= bytes.length - 3; i += 3) {
            const a = bytes[i];
            const b = bytes[i + 1];
            const c = bytes[i + 2];
            buffer[ptr++] = 49 + (a >> 5);
            buffer[ptr++] = 49 + ((a >> 2) & 0b111);
            buffer[ptr++] = 49 + (((a & 0b11) << 1) | (b >> 7));
            buffer[ptr++] = 49 + ((b >> 4) & 0b111);
            buffer[ptr++] = 49 + ((b >> 1) & 0b111);
            buffer[ptr++] = 49 + (((b & 0b1) << 2) | (c >> 6));
            buffer[ptr++] = 49 + ((c >> 3) & 0b111);
            buffer[ptr++] = 49 + (c & 0b111);
        }

        switch (bytes.length - i) {
            case 1: {
                const a = bytes[i];
                buffer[ptr++] = 49 + (a >> 5);
                buffer[ptr++] = 49 + ((a >> 2) & 0b111);
                buffer[ptr++] = 49 + ((a & 0b11) << 1);
                break;
            }

            case 2: {
                const a = bytes[i];
                const b = bytes[i + 1];
                buffer[ptr++] = 49 + (a >> 5);
                buffer[ptr++] = 49 + ((a >> 2) & 0b111);
                buffer[ptr++] = 49 + (((a & 0b11) << 1) | (b >> 7));
                buffer[ptr++] = 49 + ((b >> 4) & 0b111);
                buffer[ptr++] = 49 + ((b >> 1) & 0b111);
                buffer[ptr++] = 49 + ((b & 0b1) << 2);
                break;
            }
        }

        return textDecoder.decode(buffer);
    };

    const decodeBinary = (string) => {
        const encodedBytes = Math.floor((string.length * 3) / 8);
        const result = new Uint8Array(encodedBytes);
        let ptr = 0;

        for (var i = 0; i <= string.length - 8; i += 8) {
            const a = string.charCodeAt(i) - 49;
            const b = string.charCodeAt(i + 1) - 49;
            const c = string.charCodeAt(i + 2) - 49;
            const d = string.charCodeAt(i + 3) - 49;
            const e = string.charCodeAt(i + 4) - 49;
            const f = string.charCodeAt(i + 5) - 49;
            const g = string.charCodeAt(i + 6) - 49;
            const h = string.charCodeAt(i + 7) - 49;
            result[ptr++] = (a << 5) | (b << 2) | (c >> 1);
            result[ptr++] = ((c & 0b1) << 7) | (d << 4) | (e << 1) | (f >> 2);
            result[ptr++] = ((f & 0b11) << 6) | (g << 3) | h;
        }

        switch (encodedBytes - ptr) {
            case 1: {
                const a = string.charCodeAt(i) - 49;
                const b = string.charCodeAt(i + 1) - 49;
                const c = string.charCodeAt(i + 2) - 49;
                result[ptr] = (a << 5) | (b << 2) | (c >> 1);
                break;
            }

            case 2: {
                const a = string.charCodeAt(i) - 49;
                const b = string.charCodeAt(i + 1) - 49;
                const c = string.charCodeAt(i + 2) - 49;
                const d = string.charCodeAt(i + 3) - 49;
                const e = string.charCodeAt(i + 4) - 49;
                const f = string.charCodeAt(i + 5) - 49;
                result[ptr++] = (a << 5) | (b << 2) | (c >> 1);
                result[ptr] = ((c & 0b1) << 7) | (d << 4) | (e << 1) | (f >> 2);
                break;
            }
        }

        return result;
    };

    function encodeText(text, salt) {
        return encodeBinary(textEncoder.encode(String(text)));
    }

    function decodeText(numStr, salt) {
        const text = String(numStr);
        for (let i = 0; i < text.length; i++) {
            const ch = text.charCodeAt(i);
            if (ch < 49 || ch > 56) {
                return "";
            }
        }
        return textDecoder.decode(decodeBinary(text));
    }
    function md5(str) {
        function rotl(n, b) { return (n << b) | (n >>> (32 - b)); }
        function toHex(n) {
            let hexChars = '0123456789abcdef';
            let result = '';
            for (let i = 7; i >= 0; i--) {
                result += hexChars.charAt((n >>> (i * 4)) & 0x0f);
            }
            return result;
        }
        let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476;
        let strLen = str.length * 8;
        str += String.fromCharCode(0x80);
        while (str.length % 64 !== 56) str += String.fromCharCode(0x00);
        str += String.fromCharCode((strLen >>> 24) & 0xff, (strLen >>> 16) & 0xff, (strLen >>> 8) & 0xff, strLen & 0xff);
        for (let i = 0; i < str.length; i += 64) {
            let w = new Array(16);
            for (let j = 0; j < 16; j++) {
                w[j] = (str.charCodeAt(i + j * 4) << 24) | (str.charCodeAt(i + j * 4 + 1) << 16) | (str.charCodeAt(i + j * 4 + 2) << 8) | str.charCodeAt(i + j * 4 + 3);
            }
            let a = h0, b = h1, c = h2, d = h3;
            for (let j = 0; j < 64; j++) {
                let f, g;
                if (j < 16) { f = (b & c) | (~b & d); g = j; }
                else if (j < 32) { f = (d & b) | (~d & c); g = (5 * j + 1) % 16; }
                else if (j < 48) { f = b ^ c ^ d; g = (3 * j + 5) % 16; }
                else { f = c ^ (b | ~d); g = (7 * j) % 16; }
                let temp = d; d = c; c = b;
                b = (b + rotl(a + f + 0x5a827999 + w[g], 7)) & 0xffffffff;
                a = temp;
                [a, b, c, d, h0, h1, h2, h3] = [h0, h1, h2, h3, a, b, c, d];
            }
        }
        return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3);
    }
    const isCancelEventSupported = (input) => {
        if ("oncancel" in input) return true;
        return navigator.userAgent.includes("Firefox");
    };
    const showFilePrompt = (accept, as) =>
        new Promise((_resolve) => {
            const callback = (text) => {
                _resolve(text);
                if (Scratch.vm?.renderer) {
                    Scratch.vm.renderer.removeOverlay(outer);
                }
                if (Scratch.vm?.runtime) {
                    Scratch.vm.runtime.off("PROJECT_STOP_ALL", handleProjectStopped);
                }
                document.body.removeEventListener("keydown", handleKeyDown, { capture: true });
            };
            let isReadingFile = false;
            const readFile = (file) => {
                if (isReadingFile) return;
                isReadingFile = true;
                const reader = new FileReader();
                reader.onload = () => callback(reader.result);
                reader.onerror = () => { console.error("Failed to read file as text", reader.error); callback(""); };
                as === AS_TEXT ? reader.readAsText(file) : reader.readAsDataURL(file);
            };
            const handleKeyDown = (e) => {
                if (e.key === "Escape") { e.stopPropagation(); e.preventDefault(); callback(""); }
            };
            document.body.addEventListener("keydown", handleKeyDown, { capture: true });
            const handleProjectStopped = () => callback("");
            if (Scratch.vm?.runtime) {
                Scratch.vm.runtime.on("PROJECT_STOP_ALL", handleProjectStopped);
            }
            const INITIAL_BORDER_COLOR = "#888";
            const DROPPING_BORDER_COLOR = "#03a9fc";
            const outer = document.createElement("div");
            outer.style.pointerEvents = "auto";
            outer.style.width = "95%";
            outer.style.height = "105%";
            outer.style.display = "flex";
            outer.style.alignItems = "center";
            outer.style.justifyContent = "center";
            outer.style.background = "rgba(0, 0, 0, 0.5)";
            outer.style.color = "black";
            outer.style.colorScheme = "light";
            outer.addEventListener("dragover", (e) => {
                if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; modal.style.borderColor = DROPPING_BORDER_COLOR; }
            });
            outer.addEventListener("dragleave", () => modal.style.borderColor = INITIAL_BORDER_COLOR);
            outer.addEventListener("drop", (e) => {
                const file = e.dataTransfer.files[0];
                if (file) { e.preventDefault(); readFile(file); }
            });
            outer.addEventListener("click", (e) => { if (e.target === outer) callback(""); });
            const modal = document.createElement("button");
            modal.style.boxShadow = "0 0 10px -5px currentColor";
            modal.style.cursor = "pointer";
            modal.style.font = "inherit";
            modal.style.background = "white";
            modal.style.padding = "16px";
            modal.style.borderRadius = "16px";
            modal.style.border = `8px dashed ${INITIAL_BORDER_COLOR}`;
            modal.style.position = "relative";
            modal.style.textAlign = "center";
            modal.addEventListener("click", () => input.click());
            modal.focus();
            outer.appendChild(modal);
            const input = document.createElement("input");
            input.type = "file";
            input.accept = accept;
            input.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) readFile(file); });
            const title = document.createElement("div");
            title.textContent = "选择或拖放文件";
            title.style.fontSize = "1.5em";
            title.style.marginBottom = "8px";
            modal.appendChild(title);
            const subtitle = document.createElement("div");
            const formattedAccept = accept || "任意格式";
            subtitle.textContent = `支持格式：${formattedAccept}`;
            modal.appendChild(subtitle);
            if (openFileSelectorMode === MODE_ONLY_SELECTOR && !isCancelEventSupported(input)) {
                openFileSelectorMode = MODE_IMMEDIATELY_SHOW_SELECTOR;
            }
            if (openFileSelectorMode !== MODE_ONLY_SELECTOR && Scratch.vm?.renderer) {
                const overlay = Scratch.vm.renderer.addOverlay(outer, "scale");
                overlay.container.style.zIndex = "100";
            }
            if (openFileSelectorMode === MODE_IMMEDIATELY_SHOW_SELECTOR || openFileSelectorMode === MODE_ONLY_SELECTOR) {
                input.click();
            }
            if (openFileSelectorMode === MODE_ONLY_SELECTOR) {
                input.addEventListener("cancel", () => callback(""));
            }
        });
    const downloadBlob = async (blob, file) => {
        const url = URL.createObjectURL(blob);
        try { await Scratch.download(url, file); } catch (e) { console.error(e); }
        URL.revokeObjectURL(url);
    };
    const isDataURL = (url) => {
        try { return new URL(url).protocol === "data:"; } catch (e) { return false; }
    };
    const downloadUntrustedURL = async (url, file) => {
        if (isDataURL(url)) return Scratch.download(url, file);
        const res = await Scratch.fetch(url);
        const blob = await res.blob();
        await downloadBlob(blob, file);
    };
    let count = 0;
    const times = [];
    let fps = Scratch.vm?.runtime?.frameLoop?.framerate || 30;
    if (Scratch.vm?.runtime?._step) {
        const oldStep = Scratch.vm.runtime._step;
        Scratch.vm.runtime._step = function () {
            oldStep.call(this);
            const now = performance.now();
            while (times.length > 0 && times[0] <= now - 1000) {
                times.shift();
            }
            times.push(now);
            fps = times.length;
        };
    }
    const greenFlagURI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M8 8L24 8L24 24L8 16Z' fill='%234CAF50'/%3E%3C/svg%3E";
    const TURBO_MODE = "turbo mode";
    const INTERPOLATION = "interpolation";
    const REMOVE_FENCING = "remove fencing";
    const REMOVE_MISC_LIMITS = "remove misc limits";
    const HIGH_QUALITY_PEN = "high quality pen";
    const FRAMERATE = "framerate";
    const CLONE_LIMIT = "clone limit";
    const STAGE_SIZE = "stage size";
    const USERNAME = "username";
    if (Scratch.vm) {
        const emitChanged = (what) => Scratch.vm.runtime?.startHats?.("runtimeoptions_whenChange", { WHAT: what });
        const shallowCopy = (obj) => Object.assign({}, obj);
        let previousRuntimeOptions = shallowCopy(Scratch.vm.runtime.runtimeOptions);
        Scratch.vm.on("TURBO_MODE_OFF", () => emitChanged(TURBO_MODE));
        Scratch.vm.on("TURBO_MODE_ON", () => emitChanged(TURBO_MODE));
        Scratch.vm.on("INTERPOLATION_CHANGED", () => emitChanged(INTERPOLATION));
        Scratch.vm.on("RUNTIME_OPTIONS_CHANGED", (newOptions) => {
            if (newOptions.fencing !== previousRuntimeOptions.fencing) emitChanged(REMOVE_FENCING);
            if (newOptions.miscLimits !== previousRuntimeOptions.miscLimits) emitChanged(REMOVE_MISC_LIMITS);
            if (newOptions.maxClones !== previousRuntimeOptions.maxClones) emitChanged(CLONE_LIMIT);
            previousRuntimeOptions = shallowCopy(newOptions);
        });
        if (Scratch.vm.renderer) {
            Scratch.vm.renderer.on("UseHighQualityRenderChanged", () => emitChanged(HIGH_QUALITY_PEN));
        }
        Scratch.vm.on("FRAMERATE_CHANGED", () => emitChanged(FRAMERATE));
        Scratch.vm.on("STAGE_SIZE_CHANGED", () => emitChanged(STAGE_SIZE));
        const originalPostData = Scratch.vm.runtime.ioDevices.userData.postData;
        Scratch.vm.runtime.ioDevices.userData.postData = function (data) {
            const newUsername = data.username !== this._username;
            originalPostData.call(this, data);
            if (newUsername) emitChanged(USERNAME);
        };
    }
    class Cloud {
        constructor() {
            this.server = 'wss://clouddata.turbowarp.org';
            this.projectId = 'cv-demo';
            this.username = 'Guest';
            this.ws = null;
            this.status = 'disconnected';
            this.values = new Map();
            this.updateFlags = new Map();
            this.lastSendAt = new Map();
            this.seed = 0;
            this._initialTimer = 0;
            this._sawAnyMessage = false;
            this._didInitialEdge = false;
        }
        toCloudName(name) {
            let n = String(name || '').trim();
            if (!n) n = 'var';
            let raw = `${NS_PREFIX}${n}`;
            return clampLen(raw, 128);
        }
        fromCloudName(cloudName) {
            const s = String(cloudName || '');
            return s.startsWith(NS_PREFIX) ? s.slice(NS_PREFIX.length) : null;
        }
        connect(optionalServer) {
            try {
                if (optionalServer) {
                    const s = String(optionalServer).trim();
                    if (/^wss?:\/\//i.test(s)) this.server = s;
                }
                if (this.ws) { try { this.ws.close(); } catch (e) {} this.ws = null; }
                const url = this.server.includes('?') ? this.server : `${this.server.replace(/\/?$/, '/')}?project_id=${encodeURIComponent(this.projectId)}`;
                this.status = 'connecting';
                this.seed = 0;
                this._didInitialEdge = false;
                this.values.clear();
                this.updateFlags.clear();
                this._sawAnyMessage = false;
                this.ws = new WebSocket(url);
                this.ws.onopen = () => {
                    this._send({ method: 'handshake', user: this.username, project_id: this.projectId });
                    this._scheduleInitialScan(600);
                };
                this.ws.onclose = () => { this._clearInitialScan(); if (this.status !== 'legacy-conflict') this.status = 'disconnected'; };
                this.ws.onerror = () => { this._clearInitialScan(); if (this.status !== 'legacy-conflict') this.status = 'error'; };
                this.ws.onmessage = (ev) => {
                    const lines = String(ev.data || '').split('\n').filter(Boolean);
                    if (lines.length) this._onAnyMessage();
                    for (const line of lines) {
                        let msg; try { msg = JSON.parse(line); } catch (e) { continue; }
                        this._handleMessage(msg);
                    }
                };
            } catch (e) {
                this.status = 'error';
            }
        }
        disconnect() {
            if (this.ws) { try { this.ws.close(); } catch (e) {} this.ws = null; }
            this._clearInitialScan();
            this.status = 'disconnected';
        }
        _send(obj) {
            if (!this.ws || this.ws.readyState !== 1) return false;
            try { this.ws.send(JSON.stringify(obj)); return true; } catch (e) { return false; }
        }
        _onAnyMessage() { this._scheduleInitialScan(300); }
        _scheduleInitialScan(ms) {
            if (this._initialTimer) { clearTimeout(this._initialTimer); this._initialTimer = 0; }
            this._initialTimer = setTimeout(() => { this._initialTimer = 0; this._evaluateNamespaceAndManifest(); }, ms);
        }
        _clearInitialScan() {
            if (this._initialTimer) { clearTimeout(this._initialTimer); this._initialTimer = 0; }
        }
        _handleMessage(msg) {
            const method = msg && msg.method;
            if (method === 'set' || method === 'update') {
                const cloudName = String(msg.name || '');
                const value = String(msg.value ?? '');
                if (!cloudName.startsWith('☁')) return;
                this.values.set(cloudName, value);
                const local = this.fromCloudName(cloudName);
                if (local) {
                    if (cloudName === MANIFEST_NAME) {
                        const m = String(value).match(/^2(\d{6})/);
                        if (m) this.seed = Number(m[1]);
                        return;
                    }
                    this._edge(local);
                }
            }
        }
        _evaluateNamespaceAndManifest() {
            if (!this.ws) return;
            let hasManifest = false;
            let cvCount = 0;
            let legacyCount = 0;
            for (const k of this.values.keys()) {
                if (k === MANIFEST_NAME) hasManifest = true;
                if (k.startsWith(NS_PREFIX)) cvCount++;
                else if (k.startsWith('☁')) legacyCount++;
            }
            if (legacyCount > 0 && !hasManifest) {
                this.status = 'legacy-conflict';
                try { this.ws.close(); } catch (e) {}
                this.ws = null;
                return;
            }
            if (!hasManifest && cvCount === 0 && legacyCount === 0) {
                const seed = Math.floor(100000 + Math.random() * 900000);
                this.seed = seed;
                const manifestVal = `2${String(seed).padStart(6, '0')}`;
                this._send({ method: 'set', name: MANIFEST_NAME, value: manifestVal });
                this.values.set(MANIFEST_NAME, manifestVal);
            }
            if (hasManifest && !this.seed) {
                const v = this.values.get(MANIFEST_NAME) || '';
                const m = String(v).match(/^2(\d{6})/);
                if (m) this.seed = Number(m[1]);
            }
            if (this.status === 'connecting' || this.status === 'disconnected' || this.status === 'error') {
                this.status = 'connected';
            }
            if (!this._didInitialEdge) {
                this._didInitialEdge = true;
                for (const k of this.values.keys()) {
                    if (k.startsWith(NS_PREFIX) && k !== MANIFEST_NAME) {
                        const local = this.fromCloudName(k);
                        if (local) this._edge(local);
                    }
                }
            }
        }
        _guard() { return this.status !== 'legacy-conflict' && this.ws && this.ws.readyState === 1; }
        createVar(name) {
            if (this.status === 'legacy-conflict') return;
            const cloudName = this.toCloudName(name);
            if (!this.values.has(cloudName)) this.values.set(cloudName, '0');
            this._send({ method: 'set', name: cloudName, value: String(this.values.get(cloudName)) });
            const local = this.fromCloudName(cloudName);
            if (local) this._edge(local);
        }
        deleteVar(name) {
            if (this.status === 'legacy-conflict') return;
            const cloudName = this.toCloudName(name);
            this.values.delete(cloudName);
        }
        setVar(name, value) {
            const cloudName = this.toCloudName(name);
            let v = String(value);
            if (!isNumStr(v)) v = encodeText(v, this.seed);
            if (v.length > 900) v = v.slice(0, 900);
            const now = nowMs();
            const last = this.lastSendAt.get(cloudName) || 0;
            if (now - last < 100) {
                this.values.set(cloudName, v);
                const local = this.fromCloudName(cloudName);
                if (local) this._edge(local);
                return;
            }
            if (this._guard()) {
                this.lastSendAt.set(cloudName, now);
                this.values.set(cloudName, v);
                this._send({ method: 'set', name: cloudName, value: String(v) });
            } else {
                this.values.set(cloudName, v);
            }
            const local = this.fromCloudName(cloudName);
            if (local) this._edge(local);
        }
        changeVar(name, delta) {
            const cloudName = this.toCloudName(name);
            const cur = Number(this.values.get(cloudName) || '0');
            const d = Cast.toNumber(delta) || 0;
            this.setVar(name, String(cur + d));
        }
        getVar(name) {
            const cloudName = this.toCloudName(name);
            return this.values.get(cloudName) ?? '0';
        }
        listNames() {
            const out = [];
            for (const k of this.values.keys()) {
                if (!k.startsWith(NS_PREFIX) || k === MANIFEST_NAME) continue;
                const short = this.fromCloudName(k);
                if (short) out.push(short);
            }
            out.sort((a, b) => a.localeCompare(b));
            return out.length ? out : ['(无)'];
        }
        _edge(localName) {
            const n = String(localName || '').trim();
            if (!n || n === '(无)') return;
            this.updateFlags.set(n, true);
        }
        pollUpdatedFlag(name) {
            const n = String(name || '').trim();
            if (!n || n === '(无)') return false;
            if (this.updateFlags.get(n)) {
                this.updateFlags.set(n, false);
                return true;
            }
            return false;
        }
    }
    const cloudRuntime = new Cloud();
    function makeIconURI() {
            return `data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMDkuMTk0NzIiIGhlaWdodD0iMzA0LjUzMzgxIiB2aWV3Qm94PSIwLDAsMzA5LjE5NDcyLDMwNC41MzM4MSI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTg0Ljk5MDQsLTI3LjczMzEpIj48ZyBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiPjxwYXRoIGQ9Ik04NC45OTA0LDE1Ny4zODg3NWMwLC03MS42MDc0NCA1OC4wNDgyMiwtMTI5LjY1NTY1IDEyOS42NTU2NSwtMTI5LjY1NTY1YzcxLjYwNzQ0LDAgMTI5LjY1NTY1LDU4LjA0ODIyIDEyOS42NTU2NSwxMjkuNjU1NjVjMCw3MS42MDc0NCAtNTguMDQ4MjIsMTI5LjY1NTY1IC0xMjkuNjU1NjUsMTI5LjY1NTY1Yy03MS42MDc0NCwwIC0xMjkuNjU1NjUsLTU4LjA0ODIyIC0xMjkuNjU1NjUsLTEyOS42NTU2NXoiIGZpbGwtb3BhY2l0eT0iMC41ODAzOSIgZmlsbD0iIzAwOTlmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMjAxLjA0MTQ4LDIwMC4wNTc2MmMwLC01My4zOTE3NCA0My4yMzU3MywtOTYuNjc0ODggOTYuNTcxODIsLTk2LjY3NDg4YzUzLjMzNjA5LDAgOTYuNTcxODIsNDMuMjgzMTQgOTYuNTcxODIsOTYuNjc0ODhjMCw1My4zOTE3NCAtNDMuMjM1NzMsOTYuNjc0ODggLTk2LjU3MTgyLDk2LjY3NDg4Yy01My4zMzYwOSwwIC05Ni41NzE4MiwtNDMuMjgzMTQgLTk2LjU3MTgyLC05Ni42NzQ4OHoiIGZpbGwtb3BhY2l0eT0iMC41ODAzOSIgZmlsbD0iIzAwOTlmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMTY4LjQxNTI2LDIwNS43NTcxMWMzNC44NjQ4LDMuMTM5MzYgNjAuNTc5NDksMzMuOTQ3NTIgNTcuNDQwMTMsNjguODEwMjVjLTMuMTM5MzYsMzQuODYyNzQgLTMzLjk0NzUyLDYwLjU3OTQ5IC02OC44MTIzMiw1Ny40NDAxM2MtMzQuODYyMTIsLTMuMTQxNDIgLTYwLjU3ODY3LC0zMy45NDk1OCAtNTcuNDM4NDgsLTY4LjgxMjMyYzMuMTQwMzksLTM0Ljg2Mjc0IDMzLjk0NzkzLC02MC41Nzk0OSA2OC44MTA2NywtNTcuNDM4MDd6IiBmaWxsLW9wYWNpdHk9IjAuNTgwMzkiIGZpbGw9IiMwMDk5ZmYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTM0NS4wNzM1MSwyMTguNTgyMjNjLTAuMDM4MDksMS4wNzYyMiAtMy45NDIwNyw0LjY5MDM4IC04LjQzMzkxLDcuNTcwNjdjLTQuMzEwNTYsMi43NjM5OSAtOS4yMDA2MSw0LjgxNDIyIC05Ljk1OTg4LDUuMDcxMzNjLTQuMjg3NTIsMS40NTE5NCAtNi41ODcxLDIuNTc1NTIgLTExLjU2NzkzLDMuMzEwMDRjLTIuOTg2ODksMC40NDAzMSAtNi45Mzc4NSwwLjc0MDgxIC0xMi44NTk5OSwwLjg4Nzg1Yy0xNC41NjI4NSwwLjM2MTY2IC0zMC44ODM2MSwtOC43NjA2OCAtNDAuMzg1MTEsLTIwLjMxOTEyYy0xMC4xODgxNywtMTIuMzkzOTEgLTEyLjU1ODk1LC0yNy4wMzU2NCAtMTIuNTQwNTYsLTM0LjA1MDExYzAuMDA3NzMsLTIuODk5MDYgMC4yNDQ4OCwtMTAuNzY1MjIgMy4yNjgwNywtMTkuMzEwNDhjMi4yOTIsLTYuNDc4MzQgNS40Mjc3MywtMTMuMzQ3MjkgMTEuMDY0MDEsLTE4LjczODIxYzIuNjU4NDQsLTIuNTQyNjkgNS44ODM5LC01LjczMzEzIDkuMjUxNTEsLTguMTg2ODRjNC41Mjc5MSwtMy4yOTg4NCA5Ljc5MzY1LC01LjY1NDU4IDEzLjgwMjgxLC03LjAwMzM3YzkuMTg2ODUsLTMuMDkwNjcgMTkuNzA3NywtMy4wMDQzOCAyMC4wMTc3MiwtMi45NzA1MmMwLjQxMjQsMC4wNDQ5MyA1LjQyNjE5LDAuMDQzNzcgMTEuMjQzNTMsMS4zMjYwMWMyLjc5Mjg0LDAuNjE1NjkgNS43NzA4NCwxLjg5NzUxIDguNTEzNzUsMi45MjM2N2M0LjI1Mzc5LDEuNTkxNTkgNy43MzcxMiwzLjk5MTM5IDEwLjkyODIxLDYuNTY2NzhjMS42MzYyNiwxLjMyMDU5IDMuMzIyMTQsMi42ODcxNyA1LjI1MTcxLDQuMDE0NjkiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48cGF0aCBkPSJNMTM0LjkyNjQ5LDEyMi45MjQ3djExNC40NTYyNiIvPjxwYXRoIGQ9Ik0yMTUuMTUyODMsMTIyLjYxOTA0djExNC40NTYyNiIvPjxwYXRoIGQ9Ik0xNDAuMTkwODcsMTI4Ljc2NTZsNzEuNDU0NDYsMTAyLjAwMjA1Ii8+PC9nPjwvZz48L2c+PC9zdmc+PCEtLXJvdGF0aW9uQ2VudGVyOjE1NS4wMDk2OjE1Mi4yNjY5MDAwMDAwMDAwNS0tPg==`
    }
    class ningqiCollectExtension {
        constructor() {
            this.isMeasuring = false;
            this.scratchRuntime = Scratch.vm?.runtime || null;
            if (this.scratchRuntime) {
                this.scratchRuntime.on("BEFORE_EXECUTE", () => {
                    this.scratchRuntime.startHats("ningqiCollect_whileTrueFalse");
                });
            }
        }
        getInfo() {
            const icon = makeIconURI();
            return {
                id: 'ningqiCollect',
                name: 'ningqiCollection 1.4mini',
                color1: '#42A5F5',
                color2: '#2196F3',
                color3: '#1976D2',
                menuIconURI: icon,
                categories: [
                    { name: '工具集', color: '#2196F3' }
                ],
                blocks: [
                    { opcode: 'labelCondition', blockType: B.LABEL, text: 'All in the Collection is ningqi [Collect]!!!', category: '工具集' },
                    { opcode: 'labelCollection', blockType: B.LABEL, text: 'Under "TW-A" mean is：', category: '工具集' },
                    { opcode: 'labelCondition', blockType: B.LABEL, text: 'Author in TurboWarp Expansion', category: '工具集' },

                    { opcode: 'labelCondition', blockType: B.LABEL, text: '条件交互 × TW-A', category: '工具集' },
                    { opcode: 'whenKeyString', blockType: B.HAT, blockIconURI: NC_ICON, text: '当按下[KEY_OPTION]键', arguments: { KEY_OPTION: { type: A.STRING, defaultValue: 'enter' } }, category: '工具集' },
                    { opcode: 'keyStringPressed', blockType: B.BOOLEAN, blockIconURI: NC_ICON,  text: '按下[KEY_OPTION]键?', arguments: { KEY_OPTION: { type: A.STRING, defaultValue: 'enter' } }, category: '工具集' },
                    { opcode: 'alertBlock', blockType: B.COMMAND,  blockIconURI: NC_ICON, text: '弹出提示[STRING]', arguments: { STRING: { type: A.STRING, defaultValue: '即将加载！' } }, category: '工具集' },
                    { opcode: 'confirmationBlock', blockType: B.BOOLEAN, blockIconURI: NC_ICON,  text: '弹出确认框[STRING]', arguments: { STRING: { type: A.STRING, defaultValue: '是否加载？' } }, category: '工具集' },
                    { opcode: 'inputPromptBlock', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '弹出输入框[PROMPT] 默认值 [DEFAULT]', arguments: { PROMPT: { type: A.STRING, defaultValue: '请输入内容' }, DEFAULT: { type: A.STRING, defaultValue: '默认文本' } }, category: '工具集' },
                    { opcode: 'isPackaged', blockType: B.REPORTER,  blockIconURI: NC_ICON, text: '是打包作品？', category: '工具集' },
                    { opcode: 'returnCount', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '计数器', arguments: {}, category: '工具集' },
                    { opcode: 'incrementCountByNum', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '将计数器增加[NUM]', arguments: { NUM: { type: A.NUMBER, defaultValue: 1 } }, category: '工具集' },
                    { opcode: 'decrementCountByNum', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '将计数器减少[NUM]', arguments: { NUM: { type: A.NUMBER, defaultValue: 1 } }, category: '工具集' },
                    { opcode: 'setCount', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '将计数器设为[NUM]', arguments: { NUM: { type: A.NUMBER, defaultValue: 0 } }, category: '工具集' },
                    { opcode: 'stringNotEqual', blockType: B.BOOLEAN, blockIconURI: NC_ICON, text: '[TEXT1]≠[TEXT2]', arguments: { TEXT1: { type: A.STRING, defaultValue: 'hi' }, TEXT2: { type: A.STRING, defaultValue: 'hi2' } }, category: '工具集' },
                    { opcode: 'whenTrueFalse', blockType: B.HAT, blockIconURI: NC_ICON, text: '当 [CONDITION] 变为 [STATE] ', isEdgeActivated: true, arguments: { CONDITION: { type: A.BOOLEAN }, STATE: { type: A.STRING, menu: 'boolean' } }, category: '工具集' },
                    { opcode: 'whileTrueFalse', blockType: B.HAT, blockIconURI: NC_ICON, text: '只要 [CONDITION] 为 [STATE]', isEdgeActivated: false, arguments: { CONDITION: { type: A.BOOLEAN }, STATE: { type: A.STRING, menu: 'boolean' } }, category: '工具集' },
                    { opcode: 'broadcastData', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '广播 [BROADCAST_OPTION] 并携带数据 [DATA]', arguments: { BROADCAST_OPTION: { type: null }, DATA: { type: A.STRING, defaultValue: '' } }, hideFromPalette: true, category: '工具集' },
                    { opcode: 'broadcastDataAndWait', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '广播 [BROADCAST_OPTION] 并携带数据 [DATA] 并等待', arguments: { BROADCAST_OPTION: { type: null }, DATA: { type: A.STRING, defaultValue: '' } }, hideFromPalette: true, category: '工具集' },
                    { blockType: B.XML, xml: '<block type="ningqiCollect_broadcastData"><value name="BROADCAST_OPTION"><shadow type="event_broadcast_menu"></shadow></value><value name="DATA"><shadow type="text"></shadow></value></block><block type="ningqiCollect_broadcastDataAndWait"><value name="BROADCAST_OPTION"><shadow type="event_broadcast_menu"></shadow></value><value name="DATA"><shadow type="text"></shadow></value></block>', category: '工具集' },
                    { opcode: 'receivedData', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '收到的数据', disableMonitor: true, allowDropAnywhere: true, category: '工具集' },
                    '---',
                    { opcode: 'labelCondition', blockType: B.LABEL, text: '条件交互 × mini', category: '工具集' },
                    { opcode: 'getMilliseconds', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '获取当前毫秒数', arguments: {}, category: '工具集' },
                    { opcode: 'startCountdown', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '从[seconds]秒开始倒计时', arguments: { seconds: { type: A.NUMBER, defaultValue: 10 } }, category: '工具集' },
                    { opcode: 'getCountdown', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '获取倒计时剩余秒数', arguments: {}, category: '工具集' },
                    { opcode: 'getTimezone', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '获取当前时区', arguments: {}, category: '工具集' },
                    { opcode: 'getScreenWidth', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '获取屏幕宽度', arguments: {}, category: '工具集' },
                    { opcode: 'getScreenHeight', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '获取屏幕高度', arguments: {}, category: '工具集' },
                    { opcode: 'getVolumeLevel', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '获取音量级别', arguments: {}, category: '工具集' },
                    { opcode: 'vibrate', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '震动[milliseconds]毫秒', arguments: { milliseconds: { type: A.NUMBER, defaultValue: 500 } }, category: '工具集' },
                    { opcode: 'copyToClipboardSystem', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '复制文本[text]到剪贴板', arguments: { text: { type: A.STRING, defaultValue: 'Hello Scratch!' } }, category: '工具集' },
                    { opcode: 'readFromClipboard', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '从剪贴板读取文本', arguments: {}, category: '工具集' },
                    { opcode: 'openLink', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '打开浏览器网址:[url]', arguments: { url: { type: A.STRING, defaultValue: '' } }, category: '工具集' },
                    '---',
                    { opcode: 'labelString', blockType: B.LABEL, text: '字符串处理 × TW-A', category: '工具集' },
                    { opcode: 'lettersToOf', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '[STRING]的第[INPUTA]到第[INPUTB]个字符', arguments: { INPUTA: { type: A.NUMBER, defaultValue: '1' }, INPUTB: { type: A.NUMBER, defaultValue: '3' }, STRING: { type: A.STRING, defaultValue: '114514' } }, category: '工具集' },
                    { opcode: 'newlineCharacter', blockType: B.REPORTER,  blockIconURI: NC_ICON, text: '换行符', category: '工具集' },
                    { opcode: 'stringIfElse', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '如果[BOOLEAN]则[INPUTA]否则[INPUTB]', arguments: { BOOLEAN: { type: A.BOOLEAN, defaultValue: '' }, INPUTA: { type: A.STRING, defaultValue: '1' }, INPUTB: { type: A.STRING, defaultValue: '0' } }, category: '工具集' },
                    { opcode: 'encodeText', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '编码[TEXT]为数字', arguments: { TEXT: { type: A.STRING, defaultValue: 'Hi' } }, category: '工具集' },
                    { opcode: 'decodeText', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '解码[TEXT]为字符串', arguments: { TEXT: { type: A.STRING, defaultValue: '114514' } }, category: '工具集' },
                    { opcode: 'md5Hash', blockType: B.REPORTER,  blockIconURI: NC_ICON, text: 'MD5hash[TEXT]', arguments: { TEXT: { type: A.STRING, defaultValue: 'Hi' } }, category: '工具集' },
                    { opcode: 'color', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '[COLOR]的代码', arguments: { COLOR: { type: A.COLOR, defaultValue: '#29a9ff' } }, category: '工具集' },
                    { opcode: 'brightnessByColor', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '[color]的亮度', arguments: { color: { type: A.COLOR, defaultValue: '#29a9ff' } }, category: '工具集' },
                    { opcode: 'repeatTxtTimes', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '重复文字[TEXT][NUM]次', arguments: { TEXT: { type: A.STRING, defaultValue: 'Hi' }, NUM: { type: A.NUMBER, defaultValue: 2 } }, category: '工具集' },
                    { opcode: 'jsonParse', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '解析JSON[TEXT]', arguments: { TEXT: { type: A.STRING, defaultValue: '"Hi"' } }, category: '工具集' },
                    { opcode: 'json_vm_getlist', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '获取列表[list]', arguments: { list: { type: A.STRING, menu: 'get_list' } }, category: '工具集' },
                    { opcode: 'json_vm_setlist', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '将[list]设为[json]', arguments: { list: { type: A.STRING, menu: 'get_list' }, json: { type: A.STRING, defaultValue: '["Hi","hi"]' } }, category: '工具集' },
                    '---',
                    { opcode: 'labelString', blockType: B.LABEL, text: '字符串处理 × mini', category: '工具集' },
                    { opcode: 'split', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '将文本[text]按[delimiter]分割', arguments: { text: { type: A.STRING, defaultValue: 'hello world' }, delimiter: { type: A.STRING, defaultValue: ' ' } }, category: '工具集' },
                    { opcode: 'replace', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '将文本[text]中的[old]替换为[new]', arguments: { text: { type: A.STRING, defaultValue: 'hello world' }, old: { type: A.STRING, defaultValue: 'world' }, new: { type: A.STRING, defaultValue: 'Scratch' } }, category: '工具集' },
                    { opcode: 'find', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '在文本[searchText]中查找[text]', arguments: { text: { type: A.STRING, defaultValue: 'world' }, searchText: { type: A.STRING, defaultValue: 'hello world' } }, category: '工具集' },
                    { opcode: 'removeSpaces', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '移除文本[text]中的空格', arguments: { text: { type: A.STRING, defaultValue: 'hello world' } }, category: '工具集' },
                    { opcode: 'toUppercase', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '将文本[text]转为大写', arguments: { text: { type: A.STRING, defaultValue: 'hello' } }, category: '工具集' },
                    { opcode: 'toLowercase', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '将文本[text]转为小写', arguments: { text: { type: A.STRING, defaultValue: 'HELLO' } }, category: '工具集' },
                    { opcode: 'characterCount', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '文本[text]的字符数', arguments: { text: { type: A.STRING, defaultValue: 'hello' } }, category: '工具集' },
                    { opcode: 'reverse', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '反转文本[text]', arguments: { text: { type: A.STRING, defaultValue: 'hello' } }, category: '工具集' },
                    { opcode: 'deduplicate', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '对列表[list]去重', arguments: { list: { type: A.STRING, defaultValue: '1,2,3,2,1' } }, category: '工具集' },
                    { opcode: 'sort', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '对列表[list]排序', arguments: { list: { type: A.STRING, defaultValue: '3,1,4,1,5' } }, category: '工具集' },
                    { opcode: 'randomFromList', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '从列表[list]中随机选择', arguments: { list: { type: A.STRING, defaultValue: 'apple,banana,orange' } }, category: '工具集' },
                    { opcode: 'findPosition', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '在列表[list]中查找[item]的位置', arguments: { item: { type: A.STRING, defaultValue: 'banana' }, list: { type: A.STRING, defaultValue: 'apple,banana,orange' } }, category: '工具集' },
                    { opcode: 'mergeLists', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '合并列表[list1]和[list2]', arguments: { list1: { type: A.STRING, defaultValue: '1,2,3' }, list2: { type: A.STRING, defaultValue: '4,5,6' } }, category: '工具集' },
                    { opcode: 'sliceList', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '从列表[list]中截取从[start]到[end]的部分', arguments: { list: { type: A.STRING, defaultValue: '1,2,3,4,5' }, start: { type: A.NUMBER, defaultValue: 1 }, end: { type: A.NUMBER, defaultValue: 3 } }, category: '工具集' },
                    { opcode: 'copyToClipboard', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '复制文本[text]到剪贴板', arguments: { text: { type: A.STRING, defaultValue: 'Hello Scratch!' } }, category: '工具集' },
                    { opcode: 'readFromLocalTxt', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '从本地读取.txt文件', arguments: {}, category: '工具集' },
                    { opcode: 'convertToCase', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '将文本[text]转换为[case]', arguments: { text: { type: A.STRING, defaultValue: 'hello' }, case: { type: A.STRING, menu: 'textCase', defaultValue: 'lowercase' } }, category: '工具集' },
                    { opcode: 'isCase', blockType: B.BOOLEAN, blockIconURI: NC_ICON, text: '文本[text]是否为[case]', arguments: { text: { type: A.STRING, defaultValue: 'hello' }, case: { type: A.STRING, menu: 'textCase', defaultValue: 'lowercase' } }, category: '工具集' },
                    { opcode: 'unicodeOf', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '字符[char]的Unicode编码', arguments: { char: { type: A.STRING, defaultValue: 'A' } }, category: '工具集' },
                    { opcode: 'characterFromUnicode', blockType: B.REPORTER, blockIconURI: NC_ICON, text: 'Unicode编码[code]对应的字符', arguments: { code: { type: A.NUMBER, defaultValue: 65 } }, category: '工具集' },
                    { opcode: 'countCharacters', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '文本[text]中[char]的数量', arguments: { text: { type: A.STRING, defaultValue: 'apple' }, char: { type: A.STRING, defaultValue: 'p' } }, category: '工具集' },
                    { opcode: 'startsWith', blockType: B.BOOLEAN, blockIconURI: NC_ICON, text: '文本[text]是否以[prefix]开头', arguments: { text: { type: A.STRING, defaultValue: 'turbowarp' }, prefix: { type: A.STRING, defaultValue: 'turbo' } }, category: '工具集' },
                    { opcode: 'endsWith', blockType: B.BOOLEAN, blockIconURI: NC_ICON, text: '文本[text]是否以[suffix]结尾', arguments: { text: { type: A.STRING, defaultValue: 'turbowarp' }, suffix: { type: A.STRING, defaultValue: 'warp' } }, category: '工具集' },
                    '---',
                    { opcode: 'labelCloud', blockType: B.LABEL, blockIconURI: NC_ICON,  text: '10000why的云变量V2 × mini', category: '工具集' },
                    { opcode: 'connect', blockType: B.COMMAND, blockIconURI: NC_ICON,  text: '连接云服 [SERVER]', arguments: { SERVER: { type: A.STRING, defaultValue: 'wss://clouddata.turbowarp.org' } }, category: '工具集' },
                    { opcode: 'disconnect', blockType: B.COMMAND,  blockIconURI: NC_ICON, text: '断开云服', category: '工具集' },
                    { opcode: 'status', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '连接状态', category: '工具集' },
                    { opcode: 'version', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '协议版本', category: '工具集' },
                    { opcode: 'getLatency', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: ' [SERVER] 的延迟', arguments: { SERVER: { type: A.STRING, defaultValue: 'wss://clouddata.turbowarp.org' } }, category: '工具集' },
                    { opcode: 'createVar', blockType: B.COMMAND, blockIconURI: NC_ICON,  text: '创建云变量 [NAME]', arguments: { NAME: { type: A.STRING, defaultValue: 'SChat' } }, category: '工具集' },
                    { opcode: 'deleteVar', blockType: B.COMMAND, blockIconURI: NC_ICON,  text: '删除云变量 [NAME]', arguments: { NAME: { type: A.STRING, menu: 'varNames' } }, category: '工具集' },
                    { opcode: 'setVar', blockType: B.COMMAND,  blockIconURI: NC_ICON, text: '将 [NAME] 设为 [VAL]', arguments: { NAME: { type: A.STRING, menu: 'varNames' }, VAL: { type: A.STRING, defaultValue: '123' } }, category: '工具集' },
                    { opcode: 'changeVar', blockType: B.COMMAND,  blockIconURI: NC_ICON, text: '将 [NAME] 增加 [DELTA]', arguments: { NAME: { type: A.STRING, menu: 'varNames' }, DELTA: { type: A.NUMBER, defaultValue: 1 } }, category: '工具集' },
                    { opcode: 'getVar', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '读取 [NAME]', arguments: { NAME: { type: A.STRING, menu: 'varNames' } }, category: '工具集' },
                    { opcode: 'onUpdated', blockType: B.HAT, isEdgeActivated: true, blockIconURI: NC_ICON,  text: '当 [NAME] 更新', arguments: { NAME: { type: A.STRING, menu: 'varNames' } }, category: '工具集' },
                    '---',
                    { opcode: 'labelAsset', blockType: B.LABEL, blockIconURI: NC_ICON,  text: '文件与资源管理 × TW-A', category: '工具集' },
                    { opcode: 'addSprite', blockType: B.COMMAND, blockIconURI: NC_ICON,  text: '从URL [URL] 加载角色', arguments: { URL: { type: A.STRING, defaultValue: '' } }, category: '工具集' },
                    { opcode: 'addCostume', blockType: B.COMMAND, blockIconURI: NC_ICON,  text: '从URL [URL] 加载造型 [NAME]', arguments: { URL: { type: A.STRING, defaultValue: '' }, NAME: { type: A.STRING, defaultValue: '造型1' } }, category: '工具集' },
                    { opcode: 'deleteSprite', blockType: B.COMMAND,  blockIconURI: NC_ICON, text: '删除角色 [TARGET]', arguments: { TARGET: { type: A.STRING, menu: 'targets' } }, category: '工具集' },
                    { opcode: 'deleteCostume', blockType: B.COMMAND,  blockIconURI: NC_ICON, text: '删除造型 [COSTUME]', arguments: { COSTUME: { type: A.STRING, defaultValue: '造型1' } }, category: '工具集' },
                    { opcode: 'deleteImage', blockType: B.COMMAND, blockIconURI: NC_ICON, text: '删除角色[SPRITE]的造型[COSNAME]', arguments: { COSNAME: { type: A.STRING, defaultValue: '造型1' }, SPRITE: { type: A.STRING, defaultValue: '角色1' } }, category: '工具集' },
                    { opcode: 'getAllSprites', blockType: B.REPORTER,  blockIconURI: NC_ICON, text: '所有角色', category: '工具集' },
                    { opcode: 'getAllCostumes', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '所有造型', category: '工具集' },
                    { opcode: 'getAllSounds', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '所有声音', category: '工具集' },
                    { opcode: 'getSpriteName', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '角色名字', category: '工具集' },
                    { opcode: 'showPickerAs', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: "打开文件作为 [as] ", arguments: { as: { type: A.STRING, menu: 'encoding' } }, category: '工具集' },
                    { opcode: 'showPickerExtensionsAs', blockType: B.REPORTER,  blockIconURI: NC_ICON, text: "打开 [extension] 作为 [as] ", arguments: { extension: { type: A.STRING, defaultValue: ".txt" }, as: { type: A.STRING, menu: 'encoding' } }, category: '工具集' },
                    { opcode: 'download', blockType: B.COMMAND, blockIconURI: NC_ICON,  text: "下载 [text] 为 [file]", arguments: { text: { type: A.STRING, defaultValue: "你好！" }, file: { type: A.STRING, defaultValue: "保存.txt" } }, category: '工具集' },
                    { opcode: 'downloadURL', blockType: B.COMMAND,  blockIconURI: NC_ICON, text: "将 URL [url] 下载为 [file]", arguments: { url: { type: A.STRING, defaultValue: "" }, file: { type: A.STRING, defaultValue: "保存2.txt" } }, category: '工具集' },
                    { opcode: 'setOpenMode', blockType: B.COMMAND,  blockIconURI: NC_ICON, text: "设置打开方式 [mode]", arguments: { mode: { type: A.STRING, defaultValue: MODE_MODAL, menu: "automaticallyOpen" } }, category: '工具集' },
                    { opcode: 'clonesBeingUsed', blockType: B.REPORTER, blockIconURI: NC_ICON,  text: '克隆体数量', category: '工具集' },
                    { opcode: 'isClone', blockType: B.BOOLEAN, blockIconURI: NC_ICON,  text: '是克隆体?', category: '工具集' },
                    { opcode: 'getfps', blockType: B.REPORTER, blockIconURI: NC_ICON, text: '帧率', arguments: {}, category: '工具集' },
                    '---',
                    { opcode: 'labelCondition', blockType: B.LABEL, text: 'Full version for new ningqiCollection:', category: '工具集' },
                    { opcode: 'openCollection', blockType: B.COMMAND, blockIconURI: NC_ICON, text: 'OpenURL[url]', arguments: { url: { type: A.STRING, defaultValue: 'https://github.com/ningqi24/Scratch-Turbowarp-more-Extension' } }, category: '工具集' },


                ],
                menus: {

                    boolean: { acceptReporters: false, items: [
                        { text: Scratch.translate("true"), value: "true" },
                        { text: Scratch.translate("false"), value: "false" }
                    ]},

                    varNames: { acceptReporters: true, items: 'listVarNamesDyn' },
                    encoding: { acceptReporters: true, items: [{ text: "txt", value: AS_TEXT }, { text: "dataURL", value: AS_DATA_URL }] },
                    automaticallyOpen: { acceptReporters: true, items: [
                        { text: "显示确认窗", value: MODE_MODAL },
                        { text: "打开选择器", value: MODE_IMMEDIATELY_SHOW_SELECTOR },
                        { text: "仅显示选择器", value: MODE_ONLY_SELECTOR }
                    ]},
                    targets: { acceptReporters: true, items: '_getTargets' },
                    get_list: { acceptReporters: true, items: "getLists" },
                    textCase: { acceptReporters: true, items: [
                        { text: "小写", value: "lowercase" },
                        { text: "大写", value: "uppercase" },
                        { text: "句首大写", value: "sentencecase" },
                        { text: "标题", value: "titlecase" },
                        { text: "精确标题", value: "exacttitlecase" },
                        { text: "混合大小写", value: "mixedcase" },
                        { text: "随机大小写", value: "randomcase" },
                        { text: "驼峰命名", value: "camelcase" }
                    ]},

            }
            };
        }

        getStageWidth() {
            return this.scratchRuntime?.renderer?.canvas?.offsetWidth || 0;
        }
        getStageHeight() {
            return this.scratchRuntime?.renderer?.canvas?.offsetHeight || 0;
        }
        labelCondition() {}
        labelString() {}
        labelCloud() {}
        labelAsset() {}
        connect(args) { cloudRuntime.connect(Cast.toString(args.SERVER)); }
        disconnect() { cloudRuntime.disconnect(); }
        status() { return cloudRuntime.status; }
        version() { return `${PROTOCOL_ID}/${VERSION}`; }
        createVar(args) { cloudRuntime.createVar(Cast.toString(args.NAME)); }
        deleteVar(args) { const n = Cast.toString(args.NAME); if (n && n !== '(无)') cloudRuntime.deleteVar(n); }
        setVar(args) { cloudRuntime.setVar(Cast.toString(args.NAME), Cast.toString(args.VAL)); }
        changeVar(args) { cloudRuntime.changeVar(Cast.toString(args.NAME), Cast.toNumber(args.DELTA)); }
        getVar(args) { return cloudRuntime.getVar(Cast.toString(args.NAME)); }
        onUpdated(args) { return cloudRuntime.pollUpdatedFlag(Cast.toString(args.NAME)); }
        encodeText(args) { return encodeText(Cast.toString(args.TEXT), cloudRuntime.seed); }
        decodeText(args) { return decodeText(Cast.toString(args.TEXT), cloudRuntime.seed); }
        stringNotEqual(args) { return Cast.toString(args.TEXT1) !== Cast.toString(args.TEXT2); }
        whenTrueFalse(args) { return args.STATE === "true" ? args.CONDITION : !args.CONDITION; }
        whileTrueFalse(args) { return args.STATE === "true" ? args.CONDITION : !args.CONDITION; }
        broadcastData(args, util) {
            const broadcast = Scratch.Cast.toString(args.BROADCAST_OPTION);
            if (!broadcast) return;

            const data = Scratch.Cast.toString(args.DATA);

            let threads = util.startHats("event_whenbroadcastreceived", {
                BROADCAST_OPTION: broadcast,
            });
            threads.forEach((thread) => (thread.receivedData = data));
        }
        broadcastDataAndWait(args, util) {
            const data = Scratch.Cast.toString(args.DATA);

            if (!util.stackFrame.broadcastVar) {
                util.stackFrame.broadcastVar = Scratch.Cast.toString(args.BROADCAST_OPTION);
            }

            if (util.stackFrame.broadcastVar) {
                const broadcastOption = util.stackFrame.broadcastVar;
                if (!util.stackFrame.startedThreads) {
                    util.stackFrame.startedThreads = util.startHats(
                        "event_whenbroadcastreceived",
                        {
                            BROADCAST_OPTION: broadcastOption,
                        }
                    );
                    if (util.stackFrame.startedThreads.length === 0) {
                        return;
                    } else {
                        util.stackFrame.startedThreads.forEach(
                            (thread) => (thread.receivedData = data)
                        );
                    }
                }

                const waiting = util.stackFrame.startedThreads.some(
                    (thread) => this.scratchRuntime.threads.indexOf(thread) !== -1
                );
                if (waiting) {
                    if (
                        util.stackFrame.startedThreads.every((thread) =>
                            this.scratchRuntime.isWaitingThread(thread)
                        )
                    ) {
                        util.yieldTick();
                    } else {
                        util.yield();
                    }
                }
            }
        }
        receivedData(args, util) {
            const received = util.thread.receivedData;
            return received ? received : "";
        }
        listVarNamesDyn() { return cloudRuntime.listNames(); }
        md5Hash(args) { return md5(args.TEXT.trim()); }
        showPickerAs(args) { return showFilePrompt("", args.as); }
        showPickerExtensionsAs(args) { return showFilePrompt(args.extension, args.as); }
        async download(args) {
            try { await downloadBlob(new Blob([Cast.toString(args.text)]), Cast.toString(args.file)); } catch (e) { console.error(e); }
        }
        async downloadURL(args) {
            try { await downloadUntrustedURL(Cast.toString(args.url), Cast.toString(args.file)); } catch (e) { console.error(e); }
        }
        setOpenMode(args) {
            if (ALL_MODES.includes(args.mode)) openFileSelectorMode = args.mode;
            else console.warn(`未知模式`, args.mode);
        }
        isPackaged() {
            return Scratch.vm?.runtime?.isPackaged || false;
        }
        split(args) {
            const text = Cast.toString(args.text);
            const delimiter = Cast.toString(args.delimiter);
            return text.split(delimiter).join(',');
        }

        replace(args) {
            const text = Cast.toString(args.text);
            const oldStr = Cast.toString(args.old);
            const newStr = Cast.toString(args.new);
            return text.split(oldStr).join(newStr);
        }

        find(args) {
            const text = Cast.toString(args.text);
            const searchText = Cast.toString(args.searchText);
            const index = searchText.indexOf(text);
            return index === -1 ? '0' : (index + 1).toString();
        }

        removeSpaces(args) {
            const text = Cast.toString(args.text);
            return text.replace(/\s/g, '');
        }

        toUppercase(args) {
            const text = Cast.toString(args.text);
            return text.toUpperCase();
        }

        toLowercase(args) {
            const text = Cast.toString(args.text);
            return text.toLowerCase();
        }

        characterCount(args) {
            const text = Cast.toString(args.text);
            return text.length.toString();
        }

        reverse(args) {
            const text = Cast.toString(args.text);
            return text.split('').reverse().join('');
        }

        deduplicate(args) {
            const listStr = Cast.toString(args.list);
            const list = listStr.split(',');
            const uniqueList = [...new Set(list)];
            return uniqueList.join(',');
        }

        sort(args) {
            const listStr = Cast.toString(args.list);
            const list = listStr.split(',');
            const sortedList = list.sort((a, b) => {
                if (!isNaN(a) && !isNaN(b)) {
                    return Number(a) - Number(b);
                }
                return a.localeCompare(b);
            });
            return sortedList.join(',');
        }

        randomFromList(args) {
            const listStr = Cast.toString(args.list);
            const list = listStr.split(',');
            if (list.length === 0) return '';
            const randomIndex = Math.floor(Math.random() * list.length);
            return list[randomIndex];
        }

        findPosition(args) {
            const item = Cast.toString(args.item);
            const listStr = Cast.toString(args.list);
            const list = listStr.split(',');
            const index = list.indexOf(item);
            return index === -1 ? '0' : (index + 1).toString();
        }

        mergeLists(args) {
            const list1Str = Cast.toString(args.list1);
            const list2Str = Cast.toString(args.list2);
            const list1 = list1Str.split(',');
            const list2 = list2Str.split(',');
            const mergedList = [...list1, ...list2];
            return mergedList.join(',');
        }

        sliceList(args) {
            const listStr = Cast.toString(args.list);
            const list = listStr.split(',');
            const start = Math.max(0, Cast.toNumber(args.start) - 1);
            const end = Math.min(list.length, Cast.toNumber(args.end));
            const slicedList = list.slice(start, end);
            return slicedList.join(',');
        }

        async copyToClipboard(args) {
            const text = Cast.toString(args.text);
            try {
                await navigator.clipboard.writeText(text);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }

        async readFromLocalTxt() {
            return new Promise((resolve) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.txt';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            resolve(event.target.result);
                        };
                        reader.onerror = () => {
                            resolve('');
                        };
                        reader.readAsText(file);
                    } else {
                        resolve('');
                    }
                };
                input.click();
            });
        }

        getMilliseconds() {
            return Date.now().toString();
        }

        startCountdown(args) {
            const seconds = Cast.toNumber(args.seconds);
            countdownValue = seconds;
            
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            
            countdownInterval = setInterval(() => {
                if (countdownValue > 0) {
                    countdownValue--;
                } else {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                }
            }, 1000);
        }

        getCountdown() {
            return countdownValue.toString();
        }

        getTimezone() {
            try {
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                return timezone;
            } catch (e) {
                return '未知时区';
            }
        }

        getScreenWidth() {
            return window.screen.width.toString();
        }

        getScreenHeight() {
            return window.screen.height.toString();
        }

        async getVolumeLevel() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioContext = new AudioContext();
                const analyser = audioContext.createAnalyser();
                const microphone = audioContext.createMediaStreamSource(stream);
                const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

                analyser.smoothingTimeConstant = 0.8;
                analyser.fftSize = 1024;

                microphone.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(audioContext.destination);

                let volume = 0;

                scriptProcessor.onaudioprocess = function(event) {
                    const input = event.inputBuffer.getChannelData(0);
                    let sum = 0.0;
                    for (let i = 0; i < input.length; i++) {
                        sum += input[i] * input[i];
                    }
                    volume = Math.sqrt(sum / input.length);
                };

                setTimeout(() => {
                    stream.getTracks().forEach(track => track.stop());
                    audioContext.close();
                }, 1000);

                return Math.round(volume * 100).toString();
            } catch (e) {
                console.error('Error accessing microphone:', e);
                return '0';
            }
        }

        vibrate(args) {
            const milliseconds = Cast.toNumber(args.milliseconds);
            if (navigator.vibrate) {
                navigator.vibrate(milliseconds);
            }
        }

        async copyToClipboardSystem(args) {
            const text = Cast.toString(args.text);
            try {
                await navigator.clipboard.writeText(text);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }

        async readFromClipboard() {
            try {
                const text = await navigator.clipboard.readText();
                return text;
            } catch (err) {
                console.error('Failed to read text from clipboard: ', err);
                return '';
            }
        }

        openLink(args) {
            const url = Cast.toString(args.url);
            try {
                const parsedUrl = new URL(url);
                const allowedProtocols = ['http:', 'https:'];
                if (allowedProtocols.includes(parsedUrl.protocol)) {
                    window.open(url, '_blank');
                }
            } catch (err) {
                console.error('Invalid URL: ', err);
            }
        }

         openCollection(args) {
            const url = Cast.toString(args.url);
            try {
                const parsedUrl = new URL(url);
                const allowedProtocols = ['http:', 'https:'];
                if (allowedProtocols.includes(parsedUrl.protocol)) {
                    window.open(url, '_blank');
                }
            } catch (err) {
                console.error('Invalid URL: ', err);
            }
        }



        async getLatency(args) {
            if (this.isMeasuring) return -2;
            const serverUrl = args.SERVER;
            return new Promise((resolve) => {
                this.isMeasuring = true;
                const startTime = performance.now();
                try {
                    const ws = new WebSocket(serverUrl);
                    const timeout = setTimeout(() => {
                        ws.close();
                        this.isMeasuring = false;
                        resolve(-1);
                    }, 5000);
                    ws.onopen = () => {
                        clearTimeout(timeout);
                        const latency = Math.round(performance.now() - startTime);
                        ws.close();
                        this.isMeasuring = false;
                        resolve(latency);
                    };
                    ws.onerror = () => {
                        clearTimeout(timeout);
                        this.isMeasuring = false;
                        resolve(-1);
                    };
                } catch (error) {
                    this.isMeasuring = false;
                    resolve(-1);
                }
            });
        }
        alertBlock(args) {
            alert(args.STRING);
        }
        confirmationBlock(args) {
            return confirm(args.STRING);
        }
        inputPromptBlock(args) {
            const promptText = Cast.toString(args.PROMPT);
            const defaultValue = Cast.toString(args.DEFAULT);
            return new Promise((resolve) => {
                setTimeout(() => {
                    const result = window.prompt(promptText, defaultValue);
                    resolve(result || '');
                }, 100);
            });
        }
        lettersToOf(args) {
            const string = args.STRING.toString();
            const start = args.INPUTA - 1;
            const end = args.INPUTB;
            return string.slice(start, end);
        }
        newlineCharacter() {
            return '\n';
        }
        clonesBeingUsed(args, util) {
            return Scratch.vm.runtime._cloneCounter;
        }
        isClone(args, util) {
            return util.target.isOriginal ? false : true;
        }
        stringIfElse(args) {
            return args.BOOLEAN ? args.INPUTA : args.INPUTB;
        }
        whenKeyString(args, util) {
            return util.ioQuery("keyboard", "getKeyIsDown", [args.KEY_OPTION]);
        }
        keyStringPressed(args, util) {
            return util.ioQuery("keyboard", "getKeyIsDown", [args.KEY_OPTION]);
        }
        async addSprite(args, util) {
            const url = Cast.toString(args.URL);
            const response = await Scratch.fetch(url);
            const json = await response.arrayBuffer();
            try {
                await Scratch.vm.addSprite(json);
            } catch (e) {
                console.error(e);
            }
        }
        async addCostume(args, util) {
            const targetId = util.target.id;
            const assetName = Cast.toString(args.NAME);
            const res = await Scratch.fetch(args.URL);
            const blob = await res.blob();
            if (!(this._typeIsBitmap(blob.type) || blob.type === "image/svg+xml")) {
                console.error(`Invalid MIME type: ${blob.type}`);
                return;
            }
            const runtime = Scratch.vm.runtime;
            const assetType = this._typeIsBitmap(blob.type)
                ? runtime.storage.AssetType.ImageBitmap
                : runtime.storage.AssetType.ImageVector;
            const dataType =
                blob.type === "image/svg+xml"
                    ? runtime.storage.DataFormat.SVG
                    : runtime.storage.DataFormat.PNG;
            const arrayBuffer = await new Promise((resolve, reject) => {
                const fr = new FileReader();
                fr.onload = () => resolve(fr.result);
                fr.onerror = () =>
                    reject(new Error(`Failed to read as array buffer: ${fr.error}`));
                fr.readAsArrayBuffer(blob);
            });
            const asset = runtime.storage.createAsset(
                assetType,
                dataType,
                new Uint8Array(arrayBuffer),
                null,
                true
            );
            const md5ext = `${asset.assetId}.${asset.dataFormat}`;
            try {
                await Scratch.vm.addCostume(
                    md5ext,
                    {
                        asset,
                        md5ext,
                        name: assetName,
                    },
                    targetId
                );
            } catch (e) {
                console.error(e);
            }
        }
        deleteSprite(args, util) {
            const target = this._getTargetFromMenu(args.TARGET, util);
            if (!target || target.isStage) return;
            Scratch.vm.deleteSprite(target.id);
        }
        deleteCostume(args, util) {
            const target = util.target;
            const costumeName = Cast.toString(args.COSTUME);
            const costumeIndex = target.getCostumeIndexByName(costumeName);
            if (costumeIndex < 0) return;
            if (target.sprite.costumes.length > 0) {
                target.deleteCostume(costumeIndex);
            }
        }
        getAllSprites() {
            const spriteNames = [];
            const targets = Scratch.vm.runtime.targets;
            for (const target of targets) {
                if (target.isOriginal && !target.isStage) {
                    spriteNames.push(target.sprite.name);
                }
            }
            return JSON.stringify(spriteNames);
        }
        getAllCostumes(args, util) {
            const costumeNames = [];
            const costumes = util.target.sprite.costumes;
            for (const costume of costumes) {
                costumeNames.push(costume.name);
            }
            return JSON.stringify(costumeNames);
        }
        getAllSounds(args, util) {
            const soundNames = [];
            const sounds = util.target.sprite.sounds;
            for (const sound of sounds) {
                soundNames.push(sound.name);
            }
            return JSON.stringify(soundNames);
        }
        getSpriteName(args, util) {
            return util.target.sprite.name ?? "";
        }
        _getTargets() {
            const spriteNames = [];
            if (Scratch.vm.editingTarget && !Scratch.vm.editingTarget.isStage) {
                spriteNames.push({
                    text: "myself",
                    value: "_myself_",
                });
            }
            const targets = Scratch.vm.runtime.targets;
            for (let index = 1; index < targets.length; index++) {
                const target = targets[index];
                if (target.isOriginal) {
                    spriteNames.push(target.getName());
                }
            }
            if (spriteNames.length > 0) {
                return spriteNames;
            } else {
                return [""];
            }
        }
        _getTargetFromMenu(targetName, util) {
            let target = Scratch.vm.runtime.getSpriteTargetByName(targetName);
            if (targetName === "_myself_") target = util.target.sprite.clones[0];
            return target;
        }
        _typeIsBitmap(type) {
            return (
                type === "image/png" ||
                type === "image/bmp" ||
                type === "image/jpg" ||
                type === "image/jpeg" ||
                type === "image/jfif" ||
                type === "image/webp" ||
                type === "image/gif"
            );
        }
        labelTools2() {}
        color(args) {
            return args.COLOR;
        }
        returnCount(args) {
            return count;
        }
        incrementCountByNum(args) {
            if (
                count.toString().indexOf("-") === -1 ||
                args.NUM.toString().indexOf("-") === -1
            ) {
                count += Math.floor(args.NUM);
            } else {
                count = 0;
            }
        }
        decrementCountByNum(args) {
            if ((count - Math.floor(args.NUM)).toString().indexOf("-") === -1) {
                count -= Math.floor(args.NUM);
            } else {
                count = 0;
            }
        }
        setCount(args) {
            if (
                count.toString().indexOf("-") === -1 &&
                args.NUM.toString().indexOf("-") === -1
            ) {
                count = Math.floor(args.NUM);
            } else {
                count = 0;
            }
        }
        repeatTxtTimes(args) {
            return Cast.toString(args.TEXT).repeat(Math.floor(args.NUM));
        }
        jsonParse(args) {
            try {
                const parsed = JSON.parse(args.TEXT);
                if (
                    typeof parsed === "string" ||
                    typeof parsed === "number" ||
                    typeof parsed === "boolean"
                ) {
                    return parsed;
                }
                return Cast.toString(parsed);
            } catch (e) {
                console.error(e);
                return Cast.toString((e && e.message) || e);
            }
        }
        getfps() {
            return fps;
        }
        brightnessByColor({ color }) {
            const { r, g, b } = Scratch.Cast.toRgbColorObject(color);
            return (r * 299 + g * 587 + b * 114) / 1000;
        }

        convertToCase(args) {
            const text = Cast.toString(args.text);
            const caseType = Cast.toString(args.case);
            
            switch (caseType) {
                case 'lowercase':
                    return text.toLowerCase();
                case 'uppercase':
                    return text.toUpperCase();
                case 'sentencecase':
                    return text.replace(/(^|\.\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());
                case 'titlecase':
                    return text.split(/\s+/).map(word => {
                        if (!word) return '';
                        return word[0].toUpperCase() + word.substring(1);
                    }).join(' ');
                case 'exacttitlecase':
                    return text.split(/\s+/).map(word => {
                        if (!word) return '';
                        return word[0].toUpperCase() + word.substring(1).toLowerCase();
                    }).join(' ');
                case 'mixedcase':
                    return text.split('').map((char, index) => {
                        return index % 2 === 0 ? char.toUpperCase() : char.toLowerCase();
                    }).join('');
                case 'randomcase':
                    return text.split('').map(char => {
                        return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
                    }).join('');
                case 'camelcase':
                    return text.split(/\s+/).map((word, index) => {
                        if (!word) return '';
                        if (index === 0) return word.toLowerCase();
                        return word[0].toUpperCase() + word.substring(1).toLowerCase();
                    }).join('');
                default:
                    return text;
            }
        }

        isCase(args) {
            const text = Cast.toString(args.text);
            const caseType = Cast.toString(args.case);
            
            switch (caseType) {
                case 'lowercase':
                    return text.toLowerCase() === text;
                case 'uppercase':
                    return text.toUpperCase() === text;
                case 'sentencecase':
                    return /^[A-Z][^?.!]*(?:[?.!]\s+[A-Z][^?.!]*)*$/.test(text);
                case 'titlecase':
                    return text.split(/\s+/).every(word => {
                        if (!word) return true;
                        return word[0] === word[0].toUpperCase();
                    });
                case 'exacttitlecase':
                    return text.split(/\s+/).every(word => {
                        if (!word) return true;
                        return word[0] === word[0].toUpperCase() && word.substring(1) === word.substring(1).toLowerCase();
                    });
                case 'mixedcase':
                    return !(text.toLowerCase() === text || text.toUpperCase() === text);
                case 'camelcase':
                    return /^[a-z][a-zA-Z0-9]*$/.test(text) && /[A-Z]/.test(text);
                default:
                    return false;
            }
        }

        unicodeOf(args) {
            const char = Cast.toString(args.char);
            if (!char) return '0';
            return char.charCodeAt(0).toString();
        }

        characterFromUnicode(args) {
            const code = Cast.toNumber(args.code);
            return String.fromCharCode(code);
        }

        countCharacters(args) {
            const text = Cast.toString(args.text);
            const char = Cast.toString(args.char);
            
            if (!char) return '0';
            
            let count = 0;
            for (let i = 0; i < text.length; i++) {
                if (text[i] === char) {
                    count++;
                }
            }
            
            return count.toString();
        }

        startsWith(args) {
            const text = Cast.toString(args.text);
            const prefix = Cast.toString(args.prefix);
            return text.startsWith(prefix);
        }

        endsWith(args) {
            const text = Cast.toString(args.text);
            const suffix = Cast.toString(args.suffix);
            return text.endsWith(suffix);
        }
        deleteImage({ SPRITE, COSNAME }) {
            const target = Scratch.vm.runtime.getSpriteTargetByName(SPRITE);
            if (!target) return;
            target.deleteCostume(target.getCostumeIndexByName(COSNAME));
        }
        getLists() {
            const globalLists = Object.values(
                Scratch.vm.runtime.getTargetForStage().variables
            ).filter((x) => x.type === "list");
            const localLists = Scratch.vm.editingTarget
                ? Object.values(Scratch.vm.editingTarget.variables).filter(
                    (x) => x.type === "list"
                )
                : [];
            const uniqueLists = [...new Set([...globalLists, ...localLists])];
            if (uniqueLists.length === 0) {
                return [
                    {
                        text: "请选择一个列表",
                        value: "select a list",
                    },
                ];
            }
            return uniqueLists.map((i) => ({
                text: i.name,
                value: i.id,
            }));
        }
        lookupList(list, util) {
            const byId = util.target.lookupVariableById(list);
            if (byId && byId.type === "list") {
                return byId;
            }
            const byName = util.target.lookupVariableByNameAndType(list, "list");
            if (byName) {
                return byName;
            }
            return null;
        }
        json_valid_return(json) {
            if (typeof json !== "string") {
                return json;
            } else if (
                (json.slice(0, 1) !== "[" || json.slice(-1) !== "]") &&
                (json.slice(0, 1) !== "{" || json.slice(-1) !== "}")
            ) {
                return json;
            } else {
                try {
                    return JSON.parse(json) ?? "";
                } catch {
                    return json;
                }
            }
        }
        _fixInvalidJSONValues(value) {
            if (Number.isNaN(value)) return "NaN";
            if (value === Infinity) return "Infinity";
            if (value === -Infinity) return "-Infinity";
            return value ?? "";
        }
        json_vm_getlist({ list }, util) {
            try {
                const listVariable = this.lookupList(list, util);
                if (listVariable) {
                    return JSON.stringify(listVariable.value);
                }
            } catch (e) {
            }
            return "";
        }
        json_vm_setlist({ list, json }, util) {
            try {
                const listVariable = this.lookupList(list, util);
                if (listVariable) {
                    const array = JSON.parse(json);
                    if (Array.isArray(array)) {
                        const safeArray = array.map((i) => {
                            if (typeof i === "object") return JSON.stringify(i);
                            return this._fixInvalidJSONValues(this.json_valid_return(i));
                        });
                        listVariable.value = safeArray;
                    }
                }
            } catch (e) {
            }
        }
    }
    Scratch.extensions.register(new ningqiCollectExtension());
})(typeof Scratch === 'undefined' ? {} : Scratch);