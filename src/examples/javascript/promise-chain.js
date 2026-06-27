export default {
  id: 'promise-chain-js',
  language: 'javascript',
  title: 'Promise Chain',
  description: 'Async operations using .then() and .catch()',
  difficulty: 'intermediate',
  category: 'async',
  tags: ['async', 'promises', 'control-flow'],
  code: `function asyncTask(value, delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(\`Processed: \${value}\`);
      resolve(value * 2);
    }, delay);
  });
}

asyncTask(1, 300)
  .then(result => asyncTask(result, 200))
  .then(result => asyncTask(result, 100))
  .then(result => {
    console.log(\`Final result: \${result}\`);
  })
  .catch(err => {
    console.error("Error:", err);
  });`
};
