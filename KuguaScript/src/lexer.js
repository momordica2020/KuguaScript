/**
 * 苦瓜脚本语言 — 词法分析器
 * 将源代码转换为令牌流，支持中文关键词、全角标点
 */
const C = require('./constants');
const { createToken } = require('./ast');

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
            if (current === C.LeftParen || current === C.RightParen) {
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
        return createToken(C.TokenType.KEYWORD, matchedKeyword, startLine, startColumn);
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

module.exports = Lexer;
