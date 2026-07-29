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
        
        const method = `visit${node.type}`;
        if (typeof this[method] === 'function') {
            return this[method](node);
        }
        
        throw new Error(`Unknown node type: ${node.type}`);
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

module.exports = CodeGenerator;
