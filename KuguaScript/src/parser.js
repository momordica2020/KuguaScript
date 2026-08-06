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

module.exports = Parser;
