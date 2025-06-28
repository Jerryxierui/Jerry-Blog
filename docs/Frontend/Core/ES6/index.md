# ES6 (ECMAScript 2015) 完全指南

## 简介

ES6，全称 ECMAScript 6 或 ECMAScript 2015，是 JavaScript 语言的一个重要版本，于2015年6月正式发布。它引入了许多新特性和语法糖，使 JavaScript 编程更加高效和优雅。本文档将全面介绍 ES6 的主要特性和用法。

## 目录

- [ES6 (ECMAScript 2015) 完全指南](#es6-ecmascript-2015-完全指南)
  - [简介](#简介)
  - [目录](#目录)
  - [let 和 const](#let-和-const)
    - [let](#let)
    - [const](#const)
  - [箭头函数](#箭头函数)
  - [模板字符串](#模板字符串)
  - [解构赋值](#解构赋值)
    - [数组解构](#数组解构)
    - [对象解构](#对象解构)
  - [扩展运算符](#扩展运算符)
  - [对象字面量增强](#对象字面量增强)
  - [类](#类)
  - [模块系统](#模块系统)
    - [导出模块](#导出模块)
    - [导入模块](#导入模块)
  - [Promise](#promise)
  - [生成器和迭代器](#生成器和迭代器)
    - [迭代器 (Iterator)](#迭代器-iterator)
    - [生成器 (Generator)](#生成器-generator)
  - [Symbol](#symbol)
  - [Set 和 Map](#set-和-map)
    - [Set](#set)
    - [Map](#map)
  - [Proxy 和 Reflect](#proxy-和-reflect)
    - [Proxy](#proxy)
    - [Reflect](#reflect)
  - [ES6 与 ES5 的对比](#es6-与-es5-的对比)
    - [变量声明](#变量声明)
    - [函数定义](#函数定义)

## let 和 const

### let

`let` 声明的变量具有块级作用域，只在声明它的块内有效。

```javascript
// 块级作用域示例
if (true) {
  let x = 10;
  console.log(x); // 10
}
console.log(x); // ReferenceError: x is not defined

// 不存在变量提升
console.log(y); // ReferenceError: y is not defined
let y = 20;

// 暂时性死区
let z = 30;
if (true) {
  console.log(z); // ReferenceError: z is not defined
  let z = 40;
}
```

### const

`const` 声明一个只读的常量，一旦声明，其值就不能再修改。

```javascript
const PI = 3.1415926;
PI = 3.14; // TypeError: Assignment to constant variable

// 对于对象和数组，const 保证的是引用不变，而非内容不变
const obj = { name: 'JavaScript' };
obj.name = 'ES6'; // 可以修改属性
console.log(obj); // { name: 'ES6' }

obj = {}; // TypeError: Assignment to constant variable
```

## 箭头函数

箭头函数是一种更简洁的函数写法，并且自动绑定 `this` 到定义时的上下文。

```javascript
// 基本语法
const add = (a, b) => a + b;
console.log(add(1, 2)); // 3

// 单参数可省略括号
const double = n => n * 2;
console.log(double(5)); // 10

// 无参数需要空括号
const sayHello = () => 'Hello!';
console.log(sayHello()); // Hello!

// 多行函数体需要大括号和 return
const sum = (numbers) => {
  let result = 0;
  for (let num of numbers) {
    result += num;
  }
  return result;
};
console.log(sum([1, 2, 3, 4])); // 10

// this 绑定示例
function Timer() {
  this.seconds = 0;

  // 使用箭头函数，this 指向 Timer 实例
  setInterval(() => {
    this.seconds++;
    console.log(this.seconds);
  }, 1000);
}

const timer = new Timer(); // 每秒输出递增的数字
```

## 模板字符串

模板字符串使用反引号 (\`) 标识，可以包含多行文本和嵌入表达式。

```javascript
// 基本用法
const name = 'ES6';
const greeting = `Hello, ${name}!`;
console.log(greeting); // Hello, ES6!

// 多行文本
const multiLine = `
  这是第一行
  这是第二行
  这是第三行
`;
console.log(multiLine);

// 嵌入表达式
const a = 5;
const b = 10;
console.log(`a + b = ${a + b}`); // a + b = 15

// 嵌套模板
const nested = `外层 ${`内层 ${a + b}`}`;
console.log(nested); // 外层 内层 15

// 标签模板
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `<strong>${values[i]}</strong>` : '');
  }, '');
}

const language = 'JavaScript';
const highlighted = highlight`我喜欢 ${language} 编程语言`;
console.log(highlighted); // 我喜欢 <strong>JavaScript</strong> 编程语言
```

## 解构赋值

解构赋值允许从数组或对象中提取值，并赋给变量。

### 数组解构

```javascript
// 基本用法
const [a, b] = [1, 2];
console.log(a, b); // 1 2

// 忽略某些值
const [x, , z] = [1, 2, 3];
console.log(x, z); // 1 3

// 剩余模式
const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first, rest); // 1 [2, 3, 4, 5]

// 默认值
const [p = 10, q = 20] = [1];
console.log(p, q); // 1 20

// 交换变量
let m = 1, n = 2;
[m, n] = [n, m];
console.log(m, n); // 2 1
```

### 对象解构

```javascript
// 基本用法
const { name, age } = { name: 'Alice', age: 25 };
console.log(name, age); // Alice 25

// 赋值给不同名变量
const { name: userName, age: userAge } = { name: 'Bob', age: 30 };
console.log(userName, userAge); // Bob 30

// 默认值
const { name = 'Anonymous', job = 'Unknown' } = { name: 'Charlie' };
console.log(name, job); // Charlie Unknown

// 嵌套解构
const { user: { profile: { firstName } } } = {
  user: {
    profile: {
      firstName: 'David'
    }
  }
};
console.log(firstName); // David

// 结合数组解构
const { results: [firstResult] } = { results: [{ id: 1 }, { id: 2 }] };
console.log(firstResult); // { id: 1 }
```

## 扩展运算符

扩展运算符 (`...`) 可以展开数组或对象。

```javascript
// 数组展开
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
console.log(arr2); // [1, 2, 3, 4, 5]

// 用于函数参数
function sum(a, b, c) {
  return a + b + c;
}
const numbers = [1, 2, 3];
console.log(sum(...numbers)); // 6

// 复制数组
const original = [1, 2, 3];
const copy = [...original];
console.log(copy); // [1, 2, 3]

// 合并数组
const arr3 = [1, 2];
const arr4 = [3, 4];
const merged = [...arr3, ...arr4];
console.log(merged); // [1, 2, 3, 4]

// 对象展开
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };
console.log(obj2); // { a: 1, b: 2, c: 3 }

// 对象属性覆盖
const obj3 = { a: 1, b: 2 };
const obj4 = { ...obj3, a: 3 };
console.log(obj4); // { a: 3, b: 2 }
```

## 对象字面量增强

ES6 增强了对象字面量的语法。

```javascript
// 属性简写
const name = 'Alice';
const age = 25;
const user = { name, age };
console.log(user); // { name: 'Alice', age: 25 }

// 方法简写
const calculator = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  }
};
console.log(calculator.add(5, 3)); // 8

// 计算属性名
const propName = 'dynamicProp';
const obj = {
  [propName]: 'value',
  [`computed_${propName}`]: 'another value'
};
console.log(obj); // { dynamicProp: 'value', computed_dynamicProp: 'another value' }
```

## 类

ES6 引入了类的语法，使面向对象编程更加简洁。

```javascript
// 基本类定义
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  sayHello() {
    return `Hello, my name is ${this.name}`;
  }

  // 静态方法
  static createAnonymous() {
    return new Person('Anonymous', 0);
  }

  // getter 和 setter
  get profile() {
    return `${this.name}, ${this.age} years old`;
  }

  set profile(value) {
    [this.name, this.age] = value.split(',');
    this.age = parseInt(this.age, 10);
  }
}

const alice = new Person('Alice', 25);
console.log(alice.sayHello()); // Hello, my name is Alice
console.log(alice.profile); // Alice, 25 years old

alice.profile = 'Bob,30';
console.log(alice.name); // Bob
console.log(alice.age); // 30

const anonymous = Person.createAnonymous();
console.log(anonymous.name); // Anonymous

// 继承
class Employee extends Person {
  constructor(name, age, company) {
    super(name, age); // 调用父类构造函数
    this.company = company;
  }

  sayHello() {
    return `${super.sayHello()} and I work at ${this.company}`;
  }
}

const bob = new Employee('Bob', 30, 'Google');
console.log(bob.sayHello()); // Hello, my name is Bob and I work at Google
```

## 模块系统

ES6 引入了官方的模块系统，使用 `import` 和 `export` 关键字。

### 导出模块

```javascript
// math.js

// 命名导出
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// 默认导出
export default class Calculator {
  add(a, b) {
    return a + b;
  }
}

// 或者在文件末尾统一导出
const subtract = (a, b) => a - b;
const divide = (a, b) => a / b;

export { subtract, divide };
```

### 导入模块

```javascript
// app.js

// 导入默认导出
import Calculator from './math.js';

// 导入命名导出
import { PI, add, multiply } from './math.js';

// 导入并重命名
import { add as mathAdd, multiply as mathMultiply } from './math.js';

// 导入所有导出并命名为 math
import * as math from './math.js';

console.log(PI); // 3.14159
console.log(add(1, 2)); // 3
console.log(mathMultiply(2, 3)); // 6

const calc = new Calculator();
console.log(calc.add(5, 3)); // 8

console.log(math.subtract(10, 5)); // 5
console.log(math.divide(10, 2)); // 5
```

## Promise

Promise 是异步编程的一种解决方案，比传统的回调函数更加优雅。

```javascript
// 基本用法
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('操作成功');
    } else {
      reject(new Error('操作失败'));
    }
  }, 1000);
});

promise
  .then(result => {
    console.log(result); // 操作成功
    return '继续处理';
  })
  .then(result => {
    console.log(result); // 继续处理
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log('无论成功失败都会执行');
  });

// Promise.all - 所有 Promise 都成功时才成功
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

Promise.all([promise1, promise2, promise3])
  .then(values => {
    console.log(values); // [1, 2, 3]
  });

// Promise.race - 返回最先完成的 Promise 结果
const fast = new Promise(resolve => setTimeout(() => resolve('快'), 100));
const slow = new Promise(resolve => setTimeout(() => resolve('慢'), 200));

Promise.race([fast, slow])
  .then(result => {
    console.log(result); // 快
  });

// Promise.allSettled - 等待所有 Promise 完成，无论成功失败
Promise.allSettled([promise1, Promise.reject('失败')])
  .then(results => {
    console.log(results);
    // [
    //   { status: 'fulfilled', value: 1 },
    //   { status: 'rejected', reason: '失败' }
    // ]
  });

// Promise.any - 返回第一个成功的 Promise
Promise.any([Promise.reject('失败1'), Promise.resolve('成功'), Promise.reject('失败2')])
  .then(result => {
    console.log(result); // 成功
  });
```

## 生成器和迭代器

### 迭代器 (Iterator)

迭代器是一个具有 `next()` 方法的对象，每次调用 `next()` 返回一个包含 `value` 和 `done` 属性的对象。

```javascript
// 手动实现迭代器
function createIterator(array) {
  let index = 0;
  return {
    next() {
      return index < array.length
        ? { value: array[index++], done: false }
        : { done: true };
    }
  };
}

const iterator = createIterator([1, 2, 3]);
console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { done: true }
```

### 生成器 (Generator)

生成器是一种特殊的函数，可以暂停执行并在之后恢复。

```javascript
// 基本用法
function* simpleGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const generator = simpleGenerator();
console.log(generator.next()); // { value: 1, done: false }
console.log(generator.next()); // { value: 2, done: false }
console.log(generator.next()); // { value: 3, done: false }
console.log(generator.next()); // { value: undefined, done: true }

// 生成器传值
function* twoWayGenerator() {
  const a = yield 1;
  const b = yield a + 2;
  yield b + 3;
}

const twoWay = twoWayGenerator();
console.log(twoWay.next()); // { value: 1, done: false }
console.log(twoWay.next(10)); // { value: 12, done: false }
console.log(twoWay.next(20)); // { value: 23, done: false }

// 异步生成器
function* fetchData() {
  try {
    const response = yield fetch('https://api.example.com/data');
    const data = yield response.json();
    yield data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// 使用生成器实现异步流程控制
function runGenerator(generator) {
  const iterator = generator();

  function handle(result) {
    if (result.done) return Promise.resolve(result.value);

    return Promise.resolve(result.value)
      .then(res => handle(iterator.next(res)))
      .catch(err => handle(iterator.throw(err)));
  }

  return handle(iterator.next());
}

// runGenerator(fetchData).then(data => console.log(data));
```

## Symbol

Symbol 是 ES6 引入的一种新的原始数据类型，表示唯一的标识符。

```javascript
// 基本用法
const sym1 = Symbol();
const sym2 = Symbol('description');
const sym3 = Symbol('description');

console.log(sym2 === sym3); // false，即使描述相同

// 作为对象属性
const obj = {
  [sym1]: 'value for sym1',
  [sym2]: 'value for sym2'
};

console.log(obj[sym1]); // value for sym1

// Symbol 属性不会出现在常规的对象遍历中
console.log(Object.keys(obj)); // []
console.log(Object.getOwnPropertyNames(obj)); // []

// 获取 Symbol 属性
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(), Symbol(description)]

// 全局 Symbol
const globalSym1 = Symbol.for('global');
const globalSym2 = Symbol.for('global');

console.log(globalSym1 === globalSym2); // true
console.log(Symbol.keyFor(globalSym1)); // global

// 内置 Symbol
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return i < 3
          ? { value: i++, done: false }
          : { done: true };
      }
    };
  }
};

for (const value of iterable) {
  console.log(value); // 0, 1, 2
}
```

## Set 和 Map

### Set

Set 是一种新的数据结构，类似于数组，但成员唯一。

```javascript
// 基本用法
const set = new Set([1, 2, 3, 4, 4, 5]);
console.log(set); // Set(5) { 1, 2, 3, 4, 5 }

// 添加和删除元素
set.add(6);
set.delete(1);
console.log(set); // Set(5) { 2, 3, 4, 5, 6 }

// 检查元素是否存在
console.log(set.has(3)); // true
console.log(set.has(1)); // false

// 获取 Set 大小
console.log(set.size); // 5

// 清空 Set
set.clear();
console.log(set.size); // 0

// 遍历 Set
const fruits = new Set(['apple', 'banana', 'orange']);

// forEach 方法
fruits.forEach(fruit => console.log(fruit));

// for...of 循环
for (const fruit of fruits) {
  console.log(fruit);
}

// 转换为数组
const fruitArray = [...fruits];
console.log(fruitArray); // ['apple', 'banana', 'orange']

// 数组去重
const numbers = [1, 2, 2, 3, 4, 4, 5];
const uniqueNumbers = [...new Set(numbers)];
console.log(uniqueNumbers); // [1, 2, 3, 4, 5]
```

### Map

Map 是一种键值对的集合，类似于对象，但键可以是任何类型。

```javascript
// 基本用法
const map = new Map();
map.set('name', 'Alice');
map.set(42, 'answer');
map.set(true, 'boolean');

console.log(map.get('name')); // Alice
console.log(map.get(42)); // answer
console.log(map.get(true)); // boolean

// 使用数组初始化
const userMap = new Map([
  ['name', 'Bob'],
  ['age', 30],
  ['job', 'Developer']
]);

// 检查键是否存在
console.log(userMap.has('job')); // true
console.log(userMap.has('address')); // false

// 获取 Map 大小
console.log(userMap.size); // 3

// 删除元素
userMap.delete('age');
console.log(userMap.size); // 2

// 清空 Map
userMap.clear();
console.log(userMap.size); // 0

// 遍历 Map
const fruitMap = new Map([
  ['apple', 'red'],
  ['banana', 'yellow'],
  ['orange', 'orange']
]);

// forEach 方法
fruitMap.forEach((value, key) => {
  console.log(`${key} is ${value}`);
});

// for...of 循环遍历键值对
for (const [fruit, color] of fruitMap) {
  console.log(`${fruit} is ${color}`);
}

// 获取所有键
console.log([...fruitMap.keys()]); // ['apple', 'banana', 'orange']

// 获取所有值
console.log([...fruitMap.values()]); // ['red', 'yellow', 'orange']

// 转换为对象（仅当键为字符串时有效）
const obj = Object.fromEntries(fruitMap);
console.log(obj); // { apple: 'red', banana: 'yellow', orange: 'orange' }
```

## Proxy 和 Reflect

### Proxy

Proxy 用于定义对象的自定义行为。

```javascript
// 基本用法
const target = {
  name: 'Alice',
  age: 25
};

const handler = {
  get(target, prop, receiver) {
    console.log(`Getting ${prop}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`Setting ${prop} to ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
};

const proxy = new Proxy(target, handler);

console.log(proxy.name); // Getting name, Alice
proxy.age = 26; // Setting age to 26

// 验证示例
function createValidator(target, validations) {
  return new Proxy(target, {
    set(target, prop, value, receiver) {
      if (validations.hasOwnProperty(prop)) {
        if (!validations[prop](value)) {
          throw new Error(`Invalid value for ${prop}`);
        }
      }
      return Reflect.set(target, prop, value, receiver);
    }
  });
}

const user = createValidator(
  { name: 'Bob', age: 30 },
  {
    name: value => typeof value === 'string' && value.length > 0,
    age: value => typeof value === 'number' && value >= 18 && value < 100
  }
);

user.name = 'Charlie'; // 有效
// user.age = 10; // 抛出错误: Invalid value for age
// user.name = ''; // 抛出错误: Invalid value for name
```

### Reflect

Reflect 是一个内置对象，提供拦截 JavaScript 操作的方法。

```javascript
// 基本用法
const obj = { name: 'Alice', age: 25 };

// 获取属性
console.log(Reflect.get(obj, 'name')); // Alice

// 设置属性
Reflect.set(obj, 'age', 26);
console.log(obj.age); // 26

// 检查属性是否存在
console.log(Reflect.has(obj, 'name')); // true
console.log(Reflect.has(obj, 'job')); // false

// 删除属性
Reflect.deleteProperty(obj, 'age');
console.log(obj); // { name: 'Alice' }

// 获取所有属性
console.log(Reflect.ownKeys(obj)); // ['name']

// 创建对象
const instance = Reflect.construct(function(name) {
  this.name = name;
}, ['Bob']);
console.log(instance.name); // Bob

// 调用函数
function sum(a, b) {
  return a + b;
}
console.log(Reflect.apply(sum, null, [1, 2])); // 3
```

## ES6 与 ES5 的对比

### 变量声明

```javascript
// ES5
var name = 'Alice';
var age = 25;

// ES6
let name = 'Alice';
const age = 25;
```

### 函数定义

```javascript
// ES5
function add(a, b) {
  return a + b;
}

// ES6
const add = (a, b) => a + b;
```

## 高级特性

### Proxy 和 Reflect

```javascript
// Proxy - 拦截对象操作
const target = {
  name: 'Jerry',
  age: 30
};

const proxy = new Proxy(target, {
  // 拦截属性读取
  get(target, property, receiver) {
    console.log(`读取属性: ${property}`);
    return Reflect.get(target, property, receiver);
  },
  
  // 拦截属性设置
  set(target, property, value, receiver) {
    console.log(`设置属性: ${property} = ${value}`);
    if (property === 'age' && value < 0) {
      throw new Error('年龄不能为负数');
    }
    return Reflect.set(target, property, value, receiver);
  },
  
  // 拦截属性检查
  has(target, property) {
    console.log(`检查属性: ${property}`);
    return Reflect.has(target, property);
  },
  
  // 拦截属性删除
  deleteProperty(target, property) {
    console.log(`删除属性: ${property}`);
    return Reflect.deleteProperty(target, property);
  }
});

// 使用代理
proxy.name; // 读取属性: name
proxy.age = 25; // 设置属性: age = 25
'name' in proxy; // 检查属性: name
delete proxy.age; // 删除属性: age

// 数组代理示例
const arrayProxy = new Proxy([], {
  set(target, property, value) {
    if (property === 'length') {
      console.log(`数组长度变为: ${value}`);
    } else {
      console.log(`设置索引 ${property}: ${value}`);
    }
    return Reflect.set(target, property, value);
  }
});

arrayProxy.push('item1'); // 设置索引 0: item1, 数组长度变为: 1
```

### 生成器函数进阶

```javascript
// 生成器委托
function* generator1() {
  yield 1;
  yield 2;
}

function* generator2() {
  yield 3;
  yield 4;
}

function* combinedGenerator() {
  yield* generator1(); // 委托给 generator1
  yield* generator2(); // 委托给 generator2
  yield 5;
}

const combined = combinedGenerator();
console.log([...combined]); // [1, 2, 3, 4, 5]

// 双向通信
function* twoWayGenerator() {
  const a = yield 'First';
  console.log('Received:', a);
  const b = yield 'Second';
  console.log('Received:', b);
  return 'Done';
}

const gen = twoWayGenerator();
console.log(gen.next()); // { value: 'First', done: false }
console.log(gen.next('Hello')); // Received: Hello, { value: 'Second', done: false }
console.log(gen.next('World')); // Received: World, { value: 'Done', done: true }

// 异步生成器
async function* asyncGenerator() {
  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield `Item ${i + 1}`;
  }
}

// 使用异步生成器
(async () => {
  for await (const item of asyncGenerator()) {
    console.log(item); // 每秒输出一个项目
  }
})();
```

### WeakMap 和 WeakSet 进阶

```javascript
// WeakMap 用于私有数据
const privateData = new WeakMap();

class User {
  constructor(name, email) {
    // 存储私有数据
    privateData.set(this, {
      name,
      email,
      id: Math.random().toString(36)
    });
  }
  
  getName() {
    return privateData.get(this).name;
  }
  
  getEmail() {
    return privateData.get(this).email;
  }
  
  getId() {
    return privateData.get(this).id;
  }
}

const user = new User('Jerry', 'jerry@example.com');
console.log(user.getName()); // Jerry
// 无法直接访问私有数据
console.log(user.name); // undefined

// WeakSet 用于对象标记
const processedObjects = new WeakSet();

function processObject(obj) {
  if (processedObjects.has(obj)) {
    console.log('对象已处理过');
    return;
  }
  
  // 处理对象
  console.log('处理对象:', obj);
  processedObjects.add(obj);
}

const obj1 = { data: 'test' };
processObject(obj1); // 处理对象: { data: 'test' }
processObject(obj1); // 对象已处理过
```

### 正则表达式增强

```javascript
// 命名捕获组
const dateRegex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = '2024-01-15'.match(dateRegex);
console.log(match.groups); // { year: '2024', month: '01', day: '15' }

// 后行断言
const priceRegex = /(?<=\$)\d+/; // 匹配 $ 后面的数字
console.log('$100'.match(priceRegex)); // ['100']

// 前行断言
const fileRegex = /\w+(?=\.js)/; // 匹配 .js 前面的文件名
console.log('app.js'.match(fileRegex)); // ['app']

// Unicode 属性转义
const emojiRegex = /\p{Emoji}/u;
console.log('Hello 😊'.match(emojiRegex)); // ['😊']

// dotAll 标志
const multilineRegex = /start.+end/s; // s 标志使 . 匹配换行符
console.log('start\nend'.match(multilineRegex)); // ['start\nend']
```

### 数值和数学增强

```javascript
// 数值分隔符
const million = 1_000_000;
const binary = 0b1010_0001;
const hex = 0xFF_EC_DE_5E;
const bigInt = 123_456n;

// Math 新方法
console.log(Math.trunc(4.9)); // 4 - 去除小数部分
console.log(Math.sign(-5)); // -1 - 返回数值符号
console.log(Math.cbrt(27)); // 3 - 立方根
console.log(Math.hypot(3, 4)); // 5 - 平方和的平方根

// 指数运算符
console.log(2 ** 3); // 8
console.log(2 ** 10); // 1024

// Number 新方法
console.log(Number.isInteger(4.0)); // true
console.log(Number.isSafeInteger(9007199254740991)); // true
console.log(Number.parseFloat('3.14')); // 3.14
console.log(Number.parseInt('10', 2)); // 2

// BigInt 运算
const bigNum1 = 9007199254740991n;
const bigNum2 = BigInt(Number.MAX_SAFE_INTEGER);
console.log(bigNum1 + bigNum2); // 18014398509481982n
```

## 实用模式和技巧

### 函数式编程模式

```javascript
// 柯里化
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
};

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6

// 组合函数
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const composedFn = compose(square, double, addOne);
console.log(composedFn(3)); // (3 + 1) * 2 = 8, 8^2 = 64

const pipedFn = pipe(addOne, double, square);
console.log(pipedFn(3)); // 同上

// 记忆化
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(40)); // 快速计算
```

### 异步编程模式

```javascript
// Promise 工具函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const timeout = (promise, ms) => {
  return Promise.race([
    promise,
    delay(ms).then(() => Promise.reject(new Error('Timeout')))
  ]);
};

const retry = async (fn, maxAttempts = 3) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await delay(1000 * attempt); // 指数退避
    }
  }
};

// 并发控制
const pLimit = (concurrency) => {
  const queue = [];
  let running = 0;
  
  const next = () => {
    if (queue.length > 0 && running < concurrency) {
      running++;
      const { fn, resolve, reject } = queue.shift();
      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          running--;
          next();
        });
    }
  };
  
  return (fn) => {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
  };
};

const limit = pLimit(2); // 最多同时执行2个任务

const tasks = [
  () => fetch('/api/1'),
  () => fetch('/api/2'),
  () => fetch('/api/3'),
  () => fetch('/api/4')
];

Promise.all(tasks.map(task => limit(task)))
  .then(results => console.log('所有任务完成'));
```

### 对象和数组操作技巧

```javascript
// 深拷贝
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// 对象路径访问
const get = (obj, path, defaultValue) => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
};

const user = {
  profile: {
    address: {
      city: 'Beijing'
    }
  }
};

console.log(get(user, 'profile.address.city')); // 'Beijing'
console.log(get(user, 'profile.address.country', 'Unknown')); // 'Unknown'

// 数组分组
const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

const users = [
  { name: 'Alice', age: 25, department: 'Engineering' },
  { name: 'Bob', age: 30, department: 'Marketing' },
  { name: 'Charlie', age: 25, department: 'Engineering' }
];

const groupedByAge = groupBy(users, 'age');
const groupedByDept = groupBy(users, user => user.department);

// 数组去重
const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

const uniqueUsers = uniqueBy(users, 'age');
```

### 性能优化技巧

```javascript
// 防抖和节流
const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 懒加载
class LazyValue {
  constructor(factory) {
    this.factory = factory;
    this.computed = false;
    this.value = undefined;
  }
  
  get() {
    if (!this.computed) {
      this.value = this.factory();
      this.computed = true;
    }
    return this.value;
  }
}

const expensiveComputation = new LazyValue(() => {
  console.log('执行昂贵的计算...');
  return Array.from({ length: 1000000 }, (_, i) => i).reduce((a, b) => a + b);
});

// 只有在需要时才会执行计算
console.log(expensiveComputation.get());

// 缓存装饰器
const cached = (target, propertyKey, descriptor) => {
  const originalMethod = descriptor.value;
  const cache = new Map();
  
  descriptor.value = function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = originalMethod.apply(this, args);
    cache.set(key, result);
    return result;
  };
  
  return descriptor;
};

class Calculator {
  @cached
  fibonacci(n) {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
```

## 模块化最佳实践

### ES 模块进阶

```javascript
// 动态导入
const loadModule = async (moduleName) => {
  try {
    const module = await import(`./modules/${moduleName}.js`);
    return module;
  } catch (error) {
    console.error(`Failed to load module: ${moduleName}`, error);
    return null;
  }
};

// 条件导入
const isDevelopment = process.env.NODE_ENV === 'development';
const logger = isDevelopment 
  ? await import('./dev-logger.js')
  : await import('./prod-logger.js');

// 模块聚合
// utils/index.js
export { default as debounce } from './debounce.js';
export { default as throttle } from './throttle.js';
export { default as deepClone } from './deepClone.js';
export * from './array-utils.js';
export * from './object-utils.js';

// 使用
import { debounce, throttle, deepClone } from './utils/index.js';

// 模块单例模式
// config.js
class Config {
  constructor() {
    if (Config.instance) {
      return Config.instance;
    }
    this.settings = {};
    Config.instance = this;
  }
  
  set(key, value) {
    this.settings[key] = value;
  }
  
  get(key) {
    return this.settings[key];
  }
}

export default new Config();
```

## 总结

ES6+ 为 JavaScript 带来了许多强大的新特性，这些特性不仅提高了代码的可读性和可维护性，还为现代 Web 开发提供了更好的工具和模式。掌握这些特性对于现代前端开发至关重要。

现代 JavaScript 开发还需要关注性能优化、函数式编程、异步编程等高级概念，以及模块化、工具链等工程化实践。通过合理运用这些特性和模式，可以编写出更加优雅、高效和可维护的代码。
