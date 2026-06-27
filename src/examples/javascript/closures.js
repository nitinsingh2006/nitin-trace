/**
 * Closures - JavaScript
 *
 * Demonstrates closures, lexical scoping, and the module pattern.
 * Closures allow functions to retain access to their outer scope.
 */
export default {
  id: 'closures-js',
  language: 'javascript',
  title: 'Closures & Lexical Scope',
  description: 'Closures with function factories and private state',
  difficulty: 'intermediate',
  category: 'closures',
  tags: ['closures', 'scope', 'functional', 'patterns'],
  code: `// Closure: function retains access to outer scope
function makeAdder(x) {
  return function(y) {
    return x + y; // x is captured from outer scope
  };
}

const add5 = makeAdder(5);
const add10 = makeAdder(10);

console.log("add5(3)  =", add5(3));   // 8
console.log("add10(3) =", add10(3));  // 13

// Closure for private state (module pattern)
function createCounter(initial = 0) {
  let count = initial; // private to the closure

  return {
    increment() { count++; return count; },
    decrement() { count--; return count; },
    reset()     { count = initial; return count; },
    value()     { return count; },
  };
}

const counter = createCounter(10);
console.log("Start:", counter.value());    // 10
console.log("++:", counter.increment());   // 11
console.log("++:", counter.increment());   // 12
console.log("--:", counter.decrement());   // 11
console.log("Reset:", counter.reset());    // 10`,
};
