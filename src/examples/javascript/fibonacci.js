/**
 * Fibonacci Sequence - JavaScript
 *
 * Generates Fibonacci numbers using recursion.
 * Each number is the sum of the two preceding ones.
 *
 * Time Complexity: O(2^n) - exponential (inefficient)
 * Space Complexity: O(n) - call stack depth
 */

export default {
  id: 'fibonacci-js',
  language: 'javascript',
  title: 'Fibonacci Sequence (Recursive)',
  description: 'Classic recursive implementation of Fibonacci sequence',
  difficulty: 'beginner',
  category: 'recursion',
  tags: ['algorithm', 'recursion', 'mathematics'],
  code: `function fibonacci(n) {
  // Base cases
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  // Recursive case
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Generate first 10 Fibonacci numbers
console.log("First 10 Fibonacci numbers:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`
};
