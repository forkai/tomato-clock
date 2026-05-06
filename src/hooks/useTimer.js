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
