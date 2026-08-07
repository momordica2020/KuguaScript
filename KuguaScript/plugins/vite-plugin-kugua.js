/**
 * 苦瓜脚本 — Vite 插件
 *
 * 用法（vite.config.js）：
 *   const kugua = require('kuguascript/plugins/vite-plugin-kugua');
 *   module.exports = { plugins: [kugua()] };
 *
 * 页面需要至少加载一次浏览器运行时（二选一）：
 *   - 在 index.html 中：<script src="…/runtime/browser.js"></script>
 *   - 或在入口模块中：import 'kuguascript/src/runtime/browser.js'
 *
 * 之后即可在 JS/TS 中引入苦瓜脚本（当前编译产物无导出，按副作用模块使用）：
 *   import './app.ks';
 */
const Compiler = require('../src/compiler');

function kuguaPlugin(options = {}) {
    const runtimeMode = options.runtime || 'none';
    const compiler = new Compiler();

    return {
        name: 'kugua',
        enforce: 'pre',
        transform(code, id) {
            if (!id.endsWith('.ks')) return null;
            const jsCode = compiler.compile(code, { runtime: runtimeMode });
            return { code: jsCode, map: null };
        }
    };
}

module.exports = kuguaPlugin;
module.exports.default = kuguaPlugin;
