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
    '如果', '否则', '重复', '循环', '结束', '次', '以上'
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
    '不是': '!=='
};

// 逻辑运算关键字
const LogicalAndKeywords = ['并且'];      // &&
const LogicalOrKeywords = ['或者'];        // ||
const LogicalNotKeywords = ['非'];         // !

// 运算符类关键字（比较、相等、逻辑）— 始终完整识别为关键字，不作为标识符的一部分
// 这样 "i小于3" 会正确拆分为 "i" + "小于" + "3"，"a是b" 会拆分为 "a" + "是" + "b"
const OperatorKeywords = [
    ...Object.keys(ComparisonOperators),
    ...Object.keys(EqualityOperators),
    ...LogicalAndKeywords,
    ...LogicalOrKeywords,
    ...LogicalNotKeywords
];

// 布尔值关键字 → JS布尔值
const BooleanKeywords = {
    '正确': true, '正确的': true, '真': true, '真的': true, '对': true, '对的': true,
    '错误': false, '错误的': false, '错': false, '错的': false, '不对': false, '不对的': false
};

// 空值关键字
const NullKeywords = ['空', '空的', '没了'];

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
    ...AccessKeywords,
    ...Object.keys(ComparisonOperators),
    ...Object.keys(EqualityOperators),
    ...LogicalAndKeywords,
    ...LogicalOrKeywords,
    ...LogicalNotKeywords,
    // 保留关键字（尚未实现但已预留）
    '定义', '个', '长度', '功能', '方法', '全新', '就', '一直', '执行',
    '增加', '追加', '去除', '包含', '为', '则', '和', '与', '或', '用', '以',
    '可', '使', '让', '被', '把', '将', '给', '向', '从', '在', '上', '下',
    '左', '右', '前', '后', '中', '内', '外', '间', '时', '的话', '而已',
    '而已矣', '罢了', '罢了罢了'
];

// 保留关键字（未实际在语法中使用，仅预留）
// 词法分析器在识别这些关键字时会检查后继字符，
// 若后跟标识符字符则不识别为关键字，避免阻断标识符识别
const ReservedKeywords = [
    '定义', '个', '长度', '功能', '方法', '全新', '就', '一直', '执行',
    '增加', '追加', '去除', '包含', '为', '则', '和', '与', '或', '用', '以',
    '可', '使', '让', '被', '把', '将', '给', '向', '从', '在', '上', '下',
    '左', '右', '前', '后', '中', '内', '外', '间', '时', '的话', '而已',
    '而已矣', '罢了', '罢了罢了'
];

// ==================== 运算符 ====================
const Operators = ['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~'];

// ==================== 标点符号 ====================
const Punctuations = ['。', '，', '、', '：', '；', '？', '《', '》', '—', '！'];
const LeftParen = '（';
const RightParen = '）';

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

// ==================== 导出 ====================
module.exports = {
    TokenType,
    NodeType,
    ControlKeywords,
    LoopKeywords,
    FunctionKeywords,
    ObjectKeywords,
    AccessKeywords,
    ComparisonOperators,
    EqualityOperators,
    LogicalAndKeywords,
    LogicalOrKeywords,
    LogicalNotKeywords,
    OperatorKeywords,
    BooleanKeywords,
    NullKeywords,
    IfAliases,
    ReturnAliases,
    AllKeywords,
    ReservedKeywords,
    Operators,
    Punctuations,
    LeftParen,
    RightParen,
    isWhitespace,
    isDigit,
    isIdentifierStart,
    isIdentifierPart
};
