/**
 * CodeTrace — GitHub Integration Service
 *
 * Uses GitHub REST API v3 with a Personal Access Token (PAT).
 * Requires token scope: public_repo (to create repos & push files).
 *
 * Flow:
 *  1. verifyGitHubToken(token)  →  get user info
 *  2. pushCodeTrace(...)        →  auto-create repo if needed, push file
 */

const GITHUB_API = 'https://api.github.com';
export const REPO_NAME = 'nitintrace-traces';

/** Map language IDs to file extensions */
const EXTENSIONS = {
  javascript: 'js',
  typescript: 'ts',
  python:     'py',
  java:       'java',
  cpp:        'cpp',
  c:          'c',
  csharp:     'cs',
  go:         'go',
  rust:       'rs',
  ruby:       'rb',
  php:        'php',
  swift:      'swift',
  kotlin:     'kt',
  dart:       'dart',
  scala:      'scala',
  r:          'r',
  bash:       'sh',
  shell:      'sh',
};

/** Comment character prefix per language */
function getCommentChar(language) {
  const hash = ['python', 'ruby', 'r', 'bash', 'shell'];
  return hash.includes(language) ? '#' : '//';
}

/**
 * Build a rich comment header for the saved file.
 * Includes trace metadata and first few step explanations.
 */
function buildFileHeader(language, steps, date) {
  const cc = getCommentChar(language);
  const divider = `${cc} ${'═'.repeat(54)}`;
  const dateStr = date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const preview = steps
    .slice(0, Math.min(5, steps.length))
    .map((s, i) => `${cc}  Step ${i + 1}: ${(s.explanation || '').slice(0, 72)}`)
    .join('\n');
  const more = steps.length > 5 ? `\n${cc}  … and ${steps.length - 5} more steps` : '';

  return [
    divider,
    `${cc}  🧪 NitinTrace — AI Execution Trace`,
    `${cc}`,
    `${cc}  Language : ${language}`,
    `${cc}  Steps    : ${steps.length}`,
    `${cc}  Saved    : ${dateStr}`,
    `${cc}  Tool     : NitinTrace (AI-Powered Code Visualizer)`,
    divider,
    `${cc}`,
    `${cc}  EXECUTION SUMMARY:`,
    preview + more,
    `${cc}`,
    divider,
    '',
    '',
  ].join('\n');
}

/**
 * Verify a GitHub PAT and return the authenticated user object.
 * Throws if the token is invalid.
 */
export async function verifyGitHubToken(token) {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Token verification failed (${res.status}).`);
  }

  return res.json(); // { login, name, avatar_url, html_url, … }
}

/**
 * Ensure the repository exists for the user.
 * Creates it if it doesn't exist yet.
 */
async function ensureRepo(token, username, repoName) {
  const check = await fetch(`${GITHUB_API}/repos/${username}/${repoName}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (check.ok) return check.json();

  // Repo doesn't exist — create it
  const create = await fetch(`${GITHUB_API}/user/repos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      name: repoName,
      description:
        '🧪 My NitinTrace execution traces — AI-powered step-by-step code visualization',
      private: false,
      auto_init: true,
    }),
  });

  if (!create.ok) {
    const body = await create.json().catch(() => ({}));
    throw new Error(
      body.message ||
        'Could not create repository. Make sure your token has the "public_repo" scope.'
    );
  }

  // Brief delay to let GitHub initialize the new repo
  await new Promise(r => setTimeout(r, 1500));
  return create.json();
}

/**
 * Push a code trace file to the user's repository.
 *
 * @param {string} token          - GitHub PAT
 * @param {string} username       - GitHub login
 * @param {string} code           - Source code being traced
 * @param {string} language       - Language identifier
 * @param {Array}  steps          - Execution trace steps
 * @param {string} repoName       - Repository name
 * @param {string} customFilename - Custom filename (optional)
 * @returns {{ url: string, filename: string }}
 */
export async function pushCodeTrace(token, username, code, language, steps, repoName = REPO_NAME, customFilename = '') {
  await ensureRepo(token, username, repoName);

  const ext  = EXTENSIONS[language] || 'txt';
  const now  = new Date();
  const ymd  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const hms  = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

  // Use customFilename if provided, else default to timestamp
  let filename = customFilename.trim();
  if (!filename) {
    filename = `${ymd}_${hms}`;
  }

  // Strip extension if entered manually
  if (filename.endsWith(`.${ext}`)) {
    filename = filename.slice(0, -(ext.length + 1));
  }

  // Sanitize filename
  // eslint-disable-next-line no-useless-escape
  filename = filename.replace(/[^a-zA-Z0-9_\-]/g, '_');

  const filepath = `traces/${language}/${filename}.${ext}`;
  const header      = buildFileHeader(language, steps, now);
  const fileContent = header + code;

  // UTF-8 → Base64
  let encoded;
  try {
    encoded = btoa(unescape(encodeURIComponent(fileContent)));
  } catch {
    encoded = btoa(fileContent);
  }

  const commitMessage = `✨ NitinTrace: ${language} (${steps.length} steps) — ${ymd}`;

  const res = await fetch(
    `${GITHUB_API}/repos/${username}/${repoName}/contents/${filepath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ message: commitMessage, content: encoded }),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `GitHub push failed (${res.status}).`);
  }

  await res.json();
  return {
    url: `https://github.com/${username}/${repoName}/blob/main/${filepath}`,
    repoUrl: `https://github.com/${username}/${repoName}`,
    filename: filepath,
  };
}

/* ── Secure session helpers (sessionStorage for PAT) ─────── */

export function getGitHubUser() {
  try {
    const raw = sessionStorage.getItem('nitintrace_github_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getGitHubToken() {
  return sessionStorage.getItem('nitintrace_github_token') || '';
}

export function saveGitHubSession(token, user) {
  sessionStorage.setItem('nitintrace_github_token', token);
  sessionStorage.setItem('nitintrace_github_user', JSON.stringify(user));
}

export function clearGitHubSession() {
  sessionStorage.removeItem('nitintrace_github_token');
  sessionStorage.removeItem('nitintrace_github_user');
}
