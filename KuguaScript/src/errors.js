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

module.exports = ErrorTranslator;
