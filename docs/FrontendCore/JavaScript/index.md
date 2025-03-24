---
outline: deep
---

# JavaScript 知识库

## JavaScript 基础概念

### 什么是 JavaScript？

JavaScript 是一种轻量级、解释型或即时编译型的编程语言，主要用于网页开发，但也广泛应用于服务器端、移动应用和桌面应用程序。它是一种动态类型、基于原型的多范式语言，支持面向对象、命令式和声明式编程风格。

```javascript
// 基本的JavaScript代码示例
console.log('Hello, World!');

// 变量声明
let message = 'Welcome to JavaScript';
const PI = 3.14159;

// 函数定义
function greet(name) {
  return `Hello, ${name}!`;
}

// 函数调用
console.log(greet('Jerry'));
```

### JavaScript 的历史与发展

JavaScript 由 Brendan Eich 在 1995 年创建，最初被称为 Mocha，后来改名为 LiveScript，最终命名为 JavaScript。它的标准化版本被称为 ECMAScript，目前最新的稳定版本是 ECMAScript 2023 (ES14)。

::: tip
JavaScript 与 Java 没有直接关系，尽管它们的名字相似。JavaScript 的命名主要是出于营销考虑。
:::

## JavaScript 数据类型

### 基本数据类型

JavaScript 有 8 种基本数据类型：

| 数据类型 | 描述 | 示例 |
| --- | --- | --- |
| Number | 整数或浮点数 | `42`, `3.14` |
| String | 文本字符串 | `'Hello'`, `"World"` |
| Boolean | 逻辑值 | `true`, `false` |
| Undefined | 未赋值的变量 | `undefined` |
| Null | 表示无值 | `null` |
| Symbol | 唯一且不可变的数据类型 | `Symbol('id')` |
| BigInt | 任意精度整数 | `9007199254740991n` |
| Object | 复杂数据结构 | `{}, [], new Date()` |

### 类型检查与转换

```javascript
// 类型检查
typeof 42;           // 'number'
typeof 'Hello';      // 'string'
typeof true;         // 'boolean'
typeof undefined;    // 'undefined'
typeof null;         // 'object' (这是一个历史遗留的错误)
typeof Symbol('id'); // 'symbol'
typeof 42n;          // 'bigint'
typeof {};           // 'object'

// 类型转换
Number('42');        // 42
String(42);          // '42'
Boolean(1);          // true
Boolean(0);          // false
```

::: warning
使用 `==` 进行比较时会进行类型转换，这可能导致意外结果。建议使用 `===` 进行严格比较。
:::

## JavaScript 变量与作用域

### 变量声明

JavaScript 提供了三种声明变量的方式：

```javascript
// var - 函数作用域，可重复声明，可修改
var x = 10;

// let - 块级作用域，不可重复声明，可修改
let y = 20;

// const - 块级作用域，不可重复声明，不可修改（但对象属性可修改）
const z = 30;
const person = { name: 'Jerry' };
person.name = 'Tom'; // 合法操作
```

### 作用域与闭包

```javascript
// 全局作用域
let globalVar = 'I am global';

// 函数作用域
function exampleFunction() {
  let localVar = 'I am local';
  console.log(globalVar); // 可以访问全局变量

  // 块级作用域
  if (true) {
    let blockVar = 'I am in a block';
    console.log(localVar); // 可以访问外部变量
  }
  // console.log(blockVar); // 错误：blockVar 在这里不可访问
}

// 闭包示例
function createCounter() {
  let count = 0;
  return function() {
    return ++count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```

::: tip
闭包是指函数能够记住并访问其词法作用域，即使该函数在其词法作用域之外执行。这是 JavaScript 中非常强大的特性。
:::

## JavaScript 函数

### 函数定义与调用

```javascript
// 函数声明
function add(a, b) {
  return a + b;
}

// 函数表达式
const subtract = function(a, b) {
  return a - b;
};

// 箭头函数 (ES6)
const multiply = (a, b) => a * b;

// 函数调用
console.log(add(5, 3));       // 8
console.log(subtract(5, 3));   // 2
console.log(multiply(5, 3));   // 15
```

### 参数与默认值

```javascript
// 默认参数 (ES6)
function greet(name = 'Guest') {
  return `Hello, ${name}!`;
}

console.log(greet());        // "Hello, Guest!"
console.log(greet('Jerry')); // "Hello, Jerry!"

// 剩余参数 (ES6)
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3, 4)); // 10
```

## JavaScript 对象与原型

### 对象创建与属性访问

```javascript
// 对象字面量
const person = {
  name: 'Jerry',
  age: 30,
  greet() {
    return `Hello, my name is ${this.name}`;
  }
};

// 属性访问
console.log(person.name);     // 'Jerry'
console.log(person['age']);   // 30
console.log(person.greet());  // 'Hello, my name is Jerry'

// 构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  return `Hello, my name is ${this.name}`;
};

const john = new Person('John', 25);
console.log(john.greet()); // 'Hello, my name is John'
```

### 原型与继承

```javascript
// 原型继承
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  return `${this.name} makes a noise.`;
};

function Dog(name) {
  Animal.call(this, name); // 调用父构造函数
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 重写方法
Dog.prototype.speak = function() {
  return `${this.name} barks.`;
};

const dog = new Dog('Rex');
console.log(dog.speak()); // 'Rex barks.'
```

::: tip
ES6 引入了 `class` 语法，使对象创建和继承更加直观，但底层仍然基于原型。
:::

## ES6+ 新特性

### 类与模块

```javascript
// 类声明 (ES6)
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `Hello, my name is ${this.name}`;
  }

  static createAnonymous() {
    return new Person('Anonymous', 0);
  }
}

// 类继承
class Employee extends Person {
  constructor(name, age, position) {
    super(name, age); // 调用父类构造函数
    this.position = position;
  }

  greet() {
    return `${super.greet()} and I am a ${this.position}`;
  }
}

const employee = new Employee('Jerry', 30, 'Developer');
console.log(employee.greet()); // 'Hello, my name is Jerry and I am a Developer'
```

### 解构与展开运算符

```javascript
// 数组解构
const [a, b, ...rest] = [1, 2, 3, 4, 5];
console.log(a, b, rest); // 1, 2, [3, 4, 5]

// 对象解构
const { name, age, job = 'Developer' } = { name: 'Jerry', age: 30 };
console.log(name, age, job); // 'Jerry', 30, 'Developer'

// 展开运算符
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
console.log(arr2); // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };
console.log(obj2); // { a: 1, b: 2, c: 3 }
```

### Promise 与异步/等待

```javascript
// Promise
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.5;
      if (success) {
        resolve('Data fetched successfully');
      } else {
        reject('Error fetching data');
      }
    }, 1000);
  });
}

// Promise 链
fetchData()
  .then(data => {
    console.log(data);
    return 'Processed ' + data;
  })
  .then(processedData => {
    console.log(processedData);
  })
  .catch(error => {
    console.error(error);
  });

// Async/Await (ES8)
async function getData() {
  try {
    const data = await fetchData();
    console.log(data);
    return 'Processed ' + data;
  } catch (error) {
    console.error(error);
    return 'Error occurred';
  }
}

getData().then(result => console.log(result));
```

## DOM 操作与事件处理

### DOM 选择与修改

```javascript
// 选择元素
const element = document.getElementById('myElement');
const elements = document.querySelectorAll('.myClass');

// 修改内容
element.textContent = 'New text content';
element.innerHTML = '<strong>Bold text</strong>';

// 修改属性
element.setAttribute('data-id', '123');
element.id = 'newId';

// 修改样式
element.style.color = 'red';
element.style.fontSize = '16px';
element.classList.add('highlight');
element.classList.remove('hidden');
element.classList.toggle('active');

// 创建和添加元素
const newElement = document.createElement('div');
newElement.textContent = 'New element';
document.body.appendChild(newElement);
```

### 事件处理

```javascript
// 添加事件监听器
element.addEventListener('click', function(event) {
  console.log('Element clicked', event);
});

// 使用箭头函数
element.addEventListener('mouseover', (event) => {
  console.log('Mouse over element', event);
});

// 移除事件监听器
function handleClick(event) {
  console.log('Clicked', event);
}

element.addEventListener('click', handleClick);
element.removeEventListener('click', handleClick);

// 事件委托
document.getElementById('parent').addEventListener('click', (event) => {
  if (event.target.matches('.child')) {
    console.log('Child element clicked');
  }
});
```

## 错误处理与调试

### 错误处理

```javascript
// try...catch 语句
try {
  // 可能会抛出错误的代码
  const result = riskyOperation();
  console.log(result);
} catch (error) {
  // 处理错误
  console.error('An error occurred:', error.message);
} finally {
  // 无论是否有错误都会执行的代码
  console.log('Cleanup operations');
}

// 抛出自定义错误
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a / b;
}

try {
  console.log(divide(10, 0));
} catch (error) {
  console.error(error.message); // 'Division by zero is not allowed'
}
```

### 调试技巧
