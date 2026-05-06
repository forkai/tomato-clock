import { describe, it, expect } from 'vitest'
import { SessionRecordSchema } from '@/schemas/database'

describe('SessionRecordSchema', () => {
  it('should accept valid session record', () => {
    const valid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      date: '2024-01-15T00:00:00.000Z',
      duration: 1500,
      type: 'work',
      completedAt: 1705312800000
    }
    expect(SessionRecordSchema.parse(valid)).toEqual(valid)
  })

  it('should accept shortBreak type', () => {
    const valid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      date: '2024-01-15T00:00:00.000Z',
      duration: 300,
      type: 'shortBreak',
      completedAt: 1705312800000
    }
    expect(SessionRecordSchema.parse(valid)).toEqual(valid)
  })

  it('should accept longBreak type', () => {
    const valid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      date: '2024-01-15T00:00:00.000Z',
      duration: 900,
      type: 'longBreak',
      completedAt: 1705312800000
    }
    expect(SessionRecordSchema.parse(valid)).toEqual(valid)
  })

  it('should reject invalid UUID', () => {
    const invalid = {
      id: 'not-a-uuid',
      date: '2024-01-15T00:00:00.000Z',
      duration: 1500,
      type: 'work',
      completedAt: 1705312800000
    }
    expect(() => SessionRecordSchema.parse(invalid)).toThrow()
  })

  it('should reject invalid date format', () => {
    const invalid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      date: '2024/01/15',
      duration: 1500,
      type: 'work',
      completedAt: 1705312800000
    }
    expect(() => SessionRecordSchema.parse(invalid)).toThrow()
  })

  it('should reject zero duration', () => {
    const invalid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      date: '2024-01-15T00:00:00.000Z',
      duration: 0,
      type: 'work',
      completedAt: 1705312800000
    }
    expect(() => SessionRecordSchema.parse(invalid)).toThrow()
  })

  it('should reject negative duration', () => {
    const invalid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      date: '2024-01-15T00:00:00.000Z',
      duration: -1,
      type: 'work',
      completedAt: 1705312800000
    }
    expect(() => SessionRecordSchema.parse(invalid)).toThrow()
  })

  it('should reject invalid session type', () => {
    const invalid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      date: '2024-01-15T00:00:00.000Z',
      duration: 1500,
      type: 'rest',
      completedAt: 1705312800000
    }
    expect(() => SessionRecordSchema.parse(invalid)).toThrow()
  })

  it('should reject missing required fields', () => {
    expect(() => SessionRecordSchema.parse({})).toThrow()
    expect(() =>
      SessionRecordSchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440000'
      })
    ).toThrow()
  })
})
