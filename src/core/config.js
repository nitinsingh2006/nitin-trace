/**
 * Runtime Configuration
 *
 * Centralized configuration management for the application.
 * Handles environment variables, feature flags, and API endpoints.
 *
 * @module core/config
 */

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not found
 * @returns {*}
 */
function getEnv(key, defaultValue = undefined) {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
}

/**
 * Parse boolean environment variable
 * @param {string} key - Environment variable key
 * @param {boolean} defaultValue - Default value
 * @returns {boolean}
 */
function getBoolEnv(key, defaultValue = false) {
  const value = getEnv(key);
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1' || value === true;
}

/**
 * Parse number environment variable
 * @param {string} key - Environment variable key
 * @param {number} defaultValue - Default value
 * @returns {number}
 */
function getNumberEnv(key, defaultValue = 0) {
  const value = getEnv(key);
  if (value === undefined) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Application Configuration
 */
const config = {
  // App metadata
  app: {
    name: 'N-Trace',
    version: '1.0.0',
    description: 'AI-powered code execution visualizer',
    author: 'Nitin Singh',
    homepage: 'https://n-trace.vercel.app',
    repository: 'https://github.com/nitinsingh2006/n-trace'
  },

  // Environment
  env: {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
    baseUrl: import.meta.env.BASE_URL
  },

  // Debug settings
  debug: {
    enabled: getBoolEnv('VITE_DEBUG_MODE', false),
    logLevel: getEnv('VITE_LOG_LEVEL', 'info'), // 'debug' | 'info' | 'warn' | 'error'
    showPerformance: getBoolEnv('VITE_SHOW_PERFORMANCE', false)
  },

  // AI Configuration
  ai: {
    provider: 'gemini',
    apiKey: getEnv('VITE_ANTHROPIC_API_KEY', ''),

    // Gemini API settings
    GEMINI: {
      ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
      DEFAULT_MODEL: 'gemini-2.0-flash',
      AVAILABLE_MODELS: [
        { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
        { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
        { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      ],
      MAX_RETRIES: 2,
      RETRY_DELAY_MS: 1500,
    },

    // Groq API settings
    GROQ: {
      ENDPOINT: 'https://api.groq.com/openai/v1/chat/completions',
      DEFAULT_MODEL: 'llama-3.3-70b-versatile',
      AVAILABLE_MODELS: [
        { id: 'llama-3.3-70b-versatile', label: 'LLaMA 3.3 70B' },
        { id: 'llama-3.1-8b-instant', label: 'LLaMA 3.1 8B' },
        { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
      ],
      MAX_RETRIES: 2,
      RETRY_DELAY_MS: 1500,
    },

    // OpenAI API settings
    OPENAI: {
      ENDPOINT: 'https://api.openai.com/v1/chat/completions',
      DEFAULT_MODEL: 'gpt-4o',
      AVAILABLE_MODELS: [
        { id: 'gpt-4o', label: 'GPT-4o' },
        { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      ],
      MAX_RETRIES: 2,
      RETRY_DELAY_MS: 1500,
    },

    // Claude API settings
    CLAUDE: {
      ENDPOINT: 'https://api.anthropic.com/v1/messages',
      DEFAULT_MODEL: 'claude-sonnet-4-20250514',
      AVAILABLE_MODELS: [
        { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
        { id: 'claude-haiku-3-5-sonnet-20241022', label: 'Claude Haiku 3.5' },
      ],
      MAX_RETRIES: 2,
      RETRY_DELAY_MS: 1500,
    },

    // Rate limiting
    rateLimit: {
      maxRequestsPerMinute: 50,
      maxRequestsPerHour: 1000
    }
  },

  // GitHub Integration
  github: {
    token: getEnv('VITE_GITHUB_PAT', ''),
    apiEndpoint: 'https://api.github.com',
    defaultBranch: 'main',
    repoPrefix: 'n-trace-',
    commitMessage: 'Add execution trace from N-Trace',
    requiredScopes: ['public_repo']
  },

  // Editor Configuration
  editor: {
    defaultLanguage: 'javascript',
    defaultTheme: 'vs-dark',
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    lineHeight: 1.6,
    wordWrap: 'on',
    minimap: {
      enabled: true
    },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true
  },

  // Supported Languages
  languages: [
    { id: 'javascript', name: 'JavaScript', extension: '.js', icon: '🟨' },
    { id: 'typescript', name: 'TypeScript', extension: '.ts', icon: '🔷' },
    { id: 'python', name: 'Python', extension: '.py', icon: '🐍' },
    { id: 'java', name: 'Java', extension: '.java', icon: '☕' },
    { id: 'cpp', name: 'C++', extension: '.cpp', icon: '⚙️' },
    { id: 'c', name: 'C', extension: '.c', icon: '🔧' },
    { id: 'csharp', name: 'C#', extension: '.cs', icon: '💜' },
    { id: 'go', name: 'Go', extension: '.go', icon: '🐹' },
    { id: 'rust', name: 'Rust', extension: '.rs', icon: '🦀' },
    { id: 'ruby', name: 'Ruby', extension: '.rb', icon: '💎' },
    { id: 'php', name: 'PHP', extension: '.php', icon: '🐘' },
    { id: 'swift', name: 'Swift', extension: '.swift', icon: '🦅' },
    { id: 'kotlin', name: 'Kotlin', extension: '.kt', icon: '🟣' },
    { id: 'scala', name: 'Scala', extension: '.scala', icon: '🔴' },
    { id: 'r', name: 'R', extension: '.r', icon: '📊' },
    { id: 'sql', name: 'SQL', extension: '.sql', icon: '🗄️' },
    { id: 'shell', name: 'Shell', extension: '.sh', icon: '🐚' }
  ],

  // Trace Configuration
  trace: {
    defaultSpeed: 1000, // ms per step
    minSpeed: 100,
    maxSpeed: 5000,
    speedStep: 100,
    maxSteps: 1000, // Maximum steps to prevent infinite loops
    autoPlay: false
  },

  // History Configuration
  history: {
    maxItems: getNumberEnv('VITE_MAX_HISTORY_ITEMS', 100),
    autoSave: true,
    storageKey: 'n-trace-history',
    searchDebounce: 300 // ms
  },

  // UI Configuration
  ui: {
    defaultTheme: 'dark',
    accentColor: '#00f0ff',
    animationDuration: 300, // ms
    toastDuration: 3000, // ms
    modalTransitionDuration: 200, // ms
    breakpoints: {
      mobile: 640,
      tablet: 1024,
      desktop: 1280
    }
  },

  // Feature Flags
  features: {
    export: getBoolEnv('VITE_ENABLE_EXPORT', true),
    share: getBoolEnv('VITE_ENABLE_SHARE', true),
    collaboration: getBoolEnv('VITE_ENABLE_COLLABORATION', false),
    pwa: getBoolEnv('VITE_ENABLE_PWA', true),
    analytics: getBoolEnv('VITE_ENABLE_ANALYTICS', false),
    errorReporting: getBoolEnv('VITE_ENABLE_ERROR_REPORTING', false),
    onboarding: true,
    keyboardShortcuts: true,
    callStack: true,
    variableTimeline: true,
    breakpoints: true
  },

  // Analytics Configuration
  analytics: {
    plausibleDomain: getEnv('VITE_PLAUSIBLE_DOMAIN', ''),
    enabled: getBoolEnv('VITE_ENABLE_ANALYTICS', false)
  },

  // Error Reporting Configuration
  errorReporting: {
    sentryDsn: getEnv('VITE_SENTRY_DSN', ''),
    enabled: getBoolEnv('VITE_ENABLE_ERROR_REPORTING', false),
    environment: import.meta.env.MODE,
    sampleRate: 1.0,
    tracesSampleRate: 0.1
  },

  // Performance Configuration
  performance: {
    enableMetrics: getBoolEnv('VITE_SHOW_PERFORMANCE', false),
    lazyLoadThreshold: 0.1, // Intersection Observer threshold
    debounceDelay: 250, // ms
    throttleDelay: 100 // ms
  },

  // Security Configuration
  security: {
    apiKeyMinLength: 20,
    apiKeyMaxLength: 200,
    maxCodeLength: 50000, // characters
    sanitizeOutput: true,
    allowedOrigins: [
      'https://n-trace.vercel.app',
      'http://localhost:5173',
      'http://localhost:4173'
    ]
  },

  // Storage Configuration
  storage: {
    prefix: 'n-trace-',
    version: 1,
    databases: {
      history: 'n-trace-history',
      cache: 'n-trace-cache'
    }
  },

  // Keyboard Shortcuts
  shortcuts: {
    trace: 'Ctrl+Enter',
    play: 'Space',
    pause: 'Space',
    nextStep: 'ArrowRight',
    prevStep: 'ArrowLeft',
    firstStep: 'Home',
    lastStep: 'End',
    speedUp: 'ArrowUp',
    speedDown: 'ArrowDown',
    settings: 'Ctrl+,',
    history: 'Ctrl+H',
    help: '?',
    save: 'Ctrl+S'
  },

  // API Endpoints (future backend)
  api: {
    baseUrl: getEnv('VITE_API_BASE_URL', ''),
    endpoints: {
      trace: '/api/trace',
      share: '/api/share',
      examples: '/api/examples',
      feedback: '/api/feedback'
    }
  }
};

/**
 * Validate configuration
 * @returns {object} Validation result
 */
export function validateConfig() {
  const errors = [];
  const warnings = [];

  // Check AI configuration
  if (!config.ai.apiKey || config.ai.apiKey.length === 0) {
    warnings.push('AI API key not configured. AI features will not work.');
  } else if (config.ai.apiKey.length < config.security.apiKeyMinLength) {
    errors.push('AI API key appears to be invalid (too short).');
  }

  // Check GitHub configuration
  if (config.github.token && config.github.token.length > 0) {
    if (config.github.token.length < config.security.apiKeyMinLength) {
      warnings.push('GitHub token appears to be invalid (too short).');
    }
  }

  // Check feature flags
  if (config.features.analytics && !config.analytics.plausibleDomain) {
    warnings.push('Analytics enabled but domain not configured.');
  }

  if (config.features.errorReporting && !config.errorReporting.sentryDsn) {
    warnings.push('Error reporting enabled but Sentry DSN not configured.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get configuration value by path
 * @param {string} path - Dot-notation path (e.g., 'ai.claude.model')
 * @returns {*}
 */
export function getConfig(path) {
  const keys = path.split('.');
  let value = config;

  for (const key of keys) {
    if (value === undefined || value === null) return undefined;
    value = value[key];
  }

  return value;
}

/**
 * Check if a feature is enabled
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
export function isFeatureEnabled(feature) {
  return config.features[feature] === true;
}

/**
 * Get language configuration by ID
 * @param {string} languageId - Language ID
 * @returns {object|undefined}
 */
export function getLanguage(languageId) {
  return config.languages.find(lang => lang.id === languageId);
}

/**
 * Get all supported languages
 * @returns {Array}
 */
export function getSupportedLanguages() {
  return [...config.languages];
}

/**
 * Check if running in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
  return config.env.isDevelopment;
}

/**
 * Check if running in production mode
 * @returns {boolean}
 */
export function isProduction() {
  return config.env.isProduction;
}

/**
 * Get debug status
 * @returns {boolean}
 */
export function isDebugEnabled() {
  return config.debug.enabled;
}

// Export configuration object
config.AI = config.ai;
export default config;
export const CONFIG = config;

// Log configuration in development
if (isDevelopment() && isDebugEnabled()) {
  console.log('[Config] Application configuration:', config);

  const validation = validateConfig();
  if (validation.warnings.length > 0) {
    console.warn('[Config] Configuration warnings:', validation.warnings);
  }
  if (validation.errors.length > 0) {
    console.error('[Config] Configuration errors:', validation.errors);
  }
}