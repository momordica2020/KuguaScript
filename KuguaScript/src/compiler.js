/**
 * 苦瓜脚本语言 — 编译器主入口
 * 整合词法分析、语法分析和代码生成
 */
const Lexer = require('./lexer');
const Parser = require('./parser');
const CodeGenerator = require('./codeGenerator');
const RUNTIME_REGISTRY = require('./runtime/registry');
const ErrorTranslator = require('./errors');

class Compiler {
    constructor(options) {
        this.options = options || {};
        this.lexer = null;
        this.parser = null;
        this.codeGenerator = new CodeGenerator(this.options);
    }

    /**
     * 编译源代码为JavaScript代码
     * options.runtime: 'auto'（默认，代码生成器注入内置函数兜底）| 'none'（不注入，由宿主运行时提供）
     */
    compile(source, options) {
        this.lexer = new Lexer(source);
        const tokens = this.lexer.tokenize();

        this.parser = new Parser(tokens);
        const ast = this.parser.parse();

        const jsCode = this.codeGenerator.generate(ast, options);
        return jsCode;
    }

    /**
     * 编译文件
     */
    compileFile(filePath) {
        const fs = require('fs');
        const source = fs.readFileSync(filePath, 'utf-8');
        return this.compile(source);
    }

    /**
     * 运行源代码，返回输出
     * 可选 outputCallback 用于流式接收每条日志（浏览器编辑器场景）
     */
    run(source, outputCallback, options) {
        const opts = Object.assign({ runtime: 'none' }, options);
        const jsCode = this.compile(source, opts);
        // 顶层包含 等待 时，编译产物是 async IIFE，run 需要等待其完成
        const asyncMode = this.codeGenerator.topLevelAwait;

        // none 模式依赖宿主运行时提供的中文内置：Node 环境先安装（幂等）
        if (opts.runtime === 'none') {
            try {
                require('./runtime/node');
            } catch (e) {
                // 运行时加载失败不阻断纯 console 程序（如依赖未安装时）
            }
        }

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

        // 运行期间用户可能给内置名赋值（如 随机数字：输入；），
        // 运行结束后恢复，避免污染同一进程中的后续脚本/请求
        const snapshot = snapshotBuiltins();
        let returnedPromise = false;
        try {
            try {
                // 传入 require 以支持 引入 语句（如 引入 “node:path” 作为 路径）
                // 异步模式用 return 取出 async IIFE 的 Promise，便于等待与错误翻译
                const fn = new Function('console', 'require', asyncMode ? 'return ' + jsCode : jsCode);
                const result = fn(mockConsole, require);
                if (result && typeof result.then === 'function') {
                    returnedPromise = true;
                    return result
                        .catch(e => { throw ErrorTranslator.wrapRuntimeError(e); })
                        .finally(() => restoreBuiltins(snapshot))
                        .then(() => logs.join('\n'));
                }
            } catch (e) {
                // 执行期错误翻译成中文（保留原始堆栈）
                throw ErrorTranslator.wrapRuntimeError(e);
            }
        } finally {
            if (!returnedPromise) restoreBuiltins(snapshot);
        }
        return logs.join('\n');
    }

    /**
     * 运行文件
     */
    runFile(filePath) {
        const fs = require('fs');
        const source = fs.readFileSync(filePath, 'utf-8');
        return this.run(source);
    }
}

/**
 * 快照当前进程中的内置全局属性描述符，用于运行后恢复
 */
function snapshotBuiltins() {
    const snap = {};
    for (const name of RUNTIME_REGISTRY.BUILTIN_NAMES) {
        const desc = Object.getOwnPropertyDescriptor(globalThis, name);
        if (desc) snap[name] = desc;
    }
    return snap;
}

/**
 * 恢复内置全局属性；快照中不存在的则删除
 */
function restoreBuiltins(snap) {
    for (const name of RUNTIME_REGISTRY.BUILTIN_NAMES) {
        if (snap[name]) {
            try {
                Object.defineProperty(globalThis, name, snap[name]);
            } catch (e) {
                globalThis[name] = snap[name].value;
            }
        } else if (Object.prototype.hasOwnProperty.call(globalThis, name)) {
            try {
                delete globalThis[name];
            } catch (e) {
                /* 不可删除时忽略 */
            }
        }
    }
}

module.exports = Compiler;
