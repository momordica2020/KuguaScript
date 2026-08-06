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
                
                const logs = [];
                const originalLog = console.log;
                console.log = function(...args) {
                    logs.push(args.join(' '));
                };
                
                try {
                    compiler.run(data.source);
                } finally {
                    console.log = originalLog;
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ output: logs.join('\n') }));
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
        (function walk(dir) {
            fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ error: err.message }));
                    return;
                }
                const nodes = [];
                entries.sort((a, b) => {
                    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? 1 : -1;
                    return a.name.localeCompare(b.name, 'zh-CN');
                });
                let pending = entries.length;
                if (pending === 0) {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(nodes));
                    return;
                }
                entries.forEach(entry => {
                    const abs = path.join(dir, entry.name);
                    const rel = path.relative(testDir, abs);
                    if (entry.isDirectory()) {
                        walk(abs);
                    } else {
                        const stats = fs.statSync(abs);
                        nodes.push({
                            name: entry.name,
                            path: rel.split(path.sep).join('/'),
                            type: 'file',
                            size: stats.size,
                            modified: stats.mtime.toLocaleString('zh-CN')
                        });
                        if (--pending === 0) {
                            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                            res.end(JSON.stringify(nodes));
                        }
                    }
                });
            });
        })(testDir);
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
