# Contributing to N-Trace

First off, thank you for considering contributing to N-Trace! It's people like you that make N-Trace such a great tool.

## 🌟 Ways to Contribute

- 🐛 **Report bugs** — Found a bug? Open an issue
- 💡 **Suggest features** — Have an idea? We'd love to hear it
- 📝 **Improve documentation** — Help others understand N-Trace better
- 🎨 **Submit code examples** — Add examples for different languages
- 🔧 **Fix issues** — Pick up a "good first issue" and submit a PR
- 🧪 **Write tests** — Help us improve code coverage
- 🌍 **Translate** — Help make N-Trace accessible to more people

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Git** for version control
- A **Claude API key** from [console.anthropic.com](https://console.anthropic.com/)

### Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/n-trace.git
   cd n-trace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Claude API key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Project Structure

```
n-trace/
├── src/
│   ├── core/              # Core infrastructure (state, events, config)
│   ├── components/        # UI components
│   ├── services/          # External integrations (AI, GitHub, etc.)
│   ├── utils/             # Utility functions
│   ├── styles/            # Modular CSS
│   ├── examples/          # Code examples library
│   ├── __tests__/         # Test files
│   ├── app.js             # App orchestrator
│   └── main.js            # Entry point
├── public/                # Static assets
├── docs/                  # Documentation
└── package.json
```

## 📝 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation changes
- `test/` — Test additions/changes
- `refactor/` — Code refactoring
- `style/` — Code style changes (formatting, etc.)

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Check code formatting
npm run format:check
```

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add call stack visualizer"
git commit -m "fix: resolve playback speed issue"
git commit -m "docs: update README with new features"
git commit -m "test: add unit tests for state management"
```

**Commit types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, semicolons, etc.)
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks
- `perf:` — Performance improvements

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

## 🎯 Pull Request Guidelines

### Before Submitting

- ✅ Code follows the project's style guidelines
- ✅ All tests pass (`npm test`)
- ✅ No linting errors (`npm run lint`)
- ✅ Code is properly formatted (`npm run format`)
- ✅ Documentation is updated (if applicable)
- ✅ Commit messages follow Conventional Commits
- ✅ PR description clearly explains the changes

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this? What scenarios did you cover?

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Commit messages follow conventions
```

## 🧪 Writing Tests

We use **Vitest** for unit/integration tests and **Playwright** for E2E tests.

### Unit Tests

```javascript
// src/__tests__/unit/helpers.test.js
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/helpers.js';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2026-06-26');
    expect(formatDate(date)).toBe('Jun 26, 2026');
  });
});
```

### E2E Tests

```javascript
// src/__tests__/e2e/trace.spec.js
import { test, expect } from '@playwright/test';

test('should trace code successfully', async ({ page }) => {
  await page.goto('/');
  await page.fill('.editor', 'console.log("Hello");');
  await page.click('button:has-text("Trace")');
  await expect(page.locator('.visualizer')).toBeVisible();
});
```

## 📚 Adding Code Examples

We're building a library of 50+ curated examples. To add an example:

1. **Create example file**
   ```javascript
   // src/examples/javascript/bubble-sort.js
   export default {
     id: 'bubble-sort',
     language: 'javascript',
     title: 'Bubble Sort',
     description: 'Classic sorting algorithm',
     difficulty: 'beginner',
     category: 'sorting',
     code: `function bubbleSort(arr) {
       // Your code here
     }`
   };
   ```

2. **Add to index**
   ```javascript
   // src/examples/index.js
   import bubbleSort from './javascript/bubble-sort.js';
   
   export const examples = [
     bubbleSort,
     // ... other examples
   ];
   ```

3. **Test the example**
   - Load it in N-Trace
   - Verify the trace works correctly
   - Check for clarity and educational value

## 🎨 Code Style

### JavaScript

- Use **ES6+ features** (const/let, arrow functions, destructuring)
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in multi-line objects/arrays

### CSS

- Use **CSS custom properties** for theming
- Follow **BEM naming** for classes (`.block__element--modifier`)
- Keep selectors **specific but not overly nested**
- Use **rem/em** for sizing (not px)

### Comments

```javascript
/**
 * Function description
 * @param {string} param - Parameter description
 * @returns {boolean} Return value description
 */
function myFunction(param) {
  // Implementation comment
  return true;
}
```

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** — Your bug might already be reported
2. **Try the latest version** — It might already be fixed
3. **Reproduce the bug** — Make sure it's consistent

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- N-Trace Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

## 💡 Suggesting Features

We love feature suggestions! Please include:

- **Use case** — Why is this feature needed?
- **Proposed solution** — How should it work?
- **Alternatives** — What other solutions did you consider?
- **Examples** — Show similar features in other tools

## 📜 Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 🏆 Recognition

Contributors are recognized in:
- **README.md** — Contributors section
- **GitHub** — Contributor graph
- **Release notes** — Credited for their contributions

## 📞 Getting Help

- **Discord** — Join our community server
- **GitHub Discussions** — Ask questions, share ideas
- **Issues** — Report bugs, request features

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to N-Trace! 🚀**