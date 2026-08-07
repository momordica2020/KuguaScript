/**
 * 苦瓜脚本语言 — 语法分析器
 * 将令牌流解析为抽象语法树（AST）
 * 使用注册表模式分发语句解析，便于扩展新语句类型
 */
const C = require('./constants');
const AST = require('./ast');

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

module.exports = Parser;
