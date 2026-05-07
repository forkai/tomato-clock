import { useState, useEffect, useRef } from 'react'
import { POMODORO_CONFIG, SESSION_TYPE } from '@/utils/constants'
import type { SessionType } from '@/types/timer'

// 导出 SessionType 供其他模块使用
export type { SessionType }

/**
 * useTimer Hook 配置项
 */
interface UseTimerProps {
  /** 计时器完成时的回调函数 */
  onComplete?: (mode: SessionType) => void
}

/**
 * 番茄钟计时器 Hook
 * 管理计时器的所有状态和逻辑：
 * - 倒计时
 * - 模式切换（工作/短休息/长休息）
 * - 完成计数
 * - 自动切换模式
 */
export function useTimer({ onComplete }: UseTimerProps = {}) {
  // 当前模式：'work' | 'shortBreak' | 'longBreak'
  const [mode, setMode] = useState<SessionType>(SESSION_TYPE.WORK as SessionType)

  // 剩余时间（秒），初始为工作时长 25 分钟
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_CONFIG.WORK_DURATION)

  // 是否正在运行
  const [isRunning, setIsRunning] = useState(false)

  // 已完成的番茄钟数量
  const [sessionsCompleted, setSessionsCompleted] = useState(0)

  // 使用 ref 存储 interval ID，便于清理
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 使用 ref 存储 onComplete 回调，避免因依赖变化导致定时器重复创建
  const onCompleteRef = useRef(onComplete)

  // 同步 onComplete 回调（当 onComplete 变化时更新 ref）
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  /**
   * 根据模式获取对应的时长
   * @param currentMode 当前模式
   * @returns 对应的时长（秒）
   */
  const getDuration = (currentMode: SessionType): number => {
    switch (currentMode) {
      case SESSION_TYPE.WORK as SessionType:
        return POMODORO_CONFIG.WORK_DURATION // 25 分钟
      case SESSION_TYPE.SHORT_BREAK as SessionType:
        return POMODORO_CONFIG.SHORT_BREAK_DURATION // 5 分钟
      case SESSION_TYPE.LONG_BREAK as SessionType:
        return POMODORO_CONFIG.LONG_BREAK_DURATION // 15 分钟
      default:
        return POMODORO_CONFIG.WORK_DURATION
    }
  }

  /**
   * 处理计时器完成
   * 1. 停止 interval
   * 2. 调用完成回调
   * 3. 更新完成计数
   * 4. 自动切换到下一个模式
   */
  const handleComplete = () => {
    // 停止定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)

    // 调用完成回调（通知前端显示结果）
    if (onCompleteRef.current) {
      onCompleteRef.current(mode)
    }

    // 更新完成计数（使用函数式更新避免闭包问题）
    if (mode === (SESSION_TYPE.WORK as SessionType)) {
      setSessionsCompleted((prev) => {
        const newSessionsCompleted = prev + 1
        // 每 4 个工作会话后切换到长休息，否则切换到短休息
        if (newSessionsCompleted % POMODORO_CONFIG.SESSIONS_BEFORE_LONG_BREAK === 0) {
          setMode(SESSION_TYPE.LONG_BREAK as SessionType)
          setTimeRemaining(POMODORO_CONFIG.LONG_BREAK_DURATION)
        } else {
          setMode(SESSION_TYPE.SHORT_BREAK as SessionType)
          setTimeRemaining(POMODORO_CONFIG.SHORT_BREAK_DURATION)
        }
        return newSessionsCompleted
      })
    } else {
      // 休息结束后切换到工作模式
      setMode(SESSION_TYPE.WORK as SessionType)
      setTimeRemaining(POMODORO_CONFIG.WORK_DURATION)
    }
  }

  // 定时器逻辑：每秒递减 timeRemaining
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      // 每秒更新一次剩余时间
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          // 剩余时间到 0 时返回 0，而不是负数
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timeRemaining === 0 && isRunning) {
      // 时间到 0 时触发完成处理
      handleComplete()
    }

    // 清理函数：组件卸载或依赖变化时清除 interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, timeRemaining, handleComplete])

  /** 开始计时 */
  const start = () => {
    setIsRunning(true)
  }

  /** 暂停计时 */
  const pause = () => {
    setIsRunning(false)
  }

  /** 重置计时器到当前模式的初始时长 */
  const reset = () => {
    setIsRunning(false)
    setTimeRemaining(getDuration(mode))
  }

  /** 切换模式（如在工作界面切换到休息） */
  const switchMode = (newMode: SessionType) => {
    setMode(newMode)
    setTimeRemaining(getDuration(newMode))
    setIsRunning(false)
  }

  return {
    mode,                 // 当前模式
    timeRemaining,      // 剩余时间（秒）
    isRunning,           // 是否运行中
    sessionsCompleted,  // 已完成数量
    start,              // 开始
    pause,              // 暂停
    reset,              // 重置
    setMode: switchMode // 切换模式（别名，更语义化）
  }
}