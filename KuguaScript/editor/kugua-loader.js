/**
 * 苦瓜脚本 — 网页加载器
 *
 * 让普通网页直接使用苦瓜脚本，替代传统网页 JS 的一部分功能。
 * 脚本块在 DOMContentLoaded 之后按文档顺序依次执行，共享页面环境
 * （文档/窗口/本地存储等），互不污染内置全局。
 *
 * 引入方式（顺序无关，但必须在 KuguaCompiler 之后）：
 *   <script src="kugua-compiler.js"></script>
 *   <script src="kugua-loader.js"></script>
 *
 * 用法：
 *   <script type="text/kugua">说（“你好，网页！”）。</script>
 *   <script type="text/kugua" src="app.ks"></script>
 *
 * 浏览器运行时（src/runtime/browser.js）会在需要时自动加载；
 * 也可通过 KuguaLoader.ensureRuntime() 手动触发。
 */
(function (global) {
    'use strict';

    if (global.KuguaLoader) return; // 已加载过
    if (typeof global.KuguaCompiler !== 'function') {
        console.error('[苦瓜加载器] 未找到 KuguaCompiler，请先引入 kugua-compiler.js');
        return;
    }

    const compiler = new global.KuguaCompiler();
    const RUNTIME_PATH = '../src/runtime/browser.js';

    /**
     * 依据本文件地址推导运行时的相对路径：
     * /editor/kugua-loader.js → /src/runtime/browser.js
     */
    function resolveRuntimeUrl() {
        let base;
        try {
            const s = document.currentScript;
            base = s && s.src ? s.src : location.href;
        } catch (e) {
            base = location.href;
        }
        try {
            return new URL(RUNTIME_PATH, base).href;
        } catch (e) {
            return RUNTIME_PATH;
        }
    }

    let runtimePromise = null;
    function ensureRuntime() {
        // 已由用户手动引入或已加载过，直接返回
        if (typeof global.文档 !== 'undefined') return Promise.resolve();
        if (!runtimePromise) {
            runtimePromise = fetch(resolveRuntimeUrl())
                .then(function (res) {
                    if (!res.ok) throw new Error('加载浏览器运行时失败 (HTTP ' + res.status + ')');
                    return res.text();
                })
                .then(function (src) {
                    // 运行时是自执行 IIFE，放到全局作用域执行即可自动安装
                    new Function(src)();
                });
        }
        return runtimePromise;
    }

    function collectBlocks() {
        const blocks = [];
        const scripts = document.querySelectorAll('script[type="text/kugua"]');
        for (let i = 0; i < scripts.length; i++) {
            const el = scripts[i];
            const src = el.getAttribute('src');
            blocks.push({
                name: src || '内联苦瓜脚本 #' + (i + 1),
                src: src,
                source: src ? null : el.textContent
            });
        }
        return blocks;
    }

    function resolveUrl(path) {
        try {
            return new URL(path, location.href).href;
        } catch (e) {
            return path;
        }
    }

    function fetchSource(block) {
        if (block.source !== null) return Promise.resolve(block.source);
        const url = resolveUrl(block.src);
        return fetch(url).then(function (res) {
            if (!res.ok) throw new Error('加载失败: ' + block.src + ' (HTTP ' + res.status + ')');
            return res.text();
        });
    }

    function runSource(source, name) {
        const jsCode = compiler.compile(source, { runtime: 'none' });
        // 引入 语句需要 require；浏览器环境不支持模块加载，给出中文提示
        new Function('console', 'require', jsCode)(console, function (id) {
            throw new Error('浏览器运行时不支持 引入（' + id + '），请在 Node.js 或打包工具（Vite/esbuild）中使用');
        });
    }

    function runAll() {
        return ensureRuntime()
            .then(function () {
                return collectBlocks().reduce(function (chain, block) {
                    return chain
                        .then(function () { return fetchSource(block); })
                        .then(function (source) {
                            try {
                                runSource(source, block.name);
                            } catch (e) {
                                const msg = (global.KuguaErrors && global.KuguaErrors.translateErrorMessage)
                                    ? global.KuguaErrors.translateErrorMessage(e.message)
                                    : e.message;
                                console.error('[' + block.name + '] 运行失败: ' + msg);
                            }
                        });
                }, Promise.resolve());
            })
            .catch(function (e) {
                console.error('[苦瓜加载器] ' + e.message);
            });
    }

    function start() {
        if (location.protocol === 'file:') {
            console.warn('[苦瓜加载器] 当前页面通过 file:// 打开：内联脚本可用；' +
                '外部 .ks 文件（src 属性）需要 HTTP 服务。示例请通过 http://localhost:3002 访问。');
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runAll);
        } else {
            runAll();
        }
    }

    global.KuguaLoader = {
        compile: function (source) { return compiler.compile(source, { runtime: 'none' }); },
        run: runSource,
        runAll: runAll,
        ensureRuntime: ensureRuntime
    };

    start();
})(typeof window !== 'undefined' ? window : globalThis);
