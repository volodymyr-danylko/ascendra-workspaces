import { describe, it, expect } from 'vitest';
import { formatCost, formatUptime, isIdle, getStatusColor, getStatusBgColor } from '@/lib/utils';

describe('formatCost', () => {
  it('formats whole dollars', () => expect(formatCost(2.0)).toBe('$2.00'));
  it('formats cents', () => expect(formatCost(0.48)).toBe('$0.48'));
  it('formats large values', () => expect(formatCost(2140)).toBe('$2,140.00'));
});

describe('formatUptime', () => {
  it('returns em-dash when startedAt is null', () => expect(formatUptime(null)).toBe('—'));
  it('formats minutes only', () => {
    const startedAt = new Date(Date.now() - 45 * 60 * 1000).toISOString();
    expect(formatUptime(startedAt)).toBe('45m');
  });
  it('formats hours and minutes', () => {
    const startedAt = new Date(Date.now() - (2 * 60 + 30) * 60 * 1000).toISOString();
    expect(formatUptime(startedAt)).toBe('2h 30m');
  });
});

describe('isIdle', () => {
  it('returns true when lastActiveAt > 2h ago', () => {
    const ts = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(isIdle(ts)).toBe(true);
  });
  it('returns false when lastActiveAt < 2h ago', () => {
    const ts = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    expect(isIdle(ts)).toBe(false);
  });
});

describe('getStatusColor', () => {
  it('maps running → text-status-running', () => expect(getStatusColor('running')).toBe('text-status-running'));
  it('maps stopped → text-status-stopped', () => expect(getStatusColor('stopped')).toBe('text-status-stopped'));
  it('maps starting → text-status-starting', () => expect(getStatusColor('starting')).toBe('text-status-starting'));
  it('maps stopping → text-status-starting', () => expect(getStatusColor('stopping')).toBe('text-status-starting'));
  it('maps error → text-status-error', () => expect(getStatusColor('error')).toBe('text-status-error'));
});

describe('getStatusBgColor', () => {
  it('returns a string for each status', () => {
    for (const s of ['running', 'stopped', 'starting', 'stopping', 'error'] as const) {
      expect(typeof getStatusBgColor(s)).toBe('string');
      expect(getStatusBgColor(s).length).toBeGreaterThan(0);
    }
  });
});
