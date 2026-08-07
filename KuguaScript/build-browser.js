// 浏览器版编译器构建脚本
const fs = require('fs');

const files = ['errors.js', 'constants.js', 'ast.js', 'lexer.js', 'parser.js', 'runtime/registry.js', 'codeGenerator.js', 'compiler.js'];
const labels = {
    'errors.js': '错误信息翻译器',
    'constants.js': '常量定义',
    'ast.js': 'AST 节点工厂函数',
    'lexer.js': '词法分析器',
    'parser.js': '语法分析器',
    'runtime/registry.js': '运行时注册表',
    'codeGenerator.js': '代码生成器',
    'compiler.js': '编译器主入口'
};

// 浏览器版 Compiler（移除 fs 依赖的方法）
const browserCompiler = `
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
                        .then(function () { return logs.join('\\n'); });
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
        return logs.join('\\n');
    }
}`;

// C 和 AST 聚合对象（替代 require 的作用）
const cAggregator = `const C = {
    TokenType, NodeType, ControlKeywords, LoopKeywords, FunctionKeywords,
    ObjectKeywords, ModuleKeywords, SentenceKeywords, AccessKeywords, ComparisonOperators, EqualityOperators,
    LogicalAndKeywords, LogicalOrKeywords, LogicalNotKeywords, OperatorKeywords,
    ContainsOperators, BooleanKeywords,
    NullKeywords, ChineseNumeralChars, IfAliases, ReturnAliases, AllKeywords, ReservedKeywords,
    Operators, Punctuations, LeftParen, RightParen, isWhitespace, isDigit,
    isIdentifierStart, isIdentifierPart, isChineseNumeralChar, chineseToNumber,
    LeftArrayBracket, RightArrayBracket
};`;

const astAggregator = `const AST = {
    createNode, createToken, createProgram, createBlockStatement, createIfStatement,
    createForStatement, createForOfStatement, createForEachStatement, createWhileStatement, createDoWhileStatement,
    createPipelineStatement, createReturnStatement, createPrintStatement,
    createBreakStatement, createTryStatement, createImportDeclaration, createExportDeclaration,
    createFunctionDeclaration, createClassDeclaration, createClassProperty,
    createExpressionStatement, createAssignmentExpression, createLogicalExpression,
    createBinaryExpression, createUnaryExpression, createAwaitExpression, createCallExpression, createMemberExpression,
    createIdentifier, createLiteral, createVariableDeclaration, createUpdateExpression,
    createArrayExpression
};`;

let output = '// 苦瓜脚本语言编译器 - 浏览器版本（自动生成，请勿手动编辑）\n';
output += '// 使用 IIFE 包裹，通过 window 或 globalThis 导出\n';
output += '(function(global) {\n\n';

for (const f of files) {
    let content = fs.readFileSync('src/' + f, 'utf-8');
    output += '// ==================== ' + labels[f] + '（来源：' + f + '） ====================\n\n';

    if (f === 'compiler.js') {
        output += browserCompiler + '\n\n';
        continue;
    }

    // 移除 require 行（普通形式和解构形式），兼容 LF/CRLF 行尾
    content = content.replace(/const\s+\w+\s*=\s*require\([^)]+\);\r?\n/g, '');
    content = content.replace(/const\s+\{[^}]+\}\s*=\s*require\([^)]+\);\r?\n/g, '');
    // 移除 module.exports（对象形式和直接形式）
    content = content.replace(/module\.exports\s*=\s*[^;]+;/g, '');

    output += content.trim() + '\n\n';

    // 在 constants.js 之后添加 C 聚合对象
    if (f === 'constants.js') {
        output += cAggregator + '\n\n';
    }
    // 在 ast.js 之后添加 AST 聚合对象
    if (f === 'ast.js') {
        output += astAggregator + '\n\n';
    }
}

// 添加导出
output += '// ==================== 全局导出 ====================\n';
output += 'global.KuguaCompiler = Compiler;\n';
output += 'global.KuguaLexer = Lexer;\n';
output += 'global.KuguaParser = Parser;\n';
output += 'global.KuguaCodeGenerator = CodeGenerator;\n';
output += 'global.KuguaErrors = ErrorTranslator;\n';
output += '})(typeof window !== "undefined" ? window : globalThis);\n';

fs.writeFileSync('editor/kugua-compiler.js', output);
console.log('生成完成，行数:', output.split('\n').length);
console.log('包含IO模块:', output.includes('弹窗'));
console.log('包含工具函数:', output.includes('随机数字'));
console.log('包含成员赋值:', output.includes('MemberExpression'));
console.log('包含require:', output.includes('require('));
console.log('包含compileFile:', output.includes('compileFile'));
