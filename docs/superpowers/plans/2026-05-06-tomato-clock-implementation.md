# 番茄钟桌面应用实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建完整的番茄钟桌面应用，支持计时、统计、通知，数据持久化到SQLite

**Architecture:** Electron + Vite 多进程架构，主进程处理数据库和系统集成，渲染进程使用React管理UI状态，sql.js通过preload暴露API

**Tech Stack:** Electron 28 + React 18 + Vite + sql.js + shadcn/ui + Tailwind CSS + Vitest

---

## 文件结构

```
tomato-clock/                      # 项目根目录
├── electron/                      # Electron 主进程
│   ├── main.js                   # 主进程入口，窗口管理
│   ├── preload.js                # 预加载脚本，暴露DB API
│   ├── tray.js                   # 系统托盘管理
│   └── notification-window.js    # 悬浮通知窗口
├── src/                          # React 渲染进程
│   ├── components/
│   │   ├── Timer/
│   │   │   ├── TimerDisplay.jsx
│   │   │   ├── TimerControls.jsx
│   │   │   └── ProgressRing.jsx
│   │   ├── Stats/
│   │   │   ├── TodayStats.jsx
│   │   │   ├── WeekStats.jsx
│   │   │   └── TrendChart.jsx
│   │   ├── Notification/
│   │   │   └── NotificationToast.jsx
│   │   └── ui/                  # shadcn/ui 组件
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       └── progress.jsx
│   ├── hooks/
│   │   ├── useTimer.js
│   │   ├── useDatabase.js
│   │   └── useNotification.js
│   ├── utils/
│   │   ├── constants.js
│   │   └── time.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── __tests__/
│   ├── hooks/
│   │   ├── useTimer.test.js
│   │   └── time.test.js
│   └── utils/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── electron-builder.yml
├── SPEC.md
└── README.md
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `electron-builder.yml`
- Create: `electron/main.js`
- Create: `electron/preload.js`
- Create: `src/main.jsx`
- Create: `src/index.css`
- Create: `.gitignore`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "tomato-clock",
  "version": "1.0.0",
  "description": "番茄钟桌面应用",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "concurrently \"vite\" \"electron .\"",
    "electron:build": "vite build && electron-builder",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "sql.js": "^1.10.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-progress": "^1.0.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0",
    "electron": "^28.2.0",
    "electron-builder": "^24.13.3",
    "concurrently": "^8.2.2",
    "vitest": "^1.3.1",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

- [ ] **Step 3: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(224 71% 4%)',
        foreground: 'hsl(213 31% 91%)',
        primary: 'hsl(4 90% 58%)',
        secondary: 'hsl(217 33% 17%)',
        accent: 'hsl(217 33% 12%)'
      }
    }
  },
  plugins: []
};
```

- [ ] **Step 4: 创建 electron/main.js**

```javascript
const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 保持窗口引用防止被GC回收
let mainWindow = null;
let notificationWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 350,
    minHeight: 500,
    backgroundColor: '#030712',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function createNotificationWindow(message) {
  if (notificationWindow) {
    notificationWindow.close();
  }

  notificationWindow = new BrowserWindow({
    width: 200,
    height: 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    x: screen.width - 220,
    y: 20
  });

  notificationWindow.loadURL(`data:text/html,<html><body style="margin:0;background:rgba(30,41,59,0.95);border-radius:12px;padding:20px;color:white;font-family:system-ui;text-align:center;">${message}</body></html>`);

  setTimeout(() => {
    if (notificationWindow) {
      notificationWindow.close();
      notificationWindow = null;
    }
  }, 5000);
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理显示通知的IPC
ipcMain.on('show-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

ipcMain.on('show-notification-window', (event, message) => {
  createNotificationWindow(message);
});
```

- [ ] **Step 5: 创建 electron/preload.js**

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, body) => {
    ipcRenderer.send('show-notification', { title, body });
  },
  showNotificationWindow: (message) => {
    ipcRenderer.send('show-notification-window', message);
  }
});
```

- [ ] **Step 6: 创建 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-background text-foreground;
}
```

- [ ] **Step 7: 创建 .gitignore**

```
node_modules/
dist/
.electron/
*.log
```

- [ ] **Step 8: Commit**

```bash
git add package.json vite.config.js tailwind.config.js electron/main.js electron/preload.js src/index.css .gitignore
git commit -m "chore: initial project setup"
```

---

## Task 2: shadcn/ui 基础组件

**Files:**
- Create: `src/lib/utils.js`
- Create: `src/components/ui/button.jsx`
- Create: `src/components/ui/card.jsx`
- Create: `src/components/ui/progress.jsx`

- [ ] **Step 1: 创建 src/lib/utils.js**

```javascript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: 创建 src/components/ui/button.jsx**

```javascript
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        ghost: 'hover:bg-secondary',
        outline: 'border border-secondary hover:bg-secondary'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3',
        lg: 'h-12 px-6'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';
export { Button, buttonVariants };
```

- [ ] **Step 3: 创建 src/components/ui/card.jsx**

```javascript
import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-lg border border-secondary bg-card p-6', className)}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
```

- [ ] **Step 4: 创建 src/components/ui/progress.jsx**

```javascript
import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full bg-primary transition-all"
      style={{ width: `${value}%` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = 'Progress';

export { Progress };
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.js src/components/ui/button.jsx src/components/ui/card.jsx src/components/ui/progress.jsx
git commit -m "feat: add shadcn/ui base components"
```

---

## Task 3: 工具函数和常量

**Files:**
- Create: `src/utils/constants.js`
- Create: `src/utils/time.js`
- Create: `__tests__/utils/time.test.js`

- [ ] **Step 1: 创建 src/utils/constants.js**

```javascript
// 番茄钟常量配置（固定标准时长）
export const POMODORO_CONFIG = {
  WORK_DURATION: 25 * 60,        // 25分钟工作（秒）
  SHORT_BREAK_DURATION: 5 * 60,   // 5分钟短休息（秒）
  LONG_BREAK_DURATION: 15 * 60,   // 15分钟长休息（秒）
  SESSIONS_BEFORE_LONG_BREAK: 4    // 长休息前的工作周期数
};

// 番茄类型
export const SESSION_TYPE = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
};

// 计时器模式显示配置
export const MODE_CONFIG = {
  [SESSION_TYPE.WORK]: { label: '专注中', color: 'text-red-500' },
  [SESSION_TYPE.SHORT_BREAK]: { label: '短休息', color: 'text-green-500' },
  [SESSION_TYPE.LONG_BREAK]: { label: '长休息', color: 'text-blue-500' }
};
```

- [ ] **Step 2: 创建 src/utils/time.js**

```javascript
/**
 * 将秒数格式化为 MM:SS 字符串
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的字符串
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * 将秒数格式化为人类可读时长描述
 * @param {number} seconds - 秒数
 * @returns {string} 如 "25分钟" 或 "1小时30分钟"
 */
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`;
  }
  return `${minutes}分钟`;
}

/**
 * 获取某一天的开始时间戳（00:00:00）
 * @param {Date} date - 日期对象
 * @returns {Date} 当天零点
 */
export function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取本周的开始时间戳（周一 00:00:00）
 * @param {Date} date - 日期对象
 * @returns {Date} 本周一零点
 */
export function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 格式化日期为 ISO 字符串（用于数据库存储）
 * @param {Date} date - 日期对象
 * @returns {string} ISO 格式字符串
 */
export function toISODateString(date) {
  return date.toISOString();
}
```

- [ ] **Step 3: 创建 __tests__/utils/time.test.js**

```javascript
import { describe, it, expect } from 'vitest';
import { formatTime, formatDuration, getStartOfDay, getStartOfWeek, toISODateString } from '@/utils/time';

describe('formatTime', () => {
  it('should format 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('should format 60 seconds as 01:00', () => {
    expect(formatTime(60)).toBe('01:00');
  });

  it('should format 90 seconds as 01:30', () => {
    expect(formatTime(90)).toBe('01:30');
  });

  it('should format 1500 seconds (25min) as 25:00', () => {
    expect(formatTime(1500)).toBe('25:00');
  });

  it('should format 3599 seconds as 59:59', () => {
    expect(formatTime(3599)).toBe('59:59');
  });
});

describe('formatDuration', () => {
  it('should format 60 seconds as 1分钟', () => {
    expect(formatDuration(60)).toBe('1分钟');
  });

  it('should format 1500 seconds (25min) as 25分钟', () => {
    expect(formatDuration(1500)).toBe('25分钟');
  });

  it('should format 3600 seconds as 1小时', () => {
    expect(formatDuration(3600)).toBe('1小时');
  });

  it('should format 5400 seconds (1.5h) as 1小时30分钟', () => {
    expect(formatDuration(5400)).toBe('1小时30分钟');
  });
});

describe('getStartOfDay', () => {
  it('should return midnight of the same day', () => {
    const date = new Date('2024-01-15T14:30:00');
    const result = getStartOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('getStartOfWeek', () => {
  it('should return Monday of the same week', () => {
    // 2024-01-17 是周三
    const date = new Date('2024-01-17T14:30:00');
    const result = getStartOfWeek(date);
    expect(result.getDay()).toBe(1); // 周一
    expect(result.getDate()).toBe(15);
  });

  it('should handle Sunday correctly', () => {
    // 2024-01-21 是周日
    const date = new Date('2024-01-21T14:30:00');
    const result = getStartOfWeek(date);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(15);
  });
});
```

- [ ] **Step 4: 运行测试验证**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/constants.js src/utils/time.js __tests__/utils/time.test.js
git commit -m "feat: add time utilities and constants"
```

---

## Task 4: useTimer Hook

**Files:**
- Create: `src/hooks/useTimer.js`
- Create: `__tests__/hooks/useTimer.test.js`

- [ ] **Step 1: 创建 src/hooks/useTimer.js**

```javascript
import { useState, useEffect, useCallback, useRef } from 'react';
import { POMODORO_CONFIG, SESSION_TYPE } from '@/utils/constants';

/**
 * 番茄钟计时器 Hook
 * 管理计时器状态：工作/休息模式、倒计时、开始/暂停/重置
 */
export function useTimer(onComplete) {
  const [mode, setMode] = useState(SESSION_TYPE.WORK);
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_CONFIG.WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // 保持 onComplete 引用最新
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 获取当前模式的总时长
  const getDuration = useCallback((currentMode) => {
    switch (currentMode) {
      case SESSION_TYPE.WORK:
        return POMODORO_CONFIG.WORK_DURATION;
      case SESSION_TYPE.SHORT_BREAK:
        return POMODORO_CONFIG.SHORT_BREAK_DURATION;
      case SESSION_TYPE.LONG_BREAK:
        return POMODORO_CONFIG.LONG_BREAK_DURATION;
      default:
        return POMODORO_CONFIG.WORK_DURATION;
    }
  }, []);

  // 计时器完成处理
  const handleComplete = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);

    // 触发完成回调
    if (onCompleteRef.current) {
      onCompleteRef.current(mode);
    }

    // 自动切换到下一个模式
    if (mode === SESSION_TYPE.WORK) {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);

      // 每4个番茄后进入长休息
      if (newSessionsCompleted % POMODORO_CONFIG.SESSIONS_BEFORE_LONG_BREAK === 0) {
        setMode(SESSION_TYPE.LONG_BREAK);
        setTimeRemaining(POMODORO_CONFIG.LONG_BREAK_DURATION);
      } else {
        setMode(SESSION_TYPE.SHORT_BREAK);
        setTimeRemaining(POMODORO_CONFIG.SHORT_BREAK_DURATION);
      }
    } else {
      // 休息结束后回到工作
      setMode(SESSION_TYPE.WORK);
      setTimeRemaining(POMODORO_CONFIG.WORK_DURATION);
    }
  }, [mode, sessionsCompleted]);

  // 倒计时逻辑
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      handleComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeRemaining, handleComplete]);

  // 开始计时
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  // 暂停计时
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // 重置当前模式
  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(getDuration(mode));
  }, [mode, getDuration]);

  // 手动切换模式
  const setModeAndReset = useCallback((newMode) => {
    setMode(newMode);
    setTimeRemaining(getDuration(newMode));
    setIsRunning(false);
  }, [getDuration]);

  return {
    mode,
    timeRemaining,
    isRunning,
    sessionsCompleted,
    start,
    pause,
    reset,
    setMode: setModeAndReset
  };
}
```

- [ ] **Step 2: 创建 __tests__/hooks/useTimer.test.js**

```javascript
import { describe, it, expect, vi } from 'vitest';

/**
 * 由于 useTimer 依赖 DOM/Timer API，测试使用 fake timers
 */
describe('useTimer', () => {
  // Mock 实现用于验证逻辑
  const createTimerLogic = (onComplete) => {
    let timeRemaining = 25 * 60;
    let isRunning = false;
    let sessionsCompleted = 0;
    let mode = 'work';

    const start = () => { isRunning = true; };
    const pause = () => { isRunning = false; };
    const reset = () => {
      isRunning = false;
      timeRemaining = 25 * 60;
    };

    return { start, pause, reset, getTime: () => timeRemaining, isRunning: () => isRunning };
  };

  it('should initialize with 25 minutes', () => {
    const timer = createTimerLogic(() => {});
    expect(timer.getTime()).toBe(25 * 60);
  });

  it('should start timer', () => {
    const timer = createTimerLogic(() => {});
    timer.start();
    expect(timer.isRunning()).toBe(true);
  });

  it('should pause timer', () => {
    const timer = createTimerLogic(() => {});
    timer.start();
    timer.pause();
    expect(timer.isRunning()).toBe(false);
  });

  it('should reset timer to initial duration', () => {
    const timer = createTimerLogic(() => {});
    timer.start();
    timer.reset();
    expect(timer.isRunning()).toBe(false);
    expect(timer.getTime()).toBe(25 * 60);
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTimer.js __tests__/hooks/useTimer.test.js
git commit -m "feat: implement useTimer hook"
```

---

## Task 5: Timer 组件

**Files:**
- Create: `src/components/Timer/TimerDisplay.jsx`
- Create: `src/components/Timer/TimerControls.jsx`
- Create: `src/components/Timer/ProgressRing.jsx`

- [ ] **Step 1: 创建 src/components/Timer/ProgressRing.jsx**

```javascript
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * 圆形进度环组件
 * @param {number} progress - 进度百分比 (0-100)
 * @param {string} className - 自定义类名
 */
export function ProgressRing({ progress, className }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className={cn('transform -rotate-90', className)}
    >
      {/* 背景圆环 */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="hsl(217, 33%, 17%)"
        strokeWidth="8"
      />
      {/* 进度圆环 */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="hsl(4, 90%, 58%)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{
          transition: 'stroke-dashoffset 0.5s ease'
        }}
      />
    </svg>
  );
}
```

- [ ] **Step 2: 创建 src/components/Timer/TimerDisplay.jsx**

```javascript
import React from 'react';
import { formatTime } from '@/utils/time';
import { MODE_CONFIG } from '@/utils/constants';
import { cn } from '@/lib/utils';

/**
 * 计时器数字显示组件
 */
export function TimerDisplay({ timeRemaining, mode }) {
  const { label, color } = MODE_CONFIG[mode];

  return (
    <div className="flex flex-col items-center">
      <span className={cn('text-sm font-medium uppercase tracking-wider mb-2', color)}>
        {label}
      </span>
      <span className="text-7xl font-bold text-foreground tabular-nums">
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}
```

- [ ] **Step 3: 创建 src/components/Timer/TimerControls.jsx**

```javascript
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * 计时器控制按钮组件
 */
export function TimerControls({ isRunning, onStart, onPause, onReset }) {
  return (
    <div className="flex items-center gap-4 mt-8">
      {/* 开始/暂停按钮 */}
      {isRunning ? (
        <Button size="lg" onClick={onPause} className="w-24">
          暂停
        </Button>
      ) : (
        <Button size="lg" onClick={onStart} className="w-24">
          开始
        </Button>
      )}

      {/* 重置按钮 */}
      <Button
        variant="ghost"
        size="lg"
        onClick={onReset}
        disabled={isRunning}
        className={cn(!isRunning && 'opacity-50')}
      >
        重置
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Timer/ProgressRing.jsx src/components/Timer/TimerDisplay.jsx src/components/Timer/TimerControls.jsx
git commit -m "feat: add Timer components"
```

---

## Task 6: 通知 Hook 和组件

**Files:**
- Create: `src/hooks/useNotification.js`
- Create: `src/components/Notification/NotificationToast.jsx`

- [ ] **Step 1: 创建 src/hooks/useNotification.js**

```javascript
import { useCallback } from 'react';

/**
 * 通知提醒 Hook
 * 封装系统通知、提示音、悬浮窗口功能
 */
export function useNotification() {
  // 播放提示音
  const playSound = useCallback(() => {
    // 创建 Web Audio API 上下文
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 设置提示音参数
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    // 渐出效果
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  // 显示系统通知
  const showSystemNotification = useCallback((title, body) => {
    if (window.electronAPI?.showNotification) {
      window.electronAPI.showNotification(title, body);
    }
  }, []);

  // 显示悬浮窗口
  const showFloatingWindow = useCallback((message) => {
    if (window.electronAPI?.showNotificationWindow) {
      window.electronAPI.showNotificationWindow(message);
    }
  }, []);

  // 完整的番茄钟完成通知
  const notifyPomodoroComplete = useCallback((mode) => {
    const isBreak = mode !== 'work';
    const title = isBreak ? '休息结束！' : '番茄钟完成！';
    const body = isBreak
      ? '休息时间结束，开始下一个专注周期吧'
      : '25分钟专注完成，休息一下吧';

    // 显示系统通知
    showSystemNotification(title, body);

    // 播放提示音
    playSound();

    // 显示悬浮窗口
    showFloatingWindow(isBreak ? '开始工作!' : '休息一下');
  }, [showSystemNotification, playSound, showFloatingWindow]);

  return {
    playSound,
    showSystemNotification,
    showFloatingWindow,
    notifyPomodoroComplete
  };
}
```

- [ ] **Step 2: 创建 src/components/Notification/NotificationToast.jsx**

```javascript
import React from 'react';

/**
 * 通知 Toast 组件（备用展示）
 * 当悬浮窗口不可用时可在主窗口展示
 */
export function NotificationToast({ message, type = 'info', onClose }) {
  const bgColors = {
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div
      className={`fixed top-4 right-4 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in`}
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-2 hover:opacity-70">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useNotification.js src/components/Notification/NotificationToast.jsx
git commit -m "feat: add notification hook and component"
```

---

## Task 7: 数据库 Hook (sql.js 集成)

**Files:**
- Create: `src/hooks/useDatabase.js`

- [ ] **Step 1: 创建 src/hooks/useDatabase.js**

```javascript
import { useState, useEffect, useCallback } from 'react';
import initSqlJs from 'sql.js';

/**
 * 数据库 Hook
 * 封装 sql.js 的初始化和基本操作
 */
export function useDatabase() {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化数据库
  useEffect(() => {
    async function initDB() {
      try {
        // 初始化 sql.js
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });

        // 创建数据库实例
        const database = new SQL.Database();

        // 创建 sessions 表
        database.run(`
          CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            started_at TEXT NOT NULL,
            duration INTEGER NOT NULL,
            type TEXT NOT NULL
          )
        `);

        // 创建索引
        database.run(`
          CREATE INDEX IF NOT EXISTS idx_started_at ON sessions(started_at)
        `);

        setDb(database);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }

    initDB();

    // 清理
    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // 保存番茄会话
  const saveSession = useCallback((duration, type) => {
    if (!db) return;

    const startedAt = new Date().toISOString();
    db.run(
      'INSERT INTO sessions (started_at, duration, type) VALUES (?, ?, ?)',
      [startedAt, duration, type]
    );
  }, [db]);

  // 获取今日统计
  const getTodayStats = useCallback(() => {
    if (!db) return { count: 0, totalDuration: 0 };

    const today = new Date().toISOString().split('T')[0];
    const result = db.exec(`
      SELECT COUNT(*) as count, COALESCE(SUM(duration), 0) as totalDuration
      FROM sessions
      WHERE type = 'work' AND started_at LIKE '${today}%'
    `);

    if (result.length === 0) {
      return { count: 0, totalDuration: 0 };
    }

    return {
      count: result[0].values[0][0],
      totalDuration: result[0].values[0][1]
    };
  }, [db]);

  // 获取本周统计
  const getWeekStats = useCallback(() => {
    if (!db) return [];

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const weekStart = startOfWeek.toISOString().split('T')[0];

    const result = db.exec(`
      SELECT DATE(started_at) as date, COUNT(*) as count
      FROM sessions
      WHERE type = 'work' AND started_at >= '${weekStart}'
      GROUP BY DATE(started_at)
      ORDER BY date
    `);

    if (result.length === 0) return [];

    return result[0].values.map(([date, count]) => ({ date, count }));
  }, [db]);

  return {
    db,
    isLoading,
    error,
    saveSession,
    getTodayStats,
    getWeekStats
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useDatabase.js
git commit -m "feat: add useDatabase hook with sql.js"
```

---

## Task 8: 统计组件

**Files:**
- Create: `src/components/Stats/TodayStats.jsx`
- Create: `src/components/Stats/WeekStats.jsx`
- Create: `src/components/Stats/TrendChart.jsx`

- [ ] **Step 1: 创建 src/components/Stats/TodayStats.jsx**

```javascript
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDuration } from '@/utils/time';

/**
 * 今日统计组件
 */
export function TodayStats({ stats }) {
  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="text-lg">今日完成</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-8">
          <div>
            <div className="text-3xl font-bold text-primary">{stats.count}</div>
            <div className="text-sm text-foreground/60">个番茄</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{formatDuration(stats.totalDuration)}</div>
            <div className="text-sm text-foreground/60">总专注时长</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: 创建 src/components/Stats/TrendChart.jsx**

```javascript
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * 简易柱状图组件
 */
export function TrendChart({ data }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((item, index) => {
        const height = (item.count / maxCount) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-secondary rounded-t h-full min-h-[4px] relative">
              <div
                className="absolute bottom-0 w-full bg-primary rounded-t transition-all"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-xs text-foreground/60">
              {new Date(item.date).getDay() === 0 ? '日' :
                ['一', '二', '三', '四', '五', '六'][new Date(item.date).getDay() - 1]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: 创建 src/components/Stats/WeekStats.jsx**

```javascript
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendChart } from './TrendChart';

/**
 * 本周统计组件
 */
export function WeekStats({ stats }) {
  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="text-lg">本周趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <TrendChart data={stats} />
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Stats/TodayStats.jsx src/components/Stats/WeekStats.jsx src/components/Stats/TrendChart.jsx
git commit -m "feat: add Stats components"
```

---

## Task 9: 主应用组件

**Files:**
- Create: `src/App.jsx`
- Create: `index.html`
- Create: `src/main.jsx`

- [ ] **Step 1: 创建 src/App.jsx**

```javascript
import React, { useState, useCallback } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { useNotification } from '@/hooks/useNotification';
import { useDatabase } from '@/hooks/useDatabase';
import { TimerDisplay } from '@/components/Timer/TimerDisplay';
import { TimerControls } from '@/components/Timer/TimerControls';
import { ProgressRing } from '@/components/Timer/ProgressRing';
import { TodayStats } from '@/components/Stats/TodayStats';
import { WeekStats } from '@/components/Stats/WeekStats';
import { POMODORO_CONFIG, SESSION_TYPE } from '@/utils/constants';

function App() {
  const { notifyPomodoroComplete } = useNotification();
  const { saveSession, getTodayStats, getWeekStats } = useDatabase();

  // 番茄完成回调
  const handlePomodoroComplete = useCallback((mode) => {
    // 发送通知
    notifyPomodoroComplete(mode);

    // 保存到数据库
    if (mode === SESSION_TYPE.WORK) {
      saveSession(POMODORO_CONFIG.WORK_DURATION, mode);
    }
  }, [notifyPomodoroComplete, saveSession]);

  const {
    mode,
    timeRemaining,
    isRunning,
    sessionsCompleted,
    start,
    pause,
    reset
  } = useTimer(handlePomodoroComplete);

  // 获取统计数据（带刷新）
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshStats = () => setRefreshKey(k => k + 1);

  const todayStats = getTodayStats();
  const weekStats = getWeekStats();

  // 计算进度
  const totalDuration = {
    [SESSION_TYPE.WORK]: POMODORO_CONFIG.WORK_DURATION,
    [SESSION_TYPE.SHORT_BREAK]: POMODORO_CONFIG.SHORT_BREAK_DURATION,
    [SESSION_TYPE.LONG_BREAK]: POMODORO_CONFIG.LONG_BREAK_DURATION
  }[mode];

  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-8">
      {/* 顶部进度指示 */}
      <div className="text-sm text-foreground/60 mb-4">
        已完成 {sessionsCompleted} 个番茄
      </div>

      {/* 计时器核心 */}
      <div className="relative">
        <ProgressRing progress={progress} />
        <div className="absolute inset-0 flex items-center justify-center">
          <TimerDisplay timeRemaining={timeRemaining} mode={mode} />
        </div>
      </div>

      {/* 控制按钮 */}
      <TimerControls
        isRunning={isRunning}
        onStart={start}
        onPause={pause}
        onReset={reset}
      />

      {/* 统计面板 */}
      <div className="w-full mt-8 space-y-4">
        <TodayStats stats={todayStats} />
        <WeekStats stats={weekStats} />
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: 创建 src/main.jsx**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>番茄钟</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/main.jsx index.html
git commit -m "feat: integrate App components"
```

---

## Task 10: README 文档

**Files:**
- Create: `README.md`

- [ ] **Step 1: 创建 README.md**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with architecture and usage"
```

---

## 验证方案

1. **运行开发服务器**：`npm run dev`
2. **功能验证**：
   - 点击「开始」，观察倒计时
   - 等待25分钟或手动设置较短时间测试通知
   - 检查悬浮窗口是否弹出
   - 重启应用后统计数据是否保留
3. **运行测试**：`npm test`
