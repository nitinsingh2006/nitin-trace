export default {
  id: 'bubble-sort-java',
  language: 'java',
  title: 'Bubble Sort (Java)',
  description: 'Classic bubble sort with step-by-step output',
  difficulty: 'beginner',
  category: 'sorting',
  tags: ['algorithm', 'sorting', 'arrays'],
  code: `public class BubbleSort {
  public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
      for (int j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          int temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
        }
      }
    }
  }

  public static void main(String[] args) {
    int[] numbers = {64, 34, 25, 12, 22, 11, 90};
    System.out.print("Before: ");
    for (int n : numbers) System.out.print(n + " ");

    bubbleSort(numbers);

    System.out.print("\nAfter:  ");
    for (int n : numbers) System.out.print(n + " ");
  }
}`
};
