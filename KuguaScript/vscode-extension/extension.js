/**
 * 苦瓜脚本 — VS Code 扩展入口
 *
 * 功能：
 *   - kugua.run     在集成终端中运行当前 .ks 文件（支持交互式输入）
 *   - kugua.compile 编译当前 .ks 文件并在输出面板显示 JavaScript
 *
 * 运行依赖：本插件所在目录的上层 KuguaScript 项目（cli.js 与 src/）
 */
const vscode = require('vscode');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

let compileChannel = null;
let disposed = false;

function activate(context) {
    const extensionRoot = context.extensionUri.fsPath;

    /**
     * 定位 cli.js：
     *  1. 打包安装版：编译器随插件分发（extension/cli.js + extension/src/）
     *  2. 开发模式：使用仓库内的 ../cli.js（F5 调试时）
     */
    function resolveCliPath() {
        const bundled = path.join(extensionRoot, 'cli.js');
        if (fs.existsSync(bundled)) return bundled;
        return path.join(extensionRoot, '..', 'cli.js');
    }
    const cliPath = resolveCliPath();

    // 输出通道在激活阶段创建并注册回收：
    // 避免在异步回调里懒创建——若回调晚于扩展卸载执行，会在已释放的宿主上创建对象而报错
    compileChannel = vscode.window.createOutputChannel('苦瓜脚本编译');
    context.subscriptions.push(compileChannel);

    /**
     * 取当前编辑器中的 .ks 文件路径
     */
    function getActiveKsFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('请先打开一个 .ks 文件');
            return null;
        }
        if (editor.document.languageId !== 'kugua') {
            vscode.window.showErrorMessage('当前文件不是苦瓜脚本（.ks）');
            return null;
        }
        if (editor.document.isUntitled) {
            vscode.window.showErrorMessage('请先保存文件，再运行苦瓜脚本');
            return null;
        }
        return editor.document.uri.fsPath;
    }

    function getNodePath() {
        const cfg = vscode.workspace.getConfiguration('kugua');
        return cfg.get('nodePath') || 'node';
    }

    /**
     * 在集成终端中运行（复用同名终端，支持询问/确认等交互输入）
     */
    function runInTerminal(filePath) {
        if (disposed) return;
        const node = getNodePath();
        let terminal = vscode.window.terminals.find(t => t.name === '苦瓜脚本');
        if (!terminal) {
            terminal = vscode.window.createTerminal({ name: '苦瓜脚本' });
        }
        terminal.show(true);
        const quote = (s) => '"' + String(s).replace(/"/g, '\\"') + '"';
        // PowerShell 中调用带引号的可执行文件必须以 & 开头（否则报"意外的标记"）
        const shell = (vscode.env.shell || '').toLowerCase();
        const isPowerShell = shell.indexOf('powershell') >= 0 || shell.indexOf('pwsh') >= 0;
        const invocation = isPowerShell ? '& ' : '';
        terminal.sendText(invocation + quote(node) + ' ' + quote(cliPath) + ' ' + quote(filePath));
    }

    /**
     * 编译当前文件，结果输出到输出面板
     */
    function compileToPanel(filePath) {
        if (disposed) return;
        const node = getNodePath();
        compileChannel.show(true);
        compileChannel.appendLine('// 编译: ' + filePath);
        execFile(node, [cliPath, filePath, '--compile'], { cwd: path.dirname(filePath) }, (err, stdout, stderr) => {
            if (disposed) return; // 扩展已卸载，不再访问 VS Code API
            if (err) {
                compileChannel.appendLine('编译失败: ' + (stderr || err.message));
                return;
            }
            compileChannel.appendLine(stdout.replace(/\s+$/, ''));
            compileChannel.appendLine('');
        });
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('kugua.run', () => {
            const file = getActiveKsFile();
            if (file) runInTerminal(file);
        }),
        vscode.commands.registerCommand('kugua.compile', () => {
            const file = getActiveKsFile();
            if (file) compileToPanel(file);
        })
    );
}

function deactivate() {
    disposed = true;
}

module.exports = {
    activate,
    deactivate
};
