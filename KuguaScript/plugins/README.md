# 苦瓜脚本构建插件

让 `.ks` 文件在现代前端工程中作为模块使用（副作用引入）。

> 注意：当前编译器生成的模块没有 `export`，因此请按副作用模块引入：
> `import './app.ks';`。`import x from './app.ks'` 拿到的 `x` 会是 `undefined`。
> 页面需要先加载一次浏览器运行时（`src/runtime/browser.js`），
> 编译出的代码依赖其中的中文全局（`文档`、`弹窗` 等）。

## Vite

```js
// vite.config.js
const kugua = require('kuguascript/plugins/vite-plugin-kugua');

module.exports = {
    plugins: [kugua()]
};
```

```js
// index.html（或入口模块 import 'kuguascript/src/runtime/browser.js'）
<script src="/node_modules/kuguascript/src/runtime/browser.js"></script>

// app.js
import './app.ks';
```

## esbuild

```js
const esbuild = require('esbuild');
const kugua = require('kuguascript/plugins/esbuild-plugin-kugua');

esbuild.build({
    entryPoints: ['app.js'],
    plugins: [kugua()]
});
```

## 本地联调

本仓库内直接使用（无需安装 npm 包）：

```js
const kugua = require('../plugins/vite-plugin-kugua');
```

选项：`{ runtime: 'none' | 'auto' }`，默认 `'none'`（由浏览器运行时提供内置函数）。
