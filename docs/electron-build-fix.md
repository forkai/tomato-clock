# Electron 构建报错修复指南

## 问题概述

在执行 `npm run electron:build` 时可能遇到多个问题，主要涉及网络下载、工具缺失和目录锁定。

---

## 问题 1：GitHub 资源下载失败

### 错误信息
```
Get "https://github.com/electron/electron/releases/download/v28.3.3/electron-v28.3.3-win32-x64.zip": dial tcp 20.205.243.166:443: connectex: A connection attempt failed
```

### 原因
网络无法访问 GitHub 资源服务器。

### 解决方案

**步骤 1：安装 cross-env**
```bash
npm install -D cross-env
```

**步骤 2：修改 package.json 脚本**

将 `electron:build` 脚本修改为：
```json
{
  "scripts": {
    "electron:build": "cross-env ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/ npm run build && electron-builder"
  }
}
```

---

## 问题 2：winCodeSign 工具缺失

### 错误信息
```
cannot execute cause=exec: "...\\rcedit-x64.exe": file does not exist
```

### 原因
electron-builder 需要 rcedit 工具来设置应用图标和版本信息，但无法从 GitHub 下载。

### 解决方案

**步骤 1：手动下载 winCodeSign**
```powershell
$url = "https://npmmirror.com/mirrors/electron-builder-binaries/winCodeSign-2.6.0/winCodeSign-2.6.0.7z"
$output = "$env:LOCALAPPDATA\electron-builder\cache\winCodeSign\winCodeSign-2.6.0\winCodeSign-2.6.0.7z"
Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
```

**步骤 2：安装 7zip-bin 并解压**
```bash
npm install 7zip-bin --save-dev
```

```powershell
node -e "const seven = require('7zip-bin'); const { spawnSync } = require('child_process'); const sevenZipPath = seven.path7za; const zipPath = '$env:LOCALAPPDATA\\electron-builder\\cache\\winCodeSign\\winCodeSign-2.6.0\\winCodeSign-2.6.0.7z'; const outDir = '$env:LOCALAPPDATA\\electron-builder\\cache\\winCodeSign\\winCodeSign-2.6.0'; spawnSync(sevenZipPath, ['x', zipPath, '-o' + outDir.replace(/\\\\/g, '/'), '-y']);"
```

---

## 问题 3：NSIS 工具缺失

### 错误信息
```
Get "https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.4.1/nsis-3.0.4.1.7z": dial tcp 20.205.243.166:443: connectex: A connection attempt failed
```

### 原因
electron-builder 需要 NSIS 来构建安装程序。

### 解决方案

**步骤 1：创建缓存目录并下载**
```powershell
$cacheDir = "$env:LOCALAPPDATA\electron-builder\cache\nsis\nsis-3.0.4.1"
New-Item -Path $cacheDir -ItemType Directory -Force | Out-Null

$url = "https://npmmirror.com/mirrors/electron-builder-binaries/nsis-3.0.4.1/nsis-3.0.4.1.7z"
$output = "$cacheDir\nsis-3.0.4.1.7z"
Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
```

**步骤 2：解压 NSIS**
```powershell
node -e "const seven = require('7zip-bin'); const { spawnSync } = require('child_process'); const sevenZipPath = seven.path7za; const zipPath = '$env:LOCALAPPDATA\\electron-builder\\cache\\nsis\\nsis-3.0.4.1\\nsis-3.0.4.1.7z'; const outDir = '$env:LOCALAPPDATA\\electron-builder\\cache\\nsis\\nsis-3.0.4.1'; spawnSync(sevenZipPath, ['x', zipPath, '-o' + outDir.replace(/\\\\/g, '/'), '-y']);"
```

---

## 问题 4：目录锁定问题

### 错误信息
```
EPERM, Permission denied: dist\win-unpacked
```

### 原因
之前构建的 Electron 应用仍在运行，锁定了输出目录。

### 解决方案
```powershell
# 关闭所有 Electron 进程
Stop-Process -Name electron -Force -ErrorAction SilentlyContinue

# 删除锁定目录
Remove-Item -Path "dist\win-unpacked" -Recurse -Force
```

---

## 问题 5：入口文件缺失

### 错误信息
```
Application entry file "dist-electron\main.js" does not exist
```

### 原因
electron-builder.yml 配置未包含 dist-electron 目录。

### 解决方案

确保 electron-builder.yml 包含正确的 files 配置：
```yaml
files:
  - dist/**/*
  - dist-electron/*.js
  - package.json
```

---

## 快速修复脚本

创建 `scripts/fix-electron-build.ps1`：

```powershell
# Electron 构建缓存准备脚本
# 使用前请确保已安装 7zip-bin: npm install 7zip-bin --save-dev

param(
    [switch]$SkipElectron,
    [switch]$SkipWinCodeSign,
    [switch]$SkipNSIS
)

$ErrorActionPreference = "Stop"
$cacheBase = "$env:LOCALAPPDATA\electron-builder\cache"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Electron Builder 缓存准备脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 关闭 Electron 进程
Write-Host "`n[1/5] 关闭 Electron 进程..." -ForegroundColor Yellow
Stop-Process -Name electron -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# 删除锁定目录
Write-Host "[2/5] 删除锁定目录..." -ForegroundColor Yellow
$projectDist = "C:\文档\Code\projects\dist\win-unpacked"
if (Test-Path $projectDist) {
    Remove-Item -Path $projectDist -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  已删除: $projectDist" -ForegroundColor Green
}

# 准备 winCodeSign
if (-not $SkipWinCodeSign) {
    Write-Host "[3/5] 准备 winCodeSign..." -ForegroundColor Yellow
    $winCodeSignDir = "$cacheBase\winCodeSign\winCodeSign-2.6.0"
    $winCodeSignZip = "$winCodeSignDir\winCodeSign-2.6.0.7z"

    New-Item -Path $winCodeSignDir -ItemType Directory -Force | Out-Null

    if (-not (Test-Path $winCodeSignZip)) {
        Write-Host "  下载 winCodeSign..." -ForegroundColor Gray
        Invoke-WebRequest -Uri "https://npmmirror.com/mirrors/electron-builder-binaries/winCodeSign-2.6.0/winCodeSign-2.6.0.7z" -OutFile $winCodeSignZip -UseBasicParsing
    }

    if (-not (Test-Path "$winCodeSignDir\rcedit-x64.exe")) {
        Write-Host "  解压 winCodeSign..." -ForegroundColor Gray
        node -e "const seven = require('7zip-bin'); const { spawnSync } = require('child_process'); spawnSync(seven.path7za, ['x', '$winCodeSignZip', '-o$winCodeSignDir'.replace(/\\\\/g, '/'), '-y']);"
    }
    Write-Host "  winCodeSign 准备完成" -ForegroundColor Green
}

# 准备 NSIS
if (-not $SkipNSIS) {
    Write-Host "[4/5] 准备 NSIS..." -ForegroundColor Yellow
    $nsisDir = "$cacheBase\nsis\nsis-3.0.4.1"
    $nsisZip = "$nsisDir\nsis-3.0.4.1.7z"

    New-Item -Path $nsisDir -ItemType Directory -Force | Out-Null

    if (-not (Test-Path $nsisZip)) {
        Write-Host "  下载 NSIS..." -ForegroundColor Gray
        Invoke-WebRequest -Uri "https://npmmirror.com/mirrors/electron-builder-binaries/nsis-3.0.4.1/nsis-3.0.4.1.7z" -OutFile $nsisZip -UseBasicParsing
    }

    if (-not (Test-Path "$nsisDir\makensis.exe")) {
        Write-Host "  解压 NSIS..." -ForegroundColor Gray
        node -e "const seven = require('7zip-bin'); const { spawnSync } = require('child_process'); spawnSync(seven.path7za, ['x', '$nsisZip', '-o$nsisDir'.replace(/\\\\/g, '/'), '-y']);"
    }
    Write-Host "  NSIS 准备完成" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "缓存准备完成！现在可以运行:" -ForegroundColor Green
Write-Host "  npm run electron:build" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
```

---

## 常用命令

```bash
# 安装依赖
npm install -D cross-env 7zip-bin

# 准备缓存
powershell -ExecutionPolicy Bypass -File scripts/fix-electron-build.ps1

# 执行构建
npm run electron:build
```

---

## 镜像说明

本项目使用 npmmirror（淘宝镜像）作为 electron-builder 的下载源，配置如下：

| 变量名 | 镜像地址 |
|--------|----------|
| ELECTRON_MIRROR | https://npmmirror.com/mirrors/electron/ |
| ELECTRON_BUILDER_BINARIES_MIRROR | https://npmmirror.com/mirrors/electron-builder-binaries/ |

如果需要切换回官方源，删除 package.json 中 cross-env 后面的环境变量设置即可。

---

## 常见问题

**Q: 为什么 electron-builder 需要手动下载这些工具？**

A: 因为 electron-builder 默认从 GitHub 下载，但国内网络访问 GitHub 经常超时或失败。

**Q: 7z 文件无法解压？**

A: Windows 自带的 Expand-Archive 只支持 zip 格式，需要使用 7zip 或 7zip-bin 包。

**Q: 缓存文件放在哪里？**

A: Windows 上默认在 `%LOCALAPPDATA%\electron-builder\cache\` 目录。
