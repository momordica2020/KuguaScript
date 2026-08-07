/**
 * 苦瓜脚本语言 — 全局常量定义
 * 所有语言关键字、运算符、令牌类型、AST节点类型的唯一数据源
 * 添加新语言特性时，只需在此文件中注册即可
 */

// ==================== 令牌类型 ====================
const TokenType = {
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    NULL: 'NULL',
    // 无实义语缀（如 正确的 的、空的 的）：独立成类，便于高亮灰化与解析跳过
    PARTICLE: 'PARTICLE',
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'IDENTIFIER',
    OPERATOR: 'OPERATOR',
    PUNCTUATION: 'PUNCTUATION',
    PAREN: 'PAREN',
    EOF: 'EOF'
};

// ==================== AST 节点类型 ====================
const NodeType = {
    Program: 'Program',
    BlockStatement: 'BlockStatement',
    IfStatement: 'IfStatement',
    ForStatement: 'ForStatement',
    ForOfStatement: 'ForOfStatement',
    ReturnStatement: 'ReturnStatement',
    PrintStatement: 'PrintStatement',
    BreakStatement: 'BreakStatement',
    TryStatement: 'TryStatement',
    ImportDeclaration: 'ImportDeclaration',
    ExportDeclaration: 'ExportDeclaration',
    AwaitExpression: 'AwaitExpression',
    WhileStatement: 'WhileStatement',
    DoWhileStatement: 'DoWhileStatement',
    ForEachStatement: 'ForEachStatement',
    PipelineStatement: 'PipelineStatement',
    ArrayExpression: 'ArrayExpression',
    FunctionDeclaration: 'FunctionDeclaration',
    ClassDeclaration: 'ClassDeclaration',
    ClassProperty: 'ClassProperty',
    ExpressionStatement: 'ExpressionStatement',
    AssignmentExpression: 'AssignmentExpression',
    LogicalExpression: 'LogicalExpression',
    BinaryExpression: 'BinaryExpression',
    UnaryExpression: 'UnaryExpression',
    CallExpression: 'CallExpression',
    MemberExpression: 'MemberExpression',
    Identifier: 'Identifier',
    Literal: 'Literal',
    VariableDeclaration: 'VariableDeclaration',
    UpdateExpression: 'UpdateExpression'
};

// ==================== 关键字 ====================
// 控制流关键字
const ControlKeywords = [
    '如果', '否则', '重复', '循环', '结束', '次', '以上', '情况',
    '尝试', '如果报错', '假如报错', '要是报错',
    '当', '直到', '遍历'
];

// 循环控制关键字
const LoopKeywords = [
    '开始于', '到', '为止', '每次'
];

// 函数相关关键字
const FunctionKeywords = [
    '输入', '返回', '结果是', '说'
];

// 类与对象关键字
const ObjectKeywords = [
    '类', '之', '的'
];

// 模块互操作关键字（引入/导出）
const ModuleKeywords = [
    '引入', '导出', '作为', '称作'
];

// 新句式关键字：把字句/设字句/等待/成员判断/循环
const SentenceKeywords = [
    '等待', '设', '设为', '减少', '每个', '此', '本', '不在',
    '先', '再', '然后', '最后', '如下', '缺省', '每当'
];

// 成员访问关键字
const AccessKeywords = [
    '第', '项'
];

// 比较运算关键字 → JS运算符
const ComparisonOperators = {
    '小于': '<',
    '大于': '>',
    '小于等于': '<=',
    '大于等于': '>=',
    '不大于': '<=',
    '不小于': '>='
};

// 相等运算关键字 → JS运算符
const EqualityOperators = {
    '是': '===',
    '等于': '===',
    '等价于': '===',
    '不是': '!==',
    '不等于': '!=='
};

// 逻辑运算关键字
const LogicalAndKeywords = ['并且','而且','且','以及'];      // &&
const LogicalOrKeywords = ['或者','或是','或'];        // ||
const LogicalNotKeywords = ['并非','非','不是'];         // !

// 包含运算：X 包含 Y → X.includes(Y)
const ContainsOperators = {
    '包含': '包含'
};

// 运算符类关键字（比较、相等、逻辑）— 始终完整识别为关键字，不作为标识符的一部分
// 这样 "i小于3" 会正确拆分为 "i" + "小于" + "3"，"a是b" 会拆分为 "a" + "是" + "b"
const OperatorKeywords = [
    ...Object.keys(ComparisonOperators),
    ...Object.keys(EqualityOperators),
    ...LogicalAndKeywords,
    ...LogicalOrKeywords,
    ...LogicalNotKeywords,
    ...Object.keys(ContainsOperators)
];

// 布尔值关键字 → JS布尔值
const BooleanKeywords = {
    // 带"的"的形式（正确的/真的/对的/错误的/错的/不对的）由词法分析器切分为
    // 基础词 + 无实义语缀"的"，不再作为独立关键词登记
    '正确': true, '真': true, '对': true,
    '错误': false, '错': false, '不对': false
};

// 空值关键字
const NullKeywords = ['空', '没了'];

// 中文数字（用于 第一项/第二十三项 索引）
const ChineseNumeralChars = '零一二三四五六七八九十百千万两';

// 条件语句别名（如果/若）
const IfAliases = ['如果', '若'];
// 返回语句别名（返回/结果是）
const ReturnAliases = ['返回', '结果是'];

// 所有关键字的合集（供词法分析器最长前缀匹配使用）
const AllKeywords = [
    ...ControlKeywords,
    ...LoopKeywords,
    ...FunctionKeywords,
    ...ObjectKeywords,
    ...ModuleKeywords,
    ...SentenceKeywords,
    ...AccessKeywords,
    ...Object.keys(ComparisonOperators),
    ...Object.keys(EqualityOperators),
    ...LogicalAndKeywords,
    ...LogicalOrKeywords,
    ...LogicalNotKeywords,
    ...Object.keys(ContainsOperators),
    // 保留关键字（尚未实现但已预留）
    '定义', '个', '长度', '功能', '方法', '全新', '就', '一直', '执行',
    '增加', '追加', '去除', '选择', '为', '则', '和', '与', '用', '以',
    '可', '使', '让', '被', '把', '将', '给', '向', '从', '在', '上', '下',
    '左', '右', '前', '后', '中', '内', '外', '间', '时', '的话', '而已',
    '而已矣', '罢了', '罢了罢了'
];

// 保留关键字（未实际在语法中使用，仅预留）
// 词法分析器在识别这些关键字时会检查后继字符，
// 若后跟标识符字符则不识别为关键字，避免阻断标识符识别
const ReservedKeywords = [
    '类', '项', '定义', '个', '长度', '功能', '方法', '全新', '就', '一直', '执行',
    '增加', '追加', '去除', '选择', '为', '则', '和', '与', '用', '以',
    '可', '使', '让', '被', '把', '将', '给', '向', '从', '在', '上', '下',
    '左', '右', '前', '后', '中', '内', '外', '间', '时', '的话', '而已',
    '而已矣', '罢了', '罢了罢了',
    '次', '引入', '导出',
    // 新句式关键词：后跟标识符字符时并入标识符（设X、当前、此值、减少量）
    '设', '减少', '此', '本', '当',
    // 流水句/函数头/默认参数/每当 关键字
    '先', '再', '然后', '最后', '如下', '缺省', '每当'
];

// ==================== 运算符 ====================
const Operators = ['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~'];

// ==================== 标点符号 ====================
const Punctuations = ['。', '，', '、', '：', '；', '？', '—', '！'];
const LeftParen = '（';
const RightParen = '）';
// 数组字面量方括号（【】）：【1、2、3】，空数组【】；字符串统一使用“”
const LeftArrayBracket = '【';
const RightArrayBracket = '】';

// ==================== 字符分类辅助 ====================
function isWhitespace(char) {
    return [' ', '\t', '\n', '\r'].includes(char);
}

function isDigit(char) {
    return /[0-9]/.test(char);
}

function isIdentifierStart(char) {
    return /[\u4e00-\u9fa5a-zA-Z_]/.test(char);
}

function isIdentifierPart(char) {
    return /[\u4e00-\u9fa5a-zA-Z0-9_]/.test(char);
}

function isChineseNumeralChar(char) {
    return !!char && ChineseNumeralChars.includes(char);
}

/**
 * 中文数字 → 阿拉伯数字（支持 二十三、一百二十三、一千零五、十万、两 等常见写法）
 */
function chineseToNumber(text) {
    const digits = { '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
    const units = { '十': 10, '百': 100, '千': 1000, '万': 10000 };
    let result = 0;
    let section = 0;
    let number = 0;
    for (const ch of text) {
        if (digits[ch] !== undefined) {
            number = digits[ch];
        } else {
            const unit = units[ch];
            if (unit >= 10000) {
                section = (section + number) * unit;
                result += section;
                section = 0;
                number = 0;
            } else {
                // 十/百/千 前无数字时按 1 计（十三 → 10+3、十万 → 100000）
                section += (number === 0 ? 1 : number) * unit;
                number = 0;
            }
        }
    }
    return result + section + number;
}

// ==================== 导出 ====================
module.exports = {
    TokenType,
    NodeType,
    ControlKeywords,
    LoopKeywords,
    FunctionKeywords,
    ObjectKeywords,
    ModuleKeywords,
    SentenceKeywords,
    AccessKeywords,
    ComparisonOperators,
    EqualityOperators,
    LogicalAndKeywords,
    LogicalOrKeywords,
    LogicalNotKeywords,
    ContainsOperators,
    OperatorKeywords,
    BooleanKeywords,
    NullKeywords,
    ChineseNumeralChars,
    IfAliases,
    ReturnAliases,
    AllKeywords,
    ReservedKeywords,
    Operators,
    Punctuations,
    LeftParen,
    RightParen,
    LeftArrayBracket,
    RightArrayBracket,
    isWhitespace,
    isDigit,
    isIdentifierStart,
    isIdentifierPart,
    isChineseNumeralChar,
    chineseToNumber
};
