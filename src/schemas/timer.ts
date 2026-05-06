import { z } from 'zod'

export const SessionTypeSchema = z.enum(['work', 'shortBreak', 'longBreak'])

export const TimerStatusSchema = z.enum(['idle', 'running', 'paused'])

export const TimerStateSchema = z.object({
  status: TimerStatusSchema,
  sessionType: SessionTypeSchema,
  timeRemaining: z.number().int().nonnegative(),
  sessionsCompleted: z.number().int().nonnegative()
})

export const PomodoroConfigSchema = z.object({
  workDuration: z.number().int().positive(),
  shortBreakDuration: z.number().int().positive(),
  longBreakDuration: z.number().int().positive(),
  sessionsBeforeLongBreak: z.number().int().positive()
})

export type TimerStateInput = z.infer<typeof TimerStateSchema>
export type PomodoroConfigInput = z.infer<typeof PomodoroConfigSchema>
