/**
 * 会话类型
 * 番茄钟的三种模式
 */
export type SessionType = 'work' | 'shortBreak' | 'longBreak'

/** 计时器状态 */
export type TimerStatus = 'idle' | 'running' | 'paused'

/** 计时器状态数据结构 */
export interface TimerState {
  status: TimerStatus
  sessionType: SessionType
  timeRemaining: number
  sessionsCompleted: number
}

/** 番茄钟配置项（用于默认值和重置） */
export interface PomodoroConfig {
  workDuration: number        // 工作时长（秒）
  shortBreakDuration: number  // 短休息时长（秒）
  longBreakDuration: number    // 长休息时长（秒）
  sessionsBeforeLongBreak: number // 触发长休息的工作数
}

/** 默认番茄钟配置：25-5-15 循环，4 个工作后长休息 */
export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workDuration: 25 * 60,           // 25 分钟
  shortBreakDuration: 5 * 60,     // 5 分钟
  longBreakDuration: 15 * 60,     // 15 分钟
  sessionsBeforeLongBreak: 4
}