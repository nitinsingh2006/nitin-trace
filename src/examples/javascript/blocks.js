/**
 * Block Scoping - JavaScript
 *
 * Demonstrates let/const block scoping, var hoisting differences,
 * and IIFE patterns.
 */
export default {
  id: 'blocks-js',
  language: 'javascript',
  title: 'Block Scoping & Hoisting',
  description: 'let/const vs var, block scope, and hoisting behavior',
  difficulty: 'intermediate',
  category: 'closures',
  tags: ['scope', 'hoisting', 'let', 'const', 'var'],
  code: `// var: function-scoped, hoisted
function testVar() {
  console.log(x); // undefined (hoisted)
  var x = 10;
  console.log(x); // 10
  
  if (true) {
    var x = 20; // same variable!
    console.log("inside if:", x); // 20
  }
  console.log("after if:", x); // 20 (leaked!)
}

// let: block-scoped, not hoisted
function testLet() {
  let y = 10;
  console.log("outer y:", y); // 10
  
  if (true) {
    let y = 20; // different variable
    console.log("inner y:", y); // 20
  }
  console.log("outer y after:", y); // 10 (unchanged)
}

// const: block-scoped, immutable binding
function testConst() {
  const PI = 3.14159;
  const arr = [1, 2, 3];
  
  arr.push(4); // OK: mutating array is fine
  console.log("arr:", arr);
  
  // PI = 3; // TypeError: Assignment to constant variable
  console.log("PI:", PI);
}

testVar();
testLet();
testConst();`,
};
