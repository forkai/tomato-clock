import type { SessionType } from '@/types/timer'

/**
 * 番茄钟配置常量
 * 定义工作和休息的时长，以及长休息的触发条件
 */
export const POMODORO_CONFIG = {
  /** 工作时长：25 分钟（1500 秒） */
  WORK_DURATION: 25 * 60,

  /** 短休息时长：5 分钟（300 秒） */
  SHORT_BREAK_DURATION: 5 * 60,

  /** 长休息时长：15 分钟（900 秒） */
  LONG_BREAK_DURATION: 15 * 60,

  /** 触发长休息前需要完成的工作会话数 */
  SESSIONS_BEFORE_LONG_BREAK: 4
} as const

/**
 * 会话类型常量
 */
export const SESSION_TYPE = {
  WORK: 'work',         // 工作会话
  SHORT_BREAK: 'shortBreak', // 短休息
  LONG_BREAK: 'longBreak'     // 长休息
} as const

/**
 * 模式配置
 * 定义各模式下的显示标签和颜色
 */
export const MODE_CONFIG: Record<SessionType, { label: string; color: string }> = {
  work: { label: '专注中', color: 'text-red-500' },
  shortBreak: { label: '短休息', color: 'text-green-500' },
  longBreak: { label: '长休息', color: 'text-blue-500' }
}