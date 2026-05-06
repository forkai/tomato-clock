import initSqlJs from 'sql.js'

type SqlJsDb = Awaited<ReturnType<typeof initSqlJs>>
type SqlDatabase = InstanceType<SqlJsDb['Database']>

export class Database {
  private db: SqlDatabase | null = null

  async init(): Promise<void> {
    try {
      const SQL = await initSqlJs()
      this.db = new SQL.Database()

      this.db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          started_at TEXT NOT NULL,
          duration INTEGER NOT NULL,
          type TEXT NOT NULL
        )
      `)

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_started_at ON sessions(started_at)
      `)

      console.log('Database initialized successfully')
    } catch (err) {
      console.error('Failed to initialize database:', err)
      throw err
    }
  }

  saveSession(duration: number, type: string): { success: boolean; error?: string } {
    if (!this.db) return { success: false, error: 'Database not initialized' }

    try {
      const startedAt = new Date().toISOString()
      this.db.run(
        'INSERT INTO sessions (started_at, duration, type) VALUES (?, ?, ?)',
        [startedAt, duration, type]
      )
      return { success: true }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  getTodayStats(): { count: number; totalDuration: number } {
    if (!this.db) return { count: 0, totalDuration: 0 }

    try {
      const today = new Date().toISOString().split('T')[0]
      const result = this.db.exec(`
        SELECT COUNT(*) as count, COALESCE(SUM(duration), 0) as totalDuration
        FROM sessions
        WHERE type = 'work' AND started_at LIKE '${today}%'
      `)

      if (result.length === 0) {
        return { count: 0, totalDuration: 0 }
      }

      return {
        count: result[0].values[0][0] as number,
        totalDuration: result[0].values[0][1] as number
      }
    } catch (err) {
      console.error('Error getting today stats:', err)
      return { count: 0, totalDuration: 0 }
    }
  }

  getWeekStats(): Array<{ date: string; count: number }> {
    if (!this.db) return []

    try {
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + 1)

      const weekData: Array<{ date: string; count: number }> = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        weekData.push({
          date: date.toISOString().split('T')[0],
          count: 0
        })
      }

      const weekStart = startOfWeek.toISOString().split('T')[0]
      const result = this.db.exec(`
        SELECT DATE(started_at) as date, COUNT(*) as count
        FROM sessions
        WHERE type = 'work' AND started_at >= '${weekStart}'
        GROUP BY DATE(started_at)
        ORDER BY date
      `)

      if (result.length > 0) {
        result[0].values.forEach((row: unknown[]) => {
          const [date, count] = row as [string, number]
          const dayIndex = weekData.findIndex((d) => d.date === date)
          if (dayIndex !== -1) {
            weekData[dayIndex].count = count
          }
        })
      }

      return weekData
    } catch (err) {
      console.error('Error getting week stats:', err)
      return []
    }
  }

  clearAll(): { success: boolean; error?: string } {
    if (!this.db) return { success: false, error: 'Database not initialized' }

    try {
      this.db.run('DELETE FROM sessions')
      return { success: true }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  generateMockData(): { success: boolean; error?: string; count?: number } {
    if (!this.db) return { success: false, error: 'Database not initialized' }

    try {
      const now = new Date()
      const mockData: Array<{ startedAt: string; duration: number; type: string }> = []

      for (let i = 6; i >= 0; i--) {
        const baseDate = new Date(now)
        baseDate.setDate(baseDate.getDate() - i)
        baseDate.setHours(0, 0, 0, 0)
        const count = Math.floor(Math.random() * 8) + 1

        for (let j = 0; j < count; j++) {
          const sessionDate = new Date(baseDate)
          const hours = Math.floor(Math.random() * 12) + 8
          const minutes = Math.floor(Math.random() * 60)
          sessionDate.setHours(hours, minutes, 0, 0)
          mockData.push({
            startedAt: sessionDate.toISOString(),
            duration: 25 * 60,
            type: 'work'
          })
        }
      }

      mockData.forEach((session) => {
        this.db!.run(
          'INSERT INTO sessions (started_at, duration, type) VALUES (?, ?, ?)',
          [session.startedAt, session.duration, session.type]
        )
      })

      return { success: true, count: mockData.length }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }
}
