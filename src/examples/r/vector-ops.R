export default {
  id: 'vector-ops-r',
  language: 'r',
  title: 'R Vector Operations',
  description: 'Vectorized operations, filtering, and statistics in R',
  difficulty: 'beginner',
  category: 'basics',
  tags: ['vectors', 'statistics', 'r'],
  code: `# Vector operations in R
values <- c(12, 27, 35, 8, 42, 19, 55, 31)

cat("Original:", values, "\n")

# Vectorized operations
squared <- values^2
cat("Squared:", squared, "\n")

# Filtering
above_mean <- values[values > mean(values)]
cat("Above mean:", above_mean, "\n")

# Statistics
cat(sprintf("Mean: %.2f\n", mean(values)))
cat(sprintf("Median: %.2f\n", median(values)))
cat(sprintf("SD: %.2f\n", sd(values)))
cat(sprintf("Sum: %.0f\n", sum(values)))

# Apply family
tripled <- sapply(values, function(x) x * 3)
cat("Tripled:", tripled, "\n")`
};
