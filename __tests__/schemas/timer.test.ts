import { describe, it, expect } from 'vitest'
import { TimerStateSchema, PomodoroConfigSchema, SessionTypeSchema } from '@/schemas/timer'

describe('SessionTypeSchema', () => {
  it('should accept "work"', () => {
    expect(SessionTypeSchema.parse('work')).toBe('work')
  })

  it('should accept "break"', () => {
    expect(SessionTypeSchema.parse('break')).toBe('break')
  })

  it('should accept "longBreak"', () => {
    expect(SessionTypeSchema.parse('longBreak')).toBe('longBreak')
  })

  it('should reject invalid session type', () => {
    expect(() => SessionTypeSchema.parse('invalid')).toThrow()
    expect(() => SessionTypeSchema.parse('rest')).toThrow()
    expect(() => SessionTypeSchema.parse('')).toThrow()
  })
})

describe('TimerStateSchema', () => {
  it('should accept valid timer state', () => {
    const valid = {
      status: 'running',
      sessionType: 'work',
      timeRemaining: 1500,
      sessionsCompleted: 0
    }
    expect(TimerStateSchema.parse(valid)).toEqual(valid)
  })

  it('should accept idle status', () => {
    const valid = {
      status: 'idle',
      sessionType: 'work',
      timeRemaining: 1500,
      sessionsCompleted: 0
    }
    expect(TimerStateSchema.parse(valid)).toEqual(valid)
  })

  it('should accept paused status', () => {
    const valid = {
      status: 'paused',
      sessionType: 'break',
      timeRemaining: 300,
      sessionsCompleted: 2
    }
    expect(TimerStateSchema.parse(valid)).toEqual(valid)
  })

  it('should reject invalid status', () => {
    const invalid = {
      status: 'stopped',
      sessionType: 'work',
      timeRemaining: 1500,
      sessionsCompleted: 0
    }
    expect(() => TimerStateSchema.parse(invalid)).toThrow()
  })

  it('should reject invalid session type', () => {
    const invalid = {
      status: 'running',
      sessionType: 'invalid',
      timeRemaining: 1500,
      sessionsCompleted: 0
    }
    expect(() => TimerStateSchema.parse(invalid)).toThrow()
  })

  it('should reject negative time remaining', () => {
    const invalid = {
      status: 'running',
      sessionType: 'work',
      timeRemaining: -1,
      sessionsCompleted: 0
    }
    expect(() => TimerStateSchema.parse(invalid)).toThrow()
  })

  it('should reject negative sessions completed', () => {
    const invalid = {
      status: 'running',
      sessionType: 'work',
      timeRemaining: 1500,
      sessionsCompleted: -1
    }
    expect(() => TimerStateSchema.parse(invalid)).toThrow()
  })

  it('should reject non-integer time remaining', () => {
    const invalid = {
      status: 'running',
      sessionType: 'work',
      timeRemaining: 1500.5,
      sessionsCompleted: 0
    }
    expect(() => TimerStateSchema.parse(invalid)).toThrow()
  })
})

describe('PomodoroConfigSchema', () => {
  it('should accept valid config', () => {
    const valid = {
      workDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      sessionsBeforeLongBreak: 4
    }
    expect(PomodoroConfigSchema.parse(valid)).toEqual(valid)
  })

  it('should accept minimum valid values', () => {
    const valid = {
      workDuration: 1,
      shortBreakDuration: 1,
      longBreakDuration: 1,
      sessionsBeforeLongBreak: 1
    }
    expect(PomodoroConfigSchema.parse(valid)).toEqual(valid)
  })

  it('should reject zero work duration', () => {
    const invalid = {
      workDuration: 0,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      sessionsBeforeLongBreak: 4
    }
    expect(() => PomodoroConfigSchema.parse(invalid)).toThrow()
  })

  it('should reject negative durations', () => {
    const invalid = {
      workDuration: -1,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      sessionsBeforeLongBreak: 4
    }
    expect(() => PomodoroConfigSchema.parse(invalid)).toThrow()
  })

  it('should reject non-integer values', () => {
    const invalid = {
      workDuration: 1500.5,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      sessionsBeforeLongBreak: 4
    }
    expect(() => PomodoroConfigSchema.parse(invalid)).toThrow()
  })

  it('should reject zero sessions before long break', () => {
    const invalid = {
      workDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      sessionsBeforeLongBreak: 0
    }
    expect(() => PomodoroConfigSchema.parse(invalid)).toThrow()
  })
})
