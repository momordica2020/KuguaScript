const fs = require('fs');
const path = require('path');
const Compiler = require('../src/compiler');

const compiler = new Compiler();

function runTests() {
    const testDir = path.join(__dirname, '.');

    fs.readdir(testDir, (err, files) => {
        if (err) {
            console.error('读取测试目录失败:', err);
            return;
        }

        const ksFiles = files.filter(file => file.endsWith('.ks'));

        if (ksFiles.length === 0) {
            console.log('没有找到测试文件');
            return;
        }

        ksFiles.forEach(file => {
            const filePath = path.join(testDir, file);

            console.log('\n========================================');
            console.log(`测试文件: ${file}`);
            console.log('========================================');

            try {
                const source = fs.readFileSync(filePath, 'utf-8');

                console.log('\n源代码:');
                console.log('----------------------------------------');
                console.log(source);

                const jsCode = compiler.compile(source);

                console.log('\n编译结果:');
                console.log('----------------------------------------');
                console.log(jsCode);

                console.log('\n运行结果:');
                console.log('----------------------------------------');

                const output = compiler.run(source);

                if (output && typeof output.then === 'function') {
                    output.then(function (result) {
                        console.log(result || '(无输出)');
                    }).catch(function (e) {
                        console.error('\n错误:');
                        console.error('----------------------------------------');
                        console.error(e.message);
                    });
                } else {
                    console.log(output || '(无输出)');
                }

            } catch (error) {
                console.error('\n错误:');
                console.error('----------------------------------------');
                console.error(error.message);
            }
        });
    });
}

runTests();
