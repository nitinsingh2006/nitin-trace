/**
 * Merge Sort - JavaScript
 *
 * Divide-and-conquer sorting algorithm.
 * Recursively splits the array in half, sorts each half, then merges.
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */
export default {
  id: 'merge-sort-js',
  language: 'javascript',
  title: 'Merge Sort',
  description: 'Divide-and-conquer sorting with recursive merging',
  difficulty: 'intermediate',
  category: 'sorting',
  tags: ['algorithm', 'sorting', 'recursion', 'divide-and-conquer'],
  code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

const nums = [38, 27, 43, 3, 9, 82, 10];
console.log("Original:", nums);
const sorted = mergeSort(nums);
console.log("Sorted:", sorted);`,
};
