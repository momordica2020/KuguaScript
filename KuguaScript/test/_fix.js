// 标点替换工具：代码层的半角括号/引号/逗号/冒号替换为全角，字符串内部保持不变
// 规则：
//   ( -> （   ) -> ）   , -> ，    ;(非CSS/字符串内部)可以保留，苦瓜脚本用句号结尾实际无分号
//   半角双引号 " 作为字符串时，若其前无中文引号则视为字符串定界 — 实际上苦瓜脚本只用 “”
//   因此我们的替换方案：
//     遇到第一个 "  -> “   第二个 " -> ”   交替（在非字符串上下文）
//     遇到代码中的 ( -> （   ) -> ）  ,-> ，  :-代码结构中的冒号（对象键值、条件结尾）实际已是全角，不用替换
//   —— 关键：**不在字符串内部时才替换括号/逗号/引号**
//   （但是：我们的错误文件里字符串用 " 而非 “”，这难判断 — 简化：
//      采用"括号优先"启发：不在 "..." 里的 ( 、 ) 、 ,  替换为全角
//      引号本身 — 成对处理：  "..." 变 “...”，内部标点不动
//    ）

const fs = require('fs');
const files = process.argv.slice(2);

function fixContent(src) {
    const chars = [...src];
    const out = [];
    let inQuote = false;  // " ... "
    let quoteStart = -1;
    let quoteCount = 0;  // 用于交替左/右引号
    let i = 0;
    while (i < chars.length) {
        const c = chars[i];
        if (!inQuote) {
            if (c === '"') {
                // 开始引号：变 “
                out.push('\u201C');
                inQuote = true;
                quoteStart = i;
                quoteCount++;
                i++;
                continue;
            }
            if (c === '(') { out.push('\uFF08'); i++; continue; }
            if (c === ')') { out.push('\uFF09'); i++; continue; }
            // 逗号：只有不在字符串中才换。但有些CSS参数中间的逗号也要保留。
            // 启发：若逗号后面是空格+数字或"str"形式且在设置样式参数里也没关系。
            // 实际上苦瓜脚本只有函数调用逗号和对象定义逗号两种情况需要变全角，字符串中保留。
            // 所以这里直接替换逗号即可。（设置HTML/CSS内的逗号实际上"在引号字符串内"，不会到这。）
            if (c === ',') { out.push('\uFF0C'); i++; continue; }
            // 分号：保留（字符串外的分号，其实苦瓜脚本不用，但我们的变量名注释后可能有）
            out.push(c);
            i++;
            continue;
        } else {
            // 在引号中：原样复制，直到闭合"
            if (c === '"') {
                // 闭合：变 ”
                out.push('\u201D');
                inQuote = false;
                i++;
                continue;
            }
            out.push(c);
            i++;
            continue;
        }
    }
    return out.join('');
}

for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const out = fixContent(src);
    fs.writeFileSync(f + '.tmp', out, 'utf8');
    // 计算改动数
    let changes = 0;
    for (let k = 0; k < Math.min(src.length,out.length); k++) {
        if (src[k] !== out[k]) changes++;
    }
    console.log('处理: ' + f + '   字符改动数: ' + changes);
}