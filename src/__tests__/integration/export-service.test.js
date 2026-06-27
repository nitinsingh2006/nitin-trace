/**
 * Integration tests — Export Service
 * Tests exportToMarkdown and exportToJSON with realistic trace data.
 */
import { describe, it, expect } from 'vitest';
import {
  exportToMarkdown,
  exportToJSON,
} from '../../services/export-service.js';

const SAMPLE_CODE = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`;

const SAMPLE_STEPS = [
  {
    step: 1,
    line: 1,
    explanation: 'Define bubble_sort function',
    variables: {},
    console: '',
  },
  {
    step: 2,
    line: 2,
    explanation: 'n is set to length of arr',
    variables: { n: 5, arr: [64, 34, 25, 12, 22] },
    console: '',
  },
  {
    step: 3,
    line: 7,
    explanation: 'Function returns sorted array',
    variables: { n: 5, arr: [12, 22, 25, 34, 64] },
    console: 'Sorted: [12, 22, 25, 34, 64]',
  },
];

// ─── Markdown Export ──────────────────────────────────────────────────────

describe('exportToMarkdown()', () => {
  it('returns a non-empty string', () => {
    const md = exportToMarkdown(SAMPLE_CODE, 'python', SAMPLE_STEPS);
    expect(typeof md).toBe('string');
    expect(md.length).toBeGreaterThan(0);
  });

  it('includes the language in the report', () => {
    const md = exportToMarkdown(SAMPLE_CODE, 'python', SAMPLE_STEPS);
    expect(md).toContain('python');
  });

  it('includes the source code in a fenced code block', () => {
    const md = exportToMarkdown(SAMPLE_CODE, 'python', SAMPLE_STEPS);
    expect(md).toContain('```python');
    expect(md).toContain('def bubble_sort');
  });

  it('includes all step explanations', () => {
    const md = exportToMarkdown(SAMPLE_CODE, 'python', SAMPLE_STEPS);
    SAMPLE_STEPS.forEach(step => {
      expect(md).toContain(step.explanation);
    });
  });

  it('includes variable table for steps with variables', () => {
    const md = exportToMarkdown(SAMPLE_CODE, 'python', SAMPLE_STEPS);
    expect(md).toContain('| Variable |');
    expect(md).toContain('`n`');
    expect(md).toContain('`arr`');
  });

  it('includes console output for steps with output', () => {
    const md = exportToMarkdown(SAMPLE_CODE, 'python', SAMPLE_STEPS);
    expect(md).toContain('Sorted: [12, 22, 25, 34, 64]');
  });

  it('includes NitinTrace attribution', () => {
    const md = exportToMarkdown(SAMPLE_CODE, 'python', SAMPLE_STEPS);
    expect(md).toContain('NitinTrace');
  });

  it('handles empty steps array', () => {
    const md = exportToMarkdown(SAMPLE_CODE, 'javascript', []);
    expect(typeof md).toBe('string');
    expect(md).toContain('## Execution Trace');
  });

  it('handles steps with no variables', () => {
    const steps = [
      { step: 1, line: 1, explanation: 'Start', variables: {}, console: '' },
    ];
    const md = exportToMarkdown('x = 1', 'python', steps);
    expect(md).not.toContain('| Variable |');
  });

  it('handles steps with null/undefined console', () => {
    const steps = [
      { step: 1, line: 1, explanation: 'Init', variables: { x: 1 }, console: null },
    ];
    const md = exportToMarkdown('x = 1', 'python', steps);
    expect(md).not.toContain('Console Output');
  });
});

// ─── JSON Export ──────────────────────────────────────────────────────────

describe('exportToJSON()', () => {
  it('returns valid JSON', () => {
    const json = exportToJSON(SAMPLE_CODE, 'python', SAMPLE_STEPS);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes meta block with app name and version', () => {
    const data = JSON.parse(exportToJSON(SAMPLE_CODE, 'python', SAMPLE_STEPS));
    expect(data.meta.app).toBe('NitinTrace');
    expect(data.meta.version).toBeTruthy();
    expect(data.meta.format).toBe('nitintrace-trace-v1');
  });

  it('includes exportedAt ISO timestamp', () => {
    const data = JSON.parse(exportToJSON(SAMPLE_CODE, 'python', SAMPLE_STEPS));
    expect(data.meta.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('includes trace with correct language', () => {
    const data = JSON.parse(exportToJSON(SAMPLE_CODE, 'python', SAMPLE_STEPS));
    expect(data.trace.language).toBe('python');
  });

  it('includes correct step count', () => {
    const data = JSON.parse(exportToJSON(SAMPLE_CODE, 'python', SAMPLE_STEPS));
    expect(data.trace.stepCount).toBe(SAMPLE_STEPS.length);
    expect(data.trace.steps).toHaveLength(SAMPLE_STEPS.length);
  });

  it('includes trimmed code in trace', () => {
    const data = JSON.parse(exportToJSON('  ' + SAMPLE_CODE + '\n', 'python', SAMPLE_STEPS));
    expect(data.trace.code).toBe(SAMPLE_CODE.trim());
  });

  it('normalizes steps with missing fields', () => {
    const steps = [{ line: 1, explanation: 'test' }];
    const data = JSON.parse(exportToJSON('x = 1', 'python', steps));
    const step = data.trace.steps[0];
    expect(step.variables).toEqual({});
    expect(step.console).toBe('');
    expect(step.callStack).toEqual([]);
  });

  it('handles an empty steps array', () => {
    const data = JSON.parse(exportToJSON('x = 1', 'python', []));
    expect(data.trace.steps).toEqual([]);
    expect(data.trace.stepCount).toBe(0);
  });
});

// ─── Combined workflow ────────────────────────────────────────────────────

describe('Export round-trip', () => {
  it('JSON export preserves all step data', () => {
    const data = JSON.parse(exportToJSON(SAMPLE_CODE, 'python', SAMPLE_STEPS));
    const steps = data.trace.steps;

    SAMPLE_STEPS.forEach((original, i) => {
      expect(steps[i].line).toBe(original.line);
      expect(steps[i].explanation).toBe(original.explanation);
    });
  });

  it('Markdown export step count matches input', () => {
    const md = exportToMarkdown(SAMPLE_CODE, 'python', SAMPLE_STEPS);
    // Count "### Step" headers
    const stepHeaders = (md.match(/^### Step \d+/gm) || []).length;
    expect(stepHeaders).toBe(SAMPLE_STEPS.length);
  });
});
