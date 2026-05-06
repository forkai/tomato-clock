import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDatabase, DatabaseProvider } from '@/hooks/useDatabase.jsx';
import React from 'react';

/**
 * useDatabase Context 集成测试
 */

// Mock sql.js
const mockRun = vi.fn();
const mockExec = vi.fn();
const mockClose = vi.fn();

vi.mock('sql.js', () => {
  return {
    default: vi.fn(() => Promise.resolve({
      Database: vi.fn(() => ({
        run: mockRun,
        exec: mockExec,
        close: mockClose
      }))
    }))
  };
});

describe('useDatabase Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExec.mockReturnValue([]);
  });

  it('should initialize with loading state', async () => {
    const wrapper = ({ children }) => (
      <DatabaseProvider>{children}</DatabaseProvider>
    );

    const { result } = renderHook(() => useDatabase(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.db).toBe(null);
  });

  it('should provide all required methods', async () => {
    const wrapper = ({ children }) => (
      <DatabaseProvider>{children}</DatabaseProvider>
    );

    const { result } = renderHook(() => useDatabase(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.saveSession).toBe('function');
    expect(typeof result.current.getTodayStats).toBe('function');
    expect(typeof result.current.getWeekStats).toBe('function');
    expect(typeof result.current.clearAllData).toBe('function');
    expect(typeof result.current.generateMockData).toBe('function');
  });

  it('should increment dataVersion after generateMockData', async () => {
    const wrapper = ({ children }) => (
      <DatabaseProvider>{children}</DatabaseProvider>
    );

    const { result } = renderHook(() => useDatabase(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialVersion = result.current.dataVersion;

    await act(async () => {
      result.current.generateMockData();
    });

    expect(result.current.dataVersion).toBe(initialVersion + 1);
  });

  it('should increment dataVersion after clearAllData', async () => {
    const wrapper = ({ children }) => (
      <DatabaseProvider>{children}</DatabaseProvider>
    );

    const { result } = renderHook(() => useDatabase(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialVersion = result.current.dataVersion;

    await act(async () => {
      result.current.clearAllData();
    });

    expect(result.current.dataVersion).toBe(initialVersion + 1);
  });

  it('should call db.run with DELETE query on clearAllData', async () => {
    const wrapper = ({ children }) => (
      <DatabaseProvider>{children}</DatabaseProvider>
    );

    const { result } = renderHook(() => useDatabase(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.clearAllData();
    });

    expect(mockRun).toHaveBeenCalledWith('DELETE FROM sessions');
  });

  it('should call db.run with INSERT query on saveSession', async () => {
    const wrapper = ({ children }) => (
      <DatabaseProvider>{children}</DatabaseProvider>
    );

    const { result } = renderHook(() => useDatabase(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.saveSession(1500, 'work');
    });

    expect(mockRun).toHaveBeenCalledWith(
      'INSERT INTO sessions (started_at, duration, type) VALUES (?, ?, ?)',
      expect.any(Array)
    );
  });

  it('should throw error when useDatabase used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useDatabase());
    }).toThrow('useDatabase must be used within a DatabaseProvider');

    consoleSpy.mockRestore();
  });
});
