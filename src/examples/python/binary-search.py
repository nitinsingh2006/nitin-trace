"""
Binary Search - Python

Efficient search algorithm that finds the position of a target value
within a sorted array by repeatedly dividing the search interval in half.

Time Complexity: O(log n)
Space Complexity: O(1)
"""

def binary_search(arr, target):
    """
    Search for target in sorted array using binary search.
    
    Args:
        arr: Sorted list of integers
        target: Value to search for
        
    Returns:
        Index of target if found, -1 otherwise
    """
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Test the function
numbers = [2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 78]
target = 23

print(f"Array: {numbers}")
print(f"Searching for: {target}")

result = binary_search(numbers, target)

if result != -1:
    print(f"Found at index: {result}")
else:
    print("Not found")
