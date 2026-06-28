/**
 * Bubble Sort - JavaScript
 *
 * Classic sorting algorithm that repeatedly steps through the list,
 * compares adjacent elements and swaps them if they're in wrong order.
 *
 * Time Complexity: O(n²)
 * Space Complexity: O(1)
 */

export default {
  id: 'bubble-sort-js',
  language: 'javascript',
  title: 'Bubble Sort',
  description: 'Classic sorting algorithm with step-by-step visualization',
  difficulty: 'beginner',
  category: 'sorting',
  tags: ['algorithm', 'sorting', 'arrays'],
  code: `function bubbleSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  
  return arr;
}

// Test the function
const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log("Original array:", numbers);
const sorted = bubbleSort(numbers);
console.log("Sorted array:", sorted);`
};
