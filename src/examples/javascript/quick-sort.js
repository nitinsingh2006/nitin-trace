/**
 * Quick Sort - JavaScript
 *
 * Efficient divide-and-conquer sorting algorithm.
 * Picks a pivot and partitions array around it.
 *
 * Time Complexity: O(n log n) average, O(n²) worst
 * Space Complexity: O(log n)
 */

export default {
  id: 'quick-sort-js',
  language: 'javascript',
  title: 'Quick Sort',
  description: 'Efficient divide-and-conquer sorting algorithm',
  difficulty: 'intermediate',
  category: 'sorting',
  tags: ['algorithm', 'sorting', 'divide-conquer', 'recursion'],
  code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    // Partition the array
    const pivotIndex = partition(arr, low, high);
    
    // Recursively sort left and right subarrays
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      // Swap arr[i] and arr[j]
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  // Swap arr[i+1] and arr[high] (pivot)
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

// Test the function
const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log("Original:", numbers);
const sorted = quickSort([...numbers]);
console.log("Sorted:", sorted);`
};
