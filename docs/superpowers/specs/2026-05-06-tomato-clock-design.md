# 番茄钟桌面应用设计规范

## 上下文

开发一个番茄钟桌面软件，技术栈：Electron + sql.js + React + shadcn/ui + Tailwind CSS。使用 React Hooks 完全接管所有状态管理。需求已明确：

- 固定标准时长：25分钟工作 / 5分钟休息 / 15分钟长休息（每4个番茄后）
- 完整统计数据：今日/本周基本统计 + 每日趋势、连续专注天数
- 数据持久化：SQLite本地存储（sql.js）
- 通知提醒：系统通知 + 提示音 + 桌面悬浮小组件
- 界面风格：深色沉浸主题

## 架构设计

### 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Electron |
| 前端框架 | React 18 + Hooks |
| UI 组件库 | shadcn/ui |
| 样式 | Tailwind CSS |
| 数据库 | sql.js (SQLite in WASM) |
| 构建工具 | Vite + electron-builder |

### 目录结构

```
tomato-clock/                   # 项目根目录
├── electron/                   # Electron 主进程
│   ├── main.js                # 主进程入口
│   ├── preload.js             # 预加载脚本
│   └── tray.js                # 系统托盘管理
├── src/                        # React 渲染进程
│   ├── components/            # UI 组件
│   │   ├── Timer/            # 计时器核心组件
│   │   │   ├── TimerDisplay.jsx    # 计时器显示
│   │   │   ├── TimerControls.jsx   # 开始/暂停/重置
│   │   │   └── ProgressRing.jsx    # 圆形进度环
│   │   ├── Stats/             # 统计面板
│   │   │   ├── TodayStats.jsx      # 今日统计
│   │   │   ├── WeekStats.jsx       # 本周统计
│   │   │   └── TrendChart.jsx      # 趋势图表
│   │   ├── Notification/      # 通知组件
│   │   │   └── NotificationToast.jsx
│   │   └── ui/               # shadcn/ui 组件
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       └── ...
│   ├── hooks/                # 自定义 Hooks
│   │   ├── useTimer.js              # 计时器逻辑
│   │   ├── useDatabase.js           # 数据库操作
│   │   │   ├── initDatabase.js      # 初始化数据库
│   │   │   ├── getStats.js          # 获取统计数据
│   │   │   └── saveSession.js      # 保存番茄会话
│   │   ├── useNotification.js      # 通知提醒
│   │   └── useSettings.js          # 设置管理
│   ├── utils/                # 工具函数
│   │   ├── constants.js            # 常量定义
│   │   └── time.js                 # 时间格式化
│   ├── App.jsx               # 根组件
│   ├── main.jsx              # React 入口
│   └── index.css            # 全局样式 (Tailwind)
├── __tests__/               # 单元测试
│   ├── hooks/
│   │   ├── useTimer.test.js
│   │   ├── useDatabase.test.js
│   │   └── useNotification.test.js
│   └── utils/
│       └── time.test.js
├── package.json
├── vite.config.js
├── tailwind.config.js
├── electron-builder.yml
├── SPEC.md
└── README.md
```

## 功能模块

### 1. 计时器模块 (Timer)

**核心逻辑：**
- 固定25分钟工作 → 5分钟短休息 → 循环4次 → 15分钟长休息
- 使用 `useTimer` Hook 管理倒计时状态
- 支持开始、暂停、重置操作
- 完成后触发系统通知 + 提示音

**状态：**
```javascript
{
  mode: 'work' | 'shortBreak' | 'longBreak',
  timeRemaining: number,    // 秒
  isRunning: boolean,
  sessionsCompleted: number // 本轮已完成的番茄数
}
```

### 2. 统计模块 (Stats)

**数据记录：**
- 每次番茄完成记录：时间戳、持续时长、类型
- SQL表：`sessions(id, started_at, duration, type)`

**统计维度：**
- 今日：完成番茄数、总专注时长
- 本周：按日统计，柱状图展示
- 连续专注天数：连续有完成番茄的天数

**实现：**
- `useDatabase` Hook 封装所有数据库操作
- sql.js 初始化后自动建表

### 3. 通知模块 (Notification)

**组件：**
- 系统桌面通知（Electron Notification API）
- 提示音播放（Web Audio API）
- 桌面悬浮窗口（Always on top 的 Electron BrowserWindow）

**悬浮窗口规格：**
- 尺寸：200x80 像素
- 位置：屏幕右上角
- 无边框、始终置顶、点击可关闭
- 显示："番茄钟完成！" + 休息类型提示

### 4. 数据持久化 (Database)

**sql.js 工作流程：**
1. Electron 主进程加载 sql-wasm.wasm
2. 通过 preload 暴露数据库 API 到渲染进程
3. React 端通过 `window.electronDB` 调用

**表结构：**
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  duration INTEGER NOT NULL,
  type TEXT NOT NULL
);

CREATE INDEX idx_started_at ON sessions(started_at);
```

## 组件设计

### TimerDisplay
- 大号数字显示剩余时间（MM:SS格式）
- 根据当前模式显示不同颜色文字

### ProgressRing  
- SVG 圆形进度条
- 进度 = (总时间 - 剩余时间) / 总时间
- 平滑动画过渡

### TimerControls
- 开始/暂停按钮（图标切换）
- 重置按钮（只在非运行时可用）

### StatsPanel
- 卡片式布局
- 今日统计：完成数、总时长
- 本周趋势：7日柱状图

## 验证方案

1. **开发验证**：运行 `npm run dev` 启动开发服务器
2. **功能验证**：
   - 启动番茄钟，观察倒计时
   - 完成25分钟后检查通知
   - 检查悬浮窗口是否弹出
   - 重启应用后统计数据是否保留
3. **测试**：`npm test` 运行所有单元测试
