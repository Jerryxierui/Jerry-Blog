# 排序算法

排序算法是计算机科学中最基础和重要的算法之一，用于将一组数据按照特定的顺序（通常是升序或降序）进行排列。掌握各种排序算法的原理、实现和特性对于算法学习至关重要。

## 简介

### 核心概念

- **稳定性**：相等元素的相对位置是否保持不变
- **原地排序**：是否需要额外的存储空间
- **时间复杂度**：算法执行时间与数据规模的关系
- **空间复杂度**：算法所需的额外存储空间
- **适应性**：对于已部分排序的数据的处理能力

### 分类方式

- **比较排序**：基于元素间比较的排序算法
- **非比较排序**：不基于比较的排序算法
- **内部排序**：数据全部在内存中的排序
- **外部排序**：数据量大，需要外存辅助的排序

## 简单排序算法

### 1. 冒泡排序（Bubble Sort）

通过重复遍历数组，比较相邻元素并交换位置。

```javascript
// 基础冒泡排序
function bubbleSort(arr) {
  const n = arr.length;
  const result = [...arr]; // 创建副本
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (result[j] > result[j + 1]) {
        // 交换元素
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  
  return result;
}

// 优化版冒泡排序（提前终止）
function bubbleSortOptimized(arr) {
  const n = arr.length;
  const result = [...arr];
  
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    
    for (let j = 0; j < n - 1 - i; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }
    
    // 如果没有发生交换，说明已经有序
    if (!swapped) {
      break;
    }
  }
  
  return result;
}

// 测试
console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));
// 输出: [11, 12, 22, 25, 34, 64, 90]
```

**特性分析：**
- 时间复杂度：O(n²) 平均和最坏，O(n) 最好
- 空间复杂度：O(1)
- 稳定性：稳定
- 原地排序：是

### 2. 选择排序（Selection Sort）

每次从未排序部分选择最小元素，放到已排序部分的末尾。

```javascript
function selectionSort(arr) {
  const n = arr.length;
  const result = [...arr];
  
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    
    // 找到未排序部分的最小元素
    for (let j = i + 1; j < n; j++) {
      if (result[j] < result[minIndex]) {
        minIndex = j;
      }
    }
    
    // 交换最小元素到正确位置
    if (minIndex !== i) {
      [result[i], result[minIndex]] = [result[minIndex], result[i]];
    }
  }
  
  return result;
}

// 双向选择排序（同时选择最大和最小值）
function selectionSortBidirectional(arr) {
  const result = [...arr];
  let left = 0;
  let right = result.length - 1;
  
  while (left < right) {
    let minIndex = left;
    let maxIndex = right;
    
    // 同时找最小和最大值
    for (let i = left; i <= right; i++) {
      if (result[i] < result[minIndex]) {
        minIndex = i;
      }
      if (result[i] > result[maxIndex]) {
        maxIndex = i;
      }
    }
    
    // 将最小值放到左边
    [result[left], result[minIndex]] = [result[minIndex], result[left]];
    
    // 如果最大值在left位置，需要更新maxIndex
    if (maxIndex === left) {
      maxIndex = minIndex;
    }
    
    // 将最大值放到右边
    [result[right], result[maxIndex]] = [result[maxIndex], result[right]];
    
    left++;
    right--;
  }
  
  return result;
}

console.log(selectionSort([64, 34, 25, 12, 22, 11, 90]));
// 输出: [11, 12, 22, 25, 34, 64, 90]
```

**特性分析：**
- 时间复杂度：O(n²) 所有情况
- 空间复杂度：O(1)
- 稳定性：不稳定
- 原地排序：是

### 3. 插入排序（Insertion Sort）

将数组分为已排序和未排序两部分，逐个将未排序元素插入到已排序部分的正确位置。

```javascript
function insertionSort(arr) {
  const result = [...arr];
  
  for (let i = 1; i < result.length; i++) {
    const current = result[i];
    let j = i - 1;
    
    // 将current插入到正确位置
    while (j >= 0 && result[j] > current) {
      result[j + 1] = result[j];
      j--;
    }
    
    result[j + 1] = current;
  }
  
  return result;
}

// 二分插入排序（优化查找位置）
function binaryInsertionSort(arr) {
  const result = [...arr];
  
  for (let i = 1; i < result.length; i++) {
    const current = result[i];
    
    // 二分查找插入位置
    let left = 0;
    let right = i;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (result[mid] > current) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }
    
    // 移动元素
    for (let j = i; j > left; j--) {
      result[j] = result[j - 1];
    }
    
    result[left] = current;
  }
  
  return result;
}

console.log(insertionSort([64, 34, 25, 12, 22, 11, 90]));
// 输出: [11, 12, 22, 25, 34, 64, 90]
```

**特性分析：**
- 时间复杂度：O(n²) 平均和最坏，O(n) 最好
- 空间复杂度：O(1)
- 稳定性：稳定
- 原地排序：是

## 高效排序算法

### 1. 快速排序（Quick Sort）

采用分治策略，选择一个基准元素，将数组分为小于和大于基准的两部分。

```javascript
function quickSort(arr) {
  if (arr.length <= 1) {
    return [...arr];
  }
  
  return quickSortHelper([...arr], 0, arr.length - 1);
}

function quickSortHelper(arr, low, high) {
  if (low < high) {
    // 分区操作
    const pivotIndex = partition(arr, low, high);
    
    // 递归排序左右两部分
    quickSortHelper(arr, low, pivotIndex - 1);
    quickSortHelper(arr, pivotIndex + 1, high);
  }
  
  return arr;
}

// 分区函数（Lomuto分区方案）
function partition(arr, low, high) {
  const pivot = arr[high]; // 选择最后一个元素作为基准
  let i = low - 1; // 小于基准的元素的索引
  
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

// Hoare分区方案
function partitionHoare(arr, low, high) {
  const pivot = arr[low];
  let i = low - 1;
  let j = high + 1;
  
  while (true) {
    do {
      i++;
    } while (arr[i] < pivot);
    
    do {
      j--;
    } while (arr[j] > pivot);
    
    if (i >= j) {
      return j;
    }
    
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// 三路快排（处理重复元素）
function quickSort3Way(arr) {
  if (arr.length <= 1) {
    return [...arr];
  }
  
  return quickSort3WayHelper([...arr], 0, arr.length - 1);
}

function quickSort3WayHelper(arr, low, high) {
  if (low >= high) {
    return arr;
  }
  
  const pivot = arr[low];
  let lt = low; // arr[low...lt-1] < pivot
  let gt = high; // arr[gt+1...high] > pivot
  let i = low + 1; // arr[lt...i-1] == pivot
  
  while (i <= gt) {
    if (arr[i] < pivot) {
      [arr[lt], arr[i]] = [arr[i], arr[lt]];
      lt++;
      i++;
    } else if (arr[i] > pivot) {
      [arr[i], arr[gt]] = [arr[gt], arr[i]];
      gt--;
    } else {
      i++;
    }
  }
  
  quickSort3WayHelper(arr, low, lt - 1);
  quickSort3WayHelper(arr, gt + 1, high);
  
  return arr;
}

console.log(quickSort([64, 34, 25, 12, 22, 11, 90]));
// 输出: [11, 12, 22, 25, 34, 64, 90]
```

**特性分析：**
- 时间复杂度：O(n log n) 平均，O(n²) 最坏
- 空间复杂度：O(log n) 平均，O(n) 最坏
- 稳定性：不稳定
- 原地排序：是

### 2. 归并排序（Merge Sort）

采用分治策略，将数组分为两半，分别排序后再合并。

```javascript
function mergeSort(arr) {
  if (arr.length <= 1) {
    return [...arr];
  }
  
  return mergeSortHelper([...arr], 0, arr.length - 1);
}

function mergeSortHelper(arr, left, right) {
  if (left >= right) {
    return arr;
  }
  
  const mid = Math.floor((left + right) / 2);
  
  mergeSortHelper(arr, left, mid);
  mergeSortHelper(arr, mid + 1, right);
  merge(arr, left, mid, right);
  
  return arr;
}

function merge(arr, left, mid, right) {
  // 创建临时数组
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);
  
  let i = 0, j = 0, k = left;
  
  // 合并两个有序数组
  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      arr[k] = leftArr[i];
      i++;
    } else {
      arr[k] = rightArr[j];
      j++;
    }
    k++;
  }
  
  // 复制剩余元素
  while (i < leftArr.length) {
    arr[k] = leftArr[i];
    i++;
    k++;
  }
  
  while (j < rightArr.length) {
    arr[k] = rightArr[j];
    j++;
    k++;
  }
}

// 自底向上的归并排序
function mergeSortBottomUp(arr) {
  const result = [...arr];
  const n = result.length;
  
  // 子数组大小从1开始，每次翻倍
  for (let size = 1; size < n; size *= 2) {
    // 合并相邻的子数组
    for (let left = 0; left < n - size; left += size * 2) {
      const mid = left + size - 1;
      const right = Math.min(left + size * 2 - 1, n - 1);
      merge(result, left, mid, right);
    }
  }
  
  return result;
}

console.log(mergeSort([64, 34, 25, 12, 22, 11, 90]));
// 输出: [11, 12, 22, 25, 34, 64, 90]
```

**特性分析：**
- 时间复杂度：O(n log n) 所有情况
- 空间复杂度：O(n)
- 稳定性：稳定
- 原地排序：否

### 3. 堆排序（Heap Sort）

利用堆数据结构的特性进行排序。

```javascript
function heapSort(arr) {
  const result = [...arr];
  const n = result.length;
  
  // 构建最大堆
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(result, n, i);
  }
  
  // 逐个提取元素
  for (let i = n - 1; i > 0; i--) {
    // 将最大元素移到末尾
    [result[0], result[i]] = [result[i], result[0]];
    
    // 重新调整堆
    heapify(result, i, 0);
  }
  
  return result;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  
  // 找到最大值的索引
  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }
  
  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }
  
  // 如果最大值不是根节点，交换并继续调整
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}

console.log(heapSort([64, 34, 25, 12, 22, 11, 90]));
// 输出: [11, 12, 22, 25, 34, 64, 90]
```

**特性分析：**
- 时间复杂度：O(n log n) 所有情况
- 空间复杂度：O(1)
- 稳定性：不稳定
- 原地排序：是

## 线性时间排序算法

### 1. 计数排序（Counting Sort）

适用于整数排序，通过统计每个值的出现次数来排序。

```javascript
function countingSort(arr, maxValue = null) {
  if (arr.length === 0) return [];
  
  // 找到最大值
  if (maxValue === null) {
    maxValue = Math.max(...arr);
  }
  
  // 创建计数数组
  const count = new Array(maxValue + 1).fill(0);
  
  // 统计每个元素的出现次数
  for (const num of arr) {
    count[num]++;
  }
  
  // 重构数组
  const result = [];
  for (let i = 0; i <= maxValue; i++) {
    while (count[i] > 0) {
      result.push(i);
      count[i]--;
    }
  }
  
  return result;
}

// 稳定版本的计数排序
function countingSortStable(arr) {
  if (arr.length === 0) return [];
  
  const maxValue = Math.max(...arr);
  const minValue = Math.min(...arr);
  const range = maxValue - minValue + 1;
  
  const count = new Array(range).fill(0);
  const result = new Array(arr.length);
  
  // 统计频次
  for (const num of arr) {
    count[num - minValue]++;
  }
  
  // 计算累积频次
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }
  
  // 从后往前填充结果数组（保证稳定性）
  for (let i = arr.length - 1; i >= 0; i--) {
    const num = arr[i];
    result[count[num - minValue] - 1] = num;
    count[num - minValue]--;
  }
  
  return result;
}

console.log(countingSort([4, 2, 2, 8, 3, 3, 1]));
// 输出: [1, 2, 2, 3, 3, 4, 8]
```

**特性分析：**
- 时间复杂度：O(n + k)，k为数据范围
- 空间复杂度：O(k)
- 稳定性：可以实现稳定
- 适用条件：整数且范围不大

### 2. 基数排序（Radix Sort）

按位数进行排序，从最低位到最高位。

```javascript
function radixSort(arr) {
  if (arr.length === 0) return [];
  
  const result = [...arr];
  const maxValue = Math.max(...result);
  
  // 从个位开始，对每一位进行计数排序
  for (let exp = 1; Math.floor(maxValue / exp) > 0; exp *= 10) {
    countingSortByDigit(result, exp);
  }
  
  return result;
}

function countingSortByDigit(arr, exp) {
  const n = arr.length;
  const result = new Array(n);
  const count = new Array(10).fill(0);
  
  // 统计每个数字的出现次数
  for (let i = 0; i < n; i++) {
    const digit = Math.floor(arr[i] / exp) % 10;
    count[digit]++;
  }
  
  // 计算累积频次
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }
  
  // 从后往前构建结果数组
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    result[count[digit] - 1] = arr[i];
    count[digit]--;
  }
  
  // 复制回原数组
  for (let i = 0; i < n; i++) {
    arr[i] = result[i];
  }
}

console.log(radixSort([170, 45, 75, 90, 2, 802, 24, 66]));
// 输出: [2, 24, 45, 66, 75, 90, 170, 802]
```

**特性分析：**
- 时间复杂度：O(d × (n + k))，d为位数，k为基数
- 空间复杂度：O(n + k)
- 稳定性：稳定
- 适用条件：整数或固定长度字符串

### 3. 桶排序（Bucket Sort）

将数据分布到多个桶中，对每个桶单独排序。

```javascript
function bucketSort(arr, bucketSize = 5) {
  if (arr.length === 0) return [];
  
  const minValue = Math.min(...arr);
  const maxValue = Math.max(...arr);
  
  // 计算桶的数量
  const bucketCount = Math.floor((maxValue - minValue) / bucketSize) + 1;
  const buckets = Array.from({ length: bucketCount }, () => []);
  
  // 将元素分配到桶中
  for (const num of arr) {
    const bucketIndex = Math.floor((num - minValue) / bucketSize);
    buckets[bucketIndex].push(num);
  }
  
  // 对每个桶进行排序并合并
  const result = [];
  for (const bucket of buckets) {
    if (bucket.length > 0) {
      // 可以使用任何排序算法，这里使用插入排序
      bucket.sort((a, b) => a - b);
      result.push(...bucket);
    }
  }
  
  return result;
}

// 针对浮点数的桶排序
function bucketSortFloat(arr) {
  if (arr.length === 0) return [];
  
  const n = arr.length;
  const buckets = Array.from({ length: n }, () => []);
  
  // 将元素分配到桶中（假设输入在[0,1)范围内）
  for (const num of arr) {
    const bucketIndex = Math.floor(n * num);
    buckets[bucketIndex].push(num);
  }
  
  // 对每个桶进行排序并合并
  const result = [];
  for (const bucket of buckets) {
    if (bucket.length > 0) {
      bucket.sort((a, b) => a - b);
      result.push(...bucket);
    }
  }
  
  return result;
}

console.log(bucketSort([64, 34, 25, 12, 22, 11, 90]));
// 输出: [11, 12, 22, 25, 34, 64, 90]
```

**特性分析：**
- 时间复杂度：O(n + k) 平均，O(n²) 最坏
- 空间复杂度：O(n + k)
- 稳定性：可以实现稳定
- 适用条件：数据均匀分布

## 排序算法比较

| 算法 | 平均时间 | 最坏时间 | 最好时间 | 空间复杂度 | 稳定性 | 原地排序 |
|------|----------|----------|----------|------------|--------|----------|
| 冒泡排序 | O(n²) | O(n²) | O(n) | O(1) | 稳定 | 是 |
| 选择排序 | O(n²) | O(n²) | O(n²) | O(1) | 不稳定 | 是 |
| 插入排序 | O(n²) | O(n²) | O(n) | O(1) | 稳定 | 是 |
| 快速排序 | O(n log n) | O(n²) | O(n log n) | O(log n) | 不稳定 | 是 |
| 归并排序 | O(n log n) | O(n log n) | O(n log n) | O(n) | 稳定 | 否 |
| 堆排序 | O(n log n) | O(n log n) | O(n log n) | O(1) | 不稳定 | 是 |
| 计数排序 | O(n + k) | O(n + k) | O(n + k) | O(k) | 稳定 | 否 |
| 基数排序 | O(d(n + k)) | O(d(n + k)) | O(d(n + k)) | O(n + k) | 稳定 | 否 |
| 桶排序 | O(n + k) | O(n²) | O(n + k) | O(n + k) | 稳定 | 否 |

## 应用场景选择

### 小规模数据（n < 50）
- **插入排序**：简单高效，常数因子小
- **选择排序**：交换次数少

### 大规模数据
- **快速排序**：平均性能最好，原地排序
- **归并排序**：稳定排序，性能稳定
- **堆排序**：最坏情况性能保证

### 特殊场景
- **部分有序数据**：插入排序、冒泡排序
- **需要稳定排序**：归并排序、计数排序
- **整数且范围小**：计数排序、基数排序
- **内存受限**：堆排序、快速排序

### 混合策略

```javascript
// 内省排序（Introsort）- 结合快排、堆排序和插入排序
function introsort(arr) {
  const result = [...arr];
  const maxDepth = Math.floor(Math.log2(result.length)) * 2;
  introsortHelper(result, 0, result.length - 1, maxDepth);
  return result;
}

function introsortHelper(arr, low, high, maxDepth) {
  const size = high - low + 1;
  
  // 小数组使用插入排序
  if (size < 16) {
    insertionSortRange(arr, low, high);
    return;
  }
  
  // 递归深度过大使用堆排序
  if (maxDepth === 0) {
    heapSortRange(arr, low, high);
    return;
  }
  
  // 否则使用快速排序
  const pivotIndex = partition(arr, low, high);
  introsortHelper(arr, low, pivotIndex - 1, maxDepth - 1);
  introsortHelper(arr, pivotIndex + 1, high, maxDepth - 1);
}

function insertionSortRange(arr, low, high) {
  for (let i = low + 1; i <= high; i++) {
    const current = arr[i];
    let j = i - 1;
    
    while (j >= low && arr[j] > current) {
      arr[j + 1] = arr[j];
      j--;
    }
    
    arr[j + 1] = current;
  }
}

function heapSortRange(arr, low, high) {
  // 简化实现，实际应该只对指定范围进行堆排序
  const temp = arr.slice(low, high + 1);
  const sorted = heapSort(temp);
  for (let i = 0; i < sorted.length; i++) {
    arr[low + i] = sorted[i];
  }
}
```

---

排序算法是算法学习的基础，理解各种排序算法的原理、特性和适用场景，能够帮助我们在实际开发中选择最合适的排序方法，提高程序的性能和效率。