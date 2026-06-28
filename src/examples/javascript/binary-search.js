/**
 * Binary Search - JavaScript
 *
 * Efficient search algorithm that works on sorted arrays.
 * Reduces search space by half at each step.
 *
 * Time Complexity: O(log n)
 * Space Complexity: O(1)
 */
export default {
  id: 'binary-search-js',
  language: 'javascript',
  title: 'Binary Search',
  description: 'Efficient O(log n) search on a sorted array',
  difficulty: 'beginner',
  category: 'searching',
  tags: ['algorithm', 'searching', 'arrays'],
  code: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midValue = arr[mid];

    console.log(\`Checking index \${mid} → \${midValue}\`);

    if (midValue === target) {
      return mid; // Found!
    } else if (midValue < target) {
      low = mid + 1;  // Search right half
    } else {
      high = mid - 1; // Search left half
    }
  }

  return -1; // Not found
}

const sortedArray = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const target = 23;

console.log("Array:", sortedArray);
console.log("Looking for:", target);

const index = binarySearch(sortedArray, target);
if (index !== -1) {
  console.log(\`Found \${target} at index \${index}\`);
} else {
  console.log(\`\${target} not found\`);
}`,
};
