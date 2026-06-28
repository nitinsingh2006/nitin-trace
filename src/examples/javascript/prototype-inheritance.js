/**
 * Prototype & Inheritance - JavaScript
 *
 * Demonstrates prototype chain, ES6 classes, and inheritance.
 */
export default {
  id: 'prototype-inheritance-js',
  language: 'javascript',
  title: 'Class Inheritance',
  description: 'ES6 classes, inheritance, and the prototype chain',
  difficulty: 'intermediate',
  category: 'oop',
  tags: ['OOP', 'classes', 'inheritance', 'prototype'],
  code: `class Animal {
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }

  speak() {
    return \`\${this.name} says \${this.sound}!\`;
  }

  toString() {
    return \`Animal(\${this.name})\`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name, "Woof");
    this.breed = breed;
    this.tricks = [];
  }

  learn(trick) {
    this.tricks.push(trick);
    console.log(\`\${this.name} learned: \${trick}\`);
  }

  perform() {
    if (this.tricks.length === 0) {
      console.log(\`\${this.name} doesn't know any tricks yet\`);
      return;
    }
    console.log(\`\${this.name} performs: \${this.tricks.join(', ')}\`);
  }
}

const dog = new Dog("Rex", "German Shepherd");
console.log(dog.speak());
dog.learn("sit");
dog.learn("shake");
dog.learn("roll over");
dog.perform();
console.log(\`Breed: \${dog.breed}\`);
console.log(\`Is Animal? \${dog instanceof Animal}\`);`,
};
