export default {
  id: 'hello-go',
  language: 'go',
  title: 'Hello Go (Goroutines)',
  description: 'Go hello world demonstrating goroutines and channels',
  difficulty: 'intermediate',
  category: 'async',
  tags: ['concurrency', 'goroutines', 'channels'],
  code: `package main

import (
  "fmt"
  "time"
)

func greet(msg string, done chan bool) {
  for i := 0; i < 3; i++ {
    fmt.Println(msg, i)
    time.Sleep(100 * time.Millisecond)
  }
  done <- true
}

func main() {
  done := make(chan bool)
  go greet("Hello from goroutine", done)
  go greet("Concurrent execution", done)

  <-done
  <-done
  fmt.Println("All goroutines finished")
}`
};
