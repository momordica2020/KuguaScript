const Lexer = require('./lexer');
const Parser = require('./parser');
const CodeGenerator = require('./codeGenerator');

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

    compileFile(filePath) {
        const fs = require('fs');
        const source = fs.readFileSync(filePath, 'utf-8');
        return this.compile(source);
    }

    run(source) {
        const jsCode = this.compile(source);
        
        const context = {
            console: {
                log: function(...args) {
                    console.log(...args);
                }
            }
        };
        
        const result = new Function(...Object.keys(context), jsCode)(...Object.values(context));
        return result;
    }

    runFile(filePath) {
        const fs = require('fs');
        const source = fs.readFileSync(filePath, 'utf-8');
        return this.run(source);
    }
}

module.exports = Compiler;
