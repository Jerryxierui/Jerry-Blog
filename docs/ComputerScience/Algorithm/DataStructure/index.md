# 数据结构

数据结构是计算机科学中组织和存储数据的方式，它决定了数据的访问效率和操作复杂度。掌握常用的数据结构是编程和算法设计的基础。

## 简介

### 核心特性

- **逻辑结构**：数据元素之间的逻辑关系
- **存储结构**：数据在计算机中的存储方式
- **操作集合**：对数据结构的基本操作
- **时间复杂度**：操作的执行时间
- **空间复杂度**：操作的内存消耗

### 分类方式

- **线性结构**：数组、链表、栈、队列
- **非线性结构**：树、图、堆
- **存储方式**：顺序存储、链式存储

## 线性数据结构

### 1. 数组（Array）

数组是最基本的数据结构，元素在内存中连续存储。

```javascript
// 数组的基本操作
class Array {
  constructor(capacity = 10) {
    this.data = new Array(capacity);
    this.size = 0;
    this.capacity = capacity;
  }

  // 访问元素 - O(1)
  get(index) {
    if (index < 0 || index >= this.size) {
      throw new Error('Index out of bounds');
    }
    return this.data[index];
  }

  // 设置元素 - O(1)
  set(index, value) {
    if (index < 0 || index >= this.size) {
      throw new Error('Index out of bounds');
    }
    this.data[index] = value;
  }

  // 添加元素 - O(n)
  add(index, value) {
    if (index < 0 || index > this.size) {
      throw new Error('Index out of bounds');
    }
    
    if (this.size === this.capacity) {
      this.resize(this.capacity * 2);
    }

    // 移动元素
    for (let i = this.size - 1; i >= index; i--) {
      this.data[i + 1] = this.data[i];
    }
    
    this.data[index] = value;
    this.size++;
  }

  // 删除元素 - O(n)
  remove(index) {
    if (index < 0 || index >= this.size) {
      throw new Error('Index out of bounds');
    }

    const removedValue = this.data[index];
    
    // 移动元素
    for (let i = index + 1; i < this.size; i++) {
      this.data[i - 1] = this.data[i];
    }
    
    this.size--;
    
    // 缩容
    if (this.size === this.capacity / 4 && this.capacity / 2 !== 0) {
      this.resize(this.capacity / 2);
    }
    
    return removedValue;
  }

  // 动态调整容量
  resize(newCapacity) {
    const newData = new Array(newCapacity);
    for (let i = 0; i < this.size; i++) {
      newData[i] = this.data[i];
    }
    this.data = newData;
    this.capacity = newCapacity;
  }

  // 查找元素 - O(n)
  indexOf(value) {
    for (let i = 0; i < this.size; i++) {
      if (this.data[i] === value) {
        return i;
      }
    }
    return -1;
  }

  // 获取大小
  getSize() {
    return this.size;
  }

  // 是否为空
  isEmpty() {
    return this.size === 0;
  }
}
```

### 2. 链表（Linked List）

链表是一种线性数据结构，元素通过指针连接。

```javascript
// 链表节点
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

// 单向链表
class LinkedList {
  constructor() {
    this.dummyHead = new ListNode(0);
    this.size = 0;
  }

  // 获取元素 - O(n)
  get(index) {
    if (index < 0 || index >= this.size) {
      throw new Error('Index out of bounds');
    }

    let current = this.dummyHead.next;
    for (let i = 0; i < index; i++) {
      current = current.next;
    }
    return current.val;
  }

  // 添加元素 - O(n)
  add(index, val) {
    if (index < 0 || index > this.size) {
      throw new Error('Index out of bounds');
    }

    let prev = this.dummyHead;
    for (let i = 0; i < index; i++) {
      prev = prev.next;
    }

    const newNode = new ListNode(val);
    newNode.next = prev.next;
    prev.next = newNode;
    this.size++;
  }

  // 删除元素 - O(n)
  remove(index) {
    if (index < 0 || index >= this.size) {
      throw new Error('Index out of bounds');
    }

    let prev = this.dummyHead;
    for (let i = 0; i < index; i++) {
      prev = prev.next;
    }

    const removedNode = prev.next;
    prev.next = removedNode.next;
    this.size--;
    return removedNode.val;
  }

  // 在头部添加 - O(1)
  addFirst(val) {
    this.add(0, val);
  }

  // 在尾部添加 - O(n)
  addLast(val) {
    this.add(this.size, val);
  }

  // 删除头部 - O(1)
  removeFirst() {
    return this.remove(0);
  }

  // 删除尾部 - O(n)
  removeLast() {
    return this.remove(this.size - 1);
  }

  // 查找元素 - O(n)
  indexOf(val) {
    let current = this.dummyHead.next;
    for (let i = 0; i < this.size; i++) {
      if (current.val === val) {
        return i;
      }
      current = current.next;
    }
    return -1;
  }

  // 获取大小
  getSize() {
    return this.size;
  }

  // 是否为空
  isEmpty() {
    return this.size === 0;
  }

  // 转换为数组
  toArray() {
    const result = [];
    let current = this.dummyHead.next;
    while (current) {
      result.push(current.val);
      current = current.next;
    }
    return result;
  }
}
```

### 3. 栈（Stack）

栈是一种后进先出（LIFO）的数据结构。

```javascript
// 基于数组实现的栈
class ArrayStack {
  constructor() {
    this.data = [];
  }

  // 入栈 - O(1)
  push(item) {
    this.data.push(item);
  }

  // 出栈 - O(1)
  pop() {
    if (this.isEmpty()) {
      throw new Error('Stack is empty');
    }
    return this.data.pop();
  }

  // 查看栈顶 - O(1)
  peek() {
    if (this.isEmpty()) {
      throw new Error('Stack is empty');
    }
    return this.data[this.data.length - 1];
  }

  // 是否为空
  isEmpty() {
    return this.data.length === 0;
  }

  // 获取大小
  getSize() {
    return this.data.length;
  }
}

// 基于链表实现的栈
class LinkedStack {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // 入栈 - O(1)
  push(item) {
    const newNode = new ListNode(item);
    newNode.next = this.head;
    this.head = newNode;
    this.size++;
  }

  // 出栈 - O(1)
  pop() {
    if (this.isEmpty()) {
      throw new Error('Stack is empty');
    }
    
    const removedValue = this.head.val;
    this.head = this.head.next;
    this.size--;
    return removedValue;
  }

  // 查看栈顶 - O(1)
  peek() {
    if (this.isEmpty()) {
      throw new Error('Stack is empty');
    }
    return this.head.val;
  }

  // 是否为空
  isEmpty() {
    return this.size === 0;
  }

  // 获取大小
  getSize() {
    return this.size;
  }
}
```

### 4. 队列（Queue）

队列是一种先进先出（FIFO）的数据结构。

```javascript
// 基于数组实现的循环队列
class ArrayQueue {
  constructor(capacity = 10) {
    this.data = new Array(capacity + 1); // 多一个空间用于区分满和空
    this.front = 0;
    this.tail = 0;
    this.capacity = capacity + 1;
  }

  // 入队 - O(1)
  enqueue(item) {
    if (this.isFull()) {
      throw new Error('Queue is full');
    }
    
    this.data[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
  }

  // 出队 - O(1)
  dequeue() {
    if (this.isEmpty()) {
      throw new Error('Queue is empty');
    }
    
    const removedValue = this.data[this.front];
    this.data[this.front] = null;
    this.front = (this.front + 1) % this.capacity;
    return removedValue;
  }

  // 查看队首 - O(1)
  getFront() {
    if (this.isEmpty()) {
      throw new Error('Queue is empty');
    }
    return this.data[this.front];
  }

  // 是否为空
  isEmpty() {
    return this.front === this.tail;
  }

  // 是否已满
  isFull() {
    return (this.tail + 1) % this.capacity === this.front;
  }

  // 获取大小
  getSize() {
    return (this.tail - this.front + this.capacity) % this.capacity;
  }
}

// 基于链表实现的队列
class LinkedQueue {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // 入队 - O(1)
  enqueue(item) {
    const newNode = new ListNode(item);
    
    if (this.tail === null) {
      this.head = this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    
    this.size++;
  }

  // 出队 - O(1)
  dequeue() {
    if (this.isEmpty()) {
      throw new Error('Queue is empty');
    }
    
    const removedValue = this.head.val;
    this.head = this.head.next;
    
    if (this.head === null) {
      this.tail = null;
    }
    
    this.size--;
    return removedValue;
  }

  // 查看队首 - O(1)
  getFront() {
    if (this.isEmpty()) {
      throw new Error('Queue is empty');
    }
    return this.head.val;
  }

  // 是否为空
  isEmpty() {
    return this.size === 0;
  }

  // 获取大小
  getSize() {
    return this.size;
  }
}
```

## 非线性数据结构

### 1. 二叉树（Binary Tree）

二叉树是每个节点最多有两个子节点的树结构。

```javascript
// 二叉树节点
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// 二叉搜索树
class BST {
  constructor() {
    this.root = null;
    this.size = 0;
  }

  // 插入节点 - O(log n) 平均，O(n) 最坏
  insert(val) {
    this.root = this.insertNode(this.root, val);
  }

  insertNode(node, val) {
    if (node === null) {
      this.size++;
      return new TreeNode(val);
    }

    if (val < node.val) {
      node.left = this.insertNode(node.left, val);
    } else if (val > node.val) {
      node.right = this.insertNode(node.right, val);
    }
    // 相等时不插入重复值
    
    return node;
  }

  // 查找节点 - O(log n) 平均，O(n) 最坏
  search(val) {
    return this.searchNode(this.root, val);
  }

  searchNode(node, val) {
    if (node === null || node.val === val) {
      return node;
    }

    if (val < node.val) {
      return this.searchNode(node.left, val);
    } else {
      return this.searchNode(node.right, val);
    }
  }

  // 删除节点 - O(log n) 平均，O(n) 最坏
  remove(val) {
    this.root = this.removeNode(this.root, val);
  }

  removeNode(node, val) {
    if (node === null) {
      return null;
    }

    if (val < node.val) {
      node.left = this.removeNode(node.left, val);
      return node;
    } else if (val > node.val) {
      node.right = this.removeNode(node.right, val);
      return node;
    } else {
      // 找到要删除的节点
      this.size--;
      
      // 情况1：叶子节点
      if (node.left === null && node.right === null) {
        return null;
      }
      
      // 情况2：只有一个子节点
      if (node.left === null) {
        return node.right;
      }
      if (node.right === null) {
        return node.left;
      }
      
      // 情况3：有两个子节点
      // 找到右子树的最小节点（后继节点）
      const successor = this.findMin(node.right);
      node.val = successor.val;
      node.right = this.removeNode(node.right, successor.val);
      this.size++; // 补偿上面的减法
      return node;
    }
  }

  // 找到最小值节点
  findMin(node) {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  // 中序遍历 - O(n)
  inorderTraversal() {
    const result = [];
    this.inorder(this.root, result);
    return result;
  }

  inorder(node, result) {
    if (node !== null) {
      this.inorder(node.left, result);
      result.push(node.val);
      this.inorder(node.right, result);
    }
  }

  // 前序遍历 - O(n)
  preorderTraversal() {
    const result = [];
    this.preorder(this.root, result);
    return result;
  }

  preorder(node, result) {
    if (node !== null) {
      result.push(node.val);
      this.preorder(node.left, result);
      this.preorder(node.right, result);
    }
  }

  // 后序遍历 - O(n)
  postorderTraversal() {
    const result = [];
    this.postorder(this.root, result);
    return result;
  }

  postorder(node, result) {
    if (node !== null) {
      this.postorder(node.left, result);
      this.postorder(node.right, result);
      result.push(node.val);
    }
  }

  // 层序遍历 - O(n)
  levelOrder() {
    if (this.root === null) return [];
    
    const result = [];
    const queue = [this.root];
    
    while (queue.length > 0) {
      const node = queue.shift();
      result.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    return result;
  }

  // 获取大小
  getSize() {
    return this.size;
  }

  // 是否为空
  isEmpty() {
    return this.size === 0;
  }
}
```

### 2. 堆（Heap）

堆是一种特殊的完全二叉树，常用于实现优先队列。

```javascript
// 最大堆
class MaxHeap {
  constructor() {
    this.data = [];
  }

  // 获取父节点索引
  parent(index) {
    if (index === 0) {
      throw new Error('Index 0 has no parent');
    }
    return Math.floor((index - 1) / 2);
  }

  // 获取左子节点索引
  leftChild(index) {
    return index * 2 + 1;
  }

  // 获取右子节点索引
  rightChild(index) {
    return index * 2 + 2;
  }

  // 交换元素
  swap(i, j) {
    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
  }

  // 上浮操作
  siftUp(index) {
    while (index > 0 && this.data[this.parent(index)] < this.data[index]) {
      this.swap(index, this.parent(index));
      index = this.parent(index);
    }
  }

  // 下沉操作
  siftDown(index) {
    while (this.leftChild(index) < this.data.length) {
      let j = this.leftChild(index);
      
      // 找到左右子节点中较大的一个
      if (j + 1 < this.data.length && this.data[j + 1] > this.data[j]) {
        j = this.rightChild(index);
      }
      
      if (this.data[index] >= this.data[j]) {
        break;
      }
      
      this.swap(index, j);
      index = j;
    }
  }

  // 添加元素 - O(log n)
  add(item) {
    this.data.push(item);
    this.siftUp(this.data.length - 1);
  }

  // 查看最大元素 - O(1)
  findMax() {
    if (this.data.length === 0) {
      throw new Error('Heap is empty');
    }
    return this.data[0];
  }

  // 取出最大元素 - O(log n)
  extractMax() {
    const ret = this.findMax();
    
    this.swap(0, this.data.length - 1);
    this.data.pop();
    
    if (this.data.length > 0) {
      this.siftDown(0);
    }
    
    return ret;
  }

  // 替换堆顶元素 - O(log n)
  replace(item) {
    const ret = this.findMax();
    this.data[0] = item;
    this.siftDown(0);
    return ret;
  }

  // 堆化操作 - O(n)
  heapify(arr) {
    this.data = [...arr];
    
    // 从最后一个非叶子节点开始下沉
    for (let i = this.parent(arr.length - 1); i >= 0; i--) {
      this.siftDown(i);
    }
  }

  // 获取大小
  size() {
    return this.data.length;
  }

  // 是否为空
  isEmpty() {
    return this.data.length === 0;
  }
}
```

## 时间复杂度对比

| 数据结构 | 访问 | 查找 | 插入 | 删除 | 空间复杂度 |
|---------|------|------|------|------|----------|
| 数组 | O(1) | O(n) | O(n) | O(n) | O(n) |
| 链表 | O(n) | O(n) | O(1) | O(1) | O(n) |
| 栈 | O(n) | O(n) | O(1) | O(1) | O(n) |
| 队列 | O(n) | O(n) | O(1) | O(1) | O(n) |
| 二叉搜索树 | O(log n) | O(log n) | O(log n) | O(log n) | O(n) |
| 堆 | O(1) | O(n) | O(log n) | O(log n) | O(n) |

## 应用场景

### 数组
- 需要随机访问元素
- 数据量相对固定
- 缓存友好的顺序访问

### 链表
- 频繁插入和删除操作
- 数据量动态变化
- 不需要随机访问

### 栈
- 函数调用管理
- 表达式求值
- 括号匹配
- 深度优先搜索

### 队列
- 任务调度
- 广度优先搜索
- 缓冲区管理
- 生产者消费者模式

### 二叉搜索树
- 动态查找表
- 范围查询
- 有序数据维护

### 堆
- 优先队列
- 堆排序
- Top K 问题
- 任务调度

---

数据结构是算法的基础，选择合适的数据结构能够显著提高程序的效率。在实际开发中，需要根据具体的应用场景和性能要求来选择最适合的数据结构。