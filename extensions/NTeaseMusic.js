// Name: NTeaseMusicv2
// ID: NTeaseMusic
// Description: Quickly and easily access NetEase Cloud Music for some analysis.
// By: NTawa<https://space.bilibili.com/3546570106604381>
// License: MIT
class NTeaseMusic {
    constructor() {
        this.info = {
            id: "NTeaseMusic",
            name: "网易云v2",
            color1: "#ff9b86"
        };
        this._logoSVG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="280 260 400 400">' + '<path d="M582.33374,305.09018c-24.85132,-18.68584 -54.68458,-20.93356 -74.96054,4.5836c-1.09378,1.3765 -1.75478,2.6511 -4.3198,7.73354c-1.2837,3.61806 -1.55586,5.56948 -2.02306,10.08956c-0.37658,3.80662 1.57784,14.4515 2.26182,17.0966c23.13942,89.48454 15.53198,58.97038 23.038,91.1336c0.46338,1.98566 2.74866,6.48722 5.7161,18.5494c7.61056,19.02684 11.30032,58.50424 -34.63228,73.82112c-1.8949,0.71018 -11.62558,1.49234 -13.76108,1.1881c-41.9781,-5.98038 -51.72274,-36.01318 -52.8774,-62.14632c0.47652,-39.83196 29.81856,-74.19196 83.23888,-80.51886c4.1023,-2.31982 120.76706,-6.57336 122.7051,122.74632c-1.5614,12.4396 -9.26078,120.81284 -150.25674,130.13162c-90.12876,2.366 -160.4274,-76.18984 -162.966,-153.853c-4.83996,-117.13694 72.91108,-160.66076 98.65068,-169.75388" fill="none" stroke="#ffffff" stroke-width="60" stroke-linecap="round" stroke-miterlimit="10"/>' + '<path d="M582.33374,305.09018c-24.85132,-18.68584 -54.68458,-20.93356 -74.96054,4.5836c-1.09378,1.3765 -1.75478,2.6511 -4.3198,7.73354c-1.2837,3.61806 -1.55586,5.56948 -2.02306,10.08956c-0.37658,3.80662 1.57784,14.4515 2.26182,17.0966c23.13942,89.48454 15.53198,58.97038 23.038,91.1336c0.46338,1.98566 2.74866,6.48722 5.7161,18.5494c7.61056,19.02684 11.30032,58.50424 -34.63228,73.82112c-1.8949,0.71018 -11.62558,1.49234 -13.76108,1.1881c-41.9781,-5.98038 -51.72274,-36.01318 -52.8774,-62.14632c0.47652,-39.83196 29.81856,-74.19196 83.23888,-80.51886c4.1023,-2.31982 120.76706,-6.57336 122.7051,122.74632c-1.5614,12.4396 -9.26078,120.81284 -150.25674,130.13162c-90.12876,2.366 -160.4274,-76.18984 -162.966,-153.853c-4.83996,-117.13694 72.91108,-160.66076 98.65068,-169.75388" fill="none" stroke="#ff866e" stroke-width="36" stroke-linecap="round" stroke-miterlimit="10"/>' + '</svg>');
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
        if (isNaN(s))
            return 0;
        return parseFloat(s.toFixed(this.timeDecimalPlaces));
    }
    _getNestedValue(obj, path) {
        if (!obj || !path)
            return undefined;
        const parts = path.split(".");
        let current = obj;
        for (const part of parts) {
            if (current === null || current === undefined)
                return undefined;
            if (Array.isArray(current) && /^\d+$/.test(part)) {
                current = current[Number(part)];
            }
            else if (typeof current === "object") {
                current = current[part];
            }
            else {
                return undefined;
            }
        }
        return current;
    }
    static _extractUrlFromJson(obj, maxDepth = 5) {
        if (maxDepth <= 0 || obj === null || obj === undefined)
            return "";
        if (typeof obj === "string") {
            return /^https?:\/\/.+/.test(obj.trim()) ? obj.trim() : "";
        }
        if (Array.isArray(obj)) {
            for (const item of obj) {
                const found = NTeaseMusic._extractUrlFromJson(item, maxDepth - 1);
                if (found)
                    return found;
            }
            return "";
        }
        if (typeof obj === "object") {
            const priorityKeys = [
                "url",
                "playUrl",
                "song_url",
                "musicUrl",
                "src",
                "link",
                "uri",
                "downloadUrl"
            ];
            for (const key of priorityKeys) {
                if (obj[key] && typeof obj[key] === "string" && /^https?:\/\/.+/.test(obj[key].trim())) {
                    return obj[key].trim();
                }
            }
            for (const key in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, key))
                    continue;
                const found = NTeaseMusic._extractUrlFromJson(obj[key], maxDepth - 1);
                if (found)
                    return found;
            }
        }
        return "";
    }
    static async _fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const resp = await fetch(url, {...options,
                signal: controller.signal,
                headers: {
                    ...(options.headers || {}),
                    'Referer': 'music.163.com'
                }
            });
            clearTimeout(timer);
            return resp;
        }
        catch (e) {
            clearTimeout(timer);
            throw e;
        }
    }
    getInfo() {
        return {...this.info, menuIconURI: this._logoSVG, blocks: [{
                opcode: 'sepSearch',
                blockType: Scratch.BlockType.LABEL,
                text: '搜索与推荐'
            }, // ===== 合并后的统一搜索积木 =====
            {
                opcode: "unifiedSearch",
                blockType: Scratch.BlockType.REPORTER,
                text: "搜索 [STR] 类型 [TYPE] 数量 [NUM] 页数 [PAGE]",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "Nevada"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "unifiedSearchTypeMenu"
                    },
                    NUM: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 30
                    },
                    PAGE: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1
                    }
                }
            }, // ===== 九种单项搜索解析积木 =====
            {
                opcode: "parseSearchSong",
                blockType: Scratch.BlockType.REPORTER,
                text: "单曲 [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "搜索结果"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "songSearchMenu"
                    }
                }
            }, {
                opcode: "parseSearchAlbum",
                blockType: Scratch.BlockType.REPORTER,
                text: "专辑 [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "搜索结果"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "albumSearchMenu"
                    }
                }
            }, {
                opcode: "parseSearchArtist",
                blockType: Scratch.BlockType.REPORTER,
                text: "歌手 [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "搜索结果"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "artistSearchMenu"
                    }
                }
            }, {
                opcode: "parseSearchPlaylist",
                blockType: Scratch.BlockType.REPORTER,
                text: "歌单 [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "搜索结果"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "playlistSearchMenu"
                    }
                }
            }, {
                opcode: "parseSearchUser",
                blockType: Scratch.BlockType.REPORTER,
                text: "用户 [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "搜索结果"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "userSearchMenu"
                    }
                }
            }, {
                opcode: "parseSearchMV",
                blockType: Scratch.BlockType.REPORTER,
                text: "MV [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "搜索结果"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "mvSearchMenu"
                    }
                }
            }, {
                opcode: "parseSearchLyric",
                blockType: Scratch.BlockType.REPORTER,
                text: "歌词 [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "搜索结果"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "lyricSearchMenu"
                    }
                }
            }, {
                opcode: "parseSearchDjRadio",
                blockType: Scratch.BlockType.REPORTER,
                text: "电台/播客 [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "搜索结果"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "djRadioSearchMenu"
                    }
                }
            }, {
                opcode: "parseSearchVideo",
                blockType: Scratch.BlockType.REPORTER,
                text: "视频 [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "搜索结果"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "videoSearchMenu"
                    }
                }
            }, // ===== 综合搜索及其他原有积木 =====
            {
                opcode: "comprehensiveSearch",
                blockType: Scratch.BlockType.REPORTER,
                text: "综合搜索 [STR]",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "Nevada"
                    }
                }
            }, {
                opcode: "parseComprehensiveSearch",
                blockType: Scratch.BlockType.REPORTER,
                text: "综合 [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "搜索结果"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "comprehensiveSearchMenu"
                    }
                }
            }, {
                opcode: "getSearchSuggest",
                blockType: Scratch.BlockType.REPORTER,
                text: "[NUM] 个 [STR] 搜索建议",
                arguments : {
                    NUM: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 10
                    },
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "Nevada"
                    }
                }
            }, {
                opcode: "getDailyRecommend",
                blockType: Scratch.BlockType.REPORTER,
                text: "每日推荐 [TYPE]",
                arguments : {
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "dailyRecommendMenu"
                    }
                }
            }, {
                opcode: "getNewSongs",
                blockType: Scratch.BlockType.REPORTER,
                text: "新歌速递 [TYPE] 地区 [AREA]",
                arguments : {
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "newSongInfoMenu"
                    },
                    AREA: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "areaMenu"
                    }
                }
            }, {
                opcode: "getResultInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "[STR] 中的 [TYPE]",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "搜索结果"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "resultInfoMenu"
                    }
                }
            }, {
                opcode: 'sepToplist',
                blockType: Scratch.BlockType.LABEL,
                text: '榜单'
            }, {
                opcode: "getAllToplists",
                blockType: Scratch.BlockType.REPORTER,
                text: "所有榜单"
            }, {
                opcode: "getToplistInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "所有榜单 [STR] 中的 [TYPE]",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "toplistInfoMenu"
                    }
                }
            }, {
                opcode: 'sepSongInfo',
                blockType: Scratch.BlockType.LABEL,
                text: '歌曲与歌手信息'
            }, {
                opcode: "getSongDetailJSON",
                blockType: Scratch.BlockType.REPORTER,
                text: "获取歌曲 [ID] 详情",
                arguments : {
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "3351299951"
                    }
                }
            }, {
                opcode: "parseSongDetail",
                blockType: Scratch.BlockType.REPORTER,
                text: "歌曲详情 [STR] 中的 [TYPE]",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "songDetailMenu"
                    }
                }
            }, {
                opcode: "getSongInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "获取歌曲 [ID] [TYPE] [LEVEL]",
                arguments : {
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "3351299951"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "songInfoMenu"
                    },
                    LEVEL: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "songLevelMenu"
                    }
                }
            }, {
                opcode: "getSongChorus",
                blockType: Scratch.BlockType.REPORTER,
                text: "获取歌曲 [ID] 副歌 [TYPE]",
                arguments : {
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "2058263032"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "chorusTypeMenu"
                    }
                }
            }, {
                opcode: "getSimilarContent",
                blockType: Scratch.BlockType.REPORTER,
                text: "[ID] 的相似 [TYPE]",
                arguments : {
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "3351299951"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "similarContentTypeMenu"
                    }
                }
            }, {
                opcode: "parseSimilarContent",
                blockType: Scratch.BlockType.REPORTER,
                text: "[JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "similarContentParseMenu"
                    }
                }
            }, {
                opcode: "getArtistDetailJSON",
                blockType: Scratch.BlockType.REPORTER,
                text: "获取歌手 [ID] 完整JSON",
                arguments : {
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "1007170"
                    }
                }
            }, {
                opcode: "getArtistInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "歌手JSON [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "artistInfoMenu"
                    }
                }
            }, {
                opcode: 'sepAlbum',
                blockType: Scratch.BlockType.LABEL,
                text: '专辑'
            }, {
                opcode: "getAlbumDetailJSON",
                blockType: Scratch.BlockType.REPORTER,
                text: "获取专辑 [ID] 完整JSON",
                arguments : {
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "350069603"
                    }
                }
            }, {
                opcode: "getAlbumInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "专辑JSON [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "albumDetailMenu"
                    }
                }
            }, {
                opcode: 'sepMV',
                blockType: Scratch.BlockType.LABEL,
                text: 'MV'
            }, {
                opcode: "getMVDetailJSON",
                blockType: Scratch.BlockType.REPORTER,
                text: "获取MV [ID] 完整JSON",
                arguments : {
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "34748786"
                    }
                }
            }, {
                opcode: "getMVInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "MV JSON [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "mvDetailMenu"
                    }
                }
            }, {
                opcode: 'sepPlaylist',
                blockType: Scratch.BlockType.LABEL,
                text: '歌单'
            }, {
                opcode: "getPlaylistDetailJSON",
                blockType: Scratch.BlockType.REPORTER,
                text: "获取歌单 [ID] 完整JSON",
                arguments : {
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "2222077236"
                    }
                }
            }, {
                opcode: "getPlaylistInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "歌单JSON [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "playlistInfoMenu"
                    }
                }
            }, {
                opcode: 'sepUser',
                blockType: Scratch.BlockType.LABEL,
                text: '用户'
            }, {
                opcode: "getUserDetailJSON",
                blockType: Scratch.BlockType.REPORTER,
                text: "获取用户 [ID] 详情JSON",
                arguments : {
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "1"
                    }
                }
            }, {
                opcode: "getUserPlaylistJSON",
                blockType: Scratch.BlockType.REPORTER,
                text: "获取用户 [ID] 歌单JSON",
                arguments : {
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "1"
                    }
                }
            }, {
                opcode: "parseUserPlaylist",
                blockType: Scratch.BlockType.REPORTER,
                text: "用户歌单JSON [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "userPlaylistParseMenu"
                    }
                }
            }, {
                opcode: "getUserInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "用户JSON [JSON] 中的 [TYPE]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "userInfoMenu"
                    }
                }
            }, {
                opcode: 'sepComment',
                blockType: Scratch.BlockType.LABEL,
                text: '评论'
            }, {
                opcode: "getHotComments",
                blockType: Scratch.BlockType.REPORTER,
                text: "获取 [TYPE_ID] [ID] 的热评 [INFO] 数量 [NUM]",
                arguments : {
                    TYPE_ID: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "commentTypeMenu"
                    },
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "3351299951"
                    },
                    INFO: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "commentInfoMenu"
                    },
                    NUM: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 10
                    }
                }
            }, {
                opcode: 'sepLyric',
                blockType: Scratch.BlockType.LABEL,
                text: '歌词'
            }, {
                opcode: "getLyricInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "获取歌词 [ID] [TYPE]",
                arguments : {
                    ID: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "26092806"
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "lyricInfoMenu"
                    }
                }
            }, {
                opcode: "parseLyric",
                blockType: Scratch.BlockType.REPORTER,
                text: "歌词 [STR] 中的 [TYPE]",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "lyricParseMenu"
                    }
                }
            }, {
                opcode: "getLyricLine",
                blockType: Scratch.BlockType.REPORTER,
                text: "歌词 [STR] 第 [N] 句的 [TYPE]",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    N: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "lyricLineMenu"
                    }
                }
            }, {
                opcode: "getLyricAtSecond",
                blockType: Scratch.BlockType.REPORTER,
                text: "歌词 [STR] 第 [N] 秒的歌词",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    N: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 0
                    }
                }
            }, {
                opcode: "getYrcLineInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "逐字歌词 [STR] 第 [N] 行的 [TYPE]",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    N: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "yrcLineInfoMenu"
                    }
                }
            }, {
                opcode: "getYrcWordInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "逐字歌词 [STR] 第 [N] 行第 [M] 个字的 [TYPE]",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: ""
                    },
                    N: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                    M: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                    TYPE: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "yrcWordInfoMenu"
                    }
                }
            }, {
                opcode: 'sepTime',
                blockType: Scratch.BlockType.LABEL,
                text: '时间与时间戳'
            }, {
                opcode: "timeToSeconds",
                blockType: Scratch.BlockType.REPORTER,
                text: "时间 [TIME] 转秒",
                arguments : {
                    TIME: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "03:45.50"
                    }
                }
            }, {
                opcode: "secondsToTime",
                blockType: Scratch.BlockType.REPORTER,
                text: "秒 [SECONDS] 转时间",
                arguments : {
                    SECONDS: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 225.5
                    }
                }
            }, {
                opcode: "getTimestampInfo",
                blockType: Scratch.BlockType.REPORTER,
                text: "时间戳 [TIME] 的 [INFO]",
                arguments : {
                    TIME: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "1777593600"
                    },
                    INFO: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "timestampInfoMenu"
                    }
                }
            }, {
                opcode: 'sepArray',
                blockType: Scratch.BlockType.LABEL,
                text: 'JSON相关'
            }, {
                opcode: "getJsonValue",
                blockType: Scratch.BlockType.REPORTER,
                text: "[JSON] 中的 [STR]",
                arguments : {
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: '{"a":"1","b":"2"}'
                    },
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "a"
                    }
                }
            }, {
                opcode: "getArrayItem",
                blockType: Scratch.BlockType.REPORTER,
                text: "[OBJECT] 的第 [N] 项",
                arguments : {
                    OBJECT: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "[1,2,3]"
                    },
                    N: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1
                    }
                }
            }, {
                opcode: "getArrayLength",
                blockType: Scratch.BlockType.REPORTER,
                text: "[OBJECT] 的项目数",
                arguments : {
                    OBJECT: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "[1,2,3]"
                    }
                }
            }, {
                opcode: "getListAsArray",
                blockType: Scratch.BlockType.REPORTER,
                text: "[LIST] 列表转数组",
                disableMonitor: true,
                arguments : {
                    LIST: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "listMenu"
                    }
                }
            }, {
                opcode: "setListFromArray",
                blockType: Scratch.BlockType.COMMAND,
                text: "将列表 [LIST] 设为数组 [JSON]",
                arguments : {
                    LIST: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "listMenu"
                    },
                    JSON : {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: '[1, 2, 3]'
                    }
                }
            }, {
                opcode: "appendArrayToList",
                blockType: Scratch.BlockType.COMMAND,
                text: "把 [STR] 加入到 [LIST]",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: '["a","b","c"]'
                    },
                    LIST: {
                        type: Scratch.ArgumentType.STRING,
                        menu: "listMenu"
                    }
                }
            }, // ===== 新增：字符串操作积木 =====
            {
                opcode: 'sepString',
                blockType: Scratch.BlockType.LABEL,
                text: '字符串'
            }, {
                opcode: "strOccurrences",
                blockType: Scratch.BlockType.REPORTER,
                text: "[STR] 在 [STR2] 中出现的次数",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "岁"
                    },
                    STR2: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "万岁万岁万万岁"
                    }
                }
            }, {
                opcode: "strOccurLine",
                blockType: Scratch.BlockType.REPORTER,
                text: "[STR] 在 [STR2] 第 [N] 次出现的行数",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "岁"
                    },
                    STR2: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "万岁万岁万万岁"
                    },
                    N: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1
                    }
                }
            }, {
                opcode: "strOccurPos",
                blockType: Scratch.BlockType.REPORTER,
                text: "[STR] 在 [STR2] 第 [N] 次出现的位置",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "岁"
                    },
                    STR2: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "万岁万岁万万岁"
                    },
                    N: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1
                    }
                }
            }, {
                opcode: "strSubstring",
                blockType: Scratch.BlockType.REPORTER,
                text: "[STR] 的第 [N] 至 [N2] 个字符",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "万岁万岁万万岁"
                    },
                    N: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                    N2: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 3
                    }
                }
            }, {
                opcode: "strGetLine",
                blockType: Scratch.BlockType.REPORTER,
                text: "[STR] 的第 [N] 行内容",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "苹果\n香蕉\n草莓"
                    },
                    N: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 2
                    }
                }
            }, {
                opcode: "strGetLines",
                blockType: Scratch.BlockType.REPORTER,
                text: "[STR] 的第 [N] 行至 [N2] 行内容",
                arguments : {
                    STR: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "苹果\n香蕉\n草莓"
                    },
                    N: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                    N2: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 2
                    }
                }
            }, {
                opcode: "newlineChar",
                blockType: Scratch.BlockType.REPORTER,
                text: "换行符"
            }, {
                opcode: 'sepPlayer',
                blockType: Scratch.BlockType.LABEL,
                text: '播放相关'
            }, {
                opcode: 'loadAudio',
                blockType: Scratch.BlockType.COMMAND,
                text: '加载 [URL]',
                arguments : {
                    URL: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: 'https://music.163.com/song/media/outer/url?id=3351299951'
                    }
                }
            }, {
                opcode: 'playAudio',
                blockType: Scratch.BlockType.COMMAND,
                text: '播放'
            }, {
                opcode: 'pauseAudio',
                blockType: Scratch.BlockType.COMMAND,
                text: '暂停'
            }, {
                opcode: 'stopAudio',
                blockType: Scratch.BlockType.COMMAND,
                text: '停止'
            }, {
                opcode: 'setPlaybackRate',
                blockType: Scratch.BlockType.COMMAND,
                text: '设置播放倍速 [SPEED]x',
                arguments : {
                    SPEED: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1.0
                    }
                }
            }, {
                opcode: 'seekToTime',
                blockType: Scratch.BlockType.COMMAND,
                text: '跳转到 [TIME] 秒',
                arguments : {
                    TIME: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 0
                    }
                }
            }, {
                opcode: 'setVolume',
                blockType: Scratch.BlockType.COMMAND,
                text: '设置音量 [VOLUME]%',
                arguments : {
                    VOLUME: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 100
                    }
                }
            }, {
                opcode: 'setTimeDecimalPlaces',
                blockType: Scratch.BlockType.COMMAND,
                text: '播放时间小数位数设为 [NUM]',
                arguments : {
                    NUM: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 2
                    }
                }
            }, {
                opcode: 'checkUrlValid',
                blockType: Scratch.BlockType.BOOLEAN,
                text: "链接 [URL] 有效？",
                arguments : {
                    URL: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: "https://music.163.com"
                    }
                }
            }, {
                opcode: 'getPlaybackRate',
                blockType: Scratch.BlockType.REPORTER,
                text: '当前播放倍速'
            }, {
                opcode: 'getCurrentTime',
                blockType: Scratch.BlockType.REPORTER,
                text: '当前播放时长'
            }, {
                opcode: 'getDuration',
                blockType: Scratch.BlockType.REPORTER,
                text: '总时长'
            }, {
                opcode: 'getVolume',
                blockType: Scratch.BlockType.REPORTER,
                text: '当前音量'
            }, {
                opcode: 'getTimeDecimalPlaces',
                blockType: Scratch.BlockType.REPORTER,
                text: '播放时间小数位数'
            }, {
                opcode: 'isPlaying',
                blockType: Scratch.BlockType.BOOLEAN,
                text: '正在播放？'
            }, {
                opcode: 'sepSpectrum',
                blockType: Scratch.BlockType.LABEL,
                text: '频谱分析'
            }, {
                opcode: 'getFrequencyDomain',
                blockType: Scratch.BlockType.REPORTER,
                text: '频率域 [NUM]',
                arguments : {
                    NUM: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 128
                    }
                }
            }, {
                opcode: 'getWaveform',
                blockType: Scratch.BlockType.REPORTER,
                text: '时域波形 [NUM]',
                arguments : {
                    NUM: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 128
                    }
                }
            }, {
                opcode: 'getFrequencyAt',
                blockType: Scratch.BlockType.REPORTER,
                text: '频率索引 [INDEX] 的值',
                arguments : {
                    INDEX: {
                        type: Scratch.ArgumentType.NUMBER,
                        defaultValue: 1
                    }
                }
            }, {
                opcode: 'getAverageVolume',
                blockType: Scratch.BlockType.REPORTER,
                text: '平均音量'
            }
            ], menus: {
                chorusTypeMenu: {
                    acceptReporters: true,
                    items: [
                        { text: "开始时间", value: "startTime" },
                        { text: "结束时间", value: "endTime" },
                        { text: "持续时间", value: "duration" }
                    ]
                },
                unifiedSearchTypeMenu: {
                    acceptReporters: true, items: [{
                        text: "单曲",
                        value: "1"
                    }, {
                        text: "专辑",
                        value: "10"
                    }, {
                        text: "歌手",
                        value: "100"
                    }, {
                        text: "歌单",
                        value: "1000"
                    }, {
                        text: "用户",
                        value: "1002"
                    }, {
                        text: "MV",
                        value: "1004"
                    }, {
                        text: "歌词",
                        value: "1006"
                    }, {
                        text: "电台/播客",
                        value: "1009"
                    }, {
                        text: "视频",
                        value: "1014"
                    }
                    ]
                }, 
                songSearchMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "ID",
                        value: "id"
                    }, {
                        text: "作者名",
                        value: "artistName"
                    }, {
                        text: "作者ID",
                        value: "artistId"
                    }, {
                        text: "所属专辑名",
                        value: "albumName"
                    }, {
                        text: "所属专辑ID",
                        value: "albumId"
                    }, {
                        text: "专辑封面",
                        value: "albumCover"
                    }, {
                        text: "时长(ms)",
                        value: "duration"
                    }, {
                        text: "时长(秒)",
                        value: "durationSec"
                    }, {
                        text: "fee",
                        value: "fee"
                    }, {
                        text: "翻译名数组",
                        value: "tns"
                    }, {
                        text: "别名数组",
                        value: "alia"
                    }, {
                        text: "MV ID",
                        value: "mvId"
                    }, {
                        text: "音质标识",
                        value: "flag"
                    }, {
                        text: "版权标识",
                        value: "copyright"
                    }, {
                        text: "热度",
                        value: "popularity"
                    }, {
                        text: "发布时间",
                        value: "publishTime"
                    }, {
                        text: "完整JSON数组",
                        value: "__json_array__"
                    }
                    ]
                }, albumSearchMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "ID",
                        value: "id"
                    }, {
                        text: "作者名",
                        value: "artistName"
                    }, {
                        text: "作者ID",
                        value: "artistId"
                    }, {
                        text: "描述",
                        value: "description"
                    }, {
                        text: "歌曲数",
                        value: "trackCount"
                    }, {
                        text: "发行时间",
                        value: "publishTime"
                    }, {
                        text: "公司",
                        value: "company"
                    }, {
                        text: "标签数组",
                        value: "tags"
                    }, {
                        text: "封面图",
                        value: "picUrl"
                    }, {
                        text: "简介",
                        value: "briefDesc"
                    }, {
                        text: "类型",
                        value: "type"
                    }, {
                        text: "大小",
                        value: "size"
                    }, {
                        text: "状态",
                        value: "status"
                    }, {
                        text: "完整JSON数组",
                        value: "__json_array__"
                    }
                    ]
                }, artistSearchMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "ID",
                        value: "id"
                    }, {
                        text: "别名数组",
                        value: "alias"
                    }, {
                        text: "头像",
                        value: "picUrl"
                    }, {
                        text: "简介",
                        value: "briefDesc"
                    }, {
                        text: "歌曲数",
                        value: "musicSize"
                    }, {
                        text: "MV数",
                        value: "mvSize"
                    }, {
                        text: "专辑数",
                        value: "albumSize"
                    }, {
                        text: "粉丝数",
                        value: "fansCount"
                    }, {
                        text: "账号类型",
                        value: "accountId"
                    }, {
                        text: "完整JSON数组",
                        value: "__json_array__"
                    }
                    ]
                }, playlistSearchMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "ID",
                        value: "id"
                    }, {
                        text: "描述",
                        value: "description"
                    }, {
                        text: "创建者昵称",
                        value: "creatorNickname"
                    }, {
                        text: "创建者ID",
                        value: "creatorId"
                    }, {
                        text: "播放数",
                        value: "playCount"
                    }, {
                        text: "收藏数",
                        value: "bookCount"
                    }, {
                        text: "分享数",
                        value: "shareCount"
                    }, {
                        text: "歌曲数",
                        value: "trackCount"
                    }, {
                        text: "封面图",
                        value: "coverImgUrl"
                    }, {
                        text: "标签数组",
                        value: "tags"
                    }, {
                        text: "创建时间",
                        value: "createTime"
                    }, {
                        text: "更新时间",
                        value: "updateTime"
                    }, {
                        text: "是否官方?",
                        value: "official"
                    }, {
                        text: "完整JSON数组",
                        value: "__json_array__"
                    }
                    ]
                }, userSearchMenu: {
                    acceptReporters: true, items: [{
                        text: "昵称",
                        value: "nickname"
                    }, {
                        text: "ID",
                        value: "userId"
                    }, {
                        text: "签名",
                        value: "signature"
                    }, {
                        text: "头像",
                        value: "avatarUrl"
                    }, {
                        text: "背景图",
                        value: "backgroundUrl"
                    }, {
                        text: "性别",
                        value: "gender"
                    }, {
                        text: "等级",
                        value: "level"
                    }, {
                        text: "粉丝数",
                        value: "followeds"
                    }, {
                        text: "关注数",
                        value: "follows"
                    }, {
                        text: "动态数",
                        value: "eventCount"
                    }, {
                        text: "VIP类型",
                        value: "vipType"
                    }, {
                        text: "是否认证?",
                        value: "authStatus"
                    }, {
                        text: "完整JSON数组",
                        value: "__json_array__"
                    }
                    ]
                }, mvSearchMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "ID",
                        value: "id"
                    }, {
                        text: "艺术家名",
                        value: "artistName"
                    }, {
                        text: "艺术家ID",
                        value: "artistId"
                    }, {
                        text: "播放数",
                        value: "playCount"
                    }, {
                        text: "时长(ms)",
                        value: "duration"
                    }, {
                        text: "时长(秒)",
                        value: "durationSec"
                    }, {
                        text: "封面",
                        value: "cover"
                    }, {
                        text: "简介",
                        value: "desc"
                    }, {
                        text: "点赞数",
                        value: "praisedCount"
                    }, {
                        text: "评论数",
                        value: "commentCount"
                    }, {
                        text: "分享数",
                        value: "shareCount"
                    }, {
                        text: "发布时间",
                        value: "publishTime"
                    }, {
                        text: "完整JSON数组",
                        value: "__json_array__"
                    }
                    ]
                },
                lyricSearchMenu: {
                    acceptReporters: true, items: [{
                        text: "歌曲名",
                        value: "name"
                    }, {
                        text: "歌曲ID",
                        value: "id"
                    }, {
                        text: "艺术家名",
                        value: "artistName"
                    }, {
                        text: "艺术家ID",
                        value: "artistId"
                    }, {
                        text: "专辑名",
                        value: "albumName"
                    }, {
                        text: "专辑ID",
                        value: "albumId"
                    }, {
                        text: "歌词纯文本",
                        value: "lyricText"
                    }, {
                        text: "歌词时间轴范围",
                        value: "lyricRange"
                    }, {
                        text: "时长(ms)",
                        value: "duration"
                    }, {
                        text: "时长(秒)",
                        value: "durationSec"
                    }, {
                        text: "翻译名数组",
                        value: "transNames"
                    }, {
                        text: "别名数组",
                        value: "alias"
                    }, {
                        text: "MV ID",
                        value: "mvid"
                    }, {
                        text: "fee",
                        value: "fee"
                    }, {
                        text: "算法标识(alg)",
                        value: "alg"
                    }, {
                        text: "mark",
                        value: "mark"
                    }, {
                        text: "完整JSON数组",
                        value: "__json_array__"
                    }
                    ]
                }, djRadioSearchMenu: {
                    acceptReporters: true, items: [{
                        text: "电台名",
                        value: "name"
                    }, {
                        text: "电台ID",
                        value: "id"
                    }, {
                        text: "DJ名",
                        value: "djName"
                    }, {
                        text: "DJ ID",
                        value: "djId"
                    }, {
                        text: "描述",
                        value: "desc"
                    }, {
                        text: "分类",
                        value: "category"
                    }, {
                        text: "二级分类",
                        value: "secondCategory"
                    }, {
                        text: "节目数",
                        value: "programCount"
                    }, {
                        text: "订阅数",
                        value: "subscribedCount"
                    }, {
                        text: "封面",
                        value: "picUrl"
                    }, {
                        text: "最新节目ID",
                        value: "lastProgramId"
                    }, {
                        text: "DJ头像",
                        value: "djAvatar"
                    }, {
                        text: "完整JSON数组",
                        value: "__json_array__"
                    }
                    ]
                }, videoSearchMenu: {
                    acceptReporters: true, items: [{
                        text: "标题",
                        value: "title"
                    }, {
                        text: "VID",
                        value: "vid"
                    }, {
                        text: "播放数",
                        value: "playCount"
                    }, {
                        text: "时长(ms)",
                        value: "durationms"
                    }, {
                        text: "时长(秒)",
                        value: "durationSec"
                    }, {
                        text: "封面",
                        value: "coverUrl"
                    }, {
                        text: "创作者名",
                        value: "creatorName"
                    }, {
                        text: "点赞数",
                        value: "praisedCount"
                    }, {
                        text: "评论数",
                        value: "commentCount"
                    }, {
                        text: "分享数",
                        value: "shareCount"
                    }, {
                        text: "发布时间",
                        value: "publishTime"
                    }, {
                        text: "完整JSON数组",
                        value: "__json_array__"
                    }
                    ]
                }, similarContentTypeMenu: {
                    acceptReporters: true, items: [{
                        text: "歌曲",
                        value: "song"
                    }, {
                        text: "歌单",
                        value: "playlist"
                    }, {
                        text: "歌手",
                        value: "artist"
                    }, {
                        text: "MV",
                        value: "mv"
                    }
                    ]
                }, similarContentParseMenu: {
                    acceptReporters: true, items: [{
                        text: "--- 相似歌曲 ---",
                        value: "__sep_simi_song__"
                    }, {
                        text: "歌曲名",
                        value: "simiSong_name"
                    }, {
                        text: "歌曲ID",
                        value: "simiSong_id"
                    }, {
                        text: "专辑名",
                        value: "simiSong_albumName"
                    }, {
                        text: "专辑ID",
                        value: "simiSong_albumId"
                    }, {
                        text: "作者名",
                        value: "simiSong_artistName"
                    }, {
                        text: "作者ID",
                        value: "simiSong_artistId"
                    }, {
                        text: "作者头像URL",
                        value: "simiSong_artistAvatar"
                    }, {
                        text: "相似歌曲JSON数组",
                        value: "simiSong_jsonArray"
                    }, {
                        text: "--- 相似歌单 ---",
                        value: "__sep_simi_playlist__"
                    }, {
                        text: "歌单名",
                        value: "simiPlaylist_name"
                    }, {
                        text: "歌单ID",
                        value: "simiPlaylist_id"
                    }, {
                        text: "描述",
                        value: "simiPlaylist_description"
                    }, {
                        text: "创建者昵称",
                        value: "simiPlaylist_creatorNickname"
                    }, {
                        text: "创建者ID",
                        value: "simiPlaylist_creatorId"
                    }, {
                        text: "播放数",
                        value: "simiPlaylist_playCount"
                    }, {
                        text: "歌曲数",
                        value: "simiPlaylist_trackCount"
                    }, {
                        text: "封面图",
                        value: "simiPlaylist_coverImgUrl"
                    }, {
                        text: "相似歌单JSON数组",
                        value: "simiPlaylist_jsonArray"
                    }, {
                        text: "--- 相似歌手 ---",
                        value: "__sep_simi_artist__"
                    }, {
                        text: "歌手名",
                        value: "simiArtist_name"
                    }, {
                        text: "歌手ID",
                        value: "simiArtist_id"
                    }, {
                        text: "别名数组",
                        value: "simiArtist_alias"
                    }, {
                        text: "头像",
                        value: "simiArtist_picUrl"
                    }, {
                        text: "简介",
                        value: "simiArtist_briefDesc"
                    }, {
                        text: "相似歌手JSON数组",
                        value: "simiArtist_jsonArray"
                    }, {
                        text: "--- 相似MV ---",
                        value: "__sep_simi_mv__"
                    }, {
                        text: "MV名",
                        value: "simiMV_name"
                    }, {
                        text: "MV ID",
                        value: "simiMV_id"
                    }, {
                        text: "艺术家名",
                        value: "simiMV_artistName"
                    }, {
                        text: "艺术家ID",
                        value: "simiMV_artistId"
                    }, {
                        text: "播放数",
                        value: "simiMV_playCount"
                    }, {
                        text: "时长(ms)",
                        value: "simiMV_duration"
                    }, {
                        text: "封面",
                        value: "simiMV_cover"
                    }, {
                        text: "相似MV JSON数组",
                        value: "simiMV_jsonArray"
                    }
                    ]
                }, comprehensiveSearchMenu: {
                    acceptReporters: true, items: [{
                        text: "--- 歌曲 ---",
                        value: "__sep_song__"
                    }, {
                        text: "歌曲名数组",
                        value: "songNames"
                    }, {
                        text: "歌曲ID数组",
                        value: "songIds"
                    }, {
                        text: "歌曲JSON数组",
                        value: "songJsonArray"
                    }, {
                        text: "歌曲数量",
                        value: "songCount"
                    }, {
                        text: "--- 专辑 ---",
                        value: "__sep_album__"
                    }, {
                        text: "专辑名数组",
                        value: "albumNames"
                    }, {
                        text: "专辑ID数组",
                        value: "albumIds"
                    }, {
                        text: "专辑JSON数组",
                        value: "albumJsonArray"
                    }, {
                        text: "专辑数量",
                        value: "albumCount"
                    }, {
                        text: "--- 歌手 ---",
                        value: "__sep_artist__"
                    }, {
                        text: "歌手名数组",
                        value: "artistNames"
                    }, {
                        text: "歌手ID数组",
                        value: "artistIds"
                    }, {
                        text: "歌手JSON数组",
                        value: "artistJsonArray"
                    }, {
                        text: "歌手数量",
                        value: "artistCount"
                    }, {
                        text: "--- 歌单 ---",
                        value: "__sep_playlist__"
                    }, {
                        text: "歌单名数组",
                        value: "playlistNames"
                    }, {
                        text: "歌单ID数组",
                        value: "playlistIds"
                    }, {
                        text: "歌单JSON数组",
                        value: "playlistJsonArray"
                    }, {
                        text: "歌单数量",
                        value: "playlistCount"
                    }, {
                        text: "--- MV ---",
                        value: "__sep_mv__"
                    }, {
                        text: "MV名数组",
                        value: "mvNames"
                    }, {
                        text: "MV ID数组",
                        value: "mvIds"
                    }, {
                        text: "MV JSON数组",
                        value: "mvJsonArray"
                    }, {
                        text: "MV数量",
                        value: "mvCount"
                    }, {
                        text: "--- 视频 ---",
                        value: "__sep_video__"
                    }, {
                        text: "视频名数组",
                        value: "videoNames"
                    }, {
                        text: "视频VID数组",
                        value: "videoVids"
                    }, {
                        text: "视频JSON数组",
                        value: "videoJsonArray"
                    }, {
                        text: "视频数量",
                        value: "videoCount"
                    }, {
                        text: "--- 用户 ---",
                        value: "__sep_user__"
                    }, {
                        text: "用户名数组",
                        value: "userNames"
                    }, {
                        text: "用户ID数组",
                        value: "userIds"
                    }, {
                        text: "用户JSON数组",
                        value: "userJsonArray"
                    }, {
                        text: "用户数量",
                        value: "userCount"
                    }, {
                        text: "--- 其他 ---",
                        value: "__sep_other__"
                    }, {
                        text: "完整JSON",
                        value: "__raw_json__"
                    }
                    ]
                }, dailyRecommendMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "ID",
                        value: "id"
                    }, {
                        text: "fee",
                        value: "fee"
                    }, {
                        text: "作者名",
                        value: "artistName"
                    }, {
                        text: "作者ID",
                        value: "artistId"
                    }, {
                        text: "所在专辑名",
                        value: "albumName"
                    }, {
                        text: "所在专辑ID",
                        value: "albumId"
                    }, {
                        text: "封面",
                        value: "coverUrl"
                    }, {
                        text: "时长",
                        value: "duration"
                    }
                    ]
                }, newSongInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "ID",
                        value: "id"
                    }, {
                        text: "作者名",
                        value: "artistName"
                    }, {
                        text: "作者ID",
                        value: "artistId"
                    }, {
                        text: "专辑名",
                        value: "albumName"
                    }, {
                        text: "封面",
                        value: "coverUrl"
                    }, {
                        text: "时长",
                        value: "duration"
                    }, {
                        text: "fee",
                        value: "fee"
                    }
                    ]
                }, areaMenu: {
                    acceptReporters: true, items: [{
                        text: "全部",
                        value: "0"
                    }, {
                        text: "华语",
                        value: "7"
                    }, {
                        text: "欧美",
                        value: "96"
                    }, {
                        text: "日本",
                        value: "8"
                    }, {
                        text: "韩国",
                        value: "16"
                    }
                    ]
                }, resultInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "--- 通用 ---",
                        value: "__sep_general__"
                    }, {
                        text: "名",
                        value: "name"
                    }, {
                        text: "ID",
                        value: "id"
                    }, {
                        text: "完整JSON",
                        value: "__raw_json__"
                    }, {
                        text: "--- 创作者/艺术家 ---",
                        value: "__sep_artist__"
                    }, {
                        text: "作者名",
                        value: "artistName"
                    }, {
                        text: "作者ID",
                        value: "artistId"
                    }, {
                        text: "作者头像",
                        value: "artistAvatar"
                    }, {
                        text: "--- 单曲 ---",
                        value: "__sep_song__"
                    }, {
                        text: "翻译名数组",
                        value: "tns"
                    }, {
                        text: "别名数组",
                        value: "alia"
                    }, {
                        text: "fee",
                        value: "fee"
                    }, {
                        text: "时长(ms)",
                        value: "duration"
                    }, {
                        text: "所属专辑名",
                        value: "albumName"
                    }, {
                        text: "所属专辑ID",
                        value: "albumId"
                    }, {
                        text: "专辑封面",
                        value: "albumCover"
                    }, {
                        text: "MV ID",
                        value: "mvId"
                    }, {
                        text: "音质标识",
                        value: "privilegeFlag"
                    }, {
                        text: "--- 专辑 ---",
                        value: "__sep_album__"
                    }, {
                        text: "专辑描述",
                        value: "description"
                    }, {
                        text: "标签数组",
                        value: "tags"
                    }, {
                        text: "歌曲数",
                        value: "trackCount"
                    }, {
                        text: "发行时间",
                        value: "publishTime"
                    }, {
                        text: "公司",
                        value: "company"
                    }, {
                        text: "简介",
                        value: "briefDesc"
                    }, {
                        text: "--- 歌单 ---",
                        value: "__sep_playlist__"
                    }, {
                        text: "歌单描述",
                        value: "playlistDescription"
                    }, {
                        text: "歌单标签",
                        value: "playlistTags"
                    }, {
                        text: "播放数",
                        value: "playCount"
                    }, {
                        text: "收藏数",
                        value: "bookCount"
                    }, {
                        text: "分享数",
                        value: "shareCount"
                    }, {
                        text: "创建者昵称",
                        value: "creatorNickname"
                    }, {
                        text: "创建者ID",
                        value: "creatorId"
                    }, {
                        text: "创建者头像",
                        value: "creatorAvatar"
                    }, {
                        text: "封面图",
                        value: "coverImgUrl"
                    }, {
                        text: "更新时间",
                        value: "updateTime"
                    }, {
                        text: "创建时间",
                        value: "createTime"
                    }, {
                        text: "--- 用户 ---",
                        value: "__sep_user__"
                    }, {
                        text: "昵称",
                        value: "nickname"
                    }, {
                        text: "签名",
                        value: "signature"
                    }, {
                        text: "头像",
                        value: "avatarUrl"
                    }, {
                        text: "背景图",
                        value: "backgroundUrl"
                    }, {
                        text: "性别",
                        value: "gender"
                    }, {
                        text: "等级",
                        value: "level"
                    }, {
                        text: "粉丝数",
                        value: "followeds"
                    }, {
                        text: "关注数",
                        value: "follows"
                    }, {
                        text: "动态数",
                        value: "eventCount"
                    }, {
                        text: "VIP类型",
                        value: "vipType"
                    }, {
                        text: "是否认证",
                        value: "authStatus"
                    }, {
                        text: "认证信息",
                        value: "authority"
                    }, {
                        text: "--- MV ---",
                        value: "__sep_mv__"
                    }, {
                        text: "MV标题",
                        value: "mvTitle"
                    }, {
                        text: "MV播放数",
                        value: "mvPlayCount"
                    }, {
                        text: "MV时长(ms)",
                        value: "mvDuration"
                    }, {
                        text: "MV封面",
                        value: "mvCover"
                    }, {
                        text: "MV艺术家名",
                        value: "mvArtistName"
                    }, {
                        text: "MV艺术家ID",
                        value: "mvArtistId"
                    }, {
                        text: "--- 歌词 ---",
                        value: "__sep_lyric__"
                    }, {
                        text: "歌词内容",
                        value: "lyricContent"
                    }, {
                        text: "歌词来源歌曲名",
                        value: "lyricSongName"
                    }, {
                        text: "歌词来源歌曲ID",
                        value: "lyricSongId"
                    }, {
                        text: "歌词来源艺术家",
                        value: "lyricArtistName"
                    }, {
                        text: "--- 主播电台 ---",
                        value: "__sep_djradio__"
                    }, {
                        text: "电台名",
                        value: "djRadioName"
                    }, {
                        text: "电台ID",
                        value: "djRadioId"
                    }, {
                        text: "电台描述",
                        value: "djRadioDesc"
                    }, {
                        text: "电台分类",
                        value: "djRadioCategory"
                    }, {
                        text: "电台节目数",
                        value: "djRadioProgramCount"
                    }, {
                        text: "电台订阅数",
                        value: "djRadioSubscribedCount"
                    }, {
                        text: "电台DJ名",
                        value: "djName"
                    }, {
                        text: "电台DJ ID",
                        value: "djId"
                    }, {
                        text: "电台DJ头像",
                        value: "djAvatar"
                    }, {
                        text: "电台封面",
                        value: "djRadioCover"
                    }, {
                        text: "--- 视频 ---",
                        value: "__sep_video__"
                    }, {
                        text: "视频标题",
                        value: "videoTitle"
                    }, {
                        text: "视频播放数",
                        value: "videoPlayCount"
                    }, {
                        text: "视频时长(ms)",
                        value: "videoDuration"
                    }, {
                        text: "视频封面",
                        value: "videoCover"
                    }, {
                        text: "视频VID",
                        value: "vid"
                    }, {
                        text: "--- 搜索建议 ---",
                        value: "__sep_suggest__"
                    }, {
                        text: "关键词",
                        value: "keyword"
                    }, {
                        text: "高亮关键词",
                        value: "highlightKeyword"
                    }
                    ]
                }, songDetailMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "ID",
                        value: "id"
                    }, {
                        text: "作者名",
                        value: "artistName"
                    }, {
                        text: "作者ID",
                        value: "artistId"
                    }, {
                        text: "所属专辑名",
                        value: "albumName"
                    }, {
                        text: "所属专辑ID",
                        value: "albumId"
                    }, {
                        text: "封面",
                        value: "coverUrl"
                    }, {
                        text: "时长(ms)",
                        value: "duration"
                    }, {
                        text: "时长(秒)",
                        value: "durationSec"
                    }, {
                        text: "翻译名",
                        value: "transName"
                    }, {
                        text: "别名数组",
                        value: "alias"
                    }, {
                        text: "MV ID",
                        value: "mvid"
                    }, {
                        text: "fee",
                        value: "fee"
                    }, {
                        text: "版权标识(copyright)",
                        value: "copyright"
                    }, {
                        text: "热度(popularity)",
                        value: "popularity"
                    }, {
                        text: "发布时间(publishTime)",
                        value: "publishTime"
                    }, {
                        text: "完整JSON",
                        value: "__raw_json__"
                    }
                    ]
                }, artistInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "别名数组",
                        value: "alias"
                    }, {
                        text: "粉丝数",
                        value: "fansCount"
                    }, {
                        text: "歌曲数",
                        value: "musicSize"
                    }, {
                        text: "MV数",
                        value: "mvSize"
                    }, {
                        text: "简介",
                        value: "briefDesc"
                    }, {
                        text: "头像",
                        value: "picUrl"
                    }
                    ]
                }, songInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "URL-1",
                        value: "url1"
                    }, {
                        text: "URL-2",
                        value: "url2"
                    }, {
                        text: "URL-3",
                        value: "url3"
                    }, {
                        text: "URL-4",
                        value: "url4"
                    }, {
                        text: "URL-5",
                        value: "url5"
                    }
                    ]
                }, albumDetailMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "创建者",
                        value: "artistName"
                    }, {
                        text: "创建者ID",
                        value: "artistId"
                    }, {
                        text: "所有歌曲名",
                        value: "songNames"
                    }, {
                        text: "所有歌曲ID",
                        value: "songIds"
                    }, {
                        text: "创建时间",
                        value: "publishTime"
                    }
                    ]
                }, mvDetailMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "创建者",
                        value: "artistName"
                    }, {
                        text: "创建者ID",
                        value: "artistId"
                    }, {
                        text: "简介",
                        value: "desc"
                    }, {
                        text: "封面",
                        value: "coverUrl"
                    }, {
                        text: "播放数",
                        value: "playCount"
                    }, {
                        text: "点赞数",
                        value: "likeCount"
                    }, {
                        text: "分享数",
                        value: "shareCount"
                    }, {
                        text: "评论数",
                        value: "commentCount"
                    }, {
                        text: "上传时间",
                        value: "publishTime"
                    }, {
                        text: "画质数组",
                        value: "resolutions"
                    }, {
                        text: "播放直链数组",
                        value: "videoUrls"
                    }, {
                        text: "评论ID",
                        value: "commentThreadId"
                    }
                    ]
                }, playlistInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "简介",
                        value: "description"
                    }, {
                        text: "创建时间",
                        value: "createTime"
                    }, {
                        text: "标签",
                        value: "tags"
                    }, {
                        text: "歌曲名",
                        value: "trackNames"
                    }, {
                        text: "歌曲ID",
                        value: "trackIds"
                    }, {
                        text: "创建者",
                        value: "creatorName"
                    }, {
                        text: "创建者ID",
                        value: "creatorId"
                    }
                    ]
                }, userPlaylistParseMenu: {
                    acceptReporters: true, items: [{
                        text: "歌单数组",
                        value: "names"
                    }, {
                        text: "歌单ID数组",
                        value: "ids"
                    }, {
                        text: "歌单创建者数组",
                        value: "creators"
                    }, {
                        text: "歌单创建者ID数组",
                        value: "creatorIds"
                    }, {
                        text: "歌单创建时间数组",
                        value: "createTime"
                    }, {
                        text: "歌单JSON数组",
                        value: "jsonArray"
                    }, {
                        text: "歌单数量",
                        value: "count"
                    }
                    ]
                }, userInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "昵称",
                        value: "nickname"
                    }, {
                        text: "签名",
                        value: "signature"
                    }, {
                        text: "头像",
                        value: "avatarUrl"
                    }, {
                        text: "背景图",
                        value: "backgroundUrl"
                    }, {
                        text: "性别",
                        value: "gender"
                    }, {
                        text: "等级",
                        value: "level"
                    }, {
                        text: "粉丝数",
                        value: "followeds"
                    }, {
                        text: "关注数",
                        value: "follows"
                    }, {
                        text: "动态数",
                        value: "eventCount"
                    }, {
                        text: "歌单名数组",
                        value: "playlistNames"
                    }, {
                        text: "歌单ID数组",
                        value: "playlistIds"
                    }, {
                        text: "歌单封面数组",
                        value: "playlistCovers"
                    }
                    ]
                }, commentTypeMenu: {
                    acceptReporters: true, items: [{
                        text: "歌曲",
                        value: "R_SO_4_"
                    }, {
                        text: "专辑",
                        value: "R_AL_3_"
                    }, {
                        text: "歌单",
                        value: "R_PL_0_"
                    }, {
                        text: "MV",
                        value: "A_PL_0_"
                    }
                    ]
                }, commentInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "内容",
                        value: "content"
                    }, {
                        text: "用户名",
                        value: "nickname"
                    }, {
                        text: "点赞数",
                        value: "likedCount"
                    }, {
                        text: "时间",
                        value: "time"
                    }
                    ]
                }, songLevelMenu: {
                    acceptReporters: true, items: [{
                        text: "标准",
                        value: "standard"
                    }, {
                        text: "较高",
                        value: "higher"
                    }, {
                        text: "极高",
                        value: "exhigh"
                    }, {
                        text: "无损",
                        value: "lossless"
                    }, {
                        text: "Hi-Res",
                        value: "hires"
                    }, {
                        text: "高清环绕声",
                        value: "jyeffect"
                    }, {
                        text: "沉浸环绕声",
                        value: "sky"
                    }, {
                        text: "杜比全景声",
                        value: "dolby"
                    }, {
                        text: "超清母带",
                        value: "jymaster"
                    }
                    ]
                }, lyricInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "歌词",
                        value: "json.lrc.lyric"
                    }, {
                        text: "翻译歌词",
                        value: "tlyric"
                    }, {
                        text: "音译歌词",
                        value: "romalrc"
                    }, {
                        text: "逐字歌词",
                        value: "json.yrc.lyric"
                    }, {
                        text: "歌词更新时间",
                        value: "uptime"
                    }, {
                        text: "歌词提交者",
                        value: "nickname"
                    }, {
                        text: "歌词提交者ID",
                        value: "userid"
                    }
                    ]
                }, lyricParseMenu: {
                    acceptReporters: true, items: [{
                        text: "歌词数组",
                        value: "lyrics"
                    }, {
                        text: "时间数组",
                        value: "times"
                    }, {
                        text: "时间数组-秒",
                        value: "timesSec"
                    }
                    ]
                }, lyricLineMenu: {
                    acceptReporters: true, items: [{
                        text: "歌词",
                        value: "lyric"
                    }, {
                        text: "时间",
                        value: "time"
                    }, {
                        text: "时间-秒",
                        value: "timeSec"
                    }
                    ]
                }, yrcLineInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "完整文本",
                        value: "text"
                    }, {
                        text: "开始时间-秒",
                        value: "timeSec"
                    }, {
                        text: "持续时间-秒",
                        value: "durationSec"
                    }, {
                        text: "字数",
                        value: "wordCount"
                    }, {
                        text: "逐字详情JSON",
                        value: "wordsJson"
                    }
                    ]
                }, yrcWordInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "文本",
                        value: "text"
                    }, {
                        text: "开始时间-秒",
                        value: "timeSec"
                    }, {
                        text: "持续时间-秒",
                        value: "durationSec"
                    }
                    ]
                }, timestampInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "时间",
                        value: "datetime"
                    }, {
                        text: "年",
                        value: "year"
                    }, {
                        text: "月",
                        value: "month"
                    }, {
                        text: "日",
                        value: "day"
                    }, {
                        text: "时",
                        value: "hour"
                    }, {
                        text: "分",
                        value: "minute"
                    }, {
                        text: "秒",
                        value: "second"
                    }
                    ]
                }, toplistInfoMenu: {
                    acceptReporters: true, items: [{
                        text: "名",
                        value: "name"
                    }, {
                        text: "ID",
                        value: "id"
                    }, {
                        text: "简介",
                        value: "description"
                    }, {
                        text: "封面",
                        value: "coverUrl"
                    }, {
                        text: "更新时间",
                        value: "updateTime"
                    }
                    ]
                }, listMenu: {
                    acceptReporters: true,
                    items: "_getListMenuItems"
                }
            }
        };
    }
    strOccurrences(args) {
        const str = String(args.STR || "");
        const str2 = String(args.STR2 || "");
        if (!str || !str2)
            return 0;
        let count = 0;
        let pos = 0;
        while ((pos = str2.indexOf(str, pos)) !== -1) {
            count++;
            pos += str.length;
        }
        return count;
    }
    strOccurLine(args) {
        const str = String(args.STR || "");
        const str2 = String(args.STR2 || "");
        const n = Math.max(1, Math.round(Number(args.N) || 1));
        if (!str || !str2)
            return 0;
        const lines = str2.split("\n");
        let count = 0;
        for (let i = 0; i < lines.length; i++) {
            let pos = 0;
            while ((pos = lines[i].indexOf(str, pos)) !== -1) {
                count++;
                if (count === n)
                    return i + 1;
                pos += str.length;
            }
        }
        return 0;
    }
    strOccurPos(args) {
        const str = String(args.STR || "");
        const str2 = String(args.STR2 || "");
        const n = Math.max(1, Math.round(Number(args.N) || 1));
        if (!str || !str2)
            return 0;
        let count = 0;
        let pos = 0;
        while ((pos = str2.indexOf(str, pos)) !== -1) {
            count++;
            if (count === n)
                return pos + 1;
            pos += str.length;
        }
        return 0;
    }
    strSubstring(args) {
        const str = String(args.STR || "");
        const n = Math.max(1, Math.round(Number(args.N) || 1));
        const n2 = Math.max(1, Math.round(Number(args.N2) || 1));
        if (!str || n > n2)
            return "";
        return str.substring(n - 1, n2);
    }
    strGetLine(args) {
        const str = String(args.STR || "");
        const n = Math.max(1, Math.round(Number(args.N) || 1));
        const lines = str.split("\n");
        if (n > lines.length)
            return "";
        return lines[n - 1] || "";
    }
    strGetLines(args) {
        const str = String(args.STR || "");
        const n = Math.max(1, Math.round(Number(args.N) || 1));
        const n2 = Math.max(1, Math.round(Number(args.N2) || 1));
        const lines = str.split("\n");
        const start = Math.min(n, n2);
        const end = Math.max(n, n2);
        return lines.slice(start - 1, end).join("\n");
    }
    newlineChar() {
        return "\n";
    }
    getJsonValue(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw)
                return "";
            const json = JSON.parse(raw);
            const path = String(args.STR || "").trim();
            if (!path)
                return "";
            const val = this._getNestedValue(json, path);
            if (val === undefined || val === null)
                return "";
            return typeof val === "object" ? JSON.stringify(val) : String(val);
        }
        catch (e) {
            return "";
        }
    }
    async getSongChorus(args) {
        const id = String(args.ID || "").trim();
        const type = String(args.TYPE || "startTime").trim();
        if (!id)
            return 0;
        try {
            const url = `https://music.163.com/api/song/chorus?ids=[${encodeURIComponent(id)}]`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const data = await response.json();
            if (data.code === 200 && data.chorus && data.chorus.length > 0) {
                const item = data.chorus[0];
                const startMs = Number(item.startTime) || 0;
                const endMs = Number(item.endTime) || 0;
                switch (type) {
                    case "startTime":
                        return Math.round(startMs / 10) / 100;
                    case "endTime":
                        return Math.round(endMs / 10) / 100;
                    case "duration":
                        return Math.round((endMs - startMs) / 10) / 100;
                    default:
                        return 0;
                }
            }
            if (data.code === 200 && data.data && data.data.length > 0) {
                const item = data.data[0];
                const startMs = Number(item.startTime) || 0;
                const endMs = Number(item.endTime) || 0;
                switch (type) {
                    case "startTime":
                        return Math.round(startMs / 10) / 100;
                    case "endTime":
                        return Math.round(endMs / 10) / 100;
                    case "duration":
                        return Math.round((endMs - startMs) / 10) / 100;
                    default:
                        return 0;
                }
            }
            return 0;
        }
        catch (e) {
            return 0;
        }
    }
    async unifiedSearch(args) {
        const s = encodeURIComponent(String(args.STR || "").trim());
        if (!s)
            return "";
        const type = String(args.TYPE || "1").trim();
        const n = Math.min(Math.max(Math.round(Number(args.NUM) || 30), 1), 100);
        const page = Math.max(Math.round(Number(args.PAGE) || 1), 1);
        const offset = (page - 1) * n;
        const url = `https://music.163.com/api/search/get?s=${s}&type=${type}&limit=${n}&offset=${offset}`;
        try {
            const r = await NTeaseMusic._fetchWithTimeout(url);
            return JSON.stringify(await r.json());
        }
        catch (e) {
            return "";
        }
    }
    _parseSearchResult(jsonStr, listKey, field, extractFn) {
        try {
            const raw = String(jsonStr || "").trim();
            if (!raw)
                return JSON.stringify([]);
            const data = JSON.parse(raw);
            const list = data?.result?.[listKey];
            if (!Array.isArray(list))
                return JSON.stringify([]);
            if (field === "__json_array__")
                return JSON.stringify(list);
            const result = [];
            for (const item of list) {
                if (!item) {
                    result.push("");
                    continue;
                }
                const val = extractFn(item, field);
                if (val === undefined || val === null) {
                    result.push("");
                }
                else {
                    result.push(val);
                }
            }
            return JSON.stringify(result);
        }
        catch (e) {
            return JSON.stringify([]);
        }
    }
    // ==================== 1. 单曲搜索解析 ====================
    parseSearchSong(args) {
        return this._parseSearchResult(args.JSON, "songs", String(args.TYPE || "name").trim(), (item, field) => {
            switch (field) {
                case "name":
                return item.name;
                case "id":
                return item.id;
                case "artistName":
                return Array.isArray(item.ar) && item.ar.length > 0 ? item.ar.map(a => a.name).filter(n => n).join(" / ") : (Array.isArray(item.artists) && item.artists.length > 0 ? item.artists.map(a => a.name).filter(n => n).join(" / ") : "");
                case "artistId":
                {
                    let ids = [];
                    if (Array.isArray(item.ar) && item.ar.length > 0)
                        ids = item.ar.map(a => a.id).filter(i => i != null);
                    else if (Array.isArray(item.artists) && item.artists.length > 0)
                        ids = item.artists.map(a => a.id).filter(i => i != null);
                    return ids.length > 0 ? JSON.stringify(ids) : "";
                }
                case "albumName":
                return item.al?.name || item.album?.name || "";
                case "albumId":
                return item.al?.id ?? item.album?.id ?? "";
                case "albumCover":
                return item.al?.picUrl || item.album?.picUrl || item.album?.blurPicUrl || "";
                case "duration":
                return item.dt ?? item.duration ?? "";
                case "durationSec":
                {
                    const ms = item.dt ?? item.duration;
                    return ms != null ? Math.round(ms / 1000) : "";
                }
                case "fee":
                return item.fee ?? "";
                case "tns":
                return Array.isArray(item.tns) ? item.tns : (Array.isArray(item.transNames) ? item.transNames : []);
                case "alia":
                return Array.isArray(item.alia) ? item.alia : [];
                case "mvId":
                return item.mv ?? item.mvid ?? "";
                case "flag":
                return item.privilege?.flag ?? item.flag ?? "";
                case "copyright":
                return item.copyright ?? "";
                case "popularity":
                return item.popularity ?? item.score ?? "";
                case "publishTime":
                return item.publishTime ?? item.album?.publishTime ?? "";
                default:
                return "";
            }
        });
    }
    // ==================== 2. 专辑搜索解析 ====================
    parseSearchAlbum(args) {
        return this._parseSearchResult(args.JSON, "albums", String(args.TYPE || "name").trim(), (item, field) => {
            switch (field) {
                case "name":
                return item.name;
                case "id":
                return item.id;
                case "artistName":
                return item.artist?.name || (Array.isArray(item.artists) && item.artists.length > 0 ? item.artists.map(a => a.name).filter(n => n).join(" / ") : "");
                case "artistId":
                return item.artist?.id != null ? String(item.artist.id) : (Array.isArray(item.artists) && item.artists.length > 0 ? JSON.stringify(item.artists.map(a => a.id).filter(i => i != null)) : "");
                case "description":
                return item.description || "";
                case "trackCount":
                return item.size ?? item.trackCount ?? "";
                case "publishTime":
                return item.publishTime ?? "";
                case "company":
                return item.company || "";
                case "tags":
                return Array.isArray(item.tags) ? item.tags : [];
                case "picUrl":
                return item.picUrl || item.coverUrl || "";
                case "briefDesc":
                return item.briefDesc || "";
                case "type":
                return item.type ?? "";
                case "size":
                return item.size ?? "";
                case "status":
                return item.status ?? "";
                default:
                return "";
            }
        });
    }
    // ==================== 3. 歌手搜索解析 ====================
    parseSearchArtist(args) {
        return this._parseSearchResult(args.JSON, "artists", String(args.TYPE || "name").trim(), (item, field) => {
            switch (field) {
                case "name":
                return item.name;
                case "id":
                return item.id;
                case "alias":
                return Array.isArray(item.alias) ? item.alias : [];
                case "picUrl":
                return item.img1v1Url || item.picUrl || "";
                case "briefDesc":
                return item.briefDesc || "";
                case "musicSize":
                return item.musicSize ?? "";
                case "mvSize":
                return item.mvSize ?? "";
                case "albumSize":
                return item.albumSize ?? "";
                case "fansCount":
                return item.fansCount ?? "";
                case "accountId":
                return item.accountId ?? "";
                default:
                return "";
            }
        });
    }
    // ==================== 4. 歌单搜索解析 ====================
    parseSearchPlaylist(args) {
        return this._parseSearchResult(args.JSON, "playlists", String(args.TYPE || "name").trim(), (item, field) => {
            switch (field) {
                case "name":
                return item.name;
                case "id":
                return item.id;
                case "description":
                return item.description || "";
                case "creatorNickname":
                return item.creator?.nickname || "";
                case "creatorId":
                return item.creator?.userId ?? item.creator?.id ?? "";
                case "playCount":
                return item.playCount ?? "";
                case "bookCount":
                return item.bookCount ?? "";
                case "shareCount":
                return item.shareCount ?? "";
                case "trackCount":
                return item.trackCount ?? "";
                case "coverImgUrl":
                return item.coverImgUrl || item.coverUrl || "";
                case "tags":
                return Array.isArray(item.tags) ? item.tags : [];
                case "createTime":
                return item.createTime ?? "";
                case "updateTime":
                return item.updateTime ?? "";
                case "official":
                return item.official ?? "";
                default:
                return "";
            }
        });
    }
    // ==================== 5. 用户搜索解析 ====================
    parseSearchUser(args) {
        return this._parseSearchResult(args.JSON, "userprofiles", String(args.TYPE || "nickname").trim(), (item, field) => {
            switch (field) {
                case "nickname":
                return item.nickname;
                case "userId":
                return item.userId;
                case "signature":
                return item.signature || "";
                case "avatarUrl":
                return item.avatarUrl || "";
                case "backgroundUrl":
                return item.backgroundUrl || "";
                case "gender":
                return item.gender ?? "";
                case "level":
                return item.level ?? "";
                case "followeds":
                return item.followeds ?? "";
                case "follows":
                return item.follows ?? "";
                case "eventCount":
                return item.eventCount ?? "";
                case "vipType":
                return item.vipType ?? "";
                case "authStatus":
                return item.authStatus ?? "";
                default:
                return "";
            }
        });
    }
    // ==================== 6. MV搜索解析 ====================
    parseSearchMV(args) {
        return this._parseSearchResult(args.JSON, "mvs", String(args.TYPE || "name").trim(), (item, field) => {
            switch (field) {
                case "name":
                return item.name;
                case "id":
                return item.id;
                case "artistName":
                return Array.isArray(item.artists) && item.artists.length > 0 ? item.artists.map(a => a.name).filter(n => n).join(" / ") : (item.artistName || "");
                case "artistId":
                return Array.isArray(item.artists) && item.artists.length > 0 ? JSON.stringify(item.artists.map(a => a.id).filter(i => i != null)) : (item.artistId != null ? String(item.artistId) : "");
                case "playCount":
                return item.playCount ?? "";
                case "duration":
                return item.duration ?? "";
                case "durationSec":
                return item.duration != null ? Math.round(item.duration / 1000) : "";
                case "cover":
                return item.cover || item.coverUrl || "";
                case "desc":
                return item.desc || item.briefDesc || "";
                case "praisedCount":
                return item.praisedCount ?? "";
                case "commentCount":
                return item.commentCount ?? "";
                case "shareCount":
                return item.shareCount ?? "";
                case "publishTime":
                return item.publishTime ?? "";
                default:
                return "";
            }
        });
    }
    // ==================== 7. 歌词搜索解析 【已修改：适配新API结构 result.songs + lyrics.txt】 ====================
    parseSearchLyric(args) {
        // 新API歌词搜索结果在 result.songs 中，而非 result.lyrics
        return this._parseSearchResult(args.JSON, "songs", String(args.TYPE || "name").trim(), (item, field) => {
            switch (field) {
                case "name":
                return item.name;
                case "id":
                return item.id;
                case "artistName":
                return Array.isArray(item.artists) && item.artists.length > 0 ? item.artists.map(a => a.name).filter(n => n).join(" / ") : (item.artistName || "");
                case "artistId":
                return Array.isArray(item.artists) && item.artists.length > 0 ? JSON.stringify(item.artists.map(a => a.id).filter(i => i != null)) : "";
                case "albumName":
                return item.album?.name || "";
                case "albumId":
                return item.album?.id ?? "";
                case "lyricText":
                return item.lyrics?.txt || item.lyric || item.lrc || "";
                case "lyricRange":
                return Array.isArray(item.lyrics?.range) ? JSON.stringify(item.lyrics.range) : "[]";
                case "duration":
                return item.duration ?? "";
                case "durationSec":
                return item.duration != null ? Math.round(item.duration / 1000) : "";
                case "transNames":
                return Array.isArray(item.transNames) ? item.transNames : [];
                case "alias":
                return Array.isArray(item.alias) ? item.alias : [];
                case "mvid":
                return item.mvid ?? "";
                case "fee":
                return item.fee ?? "";
                case "alg":
                return item.alg || "";
                case "mark":
                return item.mark ?? "";
                default:
                return "";
            }
        });
    }
    // ==================== 8. 电台/播客搜索解析 ====================
    parseSearchDjRadio(args) {
        return this._parseSearchResult(args.JSON, "djRadios", String(args.TYPE || "name").trim(), (item, field) => {
            switch (field) {
                case "name":
                return item.name;
                case "id":
                return item.id;
                case "djName":
                return item.dj?.nickname || "";
                case "djId":
                return item.dj?.userId ?? item.dj?.id ?? "";
                case "desc":
                return item.desc || item.description || "";
                case "category":
                return item.category || "";
                case "secondCategory":
                return item.secondCategory || "";
                case "programCount":
                return item.programCount ?? "";
                case "subscribedCount":
                return item.subscribedCount ?? "";
                case "picUrl":
                return item.picUrl || item.coverUrl || "";
                case "lastProgramId":
                return item.lastProgramId ?? "";
                case "djAvatar":
                return item.dj?.avatarUrl || "";
                default:
                return "";
            }
        });
    }
    // ==================== 9. 视频搜索解析 ====================
    parseSearchVideo(args) {
        return this._parseSearchResult(args.JSON, "videos", String(args.TYPE || "title").trim(), (item, field) => {
            switch (field) {
                case "title":
                return item.title || item.name || "";
                case "vid":
                return item.vid || item.id || "";
                case "playCount":
                return item.playCount || item.playTime || "";
                case "durationms":
                return item.durationms ?? item.duration ?? "";
                case "durationSec":
                {
                    const ms = item.durationms ?? item.duration;
                    return ms != null ? Math.round(ms / 1000) : "";
                }
                case "coverUrl":
                return item.coverUrl || item.cover || "";
                case "creatorName":
                return Array.isArray(item.creator) && item.creator.length > 0 ? item.creator.map(c => c.userName || c.nickname || c.name).filter(n => n).join(" / ") : "";
                case "praisedCount":
                return item.praisedCount ?? "";
                case "commentCount":
                return item.commentCount ?? "";
                case "shareCount":
                return item.shareCount ?? "";
                case "publishTime":
                return item.publishTime ?? "";
                default:
                return "";
            }
        });
    }
    // ==================== 播放时间小数位数 ====================
    setTimeDecimalPlaces(args) {
        let num = Math.round(Number(args.NUM));
        if (isNaN(num))
            num = 2;
        this.timeDecimalPlaces = Math.max(0, Math.min(6, num));
    }
    getTimeDecimalPlaces() {
        return this.timeDecimalPlaces;
    }
    // ==================== 新歌速递 ====================
    async getNewSongs(args) {
        const type = String(args.TYPE || "name").trim();
        const area = String(args.AREA || "0").trim();
        try {
            const url = `https://music.163.com/api/discovery/new/songs?type=${encodeURIComponent(area)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            const dataList = json?.data;
            if (!Array.isArray(dataList))
                return JSON.stringify([]);
            const result = [];
            for (const entry of dataList) {
                if (!entry)
                    continue;
                const song = entry.song || entry;
                let val;
                switch (type) {
                    case "name":
                    val = song.name;
                    break;
                    case "id":
                    val = song.id;
                    break;
                    case "artistName":
                    val = Array.isArray(song.ar) ? song.ar.map(a => a.name).filter(n => n).join(" / ") : "";
                    break;
                    case "artistId":
                    val = Array.isArray(song.ar) ? JSON.stringify(song.ar.map(a => a.id).filter(i => i != null)) : "[]";
                    break;
                    case "albumName":
                    val = song.al?.name;
                    break;
                    case "coverUrl":
                    val = song.al?.picUrl;
                    break;
                    case "duration":
                    val = song.dt;
                    break;
                    case "fee":
                    val = song.fee;
                    break;
                    default:
                    val = song.name;
                }
                if (val !== undefined && val !== null && val !== "")
                    result.push(val);
            }
            return JSON.stringify(result);
        }
        catch (e) {
            return JSON.stringify([]);
        }
    }
    // ==================== 歌曲播放链接（含302重定向处理） ====================
    async getSongInfo(args) {
        const id = String(args.ID || "").trim();
        const type = String(args.TYPE || "url1").trim();
        const level = String(args.LEVEL || "lossless").trim();
        if (!id)
            return "";
        // 将音质等级转换为 br 参数值
        const levelToBr = {
            standard: "128000",
            higher: "192000",
            exhigh: "320000",
            lossless: "999000",
            hires: "999000",
            jyeffect: "999000",
            sky: "999000",
            dolby: "999000",
            jymaster: "999000"
        };
        const br = levelToBr[level] || "320000";
        const sources = {
            url1: {
                urls: [
                    `https://api.18years.ink/Interface/Netease/?action=url&quality=jymaster&id=${encodeURIComponent(id)}`
                ],
                keys: [
                    "url",
                    "data.url",
                    "data.musicUrl",
                    "musicUrl",
                    "data.playUrl"
                ],
                is302: false
            },
            url2: {
                urls: [
                    `https://api.qijieya.cn/meting/?type=url&id=${encodeURIComponent(id)}&br=${br}`
                ],
                keys: [],
                is302: true
            },
            url3: {
                urls: [
                    `https://api.xunjinlu.fun/apis/wymusic/?key=sk-e15c70131ea929f3fc807d110bdb585e&action=song&id=${encodeURIComponent(id)}&level=${encodeURIComponent(level)}`
                ],
                keys: [
                    "data.data.url"
                ],
                is302: false
            },
            url4: {
                urls: [
                    `https://music.rrvenn.cn/api/api.php?action=music&url=${encodeURIComponent(id)}&level=${encodeURIComponent(level)}`
                ],
                keys: [
                    "url",
                    "data.url",
                    "song_url",
                    "data.playUrl",
                    "musicUrl",
                    "data.musicUrl",
                    "link"
                ],
                is302: false
            },
            url5: {
                urls: [
                    `https://music.rrvenn.cn/Song_V1?type=json&level=${encodeURIComponent(level)}&url=${encodeURIComponent(id)}`
                ],
                keys: [
                    "url",
                    "data.url",
                    "song_url",
                    "data.playUrl",
                    "musicUrl",
                    "data.musicUrl",
                    "link"
                ],
                is302: false
            }
        };
        const source = sources[type];
        if (!source)
            return "";
        for (const apiUrl of source.urls) {
            try {
                const response = await NTeaseMusic._fetchWithTimeout(apiUrl, {}, 10000);
                if (!response.ok)
                    continue;
                // ===== url2 302重定向特殊处理：直接取重定向后的 response.url =====
                if (source.is302) {
                    const finalUrl = response.url;
                    if (finalUrl && /^https?:\/\/.+/.test(finalUrl.trim()) && finalUrl !== apiUrl) {
                        return finalUrl.trim();
                    }
                    continue;
                }
                const json = await response.json();
                if (!json || typeof json !== "object")
                    continue;
                for (const keyPath of source.keys) {
                    const val = this._getNestedValue(json, keyPath);
                    if (typeof val === "string" && /^https?:\/\/.+/.test(val.trim()))
                        return val.trim();
                }
                const fallbackUrl = NTeaseMusic._extractUrlFromJson(json);
                if (fallbackUrl)
                    return fallbackUrl;
            }
            catch (e) {
                continue;
            }
        }
        return "";
    }
    // ==================== 榜单 ====================
    async getAllToplists() {
        try {
            const url = "https://music.163.com/api/toplist";
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object")
                return "";
            return JSON.stringify(json);
        }
        catch (e) {
            return "";
        }
    }
    getToplistInfo(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw)
                return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "name").trim();
            let list = [];
            if (Array.isArray(json?.list)) {
                list = json.list;
            }
            else if (Array.isArray(json?.data?.list)) {
                list = json.data.list;
            }
            else if (Array.isArray(json?.data)) {
                list = json.data;
            }
            else if (Array.isArray(json)) {
                list = json;
            }
            if (!Array.isArray(list) || list.length === 0)
                return "";
            const result = [];
            for (const item of list) {
                if (!item)
                    continue;
                let value;
                switch (type) {
                    case "name":
                    value = item.name;
                    break;
                    case "id":
                    value = item.id;
                    break;
                    case "description":
                    value = item.description || item.updateFrequency || "";
                    break;
                    case "coverUrl":
                    value = item.coverUrl || item.coverImgUrl || "";
                    break;
                    case "updateTime":
                    value = item.updateTime || item.updateFrequency || "";
                    break;
                    default:
                    value = undefined;
                }
                if (value !== undefined && value !== null && value !== "")
                    result.push(value);
            }
            return JSON.stringify(result);
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 专辑 ====================
    async getAlbumDetailJSON(args) {
        const id = String(args.ID || "").trim();
        if (!id || isNaN(Number(id)))
            return "";
        try {
            const url = `https://music.163.com/api/v1/album/${encodeURIComponent(id)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object")
                return "";
            return JSON.stringify(json);
        }
        catch (e) {
            return "";
        }
    }
    getAlbumInfo(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw)
                return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "name").trim();
            const album = json?.album;
            if (!album)
                return "";
            switch (type) {
                case "name":
                return album.name || "";
                case "artistName":
                if (album.artist?.name)
                    return album.artist.name;
                if (Array.isArray(json.songs) && json.songs.length > 0) {
                    const ar = json.songs[0].ar;
                    if (Array.isArray(ar) && ar.length > 0)
                        return ar.map(a => a.name).filter(n => n).join(" / ");
                }
                return "";
                case "artistId":
                if (album.artist?.id != null)
                    return String(album.artist.id);
                if (Array.isArray(json.songs) && json.songs.length > 0) {
                    const ar = json.songs[0].ar;
                    if (Array.isArray(ar) && ar.length > 0)
                        return JSON.stringify(ar.map(a => a.id).filter(i => i != null));
                }
                return "";
                case "songNames":
                {
                    const songs = Array.isArray(json.songs) ? json.songs : [];
                    return JSON.stringify(songs.map(s => s.name).filter(n => n !== undefined && n !== null && n !== ""));
                }
                case "songIds":
                {
                    const songs = Array.isArray(json.songs) ? json.songs : [];
                    return JSON.stringify(songs.map(s => s.id).filter(i => i != null));
                }
                case "publishTime":
                return album.publishTime ?? "";
                default:
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    // ==================== MV ====================
    async getMVDetailJSON(args) {
        const id = String(args.ID || "").trim();
        if (!id || isNaN(Number(id)))
            return "";
        try {
            const url = `https://music.163.com/api/mv/detail?id=${encodeURIComponent(id)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object")
                return "";
            return JSON.stringify(json);
        }
        catch (e) {
            return "";
        }
    }
    getMVInfo(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw)
                return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "name").trim();
            const mv = json?.data;
            if (!mv)
                return "";
            switch (type) {
                case "name":
                return mv.name || "";
                case "artistName":
                if (Array.isArray(mv.artists) && mv.artists.length > 0)
                    return mv.artists.map(a => a.name).filter(n => n).join(" / ");
                return mv.artistName || "";
                case "artistId":
                if (Array.isArray(mv.artists) && mv.artists.length > 0)
                    return JSON.stringify(mv.artists.map(a => a.id).filter(i => i != null));
                return mv.artistId != null ? String(mv.artistId) : "";
                case "desc":
                return mv.desc || mv.briefDesc || "";
                case "coverUrl":
                return mv.cover || mv.coverUrl || "";
                case "playCount":
                return mv.playCount ?? "";
                case "likeCount":
                return mv.likeCount ?? mv.praisedCount ?? "";
                case "shareCount":
                return mv.shareCount ?? "";
                case "commentCount":
                return mv.commentCount ?? "";
                case "publishTime":
                return mv.publishTime || "";
                case "resolutions":
                {
                    const brs = mv.brs;
                    return brs && typeof brs === "object" ? JSON.stringify(Object.keys(brs).map(k => Number(k)).sort((a, b) => b - a)) : JSON.stringify([]);
                }
                case "videoUrls":
                {
                    const brs = mv.brs;
                    if (brs && typeof brs === "object") {
                        const sortedKeys = Object.keys(brs).map(k => Number(k)).sort((a, b) => b - a);
                        return JSON.stringify(sortedKeys.map(k => brs[String(k)]).filter(u => u));
                    }
                    return JSON.stringify([]);
                }
                case "commentThreadId":
                return mv.commentThreadId || "";
                default:
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 歌手 ====================
    async getArtistDetailJSON(args) {
        const id = String(args.ID || "").trim();
        if (!id || isNaN(Number(id)))
            return "";
        try {
            const url = `https://music.163.com/api/artist/${encodeURIComponent(id)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object")
                return "";
            return JSON.stringify(json);
        }
        catch (e) {
            return "";
        }
    }
    getArtistInfo(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw)
                return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "name").trim();
            const artist = json?.artist;
            if (!artist)
                return "";
            switch (type) {
                case "name":
                return artist.name || "";
                case "alias":
                return JSON.stringify(Array.isArray(artist.alias) ? artist.alias : []);
                case "fansCount":
                return artist.fansCount ?? "";
                case "musicSize":
                return artist.musicSize ?? "";
                case "mvSize":
                return artist.mvSize ?? "";
                case "briefDesc":
                return artist.briefDesc || "";
                case "picUrl":
                return artist.picUrl || "";
                default:
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 歌单详情 ====================
    async getPlaylistDetailJSON(args) {
        const id = String(args.ID || "2222077236").trim();
        if (!id)
            return "";
        try {
            const detailUrl = `https://music.163.com/api/v6/playlist/detail?id=${encodeURIComponent(id)}&n=1000`;
            const detailResp = await NTeaseMusic._fetchWithTimeout(detailUrl);
            const detailJson = await detailResp.json();
            const playlist = detailJson?.playlist;
            if (!playlist)
                return "";
            const trackIdsArr = Array.isArray(playlist.trackIds) ? playlist.trackIds : [];
            let allSongs = [];
            if (trackIdsArr.length > 0) {
                const ids = trackIdsArr.map(t => t.id).filter(i => i != null);
                const BATCH_SIZE = 500;
                for (let i = 0; i < ids.length; i += BATCH_SIZE) {
                    const batch = ids.slice(i, i + BATCH_SIZE);
                    const songUrl = `https://music.163.com/api/song/detail?ids=[${batch.join(",")}]`;
                    const songResp = await NTeaseMusic._fetchWithTimeout(songUrl);
                    const songJson = await songResp.json();
                    const songs = Array.isArray(songJson?.songs) ? songJson.songs : [];
                    allSongs.push(...songs);
                }
            }
            const result = {
                playlist: playlist,
                songs: allSongs
            };
            return JSON.stringify(result);
        }
        catch (e) {
            return "";
        }
    }
    getPlaylistInfo(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw)
                return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "description").trim();
            if (Array.isArray(json?.playlist)) {
                const firstPlaylist = json.playlist[0];
                if (!firstPlaylist)
                    return "";
                switch (type) {
                    case "description":
                    return firstPlaylist.description || "";
                    case "createTime":
                    return firstPlaylist.createTime || "";
                    case "tags":
                    return JSON.stringify(Array.isArray(firstPlaylist.tags) ? firstPlaylist.tags : []);
                    case "creatorName":
                    return firstPlaylist.creator?.nickname || "";
                    case "creatorId":
                    return firstPlaylist.creator?.userId ?? "";
                    case "trackNames":
                    return JSON.stringify([]);
                    case "trackIds":
                    return JSON.stringify([]);
                    default:
                    return "";
                }
            }
            const playlist = json?.playlist;
            if (!playlist || typeof playlist !== "object")
                return "";
            switch (type) {
                case "description":
                return playlist.description || "";
                case "createTime":
                return playlist.createTime || "";
                case "tags":
                return JSON.stringify(Array.isArray(playlist.tags) ? playlist.tags : []);
                case "creatorName":
                return playlist.creator?.nickname || "";
                case "creatorId":
                return playlist.creator?.userId ?? "";
            }
            const trackIdsArr = Array.isArray(playlist.trackIds) ? playlist.trackIds : [];
            const songs = Array.isArray(json.songs) ? json.songs : [];
            const songMap = new Map();
            for (const s of songs) {
                if (s && s.id != null)
                    songMap.set(s.id, s);
            }
            const orderedSongs = trackIdsArr.map(t => songMap.get(t.id)).filter(Boolean);
            switch (type) {
                case "trackNames":
                return JSON.stringify(orderedSongs.map(s => s.name).filter(n => n !== undefined && n !== null && n !== ""));
                case "trackIds":
                return JSON.stringify(orderedSongs.map(s => s.id).filter(i => i != null));
                default:
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 用户详情JSON ====================
    async getUserDetailJSON(args) {
        const id = String(args.ID || "").trim();
        if (!id)
            return "";
        try {
            const url = `https://music.163.com/api/v1/user/detail/${encodeURIComponent(id)}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object")
                return "";
            return JSON.stringify(json);
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 获取用户歌单完整JSON ====================
    async getUserPlaylistJSON(args) {
        const id = String(args.ID || "").trim();
        if (!id)
            return "";
        try {
            const url = `https://music.163.com/api/user/playlist?uid=${encodeURIComponent(id)}&limit=100`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object")
                return "";
            return JSON.stringify(json);
        }
        catch (e) {
            console.error("[网易云v2] getUserPlaylistJSON error:", e);
            return "";
        }
    }
    // ==================== 解析用户歌单JSON ====================
    parseUserPlaylist(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw)
                return "";
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
                case "createTime":
                return JSON.stringify(playlistArr.map(p => p.createTime).filter(t => t != null));
                case "jsonArray":
                return JSON.stringify(playlistArr);
                case "count":
                return String(playlistArr.length);
                default:
                return JSON.stringify(playlistArr.map(p => p.name).filter(n => n != null && n !== ""));
            }
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 用户信息解析 ====================
    getUserInfo(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw)
                return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "nickname").trim();
            const profile = json?.profile;
            const playlistArr = json?.playlist;
            if (profile) {
                switch (type) {
                    case "nickname":
                    return profile.nickname || "";
                    case "signature":
                    return profile.signature || "";
                    case "avatarUrl":
                    return profile.avatarUrl || "";
                    case "backgroundUrl":
                    return profile.backgroundUrl || "";
                    case "gender":
                    return profile.gender ?? "";
                    case "level":
                    return profile.level ?? "";
                    case "followeds":
                    return profile.followeds ?? "";
                    case "follows":
                    return profile.follows ?? "";
                    case "eventCount":
                    return profile.eventCount ?? "";
                    default:
                    return "";
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
                    default:
                    return "";
                }
            }
            return "";
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 热评获取 ====================
    async getHotComments(args) {
        const typeId = String(args.TYPE_ID || "R_SO_4_").trim();
        const id = String(args.ID || "").trim();
        const info = String(args.INFO || "content").trim();
        const num = Math.min(Math.max(Math.round(Number(args.NUM) || 10), 1), 50);
        if (!id)
            return JSON.stringify([]);
        try {
            const url = `https://music.163.com/api/v1/resource/comments/${typeId}${id}?limit=${num}`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            const comments = Array.isArray(json?.hotComments) && json.hotComments.length > 0 ? json.hotComments : (Array.isArray(json?.comments) ? json.comments : []);
            if (comments.length === 0)
                return JSON.stringify([]);
            const result = [];
            for (const c of comments.slice(0, num)) {
                if (!c)
                    continue;
                let val;
                switch (info) {
                    case "content":
                    val = c.content;
                    break;
                    case "nickname":
                    val = c.user?.nickname;
                    break;
                    case "likedCount":
                    val = c.likedCount;
                    break;
                    case "time":
                    val = c.time;
                    break;
                    default:
                    val = c.content;
                }
                if (val !== undefined && val !== null)
                    result.push(val);
            }
            return JSON.stringify(result);
        }
        catch (e) {
            console.error("[网易云v2] getHotComments error:", e);
            return JSON.stringify([]);
        }
    }
    // ==================== URL有效性检测 ====================
    async checkUrlValid(args) {
        const url = String(args.URL || "").trim();
        if (!url)
            return false;
        try {
            const resp = await NTeaseMusic._fetchWithTimeout(url, {
                method: 'HEAD'
            }, 5000);
            return resp.ok;
        }
        catch (e) {
            return false;
        }
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
        }
        catch (e) {
            return JSON.stringify(new Array(fftSize).fill(128));
        }
    }
    // ==================== 获取歌曲详情JSON ====================
    async getSongDetailJSON(args) {
        const id = String(args.ID || "").trim();
        if (!id || isNaN(Number(id)))
            return "";
        try {
            const url = `https://music.163.com/api/song/detail?ids=[${encodeURIComponent(id)}]`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            const songs = json?.songs;
            if (!Array.isArray(songs) || songs.length === 0)
                return "";
            return JSON.stringify(songs[0]);
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 解析歌曲详情JSON 【已修复：根据真实API返回结构修正所有路径】 ====================
    parseSongDetail(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw)
                return "";
            const json = JSON.parse(raw);
            const type = String(args.TYPE || "name").trim();
            if (type === "__raw_json__")
                return JSON.stringify(json);
            switch (type) {
                case "name":
                    return json.name || "";
                case "id":
                    return json.id ?? "";
                case "artistName":
                    // 真实API: json.artists (不是 ar)
                    return Array.isArray(json.artists) && json.artists.length > 0 ? json.artists.map(a => a.name).filter(n => n).join(" / ") : "";
                case "artistId":
                    // 真实API: json.artists (不是 ar)
                    return Array.isArray(json.artists) && json.artists.length > 0 ? JSON.stringify(json.artists.map(a => a.id).filter(i => i != null)) : "[]";
                case "albumName":
                    // 真实API: json.album (不是 al)
                    return json.album?.name || "";
                case "albumId":
                    // 真实API: json.album (不是 al)
                    return json.album?.id ?? "";
                case "coverUrl":
                    // 真实API: json.album.picUrl (不是 al.picUrl)
                    return json.album?.picUrl || "";
                case "duration":
                    // 真实API: json.duration (不是 dt)
                    return json.duration ?? "";
                case "durationSec":
                    // 真实API: json.duration (不是 dt)
                    {
                        const ms = json.duration;
                        return ms != null ? String(Math.round(ms / 1000)) : "";
                    }
                case "transName":
                    // 真实API: json.transName (单数，不是 tns/transNames 数组)
                    return json.transName || "";
                case "alias":
                    // 真实API: json.alias (不是 alia)
                    return JSON.stringify(Array.isArray(json.alias) ? json.alias : []);
                case "mvid":
                    // 真实API: json.mvid (不是 mv)
                    return json.mvid ?? "";
                case "fee":
                    return json.fee ?? "";
                case "copyright":
                    return json.copyright ?? "";
                case "popularity":
                    return json.popularity ?? "";
                case "publishTime":
                    // 真实API: json.album.publishTime (不是 al.publishTime)
                    return json.album?.publishTime ?? "";
                default:
                    return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 每日推荐 ====================
    async getDailyRecommend(args) {
        const type = String(args.TYPE || "name").trim();
        try {
            const url = "https://music.163.com/api/v3/discovery/recommend/songs";
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            const songs = json?.data?.dailySongs;
            if (!Array.isArray(songs) || songs.length === 0)
                return JSON.stringify([]);
            const result = [];
            for (const song of songs) {
                if (!song)
                    continue;
                let value;
                switch (type) {
                    case "name":
                    value = song.name;
                    break;
                    case "id":
                    value = song.id;
                    break;
                    case "fee":
                    value = song.fee;
                    break;
                    case "artistName":
                    value = Array.isArray(song.ar) && song.ar.length > 0 ? song.ar.map(a => a.name).join(" / ") : undefined;
                    break;
                    case "artistId":
                    value = Array.isArray(song.ar) && song.ar.length > 0 ? JSON.stringify(song.ar.map(a => a.id).filter(id => id != null)) : undefined;
                    break;
                    case "albumName":
                    value = song.al?.name;
                    break;
                    case "albumId":
                    value = song.al?.id;
                    break;
                    case "coverUrl":
                    value = song.al?.picUrl;
                    break;
                    case "duration":
                    value = song.dt;
                    break;
                    default:
                    value = undefined;
                }
                if (value !== undefined && value !== null && value !== "")
                    result.push(value);
            }
            return JSON.stringify(result);
        }
        catch (e) {
            return JSON.stringify([]);
        }
    }
    // ==================== 统一相似内容获取 ====================
    async getSimilarContent(args) {
        const id = String(args.ID || "").trim();
        const type = String(args.TYPE || "song").trim();
        if (!id)
            return "";
        let url = "";
        switch (type) {
            case "song":
            url = `https://music.163.com/api/v1/discovery/simiSong?songid=${encodeURIComponent(id)}`;
            break;
            case "playlist":
            url = `https://music.163.com/api/discovery/simiPlaylist?songid=${encodeURIComponent(id)}&limit=20&offset=0`;
            break;
            case "artist":
            url = `https://music.163.com/api/v1/discovery/simiArtist?artistid=${encodeURIComponent(id)}`;
            break;
            case "mv":
            url = `https://music.163.com/api/discovery/simiMV?mvid=${encodeURIComponent(id)}`;
            break;
            default:
            return "";
        }
        try {
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            if (!json || typeof json !== "object")
                return "";
            return JSON.stringify(json);
        }
        catch (e) {
            console.error("[网易云v2] getSimilarContent error:", e);
            return "";
        }
    }
    // ==================== 相似内容JSON解析 ====================
    parseSimilarContent(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw)
                return "";
            const json = JSON.parse(raw);
            const field = String(args.TYPE || "").trim();
            if (field.startsWith("__sep_"))
                return "";
            // ===== 相似歌曲 =====
            if (field.startsWith("simiSong_")) {
                const songs = json?.songs;
                if (!Array.isArray(songs))
                    return field === "simiSong_jsonArray" ? "[]" : "";
                if (field === "simiSong_jsonArray")
                    return JSON.stringify(songs);
                const subField = field.replace("simiSong_", "");
                const result = [];
                for (const song of songs) {
                    if (!song)
                        continue;
                    let val;
                    switch (subField) {
                        case "name":
                        val = song.name;
                        break;
                        case "id":
                        val = song.id;
                        break;
                        case "albumName":
                        val = song.album?.name;
                        break;
                        case "albumId":
                        val = song.album?.id;
                        break;
                        case "artistName":
                        val = Array.isArray(song.artists) && song.artists.length > 0 ? song.artists.map(a => a.name).join(" / ") : undefined;
                        break;
                        case "artistId":
                        val = Array.isArray(song.artists) && song.artists.length > 0 ? JSON.stringify(song.artists.map(a => a.id).filter(i => i != null)) : undefined;
                        break;
                        case "artistAvatar":
                        val = Array.isArray(song.artists) && song.artists.length > 0 ? (song.artists[0]?.img1v1Url || song.artists[0]?.picUrl || "") : undefined;
                        break;
                        default:
                        val = undefined;
                    }
                    if (val !== undefined && val !== null && val !== "")
                        result.push(val);
                }
                return JSON.stringify(result);
            }
            // ===== 相似歌单 =====
            if (field.startsWith("simiPlaylist_")) {
                const playlists = json?.playlists;
                if (!Array.isArray(playlists))
                    return field === "simiPlaylist_jsonArray" ? "[]" : "";
                if (field === "simiPlaylist_jsonArray")
                    return JSON.stringify(playlists);
                const subField = field.replace("simiPlaylist_", "");
                const result = [];
                for (const pl of playlists) {
                    if (!pl)
                        continue;
                    let val;
                    switch (subField) {
                        case "name":
                        val = pl.name;
                        break;
                        case "id":
                        val = pl.id;
                        break;
                        case "description":
                        val = pl.description || "";
                        break;
                        case "creatorNickname":
                        val = pl.creator?.nickname || "";
                        break;
                        case "creatorId":
                        val = pl.creator?.userId ?? pl.creator?.id;
                        break;
                        case "playCount":
                        val = pl.playCount;
                        break;
                        case "trackCount":
                        val = pl.trackCount;
                        break;
                        case "coverImgUrl":
                        val = pl.coverImgUrl || pl.coverUrl || "";
                        break;
                        default:
                        val = undefined;
                    }
                    if (val !== undefined && val !== null && val !== "")
                        result.push(val);
                }
                return JSON.stringify(result);
            }
            // ===== 相似歌手 =====
            if (field.startsWith("simiArtist_")) {
                const artists = json?.artists;
                if (!Array.isArray(artists))
                    return field === "simiArtist_jsonArray" ? "[]" : "";
                if (field === "simiArtist_jsonArray")
                    return JSON.stringify(artists);
                const subField = field.replace("simiArtist_", "");
                const result = [];
                for (const artist of artists) {
                    if (!artist)
                        continue;
                    let val;
                    switch (subField) {
                        case "name":
                        val = artist.name;
                        break;
                        case "id":
                        val = artist.id;
                        break;
                        case "alias":
                        val = Array.isArray(artist.alias) ? artist.alias : [];
                        break;
                        case "picUrl":
                        val = artist.img1v1Url || artist.picUrl || "";
                        break;
                        case "briefDesc":
                        val = artist.briefDesc || "";
                        break;
                        default:
                        val = undefined;
                    }
                    if (subField === "alias")
                        result.push(Array.isArray(val) ? val : []);
                    else if (val !== undefined && val !== null && val !== "")
                        result.push(val);
                }
                return JSON.stringify(result);
            }
            // ===== 相似MV =====
            if (field.startsWith("simiMV_")) {
                const mvs = json?.mvs;
                if (!Array.isArray(mvs))
                    return field === "simiMV_jsonArray" ? "[]" : "";
                if (field === "simiMV_jsonArray")
                    return JSON.stringify(mvs);
                const subField = field.replace("simiMV_", "");
                const result = [];
                for (const mv of mvs) {
                    if (!mv)
                        continue;
                    let val;
                    switch (subField) {
                        case "name":
                        val = mv.name;
                        break;
                        case "id":
                        val = mv.id;
                        break;
                        case "artistName":
                        val = Array.isArray(mv.artists) && mv.artists.length > 0 ? mv.artists.map(a => a.name).filter(n => n).join(" / ") : (mv.artistName || undefined);
                        break;
                        case "artistId":
                        val = Array.isArray(mv.artists) && mv.artists.length > 0 ? JSON.stringify(mv.artists.map(a => a.id).filter(i => i != null)) : (mv.artistId != null ? String(mv.artistId) : undefined);
                        break;
                        case "playCount":
                        val = mv.playCount;
                        break;
                        case "duration":
                        val = mv.duration;
                        break;
                        case "cover":
                        val = mv.cover || mv.coverUrl || "";
                        break;
                        default:
                        val = undefined;
                    }
                    if (val !== undefined && val !== null && val !== "")
                        result.push(val);
                }
                return JSON.stringify(result);
            }
            return "";
        }
        catch (e) {
            console.error("[网易云v2] parseSimilarContent error:", e);
            return "";
        }
    }
    // ==================== 歌词解析工具 ====================
    static LYRIC_TIME_REGEX = /^\[(\d{1,3}:\d{2}(?::\d{2})?(?:\.\d{1,3})?)\]\s*(.*)/;
    _parseLrcLines(raw) {
        const lines = String(raw || "").split("\n");
        const lyrics = [], times = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            const match = trimmed.match(NTeaseMusic.LYRIC_TIME_REGEX);
            if (match) {
                times.push(match[1]);
                lyrics.push(match[2].trim());
            }
        }
        return {
            lyrics, times
        };
    }
    _lrcTimeToSeconds(timeStr) {
        if (typeof timeStr !== "string" || !timeStr.trim())
            return 0;
        const parts = timeStr.trim().split(":");
        let seconds = 0;
        try {
            if (parts.length === 3)
                seconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
            else if (parts.length === 2)
                seconds = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
            else seconds = parseFloat(parts[0]);
        }
        catch (e) {
            return 0;
        }
        return isNaN(seconds) ? 0 : Math.round(seconds * 1000) / 1000;
    }
    _secondsToLrcTime(totalSeconds) {
        let s = Number(totalSeconds);
        if (isNaN(s) || s < 0)
            s = 0;
        const mins = Math.floor(s / 60);
        const secs = s - mins * 60;
        return `${String(mins).padStart(2, "0")}:${secs.toFixed(2).padStart(5, "0")}`;
    }
    parseLyric(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw)
                return JSON.stringify([]);
            const type = String(args.TYPE || "lyrics").trim();
            const {
                lyrics, times
            } = this._parseLrcLines(raw);
            if (type === "times")
                return JSON.stringify(times);
            if (type === "timesSec")
                return JSON.stringify(times.map(t => this._lrcTimeToSeconds(t)));
            return JSON.stringify(lyrics);
        }
        catch (e) {
            return JSON.stringify([]);
        }
    }
    getLyricLine(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw)
                return "";
            const n = Math.round(Number(args.N));
            const idx = n >= 1 ? n - 1 : n;
            const type = String(args.TYPE || "lyric").trim();
            const {
                lyrics, times
            } = this._parseLrcLines(raw);
            if (idx < 0 || idx >= lyrics.length)
                return "";
            switch (type) {
                case "lyric":
                return lyrics[idx];
                case "time":
                return times[idx] || "";
                case "timeSec":
                return times[idx] ? String(this._lrcTimeToSeconds(times[idx])) : "";
                default:
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 第N秒的歌词 ====================
    getLyricAtSecond(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw)
                return "";
            const targetSec = Number(args.N);
            if (isNaN(targetSec) || targetSec < 0)
                return "";
            const {
                lyrics, times
            } = this._parseLrcLines(raw);
            if (lyrics.length === 0)
                return "";
            let result = "";
            for (let i = 0; i < times.length; i++) {
                const lineSec = this._lrcTimeToSeconds(times[i]);
                if (lineSec <= targetSec) {
                    result = lyrics[i];
                }
                else {
                    break;
                }
            }
            return result;
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 逐字歌词(YRC)解析工具 ====================
    static YRC_LINE_REGEX = /^\[(\d+),(\d+)\](.*)$/;
    static YRC_WORD_REGEX = /\((\d+),(\d+),(\d+)\)([^(]*)/g;
    _parseYrcLines(raw) {
        const lines = String(raw || "").split("\n");
        const result = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            const lineMatch = trimmed.match(NTeaseMusic.YRC_LINE_REGEX);
            if (!lineMatch)
                continue;
            const lineStartMs = Number(lineMatch[1]) || 0;
            const lineDurationMs = Number(lineMatch[2]) || 0;
            const content = lineMatch[3] || "";
            const words = [];
            let fullText = "";
            let match;
            NTeaseMusic.YRC_WORD_REGEX.lastIndex = 0;
            while ((match = NTeaseMusic.YRC_WORD_REGEX.exec(content)) !== null) {
                const wordText = match[4] || "";
                if (wordText.trim() === "")
                    continue;
                fullText += wordText;
                words.push({
                    text: wordText,
                    timeSec: Math.round(((Number(match[1]) || 0) / 1000) * 1000) / 1000,
                    durationSec: Math.round(((Number(match[2]) || 0) / 1000) * 1000) / 1000
                });
            }
            if (words.length === 0 && fullText.trim() === "")
                continue;
            result.push({
                timeSec: Math.round((lineStartMs / 1000) * 1000) / 1000,
                durationSec: Math.round((lineDurationMs / 1000) * 1000) / 1000,
                text: fullText,
                wordCount: words.length,
                words
            });
        }
        return result;
    }
    getYrcLineInfo(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw)
                return "";
            const n = Math.round(Number(args.N));
            const idx = n >= 1 ? n - 1 : n;
            const type = String(args.TYPE || "text").trim();
            const parsed = this._parseYrcLines(raw);
            if (idx < 0 || idx >= parsed.length)
                return "";
            const line = parsed[idx];
            switch (type) {
                case "text":
                return line.text;
                case "timeSec":
                return String(line.timeSec);
                case "durationSec":
                return String(line.durationSec);
                case "wordCount":
                return String(line.wordCount);
                case "wordsJson":
                return JSON.stringify(line.words);
                default:
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    getYrcWordInfo(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw)
                return "";
            const n = Math.round(Number(args.N));
            const lineIdx = n >= 1 ? n - 1 : n;
            const m = Math.round(Number(args.M));
            const wordIdx = m >= 1 ? m - 1 : m;
            const type = String(args.TYPE || "text").trim();
            const parsed = this._parseYrcLines(raw);
            if (lineIdx < 0 || lineIdx >= parsed.length)
                return "";
            const line = parsed[lineIdx];
            if (wordIdx < 0 || wordIdx >= line.words.length)
                return "";
            const word = line.words[wordIdx];
            switch (type) {
                case "text":
                return word.text;
                case "timeSec":
                return String(word.timeSec);
                case "durationSec":
                return String(word.durationSec);
                default:
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 时间转换 ====================
    timeToSeconds(args) {
        return this._lrcTimeToSeconds(String(args.TIME || ""));
    }
    secondsToTime(args) {
        return this._secondsToLrcTime(args.SECONDS);
    }
    getTimestampInfo(args) {
        try {
            const raw = String(args.TIME || "").trim();
            if (!raw)
                return "";
            let date;
            const num = Number(raw);
            if (/^-?\d+(\.\d+)?$/.test(raw)) {
                const ts = Math.abs(num) < 1e10 ? num * 1000 : num;
                date = new Date(ts);
            }
            else {
                date = new Date(raw.replace(/\//g, "-"));
            }
            if (isNaN(date.getTime()))
                return "";
            const info = String(args.INFO || "datetime").trim();
            const pad = (n) => String(n).padStart(2, "0");
            switch (info) {
                case "datetime":
                return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
                case "year":
                return date.getFullYear();
                case "month":
                return date.getMonth() + 1;
                case "day":
                return date.getDate();
                case "hour":
                return date.getHours();
                case "minute":
                return date.getMinutes();
                case "second":
                return date.getSeconds();
                default:
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 歌词元数据清理 ====================
    static LYRIC_META_KEYWORDS = /作词|作曲|编曲|制作人|录音|混音|母带|监制|出品|发行|词：|曲：|编：|Lyrics|Composer|Arranger|Producer|Mixed|Mastered/i;
    _cleanYrcMeta(lyric) {
        if (typeof lyric !== "string" || !lyric.trim())
            return "";
        const lines = lyric.split("\n");
        const cleaned = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            const lineMatch = trimmed.match(NTeaseMusic.YRC_LINE_REGEX);
            if (lineMatch) {
                const content = lineMatch[3] || "";
                let fullText = "";
                let wm;
                NTeaseMusic.YRC_WORD_REGEX.lastIndex = 0;
                while ((wm = NTeaseMusic.YRC_WORD_REGEX.exec(content)) !== null)
                    fullText += (wm[4] || "");
                if (NTeaseMusic.LYRIC_META_KEYWORDS.test(fullText))
                    continue;
            }
            cleaned.push(line);
        }
        return cleaned.join("\n").trim();
    }
    _cleanLrcMeta(lyric) {
        if (typeof lyric !== "string" || !lyric.trim())
            return "";
        let result = lyric.replace(/^(\[(?![\d:])[^\]]*\]\s*)+/g, "");
        const lines = result.split("\n");
        const cleaned = [];
        let passedMeta = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            if (!passedMeta) {
                const timeTagMatch = trimmed.match(/^\[[\d:.]+\]\s*(.*)/);
                if (timeTagMatch) {
                    const content = timeTagMatch[1].trim();
                    if (content && NTeaseMusic.LYRIC_META_KEYWORDS.test(content))
                        continue;
                    if (content)
                        passedMeta = true;
                }
                else if (NTeaseMusic.LYRIC_META_KEYWORDS.test(trimmed))
                    continue;
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
            if (!runtime)
                return [{
                text: "无可用列表",
                value: ""
            }
            ];
            const target = runtime.getEditingTarget();
            if (!target)
                return [{
                text: "无可用列表",
                value: ""
            }
            ];
            const items = [];
            const seenNames = new Set();
            for (const key in target.variables) {
                const v = target.variables[key];
                if (v.type === "list" && !seenNames.has(v.name)) {
                    items.push({
                        text: v.name,
                        value: v.id
                    });
                    seenNames.add(v.name);
                }
            }
            const stage = runtime.getTargetForStage();
            if (stage && stage !== target) {
                for (const key in stage.variables) {
                    const v = stage.variables[key];
                    if (v.type === "list" && !seenNames.has(v.name)) {
                        items.push({
                            text: v.name,
                            value: v.id
                        });
                        seenNames.add(v.name);
                    }
                }
            }
            return items.length > 0 ? items : [{
                text: "无可用列表",
                value: ""
            }
            ];
        }
        catch (e) {
            return [{
                text: "无可用列表",
                value: ""
            }
            ];
        }
    }
    _lookupList(idOrName, util) {
        try {
            const runtime = Scratch.vm?.runtime;
            if (!runtime)
                return null;
            const target = util?.target || runtime.getEditingTarget();
            if (!target)
                return null;
            if (target.variables[idOrName]?.type === "list")
                return target.variables[idOrName];
            const stage = runtime.getTargetForStage();
            if (stage && stage.variables[idOrName]?.type === "list")
                return stage.variables[idOrName];
            for (const key in target.variables) {
                const v = target.variables[key];
                if (v.type === "list" && v.name === idOrName)
                    return v;
            }
            if (stage && stage !== target) {
                for (const key in stage.variables) {
                    const v = stage.variables[key];
                    if (v.type === "list" && v.name === idOrName)
                        return v;
                }
            }
            return null;
        }
        catch (e) {
            return null;
        }
    }
    getListAsArray(args, util) {
        try {
            const lv = this._lookupList(args.LIST, util);
            if (lv)
                return JSON.stringify(lv.value);
        }
        catch (e) {}
        return "";
    }
    setListFromArray(args, util) {
        try {
            const lv = this._lookupList(args.LIST, util);
            if (lv) {
                const arr = JSON.parse(args.JSON);
                if (Array.isArray(arr))
                    lv.value = arr.map(i => typeof i === "object" ? JSON.stringify(i) : (i ?? ""));
            }
        }
        catch (e) {}
    }
    appendArrayToList(args, util) {
        try {
            const lv = this._lookupList(args.LIST, util);
            if (!lv)
                return;
            const raw = String(args.STR || "").trim();
            if (!raw)
                return;
            const arr = JSON.parse(raw);
            if (!Array.isArray(arr))
                return;
            for (const item of arr) {
                if (item === null || item === undefined) {
                    lv.value.push("");
                }
                else if (typeof item === "object") {
                    lv.value.push(JSON.stringify(item));
                }
                else {
                    lv.value.push(String(item));
                }
            }
        }
        catch (e) {}
    }
    // ==================== 综合搜索 ====================
    async comprehensiveSearch(args) {
        const str = encodeURIComponent(String(args.STR || "").trim());
        if (!str)
            return "";
        const url = `https://music.163.com/api/search/get?s=${str}&type=1018`;
        try {
            const r = await NTeaseMusic._fetchWithTimeout(url);
            const json = await r.json();
            return JSON.stringify(json);
        }
        catch (e) {
            return "";
        }
    }
    // ==================== 综合搜索解析 ====================
    parseComprehensiveSearch(args) {
        try {
            const raw = String(args.JSON || "").trim();
            if (!raw)
                return "";
            const data = JSON.parse(raw);
            const field = String(args.TYPE || "songNames").trim();
            if (field.startsWith("__sep_"))
                return "";
            if (field === "__raw_json__")
                return JSON.stringify(data);
            const r = data.result || {};
            const getArr = (...keys) => {
                for (const k of keys) {
                    if (Array.isArray(r[k]) && r[k].length > 0)
                        return r[k];
                    if (r[k] && typeof r[k] === 'object' && Array.isArray(r[k][k + 's']))
                        return r[k][k + 's'];
                }
                return [];
            };
            const songs = getArr('songs', 'song');
            if (field === "songCount")
                return String(songs.length);
            if (field === "songJsonArray")
                return JSON.stringify(songs);
            if (field === "songNames")
                return JSON.stringify(songs.map(s => s.name).filter(n => n != null && n !== ""));
            if (field === "songIds")
                return JSON.stringify(songs.map(s => s.id).filter(i => i != null));
            const albums = getArr('albums', 'album');
            if (field === "albumCount")
                return String(albums.length);
            if (field === "albumJsonArray")
                return JSON.stringify(albums);
            if (field === "albumNames")
                return JSON.stringify(albums.map(a => a.name).filter(n => n != null && n !== ""));
            if (field === "albumIds")
                return JSON.stringify(albums.map(a => a.id).filter(i => i != null));
            const artists = getArr('artists', 'artist');
            if (field === "artistCount")
                return String(artists.length);
            if (field === "artistJsonArray")
                return JSON.stringify(artists);
            if (field === "artistNames")
                return JSON.stringify(artists.map(a => a.name).filter(n => n != null && n !== ""));
            if (field === "artistIds")
                return JSON.stringify(artists.map(a => a.id).filter(i => i != null));
            const playlists = getArr('playlists', 'playlist');
            if (field === "playlistCount")
                return String(playlists.length);
            if (field === "playlistJsonArray")
                return JSON.stringify(playlists);
            if (field === "playlistNames")
                return JSON.stringify(playlists.map(p => p.name).filter(n => n != null && n !== ""));
            if (field === "playlistIds")
                return JSON.stringify(playlists.map(p => p.id).filter(i => i != null));
            const mvs = getArr('mvs', 'mv');
            if (field === "mvCount")
                return String(mvs.length);
            if (field === "mvJsonArray")
                return JSON.stringify(mvs);
            if (field === "mvNames")
                return JSON.stringify(mvs.map(m => m.name).filter(n => n != null && n !== ""));
            if (field === "mvIds")
                return JSON.stringify(mvs.map(m => m.id).filter(i => i != null));
            const videos = getArr('videos', 'video');
            if (field === "videoCount")
                return String(videos.length);
            if (field === "videoJsonArray")
                return JSON.stringify(videos);
            if (field === "videoNames")
                return JSON.stringify(videos.map(v => v.title || v.name).filter(n => n != null && n !== ""));
            if (field === "videoVids")
                return JSON.stringify(videos.map(v => v.vid || v.id).filter(i => i != null));
            const users = getArr('userprofiles', 'userprofile');
            if (field === "userCount")
                return String(users.length);
            if (field === "userJsonArray")
                return JSON.stringify(users);
            if (field === "userNames")
                return JSON.stringify(users.map(u => u.nickname).filter(n => n != null && n !== ""));
            if (field === "userIds")
                return JSON.stringify(users.map(u => u.userId).filter(i => i != null));
            return "";
        }
        catch (e) {
            console.error("[网易云v2] parseComprehensiveSearch error:", e);
            return "";
        }
    }
    async getSearchSuggest(args) {
        const str = encodeURIComponent(String(args.STR || "").trim());
        const num = Math.min(Math.max(Math.round(Number(args.NUM) || 10), 1), 30);
        if (!str)
            return JSON.stringify([]);
        try {
            const r = await NTeaseMusic._fetchWithTimeout(`https://music.163.com/api/search/suggest/keyword?s=${str}&limit=${num}`);
            const json = await r.json();
            const allMatch = json?.result?.allMatch;
            if (!Array.isArray(allMatch))
                return JSON.stringify([]);
            const keywords = allMatch.map(item => item?.keyword).filter(kw => kw !== undefined && kw !== null && kw !== "");
            return JSON.stringify(keywords.slice(0, num));
        }
        catch (e) {
            return JSON.stringify([]);
        }
    }
    getResultInfo(args) {
        try {
            const raw = String(args.STR || "").trim();
            if (!raw)
                return JSON.stringify([]);
            const data = JSON.parse(raw);
            const field = String(args.TYPE || "name").trim();
            if (field.startsWith("__sep_"))
                return JSON.stringify([]);
            if (field === "__raw_json__") {
                const r = data.result;
                const list = r?.songs || r?.albums || r?.artists || r?.playlists || r?.userprofiles || r?.mvs || r?.lyrics || r?.djRadios || r?.videos || r?.allMatch || data.songs || [];
                return JSON.stringify(list);
            }
            const r = data.result;
            if (Array.isArray(r?.allMatch)) {
                const list = r.allMatch;
                const result = [];
                for (const item of list) {
                    if (!item)
                        continue;
                    let value;
                    switch (field) {
                        case "keyword":
                        value = item.keyword;
                        break;
                        case "highlightKeyword":
                        value = item.highlightKeyword || item.keyword;
                        break;
                        case "name":
                        value = item.keyword;
                        break;
                        default:
                        value = undefined;
                    }
                    if (value !== undefined && value !== null && value !== "")
                        result.push(value);
                }
                return JSON.stringify(result);
            }
            if (Array.isArray(r?.songs)) {
                const list = r.songs;
                const result = [];
                for (const item of list) {
                    if (!item)
                        continue;
                    let value;
                    switch (field) {
                        case "name":
                        value = item.name;
                        break;
                        case "id":
                        value = item.id;
                        break;
                        case "tns":
                        value = Array.isArray(item.tns) ? item.tns : (Array.isArray(item.transNames) ? item.transNames : []);
                        break;
                        case "alia":
                        value = Array.isArray(item.alia) ? item.alia : [];
                        break;
                        case "fee":
                        value = item.fee;
                        break;
                        case "duration":
                        value = item.dt ?? item.duration;
                        break;
                        case "mvId":
                        value = item.mv ?? item.mvid;
                        break;
                        case "privilegeFlag":
                        value = item.privilege?.flag ?? item.flag;
                        break;
                        case "artistName":
                        value = Array.isArray(item.ar) && item.ar.length > 0 ? item.ar.map(a => a.name).filter(n => n).join(" / ") : (Array.isArray(item.artists) && item.artists.length > 0 ? item.artists.map(a => a.name).filter(n => n).join(" / ") : undefined);
                        break;
                        case "artistId":
                        {
                            let ids = [];
                            if (Array.isArray(item.ar) && item.ar.length > 0)
                                ids = item.ar.map(a => a.id).filter(i => i != null);
                            else if (Array.isArray(item.artists) && item.artists.length > 0)
                                ids = item.artists.map(a => a.id).filter(i => i != null);
                            value = ids.length > 0 ? JSON.stringify(ids) : undefined;
                            break;
                        }
                        case "artistAvatar":
                        if (Array.isArray(item.ar) && item.ar.length > 0)
                            value = item.ar[0]?.img1v1Url || item.ar[0]?.picUrl || "";
                        else if (Array.isArray(item.artists) && item.artists.length > 0)
                            value = item.artists[0]?.img1v1Url || item.artists[0]?.picUrl || "";
                        break;
                        case "albumName":
                        value = item.al?.name || item.album?.name;
                        break;
                        case "albumId":
                        value = item.al?.id ?? item.album?.id;
                        break;
                        case "albumCover":
                        value = item.al?.picUrl || item.album?.picUrl || item.album?.blurPicUrl;
                        break;
                        default:
                        value = undefined;
                    }
                    if (field === "tns" || field === "alia")
                        result.push(Array.isArray(value) ? value : []);
                    else if (value !== undefined && value !== null && value !== "")
                        result.push(value);
                }
                return JSON.stringify(result);
            }
            if (Array.isArray(r?.albums)) {
                const list = r.albums;
                const result = [];
                for (const item of list) {
                    if (!item)
                        continue;
                    let value;
                    switch (field) {
                        case "name":
                        value = item.name;
                        break;
                        case "id":
                        value = item.id;
                        break;
                        case "description":
                        value = item.description || "";
                        break;
                        case "tags":
                        value = Array.isArray(item.tags) ? item.tags : [];
                        break;
                        case "trackCount":
                        value = item.size ?? item.trackCount;
                        break;
                        case "publishTime":
                        value = item.publishTime;
                        break;
                        case "company":
                        value = item.company || "";
                        break;
                        case "briefDesc":
                        value = item.briefDesc || "";
                        break;
                        case "artistName":
                        value = item.artist?.name || (Array.isArray(item.artists) && item.artists.length > 0 ? item.artists.map(a => a.name).filter(n => n).join(" / ") : undefined);
                        break;
                        case "artistId":
                        value = item.artist?.id != null ? String(item.artist.id) : (Array.isArray(item.artists) && item.artists.length > 0 ? JSON.stringify(item.artists.map(a => a.id).filter(i => i != null)) : undefined);
                        break;
                        case "artistAvatar":
                        value = item.artist?.img1v1Url || item.artist?.picUrl || (Array.isArray(item.artists) && item.artists.length > 0 ? (item.artists[0]?.img1v1Url || item.artists[0]?.picUrl) : undefined);
                        break;
                        default:
                        value = undefined;
                    }
                    if (field === "tags")
                        result.push(Array.isArray(value) ? value : []);
                    else if (value !== undefined && value !== null && value !== "")
                        result.push(value);
                }
                return JSON.stringify(result);
            }
            if (Array.isArray(r?.artists)) {
                const list = r.artists;
                const result = [];
                for (const item of list) {
                    if (!item)
                        continue;
                    let value;
                    switch (field) {
                        case "name":
                        value = item.name;
                        break;
                        case "id":
                        value = item.id;
                        break;
                        case "artistName":
                        value = item.name;
                        break;
                        case "artistId":
                        value = item.id;
                        break;
                        case "artistAvatar":
                        value = item.img1v1Url || item.picUrl || "";
                        break;
                        case "alia":
                        value = Array.isArray(item.alias) ? item.alias : [];
                        break;
                        case "briefDesc":
                        value = item.briefDesc || "";
                        break;
                        default:
                        value = undefined;
                    }
                    if (field === "alia")
                        result.push(Array.isArray(value) ? value : []);
                    else if (value !== undefined && value !== null && value !== "")
                        result.push(value);
                }
                return JSON.stringify(result);
            }
            if (Array.isArray(r?.playlists)) {
                const list = r.playlists;
                const result = [];
                for (const item of list) {
                    if (!item)
                        continue;
                    let value;
                    switch (field) {
                        case "name":
                        value = item.name;
                        break;
                        case "id":
                        value = item.id;
                        break;
                        case "playlistDescription":
                        value = item.description || "";
                        break;
                        case "playlistTags":
                        value = Array.isArray(item.tags) ? item.tags : [];
                        break;
                        case "playCount":
                        value = item.playCount;
                        break;
                        case "bookCount":
                        value = item.bookCount;
                        break;
                        case "shareCount":
                        value = item.shareCount;
                        break;
                        case "trackCount":
                        value = item.trackCount;
                        break;
                        case "coverImgUrl":
                        value = item.coverImgUrl || item.coverUrl || "";
                        break;
                        case "updateTime":
                        value = item.updateTime;
                        break;
                        case "createTime":
                        value = item.createTime;
                        break;
                        case "creatorNickname":
                        value = item.creator?.nickname || "";
                        break;
                        case "creatorId":
                        value = item.creator?.userId ?? item.creator?.id;
                        break;
                        case "creatorAvatar":
                        value = item.creator?.avatarUrl || "";
                        break;
                        case "artistName":
                        value = item.creator?.nickname || "";
                        break;
                        case "artistId":
                        value = item.creator?.userId ?? item.creator?.id;
                        break;
                        default:
                        value = undefined;
                    }
                    if (field === "playlistTags")
                        result.push(Array.isArray(value) ? value : []);
                    else if (value !== undefined && value !== null && value !== "")
                        result.push(value);
                }
                return JSON.stringify(result);
            }
            if (Array.isArray(r?.userprofiles)) {
                const list = r.userprofiles;
                const result = [];
                for (const item of list) {
                    if (!item)
                        continue;
                    let value;
                    switch (field) {
                        case "nickname":
                        value = item.nickname;
                        break;
                        case "userId":
                        value = item.userId;
                        break;
                        case "signature":
                        value = item.signature || "";
                        break;
                        case "avatarUrl":
                        value = item.avatarUrl || "";
                        break;
                        case "backgroundUrl":
                        value = item.backgroundUrl || "";
                        break;
                        case "gender":
                        value = item.gender;
                        break;
                        case "level":
                        value = item.level;
                        break;
                        case "followeds":
                        value = item.followeds;
                        break;
                        case "follows":
                        value = item.follows;
                        break;
                        case "eventCount":
                        value = item.eventCount;
                        break;
                        case "vipType":
                        value = item.vipType;
                        break;
                        case "authStatus":
                        value = item.authStatus;
                        break;
                        case "authority":
                        value = item.authority || "";
                        break;
                        default:
                        value = undefined;
                    }
                    if (value !== undefined && value !== null && value !== "")
                        result.push(value);
                }
                return JSON.stringify(result);
            }
            if (Array.isArray(r?.mvs)) {
                const list = r.mvs;
                const result = [];
                for (const item of list) {
                    if (!item)
                        continue;
                    let value;
                    switch (field) {
                        case "name":
                        value = item.name;
                        break;
                        case "id":
                        value = item.id;
                        break;
                        case "mvTitle":
                        value = item.name;
                        break;
                        case "mvPlayCount":
                        value = item.playCount;
                        break;
                        case "mvDuration":
                        value = item.duration;
                        break;
                        case "mvCover":
                        value = item.cover || item.coverUrl || "";
                        break;
                        case "mvArtistName":
                        value = Array.isArray(item.artists) && item.artists.length > 0 ? item.artists.map(a => a.name).filter(n => n).join(" / ") : (item.artistName || undefined);
                        break;
                        case "mvArtistId":
                        value = Array.isArray(item.artists) && item.artists.length > 0 ? JSON.stringify(item.artists.map(a => a.id).filter(i => i != null)) : (item.artistId != null ? String(item.artistId) : undefined);
                        break;
                        case "artistName":
                        value = Array.isArray(item.artists) && item.artists.length > 0 ? item.artists.map(a => a.name).filter(n => n).join(" / ") : (item.artistName || undefined);
                        break;
                        case "artistId":
                        value = Array.isArray(item.artists) && item.artists.length > 0 ? JSON.stringify(item.artists.map(a => a.id).filter(i => i != null)) : (item.artistId != null ? String(item.artistId) : undefined);
                        break;
                        default:
                        value = undefined;
                    }
                    if (value !== undefined && value !== null && value !== "")
                        result.push(value);
                }
                return JSON.stringify(result);
            }
            if (Array.isArray(r?.lyrics)) {
                const list = r.lyrics;
                const result = [];
                for (const item of list) {
                    if (!item)
                        continue;
                    let value;
                    switch (field) {
                        case "name":
                        value = item.name;
                        break;
                        case "id":
                        value = item.id;
                        break;
                        case "lyricContent":
                        value = item.lyric || item.lrc || "";
                        break;
                        case "lyricSongName":
                        value = item.name || "";
                        break;
                        case "lyricSongId":
                        value = item.id;
                        break;
                        case "lyricArtistName":
                        value = Array.isArray(item.artists) && item.artists.length > 0 ? item.artists.map(a => a.name).filter(n => n).join(" / ") : (item.artistName || undefined);
                        break;
                        case "artistName":
                        value = Array.isArray(item.artists) && item.artists.length > 0 ? item.artists.map(a => a.name).filter(n => n).join(" / ") : (item.artistName || undefined);
                        break;
                        default:
                        value = undefined;
                    }
                    if (value !== undefined && value !== null && value !== "")
                        result.push(value);
                }
                return JSON.stringify(result);
            }
            if (Array.isArray(r?.djRadios)) {
                const list = r.djRadios;
                const result = [];
                for (const item of list) {
                    if (!item)
                        continue;
                    let value;
                    switch (field) {
                        case "name":
                        value = item.name;
                        break;
                        case "id":
                        value = item.id;
                        break;
                        case "djRadioName":
                        value = item.name;
                        break;
                        case "djRadioId":
                        value = item.id;
                        break;
                        case "djRadioDesc":
                        value = item.desc || item.description || "";
                        break;
                        case "djRadioCategory":
                        value = item.category || item.secondCategory || "";
                        break;
                        case "djRadioProgramCount":
                        value = item.programCount;
                        break;
                        case "djRadioSubscribedCount":
                        value = item.subscribedCount;
                        break;
                        case "djRadioCover":
                        value = item.picUrl || item.coverUrl || "";
                        break;
                        case "djName":
                        value = item.dj?.nickname || "";
                        break;
                        case "djId":
                        value = item.dj?.userId ?? item.dj?.id;
                        break;
                        case "djAvatar":
                        value = item.dj?.avatarUrl || "";
                        break;
                        case "artistName":
                        value = item.dj?.nickname || "";
                        break;
                        case "artistId":
                        value = item.dj?.userId ?? item.dj?.id;
                        break;
                        case "artistAvatar":
                        value = item.dj?.avatarUrl || "";
                        break;
                        default:
                        value = undefined;
                    }
                    if (value !== undefined && value !== null && value !== "")
                        result.push(value);
                }
                return JSON.stringify(result);
            }
            if (Array.isArray(r?.videos)) {
                const list = r.videos;
                const result = [];
                for (const item of list) {
                    if (!item)
                        continue;
                    let value;
                    switch (field) {
                        case "name":
                        value = item.title || item.name;
                        break;
                        case "id":
                        value = item.vid || item.id;
                        break;
                        case "vid":
                        value = item.vid || item.id;
                        break;
                        case "videoTitle":
                        value = item.title || item.name;
                        break;
                        case "videoPlayCount":
                        value = item.playCount || item.playTime;
                        break;
                        case "videoDuration":
                        value = item.durationms ?? item.duration;
                        break;
                        case "videoCover":
                        value = item.coverUrl || item.cover || "";
                        break;
                        case "artistName":
                        value = Array.isArray(item.creator) && item.creator.length > 0 ? item.creator.map(c => c.userName || c.nickname || c.name).filter(n => n).join(" / ") : undefined;
                        break;
                        default:
                        value = undefined;
                    }
                    if (value !== undefined && value !== null && value !== "")
                        result.push(value);
                }
                return JSON.stringify(result);
            }
            if (Array.isArray(data.songs)) {
                const list = data.songs;
                const result = [];
                for (const item of list) {
                    if (!item)
                        continue;
                    let value;
                    if (field === "name")
                        value = item.name;
                    else if (field === "id")
                        value = item.id;
                    else if (field === "artistName") {
                        if (Array.isArray(item.ar) && item.ar.length > 0)
                            value = item.ar.map(a => a.name).filter(n => n).join(" / ");
                        else if (Array.isArray(item.artists) && item.artists.length > 0)
                            value = item.artists.map(a => a.name).filter(n => n).join(" / ");
                    }
                    else if (field === "artistId") {
                        let ids = [];
                        if (Array.isArray(item.ar) && item.ar.length > 0)
                            ids = item.ar.map(a => a.id).filter(i => i != null);
                        else if (Array.isArray(item.artists) && item.artists.length > 0)
                            ids = item.artists.map(a => a.id).filter(i => i != null);
                        value = ids.length > 0 ? JSON.stringify(ids) : undefined;
                    }
                    if (value !== undefined && value !== null && value !== "")
                        result.push(value);
                }
                return JSON.stringify(result);
            }
            return JSON.stringify([]);
        }
        catch (e) {
            return JSON.stringify([]);
        }
    }
    async getLyricInfo(args) {
        const id = String(args.ID || "").trim();
        const type = String(args.TYPE || "json.lrc.lyric").trim();
        if (!id)
            return "";
        try {
            const url = `https://music.163.com/api/song/lyric/v1?id=${encodeURIComponent(id)}&lv=1&kv=1&tv=1&yv=1&rv=1&av=1`;
            const response = await NTeaseMusic._fetchWithTimeout(url);
            const json = await response.json();
            switch (type) {
                case "json.lrc.lyric":
                return this._cleanLrcMeta(json?.lrc?.lyric ?? "");
                case "tlyric":
                return json?.tlyric?.lyric ?? "";
                case "romalrc":
                return this._cleanLrcMeta(json?.romalrc?.lyric ?? "");
                case "json.yrc.lyric":
                return this._cleanYrcMeta(json?.yrc?.lyric ?? "");
                case "uptime":
                return json?.transUser?.uptime ?? "";
                case "nickname":
                return json?.transUser?.nickname ?? "";
                case "userid":
                return json?.transUser?.userid ?? "";
                default:
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
    getArrayItem(args) {
        try {
            const arr = JSON.parse(String(args.OBJECT || "[]"));
            if (!Array.isArray(arr))
                return "";
                       const n = Math.round(Number(args.N));
            const index = n >= 1 ? n - 1 : n;
            if (index < 0 || index >= arr.length)
                return "";
            const val = arr[index];
            if (val === null || val === undefined)
                return "";
            return typeof val === "object" ? JSON.stringify(val) : String(val);
        }
        catch (e) {
            return "";
        }
    }
    getArrayLength(args) {
        try {
            const arr = JSON.parse(String(args.OBJECT || "[]"));
            return Array.isArray(arr) ? arr.length : 0;
        }
        catch (e) {
            return 0;
        }
    }
    loadAudio(args) {
        const url = (args.URL || '').trim();
        if (!url) {
            this._cleanupAll();
            return;
        }
        try {
            this._cleanupAll();
            this.audio = new Audio();
            this.audio.crossOrigin = 'anonymous';
            this.audio.src = url;
            this.audio.playbackRate = 1.0;
            this.audio.volume = 1.0;
            this._initAudioContext();
            this.audio.addEventListener('loadedmetadata', () => {
                this._playInternal();
            }, {
                once: true
            });
            this.audio.addEventListener('error', () => {
                this._cleanupAll();
            }, {
                once: true
            });
            this.audio.load();
        }
        catch (e) {
            this._cleanupAll();
        }
    }
    playAudio() {
        if (!this.audio || !this.audio.src || this.audio.src.trim() === 'about:blank')
            return;
        if (this.audio.error) {
            this._cleanupAll();
            return;
        }
        this._playInternal();
    }
    _playInternal() {
        if (!this.audio || !this.audio.src || this.audio.src.trim() === 'about:blank')
            return;
        if (this.audio.error) {
            this._cleanupAll();
            return;
        }
        try {
            if (this.audioContext && this.audioContext.state === 'suspended')
                this.audioContext.resume();
            if (!this.sourceNode && this.audioContext && this.analyser) {
                this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
                if (!this.gainNode) {
                    this.gainNode = this.audioContext.createGain();
                    this.gainNode.gain.value = 1.0;
                }
                this.sourceNode.connect(this.gainNode);
                this.gainNode.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
            }
            this.audio.play().catch(() => {
                this._cleanupAnalysis();
            });
        }
        catch (e) {
            this._cleanupAnalysis();
        }
    }
    _initAudioContext() {
        try {
            if (!this.audioContext)
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.currentFftSize;
            this.analyser.smoothingTimeConstant = 0.85;
            this.frequencyData = new Uint8Array(this.currentFftSize / 2);
            this.timeDomainData = new Uint8Array(this.currentFftSize);
        }
        catch (e) {
            throw e;
        }
    }
    pauseAudio() {
        if (this.audio)
            this.audio.pause();
    }
    stopAudio() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }
    setPlaybackRate(args) {
        if (!this.audio || !this.audio.src)
            return;
        let speed = parseFloat(args.SPEED);
        speed = isNaN(speed) ? 1.0 : Math.max(0.25, Math.min(4.0, speed));
        this.audio.playbackRate = speed;
    }
    seekToTime(args) {
        if (!this.audio || !this.audio.src)
            return;
        let time = parseFloat(args.TIME);
        time = isNaN(time) ? 0 : Math.max(0, time);
        if (this.audio.duration && !isNaN(this.audio.duration))
            time = Math.min(time, this.audio.duration);
        this.audio.currentTime = time;
    }
    setVolume(args) {
        if (!this.audio || !this.audio.src)
            return;
        let volumePercent = parseFloat(args.VOLUME);
        volumePercent = isNaN(volumePercent) ? 100 : Math.max(0, Math.min(100, volumePercent));
        const volumeValue = volumePercent / 100;
        if (this.gainNode)
            this.gainNode.gain.value = volumeValue;
        this.audio.volume = volumeValue;
    }
    getVolume() {
        if (this.gainNode)
            return parseFloat((this.gainNode.gain.value * 100).toFixed(0));
        if (this.audio)
            return parseFloat((this.audio.volume * 100).toFixed(0));
        return 100;
    }
    getPlaybackRate() {
        return this.audio ? parseFloat(this.audio.playbackRate.toFixed(2)) : 1.0;
    }
    getCurrentTime() {
        return this.audio ? this._formatTime(this.audio.currentTime) : 0;
    }
    getDuration() {
        return this.audio && !isNaN(this.audio.duration) ? this._formatTime(this.audio.duration) : 0;
    }
    _clampFftSize(num) {
        const validSizes = [
            64,
            128,
            256,
            512,
            1024
        ];
        let n = Math.round(Number(num));
        if (isNaN(n) || n < 32)
            n = 32;
        if (n > 512)
            n = 512;
        const targetFft = n * 2;
        let closest = validSizes[0];
        let minDiff = Math.abs(targetFft - closest);
        for (const size of validSizes) {
            const diff = Math.abs(targetFft - size);
            if (diff < minDiff) {
                minDiff = diff;
                closest = size;
            }
        }
        return closest;
    }
    getFrequencyDomain(args) {
        const requestedNum = Math.round(Number(args.NUM));
        const fftSize = this._clampFftSize(requestedNum);
        const binCount = fftSize / 2;
        if (!this.analyser || !this.audio || this.audio.paused)
            return JSON.stringify(new Array(binCount).fill(0));
        try {
            if (this.analyser.fftSize !== fftSize) {
                this.analyser.fftSize = fftSize;
                this.currentFftSize = fftSize;
                this.frequencyData = new Uint8Array(binCount);
                this.timeDomainData = new Uint8Array(fftSize);
            }
            this.analyser.getByteFrequencyData(this.frequencyData);
            return JSON.stringify(Array.from(this.frequencyData));
        }
        catch (e) {
            return JSON.stringify(new Array(binCount).fill(0));
        }
    }
    getFrequencyAt(args) {
        if (!this.analyser || !this.frequencyData || !this.audio || this.audio.paused)
            return 0;
        try {
            this.analyser.getByteFrequencyData(this.frequencyData);
            const idx = Math.floor(args.INDEX) - 1;
            return (idx >= 0 && idx < this.frequencyData.length) ? this.frequencyData[idx] : 0;
        }
        catch (e) {
            return 0;
        }
    }
    getAverageVolume() {
        if (!this.analyser || !this.frequencyData || !this.audio || this.audio.paused)
            return 0;
        try {
            this.analyser.getByteFrequencyData(this.frequencyData);
            const count = Math.min(64, this.frequencyData.length);
            let sum = 0;
            for (let i = 0; i < count; i++)
                sum += this.frequencyData[i];
            return Math.min(255, Math.floor(sum / count));
        }
        catch (e) {
            return 0;
        }
    }
    isPlaying() {
        return !!(this.audio && !this.audio.paused && this.audioContext?.state === 'running');
    }
    _cleanupAll() {
        this._cleanupAudio();
        this._cleanupAnalysis();
        if (this.audioContext) {
            try {
                this.audioContext.close();
            }
            catch (e) {}
            this.audioContext = null;
        }
        this.gainNode = null;
        this.currentFftSize = 256;
    }
    _cleanupAudio() {
        if (this.audio) {
            try {
                this.audio.pause();
                this.audio.src = '';
                this.audio.removeAttribute('src');
            }
            catch (e) {}
            this.audio = null;
        }
    }
    _cleanupAnalysis() {
        if (this.sourceNode) {
            try {
                this.sourceNode.disconnect();
            }
            catch (e) {}
            this.sourceNode = null;
        }
        if (this.gainNode) {
            try {
                this.gainNode.disconnect();
            }
            catch (e) {}
            this.gainNode = null;
        }
        if (this.analyser) {
            try {
                this.analyser.disconnect();
            }
            catch (e) {}
            this.analyser = null;
        }
        this.frequencyData = null;
        this.timeDomainData = null;
    }
}
Scratch.extensions.register(new NTeaseMusic());