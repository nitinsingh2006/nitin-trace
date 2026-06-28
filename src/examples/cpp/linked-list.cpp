export default {
  id: 'linked-list-cpp',
  language: 'cpp',
  title: 'Singly Linked List (C++)',
  description: 'Linked list with insert, display, and search operations',
  difficulty: 'intermediate',
  category: 'dataStructures',
  tags: ['data-structure', 'linked-list', 'pointers'],
  code: `#include <iostream>
using namespace std;

struct Node {
  int data;
  Node* next;
  Node(int val) : data(val), next(nullptr) {}
};

class LinkedList {
  Node* head;
public:
  LinkedList() : head(nullptr) {}

  void insert(int val) {
    Node* newNode = new Node(val);
    newNode->next = head;
    head = newNode;
  }

  void display() {
    for (Node* cur = head; cur; cur = cur->next)
      cout << cur->data << " -> ";
    cout << "null" << endl;
  }

  bool search(int val) {
    for (Node* cur = head; cur; cur = cur->next)
      if (cur->data == val) return true;
    return false;
  }
};

int main() {
  LinkedList list;
  list.insert(10);
  list.insert(20);
  list.insert(30);
  list.display();
  cout << "Search 20: " << (list.search(20) ? "found" : "not found") << endl;
  return 0;
}`
};
