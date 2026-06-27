import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        indexedDB: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        Worker: 'readonly',
        ServiceWorker: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        CompressionStream: 'readonly',
        DecompressionStream: 'readonly',
        // Node.js / Worker globals
        global: 'readonly',
        self: 'readonly',
        // Monaco globals
        monaco: 'readonly',
        require: 'readonly',
      }
    },
    rules: {
      // ── Errors ──────────────────────────────────────────────
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'no-undef': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'no-debugger': 'error',

      // ── Best Practices ───────────────────────────────────────
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-param-reassign': ['warn', { props: false }],
      'prefer-const': 'error',
      'no-var': 'error',

      // ── Async ────────────────────────────────────────────────
      'no-async-promise-executor': 'error',
      'no-promise-executor-return': 'warn',
      'require-await': 'warn',

      // ── Security ─────────────────────────────────────────────
      'no-script-url': 'error',

      // ── Style (let Prettier handle formatting) ───────────────
      'no-multiple-empty-lines': ['warn', { max: 2 }],
      'no-trailing-spaces': 'warn',
    }
  },
  {
    // Test files get relaxed rules + vitest globals
    files: ['src/__tests__/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        global: 'readonly',
      }
    },
    rules: {
      'no-console': 'off',
    }
  },
  {
    // Ignore build outputs and config files
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.js']
  }
];
