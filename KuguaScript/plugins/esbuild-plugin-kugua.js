/**
 * 苦瓜脚本 — esbuild 插件
 *
 * 用法（Node API）：
 *   const esbuild = require('esbuild');
 *   const kugua = require('kuguascript/plugins/esbuild-plugin-kugua');
 *   esbuild.build({ entryPoints: ['app.js'], plugins: [kugua()] });
 *
 * 浏览器运行时（src/runtime/browser.js）需单独引入一次，之后即可：
 *   import './app.ks';
 */
const Compiler = require('../src/compiler');

function kuguaEsbuildPlugin(options = {}) {
    const runtimeMode = options.runtime || 'none';
    const compiler = new Compiler();

    return {
        name: 'kugua',
        setup(build) {
            build.onLoad({ filter: /\.ks$/ }, (args) => {
                const fs = require('fs');
                const source = fs.readFileSync(args.path, 'utf-8');
                const jsCode = compiler.compile(source, { runtime: runtimeMode });
                return { contents: jsCode, loader: 'js' };
            });
        }
    };
}

module.exports = kuguaEsbuildPlugin;
module.exports.default = kuguaEsbuildPlugin;
