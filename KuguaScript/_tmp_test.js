const fs = require('fs');
const Compiler = require('./src/compiler');
const files = process.argv.slice(2);
let fail = 0;
for (const f of files) {
    const src = fs.readFileSync(f, 'utf-8');
    try {
        const js = new Compiler().compile(src);
        console.log('PASS  ' + f + ' (' + js.split('\n').length + ' 行)');
    } catch (e) {
        fail++;
        console.log('FAIL  ' + f + ' => ' + e.message);
    }
}
process.exit(fail ? 1 : 0);