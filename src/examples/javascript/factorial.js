/**
 * Factorial - JavaScript
 *
 * Calculate factorial using recursion.
 * n! = n × (n-1) × (n-2) × ... × 1
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n) - call stack
 */

export default {
  id: 'factorial-js',
  language: 'javascript',
  title: 'Factorial (Recursive)',
  description: 'Calculate factorial using recursion',
  difficulty: 'beginner',
  category: 'recursion',
  tags: ['algorithm', 'recursion', 'mathematics'],
  code: `function factorial(n) {
  // Base case
  if (n === 0 || n === 1) {
    return 1;
  }
  
  // Recursive case
  return n * factorial(n - 1);
}

// Test the function
console.log("Factorial of 5:", factorial(5));
console.log("Factorial of 0:", factorial(0));
console.log("Factorial of 7:", factorial(7));

// Calculate factorials 1-10
for (let i = 1; i <= 10; i++) {
  console.log(\`\${i}! = \${factorial(i)}\`);
}`
};
