/**
 * Vector Operations - Rust
 *
 * Common Rust Vec operations: push, pop, iter, map, filter.
 */
export default {
  id: 'vector-ops-rust',
  language: 'rust',
  title: 'Vector Operations — Rust',
  description: 'Rust Vec operations: push, map, filter, iter',
  difficulty: 'intermediate',
  category: 'basics',
  tags: ['rust', 'vectors', 'collections', 'iterators'],
  code: `fn main() {
    // Create and populate a Vec
    let mut numbers: Vec<i32> = Vec::new();
    for i in 1..=5 {
        numbers.push(i * 10);
    }
    println!("Original: {:?}", numbers);

    // Map: double each element
    let doubled: Vec<i32> = numbers.iter().map(|&x| x * 2).collect();
    println!("Doubled: {:?}", doubled);

    // Filter: keep only values > 30
    let filtered: Vec<i32> = numbers.iter()
        .filter(|&&x| x > 30)
        .copied()
        .collect();
    println!("Filtered (>30): {:?}", filtered);

    // Fold (reduce): sum
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);

    // Max and min
    let max = numbers.iter().max().unwrap();
    let min = numbers.iter().min().unwrap();
    println!("Max: {}, Min: {}", max, min);

    // Sort descending
    let mut desc = numbers.clone();
    desc.sort_by(|a, b| b.cmp(a));
    println!("Sorted descending: {:?}", desc);
}`,
};
