export default {
  id: 'blocks-ruby',
  language: 'ruby',
  title: 'Ruby Blocks & Procs',
  description: 'Blocks, procs, lambdas, and yield in Ruby',
  difficulty: 'intermediate',
  category: 'closures',
  tags: ['blocks', 'procs', 'lambdas', 'closures'],
  code: `# Blocks with yield
def repeat(n)
  n.times { yield if block_given? }
end

repeat(3) { print "Hi! " }
puts

# Proc
square = Proc.new { |x| x * x }
puts "Square of 5: #{square.call(5)}"

# Lambda
double = ->(x) { x * 2 }
puts "Double of 7: #{double.call(7)}"

# Map with block
numbers = [1, 2, 3, 4, 5]
squared = numbers.map(&square)
puts "Squared: #{squared}"

# Symbol to proc
puts "Uppercase: %w[hello world].map(&:upcase)"`
};
