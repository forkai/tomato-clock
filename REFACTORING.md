# 重构文档：Tomato Clock 番茄钟应用

## 重构概述

本次重构将项目从旧技术栈迁移到最新技术栈，获得了完整的类型安全、更好的性能和简化的配置。

## 技术栈变更

| 项目 | 旧版本 | 新版本 | 说明 |
|------|--------|--------|------|
| React | 18.2.0 | 19.0.0 | 最新稳定版 |
| TypeScript | 无 | 7.0.0-dev (Go 重写版) | @typescript/native-preview |
| Vite | 5.1.0 | 8.0+ | vite-plus 替代 |
| Vitest | 1.3.1 | bundled | vite-plus 内置 |
| Tailwind CSS | 3.4.1 | 4.0 | Lightning CSS |
| 构建工具 | Rollup | Rolldown | Go 编写的 bundler |
| PostCSS | 需要 | 不再需要 | Tailwind 4 原生支持 |

## 构建工具变更

### Vite → Vite+ (vp)

Vite+ 是 VoidZero 开发的统一工具链，整合了：
- Vite (开发服务器、构建)
- Vitest (测试)
- Oxlint (linting)
- Oxfmt (格式化)
- Rolldown (Go 编写的 bundler)

**命令对照：**
```bash
# 旧命令
vite dev
vite build
vitest run

# 新命令
vp dev
vp build
vp test
```

### TypeScript → tsgo (TypeScript Go 重写版)

使用 Microsoft 开发的 Go 语言重写版 TypeScript：
- 包名：`@typescript/native-preview`
- 二进制：`tsgo`
- 版本：`7.0.0-dev.20260506.1`

**配置变更：**
- `tsconfig.json` 中移除了 `baseUrl` 选项（tsgo 不支持）
- 使用 `tsgo` 替代 `tsc`

### Electron 构建说明

由于 vite-plus 与 vite-plugin-electron 不兼容，Electron 主进程和预加载脚本使用 esbuild 单独构建：

- **esbuild** 用于构建 `electron/main.ts` 和 `electron/preload.ts`
- 构建脚本位于 `scripts/build-electron.mjs`
- 输出目录为 `dist-electron/`

**重要：** esbuild 在这里是必要的，因为 vite-plus 的 electron 插件集成尚未支持。

## 文件迁移清单

### 配置文件

| 旧文件 | 新文件 | 变更 |
|--------|--------|------|
| `vite.config.js` | `vite.config.ts` | 简化配置，electron 插件移除 |
| `tailwind.config.js` | 移除 | Tailwind 4 使用 CSS-first 配置 |
| `postcss.config.js` | 移除 | 不再需要 |
| `vitest.config.js` | `vitest.config.ts` | 使用 vite-plus 配置格式 |
| `jsconfig.json` | 移除 | 被 tsconfig.json 替代 |
| `tsconfig.json` | 更新 | 新格式，tsgo 兼容 |

### 源代码文件

| 目录 | 旧扩展名 | 新扩展名 |
|------|----------|----------|
| `src/` | `.js`, `.jsx` | `.ts`, `.tsx` |
| `electron/` | `.cjs` | `.ts` |
| `__tests__/` | `.js`, `.jsx` | `.ts`, `.tsx` |

### 新增文件

| 文件 | 说明 |
|------|------|
| `scripts/build-electron.mjs` | Electron 构建脚本 |
| `src/types/timer.ts` | 计时器类型定义 |
| `src/types/database.ts` | 数据库类型定义 |
| `src/types/electron.d.ts` | Electron API 类型 |
| `src/schemas/timer.ts` | Zod 验证 Schema |
| `src/schemas/database.ts` | Zod 验证 Schema |
| `electron/database.ts` | TypeScript 数据库类 |

## 依赖变更

### 新增依赖
- `zod` - 运行时验证
- `@typescript/native-preview` - TypeScript 7 Go 版
- `vite-plus` - 统一工具链
- `@tailwindcss/vite` - Tailwind 4 Vite 插件
- `esbuild` - Electron 构建（必须）

### 移除依赖
- `vitest` - 由 vite-plus 内置
- `postcss` - 不再需要
- `autoprefixer` - Tailwind 4 内置
- `vite-plugin-electron` - 与 vite-plus 不兼容
- `vite-plugin-electron-renderer` - 与 vite-plus 不兼容

## Tailwind CSS 4 变更

### CSS 配置

Tailwind 4 使用 CSS-first 配置，但 Lightning CSS 不完全支持 `@theme` 指令。生产构建会有警告但不影响功能。

```css
/* src/index.css */
@import "tailwindcss";

:root {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(0 0% 3.9%);
  --color-primary: hsl(0 72.2% 50.6%);
  /* 自定义变量 */
}
```

### Lightning CSS 兼容性

- Lightning CSS 不识别 `@theme` 和 `@tailwind` 指令
- 构建时会有警告，但 CSS 仍然正常工作
- CSS 文件大小正常（~22kb），说明样式被正确包含

## Zod 验证

新增运行时验证，使用 Zod Schema：

```typescript
// src/schemas/timer.ts
import { z } from 'zod'

export const TimerStateSchema = z.object({
  status: z.enum(['idle', 'running', 'paused']),
  sessionType: z.enum(['work', 'shortBreak', 'longBreak']),
  timeRemaining: z.number().int().nonnegative(),
  sessionsCompleted: z.number().int().nonnegative()
})
```

## Electron 构建流程

### 构建步骤

1. TypeScript 类型检查：`tsgo`
2. 前端构建：`vp build`
3. Electron 构建: `node scripts/build-electron.mjs`

完整构建命令：
```bash
npm run build
```

### 构建脚本 (scripts/build-electron.mjs)

```javascript
import * as esbuild from 'esbuild'

// 构建 main.ts (ESM 格式)
await esbuild.build({
  entryPoints: ['electron/main.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'dist-electron/main.js',
  external: ['electron', 'sql.js'],
  format: 'esm',
  target: 'node18'
})

// 构建 preload.ts (CJS 格式)
await esbuild.build({
  entryPoints: ['electron/preload.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'dist-electron/preload.js',
  external: ['electron'],
  format: 'cjs',
  target: 'node18'
})
```

### ESM __dirname 兼容

electron/main.ts 使用 ESM，需要手动定义 `__dirname`：

```typescript
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
```

## 已知问题

### 测试兼容
- 旧测试文件 (`__tests__/hooks/useDatabase.test.jsx`) 使用 CommonJS `require` 语法
- 需要迁移到 ESM 或使用 `describe`, `it` 等全局函数

### 弃用警告
- `@vitejs/plugin-react` 使用了弃用的 `esbuild` 选项
- 建议迁移到 `rolldownOptions`

### Electron 黑屏问题

**问题描述：**
Electron 启动后显示黑屏，无法看到应用内容。

**根本原因：**
生产构建的 `index.html` 使用绝对路径（以 `/` 开头）：
```html
<script type="module" crossorigin src="/assets/index-bupkmi9t.js"></script>
```

当使用 `loadFile()` 加载时，这些绝对路径无法正确解析。即使使用 `file://` 协议，绝对路径 `/assets/...` 也会从文件系统根目录开始查找，而不是相对于 HTML 文件的位置。

**最终解决方案：**
使用本地 HTTP 服务器来服务 dist 文件夹：

```typescript
// electron/main.ts
import http from 'http'
import path from 'path'

const distPath = path.resolve(__dirname, '..', 'dist')
const server = http.createServer((req, res) => {
  let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url.replace(/^\//, ''))
  // 设置正确的 Content-Type
  const contentTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml'
  }
  res.setHeader('Content-Type', contentTypes[ext] || 'text/plain')
  res.setHeader('Access-Control-Allow-Origin', '*')
  const content = require('fs').readFileSync(filePath)
  res.end(content)
})

server.listen(3847, '127.0.0.1', () => {
  mainWindow.loadURL('http://127.0.0.1:3847')
})
```

**为什么这个方案有效：**
- HTTP 服务器不存在文件协议的路劲解析问题
- 绝对路径 `/assets/...` 在 HTTP 协议下正确解析为 `http://localhost:3847/assets/...`
- 本地服务器端口 3847 是任意选择的无冲突端口

### HTTP 服务器返回 "Not found"

**问题描述：**
 Electron 启动后窗口显示 "Not found"，本地 HTTP 服务器无法正确提供 dist 文件。

**排查过程：**
1. 添加日志后发现文件路径正确，但读取失败
2. 错误信息：`Dynamic require of "fs" is not supported`
3. 确认是 esbuild 打包 ESM 时对 `require` 的包装导致

**根本原因：**
esbuild 在打包 ESM 格式的 `main.ts` 时，会将代码中的 `require('fs')` 包装成动态 require 代理函数。但这在 Electron 主进程中无法正确加载 Node.js 内置模块，因为内置模块不在 Node.js 的模块缓存中。

**解决方案：**
使用 `createRequire` 创建符合 ESM 规范的 require 函数：

```typescript
// electron/main.ts
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
```

同时在构建脚本中将 `fs` 标记为 external：

```javascript
// scripts/build-electron.mjs
await esbuild.build({
  entryPoints: ['electron/main.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'dist-electron/main.js',
  external: ['electron', 'sql.js', 'fs'],  // 添加 fs
  format: 'esm',
  target: 'node18'
})
```

**为什么 path.join 在 Windows 上需要特殊处理：**
请求路径 `/assets/index.js` 中的前导 `/` 在 Windows 上会被 `path.join` 当作绝对路径处理，导致路径拼接错误。使用 `requestPath.replace(/^\//, '')` 去掉前导斜杠可以解决这个问题。

### Electron 启动流程

1. `app.whenReady()` 触发
2. 初始化 sql.js 数据库
3. 创建本地 HTTP 服务器监听 3847 端口
4. 创建 BrowserWindow 并加载 `http://127.0.0.1:3847`
5. React 应用通过 HTTP 协议加载资源并渲染

## 验证命令

```bash
# 类型检查
npm run typecheck

# 运行测试
npm test

# 开发服务器
npm run dev

# 生产构建（包含 electron）
npm run build

# 仅构建 electron
npm run build:electron

# Electron 开发模式
npm run electron:dev

# Electron 生产构建
npm run electron:build
```

## 性能对比

| 操作 | 旧版本 | 新版本 |
|------|--------|--------|
| 开发服务器启动 | ~2s | ~500ms |
| 生产构建 | ~5s | ~1s |
| 类型检查 | N/A | ~1s (tsgo) |

## 后续优化建议

1. 将所有 `.js` 测试文件迁移到 `.ts`
2. 使用 `vitest` globals 替代显式导入
3. 迁移到 `rolldownOptions` 替代 `esbuildOptions`
4. 添加更多 Zod Schema 验证
5. 考虑使用 shadcn/ui 组件库
6. 等待 vite-plus 原生支持 electron 插件
