/**
 * 苦瓜脚本 — 单文件离线构建
 *
 * 把「浏览器运行时 + 浏览器端编译器 + 网页加载器」合成一个文件：
 *   editor/kugua-loader.full.js
 *
 * 这个文件可以直接用 file:// 打开（内联苦瓜脚本可用），
 * 也可以复制到任何静态页面里，无需再引入其他脚本。
 */
const fs = require('fs');

const runtime = fs.readFileSync('src/runtime/browser.js', 'utf-8');
const compilerBundle = fs.readFileSync('editor/kugua-compiler.js', 'utf-8');
const loader = fs.readFileSync('editor/kugua-loader.js', 'utf-8');

let output = '// 苦瓜脚本 - 单文件离线版（自动生成，请勿手动编辑）\n';
output += '// 内联：浏览器运行时（src/runtime/browser.js）+ 编译器（kugua-compiler.js）+ 网页加载器（kugua-loader.js）\n';
output += '(function(global) {\n';
output += '    if (global.KuguaCompiler || global.KuguaLoader) return; // 已加载过则不重复安装\n\n';

output += '    // ===== 浏览器运行时（来源：src/runtime/browser.js）=====\n';
output += runtime.trim() + '\n\n';

output += '    // ===== 编译器（来源：editor/kugua-compiler.js）=====\n';
output += compilerBundle.trim() + '\n\n';

output += '    // ===== 网页加载器（来源：editor/kugua-loader.js）=====\n';
output += loader.trim() + '\n';
output += '})(typeof window !== "undefined" ? window : globalThis);\n';

fs.writeFileSync('editor/kugua-loader.full.js', output);
console.log('生成完成，行数:', output.split('\n').length);
console.log('包含运行时:', output.includes('浏览器运行时'));
console.log('包含编译器:', output.includes('KuguaCompiler'));
console.log('包含加载器:', output.includes('KuguaLoader'));
