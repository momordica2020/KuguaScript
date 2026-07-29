/**
 * 苦瓜脚本语言 — 代码生成器
 * 将AST转换为JavaScript代码
 * 使用 generate(node) 返回字符串的方式替代全局 output 拼接
 */
const C = require('./constants');

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

module.exports = CodeGenerator;
