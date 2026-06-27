"""
Binary Tree Traversal - Python

Inorder, preorder, and postorder traversal.
Time Complexity: O(n)
Space Complexity: O(h) where h is tree height
"""

class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def inorder(node):
    if node:
        inorder(node.left)
        print(node.val, end=" ")
        inorder(node.right)

def preorder(node):
    if node:
        print(node.val, end=" ")
        preorder(node.left)
        preorder(node.right)

def postorder(node):
    if node:
        postorder(node.left)
        postorder(node.right)
        print(node.val, end=" ")

# Build tree:      1
#                /   \
#               2     3
#              / \
#             4   5
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)

print("Inorder:  ", end=""); inorder(root)
print("\nPreorder: ", end=""); preorder(root)
print("\nPostorder:", end=""); postorder(root)
