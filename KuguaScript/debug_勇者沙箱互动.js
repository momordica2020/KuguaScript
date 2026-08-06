(function(console) {
    var 样式, tmp, 页, 关标, 勇者, 史, 哥, 龙, 敌, 关, 终, 造卡, 角色, iid, 卡, nm, hbo, hb, hp, st, 盒, tmp1, tmp2, 刷我, 无, 百, tmp3, tmp4, tmp5, 刷敌, tmp6, tmp7, 日, 加, s, d, 巴, 造b, 文, cls, 处理, b, 显, i, tmp8, 隐, tmp9, 攻击, e, 反击, 喝药, 胜, 下一关, tmp10, tmp11, 重开, tmp12, tmp13;
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
    样式.设置文本(".hb{transition:width .3s}.hd{display:none!important}button:hover{opacity:.85}");
    tmp = 文档.头部;
    tmp.追加子节点(样式);
    页 = 文档.创建元素("div");
    页.设置属性("类", "pg");
    tmp = 文档.主体;
    tmp.设置样式("backgroundColor", "#fef3c7");
    tmp.设置样式("margin", "0");
    tmp.设置样式("padding", "16px");
    tmp.设置样式("fontFamily", "sans-serif");
    tmp.追加子节点(页);
    关标 = 文档.创建元素("h2");
    关标.设置文本("第一关：史莱姆");
    关标.设置样式("margin", "0 0 16px 0");
    关标.设置样式("color", "#92400e");
    页.追加子节点(关标);
    勇者 = 对象;
    勇者.名字 = "勇者";
    勇者.生命 = 100;
    勇者.最大 = 100;
    勇者.攻 = 20;
    勇者.金 = 0;
    勇者.药 = 3;
    史 = 对象;
    史.名字 = "史莱姆";
    史.生命 = 50;
    史.最大 = 50;
    史.攻 = 8;
    史.金 = 10;
    哥 = 对象;
    哥.名字 = "哥布林";
    哥.生命 = 80;
    哥.最大 = 80;
    哥.攻 = 15;
    哥.金 = 25;
    龙 = 对象;
    龙.名字 = "巨龙";
    龙.生命 = 180;
    龙.最大 = 180;
    龙.攻 = 28;
    龙.金 = 100;
    敌 = 史;
    关 = 0;
    终 = false;
    function 造卡(角色, iid) {
    卡 = 文档.创建元素("div");
    卡.设置属性("id", ("卡" + iid));
    卡.设置样式("display", "inline-block");
    卡.设置样式("width", "180px");
    卡.设置样式("padding", "12px");
    卡.设置样式("margin", "0 12px 12px 0");
    卡.设置样式("background", "#ffffff");
    卡.设置样式("borderRadius", "10px");
    卡.设置样式("boxShadow", "0 2px 8px rgba(0,0,0,0.1)");
    nm = 文档.创建元素("div");
    nm.设置文本(角色.名字);
    nm.设置样式("fontWeight", "bold");
    nm.设置样式("fontSize", "18px");
    nm.设置样式("marginBottom", "8px");
    卡.追加子节点(nm);
    hbo = 文档.创建元素("div");
    hbo.设置样式("background", "#eeeeee");
    hbo.设置样式("height", "10px");
    hbo.设置样式("borderRadius", "5px");
    hbo.设置样式("overflow", "hidden");
    hb = 文档.创建元素("div");
    hb.设置属性("类", "hb");
    hb.设置属性("id", (iid + "血"));
    hb.设置样式("height", "10px");
    hb.设置样式("background", "#22c55e");
    hb.设置样式("width", "100%");
    hbo.追加子节点(hb);
    卡.追加子节点(hbo);
    hp = 文档.创建元素("div");
    hp.设置属性("id", (iid + "命"));
    hp.设置文本(((("生命：" + 角色.生命) + "/") + 角色.最大));
    hp.设置样式("marginTop", "6px");
    hp.设置样式("fontSize", "13px");
    卡.追加子节点(hp);
    st = 文档.创建元素("div");
    st.设置属性("id", (iid + "资"));
    if ((iid === "me")) {
    st.设置文本(((((("攻：" + 勇者.攻) + " 金：") + 勇者.金) + " 药：") + 勇者.药));
}
    if ((iid === "en")) {
    st.设置文本(((("攻：" + 敌.攻) + " 金：") + 敌.金));
}
    st.设置样式("marginTop", "4px");
    st.设置样式("fontSize", "13px");
    st.设置样式("color", "#555555");
    卡.追加子节点(st);
    return 卡;
}
    盒 = 文档.创建元素("div");
    盒.设置样式("marginBottom", "12px");
    页.追加子节点(盒);
    tmp1 = 造卡(勇者, "me");
    盒.追加子节点(tmp1);
    tmp2 = 造卡(敌, "en");
    盒.追加子节点(tmp2);
    function 刷我(无) {
    百 = ((勇者.生命 * 100) / 勇者.最大);
    if ((百 < 0)) {
    百 = 0;
}
    tmp3 = 文档.获取元素按id("me血");
    tmp3.设置样式("width", (百 + "%"));
    tmp4 = 文档.获取元素按id("me命");
    tmp4.设置文本(((("生命：" + 勇者.生命) + "/") + 勇者.最大));
    tmp5 = 文档.获取元素按id("me资");
    tmp5.设置文本(((((("攻：" + 勇者.攻) + " 金：") + 勇者.金) + " 药：") + 勇者.药));
}
    function 刷敌(无) {
    百 = ((敌.生命 * 100) / 敌.最大);
    if ((百 < 0)) {
    百 = 0;
}
    tmp6 = 文档.获取元素按id("en血");
    tmp6.设置样式("width", (百 + "%"));
    tmp7 = 文档.获取元素按id("en命");
    tmp7.设置文本(((("生命：" + 敌.生命) + "/") + 敌.最大));
}
    日 = 文档.创建元素("div");
    日.设置属性("类", "lg");
    日.设置样式("background", "#fffbeb");
    日.设置样式("border", "1px solid #fcd34d");
    日.设置样式("padding", "10px");
    日.设置样式("borderRadius", "8px");
    日.设置样式("maxHeight", "150px");
    日.设置样式("overflowY", "auto");
    日.设置样式("marginBottom", "12px");
    日.设置样式("fontSize", "14px");
    页.追加子节点(日);
    function 加(s) {
    d = 文档.创建元素("div");
    d.设置文本(("• " + s));
    日.追加子节点(d);
    日.设置样式("scrollTop", "99999");
}
    巴 = 文档.创建元素("div");
    巴.设置样式("marginBottom", "12px");
    页.追加子节点(巴);
    function 造b(文, cls, 处理, iid) {
    b = 文档.创建元素("button");
    b.设置文本(文);
    b.设置属性("类", cls);
    b.设置属性("id", ("B" + iid));
    b.设置样式("padding", "8px 16px");
    b.设置样式("margin", "4px 8px 4px 0");
    b.设置样式("border", "none");
    b.设置样式("borderRadius", "6px");
    b.设置样式("cursor", "pointer");
    b.设置样式("fontSize", "14px");
    if ((cls === "a1")) {
    b.设置样式("background", "#ef4444");
}
    if ((cls === "a1")) {
    b.设置样式("color", "#ffffff");
}
    if ((cls === "p1")) {
    b.设置样式("background", "#3b82f6");
}
    if ((cls === "p1")) {
    b.设置样式("color", "#ffffff");
}
    if ((cls === "n1")) {
    b.设置样式("background", "#22c55e");
}
    if ((cls === "n1")) {
    b.设置样式("color", "#ffffff");
}
    if ((cls === "r1")) {
    b.设置样式("background", "#f59e0b");
}
    if ((cls === "r1")) {
    b.设置样式("color", "#ffffff");
}
    if ((cls === "hd")) {
    b.设置样式("display", "none");
}
    b.添加事件监听("click", 处理);
    巴.追加子节点(b);
}
    function 显(i) {
    tmp8 = 文档.获取元素按id(("B" + i));
    tmp8.设置样式("display", "inline-block");
}
    function 隐(i) {
    tmp9 = 文档.获取元素按id(("B" + i));
    tmp9.设置样式("display", "none");
}
    function 攻击(e) {
    if (终) {
    return null;
}
    敌.生命 = (敌.生命 - 勇者.攻);
    加((((("勇者攻击" + 敌.名字) + "，造成") + 勇者.攻) + "伤害。"));
    刷敌();
    if ((敌.生命 <= 0)) {
    加((((("击败" + 敌.名字) + "，得") + 敌.金) + "金！"));
    勇者.金 = (勇者.金 + 敌.金);
    刷我();
    胜();
    return null;
}
    设置定时器(反击, 300);
}
    function 反击(无) {
    if (终) {
    return null;
}
    勇者.生命 = (勇者.生命 - 敌.攻);
    if ((勇者.生命 < 0)) {
    勇者.生命 = 0;
}
    加((((敌.名字 + "反击，造成") + 敌.攻) + "伤害。"));
    刷我();
    if ((勇者.生命 <= 0)) {
    终 = true;
    加("💀 勇者倒下了...");
    隐("A");
    隐("P");
    显("R");
    关标.设置样式("color", "#dc2626");
    关标.设置文本("💀 游戏结束");
}
}
    function 喝药(e) {
    if (终) {
    return null;
}
    if ((勇者.药 <= 0)) {
    加("⚠ 没药水了！");
    return null;
}
    勇者.药 = (勇者.药 - 1);
    勇者.生命 = (勇者.生命 + 25);
    if ((勇者.生命 > 勇者.最大)) {
    勇者.生命 = 勇者.最大;
}
    加("🧪 喝药水回25生命。");
    刷我();
    设置定时器(反击, 300);
}
    function 胜(无) {
    隐("A");
    隐("P");
    if ((关 === 2)) {
    终 = true;
    显("R");
    关标.设置样式("color", "#16a34a");
    关标.设置文本("🏆 恭喜通关！");
}
else {
    显("N");
    关标.设置样式("color", "#16a34a");
    关标.设置文本("✔ 胜利！点【下一关】继续");
}
}
    function 下一关(e) {
    关 = (关 + 1);
    if ((关 === 1)) {
    敌 = 哥;
    哥.生命 = 哥.最大;
    关标.设置样式("color", "#92400e");
    关标.设置文本("第二关：哥布林");
}
    if ((关 === 2)) {
    敌 = 龙;
    龙.生命 = 龙.最大;
    关标.设置样式("color", "#92400e");
    关标.设置文本("终关：巨龙");
}
    隐("N");
    显("A");
    显("P");
    tmp10 = 文档.获取元素按id("卡en");
    盒.移除子节点(tmp10);
    tmp11 = 造卡(敌, "en");
    盒.追加子节点(tmp11);
    刷敌();
    加("—— 新敌出现 ——");
}
    function 重开(e) {
    勇者.生命 = 勇者.最大;
    勇者.金 = 0;
    勇者.药 = 3;
    史.生命 = 史.最大;
    哥.生命 = 哥.最大;
    龙.生命 = 龙.最大;
    敌 = 史;
    关 = 0;
    终 = false;
    tmp12 = 文档.获取元素按id("卡en");
    盒.移除子节点(tmp12);
    tmp13 = 造卡(敌, "en");
    盒.追加子节点(tmp13);
    刷我();
    刷敌();
    隐("R");
    显("A");
    显("P");
    关标.设置样式("color", "#92400e");
    关标.设置文本("第一关：史莱姆");
    加("—— 重新开始 ——");
}
    造b("⚔ 攻击", "a1", 攻击, "A");
    造b("🧪 喝药水", "p1", 喝药, "P");
    造b("➡ 下一关", "n1", 下一关, "N");
    造b("🔄 重开", "r1", 重开, "R");
    隐("N");
    隐("R");
    加("开始战斗！目标：击败所有敌人。");
})(console);