<div align="center">

# 🔮 NitinTrace

### AI-Powered Code Execution Visualizer

**Paste any code. Watch it come alive.**

[![Tests](https://img.shields.io/badge/Tests-209%20passing-00f0ff?style=flat-square&logo=vitest)](https://github.com/nitinsingh2006/nitin-trace)
[![License](https://img.shields.io/badge/License-MIT-a855f7?style=flat-square)](LICENSE)
[![Languages](https://img.shields.io/badge/Languages-17-00f0ff?style=flat-square)](https://n-trace.vercel.app)
[![Live Demo](https://img.shields.io/badge/Live_Demo-n--trace.vercel.app-00f0ff?style=flat-square)](https://n-trace.vercel.app)

</div>

---

## ✨ What is NitinTrace?

NitinTrace is an **AI-powered code execution visualizer** — paste any code, pick a language, and watch the AI trace every variable, call stack, and output **step-by-step**, with no runtime needed.

No Python? No problem. No JVM? No problem. The AI understands your code semantically and simulates execution — variable states, console output, and plain-English explanations — all visualized in a beautiful, interactive UI.

> **Live at:** [n-trace.vercel.app](https://n-trace.vercel.app)

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🤖 **4 AI Providers** | Gemini, Groq, OpenAI GPT-4o, Claude — bring your own key |
| 🌍 **17 Languages** | JS, Python, Java, C++, C, C#, Go, Rust, Kotlin, Swift, TypeScript, Ruby, PHP, Dart, Scala, R, Bash |
| 🎬 **Step-by-Step Playback** | Play/pause/step with adjustable speed (0.25×–4×) |
| 📊 **Variable State Table** | Live tracking with `NEW` and `CHANGED` badges on each step |
| 📚 **Call Stack Visualizer** | See function calls push and pop in real-time |
| 🖥️ **Console Output Panel** | Simulated stdout/stderr output per step |
| 📝 **Trace History** | Persistent history via IndexedDB — search, filter, restore |
| 🐙 **GitHub Integration** | Push traces directly to your repos with one click |
| 📤 **Export** | Markdown report, JSON data, clipboard copy |
| 🔗 **Share via URL** | Compressed shareable links for your code |
| 📱 **Responsive** | Mobile-first design — works on phone, tablet, desktop |
| 🔌 **PWA** | Install as a desktop/mobile app, works offline |
| ⌨️ **Keyboard Shortcuts** | Space, arrows, Ctrl+Enter, Home/End |
| 🎨 **Onboarding Tour** | 5-step interactive tooltip guide for new users |

---

## 🎯 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- An API key from any of: [Gemini](https://aistudio.google.com), [Groq](https://console.groq.com), [OpenAI](https://platform.openai.com), or [Anthropic](https://console.anthropic.com)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/nitinsingh2006/nitin-trace.git
cd nitin-trace

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5174` and add your AI API key in **Settings → API Key**.

### Environment Variables (Optional)

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Bundler** | Vite 8 |
| **Language** | Vanilla JavaScript (ES Modules) |
| **Code Editor** | Monaco Editor 0.45 |
| **AI Providers** | Gemini, Groq, OpenAI, Claude |
| **Styling** | Vanilla CSS (glassmorphism, CSS custom properties) |
| **State Management** | Custom pub/sub reactive store |
| **Storage** | IndexedDB (history) + localStorage (settings) |
| **Testing** | Vitest (unit/integration) + Playwright (E2E) |
| **CI/CD** | GitHub Actions → Vercel |
| **PWA** | Service Worker + Web App Manifest |

---

## 🗂️ Project Structure

```
nitintrace/
├── src/
│   ├── main.js               # Entry point (~60 lines)
│   ├── app.js                # App shell orchestrator
│   ├── core/
│   │   ├── state.js          # Reactive pub/sub state store
│   │   ├── events.js         # Event bus (decoupled components)
│   │   └── config.js         # Runtime configuration
│   ├── components/           # 14 self-contained UI components
│   │   ├── editor-panel.js
│   │   ├── visualizer-panel.js
│   │   ├── playback-bar.js
│   │   ├── header.js
│   │   ├── footer.js
│   │   ├── settings-modal.js
│   │   ├── github-modal.js
│   │   ├── history-drawer.js
│   │   ├── onboarding.js
│   │   └── ...
│   ├── services/
│   │   ├── ai/               # AI adapters (Gemini, Groq, OpenAI, Claude)
│   │   ├── editor.js
│   │   ├── github.js
│   │   ├── history.js
│   │   ├── trace.js
│   │   ├── export-service.js
│   │   └── theme-service.js
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── constants.js      # 17 languages + sample code
│   │   ├── sanitize.js       # XSS prevention
│   │   └── share.js          # URL compression for sharing
│   ├── styles/               # Modular CSS (14 files)
│   │   ├── variables.css     # Design tokens
│   │   ├── responsive.css    # Mobile/tablet/desktop breakpoints
│   │   └── ...
│   ├── pages/landing/        # Marketing landing page
│   ├── examples/             # Curated code examples (17 languages)
│   └── __tests__/            # 209 tests (unit + integration + E2E)
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── service-worker.js     # Offline support
│   └── favicon.svg
├── .github/workflows/
│   ├── ci.yml                # CI: lint → test → build
│   └── release.yml           # Release: tag → GitHub Release
└── vercel.json               # Security headers + deployment config
```

---

## 🧪 Testing

```bash
# Run unit + integration tests (209 tests)
npm test

# Run with coverage report
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e

# Lint check
npm run lint

# Format check
npm run format:check
```

**Coverage targets:** `core/`, `services/`, `utils/` — 80%+ coverage.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (localhost:5174) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run Vitest unit + integration tests |
| `npm run test:coverage` | Tests with V8 coverage report |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Prettier format all source files |

---

## 🔒 Security & Privacy

- **API keys** are stored in `sessionStorage` only — cleared when the tab closes
- **Zero backend** — all requests go directly to AI APIs (Gemini, Groq, OpenAI, Anthropic) and GitHub
- **XSS prevention** — all AI output is sanitized before DOM insertion
- **Content Security Policy** — enforced via `vercel.json` headers
- **GitHub PAT** — only `public_repo` scope required; validated client-side
- **Subresource Integrity** — SRI hash on Monaco CDN script

---

## 🌐 Supported Languages

JavaScript • TypeScript • Python • Java • C++ • C • C# • Go • Rust • Kotlin • Swift • Ruby • PHP • Dart • Scala • R • Bash

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, coding standards, and the PR process.

Key guidelines:
- All PRs require passing CI (lint + tests + build)
- Follow existing code style (Prettier + ESLint configured)
- Add tests for new features/bug fixes
- Run `npm test` before submitting

---

## 📝 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**Built by [Nitin Singh](https://github.com/nitinsingh2006) · [Live Demo](https://n-trace.vercel.app) · [Report a Bug](https://github.com/nitinsingh2006/nitin-trace/issues)**

</div>
