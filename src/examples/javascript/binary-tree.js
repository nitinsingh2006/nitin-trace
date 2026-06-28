/**
 * Binary Tree - JavaScript
 *
 * Binary Search Tree with insert and in-order traversal.
 *
 * Time Complexity: O(log n) average for insert/search
 * Space Complexity: O(n)
 */
export default {
  id: 'binary-tree-js',
  language: 'javascript',
  title: 'Binary Search Tree',
  description: 'BST with insert, search, and in-order traversal',
  difficulty: 'intermediate',
  category: 'dataStructures',
  tags: ['data-structures', 'tree', 'recursion', 'BST'],
  code: `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const node = new TreeNode(value);
    if (!this.root) {
      this.root = node;
      return;
    }
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) { current.left = node; break; }
        current = current.left;
      } else {
        if (!current.right) { current.right = node; break; }
        current = current.right;
      }
    }
  }

  // In-order: left → root → right (produces sorted output)
  inOrder(node = this.root, result = []) {
    if (!node) return result;
    this.inOrder(node.left, result);
    result.push(node.value);
    this.inOrder(node.right, result);
    return result;
  }
}

const tree = new BST();
[5, 3, 7, 1, 4, 6, 8].forEach(n => tree.insert(n));
console.log("In-order:", tree.inOrder());`,
};
