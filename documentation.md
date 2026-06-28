# 📖 N-Trace — User Step-by-Step Guide

Welcome to **N-Trace**! This guide will walk you through setting up, writing code, visualizing step-by-step execution, and syncing your traces directly to your GitHub profile.

---

## 🚀 Step 1: Getting Started

### 1. Run the Application
Make sure you have Node.js installed, then execute these commands in your terminal:
```bash
# Navigate to the project directory
cd new_project

# Install dependencies
npm install

# Start the local development server
npm run dev
```
Open the local URL shown in your terminal (usually `http://localhost:5174` or `http://localhost:5173`) in your web browser.

### 2. Configure Your AI API Key
N-Trace simulates code execution using advanced AI models. You need to configure an API key first:
1. Click the **Settings (⚙️)** button in the top-right header.
2. Select your AI Provider: **Google Gemini** (Recommended, free tier available) or **Groq**.
3. Paste your API key into the input field.
   - *Get a free Gemini key here: [Google AI Studio](https://aistudio.google.com/apikey)*
   - *Get a Groq key here: [Groq Console](https://console.groq.com/keys)*
4. Click **Save Settings**.

---

## ✏️ Step 2: Running Your First Trace

1. **Select a Language**: Use the dropdown menu in the editor panel (e.g., JavaScript, Python, C, Rust) to choose your language.
2. **Load Example Code**: Click the **Examples (📚)** button in the header to load a starter template code snippet for your selected language.
3. **Write Custom Code**: You can modify the code directly inside the editor.
4. **Initiate the Simulation**: Click the **Trace Execution (▶)** button or press `Ctrl + Enter`. The AI will simulate the code flow line-by-line.

---

## 🎮 Step 3: Interactive Playback Controls

Once the execution trace loads, the **Playback Bar** at the bottom becomes active. Use these controls to inspect how the code runs:

*   **⏮ (Restart / Home)**: Jump back to the very first step of execution.
*   **⏪ (Step Back / Left Arrow)**: Go back exactly one line/step of execution.
*   **▶ / ⏸ (Play/Pause / Spacebar)**: Auto-play the execution step-by-step or pause it.
*   **⏩ (Step Forward / Right Arrow)**: Advance exactly one line/step.
*   **⏭ (Jump to End / End Key)**: Jump straight to the final output state.
*   **Speed Slider**: Drag to change the playback auto-step delay (ranges from `0.5x` slow-motion to `3x` fast-forward).

---

## 📊 Step 4: Variable Tracking & Badges

As you step through the trace, look at the **Variables** table in the center panel:
*   **Variable Scope**: The table displays all variables currently defined in the active scope.
*   **Label & Types**: Shows the variable name, data type (e.g. Number, String, Array), and current value.
*   **`NEW` Badge (Cyan)**: Appears when a variable is declared for the first time.
*   **`CHANGED` Badge (Purple)**: Highlights variables that just updated their value on the current executing line.

---

## ⚠️ Step 5: Handling Errors

N-Trace will detect and highlight mistakes in your code:
*   **Syntax Errors**: Typos, unclosed brackets, or invalid keywords will halt execution. The visualizer will show a single step pointing to the error line, explaining the syntax problem, and displaying `SyntaxError` in red text in the terminal console.
*   **Runtime Errors**: Division by zero, accessing undefined references, or out-of-bounds errors will trace successfully up to the failing line, output the stack trace/error message to the console, and stop.

---

## 🐙 Step 6: Saving Traces to GitHub

Build a portfolio of your learning by pushing execution traces directly to GitHub!

### 1. Connect GitHub Account
1. Click the **GitHub (🐙)** button in the header.
2. Paste a GitHub **Personal Access Token (PAT)**.    - *Generate a token here: [GitHub Settings](https://github.com/settings/tokens/new?scopes=public_repo&description=N-Trace+Traces). Make sure you select the `public_repo` scope.*
3. Click **Connect GitHub**. The header button will change to show your GitHub avatar and username.

### 2. Export a Trace
1. After running a trace, click the **Save to GitHub (📤)** button next to the step counter.
2. A configuration popup will appear:
    - **Repository Name**: Pre-filled with `n-trace-traces`. You can change this to any repository name you want (it will be created automatically if it doesn't exist).
   - **Filename**: Enter a custom filename. If left blank, it will auto-save with a timestamp.
3. Click **Push Trace**.
4. Once completed, a direct link to your code on GitHub will print inside the terminal console emulator!

---

## ⏳ Step 7: Local History

N-Trace stores your previous traces locally inside your browser using IndexedDB:
*   Click **History (⏳)** in the header to open your past runs drawer.
*   Search and filter traces by code contents or language.
*   Click any history item to immediately restore the code, language, and trace playback steps.
