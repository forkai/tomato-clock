import { describe, it, expect } from 'vitest'
import { formatTime, formatDuration, getStartOfDay, getStartOfWeek, toISODateString } from '@/utils/time'

describe('formatTime', () => {
  it('should format 1500 seconds as "25:00"', () => {
    expect(formatTime(1500)).toBe('25:00')
  })

  it('should format 65 seconds as "01:05"', () => {
    expect(formatTime(65)).toBe('01:05')
  })

  it('should format 0 seconds as "00:00"', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('should handle seconds over 59 correctly', () => {
    expect(formatTime(61)).toBe('01:01')
  })

  it('should handle 1 hour correctly', () => {
    expect(formatTime(3600)).toBe('60:00')
  })

  it('should pad single digit minutes and seconds', () => {
    expect(formatTime(5)).toBe('00:05')
    expect(formatTime(65)).toBe('01:05')
  })
})

describe('formatDuration', () => {
  it('should format seconds into minutes', () => {
    expect(formatDuration(60)).toBe('1分钟')
    expect(formatDuration(1500)).toBe('25分钟')
  })

  it('should format into hours and minutes', () => {
    expect(formatDuration(3600)).toBe('1小时')
    expect(formatDuration(3660)).toBe('1小时1分钟')
    expect(formatDuration(7200)).toBe('2小时')
    expect(formatDuration(5400)).toBe('1小时30分钟')
  })

  it('should return 0 minutes for 0 seconds', () => {
    expect(formatDuration(0)).toBe('0分钟')
  })
})

describe('getStartOfDay', () => {
  it('should return midnight of the given date', () => {
    const date = new Date('2024-01-15T14:30:00')
    const start = getStartOfDay(date)
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getSeconds()).toBe(0)
    expect(start.getMilliseconds()).toBe(0)
  })

  it('should not modify the original date', () => {
    const date = new Date('2024-01-15T14:30:00')
    const originalTime = date.getTime()
    getStartOfDay(date)
    expect(date.getTime()).toBe(originalTime)
  })

  it('should handle dates already at midnight', () => {
    const date = new Date('2024-01-15T00:00:00')
    const start = getStartOfDay(date)
    expect(start.getHours()).toBe(0)
    expect(start.getDate()).toBe(15)
  })
})

describe('getStartOfWeek', () => {
  it('should return Monday for a Wednesday', () => {
    // Wednesday, January 17, 2024
    const date = new Date('2024-01-17T12:00:00')
    const start = getStartOfWeek(date)
    // Should be Monday, January 15, 2024
    expect(start.getDay()).toBe(1) // Monday
    expect(start.getDate()).toBe(15)
  })

  it('should return same day for a Monday', () => {
    const date = new Date('2024-01-15T12:00:00')
    const start = getStartOfWeek(date)
    expect(start.getDate()).toBe(15)
  })

  it('should return previous Monday for a Sunday', () => {
    // Sunday, January 21, 2024
    const date = new Date('2024-01-21T12:00:00')
    const start = getStartOfWeek(date)
    // Should be Monday, January 15, 2024
    expect(start.getDay()).toBe(1)
    expect(start.getDate()).toBe(15)
  })

  it('should return midnight time', () => {
    const date = new Date('2024-01-17T14:30:00')
    const start = getStartOfWeek(date)
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getSeconds()).toBe(0)
  })
})

describe('toISODateString', () => {
  it('should return ISO string', () => {
    const date = new Date('2024-01-15T14:30:00')
    const result = toISODateString(date)
    expect(result).toContain('2024-01-15')
  })
})
