export default {
  id: 'hello-world-java',
  language: 'java',
  title: 'Hello World (Java)',
  description: 'Simple Java class with methods and output',
  difficulty: 'beginner',
  category: 'basics',
  tags: ['basics', 'oop', 'class'],
  code: `public class HelloWorld {
  private String message;

  public HelloWorld(String message) {
    this.message = message;
  }

  public void greet() {
    System.out.println(message);
    System.out.println("Current time: " + System.currentTimeMillis());
  }

  public static void main(String[] args) {
    HelloWorld hw = new HelloWorld("Hello, World!");
    hw.greet();
  }
}`
};
