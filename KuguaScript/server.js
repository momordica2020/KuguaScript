const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const Compiler = require('./src/compiler');

const compiler = new Compiler();
const PORT = 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/') {
        const filePath = path.join(__dirname, 'editor', 'index.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
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

    const filePath = path.join(__dirname, pathname);
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            const ext = path.extname(filePath);
            let contentType = 'text/plain';
            if (ext === '.html') contentType = 'text/html; charset=utf-8';
            if (ext === '.css') contentType = 'text/css; charset=utf-8';
            if (ext === '.js') contentType = 'application/javascript; charset=utf-8';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('编辑器地址: http://localhost:3000');
});
