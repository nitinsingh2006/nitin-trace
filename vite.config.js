import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Path aliases — use @/ for src/
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@core': resolve(__dirname, 'src/core'),
      '@styles': resolve(__dirname, 'src/styles'),
    }
  },

  // Development server
  server: {
    port: 5174,
    open: false,
  },

  // Build optimizations
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,

    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks(id) {
          // Separate chunk for history service (IndexedDB heavy)
          if (id.includes('services/history')) return 'history';
          // Separate chunk for github service
          if (id.includes('services/github')) return 'github';
          // Separate chunk for footer
          if (id.includes('components/footer')) return 'footer';
        },
      }
    },

    // Report on bundle sizes
    reportCompressedSize: true,
    chunkSizeWarningLimit: 300,
  },

  // CSS code splitting
  css: {
    devSourcemap: true,
  },

  // Test configuration (Vitest)
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
    // Provide env vars for tests
    env: {
      VITE_ENABLE_PRO: 'false',
      VITE_DEBUG: 'false',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: [
        'src/__tests__/**',
        'src/main.js',  // Entry point
        'src/workers/**',  // Web workers
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      }
    }
  }
});
