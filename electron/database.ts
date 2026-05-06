import initSqlJs from 'sql.js'

// sql.js 的类型定义
type SqlJsDb = Awaited<ReturnType<typeof initSqlJs>>
type SqlDatabase = InstanceType<SqlJsDb['Database']>

/**
 * 数据库类
 * 封装 sql.js 的操作，提供番茄钟会话的持久化存储
 * 数据存储在内存中（刷新后丢失），如需持久化可考虑 IndexedDB
 */
export class Database {
  // sql.js 数据库实例
  private db: SqlDatabase | null = null

  /**
   * 初始化数据库
   * 创建 sessions 表和索引（如不存在）
   */
  async init(): Promise<void> {
    try {
      // 初始化 sql.js（异步加载 WebAssembly）
      const SQL = await initSqlJs()

      // 创建内存数据库实例
      this.db = new SQL.Database()

      // 创建会话表：存储每次番茄钟的开始时间、持续时长和类型
      this.db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          started_at TEXT NOT NULL,  -- ISO 8601 格式的日期时间字符串
          duration INTEGER NOT NULL, -- 持续时长（秒）
          type TEXT NOT NULL         -- 会话类型：'work' | 'shortBreak' | 'longBreak'
        )
      `)

      // 为 started_at 列创建索引，加速按时间范围的查询
      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_started_at ON sessions(started_at)
      `)

      console.log('数据库初始化成功')
    } catch (err) {
      console.error('数据库初始化失败:', err)
      throw err
    }
  }

  /**
   * 保存一次番茄钟会话
   * @param duration 持续时长（秒）
   * @param type 会话类型
   * @returns 操作结果
   */
  saveSession(duration: number, type: string): { success: boolean; error?: string } {
    // 防止在数据库未初始化时调用
    if (!this.db) return { success: false, error: '数据库未初始化' }

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

  /**
   * 获取今日统计数据
   * @returns 今日完成的番茄钟数量和总时长
   */
  getTodayStats(): { count: number; totalDuration: number } {
    if (!this.db) return { count: 0, totalDuration: 0 }

    try {
      // 获取今天的日期字符串（YYYY-MM-DD 格式）
      const today = new Date().toISOString().split('T')[0]

      // 查询今日所有工作会话的数量和总时长
      const result = this.db.exec(`
        SELECT COUNT(*) as count, COALESCE(SUM(duration), 0) as totalDuration
        FROM sessions
        WHERE type = 'work' AND started_at LIKE '${today}%'
      `)

      // 如果今天没有任何记录，返回默认值
      if (result.length === 0) {
        return { count: 0, totalDuration: 0 }
      }

      return {
        count: result[0].values[0][0] as number,
        totalDuration: result[0].values[0][1] as number
      }
    } catch (err) {
      console.error('获取今日统计失败:', err)
      return { count: 0, totalDuration: 0 }
    }
  }

  /**
   * 获取本周统计数据
   * @returns 每天的完成数量数组（周一到周日）
   */
  getWeekStats(): Array<{ date: string; count: number }> {
    if (!this.db) return []

    try {
      const now = new Date()

      // 计算本周星期一（周一为一周的第一天）
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + 1)

      // 初始化 7 天的数据数组（即使没有数据也要返回完整的星期）
      const weekData: Array<{ date: string; count: number }> = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        weekData.push({
          date: date.toISOString().split('T')[0],
          count: 0
        })
      }

      // 获取本周的起始日期
      const weekStart = startOfWeek.toISOString().split('T')[0]

      // 查询本周每天的工作会话数量
      const result = this.db.exec(`
        SELECT DATE(started_at) as date, COUNT(*) as count
        FROM sessions
        WHERE type = 'work' AND started_at >= '${weekStart}'
        GROUP BY DATE(started_at)
        ORDER BY date
      `)

      // 将查询结果填充到 weekData 中
      if (result.length > 0) {
        result[0].values.forEach((row: unknown[]) => {
          const [date, count] = row as [string, number]
          const dayIndex = weekData.findIndex((d) => d.date === date)
          // 找到对应日期的索引，更新数量
          if (dayIndex !== -1) {
            weekData[dayIndex].count = count
          }
        })
      }

      return weekData
    } catch (err) {
      console.error('获取本周统计失败:', err)
      return []
    }
  }

  /**
   * 清除所有会话数据
   * @returns 操作结果
   */
  clearAll(): { success: boolean; error?: string } {
    if (!this.db) return { success: false, error: '数据库未初始化' }

    try {
      this.db.run('DELETE FROM sessions')
      return { success: true }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  /**
   * 生成模拟数据
   * 用于开发和测试，生成最近 7 天的随机番茄钟记录
   * @returns 操作结果和生成的数据条数
   */
  generateMockData(): { success: boolean; error?: string; count?: number } {
    if (!this.db) return { success: false, error: '数据库未初始化' }

    try {
      const now = new Date()
      const mockData: Array<{ startedAt: string; duration: number; type: string }> = []

      // 生成最近 7 天的数据
      for (let i = 6; i >= 0; i--) {
        const baseDate = new Date(now)
        baseDate.setDate(baseDate.getDate() - i)
        baseDate.setHours(0, 0, 0, 0)

        // 每天随机生成 1-8 个番茄钟
        const count = Math.floor(Math.random() * 8) + 1

        for (let j = 0; j < count; j++) {
          const sessionDate = new Date(baseDate)
          // 随机时间（8:00 - 20:00）
          const hours = Math.floor(Math.random() * 12) + 8
          const minutes = Math.floor(Math.random() * 60)
          sessionDate.setHours(hours, minutes, 0, 0)

          mockData.push({
            startedAt: sessionDate.toISOString(),
            duration: 25 * 60, // 标准番茄钟：25 分钟
            type: 'work'
          })
        }
      }

      // 批量插入模拟数据
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