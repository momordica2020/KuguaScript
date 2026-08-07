/**
 * 苦瓜脚本 — Node.js 运行时
 *
 * 在本地控制台/脚本环境中提供中文内置函数（编译模式 runtime: 'none' 时使用）。
 * cli.js 与 Compiler.run() 内部会自动加载本模块（幂等），也可手动 require。
 *
 * 交互式输入（询问/确认/读取输入）用 fs.readSync 同步读取 stdin 实现，
 * 零第三方依赖；终端输入编码为 UTF-8 或 GBK 均可识别。
 */
(function (global) {
    'use strict';

    if (typeof process === 'undefined') return; // 非 Node 环境

    const fs = require('fs');

    function install(name, fn) {
        if (fn && typeof global[name] === 'undefined') {
            global[name] = fn;
        }
    }

    // ===== 输入输出 =====
    install('说', function () { console.log.apply(console, arguments); });
    install('弹窗', function (msg) { console.log(msg); });
    install('询问', function (msg) {
        process.stdout.write(String(msg === undefined ? '' : msg));
        return readLineSync();
    });
    install('确认', function (msg) {
        process.stdout.write(String(msg === undefined ? '' : msg) + '（是/否）');
        const answer = readLineSync();
        return /^[是yY对1tT]/.test(answer.trim());
    });
    install('写入', function (msg) { process.stdout.write(String(msg)); });
    install('读取输入', function (msg) {
        process.stdout.write(String(msg === undefined ? '' : msg));
        return readLineSync();
    });

    // ===== 数学与转换 =====
    install('随机数字', Math.random);
    install('向下取整', Math.floor);
    install('向上取整', Math.ceil);
    install('绝对值', Math.abs);
    install('转整数', parseInt);
    install('转数字', parseFloat);
    install('数学', Math);
    install('日期', Date);
    install('控制台', console);

    // ===== 定时器 =====
    install('设置定时器', setTimeout);
    install('清除定时器', clearTimeout);
    install('设置循环', setInterval);
    install('清除循环', clearInterval);
    install('startLoop', setInterval);
    install('stopLoop', clearInterval);
    install('setT', setTimeout);
    install('clearT', clearTimeout);
    install('请求动画帧', function (cb) { return setTimeout(cb, 16); });
    install('取消动画帧', clearTimeout);

    // ===== 对象 =====
    // 与浏览器运行时行为一致：每次读取 对象 都返回一个新空对象
    if (typeof global.对象 === 'undefined') {
        Object.defineProperty(global, '对象', {
            get: function () { return {}; },
            configurable: true
        });
    }
    install('创建对象', function () { return {}; });

    // ===== 数据格式 / 网络 =====
    install('解析JSON', function (text) {
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('JSON 解析失败：' + ((e && e.message) || String(e)));
        }
    });
    install('字符串化JSON', JSON.stringify);
    if (typeof fetch === 'function') install('获取', fetch);

    // ===== 文件系统 =====
    install('读取文件', function (p) {
        try {
            return fs.readFileSync(String(p), 'utf-8');
        } catch (e) {
            throw new Error('读取文件失败：' + fsErrorMessage(e, p));
        }
    });
    install('写入文件', function (p, content) {
        try {
            fs.writeFileSync(String(p), String(content));
        } catch (e) {
            throw new Error('写入文件失败：' + fsErrorMessage(e, p));
        }
    });
    install('追加文件', function (p, content) {
        try {
            fs.appendFileSync(String(p), String(content));
        } catch (e) {
            throw new Error('追加文件失败：' + fsErrorMessage(e, p));
        }
    });
    install('删除文件', function (p) {
        try {
            fs.unlinkSync(String(p));
        } catch (e) {
            throw new Error('删除文件失败：' + fsErrorMessage(e, p));
        }
    });
    install('存在文件', function (p) { return fs.existsSync(String(p)); });
    install('读取目录', function (p) {
        try {
            return fs.readdirSync(String(p));
        } catch (e) {
            throw new Error('读取目录失败：' + fsErrorMessage(e, p));
        }
    });

    // ===== 中文命名空间标准库 =====

    // 路径（path）
    install('路径', {
        拼接: function () { return require('path').join.apply(null, [].slice.call(arguments)); },
        解析: function (p) { return require('path').parse(String(p)); },
        目录名: function (p) { return require('path').dirname(String(p)); },
        文件名: function (p) { return require('path').basename(String(p)); },
        扩展名: function (p) { return require('path').extname(String(p)); },
        相对: function (from, to) { return require('path').relative(String(from), String(to)); },
        绝对化: function (p) { return require('path').resolve(String(p)); },
        分隔符: require('path').sep
    });

    // 网址（URL）
    install('网址', {
        解析: function (text) {
            try {
                const u = new URL(String(text));
                const params = {};
                u.searchParams.forEach(function (v, k) { params[k] = v; });
                return {
                    协议: u.protocol.replace(/:$/, ''),
                    主机: u.host,
                    域名: u.hostname,
                    端口: u.port,
                    路径: u.pathname,
                    查询: u.search,
                    参数: params,
                    原文: u.href
                };
            } catch (e) {
                throw new Error('网址解析失败：' + ((e && e.message) || String(e)));
            }
        }
    });

    // 加密（crypto）
    install('加密', {
        哈希: function (algorithm, text) {
            return require('crypto').createHash(String(algorithm)).update(String(text)).digest('hex');
        },
        随机字节: function (n) {
            return Array.from(require('crypto').randomBytes(n === undefined ? 16 : n));
        },
        随机标识: function () {
            return require('crypto').randomUUID();
        }
    });

    // 文件（复用上面的中文错误翻译）
    install('文件', {
        读取: function (p) { return global.读取文件(p); },
        写入: function (p, content) { global.写入文件(p, content); },
        追加: function (p, content) { global.追加文件(p, content); },
        删除: function (p) { global.删除文件(p); },
        存在: function (p) { return global.存在文件(p); },
        列出: function (p) { return global.读取目录(p); },
        复制: function (from, to) {
            try {
                fs.copyFileSync(String(from), String(to));
            } catch (e) {
                throw new Error('复制文件失败：' + fsErrorMessage(e, from));
            }
        },
        移动: function (from, to) {
            try {
                fs.renameSync(String(from), String(to));
            } catch (e) {
                throw new Error('移动文件失败：' + fsErrorMessage(e, from));
            }
        }
    });

    // 系统（os）
    install('系统', {
        平台: function () { return process.platform; },
        架构: function () { return process.arch; },
        处理器数量: function () { return require('os').cpus().length; },
        总内存: function () { return require('os').totalmem(); },
        空闲内存: function () { return require('os').freemem(); },
        主机名: function () { return require('os').hostname(); },
        临时目录: function () { return require('os').tmpdir(); },
        用户目录: function () { return require('os').homedir(); }
    });

    // 环境变量
    install('环境变量', {
        读取: function (name) { return process.env[String(name)]; },
        设置: function (name, value) { process.env[String(name)] = String(value); },
        删除: function (name) { delete process.env[String(name)]; },
        全部: function () { return Object.assign({}, process.env); }
    });

    // 缓冲（Buffer）
    install('缓冲', {
        从文本: function (text) { return Buffer.from(String(text)); },
        转文本: function (buf) { return Buffer.isBuffer(buf) ? buf.toString('utf-8') : String(buf); },
        从十六进制: function (hex) { return Buffer.from(String(hex), 'hex'); },
        转十六进制: function (buf) { return Buffer.isBuffer(buf) ? buf.toString('hex') : String(buf); },
        长度: function (buf) { return Buffer.isBuffer(buf) ? buf.length : String(buf).length; },
        拼接: function () {
            return Buffer.concat([].slice.call(arguments).filter(function (b) { return Buffer.isBuffer(b); }));
        }
    });

    // HTTP 服务器（http）
    install('服务器', {
        创建: function (handler) {
            const http = require('http');
            return http.createServer(function (req, res) {
                return handler(req, res);
            });
        },
        监听: function (server, port, callback) {
            server.listen(port === undefined ? 3000 : port, function () {
                if (callback) callback();
            });
            return server;
        },
        关闭: function (server) { server.close(); }
    });
    try {
        const httpProto = require('http');
        if (httpProto.IncomingMessage && !httpProto.IncomingMessage.prototype.网址) {
            Object.defineProperty(httpProto.IncomingMessage.prototype, '网址', {
                get: function () { return this.url; },
                configurable: true
            });
            Object.defineProperty(httpProto.IncomingMessage.prototype, '方法', {
                get: function () { return this.method; },
                configurable: true
            });
            Object.defineProperty(httpProto.IncomingMessage.prototype, '头', {
                get: function () { return this.headers; },
                configurable: true
            });
            httpProto.IncomingMessage.prototype.读取体 = function (callback) {
                let data = '';
                this.on('data', function (chunk) { data += chunk; });
                this.on('end', function () { callback(data); });
            };
        }
        if (httpProto.ServerResponse && !httpProto.ServerResponse.prototype.发送) {
            httpProto.ServerResponse.prototype.发送 = function (text) {
                this.end(String(text === undefined ? '' : text));
            };
            httpProto.ServerResponse.prototype.设置头 = function (name, value) {
                this.setHeader(String(name), String(value));
            };
            httpProto.ServerResponse.prototype.状态 = function (code) {
                this.statusCode = code;
            };
        }
    } catch (e) { /* http 不可用时忽略 */ }

    // 日期中文方法（挂到 Date 函数上：日期之现在、日期之格式化）
    if (typeof Date === 'function') {
        Date.现在 = Date.now;
        Date.时间戳 = function (d) { return new Date(d).getTime(); };
        Date.年 = function (d) { return new Date(d).getFullYear(); };
        Date.月 = function (d) { return new Date(d).getMonth() + 1; };
        Date.日 = function (d) { return new Date(d).getDate(); };
        Date.时 = function (d) { return new Date(d).getHours(); };
        Date.分 = function (d) { return new Date(d).getMinutes(); };
        Date.秒 = function (d) { return new Date(d).getSeconds(); };
        Date.格式化 = function (d, format) {
            const dt = new Date(d);
            const pad = function (n) { return String(n).padStart(2, '0'); };
            const map = {
                'YYYY': String(dt.getFullYear()),
                'MM': pad(dt.getMonth() + 1),
                'DD': pad(dt.getDate()),
                'HH': pad(dt.getHours()),
                'mm': pad(dt.getMinutes()),
                'ss': pad(dt.getSeconds())
            };
            let f = String(format === undefined ? 'YYYY-MM-DD HH:mm:ss' : format);
            for (const k of Object.keys(map)) f = f.replace(k, map[k]);
            return f;
        };
    }

    // 数学中文方法（数学之平方根、数学之圆周率）
    if (typeof Math !== 'undefined') {
        Math.平方根 = Math.sqrt;
        Math.乘方 = Math.pow;
        Math.正弦 = Math.sin;
        Math.余弦 = Math.cos;
        Math.正切 = Math.tan;
        Math.最小值 = Math.min;
        Math.最大值 = Math.max;
        Math.圆周率 = Math.PI;
    }

    // 文本与列表工具（跨端共用）
    install('文本', {
        长度: function (s) { return String(s).length; },
        拆分: function (s, sep) { return String(s).split(String(sep)); },
        替换: function (s, old, neu) { return String(s).split(String(old)).join(String(neu)); },
        查找: function (s, sub) { return String(s).indexOf(String(sub)); },
        包含: function (s, sub) { return String(s).includes(String(sub)); },
        转大写: function (s) { return String(s).toUpperCase(); },
        转小写: function (s) { return String(s).toLowerCase(); },
        修剪: function (s) { return String(s).trim(); },
        子串: function (s, start, end) { return String(s).substring(start, end); },
        连接: function () { return [].slice.call(arguments).join(''); }
    });
    install('列表', {
        长度: function (a) { return a.length; },
        追加: function (a, item) { a.push(item); return a; },
        移除: function (a, i) { a.splice(i - 1, 1); return a; },
        包含: function (a, v) { return a.includes(v); },
        连接: function (a, sep) { return a.join(sep === undefined ? ',' : String(sep)); },
        排序: function (a, fn) { a.sort(fn); return a; },
        反转: function (a) { a.reverse(); return a; },
        映射: function (a, fn) { return a.map(fn); },
        筛选: function (a, fn) { return a.filter(fn); },
        归并: function (a, fn, init) {
            return init === undefined ? a.reduce(fn) : a.reduce(fn, init);
        },
        查找: function (a, v) { return a.indexOf(v) + 1; }
    });

    // ===== 进程 / 命令行 =====
    install('命令行参数', function () { return process.argv.slice(2); });
    install('当前目录', function () { return process.cwd(); });
    install('退出', function (code) { process.exit(code === undefined ? 0 : code); });
})(globalThis);

/**
 * 同步读取一行 stdin（零依赖）
 * 逐个字节读取直到换行/EOF，并兼容 UTF-8 与 GBK 两种终端输入编码。
 */
function readLineSync() {
    const bytes = [];
    const buffer = Buffer.alloc(1);
    while (true) {
        let n;
        try {
            n = require('fs').readSync(0, buffer, 0, 1, null);
        } catch (e) {
            break; // stdin 不可读（如某些运行环境）
        }
        if (n === 0) break; // EOF
        const ch = buffer[0];
        if (ch === 10 || ch === 13) break;
        bytes.push(ch);
    }
    const buf = Buffer.from(bytes);
    let text = buf.toString('utf-8');
    if (text.indexOf('\uFFFD') >= 0) {
        try {
            text = new TextDecoder('gbk').decode(buf);
        } catch (e) {
            /* 保持 utf-8 解码结果 */
        }
    }
    return text;
}

/**
 * 把 Node 文件系统错误转成中文
 */
function fsErrorMessage(e, p) {
    const code = e && e.code;
    if (code === 'ENOENT') return '找不到文件或目录“' + p + '”';
    if (code === 'EACCES') return '没有权限访问“' + p + '”';
    if (code === 'EISDIR') return '“' + p + '”是一个目录';
    if (code === 'EEXIST') return '文件或目录已存在：“' + p + '”';
    if (code === 'ENOTDIR') return '“' + p + '”的路径中某项不是目录';
    return (e && e.message) || String(e);
}
