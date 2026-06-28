export default {
  id: 'async-dart',
  language: 'dart',
  title: 'Dart Async/Await',
  description: 'Async operations with Future, async/await in Dart',
  difficulty: 'intermediate',
  category: 'async',
  tags: ['async', 'futures', 'dart'],
  code: `Future<int> fetchData(int id) async {
  await Future.delayed(Duration(milliseconds: 300));
  return id * 10;
}

Future<void> main() async {
  print("Fetching data...");

  List<int> results = await Future.wait([
    fetchData(1),
    fetchData(2),
    fetchData(3),
  ]);

  for (final r in results) {
    print("Result: \$r");
  }

  print("All done!");
}`
};
