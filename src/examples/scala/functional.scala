export default {
  id: 'functional-scala',
  language: 'scala',
  title: 'Scala Functional Programming',
  description: 'Higher-order functions, immutability, and pattern matching',
  difficulty: 'intermediate',
  category: 'basics',
  tags: ['functional', 'immutability', 'pattern-matching'],
  code: `object Main extends App {
  val numbers = List(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)

  // Map, filter, reduce
  val evens = numbers.filter(_ % 2 == 0)
  val doubled = evens.map(_ * 2)
  val sum = doubled.reduce(_ + _)

  println(s"Original: $numbers")
  println(s"Evens doubled: $doubled")
  println(s"Sum: $sum")

  // Pattern matching
  def describe(x: Any): String = x match {
    case i: Int if i < 0 => s"$i is negative"
    case i: Int if i > 0 => s"$i is positive"
    case 0 => "zero"
    case _ => "something else"
  }

  println(describe(42))
  println(describe(0))
  println(describe(-5))
}`
};
