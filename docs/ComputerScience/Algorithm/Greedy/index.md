# 贪心算法

贪心算法是一种在每一步选择中都采取在当前状态下最好或最优的选择，从而希望导致结果是最好或最优的算法。贪心算法在有最优子结构的问题中尤为有效。

## 简介

### 核心概念

- **贪心选择性质**：局部最优选择能导致全局最优解
- **最优子结构**：问题的最优解包含子问题的最优解
- **无后效性**：某阶段状态一旦确定，不受后续决策影响
- **活动选择**：在每个决策点选择当前最优解

### 算法特点

- **高效性**：通常具有较低的时间复杂度
- **简洁性**：算法逻辑相对简单
- **局限性**：不是所有问题都适用贪心策略
- **验证性**：需要证明贪心选择的正确性

## 经典贪心算法

### 1. 活动选择问题

选择最多的不重叠活动。

```javascript
// 活动选择问题
class ActivitySelector {
  constructor() {
    this.activities = [];
  }

  // 按结束时间排序的活动选择 - O(n log n)
  selectActivities(activities) {
    if (!activities || activities.length === 0) {
      return [];
    }

    // 按结束时间排序
    const sortedActivities = activities.sort((a, b) => a.end - b.end);
    const selected = [sortedActivities[0]];
    let lastSelected = 0;

    for (let i = 1; i < sortedActivities.length; i++) {
      // 如果当前活动的开始时间不早于上一个选中活动的结束时间
      if (sortedActivities[i].start >= sortedActivities[lastSelected].end) {
        selected.push(sortedActivities[i]);
        lastSelected = i;
      }
    }

    return selected;
  }

  // 递归版本
  selectActivitiesRecursive(activities, i = 0, selected = []) {
    if (i >= activities.length) {
      return selected;
    }

    // 找到下一个兼容的活动
    let j = i + 1;
    while (j < activities.length && activities[j].start < activities[i].end) {
      j++;
    }

    // 选择当前活动
    const withCurrent = this.selectActivitiesRecursive(
      activities, j, [...selected, activities[i]]
    );

    // 不选择当前活动
    const withoutCurrent = this.selectActivitiesRecursive(
      activities, i + 1, selected
    );

    return withCurrent.length > withoutCurrent.length ? withCurrent : withoutCurrent;
  }
}

// 使用示例
const selector = new ActivitySelector();
const activities = [
  { name: 'A1', start: 1, end: 4 },
  { name: 'A2', start: 3, end: 5 },
  { name: 'A3', start: 0, end: 6 },
  { name: 'A4', start: 5, end: 7 },
  { name: 'A5', start: 8, end: 9 },
  { name: 'A6', start: 5, end: 9 }
];

const selected = selector.selectActivities(activities);
console.log('选中的活动:', selected);
```

### 2. 分数背包问题

在背包容量限制下，选择价值密度最高的物品。

```javascript
// 分数背包问题
class FractionalKnapsack {
  constructor() {
    this.items = [];
  }

  // 分数背包求解 - O(n log n)
  solve(items, capacity) {
    if (!items || items.length === 0 || capacity <= 0) {
      return { maxValue: 0, selectedItems: [] };
    }

    // 计算价值密度并排序
    const itemsWithRatio = items.map((item, index) => ({
      ...item,
      index,
      ratio: item.value / item.weight
    })).sort((a, b) => b.ratio - a.ratio);

    let totalValue = 0;
    let remainingCapacity = capacity;
    const selectedItems = [];

    for (const item of itemsWithRatio) {
      if (remainingCapacity >= item.weight) {
        // 完全装入
        selectedItems.push({
          ...item,
          fraction: 1,
          actualWeight: item.weight,
          actualValue: item.value
        });
        totalValue += item.value;
        remainingCapacity -= item.weight;
      } else if (remainingCapacity > 0) {
        // 部分装入
        const fraction = remainingCapacity / item.weight;
        selectedItems.push({
          ...item,
          fraction,
          actualWeight: remainingCapacity,
          actualValue: item.value * fraction
        });
        totalValue += item.value * fraction;
        remainingCapacity = 0;
        break;
      }
    }

    return {
      maxValue: totalValue,
      selectedItems,
      efficiency: totalValue / capacity
    };
  }

  // 贪心策略比较
  compareStrategies(items, capacity) {
    const strategies = {
      byValue: [...items].sort((a, b) => b.value - a.value),
      byWeight: [...items].sort((a, b) => a.weight - b.weight),
      byRatio: [...items].sort((a, b) => (b.value/b.weight) - (a.value/a.weight))
    };

    const results = {};
    for (const [name, sortedItems] of Object.entries(strategies)) {
      results[name] = this.solve(sortedItems, capacity);
    }

    return results;
  }
}

// 使用示例
const knapsack = new FractionalKnapsack();
const items = [
  { name: '物品1', weight: 10, value: 60 },
  { name: '物品2', weight: 20, value: 100 },
  { name: '物品3', weight: 30, value: 120 }
];

const result = knapsack.solve(items, 50);
console.log('最大价值:', result.maxValue);
console.log('选中物品:', result.selectedItems);
```

### 3. 霍夫曼编码

构建最优的前缀编码树。

```javascript
// 霍夫曼编码
class HuffmanNode {
  constructor(char = null, freq = 0, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }

  isLeaf() {
    return this.left === null && this.right === null;
  }
}

class MinHeap {
  constructor() {
    this.heap = [];
  }

  parent(i) { return Math.floor((i - 1) / 2); }
  leftChild(i) { return 2 * i + 1; }
  rightChild(i) { return 2 * i + 2; }

  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  insert(node) {
    this.heap.push(node);
    this.heapifyUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return min;
  }

  heapifyUp(i) {
    while (i > 0 && this.heap[this.parent(i)].freq > this.heap[i].freq) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  heapifyDown(i) {
    while (this.leftChild(i) < this.heap.length) {
      let minChild = this.leftChild(i);
      if (this.rightChild(i) < this.heap.length && 
          this.heap[this.rightChild(i)].freq < this.heap[minChild].freq) {
        minChild = this.rightChild(i);
      }

      if (this.heap[i].freq <= this.heap[minChild].freq) break;

      this.swap(i, minChild);
      i = minChild;
    }
  }

  size() {
    return this.heap.length;
  }
}

class HuffmanCoding {
  constructor() {
    this.codes = new Map();
    this.root = null;
  }

  // 构建霍夫曼树 - O(n log n)
  buildTree(text) {
    // 统计字符频率
    const freqMap = new Map();
    for (const char of text) {
      freqMap.set(char, (freqMap.get(char) || 0) + 1);
    }

    // 创建最小堆
    const heap = new MinHeap();
    for (const [char, freq] of freqMap) {
      heap.insert(new HuffmanNode(char, freq));
    }

    // 构建霍夫曼树
    while (heap.size() > 1) {
      const left = heap.extractMin();
      const right = heap.extractMin();
      const merged = new HuffmanNode(null, left.freq + right.freq, left, right);
      heap.insert(merged);
    }

    this.root = heap.extractMin();
    return this.root;
  }

  // 生成编码表
  generateCodes(node = this.root, code = '', codes = new Map()) {
    if (!node) return codes;

    if (node.isLeaf()) {
      codes.set(node.char, code || '0'); // 单字符情况
      return codes;
    }

    this.generateCodes(node.left, code + '0', codes);
    this.generateCodes(node.right, code + '1', codes);
    
    return codes;
  }

  // 编码文本
  encode(text) {
    this.buildTree(text);
    this.codes = this.generateCodes();
    
    let encoded = '';
    for (const char of text) {
      encoded += this.codes.get(char);
    }
    
    return {
      encoded,
      codes: Object.fromEntries(this.codes),
      compressionRatio: (encoded.length / (text.length * 8)).toFixed(4)
    };
  }

  // 解码文本
  decode(encoded) {
    if (!this.root) throw new Error('No tree built');
    
    let decoded = '';
    let current = this.root;
    
    for (const bit of encoded) {
      current = bit === '0' ? current.left : current.right;
      
      if (current.isLeaf()) {
        decoded += current.char;
        current = this.root;
      }
    }
    
    return decoded;
  }

  // 计算平均编码长度
  getAverageLength(text) {
    const freqMap = new Map();
    for (const char of text) {
      freqMap.set(char, (freqMap.get(char) || 0) + 1);
    }

    let totalLength = 0;
    for (const [char, freq] of freqMap) {
      totalLength += freq * this.codes.get(char).length;
    }

    return totalLength / text.length;
  }
}

// 使用示例
const huffman = new HuffmanCoding();
const text = "this is an example of a huffman tree";
const result = huffman.encode(text);

console.log('原文:', text);
console.log('编码:', result.encoded);
console.log('编码表:', result.codes);
console.log('压缩比:', result.compressionRatio);
console.log('解码:', huffman.decode(result.encoded));
```

### 4. 最小生成树 - Kruskal算法

使用贪心策略构建最小生成树。

```javascript
// 并查集
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // 路径压缩
    }
    return this.parent[x];
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    
    if (rootX !== rootY) {
      // 按秩合并
      if (this.rank[rootX] < this.rank[rootY]) {
        this.parent[rootX] = rootY;
      } else if (this.rank[rootX] > this.rank[rootY]) {
        this.parent[rootY] = rootX;
      } else {
        this.parent[rootY] = rootX;
        this.rank[rootX]++;
      }
      return true;
    }
    return false;
  }
}

// Kruskal最小生成树算法
class KruskalMST {
  constructor() {
    this.edges = [];
    this.vertices = 0;
  }

  // 添加边
  addEdge(u, v, weight) {
    this.edges.push({ u, v, weight });
    this.vertices = Math.max(this.vertices, u + 1, v + 1);
  }

  // 构建最小生成树 - O(E log E)
  findMST() {
    // 按权重排序边
    this.edges.sort((a, b) => a.weight - b.weight);
    
    const uf = new UnionFind(this.vertices);
    const mst = [];
    let totalWeight = 0;
    
    for (const edge of this.edges) {
      if (uf.union(edge.u, edge.v)) {
        mst.push(edge);
        totalWeight += edge.weight;
        
        // MST有 V-1 条边
        if (mst.length === this.vertices - 1) {
          break;
        }
      }
    }
    
    return {
      edges: mst,
      totalWeight,
      isConnected: mst.length === this.vertices - 1
    };
  }

  // 可视化MST
  visualizeMST() {
    const mst = this.findMST();
    console.log('最小生成树边:');
    mst.edges.forEach(edge => {
      console.log(`${edge.u} -- ${edge.v} : ${edge.weight}`);
    });
    console.log('总权重:', mst.totalWeight);
    return mst;
  }
}

// 使用示例
const kruskal = new KruskalMST();
// 添加边 (顶点编号从0开始)
kruskal.addEdge(0, 1, 10);
kruskal.addEdge(0, 2, 6);
kruskal.addEdge(0, 3, 5);
kruskal.addEdge(1, 3, 15);
kruskal.addEdge(2, 3, 4);

const mst = kruskal.visualizeMST();
```

## 贪心算法设计步骤

### 1. 问题分析

```javascript
// 贪心算法设计模板
class GreedyAlgorithm {
  constructor() {
    this.solution = [];
  }

  // 步骤1: 检查是否适用贪心策略
  isGreedyApplicable(problem) {
    // 检查最优子结构
    // 检查贪心选择性质
    return true;
  }

  // 步骤2: 定义贪心选择策略
  greedyChoice(candidates) {
    // 根据问题特点选择局部最优
    return candidates[0];
  }

  // 步骤3: 验证选择的可行性
  isFeasible(choice, currentSolution) {
    // 检查选择是否满足约束条件
    return true;
  }

  // 步骤4: 更新问题状态
  updateProblem(choice, problem) {
    // 移除已选择的元素，更新问题规模
    return problem;
  }

  // 贪心算法主框架
  solve(problem) {
    this.solution = [];
    
    while (!this.isComplete(problem)) {
      const candidates = this.getCandidates(problem);
      const choice = this.greedyChoice(candidates);
      
      if (this.isFeasible(choice, this.solution)) {
        this.solution.push(choice);
        problem = this.updateProblem(choice, problem);
      } else {
        // 移除不可行的候选
        this.removeCandidates(choice, problem);
      }
    }
    
    return this.solution;
  }

  isComplete(problem) {
    // 检查问题是否已解决
    return false;
  }

  getCandidates(problem) {
    // 获取当前可选的候选解
    return [];
  }

  removeCandidates(choice, problem) {
    // 移除不可行的候选
  }
}
```

### 2. 正确性证明

```javascript
// 贪心算法正确性验证工具
class GreedyValidator {
  constructor() {
    this.testCases = [];
  }

  // 验证贪心选择性质
  validateGreedyChoice(algorithm, testCases) {
    for (const testCase of testCases) {
      const greedyResult = algorithm.solve(testCase.input);
      const optimalResult = this.bruteForceOptimal(testCase.input);
      
      if (!this.isEqual(greedyResult, optimalResult)) {
        console.log('贪心选择失败:', testCase);
        return false;
      }
    }
    return true;
  }

  // 验证最优子结构
  validateOptimalSubstructure(problem, solution) {
    // 检查子问题的解是否也是最优的
    return true;
  }

  // 暴力求解最优解（用于验证）
  bruteForceOptimal(input) {
    // 枚举所有可能的解
    return null;
  }

  isEqual(result1, result2) {
    // 比较两个解是否等价
    return JSON.stringify(result1) === JSON.stringify(result2);
  }
}
```

## 算法比较

| 算法 | 时间复杂度 | 空间复杂度 | 适用场景 | 优点 | 缺点 |
|------|-----------|-----------|----------|------|------|
| 活动选择 | O(n log n) | O(1) | 调度问题 | 简单高效 | 需要排序 |
| 分数背包 | O(n log n) | O(1) | 资源分配 | 可获得最优解 | 物品可分割 |
| 霍夫曼编码 | O(n log n) | O(n) | 数据压缩 | 最优前缀码 | 需要频率统计 |
| Kruskal算法 | O(E log E) | O(V) | 网络设计 | 简单实现 | 需要排序边 |
| Dijkstra算法 | O(V²) | O(V) | 最短路径 | 适用有向图 | 不能有负权边 |

## 应用场景

### 调度问题
- 任务调度
- 会议室安排
- 机器分配
- CPU调度

### 图论问题
- 最小生成树
- 最短路径
- 网络流
- 着色问题

### 优化问题
- 背包问题（分数）
- 装箱问题
- 货币找零
- 区间覆盖

### 编码压缩
- 霍夫曼编码
- LZ压缩
- 图像压缩
- 视频编码

---

贪心算法虽然不能保证所有问题都能得到最优解，但在许多实际问题中能够提供高效且足够好的解决方案。关键是要正确识别问题是否具有贪心选择性质和最优子结构。