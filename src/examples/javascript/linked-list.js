/**
 * Linked List - JavaScript
 *
 * Singly linked list with insert, delete, and traversal.
 *
 * Time Complexity: O(n) traversal, O(1) insert at head
 * Space Complexity: O(n)
 */
export default {
  id: 'linked-list-js',
  language: 'javascript',
  title: 'Linked List',
  description: 'Singly linked list with insert, search, and traversal',
  difficulty: 'intermediate',
  category: 'dataStructures',
  tags: ['data-structures', 'linked-list', 'OOP'],
  code: `class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // Insert at the end
  append(value) {
    const node = new Node(value);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    this.size++;
  }

  // Convert to array for display
  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

const list = new LinkedList();
list.append(10);
list.append(20);
list.append(30);
list.append(40);

console.log("List:", list.toArray());
console.log("Size:", list.size);`,
};
