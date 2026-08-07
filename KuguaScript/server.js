const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const Compiler = require('./src/compiler');

const compiler = new Compiler();
const PORT = process.env.PORT || 3002;

function getContentType(ext) {
    const types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.ks': 'text/plain; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon'
    };
    return types[ext] || 'text/plain; charset=utf-8';
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/') {
        res.writeHead(302, { 'Location': '/editor/index.html' });
        res.end();
        return;
    }

    if (pathname === '/compile' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const jsCode = compiler.compile(data.source);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ code: jsCode }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    if (pathname === '/run' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                // compiler.run 返回全部日志（编译产物使用传入的 console 参数）
                const output = compiler.run(data.source);
                // 含顶层 等待 的脚本返回 Promise，等待完成后再响应
                if (output && typeof output.then === 'function') {
                    output.then(function (result) {
                        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ output: result }));
                    }).catch(function (e) {
                        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ error: e.message }));
                    });
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ output }));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    if (pathname === '/files' && req.method === 'GET') {
        const testDir = path.join(__dirname, 'test');
        fs.readdir(testDir, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: err.message }));
            } else {
                const ksFiles = files.filter(file => file.endsWith('.ks')).map(file => {
                    const filePath = path.join(testDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        path: filePath,
                        size: stats.size,
                        modified: stats.mtime.toLocaleString('zh-CN')
                    };
                });
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify(ksFiles));
            }
        });
        return;
    }

    // 安全校验：确保路径位于 test 目录内
    function safeTestPath(relPath) {
        const testDir = path.resolve(__dirname, 'test');
        const full = path.resolve(testDir, relPath || '');
        if (full !== testDir && !full.startsWith(testDir + path.sep)) return null;
        return full;
    }

    // 文件树接口（递归列出 test 目录）
    if (pathname === '/tree' && req.method === 'GET') {
        const testDir = path.join(__dirname, 'test');
        // 同步递归构建文件树（文件夹在前，文件按中文排序）
        function buildTree(dir) {
            const nodes = [];
            const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => {
                if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? 1 : -1;
                return a.name.localeCompare(b.name, 'zh-CN');
            });
            for (const entry of entries) {
                const abs = path.join(dir, entry.name);
                const rel = path.relative(testDir, abs).split(path.sep).join('/');
                if (entry.isDirectory()) {
                    nodes.push({ name: entry.name, path: rel, type: 'folder' });
                    nodes.push(...buildTree(abs));
                } else if (entry.name.endsWith('.ks')) {
                    const stats = fs.statSync(abs);
                    nodes.push({
                        name: entry.name,
                        path: rel,
                        type: 'file',
                        size: stats.size,
                        modified: stats.mtime.toLocaleString('zh-CN')
                    });
                }
            }
            return nodes;
        }
        try {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(buildTree(testDir)));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    if (pathname === '/file' && req.method === 'GET') {
        const relPath = parsedUrl.query.path || '';
        const filePath = safeTestPath(relPath);
        if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: '无效的文件路径' }));
            return;
        }
        fs.readFile(filePath, 'utf-8', (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: '文件读取失败' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ content: content, name: relPath }));
            }
        });
        return;
    }

    // 保存文件到 test 目录
    if (pathname === '/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const relPath = data.path || '';
                const filePath = safeTestPath(relPath);
                if (!filePath) {
                    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ error: '无效的文件路径' }));
                    return;
                }
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                fs.writeFile(filePath, String(data.content ?? ''), 'utf-8', (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ error: err.message }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ ok: true, name: relPath }));
                    }
                });
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    const decodedPath = decodeURIComponent(pathname);
    const filePath = path.join(__dirname, decodedPath);
    fs.readFile(filePath, (err, content) => {
        if (err) {
            // 根路径找不到时，尝试从 editor 目录找
            const editorPath = path.join(__dirname, 'editor', decodedPath);
            fs.readFile(editorPath, (err2, content2) => {
                if (err2) {
                    res.writeHead(404);
                    res.end('Not found');
                } else {
                    const ext = path.extname(editorPath);
                    const contentType = getContentType(ext);
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content2);
                }
            });
        } else {
            const ext = path.extname(filePath);
            const contentType = getContentType(ext);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`编辑器地址: http://localhost:${PORT}`);
});
