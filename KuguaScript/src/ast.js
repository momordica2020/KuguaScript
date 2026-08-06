/**
 * 苦瓜脚本语言 — AST 节点工厂函数
 * 统一节点创建方式，减少散落的对象字面量
 */
const { NodeType } = require('./constants');

function createNode(type, props = {}) {
    return { type, ...props };
}

function createToken(type, value, line, column) {
    return { type, value, line, column };
}

function createProgram(body) {
    return createNode(NodeType.Program, { body });
}

function createBlockStatement(body) {
    return createNode(NodeType.BlockStatement, { body });
}

function createIfStatement(condition, consequent, alternate) {
    return createNode(NodeType.IfStatement, { condition, consequent, alternate });
}

function createForStatement(init, condition, update, body) {
    return createNode(NodeType.ForStatement, { init, condition, update, body });
}

function createForOfStatement(left, right, body) {
    return createNode(NodeType.ForOfStatement, { left, right, body });
}

function createReturnStatement(argument) {
    return createNode(NodeType.ReturnStatement, { argument });
}

function createPrintStatement(argument) {
    return createNode(NodeType.PrintStatement, { argument });
}

function createBreakStatement() {
    return createNode(NodeType.BreakStatement);
}

function createArrayExpression(elements) {
    return createNode(NodeType.ArrayExpression, { elements });
}

function createFunctionDeclaration(name, params, body) {
    return createNode(NodeType.FunctionDeclaration, { name, params, body });
}

function createClassDeclaration(name, body) {
    return createNode(NodeType.ClassDeclaration, { name, body });
}

function createClassProperty(name, value) {
    return createNode(NodeType.ClassProperty, { name, value });
}

function createExpressionStatement(expression) {
    return createNode(NodeType.ExpressionStatement, { expression });
}

function createAssignmentExpression(left, right) {
    return createNode(NodeType.AssignmentExpression, { left, right });
}

function createLogicalExpression(operator, left, right) {
    return createNode(NodeType.LogicalExpression, { operator, left, right });
}

function createBinaryExpression(operator, left, right) {
    return createNode(NodeType.BinaryExpression, { operator, left, right });
}

function createUnaryExpression(operator, argument) {
    return createNode(NodeType.UnaryExpression, { operator, argument });
}

function createCallExpression(callee, args) {
    return createNode(NodeType.CallExpression, { callee, arguments: args });
}

function createMemberExpression(object, property, computed) {
    return createNode(NodeType.MemberExpression, { object, property, computed });
}

function createIdentifier(name) {
    return createNode(NodeType.Identifier, { name });
}

function createLiteral(value, raw) {
    return createNode(NodeType.Literal, { value, raw });
}

function createVariableDeclaration(name, value) {
    return createNode(NodeType.VariableDeclaration, { name, value });
}

function createUpdateExpression(operator, argument) {
    return createNode(NodeType.UpdateExpression, { operator, argument });
}

module.exports = {
    createNode,
    createToken,
    createProgram,
    createBlockStatement,
    createIfStatement,
    createForStatement,
    createForOfStatement,
    createReturnStatement,
    createPrintStatement,
    createBreakStatement,
    createArrayExpression,
    createFunctionDeclaration,
    createClassDeclaration,
    createClassProperty,
    createExpressionStatement,
    createAssignmentExpression,
    createLogicalExpression,
    createBinaryExpression,
    createUnaryExpression,
    createCallExpression,
    createMemberExpression,
    createIdentifier,
    createLiteral,
    createVariableDeclaration,
    createUpdateExpression
};
