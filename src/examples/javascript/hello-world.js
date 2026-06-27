/**
 * Hello World - JavaScript
 *
 * Classic Hello World with variable declarations and string operations.
 * Perfect for beginners to see their first trace.
 */
export default {
  id: 'hello-world-js',
  language: 'javascript',
  title: 'Hello, World!',
  description: 'The classic beginner example — trace a Hello World program',
  difficulty: 'beginner',
  category: 'basics',
  tags: ['beginner', 'basics', 'hello-world'],
  code: `// Classic Hello World
const greeting = "Hello";
const name = "World";
const message = greeting + ", " + name + "!";

console.log(message);

// String methods
const upper = message.toUpperCase();
const length = message.length;

console.log("Uppercase:", upper);
console.log("Length:", length, "characters");

// Template literals
const year = 2026;
console.log(\`Welcome to NitinTrace in \${year}!\`);`,
};
