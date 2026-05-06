import { describe, it, expect } from 'vitest';
import { formatTime, formatDuration, getStartOfDay, getStartOfWeek } from '@/utils/time';

describe('formatTime', () => {
  it('should format 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('should format 60 seconds as 01:00', () => {
    expect(formatTime(60)).toBe('01:00');
  });

  it('should format 90 seconds as 01:30', () => {
    expect(formatTime(90)).toBe('01:30');
  });

  it('should format 1500 seconds (25min) as 25:00', () => {
    expect(formatTime(1500)).toBe('25:00');
  });

  it('should format 3599 seconds as 59:59', () => {
    expect(formatTime(3599)).toBe('59:59');
  });
});

describe('formatDuration', () => {
  it('should format 60 seconds as 1分钟', () => {
    expect(formatDuration(60)).toBe('1分钟');
  });

  it('should format 1500 seconds (25min) as 25分钟', () => {
    expect(formatDuration(1500)).toBe('25分钟');
  });

  it('should format 3600 seconds as 1小时', () => {
    expect(formatDuration(3600)).toBe('1小时');
  });

  it('should format 5400 seconds (1.5h) as 1小时30分钟', () => {
    expect(formatDuration(5400)).toBe('1小时30分钟');
  });
});

describe('getStartOfDay', () => {
  it('should return midnight of the same day', () => {
    const date = new Date('2024-01-15T14:30:00');
    const result = getStartOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('getStartOfWeek', () => {
  it('should return Monday of the same week', () => {
    const date = new Date('2024-01-17T14:30:00');
    const result = getStartOfWeek(date);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(15);
  });

  it('should handle Sunday correctly', () => {
    const date = new Date('2024-01-21T14:30:00');
    const result = getStartOfWeek(date);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(15);
  });
});