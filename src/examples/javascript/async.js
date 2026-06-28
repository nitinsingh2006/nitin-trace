/**
 * Async / Await - JavaScript
 *
 * Demonstrates async/await with simulated API calls and error handling.
 *
 * Shows how asynchronous code executes step-by-step.
 */
export default {
  id: 'async-js',
  language: 'javascript',
  title: 'Async / Await',
  description: 'Async/await with simulated fetch and error handling',
  difficulty: 'intermediate',
  category: 'async',
  tags: ['async', 'await', 'promises', 'error-handling'],
  code: `// Simulated async fetch (no real network needed)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchUser(id) {
  await delay(100); // simulate network latency
  if (id <= 0) throw new Error("Invalid user ID");
  return { id, name: "Alice", role: "developer" };
}

async function fetchPosts(userId) {
  await delay(80);
  return [
    { id: 1, title: "Hello World", userId },
    { id: 2, title: "Async is cool", userId },
  ];
}

async function loadDashboard(userId) {
  console.log("Loading dashboard for user", userId);
  
  const user = await fetchUser(userId);
  console.log("User loaded:", user.name);
  
  const posts = await fetchPosts(user.id);
  console.log("Posts loaded:", posts.length);
  
  return { user, posts };
}

loadDashboard(42)
  .then(data => console.log("Dashboard ready:", data.user.name))
  .catch(err => console.error("Error:", err.message));`,
};
