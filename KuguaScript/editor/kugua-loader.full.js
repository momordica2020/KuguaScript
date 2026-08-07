// 苦瓜脚本 - 单文件离线版（自动生成，请勿手动编辑）
// 内联：浏览器运行时（src/runtime/browser.js）+ 编译器（kugua-compiler.js）+ 网页加载器（kugua-loader.js）
(function(global) {
    if (global.KuguaCompiler || global.KuguaLoader) return; // 已加载过则不重复安装

    // ===== 浏览器运行时（来源：src/runtime/browser.js）=====
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

    // ===== 编译器（来源：editor/kugua-compiler.js）=====
// 苦瓜脚本语言编译器 - 浏览器版本（自动生成，请勿手动编辑）
// 使用 IIFE 包裹，通过 window 或 globalThis 导出
(function(global) {

// ==================== 错误信息翻译器（来源：errors.js） ====================

/**
 * 苦瓜脚本 — 错误信息翻译器
 *
 * 把 JavaScript 引擎（V8）的英文报错翻译成易懂的中文。
 * 编译期错误（词法/语法分析器）本身就是中文，不受影响。
 *
 * Node 与浏览器共用：本模块不依赖任何 Node API。
 */

// 常见引擎报错模式 → 中文
const PATTERNS = [
    // ===== 未定义 / 引用错误 =====
    [/([\w$.\u4e00-\u9fa5]+) is not defined/, '变量“$1”未定义（可能拼写错误或还没有赋值）'],

    // ===== 读取属性失败 =====
    [/Cannot read properties of undefined \(reading '([^']+)'\)/, '读取未定义值的属性“$1”失败（可能该变量还没有赋值）'],
    [/Cannot read properties of null \(reading '([^']+)'\)/, '读取空值（null）的属性“$1”失败'],
    [/Cannot read property '([^']+)' of undefined/, '读取未定义值的属性“$1”失败（可能该变量还没有赋值）'],
    [/Cannot read property '([^']+)' of null/, '读取空值（null）的属性“$1”失败'],

    // ===== 设置属性失败 =====
    [/Cannot set properties of undefined \(setting '([^']+)'\)/, '给未定义值的属性“$1”赋值失败（可能该变量还没有赋值）'],
    [/Cannot set properties of null \(setting '([^']+)'\)/, '给空值（null）的属性“$1”赋值失败'],
    [/Cannot set property '([^']+)' of undefined/, '给未定义值的属性“$1”赋值失败（可能该变量还没有赋值）'],
    [/Cannot set property '([^']+)' of null/, '给空值（null）的属性“$1”赋值失败'],

    // ===== 调用 / 迭代 =====
    [/([\w$.\u4e00-\u9fa5]+) is not a function/, '“$1”不是一个函数，不能这样调用'],
    [/([\w$.\u4e00-\u9fa5]+) is not a constructor/, '“$1”不能作为构造器使用'],
    [/([\w$.\u4e00-\u9fa5]+) is not iterable/, '“$1”不是可迭代对象'],
    [/Cannot convert undefined or null to object/, '无法把空值（null/undefined）当作对象使用'],

    // ===== JSON 解析错误 =====
    [/Expected property name or '([^']*)' in JSON at position (\d+)/, 'JSON 格式错误：第 $2 个字符处应为属性名或 $1'],
    [/Unexpected token (\S+) in JSON at position (\d+)/, 'JSON 格式错误：第 $2 个字符处出现意外的内容 $1'],
    [/Unexpected end of JSON input/, 'JSON 格式错误：内容不完整'],
    [/Expected double-quoted property name in JSON at position (\d+)/, 'JSON 格式错误：第 $1 个字符处属性名应使用双引号'],
    [/Unexpected number in JSON at position (\d+)/, 'JSON 格式错误：第 $1 个字符处出现意外的数字'],
    [/Unexpected string in JSON at position (\d+)/, 'JSON 格式错误：第 $1 个字符处出现意外的字符串'],

    // ===== 语法类错误（运行期才暴露时）=====
    [/Invalid or unexpected token/, '代码中存在无效或意外的符号'],
    [/Unexpected end of input/, '代码不完整，缺少结尾部分'],
    [/Unexpected token '([^']+)'/, '出现意外的符号“$1”'],
    [/Unexpected token ([^\s]+)/, '出现意外的符号“$1”'],
    [/Unexpected identifier/, '出现意外的标识符'],
    [/Missing \) after argument list/, '函数调用缺少右括号“）”'],
    [/Missing catch or finally after try/, 'try 语句缺少对应的 catch 或 finally'],

    // ===== 其他常见运行时错误 =====
    [/Maximum call stack size exceeded/, '调用栈溢出：函数递归太深或循环调用次数过多'],
    [/Assignment to constant variable/, '不能给常量重新赋值'],
    [/Invalid array length/, '数组长度无效'],
    [/Object is not extensible/, '对象不可扩展'],

    // ===== V8 附加的行列信息 =====
    [/ \(line (\d+) column (\d+)\)$/, '（第 $1 行第 $2 列）'],

    // ===== Node 文件系统错误 =====
    [/ENOENT: no such file or directory, open '([^']+)'/, '找不到文件或目录：“$1”'],
    [/ENOENT: no such file or directory/, '找不到文件或目录'],
    [/EACCES: permission denied, open '([^']+)'/, '没有权限访问：“$1”'],
    [/EACCES: permission denied/, '没有权限访问'],
    [/EISDIR: illegal operation on a directory, read/, '“$1”是一个目录，不能当作文件读取'],
    [/EEXIST: file already exists, open '([^']+)'/, '文件已存在：“$1”'],
    [/ENOTDIR: not a directory/, '路径中的某项不是目录']
];

/**
 * 翻译单条错误信息
 * @param {string} message
 * @returns {string}
 */
function translateErrorMessage(message) {
    if (!message || typeof message !== 'string') return message;
    if (message.indexOf('运行出错：') === 0) return message;

    const original = message;
    // 去掉 "TypeError: " 之类的前缀，方便匹配
    let msg = message.replace(/^(TypeError|ReferenceError|RangeError|SyntaxError|EvalError|URIError|AggregateError|Error):\s*/i, '');

    // 依次应用所有模式（先匹配的先翻译，翻译结果不再被后续模式改写）
    for (const [re, zh] of PATTERNS) {
        if (re.test(msg) && /[a-zA-Z]/.test(msg)) {
            msg = msg.replace(re, zh);
        }
    }
    if (msg !== original) return msg;

    // 兜底：纯英文的引擎错误加中文前缀；已含中文的信息原样返回
    if (!/[\u4e00-\u9fa5]/.test(original)) {
        return '运行出错：' + original;
    }
    return original;
}

/**
 * 包装运行时错误：就地翻译 message（保留原始堆栈）
 * @param {Error} err
 * @returns {Error}
 */
function wrapRuntimeError(err) {
    if (!err || typeof err.message !== 'string') return err;
    const translated = translateErrorMessage(err.message);
    if (translated !== err.message) {
        err.message = translated;
    }
    return err;
}

const ErrorTranslator = {
    translateErrorMessage,
    wrapRuntimeError
};

// ==================== 常量定义（来源：constants.js） ====================

/**
 * 苦瓜脚本语言 — 全局常量定义
 * 所有语言关键字、运算符、令牌类型、AST节点类型的唯一数据源
 * 添加新语言特性时，只需在此文件中注册即可
 */

// ==================== 令牌类型 ====================
const TokenType = {
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    NULL: 'NULL',
    // 无实义语缀（如 正确的 的、空的 的）：独立成类，便于高亮灰化与解析跳过
    PARTICLE: 'PARTICLE',
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'IDENTIFIER',
    OPERATOR: 'OPERATOR',
    PUNCTUATION: 'PUNCTUATION',
    PAREN: 'PAREN',
    EOF: 'EOF'
};

// ==================== AST 节点类型 ====================
const NodeType = {
    Program: 'Program',
    BlockStatement: 'BlockStatement',
    IfStatement: 'IfStatement',
    ForStatement: 'ForStatement',
    ForOfStatement: 'ForOfStatement',
    ReturnStatement: 'ReturnStatement',
    PrintStatement: 'PrintStatement',
    BreakStatement: 'BreakStatement',
    TryStatement: 'TryStatement',
    ImportDeclaration: 'ImportDeclaration',
    ExportDeclaration: 'ExportDeclaration',
    AwaitExpression: 'AwaitExpression',
    WhileStatement: 'WhileStatement',
    DoWhileStatement: 'DoWhileStatement',
    ForEachStatement: 'ForEachStatement',
    PipelineStatement: 'PipelineStatement',
    ArrayExpression: 'ArrayExpression',
    FunctionDeclaration: 'FunctionDeclaration',
    ClassDeclaration: 'ClassDeclaration',
    ClassProperty: 'ClassProperty',
    ExpressionStatement: 'ExpressionStatement',
    AssignmentExpression: 'AssignmentExpression',
    LogicalExpression: 'LogicalExpression',
    BinaryExpression: 'BinaryExpression',
    UnaryExpression: 'UnaryExpression',
    CallExpression: 'CallExpression',
    MemberExpression: 'MemberExpression',
    Identifier: 'Identifier',
    Literal: 'Literal',
    VariableDeclaration: 'VariableDeclaration',
    UpdateExpression: 'UpdateExpression'
};

// ==================== 关键字 ====================
// 控制流关键字
const ControlKeywords = [
    '如果', '否则', '重复', '循环', '结束', '次', '以上', '情况',
    '尝试', '如果报错', '假如报错', '要是报错',
    '当', '直到', '遍历'
];

// 循环控制关键字
const LoopKeywords = [
    '开始于', '到', '为止', '每次'
];

// 函数相关关键字
const FunctionKeywords = [
    '输入', '返回', '结果是', '说'
];

// 类与对象关键字
const ObjectKeywords = [
    '类', '之', '的'
];

// 模块互操作关键字（引入/导出）
const ModuleKeywords = [
    '引入', '导出', '作为', '称作'
];

// 新句式关键字：把字句/设字句/等待/成员判断/循环
const SentenceKeywords = [
    '等待', '设', '设为', '减少', '每个', '此', '本', '不在',
    '先', '再', '然后', '最后', '如下', '缺省', '每当'
];

// 成员访问关键字
const AccessKeywords = [
    '第', '项'
];

// 比较运算关键字 → JS运算符
const ComparisonOperators = {
    '小于': '<',
    '大于': '>',
    '小于等于': '<=',
    '大于等于': '>=',
    '不大于': '<=',
    '不小于': '>='
};

// 相等运算关键字 → JS运算符
const EqualityOperators = {
    '是': '===',
    '等于': '===',
    '等价于': '===',
    '不是': '!==',
    '不等于': '!=='
};

// 逻辑运算关键字
const LogicalAndKeywords = ['并且','而且','且','以及'];      // &&
const LogicalOrKeywords = ['或者','或是','或'];        // ||
const LogicalNotKeywords = ['并非','非','不是'];         // !

// 包含运算：X 包含 Y → X.includes(Y)
const ContainsOperators = {
    '包含': '包含'
};

// 运算符类关键字（比较、相等、逻辑）— 始终完整识别为关键字，不作为标识符的一部分
// 这样 "i小于3" 会正确拆分为 "i" + "小于" + "3"，"a是b" 会拆分为 "a" + "是" + "b"
const OperatorKeywords = [
    ...Object.keys(ComparisonOperators),
    ...Object.keys(EqualityOperators),
    ...LogicalAndKeywords,
    ...LogicalOrKeywords,
    ...LogicalNotKeywords,
    ...Object.keys(ContainsOperators)
];

// 布尔值关键字 → JS布尔值
const BooleanKeywords = {
    // 带"的"的形式（正确的/真的/对的/错误的/错的/不对的）由词法分析器切分为
    // 基础词 + 无实义语缀"的"，不再作为独立关键词登记
    '正确': true, '真': true, '对': true,
    '错误': false, '错': false, '不对': false
};

// 空值关键字
const NullKeywords = ['空', '没了'];

// 中文数字（用于 第一项/第二十三项 索引）
const ChineseNumeralChars = '零一二三四五六七八九十百千万两';

// 条件语句别名（如果/若）
const IfAliases = ['如果', '若'];
// 返回语句别名（返回/结果是）
const ReturnAliases = ['返回', '结果是'];

// 所有关键字的合集（供词法分析器最长前缀匹配使用）
const AllKeywords = [
    ...ControlKeywords,
    ...LoopKeywords,
    ...FunctionKeywords,
    ...ObjectKeywords,
    ...ModuleKeywords,
    ...SentenceKeywords,
    ...AccessKeywords,
    ...Object.keys(ComparisonOperators),
    ...Object.keys(EqualityOperators),
    ...LogicalAndKeywords,
    ...LogicalOrKeywords,
    ...LogicalNotKeywords,
    ...Object.keys(ContainsOperators),
    // 保留关键字（尚未实现但已预留）
    '定义', '个', '长度', '功能', '方法', '全新', '就', '一直', '执行',
    '增加', '追加', '去除', '选择', '为', '则', '和', '与', '用', '以',
    '可', '使', '让', '被', '把', '将', '给', '向', '从', '在', '上', '下',
    '左', '右', '前', '后', '中', '内', '外', '间', '时', '的话', '而已',
    '而已矣', '罢了', '罢了罢了'
];

// 保留关键字（未实际在语法中使用，仅预留）
// 词法分析器在识别这些关键字时会检查后继字符，
// 若后跟标识符字符则不识别为关键字，避免阻断标识符识别
const ReservedKeywords = [
    '类', '项', '定义', '个', '长度', '功能', '方法', '全新', '就', '一直', '执行',
    '增加', '追加', '去除', '选择', '为', '则', '和', '与', '用', '以',
    '可', '使', '让', '被', '把', '将', '给', '向', '从', '在', '上', '下',
    '左', '右', '前', '后', '中', '内', '外', '间', '时', '的话', '而已',
    '而已矣', '罢了', '罢了罢了',
    '次', '引入', '导出',
    // 新句式关键词：后跟标识符字符时并入标识符（设X、当前、此值、减少量）
    '设', '减少', '此', '本', '当',
    // 流水句/函数头/默认参数/每当 关键字
    '先', '再', '然后', '最后', '如下', '缺省', '每当'
];

// ==================== 运算符 ====================
const Operators = ['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~'];

// ==================== 标点符号 ====================
const Punctuations = ['。', '，', '、', '：', '；', '？', '—', '！'];
const LeftParen = '（';
const RightParen = '）';
// 数组字面量方括号（【】）：【1、2、3】，空数组【】；字符串统一使用“”
const LeftArrayBracket = '【';
const RightArrayBracket = '】';

// ==================== 字符分类辅助 ====================
function isWhitespace(char) {
    return [' ', '\t', '\n', '\r'].includes(char);
}

function isDigit(char) {
    return /[0-9]/.test(char);
}

function isIdentifierStart(char) {
    return /[\u4e00-\u9fa5a-zA-Z_]/.test(char);
}

function isIdentifierPart(char) {
    return /[\u4e00-\u9fa5a-zA-Z0-9_]/.test(char);
}

function isChineseNumeralChar(char) {
    return !!char && ChineseNumeralChars.includes(char);
}

/**
 * 中文数字 → 阿拉伯数字（支持 二十三、一百二十三、一千零五、十万、两 等常见写法）
 */
function chineseToNumber(text) {
    const digits = { '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
    const units = { '十': 10, '百': 100, '千': 1000, '万': 10000 };
    let result = 0;
    let section = 0;
    let number = 0;
    for (const ch of text) {
        if (digits[ch] !== undefined) {
            number = digits[ch];
        } else {
            const unit = units[ch];
            if (unit >= 10000) {
                section = (section + number) * unit;
                result += section;
                section = 0;
                number = 0;
            } else {
                // 十/百/千 前无数字时按 1 计（十三 → 10+3、十万 → 100000）
                section += (number === 0 ? 1 : number) * unit;
                number = 0;
            }
        }
    }
    return result + section + number;
}

// ==================== 导出 ====================

const C = {
    TokenType, NodeType, ControlKeywords, LoopKeywords, FunctionKeywords,
    ObjectKeywords, ModuleKeywords, SentenceKeywords, AccessKeywords, ComparisonOperators, EqualityOperators,
    LogicalAndKeywords, LogicalOrKeywords, LogicalNotKeywords, OperatorKeywords,
    ContainsOperators, BooleanKeywords,
    NullKeywords, ChineseNumeralChars, IfAliases, ReturnAliases, AllKeywords, ReservedKeywords,
    Operators, Punctuations, LeftParen, RightParen, isWhitespace, isDigit,
    isIdentifierStart, isIdentifierPart, isChineseNumeralChar, chineseToNumber,
    LeftArrayBracket, RightArrayBracket
};

// ==================== AST 节点工厂函数（来源：ast.js） ====================

/**
 * 苦瓜脚本语言 — AST 节点工厂函数
 * 统一节点创建方式，减少散落的对象字面量
 */

function createNode(type, props = {}) {
    return { type, ...props };
}

function createToken(type, value, line, column) {
    return { type, value, line, column };
}

function createProgram(body) {
    return createNode(NodeType.Program, { body });
}

function createBlockStatement(body) {
    return createNode(NodeType.BlockStatement, { body });
}

function createIfStatement(condition, consequent, alternate) {
    return createNode(NodeType.IfStatement, { condition, consequent, alternate });
}

function createForStatement(init, condition, update, body) {
    return createNode(NodeType.ForStatement, { init, condition, update, body });
}

function createForOfStatement(left, right, body) {
    return createNode(NodeType.ForOfStatement, { left, right, body });
}

function createForEachStatement(name, collection, body) {
    return createNode(NodeType.ForEachStatement, { name, collection, body });
}

function createWhileStatement(condition, body) {
    return createNode(NodeType.WhileStatement, { condition, body });
}

function createDoWhileStatement(condition, body) {
    return createNode(NodeType.DoWhileStatement, { condition, body });
}

function createPipelineStatement(steps) {
    return createNode(NodeType.PipelineStatement, { steps });
}

function createReturnStatement(argument) {
    return createNode(NodeType.ReturnStatement, { argument });
}

function createPrintStatement(argument) {
    return createNode(NodeType.PrintStatement, { argument });
}

function createBreakStatement() {
    return createNode(NodeType.BreakStatement);
}

function createTryStatement(body, catchBody, errorName) {
    return createNode(NodeType.TryStatement, { body, catchBody, errorName });
}

function createImportDeclaration(moduleName, name) {
    return createNode(NodeType.ImportDeclaration, { moduleName, name });
}

function createExportDeclaration(name, alias) {
    return createNode(NodeType.ExportDeclaration, { name, alias });
}

function createArrayExpression(elements) {
    return createNode(NodeType.ArrayExpression, { elements });
}

function createFunctionDeclaration(name, params, body) {
    return createNode(NodeType.FunctionDeclaration, { name, params, body });
}

function createClassDeclaration(name, body) {
    return createNode(NodeType.ClassDeclaration, { name, body });
}

function createClassProperty(name, value) {
    return createNode(NodeType.ClassProperty, { name, value });
}

function createExpressionStatement(expression) {
    return createNode(NodeType.ExpressionStatement, { expression });
}

function createAssignmentExpression(left, right, operator) {
    return createNode(NodeType.AssignmentExpression, { left, right, operator });
}

function createLogicalExpression(operator, left, right) {
    return createNode(NodeType.LogicalExpression, { operator, left, right });
}

function createBinaryExpression(operator, left, right) {
    return createNode(NodeType.BinaryExpression, { operator, left, right });
}

function createUnaryExpression(operator, argument) {
    return createNode(NodeType.UnaryExpression, { operator, argument });
}

function createAwaitExpression(argument) {
    return createNode(NodeType.AwaitExpression, { argument });
}

function createCallExpression(callee, args) {
    return createNode(NodeType.CallExpression, { callee, arguments: args });
}

function createMemberExpression(object, property, computed) {
    return createNode(NodeType.MemberExpression, { object, property, computed });
}

function createIdentifier(name) {
    return createNode(NodeType.Identifier, { name });
}

function createLiteral(value, raw) {
    return createNode(NodeType.Literal, { value, raw });
}

function createVariableDeclaration(name, value) {
    return createNode(NodeType.VariableDeclaration, { name, value });
}

function createUpdateExpression(operator, argument) {
    return createNode(NodeType.UpdateExpression, { operator, argument });
}

const AST = {
    createNode, createToken, createProgram, createBlockStatement, createIfStatement,
    createForStatement, createForOfStatement, createForEachStatement, createWhileStatement, createDoWhileStatement,
    createPipelineStatement, createReturnStatement, createPrintStatement,
    createBreakStatement, createTryStatement, createImportDeclaration, createExportDeclaration,
    createFunctionDeclaration, createClassDeclaration, createClassProperty,
    createExpressionStatement, createAssignmentExpression, createLogicalExpression,
    createBinaryExpression, createUnaryExpression, createAwaitExpression, createCallExpression, createMemberExpression,
    createIdentifier, createLiteral, createVariableDeclaration, createUpdateExpression,
    createArrayExpression
};

// ==================== 词法分析器（来源：lexer.js） ====================

/**
 * 苦瓜脚本语言 — 词法分析器
 * 将源代码转换为令牌流，支持中文关键词、全角标点
 */

class Lexer {
    constructor(source) {
        this.source = source;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
    }

    tokenize() {
        while (this.position < this.source.length) {
            const current = this.peek();

            // 注释
            if (current === '/' && this.peekNext() === '/') {
                this.skipLineComment();
                continue;
            }
            if (current === '/' && this.peekNext() === '*') {
                this.skipBlockComment();
                continue;
            }

            // 字符串
            if (current === '\u201C') {
                this.tokens.push(this.readString());
                continue;
            }

            // 数字
            if (C.isDigit(current)) {
                this.tokens.push(this.readNumber());
                continue;
            }

            // 标识符和关键字
            if (C.isIdentifierStart(current)) {
                const idTokens = this.readIdentifierOrKeywords();
                for (const token of idTokens) {
                    this.tokens.push(token);
                }
                continue;
            }

            // 运算符
            if (C.Operators.includes(current)) {
                this.tokens.push(createToken(C.TokenType.OPERATOR, current, this.line, this.column));
                this.advance();
                continue;
            }

            // 标点符号
            if (C.Punctuations.includes(current)) {
                this.tokens.push(createToken(C.TokenType.PUNCTUATION, current, this.line, this.column));
                this.advance();
                continue;
            }

            // 括号
            if (current === C.LeftParen || current === C.RightParen
                || current === C.LeftArrayBracket || current === C.RightArrayBracket) {
                this.tokens.push(createToken(C.TokenType.PAREN, current, this.line, this.column));
                this.advance();
                continue;
            }

            // 空白
            if (C.isWhitespace(current)) {
                this.advance();
                continue;
            }

            throw new Error(`第 ${this.line} 行第 ${this.column} 列出现无法识别的字符“${current}”（字符串请使用中文引号“”）`);
        }

        this.tokens.push(createToken(C.TokenType.EOF, '', this.line, this.column));
        return this.tokens;
    }

    // ==================== 字符操作 ====================

    peek() {
        return this.source[this.position] || '';
    }

    peekNext() {
        return this.source[this.position + 1] || '';
    }

    advance() {
        const current = this.source[this.position];
        if (current === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        this.position++;
        return current;
    }

    // ==================== 读取方法 ====================

    readNumber() {
        let value = '';
        let hasDecimal = false;
        const startLine = this.line;
        const startColumn = this.column;

        while (this.position < this.source.length) {
            const current = this.peek();
            if (current === '.') {
                if (hasDecimal) break;
                hasDecimal = true;
                value += this.advance();
            } else if (C.isDigit(current)) {
                value += this.advance();
            } else {
                break;
            }
        }

        return createToken(C.TokenType.NUMBER, hasDecimal ? parseFloat(value) : parseInt(value), startLine, startColumn);
    }

    /**
     * 读取中文数字序列（一、二十三、一百二十三…），返回数值令牌
     */
    readChineseNumber() {
        const startLine = this.line;
        const startColumn = this.column;
        let value = '';
        while (C.isChineseNumeralChar(this.peek())) {
            value += this.advance();
        }
        return createToken(C.TokenType.NUMBER, C.chineseToNumber(value), startLine, startColumn);
    }

    /**
     * 判断 第 之后的字符是否构成中文数字索引：
     * 中文数字序列必须紧跟"项"（第一项），这样"第一个子节点"仍作为普通标识符
     */
    chineseIndexNextIsItem(pos) {
        let i = pos;
        while (i < this.source.length && C.isChineseNumeralChar(this.source[i])) i++;
        return this.source[i] === '项';
    }

    readString() {
        let value = '';
        const startLine = this.line;
        const startColumn = this.column;
        this.advance(); // 跳过开头引号

        while (this.position < this.source.length) {
            const current = this.peek();

            // 转义字符
            if (current === '\\') {
                this.advance();
                const next = this.peek();
                const escapeMap = { '\u201C': '\u201C', '\\': '\\', 'n': '\n', 'r': '\r', 't': '\t' };
                value += escapeMap[next] !== undefined ? escapeMap[next] : '\\' + next;
                this.advance();
                continue;
            }

            // 闭合引号
            if (current === '\u201D') {
                this.advance();
                break;
            }

            value += this.advance();
        }

        return createToken(C.TokenType.STRING, value, startLine, startColumn);
    }

    // ==================== 标识符与关键字识别 ====================

    readIdentifierOrKeywords() {
        const tokens = [];

        while (this.position < this.source.length && C.isIdentifierPart(this.peek())) {
            if (C.isDigit(this.peek())) {
                tokens.push(this.readNumber());
            } else {
                // 按优先级依次匹配：布尔值 → 空值 → 普通关键字 → 标识符
                const matched = this.matchKeywordSet(C.BooleanKeywords, C.TokenType.BOOLEAN)
                    || this.matchKeywordSet(C.NullKeywords, C.TokenType.NULL, null)
                    || this.matchLongestKeyword();

                if (matched) {
                    tokens.push(matched);
                    // 第 + 中文数字（第一项、第二十三项）：把数字序列转为数值令牌
                    if (matched.value === '第' && C.isChineseNumeralChar(this.peek())) {
                        tokens.push(this.readChineseNumber());
                    }
                    // 布尔/空值后的"的"是无实义语缀（正确的、空的），切为独立语缀令牌
                    if ((matched.type === C.TokenType.BOOLEAN || matched.type === C.TokenType.NULL)
                        && this.source.startsWith('的', this.position)) {
                        const startLine = this.line;
                        const startColumn = this.column;
                        this.advance();
                        tokens.push(createToken(C.TokenType.PARTICLE, '的', startLine, startColumn));
                    }
                } else {
                    tokens.push(this.readIdentifier());
                }
            }
        }

        return tokens;
    }

    /**
     * 通用关键字集匹配 — 替代原来三个重复方法
     * @param {Object|Array} keywordSet — 关键字映射表（布尔值）或数组（空值）
     * @param {string} tokenType — 匹配成功时的令牌类型
     * @param {*} tokenValue — 令牌值（不传则从映射表中取）
     */
    matchKeywordSet(keywordSet, tokenType, tokenValue) {
        const keys = Array.isArray(keywordSet) ? keywordSet : Object.keys(keywordSet);
        let matchedKey = null;
        let matchedLength = 0;

        for (const key of keys) {
            if (this.source.startsWith(key, this.position)) {
                // 检查关键字后面不是标识符字符（防止部分匹配）；
                // 布尔/空值后的"的"例外：它是无实义语缀，不属于标识符的一部分
                const nextChar = this.source[this.position + key.length];
                if (nextChar && C.isIdentifierPart(nextChar) && nextChar !== '的') continue;
                if (key.length > matchedLength) {
                    matchedKey = key;
                    matchedLength = key.length;
                }
            }
        }

        if (!matchedKey) return null;

        const startLine = this.line;
        const startColumn = this.column;
        for (let i = 0; i < matchedLength; i++) {
            this.advance();
        }

        // 如果是映射表，取对应的值；否则用传入的 tokenValue
        const value = tokenValue !== undefined ? tokenValue : keywordSet[matchedKey];
        return createToken(tokenType, value, startLine, startColumn);
    }

    matchLongestKeyword() {
        const startLine = this.line;
        const startColumn = this.column;
        let matchedKeyword = null;
        let matchedLength = 0;

        for (const keyword of C.AllKeywords) {
            // '第' 后跟数字、左括号、字母/下划线或中文数字(后随项)才是数组索引关键字
            // （第2项、第（i+1）项、标志组第i项、第一项）；后跟其它汉字则并入标识符（第一个子节点）
            if (keyword === '第') {
                const nxt = this.source[this.position + keyword.length];
                const isChineseIndex = nxt && C.isChineseNumeralChar(nxt)
                    && this.chineseIndexNextIsItem(this.position + keyword.length);
                if (!(nxt && (C.isDigit(nxt) || nxt === C.LeftParen || /[a-zA-Z_]/.test(nxt) || isChineseIndex))) continue;
            }
            if (this.source.startsWith(keyword, this.position)) {
                // 保留关键字（未实际使用）在后面紧跟标识符字符时不识别为关键字
                // 这样 "追加子节点" 不会被拆成 "追加" + "子节点"
                // 真正使用的关键字（在 ReservedKeywords 之外的）始终识别
                if (C.ReservedKeywords.includes(keyword)) {
                    const nextChar = this.source[this.position + keyword.length];
                    // 后跟标识符字符时并入标识符（如 类名），但成员访问符"之"/"的"除外
                    // （如 第2项的 / 第2项之，项 应作为独立关键字，因为"之""的"会终止标识符）
                    if (nextChar && C.isIdentifierPart(nextChar) && nextChar !== '之' && nextChar !== '的') continue;
                }
                if (keyword.length > matchedLength) {
                    matchedKeyword = keyword;
                    matchedLength = keyword.length;
                }
            }
        }

        if (!matchedKeyword) return null;

        for (let i = 0; i < matchedLength; i++) {
            this.advance();
        }
        return createToken(C.TokenType.KEYWORD, matchedKeyword, startLine, startColumn);
    }

    readIdentifier() {
        let value = '';
        const startLine = this.line;
        const startColumn = this.column;

        while (this.position < this.source.length && C.isIdentifierPart(this.peek())) {
            // 成员访问操作符"之"/"的"始终停止标识符读取
            if (this.source.startsWith('之', this.position) || this.source.startsWith('的', this.position)) {
                break;
            }
            // 遇到完整关键字前缀时停止
            // 但如果已读取了字符且关键字后跟标识符字符，则视为标识符一部分继续读取
            // 例如 "点击次数" 中 "次" 是关键字，但 "点击次" 后还有 "数"，应继续读取
            let hasKeywordPrefix = false;
            for (const keyword of C.AllKeywords) {
                if (keyword === '之' || keyword === '的') continue;
                if (this.source.startsWith(keyword, this.position)) {
                    let isComplete = true;
                    if (keyword === '第') {
                        // '第' 后跟数字/左括号/字母/中文数字(后随项) → 数组索引关键字
                        // （第2项、第（i+1）项、标志组第i项、第一项、第二十三项）
                        // 后跟其它字符 → 并入标识符（第一个子节点、第三次）
                        const nxt = this.source[this.position + keyword.length];
                        const isChineseIndex = nxt && C.isChineseNumeralChar(nxt)
                            && this.chineseIndexNextIsItem(this.position + keyword.length);
                        if (nxt && (C.isDigit(nxt) || nxt === C.LeftParen || /[a-zA-Z_]/.test(nxt) || isChineseIndex)) {
                            isComplete = true;
                        } else {
                            isComplete = false;
                        }
                    } else if (C.ReservedKeywords.includes(keyword)) {
                        const nextChar = this.source[this.position + keyword.length];
                        // 已读取标识符字符时，保留关键字并入标识符（如 血条外、日志外框）
                        // 未读取字符时，仅当后跟标识符字符才并入（如 类名），否则作为独立关键字（如 类：…）
                        // 成员访问符"之""的"除外（如 第2项之，项 应作为独立关键字）
                        if (keyword === '项' && value.length > 0 && /[a-zA-Z0-9_]/.test(value[value.length - 1])) {
                            // "项"作为索引结束符：标志组第i项 → 标志组 + 第 + i + 项
                            // （前面是字母/数字/下划线时切分；汉字结尾如"第一项"仍并入标识符）
                            isComplete = true;
                        } else if (value.length > 0) {
                            isComplete = false;
                        } else if (nextChar && C.isIdentifierPart(nextChar) && nextChar !== '之' && nextChar !== '的') {
                            isComplete = false;
                        }
                    } else if (value.length > 0) {
                        // 已读取字符时，检查关键字后是否还有标识符字符
                        // 但运算符类关键字（比较、相等、逻辑）始终视为完整关键字
                        // 这样 "i小于3" 会正确拆分为 "i" + "小于" + "3"
                        // 而 "点击次数" 中 "次" 不是运算符，后跟 "数" 时仍视为标识符一部分
                        if (C.OperatorKeywords.includes(keyword)) {
                            // 运算符类关键字始终完整识别，保持 isComplete = true
                        } else {
                            const nextChar = this.source[this.position + keyword.length];
                            if (nextChar && C.isIdentifierPart(nextChar)) {
                                isComplete = false;
                            }
                        }
                    }
                    if (isComplete) {
                        hasKeywordPrefix = true;
                        break;
                    }
                }
            }
            if (hasKeywordPrefix) break;
            value += this.advance();
        }

        return createToken(C.TokenType.IDENTIFIER, value, startLine, startColumn);
    }

    // ==================== 注释跳过 ====================

    skipLineComment() {
        while (this.position < this.source.length && this.peek() !== '\n') {
            this.advance();
        }
        if (this.peek() === '\n') {
            this.advance();
        }
    }

    skipBlockComment() {
        this.advance();
        this.advance();
        while (this.position < this.source.length) {
            if (this.peek() === '*' && this.peekNext() === '/') {
                this.advance();
                this.advance();
                break;
            }
            this.advance();
        }
    }
}

// ==================== 语法分析器（来源：parser.js） ====================

/**
 * 苦瓜脚本语言 — 语法分析器
 * 将令牌流解析为抽象语法树（AST）
 * 使用注册表模式分发语句解析，便于扩展新语句类型
 */

// 保留关键字中尚未实现的子集（用于给出更友好的报错提示）
const UNIMPLEMENTED_RESERVED = new Set(
    C.ReservedKeywords.filter(k => !['类', '项', '选择', '追加', '去除', '长度', '情况', '以上', '次',
        '先', '再', '然后', '最后', '如下', '缺省', '每当', '引入', '导出'].includes(k))
);

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
        // 数组字面量嵌套深度，用于区分【】内分隔符"、"与逻辑与运算符
        this.arrayDepth = 0;

        // 语句解析注册表：关键字 → 解析方法名
        // 添加新语句类型时，只需在此注册即可
        this.statementHandlers = {};
        this._registerStatementHandlers();
    }

    _registerStatementHandlers() {
        const handlers = {
            // [关键字数组]: 方法名
            [C.IfAliases.join(',')]: 'parseIfStatement',
            '重复': 'parseRepeatStatement',
            '循环': 'parseLoopStatement',
            [C.ReturnAliases.join(',')]: 'parseReturnStatement',
            '说': 'parsePrintStatement',
            '结束': 'parseBreakStatement',
            '选择': 'parseSwitchStatement',
            '类': 'parseClassStatement',
            '尝试': 'parseTryStatement',
            '引入': 'parseImportStatement',
            '导出': 'parseExportStatement',
            '把': 'parseBaStatement',
            '将': 'parseBaStatement',
            '设': 'parseSetStatement',
            '当': 'parseWhileStatement',
            '遍历': 'parseForEachStatement',
            '先': 'parsePipelineStatement',
            '每当': 'parseWheneverStatement'
        };

        for (const [key, method] of Object.entries(handlers)) {
            for (const kw of key.split(',')) {
                this.statementHandlers[kw] = method;
            }
        }
    }

    parse() {
        const program = AST.createProgram([]);

        while (!this.isAtEnd()) {
            const statement = this.parseStatement();
            if (statement) {
                program.body.push(statement);
            }
        }

        return program;
    }

    // ==================== 令牌操作工具 ====================

    isAtEnd() {
        return this.peek().type === C.TokenType.EOF;
    }

    peek() {
        return this.tokens[this.position] || { type: C.TokenType.EOF };
    }

    peekNext() {
        return this.tokens[this.position + 1] || { type: C.TokenType.EOF };
    }

    previous() {
        return this.tokens[this.position - 1];
    }

    advance() {
        return this.tokens[this.position++];
    }

    match(type, value) {
        const token = this.peek();
        if (token.type === type && (!value || token.value === value)) {
            return this.advance();
        }
        return null;
    }

    check(type, value) {
        const token = this.peek();
        return token.type === type && (!value || token.value === value);
    }

    expect(type, value, message) {
        const token = this.peek();
        if (token.type === type && (!value || token.value === value)) {
            return this.advance();
        }
        throw new Error(`${message} 在第 ${token.line} 行，第 ${token.column} 列`);
    }

    /**
     * 消费可选的句末符号：句号（。）或行末逗号（，）
     * 句号仅为句末提示符，可省略；行末逗号同样可作为语句结束符
     * 同一行内的逗号保留给表达式解析器作为逻辑或（OR）
     */
    consumeOptionalPeriodOrComma() {
        this.match(C.TokenType.PUNCTUATION, '。');
        const comma = this.peek();
        if (comma.type === C.TokenType.PUNCTUATION && comma.value === '，') {
            const next = this.peekNext();
            // 仅当逗号后是换行（或文件结束）时视为语句结束符
            if (next.type === C.TokenType.EOF || next.line > comma.line) {
                this.advance();
            }
        }
    }

    // ==================== 语句分发 ====================

    parseStatement() {
        // 行内连续语句：a：1，b：2。或 a：1，说（2）。
        // 逗号后紧跟另一条语句时，逗号只是语句分隔符，直接跳过
        while (this.check(C.TokenType.PUNCTUATION, '，') && this.isStatementStartNext()) {
            this.advance();
        }
        const token = this.peek();

        // 空语句：孤立的句号（仅为句末提示符，无实际内容）
        if (token.type === C.TokenType.PUNCTUATION && token.value === '。') {
            this.advance();
            return null;
        }

        // 通过注册表查找语句处理器
        if (token.type === C.TokenType.KEYWORD && this.statementHandlers[token.value]) {
            return this[this.statementHandlers[token.value]]();
        }

        // 函数头"如下"写法：初始化 如下：\n 语句…
        if (token.type === C.TokenType.IDENTIFIER && this.isAsFollowsStart()) {
            return this.parseAsFollowsFunction();
        }

        // 变量/成员赋值定义：标识符（之属性）后跟冒号（类内可用 此/本 开头）
        if (this.isTargetStartToken(token) && this.isDefinitionStart()) {
            return this.parseDefinition();
        }

        // "X是Y" 形式的赋值：语句开头的"是"作为赋值（如 勇者之生命 是 100。）
        // 注意：条件/表达式里的"是"仍是相等判断（如果 a是b：…），不受影响
        if (this.isTargetStartToken(token) && this.isShiAssignmentStart()) {
            return this.parseShiAssignment();
        }

        return this.parseExpressionStatement();
    }

    /**
     * 向前探测是否为定义语句
     * 匹配模式：标识符（之/的 属性名）* ：
     * 属性名可以是标识符或关键字
     * 不消耗令牌，只读取判断
     */
    isDefinitionStart() {
        return this.isDefinitionStartAt(this.position);
    }

    /**
     * 判断从指定位置开始是否是定义语句
     * 匹配模式：标识符（之/的 属性名）* ：
     */
    isDefinitionStartAt(pos) {
        if (!this.isTargetStartToken(this.tokens[pos])) return false;
        pos++;
        pos = this.skipMemberChain(pos);
        if (pos === null) return false;
        const t = this.tokens[pos];
        return !!t && t.type === C.TokenType.PUNCTUATION && t.value === '：';
    }

    /**
     * 判断逗号（当前在逗号位置）后是否紧跟另一条语句
     * 用于行内连续语句：a：1，b：2。
     */
    isStatementStartNext() {
        const t = this.peekNext();
        if (!t || t.type === C.TokenType.EOF) return false;
        // 语句关键字（如果/说/返回/结束/选择/类等）
        if (t.type === C.TokenType.KEYWORD && this.statementHandlers[t.value]) return true;
        // 定义语句：标识符（之成员链）* ：
        if (this.isTargetStartToken(t) && this.isDefinitionStartAt(this.position + 1)) return true;
        // 表达式语句：数字/字符串/布尔/空/标识符/括号/一元符号等
        // （逗号不再是逻辑或，因此 a：1，2。 表示两条语句：a=1；然后是 2。）
        if (t.type === C.TokenType.NUMBER || t.type === C.TokenType.STRING
            || t.type === C.TokenType.BOOLEAN || t.type === C.TokenType.NULL
            || t.type === C.TokenType.IDENTIFIER
            || (t.type === C.TokenType.PAREN && (t.value === C.LeftParen || t.value === C.LeftArrayBracket))
            || (t.type === C.TokenType.OPERATOR && (t.value === '-' || t.value === '!'))
            || (t.type === C.TokenType.KEYWORD && (t.value === '非' || t.value === '等待' || t.value === '此' || t.value === '本'))) {
            return true;
        }
        return false;
    }

    /**
     * 向前探测是否为"X是Y"赋值语句
     * 匹配模式：标识符（之/的 属性名）* 是
     */
    isShiAssignmentStart() {
        let pos = this.position;
        if (!this.isTargetStartToken(this.tokens[pos])) return false;
        pos++;
        pos = this.skipMemberChain(pos);
        if (pos === null) return false;
        const t = this.tokens[pos];
        return !!t && t.type === C.TokenType.KEYWORD && t.value === '是';
    }

    /**
     * 从指定位置跳过成员访问链（之/的属性名、第…项），返回跳过后的位置；
     * 链不完整时返回 null
     */
    skipMemberChain(pos) {
        while (pos < this.tokens.length) {
            const t = this.tokens[pos];
            if (t.type === C.TokenType.KEYWORD && (t.value === '之' || t.value === '的')) {
                pos++;
                // 之第X项 → 索引访问，跳过"之"交给下方"第"分支处理
                const n = this.tokens[pos];
                if (n && n.type === C.TokenType.KEYWORD && n.value === '第') {
                    continue;
                }
                if (pos < this.tokens.length &&
                    (this.tokens[pos].type === C.TokenType.IDENTIFIER ||
                     this.tokens[pos].type === C.TokenType.KEYWORD)) {
                    pos++;
                } else {
                    return null;
                }
            } else if (t.type === C.TokenType.KEYWORD && t.value === '第') {
                // 之/的第X项索引访问：跳过 第 + 索引 + 项
                pos++;
                while (pos < this.tokens.length && this.tokens[pos].type !== C.TokenType.KEYWORD &&
                       this.tokens[pos].value !== '项') {
                    pos++;
                }
                if (pos < this.tokens.length && this.tokens[pos].value === '项') {
                    pos++;
                } else {
                    return null;
                }
            } else {
                break;
            }
        }
        return pos;
    }

    /**
     * 赋值目标起始符：普通标识符，或类内自身关键字 此/本
     */
    isTargetStartToken(token) {
        return !!token
            && (token.type === C.TokenType.IDENTIFIER
                || (token.type === C.TokenType.KEYWORD && (token.value === '此' || token.value === '本')));
    }

    // ==================== 语句解析 ====================

    /**
     * 消费分支分隔符：冒号（：）或逗号（，）
     * 冒号任意位置均可；逗号通常在行末（换行后进入缩进分支块）
     */
    consumeBranchSeparator() {
        if (this.match(C.TokenType.PUNCTUATION, '：')) return;
        if (this.match(C.TokenType.PUNCTUATION, '，')) return;
        const t = this.peek();
        throw new Error(`此处期望冒号（：）或逗号（，） 在第 ${t.line} 行，第 ${t.column} 列`);
    }

    /**
     * 解析"如果/否则如果"语句头部的条件与分隔符
     * 条件可用括号包裹（传统写法），也可省略括号；分隔符可为冒号（：）或逗号（，）
     * 示例：
     *   如果（成绩 大于等于 90）：
     *   如果 成绩 大于等于 90：
     *   如果 成绩 大于等于 90，
     */
    parseIfConditionHeader() {
        let condition;
        if (this.match(C.TokenType.PAREN, C.LeftParen)) {
            condition = this.parseExpression();
            this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
        } else {
            condition = this.parseExpression();
            // 口语后缀：如果 天气 是 “雨” 的话：…
            this.match(C.TokenType.KEYWORD, '的话');
        }
        this.consumeBranchSeparator();
        return condition;
    }

    parseIfStatement() {
        const ifToken = this.advance();
        const condition = this.parseIfConditionHeader();
        const consequent = this.parseBlock(ifToken.column);
        const alternate = this.parseElseBlock(ifToken.column);
        return AST.createIfStatement(condition, consequent, alternate);
    }

    /**
     * 解析"否则"分支（含"否则如果"链）
     * 支持：否则：／否则，／否则如果（条件）：／否则如果 条件，／否则，如果 条件：
     */
    parseElseBlock(parentIndent) {
        // 支持行内写法：如果 条件：块，否则：块（逗号在"否则"之前）
        if (this.check(C.TokenType.PUNCTUATION, '，')
            && this.peekNext().type === C.TokenType.KEYWORD
            && this.peekNext().value === '否则') {
            this.advance();
        }
        if (!this.match(C.TokenType.KEYWORD, '否则')) return null;

        // 允许"否则，如果"与"否则如果"两种写法
        this.match(C.TokenType.PUNCTUATION, '，');

        if (this.match(C.TokenType.KEYWORD, '如果')) {
            const condition = this.parseIfConditionHeader();
            const consequent = this.parseBlock(parentIndent);
            return AST.createIfStatement(condition, consequent, this.parseElseBlock(parentIndent));
        }

        // 否则：或否则， 均可进入分支
        if (!this.match(C.TokenType.PUNCTUATION, '：')) {
            const prev = this.previous();
            if (!prev || prev.value !== '，') {
                const t = this.peek();
                throw new Error(`此处期望冒号（：）或逗号（，） 在第 ${t.line} 行，第 ${t.column} 列`);
            }
        }
        return this.parseBlock(parentIndent);
    }

    parseSwitchStatement() {
        const token = this.advance(); // 选择
        this.expect(C.TokenType.PAREN, C.LeftParen, '期望左括号');
        const argument = this.parseExpression();
        this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
        this.consumeBranchSeparator();

        const cases = [];
        let alternate = null;

        while (!this.isAtEnd()) {
            const t = this.peek();
            if (t.type === C.TokenType.KEYWORD && t.value === '情况') {
                this.advance();
                const test = this.parseExpression();
                this.consumeBranchSeparator();
                const body = this.parseBlock(token.column);
                cases.push({ test, body });
            } else if (t.type === C.TokenType.KEYWORD && t.value === '否则') {
                this.advance();
                this.consumeBranchSeparator();
                alternate = this.parseBlock(token.column);
                break; // 否则 是最后一个分支
            } else {
                break;
            }
        }

        // 从最后一个 case 往前构建 if / else-if / else 链
        let node = alternate;
        for (let i = cases.length - 1; i >= 0; i--) {
            const test = AST.createBinaryExpression('===', argument, cases[i].test);
            node = AST.createIfStatement(test, cases[i].body, node);
        }
        return node;
    }

    parseRepeatStatement() {
        const repeatToken = this.advance();

        // 重复 直到 条件 为止：do-while 循环（先执行一次，条件满足后停止）
        if (this.match(C.TokenType.KEYWORD, '直到')) {
            const condition = this.parseExpression();
            this.expect(C.TokenType.KEYWORD, '为止', '期望"为止"');
            this.consumeBranchSeparator();
            const body = this.parseBlock(repeatToken.column);
            return AST.createDoWhileStatement(condition, body);
        }

        this.expect(C.TokenType.PAREN, C.LeftParen, '期望左括号');

        // 初始化部分：开始于i=0
        let init = null;
        if (this.match(C.TokenType.KEYWORD, '开始于')) {
            const id = this.expect(C.TokenType.IDENTIFIER, null, '期望变量名');
            this.expect(C.TokenType.OPERATOR, '=', '期望等号');
            const value = this.parseSimpleValue();
            init = AST.createVariableDeclaration(id.value, value);
        }

        this.match(C.TokenType.PUNCTUATION, '，');
        this.expect(C.TokenType.KEYWORD, '到', '期望"到"');

        // 条件部分：i小于5
        const condition = this.parseSimpleCondition();
        this.expect(C.TokenType.KEYWORD, '为止', '期望"为止"');

        // 更新部分：每次i++
        let update = null;
        if (this.match(C.TokenType.PUNCTUATION, '，')) {
            this.expect(C.TokenType.KEYWORD, '每次', '期望"每次"');
            const id = this.expect(C.TokenType.IDENTIFIER, null, '期望变量名');
            this.expect(C.TokenType.OPERATOR, '+', '期望加号');
            this.expect(C.TokenType.OPERATOR, '+', '期望加号');
            update = AST.createUpdateExpression('++', AST.createIdentifier(id.value));
        }

        this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
        this.consumeBranchSeparator();

        const body = this.parseBlock(repeatToken.column);
        return AST.createForStatement(init, condition, update, body);
    }

    parseSimpleValue() {
        const token = this.peek();
        if (token.type === C.TokenType.NUMBER) {
            const num = this.advance();
            return AST.createLiteral(num.value, String(num.value));
        }
        if (token.type === C.TokenType.IDENTIFIER) {
            const id = this.advance();
            let expr = AST.createIdentifier(id.value);
            // 支持成员访问：敌人之生命（允许关键字作为属性名）
            while (this.match(C.TokenType.KEYWORD, '之') || this.match(C.TokenType.KEYWORD, '的')) {
                const next = this.peek();
                if (next.type === C.TokenType.IDENTIFIER || next.type === C.TokenType.KEYWORD) {
                    this.advance();
                    expr = AST.createMemberExpression(expr, AST.createIdentifier(next.value), false);
                } else {
                    break;
                }
            }
            return expr;
        }
        return this.parseExpression();
    }

    /**
     * 解析简单条件（用于循环语句中的条件部分）
     * 复用 ComparisonOperators 映射，避免重复 switch
     */
    parseSimpleCondition() {
        const left = this.parseSimpleValue();

        for (const [keyword, op] of Object.entries(C.ComparisonOperators)) {
            if (this.match(C.TokenType.KEYWORD, keyword)) {
                const right = this.parseSimpleValue();
                return AST.createBinaryExpression(op, left, right);
            }
        }

        return left;
    }

    parseLoopStatement() {
        const loopToken = this.advance();
        const count = this.parseExpression();
        this.expect(C.TokenType.KEYWORD, '次', '期望"次"');
        this.expect(C.TokenType.PAREN, C.LeftParen, '期望左括号');
        const paramToken = this.expect(C.TokenType.IDENTIFIER, null, '期望参数名');
        this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
        this.consumeBranchSeparator();

        const body = this.parseBlock(loopToken.column);
        return AST.createForOfStatement(
            AST.createVariableDeclaration(paramToken.value),
            count,
            body
        );
    }

    parseReturnStatement() {
        this.advance();
        // 支持无返回值（结果是。／结果是；／行末结果是，）
        if (this.check(C.TokenType.PUNCTUATION, '。') || this.check(C.TokenType.PUNCTUATION, '；')
            || (this.check(C.TokenType.PUNCTUATION, '，') && this.peekNext().line > this.peek().line)) {
            this.consumeOptionalPeriodOrComma();
            return AST.createReturnStatement(null);
        }
        const argument = this.parseExpression();
        this.consumeOptionalPeriodOrComma();
        return AST.createReturnStatement(argument);
    }

    parsePrintStatement() {
        this.advance();
        const argument = this.parseExpression();
        this.consumeOptionalPeriodOrComma();
        return AST.createPrintStatement(argument);
    }

    parseBreakStatement() {
        this.advance();
        this.consumeOptionalPeriodOrComma();
        return AST.createBreakStatement();
    }

    /**
     * 解析"尝试…如果报错…"错误处理语句
     * 捕获分支支持三种写法：如果报错／假如报错／要是报错
     * 可带错误变量绑定：如果报错（错误信息）：
     */
    parseTryStatement() {
        const tryToken = this.advance(); // 尝试
        this.consumeBranchSeparator();
        const body = this.parseBlock(tryToken.column);

        // 行内写法：尝试：…，如果报错：…（逗号在"如果报错"之前）
        if (this.check(C.TokenType.PUNCTUATION, '，')
            && this.peekNext().type === C.TokenType.KEYWORD
            && this.isCatchKeyword(this.peekNext().value)) {
            this.advance();
        }

        if (!this.isCatchKeyword(this.peek().value)) {
            const t = this.peek();
            throw new Error(`期望"如果报错"（或"假如报错"/"要是报错"） 在第 ${t.line} 行，第 ${t.column} 列`);
        }

        this.advance(); // 如果报错/假如报错/要是报错
        let errorName = null;
        if (this.match(C.TokenType.PAREN, C.LeftParen)) {
            errorName = this.expect(C.TokenType.IDENTIFIER, null, '期望错误变量名').value;
            this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
        }
        this.consumeBranchSeparator();
        const catchBody = this.parseBlock(tryToken.column);
        return AST.createTryStatement(body, catchBody, errorName);
    }

    /**
     * 解析"引入"语句：引入 “node:path” 作为 路径。／引入 “mod” 称作 工具。
     * 不带名字时为副作用引入：引入 “mod”。
     */
    parseImportStatement() {
        this.advance(); // 引入
        const moduleToken = this.expect(C.TokenType.STRING, null, '期望模块名字符串');
        let name = null;
        if (this.match(C.TokenType.KEYWORD, '作为') || this.match(C.TokenType.KEYWORD, '称作')) {
            name = this.expect(C.TokenType.IDENTIFIER, null, '期望引入名').value;
        }
        this.consumeOptionalPeriodOrComma();
        return AST.createImportDeclaration(moduleToken.value, name);
    }

    /**
     * 解析"导出"语句：导出 名字。／导出 名字 作为 别名。
     */
    parseExportStatement() {
        this.advance(); // 导出
        const name = this.expect(C.TokenType.IDENTIFIER, null, '期望导出变量名').value;
        let alias = null;
        if (this.match(C.TokenType.KEYWORD, '作为') || this.match(C.TokenType.KEYWORD, '称作')) {
            alias = this.expect(C.TokenType.IDENTIFIER, null, '期望导出别名').value;
        }
        this.consumeOptionalPeriodOrComma();
        return AST.createExportDeclaration(name, alias);
    }

    /**
     * 解析"把/将"字句：把 分 增加 1。／将 运行 设为 正确。／把 敌人之生命 减少 15。
     * 对应复合/普通赋值：+=、-=、=
     */
    parseBaStatement() {
        this.advance(); // 把/将
        const id = this.expectTargetStart();
        let target = AST.createIdentifier(id.value);
        target = this.parsePostfix(target);

        let operator = null;
        if (this.match(C.TokenType.KEYWORD, '增加')) {
            operator = '+=';
        } else if (this.match(C.TokenType.KEYWORD, '减少')) {
            operator = '-=';
        } else if (this.match(C.TokenType.KEYWORD, '设为')) {
            operator = '=';
        }
        if (!operator) {
            const t = this.peek();
            throw new Error(`期望"增加"/"减少"/"设为" 在第 ${t.line} 行，第 ${t.column} 列`);
        }

        const value = this.parseListValue();
        this.consumeOptionalPeriodOrComma();
        return AST.createExpressionStatement(AST.createAssignmentExpression(target, value, operator));
    }

    /**
     * 解析"设"字句：设 运行 为 错误。／设 名单 为 1、2、3。
     */
    parseSetStatement() {
        this.advance(); // 设
        const id = this.expectTargetStart();
        let target = AST.createIdentifier(id.value);
        target = this.parsePostfix(target);
        this.expect(C.TokenType.KEYWORD, '为', '期望"为"');
        const value = this.parseListValue();
        this.consumeOptionalPeriodOrComma();
        return AST.createExpressionStatement(AST.createAssignmentExpression(target, value, '='));
    }

    /**
     * 解析"当…时"循环：当 运行 时：…
     */
    parseWhileStatement() {
        const token = this.advance(); // 当
        const condition = this.parseExpression();
        this.expect(C.TokenType.KEYWORD, '时', '期望"时"');
        this.consumeBranchSeparator();
        const body = this.parseBlock(token.column);
        return AST.createWhileStatement(condition, body);
    }

    /**
     * 解析"遍历"语句：遍历 名单 中 的 每个 元素：…
     */
    parseForEachStatement() {
        const token = this.advance(); // 遍历
        const collection = this.parseExpression();
        this.expect(C.TokenType.KEYWORD, '中', '期望"中"');
        this.expect(C.TokenType.KEYWORD, '的', '期望"的"');
        this.expect(C.TokenType.KEYWORD, '每个', '期望"每个"');
        const name = this.expect(C.TokenType.IDENTIFIER, null, '期望遍历变量名').value;
        this.consumeBranchSeparator();
        const body = this.parseBlock(token.column);
        return AST.createForEachStatement(name, collection, body);
    }

    /**
     * 解析"先…再…然后…最后…"流水句：
     * 先 读取文件（“a.txt”），再 解析JSON（它），然后 说（它）。
     * 每一步的结果存入隐式变量"它"，后续步骤可用"它"引用上一步结果。
     */
    parsePipelineStatement() {
        this.advance(); // 先
        const steps = [this.parseExpression()];
        while (true) {
            // 允许行末逗号续接：先 A，再 B，然后 C，最后 D。
            if (this.check(C.TokenType.PUNCTUATION, '，')
                && this.peekNext().type === C.TokenType.KEYWORD
                && ['再', '然后', '最后'].includes(this.peekNext().value)) {
                this.advance(); // ，
                this.advance(); // 再/然后/最后
                steps.push(this.parseExpression());
                continue;
            }
            // 直接续接（无逗号）：先 A 再 B 然后 C
            if (this.peek().type === C.TokenType.KEYWORD
                && ['再', '然后', '最后'].includes(this.peek().value)) {
                this.advance();
                steps.push(this.parseExpression());
                continue;
            }
            break;
        }
        this.consumeOptionalPeriodOrComma();
        return AST.createPipelineStatement(steps);
    }

    /**
     * 解析"每当…就"：每当 条件，就 语句。／每当 条件：块
     */
    parseWheneverStatement() {
        const token = this.advance(); // 每当
        const condition = this.parseExpression();
        let body;
        if (this.check(C.TokenType.PUNCTUATION, '，')
            && this.peekNext().type === C.TokenType.KEYWORD
            && this.peekNext().value === '就') {
            this.advance(); // ，
            this.advance(); // 就
            const stmt = this.parseStatement();
            body = AST.createBlockStatement(stmt ? [stmt] : []);
        } else {
            this.consumeBranchSeparator();
            body = this.parseBlock(token.column);
        }
        return AST.createWhileStatement(condition, body);
    }

    /**
     * 向前探测"名字 如下："函数头写法
     */
    isAsFollowsStart() {
        const t = this.tokens[this.position];
        const n = this.tokens[this.position + 1];
        const nn = this.tokens[this.position + 2];
        return !!t && !!n && !!nn
            && t.type === C.TokenType.IDENTIFIER
            && n.type === C.TokenType.KEYWORD && n.value === '如下'
            && nn.type === C.TokenType.PUNCTUATION && nn.value === '：';
    }

    /**
     * 解析"如下"函数头：初始化 如下：\n 语句…（等价于 初始化：输入；）
     */
    parseAsFollowsFunction() {
        const id = this.advance();
        this.advance(); // 如下
        this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');
        const body = this.parseBlock(id.column);
        return AST.createFunctionDeclaration(id.value, [], body);
    }

    /**
     * 赋值目标起始符解析：普通标识符或类内 此/本
     */
    expectTargetStart() {
        const token = this.peek();
        if (this.isTargetStartToken(token)) {
            return this.advance();
        }
        throw new Error(`期望变量名 在第 ${token.line} 行，第 ${token.column} 列`);
    }

    isCatchKeyword(value) {
        return value === '如果报错' || value === '假如报错' || value === '要是报错';
    }

    parseClassStatement() {
        const classToken = this.advance();
        const name = this.expect(C.TokenType.IDENTIFIER, null, '期望类名');
        this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');
        const body = this.parseClassBody(classToken.column);
        return AST.createClassDeclaration(name.value, body);
    }

    // ==================== 定义解析（变量/函数/类/成员赋值） ====================

    parseDefinition() {
        const id = this.advance();
        let target = AST.createIdentifier(id.value);

        // 处理成员访问链与索引访问：敌人之生命、数组之第3项
        // 允许关键字作为属性名
        target = this.parsePostfix(target);

        this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');

        // 函数定义（仅当左侧是简单标识符时支持）
        if (target.type === C.NodeType.Identifier && this.match(C.TokenType.KEYWORD, '输入')) {
            const params = this.parseFunctionParams();
            this.expect(C.TokenType.PUNCTUATION, '；', '期望分号');
            const body = this.parseBlock(id.column);
            return AST.createFunctionDeclaration(id.value, params, body);
        }

        // 类定义（仅当左侧是简单标识符时支持）
        if (target.type === C.NodeType.Identifier) {
            const next = this.peek();
            const nextNext = this.peekNext();
            if (next.type === C.TokenType.IDENTIFIER && nextNext.value === '：') {
                const body = this.parseClassBody(id.column);
                return AST.createClassDeclaration(id.value, body);
            }
        }

        // 变量赋值或成员赋值（用 ExpressionStatement 包装以生成分号）
        // 右侧支持顿号列表（蛇身：210、209、208。）作为数组
        const value = this.parseListValue();
        this.consumeOptionalPeriodOrComma();
        return AST.createExpressionStatement(AST.createAssignmentExpression(target, value));
    }

    /**
     * "X是Y" 形式的赋值语句（如：勇者之生命 是 100。）
     * 语句开头的"是"作为赋值关键词；条件判断里的"是"仍是相等运算符，
     * 由表达式解析器（parseEquality）处理，不受此方法影响。
     */
    parseShiAssignment() {
        const id = this.advance();
        let target = AST.createIdentifier(id.value);
        // 处理成员访问链与索引访问：勇者之生命、数组之第3项
        target = this.parsePostfix(target);
        this.expect(C.TokenType.KEYWORD, '是', '期望"是"');
        const value = this.parseListValue();
        this.consumeOptionalPeriodOrComma();
        return AST.createExpressionStatement(AST.createAssignmentExpression(target, value));
    }

    /**
     * 解析"顿号列表"值：冒号/是赋值右侧支持直接顿号列举（如 蛇身：210、209、208。）
     * 只有一个元素时返回该表达式本身；多个元素时包装为数组字面量。
     * 顿号在括号内仍是函数参数分隔，互不冲突。
     */
    parseListValue() {
        const first = this.parseExpression();
        const elements = [first];
        while (this.match(C.TokenType.PUNCTUATION, '、')) {
            const next = this.peek();
            if (next.type === C.TokenType.EOF
                || (next.type === C.TokenType.PUNCTUATION && (next.value === '。' || next.value === '；' || next.value === '，'))
                || this.isBlockTerminator(next)) {
                break; // 允许尾随顿号
            }
            elements.push(this.parseExpression());
        }
        if (elements.length > 1) {
            return AST.createArrayExpression(elements);
        }
        return first;
    }

    /**
     * 解析函数参数列表（共享逻辑）
     * 参数名不加引号，以顿号（、）分隔：
     *   新写法：输入 名字、年龄；
     * 兼容保留旧写法（参数名用中文引号括起）：
     *   旧写法：输入“名字”、“年龄”；
     * 两种写法都支持可选的括号包裹：输入（名字、年龄）；
     */
    parseFunctionParams() {
        const params = [];
        const hasParen = this.match(C.TokenType.PAREN, C.LeftParen);

        // 无参数函数：输入； 或 输入（）；
        if ((!hasParen && this.check(C.TokenType.PUNCTUATION, '；'))
            || (hasParen && this.check(C.TokenType.PAREN, C.RightParen))) {
            if (hasParen) this.advance();
            return params;
        }

        while (true) {
            const token = this.peek();
            if (token.type === C.TokenType.STRING
                || token.type === C.TokenType.IDENTIFIER
                || token.type === C.TokenType.KEYWORD) {
                this.advance();
                const param = AST.createIdentifier(token.value);
                // 默认参数：输入 名字 缺省 为 “路人”；
                if (this.match(C.TokenType.KEYWORD, '缺省')) {
                    this.expect(C.TokenType.KEYWORD, '为', '期望"为"');
                    param.default = this.parseExpression();
                }
                params.push(param);
            } else {
                throw new Error(`期望参数名 在第 ${token.line} 行，第 ${token.column} 列`);
            }
            if (this.match(C.TokenType.PUNCTUATION, '、')) continue;
            break;
        }

        if (hasParen) {
            this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
        }

        return params;
    }

    // ==================== 代码块与类体 ====================

    parseBlock(parentIndent) {
        const body = [];

        while (!this.isAtEnd()) {
            const token = this.peek();
            if (this.isBlockTerminator(token)) break;
            // 尝试块的捕获分支：如果报错/假如报错/要是报错
            if (token.type === C.TokenType.KEYWORD && this.isCatchKeyword(token.value)) break;
            // 行内分支结束：…，否则 …（如 如果 条件：块，否则：块。）
            if (token.type === C.TokenType.PUNCTUATION && token.value === '，') {
                const next = this.peekNext();
                if (next.type === C.TokenType.KEYWORD
                    && (next.value === '否则' || next.value === '以上' || next.value === '情况'
                        || this.isCatchKeyword(next.value))) {
                    break;
                }
            }
            if (parentIndent !== undefined && token.column <= parentIndent) break;

            const statement = this.parseStatement();
            if (statement) body.push(statement);
        }

        // 可选的"以上。"结束标记
        if (this.match(C.TokenType.KEYWORD, '以上')) {
            this.consumeOptionalPeriodOrComma();
        }

        return AST.createBlockStatement(body);
    }

    parseClassBody(parentIndent) {
        const body = [];

        while (!this.isAtEnd()) {
            const token = this.peek();
            if (this.isBlockTerminator(token)) break;
            if (parentIndent !== undefined && token.column <= parentIndent) break;

            const next = this.peekNext();
            if (next && next.value === '：') {
                const id = this.advance();
                this.advance(); // 冒号

                // 嵌套类：冒号后是"标识符："（如 史莱姆：\n名字：…），而非属性值
                const after = this.peek();
                const afterNext = this.peekNext();
                if (after.type === C.TokenType.IDENTIFIER && afterNext.value === '：') {
                    const nestedBody = this.parseClassBody(id.column);
                    body.push(AST.createClassDeclaration(id.value, nestedBody));
                    continue;
                }

                if (this.match(C.TokenType.KEYWORD, '输入')) {
                    // 方法定义
                    const params = this.parseFunctionParams();
                    this.expect(C.TokenType.PUNCTUATION, '；', '期望分号');
                    const funcBody = this.parseClassBody(id.column);
                    body.push(AST.createFunctionDeclaration(id.value, params, funcBody));
                } else {
                    // 属性定义（右侧支持顿号列表）
                    const value = this.parseListValue();
                    this.consumeOptionalPeriodOrComma();
                    body.push(AST.createClassProperty(id.value, value));
                }
            } else {
                const statement = this.parseStatement();
                if (statement) body.push(statement);
            }
        }

        return AST.createBlockStatement(body);
    }

    /**
     * 判断当前令牌是否是代码块终止符
     * 注意：'结束' 作为 break 语句使用，不作为块终止符
     */
    isBlockTerminator(token) {
        return token.type === C.TokenType.KEYWORD
            && (token.value === '否则' || token.value === '以上' || token.value === '情况');
    }

    parseExpressionStatement() {
        const expression = this.parseExpression();
        this.consumeOptionalPeriodOrComma();
        return AST.createExpressionStatement(expression);
    }

    // ==================== 表达式解析（优先级从低到高） ====================

    parseExpression() {
        return this.parseLogicalOr();
    }

    parseLogicalOr() {
        let left = this.parseLogicalAnd();
        // 逻辑或：或者/或是/或（逗号不是逻辑或，只作分隔符）
        while (true) {
            let matched = false;
            for (const kw of C.LogicalOrKeywords) {
                if (this.match(C.TokenType.KEYWORD, kw)) {
                    const right = this.parseLogicalAnd();
                    left = AST.createLogicalExpression('||', left, right);
                    matched = true;
                    break;
                }
            }
            if (!matched) break;
        }
        return left;
    }

    parseLogicalAnd() {
        let left = this.parseEquality();
        // 逻辑与：并且/而且/且/以及（顿号不是逻辑与，只作分隔符）
        while (true) {
            let matched = false;
            for (const kw of C.LogicalAndKeywords) {
                if (this.match(C.TokenType.KEYWORD, kw)) {
                    const right = this.parseEquality();
                    left = AST.createLogicalExpression('&&', left, right);
                    matched = true;
                    break;
                }
            }
            if (!matched) break;
        }
        return left;
    }

    parseEquality() {
        let left = this.parseComparison();
        // 复用 EqualityOperators 映射，避免重复
        for (const [keyword, op] of Object.entries(C.EqualityOperators)) {
            if (this.match(C.TokenType.KEYWORD, keyword)) {
                const right = this.parseComparison();
                left = AST.createBinaryExpression(op, left, right);
                return left;
            }
        }
        // 可能连续出现相等运算（虽然不常见）
        while (true) {
            let matched = false;
            for (const [keyword, op] of Object.entries(C.EqualityOperators)) {
                if (this.match(C.TokenType.KEYWORD, keyword)) {
                    const right = this.parseComparison();
                    left = AST.createBinaryExpression(op, left, right);
                    matched = true;
                    break;
                }
            }
            if (!matched) break;
        }
        return left;
    }

    parseComparison() {
        let left = this.parseAdditive();
        // 比较运算 + 包含运算（问句 包含 标志组第i项）
        const operators = {
            ...C.ComparisonOperators,
            ...C.ContainsOperators
        };
        while (true) {
            let matched = false;
            // 在…中 / 不在…中：X 在 名单 中 → X.includes(名单)
            if (this.check(C.TokenType.KEYWORD, '在') || this.check(C.TokenType.KEYWORD, '不在')) {
                const isNot = this.advance().value === '不在';
                const right = this.parseAdditive();
                this.expect(C.TokenType.KEYWORD, '中', '期望"中"');
                // X 在 Y 中 → Y.includes(X)，容器在右侧
                let expr = AST.createBinaryExpression('包含', right, left);
                if (isNot) expr = AST.createUnaryExpression('!', expr);
                left = expr;
                matched = true;
            }
            for (const [keyword, op] of Object.entries(operators)) {
                if (this.match(C.TokenType.KEYWORD, keyword)) {
                    const right = this.parseAdditive();
                    left = AST.createBinaryExpression(op, left, right);
                    matched = true;
                    break;
                }
            }
            if (!matched) break;
        }
        return left;
    }

    parseAdditive() {
        let left = this.parseMultiplicative();
        while (this.match(C.TokenType.OPERATOR, '+') || this.match(C.TokenType.OPERATOR, '-')) {
            const op = this.previous().value;
            const right = this.parseMultiplicative();
            left = AST.createBinaryExpression(op, left, right);
        }
        return left;
    }

    parseMultiplicative() {
        let left = this.parseUnary();
        while (this.match(C.TokenType.OPERATOR, '*') || this.match(C.TokenType.OPERATOR, '/') || this.match(C.TokenType.OPERATOR, '%')) {
            const op = this.previous().value;
            const right = this.parseUnary();
            left = AST.createBinaryExpression(op, left, right);
        }
        return left;
    }

    parseUnary() {
        if (this.match(C.TokenType.OPERATOR, '!')) {
            return AST.createUnaryExpression('!', this.parseUnary());
        }
        // 等待（await）：等待 获取（“url”）
        if (this.match(C.TokenType.KEYWORD, '等待')) {
            return AST.createAwaitExpression(this.parseUnary());
        }
        // 一元非：非/并非/不是
        for (const kw of C.LogicalNotKeywords) {
            if (this.match(C.TokenType.KEYWORD, kw)) {
                return AST.createUnaryExpression('!', this.parseUnary());
            }
        }
        if (this.match(C.TokenType.OPERATOR, '-')) {
            return AST.createUnaryExpression('-', this.parseUnary());
        }
        return this.parseCall();
    }

    parseCall() {
        let expression = this.parseMember();
        while (true) {
            let advanced = false;

            // 函数调用：f（a，b）
            if (this.match(C.TokenType.PAREN, C.LeftParen)) {
                const args = [];
                if (!this.match(C.TokenType.PAREN, C.RightParen)) {
                    args.push(this.parseArgumentExpression());
                    while (this.match(C.TokenType.PUNCTUATION, '，')) {
                        args.push(this.parseArgumentExpression());
                    }
                    this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
                }
                expression = AST.createCallExpression(expression, args);
                advanced = true;
            }

            // 调用结果后再接成员/索引访问：
            // 文档之创建元素（“style”）之设置文本（“table…”） → (文档.创建元素)(“style”).设置文本(…)
            const postfixed = this.parsePostfix(expression);
            if (postfixed !== expression) {
                expression = postfixed;
                advanced = true;
            }

            if (!advanced) break;
        }
        return expression;
    }

    parseArgumentExpression() {
        return this.parseLogicalAnd();
    }

    parseMember() {
        return this.parsePostfix(this.parsePrimary());
    }

    /**
     * 后缀表达式：成员访问（之/的）与索引访问（第...项）
     * 供 parseMember 与赋值目标解析共用
     */
    parsePostfix(object) {
        while (true) {
            const op = this.peek();
            // 无实义语缀"的"（正确的、空的）：直接跳过，不构成成员访问
            if (op.type === C.TokenType.PARTICLE) {
                this.advance();
                continue;
            }
            // 之/的 成员访问
            // 允许关键字作为属性名（如"追加"、"包含"等保留字）
            if (op.type === C.TokenType.KEYWORD && (op.value === '之' || op.value === '的')) {
                const next = this.peekNext();
                // 的/之 + 第...项 → 索引访问（如 孩子列表的第3项），跳过操作符交给下方索引解析
                if (next.type === C.TokenType.KEYWORD && next.value === '第') {
                    this.advance();
                    continue;
                }
                if (next.type === C.TokenType.IDENTIFIER || next.type === C.TokenType.KEYWORD) {
                    this.advance();
                    this.advance();
                    object = AST.createMemberExpression(object, AST.createIdentifier(this.previous().value), false);
                } else {
                    throw new Error(`期望属性名 在第 ${next.line} 行，第 ${next.column} 列`);
                }
                continue;
            }

            // 第...项 索引访问
            if (op.type === C.TokenType.KEYWORD && op.value === '第') {
                this.advance();
                const index = this.parseExpression();
                this.expect(C.TokenType.KEYWORD, '项', '期望"项"');
                object = AST.createMemberExpression(object, index, true);
                continue;
            }

            break;
        }

        return object;
    }

    parsePrimary() {
        if (this.match(C.TokenType.NUMBER)) {
            return AST.createLiteral(this.previous().value, String(this.previous().value));
        }
        if (this.match(C.TokenType.STRING)) {
            return AST.createLiteral(this.previous().value, '"' + this.previous().value + '"');
        }
        if (this.match(C.TokenType.BOOLEAN)) {
            return AST.createLiteral(this.previous().value, String(this.previous().value));
        }
        if (this.match(C.TokenType.NULL)) {
            return AST.createLiteral(null, 'null');
        }
        if (this.match(C.TokenType.IDENTIFIER)) {
            return AST.createIdentifier(this.previous().value);
        }
        // 类内自身：此/本 → this
        if (this.match(C.TokenType.KEYWORD, '此') || this.match(C.TokenType.KEYWORD, '本')) {
            return AST.createIdentifier(this.previous().value);
        }
        // 说 在表达式位置也可调用（如流水句 最后 说（它））
        if (this.match(C.TokenType.KEYWORD, '说')) {
            return AST.createIdentifier('说');
        }
        if (this.match(C.TokenType.PAREN, C.LeftParen)) {
            const expression = this.parseExpression();
            this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
            return expression;
        }
        // 数组字面量：【元素1、元素2、…】，空数组【】
        if (this.match(C.TokenType.PAREN, C.LeftArrayBracket)) {
            this.arrayDepth++;
            const elements = [];
            if (!this.check(C.TokenType.PAREN, C.RightArrayBracket)) {
                elements.push(this.parseExpression());
                while (this.match(C.TokenType.PUNCTUATION, '、')) {
                    if (this.check(C.TokenType.PAREN, C.RightArrayBracket)) break; // 允许尾随分隔符
                    elements.push(this.parseExpression());
                }
            }
            this.arrayDepth--;
            this.expect(C.TokenType.PAREN, C.RightArrayBracket, '期望右方括号');
            return AST.createArrayExpression(elements);
        }

        const token = this.peek();
        if (token.type === C.TokenType.EOF) {
            throw new Error(`第 ${token.line} 行第 ${token.column} 列处代码意外结束，请检查是否有未闭合的分支或语句`);
        }
        if (UNIMPLEMENTED_RESERVED.has(token.value)) {
            throw new Error(`第 ${token.line} 行第 ${token.column} 列使用保留关键字“${token.value}”，当前版本尚未实现该语法`);
        }
        throw new Error(`第 ${token.line} 行第 ${token.column} 列附近出现无法识别的符号“${token.value}”，请检查语法`);
    }
}

// ==================== 运行时注册表（来源：runtime/registry.js） ====================

/**
 * 苦瓜脚本 — 运行时注册表
 *
 * 所有内置中文全局名（及其英文兼容别名）的唯一数据源：
 *  - codeGenerator 据此跳过对内置名的 var 预声明（SANDBOX_GLOBALS）
 *  - runtime/browser.js 与 runtime/node.js 据此安装具体实现
 *
 * 新增内置函数时的标准流程：
 *  1. 在此处登记名称
 *  2. 在 runtime/browser.js 和/或 runtime/node.js 中实现
 *  3. 重新执行 node build-browser.js 生成浏览器编译器
 */

const BUILTIN_NAMES = [
    // ===== 输入输出 =====
    '弹窗', '询问', '确认', '写入',

    // ===== 数学与转换 =====
    '随机数字', '向下取整', '向上取整', '绝对值', '转整数', '转数字',

    // ===== 定时器 =====
    '设置定时器', '清除定时器', '设置循环', '清除循环',
    'startLoop', 'stopLoop', 'setT', 'clearT',
    '请求动画帧', '取消动画帧',

    // ===== 对象 =====
    '对象', '创建对象',

    // ===== 数据格式 =====
    '解析JSON', '字符串化JSON',

    // ===== 浏览器环境（DOM / BOM）=====
    '文档', '窗口', '本地存储', '会话存储',
    '数学', '日期', '历史', '控制台', '屏幕', '定位',

    // ===== 网络 =====
    '获取',

    // ===== Node.js 环境（文件 / 进程 / 交互输入）=====
    '读取文件', '写入文件', '追加文件', '删除文件', '存在文件', '读取目录',
    '命令行参数', '当前目录', '退出', '读取输入',

    // ===== 中文命名空间标准库（对象，方法用 之 访问）=====
    '路径', '网址', '加密', '文件', '系统', '环境变量', '缓冲', '服务器',
    '画布', '剪贴板', '文本', '列表',

    // ===== 常用辅助（部分由编译器直接识别，此处防御性登记）=====
    '说', '追加', '移除',

    // ===== 布尔/空值（由编译器识别为字面量，此处防御性登记）=====
    '空', '正确', '错误'
];

const RUNTIME_REGISTRY = {
    BUILTIN_NAMES
};

// ==================== 代码生成器（来源：codeGenerator.js） ====================

/**
 * 苦瓜脚本语言 — 代码生成器
 * 将AST转换为JavaScript代码
 * 使用 generate(node) 返回字符串的方式替代全局 output 拼接
 */

// 内置全局标识符（来自运行时注册表）：KS代码运行时由宿主环境提供，
// 代码生成器禁止在顶部 var 声明它们，否则会因变量提升被赋值为 undefined。
// 新增内置函数时只需在 src/runtime/registry.js 登记名称即可。
const SANDBOX_GLOBALS = new Set(RUNTIME_REGISTRY.BUILTIN_NAMES);

// 数组/对象成员别名 → JS 属性/方法
const MEMBER_ALIAS = {
    '长度': 'length',
    '追加': 'push',
    '移除尾部': 'pop',
    '移除头部': 'shift',
    '插入头部': 'unshift'
};

class CodeGenerator {
    constructor(options) {
        this.options = options || {};
    }

    generate(node, options) {
        // 每次调用的选项独立生效，不污染构造时的默认选项
        this._callOptions = options ? Object.assign({}, this.options, options) : this.options;
        this.topLevelAwait = false;
        return this.visit(node);
    }

    /**
     * 判断 AST 子树中是否包含 等待（await）
     * stopAtFunctions 为 true 时，函数/类内部由它们各自决定是否 async，不向上传播
     */
    containsAwait(node, stopAtFunctions) {
        if (!node) return false;
        if (node.type === C.NodeType.AwaitExpression) return true;
        if (stopAtFunctions
            && (node.type === C.NodeType.FunctionDeclaration || node.type === C.NodeType.ClassDeclaration)) {
            return false;
        }
        for (const key of Object.keys(node)) {
            const val = node[key];
            if (Array.isArray(val)) {
                for (const item of val) {
                    if (this.containsAwait(item, stopAtFunctions)) return true;
                }
            } else if (val && typeof val === 'object' && val.type) {
                if (this.containsAwait(val, stopAtFunctions)) return true;
            }
        }
        return false;
    }

    /**
     * 生成类的对象字面量（{ 属性: 值, 方法: function…, 嵌套类: {...} }）
     */
    classObjectLiteral(node) {
        const body = node.body.body || node.body;
        const members = body.map(stmt => {
            if (stmt.type === C.NodeType.FunctionDeclaration) {
                const params = stmt.params.map(p => {
                    return p.default ? `${p.name} = ${this.visit(p.default)}` : p.name;
                }).join(', ');
                const isAsync = this.containsAwait(stmt.body, true);
                return `${isAsync ? 'async ' : ''}${stmt.name}: function(${params}) ${this.visit(stmt.body)}`;
            } else if (stmt.type === C.NodeType.ClassProperty) {
                return `${stmt.name}: ${this.visit(stmt.value)}`;
            } else if (stmt.type === C.NodeType.AssignmentExpression) {
                return `${this.visit(stmt.left)}: ${this.visit(stmt.right)}`;
            } else if (stmt.type === C.NodeType.ClassDeclaration) {
                return `${stmt.name}: ${this.classObjectLiteral(stmt)}`;
            }
            return null;
        }).filter(m => m !== null);
        return `{\n    ${members.join(',\n    ')}\n}`;
    }

    /**
     * 访问AST节点并返回生成的代码字符串
     */
    visit(node) {
        if (!node) return '';

        const handler = this.visitors[node.type];
        if (handler) {
            return handler.call(this, node);
        }

        throw new Error(`未知节点类型: ${node.type}`);
    }

    /**
     * 递归收集所有赋值左边的Identifier变量名（用于顶部统一var声明）
     * 只收集 AssignmentExpression 中 left.type === Identifier 的名字
     * 以及 VariableDeclaration（循环初始化）的名字
     * 以及 FunctionDeclaration 的参数名、函数名、类属性名
     */
    _collectVars(node, names) {
        if (!node) return;

        switch (node.type) {
            case C.NodeType.AssignmentExpression:
                if (node.left.type === C.NodeType.Identifier
                    && !SANDBOX_GLOBALS.has(node.left.name)) {
                    names.add(node.left.name);
                }
                this._collectVars(node.right, names);
                // 成员赋值的object部分可能嵌套标识符（不需要额外收集）
                if (node.left.type === C.NodeType.MemberExpression) {
                    this._collectVars(node.left, names);
                }
                break;
            case C.NodeType.VariableDeclaration:
                if (node.name && !SANDBOX_GLOBALS.has(node.name)) names.add(node.name);
                if (node.value) this._collectVars(node.value, names);
                break;
            case C.NodeType.FunctionDeclaration:
                if (node.name && !SANDBOX_GLOBALS.has(node.name)) names.add(node.name);
                for (const p of node.params || []) {
                    if (p.name && !SANDBOX_GLOBALS.has(p.name)) names.add(p.name);
                }
                this._collectVars(node.body, names);
                break;
            case C.NodeType.ClassDeclaration:
                if (node.name && !SANDBOX_GLOBALS.has(node.name)) names.add(node.name);
                this._collectVars(node.body, names);
                break;
            case C.NodeType.ClassProperty:
                if (node.name && !SANDBOX_GLOBALS.has(node.name)) names.add(node.name);
                if (node.value) this._collectVars(node.value, names);
                break;
            case C.NodeType.UpdateExpression:
                // i++ 中的i
                if (node.argument && node.argument.name
                    && !SANDBOX_GLOBALS.has(node.argument.name)) {
                    names.add(node.argument.name);
                }
                break;
            case C.NodeType.PipelineStatement:
                // 流水句的隐式变量"它"
                names.add('它');
                for (const step of node.steps || []) {
                    this._collectVars(step, names);
                }
                break;
            default:
                // 遍历所有对象属性
                for (const key of Object.keys(node)) {
                    const val = node[key];
                    if (Array.isArray(val)) {
                        for (const item of val) this._collectVars(item, names);
                    } else if (val && typeof val === 'object' && val.type) {
                        this._collectVars(val, names);
                    }
                }
        }
    }

    // ==================== 访问器注册表 ====================
    // 添加新节点类型的代码生成规则时，在此注册即可

    get visitors() {
        if (!this._visitors) {
            this._visitors = {
                // 程序根节点 — 默认(auto)注入输入输出模块和工具函数（兼容旧用法）；
                // runtime: 'none' 时不注入，由宿主环境提供内置（runtime/browser.js、runtime/node.js）
                // 同时在顶部预声明所有全局标识符赋值的变量，避免函数内部赋值产生var遮蔽导致NaN
                [C.NodeType.Program]: (node) => {
                    // 1. 收集所有赋值左侧的Identifier变量名（不重复，跳过成员赋值）
                    const varNames = new Set();
                    this._collectVars(node, varNames);

                    // 顶层包含 等待 时整个程序以 async IIFE 运行
                    const hasTopAwait = node.body.some(stmt => this.containsAwait(stmt, true));
                    this.topLevelAwait = hasTopAwait;

                    let code = hasTopAwait ? '(async function(console) {\n' : '(function(console) {\n';

                    // 2. 顶部统一预声明所有用户变量
                    if (varNames.size > 0) {
                        code += '    var ' + [...varNames].join(', ') + ';\n';
                    }

                    if (!this._callOptions || this._callOptions.runtime !== 'none') {
                        code += '    // ===== 输入输出模块 =====\n';
                        code += '    var 弹窗 = typeof alert !== "undefined" ? alert : function(msg) { console.log(msg); };\n';
                        code += '    var 询问 = typeof prompt !== "undefined" ? prompt : function(msg) { console.log("[输入]" + msg); return "1"; };\n';
                        code += '    var 确认 = typeof confirm !== "undefined" ? confirm : function(msg) { console.log("[确认]" + msg); return true; };\n';
                        code += '    var 写入 = typeof document !== "undefined" ? function(msg) { document.write(msg); } : function(msg) { console.log(msg); };\n';
                        code += '    // ===== 工具函数模块 =====\n';
                        code += '    var 随机数字 = Math.random;\n';
                        code += '    var 向下取整 = Math.floor;\n';
                        code += '    var 向上取整 = Math.ceil;\n';
                        code += '    var 绝对值 = Math.abs;\n';
                        code += '    var 转整数 = parseInt;\n';
                        code += '    var 转数字 = parseFloat;\n';
                    }
                    for (const stmt of node.body) {
                        code += '    ' + this.visit(stmt) + '\n';
                    }
                    code += '\n})(console);';
                    return code;
                },

                // 代码块
                [C.NodeType.BlockStatement]: (node) => {
                    let code = '{\n';
                    for (const stmt of node.body) {
                        code += '    ' + this.visit(stmt) + '\n';
                    }
                    code += '}';
                    return code;
                },

                // 条件语句
                [C.NodeType.IfStatement]: (node) => {
                    let code = `if (${this.visit(node.condition)}) ${this.visit(node.consequent)}`;
                    if (node.alternate) {
                        code += `\nelse ${this.visit(node.alternate)}`;
                    }
                    return code;
                },

                // for 循环（重复）— 变量已在Program顶部预声明，这里直接赋值
                [C.NodeType.ForStatement]: (node) => {
                    let init = '';
                    if (node.init) {
                        init = `${node.init.name} = ${this.visit(node.init.value)}`;
                    }
                    let cond = node.condition ? this.visit(node.condition) : '';
                    let update = '';
                    if (node.update) {
                        update = `${node.update.argument.name}${node.update.operator}`;
                    }
                    return `for (${init}; ${cond}; ${update}) ${this.visit(node.body)}`;
                },

                // 循环N次
                [C.NodeType.ForOfStatement]: (node) => {
                    const varName = node.left.name;
                    return `for (${varName} = 0; ${varName} < ${this.visit(node.right)}; ${varName}++) ${this.visit(node.body)}`;
                },

                // 遍历 名单 中 的 每个 元素
                [C.NodeType.ForEachStatement]: (node) => {
                    return `for (var ${node.name} of ${this.visit(node.collection)}) ${this.visit(node.body)}`;
                },

                // 当…时（while）
                [C.NodeType.WhileStatement]: (node) => {
                    return `while (${this.visit(node.condition)}) ${this.visit(node.body)}`;
                },

                // 重复 直到…为止（do-while：先执行一次，条件满足后停止）
                [C.NodeType.DoWhileStatement]: (node) => {
                    return `do ${this.visit(node.body)} while (!(${this.visit(node.condition)}));`;
                },

                // 先…再…然后…最后…：每一步结果存入"它"
                [C.NodeType.PipelineStatement]: (node) => {
                    return node.steps.map(step => `它 = ${this.visit(step)};`).join('\n');
                },

                // 返回语句
                [C.NodeType.ReturnStatement]: (node) => {
                    return `return ${this.visit(node.argument)};`;
                },

                // 输出语句
                [C.NodeType.PrintStatement]: (node) => {
                    return `console.log(${this.visit(node.argument)});`;
                },

                // break 语句
                [C.NodeType.BreakStatement]: () => 'break;',

                // 尝试…如果报错…（try/catch）
                [C.NodeType.TryStatement]: (node) => {
                    let code = `try ${this.visit(node.body)}`;
                    if (node.catchBody) {
                        const param = node.errorName || '__kugua_error__';
                        code += `\ncatch (${param}) ${this.visit(node.catchBody)}`;
                    }
                    return code;
                },

                // 引入：引入 “node:path” 作为 路径。
                [C.NodeType.ImportDeclaration]: (node) => {
                    const src = JSON.stringify(node.moduleName);
                    if (node.name) {
                        return `var ${node.name} = require(${src});`;
                    }
                    return `require(${src});`;
                },

                // 导出：导出 名字。／导出 名字 作为 别名。
                [C.NodeType.ExportDeclaration]: (node) => {
                    const key = JSON.stringify(node.alias || node.name);
                    return `if (typeof module !== "undefined") module.exports[${key}] = ${node.name};`;
                },

                // 函数声明
                [C.NodeType.FunctionDeclaration]: (node) => {
                    const params = node.params.map(p => {
                        return p.default ? `${p.name} = ${this.visit(p.default)}` : p.name;
                    }).join(', ');
                    const isAsync = this.containsAwait(node.body, true);
                    return `${isAsync ? 'async ' : ''}function ${node.name}(${params}) ${this.visit(node.body)}`;
                },

                // 类属性
                [C.NodeType.ClassProperty]: (node) => {
                    return `var ${node.name} = ${this.visit(node.value)};`;
                },

                // 类声明 — 名字已在Program顶部预声明，这里直接赋值
                [C.NodeType.ClassDeclaration]: (node) => {
                    return `${node.name} = ${this.classObjectLiteral(node)};`;
                },

                // 表达式语句
                [C.NodeType.ExpressionStatement]: (node) => {
                    return `${this.visit(node.expression)};`;
                },

                // 赋值表达式 — 统一使用 "左边 = 值" 形式（不再加var）
                // 所有用户变量名在Program顶部统一预声明（避免函数内赋值产生var遮蔽）
                [C.NodeType.AssignmentExpression]: (node) => {
                    return `${this.visit(node.left)} ${node.operator || '='} ${this.visit(node.right)}`;
                },

                // 逻辑表达式
                [C.NodeType.LogicalExpression]: (node) => {
                    return `(${this.visit(node.left)} ${node.operator} ${this.visit(node.right)})`;
                },

                // 二元表达式
                [C.NodeType.BinaryExpression]: (node) => {
                    // X 包含 Y → X.includes(Y)
                    if (node.operator === '包含') {
                        return `${this.visit(node.left)}.includes(${this.visit(node.right)})`;
                    }
                    return `(${this.visit(node.left)} ${node.operator} ${this.visit(node.right)})`;
                },

                // 一元表达式
                [C.NodeType.UnaryExpression]: (node) => {
                    return `${node.operator}${this.visit(node.argument)}`;
                },

                // 等待（await）
                [C.NodeType.AwaitExpression]: (node) => {
                    return `await ${this.visit(node.argument)}`;
                },

                // 函数调用 — 使用 generate 返回值的方式，不再 save/restore output
                [C.NodeType.CallExpression]: (node) => {
                    const args = node.arguments.map(arg => this.visit(arg));
                    return `${this.visit(node.callee)}(${args.join(', ')})`;
                },

                // 成员访问
                [C.NodeType.MemberExpression]: (node) => {
                    if (node.computed) {
                        // 第X项 索引访问为中文1基语义（第1项→索引0）
                        return `${this.visit(node.object)}[(${this.visit(node.property)} - 1)]`;
                    }
                    let prop = this.visit(node.property);
                    // 中文方法/属性别名 → JS 原生（如 蛇身之长度→.length、蛇身之追加→.push）
                    // 内置命名空间（路径/列表/文件 等）除外：它们的中文方法原样访问，避免
                    // 列表之长度 被误译成 列表.length
                    const isNamespace = node.object.type === C.NodeType.Identifier
                        && SANDBOX_GLOBALS.has(node.object.name);
                    if (!isNamespace && node.property.type === C.NodeType.Identifier
                        && MEMBER_ALIAS[node.property.name]) {
                        prop = MEMBER_ALIAS[node.property.name];
                    }
                    return `${this.visit(node.object)}.${prop}`;
                },

                // 数组字面量：【元素1、元素2、…】
                [C.NodeType.ArrayExpression]: (node) => {
                    const elems = node.elements.map(el => this.visit(el));
                    return `[${elems.join(', ')}]`;
                },

                // 标识符
                [C.NodeType.Identifier]: (node) => {
                    // 类内自身：此/本 → this
                    if (node.name === '此' || node.name === '本') return 'this';
                    return node.name;
                },

                // 字面量
                [C.NodeType.Literal]: (node) => {
                    if (typeof node.value === 'string') {
                        return '"' + node.value.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
                    }
                    if (node.value === null) return 'null';
                    if (typeof node.value === 'boolean') return node.value ? 'true' : 'false';
                    return String(node.value);
                },

                // 变量声明
                [C.NodeType.VariableDeclaration]: (node) => {
                    let code = `var ${node.name}`;
                    if (node.value) code += ` = ${this.visit(node.value)}`;
                    return code;
                },

                // 更新表达式
                [C.NodeType.UpdateExpression]: (node) => {
                    return `${this.visit(node.argument)}${node.operator}`;
                }
            };
        }
        return this._visitors;
    }
}

// ==================== 编译器主入口（来源：compiler.js） ====================


// 恢复被脚本覆盖的内置全局（同步/异步共用）
function restoreGlobals(names, snapshot) {
    for (let i = 0; i < names.length; i++) {
        const n = names[i];
        if (snapshot[n]) {
            try { Object.defineProperty(globalThis, n, snapshot[n]); }
            catch (e) { globalThis[n] = snapshot[n].value; }
        } else if (Object.prototype.hasOwnProperty.call(globalThis, n)) {
            try { delete globalThis[n]; } catch (e) { /* 不可删除时忽略 */ }
        }
    }
}

class Compiler {
    constructor(options) {
        this.options = options || {};
        this.lexer = null;
        this.parser = null;
        this.codeGenerator = new CodeGenerator(this.options);
    }

    compile(source, options) {
        this.lexer = new Lexer(source);
        const tokens = this.lexer.tokenize();

        this.parser = new Parser(tokens);
        const ast = this.parser.parse();

        const jsCode = this.codeGenerator.generate(ast, options);
        return jsCode;
    }

    run(source, outputCallback, options) {
        const opts = Object.assign({ runtime: 'none' }, options);
        const jsCode = this.compile(source, opts);
        // 顶层包含 等待 时，编译产物是 async IIFE，run 需要等待其完成
        const asyncMode = this.codeGenerator.topLevelAwait;

        const logs = [];
        const mockConsole = {
            log: function(...args) {
                const msg = args.join(' ');
                logs.push(msg);
                if (outputCallback) {
                    outputCallback(msg);
                }
            }
        };

        // 运行期间用户可能给内置名赋值，结束后恢复，避免污染同一页面中的后续运行
        const names = RUNTIME_REGISTRY.BUILTIN_NAMES;
        const snapshot = {};
        for (let i = 0; i < names.length; i++) {
            const n = names[i];
            const desc = Object.getOwnPropertyDescriptor(globalThis, n);
            if (desc) snapshot[n] = desc;
        }
        let returnedPromise = false;
        try {
            try {
                // 引入 语句需要 require；浏览器环境不支持模块加载，给出中文提示
                const fn = new Function('console', 'require', asyncMode ? 'return ' + jsCode : jsCode);
                const result = fn(mockConsole, function (id) {
                    throw new Error('浏览器运行时不支持 引入（' + id + '），请在 Node.js 或打包工具（Vite/esbuild）中使用');
                });
                if (result && typeof result.then === 'function') {
                    returnedPromise = true;
                    return result
                        .catch(function (e) { throw ErrorTranslator.wrapRuntimeError(e); })
                        .finally(function () { restoreGlobals(names, snapshot); })
                        .then(function () { return logs.join('\n'); });
                }
            } catch (e) {
                // 执行期错误翻译成中文（保留原始堆栈）
                throw ErrorTranslator.wrapRuntimeError(e);
            }
        } finally {
            if (!returnedPromise) {
                for (let i = 0; i < names.length; i++) {
                    const n = names[i];
                    if (snapshot[n]) {
                        try { Object.defineProperty(globalThis, n, snapshot[n]); }
                        catch (e) { globalThis[n] = snapshot[n].value; }
                    } else if (Object.prototype.hasOwnProperty.call(globalThis, n)) {
                        try { delete globalThis[n]; } catch (e) { /* 不可删除时忽略 */ }
                    }
                }
            }
        }
        return logs.join('\n');
    }
}

// ==================== 全局导出 ====================
global.KuguaCompiler = Compiler;
global.KuguaLexer = Lexer;
global.KuguaParser = Parser;
global.KuguaCodeGenerator = CodeGenerator;
global.KuguaErrors = ErrorTranslator;
})(typeof window !== "undefined" ? window : globalThis);

    // ===== 网页加载器（来源：editor/kugua-loader.js）=====
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
})(typeof window !== "undefined" ? window : globalThis);
