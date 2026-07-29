// 苦瓜脚本语言编译器 - 浏览器版本（自动生成，请勿手动编辑）

// ==================== 常量定义（来源：constants.js） ====================

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
    '如果', '否则', '重复', '循环', '结束', '次', '以上'
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

// ==================== 运算符 ====================
const Operators = ['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~'];

// ==================== 标点符号 ====================
const Punctuations = ['。', '，', '、', '：', '；', '？', '《', '》', '—', '！'];
const LeftParen = '（';
const RightParen = '）';

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

// ==================== 常量全局导出 ====================
const C = {
    TokenType,
    NodeType,
    ControlKeywords,
    LoopKeywords,
    FunctionKeywords,
    ObjectKeywords,
    AccessKeywords,
    ComparisonOperators,
    EqualityOperators,
    LogicalAndKeywords,
    LogicalOrKeywords,
    LogicalNotKeywords,
    BooleanKeywords,
    NullKeywords,
    IfAliases,
    ReturnAliases,
    AllKeywords,
    Operators,
    Punctuations,
    LeftParen,
    RightParen,
    isWhitespace,
    isDigit,
    isIdentifierStart,
    isIdentifierPart
};

// ==================== AST 节点工厂函数（来源：ast.js） ====================

function createNode(type, props = {}) {
    return { type, ...props };
}

function createToken(type, value, line, column) {
    return { type, value, line, column };
}

function createProgram(body) {
    return createNode(C.NodeType.Program, { body });
}

function createBlockStatement(body) {
    return createNode(C.NodeType.BlockStatement, { body });
}

function createIfStatement(condition, consequent, alternate) {
    return createNode(C.NodeType.IfStatement, { condition, consequent, alternate });
}

function createForStatement(init, condition, update, body) {
    return createNode(C.NodeType.ForStatement, { init, condition, update, body });
}

function createForOfStatement(left, right, body) {
    return createNode(C.NodeType.ForOfStatement, { left, right, body });
}

function createReturnStatement(argument) {
    return createNode(C.NodeType.ReturnStatement, { argument });
}

function createPrintStatement(argument) {
    return createNode(C.NodeType.PrintStatement, { argument });
}

function createBreakStatement() {
    return createNode(C.NodeType.BreakStatement);
}

function createFunctionDeclaration(name, params, body) {
    return createNode(C.NodeType.FunctionDeclaration, { name, params, body });
}

function createClassDeclaration(name, body) {
    return createNode(C.NodeType.ClassDeclaration, { name, body });
}

function createClassProperty(name, value) {
    return createNode(C.NodeType.ClassProperty, { name, value });
}

function createExpressionStatement(expression) {
    return createNode(C.NodeType.ExpressionStatement, { expression });
}

function createAssignmentExpression(left, right) {
    return createNode(C.NodeType.AssignmentExpression, { left, right });
}

function createLogicalExpression(operator, left, right) {
    return createNode(C.NodeType.LogicalExpression, { operator, left, right });
}

function createBinaryExpression(operator, left, right) {
    return createNode(C.NodeType.BinaryExpression, { operator, left, right });
}

function createUnaryExpression(operator, argument) {
    return createNode(C.NodeType.UnaryExpression, { operator, argument });
}

function createCallExpression(callee, args) {
    return createNode(C.NodeType.CallExpression, { callee, arguments: args });
}

function createMemberExpression(object, property, computed) {
    return createNode(C.NodeType.MemberExpression, { object, property, computed });
}

function createIdentifier(name) {
    return createNode(C.NodeType.Identifier, { name });
}

function createLiteral(value, raw) {
    return createNode(C.NodeType.Literal, { value, raw });
}

function createVariableDeclaration(name, value) {
    return createNode(C.NodeType.VariableDeclaration, { name, value });
}

function createUpdateExpression(operator, argument) {
    return createNode(C.NodeType.UpdateExpression, { operator, argument });
}

// ==================== AST 全局导出 ====================
const AST = {
    createNode,
    createToken,
    createProgram,
    createBlockStatement,
    createIfStatement,
    createForStatement,
    createForOfStatement,
    createReturnStatement,
    createPrintStatement,
    createBreakStatement,
    createFunctionDeclaration,
    createClassDeclaration,
    createClassProperty,
    createExpressionStatement,
    createAssignmentExpression,
    createLogicalExpression,
    createBinaryExpression,
    createUnaryExpression,
    createCallExpression,
    createMemberExpression,
    createIdentifier,
    createLiteral,
    createVariableDeclaration,
    createUpdateExpression
};

// ==================== 词法分析器（来源：lexer.js） ====================

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
                this.tokens.push(AST.createToken(C.TokenType.OPERATOR, current, this.line, this.column));
                this.advance();
                continue;
            }

            // 标点符号
            if (C.Punctuations.includes(current)) {
                this.tokens.push(AST.createToken(C.TokenType.PUNCTUATION, current, this.line, this.column));
                this.advance();
                continue;
            }

            // 括号
            if (current === C.LeftParen || current === C.RightParen) {
                this.tokens.push(AST.createToken(C.TokenType.PAREN, current, this.line, this.column));
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

        this.tokens.push(AST.createToken(C.TokenType.EOF, '', this.line, this.column));
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

        return AST.createToken(C.TokenType.NUMBER, hasDecimal ? parseFloat(value) : parseInt(value), startLine, startColumn);
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

        return AST.createToken(C.TokenType.STRING, value, startLine, startColumn);
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

        return AST.createToken(C.TokenType.STRING, value, startLine, startColumn);
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
        return AST.createToken(tokenType, value, startLine, startColumn);
    }

    matchLongestKeyword() {
        const startLine = this.line;
        const startColumn = this.column;
        let matchedKeyword = null;
        let matchedLength = 0;

        for (const keyword of C.AllKeywords) {
            if (this.source.startsWith(keyword, this.position)) {
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
        return AST.createToken(C.TokenType.KEYWORD, matchedKeyword, startLine, startColumn);
    }

    readIdentifier() {
        let value = '';
        const startLine = this.line;
        const startColumn = this.column;

        while (this.position < this.source.length && C.isIdentifierPart(this.peek())) {
            // 遇到关键字前缀时停止
            let hasKeywordPrefix = false;
            for (const keyword of C.AllKeywords) {
                if (this.source.startsWith(keyword, this.position)) {
                    hasKeywordPrefix = true;
                    break;
                }
            }
            if (hasKeywordPrefix) break;
            value += this.advance();
        }

        return AST.createToken(C.TokenType.IDENTIFIER, value, startLine, startColumn);
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

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;

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

    expect(type, value, message) {
        const token = this.peek();
        if (token.type === type && (!value || token.value === value)) {
            return this.advance();
        }
        throw new Error(`${message} 在第 ${token.line} 行，第 ${token.column} 列`);
    }

    // ==================== 语句分发 ====================

    parseStatement() {
        const token = this.peek();

        // 通过注册表查找语句处理器
        if (token.type === C.TokenType.KEYWORD && this.statementHandlers[token.value]) {
            return this[this.statementHandlers[token.value]]();
        }

        // 变量定义：标识符后跟冒号
        if (token.type === C.TokenType.IDENTIFIER) {
            const next = this.peekNext();
            if (next && next.value === '：') {
                return this.parseDefinition();
            }
        }

        return this.parseExpressionStatement();
    }

    // ==================== 语句解析 ====================

    parseIfStatement() {
        const ifToken = this.advance();
        this.expect(C.TokenType.PAREN, C.LeftParen, '期望左括号');
        const condition = this.parseExpression();
        this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
        this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');

        const consequent = this.parseBlock(ifToken.column);

        let alternate = null;
        if (this.match(C.TokenType.KEYWORD, '否则')) {
            this.match(C.TokenType.PUNCTUATION, '，');
            if (this.match(C.TokenType.KEYWORD, '如果')) {
                // 否则如果
                this.expect(C.TokenType.PAREN, C.LeftParen, '期望左括号');
                const elseIfCondition = this.parseExpression();
                this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
                this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');
                const elseIfConsequent = this.parseBlock(ifToken.column);
                alternate = AST.createIfStatement(elseIfCondition, elseIfConsequent, this.parseElseBlock(ifToken.column));
            } else {
                // 否则
                this.match(C.TokenType.PUNCTUATION, '，');
                this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');
                alternate = this.parseBlock(ifToken.column);
            }
        }

        return AST.createIfStatement(condition, consequent, alternate);
    }

    parseElseBlock(parentIndent) {
        if (this.match(C.TokenType.KEYWORD, '否则')) {
            this.match(C.TokenType.PUNCTUATION, '，');
            if (this.match(C.TokenType.KEYWORD, '如果')) {
                this.expect(C.TokenType.PAREN, C.LeftParen, '期望左括号');
                const condition = this.parseExpression();
                this.expect(C.TokenType.PAREN, C.RightParen, '期望右括号');
                this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');
                const consequent = this.parseBlock(parentIndent);
                return AST.createIfStatement(condition, consequent, this.parseElseBlock(parentIndent));
            } else {
                this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');
                return this.parseBlock(parentIndent);
            }
        }
        return null;
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
        this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');

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
            return AST.createIdentifier(id.value);
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
        this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');

        const body = this.parseBlock(loopToken.column);
        return AST.createForOfStatement(
            AST.createVariableDeclaration(paramToken.value),
            count,
            body
        );
    }

    parseReturnStatement() {
        this.advance();
        const argument = this.parseExpression();
        this.expect(C.TokenType.PUNCTUATION, '。', '期望句号');
        return AST.createReturnStatement(argument);
    }

    parsePrintStatement() {
        this.advance();
        const argument = this.parseExpression();
        this.expect(C.TokenType.PUNCTUATION, '。', '期望句号');
        return AST.createPrintStatement(argument);
    }

    parseBreakStatement() {
        this.advance();
        this.expect(C.TokenType.PUNCTUATION, '。', '期望句号');
        return AST.createBreakStatement();
    }

    parseClassStatement() {
        const classToken = this.advance();
        const name = this.expect(C.TokenType.IDENTIFIER, null, '期望类名');
        this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');
        const body = this.parseClassBody(classToken.column);
        return AST.createClassDeclaration(name.value, body);
    }

    // ==================== 定义解析（变量/函数/类） ====================

    parseDefinition() {
        const id = this.advance();
        this.expect(C.TokenType.PUNCTUATION, '：', '期望冒号');

        // 函数定义：输入"参数"；
        if (this.match(C.TokenType.KEYWORD, '输入')) {
            const params = this.parseFunctionParams();
            this.expect(C.TokenType.PUNCTUATION, '；', '期望分号');
            const body = this.parseBlock(id.column);
            return AST.createFunctionDeclaration(id.value, params, body);
        }

        // 类定义：嵌套的标识符：定义
        const next = this.peek();
        const nextNext = this.peekNext();
        if (next.type === C.TokenType.IDENTIFIER && nextNext.value === '：') {
            const body = this.parseClassBody(id.column);
            return AST.createClassDeclaration(id.value, body);
        }

        // 变量赋值
        const value = this.parseExpression();
        this.expect(C.TokenType.PUNCTUATION, '。', '期望句号');
        return AST.createAssignmentExpression(AST.createIdentifier(id.value), value);
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
            this.expect(C.TokenType.PUNCTUATION, '。', '期望句号');
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

                if (this.match(C.TokenType.KEYWORD, '输入')) {
                    // 方法定义
                    const params = this.parseFunctionParams();
                    this.expect(C.TokenType.PUNCTUATION, '；', '期望分号');
                    const funcBody = this.parseClassBody(id.column);
                    body.push(AST.createFunctionDeclaration(id.value, params, funcBody));
                } else {
                    // 属性定义
                    const value = this.parseExpression();
                    this.expect(C.TokenType.PUNCTUATION, '。', '期望句号');
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
     */
    isBlockTerminator(token) {
        return token.type === C.TokenType.KEYWORD
            && (token.value === '否则' || token.value === '结束' || token.value === '以上');
    }

    parseExpressionStatement() {
        const expression = this.parseExpression();
        this.expect(C.TokenType.PUNCTUATION, '。', '期望句号');
        return AST.createExpressionStatement(expression);
    }

    // ==================== 表达式解析（优先级从低到高） ====================

    parseExpression() {
        return this.parseLogicalOr();
    }

    parseLogicalOr() {
        let left = this.parseLogicalAnd();
        while (this.match(C.TokenType.KEYWORD, '或者') || this.match(C.TokenType.PUNCTUATION, '，')) {
            const right = this.parseLogicalAnd();
            left = AST.createLogicalExpression('||', left, right);
        }
        return left;
    }

    parseLogicalAnd() {
        let left = this.parseEquality();
        while (this.match(C.TokenType.KEYWORD, '并且') || this.match(C.TokenType.PUNCTUATION, '、')) {
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
        let object = this.parsePrimary();

        // 之/的 成员访问
        while (this.match(C.TokenType.KEYWORD, '之') || this.match(C.TokenType.KEYWORD, '的')) {
            const property = this.expect(C.TokenType.IDENTIFIER, null, '期望属性名');
            object = AST.createMemberExpression(object, AST.createIdentifier(property.value), false);
        }

        // 第...项 索引访问
        while (this.match(C.TokenType.KEYWORD, '第')) {
            const index = this.parseExpression();
            this.expect(C.TokenType.KEYWORD, '项', '期望"项"');
            object = AST.createMemberExpression(object, index, true);
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

        const token = this.peek();
        throw new Error(`Unexpected token: ${token.value} 在第 ${token.line} 行，第 ${token.column} 列`);
    }
}

// ==================== 代码生成器（来源：codeGenerator.js） ====================

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

    // ==================== 访问器注册表 ====================
    // 添加新节点类型的代码生成规则时，在此注册即可

    get visitors() {
        if (!this._visitors) {
            this._visitors = {
                // 程序根节点
                [C.NodeType.Program]: (node) => {
                    let code = '(function(console) {\n';
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

                // for 循环（重复）
                [C.NodeType.ForStatement]: (node) => {
                    let init = '';
                    if (node.init) {
                        init = `var ${node.init.name} = ${this.visit(node.init.value)}`;
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
                    return `for (var ${varName} = 0; ${varName} < ${this.visit(node.right)}; ${varName}++) ${this.visit(node.body)}`;
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

                // 类声明
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

                    return `var ${node.name} = {\n    ${members.join(',\n    ')}\n};`;
                },

                // 表达式语句
                [C.NodeType.ExpressionStatement]: (node) => {
                    return `${this.visit(node.expression)};`;
                },

                // 赋值表达式
                [C.NodeType.AssignmentExpression]: (node) => {
                    return `var ${this.visit(node.left)} = ${this.visit(node.right)}`;
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
                        return `${this.visit(node.object)}[${this.visit(node.property)}]`;
                    }
                    return `${this.visit(node.object)}.${this.visit(node.property)}`;
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
}

// ==================== 浏览器全局导出 ====================
if (typeof window !== 'undefined') {
    window.KuguaCompiler = Compiler;
    window.KuguaLexer = Lexer;
    window.KuguaParser = Parser;
    window.KuguaCodeGenerator = CodeGenerator;
}
