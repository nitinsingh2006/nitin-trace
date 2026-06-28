/**
 * Unit tests — response-parser.js
 */
import { describe, it, expect } from 'vitest';
import { parseTraceResponse } from '../../services/ai/response-parser.js';

const VALID_STEPS = [
  {
    line: 1,
    explanation: 'Declare variable x',
    variables: { x: 5 },
    console: '',
  },
  {
    line: 2,
    explanation: 'Print x',
    variables: { x: 5 },
    console: '5',
  },
];

const VALID_JSON = JSON.stringify({ steps: VALID_STEPS });

describe('parseTraceResponse()', () => {
  // ── Happy path ──────────────────────────────────────────────────────────

  it('parses valid JSON correctly', () => {
    const { steps, error } = parseTraceResponse(VALID_JSON);
    expect(error).toBeNull();
    expect(steps).toHaveLength(2);
    expect(steps[0].line).toBe(1);
    expect(steps[0].explanation).toBe('Declare variable x');
  });

  it('strips markdown code fences', () => {
    const wrapped = `\`\`\`json\n${VALID_JSON}\n\`\`\``;
    const { steps, error } = parseTraceResponse(wrapped);
    expect(error).toBeNull();
    expect(steps).toHaveLength(2);
  });

  it('strips plain code fences', () => {
    const wrapped = `\`\`\`\n${VALID_JSON}\n\`\`\``;
    const { steps, error } = parseTraceResponse(wrapped);
    expect(error).toBeNull();
    expect(steps).toHaveLength(2);
  });

  // ── XSS Prevention ───────────────────────────────────────────────────────

  it('passes HTML through unescaped (escaping handled by UI)', () => {
    const malicious = JSON.stringify({
      steps: [{
        line: 1,
        explanation: '<script>alert("xss")</script>',
        variables: {},
        console: '',
      }]
    });
    const { steps } = parseTraceResponse(malicious);
    expect(steps[0].explanation).toBe('<script>alert("xss")</script>');
  });

  it('passes console tags through unescaped', () => {
    const malicious = JSON.stringify({
      steps: [{
        line: 1,
        explanation: 'Print',
        variables: {},
        console: '<img src=x onerror=alert(1)>',
      }]
    });
    const { steps } = parseTraceResponse(malicious);
    expect(steps[0].console).toBe('<img src=x onerror=alert(1)>');
  });

  it('passes variable tags through unescaped', () => {
    const malicious = JSON.stringify({
      steps: [{
        line: 1,
        explanation: 'Test',
        variables: { '<evil>': '<script>alert(1)</script>' },
        console: '',
      }]
    });
    const { steps } = parseTraceResponse(malicious);
    const keys = Object.keys(steps[0].variables);
    expect(keys[0]).toBe('<evil>');
    expect(Object.values(steps[0].variables)[0].value).toBe('<script>alert(1)</script>');
  });

  // ── Error cases ─────────────────────────────────────────────────────────

  it('returns error for empty input', () => {
    const { error } = parseTraceResponse('');
    expect(error).toBeTruthy();
  });

  it('returns error for null input', () => {
    const { error } = parseTraceResponse(null);
    expect(error).toBeTruthy();
  });

  it('returns error for invalid JSON', () => {
    const { error } = parseTraceResponse('{ invalid json }');
    expect(error).toBeTruthy();
    expect(error).toContain('invalid JSON');
  });

  it('returns error for missing steps array', () => {
    const { error } = parseTraceResponse(JSON.stringify({ result: [] }));
    expect(error).toBeTruthy();
    expect(error).toContain('steps');
  });

  it('returns error for empty steps array', () => {
    const { error } = parseTraceResponse(JSON.stringify({ steps: [] }));
    expect(error).toBeTruthy();
  });

  // ── Data normalization ───────────────────────────────────────────────────

  it('normalizes line numbers (defaults invalid to 1)', () => {
    const json = JSON.stringify({
      steps: [{
        line: -1,
        explanation: 'Test',
        variables: {},
        console: '',
      }]
    });
    const { steps } = parseTraceResponse(json);
    expect(steps[0].line).toBe(1);
  });

  it('handles missing explanation', () => {
    const json = JSON.stringify({
      steps: [{
        line: 1,
        variables: {},
        console: '',
      }]
    });
    const { steps } = parseTraceResponse(json);
    expect(steps[0].explanation).toBeTruthy(); // Gets default text
  });

  it('handles non-object variables', () => {
    const json = JSON.stringify({
      steps: [{
        line: 1,
        explanation: 'Test',
        variables: 'not an object',
        console: '',
      }]
    });
    const { steps } = parseTraceResponse(json);
    expect(steps[0].variables).toEqual({});
  });

  it('truncates excessively long variable values', () => {
    const longValue = 'x'.repeat(1000);
    const json = JSON.stringify({
      steps: [{
        line: 1,
        explanation: 'Test',
        variables: { arr: longValue },
        console: '',
      }]
    });
    const { steps } = parseTraceResponse(json);
    const valObj = Object.values(steps[0].variables)[0];
    const val = valObj.value;
    // Value should be truncated to ≤500 chars + possible '...' suffix
    expect(val.length).toBeLessThanOrEqual(503);
    expect(val.length).toBeLessThan(1000); // Must be shorter than 1000
  });
});
