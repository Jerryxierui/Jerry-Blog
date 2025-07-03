# 动态规划

动态规划（Dynamic Programming，DP）是一种通过把原问题分解为相对简单的子问题的方式求解复杂问题的方法。它适用于有重叠子问题和最优子结构性质的问题。

## 简介

### 核心概念

- **最优子结构**：问题的最优解包含子问题的最优解
- **重叠子问题**：递归算法反复求解相同的子问题
- **状态转移方程**：描述问题状态之间关系的方程
- **边界条件**：递归的终止条件
- **备忘录**：存储已计算结果避免重复计算

### 解题步骤

1. **确定状态**：找到问题的状态表示
2. **状态转移**：找到状态之间的转移关系
3. **初始化**：确定边界条件和初始状态
4. **计算顺序**：确定状态的计算顺序
5. **返回结果**：从计算结果中得到最终答案

## 基础动态规划

### 1. 斐波那契数列

经典的动态规划入门问题。

```javascript
// 递归解法（效率低）
function fibRecursive(n) {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
}

// 记忆化递归
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

// 动态规划（自底向上）
function fibDP(n) {
  if (n <= 1) return n;
  
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}

// 空间优化版本
function fibOptimized(n) {
  if (n <= 1) return n;
  
  let prev2 = 0;
  let prev1 = 1;
  
  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  
  return prev1;
}

console.log(fibDP(10)); // 输出: 55
console.log(fibOptimized(10)); // 输出: 55
```

### 2. 爬楼梯问题

每次可以爬1或2个台阶，求到达n阶的方法数。

```javascript
// 爬楼梯
function climbStairs(n) {
  if (n <= 2) return n;
  
  let prev2 = 1; // dp[i-2]
  let prev1 = 2; // dp[i-1]
  
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  
  return prev1;
}

// 扩展：每次可以爬1、2或3个台阶
function climbStairsThree(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;
  if (n === 3) return 4;
  
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  dp[2] = 2;
  dp[3] = 4;
  
  for (let i = 4; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3];
  }
  
  return dp[n];
}

console.log(climbStairs(5)); // 输出: 8
console.log(climbStairsThree(5)); // 输出: 13
```

## 线性动态规划

### 1. 最大子数组和（Kadane算法）

找到数组中连续子数组的最大和。

```javascript
// 最大子数组和
function maxSubArray(nums) {
  let maxSoFar = nums[0];
  let maxEndingHere = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    // 要么扩展现有子数组，要么开始新的子数组
    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  
  return maxSoFar;
}

// 返回最大子数组的起始和结束位置
function maxSubArrayWithIndices(nums) {
  let maxSoFar = nums[0];
  let maxEndingHere = nums[0];
  let start = 0, end = 0, tempStart = 0;
  
  for (let i = 1; i < nums.length; i++) {
    if (maxEndingHere < 0) {
      maxEndingHere = nums[i];
      tempStart = i;
    } else {
      maxEndingHere += nums[i];
    }
    
    if (maxEndingHere > maxSoFar) {
      maxSoFar = maxEndingHere;
      start = tempStart;
      end = i;
    }
  }
  
  return { maxSum: maxSoFar, start, end };
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 输出: 6
console.log(maxSubArrayWithIndices([-2, 1, -3, 4, -1, 2, 1, -5, 4]));
// 输出: { maxSum: 6, start: 3, end: 6 }
```

### 2. 最长递增子序列（LIS）

找到数组中最长的严格递增子序列。

```javascript
// 最长递增子序列（O(n²)）
function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;
  
  const dp = new Array(nums.length).fill(1);
  let maxLength = 1;
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLength = Math.max(maxLength, dp[i]);
  }
  
  return maxLength;
}

// 最长递增子序列（O(n log n)）- 二分查找优化
function lengthOfLISOptimized(nums) {
  if (nums.length === 0) return 0;
  
  const tails = [];
  
  for (const num of nums) {
    let left = 0, right = tails.length;
    
    // 二分查找插入位置
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    // 如果num比所有元素都大，添加到末尾
    if (left === tails.length) {
      tails.push(num);
    } else {
      // 否则替换找到位置的元素
      tails[left] = num;
    }
  }
  
  return tails.length;
}

// 返回实际的最长递增子序列
function findLIS(nums) {
  if (nums.length === 0) return [];
  
  const dp = new Array(nums.length).fill(1);
  const prev = new Array(nums.length).fill(-1);
  let maxLength = 1;
  let maxIndex = 0;
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        prev[i] = j;
      }
    }
    
    if (dp[i] > maxLength) {
      maxLength = dp[i];
      maxIndex = i;
    }
  }
  
  // 重构序列
  const result = [];
  let current = maxIndex;
  while (current !== -1) {
    result.unshift(nums[current]);
    current = prev[current];
  }
  
  return result;
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 输出: 4
console.log(findLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 输出: [2, 3, 7, 18]
```

## 背包问题

### 1. 0-1背包问题

每个物品只能选择一次的背包问题。

```javascript
// 0-1背包问题
function knapsack01(weights, values, capacity) {
  const n = weights.length;
  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      // 不选择第i个物品
      dp[i][w] = dp[i - 1][w];
      
      // 如果能装下第i个物品，考虑选择它
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        );
      }
    }
  }
  
  return dp[n][capacity];
}

// 空间优化版本
function knapsack01Optimized(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  
  for (let i = 0; i < weights.length; i++) {
    // 从后往前遍历，避免重复使用
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  
  return dp[capacity];
}

// 返回选择的物品
function knapsack01WithItems(weights, values, capacity) {
  const n = weights.length;
  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
  
  // 填充DP表
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        );
      }
    }
  }
  
  // 回溯找到选择的物品
  const selectedItems = [];
  let w = capacity;
  for (let i = n; i > 0 && w > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedItems.push(i - 1);
      w -= weights[i - 1];
    }
  }
  
  return {
    maxValue: dp[n][capacity],
    selectedItems: selectedItems.reverse()
  };
}

const weights = [1, 3, 4, 5];
const values = [1, 4, 5, 7];
const capacity = 7;

console.log(knapsack01(weights, values, capacity)); // 输出: 9
console.log(knapsack01WithItems(weights, values, capacity));
// 输出: { maxValue: 9, selectedItems: [1, 2] }
```

### 2. 完全背包问题

每个物品可以选择无限次的背包问题。

```javascript
// 完全背包问题
function knapsackComplete(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  
  for (let i = 0; i < weights.length; i++) {
    // 从前往后遍历，允许重复使用
    for (let w = weights[i]; w <= capacity; w++) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  
  return dp[capacity];
}

// 硬币找零问题（完全背包的变种）
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// 硬币找零的方案数
function coinChangeWays(coins, amount) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  
  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] += dp[i - coin];
    }
  }
  
  return dp[amount];
}

console.log(coinChange([1, 3, 4], 6)); // 输出: 2 (3+3)
console.log(coinChangeWays([1, 2, 5], 5)); // 输出: 4
```

## 区间动态规划

### 1. 最长回文子序列

找到字符串中最长的回文子序列。

```javascript
// 最长回文子序列
function longestPalindromeSubseq(s) {
  const n = s.length;
  const dp = Array(n).fill().map(() => Array(n).fill(0));
  
  // 单个字符都是回文
  for (let i = 0; i < n; i++) {
    dp[i][i] = 1;
  }
  
  // 按长度递增的顺序填充
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      
      if (s[i] === s[j]) {
        dp[i][j] = dp[i + 1][j - 1] + 2;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[0][n - 1];
}

// 构造最长回文子序列
function buildLongestPalindromeSubseq(s) {
  const n = s.length;
  const dp = Array(n).fill().map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    dp[i][i] = 1;
  }
  
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      
      if (s[i] === s[j]) {
        dp[i][j] = dp[i + 1][j - 1] + 2;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // 重构回文序列
  function buildSequence(i, j) {
    if (i > j) return '';
    if (i === j) return s[i];
    
    if (s[i] === s[j]) {
      return s[i] + buildSequence(i + 1, j - 1) + s[j];
    } else if (dp[i + 1][j] > dp[i][j - 1]) {
      return buildSequence(i + 1, j);
    } else {
      return buildSequence(i, j - 1);
    }
  }
  
  return buildSequence(0, n - 1);
}

console.log(longestPalindromeSubseq("bbbab")); // 输出: 4
console.log(buildLongestPalindromeSubseq("bbbab")); // 输出: "bbbb"
```

### 2. 矩阵链乘法

找到矩阵链乘法的最优括号化方案。

```javascript
// 矩阵链乘法
function matrixChainOrder(dimensions) {
  const n = dimensions.length - 1; // 矩阵数量
  const dp = Array(n).fill().map(() => Array(n).fill(0));
  const split = Array(n).fill().map(() => Array(n).fill(0));
  
  // len是链的长度
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      
      // 尝试所有可能的分割点
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + 
                    dimensions[i] * dimensions[k + 1] * dimensions[j + 1];
        
        if (cost < dp[i][j]) {
          dp[i][j] = cost;
          split[i][j] = k;
        }
      }
    }
  }
  
  return { minCost: dp[0][n - 1], split };
}

// 打印最优括号化方案
function printOptimalParens(split, i, j) {
  if (i === j) {
    return `M${i}`;
  } else {
    const k = split[i][j];
    return `(${printOptimalParens(split, i, k)} × ${printOptimalParens(split, k + 1, j)})`;
  }
}

const dimensions = [1, 2, 3, 4, 5]; // 4个矩阵: 1×2, 2×3, 3×4, 4×5
const result = matrixChainOrder(dimensions);
console.log(result.minCost); // 输出: 38
console.log(printOptimalParens(result.split, 0, 3)); // 输出: "((M0 × M1) × (M2 × M3))"
```

## 树形动态规划

### 1. 二叉树的最大路径和

找到二叉树中任意节点到任意节点的最大路径和。

```javascript
// 二叉树节点定义
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// 二叉树的最大路径和
function maxPathSum(root) {
  let maxSum = -Infinity;
  
  function maxGain(node) {
    if (!node) return 0;
    
    // 递归计算左右子树的最大贡献值
    const leftGain = Math.max(maxGain(node.left), 0);
    const rightGain = Math.max(maxGain(node.right), 0);
    
    // 当前节点的最大路径和
    const currentMax = node.val + leftGain + rightGain;
    
    // 更新全局最大值
    maxSum = Math.max(maxSum, currentMax);
    
    // 返回当前节点能向上贡献的最大值
    return node.val + Math.max(leftGain, rightGain);
  }
  
  maxGain(root);
  return maxSum;
}

// 打家劫舍III（树形DP）
function rob(root) {
  function robHelper(node) {
    if (!node) return [0, 0]; // [不偷当前节点的最大金额, 偷当前节点的最大金额]
    
    const left = robHelper(node.left);
    const right = robHelper(node.right);
    
    // 不偷当前节点：可以选择偷或不偷子节点
    const notRob = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);
    
    // 偷当前节点：不能偷子节点
    const rob = node.val + left[0] + right[0];
    
    return [notRob, rob];
  }
  
  const result = robHelper(root);
  return Math.max(result[0], result[1]);
}
```

## 状态压缩动态规划

### 1. 旅行商问题（TSP）

使用状态压缩解决小规模的旅行商问题。

```javascript
// 旅行商问题（状态压缩DP）
function tsp(graph) {
  const n = graph.length;
  const VISITED_ALL = (1 << n) - 1;
  
  // dp[mask][i] 表示访问了mask中的城市，当前在城市i的最小成本
  const dp = Array(1 << n).fill().map(() => Array(n).fill(Infinity));
  
  // 从城市0开始
  dp[1][0] = 0;
  
  for (let mask = 0; mask <= VISITED_ALL; mask++) {
    for (let u = 0; u < n; u++) {
      if (!(mask & (1 << u))) continue; // u不在当前访问集合中
      
      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue; // v已经访问过
        
        const newMask = mask | (1 << v);
        dp[newMask][v] = Math.min(
          dp[newMask][v],
          dp[mask][u] + graph[u][v]
        );
      }
    }
  }
  
  // 找到回到起点的最小成本
  let minCost = Infinity;
  for (let i = 1; i < n; i++) {
    minCost = Math.min(minCost, dp[VISITED_ALL][i] + graph[i][0]);
  }
  
  return minCost;
}

// 示例图（邻接矩阵）
const graph = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0]
];

console.log(tsp(graph)); // 输出: 80
```

## 动态规划优化技巧

### 1. 滚动数组优化

```javascript
// 最长公共子序列（空间优化）
function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  
  // 只使用两行
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    
    // 交换数组
    [prev, curr] = [curr, prev];
  }
  
  return prev[n];
}
```

### 2. 单调队列优化

```javascript
// 滑动窗口最大值（单调队列）
function maxSlidingWindow(nums, k) {
  const result = [];
  const deque = []; // 存储索引
  
  for (let i = 0; i < nums.length; i++) {
    // 移除超出窗口范围的元素
    while (deque.length && deque[0] <= i - k) {
      deque.shift();
    }
    
    // 维护单调递减队列
    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }
    
    deque.push(i);
    
    // 窗口形成后开始记录结果
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }
  
  return result;
}
```

## 应用场景总结

### 适用问题类型

- **最优化问题**：求最大值、最小值
- **计数问题**：求方案数、路径数
- **存在性问题**：是否存在某种方案
- **构造问题**：构造最优解

### 常见DP类型

- **线性DP**：一维或多维线性状态转移
- **区间DP**：在区间上进行状态转移
- **树形DP**：在树结构上进行状态转移
- **状态压缩DP**：使用位运算压缩状态
- **数位DP**：按数位进行状态转移
- **概率DP**：涉及概率计算的动态规划

---

动态规划是解决复杂优化问题的重要方法，掌握其核心思想和常见模式对于算法设计和问题求解具有重要意义。在实际应用中，需要根据问题的特点选择合适的状态表示和转移方程。