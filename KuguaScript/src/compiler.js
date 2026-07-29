/**
 * 苦瓜脚本语言 — 编译器主入口
 * 整合词法分析、语法分析和代码生成
 */
const Lexer = require('./lexer');
const Parser = require('./parser');
const CodeGenerator = require('./codeGenerator');

class Compiler {
    constructor() {
        this.lexer = null;
        this.parser = null;
        this.codeGenerator = new CodeGenerator();
    }

    /**
     * 编译源代码为JavaScript代码
     */
    compile(source) {
        this.lexer = new Lexer(source);
        const tokens = this.lexer.tokenize();

        this.parser = new Parser(tokens);
        const ast = this.parser.parse();

        const jsCode = this.codeGenerator.generate(ast);
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
    run(source, outputCallback) {
        const jsCode = this.compile(source);

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

        new Function('console', jsCode)(mockConsole);
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

module.exports = Compiler;
