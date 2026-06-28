import { beforeAll, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';

beforeAll(() => {
  import.meta.env.VITE_ANTHROPIC_API_KEY = 'test-api-key';
  import.meta.env.VITE_DEBUG_MODE = 'false';
  import.meta.env.DEV = true;
  import.meta.env.PROD = false;
  import.meta.env.MODE = 'test';
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  document.body.innerHTML = '';
  vi.useRealTimers();
});

globalThis.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

class MockObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
}

globalThis.IntersectionObserver = MockObserver;
globalThis.ResizeObserver = MockObserver;
