/**
 * Array Manipulation - JavaScript
 *
 * Common array operations: map, filter, reduce, sort, and more.
 * Great for understanding functional programming patterns.
 */
export default {
  id: 'array-manip-js',
  language: 'javascript',
  title: 'Array Manipulation',
  description: 'map, filter, reduce, and common array operations',
  difficulty: 'beginner',
  category: 'basics',
  tags: ['arrays', 'functional', 'map', 'filter', 'reduce'],
  code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log("Original:", numbers);

// Map: transform each element
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// Filter: keep elements matching a condition
const evens = numbers.filter(n => n % 2 === 0);
console.log("Evens:", evens);

// Reduce: accumulate into a single value
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum:", sum);

// Chaining operations
const result = numbers
  .filter(n => n % 2 !== 0)   // odd numbers: [1,3,5,7,9]
  .map(n => n ** 2)            // square them: [1,9,25,49,81]
  .reduce((acc, n) => acc + n, 0); // sum: 165

console.log("Sum of squares of odds:", result);

// Find and includes
const found = numbers.find(n => n > 7);
console.log("First > 7:", found);
console.log("Has 5?", numbers.includes(5));`,
};
