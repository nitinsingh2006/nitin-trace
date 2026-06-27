const API_KEY_PATTERNS = {
  gemini: /^AIza[0-9A-Za-z_-]{35}$/,
  groq: /^gsk_[0-9A-Za-z]{32}$/,
  openai: /^sk-[0-9A-Za-z]{20,}$/,
  claude: /^sk-ant-[0-9A-Za-z]{20,}$/,
};

export function sanitizeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function isValidApiKey(key, provider) {
  if (!key || typeof key !== 'string') return false;
  const pattern = API_KEY_PATTERNS[provider];
  if (!pattern) return false;
  return pattern.test(key.trim());
}

export function maskKey(key) {
  if (!key || typeof key !== 'string') return '';
  if (key.length <= 4) return '****';
  return '*'.repeat(key.length - 4) + key.slice(-4);
}
