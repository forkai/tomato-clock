// 番茄钟常量配置（固定标准时长）
export const POMODORO_CONFIG = {
  WORK_DURATION: 25 * 60,        // 25分钟工作（秒）
  SHORT_BREAK_DURATION: 5 * 60,   // 5分钟短休息（秒）
  LONG_BREAK_DURATION: 15 * 60,   // 15分钟长休息（秒）
  SESSIONS_BEFORE_LONG_BREAK: 4    // 长休息前的工作周期数
};

// 番茄类型
export const SESSION_TYPE = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
};

// 计时器模式显示配置
export const MODE_CONFIG = {
  [SESSION_TYPE.WORK]: { label: '专注中', color: 'text-red-500' },
  [SESSION_TYPE.SHORT_BREAK]: { label: '短休息', color: 'text-green-500' },
  [SESSION_TYPE.LONG_BREAK]: { label: '长休息', color: 'text-blue-500' }
};