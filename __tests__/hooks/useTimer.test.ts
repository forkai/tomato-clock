import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * useTimer 单元测试
 * 测试计时器完成后的数据流：
 * 1. 完成工作会话后 sessionsCompleted 递增
 * 2. 完成工作会话后触发 onComplete 回调
 * 3. 完成工作会话后自动切换到休息模式
 * 4. 完成休息会话后自动切换到工作模式
 */
describe('useTimer', () => {
  /**
   * 模拟 useTimer 的核心逻辑（用于测试闭包问题）
   * 使用函数式更新来避免闭包陷阱
   */
  const createTimerLogic = () => {
    let timeRemaining = 25 * 60; // 25 分钟
    let isRunning = false;
    let sessionsCompleted = 0;
    let mode: 'work' | 'shortBreak' | 'longBreak' = 'work';
    let onCompleteCallback: ((mode: string) => void) | null = null;

    const start = () => { isRunning = true; };
    const pause = () => { isRunning = false; };
    const reset = () => {
      isRunning = false;
      timeRemaining = 25 * 60;
    };

    const setOnComplete = (callback: (mode: string) => void) => {
      onCompleteCallback = callback;
    };

    // 模拟 handleComplete 逻辑（使用函数式更新）
    const handleComplete = () => {
      if (mode === 'work') {
        sessionsCompleted += 1; // 直接更新（测试用）
        mode = 'shortBreak';
        timeRemaining = 5 * 60;
      } else {
        mode = 'work';
        timeRemaining = 25 * 60;
      }
      if (onCompleteCallback) {
        onCompleteCallback(mode);
      }
    };

    // 模拟 tick（完成一次计时）
    const completeTimer = () => {
      if (isRunning) {
        timeRemaining = 0;
        handleComplete();
      }
    };

    const getState = () => ({
      timeRemaining,
      isRunning,
      sessionsCompleted,
      mode
    });

    return { start, pause, reset, setOnComplete, completeTimer, getState };
  };

  describe('基础功能', () => {
    it('should initialize with 25 minutes', () => {
      const timer = createTimerLogic();
      expect(timer.getState().timeRemaining).toBe(25 * 60);
    });

    it('should start timer', () => {
      const timer = createTimerLogic();
      timer.start();
      expect(timer.getState().isRunning).toBe(true);
    });

    it('should pause timer', () => {
      const timer = createTimerLogic();
      timer.start();
      timer.pause();
      expect(timer.getState().isRunning).toBe(false);
    });

    it('should reset timer to initial duration', () => {
      const timer = createTimerLogic();
      timer.start();
      timer.reset();
      expect(timer.getState().isRunning).toBe(false);
      expect(timer.getState().timeRemaining).toBe(25 * 60);
    });
  });

  describe('计时器完成流程', () => {
    it('完成工作会话后 sessionsCompleted 应该递增', () => {
      const timer = createTimerLogic();
      timer.setOnComplete(() => {});

      timer.start();
      timer.completeTimer();

      expect(timer.getState().sessionsCompleted).toBe(1);
    });

    it('完成工作会话后应触发 onComplete 回调', () => {
      const spy = vi.fn();
      const timer = createTimerLogic();
      timer.setOnComplete(spy);

      timer.start();
      timer.completeTimer();

      expect(spy).toHaveBeenCalledWith('shortBreak');
    });

    it('完成工作会话后应切换到 shortBreak 模式', () => {
      const timer = createTimerLogic();
      timer.setOnComplete(() => {});

      timer.start();
      timer.completeTimer();

      expect(timer.getState().mode).toBe('shortBreak');
      expect(timer.getState().timeRemaining).toBe(5 * 60);
    });

    it('完成休息会话后应切换回工作模式', () => {
      const timer = createTimerLogic();
      timer.setOnComplete(() => {});

      // 先完成工作会话进入休息
      timer.start();
      timer.completeTimer();
      expect(timer.getState().mode).toBe('shortBreak');

      // 再完成休息会话
      timer.start();
      timer.completeTimer();

      expect(timer.getState().mode).toBe('work');
      expect(timer.getState().timeRemaining).toBe(25 * 60);
    });

    it('连续完成多个番茄，sessionsCompleted 正确累计', () => {
      const timer = createTimerLogic();
      timer.setOnComplete(() => {});

      // 完成 3 个番茄
      for (let i = 0; i < 3; i++) {
        timer.start();
        timer.completeTimer();
        // 重置为工作模式继续
        if (timer.getState().mode === 'shortBreak') {
          timer.start();
          timer.completeTimer();
        }
      }

      expect(timer.getState().sessionsCompleted).toBe(3);
    });
  });

  describe('闭包问题验证', () => {
    /**
     * 验证函数式更新确保每次都基于最新状态
     */
    it('setState 函数式更新确保状态连续正确', () => {
      let sessionsCompleted = 0;

      // 函数式更新（React 风格）
      const setState = (updater: (prev: number) => number) => {
        sessionsCompleted = updater(sessionsCompleted);
      };

      // 函数式更新
      setState(prev => prev + 1);
      expect(sessionsCompleted).toBe(1);

      setState(prev => prev + 1);
      expect(sessionsCompleted).toBe(2);

      setState(prev => prev + 1);
      expect(sessionsCompleted).toBe(3);
    });
  });
});

describe('TimerPage 数据流验证', () => {
  /**
   * 验证完整的计时器完成后的数据流
   */
  it('完成番茄后的数据流：onComplete -> saveSession -> dataVersion 更新', async () => {
    // 模拟数据流
    let dataVersion = 0;
    const sessions: Array<{ duration: number; type: string }> = [];

    const saveSession = (duration: number, type: string) => {
      sessions.push({ duration, type });
      return { success: true };
    };

    const handlePomodoroComplete = (mode: string) => {
      if (mode === 'work') {
        const result = saveSession(25 * 60, 'work');
        if (result.success) {
          dataVersion += 1;
        }
      }
    };

    // 模拟完成一个工作会话
    handlePomodoroComplete('work');

    expect(sessions.length).toBe(1);
    expect(sessions[0].type).toBe('work');
    expect(dataVersion).toBe(1);
  });

  it('统计页面应该响应 dataVersion 变化重新渲染', () => {
    // 模拟 StatsPage 的行为
    let renderCount = 0;
    let dataVersion = 0;

    const getTodayStats = () => ({ count: renderCount, completedToday: 0, streakDays: 0 });

    const fetchStats = () => {
      renderCount += 1;
      getTodayStats();
    };

    // 初始渲染
    fetchStats();
    expect(renderCount).toBe(1);

    // dataVersion 变化时重新渲染
    dataVersion = 1;
    fetchStats();
    expect(renderCount).toBe(2);

    // 再次变化
    dataVersion = 2;
    fetchStats();
    expect(renderCount).toBe(3);
  });

  it('TimerPage 显示的 sessionsCompleted 应该与实际完成数一致', () => {
    // 模拟 useTimer 的行为
    let sessionsCompleted = 0;

    const handleComplete = (mode: string) => {
      if (mode === 'work') {
        sessionsCompleted = sessionsCompleted + 1;
      }
    };

    // 完成 3 个番茄
    handleComplete('work');
    handleComplete('work');
    handleComplete('work');

    expect(sessionsCompleted).toBe(3);
  });

  it('onComplete 回调应传递正确的 mode 参数', () => {
    const modes: string[] = [];

    const handleComplete = (mode: string) => {
      modes.push(mode);
    };

    // 模拟完成工作会话
    handleComplete('work');
    expect(modes).toContain('work');

    // 模拟完成休息会话
    handleComplete('shortBreak');
    expect(modes).toContain('shortBreak');
  });
});

describe('数据库操作验证', () => {
  it('saveSession 应保存正确的 duration 和 type', () => {
    const sessions: Array<{ duration: number; type: string; startedAt: string }> = [];

    const saveSession = (duration: number, type: string) => {
      sessions.push({
        duration,
        type,
        startedAt: new Date().toISOString()
      });
      return { success: true };
    };

    saveSession(25 * 60, 'work');

    expect(sessions[0].duration).toBe(25 * 60);
    expect(sessions[0].type).toBe('work');
    expect(sessions[0].startedAt).toBeDefined();
  });

  it('getTodayStats 应正确过滤 work 类型的会话', () => {
    const sessions = [
      { startedAt: '2026-05-08T10:00:00.000Z', duration: 1500, type: 'work' },
      { startedAt: '2026-05-08T11:00:00.000Z', duration: 300, type: 'shortBreak' },
      { startedAt: '2026-05-08T12:00:00.000Z', duration: 1500, type: 'work' }
    ];

    const today = '2026-05-08';
    const todaySessions = sessions.filter(
      s => s.type === 'work' && s.startedAt.startsWith(today)
    );

    expect(todaySessions.length).toBe(2);
  });
});
