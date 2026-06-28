/**
 * N-Trace — Example Library Registry
 *
 * Curated code examples organized by category and language.
 * Each entry maps to a file in src/examples/<language>/<id>.<ext>
 */

// Category definitions with display metadata
export const CATEGORIES = {
  sorting: {
    label: 'Sorting Algorithms',
    icon: '↕️',
    description: 'Classic comparison-based sorting algorithms with step-by-step visualization',
  },
  searching: {
    label: 'Searching Algorithms',
    icon: '🔍',
    description: 'Efficient search algorithms and techniques',
  },
  recursion: {
    label: 'Recursion',
    icon: '🔄',
    description: 'Recursive problem-solving patterns and base cases',
  },
  dataStructures: {
    label: 'Data Structures',
    icon: '🏗️',
    description: 'Common data structures: lists, trees, stacks, queues',
  },
  async: {
    label: 'Async & Promises',
    icon: '⚡',
    description: 'Asynchronous programming, Promises, and async/await',
  },
  closures: {
    label: 'Closures & Scope',
    icon: '📦',
    description: 'Lexical scoping, closures, and variable hoisting',
  },
  oop: {
    label: 'OOP & Classes',
    icon: '🧩',
    description: 'Object-oriented patterns, inheritance, and encapsulation',
  },
  basics: {
    label: 'Basics',
    icon: '📖',
    description: 'Fundamentals: variables, loops, functions, and I/O',
  },
  functional: {
    label: 'Functional Programming',
    icon: '🧮',
    description: 'Pure functions, composition, immutability, and higher-order functions',
  },
};

// ─── Example Registry ─────────────────────────────────────────────────────
// Maps category → list of example IDs available in JavaScript
// Additional language-specific examples are discovered dynamically.

export const EXAMPLE_CATEGORIES = {
  sorting: [
    'bubble-sort',
    'quick-sort',
    'merge-sort',
  ],
  searching: [
    'binary-search',
  ],
  recursion: [
    'factorial',
    'fibonacci',
    'fibonacci-dp',
  ],
  dataStructures: [
    'linked-list',
    'binary-tree',
  ],
  async: [
    'promise-chain',
    'async',
  ],
  closures: [
    'closure-counter',
    'closures',
    'blocks',
  ],
  oop: [
    'prototype-inheritance',
    'data-classes',
  ],
  basics: [
    'hello-world',
    'array-manip',
    'functional',
  ],
};

// ─── Language-specific Examples ───────────────────────────────────────────

export const LANGUAGE_EXAMPLES = {
  javascript: [
    'bubble-sort', 'quick-sort', 'merge-sort',
    'binary-search',
    'factorial', 'fibonacci', 'fibonacci-dp',
    'linked-list', 'binary-tree',
    'promise-chain', 'async',
    'closure-counter', 'closures', 'blocks',
    'prototype-inheritance', 'data-classes',
    'hello-world', 'array-manip', 'functional',
  ],
  python: [
    'bubble-sort',    // python/bubble-sort.py (via constants sample)
    'binary-search',  // python/binary-search.py
    'binary-tree',    // python/binary-tree.py
    'merge-sort',     // python/merge-sort.py
    'quick-sort',     // python/quick-sort.py
    'file-ops',       // python/file-ops.py
  ],
  java: [
    'hello-world',    // java/HelloWorld.java
    'bubble-sort',    // java/BubbleSort.java
  ],
  cpp: [
    'factorial',      // cpp/factorial.cpp
    'linked-list',    // cpp/linked-list.cpp
  ],
  go: [
    'hello-go',       // go/hello-go.go
    'hello',          // go/hello.go
  ],
  rust: [
    'hello',          // rust/hello.rs
    'vector-ops',     // rust/vector-ops.rs
  ],
};

// ─── Difficulty Levels ────────────────────────────────────────────────────

export const DIFFICULTY_LEVELS = {
  beginner: { label: 'Beginner', color: '#00f0ff' },
  intermediate: { label: 'Intermediate', color: '#a855f7' },
  advanced: { label: 'Advanced', color: '#f59e0b' },
};

// ─── Flat List for Search ─────────────────────────────────────────────────

/**
 * Returns a flat list of all registered example IDs.
 * @returns {string[]}
 */
export function getAllExampleIds() {
  const ids = new Set();
  Object.values(EXAMPLE_CATEGORIES).forEach(list => list.forEach(id => ids.add(id)));
  return Array.from(ids);
}

/**
 * Returns example IDs for a given category.
 * @param {string} category
 * @returns {string[]}
 */
export function getExamplesByCategory(category) {
  return EXAMPLE_CATEGORIES[category] || [];
}

/**
 * Returns example IDs for a given language.
 * @param {string} language
 * @returns {string[]}
 */
export function getExamplesForLanguage(language) {
  return LANGUAGE_EXAMPLES[language] || [];
}
