---
outline: deep
---

# TypeScript 知识库

## TypeScript 基础概念

### 什么是 TypeScript？

TypeScript 是 JavaScript 的超集，添加了静态类型定义和其他特性。它是由微软开发和维护的开源编程语言，可以编译成纯 JavaScript，在任何浏览器、任何操作系统上运行。

```typescript
// 基本的TypeScript代码示例
let message: string = 'Hello, TypeScript!';
const PI: number = 3.14159;

// 带类型的函数定义
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// 函数调用
console.log(greet('Jerry'));
```

### TypeScript 的优势

TypeScript 相比 JavaScript 具有以下优势：

- **静态类型检查**：在编译时捕获错误，而不是在运行时
- **更好的IDE支持**：提供代码补全、接口提示和重构工具
- **面向对象编程特性**：支持接口、泛型、命名空间等
- **ES6+特性支持**：支持最新的 JavaScript 特性，并可转译为兼容的代码
- **大型项目可维护性**：类型系统使代码更易于理解和维护

::: tip
TypeScript 是渐进式的，你可以逐步将 JavaScript 代码转换为 TypeScript 代码。
:::

### TypeScript 与 JavaScript 的关系

TypeScript 与 JavaScript 的关系可以用以下几点来概括：

- TypeScript 是 JavaScript 的超集，任何有效的 JavaScript 代码都是有效的 TypeScript 代码
- TypeScript 添加了静态类型系统，但在编译后会被擦除，不会影响运行时行为
- TypeScript 编译器可以将 TypeScript 代码转换为不同版本的 JavaScript 代码
- TypeScript 支持最新的 ECMAScript 标准特性，即使目标环境不支持

```typescript
// JavaScript 代码
function add(a, b) {
  return a + b;
}

// TypeScript 等效代码
function add(a: number, b: number): number {
  return a + b;
}
```

### TypeScript 开发环境搭建

#### 安装 TypeScript

```bash
# 全局安装
npm install -g typescript

# 查看版本
tsc --version

# 项目中安装
npm install --save-dev typescript
```

#### 配置 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### 编译 TypeScript 文件

```bash
# 编译单个文件
tsc app.ts

# 使用配置文件编译项目
tsc

# 监视模式
tsc --watch
```

## TypeScript 类型系统

### 基本类型

TypeScript 支持 JavaScript 的所有基本类型，并添加了一些额外的类型：

| 类型 | 描述 | 示例 |
| --- | --- | --- |
| `number` | 数字（整数和浮点数） | `let decimal: number = 6;` |
| `string` | 文本数据 | `let color: string = "blue";` |
| `boolean` | 逻辑值 | `let isDone: boolean = false;` |
| `null` | 表示无值 | `let n: null = null;` |
| `undefined` | 未初始化的值 | `let u: undefined = undefined;` |
| `any` | 任意类型，跳过类型检查 | `let notSure: any = 4;` |
| `unknown` | 类型安全的any | `let notSure: unknown = 4;` |
| `void` | 表示无返回值 | `function log(): void { console.log('Hi'); }` |
| `never` | 永不返回（抛出异常或无限循环） | `function error(): never { throw new Error(); }` |

### 复合类型

```typescript
// 数组
let list: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3]; // 泛型写法

// 元组
let x: [string, number] = ["hello", 10];

// 枚举
enum Color {Red, Green, Blue}
let c: Color = Color.Green;

// 对象
let person: { name: string; age: number } = { name: "Jerry", age: 30 };
```

::: warning
使用 `any` 类型会失去 TypeScript 的类型检查优势，应尽量避免使用。如果不确定类型，优先考虑使用 `unknown`。
:::

### 字面量类型

TypeScript 允许定义字面量类型，限制变量只能是特定的值：

```typescript
// 字符串字面量类型
type Direction = "north" | "south" | "east" | "west";
let direction: Direction = "north"; // 只能是这四个值之一

// 数字字面量类型
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 3; // 只能是1-6之间的整数

// 布尔字面量类型
type Bool = true;
let isActive: Bool = true; // 只能是true
```

### 类型别名与类型断言

```typescript
// 类型别名
type Point = {
  x: number;
  y: number;
};

let point: Point = { x: 10, y: 20 };

// 类型断言
let someValue: unknown = "this is a string";
let strLength: number = (someValue as string).length;
// 或使用尖括号语法（在JSX中不可用）
let strLength2: number = (<string>someValue).length;
```

### 非空断言与可选链

```typescript
// 非空断言操作符 (!)
function processValue(value: string | null | undefined) {
  // 告诉编译器 value 不会是 null 或 undefined
  const length = value!.length;
}

// 可选链操作符 (?.)
type Person = {
  name: string;
  address?: {
    street?: string;
    city?: string;
  };
};

function getCity(person: Person) {
  return person.address?.city; // 如果 address 不存在，返回 undefined
}
```

## 接口与类型别名

### 接口

接口是 TypeScript 中定义对象类型的强大方式：

```typescript
interface Person {
  name: string;
  age: number;
  readonly id: number; // 只读属性
  email?: string; // 可选属性
  greet(): void; // 方法签名
}

const jerry: Person = {
  name: "Jerry",
  age: 30,
  id: 1,
  greet() {
    console.log(`Hello, my name is ${this.name}`);
  }
};
```

### 接口继承

```typescript
interface Animal {
  name: string;
  move(): void;
}

interface Bird extends Animal {
  fly(): void;
  wingspan: number;
}

const eagle: Bird = {
  name: "Eagle",
  wingspan: 2.1,
  move() {
    console.log("Moving on the ground...");
  },
  fly() {
    console.log("Flying high...");
  }
};
```

### 类型别名

类型别名用于为类型创建新名称：

```typescript
type Point = {
  x: number;
  y: number;
};

type ID = string | number;

type UserCallback = (user: string) => void;
```

### 接口 vs 类型别名

接口和类型别名有许多相似之处，但也有一些区别：

- 接口可以被扩展和实现，类型别名不能
- 接口可以合并声明，类型别名不能
- 类型别名可以为任何类型创建名称，接口只能描述对象结构

```typescript
// 接口声明合并
interface User {
  name: string;
}

interface User {
  age: number;
}

// 等同于
interface User {
  name: string;
  age: number;
}

// 类型别名不能合并
type Animal = {
  name: string;
};

// 错误：重复标识符 'Animal'
// type Animal = {
//   age: number;
// };
```

## 函数类型

### 函数类型声明

```typescript
// 函数声明
function add(x: number, y: number): number {
  return x + y;
}

// 函数表达式
const multiply: (x: number, y: number) => number = function(x, y) {
  return x * y;
};

// 箭头函数
const divide = (x: number, y: number): number => x / y;

// 可选参数
function buildName(firstName: string, lastName?: string): string {
  return lastName ? `${firstName} ${lastName}` : firstName;
}

// 默认参数
function greeting(name: string = "Guest"): string {
  return `Hello, ${name}!`;
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}
```

### 函数重载

```typescript
function process(x: number): number;
function process(x: string): string;
function process(x: number | string): number | string {
  if (typeof x === "number") {
    return x * 2;
  } else {
    return x.repeat(2);
  }
}

const a = process(10); // 返回 20
const b = process("Hi"); // 返回 "HiHi"
```

### 构造函数类型

```typescript
interface ClockConstructor {
  new (hour: number, minute: number): ClockInterface;
}

interface ClockInterface {
  tick(): void;
}

function createClock(
  ctor: ClockConstructor,
  hour: number,
  minute: number
): ClockInterface {
  return new ctor(hour, minute);
}

class DigitalClock implements ClockInterface {
  constructor(h: number, m: number) {}
  tick() {
    console.log("beep beep");
  }
}

const digital = createClock(DigitalClock, 12, 17);
```

### this 参数

```typescript
interface Card {
  suit: string;
  card: number;
}

interface Deck {
  suits: string[];
  cards: number[];
  createCardPicker(this: Deck): () => Card;
}

let deck: Deck = {
  suits: ["hearts", "spades", "clubs", "diamonds"],
  cards: Array(52),
  createCardPicker: function(this: Deck) {
    // 注意：这里的箭头函数会捕获this
    return () => {
      let pickedCard = Math.floor(Math.random() * 52);
      let pickedSuit = Math.floor(pickedCard / 13);

      return {suit: this.suits[pickedSuit], card: pickedCard % 13};
    }
  }
};
```

## 类与面向对象编程

### 类的基本语法

```typescript
class Animal {
  // 属性
  name: string;
  private age: number;
  protected type: string;
  readonly species: string;

  // 构造函数
  constructor(name: string, age: number, type: string, species: string) {
    this.name = name;
    this.age = age;
    this.type = type;
    this.species = species;
  }

  // 方法
  public makeSound(): void {
    console.log("Some generic sound");
  }

  // 获取器
  get animalAge(): number {
    return this.age;
  }

  // 设置器
  set animalAge(age: number) {
    if (age > 0) {
      this.age = age;
    }
  }
}
```

### 继承

```typescript
class Dog extends Animal {
  private breed: string;

  constructor(name: string, age: number, breed: string) {
    super(name, age, "mammal", "Canis lupus");
    this.breed = breed;
  }

  // 重写父类方法
  public makeSound(): void {
    console.log("Woof! Woof!");
  }

  // 子类特有方法
  public fetch(): void {
    console.log(`${this.name} is fetching the ball!`);
  }
}

const myDog = new Dog("Buddy", 3, "Golden Retriever");
myDog.makeSound(); // 输出: Woof! Woof!
myDog.fetch(); // 输出: Buddy is fetching the ball!
```

### 抽象类

抽象类是不能被直接实例化的类，通常用作其他类的基类：

```typescript
abstract class Shape {
  protected color: string;

  constructor(color: string) {
    this.color = color;
  }

  // 抽象方法必须在派生类中实现
  abstract calculateArea(): number;

  // 普通方法可以有实现
  displayColor(): void {
    console.log(`This shape is ${this.color}`);
  }
}

class Circle extends Shape {
  private radius: number;

  constructor(color: string, radius: number) {
    super(color);
    this.radius = radius;
  }

  // 实现抽象方法
  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

const circle = new Circle("red", 5);
circle.displayColor(); // 输出: This shape is red
console.log(circle.calculateArea()); // 输出: 78.53981633974483
```

### 静态成员

静态成员属于类本身，而不是类的实例：

```typescript
class MathUtils {
  // 静态属性
  static readonly PI: number = 3.14159;

  // 静态方法
  static add(x: number, y: number): number {
    return x + y;
  }

  static multiply(x: number, y: number): number {
    return x * y;
  }
}

console.log(MathUtils.PI); // 输出: 3.14159
console.log(MathUtils.add(5, 3)); // 输出: 8
console.log(MathUtils.multiply(4, 2)); // 输出: 8
```

### 访问修饰符

TypeScript 提供了三种访问修饰符：

```typescript
class Employee {
  public name: string; // 可以在任何地方访问
  private salary: number; // 只能在类内部访问
  protected department: string; // 只能在类内部和子类中访问
  readonly id: number; // 只读属性，初始化后不能修改

  constructor(name: string, salary: number, department: string, id: number) {
    this.name = name;
    this.salary = salary;
    this.department = department;
    this.id = id;
  }

  // 私有方法
  private calculateBonus(): number {
    return this.salary * 0.1;
  }

  // 公共方法
  public getYearlyReport(): string {
    return `${this.name} earned ${this.salary} and received a bonus of ${this.calculateBonus()}`;
  }
}

class Manager extends Employee {
  constructor(name: string, salary: number, id: number) {
    super(name, salary, "Management", id);
  }

  public describeDepartment(): string {
    // 可以访问 protected 成员
    return `${this.name} works in ${this.department}`;
  }
}

const employee = new Employee("John", 50000, "IT", 1);
console.log(employee.name); // 可以访问
// console.log(employee.salary); // 错误：私有属性不能在类外部访问
// console.log(employee.department); // 错误：受保护属性不能在类外部访问
```

### 类实现接口

类可以实现一个或多个接口，确保类包含接口定义的所有成员：

```typescript
interface Vehicle {
  brand: string;
  speed: number;
  accelerate(amount: number): void;
  brake(): void;
}

class Car implements Vehicle {
  brand: string;
  speed: number = 0;
  private maxSpeed: number;

  constructor(brand: string, maxSpeed: number) {
    this.brand = brand;
    this.maxSpeed = maxSpeed;
  }

  accelerate(amount: number): void {
    this.speed = Math.min(this.speed + amount, this.maxSpeed);
    console.log(`${this.brand} is now moving at ${this.speed} km/h`);
  }

  brake(): void {
    this.speed = 0;
    console.log(`${this.brand} has stopped`);
  }
}

const myCar = new Car("Toyota", 200);
myCar.accelerate(50); // 输出: Toyota is now moving at 50 km/h
myCar.brake(); // 输出: Toyota has stopped
```

## 高级类型系统

### 联合类型与交叉类型

```typescript
// 联合类型 (Union Types) - 可以是多种类型之一
type ID = string | number;

function printID(id: ID) {
  if (typeof id === "string") {
    console.log(`ID is a string: ${id.toUpperCase()}`);
  } else {
    console.log(`ID is a number: ${id.toFixed(2)}`);
  }
}

printID("abc123"); // 输出: ID is a string: ABC123
printID(12.34); // 输出: ID is a number: 12.34

// 交叉类型 (Intersection Types) - 组合多个类型
type Employee = {
  id: number;
  name: string;
};

type Manager = {
  department: string;
  level: number;
};

type ManagerWithEmployeeInfo = Employee & Manager;

const manager: ManagerWithEmployeeInfo = {
  id: 1,
  name: "John Smith",
  department: "Engineering",
  level: 2
};
```

### 类型守卫

类型守卫是一种在运行时检查类型的表达式，帮助 TypeScript 在特定代码块中缩小类型范围：

```typescript
// typeof 类型守卫
function process(value: string | number) {
  if (typeof value === "string") {
    // 在这个块中，TypeScript 知道 value 是 string 类型
    return value.toUpperCase();
  } else {
    // 在这个块中，TypeScript 知道 value 是 number 类型
    return value.toFixed(2);
  }
}

// instanceof 类型守卫
class Dog {
  bark() {
    return "Woof!";
  }
}

class Cat {
  meow() {
    return "Meow!";
  }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    // 在这个块中，TypeScript 知道 animal 是 Dog 类型
    return animal.bark();
  } else {
    // 在这个块中，TypeScript 知道 animal 是 Cat 类型
    return animal.meow();
  }
}

// 自定义类型守卫
interface Fish {
  swim(): void;
  name: string;
}

interface Bird {
  fly(): void;
  name: string;
}

// 返回类型 "animal is Fish" 是类型谓词
function isFish(animal: Fish | Bird): animal is Fish {
  return (animal as Fish).swim !== undefined;
}

function move(animal: Fish | Bird) {
  if (isFish(animal)) {
    // 在这个块中，TypeScript 知道 animal 是 Fish 类型
    animal.swim();
  } else {
    // 在这个块中，TypeScript 知道 animal 是 Bird 类型
    animal.fly();
  }
}
```

### 映射类型

映射类型允许你基于旧类型创建新类型，通过遍历现有类型的属性来转换它们：

```typescript
// 将所有属性设为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 将所有属性设为可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 将所有属性设为必选
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// 从类型中选择特定属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 示例
interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
}

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type UserBasicInfo = Pick<User, "id" | "name">;

// 使用示例
const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com"
};

const partialUser: PartialUser = { id: 2 }; // 所有属性都是可选的
// const requiredUser: RequiredUser = { id: 3, name: "Jane", email: "jane@example.com" }; // 错误：缺少 address 属性
```

## 泛型

### 泛型基础

泛型允许你创建可重用的组件，这些组件可以处理多种类型而不失去类型安全性：

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

const output1 = identity<string>("hello"); // 显式指定类型参数
const output2 = identity(42); // 类型参数推断为 number

// 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T;
}

const myIdentity: GenericIdentityFn<number> = identity;

// 泛型类
class GenericBox<T> {
  private value: T;

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  getValue(): T {
    return this.value;
  }

  setValue(newValue: T): void {
    this.value = newValue;
  }
}

const stringBox = new GenericBox<string>("Hello");
const numberBox = new GenericBox(123); // 类型推断为 GenericBox<number>
```

### 泛型约束

泛型约束允许你限制泛型类型必须满足特定条件：

```typescript
// 使用接口定义约束
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(`Length of the argument: ${arg.length}`);
  return arg;
}

loggingIdentity("Hello"); // 字符串有 length 属性
loggingIdentity([1, 2, 3]); // 数组有 length 属性
// loggingIdentity(123); // 错误：number 类型没有 length 属性

// 使用类型参数约束另一个类型参数
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Jerry", age: 30 };
const name = getProperty(person, "name"); // 返回 "Jerry"
const age = getProperty(person, "age"); // 返回 30
// const gender = getProperty(person, "gender"); // 错误："gender" 不是 person 的属性
```

### 泛型工具类型

TypeScript 提供了多种内置的泛型工具类型，用于常见的类型转换：

```typescript
// Partial<T> - 将所有属性设为可选
interface User {
  id: number;
  name: string;
  email: string;
}

function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates };
}

const user: User = {
  id: 1,
  name: "Jerry",
  email: "jerry@example.com"
};

const updatedUser = updateUser(user, { name: "Tom" });

// Record<K, T> - 创建具有指定键类型和值类型的对象类型
type UserRoles = "admin" | "user" | "guest";
type RoleAccess = Record<UserRoles, { canRead: boolean; canWrite: boolean }>;

const roleAccess: RoleAccess = {
  admin: { canRead: true, canWrite: true },
  user: { canRead: true, canWrite: false },
  guest: { canRead: true, canWrite: false }
};

// Omit<T, K> - 从类型中排除指定属性
type UserWithoutEmail = Omit<User, "email">;

const userWithoutEmail: UserWithoutEmail = {
  id: 2,
  name: "Tom"
  // email 属性已被排除
};

// ReturnType<T> - 获取函数返回类型
function createUser(name: string, email: string): User {
  return { id: Date.now(), name, email };
}

type CreateUserReturn = ReturnType<typeof createUser>; // 类型为 User
```

## 装饰器

装饰器是一种特殊类型的声明，可以附加到类声明、方法、访问器、属性或参数上。装饰器使用 `@expression` 形式，其中 `expression` 必须计算为一个函数。

::: warning
装饰器是 TypeScript 的实验性特性，需要在 `tsconfig.json` 中启用 `experimentalDecorators` 选项。
```json
{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true
  }
}
```
:::

### 类装饰器

```typescript
// 类装饰器函数
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
  console.log("Class has been sealed.");
}

// 使用装饰器
@sealed
class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
    return "Hello, " + this.greeting;
  }
}

const greeter = new Greeter("world");
console.log(greeter.greet()); // 输出: Hello, world
```

### 方法装饰器

```typescript
// 方法装饰器函数
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // 保存原始方法
  const originalMethod = descriptor.value;

  // 修改方法行为
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with arguments: ${JSON.stringify(args)}`);
    const result = originalMethod.apply(this, args);
    console.log(`Method ${propertyKey} returned: ${result}`);
    return result;
  };

  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(1, 2);
// 输出:
// Calling add with arguments: [1,2]
// Method add returned: 3
```

### 属性装饰器

```typescript
// 属性装饰器函数
function format(formatString: string) {
  return function(target: any, propertyKey: string) {
    let value: string;

    // 属性的 getter
    const getter = function() {
      return value;
    };

    // 属性的 setter
    const setter = function(newValue: string) {
      value = formatString.replace("%s", newValue);
    };

    // 替换属性
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

class Greeter {
  @format("Hello, %s!")
  name: string;
}

const greeter = new Greeter();
greeter.name = "World";
console.log(greeter.name); // 输出: Hello, World!
```

### 参数装饰器

```typescript
// 参数装饰器函数
function required(target: Object, propertyKey: string, parameterIndex: number) {
  // 获取方法的参数类型元数据
  const requiredParams: number[] = Reflect.getOwnMetadata("required", target, propertyKey) || [];
  requiredParams.push(parameterIndex);
  Reflect.defineMetadata("required", requiredParams, target, propertyKey);
}

// 方法装饰器，用于检查必需参数
function validate(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function(...args: any[]) {
    const requiredParams: number[] = Reflect.getOwnMetadata("required", target, propertyName) || [];

    for (const index of requiredParams) {
      if (args[index] === undefined || args[index] === null) {
        throw new Error(`Parameter at index ${index} is required.`);
      }
    }

    return method.apply(this, args);
  };

  return descriptor;
}

class UserService {
  @validate
  createUser(name: string, @required email: string, age?: number) {
    // 创建用户逻辑
    return { name, email, age };
  }
}

const userService = new UserService();
// userService.createUser("John", null); // 错误：Parameter at index 1 is required.
userService.createUser("John", "john@example.com"); // 正常工作
```

## 命名空间与模块

### 命名空间

命名空间是 TypeScript 提供的一种在全局作用域中组织代码的方式，可以有效避免命名冲突：

```typescript
// 定义命名空间
namespace Validation {
  // 命名空间内的接口
  export interface StringValidator {
    isValid(s: string): boolean;
  }

  // 命名空间内的类
  export class LettersOnlyValidator implements StringValidator {
    isValid(s: string): boolean {
      return /^[A-Za-z]+$/.test(s);
    }
  }

  export class ZipCodeValidator implements StringValidator {
    isValid(s: string): boolean {
      return /^\d{5}(-\d{4})?$/.test(s);
    }
  }

  // 命名空间内的常量
  export const numberRegexp = /^[0-9]+$/;
}

// 使用命名空间中的内容
let lettersValidator = new Validation.LettersOnlyValidator();
let zipCodeValidator = new Validation.ZipCodeValidator();

console.log(lettersValidator.isValid("Hello")); // 输出: true
console.log(zipCodeValidator.isValid("12345")); // 输出: true
```

### 嵌套命名空间

命名空间可以嵌套，形成层次结构：

```typescript
namespace Shapes {
  export namespace Polygons {
    export class Triangle {
      public points: number = 3;
    }

    export class Square {
      public points: number = 4;
    }
  }
}

let triangle = new Shapes.Polygons.Triangle();
console.log(triangle.points); // 输出: 3

// 使用导入简化访问
import Polygons = Shapes.Polygons;
let square = new Polygons.Square();
console.log(square.points); // 输出: 4
```

### ES 模块

TypeScript 完全支持 ES 模块语法，这是现代 JavaScript 应用程序中推荐的代码组织方式：

```typescript
// math.ts - 导出模块
export function add(x: number, y: number): number {
  return x + y;
}

export function subtract(x: number, y: number): number {
  return x - y;
}

export const PI = 3.14159;

// 默认导出
export default class Calculator {
  add(x: number, y: number): number {
    return x + y;
  }

  subtract(x: number, y: number): number {
    return x - y;
  }
}
```

```typescript
// app.ts - 导入模块
import Calculator, { add, subtract, PI } from './math';

console.log(add(1, 2)); // 输出: 3
console.log(subtract(5, 3)); // 输出: 2
console.log(PI); // 输出: 3.14159

const calc = new Calculator();
console.log(calc.add(10, 5)); // 输出: 15
```

### 模块解析策略

TypeScript 支持两种模块解析策略：

1. **Node 策略**：模仿 Node.js 的模块解析机制
2. **Classic 策略**：TypeScript 早期使用的简化解析策略

可以在 `tsconfig.json` 中配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    // 或者
    // "moduleResolution": "classic"
  }
}
```

### 动态导入

TypeScript 支持动态导入表达式，允许按需加载模块：

```typescript
// 静态导入（始终加载）
import { add } from './math';

// 动态导入（按需加载）
async function loadMathModule() {
  const math = await import('./math');
  console.log(math.add(1, 2)); // 输出: 3

  // 或者使用解构
  const { subtract } = await import('./math');
  console.log(subtract(5, 3)); // 输出: 2
}

loadMathModule();
```

## TypeScript 高级实践

### 类型声明文件 (.d.ts)

类型声明文件使用 `.d.ts` 扩展名，用于为 JavaScript 库提供类型信息，或者定义全局类型：

```typescript
// types.d.ts
declare namespace App {
  interface User {
    id: number;
    name: string;
    email: string;
  }

  interface Product {
    id: number;
    name: string;
    price: number;
  }
}

// 全局变量声明
declare const API_URL: string;

// 全局函数声明
declare function fetchData<T>(url: string): Promise<T>;
```

### 使用第三方库的类型

大多数流行的 JavaScript 库都有相应的类型声明，可以通过 `@types` 包安装：

```bash
# 安装 lodash 类型声明
npm install --save-dev @types/lodash

# 安装 react 类型声明
npm install --save-dev @types/react
```

### 项目配置 (tsconfig.json)

`tsconfig.json` 文件包含了 TypeScript 项目的编译选项：

```json
{
  "compilerOptions": {
    // 目标 JavaScript 版本
    "target": "es2020",

    // 模块系统
    "module": "esnext",
    "moduleResolution": "node",

    // 严格类型检查选项
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,

    // JSX 支持
    "jsx": "react",

    // 源码映射
    "sourceMap": true,

    // 输出目录
    "outDir": "./dist",

    // 允许从没有默认导出的模块中默认导入
    "allowSyntheticDefaultImports": true,

    // 启用装饰器
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    // 库文件
    "lib": ["dom", "dom.iterable", "esnext"],

    // 跳过库检查以提高性能
    "skipLibCheck": true,

    // 确保文件名大小写一致
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

### 与流行框架集成

#### React 与 TypeScript

```typescript
// 函数组件
import React, { FC, useState, useEffect } from 'react';

interface UserProps {
  name: string;
  age: number;
  onProfileClick: (id: number) => void;
}

const UserProfile: FC<UserProps> = ({ name, age, onProfileClick }) => {
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    document.title = `User: ${name}`;
    return () => {
      document.title = 'React App';
    };
  }, [name]);

  return (
    <div onClick={() => onProfileClick(1)}>
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <button onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Active' : 'Inactive'}
      </button>
    </div>
  );
};

// 类组件
import React, { Component } from 'react';

interface CounterProps {
  initialCount: number;
}

interface CounterState {
  count: number;
}

class Counter extends Component<CounterProps, CounterState> {
  constructor(props: CounterProps) {
    super(props);
    this.state = {
      count: props.initialCount
    };
  }

  increment = (): void => {
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

#### Vue 与 TypeScript

```typescript
// Vue 3 组合式 API
import { defineComponent, ref, computed, onMounted } from 'vue';

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      default: 0
    }
  },

  setup(props, { emit }) {
    // 响应式状态
    const count = ref<number>(0);
    const isActive = ref<boolean>(false);

    // 计算属性
    const displayName = computed<string>(() => {
      return `${props.name} (${props.age})`;
    });

    // 方法
    const increment = (): void => {
      count.value++;
    };

    const toggleActive = (): void => {
      isActive.value = !isActive.value;
      emit('status-change', isActive.value);
    };

    // 生命周期钩子
    onMounted(() => {
      console.log(`Component for ${props.name} mounted`);
    });

    return {
      count,
      isActive,
      displayName,
      increment,
      toggleActive
    };
  }
});
```

```typescript
// Vue 3 使用 <script setup> 和 TypeScript
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// 定义 props 类型
interface Props {
  name: string;
  age?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'status-change', status: boolean): void;
}>();

// 响应式状态
const count = ref<number>(0);
const isActive = ref<boolean>(false);

// 计算属性
const displayName = computed<string>(() => {
  return `${props.name} (${props.age || 'N/A'})`;
});

// 方法
function increment(): void {
  count.value++;
}

function toggleActive(): void {
  isActive.value = !isActive.value;
  emit('status-change', isActive.value);
}

// 生命周期钩子
onMounted(() => {
  console.log(`Component for ${props.name} mounted`);
});
</script>

<template>
  <div>
    <h2>{{ displayName }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <button @click="toggleActive">{{ isActive ? 'Active' : 'Inactive' }}</button>
  </div>
</template>
```

### TypeScript 调试技巧

#### 源码映射

启用源码映射可以在浏览器中直接调试 TypeScript 代码：

```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

#### VS Code 调试配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "启动程序",
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true
    }
  ]
}
```

#### 断言函数

```typescript
function assertIsString(val: any): asserts val is string {
  if (typeof val !== "string") {
    throw new Error(`Expected string, got ${typeof val}`);
  }
}

function processValue(value: unknown) {
  assertIsString(value);
  // 这里 TypeScript 知道 value 是 string 类型
  console.log(value.toUpperCase());
}
```

### 性能优化

#### 类型推断

尽可能利用 TypeScript 的类型推断，避免不必要的类型注解：

```typescript
// 不必要的类型注解
const name: string = "Jerry";

// 更好的写法 - 利用类型推断
const name = "Jerry";
```

#### 避免过度使用 any

```typescript
// 不推荐
function processData(data: any) {
  return data.length * 2;
}

// 推荐
function processData<T extends { length: number }>(data: T) {
  return data.length * 2;
}
```

#### 使用类型别名和接口

```typescript
// 重复的类型定义
function createUser(name: string, age: number, email: string) {
  return { name, age, email };
}

function updateUser(id: number, name: string, age: number, email: string) {
  // 更新用户
}

// 更好的写法 - 使用接口
interface User {
  name: string;
  age: number;
  email: string;
}

function createUser(user: Omit<User, 'id'>): User & { id: number } {
  return { ...user, id: Date.now() };
}

function updateUser(id: number, user: Partial<User>) {
  // 更新用户
}
```

## 高级类型技巧

### 模板字面量类型

```typescript
// 模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // 'onClick'
type HoverEvent = EventName<'hover'>; // 'onHover'

// 路径类型
type Path = 'user' | 'admin' | 'guest';
type ApiPath<T extends string> = `/api/${T}`;
type UserApiPath = ApiPath<Path>; // '/api/user' | '/api/admin' | '/api/guest'

// 字符串操作类型
type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${SnakeCase<U>}`
  : S;

type Example = SnakeCase<'HelloWorld'>; // 'hello_world'

// CSS 属性类型
type CSSProperty = 
  | `margin-${'top' | 'right' | 'bottom' | 'left'}`
  | `padding-${'top' | 'right' | 'bottom' | 'left'}`
  | 'display'
  | 'position';

const styles: Record<CSSProperty, string> = {
  'margin-top': '10px',
  'margin-right': '20px',
  'margin-bottom': '10px',
  'margin-left': '20px',
  'padding-top': '5px',
  'padding-right': '15px',
  'padding-bottom': '5px',
  'padding-left': '15px',
  display: 'block',
  position: 'relative'
};
```

### 递归类型和深度操作

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

interface User {
  name: string;
  profile: {
    age: number;
    address: {
      city: string;
      country: string;
    };
  };
}

type ReadonlyUser = DeepReadonly<User>;
// 所有属性都变为只读，包括嵌套对象

// 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type PartialUser = DeepPartial<User>;
// 所有属性都变为可选，包括嵌套对象

// 路径类型
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: T[K] extends string
        ? [K]
        : [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type UserPaths = PathsToStringProps<User>; // ['name'] | ['profile', 'address', 'city'] | ['profile', 'address', 'country']

// 根据路径获取类型
type GetByPath<T, P extends readonly (string | number)[]> = P extends readonly [infer K, ...infer Rest]
  ? K extends keyof T
    ? Rest extends readonly (string | number)[]
      ? GetByPath<T[K], Rest>
      : never
    : never
  : T;

type CityType = GetByPath<User, ['profile', 'address', 'city']>; // string
```

### 高级条件类型

```typescript
// 函数重载类型
type Overload = {
  (x: string): string;
  (x: number): number;
  (x: boolean): boolean;
};

// 提取函数参数类型
type ExtractParameters<T> = T extends (...args: infer P) => any ? P : never;
type OverloadParams = ExtractParameters<Overload>; // [string] | [number] | [boolean]

// 提取 Promise 类型
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
type PromiseValue = Awaited<Promise<Promise<string>>>; // string

// 数组扁平化类型
type Flatten<T> = T extends readonly (infer U)[]
  ? U extends readonly any[]
    ? Flatten<U>
    : U
  : T;

type FlatArray = Flatten<[1, [2, [3, 4]], 5]>; // 1 | 2 | 3 | 4 | 5

// 联合类型转交叉类型
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type Union = { a: string } | { b: number };
type Intersection = UnionToIntersection<Union>; // { a: string } & { b: number }
```

### 类型编程实用工具

```typescript
// 类型安全的事件发射器
interface EventMap {
  click: { x: number; y: number };
  hover: { element: HTMLElement };
  keypress: { key: string; ctrlKey: boolean };
}

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: {
    [K in keyof T]?: Array<(data: T[K]) => void>;
  } = {};

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}

const emitter = new TypedEventEmitter<EventMap>();
emitter.on('click', (data) => {
  console.log(`Clicked at ${data.x}, ${data.y}`);
});

// 类型安全的状态管理
interface AppState {
  user: {
    id: number;
    name: string;
    email: string;
  };
  settings: {
    theme: 'light' | 'dark';
    language: string;
  };
}

type StateUpdater<T> = {
  [K in keyof T]: (value: T[K]) => void;
};

class TypedStore<T extends Record<string, any>> {
  private state: T;
  private updaters: StateUpdater<T>;

  constructor(initialState: T) {
    this.state = { ...initialState };
    this.updaters = {} as StateUpdater<T>;
    
    // 为每个状态属性创建更新器
    Object.keys(initialState).forEach(key => {
      this.updaters[key as keyof T] = (value: T[keyof T]) => {
        this.state[key as keyof T] = value;
      };
    });
  }

  getState(): Readonly<T> {
    return { ...this.state };
  }

  getUpdaters(): StateUpdater<T> {
    return this.updaters;
  }
}

const store = new TypedStore<AppState>({
  user: { id: 1, name: 'Jerry', email: 'jerry@example.com' },
  settings: { theme: 'light', language: 'en' }
});

const updaters = store.getUpdaters();
updaters.user({ id: 2, name: 'Alice', email: 'alice@example.com' });
```

## 装饰器进阶

### 方法装饰器

```typescript
// 性能监控装饰器
function performance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    console.log(`${propertyKey} 执行时间: ${end - start}ms`);
    return result;
  };
  
  return descriptor;
}

// 缓存装饰器
function cache(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const cacheMap = new Map();
  
  descriptor.value = function (...args: any[]) {
    const key = JSON.stringify(args);
    if (cacheMap.has(key)) {
      return cacheMap.get(key);
    }
    const result = originalMethod.apply(this, args);
    cacheMap.set(key, result);
    return result;
  };
  
  return descriptor;
}

// 重试装饰器
function retry(maxAttempts: number = 3) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          if (attempt === maxAttempts) {
            throw lastError;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    };
    
    return descriptor;
  };
}

class ApiService {
  @performance
  @cache
  fetchUser(id: number): Promise<User> {
    return fetch(`/api/users/${id}`).then(res => res.json());
  }
  
  @retry(3)
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
}
```

### 类装饰器

```typescript
// 单例装饰器
function singleton<T extends new (...args: any[]) => any>(constructor: T) {
  let instance: InstanceType<T>;
  
  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) {
        return instance;
      }
      super(...args);
      instance = this as InstanceType<T>;
    }
  } as T;
}

// 自动绑定装饰器
function autobind<T extends new (...args: any[]) => any>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      
      // 绑定所有方法
      Object.getOwnPropertyNames(constructor.prototype).forEach(key => {
        const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, key);
        if (descriptor && typeof descriptor.value === 'function' && key !== 'constructor') {
          (this as any)[key] = (this as any)[key].bind(this);
        }
      });
    }
  } as T;
}

@singleton
@autobind
class Logger {
  private logs: string[] = [];
  
  log(message: string): void {
    this.logs.push(`${new Date().toISOString()}: ${message}`);
    console.log(message);
  }
  
  getLogs(): string[] {
    return [...this.logs];
  }
}

const logger1 = new Logger();
const logger2 = new Logger();
console.log(logger1 === logger2); // true (单例)

const logMethod = logger1.log;
logMethod('Test message'); // 自动绑定，this 指向正确
```

## 类型安全的设计模式

### 建造者模式

```typescript
interface UserConfig {
  name: string;
  email: string;
  age?: number;
  role?: 'admin' | 'user' | 'guest';
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

class UserBuilder {
  private config: Partial<UserConfig> = {};
  
  setName(name: string): this {
    this.config.name = name;
    return this;
  }
  
  setEmail(email: string): this {
    this.config.email = email;
    return this;
  }
  
  setAge(age: number): this {
    this.config.age = age;
    return this;
  }
  
  setRole(role: UserConfig['role']): this {
    this.config.role = role;
    return this;
  }
  
  setPreferences(preferences: UserConfig['preferences']): this {
    this.config.preferences = preferences;
    return this;
  }
  
  build(): UserConfig {
    if (!this.config.name || !this.config.email) {
      throw new Error('Name and email are required');
    }
    return this.config as UserConfig;
  }
}

const user = new UserBuilder()
  .setName('Jerry')
  .setEmail('jerry@example.com')
  .setAge(30)
  .setRole('admin')
  .setPreferences({ theme: 'dark', notifications: true })
  .build();
```

### 观察者模式

```typescript
interface Observer<T> {
  update(data: T): void;
}

interface Subject<T> {
  attach(observer: Observer<T>): void;
  detach(observer: Observer<T>): void;
  notify(data: T): void;
}

class TypedSubject<T> implements Subject<T> {
  private observers: Set<Observer<T>> = new Set();
  
  attach(observer: Observer<T>): void {
    this.observers.add(observer);
  }
  
  detach(observer: Observer<T>): void {
    this.observers.delete(observer);
  }
  
  notify(data: T): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

interface StockPrice {
  symbol: string;
  price: number;
  timestamp: Date;
}

class StockPriceSubject extends TypedSubject<StockPrice> {
  private currentPrice: StockPrice | null = null;
  
  setPrice(price: StockPrice): void {
    this.currentPrice = price;
    this.notify(price);
  }
  
  getCurrentPrice(): StockPrice | null {
    return this.currentPrice;
  }
}

class StockDisplay implements Observer<StockPrice> {
  constructor(private name: string) {}
  
  update(data: StockPrice): void {
    console.log(`${this.name}: ${data.symbol} - $${data.price}`);
  }
}

const stockSubject = new StockPriceSubject();
const display1 = new StockDisplay('Display 1');
const display2 = new StockDisplay('Display 2');

stockSubject.attach(display1);
stockSubject.attach(display2);

stockSubject.setPrice({
  symbol: 'AAPL',
  price: 150.25,
  timestamp: new Date()
});
```

### 策略模式

```typescript
interface PaymentStrategy {
  pay(amount: number): Promise<boolean>;
}

class CreditCardPayment implements PaymentStrategy {
  constructor(private cardNumber: string, private cvv: string) {}
  
  async pay(amount: number): Promise<boolean> {
    console.log(`Processing credit card payment of $${amount}`);
    // 模拟支付处理
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1000);
    });
  }
}

class PayPalPayment implements PaymentStrategy {
  constructor(private email: string) {}
  
  async pay(amount: number): Promise<boolean> {
    console.log(`Processing PayPal payment of $${amount}`);
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 800);
    });
  }
}

class BankTransferPayment implements PaymentStrategy {
  constructor(private accountNumber: string) {}
  
  async pay(amount: number): Promise<boolean> {
    console.log(`Processing bank transfer of $${amount}`);
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1500);
    });
  }
}

class PaymentProcessor {
  private strategy: PaymentStrategy;
  
  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }
  
  async processPayment(amount: number): Promise<boolean> {
    return this.strategy.pay(amount);
  }
}

// 使用示例
const processor = new PaymentProcessor(
  new CreditCardPayment('1234-5678-9012-3456', '123')
);

processor.processPayment(100);

// 切换策略
processor.setStrategy(new PayPalPayment('user@example.com'));
processor.processPayment(50);
```

## 性能优化和最佳实践

### 类型优化

```typescript
// 使用 const assertions 优化类型推断
const colors = ['red', 'green', 'blue'] as const;
type Color = typeof colors[number]; // 'red' | 'green' | 'blue'

// 使用 satisfies 操作符
interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
  // 额外的属性也会被保留
  debug: true
} satisfies Config;

// 延迟类型计算
type LazyType<T> = T extends any ? { [K in keyof T]: T[K] } : never;

// 避免深度递归
type SafeDeepReadonly<T, Depth extends number = 5> = Depth extends 0
  ? T
  : {
      readonly [P in keyof T]: T[P] extends object
        ? SafeDeepReadonly<T[P], Prev<Depth>>
        : T[P];
    };

type Prev<T extends number> = T extends 5 ? 4
  : T extends 4 ? 3
  : T extends 3 ? 2
  : T extends 2 ? 1
  : T extends 1 ? 0
  : never;
```

### 编译优化

```typescript
// 使用 import type 优化编译
import type { User } from './types';
import { createUser } from './utils';

// 类型断言优化
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// 使用类型谓词避免重复类型检查
function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript 知道这里 value 是 string
    return value.toUpperCase();
  }
  return String(value);
}

// 条件类型优化
type OptimizedConditional<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : unknown;
```

## 总结

TypeScript 是现代前端开发的重要工具，它为 JavaScript 添加了类型系统，提高了代码的可维护性和开发效率。通过掌握 TypeScript 的核心概念和高级特性，可以编写出更加健壮和可扩展的应用程序。

高级 TypeScript 开发需要深入理解类型系统、泛型、条件类型等概念，同时要掌握装饰器、设计模式等高级技巧。通过合理运用这些特性，可以构建出类型安全、性能优良的大型应用程序。

在实际开发中，还需要关注编译性能、类型推断优化、与第三方库的集成等问题，以确保开发体验和最终产品质量。
