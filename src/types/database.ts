import type { SessionType } from './timer'

export interface SessionRecord {
  id: string
  date: string
  duration: number
  type: SessionType
  completedAt: number
}

export interface DayStats {
  date: string
  workSessions: number
  totalWorkMinutes: number
}

export interface WeekStats {
  days: DayStats[]
  totalWorkMinutes: number
  averageWorkMinutes: number
  streakDays: number
}
