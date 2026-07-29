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
        throw new Error(`${message} 在第 ${token.line} 行，第 ${token.column} 列`);
    }

    parseStatement() {
        const token = this.peek();

        if (token.type === 'KEYWORD' && (token.value === '如果' || token.value === '若')) {
            return this.parseIfStatement();
        }

        if (token.type === 'KEYWORD' && token.value === '重复') {
            return this.parseRepeatStatement();
        }

        if (token.type === 'KEYWORD' && token.value === '循环') {
            return this.parseLoopStatement();
        }

        if (token.type === 'KEYWORD' && (token.value === '返回' || token.value === '结果是')) {
            return this.parseReturnStatement();
        }

        if (token.type === 'KEYWORD' && token.value === '说') {
            return this.parsePrintStatement();
        }

        if (token.type === 'KEYWORD' && token.value === '结束') {
            return this.parseBreakStatement();
        }

        if (token.type === 'KEYWORD' && token.value === '类') {
            return this.parseClassStatement();
        }

        if (token.type === 'IDENTIFIER') {
            const next = this.peekNext();
            if (next && next.value === '：') {
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
        this.expect('PAREN', '（', '期望左括号');
        
        const condition = this.parseExpression();
        
        this.expect('PAREN', '）', '期望右括号');
        this.expect('PUNCTUATION', '：', '期望冒号');
        
        const consequent = this.parseBlock(ifToken.column);
        
        let alternate = null;
        if (this.match('KEYWORD', '否则')) {
            this.match('PUNCTUATION', '，');
            if (this.match('KEYWORD', '如果')) {
                this.expect('PAREN', '（', '期望左括号');
                const elseIfCondition = this.parseExpression();
                this.expect('PAREN', '）', '期望右括号');
                this.expect('PUNCTUATION', '：', '期望冒号');
                const elseIfConsequent = this.parseBlock(ifToken.column);
                alternate = {
                    type: 'IfStatement',
                    condition: elseIfCondition,
                    consequent: elseIfConsequent,
                    alternate: this.parseElseBlock(ifToken.column)
                };
            } else {
                this.match('PUNCTUATION', '，');
                this.expect('PUNCTUATION', '：', '期望冒号');
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
        if (this.match('KEYWORD', '否则')) {
            this.match('PUNCTUATION', '，');
            if (this.match('KEYWORD', '如果')) {
                this.expect('PAREN', '（', '期望左括号');
                const condition = this.parseExpression();
                this.expect('PAREN', '）', '期望右括号');
                this.expect('PUNCTUATION', '：', '期望冒号');
                const consequent = this.parseBlock(parentIndent);
                return {
                    type: 'IfStatement',
                    condition: condition,
                    consequent: consequent,
                    alternate: this.parseElseBlock(parentIndent)
                };
            } else {
                this.expect('PUNCTUATION', '：', '期望冒号');
                return this.parseBlock(parentIndent);
            }
        }
        return null;
    }

    parseRepeatStatement() {
        const repeatToken = this.advance();
        this.expect('PAREN', '（', '期望左括号');
        
        let init = null;
        if (this.match('KEYWORD', '开始于')) {
            const id = this.expect('IDENTIFIER', null, '期望变量名');
            this.expect('OPERATOR', '=', '期望等号');
            const value = this.parseSimpleValue();
            init = { type: 'VariableDeclaration', name: id.value, value: value };
        }
        
        this.match('PUNCTUATION', '，');
        this.expect('KEYWORD', '到', '期望“到”');
        
        const condition = this.parseSimpleCondition();
        this.expect('KEYWORD', '为止', '期望“为止”');
        
        let update = null;
        if (this.match('PUNCTUATION', '，')) {
            this.expect('KEYWORD', '每次', '期望“每次”');
            const id = this.expect('IDENTIFIER', null, '期望变量名');
            this.expect('OPERATOR', '+', '期望加号');
            this.expect('OPERATOR', '+', '期望加号');
            update = { type: 'UpdateExpression', operator: '++', argument: { type: 'Identifier', name: id.value } };
        }
        
        this.expect('PAREN', '）', '期望右括号');
        this.expect('PUNCTUATION', '：', '期望冒号');
        
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
        
        if (this.match('KEYWORD', '小于') || this.match('KEYWORD', '大于') ||
            this.match('KEYWORD', '小于等于') || this.match('KEYWORD', '大于等于') ||
            this.match('KEYWORD', '不大于') || this.match('KEYWORD', '不小于')) {
            let operator;
            switch (this.previous().value) {
                case '小于': operator = '<'; break;
                case '大于': operator = '>'; break;
                case '小于等于': operator = '<='; break;
                case '大于等于': operator = '>='; break;
                case '不大于': operator = '<='; break;
                case '不小于': operator = '>='; break;
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
        
        this.expect('KEYWORD', '次', '期望“次”');
        this.expect('PAREN', '（', '期望左括号');
        
        const paramToken = this.expect('IDENTIFIER', null, '期望参数名');
        
        this.expect('PAREN', '）', '期望右括号');
        this.expect('PUNCTUATION', '：', '期望冒号');
        
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
        
        this.expect('PUNCTUATION', '。', '期望句号');
        
        return {
            type: 'ReturnStatement',
            argument: argument
        };
    }

    parsePrintStatement() {
        this.advance();
        
        const argument = this.parseExpression();
        
        this.expect('PUNCTUATION', '。', '期望句号');
        
        return {
            type: 'PrintStatement',
            argument: argument
        };
    }

    parseBreakStatement() {
        this.advance();
        
        this.expect('PUNCTUATION', '。', '期望句号');
        
        return {
            type: 'BreakStatement'
        };
    }

    parseClassStatement() {
        const classToken = this.advance();
        
        const name = this.expect('IDENTIFIER', null, '期望类名');
        
        this.expect('PUNCTUATION', '：', '期望冒号');
        
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
            if (token.type === 'KEYWORD' && (token.value === '否则' || token.value === '结束' || token.value === '以上')) {
                break;
            }
            
            if (parentIndent !== undefined && token.column <= parentIndent) {
                break;
            }
            
            const next = this.peekNext();
            if (next && next.value === '：') {
                const id = this.advance();
                this.advance();
                
                if (this.match('KEYWORD', '输入')) {
                    const params = [];
                    const hasParen = this.match('PAREN', '（');
                    
                    while (true) {
                        const param = this.expect('STRING', null, '期望参数名');
                        params.push({ type: 'Identifier', name: param.value });
                        if (this.match('PUNCTUATION', '、')) {
                            continue;
                        }
                        break;
                    }
                    
                    if (hasParen) {
                        this.expect('PAREN', '）', '期望右括号');
                    }
                    
                    this.expect('PUNCTUATION', '；', '期望分号');
                    
                    const funcBody = this.parseClassBody(id.column);
                    
                    body.push({
                        type: 'FunctionDeclaration',
                        name: id.value,
                        params: params,
                        body: funcBody
                    });
                } else {
                    const value = this.parseExpression();
                    this.expect('PUNCTUATION', '。', '期望句号');
                    
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
        
        this.expect('PUNCTUATION', '：', '期望冒号');
        
        if (this.match('KEYWORD', '输入')) {
            const params = [];
            const hasParen = this.match('PAREN', '（');
            
            while (true) {
                const param = this.expect('STRING', null, '期望参数名');
                params.push({ type: 'Identifier', name: param.value });
                if (this.match('PUNCTUATION', '、')) {
                    continue;
                }
                break;
            }
            
            if (hasParen) {
                this.expect('PAREN', '）', '期望右括号');
            }
            
            this.expect('PUNCTUATION', '；', '期望分号');
            
            const body = this.parseBlock(id.column);
            
            return {
                type: 'FunctionDeclaration',
                name: id.value,
                params: params,
                body: body
            };
        }
        
        // 检查是否是类/对象定义：后面跟着嵌套的定义
        const next = this.peek();
        const nextNext = this.peekNext();
        if (next.type === 'IDENTIFIER' && nextNext.value === '：') {
            const body = this.parseClassBody(id.column);
            return {
                type: 'ClassDeclaration',
                name: id.value,
                body: body
            };
        }
        
        const value = this.parseExpression();
        
        this.expect('PUNCTUATION', '。', '期望句号');
        
        return {
            type: 'AssignmentExpression',
            left: { type: 'Identifier', name: id.value },
            right: value
        };
    }

    parseExpressionStatement() {
        const expression = this.parseExpression();
        
        this.expect('PUNCTUATION', '。', '期望句号');
        
        return {
            type: 'ExpressionStatement',
            expression: expression
        };
    }

    parseBlock(parentIndent) {
        const body = [];
        
        while (!this.isAtEnd()) {
            const token = this.peek();
            if (token.type === 'KEYWORD' && (token.value === '否则' || token.value === '结束' || token.value === '以上')) {
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
        
        if (this.match('KEYWORD', '以上')) {
            this.expect('PUNCTUATION', '。', '期望句号');
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
        
        while (this.match('KEYWORD', '或者') || this.match('PUNCTUATION', '，')) {
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
        
        while (this.match('KEYWORD', '并且') || this.match('PUNCTUATION', '、')) {
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
        
        while (this.match('KEYWORD', '是') || this.match('KEYWORD', '不是') || 
               this.match('KEYWORD', '等于') || this.match('KEYWORD', '等价于')) {
            const operator = this.previous().value === '是' || this.previous().value === '等于' || this.previous().value === '等价于' ? '===' : '!==';
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
        
        while (this.match('KEYWORD', '小于') || this.match('KEYWORD', '大于') ||
               this.match('KEYWORD', '小于等于') || this.match('KEYWORD', '大于等于') ||
               this.match('KEYWORD', '不大于') || this.match('KEYWORD', '不小于')) {
            let operator;
            switch (this.previous().value) {
                case '小于': operator = '<'; break;
                case '大于': operator = '>'; break;
                case '小于等于': operator = '<='; break;
                case '大于等于': operator = '>='; break;
                case '不大于': operator = '<='; break;
                case '不小于': operator = '>='; break;
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
        if (this.match('OPERATOR', '!') || this.match('KEYWORD', '非')) {
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
        
        while (this.match('PAREN', '（')) {
            const args = [];
            if (!this.match('PAREN', '）')) {
                args.push(this.parseArgumentExpression());
                while (this.match('PUNCTUATION', '，')) {
                    args.push(this.parseArgumentExpression());
                }
                this.expect('PAREN', '）', '期望右括号');
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
        
        while (this.match('KEYWORD', '之') || this.match('KEYWORD', '的')) {
            const property = this.expect('IDENTIFIER', null, '期望属性名');
            object = {
                type: 'MemberExpression',
                object: object,
                property: { type: 'Identifier', name: property.value },
                computed: false
            };
        }
        
        while (this.match('KEYWORD', '第')) {
            const index = this.parseExpression();
            this.expect('KEYWORD', '项', '期望“项”');
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
        
        if (this.match('PAREN', '（')) {
            const expression = this.parseExpression();
            this.expect('PAREN', '）', '期望右括号');
            return expression;
        }
        
        throw new Error(`Unexpected token: ${this.peek().value} 在第 ${this.peek().line} 行，第 ${this.peek().column} 列`);
    }
}

module.exports = Parser;
