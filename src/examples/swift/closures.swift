export default {
  id: 'closures-swift',
  language: 'swift',
  title: 'Swift Closures',
  description: 'Closure expressions, capturing values, and higher-order functions',
  difficulty: 'intermediate',
  category: 'closures',
  tags: ['closures', 'functional', 'higher-order'],
  code: `let numbers = [3, 1, 4, 1, 5, 9, 2, 6]

// Closure as variable
let square: (Int) -> Int = { $0 * $0 }

// Map with closure
let squared = numbers.map(square)
print("Squared: \\(squared)")

// Filter with trailing closure
let evens = numbers.filter { $0.isMultiple(of: 2) }
print("Evens: \\(evens)")

// Reduce
let sum = numbers.reduce(0, +)
print("Sum: \\(sum)")

// Capturing values
func makeMultiplier(_ factor: Int) -> (Int) -> Int {
  return { $0 * factor }
}
let double = makeMultiplier(2)
print("Double 5: \\(double(5))")`
};
