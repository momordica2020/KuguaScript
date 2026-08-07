# 苦瓜脚本 · VS Code 扩展

为 `.ks` 文件提供语法高亮，并在 VS Code 集成终端中运行苦瓜脚本
（复用项目内的 [cli.js](../cli.js)，支持 `询问`/`确认` 等交互输入）。

## 功能

- `.ks` 文件语法高亮（关键字、字符串、数字、布尔/空值、注释、函数调用、成员访问）
- 注释/中文括号（`（）【】` 与 `“”`）自动配对
- 专属配色主题"苦瓜脚本（深色）"：`Ctrl+K Ctrl+T` 选择，保证各类元素颜色区分明显
- 右键或命令面板运行：
  - `苦瓜脚本：在控制台运行` —— 在集成终端中运行当前文件
  - `苦瓜脚本：编译为 JavaScript` —— 编译结果输出到输出面板

在 `.ks` 文件编辑区内按 `F5` 直接"在控制台运行"（覆盖默认的调试快捷键），
`Ctrl+F5` 编译为 JavaScript。

语法高亮覆盖当前全部语言特性：中文数字索引、`的`语缀灰显、
把/设字句、`当…时`/`每当…就`/`遍历`、流水句（先/再/然后/最后）、
`尝试…如果报错`、`引入/导出/等待` 等关键字。

## 安装与试用

### 直接安装（推荐）

本目录下已有打包好的安装包：`kuguascript-vscode-0.2.0.vsix`。
在 VS Code 中打开命令面板（`Ctrl+Shift+P`）→ "Extensions: Install from VSIX…"，
选择该文件即可安装。插件内置了编译器（`cli.js` + `src/`），安装后完全自包含。

### 开发调试

1. 用 VS Code 打开本目录（`vscode-extension/`）。
2. 按 `F5` 启动"扩展开发主机"，会自动打开一个新的 VS Code 窗口。
3. 在新窗口中打开任意 `.ks` 文件即可看到高亮；
   在编辑区右键 → `苦瓜脚本：在控制台运行`（或打开命令面板 `Ctrl+Shift+P` 输入"苦瓜脚本"）。

开发模式下插件会优先使用仓库根目录的 `cli.js`；安装版则使用内置编译器。

### 重新打包

```powershell
.\build.ps1
```

脚本会生成新的 `kuguascript-vscode-<版本>.vsix`（内含编译器与图标）。

## 发布流程（每次发布必做）

1. **递增版本号**：修改 `package.json` 的 `version` 字段。
2. **写更新说明**：在 `CHANGELOG.md` 顶部新增一条，注明版本号与日期，概述新增/修复内容。
3. **打包**：运行 `.\build.ps1`，生成 `kuguascript-vscode-<版本>.vsix`（包内已含更新说明）。
4. **提交并打标签**：

   ```bash
   git add -A
   git commit -m "发布 v0.2.0：…"
   git tag v0.2.0
   git push origin main --tags
   ```

5. **发布到 VS Code Marketplace**（需要发布者 PAT，仅本机有凭据时执行）：

   ```bash
   npx @vscode/vsce publish
   ```

   或把 `kuguascript-vscode-<版本>.vsix` 上传到 GitHub Release 页面，
   供用户直接安装。

## 配置

`设置 → 搜索"苦瓜脚本"`：

- `kugua.nodePath` —— Node.js 可执行文件路径，默认使用 PATH 中的 `node`。

## 说明

- 打包版插件自包含编译器，可独立安装使用；开发调试时自动回退到仓库的 `cli.js`。
- 终端默认编码建议使用 UTF-8（Windows 下 `chcp 65001` 或 Windows Terminal）；
  `询问` 已兼容 UTF-8/GBK 两种输入。
