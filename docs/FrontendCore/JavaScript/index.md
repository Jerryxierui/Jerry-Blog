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

```javascript
// 使用 console 方法
console.log('基本日志信息');
console.info('信息类日志');
console.warn('警告信息');
console.error('错误信息');

// 分组日志
console.group('用户数据');
console.log('姓名: Jerry');
console.log('年龄: 30');
console.groupEnd();

// 表格形式展示数据
console.table([{name: 'Jerry', age: 30}, {name: 'Tom', age: 25}]);

// 计时
console.time('操作耗时');
// 执行一些操作
console.timeEnd('操作耗时');

// 断言
console.assert(1 === 2, '断言失败: 1不等于2');

// 使用 debugger 语句
function problematicFunction() {
  let x = 10;
  debugger; // 浏览器会在此处暂停执行
  x = x * 2;
  return x;
}
```

::: tip
在浏览器开发者工具中，可以设置断点、监视变量、单步执行代码，这些都是调试JavaScript代码的有效方法。
:::

## Web API 与浏览器交互

### Fetch API

```javascript
// 基本 GET 请求
fetch('https://api.example.com/data')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// 使用 async/await
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// POST 请求
async function postData(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 本地存储

```javascript
// localStorage - 持久存储
localStorage.setItem('username', 'Jerry');
const username = localStorage.getItem('username');
localStorage.removeItem('username');
localStorage.clear(); // 清除所有数据

// sessionStorage - 会话存储
sessionStorage.setItem('sessionData', 'temporary');
const sessionData = sessionStorage.getItem('sessionData');

// 存储对象
const user = { name: 'Jerry', age: 30 };
localStorage.setItem('user', JSON.stringify(user));
const storedUser = JSON.parse(localStorage.getItem('user'));

// 监听存储变化
window.addEventListener('storage', (event) => {
  console.log('Storage changed:', event.key, event.newValue);
});
```

### 定时器与动画

```javascript
// setTimeout - 延迟执行
const timeoutId = setTimeout(() => {
  console.log('延迟执行');
}, 1000);

// 清除定时器
clearTimeout(timeoutId);

// setInterval - 重复执行
const intervalId = setInterval(() => {
  console.log('重复执行');
}, 1000);

// 清除间隔定时器
clearInterval(intervalId);

// requestAnimationFrame - 动画帧
function animate() {
  // 动画逻辑
  console.log('动画帧');
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

## 现代 JavaScript 特性

### 可选链操作符 (ES2020)

```javascript
const user = {
  name: 'Jerry',
  address: {
    street: '123 Main St',
    city: 'New York'
  }
};

// 传统方式
const city = user && user.address && user.address.city;

// 可选链操作符
const cityNew = user?.address?.city;
const zipCode = user?.address?.zipCode; // undefined，不会报错

// 方法调用
user?.getName?.(); // 如果 getName 方法存在则调用

// 数组访问
const firstItem = user?.items?.[0];
```

### 空值合并操作符 (ES2020)

```javascript
// 传统方式
const name = user.name || 'Default Name';

// 空值合并操作符 - 只有 null 或 undefined 时才使用默认值
const nameNew = user.name ?? 'Default Name';

// 区别示例
const value1 = '' || 'default'; // 'default'
const value2 = '' ?? 'default'; // ''

const value3 = 0 || 'default'; // 'default'
const value4 = 0 ?? 'default'; // 0
```

### 动态导入 (ES2020)

```javascript
// 动态导入模块
async function loadModule() {
  try {
    const module = await import('./myModule.js');
    module.doSomething();
  } catch (error) {
    console.error('模块加载失败:', error);
  }
}

// 条件导入
if (condition) {
  import('./conditionalModule.js')
    .then(module => {
      module.init();
    });
}
```

### BigInt (ES2020)

```javascript
// 创建 BigInt
const bigInt1 = 123n;
const bigInt2 = BigInt(123);
const bigInt3 = BigInt('123456789012345678901234567890');

// BigInt 运算
const sum = 123n + 456n; // 579n
const product = 123n * 456n; // 56088n

// 注意：不能与普通数字混合运算
// const invalid = 123n + 456; // TypeError
const valid = 123n + BigInt(456); // 579n

// 比较
console.log(123n === 123); // false
console.log(123n == 123); // true
console.log(123n > 122); // true
```

## 性能优化技巧

### 防抖和节流

```javascript
// 防抖 - 延迟执行，如果在延迟期间再次触发，则重新计时
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// 使用防抖
const debouncedSearch = debounce((query) => {
  console.log('搜索:', query);
}, 300);

// 节流 - 限制执行频率
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

// 使用节流
const throttledScroll = throttle(() => {
  console.log('滚动事件');
}, 100);

window.addEventListener('scroll', throttledScroll);
```

### 内存管理

```javascript
// 避免内存泄漏
class Component {
  constructor() {
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    console.log('窗口大小改变');
  }

  destroy() {
    // 清理事件监听器
    window.removeEventListener('resize', this.handleResize);
  }
}

// 使用 WeakMap 避免内存泄漏
const privateData = new WeakMap();

class User {
  constructor(name) {
    privateData.set(this, { name });
  }

  getName() {
    return privateData.get(this).name;
  }
}
```

## 最佳实践

### 代码组织

```javascript
// 使用模块化
// userService.js
export class UserService {
  static async getUser(id) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }

  static async createUser(userData) {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }
}

// 使用常量
export const API_ENDPOINTS = {
  USERS: '/api/users',
  POSTS: '/api/posts'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404
};
```

### 错误处理策略

```javascript
// 自定义错误类
class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

// 统一错误处理
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new APIError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      console.error('API错误:', error.message, error.status);
    } else {
      console.error('网络错误:', error.message);
    }
    throw error;
  }
}
```

## 参考资源

- [MDN JavaScript 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [ECMAScript 规范](https://tc39.es/ecma262/)
- [JavaScript.info](https://javascript.info/)
- [You Don't Know JS 系列](https://github.com/getify/You-Dont-Know-JS)
- [Airbnb JavaScript 风格指南](https://github.com/airbnb/javascript)
