export default {
  id: 'closure-counter-js',
  language: 'javascript',
  title: 'Closure Counter Factory',
  description: 'Function factory using closures to create counters',
  difficulty: 'beginner',
  category: 'closures',
  tags: ['closure', 'scope', 'function-factory'],
  code: `function createCounter(initial = 0) {
  let count = initial;

  return {
    increment: () => ++count,
    decrement: () => --count,
    reset: () => { count = initial; return count; },
    getValue: () => count
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.decrement()); // 11
console.log(counter.reset());     // 10
console.log(counter.getValue());  // 10`
};
