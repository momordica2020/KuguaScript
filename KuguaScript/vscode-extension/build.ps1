# 苦瓜脚本 VS Code 插件打包脚本
# 生成 kuguascript-vscode-<版本>.vsix（自包含：内置编译器 src/ 与 cli.js）
$ErrorActionPreference = 'Stop'

$extRoot = $PSScriptRoot
$pkg = Get-Content (Join-Path $extRoot 'package.json') -Raw | ConvertFrom-Json
$vsix = Join-Path $extRoot ("{0}-{1}.vsix" -f $pkg.name, $pkg.version)

# 1. 准备暂存目录
$staging = Join-Path ([System.IO.Path]::GetTempPath()) ('kugua-vsix-' + [guid]::NewGuid().ToString('N'))
$extStage = Join-Path $staging 'extension'
New-Item -ItemType Directory -Path (Join-Path $extStage 'syntaxes') -Force | Out-Null

try {
    # 2. 复制插件本体
    Copy-Item -LiteralPath (Join-Path $extRoot 'package.json') -Destination $extStage
    Copy-Item -LiteralPath (Join-Path $extRoot 'extension.js') -Destination $extStage
    Copy-Item -LiteralPath (Join-Path $extRoot 'README.md') -Destination $extStage
    Copy-Item -LiteralPath (Join-Path $extRoot 'CHANGELOG.md') -Destination $extStage
    Copy-Item -LiteralPath (Join-Path $extRoot 'language-configuration.json') -Destination $extStage
    Copy-Item -LiteralPath (Join-Path $extRoot 'syntaxes\kugua.tmLanguage.json') -Destination (Join-Path $extStage 'syntaxes')
    Copy-Item -LiteralPath (Join-Path $extRoot 'themes') -Destination $extStage -Recurse

    # 3. 复制内置编译器（cli.js + src/），使插件可独立运行
    Copy-Item -LiteralPath (Join-Path $extRoot '..\cli.js') -Destination $extStage
    Copy-Item -LiteralPath (Join-Path $extRoot '..\src') -Destination $extStage -Recurse

    # 4. 生成图标（绿色圆角方块 + 白色"苦"字）
    Add-Type -AssemblyName System.Drawing
    $icon = New-Object System.Drawing.Bitmap 256, 256
    $g = [System.Drawing.Graphics]::FromImage($icon)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::Transparent)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $r = 52
    $rect = New-Object System.Drawing.RectangleF 14, 14, 228, 228
    $path.AddArc($rect.X, $rect.Y, $r * 2, $r * 2, 180, 90)
    $path.AddArc($rect.X + $rect.Width - $r * 2, $rect.Y, $r * 2, $r * 2, 270, 90)
    $path.AddArc($rect.X + $rect.Width - $r * 2, $rect.Y + $rect.Height - $r * 2, $r * 2, $r * 2, 0, 90)
    $path.AddArc($rect.X, $rect.Y + $rect.Height - $r * 2, $r * 2, $r * 2, 90, 90)
    $path.CloseFigure()

    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush `
        (New-Object System.Drawing.Rectangle 0, 0, 256, 256), `
        ([System.Drawing.Color]::FromArgb(96, 190, 108)), `
        ([System.Drawing.Color]::FromArgb(38, 106, 58)), 45
    $g.FillPath($brush, $path)

    $font = New-Object System.Drawing.Font 'Microsoft YaHei', 118, ([System.Drawing.FontStyle]::Bold)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString('苦', $font, [System.Drawing.Brushes]::White,
        (New-Object System.Drawing.RectangleF 0, 4, 256, 256), $fmt)

    $icon.Save((Join-Path $extStage 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $icon.Dispose()

    # 5. 复制 VSIX 元数据
    Copy-Item -LiteralPath (Join-Path $extRoot 'build\extension.vsixmanifest') -Destination $staging
    Copy-Item -LiteralPath (Join-Path $extRoot 'build\[Content_Types].xml') -Destination $staging
    Copy-Item -LiteralPath (Join-Path $extRoot 'build\LICENSE') -Destination $extStage

    # 6. 压缩为 .vsix（zip 根目录直接是清单与 extension/ 文件夹）
    if (Test-Path -LiteralPath $vsix) { Remove-Item -LiteralPath $vsix -Force }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($staging, $vsix, [System.IO.Compression.CompressionLevel]::Optimal, $false)

    Write-Host "已生成: $vsix"
    $size = (Get-Item -LiteralPath $vsix).Length
    Write-Host ("大小: {0:N0} 字节" -f $size)
}
finally {
    # 7. 清理暂存目录（仅删除本次创建的临时目录）
    if (Test-Path -LiteralPath $staging) {
        Remove-Item -LiteralPath $staging -Recurse -Force
    }
}
