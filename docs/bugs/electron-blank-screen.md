# Bug 记录：Electron 窗口纯黑问题

## 问题描述

运行 `npx electron .` 后，窗口显示纯黑色，没有任何内容。

## 根本原因

`electron/main.cjs` 中的开发环境检测逻辑：

```javascript
if (process.env.NODE_ENV === 'development') {
```

问题是：
1. `NODE_ENV` 默认是 `undefined`（不是 `development`）
2. Electron 主进程不读取 Vite 的 `.env` 文件
3. 即使 Vite dev server 在运行，Electron 也无法正确检测到

## 修复方案

修改 `electron/main.cjs` 中的环境检测逻辑，使用更可靠的方式：

```javascript
// 使用 VITE_DEV_SERVER 环境变量检测开发服务器
const isDev = process.env.VITE_DEV_SERVER || process.env.NODE_ENV === 'development';
if (isDev) {
```

或者直接默认尝试连接本地 dev server，因为：

- **生产环境**：`loadFile()` 会加载 `dist/index.html`，肯定有内容
- **开发环境**：尝试连接 localhost:5173/5174/5175/5176/5177 自动重试

## 预防措施

1. 不要依赖 `NODE_ENV` 来判断是否开发环境
2. Dev server 重试逻辑应该有更长的等待时间
3. 添加更详细的日志输出，帮助诊断问题

## 时间线

- 初始版本可能正常工作
- 后续修改导致检测逻辑失效
- 重新修复后恢复正常