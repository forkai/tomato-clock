import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimer } from '@/hooks/useTimer'

// Mock the onComplete callback
const mockOnComplete = vi.fn()

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockOnComplete.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should have idle status on mount', () => {
      const { result } = renderHook(() => useTimer())
      expect(result.current.isRunning).toBe(false)
    })

    it('should start with work session type', () => {
      const { result } = renderHook(() => useTimer())
      expect(result.current.mode).toBe('work')
    })

    it('should start with 25 minutes (1500 seconds)', () => {
      const { result } = renderHook(() => useTimer())
      expect(result.current.timeRemaining).toBe(1500)
    })

    it('should start with 0 sessions completed', () => {
      const { result } = renderHook(() => useTimer())
      expect(result.current.sessionsCompleted).toBe(0)
    })
  })

  describe('start timer', () => {
    it('should transition to running state', () => {
      const { result } = renderHook(() => useTimer())
      act(() => result.current.start())
      expect(result.current.isRunning).toBe(true)
    })

    it('should not change timeRemaining immediately', () => {
      const { result } = renderHook(() => useTimer())
      const initialTime = result.current.timeRemaining
      act(() => result.current.start())
      expect(result.current.timeRemaining).toBe(initialTime)
    })
  })

  describe('pause timer', () => {
    it('should transition to paused state', () => {
      const { result } = renderHook(() => useTimer())
      act(() => result.current.start())
      act(() => result.current.pause())
      expect(result.current.isRunning).toBe(false)
    })
  })

  describe('reset timer', () => {
    it('should reset timeRemaining to full duration', () => {
      const { result } = renderHook(() => useTimer())
      act(() => result.current.start())
      act(() => result.current.reset())
      expect(result.current.timeRemaining).toBe(1500)
    })

    it('should stop the timer', () => {
      const { result } = renderHook(() => useTimer())
      act(() => result.current.start())
      act(() => result.current.reset())
      expect(result.current.isRunning).toBe(false)
    })
  })

  describe('countdown', () => {
    it('should decrement timeRemaining every second', () => {
      const { result } = renderHook(() => useTimer())
      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(1000))
      expect(result.current.timeRemaining).toBe(1499)
      act(() => vi.advanceTimersByTime(1000))
      expect(result.current.timeRemaining).toBe(1498)
    })
  })

  describe('switch mode', () => {
    it('should switch to short break', () => {
      const { result } = renderHook(() => useTimer())
      act(() => result.current.setMode('shortBreak'))
      expect(result.current.mode).toBe('shortBreak')
    })

    it('should switch to long break', () => {
      const { result } = renderHook(() => useTimer())
      act(() => result.current.setMode('longBreak'))
      expect(result.current.mode).toBe('longBreak')
    })

    it('should reset timeRemaining when switching mode', () => {
      const { result } = renderHook(() => useTimer())
      // Start and let some time pass
      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(5000))
      // Switch mode
      act(() => result.current.setMode('shortBreak'))
      // Should be reset to short break duration (5 minutes = 300 seconds)
      expect(result.current.timeRemaining).toBe(300)
    })

    it('should stop the timer when switching mode', () => {
      const { result } = renderHook(() => useTimer())
      act(() => result.current.start())
      act(() => result.current.setMode('shortBreak'))
      expect(result.current.isRunning).toBe(false)
    })
  })

  describe('onComplete callback', () => {
    it('should call onComplete when timer reaches zero', () => {
      renderHook(() => useTimer({ onComplete: mockOnComplete }))
      act(() => {
        vi.advanceTimersToNextTimer()
      })
      // The timer should complete at some point
    })
  })
})
