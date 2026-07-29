// 苦瓜脚本语言编译器 - 浏览器版本
// 由 lexer.js、parser.js、codeGenerator.js、compiler.js 合并而成

// ==================== 词法分析器 ====================
class Lexer {
    constructor(source) {
        this.source = source;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        this.keywords = [
            '如果', '否则', '是', '不是', '等于', '小于', '大于',
            '小于等于', '大于等于', '不大于', '不小于', '结果是', '输入',
            '重复', '循环', '结束', '返回', '说', '定义', '类', '之',
            '的', '第', '个', '项', '长度', '功能', '方法', '全新',
            '并且', '或者', '就', '一直', '执行', '次', '开始于', '到',
            '为止', '每次', '增加', '追加', '去除', '包含', '等价于',
            '若', '为', '则', '和', '与', '或', '非', '用', '以', '可',
            '使', '让', '被', '把', '将', '给', '向', '从', '在', '上',
            '下', '左', '右', '前', '后', '中', '内', '外', '间', '时',
            '间', '的话', '而已', '而已矣', '罢了', '罢了罢了'
        ];
        this.booleanKeywords = {
            '正确': true, '正确的': true, '真': true, '真的': true, '对': true, '对的': true,
            '错误': false, '错误的': false, '错': false, '错的': false, '不对': false, '不对的': false
        };
        this.nullKeywords = ['空', '空的', '没了'];
        this.operators = [
            '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~'
        ];
        this.punctuation = [
            '。', '，', '、', '：', '；', '（', '）', '【', '】', '《', '》',
            '？', '！', '…', '—', '\r\n', '\n', '\r', ' '
        ];
    }

    tokenize() {
        while (this.position < this.source.length) {
            const current = this.peek();
            
            if (current === '/') {
                if (this.peekNext() === '/') {
                    this.skipLineComment();
                    continue;
                } else if (this.peekNext() === '*') {
                    this.skipBlockComment();
                    continue;
                }
            }

            if (current === '\u201C') {
                this.tokens.push(this.readString());
                continue;
            }

            if (current === '\u3010') {
                this.tokens.push(this.readBracketString());
                continue;
            }

            if (this.isDigit(current)) {
                this.tokens.push(this.readNumber());
                continue;
            }

            if (this.isIdentifierStart(current)) {
                const idTokens = this.readIdentifierOrKeywords();
                for (const token of idTokens) {
                    this.tokens.push(token);
                }
                continue;
            }

            if (this.operators.includes(current)) {
                this.tokens.push({
                    type: 'OPERATOR',
                    value: current,
                    line: this.line,
                    column: this.column
                });
                this.advance();
                continue;
            }

            if (current === '\u3002' || current === '\uFF0C' || current === '\u3001' || current === '\uFF1A' || current === '\uFF1B' || current === '\uFF1F' || current === '\u300A' || current === '\u300B' || current === '\u2014' || current === '\uFF01') {
                this.tokens.push({
                    type: 'PUNCTUATION',
                    value: current,
                    line: this.line,
                    column: this.column
                });
                this.advance();
                continue;
            }

            if (current === '\uFF08' || current === '\uFF09') {
                this.tokens.push({
                    type: 'PAREN',
                    value: current,
                    line: this.line,
                    column: this.column
                });
                this.advance();
                continue;
            }

            if (this.isWhitespace(current)) {
                this.advance();
                continue;
            }

            throw new Error('\u672A\u77E5\u5B57\u7B26: ' + current + ' \u5728\u7B2C ' + this.line + ' \u884C\uFF0C\u7B2C ' + this.column + ' \u5217');
        }

        this.tokens.push({
            type: 'EOF',
            value: '',
            line: this.line,
            column: this.column
        });

        return this.tokens;
    }

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

    isWhitespace(char) {
        return [' ', '\t', '\n', '\r'].includes(char);
    }

    isDigit(char) {
        return /[0-9]/.test(char);
    }

    isIdentifierStart(char) {
        return /[\u4e00-\u9fa5a-zA-Z_]/.test(char);
    }

    isIdentifierPart(char) {
        return /[\u4e00-\u9fa5a-zA-Z0-9_]/.test(char);
    }

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
            } else if (this.isDigit(current)) {
                value += this.advance();
            } else {
                break;
            }
        }

        return {
            type: 'NUMBER',
            value: hasDecimal ? parseFloat(value) : parseInt(value),
            line: startLine,
            column: startColumn
        };
    }

    readString() {
        let value = '';
        const startLine = this.line;
        const startColumn = this.column;

        this.advance();

        while (this.position < this.source.length) {
            const current = this.peek();
            
            if (current === '\\') {
                this.advance();
                const next = this.peek();
                if (next === '\u201C') {
                    value += '\u201C';
                } else if (next === '\\') {
                    value += '\\';
                } else if (next === 'n') {
                    value += '\n';
                } else if (next === 'r') {
                    value += '\r';
                } else if (next === 't') {
                    value += '\t';
                } else {
                    value += '\\' + next;
                }
                this.advance();
                continue;
            }

            if (current === '\u201D') {
                this.advance();
                break;
            }

            value += this.advance();
        }

        return {
            type: 'STRING',
            value: value,
            line: startLine,
            column: startColumn
        };
    }

    readBracketString() {
        let value = '';
        const startLine = this.line;
        const startColumn = this.column;

        this.advance();

        while (this.position < this.source.length) {
            const current = this.peek();
            
            if (current === '\u3011') {
                this.advance();
                break;
            }

            value += this.advance();
        }

        return {
            type: 'STRING',
            value: value,
            line: startLine,
            column: startColumn
        };
    }

    readIdentifierOrKeywords() {
        const tokens = [];

        while (this.position < this.source.length && this.isIdentifierPart(this.peek())) {
            if (this.isDigit(this.peek())) {
                tokens.push(this.readNumber());
            } else {
                const booleanToken = this.matchBooleanKeyword();
                if (booleanToken) {
                    tokens.push(booleanToken);
                } else {
                    const nullToken = this.matchNullKeyword();
                    if (nullToken) {
                        tokens.push(nullToken);
                    } else {
                        const matched = this.matchLongestKeyword();
                        if (matched) {
                            tokens.push({
                                type: 'KEYWORD',
                                value: matched.value,
                                line: matched.line,
                                column: matched.column
                            });
                        } else {
                            tokens.push(this.readIdentifier());
                        }
                    }
                }
            }
        }

        return tokens;
    }

    matchBooleanKeyword() {
        const startLine = this.line;
        const startColumn = this.column;
        let matchedKey = null;
        let matchedLength = 0;

        for (const key of Object.keys(this.booleanKeywords)) {
            if (this.source.startsWith(key, this.position)) {
                const nextChar = this.source[this.position + key.length];
                if (nextChar && this.isIdentifierPart(nextChar)) continue;
                if (key.length > matchedLength) {
                    matchedKey = key;
                    matchedLength = key.length;
                }
            }
        }

        if (matchedKey) {
            for (let i = 0; i < matchedLength; i++) {
                this.advance();
            }
            return {
                type: 'BOOLEAN',
                value: this.booleanKeywords[matchedKey],
                line: startLine,
                column: startColumn
            };
        }

        return null;
    }

    matchNullKeyword() {
        const startLine = this.line;
        const startColumn = this.column;
        let matchedKey = null;
        let matchedLength = 0;

        for (const key of this.nullKeywords) {
            if (this.source.startsWith(key, this.position)) {
                const nextChar = this.source[this.position + key.length];
                if (nextChar && this.isIdentifierPart(nextChar)) continue;
                if (key.length > matchedLength) {
                    matchedKey = key;
                    matchedLength = key.length;
                }
            }
        }

        if (matchedKey) {
            for (let i = 0; i < matchedLength; i++) {
                this.advance();
            }
            return {
                type: 'NULL',
                value: null,
                line: startLine,
                column: startColumn
            };
        }

        return null;
    }

    matchLongestKeyword() {
        const startLine = this.line;
        const startColumn = this.column;
        let matchedKeyword = null;
        let matchedLength = 0;

        for (const keyword of this.keywords) {
            if (this.source.startsWith(keyword, this.position)) {
                if (keyword.length > matchedLength) {
                    matchedKeyword = keyword;
                    matchedLength = keyword.length;
                }
            }
        }

        if (matchedKeyword) {
            for (let i = 0; i < matchedLength; i++) {
                this.advance();
            }
            return {
                value: matchedKeyword,
                line: startLine,
                column: startColumn
            };
        }

        return null;
    }

    readIdentifier() {
        let value = '';
        const startLine = this.line;
        const startColumn = this.column;

        while (this.position < this.source.length && this.isIdentifierPart(this.peek())) {
            let hasKeywordPrefix = false;
            for (const keyword of this.keywords) {
                if (this.source.startsWith(keyword, this.position)) {
                    hasKeywordPrefix = true;
                    break;
                }
            }
            if (hasKeywordPrefix) break;
            value += this.advance();
        }

        return {
            type: 'IDENTIFIER',
            value: value,
            line: startLine,
            column: startColumn
        };
    }

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

// ==================== 语法分析器 ====================
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    parse() {
        const program = {
            type: 'Program',
            body: []
        };

        while (!this.isAtEnd()) {
            const statement = this.parseStatement();
            if (statement) {
                program.body.push(statement);
            }
        }

        return program;
    }

    isAtEnd() {
        return this.peek().type === 'EOF';
    }

    peek() {
        return this.tokens[this.position] || { type: 'EOF' };
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
        throw new Error(message + ' \u5728\u7B2C ' + token.line + ' \u884C\uFF0C\u7B2C ' + token.column + ' \u5217');
    }

    parseStatement() {
        const token = this.peek();

        if (token.type === 'KEYWORD' && (token.value === '\u5982\u679C' || token.value === '\u82E5')) {
            return this.parseIfStatement();
        }

        if (token.type === 'KEYWORD' && token.value === '\u91CD\u590D') {
            return this.parseRepeatStatement();
        }

        if (token.type === 'KEYWORD' && token.value === '\u5FAA\u73AF') {
            return this.parseLoopStatement();
        }

        if (token.type === 'KEYWORD' && (token.value === '\u8FD4\u56DE' || token.value === '\u7ED3\u679C\u662F')) {
            return this.parseReturnStatement();
        }

        if (token.type === 'KEYWORD' && token.value === '\u8BF4') {
            return this.parsePrintStatement();
        }

        if (token.type === 'KEYWORD' && token.value === '\u7ED3\u675F') {
            return this.parseBreakStatement();
        }

        if (token.type === 'KEYWORD' && token.value === '\u7C7B') {
            return this.parseClassStatement();
        }

        if (token.type === 'IDENTIFIER') {
            const next = this.peekNext();
            if (next && next.value === '\uFF1A') {
                return this.parseDefinition();
            }
        }

        return this.parseExpressionStatement();
    }

    peekNext() {
        return this.tokens[this.position + 1] || { type: 'EOF' };
    }

    parseIfStatement() {
        const ifToken = this.advance();
        this.expect('PAREN', '\uFF08', '\u671F\u671B\u5DE6\u62EC\u53F7');
        
        const condition = this.parseExpression();
        
        this.expect('PAREN', '\uFF09', '\u671F\u671B\u53F3\u62EC\u53F7');
        this.expect('PUNCTUATION', '\uFF1A', '\u671F\u671B\u5192\u53F7');
        
        const consequent = this.parseBlock(ifToken.column);
        
        let alternate = null;
        if (this.match('KEYWORD', '\u5426\u5219')) {
            this.match('PUNCTUATION', '\uFF0C');
            if (this.match('KEYWORD', '\u5982\u679C')) {
                this.expect('PAREN', '\uFF08', '\u671F\u671B\u5DE6\u62EC\u53F7');
                const elseIfCondition = this.parseExpression();
                this.expect('PAREN', '\uFF09', '\u671F\u671B\u53F3\u62EC\u53F7');
                this.expect('PUNCTUATION', '\uFF1A', '\u671F\u671B\u5192\u53F7');
                const elseIfConsequent = this.parseBlock(ifToken.column);
                alternate = {
                    type: 'IfStatement',
                    condition: elseIfCondition,
                    consequent: elseIfConsequent,
                    alternate: this.parseElseBlock(ifToken.column)
                };
            } else {
                this.match('PUNCTUATION', '\uFF0C');
                this.expect('PUNCTUATION', '\uFF1A', '\u671F\u671B\u5192\u53F7');
                alternate = this.parseBlock(ifToken.column);
            }
        }

        return {
            type: 'IfStatement',
            condition: condition,
            consequent: consequent,
            alternate: alternate
        };
    }

    parseElseBlock(parentIndent) {
        if (this.match('KEYWORD', '\u5426\u5219')) {
            this.match('PUNCTUATION', '\uFF0C');
            if (this.match('KEYWORD', '\u5982\u679C')) {
                this.expect('PAREN', '\uFF08', '\u671F\u671B\u5DE6\u62EC\u53F7');
                const condition = this.parseExpression();
                this.expect('PAREN', '\uFF09', '\u671F\u671B\u53F3\u62EC\u53F7');
                this.expect('PUNCTUATION', '\uFF1A', '\u671F\u671B\u5192\u53F7');
                const consequent = this.parseBlock(parentIndent);
                return {
                    type: 'IfStatement',
                    condition: condition,
                    consequent: consequent,
                    alternate: this.parseElseBlock(parentIndent)
                };
            } else {
                this.expect('PUNCTUATION', '\uFF1A', '\u671F\u671B\u5192\u53F7');
                return this.parseBlock(parentIndent);
            }
        }
        return null;
    }

    parseRepeatStatement() {
        const repeatToken = this.advance();
        this.expect('PAREN', '\uFF08', '\u671F\u671B\u5DE6\u62EC\u53F7');
        
        let init = null;
        if (this.match('KEYWORD', '\u5F00\u59CB\u4E8E')) {
            const id = this.expect('IDENTIFIER', null, '\u671F\u671B\u53D8\u91CF\u540D');
            this.expect('OPERATOR', '=', '\u671F\u671B\u7B49\u53F7');
            const value = this.parseSimpleValue();
            init = { type: 'VariableDeclaration', name: id.value, value: value };
        }
        
        this.match('PUNCTUATION', '\uFF0C');
        this.expect('KEYWORD', '\u5230', '\u671F\u671B\u201C\u5230\u201D');
        
        const condition = this.parseSimpleCondition();
        this.expect('KEYWORD', '\u4E3A\u6B62', '\u671F\u671B\u201C\u4E3A\u6B62\u201D');
        
        let update = null;
        if (this.match('PUNCTUATION', '\uFF0C')) {
            this.expect('KEYWORD', '\u6BCF\u6B21', '\u671F\u671B\u201C\u6BCF\u6B21\u201D');
            const id = this.expect('IDENTIFIER', null, '\u671F\u671B\u53D8\u91CF\u540D');
            this.expect('OPERATOR', '+', '\u671F\u671B\u52A0\u53F7');
            this.expect('OPERATOR', '+', '\u671F\u671B\u52A0\u53F7');
            update = { type: 'UpdateExpression', operator: '++', argument: { type: 'Identifier', name: id.value } };
        }
        
        this.expect('PAREN', '\uFF09', '\u671F\u671B\u53F3\u62EC\u53F7');
        this.expect('PUNCTUATION', '\uFF1A', '\u671F\u671B\u5192\u53F7');
        
        const body = this.parseBlock(repeatToken.column);
        
        return {
            type: 'ForStatement',
            init: init,
            condition: condition,
            update: update,
            body: body
        };
    }

    parseSimpleValue() {
        const token = this.peek();
        
        if (token.type === 'NUMBER') {
            const num = this.advance();
            return { type: 'Literal', value: num.value, raw: String(num.value) };
        }
        
        if (token.type === 'IDENTIFIER') {
            const id = this.advance();
            return { type: 'Identifier', name: id.value };
        }
        
        return this.parseExpression();
    }

    parseSimpleCondition() {
        const left = this.parseSimpleValue();
        
        if (this.match('KEYWORD', '\u5C0F\u4E8E') || this.match('KEYWORD', '\u5927\u4E8E') ||
            this.match('KEYWORD', '\u5C0F\u4E8E\u7B49\u4E8E') || this.match('KEYWORD', '\u5927\u4E8E\u7B49\u4E8E') ||
            this.match('KEYWORD', '\u4E0D\u5927\u4E8E') || this.match('KEYWORD', '\u4E0D\u5C0F\u4E8E')) {
            let operator;
            switch (this.previous().value) {
                case '\u5C0F\u4E8E': operator = '<'; break;
                case '\u5927\u4E8E': operator = '>'; break;
                case '\u5C0F\u4E8E\u7B49\u4E8E': operator = '<='; break;
                case '\u5927\u4E8E\u7B49\u4E8E': operator = '>='; break;
                case '\u4E0D\u5927\u4E8E': operator = '<='; break;
                case '\u4E0D\u5C0F\u4E8E': operator = '>='; break;
            }
            const right = this.parseSimpleValue();
            return {
                type: 'BinaryExpression',
                operator: operator,
                left: left,
                right: right
            };
        }
        
        return left;
    }

    parseLoopStatement() {
        const loopToken = this.advance();
        
        const count = this.parseExpression();
        
        this.expect('KEYWORD', '\u6B21', '\u671F\u671B\u201C\u6B21\u201D');
        this.expect('PAREN', '\uFF08', '\u671F\u671B\u5DE6\u62EC\u53F7');
        
        const paramToken = this.expect('IDENTIFIER', null, '\u671F\u671B\u53C2\u6570\u540D');
        
        this.expect('PAREN', '\uFF09', '\u671F\u671B\u53F3\u62EC\u53F7');
        this.expect('PUNCTUATION', '\uFF1A', '\u671F\u671B\u5192\u53F7');
        
        const body = this.parseBlock(loopToken.column);
        
        return {
            type: 'ForOfStatement',
            left: { type: 'VariableDeclaration', name: paramToken.value },
            right: count,
            body: body
        };
    }

    parseReturnStatement() {
        this.advance();
        
        const argument = this.parseExpression();
        
        this.expect('PUNCTUATION', '\u3002', '\u671F\u671B\u53E5\u53F7');
        
        return {
            type: 'ReturnStatement',
            argument: argument
        };
    }

    parsePrintStatement() {
        this.advance();
        
        const argument = this.parseExpression();
        
        this.expect('PUNCTUATION', '\u3002', '\u671F\u671B\u53E5\u53F7');
        
        return {
            type: 'PrintStatement',
            argument: argument
        };
    }

    parseBreakStatement() {
        this.advance();
        
        this.expect('PUNCTUATION', '\u3002', '\u671F\u671B\u53E5\u53F7');
        
        return {
            type: 'BreakStatement'
        };
    }

    parseClassStatement() {
        const classToken = this.advance();
        
        const name = this.expect('IDENTIFIER', null, '\u671F\u671B\u7C7B\u540D');
        
        this.expect('PUNCTUATION', '\uFF1A', '\u671F\u671B\u5192\u53F7');
        
        const body = this.parseClassBody(classToken.column);
        
        return {
            type: 'ClassDeclaration',
            name: name.value,
            body: body
        };
    }

    parseClassBody(parentIndent) {
        const body = [];
        
        while (!this.isAtEnd()) {
            const token = this.peek();
            if (token.type === 'KEYWORD' && (token.value === '\u5426\u5219' || token.value === '\u7ED3\u675F' || token.value === '\u4EE5\u4E0A')) {
                break;
            }
            
            if (parentIndent !== undefined && token.column <= parentIndent) {
                break;
            }
            
            const next = this.peekNext();
            if (next && next.value === '\uFF1A') {
                const id = this.advance();
                this.advance();
                
                if (this.match('KEYWORD', '\u8F93\u5165')) {
                    const params = [];
                    const hasParen = this.match('PAREN', '\uFF08');
                    
                    while (true) {
                        const param = this.expect('STRING', null, '\u671F\u671B\u53C2\u6570\u540D');
                        params.push({ type: 'Identifier', name: param.value });
                        if (this.match('PUNCTUATION', '\u3001')) {
                            continue;
                        }
                        break;
                    }
                    
                    if (hasParen) {
                        this.expect('PAREN', '\uFF09', '\u671F\u671B\u53F3\u62EC\u53F7');
                    }
                    
                    this.expect('PUNCTUATION', '\uFF1B', '\u671F\u671B\u5206\u53F7');
                    
                    const funcBody = this.parseClassBody(id.column);
                    
                    body.push({
                        type: 'FunctionDeclaration',
                        name: id.value,
                        params: params,
                        body: funcBody
                    });
                } else {
                    const value = this.parseExpression();
                    this.expect('PUNCTUATION', '\u3002', '\u671F\u671B\u53E5\u53F7');
                    
                    body.push({
                        type: 'ClassProperty',
                        name: id.value,
                        value: value
                    });
                }
            } else {
                const statement = this.parseStatement();
                if (statement) {
                    body.push(statement);
                }
            }
        }
        
        return {
            type: 'BlockStatement',
            body: body
        };
    }

    parseDefinition() {
        const id = this.advance();
        
        this.expect('PUNCTUATION', '\uFF1A', '\u671F\u671B\u5192\u53F7');
        
        if (this.match('KEYWORD', '\u8F93\u5165')) {
            const params = [];
            const hasParen = this.match('PAREN', '\uFF08');
            
            while (true) {
                const param = this.expect('STRING', null, '\u671F\u671B\u53C2\u6570\u540D');
                params.push({ type: 'Identifier', name: param.value });
                if (this.match('PUNCTUATION', '\u3001')) {
                    continue;
                }
                break;
            }
            
            if (hasParen) {
                this.expect('PAREN', '\uFF09', '\u671F\u671B\u53F3\u62EC\u53F7');
            }
            
            this.expect('PUNCTUATION', '\uFF1B', '\u671F\u671B\u5206\u53F7');
            
            const body = this.parseBlock(id.column);
            
            return {
                type: 'FunctionDeclaration',
                name: id.value,
                params: params,
                body: body
            };
        }
        
        const next = this.peek();
        const nextNext = this.peekNext();
        if (next.type === 'IDENTIFIER' && nextNext.value === '\uFF1A') {
            const body = this.parseClassBody(id.column);
            return {
                type: 'ClassDeclaration',
                name: id.value,
                body: body
            };
        }
        
        const value = this.parseExpression();
        
        this.expect('PUNCTUATION', '\u3002', '\u671F\u671B\u53E5\u53F7');
        
        return {
            type: 'AssignmentExpression',
            left: { type: 'Identifier', name: id.value },
            right: value
        };
    }

    parseExpressionStatement() {
        const expression = this.parseExpression();
        
        this.expect('PUNCTUATION', '\u3002', '\u671F\u671B\u53E5\u53F7');
        
        return {
            type: 'ExpressionStatement',
            expression: expression
        };
    }

    parseBlock(parentIndent) {
        const body = [];
        
        while (!this.isAtEnd()) {
            const token = this.peek();
            if (token.type === 'KEYWORD' && (token.value === '\u5426\u5219' || token.value === '\u7ED3\u675F' || token.value === '\u4EE5\u4E0A')) {
                break;
            }
            
            if (parentIndent !== undefined && token.column <= parentIndent) {
                break;
            }
            
            const statement = this.parseStatement();
            if (statement) {
                body.push(statement);
            }
        }
        
        if (this.match('KEYWORD', '\u4EE5\u4E0A')) {
            this.expect('PUNCTUATION', '\u3002', '\u671F\u671B\u53E5\u53F7');
        }
        
        return {
            type: 'BlockStatement',
            body: body
        };
    }

    parseExpression() {
        return this.parseLogicalOr();
    }

    parseLogicalOr() {
        let left = this.parseLogicalAnd();
        
        while (this.match('KEYWORD', '\u6216\u8005') || this.match('PUNCTUATION', '\uFF0C')) {
            const operator = '||';
            const right = this.parseLogicalAnd();
            left = {
                type: 'LogicalExpression',
                operator: operator,
                left: left,
                right: right
            };
        }
        
        return left;
    }

    parseLogicalAnd() {
        let left = this.parseEquality();
        
        while (this.match('KEYWORD', '\u5E76\u4E14') || this.match('PUNCTUATION', '\u3001')) {
            const operator = '&&';
            const right = this.parseEquality();
            left = {
                type: 'LogicalExpression',
                operator: operator,
                left: left,
                right: right
            };
        }
        
        return left;
    }

    previous() {
        return this.tokens[this.position - 1];
    }

    parseEquality() {
        let left = this.parseComparison();
        
        while (this.match('KEYWORD', '\u662F') || this.match('KEYWORD', '\u4E0D\u662F') || 
               this.match('KEYWORD', '\u7B49\u4E8E') || this.match('KEYWORD', '\u7B49\u4EF7\u4E8E')) {
            const operator = this.previous().value === '\u662F' || this.previous().value === '\u7B49\u4E8E' || this.previous().value === '\u7B49\u4EF7\u4E8E' ? '===' : '!==';
            const right = this.parseComparison();
            left = {
                type: 'BinaryExpression',
                operator: operator,
                left: left,
                right: right
            };
        }
        
        return left;
    }

    parseComparison() {
        let left = this.parseAdditive();
        
        while (this.match('KEYWORD', '\u5C0F\u4E8E') || this.match('KEYWORD', '\u5927\u4E8E') ||
               this.match('KEYWORD', '\u5C0F\u4E8E\u7B49\u4E8E') || this.match('KEYWORD', '\u5927\u4E8E\u7B49\u4E8E') ||
               this.match('KEYWORD', '\u4E0D\u5927\u4E8E') || this.match('KEYWORD', '\u4E0D\u5C0F\u4E8E')) {
            let operator;
            switch (this.previous().value) {
                case '\u5C0F\u4E8E': operator = '<'; break;
                case '\u5927\u4E8E': operator = '>'; break;
                case '\u5C0F\u4E8E\u7B49\u4E8E': operator = '<='; break;
                case '\u5927\u4E8E\u7B49\u4E8E': operator = '>='; break;
                case '\u4E0D\u5927\u4E8E': operator = '<='; break;
                case '\u4E0D\u5C0F\u4E8E': operator = '>='; break;
            }
            const right = this.parseAdditive();
            left = {
                type: 'BinaryExpression',
                operator: operator,
                left: left,
                right: right
            };
        }
        
        return left;
    }

    parseAdditive() {
        let left = this.parseMultiplicative();
        
        while (this.match('OPERATOR', '+') || this.match('OPERATOR', '-')) {
            const operator = this.previous().value;
            const right = this.parseMultiplicative();
            left = {
                type: 'BinaryExpression',
                operator: operator,
                left: left,
                right: right
            };
        }
        
        return left;
    }

    parseMultiplicative() {
        let left = this.parseUnary();
        
        while (this.match('OPERATOR', '*') || this.match('OPERATOR', '/') || this.match('OPERATOR', '%')) {
            const operator = this.previous().value;
            const right = this.parseUnary();
            left = {
                type: 'BinaryExpression',
                operator: operator,
                left: left,
                right: right
            };
        }
        
        return left;
    }

    parseUnary() {
        if (this.match('OPERATOR', '!') || this.match('KEYWORD', '\u975E')) {
            const operator = '!';
            const argument = this.parseUnary();
            return {
                type: 'UnaryExpression',
                operator: operator,
                argument: argument
            };
        }
        
        if (this.match('OPERATOR', '-')) {
            const operator = '-';
            const argument = this.parseUnary();
            return {
                type: 'UnaryExpression',
                operator: operator,
                argument: argument
            };
        }
        
        return this.parseCall();
    }

    parseCall() {
        let expression = this.parseMember();
        
        while (this.match('PAREN', '\uFF08')) {
            const args = [];
            if (!this.match('PAREN', '\uFF09')) {
                args.push(this.parseArgumentExpression());
                while (this.match('PUNCTUATION', '\uFF0C')) {
                    args.push(this.parseArgumentExpression());
                }
                this.expect('PAREN', '\uFF09', '\u671F\u671B\u53F3\u62EC\u53F7');
            }
            
            expression = {
                type: 'CallExpression',
                callee: expression,
                arguments: args
            };
        }
        
        return expression;
    }

    parseArgumentExpression() {
        return this.parseLogicalAnd();
    }

    parseMember() {
        let object = this.parsePrimary();
        
        while (this.match('KEYWORD', '\u4E4B') || this.match('KEYWORD', '\u7684')) {
            const property = this.expect('IDENTIFIER', null, '\u671F\u671B\u5C5E\u6027\u540D');
            object = {
                type: 'MemberExpression',
                object: object,
                property: { type: 'Identifier', name: property.value },
                computed: false
            };
        }
        
        while (this.match('KEYWORD', '\u7B2C')) {
            const index = this.parseExpression();
            this.expect('KEYWORD', '\u9879', '\u671F\u671B\u201C\u9879\u201D');
            object = {
                type: 'MemberExpression',
                object: object,
                property: index,
                computed: true
            };
        }
        
        return object;
    }

    parsePrimary() {
        if (this.match('NUMBER')) {
            return {
                type: 'Literal',
                value: this.previous().value,
                raw: String(this.previous().value)
            };
        }
        
        if (this.match('STRING')) {
            return {
                type: 'Literal',
                value: this.previous().value,
                raw: '"' + this.previous().value + '"'
            };
        }
        
        if (this.match('BOOLEAN')) {
            return {
                type: 'Literal',
                value: this.previous().value,
                raw: String(this.previous().value)
            };
        }
        
        if (this.match('NULL')) {
            return {
                type: 'Literal',
                value: null,
                raw: 'null'
            };
        }
        
        if (this.match('IDENTIFIER')) {
            return {
                type: 'Identifier',
                name: this.previous().value
            };
        }
        
        if (this.match('PAREN', '\uFF08')) {
            const expression = this.parseExpression();
            this.expect('PAREN', '\uFF09', '\u671F\u671B\u53F3\u62EC\u53F7');
            return expression;
        }
        
        throw new Error('Unexpected token: ' + this.peek().value + ' \u5728\u7B2C ' + this.peek().line + ' \u884C\uFF0C\u7B2C ' + this.peek().column + ' \u5217');
    }
}

// ==================== 代码生成器 ====================
class CodeGenerator {
    constructor() {
        this.indentLevel = 0;
        this.output = '';
    }

    generate(node) {
        this.output = '';
        this.indentLevel = 0;
        this.visit(node);
        return this.output;
    }

    visit(node) {
        if (!node) return '';
        
        const method = 'visit' + node.type;
        if (typeof this[method] === 'function') {
            return this[method](node);
        }
        
        throw new Error('Unknown node type: ' + node.type);
    }

    visitProgram(node) {
        this.write('(function(console) {');
        this.newLine();
        this.indent();
        
        for (const statement of node.body) {
            this.visit(statement);
            this.newLine();
        }
        
        this.dedent();
        this.write('})(console);');
    }

    visitBlockStatement(node) {
        this.write('{');
        this.newLine();
        this.indent();
        
        for (const statement of node.body) {
            this.visit(statement);
            this.newLine();
        }
        
        this.dedent();
        this.write('}');
    }

    visitIfStatement(node) {
        this.write('if (');
        this.visit(node.condition);
        this.write(') ');
        this.visit(node.consequent);
        
        if (node.alternate) {
            this.newLine();
            if (node.alternate.type === 'IfStatement') {
                this.write('else ');
                this.visit(node.alternate);
            } else {
                this.write('else ');
                this.visit(node.alternate);
            }
        }
    }

    visitForStatement(node) {
        this.write('for (');
        
        if (node.init) {
            this.write('var ');
            this.write(node.init.name);
            this.write(' = ');
            this.visit(node.init.value);
        }
        
        this.write('; ');
        
        if (node.condition) {
            this.visit(node.condition);
        }
        
        this.write('; ');
        
        if (node.update) {
            this.write(node.update.argument.name);
            this.write(node.update.operator);
        }
        
        this.write(') ');
        this.visit(node.body);
    }

    visitForOfStatement(node) {
        this.write('for (var ');
        this.write(node.left.name);
        this.write(' = 0; ');
        this.write(node.left.name);
        this.write(' < ');
        this.visit(node.right);
        this.write('; ');
        this.write(node.left.name);
        this.write('++) ');
        this.visit(node.body);
    }

    visitReturnStatement(node) {
        this.write('return ');
        this.visit(node.argument);
        this.write(';');
    }

    visitPrintStatement(node) {
        this.write('console.log(');
        this.visit(node.argument);
        this.write(');');
    }

    visitBreakStatement(node) {
        this.write('break;');
    }

    visitFunctionDeclaration(node) {
        this.write('function ');
        this.write(node.name);
        this.write('(');
        
        const params = [];
        for (const param of node.params) {
            params.push(param.name);
        }
        
        this.write(params.join(', '));
        this.write(') ');
        this.visit(node.body);
    }

    visitClassProperty(node) {
        this.write('var ');
        this.write(node.name);
        this.write(' = ');
        this.visit(node.value);
        this.write(';');
    }

    visitClassDeclaration(node) {
        this.write('var ');
        this.write(node.name);
        this.write(' = {');
        this.newLine();
        this.indent();
        
        const body = node.body.body || node.body;
        let first = true;
        
        for (const statement of body) {
            if (!first) {
                this.write(',');
                this.newLine();
            }
            first = false;
            
            if (statement.type === 'FunctionDeclaration') {
                this.write(statement.name);
                this.write(': function(');
                
                const params = [];
                for (const param of statement.params) {
                    params.push(param.name);
                }
                
                this.write(params.join(', '));
                this.write(') ');
                this.visit(statement.body);
            } else if (statement.type === 'ClassProperty') {
                this.write(statement.name);
                this.write(': ');
                this.visit(statement.value);
            } else if (statement.type === 'AssignmentExpression') {
                this.visit(statement.left);
                this.write(': ');
                this.visit(statement.right);
            }
        }
        
        this.newLine();
        this.dedent();
        this.write('};');
    }

    visitExpressionStatement(node) {
        this.visit(node.expression);
        this.write(';');
    }

    visitAssignmentExpression(node) {
        this.write('var ');
        this.visit(node.left);
        this.write(' = ');
        this.visit(node.right);
    }

    visitLogicalExpression(node) {
        this.write('(');
        this.visit(node.left);
        this.write(' ');
        this.write(node.operator);
        this.write(' ');
        this.visit(node.right);
        this.write(')');
    }

    visitBinaryExpression(node) {
        this.write('(');
        this.visit(node.left);
        this.write(' ');
        this.write(node.operator);
        this.write(' ');
        this.visit(node.right);
        this.write(')');
    }

    visitUnaryExpression(node) {
        this.write(node.operator);
        this.visit(node.argument);
    }

    visitCallExpression(node) {
        this.visit(node.callee);
        this.write('(');
        
        const args = [];
        const savedOutput = this.output;
        for (const arg of node.arguments) {
            this.output = '';
            this.visit(arg);
            args.push(this.output);
        }
        this.output = savedOutput;
        
        this.write(args.join(', '));
        this.write(')');
    }

    visitMemberExpression(node) {
        this.visit(node.object);
        
        if (node.computed) {
            this.write('[');
            this.visit(node.property);
            this.write(']');
        } else {
            this.write('.');
            this.visit(node.property);
        }
    }

    visitIdentifier(node) {
        this.write(node.name);
    }

    visitLiteral(node) {
        if (typeof node.value === 'string') {
            this.write('"' + node.value.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"');
        } else if (node.value === null) {
            this.write('null');
        } else if (typeof node.value === 'boolean') {
            this.write(node.value ? 'true' : 'false');
        } else {
            this.write(String(node.value));
        }
    }

    visitVariableDeclaration(node) {
        this.write('var ');
        this.write(node.name);
        if (node.value) {
            this.write(' = ');
            this.visit(node.value);
        }
    }

    visitUpdateExpression(node) {
        this.visit(node.argument);
        this.write(node.operator);
    }

    write(text) {
        this.output += text;
    }

    newLine() {
        this.output += '\n';
        this.output += '    '.repeat(this.indentLevel);
    }

    indent() {
        this.indentLevel++;
    }

    dedent() {
        this.indentLevel--;
    }
}

// ==================== 编译器 ====================
class Compiler {
    constructor() {
        this.lexer = null;
        this.parser = null;
        this.codeGenerator = null;
    }

    compile(source) {
        this.lexer = new Lexer(source);
        const tokens = this.lexer.tokenize();
        
        this.parser = new Parser(tokens);
        const ast = this.parser.parse();
        
        this.codeGenerator = new CodeGenerator();
        const jsCode = this.codeGenerator.generate(ast);
        
        return jsCode;
    }

    run(source, outputCallback) {
        const jsCode = this.compile(source);
        
        const logs = [];
        const mockConsole = {
            log: function(...args) {
                logs.push(args.join(' '));
                if (outputCallback) {
                    outputCallback(args.join(' '));
                }
            }
        };
        
        new Function('console', jsCode)(mockConsole);
        
        return logs.join('\n');
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.KuguaCompiler = Compiler;
    window.KuguaLexer = Lexer;
    window.KuguaParser = Parser;
    window.KuguaCodeGenerator = CodeGenerator;
}
