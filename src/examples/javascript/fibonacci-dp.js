export default {
  id: 'fibonacci-dp-js',
  language: 'javascript',
  title: 'Fibonacci Sequence (Dynamic Programming)',
  description: 'Fibonacci with memoization — O(n) time complexity',
  difficulty: 'intermediate',
  category: 'recursion',
  tags: ['algorithm', 'recursion', 'dynamic-programming', 'mathematics'],
  code: `function fibonacci(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 0) return 0;
  if (n === 1) return 1;

  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

// Generate first 15 Fibonacci numbers
console.log("First 15 Fibonacci numbers (DP):");
for (let i = 0; i < 15; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`
};
