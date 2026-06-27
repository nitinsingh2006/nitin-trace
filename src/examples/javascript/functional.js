/**
 * Functional Programming - JavaScript
 *
 * Pure functions, immutability, composition, and currying.
 * Demonstrates the functional programming paradigm.
 */
export default {
  id: 'functional-js',
  language: 'javascript',
  title: 'Functional Programming',
  description: 'Pure functions, composition, currying, and immutability',
  difficulty: 'advanced',
  category: 'basics',
  tags: ['functional', 'pure-functions', 'composition', 'currying'],
  code: `// Pure function: same input → same output, no side effects
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

console.log("add(3, 4) =", add(3, 4));

// Currying: transform multi-arg fn into chain of single-arg fns
const curry = fn => a => b => fn(a, b);
const curriedAdd = curry(add);
const add10 = curriedAdd(10);

console.log("add10(5) =", add10(5));   // 15
console.log("add10(20) =", add10(20)); // 30

// Function composition: f(g(x))
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

const double = x => x * 2;
const square = x => x * x;
const addOne = x => x + 1;

const transform = compose(double, square, addOne); // double(square(addOne(x)))
console.log("transform(3):", transform(3)); // double(square(4)) = double(16) = 32

// Immutability: never mutate, return new values
const original = [1, 2, 3, 4, 5];
const withSix = [...original, 6];
const withoutFirst = original.slice(1);

console.log("Original:", original);
console.log("With 6:", withSix);
console.log("Without first:", withoutFirst);`,
};
