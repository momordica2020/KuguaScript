const fs = require('fs');
const files = process.argv.slice(2);
for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const chars = [...src];
    const out = [];
    let inQuote = false;
    let i = 0;
    let chg = 0;
    while (i < chars.length) {
        const c = chars[i];
        if (inQuote) {
            if (c === '\u201D') { inQuote = false; }
            out.push(c); i++; continue;
        } else {
            if (c === '\u201C') { inQuote = true; out.push(c); i++; continue; }
            if (c === ';') { out.push('\u3002'); chg++; i++; continue; }
            out.push(c); i++; continue;
        }
    }
    fs.writeFileSync(f + '.tmp2', out.join(''), 'utf8');
    console.log('分号替换文件 ' + f + '  改动数=' + chg);
}