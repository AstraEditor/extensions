// Name: NTeaseMusic
// ID: NTeaseMusic
// Description: Quickly and easily access NetEase Cloud Music for some analysis.
// By: NTawa<https://space.bilibili.com/3546570106604381>
// License: MIT
class NTeaseMusic {
    constructor() {
        this.info = {
            id: "NTeaseMusic",
            name: "网易云",
            color1: "#ff9b86"
        };

        this._logoSVG = 'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="280 260 400 400">' +
            '<path d="M582.33374,305.09018c-24.85132,-18.68584 -54.68458,-20.93356 -74.96054,4.5836c-1.09378,1.3765 -1.75478,2.6511 -4.3198,7.73354c-1.2837,3.61806 -1.55586,5.56948 -2.02306,10.08956c-0.37658,3.80662 1.57784,14.4515 2.26182,17.0966c23.13942,89.48454 15.53198,58.97038 23.038,91.1336c0.46338,1.98566 2.74866,6.48722 5.7161,18.5494c7.61056,19.02684 11.30032,58.50424 -34.63228,73.82112c-1.8949,0.71018 -11.62558,1.49234 -13.76108,1.1881c-41.9781,-5.98038 -51.72274,-36.01318 -52.8774,-62.14632c0.47652,-39.83196 29.81856,-74.19196 83.23888,-80.51886c4.1023,-2.31982 120.76706,-6.57336 122.7051,122.74632c-1.5614,12.4396 -9.26078,120.81284 -150.25674,130.13162c-90.12876,2.366 -160.4274,-76.18984 -162.966,-153.853c-4.83996,-117.13694 72.91108,-160.66076 98.65068,-169.75388" fill="none" stroke="#ffffff" stroke-width="60" stroke-linecap="round" stroke-miterlimit="10"/>' +
            '<path d="M582.33374,305.09018c-24.85132,-18.68584 -54.68458,-20.93356 -74.96054,4.5836c-1.09378,1.3765 -1.75478,2.6511 -4.3198,7.73354c-1.2837,3.61806 -1.55586,5.56948 -2.02306,10.08956c-0.37658,3.80662 1.57784,14.4515 2.26182,17.0966c23.13942,89.48454 15.53198,58.97038 23.038,91.1336c0.46338,1.98566 2.74866,6.48722 5.7161,18.5494c7.61056,19.02684 11.30032,58.50424 -34.63228,73.82112c-1.8949,0.71018 -11.62558,1.49234 -13.76108,1.1881c-41.9781,-5.98038 -51.72274,-36.01318 -52.8774,-62.14632c0.47652,-39.83196 29.81856,-74.19196 83.23888,-80.51886c4.1023,-2.31982 120.76706,-6.57336 122.7051,122.74632c-1.5614,12.4396 -9.26078,120.81284 -150.25674,130.13162c-90.12876,2.366 -160.4274,-76.18984 -162.966,-153.853c-4.83996,-117.13694 72.91108,-160.66076 98.65068,-169.75388" fill="none" stroke="#ff866e" stroke-width="36" stroke-linecap="round" stroke-miterlimit="10"/>' +
            '</svg>'
        );

        this.audio = null;
        this.audioContext = null;
        this.analyser = null;
        this.sourceNode = null;
        this.frequencyData = null;
        this.timeDomainData = null;
        this.gainNode = null;
        this.currentFftSize = 256;
        this.timeDecimalPlaces = 2;
    }

    // ==================== 通用工具 ====================
    _formatTime(seconds) {
        const s = Number(seconds);
        if (isNaN(s)) return 0;
        return parseFloat(s.toFixed(this.timeDecimalPlaces));
    }

    _getNestedValue(obj, path) {
        if (!obj || !path) return undefined;
        const parts = path.split(".");
        let current = obj;
        for (const part of parts) {
            if (current === null || current === undefined) return undefined;
            if (Array.isArray(current) && /^\d+$/.test(part)) {
                current = current[Number(part)];
            } else if (typeof current === "object") {
                current = current[part];
            } else {
                return undefined;
            }
        }
        return current;
    }

    static _extractUrlFromJson(obj, maxDepth = 5) {
        if (maxDepth <= 0 || obj === null || obj === undefined) return "";
        if (typeof obj === "string") {
            return /^https?:\/\/.+/.test(obj.trim()) ? obj.trim() : "";
        }
        if (Array.isArray(obj)) {
            for (const item of obj) {
                const found = NTeaseMusic._extractUrlFromJson(item, maxDepth - 1);
                if (found) return found;
            }
            return "";
        }
        if (typeof obj === "object") {
            const priorityKeys = ["url", "playUrl", "song_url", "musicUrl", "src", "link", "uri", "downloadUrl"];
            for (const key of priorityKeys) {
                if (obj[key] && typeof obj[key] === "string" && /^https?:\/\/.+/.test(obj[key].trim())) {
                    return obj[key].trim();
                }
            }
            for (const key in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
                const found = NTeaseMusic._extractUrlFromJson(obj[key], maxDepth - 1);
                if (found) return found;
            }
        }
        return "";
    }

    static async _fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const resp = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timer);
            return resp;
        } catch (e) {
            clearTimeout(timer);
            throw e;
        }
    }

    getInfo() {
        return {
            ...this.info,
            menuIconURI: this._logoSVG,
            blocks: [
                { opcode: 'sepSearch', blockType: Scratch.BlockType.LABEL, text: '搜索与推荐' },
                {
                    opcode: "searchMusic", blockType: Scratch.BlockType.REPORTER,
                    text: "搜索 [STR] 类型 [TYPE] 数量 [NUM]",
                    arguments: {
                        STR: { type: Scratch.ArgumentType.STRING, defaultValue: "Nevada" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "searchTypeMenu" },
                        NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 }
                    }
                },
                {
                    opcode: "getSearchSuggest", blockType: Scratch.BlockType.REPORTER,
                    text: "搜索建议 [STR]",
                    arguments: { STR: { type: Scratch.ArgumentType.STRING, defaultValue: "Nevada" } }
                },
                {
                    opcode: "getDailyRecommend", blockType: Scratch.BlockType.REPORTER,
                    text: "每日推荐 [TYPE]",
                    arguments: { TYPE: { type: Scratch.ArgumentType.STRING, menu: "dailyRecommendMenu" } }
                },
                {
                    opcode: "getNewSongs", blockType: Scratch.BlockType.REPORTER,
                    text: "新歌速递 [TYPE] 地区 [AREA]",
                    arguments: {
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "newSongInfoMenu" },
                        AREA: { type: Scratch.ArgumentType.STRING, menu: "areaMenu" }
                    }
                },
                {
                    opcode: "getResultInfo", blockType: Scratch.BlockType.REPORTER,
                    text: "[STR] 中的 [TYPE]",
                    arguments: {
                        STR: { type: Scratch.ArgumentType.STRING, defaultValue: "搜索结果" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "resultInfoMenu" }
                    }
                },

                { opcode: 'sepSongInfo', blockType: Scratch.BlockType.LABEL, text: '歌曲与歌手信息' },
                {
                    opcode: "getSongDetail", blockType: Scratch.BlockType.REPORTER,
                    text: "获取歌曲 [ID] 详情 [TYPE]",
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: "3351299951" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "songDetailMenu" }
                    }
                },
                {
                    opcode: "getSongInfo", blockType: Scratch.BlockType.REPORTER,
                    text: "获取歌曲 [ID] [TYPE] [LEVEL]",
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: "3351299951" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "songInfoMenu" },
                        LEVEL: { type: Scratch.ArgumentType.STRING, menu: "songLevelMenu" }
                    }
                },
                {
                    opcode: "getSimilarSongs", blockType: Scratch.BlockType.REPORTER,
                    text: "歌曲 [ID] 的相似歌曲 [TYPE]",
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: "3351299951" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "similarSongMenu" }
                    }
                },
                {
                    opcode: "getArtistDetailJSON", blockType: Scratch.BlockType.REPORTER,
                    text: "获取歌手 [ID] 完整JSON",
                    arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "1007170" } }
                },
                {
                    opcode: "getArtistInfo", blockType: Scratch.BlockType.REPORTER,
                    text: "歌手JSON [JSON] 中的 [TYPE]",
                    arguments: {
                        JSON: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "artistInfoMenu" }
                    }
                },

                { opcode: 'sepAlbum', blockType: Scratch.BlockType.LABEL, text: '专辑' },
                {
                    opcode: "getAlbumDetailJSON", blockType: Scratch.BlockType.REPORTER,
                    text: "获取专辑 [ID] 完整JSON",
                    arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "350069603" } }
                },
                {
                    opcode: "getAlbumInfo", blockType: Scratch.BlockType.REPORTER,
                    text: "专辑JSON [JSON] 中的 [TYPE]",
                    arguments: {
                        JSON: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "albumDetailMenu" }
                    }
                },

                { opcode: 'sepMV', blockType: Scratch.BlockType.LABEL, text: 'MV' },
                {
                    opcode: "getMVDetailJSON", blockType: Scratch.BlockType.REPORTER,
                    text: "获取MV [ID] 完整JSON",
                    arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "34748786" } }
                },
                {
                    opcode: "getMVInfo", blockType: Scratch.BlockType.REPORTER,
                    text: "MV JSON [JSON] 中的 [TYPE]",
                    arguments: {
                        JSON: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "mvDetailMenu" }
                    }
                },

                { opcode: 'sepPlaylist', blockType: Scratch.BlockType.LABEL, text: '歌单' },
                {
                    opcode: "getPlaylistDetailJSON", blockType: Scratch.BlockType.REPORTER,
                    text: "获取歌单 [ID] 完整JSON",
                    arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "2222077236" } }
                },
                {
                    opcode: "getPlaylistInfo", blockType: Scratch.BlockType.REPORTER,
                    text: "歌单JSON [JSON] 中的 [TYPE]",
                    arguments: {
                        JSON: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "playlistInfoMenu" }
                    }
                },

                { opcode: 'sepUser', blockType: Scratch.BlockType.LABEL, text: '用户' },
                {
                    opcode: "getUserDetailJSON", blockType: Scratch.BlockType.REPORTER,
                    text: "获取用户 [ID] 详情JSON",
                    arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "1" } }
                },
                // ★ 拆分1: 获取用户歌单完整JSON
                {
                    opcode: "getUserPlaylistJSON", blockType: Scratch.BlockType.REPORTER,
                    text: "获取用户 [ID] 歌单JSON",
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: "1" }
                    }
                },
                // ★ 拆分2: 解析用户歌单JSON
                {
                    opcode: "parseUserPlaylist", blockType: Scratch.BlockType.REPORTER,
                    text: "用户歌单JSON [JSON] 中的 [TYPE]",
                    arguments: {
                        JSON: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "userPlaylistParseMenu" }
                    }
                },
                {
                    opcode: "getUserInfo", blockType: Scratch.BlockType.REPORTER,
                    text: "用户JSON [JSON] 中的 [TYPE]",
                    arguments: {
                        JSON: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "userInfoMenu" }
                    }
                },

                { opcode: 'sepComment', blockType: Scratch.BlockType.LABEL, text: '评论' },
                {
                    opcode: "getHotComments", blockType: Scratch.BlockType.REPORTER,
                    text: "获取 [TYPE_ID] [ID] 的热评 [INFO] 数量 [NUM]",
                    arguments: {
                        TYPE_ID: { type: Scratch.ArgumentType.STRING, menu: "commentTypeMenu" },
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: "3351299951" },
                        INFO: { type: Scratch.ArgumentType.STRING, menu: "commentInfoMenu" },
                        NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
                    }
                },

                { opcode: 'sepLyric', blockType: Scratch.BlockType.LABEL, text: '歌词' },
                {
                    opcode: "getLyricInfo", blockType: Scratch.BlockType.REPORTER,
                    text: "获取歌词 [ID] [TYPE]",
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: "26092806" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "lyricInfoMenu" }
                    }
                },
                {
                    opcode: "parseLyric", blockType: Scratch.BlockType.REPORTER,
                    text: "歌词 [STR] 中的 [TYPE]",
                    arguments: {
                        STR: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "lyricParseMenu" }
                    }
                },
                {
                    opcode: "getLyricLine", blockType: Scratch.BlockType.REPORTER,
                    text: "歌词 [STR] 第 [N] 句的 [TYPE]",
                    arguments: {
                        STR: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "lyricLineMenu" }
                    }
                },
                {
                    opcode: "getYrcLineInfo", blockType: Scratch.BlockType.REPORTER,
                    text: "逐字歌词 [STR] 第 [N] 行的 [TYPE]",
                    arguments: {
                        STR: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "yrcLineInfoMenu" }
                    }
                },
                {
                    opcode: "getYrcWordInfo", blockType: Scratch.BlockType.REPORTER,
                    text: "逐字歌词 [STR] 第 [N] 行第 [M] 个字的 [TYPE]",
                    arguments: {
                        STR: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
                        N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                        M: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                        TYPE: { type: Scratch.ArgumentType.STRING, menu: "yrcWordInfoMenu" }
                    }
                },

                { opcode: 'sepTime', blockType: Scratch.BlockType.LABEL, text: '时间与时间戳' },
                {
                    opcode: "timeToSeconds", blockType: Scratch.BlockType.REPORTER,
                    text: "时间 [TIME] 转秒",
                    arguments: { TIME: { type: Scratch.ArgumentType.STRING, defaultValue: "03:45.50" } }
                },
                {
                    opcode: "secondsToTime", blockType: Scratch.BlockType.REPORTER,
                    text: "秒 [SECONDS] 转时间",
                    arguments: { SECONDS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 225.5 } }
                },
                {
                    opcode: "getTimestampInfo", blockType: Scratch.BlockType.REPORTER,
                    text: "时间戳 [TIME] 的 [INFO]",
                    arguments: {
                        TIME: { type: Scratch.ArgumentType.STRING, defaultValue: "1777593600" },
                        INFO: { type: Scratch.ArgumentType.STRING, menu: "timestampInfoMenu" }
                    }
                },

                { opcode: 'sepArray', blockType: Scratch.BlockType.LABEL, text: 'JSON相关' },
                {
                    opcode: "getArrayItem", blockType: Scratch.BlockType.REPORTER,
                    text: "[OBJECT] 的第 [N] 项",
                    arguments: {
                        OBJECT: { type: Scratch.ArgumentType.STRING, defaultValue: "[1,2,3]" },
                        N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                    }
                },
                {
                    opcode: "getArrayLength", blockType: Scratch.BlockType.REPORTER,
                    text: "[OBJECT] 的项目数",
                    arguments: { OBJECT: { type: Scratch.ArgumentType.STRING, defaultValue: "[1,2,3]" } }
                },
                {
                    opcode: "getListAsArray", blockType: Scratch.BlockType.REPORTER,
                    text: "[LIST] 列表转数组", disableMonitor: true,
                    arguments: { LIST: { type: Scratch.ArgumentType.STRING, menu: "listMenu" } }
                },
                {
                    opcode: "setListFromArray", blockType: Scratch.BlockType.COMMAND,
                    text: "将列表 [LIST] 设为数组 [JSON]",
                    arguments: {
                        LIST: { type: Scratch.ArgumentType.STRING, menu: "listMenu" },
                        JSON: { type: Scratch.ArgumentType.STRING, defaultValue: '[1, 2, 3]' }
                    }
                },

                { opcode: 'sepPlayer', blockType: Scratch.BlockType.LABEL, text: '播放相关' },
                {
                    opcode: 'loadAudio', blockType: Scratch.BlockType.COMMAND,
                    text: '加载 [URL]',
                    arguments: { URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://music.163.com/song/media/outer/url?id=3351299951' } }
                },
                { opcode: 'playAudio', blockType: Scratch.BlockType.COMMAND, text: '播放' },
                { opcode: 'pauseAudio', blockType: Scratch.BlockType.COMMAND, text: '暂停' },
                { opcode: 'stopAudio', blockType: Scratch.BlockType.COMMAND, text: '停止' },
                {
                    opcode: 'setPlaybackRate', blockType: Scratch.BlockType.COMMAND,
                    text: '设置播放倍速 [SPEED]x',
                    arguments: { SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1.0 } }
                },
                {
                    opcode: 'seekToTime', blockType: Scratch.BlockType.COMMAND,
                    text: '跳转到 [TIME] 秒',
                    arguments: { TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 } }
                },
                {
                    opcode: 'setVolume', blockType: Scratch.BlockType.COMMAND,
                    text: '设置音量 [VOLUME]%',
                    arguments: { VOLUME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 } }
                },
                {
                    opcode: 'setTimeDecimalPlaces', blockType: Scratch.BlockType.COMMAND,
                    text: '播放时间小数位数设为 [NUM]',
                    arguments: { NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 } }
                },
                {
                    opcode: 'checkUrlValid', blockType: Scratch.BlockType.BOOLEAN,
                    text: "链接 [URL] 有效？",
                    arguments: { URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https://music.163.com" } }
                },
                { opcode: 'getPlaybackRate', blockType: Scratch.BlockType.REPORTER, text: '当前播放倍速' },
                { opcode: 'getCurrentTime', blockType: Scratch.BlockType.REPORTER, text: '当前播放时长' },
                { opcode: 'getDuration', blockType: Scratch.BlockType.REPORTER, text: '总时长' },
                { opcode: 'getVolume', blockType: Scratch.BlockType.REPORTER, text: '当前音量' },
                { opcode: 'getTimeDecimalPlaces', blockType: Scratch.BlockType.REPORTER, text: '播放时间小数位数' },
                { opcode: 'isPlaying', blockType: Scratch.BlockType.BOOLEAN, text: '正在播放？' },

                { opcode: 'sepSpectrum', blockType: Scratch.BlockType.LABEL, text: '频谱分析' },
                {
                    opcode: 'getFrequencyDomain', blockType: Scratch.BlockType.REPORTER,
                    text: '频率域 [NUM]',
                    arguments: { NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 128 } }
                },
                {
                    opcode: 'getWaveform', blockType: Scratch.BlockType.REPORTER,
                    text: '时域波形 [NUM]',
                    arguments: { NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 128 } }
                },
                {
                    opcode: 'getFrequencyAt', blockType: Scratch.BlockType.REPORTER,
                    text: '频率索引 [INDEX] 的值',
                    arguments: { INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } }
                },
                { opcode: 'getAverageVolume', blockType: Scratch.BlockType.REPORTER, text: '平均音量' }
            ],
            menus: {
                searchTypeMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "单曲", value: "1" }, { text: "专辑", value: "10" },
                        { text: "歌手", value: "100" }, { text: "歌单", value: "1000" },
                        { text: "用户", value: "1002" }, { text: "MV", value: "1014" },
                        { text: "歌词", value: "1006" }, { text: "主播电台", value: "1009" }
                    ]
                },
                dailyRecommendMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "名", value: "name" }, { text: "ID", value: "id" },
                        { text: "fee", value: "fee" }, { text: "作者名", value: "artistName" },
                        { text: "作者ID", value: "artistId" }, { text: "所在专辑名", value: "albumName" },
                        { text: "所在专辑ID", value: "albumId" }, { text: "封面", value: "coverUrl" },
                        { text: "时长", value: "duration" }
                    ]
                },
                newSongInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "名", value: "name" }, { text: "ID", value: "id" },
                        { text: "作者名", value: "artistName" }, { text: "作者ID", value: "artistId" },
                        { text: "专辑名", value: "albumName" }, { text: "封面", value: "coverUrl" },
                        { text: "时长", value: "duration" }, { text: "fee", value: "fee" }
                    ]
                },
                areaMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "全部", value: "0" }, { text: "华语", value: "7" },
                        { text: "欧美", value: "96" }, { text: "日本", value: "8" },
                        { text: "韩国", value: "16" }
                    ]
                },
                resultInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "名", value: "name" }, { text: "ID", value: "id" },
                        { text: "作者名", value: "artistName" }, { text: "作者ID", value: "artistId" },
                        { text: "翻译名数组", value: "tns" }, { text: "fee", value: "fee" }
                    ]
                },
                songDetailMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "名", value: "name" }, { text: "作者", value: "artistName" },
                        { text: "作者ID", value: "artistId" }, { text: "所属专辑", value: "albumName" },
                        { text: "所属专辑ID", value: "albumId" }, { text: "封面", value: "coverUrl" }
                    ]
                },
                artistInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "名", value: "name" }, { text: "别名数组", value: "alias" },
                        { text: "粉丝数", value: "fansCount" }, { text: "歌曲数", value: "musicSize" },
                        { text: "MV数", value: "mvSize" }, { text: "简介", value: "briefDesc" },
                        { text: "头像", value: "picUrl" }
                    ]
                },
                songInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "URL-1", value: "url1" }, { text: "URL-2", value: "url2" },
                        { text: "URL-3", value: "url3" }, { text: "URL-4", value: "url4" }
                    ]
                },
                similarSongMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "名", value: "name" }, { text: "ID", value: "id" },
                        { text: "专辑", value: "albumName" }, { text: "专辑ID", value: "albumId" },
                        { text: "作者", value: "artistName" }, { text: "作者ID", value: "artistId" },
                        { text: "作者头像URL", value: "artistAvatar" }
                    ]
                },
                albumDetailMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "名", value: "name" }, { text: "创建者", value: "artistName" },
                        { text: "创建者ID", value: "artistId" }, { text: "所有歌曲名", value: "songNames" },
                        { text: "所有歌曲ID", value: "songIds" }, { text: "创建时间", value: "publishTime" }
                    ]
                },
                mvDetailMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "名", value: "name" }, { text: "创建者", value: "artistName" },
                        { text: "创建者ID", value: "artistId" }, { text: "简介", value: "desc" },
                        { text: "封面", value: "coverUrl" }, { text: "播放数", value: "playCount" },
                        { text: "点赞数", value: "likeCount" }, { text: "分享数", value: "shareCount" },
                        { text: "评论数", value: "commentCount" }, { text: "上传时间", value: "publishTime" },
                        { text: "画质数组", value: "resolutions" }, { text: "播放直链数组", value: "videoUrls" },
                        { text: "评论ID", value: "commentThreadId" }
                    ]
                },
                playlistInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "简介", value: "description" }, { text: "创建时间", value: "createTime" },
                        { text: "标签", value: "tags" }, { text: "歌曲名", value: "trackNames" },
                        { text: "歌曲ID", value: "trackIds" }, { text: "创建者", value: "creatorName" },
                        { text: "创建者ID", value: "creatorId" }
                    ]
                },
                // ★ 新增：用户歌单解析菜单
                userPlaylistParseMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "歌单数组", value: "names" },
                        { text: "歌单ID数组", value: "ids" },
                        { text: "歌单创建者数组", value: "creators" },
                        { text: "歌单创建者ID数组", value: "creatorIds" },
                        { text: "歌单创建时间数组", value: "createTimes" },
                        { text: "歌单JSON数组", value: "jsonArray" },
                        { text: "歌单数量", value: "count" }
                    ]
                },
                userInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "昵称", value: "nickname" }, { text: "签名", value: "signature" },
                        { text: "头像", value: "avatarUrl" }, { text: "背景图", value: "backgroundUrl" },
                        { text: "性别", value: "gender" }, { text: "等级", value: "level" },
                        { text: "粉丝数", value: "followeds" }, { text: "关注数", value: "follows" },
                        { text: "动态数", value: "eventCount" }, { text: "歌单名数组", value: "playlistNames" },
                        { text: "歌单ID数组", value: "playlistIds" }, { text: "歌单封面数组", value: "playlistCovers" }
                    ]
                },
                commentTypeMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "歌曲", value: "R_SO_4_" },
                        { text: "专辑", value: "R_AL_3_" },
                        { text: "歌单", value: "R_PL_0_" },
                        { text: "MV", value: "A_PL_0_" }
                    ]
                },
                commentInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "内容", value: "content" }, { text: "用户名", value: "nickname" },
                        { text: "点赞数", value: "likedCount" }, { text: "时间", value: "time" }
                    ]
                },
                songLevelMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "标准", value: "standard" }, { text: "较高", value: "higher" },
                        { text: "极高", value: "exhigh" }, { text: "无损", value: "lossless" },
                        { text: "Hi-Res", value: "hires" }, { text: "高清环绕声", value: "jyeffect" },
                        { text: "沉浸环绕声", value: "sky" }, { text: "杜比全景声", value: "dolby" },
                        { text: "超清母带", value: "jymaster" }
                    ]
                },
                lyricInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "歌词", value: "json.lrc.lyric" }, { text: "翻译歌词", value: "tlyric" },
                        { text: "逐字歌词", value: "json.yrc.lyric" }, { text: "歌词更新时间", value: "uptime" },
                        { text: "歌词提交者", value: "nickname" }, { text: "歌词提交者ID", value: "userid" }
                    ]
                },
                lyricParseMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "歌词数组", value: "lyrics" }, { text: "时间数组", value: "times" },
                        { text: "时间数组-秒", value: "timesSec" }
                    ]
                },
                lyricLineMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "歌词", value: "lyric" }, { text: "时间", value: "time" },
                        { text: "时间-秒", value: "timeSec" }
                    ]
                },
                yrcLineInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "完整文本", value: "text" }, { text: "开始时间-秒", value: "timeSec" },
                        { text: "持续时间-秒", value: "durationSec" }, { text: "字数", value: "wordCount" },
                        { text: "逐字详情JSON", value: "wordsJson" }
                    ]
                },
                yrcWordInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "文本", value: "text" }, { text: "开始时间-秒", value: "timeSec" },
                        { text: "持续时间-秒", value: "durationSec" }
                    ]
                },
                timestampInfoMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "时间", value: "datetime" }, { text: "年", value: "year" },
                        { text: "月", value: "month" }, { text: "日", value: "day" },
                        { text: "时", value: "hour" }, { text: "分", value: "minute" },
                        { text: "秒", value: "second" }
                    ]
                },
                listMenu: { acceptReporters: true, items: "_getListMenuItems" }
            }
        };
    }

    // ==================== 播放时间小数位数 ====================
    setTimeDecimalPlaces(args) {
        let num = Math.round(Number(args.NUM));
        if (isNaN(num)) num = 2;
        this.timeDecimalPlaces = Math.max(0, Math.min(6, num));
    }
    getTimeDecimalPlaces() { return this.timeDecimalPlaces; }

    // ==================== 新歌速递 ====================
    async getNewSongs(args) {
        const type = String(args.TYPE || "name").trim();
        const area = String(args.AREA || "0").trim();
        try {
            const url = `https://music.163.com/api/discovery/new/songs?type=${encodeURIComponent(area)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            const dataList = json?.data;
            if (!Array.isArray(dataList)) return JSON.stringify([]);
            const result = [];
            for (const entry of dataList) {
                if (!entry) continue;
                const song = entry.song || entry;
                let val;
                switch (type) {
                    case "name": val = song.name; break;
                    case "id": val = song.id; break;
                    case "artistName":
                        val = Array.isArray(song.ar) ? song.ar.map(a => a.name).filter(n => n).join(" / ") : "";
                        break;
                    case "artistId":
                        val = Array.isArray(song.ar) ? JSON.stringify(song.ar.map(a => a.id).filter(i => i != null)) : "[]";
                        break;
                    case "albumName": val = song.al?.name; break;
                    case "coverUrl": val = song.al?.picUrl; break;
                    case "duration": val = song.dt; break;
                    case "fee": val = song.fee; break;
                    default: val = song.name;
                }
                if (val !== undefined && val !== null && val !== "") result.push(val);
            }
            return JSON.stringify(result);
        } catch (e) { return JSON.stringify([]); }
    }

    // ==================== 歌曲播放链接 ====================
    async getSongInfo(args) {
        const id = String(args.ID || "").trim();
        const type = String(args.TYPE || "url1").trim();
        const level = String(args.LEVEL || "lossless").trim();
        if (!id) return "";

        const sources = {
            url1: {
                urls: [
                    `http://118.24.104.108:3456/api.php?miss=getMusicUrl&id=${encodeURIComponent(id)}&level=${encodeURIComponent(level)}`,
                    `https://proxy.zhuzhan.dpdns.org/http://118.24.104.108:3456/api.php?miss=getMusicUrl&id=${encodeURIComponent(id)}&level=${encodeURIComponent(level)}`
                ],
                keys: ["data.0.url", "data.url", "data.musicUrl", "url", "musicUrl", "data.playUrl"]
            },
            url2: {
                urls: [
                    `https://music.rrvenn.cn/song?url=${encodeURIComponent(id)}&level=${encodeURIComponent(level)}&type=json`,
                    `https://proxy.zhuzhan.dpdns.org/https://music.rrvenn.cn/song?url=${encodeURIComponent(id)}&level=${encodeURIComponent(level)}&type=json`
                ],
                keys: ["data.url", "url", "data.playUrl", "data.musicUrl", "song_url"]
            },
            url3: {
                urls: [
                    `https://music.rrvenn.cn/api/api.php?action=music&url=${encodeURIComponent(id)}&level=${encodeURIComponent(level)}`,
                    `https://proxy.zhuzhan.dpdns.org/https://music.rrvenn.cn/api/api.php?action=music&url=${encodeURIComponent(id)}&level=${encodeURIComponent(level)}`
                ],
                keys: ["url", "data.url", "song_url", "data.playUrl", "musicUrl", "data.musicUrl"]
            },
            url4: {
                urls: [
                    `https://proxy.zhuzhan.dpdns.org/api/music/detail/${encodeURIComponent(id)}?level=${encodeURIComponent(level)}`
                ],
                keys: ["song_data.url", "data.url", "url", "data.playUrl"]
            }
        };

        const source = sources[type];
        if (!source) return "";

        for (const apiUrl of source.urls) {
            try {
                const response = await NTeaseMusic._fetchWithTimeout(apiUrl, {}, 10000);
                if (!response.ok) continue;
                const json = await response.json();
                if (!json || typeof json !== "object") continue;
                for (const keyPath of source.keys) {
                    const val = this._getNestedValue(json, keyPath);
                    if (typeof val === "string" && /^https?:\/\/.+/.test(val.trim())) return val.trim();
                }
                const fallbackUrl = NTeaseMusic._extractUrlFromJson(json);
                if (fallbackUrl) return fallbackUrl;
            } catch (e) { continue; }
        }
        return "";
    }

    // ==================== 专辑 ====================
    async getAlbumDetailJSON(args) {
        const id = String(args.ID || "").trim();
        if (!id || isNaN(Number(id))) return "";
        try {
            const url = `https://music.163.com/api/v1/album/${encodeURIComponent(id)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object") return "";
            return JSON.stringify(json);
        } catch (e) { return ""; }
    }

    getAlbumInfo(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw) return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "name").trim();
            const album = json?.album;
            if (!album) return "";
            switch (type) {
                case "name": return album.name || "";
                case "artistName":
                    if (album.artist?.name) return album.artist.name;
                    if (Array.isArray(json.songs) && json.songs.length > 0) {
                        const ar = json.songs[0].ar;
                        if (Array.isArray(ar) && ar.length > 0) return ar.map(a => a.name).filter(n => n).join(" / ");
                    }
                    return "";
                case "artistId":
                    if (album.artist?.id != null) return String(album.artist.id);
                    if (Array.isArray(json.songs) && json.songs.length > 0) {
                        const ar = json.songs[0].ar;
                        if (Array.isArray(ar) && ar.length > 0) return JSON.stringify(ar.map(a => a.id).filter(i => i != null));
                    }
                    return "";
                case "songNames": {
                    const songs = Array.isArray(json.songs) ? json.songs : [];
                    return JSON.stringify(songs.map(s => s.name).filter(n => n !== undefined && n !== null && n !== ""));
                }
                case "songIds": {
                    const songs = Array.isArray(json.songs) ? json.songs : [];
                    return JSON.stringify(songs.map(s => s.id).filter(i => i != null));
                }
                case "publishTime": return album.publishTime ?? "";
                default: return "";
            }
        } catch (e) { return ""; }
    }

    // ==================== MV ====================
    async getMVDetailJSON(args) {
        const id = String(args.ID || "").trim();
        if (!id || isNaN(Number(id))) return "";
        try {
            const url = `https://music.163.com/api/mv/detail?id=${encodeURIComponent(id)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object") return "";
            return JSON.stringify(json);
        } catch (e) { return ""; }
    }

    getMVInfo(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw) return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "name").trim();
            const mv = json?.data;
            if (!mv) return "";
            switch (type) {
                case "name": return mv.name || "";
                case "artistName":
                    if (Array.isArray(mv.artists) && mv.artists.length > 0) return mv.artists.map(a => a.name).filter(n => n).join(" / ");
                    return mv.artistName || "";
                case "artistId":
                    if (Array.isArray(mv.artists) && mv.artists.length > 0) return JSON.stringify(mv.artists.map(a => a.id).filter(i => i != null));
                    return mv.artistId != null ? String(mv.artistId) : "";
                case "desc": return mv.desc || mv.briefDesc || "";
                case "coverUrl": return mv.cover || mv.coverUrl || "";
                case "playCount": return mv.playCount ?? "";
                case "likeCount": return mv.likeCount ?? mv.praisedCount ?? "";
                case "shareCount": return mv.shareCount ?? "";
                case "commentCount": return mv.commentCount ?? "";
                case "publishTime": return mv.publishTime || "";
                case "resolutions": {
                    const brs = mv.brs;
                    return brs && typeof brs === "object"
                        ? JSON.stringify(Object.keys(brs).map(k => Number(k)).sort((a, b) => b - a))
                        : JSON.stringify([]);
                }
                case "videoUrls": {
                    const brs = mv.brs;
                    if (brs && typeof brs === "object") {
                        const sortedKeys = Object.keys(brs).map(k => Number(k)).sort((a, b) => b - a);
                        return JSON.stringify(sortedKeys.map(k => brs[String(k)]).filter(u => u));
                    }
                    return JSON.stringify([]);
                }
                case "commentThreadId": return mv.commentThreadId || "";
                default: return "";
            }
        } catch (e) { return ""; }
    }

    // ==================== 歌手 ====================
    async getArtistDetailJSON(args) {
        const id = String(args.ID || "").trim();
        if (!id || isNaN(Number(id))) return "";
        try {
            const url = `https://music.163.com/api/artist/${encodeURIComponent(id)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object") return "";
            return JSON.stringify(json);
        } catch (e) { return ""; }
    }

    getArtistInfo(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw) return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "name").trim();
            const artist = json?.artist;
            if (!artist) return "";
            switch (type) {
                case "name": return artist.name || "";
                case "alias": return JSON.stringify(Array.isArray(artist.alias) ? artist.alias : []);
                case "fansCount": return artist.fansCount ?? "";
                case "musicSize": return artist.musicSize ?? "";
                case "mvSize": return artist.mvSize ?? "";
                case "briefDesc": return artist.briefDesc || "";
                case "picUrl": return artist.picUrl || "";
                default: return "";
            }
        } catch (e) { return ""; }
    }

    // ==================== 歌单详情 ====================
    async getPlaylistDetailJSON(args) {
        const id = String(args.ID || "2222077236").trim();
        if (!id) return "";
        try {
            const detailUrl = `https://music.163.com/api/v6/playlist/detail?id=${encodeURIComponent(id)}&n=1000`;
            const detailResp = await NTeaseMusic._fetchWithTimeout(detailUrl);
            const detailJson = await detailResp.json();
            const playlist = detailJson?.playlist;
            if (!playlist) return "";

            const trackIdsArr = Array.isArray(playlist.trackIds) ? playlist.trackIds : [];
            let allSongs = [];
            if (trackIdsArr.length > 0) {
                const ids = trackIdsArr.map(t => t.id).filter(i => i != null);
                const BATCH_SIZE = 500;
                for (let i = 0; i < ids.length; i += BATCH_SIZE) {
                    const batch = ids.slice(i, i + BATCH_SIZE);
                    const songUrl = `https://music.163.com/api/song/detail?ids=${encodeURIComponent(batch.join(","))}`;
                    const songResp = await NTeaseMusic._fetchWithTimeout(songUrl);
                    const songJson = await songResp.json();
                    const songs = Array.isArray(songJson?.songs) ? songJson.songs : [];
                    allSongs.push(...songs);
                }
            }

            const result = { playlist: playlist, songs: allSongs };
            return JSON.stringify(result);
        } catch (e) { return ""; }
    }

    // ★ 兼容歌单详情JSON和用户歌单JSON
    getPlaylistInfo(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw) return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "description").trim();

            // 兼容: 用户歌单列表JSON (/api/user/playlist)
            if (Array.isArray(json?.playlist)) {
                const firstPlaylist = json.playlist[0];
                if (!firstPlaylist) return "";
                switch (type) {
                    case "description": return firstPlaylist.description || "";
                    case "createTime": return firstPlaylist.createTime || "";
                    case "tags": return JSON.stringify(Array.isArray(firstPlaylist.tags) ? firstPlaylist.tags : []);
                    case "creatorName": return firstPlaylist.creator?.nickname || "";
                    case "creatorId": return firstPlaylist.creator?.userId ?? "";
                    case "trackNames": return JSON.stringify([]);
                    case "trackIds": return JSON.stringify([]);
                    default: return "";
                }
            }

            // 兼容: 歌单详情JSON (/api/v6/playlist/detail)
            const playlist = json?.playlist;
            if (!playlist || typeof playlist !== "object") return "";

            switch (type) {
                case "description": return playlist.description || "";
                case "createTime": return playlist.createTime || "";
                case "tags": return JSON.stringify(Array.isArray(playlist.tags) ? playlist.tags : []);
                case "creatorName": return playlist.creator?.nickname || "";
                case "creatorId": return playlist.creator?.userId ?? "";
            }

            const trackIdsArr = Array.isArray(playlist.trackIds) ? playlist.trackIds : [];
            const songs = Array.isArray(json.songs) ? json.songs : [];
            const songMap = new Map();
            for (const s of songs) { if (s && s.id != null) songMap.set(s.id, s); }
            const orderedSongs = trackIdsArr.map(t => songMap.get(t.id)).filter(Boolean);

            switch (type) {
                case "trackNames":
                    return JSON.stringify(orderedSongs.map(s => s.name).filter(n => n !== undefined && n !== null && n !== ""));
                case "trackIds":
                    return JSON.stringify(orderedSongs.map(s => s.id).filter(i => i != null));
                default: return "";
            }
        } catch (e) { return ""; }
    }

    // ==================== 用户详情JSON ====================
    async getUserDetailJSON(args) {
        const id = String(args.ID || "").trim();
        if (!id) return "";
        try {
            const url = `https://music.163.com/api/v1/user/detail/${encodeURIComponent(id)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object") return "";
            return JSON.stringify(json);
        } catch (e) { return ""; }
    }

    // ==================== ★ 拆分1: 获取用户歌单完整JSON ====================
    async getUserPlaylistJSON(args) {
        const id = String(args.ID || "").trim();
        if (!id) return "";
        try {
            const url = `https://music.163.com/api/user/playlist?uid=${encodeURIComponent(id)}&limit=100`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object") return "";
            return JSON.stringify(json);
        } catch (e) {
            console.error("[NTeaseMusic] getUserPlaylistJSON error:", e);
            return "";
        }
    }

    // ==================== ★ 拆分2: 解析用户歌单JSON ====================
    parseUserPlaylist(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw) return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "names").trim();
            const playlistArr = Array.isArray(json?.playlist) ? json.playlist : [];

            switch (type) {
                case "names":
                    return JSON.stringify(playlistArr.map(p => p.name).filter(n => n != null && n !== ""));
                case "ids":
                    return JSON.stringify(playlistArr.map(p => p.id).filter(i => i != null));
                case "creators":
                    return JSON.stringify(playlistArr.map(p => p.creator?.nickname).filter(n => n != null && n !== ""));
                case "creatorIds":
                    return JSON.stringify(playlistArr.map(p => p.creator?.userId).filter(i => i != null));
                case "createTimes":
                    return JSON.stringify(playlistArr.map(p => p.createTime).filter(t => t != null));
                case "jsonArray":
                    return JSON.stringify(playlistArr);
                case "count":
                    return String(playlistArr.length);
                default:
                    return JSON.stringify(playlistArr.map(p => p.name).filter(n => n != null && n !== ""));
            }
        } catch (e) {
            return "";
        }
    }

    // ==================== 用户信息解析 ====================
    getUserInfo(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw) return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "nickname").trim();

            const profile = json?.profile;
            const playlistArr = json?.playlist;

            if (profile) {
                switch (type) {
                    case "nickname": return profile.nickname || "";
                    case "signature": return profile.signature || "";
                    case "avatarUrl": return profile.avatarUrl || "";
                    case "backgroundUrl": return profile.backgroundUrl || "";
                    case "gender": return profile.gender ?? "";
                    case "level": return profile.level ?? "";
                    case "followeds": return profile.followeds ?? "";
                    case "follows": return profile.follows ?? "";
                    case "eventCount": return profile.eventCount ?? "";
                    default: return "";
                }
            }

            if (Array.isArray(playlistArr)) {
                switch (type) {
                    case "playlistNames":
                        return JSON.stringify(playlistArr.map(p => p.name).filter(n => n !== undefined && n !== null && n !== ""));
                    case "playlistIds":
                        return JSON.stringify(playlistArr.map(p => p.id).filter(i => i != null));
                    case "playlistCovers":
                        return JSON.stringify(playlistArr.map(p => p.coverImgUrl).filter(u => u !== undefined && u !== null && u !== ""));
                    default: return "";
                }
            }

            return "";
        } catch (e) { return ""; }
    }

    // ==================== 热评获取 ====================
    async getHotComments(args) {
        const typeId = String(args.TYPE_ID || "R_SO_4_").trim();
        const id = String(args.ID || "").trim();
        const info = String(args.INFO || "content").trim();
        const num = Math.min(Math.max(Math.round(Number(args.NUM) || 10), 1), 50);
        if (!id) return JSON.stringify([]);

        try {
            const url = `https://music.163.com/api/v1/resource/comments/${typeId}${id}?limit=${num}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();

            const comments = Array.isArray(json?.hotComments) && json.hotComments.length > 0
                ? json.hotComments
                : (Array.isArray(json?.comments) ? json.comments : []);

            if (comments.length === 0) return JSON.stringify([]);

            const result = [];
            for (const c of comments.slice(0, num)) {
                if (!c) continue;
                let val;
                switch (info) {
                    case "content": val = c.content; break;
                    case "nickname": val = c.user?.nickname; break;
                    case "likedCount": val = c.likedCount; break;
                    case "time": val = c.time; break;
                    default: val = c.content;
                }
                if (val !== undefined && val !== null) result.push(val);
            }
            return JSON.stringify(result);
        } catch (e) {
            console.error("[NTeaseMusic] getHotComments error:", e);
            return JSON.stringify([]);
        }
    }

    // ==================== URL有效性检测 ====================
    async checkUrlValid(args) {
        const url = String(args.URL || "").trim();
        if (!url) return false;
        try {
            const resp = await NTeaseMusic._fetchWithTimeout(url, { method: 'HEAD' }, 5000);
            return resp.ok;
        } catch (e) { return false; }
    }

    // ==================== 时域波形 ====================
    getWaveform(args) {
        const requestedNum = Math.round(Number(args.NUM));
        const fftSize = this._clampFftSize(requestedNum);
        if (!this.analyser || !this.audio || this.audio.paused) {
            return JSON.stringify(new Array(fftSize).fill(128));
        }
        try {
            if (this.analyser.fftSize !== fftSize) {
                this.analyser.fftSize = fftSize;
                this.currentFftSize = fftSize;
                this.frequencyData = new Uint8Array(fftSize / 2);
                this.timeDomainData = new Uint8Array(fftSize);
            }
            if (!this.timeDomainData || this.timeDomainData.length !== fftSize) {
                this.timeDomainData = new Uint8Array(fftSize);
            }
            this.analyser.getByteTimeDomainData(this.timeDomainData);
            return JSON.stringify(Array.from(this.timeDomainData));
        } catch (e) {
            return JSON.stringify(new Array(fftSize).fill(128));
        }
    }

    // ==================== 歌曲详情 ====================
    async getSongDetail(args) {
        const id = String(args.ID || "").trim();
        const type = String(args.TYPE || "name").trim();
        if (!id || isNaN(Number(id))) return "";
        try {
            const url = `https://music.163.com/api/song/detail?ids=${encodeURIComponent(id)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            const songs = json?.songs;
            if (!Array.isArray(songs) || songs.length === 0) return "";
            const song = songs[0];
            if (!song) return "";
            switch (type) {
                case "name": return song.name || "";
                case "artistName":
                    return Array.isArray(song.ar) && song.ar.length > 0
                        ? song.ar.map(a => a.name).filter(n => n).join(" / ") : "";
                case "artistId":
                    return Array.isArray(song.ar) && song.ar.length > 0
                        ? JSON.stringify(song.ar.map(a => a.id).filter(i => i != null)) : "[]";
                case "albumName": return song.al?.name || "";
                case "albumId": return song.al?.id ?? "";
                case "coverUrl": return song.al?.picUrl || "";
                default: return "";
            }
        } catch (e) { return ""; }
    }

    // ==================== 每日推荐 ====================
    async getDailyRecommend(args) {
        const type = String(args.TYPE || "name").trim();
        try {
            const url = "https://music.163.com/api/v3/discovery/recommend/songs";
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            const songs = json?.data?.dailySongs;
            if (!Array.isArray(songs) || songs.length === 0) return JSON.stringify([]);
            const result = [];
            for (const song of songs) {
                if (!song) continue;
                let value;
                switch (type) {
                    case "name": value = song.name; break;
                    case "id": value = song.id; break;
                    case "fee": value = song.fee; break;
                    case "artistName":
                        value = Array.isArray(song.ar) && song.ar.length > 0 ? song.ar.map(a => a.name).join(" / ") : undefined;
                        break;
                    case "artistId":
                        value = Array.isArray(song.ar) && song.ar.length > 0 ? JSON.stringify(song.ar.map(a => a.id).filter(id => id != null)) : undefined;
                        break;
                    case "albumName": value = song.al?.name; break;
                    case "albumId": value = song.al?.id; break;
                    case "coverUrl": value = song.al?.picUrl; break;
                    case "duration": value = song.dt; break;
                    default: value = undefined;
                }
                if (value !== undefined && value !== null && value !== "") result.push(value);
            }
            return JSON.stringify(result);
        } catch (e) { return JSON.stringify([]); }
    }

    // ==================== 相似歌曲 ====================
    async getSimilarSongs(args) {
        const id = String(args.ID || "").trim();
        const type = String(args.TYPE || "name").trim();
        if (!id) return JSON.stringify([]);
        try {
            const url = `https://music.163.com/api/v1/discovery/simiSong?songid=${encodeURIComponent(id)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            const songs = json?.songs;
            if (!Array.isArray(songs) || songs.length === 0) return JSON.stringify([]);
            const result = [];
            for (const song of songs) {
                if (!song) continue;
                let value;
                switch (type) {
                    case "name": value = song.name; break;
                    case "id": value = song.id; break;
                    case "albumName": value = song.album?.name; break;
                    case "albumId": value = song.album?.id; break;
                    case "artistName":
                        value = Array.isArray(song.artists) && song.artists.length > 0 ? song.artists.map(a => a.name).join(" / ") : undefined;
                        break;
                    case "artistId":
                        value = Array.isArray(song.artists) && song.artists.length > 0 ? JSON.stringify(song.artists.map(a => a.id).filter(i => i != null)) : undefined;
                        break;
                    case "artistAvatar":
                        value = Array.isArray(song.artists) && song.artists.length > 0 ? (song.artists[0]?.img1v1Url || song.artists[0]?.picUrl || "") : undefined;
                        break;
                    default: value = undefined;
                }
                if (value !== undefined && value !== null && value !== "") result.push(value);
            }
            return JSON.stringify(result);
        } catch (e) { return JSON.stringify([]); }
    }

    // ==================== 歌词解析工具 ====================
    static LYRIC_TIME_REGEX = /^\[(\d{1,3}:\d{2}(?::\d{2})?(?:\.\d{1,3})?)\]\s*(.*)/;

    _parseLrcLines(raw) {
        const lines = String(raw || "").split("\n");
        const lyrics = [], times = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const match = trimmed.match(NTeaseMusic.LYRIC_TIME_REGEX);
            if (match) { times.push(match[1]); lyrics.push(match[2].trim()); }
        }
        return { lyrics, times };
    }

    _lrcTimeToSeconds(timeStr) {
        if (typeof timeStr !== "string" || !timeStr.trim()) return 0;
        const parts = timeStr.trim().split(":");
        let seconds = 0;
        try {
            if (parts.length === 3) seconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
            else if (parts.length === 2) seconds = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
            else seconds = parseFloat(parts[0]);
        } catch (e) { return 0; }
        return isNaN(seconds) ? 0 : Math.round(seconds * 1000) / 1000;
    }

    _secondsToLrcTime(totalSeconds) {
        let s = Number(totalSeconds);
        if (isNaN(s) || s < 0) s = 0;
        const mins = Math.floor(s / 60);
        const secs = s - mins * 60;
        return `${String(mins).padStart(2, "0")}:${secs.toFixed(2).padStart(5, "0")}`;
    }

    parseLyric(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw) return JSON.stringify([]);
            const type = String(args.TYPE || "lyrics").trim();
            const { lyrics, times } = this._parseLrcLines(raw);
            if (type === "times") return JSON.stringify(times);
            if (type === "timesSec") return JSON.stringify(times.map(t => this._lrcTimeToSeconds(t)));
            return JSON.stringify(lyrics);
        } catch (e) { return JSON.stringify([]); }
    }

    getLyricLine(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw) return "";
            const n = Math.round(Number(args.N));
            const idx = n >= 1 ? n - 1 : n;
            const type = String(args.TYPE || "lyric").trim();
            const { lyrics, times } = this._parseLrcLines(raw);
            if (idx < 0 || idx >= lyrics.length) return "";
            switch (type) {
                case "lyric": return lyrics[idx];
                case "time": return times[idx] || "";
                case "timeSec": return times[idx] ? String(this._lrcTimeToSeconds(times[idx])) : "";
                default: return "";
            }
        } catch (e) { return ""; }
    }

    // ==================== 逐字歌词(YRC)解析工具 ====================
    static YRC_LINE_REGEX = /^\[(\d+),(\d+)\](.*)$/;
    static YRC_WORD_REGEX = /\((\d+),(\d+),(\d+)\)([^(]*)/g;

    _parseYrcLines(raw) {
        const lines = String(raw || "").split("\n");
        const result = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const lineMatch = trimmed.match(NTeaseMusic.YRC_LINE_REGEX);
            if (!lineMatch) continue;
            const lineStartMs = Number(lineMatch[1]) || 0;
            const lineDurationMs = Number(lineMatch[2]) || 0;
            const content = lineMatch[3] || "";
            const words = [];
            let fullText = "";
            let match;
            NTeaseMusic.YRC_WORD_REGEX.lastIndex = 0;
            while ((match = NTeaseMusic.YRC_WORD_REGEX.exec(content)) !== null) {
                const wordText = match[4] || "";
                if (wordText.trim() === "") continue;
                fullText += wordText;
                words.push({
                    text: wordText,
                    timeSec: Math.round(((Number(match[1]) || 0) / 1000) * 1000) / 1000,
                    durationSec: Math.round(((Number(match[2]) || 0) / 1000) * 1000) / 1000
                });
            }
            if (words.length === 0 && fullText.trim() === "") continue;
            result.push({
                timeSec: Math.round((lineStartMs / 1000) * 1000) / 1000,
                durationSec: Math.round((lineDurationMs / 1000) * 1000) / 1000,
                text: fullText, wordCount: words.length, words
            });
        }
        return result;
    }

    getYrcLineInfo(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw) return "";
            const n = Math.round(Number(args.N));
            const idx = n >= 1 ? n - 1 : n;
            const type = String(args.TYPE || "text").trim();
            const parsed = this._parseYrcLines(raw);
            if (idx < 0 || idx >= parsed.length) return "";
            const line = parsed[idx];
            switch (type) {
                case "text": return line.text;
                case "timeSec": return String(line.timeSec);
                case "durationSec": return String(line.durationSec);
                case "wordCount": return String(line.wordCount);
                case "wordsJson": return JSON.stringify(line.words);
                default: return "";
            }
        } catch (e) { return ""; }
    }

    getYrcWordInfo(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw) return "";
            const n = Math.round(Number(args.N));
            const lineIdx = n >= 1 ? n - 1 : n;
            const m = Math.round(Number(args.M));
            const wordIdx = m >= 1 ? m - 1 : m;
            const type = String(args.TYPE || "text").trim();
            const parsed = this._parseYrcLines(raw);
            if (lineIdx < 0 || lineIdx >= parsed.length) return "";
            const line = parsed[lineIdx];
            if (wordIdx < 0 || wordIdx >= line.words.length) return "";
            const word = line.words[wordIdx];
            switch (type) {
                case "text": return word.text;
                case "timeSec": return String(word.timeSec);
                case "durationSec": return String(word.durationSec);
                default: return "";
            }
        } catch (e) { return ""; }
    }

    // ==================== 时间转换 ====================
    timeToSeconds(args) { return this._lrcTimeToSeconds(String(args.TIME || "")); }
    secondsToTime(args) { return this._secondsToLrcTime(args.SECONDS); }

    getTimestampInfo(args) {
        try {
            const raw = String(args.TIME || "").trim();
            if (!raw) return "";
            let date;
            const num = Number(raw);
            if (/^-?\d+(\.\d+)?$/.test(raw)) {
                const ts = Math.abs(num) < 1e10 ? num * 1000 : num;
                date = new Date(ts);
            } else {
                date = new Date(raw.replace(/\//g, "-"));
            }
            if (isNaN(date.getTime())) return "";
            const info = String(args.INFO || "datetime").trim();
            const pad = (n) => String(n).padStart(2, "0");
            switch (info) {
                case "datetime": return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
                case "year": return date.getFullYear();
                case "month": return date.getMonth() + 1;
                case "day": return date.getDate();
                case "hour": return date.getHours();
                case "minute": return date.getMinutes();
                case "second": return date.getSeconds();
                default: return "";
            }
        } catch (e) { return ""; }
    }

    // ==================== 歌词元数据清理 ====================
    static LYRIC_META_KEYWORDS = /作词|作曲|编曲|制作人|录音|混音|母带|监制|出品|发行|词：|曲：|编：|Lyrics|Composer|Arranger|Producer|Mixed|Mastered/i;

    _cleanYrcMeta(lyric) {
        if (typeof lyric !== "string" || !lyric.trim()) return "";
        const lines = lyric.split("\n");
        const cleaned = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const lineMatch = trimmed.match(NTeaseMusic.YRC_LINE_REGEX);
            if (lineMatch) {
                const content = lineMatch[3] || "";
                let fullText = "";
                let wm;
                NTeaseMusic.YRC_WORD_REGEX.lastIndex = 0;
                while ((wm = NTeaseMusic.YRC_WORD_REGEX.exec(content)) !== null) fullText += (wm[4] || "");
                if (NTeaseMusic.LYRIC_META_KEYWORDS.test(fullText)) continue;
            }
            cleaned.push(line);
        }
        return cleaned.join("\n").trim();
    }

    _cleanLrcMeta(lyric) {
        if (typeof lyric !== "string" || !lyric.trim()) return "";
        let result = lyric.replace(/^(\[(?![\d:])[^\]]*\]\s*)+/g, "");
        const lines = result.split("\n");
        const cleaned = [];
        let passedMeta = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (!passedMeta) {
                const timeTagMatch = trimmed.match(/^\[[\d:.]+\]\s*(.*)/);
                if (timeTagMatch) {
                    const content = timeTagMatch[1].trim();
                    if (content && NTeaseMusic.LYRIC_META_KEYWORDS.test(content)) continue;
                    if (content) passedMeta = true;
                } else if (NTeaseMusic.LYRIC_META_KEYWORDS.test(trimmed)) continue;
                else passedMeta = true;
            }
            cleaned.push(line);
        }
        return cleaned.join("\n").trim();
    }

    // ==================== 列表菜单 ====================
    _getListMenuItems() {
        try {
            const runtime = Scratch.vm?.runtime;
            if (!runtime) return [{ text: "无可用列表", value: "" }];
            const target = runtime.getEditingTarget();
            if (!target) return [{ text: "无可用列表", value: "" }];
            const items = [];
            const seenNames = new Set();
            for (const key in target.variables) {
                const v = target.variables[key];
                if (v.type === "list" && !seenNames.has(v.name)) { items.push({ text: v.name, value: v.id }); seenNames.add(v.name); }
            }
            const stage = runtime.getTargetForStage();
            if (stage && stage !== target) {
                for (const key in stage.variables) {
                    const v = stage.variables[key];
                    if (v.type === "list" && !seenNames.has(v.name)) { items.push({ text: v.name, value: v.id }); seenNames.add(v.name); }
                }
            }
            return items.length > 0 ? items : [{ text: "无可用列表", value: "" }];
        } catch (e) { return [{ text: "无可用列表", value: "" }]; }
    }

    _lookupList(idOrName, util) {
        try {
            const runtime = Scratch.vm?.runtime;
            if (!runtime) return null;
            const target = util?.target || runtime.getEditingTarget();
            if (!target) return null;
            if (target.variables[idOrName]?.type === "list") return target.variables[idOrName];
            const stage = runtime.getTargetForStage();
            if (stage && stage.variables[idOrName]?.type === "list") return stage.variables[idOrName];
            for (const key in target.variables) { const v = target.variables[key]; if (v.type === "list" && v.name === idOrName) return v; }
            if (stage && stage !== target) { for (const key in stage.variables) { const v = stage.variables[key]; if (v.type === "list" && v.name === idOrName) return v; } }
            return null;
        } catch (e) { return null; }
    }

    getListAsArray(args, util) {
        try { const lv = this._lookupList(args.LIST, util); if (lv) return JSON.stringify(lv.value); } catch (e) {}
        return "";
    }

    setListFromArray(args, util) {
        try {
            const lv = this._lookupList(args.LIST, util);
            if (lv) { const arr = JSON.parse(args.JSON); if (Array.isArray(arr)) lv.value = arr.map(i => typeof i === "object" ? JSON.stringify(i) : (i ?? "")); }
        } catch (e) {}
    }

    // ==================== 搜索 ====================
    async searchMusic(args) {
        const str = encodeURIComponent(args.STR);
        const type = args.TYPE;
        const num = args.NUM;
        const url = `https://music.163.com/api/search/get/web?s=${str}&type=${type}&limit=${num}`;
        try { const r = await NTeaseMusic._fetchWithTimeout(url); return JSON.stringify(await r.json()); } catch (e) { return ""; }
    }

    async getSearchSuggest(args) {
        const str = encodeURIComponent(String(args.STR || "").trim());
        if (!str) return JSON.stringify([]);
        try {
            const r = await NTeaseMusic._fetchWithTimeout(`https://music.163.com/api/search/suggest/keyword?s=${str}`);
            const json = await r.json();
            const allMatch = json?.result?.allMatch;
            if (!Array.isArray(allMatch)) return JSON.stringify([]);
            return JSON.stringify(allMatch.map(item => item?.keyword).filter(kw => kw !== undefined && kw !== null && kw !== ""));
        } catch (e) { return JSON.stringify([]); }
    }

    getResultInfo(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw) return JSON.stringify([]);
            const data = JSON.parse(raw);
            const field = String(args.TYPE || "name").trim();
            let list = [];
            const r = data.result;
            if (Array.isArray(r?.songs)) list = r.songs;
            else if (Array.isArray(r?.albums)) list = r.albums;
            else if (Array.isArray(r?.artists)) list = r.artists;
            else if (Array.isArray(r?.playlists)) list = r.playlists;
            else if (Array.isArray(r?.userprofiles)) list = r.userprofiles;
            else if (Array.isArray(r?.mvs)) list = r.mvs;
            else if (Array.isArray(r?.lyrics)) list = r.lyrics;
            else if (Array.isArray(r?.djRadios)) list = r.djRadios;
            else if (Array.isArray(r?.videos)) list = r.videos;
            else if (Array.isArray(r?.allMatch)) list = r.allMatch;
            else if (Array.isArray(data.songs)) list = data.songs;
            else return JSON.stringify([]);
            const result = [];
            for (const item of list) {
                if (!item) continue;
                let value;
                if (field === "name") value = item.name || item.nickname || item.title;
                else if (field === "id") value = item.id || item.userId || item.vid;
                else if (field === "artistName") {
                    if (Array.isArray(item.ar) && item.ar.length > 0) value = item.ar.map(a => a.name).join(" / ");
                    else if (Array.isArray(item.artists) && item.artists.length > 0) value = item.artists.map(a => a.name).join(" / ");
                    else if (item.artist) value = typeof item.artist === "string" ? item.artist : (item.artist.name || "");
                    else if (item.creator) value = item.creator.nickname || item.creator.name || "";
                } else if (field === "artistId") {
                    let ids = [];
                    if (Array.isArray(item.ar) && item.ar.length > 0) ids = item.ar.map(a => a.id).filter(id => id != null);
                    else if (Array.isArray(item.artists) && item.artists.length > 0) ids = item.artists.map(a => a.id).filter(id => id != null);
                    else if (item.artist && typeof item.artist === "object" && item.artist.id !== undefined) ids = [item.artist.id];
                    else if (item.creator && (item.creator.userId !== undefined || item.creator.id !== undefined)) ids = [item.creator.userId ?? item.creator.id];
                    value = ids.length > 0 ? JSON.stringify(ids) : undefined;
                } else if (field === "tns") {
                    let tnsArr = [];
                    if (Array.isArray(item.tns) && item.tns.length > 0) tnsArr = item.tns;
                    else if (Array.isArray(item.transNames) && item.transNames.length > 0) tnsArr = item.transNames;
                    value = tnsArr;
                } else if (field === "fee") value = item.fee;
                if (field === "tns") result.push(Array.isArray(value) ? value : []);
                else if (value !== undefined && value !== null && value !== "") result.push(value);
            }
            return JSON.stringify(result);
        } catch (e) { return JSON.stringify([]); }
    }

    // ==================== 歌词信息 ====================
    async getLyricInfo(args) {
        const id = String(args.ID || "").trim();
        const type = String(args.TYPE || "json.lrc.lyric").trim();
        if (!id) return "";
        try {
            const url = `https://music.163.com/api/song/lyric/v1?id=${encodeURIComponent(id)}&lv=1&kv=1&tv=-1&yv=1`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            switch (type) {
                case "json.lrc.lyric": return this._cleanLrcMeta(json?.lrc?.lyric ?? "");
                case "tlyric": return json?.tlyric?.lyric ?? "";
                case "json.yrc.lyric": return this._cleanYrcMeta(json?.yrc?.lyric ?? "");
                case "uptime": return json?.transUser?.uptime ?? "";
                case "nickname": return json?.transUser?.nickname ?? "";
                case "userid": return json?.transUser?.userid ?? "";
                default: return "";
            }
        } catch (e) { return ""; }
    }

    // ==================== JSON数组工具 ====================
    getArrayItem(args) {
        try {
            const arr = JSON.parse(String(args.OBJECT || "[]"));
            if (!Array.isArray(arr)) return "";
            const n = Math.round(Number(args.N));
            const index = n >= 1 ? n - 1 : n;
            if (index < 0 || index >= arr.length) return "";
            const val = arr[index];
            if (val === null || val === undefined) return "";
            return typeof val === "object" ? JSON.stringify(val) : String(val);
        } catch (e) { return ""; }
    }

    getArrayLength(args) {
        try { const arr = JSON.parse(String(args.OBJECT || "[]")); return Array.isArray(arr) ? arr.length : 0; } catch (e) { return 0; }
    }

    // ==================== 音频播放器 ====================
    loadAudio(args) {
        const url = (args.URL || '').trim();
        if (!url) { this._cleanupAll(); return; }
        try {
            this._cleanupAll();
            this.audio = new Audio();
            this.audio.crossOrigin = 'anonymous';
            this.audio.src = url;
            this.audio.playbackRate = 1.0;
            this.audio.volume = 1.0;
            this._initAudioContext();
            this.audio.addEventListener('loadedmetadata', () => { this._playInternal(); }, { once: true });
            this.audio.addEventListener('error', () => { this._cleanupAll(); }, { once: true });
            this.audio.load();
        } catch (e) { this._cleanupAll(); }
    }

    playAudio() {
        if (!this.audio || !this.audio.src || this.audio.src.trim() === 'about:blank') return;
        if (this.audio.error) { this._cleanupAll(); return; }
        this._playInternal();
    }

    _playInternal() {
        if (!this.audio || !this.audio.src || this.audio.src.trim() === 'about:blank') return;
        if (this.audio.error) { this._cleanupAll(); return; }
        try {
            if (this.audioContext && this.audioContext.state === 'suspended') this.audioContext.resume();
            if (!this.sourceNode && this.audioContext && this.analyser) {
                this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
                if (!this.gainNode) { this.gainNode = this.audioContext.createGain(); this.gainNode.gain.value = 1.0; }
                this.sourceNode.connect(this.gainNode);
                this.gainNode.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
            }
            this.audio.play().catch(() => { this._cleanupAnalysis(); });
        } catch (e) { this._cleanupAnalysis(); }
    }

    _initAudioContext() {
        try {
            if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.currentFftSize;
            this.analyser.smoothingTimeConstant = 0.85;
            this.frequencyData = new Uint8Array(this.currentFftSize / 2);
            this.timeDomainData = new Uint8Array(this.currentFftSize);
        } catch (e) { throw e; }
    }

    pauseAudio() { if (this.audio) this.audio.pause(); }
    stopAudio() { if (this.audio) { this.audio.pause(); this.audio.currentTime = 0; } }

    setPlaybackRate(args) {
        if (!this.audio || !this.audio.src) return;
        let speed = parseFloat(args.SPEED);
        speed = isNaN(speed) ? 1.0 : Math.max(0.25, Math.min(4.0, speed));
        this.audio.playbackRate = speed;
    }

    seekToTime(args) {
        if (!this.audio || !this.audio.src) return;
        let time = parseFloat(args.TIME);
        time = isNaN(time) ? 0 : Math.max(0, time);
        if (this.audio.duration && !isNaN(this.audio.duration)) time = Math.min(time, this.audio.duration);
        this.audio.currentTime = time;
    }

    setVolume(args) {
        if (!this.audio || !this.audio.src) return;
        let volumePercent = parseFloat(args.VOLUME);
        volumePercent = isNaN(volumePercent) ? 100 : Math.max(0, Math.min(100, volumePercent));
        const volumeValue = volumePercent / 100;
        if (this.gainNode) this.gainNode.gain.value = volumeValue;
        this.audio.volume = volumeValue;
    }

    getVolume() {
        if (this.gainNode) return parseFloat((this.gainNode.gain.value * 100).toFixed(0));
        if (this.audio) return parseFloat((this.audio.volume * 100).toFixed(0));
        return 100;
    }

    getPlaybackRate() { return this.audio ? parseFloat(this.audio.playbackRate.toFixed(2)) : 1.0; }
    getCurrentTime() { return this.audio ? this._formatTime(this.audio.currentTime) : 0; }
    getDuration() { return this.audio && !isNaN(this.audio.duration) ? this._formatTime(this.audio.duration) : 0; }

    // ==================== 频谱分析 ====================
    _clampFftSize(num) {
        const validSizes = [64, 128, 256, 512, 1024];
        let n = Math.round(Number(num));
        if (isNaN(n) || n < 32) n = 32;
        if (n > 512) n = 512;
        const targetFft = n * 2;
        let closest = validSizes[0];
        let minDiff = Math.abs(targetFft - closest);
        for (const size of validSizes) { const diff = Math.abs(targetFft - size); if (diff < minDiff) { minDiff = diff; closest = size; } }
        return closest;
    }

    getFrequencyDomain(args) {
        const requestedNum = Math.round(Number(args.NUM));
        const fftSize = this._clampFftSize(requestedNum);
        const binCount = fftSize / 2;
        if (!this.analyser || !this.audio || this.audio.paused) return JSON.stringify(new Array(binCount).fill(0));
        try {
            if (this.analyser.fftSize !== fftSize) {
                this.analyser.fftSize = fftSize;
                this.currentFftSize = fftSize;
                this.frequencyData = new Uint8Array(binCount);
                this.timeDomainData = new Uint8Array(fftSize);
            }
            this.analyser.getByteFrequencyData(this.frequencyData);
            return JSON.stringify(Array.from(this.frequencyData));
        } catch (e) { return JSON.stringify(new Array(binCount).fill(0)); }
    }

    getFrequencyAt(args) {
        if (!this.analyser || !this.frequencyData || !this.audio || this.audio.paused) return 0;
        try {
            this.analyser.getByteFrequencyData(this.frequencyData);
            const idx = Math.floor(args.INDEX) - 1;
            return (idx >= 0 && idx < this.frequencyData.length) ? this.frequencyData[idx] : 0;
        } catch (e) { return 0; }
    }

    getAverageVolume() {
        if (!this.analyser || !this.frequencyData || !this.audio || this.audio.paused) return 0;
        try {
            this.analyser.getByteFrequencyData(this.frequencyData);
            const count = Math.min(64, this.frequencyData.length);
            let sum = 0;
            for (let i = 0; i < count; i++) sum += this.frequencyData[i];
            return Math.min(255, Math.floor(sum / count));
        } catch (e) { return 0; }
    }

    isPlaying() { return !!(this.audio && !this.audio.paused && this.audioContext?.state === 'running'); }

    // ==================== 资源清理 ====================
    _cleanupAll() {
        this._cleanupAudio();
        this._cleanupAnalysis();
        if (this.audioContext) { try { this.audioContext.close(); } catch (e) {} this.audioContext = null; }
        this.gainNode = null;
        this.currentFftSize = 256;
    }

    _cleanupAudio() {
        if (this.audio) { try { this.audio.pause(); this.audio.src = ''; this.audio.removeAttribute('src'); } catch (e) {} this.audio = null; }
    }

    _cleanupAnalysis() {
        if (this.sourceNode) { try { this.sourceNode.disconnect(); } catch (e) {} this.sourceNode = null; }
        if (this.gainNode) { try { this.gainNode.disconnect(); } catch (e) {} this.gainNode = null; }
        if (this.analyser) { try { this.analyser.disconnect(); } catch (e) {} this.analyser = null; }
        this.frequencyData = null;
        this.timeDomainData = null;
    }
}

Scratch.extensions.register(new NTeaseMusic());