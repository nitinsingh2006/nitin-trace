/**
 * Unit tests — history.js (IndexedDB service)
 *
 * Uses fake-indexeddb to polyfill the global indexedDB in Node/jsdom.
 * The auto import replaces global.indexedDB before any module loads.
 */
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveTraceToHistory,
  getTraceHistory,
  deleteTraceFromHistory,
  clearAllTraceHistory,
} from '../../services/history.js';

// Reset the dbInstance singleton between tests by resetting the module cache
// We clear all data in beforeEach instead, since fake-indexeddb is persistent per process

const SAMPLE_STEPS = [
  { step: 1, line: 1, explanation: 'Start', variables: {}, console: '' },
  { step: 2, line: 2, explanation: 'End', variables: { x: 1 }, console: 'done' },
];

describe('history.js — saveTraceToHistory()', () => {
  beforeEach(async () => {
    await clearAllTraceHistory();
  });

  it('returns a history item with expected shape', async () => {
    const item = await saveTraceToHistory('const x = 1;', 'javascript', SAMPLE_STEPS);
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('timestamp');
    expect(item).toHaveProperty('code', 'const x = 1;');
    expect(item).toHaveProperty('language', 'javascript');
    expect(item).toHaveProperty('steps');
    expect(item.steps).toHaveLength(2);
  });

  it('id is a non-empty string', async () => {
    const item = await saveTraceToHistory('x = 1', 'python', SAMPLE_STEPS);
    expect(typeof item.id).toBe('string');
    expect(item.id.length).toBeGreaterThan(0);
  });

  it('timestamp is a number (milliseconds)', async () => {
    const before = Date.now();
    const item = await saveTraceToHistory('x = 1', 'python', SAMPLE_STEPS);
    const after = Date.now();
    expect(typeof item.timestamp).toBe('number');
    expect(item.timestamp).toBeGreaterThanOrEqual(before);
    expect(item.timestamp).toBeLessThanOrEqual(after);
  });

  it('stores code and language exactly as passed', async () => {
    const code = 'function hello() { return "world"; }';
    const item = await saveTraceToHistory(code, 'javascript', SAMPLE_STEPS);
    expect(item.code).toBe(code);
    expect(item.language).toBe('javascript');
  });
});

describe('history.js — getTraceHistory()', () => {
  beforeEach(async () => {
    await clearAllTraceHistory();
  });

  it('returns an empty array when no traces saved', async () => {
    const history = await getTraceHistory();
    expect(history).toEqual([]);
  });

  it('returns a single saved trace', async () => {
    await saveTraceToHistory('let a = 1;', 'javascript', SAMPLE_STEPS);
    const history = await getTraceHistory();
    expect(history).toHaveLength(1);
    expect(history[0].code).toBe('let a = 1;');
  });

  it('returns all saved traces', async () => {
    await saveTraceToHistory('code1', 'javascript', SAMPLE_STEPS);
    await saveTraceToHistory('code2', 'python', SAMPLE_STEPS);
    await saveTraceToHistory('code3', 'typescript', SAMPLE_STEPS);
    const history = await getTraceHistory();
    expect(history).toHaveLength(3);
  });

  it('returns traces sorted newest first (by timestamp)', async () => {
    // Save with a small delay to ensure distinct timestamps
    await saveTraceToHistory('oldest', 'javascript', SAMPLE_STEPS);
    await new Promise(r => setTimeout(r, 10));
    await saveTraceToHistory('middle', 'python', SAMPLE_STEPS);
    await new Promise(r => setTimeout(r, 10));
    await saveTraceToHistory('newest', 'typescript', SAMPLE_STEPS);

    const history = await getTraceHistory();
    expect(history[0].code).toBe('newest');
    expect(history[1].code).toBe('middle');
    expect(history[2].code).toBe('oldest');
  });

  it('timestamps are in descending order', async () => {
    await saveTraceToHistory('a', 'js', SAMPLE_STEPS);
    await new Promise(r => setTimeout(r, 5));
    await saveTraceToHistory('b', 'js', SAMPLE_STEPS);

    const history = await getTraceHistory();
    expect(history[0].timestamp).toBeGreaterThanOrEqual(history[1].timestamp);
  });
});

describe('history.js — deleteTraceFromHistory()', () => {
  beforeEach(async () => {
    await clearAllTraceHistory();
  });

  it('removes the specified trace by id', async () => {
    const item = await saveTraceToHistory('to delete', 'javascript', SAMPLE_STEPS);
    await saveTraceToHistory('keep me', 'python', SAMPLE_STEPS);

    await deleteTraceFromHistory(item.id);

    const history = await getTraceHistory();
    expect(history).toHaveLength(1);
    expect(history[0].code).toBe('keep me');
  });

  it('does not remove other traces', async () => {
    const a = await saveTraceToHistory('a', 'js', SAMPLE_STEPS);
    await saveTraceToHistory('b', 'js', SAMPLE_STEPS);
    await saveTraceToHistory('c', 'js', SAMPLE_STEPS);

    await deleteTraceFromHistory(a.id);

    const history = await getTraceHistory();
    expect(history).toHaveLength(2);
    const codes = history.map(h => h.code);
    expect(codes).not.toContain('a');
    expect(codes).toContain('b');
    expect(codes).toContain('c');
  });

  it('resolves without error when deleting a non-existent id', async () => {
    await expect(deleteTraceFromHistory('nonexistent-id-xyz')).resolves.toBeUndefined();
  });
});

describe('history.js — clearAllTraceHistory()', () => {
  beforeEach(async () => {
    await clearAllTraceHistory();
  });

  it('clears all traces, returning empty array', async () => {
    await saveTraceToHistory('a', 'js', SAMPLE_STEPS);
    await saveTraceToHistory('b', 'py', SAMPLE_STEPS);
    await saveTraceToHistory('c', 'ts', SAMPLE_STEPS);

    await clearAllTraceHistory();

    const history = await getTraceHistory();
    expect(history).toEqual([]);
  });

  it('resolves without error when called on an already empty store', async () => {
    await expect(clearAllTraceHistory()).resolves.toBeUndefined();
  });

  it('allows new saves after clearing', async () => {
    await saveTraceToHistory('before clear', 'js', SAMPLE_STEPS);
    await clearAllTraceHistory();
    await saveTraceToHistory('after clear', 'js', SAMPLE_STEPS);

    const history = await getTraceHistory();
    expect(history).toHaveLength(1);
    expect(history[0].code).toBe('after clear');
  });
});

describe('history.js — combined workflow', () => {
  beforeEach(async () => {
    await clearAllTraceHistory();
  });

  it('full cycle: save 3, get sorted, delete 1, verify count', async () => {
    const a = await saveTraceToHistory('trace-a', 'javascript', SAMPLE_STEPS);
    await new Promise(r => setTimeout(r, 5));
    await saveTraceToHistory('trace-b', 'python', SAMPLE_STEPS);
    await new Promise(r => setTimeout(r, 5));
    await saveTraceToHistory('trace-c', 'typescript', SAMPLE_STEPS);

    // Verify sorted order (newest first)
    const before = await getTraceHistory();
    expect(before).toHaveLength(3);
    expect(before[0].code).toBe('trace-c');
    expect(before[2].code).toBe('trace-a');

    // Delete the oldest (trace-a)
    await deleteTraceFromHistory(a.id);

    // Verify count reduced
    const after = await getTraceHistory();
    expect(after).toHaveLength(2);
    const remaining = after.map(h => h.code);
    expect(remaining).toContain('trace-b');
    expect(remaining).toContain('trace-c');
    expect(remaining).not.toContain('trace-a');
  });

  it('save → clear → getTraceHistory returns []', async () => {
    await saveTraceToHistory('x', 'js', SAMPLE_STEPS);
    await clearAllTraceHistory();
    const history = await getTraceHistory();
    expect(history).toEqual([]);
  });
});
