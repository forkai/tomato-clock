import type { SessionType } from '@/types/timer'

export const POMODORO_CONFIG = {
  WORK_DURATION: 25 * 60,
  SHORT_BREAK_DURATION: 5 * 60,
  LONG_BREAK_DURATION: 15 * 60,
  SESSIONS_BEFORE_LONG_BREAK: 4
} as const

export const SESSION_TYPE = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
} as const

export const MODE_CONFIG: Record<SessionType, { label: string; color: string }> = {
  work: { label: '专注中', color: 'text-red-500' },
  shortBreak: { label: '短休息', color: 'text-green-500' },
  longBreak: { label: '长休息', color: 'text-blue-500' }
}
