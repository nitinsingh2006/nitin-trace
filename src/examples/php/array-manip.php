export default {
  id: 'array-manip-php',
  language: 'php',
  title: 'PHP Array Manipulation',
  description: 'Common array operations: map, filter, reduce in PHP',
  difficulty: 'beginner',
  category: 'basics',
  tags: ['arrays', 'functional', 'php'],
  code: `<?php
$numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];

$squared = array_map(fn($n) => $n * $n, $numbers);
$evens = array_filter($squared, fn($n) => $n % 2 === 0);
$total = array_reduce($evens, fn($carry, $n) => $carry + $n, 0);

echo "Original: " . implode(", ", $numbers) . "\\n";
echo "Squared:  " . implode(", ", $squared) . "\\n";
echo "Evens:    " . implode(", ", $evens) . "\\n";
echo "Sum evens: $total\\n";
?>`
};
