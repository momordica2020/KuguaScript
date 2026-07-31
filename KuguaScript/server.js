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

    if (pathname === '/file' && req.method === 'GET') {
        const fileName = parsedUrl.query.name;
        if (!fileName || !fileName.endsWith('.ks')) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: '无效的文件名' }));
            return;
        }
        const filePath = path.join(__dirname, 'test', fileName);
        fs.readFile(filePath, 'utf-8', (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: '文件不存在' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ content: content, name: fileName }));
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
