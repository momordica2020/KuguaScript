/**
 * 苦瓜脚本语言 — 语法分析器
 * 将令牌流解析为抽象语法树（AST）
 * 使用注册表模式分发语句解析，便于扩展新语句类型
 */
const C = require('./constants');
const AST = require('./ast');

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
                if (pos < this.tokens.length &&
                    (this.tokens[pos].type === C.TokenType.IDENTIFIER ||
                     this.tokens[pos].type === C.TokenType.KEYWORD)) {
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

    // ==================== 定义解析（变量/函数/类/成员赋值） ====================

    parseDefinition() {
        const id = this.advance();
        let target = AST.createIdentifier(id.value);

        // 处理成员访问链：敌人之生命
        // 允许关键字作为属性名
        while (this.match(C.TokenType.KEYWORD, '之') || this.match(C.TokenType.KEYWORD, '的')) {
            const next = this.peek();
            if (next.type === C.TokenType.IDENTIFIER || next.type === C.TokenType.KEYWORD) {
                this.advance();
                target = AST.createMemberExpression(target, AST.createIdentifier(next.value), false);
            } else {
                throw new Error(`期望属性名 在第 ${next.line} 行，第 ${next.column} 列`);
            }
        }

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
        this.expect(C.TokenType.PUNCTUATION, '。', '期望句号');
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
     * 注意：'结束' 作为 break 语句使用，不作为块终止符
     */
    isBlockTerminator(token) {
        return token.type === C.TokenType.KEYWORD
            && (token.value === '否则' || token.value === '以上');
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
        // 允许关键字作为属性名（如"追加"、"包含"等保留字）
        while (this.match(C.TokenType.KEYWORD, '之') || this.match(C.TokenType.KEYWORD, '的')) {
            const next = this.peek();
            if (next.type === C.TokenType.IDENTIFIER || next.type === C.TokenType.KEYWORD) {
                this.advance();
                object = AST.createMemberExpression(object, AST.createIdentifier(next.value), false);
            } else {
                throw new Error(`期望属性名 在第 ${next.line} 行，第 ${next.column} 列`);
            }
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

module.exports = Parser;
