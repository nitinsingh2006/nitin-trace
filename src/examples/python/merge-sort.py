"""
Merge Sort - Python

Efficient divide-and-conquer sorting algorithm.
Divides array into halves, sorts them, and merges.

Time Complexity: O(n log n)
Space Complexity: O(n)
"""

def merge_sort(arr):
    """
    Sort array using merge sort algorithm.
    
    Args:
        arr: List of comparable elements
        
    Returns:
        Sorted list
    """
    if len(arr) <= 1:
        return arr
    
    # Divide
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # Conquer (merge)
    return merge(left, right)

def merge(left, right):
    """Merge two sorted arrays."""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Test the function
numbers = [64, 34, 25, 12, 22, 11, 90]
print(f"Original: {numbers}")
sorted_nums = merge_sort(numbers)
print(f"Sorted: {sorted_nums}")
