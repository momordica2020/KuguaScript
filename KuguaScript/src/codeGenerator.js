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

    /**
     * 递归收集所有赋值左边的Identifier变量名（用于顶部统一var声明）
     * 只收集 AssignmentExpression 中 left.type === Identifier 的名字
     * 以及 VariableDeclaration（循环初始化）的名字
     * 以及 FunctionDeclaration 的参数名、函数名、类属性名
     */
    _collectVars(node, names) {
        if (!node) return;

        switch (node.type) {
            case C.NodeType.AssignmentExpression:
                if (node.left.type === C.NodeType.Identifier) {
                    names.add(node.left.name);
                }
                this._collectVars(node.right, names);
                // 成员赋值的object部分可能嵌套标识符（不需要额外收集）
                if (node.left.type === C.NodeType.MemberExpression) {
                    this._collectVars(node.left, names);
                }
                break;
            case C.NodeType.VariableDeclaration:
                if (node.name) names.add(node.name);
                if (node.value) this._collectVars(node.value, names);
                break;
            case C.NodeType.FunctionDeclaration:
                if (node.name) names.add(node.name);
                for (const p of node.params || []) {
                    if (p.name) names.add(p.name);
                }
                this._collectVars(node.body, names);
                break;
            case C.NodeType.ClassDeclaration:
                if (node.name) names.add(node.name);
                this._collectVars(node.body, names);
                break;
            case C.NodeType.ClassProperty:
                if (node.name) names.add(node.name);
                if (node.value) this._collectVars(node.value, names);
                break;
            case C.NodeType.UpdateExpression:
                // i++ 中的i
                if (node.argument && node.argument.name) names.add(node.argument.name);
                break;
            default:
                // 遍历所有对象属性
                for (const key of Object.keys(node)) {
                    const val = node[key];
                    if (Array.isArray(val)) {
                        for (const item of val) this._collectVars(item, names);
                    } else if (val && typeof val === 'object' && val.type) {
                        this._collectVars(val, names);
                    }
                }
        }
    }

    // ==================== 访问器注册表 ====================
    // 添加新节点类型的代码生成规则时，在此注册即可

    get visitors() {
        if (!this._visitors) {
            this._visitors = {
                // 程序根节点 — 注入输入输出模块和工具函数（浏览器与Node兼容）
                // 同时在顶部预声明所有全局标识符赋值的变量，避免函数内部赋值产生var遮蔽导致NaN
                [C.NodeType.Program]: (node) => {
                    // 1. 收集所有赋值左侧的Identifier变量名（不重复，跳过成员赋值）
                    const varNames = new Set();
                    this._collectVars(node, varNames);

                    let code = '(function(console) {\n';

                    // 2. 顶部统一预声明所有用户变量
                    if (varNames.size > 0) {
                        code += '    var ' + [...varNames].join(', ') + ';\n';
                    }

                    code += '    // ===== 输入输出模块 =====\n';
                    code += '    var 弹窗 = typeof alert !== "undefined" ? alert : function(msg) { console.log(msg); };\n';
                    code += '    var 询问 = typeof prompt !== "undefined" ? prompt : function(msg) { console.log("[输入]" + msg); return "1"; };\n';
                    code += '    var 确认 = typeof confirm !== "undefined" ? confirm : function(msg) { console.log("[确认]" + msg); return true; };\n';
                    code += '    var 写入 = typeof document !== "undefined" ? function(msg) { document.write(msg); } : function(msg) { console.log(msg); };\n';
                    code += '    // ===== 工具函数模块 =====\n';
                    code += '    var 随机数字 = Math.random;\n';
                    code += '    var 向下取整 = Math.floor;\n';
                    code += '    var 向上取整 = Math.ceil;\n';
                    code += '    var 绝对值 = Math.abs;\n';
                    code += '    var 转整数 = parseInt;\n';
                    code += '    var 转数字 = parseFloat;\n';
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

                // for 循环（重复）— 变量已在Program顶部预声明，这里直接赋值
                [C.NodeType.ForStatement]: (node) => {
                    let init = '';
                    if (node.init) {
                        init = `${node.init.name} = ${this.visit(node.init.value)}`;
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
                    return `for (${varName} = 0; ${varName} < ${this.visit(node.right)}; ${varName}++) ${this.visit(node.body)}`;
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

                // 类声明 — 名字已在Program顶部预声明，这里直接赋值
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

                    return `${node.name} = {\n    ${members.join(',\n    ')}\n};`;
                },

                // 表达式语句
                [C.NodeType.ExpressionStatement]: (node) => {
                    return `${this.visit(node.expression)};`;
                },

                // 赋值表达式 — 统一使用 "左边 = 值" 形式（不再加var）
                // 所有用户变量名在Program顶部统一预声明（避免函数内赋值产生var遮蔽）
                [C.NodeType.AssignmentExpression]: (node) => {
                    return `${this.visit(node.left)} = ${this.visit(node.right)}`;
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
