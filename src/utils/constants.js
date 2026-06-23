/**
 * NitinTrace — Constants
 * Central config for the app
 */

export const APP_NAME = 'NitinTrace';
export const APP_VERSION = '0.1.0';

/**
 * Supported languages with their Monaco Editor language IDs
 * and sample code for each
 */
export const LANGUAGES = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    sample: `// Fibonacci sequence
function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    let temp = b;
    b = a + b;
    a = temp;
  }
  return b;
}

const result = fibonacci(6);
console.log("Fibonacci(6) =", result);`
  },
  python: {
    id: 'python',
    label: 'Python',
    sample: `# Bubble sort
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

numbers = [64, 34, 25, 12, 22]
sorted_nums = bubble_sort(numbers)
print("Sorted:", sorted_nums)`
  },
  java: {
    id: 'java',
    label: 'Java',
    sample: `// Binary search
public class Main {
    static int binarySearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = (low + high) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {2, 5, 8, 12, 16, 23, 38};
        int result = binarySearch(arr, 12);
        System.out.println("Found at index: " + result);
    }
}`
  },
  cpp: {
    id: 'cpp',
    label: 'C++',
    sample: `// Factorial with recursion
#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int num = 5;
    int result = factorial(num);
    cout << num << "! = " << result << endl;
    return 0;
}`
  },
  go: {
    id: 'go',
    label: 'Go',
    sample: `// Reverse a string
package main

import "fmt"

func reverse(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}

func main() {
    word := "CodeTrace"
    reversed := reverse(word)
    fmt.Println("Reversed:", reversed)
}`
  },
  rust: {
    id: 'rust',
    label: 'Rust',
    sample: `// FizzBuzz
fn main() {
    for i in 1..=15 {
        match (i % 3, i % 5) {
            (0, 0) => println!("FizzBuzz"),
            (0, _) => println!("Fizz"),
            (_, 0) => println!("Buzz"),
            _ => println!("{}", i),
        }
    }
}`
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    sample: `// Stack implementation
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }
}

const stack = new Stack<number>();
stack.push(10);
stack.push(20);
stack.push(30);
console.log("Top:", stack.peek());
console.log("Popped:", stack.pop());
console.log("Size:", stack.size);`
  },
  ruby: {
    id: 'ruby',
    label: 'Ruby',
    sample: `# Array manipulation
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
squared = numbers.map { |n| n ** 2 }
evens = squared.select { |n| n.even? }
total = evens.reduce(0, :+)
puts "Squared: #{squared}"
puts "Evens: #{evens}"
puts "Sum of evens: #{total}"`
  },
  php: {
    id: 'php',
    label: 'PHP',
    sample: `<?php
// Palindrome check
function isPalindrome(\$str) {
    \$clean = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', \$str));
    return \$clean === strrev(\$clean);
}

\$words = ["racecar", "hello", "madam", "world"];
foreach (\$words as \$word) {
    \$result = isPalindrome(\$word) ? "Yes" : "No";
    echo "\$word: \$result\\n";
}
?>`
  },
  swift: {
    id: 'swift',
    label: 'Swift',
    sample: `// Two sum
func twoSum(_ nums: [Int], _ target: Int) -> [Int] {
    var map: [Int: Int] = [:]
    for (i, num) in nums.enumerated() {
        let complement = target - num
        if let j = map[complement] {
            return [j, i]
        }
        map[num] = i
    }
    return []
}

let nums = [2, 7, 11, 15]
let target = 9
let result = twoSum(nums, target)
print("Indices:", result)`
  },
  c: {
    id: 'c',
    label: 'C',
    sample: `// Fibonacci sequence
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1, temp;
    for (int i = 2; i <= n; i++) {
        temp = a + b;
        a = b;
        b = temp;
        printf("Step %d: fib = %d\\n", i, b);
    }
    return b;
}

int main() {
    int n = 7;
    printf("Computing Fibonacci(%d)...\\n", n);
    int result = fibonacci(n);
    printf("Fibonacci(%d) = %d\\n", n, result);
    return 0;
}`
  },
  csharp: {
    id: 'csharp',
    label: 'C#',
    sample: `// Bubble Sort
using System;

class Program {
    static void BubbleSort(int[] arr) {
        int n = arr.Length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }

    static void Main() {
        int[] nums = { 5, 3, 8, 1, 9, 2 };
        Console.WriteLine("Before: " + string.Join(", ", nums));
        BubbleSort(nums);
        Console.WriteLine("After: " + string.Join(", ", nums));
    }
}`
  },
  kotlin: {
    id: 'kotlin',
    label: 'Kotlin',
    sample: `// Factorial step by step
fun factorial(n: Int): Long {
    var result = 1L
    for (i in 2..n) {
        result *= i
        println("Step $i → result = $result")
    }
    return result
}

fun main() {
    val n = 6
    println("Computing $n! ...")
    val result = factorial(n)
    println("Final: $n! = $result")
}`
  },
  dart: {
    id: 'dart',
    label: 'Dart',
    sample: `// Selection Sort
void main() {
  List<int> arr = [64, 25, 12, 22, 11];
  int n = arr.length;
  print('Original: \$arr');

  for (int i = 0; i < n - 1; i++) {
    int minIdx = i;
    for (int j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    int temp = arr[minIdx];
    arr[minIdx] = arr[i];
    arr[i] = temp;
    print('Pass \${i + 1}: \$arr');
  }

  print('Sorted: \$arr');
}`
  },
  r: {
    id: 'r',
    label: 'R',
    sample: `# Mean and Standard Deviation
values <- c(4, 7, 13, 16, 21, 24)

n <- length(values)
total <- sum(values)
mean_val <- total / n

cat("Values:", values, "\\n")
cat("Count:", n, "\\n")
cat("Sum:", total, "\\n")
cat("Mean:", mean_val, "\\n")

variance <- sum((values - mean_val)^2) / n
std_dev <- sqrt(variance)

cat("Variance:", round(variance, 2), "\\n")
cat("Std Dev:", round(std_dev, 2), "\\n")`
  },
  scala: {
    id: 'scala',
    label: 'Scala',
    sample: `// QuickSort (Functional)
object Main extends App {
  def quickSort(arr: List[Int]): List[Int] = arr match {
    case Nil => Nil
    case pivot :: rest =>
      val smaller = rest.filter(_ <= pivot)
      val bigger  = rest.filter(_ > pivot)
      quickSort(smaller) ::: List(pivot) ::: quickSort(bigger)
  }

  val numbers = List(3, 6, 8, 10, 1, 2, 1)
  println(s"Original: \$numbers")
  val sorted = quickSort(numbers)
  println(s"Sorted:   \$sorted")
}`
  },
  bash: {
    id: 'shell',
    label: 'Bash',
    sample: `#!/bin/bash
# FizzBuzz Classic
echo "=== FizzBuzz 1 to 20 ==="
for i in {1..20}; do
    if (( i % 15 == 0 )); then
        echo "$i → FizzBuzz"
    elif (( i % 3 == 0 )); then
        echo "$i → Fizz"
    elif (( i % 5 == 0 )); then
        echo "$i → Buzz"
    else
        echo "$i"
    fi
done
echo "=== Done ==="`,
  }
};

/**
 * Default settings
 */
export const DEFAULTS = {
  language: 'javascript',
  speed: 1,
  model: 'gemini-2.0-flash',
};

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  API_KEY: 'codetrace_api_key',
  MODEL: 'codetrace_model',
  LANGUAGE: 'codetrace_language',
  SPEED: 'codetrace_speed',
  HISTORY: 'codetrace_history',
};
