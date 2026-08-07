#!/usr/bin/env node
/**
 * 苦瓜脚本 — 命令行工具
 *
 * 用法：
 *   node cli.js 脚本.ks              运行脚本
 *   node cli.js 脚本.ks --compile    只输出编译后的 JavaScript
 *   node cli.js 脚本.ks -o 输出.js   编译并写入文件
 *   node cli.js                      进入交互式运行环境（空行执行，输入"退出"结束）
 */

const fs = require('fs');
const readline = require('readline');
const Compiler = require('./src/compiler');
const pkg = require('./package.json');

const HELP = `
苦瓜脚本语言 v${pkg.version} — 纯中文脚本语言

用法:
  node cli.js <脚本.ks>               运行脚本（使用 Node.js 运行时）
  node cli.js <脚本.ks> --compile     只输出编译后的 JavaScript
  node cli.js <脚本.ks> -o <文件.js>  编译并写入文件
  node cli.js                         进入交互式运行环境

选项:
  -c, --compile    只编译，不运行
  -o, --out <路径> 编译结果写入文件
  -h, --help       显示帮助
  -v, --version    显示版本号

交互式运行环境:
  输入多行苦瓜脚本，输入空行执行；输入"退出"结束。
`;

function compileSource(source) {
    const compiler = new Compiler();
    return compiler.compile(source, { runtime: 'none' });
}

function runSource(source) {
    const compiler = new Compiler();
    return compiler.run(source, function (msg) {
        console.log(msg);
    });
}

// run 返回 Promise（脚本含顶层 等待）或字符串（同步脚本）
function settleRun(result) {
    if (result && typeof result.then === 'function') {
        result.catch(function (e) {
            console.error('运行失败: ' + e.message);
            process.exitCode = 1;
        });
    }
    return result;
}

function repl() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '苦瓜> '
    });
    const buffer = [];

    console.log('苦瓜脚本交互式运行环境（空行执行，输入"退出"结束）');
    rl.prompt();

    rl.on('line', (line) => {
        const trimmed = line.trim();
        if (trimmed === '退出' || trimmed === 'exit' || trimmed === 'quit') {
            rl.close();
            return;
        }
        if (trimmed === '') {
            if (buffer.length === 0) {
                rl.prompt();
                return;
            }
            const source = buffer.join('\n');
            buffer.length = 0;
            try {
                const result = runSource(source);
                if (result && typeof result.then === 'function') {
                    result.then(function () {
                        console.log('—— 运行结束 ——');
                        rl.prompt();
                    }).catch(function (e) {
                        console.error('运行失败: ' + e.message);
                        rl.prompt();
                    });
                } else {
                    console.log('—— 运行结束 ——');
                    rl.prompt();
                }
            } catch (e) {
                console.error('运行失败: ' + e.message);
                rl.prompt();
            }
            return;
        }
        buffer.push(line);
        rl.prompt();
    });

    rl.on('close', () => {
        console.log('再见。');
        process.exit(0);
    });
}

function main() {
    const args = process.argv.slice(2);
    const files = [];
    let compileOnly = false;
    let outFile = null;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-h' || arg === '--help') {
            console.log(HELP);
            return;
        }
        if (arg === '-v' || arg === '--version') {
            console.log(pkg.version);
            return;
        }
        if (arg === '-c' || arg === '--compile') {
            compileOnly = true;
            continue;
        }
        if (arg === '-o' || arg === '--out') {
            outFile = args[++i];
            if (!outFile) {
                console.error('错误: --out 后需要文件路径');
                process.exitCode = 1;
                return;
            }
            compileOnly = true; // 指定输出文件即视为编译模式
            continue;
        }
        if (arg.startsWith('-')) {
            console.error('未知选项: ' + arg);
            console.log(HELP);
            process.exitCode = 1;
            return;
        }
        files.push(arg);
    }

    if (files.length > 1) {
        console.error('错误: 一次只能运行一个脚本文件');
        process.exitCode = 1;
        return;
    }

    if (files.length === 0) {
        repl();
        return;
    }

    const file = files[0];
    let source;
    try {
        source = fs.readFileSync(file, 'utf-8');
    } catch (e) {
        console.error('读取文件失败: ' + e.message);
        process.exitCode = 1;
        return;
    }

    try {
        if (compileOnly) {
            const jsCode = compileSource(source);
            if (outFile) {
                fs.writeFileSync(outFile, jsCode, 'utf-8');
                console.log('已写入: ' + outFile);
            } else {
                console.log(jsCode);
            }
        } else {
            settleRun(runSource(source));
        }
    } catch (e) {
        console.error('运行失败: ' + e.message);
        process.exitCode = 1;
    }
}

main();
