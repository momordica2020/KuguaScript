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

            if (current === '“') {
                this.tokens.push(this.readString());
                continue;
            }

            if (current === '【') {
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

            if (current === '。' || current === '，' || current === '、' || current === '：' || current === '；' || current === '？' || current === '《' || current === '》' || current === '—' || current === '！') {
                this.tokens.push({
                    type: 'PUNCTUATION',
                    value: current,
                    line: this.line,
                    column: this.column
                });
                this.advance();
                continue;
            }

            if (current === '（' || current === '）') {
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

            throw new Error(`未知字符: ${current} 在第 ${this.line} 行，第 ${this.column} 列`);
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
                if (next === '“') {
                    value += '“';
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

            if (current === '”') {
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
            
            if (current === '】') {
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
                // 先检查布尔值和空值关键字
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

module.exports = Lexer;
