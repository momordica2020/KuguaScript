/**
 * 苦瓜脚本 — 浏览器运行时
 *
 * 在普通网页与编辑器沙箱中共用：把常用的 Web API 暴露为中文全局名。
 * 脚本引入后自动安装（幂等）。
 *
 * 用法（普通网页）：
 *   <script src="kugua-compiler.js"></script>
 *   <script src="src/runtime/browser.js"></script>
 *   <script type="text/kugua">…苦瓜脚本…</script>
 *
 * 注意：在非浏览器环境（如 Node）中引入本文件会直接跳过。
 */
(function (global) {
    'use strict';

    if (typeof document === 'undefined') return;

    function install(name, fn) {
        if (fn && typeof global[name] === 'undefined') {
            global[name] = fn;
        }
    }

    // ===== 全局对象别名 =====
    global.文档 = document;
    global.窗口 = window;
    global.本地存储 = localStorage;
    global.会话存储 = sessionStorage;
    global.数学 = Math;
    global.日期 = Date;
    global.历史 = history;
    global.控制台 = console;
    global.屏幕 = screen;
    global.定位 = location;

    // ===== 输入输出 =====
    global.说 = typeof console !== 'undefined' ? function () { console.log.apply(console, arguments); } : undefined;
    global.弹窗 = typeof alert !== 'undefined' ? alert : function (msg) { console.log(msg); };
    global.询问 = typeof prompt !== 'undefined' ? prompt : function (msg) { console.log('[输入]' + msg); return ''; };
    global.确认 = typeof confirm !== 'undefined' ? confirm : function (msg) { console.log('[确认]' + msg); return true; };
    global.写入 = function (msg) { document.write(msg); };

    // ===== 数学与转换 =====
    global.随机数字 = Math.random;
    global.向下取整 = Math.floor;
    global.向上取整 = Math.ceil;
    global.绝对值 = Math.abs;
    global.转整数 = parseInt;
    global.转数字 = parseFloat;

    // ===== 定时器 / 动画帧 =====
    global.设置定时器 = setTimeout;
    global.清除定时器 = clearTimeout;
    global.设置循环 = setInterval;
    global.清除循环 = clearInterval;
    global.startLoop = setInterval;
    global.stopLoop = clearInterval;
    global.setT = setTimeout;
    global.clearT = clearTimeout;
    global.请求动画帧 = typeof requestAnimationFrame !== 'undefined'
        ? requestAnimationFrame
        : function (cb) { return setTimeout(cb, 16); };
    global.取消动画帧 = typeof cancelAnimationFrame !== 'undefined' ? cancelAnimationFrame : clearTimeout;

    // ===== 对象 =====
    // 与旧行为保持一致：每次读取 对象 都返回一个新空对象
    if (typeof global.对象 === 'undefined') {
        Object.defineProperty(global, '对象', {
            get: function () { return {}; },
            configurable: true
        });
    }
    install('创建对象', function () { return {}; });

    // ===== 数据格式 / 网络 =====
    install('解析JSON', function (text) {
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('JSON 解析失败：' + ((e && e.message) || String(e)));
        }
    });
    install('字符串化JSON', JSON.stringify);
    if (typeof fetch === 'function') install('获取', fetch);

    // ===== 文档（DOM）便捷方法 =====
    document.获取元素按id = document.getElementById;
    document.获取元素按标签 = document.getElementsByTagName;
    document.获取元素按类名 = document.getElementsByClassName;
    document.创建元素 = document.createElement;
    document.创建文本节点 = document.createTextNode;
    document.获取元素按选择器 = document.querySelector;
    document.获取所有元素按选择器 = document.querySelectorAll;

    // 身体/头部/标题 用 getter，保证脚本在 <head> 中引入时也能取到当前值
    Object.defineProperty(document, '身体', {
        get: function () { return document.body; },
        configurable: true
    });
    Object.defineProperty(document, '主体', {
        get: function () { return document.body; },
        configurable: true
    });
    Object.defineProperty(document, '头部', {
        get: function () { return document.head; },
        configurable: true
    });
    Object.defineProperty(document, '标题', {
        get: function () { return document.title; },
        set: function (v) { document.title = v; },
        configurable: true
    });

    // ===== 元素（Element）便捷方法 =====
    if (typeof Element !== 'undefined') {
        var ElProto = Element.prototype;
        ElProto.设置文本 = function (t) { this.textContent = t; return this; };
        ElProto.设置HTML = function (h) { this.innerHTML = h; return this; };
        ElProto.获取文本 = function () { return this.textContent; };
        ElProto.获取HTML = function () { return this.innerHTML; };
        ElProto.添加事件监听 = function (type, fn) { this.addEventListener(type, fn); return this; };
        ElProto.移除事件监听 = function (type, fn) { this.removeEventListener(type, fn); return this; };
        ElProto.追加子节点 = function (c) { this.appendChild(c); return this; };
        ElProto.移除子节点 = function (c) { this.removeChild(c); return this; };
        ElProto.设置样式 = function (k, v) { this.style[k] = v; return this; };
        ElProto.获取样式 = function (k) { return this.style[k]; };
        ElProto.设置属性 = function (k, v) { this.setAttribute(k, v); return this; };
        ElProto.获取属性 = function (k) { return this.getAttribute(k); };
        ElProto.添加类名 = function (c) { this.classList.add(c); return this; };
        ElProto.移除类名 = function (c) { this.classList.remove(c); return this; };

        // 输入类元素的值（输入框之值）
        Object.defineProperty(Element.prototype, '值', {
            get: function () { return this.value; },
            set: function (v) { this.value = v; },
            configurable: true
        });

        // 滚动条位置/总长度（元素之滚动条顶部、元素之滚动条长度）
        Object.defineProperty(Element.prototype, '滚动条顶部', {
            get: function () { return this.scrollTop; },
            set: function (v) { this.scrollTop = v; },
            configurable: true
        });
        Object.defineProperty(Element.prototype, '滚动条长度', {
            get: function () { return this.scrollHeight; },
            configurable: true
        });
    }

    // ===== 事件 =====
    if (typeof Event !== 'undefined') {
        Event.prototype.处置上级默认 = function () { this.preventDefault(); return this; };
    }
    if (typeof KeyboardEvent !== 'undefined') {
        Object.defineProperty(KeyboardEvent.prototype, '键', {
            get: function () { return this.key; },
            configurable: true
        });
    }

    // ===== 窗口事件 =====
    install('添加事件监听', function (type, fn) { this.addEventListener(type, fn); return this; });
    install('移除事件监听', function (type, fn) { this.removeEventListener(type, fn); return this; });

    // ===== 本地存储（Storage）便捷方法 =====
    if (typeof Storage !== 'undefined') {
        Storage.prototype.读取 = Storage.prototype.getItem;
        Storage.prototype.保存 = Storage.prototype.setItem;
        Storage.prototype.删除 = Storage.prototype.removeItem;
    }

    // ===== 画布（Canvas 2D）=====
    install('画布', {
        创建: function (w, h) {
            const c = document.createElement('canvas');
            if (w !== undefined) c.width = w;
            if (h !== undefined) c.height = h;
            return c;
        }
    });
    if (typeof CanvasRenderingContext2D !== 'undefined') {
        const CtxProto = CanvasRenderingContext2D.prototype;
        CtxProto.设置填充色 = function (v) { this.fillStyle = v; return this; };
        CtxProto.设置描边色 = function (v) { this.strokeStyle = v; return this; };
        CtxProto.设置字体 = function (v) { this.font = v; return this; };
        CtxProto.填充矩形 = function (x, y, w, h) { this.fillRect(x, y, w, h); return this; };
        CtxProto.描边矩形 = function (x, y, w, h) { this.strokeRect(x, y, w, h); return this; };
        CtxProto.填充圆 = function (x, y, r) { this.beginPath(); this.arc(x, y, r, 0, Math.PI * 2); this.fill(); return this; };
        CtxProto.填充文本 = function (t, x, y) { this.fillText(String(t), x, y); return this; };
        CtxProto.清空 = function (w, h) {
            this.clearRect(0, 0, w === undefined ? this.canvas.width : w, h === undefined ? this.canvas.height : h);
            return this;
        };
        CtxProto.保存 = function () { this.save(); return this; };
        CtxProto.恢复 = function () { this.restore(); return this; };
    }
    if (typeof HTMLCanvasElement !== 'undefined') {
        Object.defineProperty(HTMLCanvasElement.prototype, '上下文', {
            get: function () { return this.getContext('2d'); },
            configurable: true
        });
        HTMLCanvasElement.prototype.添加到 = function (parent) { parent.appendChild(this); return this; };
    }

    // ===== 剪贴板（配合 等待 使用）=====
    install('剪贴板', {
        读取: function () {
            if (navigator.clipboard && navigator.clipboard.readText) return navigator.clipboard.readText();
            return Promise.resolve('');
        },
        写入: function (text) {
            if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(String(text));
            return Promise.resolve();
        }
    });

    // ===== 窗口尺寸与滚动 =====
    if (typeof window !== 'undefined') {
        if (!('宽' in window)) {
            Object.defineProperty(window, '宽', { get: function () { return window.innerWidth; }, configurable: true });
            Object.defineProperty(window, '高', { get: function () { return window.innerHeight; }, configurable: true });
        }
        if (!window.滚动到) window.滚动到 = function (x, y) { window.scrollTo(x, y); };
        if (!('滚动位置' in window)) {
            Object.defineProperty(window, '滚动位置', {
                get: function () { return { 左: window.scrollX, 上: window.scrollY }; },
                configurable: true
            });
        }
    }

    // ===== 历史跳转 =====
    if (typeof history !== 'undefined') {
        if (!history.后退) history.后退 = function () { history.back(); };
        if (!history.前进) history.前进 = function () { history.forward(); };
        if (!history.跳转) history.跳转 = function (n) { history.go(n); };
    }

    // ===== 日期中文方法（日期之现在、日期之格式化）=====
    if (typeof Date === 'function') {
        Date.现在 = Date.now;
        Date.时间戳 = function (d) { return new Date(d).getTime(); };
        Date.年 = function (d) { return new Date(d).getFullYear(); };
        Date.月 = function (d) { return new Date(d).getMonth() + 1; };
        Date.日 = function (d) { return new Date(d).getDate(); };
        Date.时 = function (d) { return new Date(d).getHours(); };
        Date.分 = function (d) { return new Date(d).getMinutes(); };
        Date.秒 = function (d) { return new Date(d).getSeconds(); };
        Date.格式化 = function (d, format) {
            const dt = new Date(d);
            const pad = function (n) { return String(n).padStart(2, '0'); };
            const map = {
                'YYYY': String(dt.getFullYear()),
                'MM': pad(dt.getMonth() + 1),
                'DD': pad(dt.getDate()),
                'HH': pad(dt.getHours()),
                'mm': pad(dt.getMinutes()),
                'ss': pad(dt.getSeconds())
            };
            let f = String(format === undefined ? 'YYYY-MM-DD HH:mm:ss' : format);
            for (const k of Object.keys(map)) f = f.replace(k, map[k]);
            return f;
        };
    }

    // ===== 数学中文方法 =====
    if (typeof Math !== 'undefined') {
        Math.平方根 = Math.sqrt;
        Math.乘方 = Math.pow;
        Math.正弦 = Math.sin;
        Math.余弦 = Math.cos;
        Math.正切 = Math.tan;
        Math.最小值 = Math.min;
        Math.最大值 = Math.max;
        Math.圆周率 = Math.PI;
    }

    // ===== 文本与列表工具（跨端共用）=====
    install('文本', {
        长度: function (s) { return String(s).length; },
        拆分: function (s, sep) { return String(s).split(String(sep)); },
        替换: function (s, old, neu) { return String(s).split(String(old)).join(String(neu)); },
        查找: function (s, sub) { return String(s).indexOf(String(sub)); },
        包含: function (s, sub) { return String(s).includes(String(sub)); },
        转大写: function (s) { return String(s).toUpperCase(); },
        转小写: function (s) { return String(s).toLowerCase(); },
        修剪: function (s) { return String(s).trim(); },
        子串: function (s, start, end) { return String(s).substring(start, end); },
        连接: function () { return [].slice.call(arguments).join(''); }
    });
    install('列表', {
        长度: function (a) { return a.length; },
        追加: function (a, item) { a.push(item); return a; },
        移除: function (a, i) { a.splice(i - 1, 1); return a; },
        包含: function (a, v) { return a.includes(v); },
        连接: function (a, sep) { return a.join(sep === undefined ? ',' : String(sep)); },
        排序: function (a, fn) { a.sort(fn); return a; },
        反转: function (a) { a.reverse(); return a; },
        映射: function (a, fn) { return a.map(fn); },
        筛选: function (a, fn) { return a.filter(fn); },
        归并: function (a, fn, init) {
            return init === undefined ? a.reduce(fn) : a.reduce(fn, init);
        },
        查找: function (a, v) { return a.indexOf(v) + 1; }
    });
})(typeof window !== 'undefined' ? window : globalThis);
