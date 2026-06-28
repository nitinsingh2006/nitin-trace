/**
 * Data Classes / Records - JavaScript
 *
 * Working with structured data objects, object methods, and immutable patterns.
 */
export default {
  id: 'data-classes-js',
  language: 'javascript',
  title: 'Data Classes & Objects',
  description: 'Structured data objects, factory functions, and immutability',
  difficulty: 'beginner',
  category: 'oop',
  tags: ['objects', 'data', 'patterns', 'OOP'],
  code: `// Factory function for creating structured data objects
function createProduct(id, name, price, category) {
  return Object.freeze({ id, name, price, category });
}

// Create some products
const laptop = createProduct(1, "MacBook Pro", 1999.99, "electronics");
const book = createProduct(2, "Clean Code", 35.99, "books");
const coffee = createProduct(3, "Ethiopia Blend", 18.50, "food");

const inventory = [laptop, book, coffee];

// Computed properties
const total = inventory.reduce((sum, p) => sum + p.price, 0);
const byCategory = inventory.reduce((acc, p) => {
  acc[p.category] = acc[p.category] || [];
  acc[p.category].push(p.name);
  return acc;
}, {});

console.log("Total value: $" + total.toFixed(2));
console.log("Categories:", byCategory);

// Updating immutable objects (spread operator)
const discounted = { ...laptop, price: laptop.price * 0.9 };
console.log("Original price: $" + laptop.price);
console.log("Discounted: $" + discounted.price.toFixed(2));`,
};
