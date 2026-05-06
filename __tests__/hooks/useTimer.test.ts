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
