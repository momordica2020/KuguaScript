// 苦瓜脚本语言编译器 - 浏览器版本（自动生成，请勿手动编辑）
// 使用 IIFE 包裹，通过 window 或 globalThis 导出
(function(global) {

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
    '如果', '否则', '重复', '循环', '结束', '次', '以上', '选择', '情况'
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
    '不是': '!=='
};

// 逻辑运算关键字
const LogicalAndKeywords = ['并且'];      // &&
const LogicalOrKeywords = ['或者'];        // ||
const LogicalNotKeywords = ['非'];         // !

// 运算符类关键字（比较、相等、逻辑）— 始终完整识别为关键字，不作为标识符的一部分
// 这样 "i小于3" 会正确拆分为 "i" + "小于" + "3"，"a是b" 会拆分为 "a" + "是" + "b"
const OperatorKeywords = [
    ...Object.keys(ComparisonOperators),
    ...Object.keys(EqualityOperators),
    ...LogicalAndKeywords,
    ...LogicalOrKeywords,
    ...LogicalNotKeywords
];

// 布尔值关键字 → JS布尔值
const BooleanKeywords = {
    '正确': true, '正确的': true, '真': true, '真的': true, '对': true, '对的': true,
    '错误': false, '错误的': false, '错': false, '错的': false, '不对': false, '不对的': false
};

// 空值关键字
const NullKeywords = ['空', '空的', '没了'];

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
    ...AccessKeywords,
    ...Object.keys(ComparisonOperators),
    ...Object.keys(EqualityOperators),
    ...LogicalAndKeywords,
    ...LogicalOrKeywords,
    ...LogicalNotKeywords,
    // 保留关键字（尚未实现但已预留）
    '定义', '个', '长度', '功能', '方法', '全新', '就', '一直', '执行',
    '增加', '追加', '去除', '包含', '为', '则', '和', '与', '或', '用', '以',
    '可', '使', '让', '被', '把', '将', '给', '向', '从', '在', '上', '下',
    '左', '右', '前', '后', '中', '内', '外', '间', '时', '的话', '而已',
    '而已矣', '罢了', '罢了罢了'
];

// 保留关键字（未实际在语法中使用，仅预留）
// 词法分析器在识别这些关键字时会检查后继字符，
// 若后跟标识符字符则不识别为关键字，避免阻断标识符识别
const ReservedKeywords = [
    '类', '项', '定义', '个', '长度', '功能', '方法', '全新', '就', '一直', '执行',
    '增加', '追加', '去除', '包含', '为', '则', '和', '与', '或', '用', '以',
    '可', '使', '让', '被', '把', '将', '给', '向', '从', '在', '上', '下',
    '左', '右', '前', '后', '中', '内', '外', '间', '时', '的话', '而已',
    '而已矣', '罢了', '罢了罢了'
];

// ==================== 运算符 ====================
const Operators = ['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~'];

// ==================== 标点符号 ====================
const Punctuations = ['。', '，', '、', '：', '；', '？', '—', '！'];
const LeftParen = '（';
const RightParen = '）';
// 数组字面量方括号（《》），与字符串分隔符【】区分
const LeftArrayBracket = '《';
const RightArrayBracket = '》';

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

// ==================== 导出 ====================

const C = {
    TokenType, NodeType, ControlKeywords, LoopKeywords, FunctionKeywords,
    ObjectKeywords, AccessKeywords, ComparisonOperators, EqualityOperators,
    LogicalAndKeywords, LogicalOrKeywords, LogicalNotKeywords, OperatorKeywords,
    BooleanKeywords,
    NullKeywords, IfAliases, ReturnAliases, AllKeywords, ReservedKeywords,
    Operators, Punctuations, LeftParen, RightParen, isWhitespace, isDigit,
    isIdentifierStart, isIdentifierPart, LeftArrayBracket, RightArrayBracket
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

function createReturnStatement(argument) {
    return createNode(NodeType.ReturnStatement, { argument });
}

function createPrintStatement(argument) {
    return createNode(NodeType.PrintStatement, { argument });
}

function createBreakStatement() {
    return createNode(NodeType.BreakStatement);
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

function createAssignmentExpression(left, right) {
    return createNode(NodeType.AssignmentExpression, { left, right });
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
    createForStatement, createForOfStatement, createReturnStatement, createPrintStatement,
    createBreakStatement, createFunctionDeclaration, createClassDeclaration, createClassProperty,
    createExpressionStatement, createAssignmentExpression, createLogicalExpression,
    createBinaryExpression, createUnaryExpression, createCallExpression, createMemberExpression,
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
            if (current === '\u3010') {
                this.tokens.push(this.readBracketString());
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

            throw new Error(`未知字符: ${current} 在第 ${this.line} 行，第 ${this.column} 列`);
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

    readBracketString() {
        let value = '';
        const startLine = this.line;
        const startColumn = this.column;
        this.advance(); // 跳过【

        while (this.position < this.source.length) {
            if (this.peek() === '\u3011') {
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
                // 检查关键字后面不是标识符字符（防止部分匹配）
                const nextChar = this.source[this.position + key.length];
                if (nextChar && C.isIdentifierPart(nextChar)) continue;
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
            // '第' 后跟数字或左括号才是数组索引关键字（第2项、第（i+1）项）；后跟汉字则并入标识符（第一个子节点）
            if (keyword === '第') {
                const nxt = this.source[this.position + keyword.length];
                if (!(nxt && (C.isDigit(nxt) || nxt === C.LeftParen))) continue;
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
                        // '第' 后跟数字或左括号 → 数组索引关键字（第2项、第（i+1）项）
                        // 后跟其它字符 → 并入标识符（第一个子节点、第三次）
                        const nxt = this.source[this.position + keyword.length];
                        if (nxt && (C.isDigit(nxt) || nxt === C.LeftParen)) {
                            isComplete = true;
                        } else {
                            isComplete = false;
                        }
                    } else if (C.ReservedKeywords.includes(keyword)) {
                        const nextChar = this.source[this.position + keyword.length];
                        // 已读取标识符字符时，保留关键字并入标识符（如 血条外、日志外框）
                        // 未读取字符时，仅当后跟标识符字符才并入（如 类名），否则作为独立关键字（如 类：…）
                        // 成员访问符"之""的"除外（如 第2项之，项 应作为独立关键字）
                        if (value.length > 0) {
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

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
        // 数组字面量嵌套深度，用于区分《》内分隔符"、"与逻辑与运算符
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
            '类': 'parseClassStatement'
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

        // 变量/成员赋值定义：标识符（之属性）后跟冒号
        if (token.type === C.TokenType.IDENTIFIER && this.isDefinitionStart()) {
            return this.parseDefinition();
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
        let pos = this.position;
        if (this.tokens[pos].type !== C.TokenType.IDENTIFIER) return false;
        pos++;
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
                    return false;
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
                    return false;
                }
            } else if (t.type === C.TokenType.PUNCTUATION && t.value === '：') {
                return true;
            } else {
                return false;
            }
        }
        return false;
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
        throw new Error(`期望冒号或逗号 在第 ${t.line} 行，第 ${t.column} 列`);
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
                throw new Error(`期望冒号或逗号 在第 ${t.line} 行，第 ${t.column} 列`);
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
        const value = this.parseExpression();
        this.consumeOptionalPeriodOrComma();
        return AST.createExpressionStatement(AST.createAssignmentExpression(target, value));
    }

    /**
     * 解析函数参数列表（共享逻辑）
     * 支持带括号和不带括号两种写法
     */
    parseFunctionParams() {
        const params = [];
        const hasParen = this.match(C.TokenType.PAREN, C.LeftParen);

        while (true) {
            const param = this.expect(C.TokenType.STRING, null, '期望参数名');
            params.push(AST.createIdentifier(param.value));
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
                    // 属性定义
                    const value = this.parseExpression();
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
        while (true) {
            if (this.match(C.TokenType.KEYWORD, '或者')) {
                const right = this.parseLogicalAnd();
                left = AST.createLogicalExpression('||', left, right);
                continue;
            }
            // 逗号（，）默认作为逻辑或；但行末逗号（其后紧跟换行）视为语句/分支分隔符
            // 例如：如果 数 小于 5，<换行>说（…）。—— 逗号结束条件并进入分支
            const comma = this.peek();
            if (comma.type === C.TokenType.PUNCTUATION && comma.value === '，'
                && this.peekNext().line === comma.line) {
                this.advance();
                const right = this.parseLogicalAnd();
                left = AST.createLogicalExpression('||', left, right);
                continue;
            }
            break;
        }
        return left;
    }

    parseLogicalAnd() {
        let left = this.parseEquality();
        // 数组字面量《》内的"、"是元素分隔符，不作为逻辑与运算符
        while (!this.arrayDepth && (this.match(C.TokenType.KEYWORD, '并且') || this.match(C.TokenType.PUNCTUATION, '、'))) {
            const right = this.parseEquality();
            left = AST.createLogicalExpression('&&', left, right);
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
        // 复用 ComparisonOperators 映射，消除重复 switch
        while (true) {
            let matched = false;
            for (const [keyword, op] of Object.entries(C.ComparisonOperators)) {
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
        if (this.match(C.TokenType.OPERATOR, '!') || this.match(C.TokenType.KEYWORD, '非')) {
            return AST.createUnaryExpression('!', this.parseUnary());
        }
        if (this.match(C.TokenType.OPERATOR, '-')) {
            return AST.createUnaryExpression('-', this.parseUnary());
        }
        return this.parseCall();
    }

    parseCall() {
        let expression = this.parseMember();
        while (this.match(C.TokenType.PAREN, C.LeftParen)) {
            const args = [];
            if (!this.match(C.TokenType.PAREN, C.RightParen)) {
                args.push(this.parseArgumentExpression());
                while (this.match(C.TokenType.PUNCTUATION, '，')) {
                    args.push(this.parseArgumentExpression());
                }
                this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
            }
            expression = AST.createCallExpression(expression, args);
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
        if (this.match(C.TokenType.PAREN, C.LeftParen)) {
            const expression = this.parseExpression();
            this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
            return expression;
        }
        // 数组字面量：《元素1、元素2、…》
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
        throw new Error(`Unexpected token: ${token.value} 在第 ${token.line} 行，第 ${token.column} 列`);
    }
}

// ==================== 代码生成器（来源：codeGenerator.js） ====================

/**
 * 苦瓜脚本语言 — 代码生成器
 * 将AST转换为JavaScript代码
 * 使用 generate(node) 返回字符串的方式替代全局 output 拼接
 */

// 沙箱内置全局标识符（KS代码运行时由运行环境提供，代码生成器禁止在顶部var声明，
// 否则会因var变量提升把它们赋值为undefined，导致读取到undefined后报错）
const SANDBOX_GLOBALS = new Set([
    // 输入输出
    '弹窗', '询问', '确认', '写入',
    // 数学工具
    '随机数字', '向下取整', '向上取整', '绝对值', '转整数', '转数字',
    // 定时器
    '设置定时器', '清除定时器', '设置循环', '清除循环',
    'startLoop', 'stopLoop', 'setT', 'clearT',
    '请求动画帧', '取消动画帧',
    // 对象
    '对象', '创建对象',
    // 运行时环境
    '文档', '窗口', '本地存储', '会话存储',
    '数学', '日期', '历史', '控制台', '屏幕', '定位',
    // 常用辅助
    '说', '追加', '移除',
    // 布尔/空值（由编译器识别为字面量，此处防御性列出）
    '空', '正确', '错误'
]);

// 数组/对象成员别名 → JS 属性/方法
const MEMBER_ALIAS = {
    '长度': 'length',
    '追加': 'push',
    '移除尾部': 'pop',
    '移除头部': 'shift',
    '插入头部': 'unshift'
};

class CodeGenerator {
    generate(node) {
        return this.visit(node);
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
                // 程序根节点 — 注入输入输出模块和工具函数（浏览器与Node兼容）
                // 同时在顶部预声明所有全局标识符赋值的变量，避免函数内部赋值产生var遮蔽导致NaN
                [C.NodeType.Program]: (node) => {
                    // 1. 收集所有赋值左侧的Identifier变量名（不重复，跳过成员赋值）
                    const varNames = new Set();
                    this._collectVars(node, varNames);

                    let code = '(function(console) {\n';

                    // 2. 顶部统一预声明所有用户变量
                    if (varNames.size > 0) {
                        code += '    var ' + [...varNames].join(', ') + ';\n';
                    }

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
                    for (const stmt of node.body) {
                        code += '    ' + this.visit(stmt) + '\n';
                    }
                    code += '})(console);';
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

                // 函数声明
                [C.NodeType.FunctionDeclaration]: (node) => {
                    const params = node.params.map(p => p.name).join(', ');
                    return `function ${node.name}(${params}) ${this.visit(node.body)}`;
                },

                // 类属性
                [C.NodeType.ClassProperty]: (node) => {
                    return `var ${node.name} = ${this.visit(node.value)};`;
                },

                // 类声明 — 名字已在Program顶部预声明，这里直接赋值
                [C.NodeType.ClassDeclaration]: (node) => {
                    const body = node.body.body || node.body;
                    const members = body.map(stmt => {
                        if (stmt.type === C.NodeType.FunctionDeclaration) {
                            const params = stmt.params.map(p => p.name).join(', ');
                            return `${stmt.name}: function(${params}) ${this.visit(stmt.body)}`;
                        } else if (stmt.type === C.NodeType.ClassProperty) {
                            return `${stmt.name}: ${this.visit(stmt.value)}`;
                        } else if (stmt.type === C.NodeType.AssignmentExpression) {
                            return `${this.visit(stmt.left)}: ${this.visit(stmt.right)}`;
                        }
                        return null;
                    }).filter(m => m !== null);

                    return `${node.name} = {\n    ${members.join(',\n    ')}\n};`;
                },

                // 表达式语句
                [C.NodeType.ExpressionStatement]: (node) => {
                    return `${this.visit(node.expression)};`;
                },

                // 赋值表达式 — 统一使用 "左边 = 值" 形式（不再加var）
                // 所有用户变量名在Program顶部统一预声明（避免函数内赋值产生var遮蔽）
                [C.NodeType.AssignmentExpression]: (node) => {
                    return `${this.visit(node.left)} = ${this.visit(node.right)}`;
                },

                // 逻辑表达式
                [C.NodeType.LogicalExpression]: (node) => {
                    return `(${this.visit(node.left)} ${node.operator} ${this.visit(node.right)})`;
                },

                // 二元表达式
                [C.NodeType.BinaryExpression]: (node) => {
                    return `(${this.visit(node.left)} ${node.operator} ${this.visit(node.right)})`;
                },

                // 一元表达式
                [C.NodeType.UnaryExpression]: (node) => {
                    return `${node.operator}${this.visit(node.argument)}`;
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
                    // 中文方法/属性别名 → JS 原生（如 之长度→.length、之追加→.push）
                    if (node.property.type === C.NodeType.Identifier && MEMBER_ALIAS[node.property.name]) {
                        prop = MEMBER_ALIAS[node.property.name];
                    }
                    return `${this.visit(node.object)}.${prop}`;
                },

                // 数组字面量：《元素1、元素2、…》
                [C.NodeType.ArrayExpression]: (node) => {
                    const elems = node.elements.map(el => this.visit(el));
                    return `[${elems.join(', ')}]`;
                },

                // 标识符
                [C.NodeType.Identifier]: (node) => node.name,

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

class Compiler {
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
        return logs.join('\n');
    }
}

// ==================== 全局导出 ====================
global.KuguaCompiler = Compiler;
global.KuguaLexer = Lexer;
global.KuguaParser = Parser;
global.KuguaCodeGenerator = CodeGenerator;
})(typeof window !== "undefined" ? window : globalThis);
