/**
 * 苦瓜脚本语言 — 代码生成器
 * 将AST转换为JavaScript代码
 * 使用 generate(node) 返回字符串的方式替代全局 output 拼接
 */
const C = require('./constants');
const RUNTIME_REGISTRY = require('./runtime/registry');

// 内置全局标识符（来自运行时注册表）：KS代码运行时由宿主环境提供，
// 代码生成器禁止在顶部 var 声明它们，否则会因变量提升被赋值为 undefined。
// 新增内置函数时只需在 src/runtime/registry.js 登记名称即可。
const SANDBOX_GLOBALS = new Set(RUNTIME_REGISTRY.BUILTIN_NAMES);

// 数组/对象成员别名 → JS 属性/方法
const MEMBER_ALIAS = {
    '长度': 'length',
    '追加': 'push',
    '移除尾部': 'pop',
    '移除头部': 'shift',
    '插入头部': 'unshift'
};

class CodeGenerator {
    constructor(options) {
        this.options = options || {};
    }

    generate(node, options) {
        // 每次调用的选项独立生效，不污染构造时的默认选项
        this._callOptions = options ? Object.assign({}, this.options, options) : this.options;
        this.topLevelAwait = false;
        return this.visit(node);
    }

    /**
     * 判断 AST 子树中是否包含 等待（await）
     * stopAtFunctions 为 true 时，函数/类内部由它们各自决定是否 async，不向上传播
     */
    containsAwait(node, stopAtFunctions) {
        if (!node) return false;
        if (node.type === C.NodeType.AwaitExpression) return true;
        if (stopAtFunctions
            && (node.type === C.NodeType.FunctionDeclaration || node.type === C.NodeType.ClassDeclaration)) {
            return false;
        }
        for (const key of Object.keys(node)) {
            const val = node[key];
            if (Array.isArray(val)) {
                for (const item of val) {
                    if (this.containsAwait(item, stopAtFunctions)) return true;
                }
            } else if (val && typeof val === 'object' && val.type) {
                if (this.containsAwait(val, stopAtFunctions)) return true;
            }
        }
        return false;
    }

    /**
     * 生成类的对象字面量（{ 属性: 值, 方法: function…, 嵌套类: {...} }）
     */
    classObjectLiteral(node) {
        const body = node.body.body || node.body;
        const members = body.map(stmt => {
            if (stmt.type === C.NodeType.FunctionDeclaration) {
                const params = stmt.params.map(p => {
                    return p.default ? `${p.name} = ${this.visit(p.default)}` : p.name;
                }).join(', ');
                const isAsync = this.containsAwait(stmt.body, true);
                return `${isAsync ? 'async ' : ''}${stmt.name}: function(${params}) ${this.visit(stmt.body)}`;
            } else if (stmt.type === C.NodeType.ClassProperty) {
                return `${stmt.name}: ${this.visit(stmt.value)}`;
            } else if (stmt.type === C.NodeType.AssignmentExpression) {
                return `${this.visit(stmt.left)}: ${this.visit(stmt.right)}`;
            } else if (stmt.type === C.NodeType.ClassDeclaration) {
                return `${stmt.name}: ${this.classObjectLiteral(stmt)}`;
            }
            return null;
        }).filter(m => m !== null);
        return `{\n    ${members.join(',\n    ')}\n}`;
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
                if (node.left.type === C.NodeType.Identifier
                    && !SANDBOX_GLOBALS.has(node.left.name)) {
                    names.add(node.left.name);
                }
                this._collectVars(node.right, names);
                // 成员赋值的object部分可能嵌套标识符（不需要额外收集）
                if (node.left.type === C.NodeType.MemberExpression) {
                    this._collectVars(node.left, names);
                }
                break;
            case C.NodeType.VariableDeclaration:
                if (node.name && !SANDBOX_GLOBALS.has(node.name)) names.add(node.name);
                if (node.value) this._collectVars(node.value, names);
                break;
            case C.NodeType.FunctionDeclaration:
                if (node.name && !SANDBOX_GLOBALS.has(node.name)) names.add(node.name);
                for (const p of node.params || []) {
                    if (p.name && !SANDBOX_GLOBALS.has(p.name)) names.add(p.name);
                }
                this._collectVars(node.body, names);
                break;
            case C.NodeType.ClassDeclaration:
                if (node.name && !SANDBOX_GLOBALS.has(node.name)) names.add(node.name);
                this._collectVars(node.body, names);
                break;
            case C.NodeType.ClassProperty:
                if (node.name && !SANDBOX_GLOBALS.has(node.name)) names.add(node.name);
                if (node.value) this._collectVars(node.value, names);
                break;
            case C.NodeType.UpdateExpression:
                // i++ 中的i
                if (node.argument && node.argument.name
                    && !SANDBOX_GLOBALS.has(node.argument.name)) {
                    names.add(node.argument.name);
                }
                break;
            case C.NodeType.PipelineStatement:
                // 流水句的隐式变量"它"
                names.add('它');
                for (const step of node.steps || []) {
                    this._collectVars(step, names);
                }
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
                // 程序根节点 — 默认(auto)注入输入输出模块和工具函数（兼容旧用法）；
                // runtime: 'none' 时不注入，由宿主环境提供内置（runtime/browser.js、runtime/node.js）
                // 同时在顶部预声明所有全局标识符赋值的变量，避免函数内部赋值产生var遮蔽导致NaN
                [C.NodeType.Program]: (node) => {
                    // 1. 收集所有赋值左侧的Identifier变量名（不重复，跳过成员赋值）
                    const varNames = new Set();
                    this._collectVars(node, varNames);

                    // 顶层包含 等待 时整个程序以 async IIFE 运行
                    const hasTopAwait = node.body.some(stmt => this.containsAwait(stmt, true));
                    this.topLevelAwait = hasTopAwait;

                    let code = hasTopAwait ? '(async function(console) {\n' : '(function(console) {\n';

                    // 2. 顶部统一预声明所有用户变量
                    if (varNames.size > 0) {
                        code += '    var ' + [...varNames].join(', ') + ';\n';
                    }

                    if (!this._callOptions || this._callOptions.runtime !== 'none') {
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
                    }
                    for (const stmt of node.body) {
                        code += '    ' + this.visit(stmt) + '\n';
                    }
                    code += '\n})(console);';
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

                // 遍历 名单 中 的 每个 元素
                [C.NodeType.ForEachStatement]: (node) => {
                    return `for (var ${node.name} of ${this.visit(node.collection)}) ${this.visit(node.body)}`;
                },

                // 当…时（while）
                [C.NodeType.WhileStatement]: (node) => {
                    return `while (${this.visit(node.condition)}) ${this.visit(node.body)}`;
                },

                // 重复 直到…为止（do-while：先执行一次，条件满足后停止）
                [C.NodeType.DoWhileStatement]: (node) => {
                    return `do ${this.visit(node.body)} while (!(${this.visit(node.condition)}));`;
                },

                // 先…再…然后…最后…：每一步结果存入"它"
                [C.NodeType.PipelineStatement]: (node) => {
                    return node.steps.map(step => `它 = ${this.visit(step)};`).join('\n');
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

                // 尝试…如果报错…（try/catch）
                [C.NodeType.TryStatement]: (node) => {
                    let code = `try ${this.visit(node.body)}`;
                    if (node.catchBody) {
                        const param = node.errorName || '__kugua_error__';
                        code += `\ncatch (${param}) ${this.visit(node.catchBody)}`;
                    }
                    return code;
                },

                // 引入：引入 “node:path” 作为 路径。
                [C.NodeType.ImportDeclaration]: (node) => {
                    const src = JSON.stringify(node.moduleName);
                    if (node.name) {
                        return `var ${node.name} = require(${src});`;
                    }
                    return `require(${src});`;
                },

                // 导出：导出 名字。／导出 名字 作为 别名。
                [C.NodeType.ExportDeclaration]: (node) => {
                    const key = JSON.stringify(node.alias || node.name);
                    return `if (typeof module !== "undefined") module.exports[${key}] = ${node.name};`;
                },

                // 函数声明
                [C.NodeType.FunctionDeclaration]: (node) => {
                    const params = node.params.map(p => {
                        return p.default ? `${p.name} = ${this.visit(p.default)}` : p.name;
                    }).join(', ');
                    const isAsync = this.containsAwait(node.body, true);
                    return `${isAsync ? 'async ' : ''}function ${node.name}(${params}) ${this.visit(node.body)}`;
                },

                // 类属性
                [C.NodeType.ClassProperty]: (node) => {
                    return `var ${node.name} = ${this.visit(node.value)};`;
                },

                // 类声明 — 名字已在Program顶部预声明，这里直接赋值
                [C.NodeType.ClassDeclaration]: (node) => {
                    return `${node.name} = ${this.classObjectLiteral(node)};`;
                },

                // 表达式语句
                [C.NodeType.ExpressionStatement]: (node) => {
                    return `${this.visit(node.expression)};`;
                },

                // 赋值表达式 — 统一使用 "左边 = 值" 形式（不再加var）
                // 所有用户变量名在Program顶部统一预声明（避免函数内赋值产生var遮蔽）
                [C.NodeType.AssignmentExpression]: (node) => {
                    return `${this.visit(node.left)} ${node.operator || '='} ${this.visit(node.right)}`;
                },

                // 逻辑表达式
                [C.NodeType.LogicalExpression]: (node) => {
                    return `(${this.visit(node.left)} ${node.operator} ${this.visit(node.right)})`;
                },

                // 二元表达式
                [C.NodeType.BinaryExpression]: (node) => {
                    // X 包含 Y → X.includes(Y)
                    if (node.operator === '包含') {
                        return `${this.visit(node.left)}.includes(${this.visit(node.right)})`;
                    }
                    return `(${this.visit(node.left)} ${node.operator} ${this.visit(node.right)})`;
                },

                // 一元表达式
                [C.NodeType.UnaryExpression]: (node) => {
                    return `${node.operator}${this.visit(node.argument)}`;
                },

                // 等待（await）
                [C.NodeType.AwaitExpression]: (node) => {
                    return `await ${this.visit(node.argument)}`;
                },

                // 函数调用 — 使用 generate 返回值的方式，不再 save/restore output
                [C.NodeType.CallExpression]: (node) => {
                    const args = node.arguments.map(arg => this.visit(arg));
                    return `${this.visit(node.callee)}(${args.join(', ')})`;
                },

                // 成员访问
                [C.NodeType.MemberExpression]: (node) => {
                    if (node.computed) {
                        // 第X项 索引访问为中文1基语义（第1项→索引0）
                        return `${this.visit(node.object)}[(${this.visit(node.property)} - 1)]`;
                    }
                    let prop = this.visit(node.property);
                    // 中文方法/属性别名 → JS 原生（如 蛇身之长度→.length、蛇身之追加→.push）
                    // 内置命名空间（路径/列表/文件 等）除外：它们的中文方法原样访问，避免
                    // 列表之长度 被误译成 列表.length
                    const isNamespace = node.object.type === C.NodeType.Identifier
                        && SANDBOX_GLOBALS.has(node.object.name);
                    if (!isNamespace && node.property.type === C.NodeType.Identifier
                        && MEMBER_ALIAS[node.property.name]) {
                        prop = MEMBER_ALIAS[node.property.name];
                    }
                    return `${this.visit(node.object)}.${prop}`;
                },

                // 数组字面量：【元素1、元素2、…】
                [C.NodeType.ArrayExpression]: (node) => {
                    const elems = node.elements.map(el => this.visit(el));
                    return `[${elems.join(', ')}]`;
                },

                // 标识符
                [C.NodeType.Identifier]: (node) => {
                    // 类内自身：此/本 → this
                    if (node.name === '此' || node.name === '本') return 'this';
                    return node.name;
                },

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
