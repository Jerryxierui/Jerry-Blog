# 搜索算法

搜索算法是计算机科学中用于在数据结构中查找特定元素的算法。根据数据的组织方式和搜索策略的不同，搜索算法可以分为多种类型，每种都有其特定的应用场景和性能特点。

## 简介

### 核心概念

- **查找表**：存储数据的结构
- **关键字**：用于标识数据的唯一标识符
- **比较次数**：算法执行过程中的比较操作数量
- **时间复杂度**：算法执行时间与数据规模的关系
- **空间复杂度**：算法所需的额外存储空间

### 分类方式

- **静态查找**：查找过程中不改变数据结构
- **动态查找**：查找过程中可能插入或删除元素
- **内部查找**：数据全部在内存中
- **外部查找**：数据存储在外存中

## 基础搜索算法

### 1. 线性搜索（Linear Search）

最简单的搜索算法，逐个检查每个元素。

```javascript
// 线性搜索
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // 返回索引
    }
  }
  return -1; // 未找到
}

// 线性搜索（查找所有匹配项）
function linearSearchAll(arr, target) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      result.push(i);
    }
  }
  return result;
}

// 哨兵线性搜索（减少边界检查）
function sentinelLinearSearch(arr, target) {
  const n = arr.length;
  const last = arr[n - 1];
  
  // 设置哨兵
  arr[n - 1] = target;
  
  let i = 0;
  while (arr[i] !== target) {
    i++;
  }
  
  // 恢复原值
  arr[n - 1] = last;
  
  // 检查是否在最后一个位置找到或者是哨兵
  if (i < n - 1 || arr[n - 1] === target) {
    return i;
  }
  
  return -1;
}

console.log(linearSearch([1, 3, 5, 7, 9], 5)); // 输出: 2
console.log(linearSearchAll([1, 3, 5, 3, 9], 3)); // 输出: [1, 3]
```

### 2. 二分搜索（Binary Search）

在有序数组中进行搜索的高效算法。

```javascript
// 二分搜索（迭代版本）
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// 二分搜索（递归版本）
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) {
    return -1;
  }
  
  const mid = Math.floor((left + right) / 2);
  
  if (arr[mid] === target) {
    return mid;
  } else if (arr[mid] < target) {
    return binarySearchRecursive(arr, target, mid + 1, right);
  } else {
    return binarySearchRecursive(arr, target, left, mid - 1);
  }
}

// 查找第一个出现的位置
function binarySearchFirst(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      result = mid;
      right = mid - 1; // 继续在左半部分查找
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return result;
}

// 查找最后一个出现的位置
function binarySearchLast(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      result = mid;
      left = mid + 1; // 继续在右半部分查找
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return result;
}

console.log(binarySearch([1, 3, 5, 7, 9], 5)); // 输出: 2
console.log(binarySearchFirst([1, 3, 3, 3, 9], 3)); // 输出: 1
console.log(binarySearchLast([1, 3, 3, 3, 9], 3)); // 输出: 3
```

## 高级搜索算法

### 1. 插值搜索（Interpolation Search）

基于数据分布的改进二分搜索算法。

```javascript
// 插值搜索
function interpolationSearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right && target >= arr[left] && target <= arr[right]) {
    // 如果数组只有一个元素
    if (left === right) {
      return arr[left] === target ? left : -1;
    }
    
    // 计算插值位置
    const pos = left + Math.floor(
      ((target - arr[left]) / (arr[right] - arr[left])) * (right - left)
    );
    
    if (arr[pos] === target) {
      return pos;
    } else if (arr[pos] < target) {
      left = pos + 1;
    } else {
      right = pos - 1;
    }
  }
  
  return -1;
}

console.log(interpolationSearch([1, 2, 3, 4, 5, 6, 7, 8, 9], 6)); // 输出: 5
```

### 2. 指数搜索（Exponential Search）

适用于无界或大型数组的搜索算法。

```javascript
// 指数搜索
function exponentialSearch(arr, target) {
  const n = arr.length;
  
  // 如果目标在第一个位置
  if (arr[0] === target) {
    return 0;
  }
  
  // 找到范围
  let bound = 1;
  while (bound < n && arr[bound] <= target) {
    bound *= 2;
  }
  
  // 在找到的范围内进行二分搜索
  return binarySearchRange(
    arr, 
    target, 
    Math.floor(bound / 2), 
    Math.min(bound, n - 1)
  );
}

function binarySearchRange(arr, target, left, right) {
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

console.log(exponentialSearch([1, 2, 3, 4, 5, 6, 7, 8, 9], 6)); // 输出: 5
```

### 3. 三元搜索（Ternary Search）

将搜索空间分为三部分的搜索算法。

```javascript
// 三元搜索
function ternarySearch(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) {
    return -1;
  }
  
  // 计算两个分割点
  const mid1 = left + Math.floor((right - left) / 3);
  const mid2 = right - Math.floor((right - left) / 3);
  
  if (arr[mid1] === target) {
    return mid1;
  }
  if (arr[mid2] === target) {
    return mid2;
  }
  
  // 递归搜索相应的区间
  if (target < arr[mid1]) {
    return ternarySearch(arr, target, left, mid1 - 1);
  } else if (target > arr[mid2]) {
    return ternarySearch(arr, target, mid2 + 1, right);
  } else {
    return ternarySearch(arr, target, mid1 + 1, mid2 - 1);
  }
}

console.log(ternarySearch([1, 2, 3, 4, 5, 6, 7, 8, 9], 6)); // 输出: 5
```

## 字符串搜索算法

### 1. KMP算法（Knuth-Morris-Pratt）

高效的字符串模式匹配算法。

```javascript
// KMP算法
function kmpSearch(text, pattern) {
  const n = text.length;
  const m = pattern.length;
  
  if (m === 0) return [];
  
  // 构建部分匹配表（失效函数）
  const lps = buildLPS(pattern);
  
  const result = [];
  let i = 0; // text的索引
  let j = 0; // pattern的索引
  
  while (i < n) {
    if (text[i] === pattern[j]) {
      i++;
      j++;
    }
    
    if (j === m) {
      result.push(i - j);
      j = lps[j - 1];
    } else if (i < n && text[i] !== pattern[j]) {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }
  
  return result;
}

// 构建最长前缀后缀数组
function buildLPS(pattern) {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  let len = 0;
  let i = 1;
  
  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }
  
  return lps;
}

console.log(kmpSearch("ABABDABACDABABCABCABCABCABC", "ABABCABCABCABC"));
// 输出: [15]
```

### 2. Boyer-Moore算法

从右到左匹配的字符串搜索算法。

```javascript
// Boyer-Moore算法（简化版）
function boyerMooreSearch(text, pattern) {
  const n = text.length;
  const m = pattern.length;
  
  if (m === 0) return [];
  
  // 构建坏字符表
  const badChar = buildBadCharTable(pattern);
  
  const result = [];
  let shift = 0;
  
  while (shift <= n - m) {
    let j = m - 1;
    
    // 从右到左匹配
    while (j >= 0 && pattern[j] === text[shift + j]) {
      j--;
    }
    
    if (j < 0) {
      // 找到匹配
      result.push(shift);
      shift += (shift + m < n) ? m - badChar[text.charCodeAt(shift + m)] || m : 1;
    } else {
      // 根据坏字符规则移动
      const badCharShift = j - (badChar[text.charCodeAt(shift + j)] || -1);
      shift += Math.max(1, badCharShift);
    }
  }
  
  return result;
}

// 构建坏字符表
function buildBadCharTable(pattern) {
  const table = {};
  const m = pattern.length;
  
  for (let i = 0; i < m; i++) {
    table[pattern.charCodeAt(i)] = i;
  }
  
  return table;
}

console.log(boyerMooreSearch("ABAAABCDABABCABCABCABC", "ABCAB"));
// 输出: [10, 15]
```

## 搜索算法比较

### 时间复杂度对比

| 算法 | 最好情况 | 平均情况 | 最坏情况 | 空间复杂度 | 适用场景 |
|------|----------|----------|----------|------------|----------|
| 线性搜索 | O(1) | O(n) | O(n) | O(1) | 无序数据 |
| 二分搜索 | O(1) | O(log n) | O(log n) | O(1) | 有序数据 |
| 插值搜索 | O(1) | O(log log n) | O(n) | O(1) | 均匀分布的有序数据 |
| 指数搜索 | O(1) | O(log n) | O(log n) | O(1) | 无界或大型数组 |
| 三元搜索 | O(1) | O(log₃ n) | O(log₃ n) | O(log n) | 有序数据 |
| KMP | O(n) | O(n + m) | O(n + m) | O(m) | 字符串匹配 |
| Boyer-Moore | O(n/m) | O(n + m) | O(nm) | O(m) | 字符串匹配 |

## 应用场景

### 数据库索引

```javascript
// B树索引模拟
class BTreeNode {
  constructor(isLeaf = false) {
    this.keys = [];
    this.children = [];
    this.isLeaf = isLeaf;
  }
}

class BTree {
  constructor(degree = 3) {
    this.root = new BTreeNode(true);
    this.degree = degree;
  }
  
  search(key, node = this.root) {
    let i = 0;
    
    // 找到第一个大于等于key的位置
    while (i < node.keys.length && key > node.keys[i]) {
      i++;
    }
    
    // 如果找到了key
    if (i < node.keys.length && key === node.keys[i]) {
      return { node, index: i };
    }
    
    // 如果是叶子节点，没找到
    if (node.isLeaf) {
      return null;
    }
    
    // 递归搜索子节点
    return this.search(key, node.children[i]);
  }
}
```

### 搜索引擎

```javascript
// 倒排索引
class InvertedIndex {
  constructor() {
    this.index = new Map();
  }
  
  addDocument(docId, content) {
    const words = content.toLowerCase().split(/\W+/);
    
    words.forEach(word => {
      if (!this.index.has(word)) {
        this.index.set(word, new Set());
      }
      this.index.get(word).add(docId);
    });
  }
  
  search(query) {
    const words = query.toLowerCase().split(/\W+/);
    
    if (words.length === 0) return new Set();
    
    // 获取第一个词的文档集合
    let result = this.index.get(words[0]) || new Set();
    
    // 与其他词的文档集合求交集
    for (let i = 1; i < words.length; i++) {
      const wordDocs = this.index.get(words[i]) || new Set();
      result = new Set([...result].filter(x => wordDocs.has(x)));
    }
    
    return result;
  }
}

// 使用示例
const index = new InvertedIndex();
index.addDocument(1, "JavaScript is a programming language");
index.addDocument(2, "Python is also a programming language");
index.addDocument(3, "JavaScript and Python are popular");

console.log(index.search("JavaScript programming")); // 输出: Set {1}
```

### 最佳实践

```javascript
// 自适应搜索策略
class AdaptiveSearch {
  constructor() {
    this.searchHistory = new Map();
  }
  
  search(arr, target) {
    const key = this.getArrayKey(arr);
    const history = this.searchHistory.get(key) || { 
      totalSearches: 0, 
      linearTime: 0, 
      binaryTime: 0 
    };
    
    // 根据历史性能选择算法
    if (history.totalSearches < 10) {
      // 初期使用二分搜索
      return this.timedBinarySearch(arr, target, history);
    } else {
      // 根据历史性能选择最优算法
      const avgLinearTime = history.linearTime / history.totalSearches;
      const avgBinaryTime = history.binaryTime / history.totalSearches;
      
      if (avgLinearTime < avgBinaryTime) {
        return this.timedLinearSearch(arr, target, history);
      } else {
        return this.timedBinarySearch(arr, target, history);
      }
    }
  }
  
  timedLinearSearch(arr, target, history) {
    const start = performance.now();
    const result = linearSearch(arr, target);
    const end = performance.now();
    
    history.linearTime += (end - start);
    history.totalSearches++;
    
    return result;
  }
  
  timedBinarySearch(arr, target, history) {
    const start = performance.now();
    const result = binarySearch(arr, target);
    const end = performance.now();
    
    history.binaryTime += (end - start);
    history.totalSearches++;
    
    return result;
  }
  
  getArrayKey(arr) {
    return `${arr.length}_${arr[0]}_${arr[arr.length - 1]}`;
  }
}
```

---

搜索算法是计算机科学的基础，选择合适的搜索算法能够显著提高程序的性能。在实际应用中，需要根据数据的特点、搜索频率和性能要求来选择最适合的搜索策略。