/**
 * Hello World - Go
 *
 * Classic Go introduction with variables, loops, and functions.
 */
export default {
  id: 'hello-go',
  language: 'go',
  title: 'Hello World — Go',
  description: 'Go basics: variables, loops, and fmt.Println',
  difficulty: 'beginner',
  category: 'basics',
  tags: ['beginner', 'go', 'basics'],
  code: `package main

import "fmt"

func greet(name string) string {
    return "Hello, " + name + "!"
}

func sum(nums []int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

func main() {
    message := greet("Go World")
    fmt.Println(message)

    // Slices and range
    numbers := []int{1, 2, 3, 4, 5}
    fmt.Println("Numbers:", numbers)

    total := sum(numbers)
    fmt.Printf("Sum: %d\\n", total)

    // Maps
    langs := map[string]int{
        "Go":     2009,
        "Rust":   2010,
        "Python": 1991,
    }

    for lang, year := range langs {
        fmt.Printf("%s: created in %d\\n", lang, year)
    }
}`,
};
