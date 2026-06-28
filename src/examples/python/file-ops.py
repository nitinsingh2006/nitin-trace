/**
 * File Operations - Python (simulated)
 *
 * Demonstrates file I/O concepts in Python.
 * Uses StringIO to simulate file operations without real file system access.
 */
export default {
  id: 'file-ops-python',
  language: 'python',
  title: 'File Operations — Python',
  description: 'Python file I/O with reading, writing, and line processing',
  difficulty: 'beginner',
  category: 'basics',
  tags: ['python', 'files', 'I/O', 'strings'],
  code: `# Simulated file operations using string manipulation
# (Demonstrates concepts without real filesystem access)

from io import StringIO

# Simulate writing to a file
content = """Alice,25,Engineer
Bob,30,Designer
Carol,22,Student
David,35,Manager"""

# Simulate reading the "file"
file_like = StringIO(content)
lines = file_like.readlines()

print(f"Total records: {len(lines)}")
print()

# Parse CSV-like content
people = []
for line in lines:
    name, age, role = line.strip().split(',')
    people.append({
        'name': name,
        'age': int(age),
        'role': role
    })
    print(f"Parsed: {name} | Age: {age} | Role: {role}")

print()

# Data processing
engineers = [p for p in people if p['role'] == 'Engineer']
avg_age = sum(p['age'] for p in people) / len(people)

print(f"Average age: {avg_age:.1f}")
print(f"Engineers: {[p['name'] for p in engineers]}")

# Sort by age
sorted_people = sorted(people, key=lambda p: p['age'])
print("Sorted by age:", [p['name'] for p in sorted_people])`,
};
