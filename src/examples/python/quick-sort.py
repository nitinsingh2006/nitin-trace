"""
Quick Sort - Python

Divide-and-conquer sorting using a pivot.
Time Complexity: O(n log n) average, O(n^2) worst
Space Complexity: O(log n)
"""

def quick_sort(arr):
    if len(arr) <= 1:
        return arr

    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    return quick_sort(left) + middle + quick_sort(right)

# Test
numbers = [64, 34, 25, 12, 22, 11, 90]
print(f"Original: {numbers}")
sorted_nums = quick_sort(numbers)
print(f"Sorted:   {sorted_nums}")
