export default {
  id: 'data-classes-kotlin',
  language: 'kotlin',
  title: 'Kotlin Data Classes',
  description: 'Data classes with destructuring, copy, and component functions',
  difficulty: 'beginner',
  category: 'oop',
  tags: ['data-classes', 'kotlin', 'oop'],
  code: `data class Person(
  val name: String,
  val age: Int,
  val email: String = ""
)

fun main() {
  val alice = Person("Alice", 30, "alice@example.com")
  val bob = alice.copy(name = "Bob", email = "bob@example.com")

  // Destructuring
  val (name, age, email) = alice
  println("$name is $age years old")

  println("Alice: $alice")
  println("Bob:   $bob")
  println("Same? ${alice == bob}")
}`
};
