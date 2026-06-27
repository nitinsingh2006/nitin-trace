export default {
  id: 'hello-rust',
  language: 'rust',
  title: 'Hello Rust (Ownership Demo)',
  description: 'Rust hello world showcasing ownership and borrowing',
  difficulty: 'intermediate',
  category: 'basics',
  tags: ['ownership', 'borrowing', 'basics'],
  code: `fn main() {
  let s1 = String::from("hello");
  let len = calculate_length(&s1); // borrow
  println!("'{}' has length {}", s1, len);

  let s2 = take_and_return(s1);    // move
  // println!("{}", s1);           // would not compile
  println!("s2 = {}", s2);
}

fn calculate_length(s: &String) -> usize {
  s.len()
}

fn take_and_return(s: String) -> String {
  println!("Took ownership of: {}", s);
  s
}`
};
