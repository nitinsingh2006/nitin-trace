export default {
  id: 'factorial-cpp',
  language: 'cpp',
  title: 'Recursive Factorial (C++)',
  description: 'Compute factorial using recursion in C++',
  difficulty: 'beginner',
  category: 'recursion',
  tags: ['algorithm', 'recursion', 'mathematics'],
  code: `#include <iostream>
using namespace std;

long long factorial(int n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

int main() {
  cout << "Factorials 1 through 10:" << endl;
  for (int i = 1; i <= 10; i++) {
    cout << i << "! = " << factorial(i) << endl;
  }
  return 0;
}`
};
