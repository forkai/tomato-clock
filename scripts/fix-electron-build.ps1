# Electron Builder 缓存准备脚本
# 使用前请确保已安装 7zip-bin: npm install 7zip-bin --save-dev

param(
    [switch]$SkipWinCodeSign,
    [switch]$SkipNSIS
)

$ErrorActionPreference = "Stop"
$cacheBase = "$env:LOCALAPPDATA\electron-builder\cache"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Electron Builder 缓存准备脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 关闭 Electron 进程
Write-Host "`n[1/4] 关闭 Electron 进程..." -ForegroundColor Yellow
Stop-Process -Name electron -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# 删除锁定目录
Write-Host "[2/4] 删除锁定目录..." -ForegroundColor Yellow
$projectDist = "C:\文档\Code\projects\dist\win-unpacked"
if (Test-Path $projectDist) {
    Remove-Item -Path $projectDist -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  已删除: $projectDist" -ForegroundColor Green
}

# 准备 winCodeSign
if (-not $SkipWinCodeSign) {
    Write-Host "[3/4] 准备 winCodeSign..." -ForegroundColor Yellow
    $winCodeSignDir = "$cacheBase\winCodeSign\winCodeSign-2.6.0"
    $winCodeSignZip = "$winCodeSignDir\winCodeSign-2.6.0.7z"

    New-Item -Path $winCodeSignDir -ItemType Directory -Force | Out-Null

    if (-not (Test-Path $winCodeSignZip)) {
        Write-Host "  下载 winCodeSign..." -ForegroundColor Gray
        Invoke-WebRequest -Uri "https://npmmirror.com/mirrors/electron-builder-binaries/winCodeSign-2.6.0/winCodeSign-2.6.0.7z" -OutFile $winCodeSignZip -UseBasicParsing
    }

    if (-not (Test-Path "$winCodeSignDir\rcedit-x64.exe")) {
        Write-Host "  解压 winCodeSign..." -ForegroundColor Gray
        $sevenBin = "C:\文档\Code\projects\node_modules\7zip-bin\win\x64\7za.exe"
        if (Test-Path $sevenBin) {
            & $sevenBin x $winCodeSignZip "-o$($winCodeSignDir -replace '\\', '/')" -y
        } else {
            Write-Host "  警告: 7za.exe 未找到，请先运行: npm install 7zip-bin --save-dev" -ForegroundColor Red
        }
    }
    Write-Host "  winCodeSign 准备完成" -ForegroundColor Green
}

# 准备 NSIS
if (-not $SkipNSIS) {
    Write-Host "[4/4] 准备 NSIS..." -ForegroundColor Yellow
    $nsisDir = "$cacheBase\nsis\nsis-3.0.4.1"
    $nsisZip = "$nsisDir\nsis-3.0.4.1.7z"

    New-Item -Path $nsisDir -ItemType Directory -Force | Out-Null

    if (-not (Test-Path $nsisZip)) {
        Write-Host "  下载 NSIS..." -ForegroundColor Gray
        Invoke-WebRequest -Uri "https://npmmirror.com/mirrors/electron-builder-binaries/nsis-3.0.4.1/nsis-3.0.4.1.7z" -OutFile $nsisZip -UseBasicParsing
    }

    if (-not (Test-Path "$nsisDir\makensis.exe")) {
        Write-Host "  解压 NSIS..." -ForegroundColor Gray
        $sevenBin = "C:\文档\Code\projects\node_modules\7zip-bin\win\x64\7za.exe"
        if (Test-Path $sevenBin) {
            & $sevenBin x $nsisZip "-o$($nsisDir -replace '\\', '/')" -y
        } else {
            Write-Host "  警告: 7za.exe 未找到，请先运行: npm install 7zip-bin --save-dev" -ForegroundColor Red
        }
    }
    Write-Host "  NSIS 准备完成" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "缓存准备完成！现在可以运行:" -ForegroundColor Green
Write-Host "  npm run electron:build" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
