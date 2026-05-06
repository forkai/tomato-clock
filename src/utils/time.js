/**
 * 将秒数格式化为 MM:SS 字符串
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的字符串
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * 将秒数格式化为人类可读时长描述
 * @param {number} seconds - 秒数
 * @returns {string} 如 "25分钟" 或 "1小时30分钟"
 */
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`;
  }
  return `${minutes}分钟`;
}

/**
 * 获取某一天的开始时间戳（00:00:00）
 * @param {Date} date - 日期对象
 * @returns {Date} 当天零点
 */
export function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取本周的开始时间戳（周一 00:00:00）
 * @param {Date} date - 日期对象
 * @returns {Date} 本周一零点
 */
export function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 格式化日期为 ISO 字符串（用于数据库存储）
 * @param {Date} date - 日期对象
 * @returns {string} ISO 格式字符串
 */
export function toISODateString(date) {
  return date.toISOString();
}