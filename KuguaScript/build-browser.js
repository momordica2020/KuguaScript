// 浏览器版编译器构建脚本
const fs = require('fs');

const files = ['constants.js', 'ast.js', 'lexer.js', 'parser.js', 'codeGenerator.js', 'compiler.js'];
const labels = {
    'constants.js': '常量定义',
    'ast.js': 'AST 节点工厂函数',
    'lexer.js': '词法分析器',
    'parser.js': '语法分析器',
    'codeGenerator.js': '代码生成器',
    'compiler.js': '编译器主入口'
};

// 浏览器版 Compiler（移除 fs 依赖的方法）
const browserCompiler = `class Compiler {
    constructor() {
        this.lexer = null;
        this.parser = null;
        this.codeGenerator = new CodeGenerator();
    }

    compile(source) {
        this.lexer = new Lexer(source);
        const tokens = this.lexer.tokenize();

        this.parser = new Parser(tokens);
        const ast = this.parser.parse();

        const jsCode = this.codeGenerator.generate(ast);
        return jsCode;
    }

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
        return logs.join('\\n');
    }
}`;

// C 和 AST 聚合对象（替代 require 的作用）
const cAggregator = `const C = {
    TokenType, NodeType, ControlKeywords, LoopKeywords, FunctionKeywords,
    ObjectKeywords, AccessKeywords, ComparisonOperators, EqualityOperators,
    LogicalAndKeywords, LogicalOrKeywords, LogicalNotKeywords, OperatorKeywords,
    BooleanKeywords,
    NullKeywords, IfAliases, ReturnAliases, AllKeywords, ReservedKeywords,
    Operators, Punctuations, LeftParen, RightParen, isWhitespace, isDigit,
    isIdentifierStart, isIdentifierPart
};`;

const astAggregator = `const AST = {
    createNode, createToken, createProgram, createBlockStatement, createIfStatement,
    createForStatement, createForOfStatement, createReturnStatement, createPrintStatement,
    createBreakStatement, createFunctionDeclaration, createClassDeclaration, createClassProperty,
    createExpressionStatement, createAssignmentExpression, createLogicalExpression,
    createBinaryExpression, createUnaryExpression, createCallExpression, createMemberExpression,
    createIdentifier, createLiteral, createVariableDeclaration, createUpdateExpression
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

    // 移除 require 行（普通形式和解构形式）
    content = content.replace(/const\s+\w+\s*=\s*require\([^)]+\);\n/g, '');
    content = content.replace(/const\s+\{[^}]+\}\s*=\s*require\([^)]+\);\n/g, '');
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
output += '})(typeof window !== "undefined" ? window : globalThis);\n';

fs.writeFileSync('editor/kugua-compiler.js', output);
console.log('生成完成，行数:', output.split('\n').length);
console.log('包含IO模块:', output.includes('弹窗'));
console.log('包含工具函数:', output.includes('随机数字'));
console.log('包含成员赋值:', output.includes('MemberExpression'));
console.log('包含require:', output.includes('require('));
console.log('包含compileFile:', output.includes('compileFile'));
