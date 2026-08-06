(function(console) {
    var 样式, tmp, 宽, 高, 长, s1, s2, s3, dir, nextD, 食, 分, 速, 运行, done, 计号, 页, 标题, 息, 表, 单, i, _i, tr, j, td, 设格, id, 字, 色, tmpx, 清, 无, k, 渲染, hitSelf, n, getTail, headX, 商, headY, 死, 走, 新头, tx, ty, 吃, 尾, s30, s29, s28, s27, s26, s25, s24, s23, s22, s21, s20, s19, s18, s17, s16, s15, s14, s13, s12, s11, s10, s9, s8, s7, s6, s5, s4, 重生, 候选, 尝试, goUp, e, goDown, goLeft, goRight, 开始, 暂停, 重开, 造b, 文, cls, 处理, iid, b, 显, tmp8, 隐, tmp9, tmpbr1;
    // ===== 输入输出模块 =====
    var 弹窗 = typeof alert !== "undefined" ? alert : function(msg) { console.log(msg); };
    var 询问 = typeof prompt !== "undefined" ? prompt : function(msg) { console.log("[输入]" + msg); return "1"; };
    var 确认 = typeof confirm !== "undefined" ? confirm : function(msg) { console.log("[确认]" + msg); return true; };
    var 写入 = typeof document !== "undefined" ? function(msg) { document.write(msg); } : function(msg) { console.log(msg); };
    // ===== 工具函数模块 =====
    var 随机数字 = Math.random;
    var 向下取整 = Math.floor;
    var 向上取整 = Math.ceil;
    var 绝对值 = Math.abs;
    var 转整数 = parseInt;
    var 转数字 = parseFloat;
    样式 = 文档.创建元素("style");
    样式.设置文本("table{border-collapse:collapse}td{width:18px;height:18px;text-align:center;font-size:14px;border:1px solid #e5e7eb}button{margin:2px;padding:6px 14px;border:0;border-radius:6px;cursor:pointer;font-size:14px}.hd{display:none!important}.up{background:#10b981;color:#fff}.ov{background:#8b5cf6;color:#fff}.re{background:#ef4444;color:#fff}.st{background:#0ea5e9;color:#fff}");
    tmp = 文档.头部;
    tmp.追加子节点(样式);
    宽 = 20;
    高 = 20;
    长 = 3;
    s1 = 210;
    s2 = 209;
    s3 = 208;
    dir = "右";
    nextD = "右";
    食 = 215;
    分 = 0;
    速 = 220;
    运行 = false;
    done = false;
    计号 = null;
    页 = 文档.创建元素("div");
    页.设置样式("padding", "16px");
    页.设置样式("fontFamily", "sans-serif");
    页.设置样式("backgroundColor", "#ecfdf5");
    tmp = 文档.主体;
    tmp.设置样式("margin", "0");
    tmp.追加子节点(页);
    标题 = 文档.创建元素("h1");
    标题.设置文本("🐍 贪吃蛇");
    标题.设置样式("margin", "0 0 8px 0");
    标题.设置样式("color", "#065f46");
    页.追加子节点(标题);
    息 = 文档.创建元素("div");
    息.设置文本("分数：0   长度：3");
    息.设置样式("fontSize", "16px");
    息.设置样式("marginBottom", "10px");
    息.设置样式("fontWeight", "bold");
    息.设置样式("color", "#047857");
    页.追加子节点(息);
    表 = 文档.创建元素("table");
    页.追加子节点(表);
    单 = null;
    i = 0;
    for (_i = 0; _i < 高; _i++) {
    tr = 文档.创建元素("tr");
    表.追加子节点(tr);
    j = 0;
    for (_i = 0; _i < 宽; _i++) {
    td = 文档.创建元素("td");
    td.设置文本("·");
    td.设置样式("color", "#d1d5db");
    tr.追加子节点(td);
    if ((单 === null)) {
    单 = td;
}
    if (!(单 === null)) {
    单.设置属性("id", ("c" + i));
}
    i = (i + 1);
}
}
    function 设格(id, 字, 色) {
    tmpx = 文档.获取元素按id(id);
    tmpx.设置文本(字);
    tmpx.设置样式("color", 色);
}
    function 清(无) {
    k = 0;
    for (_i = 0; _i < (宽 * 高); _i++) {
    设格(("c" + k), "·", "#d1d5db");
    k = (k + 1);
}
}
    function 渲染(无) {
    清();
    设格(("c" + 食), "★", "#f59e0b");
    设格(("c" + s1), "●", "#111827");
    if ((长 >= 2)) {
    设格(("c" + s2), "●", "#374151");
}
    if ((长 >= 3)) {
    设格(("c" + s3), "●", "#374151");
}
    if ((长 >= 4)) {
    设格(("c" + s4), "●", "#4b5563");
}
    if ((长 >= 5)) {
    设格(("c" + s5), "●", "#4b5563");
}
    if ((长 >= 6)) {
    设格(("c" + s6), "●", "#6b7280");
}
    if ((长 >= 7)) {
    设格(("c" + s7), "●", "#6b7280");
}
    if ((长 >= 8)) {
    设格(("c" + s8), "●", "#6b7280");
}
    if ((长 >= 9)) {
    设格(("c" + s9), "●", "#6b7280");
}
    if ((长 >= 10)) {
    设格(("c" + s10), "●", "#6b7280");
}
    if ((长 >= 11)) {
    设格(("c" + s11), "●", "#6b7280");
}
    if ((长 >= 12)) {
    设格(("c" + s12), "●", "#6b7280");
}
    if ((长 >= 13)) {
    设格(("c" + s13), "●", "#6b7280");
}
    if ((长 >= 14)) {
    设格(("c" + s14), "●", "#6b7280");
}
    if ((长 >= 15)) {
    设格(("c" + s15), "●", "#6b7280");
}
    if ((长 >= 16)) {
    设格(("c" + s16), "●", "#6b7280");
}
    if ((长 >= 17)) {
    设格(("c" + s17), "●", "#6b7280");
}
    if ((长 >= 18)) {
    设格(("c" + s18), "●", "#6b7280");
}
    if ((长 >= 19)) {
    设格(("c" + s19), "●", "#6b7280");
}
    if ((长 >= 20)) {
    设格(("c" + s20), "●", "#6b7280");
}
    if ((长 >= 21)) {
    设格(("c" + s21), "●", "#6b7280");
}
    if ((长 >= 22)) {
    设格(("c" + s22), "●", "#6b7280");
}
    if ((长 >= 23)) {
    设格(("c" + s23), "●", "#6b7280");
}
    if ((长 >= 24)) {
    设格(("c" + s24), "●", "#6b7280");
}
    if ((长 >= 25)) {
    设格(("c" + s25), "●", "#6b7280");
}
    if ((长 >= 26)) {
    设格(("c" + s26), "●", "#6b7280");
}
    if ((长 >= 27)) {
    设格(("c" + s27), "●", "#6b7280");
}
    if ((长 >= 28)) {
    设格(("c" + s28), "●", "#6b7280");
}
    if ((长 >= 29)) {
    设格(("c" + s29), "●", "#6b7280");
}
    if ((长 >= 30)) {
    设格(("c" + s30), "●", "#6b7280");
}
}
    function hitSelf(n) {
    if ((n === s1)) {
    return true;
}
    if ((长 >= 2)) {
    if ((n === s2)) {
    return true;
}
}
    if ((长 >= 3)) {
    if ((n === s3)) {
    return true;
}
}
    if ((长 >= 4)) {
    if ((n === s4)) {
    return true;
}
}
    if ((长 >= 5)) {
    if ((n === s5)) {
    return true;
}
}
    if ((长 >= 6)) {
    if ((n === s6)) {
    return true;
}
}
    if ((长 >= 7)) {
    if ((n === s7)) {
    return true;
}
}
    if ((长 >= 8)) {
    if ((n === s8)) {
    return true;
}
}
    if ((长 >= 9)) {
    if ((n === s9)) {
    return true;
}
}
    if ((长 >= 10)) {
    if ((n === s10)) {
    return true;
}
}
    if ((长 >= 11)) {
    if ((n === s11)) {
    return true;
}
}
    if ((长 >= 12)) {
    if ((n === s12)) {
    return true;
}
}
    if ((长 >= 13)) {
    if ((n === s13)) {
    return true;
}
}
    if ((长 >= 14)) {
    if ((n === s14)) {
    return true;
}
}
    if ((长 >= 15)) {
    if ((n === s15)) {
    return true;
}
}
    if ((长 >= 16)) {
    if ((n === s16)) {
    return true;
}
}
    if ((长 >= 17)) {
    if ((n === s17)) {
    return true;
}
}
    if ((长 >= 18)) {
    if ((n === s18)) {
    return true;
}
}
    if ((长 >= 19)) {
    if ((n === s19)) {
    return true;
}
}
    if ((长 >= 20)) {
    if ((n === s20)) {
    return true;
}
}
    if ((长 >= 21)) {
    if ((n === s21)) {
    return true;
}
}
    if ((长 >= 22)) {
    if ((n === s22)) {
    return true;
}
}
    if ((长 >= 23)) {
    if ((n === s23)) {
    return true;
}
}
    if ((长 >= 24)) {
    if ((n === s24)) {
    return true;
}
}
    if ((长 >= 25)) {
    if ((n === s25)) {
    return true;
}
}
    if ((长 >= 26)) {
    if ((n === s26)) {
    return true;
}
}
    if ((长 >= 27)) {
    if ((n === s27)) {
    return true;
}
}
    if ((长 >= 28)) {
    if ((n === s28)) {
    return true;
}
}
    if ((长 >= 29)) {
    if ((n === s29)) {
    return true;
}
}
    if ((长 >= 30)) {
    if ((n === s30)) {
    return true;
}
}
    return false;
}
    function getTail(无) {
    if ((长 === 1)) {
    return s1;
}
    if ((长 === 2)) {
    return s2;
}
    if ((长 === 3)) {
    return s3;
}
    if ((长 === 4)) {
    return s4;
}
    if ((长 === 5)) {
    return s5;
}
    if ((长 === 6)) {
    return s6;
}
    if ((长 === 7)) {
    return s7;
}
    if ((长 === 8)) {
    return s8;
}
    if ((长 === 9)) {
    return s9;
}
    if ((长 === 10)) {
    return s10;
}
    if ((长 === 11)) {
    return s11;
}
    if ((长 === 12)) {
    return s12;
}
    if ((长 === 13)) {
    return s13;
}
    if ((长 === 14)) {
    return s14;
}
    if ((长 === 15)) {
    return s15;
}
    if ((长 === 16)) {
    return s16;
}
    if ((长 === 17)) {
    return s17;
}
    if ((长 === 18)) {
    return s18;
}
    if ((长 === 19)) {
    return s19;
}
    if ((长 === 20)) {
    return s20;
}
    if ((长 === 21)) {
    return s21;
}
    if ((长 === 22)) {
    return s22;
}
    if ((长 === 23)) {
    return s23;
}
    if ((长 === 24)) {
    return s24;
}
    if ((长 === 25)) {
    return s25;
}
    if ((长 === 26)) {
    return s26;
}
    if ((长 === 27)) {
    return s27;
}
    if ((长 === 28)) {
    return s28;
}
    if ((长 === 29)) {
    return s29;
}
    return s30;
}
    function headX(无) {
    商 = goDown取整((s1 / 宽));
    return (s1 - (商 * 宽));
}
    function headY(无) {
    return goDown取整((s1 / 宽));
}
    function 死(无) {
    done = true;
    运行 = false;
    if ((计号 !== null)) {
    stopLoop(计号);
}
    计号 = null;
    息.设置文本(("💀 结束！最终分数：" + 分));
    显("R");
    隐("P");
    隐("S");
}
    function 走(无) {
    dir = nextD;
    新头 = s1;
    tx = headX();
    ty = headY();
    if ((dir === "上")) {
    if ((ty === 0)) {
    死();
    return null;
}
    新头 = (s1 - 宽);
}
    if ((dir === "下")) {
    if ((ty === (高 - 1))) {
    死();
    return null;
}
    新头 = (s1 + 宽);
}
    if ((dir === "左")) {
    if ((tx === 0)) {
    死();
    return null;
}
    新头 = (s1 - 1);
}
    if ((dir === "右")) {
    if ((tx === (宽 - 1))) {
    死();
    return null;
}
    新头 = (s1 + 1);
}
    吃 = (新头 === 食);
    if (!吃) {
    尾 = getTail();
    if (!(新头 === 尾)) {
    if (hitSelf(新头)) {
    死();
    return null;
}
else {
}
}
    if (hitSelf(新头)) {
    死();
    return null;
}
}
    if (吃) {
    长 = (长 + 1);
    分 = (分 + 1);
    if ((速 > 80)) {
    速 = (速 - 6);
}
    重生();
}
    if ((长 === 30)) {
    s30 = s29;
}
    if ((长 === 29)) {
    s29 = s28;
}
    if ((长 === 28)) {
    s28 = s27;
}
    if ((长 === 27)) {
    s27 = s26;
}
    if ((长 === 26)) {
    s26 = s25;
}
    if ((长 === 25)) {
    s25 = s24;
}
    if ((长 === 24)) {
    s24 = s23;
}
    if ((长 === 23)) {
    s23 = s22;
}
    if ((长 === 22)) {
    s22 = s21;
}
    if ((长 === 21)) {
    s21 = s20;
}
    if ((长 === 20)) {
    s20 = s19;
}
    if ((长 === 19)) {
    s19 = s18;
}
    if ((长 === 18)) {
    s18 = s17;
}
    if ((长 === 17)) {
    s17 = s16;
}
    if ((长 === 16)) {
    s16 = s15;
}
    if ((长 === 15)) {
    s15 = s14;
}
    if ((长 === 14)) {
    s14 = s13;
}
    if ((长 === 13)) {
    s13 = s12;
}
    if ((长 === 12)) {
    s12 = s11;
}
    if ((长 === 11)) {
    s11 = s10;
}
    if ((长 === 10)) {
    s10 = s9;
}
    if ((长 === 9)) {
    s9 = s8;
}
    if ((长 === 8)) {
    s8 = s7;
}
    if ((长 === 7)) {
    s7 = s6;
}
    if ((长 === 6)) {
    s6 = s5;
}
    if ((长 === 5)) {
    s5 = s4;
}
    if ((长 === 4)) {
    s4 = s3;
}
    if ((长 === 3)) {
    s3 = s2;
}
    if ((长 === 2)) {
    s2 = s1;
}
    s1 = 新头;
    渲染();
    息.设置文本(((("分数：" + 分) + "   长度：") + 长));
    if ((计号 !== null)) {
    stopLoop(计号);
}
    if ((运行 && !done)) {
    计号 = startLoop(走, 速);
}
}
    function 重生(无) {
    候选 = ((宽 * 高) - 1);
    尝试 = 0;
    for (_i = 0; _i < 400; _i++) {
    if ((候选 < 0)) {
    候选 = ((宽 * 高) - 1);
}
    if (hitSelf(候选)) {
    候选 = (候选 - 1);
}
else {
    if ((候选 === 食)) {
    候选 = (候选 - 1);
}
else {
    食 = 候选;
    return null;
}
}
    尝试 = (尝试 + 1);
}
}
    function goUp(e) {
    if ((dir === "下")) {
    return null;
}
    nextD = "上";
    if (!运行) {
    return null;
}
    if (done) {
    return null;
}
    走();
}
    function goDown(e) {
    if ((dir === "上")) {
    return null;
}
    nextD = "下";
    if (!运行) {
    return null;
}
    if (done) {
    return null;
}
    走();
}
    function goLeft(e) {
    if ((dir === "右")) {
    return null;
}
    nextD = "左";
    if (!运行) {
    return null;
}
    if (done) {
    return null;
}
    走();
}
    function goRight(e) {
    if ((dir === "左")) {
    return null;
}
    nextD = "右";
    if (!运行) {
    return null;
}
    if (done) {
    return null;
}
    走();
}
    function 开始(e) {
    if (done) {
    重开();
}
    运行 = true;
    隐("S");
    显("P");
    计号 = startLoop(走, 速);
}
    function 暂停(e) {
    运行 = false;
    if ((计号 !== null)) {
    stopLoop(计号);
}
    计号 = null;
    显("S");
    隐("P");
}
    function 重开(e) {
    if ((计号 !== null)) {
    stopLoop(计号);
}
    计号 = null;
    长 = 3;
    s1 = 210;
    s2 = 209;
    s3 = 208;
    dir = "右";
    nextD = "右";
    食 = 215;
    分 = 0;
    速 = 220;
    运行 = false;
    done = false;
    息.设置文本("分数：0   长度：3");
    渲染();
    显("S");
    隐("P");
    隐("R");
}
    function 造b(文, cls, 处理, iid) {
    b = 文档.创建元素("button");
    b.设置文本(文);
    b.设置属性("id", ("B" + iid));
    b.设置样式("padding", "6px 14px");
    b.设置样式("margin", "2px");
    b.设置样式("border", "0");
    b.设置样式("borderRadius", "6px");
    b.设置样式("cursor", "pointer");
    b.设置样式("fontSize", "14px");
    if ((cls === "up")) {
    b.设置样式("background", "#10b981");
}
    if ((cls === "up")) {
    b.设置样式("color", "#fff");
}
    if ((cls === "ov")) {
    b.设置样式("background", "#8b5cf6");
}
    if ((cls === "ov")) {
    b.设置样式("color", "#fff");
}
    if ((cls === "re")) {
    b.设置样式("background", "#ef4444");
}
    if ((cls === "re")) {
    b.设置样式("color", "#fff");
}
    if ((cls === "st")) {
    b.设置样式("background", "#0ea5e9");
}
    if ((cls === "st")) {
    b.设置样式("color", "#fff");
}
    if ((cls === "hd")) {
    b.设置样式("display", "none");
}
    b.添加事件监听("click", 处理);
    页.追加子节点(b);
}
    function 显(i) {
    tmp8 = 文档.获取元素按id(("B" + i));
    tmp8.设置样式("display", "inline-block");
}
    function 隐(i) {
    tmp9 = 文档.获取元素按id(("B" + i));
    tmp9.设置样式("display", "none");
}
    渲染();
    造b("↑ 上", "up", goUp, "U");
    造b("↓ 下", "up", goDown, "D");
    造b("← 左", "up", goLeft, "L");
    造b("→ 右", "up", goRight, "R0");
    tmpbr1 = 文档.创建元素("br");
    页.追加子节点(tmpbr1);
    造b("▶ 开始", "st", 开始, "S");
    造b("⏸ 暂停", "ov", 暂停, "P");
    造b("🔄 重开", "re", 重开, "R");
    隐("P");
    隐("R");
})(console);