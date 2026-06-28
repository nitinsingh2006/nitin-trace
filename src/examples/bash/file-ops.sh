export default {
  id: 'file-ops-bash',
  language: 'bash',
  title: 'Bash File Operations',
  description: 'File read, write, and directory traversal in Bash',
  difficulty: 'beginner',
  category: 'basics',
  tags: ['bash', 'file-operations', 'scripting'],
  code: `#!/bin/bash
# File operations demo

# Create temp directory
mkdir -p /tmp/bash-demo

# Write files
for name in Alice Bob Charlie; do
  echo "Hello, $name!" > "/tmp/bash-demo/$name.txt"
done

# Read and concatenate
echo "=== Greetings ==="
for file in /tmp/bash-demo/*.txt; do
  echo "File: $(basename "$file")"
  cat "$file"
done

# Count lines
total=$(wc -l < /tmp/bash-demo/*.txt 2>/dev/null)
echo "Total lines: $total"

# Cleanup
rm -rf /tmp/bash-demo
echo "Cleaned up."`,
}
