# 番茄钟桌面应用

基于 Electron + React 的番茄钟桌面软件，支持数据统计和多种通知方式。

## 功能特性

- **标准番茄钟**：25分钟专注 + 5分钟短休息，每4个番茄后15分钟长休息
- **数据持久化**：使用 sql.js (SQLite in WASM) 本地存储所有记录
- **完整统计**：今日完成数、本周趋势图表
- **多种通知**：系统桌面通知 + 提示音 + 桌面悬浮窗口
- **深色主题**：护眼深色界面设计

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Electron 28 |
| 前端框架 | React 18 + Hooks |
| UI 组件 | shadcn/ui + Radix UI |
| 样式 | Tailwind CSS |
| 数据库 | sql.js (SQLite in WASM) |
| 构建工具 | Vite + electron-builder |

## 文件架构

```
tomato-clock/
├── electron/                   # Electron 主进程
│   ├── main.js                 # 主进程入口
│   ├── preload.js              # 预加载脚本
│   └── notification-window.js  # 悬浮通知窗口
├── src/                        # React 渲染进程
│   ├── components/
│   │   ├── Timer/             # 计时器组件
│   │   │   ├── TimerDisplay.jsx
│   │   │   ├── TimerControls.jsx
│   │   │   └── ProgressRing.jsx
│   │   ├── Stats/             # 统计组件
│   │   │   ├── TodayStats.jsx
│   │   │   ├── WeekStats.jsx
│   │   │   └── TrendChart.jsx
│   │   ├── Notification/      # 通知组件
│   │   │   └── NotificationToast.jsx
│   │   └── ui/               # shadcn/ui 基础组件
│   ├── hooks/                # 自定义 Hooks
│   │   ├── useTimer.js       # 计时器逻辑
│   │   ├── useDatabase.js   # 数据库操作
│   │   └── useNotification.js # 通知提醒
│   ├── utils/                # 工具函数
│   │   ├── constants.js      # 常量定义
│   │   └── time.js           # 时间格式化
│   ├── App.jsx              # 根组件
│   └── main.jsx             # React 入口
├── __tests__/               # 单元测试
│   ├── hooks/
│   │   └── useTimer.test.js
│   └── utils/
│       └── time.test.js
├── docs/                     # 文档
│   └── superpowers/         # GSD 规划文档
├── package.json
├── vite.config.js
├── tailwind.config.js
└── electron-builder.yml
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
npm run electron:build
```

### 运行测试

```bash
npm test
```

## 使用说明

1. **开始计时**：点击「开始」按钮启动番茄钟
2. **暂停/重置**：计时过程中可随时暂停或重置
3. **查看统计**：向下滚动查看今日和本周统计
4. **完成通知**：番茄钟结束后会收到系统通知和提示音

## 数据存储

所有数据存储在本地的 SQLite 数据库中：
- macOS: `~/Library/Application Support/tomato-clock/`
- Windows: `%APPDATA%/tomato-clock/`
- Linux: `~/.config/tomato-clock/`

## 开发相关

- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [shadcn/ui](https://ui.shadcn.com/) - 优秀的 UI 组件库
- [sql.js](https://sql.js.org/) - SQLite 的 WebAssembly 移植版本