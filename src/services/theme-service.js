/**
 * N-Trace — Theme Service
 * Manages light/dark/system theme switching.
 * Persists preference to localStorage.
 */

const THEME_KEY = 'ntrace_theme';
const THEMES = ['dark', 'light', 'system'];

export const themeService = {
  /**
   * Initialize theme on app load
   */
  init() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    this.apply(saved);
  },

  /**
   * Apply a theme by name
   * @param {'dark'|'light'|'system'} theme
   */
  apply(theme) {
    const root = document.documentElement;
    root.removeAttribute('data-theme');

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }

    localStorage.setItem(THEME_KEY, theme);
    this._currentTheme = theme;

    // Add transition class then remove it
    root.classList.add('theme-transition');
    setTimeout(() => root.classList.remove('theme-transition'), 300);
  },

  /**
   * Get current theme name
   */
  get current() {
    return this._currentTheme || localStorage.getItem(THEME_KEY) || 'dark';
  },

  /**
   * Cycle through themes: dark → light → system → dark
   */
  cycle() {
    const idx = THEMES.indexOf(this.current);
    const next = THEMES[(idx + 1) % THEMES.length];
    this.apply(next);
    return next;
  },

  /**
   * Listen for system theme changes (e.g. OS toggles dark/light mode)
   */
  watchSystem() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.current === 'system') this.apply('system');
    });
  },

  /**
   * Get the display icon for the current theme
   */
  getIcon() {
    switch (this.current) {
      case 'light': return '☀️';
      case 'system': return '💻';
      default: return '🌙';
    }
  },
};
