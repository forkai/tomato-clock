import { useState, useEffect, useCallback, useRef } from 'react'
import { POMODORO_CONFIG, SESSION_TYPE } from '@/utils/constants'
import type { SessionType } from '@/types/timer'

export type { SessionType }

interface UseTimerProps {
  onComplete?: (mode: SessionType) => void
}

export function useTimer({ onComplete }: UseTimerProps = {}) {
  const [mode, setMode] = useState<SessionType>(SESSION_TYPE.WORK as SessionType)
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_CONFIG.WORK_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const getDuration = useCallback((currentMode: SessionType): number => {
    switch (currentMode) {
      case SESSION_TYPE.WORK as SessionType:
        return POMODORO_CONFIG.WORK_DURATION
      case SESSION_TYPE.SHORT_BREAK as SessionType:
        return POMODORO_CONFIG.SHORT_BREAK_DURATION
      case SESSION_TYPE.LONG_BREAK as SessionType:
        return POMODORO_CONFIG.LONG_BREAK_DURATION
      default:
        return POMODORO_CONFIG.WORK_DURATION
    }
  }, [])

  const handleComplete = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)

    if (onCompleteRef.current) {
      onCompleteRef.current(mode)
    }

    if (mode === (SESSION_TYPE.WORK as SessionType)) {
      const newSessionsCompleted = sessionsCompleted + 1
      setSessionsCompleted(newSessionsCompleted)

      if (newSessionsCompleted % POMODORO_CONFIG.SESSIONS_BEFORE_LONG_BREAK === 0) {
        setMode(SESSION_TYPE.LONG_BREAK as SessionType)
        setTimeRemaining(POMODORO_CONFIG.LONG_BREAK_DURATION)
      } else {
        setMode(SESSION_TYPE.SHORT_BREAK as SessionType)
        setTimeRemaining(POMODORO_CONFIG.SHORT_BREAK_DURATION)
      }
    } else {
      setMode(SESSION_TYPE.WORK as SessionType)
      setTimeRemaining(POMODORO_CONFIG.WORK_DURATION)
    }
  }, [mode, sessionsCompleted])

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timeRemaining === 0 && isRunning) {
      handleComplete()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, timeRemaining, handleComplete])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setTimeRemaining(getDuration(mode))
  }, [mode, getDuration])

  const switchMode = useCallback((newMode: SessionType) => {
    setMode(newMode)
    setTimeRemaining(getDuration(newMode))
    setIsRunning(false)
  }, [getDuration])

  return {
    mode,
    timeRemaining,
    isRunning,
    sessionsCompleted,
    start,
    pause,
    reset,
    setMode: switchMode
  }
}
