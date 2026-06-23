# 🔮 NitinTrace (formerly CodeTrace)

> **See your code think.** — Paste any code, watch it execute step-by-step with beautiful animations. No runtime, no setup, no compilation. Pure AI-powered execution simulation.

[![Status](https://img.shields.io/badge/Status-Phase%201%20%26%20GitHub%20Integration%20Complete%20%E2%9C%85-cyan)]()
[![License](https://img.shields.io/badge/License-MIT-purple)]()

---

## 🤯 What is NitinTrace?

NitinTrace is the **first AI-powered code execution visualizer** that works with **any programming language**. Instead of requiring language-specific runtimes and sandboxed environments, it uses state-of-the-art AI to **simulate** code execution and presents a stunning, animated trace of every step.

**The magic**: You don't need Python installed to trace Python code. You don't need a JVM for Java. You don't need Node for JavaScript. The AI understands the code semantically and produces an execution trace — variable states, console output, and plain-English explanations — all visualized in a beautiful, interactive UI.

---

## 🎓 Student-Friendly Features

Built specifically to make learning programming intuitive and engaging:

1. **⚡ Executing Line Preview**: Shows the exact code line executing at the current step (extracted live from Monaco Editor).
2. **🌈 Progress Bar**: A glowing progress bar that dynamically shifts color (Cyan → Purple → Pink) as the student steps through execution.
3. **🏷️ Variable Change Badges**:
   - `NEW` (Cyan): Appears when a variable is first declared in scope.
   - `CHANGED` (Purple): Appears when a variable's value updates from the previous step.

---

## 🌎 17 Supported Languages

NitinTrace supports 17 popular and system-level languages, complete with student-friendly starter template codes:

*   **Popular**: JavaScript, Python, Java, TypeScript
*   **Systems**: C, C++, C#, Rust
*   **Modern**: Go, Kotlin, Dart, Scala, Swift
*   **Scripting**: Ruby, PHP, Bash, R

---

## 🐙 GitHub Portfolio Integration

Students can connect their GitHub account using a **Personal Access Token (PAT)** to push their traced programs directly to GitHub:

*   **Auto Repository Creation**: NitinTrace automatically creates a public repository named `codetrace-traces` on the student's GitHub profile.
*   **Rich Documentation Header**: Every pushed trace includes a beautifully formatted comment block summarizing the execution:
    ```javascript
    // ══════════════════════════════════════════════════════
    //  🧪 NitinTrace — AI Execution Trace
    //
    //  Language : javascript
    //  Steps    : 14
    //  Saved    : 23 June 2026, 11:15 pm
    //  Tool     : NitinTrace (AI-Powered Code Visualizer)
    // ══════════════════════════════════════════════════════
    ```
*   **Live Sync Logs**: Pushing a trace prints a success card with a clickable direct link inside the terminal console emulator.

---

## 🛠️ Tech Stack

- **Bundler**: Vite (Fast dev server & bundling)
- **Language**: Vanilla JavaScript (ES modules)
- **Code Editor**: Monaco Editor
- **Styling**: Vanilla CSS (glassmorphism, neon design tokens)
- **AI Engines**: Google Gemini API & Groq API
- **Storage**: localStorage + IndexedDB (History logs)
- **Version Control**: Git

---

## ⚡ Quick Start

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Setup & Run
1.  **Clone the repo and navigate to it**:
    ```bash
    cd new_project
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the local development server**:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5174` (or the port shown in your terminal) in your browser.
5.  Configure your **Gemini** or **Groq** API Key inside the **Settings (⚙️)** modal to start tracing!

---

## 📁 Project Structure

```
new_project/
├── index.html           # Main UI entry point
├── package.json         # Project dependencies & scripts
├── src/
│   ├── main.js          # App entry point, DOM rendering & module wiring
│   ├── style.css        # Glassmorphism, animations, & global styles
│   ├── services/
│   │   ├── ai.js        # AI prompt construction & API calls
│   │   ├── editor.js    # Monaco Editor creation & highlight controllers
│   │   ├── github.js    # GitHub PAT auth, repository setup, & commit pushes
│   │   ├── history.js   # IndexedDB operations for local trace history
│   │   ├── trace.js     # Playback controls (play/pause/step)
│   │   └── visualizer.js# Handles DOM updates, badges, and progress bar
│   └── utils/
│       ├── constants.js # 17 languages, starter examples, & settings defaults
│       └── helpers.js   # Time formatting, HTML escaping
```

---

## 🔒 Security & Privacy
*   All keys (Gemini, Groq, GitHub PAT) are saved **locally** in the browser's `localStorage`.
*   Zero backend servers are used; all requests go directly to Google, Groq, and GitHub APIs.
*   Token scopes are validated to only require `public_repo` permissions.

---

## 📜 License
MIT — feel free to fork, customize, and build upon.
