# 图算法

图算法是处理图结构数据的算法集合，广泛应用于网络分析、路径规划、社交网络、依赖关系等领域。图由顶点（节点）和边组成，是一种重要的非线性数据结构。

## 简介

### 核心概念

- **顶点（Vertex）**：图中的节点
- **边（Edge）**：连接两个顶点的线
- **有向图**：边有方向的图
- **无向图**：边无方向的图
- **权重图**：边带有权值的图
- **连通性**：顶点间是否存在路径

### 图的表示方法

- **邻接矩阵**：二维数组表示
- **邻接表**：链表数组表示
- **边列表**：边的集合表示

## 图的基本实现

### 1. 图的数据结构

```javascript
// 图的邻接表实现
class Graph {
  constructor(directed = false) {
    this.directed = directed;
    this.vertices = new Map();
    this.edges = 0;
  }

  // 添加顶点
  addVertex(vertex) {
    if (!this.vertices.has(vertex)) {
      this.vertices.set(vertex, []);
    }
  }

  // 添加边
  addEdge(v1, v2, weight = 1) {
    this.addVertex(v1);
    this.addVertex(v2);
    
    this.vertices.get(v1).push({ vertex: v2, weight });
    
    if (!this.directed) {
      this.vertices.get(v2).push({ vertex: v1, weight });
    }
    
    this.edges++;
  }

  // 移除边
  removeEdge(v1, v2) {
    if (this.vertices.has(v1)) {
      this.vertices.set(v1, 
        this.vertices.get(v1).filter(edge => edge.vertex !== v2)
      );
    }
    
    if (!this.directed && this.vertices.has(v2)) {
      this.vertices.set(v2, 
        this.vertices.get(v2).filter(edge => edge.vertex !== v1)
      );
    }
    
    this.edges--;
  }

  // 移除顶点
  removeVertex(vertex) {
    if (!this.vertices.has(vertex)) return;
    
    // 移除所有相关的边
    for (const [v, edges] of this.vertices) {
      this.vertices.set(v, edges.filter(edge => edge.vertex !== vertex));
    }
    
    this.vertices.delete(vertex);
  }

  // 获取邻接顶点
  getNeighbors(vertex) {
    return this.vertices.get(vertex) || [];
  }

  // 获取所有顶点
  getAllVertices() {
    return Array.from(this.vertices.keys());
  }

  // 获取边数
  getEdgeCount() {
    return this.edges;
  }

  // 获取顶点数
  getVertexCount() {
    return this.vertices.size;
  }

  // 检查是否存在边
  hasEdge(v1, v2) {
    if (!this.vertices.has(v1)) return false;
    return this.vertices.get(v1).some(edge => edge.vertex === v2);
  }

  // 打印图
  display() {
    for (const [vertex, edges] of this.vertices) {
      const edgeList = edges.map(edge => 
        `${edge.vertex}(${edge.weight})`
      ).join(', ');
      console.log(`${vertex} -> [${edgeList}]`);
    }
  }
}
```

### 2. 邻接矩阵实现

```javascript
// 图的邻接矩阵实现
class MatrixGraph {
  constructor(size, directed = false) {
    this.size = size;
    this.directed = directed;
    this.matrix = Array(size).fill().map(() => Array(size).fill(0));
    this.vertexLabels = new Map();
    this.labelToIndex = new Map();
    this.nextIndex = 0;
  }

  // 添加顶点
  addVertex(label) {
    if (this.nextIndex >= this.size) {
      throw new Error('Graph is full');
    }
    
    if (!this.labelToIndex.has(label)) {
      this.vertexLabels.set(this.nextIndex, label);
      this.labelToIndex.set(label, this.nextIndex);
      this.nextIndex++;
    }
  }

  // 添加边
  addEdge(v1, v2, weight = 1) {
    const index1 = this.labelToIndex.get(v1);
    const index2 = this.labelToIndex.get(v2);
    
    if (index1 === undefined || index2 === undefined) {
      throw new Error('Vertex not found');
    }
    
    this.matrix[index1][index2] = weight;
    
    if (!this.directed) {
      this.matrix[index2][index1] = weight;
    }
  }

  // 获取权重
  getWeight(v1, v2) {
    const index1 = this.labelToIndex.get(v1);
    const index2 = this.labelToIndex.get(v2);
    
    if (index1 === undefined || index2 === undefined) {
      return 0;
    }
    
    return this.matrix[index1][index2];
  }

  // 获取邻接顶点
  getNeighbors(vertex) {
    const index = this.labelToIndex.get(vertex);
    if (index === undefined) return [];
    
    const neighbors = [];
    for (let i = 0; i < this.size; i++) {
      if (this.matrix[index][i] !== 0) {
        neighbors.push({
          vertex: this.vertexLabels.get(i),
          weight: this.matrix[index][i]
        });
      }
    }
    
    return neighbors;
  }

  // 打印矩阵
  display() {
    console.log('邻接矩阵:');
    const labels = Array.from(this.vertexLabels.values());
    console.log('   ', labels.join('  '));
    
    for (let i = 0; i < this.nextIndex; i++) {
      const row = this.matrix[i].slice(0, this.nextIndex);
      console.log(`${this.vertexLabels.get(i)}: [${row.join(', ')}]`);
    }
  }
}
```

## 图的遍历算法

### 1. 深度优先搜索（DFS）

```javascript
// 深度优先搜索
class DFS {
  constructor(graph) {
    this.graph = graph;
    this.visited = new Set();
    this.result = [];
  }

  // 递归DFS - O(V + E)
  dfsRecursive(startVertex, visited = new Set(), result = []) {
    visited.add(startVertex);
    result.push(startVertex);
    
    const neighbors = this.graph.getNeighbors(startVertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.vertex)) {
        this.dfsRecursive(neighbor.vertex, visited, result);
      }
    }
    
    return result;
  }

  // 迭代DFS
  dfsIterative(startVertex) {
    const visited = new Set();
    const result = [];
    const stack = [startVertex];
    
    while (stack.length > 0) {
      const vertex = stack.pop();
      
      if (!visited.has(vertex)) {
        visited.add(vertex);
        result.push(vertex);
        
        const neighbors = this.graph.getNeighbors(vertex);
        // 逆序添加以保持与递归版本一致的顺序
        for (let i = neighbors.length - 1; i >= 0; i--) {
          if (!visited.has(neighbors[i].vertex)) {
            stack.push(neighbors[i].vertex);
          }
        }
      }
    }
    
    return result;
  }

  // 检测环（有向图）
  hasCycleDirected() {
    const visited = new Set();
    const recursionStack = new Set();
    
    const hasCycleUtil = (vertex) => {
      visited.add(vertex);
      recursionStack.add(vertex);
      
      const neighbors = this.graph.getNeighbors(vertex);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.vertex)) {
          if (hasCycleUtil(neighbor.vertex)) {
            return true;
          }
        } else if (recursionStack.has(neighbor.vertex)) {
          return true;
        }
      }
      
      recursionStack.delete(vertex);
      return false;
    };
    
    for (const vertex of this.graph.getAllVertices()) {
      if (!visited.has(vertex)) {
        if (hasCycleUtil(vertex)) {
          return true;
        }
      }
    }
    
    return false;
  }

  // 拓扑排序
  topologicalSort() {
    const visited = new Set();
    const stack = [];
    
    const topologicalSortUtil = (vertex) => {
      visited.add(vertex);
      
      const neighbors = this.graph.getNeighbors(vertex);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.vertex)) {
          topologicalSortUtil(neighbor.vertex);
        }
      }
      
      stack.push(vertex);
    };
    
    for (const vertex of this.graph.getAllVertices()) {
      if (!visited.has(vertex)) {
        topologicalSortUtil(vertex);
      }
    }
    
    return stack.reverse();
  }
}
```

### 2. 广度优先搜索（BFS）

```javascript
// 广度优先搜索
class BFS {
  constructor(graph) {
    this.graph = graph;
  }

  // BFS遍历 - O(V + E)
  bfs(startVertex) {
    const visited = new Set();
    const result = [];
    const queue = [startVertex];
    
    visited.add(startVertex);
    
    while (queue.length > 0) {
      const vertex = queue.shift();
      result.push(vertex);
      
      const neighbors = this.graph.getNeighbors(vertex);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.vertex)) {
          visited.add(neighbor.vertex);
          queue.push(neighbor.vertex);
        }
      }
    }
    
    return result;
  }

  // 最短路径（无权图）
  shortestPath(startVertex, endVertex) {
    const visited = new Set();
    const queue = [{ vertex: startVertex, path: [startVertex] }];
    
    visited.add(startVertex);
    
    while (queue.length > 0) {
      const { vertex, path } = queue.shift();
      
      if (vertex === endVertex) {
        return path;
      }
      
      const neighbors = this.graph.getNeighbors(vertex);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.vertex)) {
          visited.add(neighbor.vertex);
          queue.push({
            vertex: neighbor.vertex,
            path: [...path, neighbor.vertex]
          });
        }
      }
    }
    
    return null; // 无路径
  }

  // 层次遍历
  levelOrder(startVertex) {
    const visited = new Set();
    const levels = [];
    let queue = [startVertex];
    
    visited.add(startVertex);
    
    while (queue.length > 0) {
      const currentLevel = [...queue];
      levels.push(currentLevel);
      queue = [];
      
      for (const vertex of currentLevel) {
        const neighbors = this.graph.getNeighbors(vertex);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.vertex)) {
            visited.add(neighbor.vertex);
            queue.push(neighbor.vertex);
          }
        }
      }
    }
    
    return levels;
  }

  // 检查连通性
  isConnected() {
    const vertices = this.graph.getAllVertices();
    if (vertices.length === 0) return true;
    
    const reachable = this.bfs(vertices[0]);
    return reachable.length === vertices.length;
  }
}
```

## 最短路径算法

### 1. Dijkstra算法

```javascript
// Dijkstra最短路径算法
class Dijkstra {
  constructor(graph) {
    this.graph = graph;
  }

  // 最小堆实现
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

    insert(item) {
      this.heap.push(item);
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
      while (i > 0 && this.heap[this.parent(i)].distance > this.heap[i].distance) {
        this.swap(i, this.parent(i));
        i = this.parent(i);
      }
    }

    heapifyDown(i) {
      while (this.leftChild(i) < this.heap.length) {
        let minChild = this.leftChild(i);
        if (this.rightChild(i) < this.heap.length && 
            this.heap[this.rightChild(i)].distance < this.heap[minChild].distance) {
          minChild = this.rightChild(i);
        }

        if (this.heap[i].distance <= this.heap[minChild].distance) break;

        this.swap(i, minChild);
        i = minChild;
      }
    }

    isEmpty() {
      return this.heap.length === 0;
    }
  }

  // Dijkstra算法 - O((V + E) log V)
  findShortestPath(startVertex, endVertex = null) {
    const distances = new Map();
    const previous = new Map();
    const heap = new this.MinHeap();
    
    // 初始化距离
    for (const vertex of this.graph.getAllVertices()) {
      distances.set(vertex, vertex === startVertex ? 0 : Infinity);
      previous.set(vertex, null);
    }
    
    heap.insert({ vertex: startVertex, distance: 0 });
    
    while (!heap.isEmpty()) {
      const { vertex: currentVertex, distance: currentDistance } = heap.extractMin();
      
      // 如果找到目标顶点，可以提前结束
      if (endVertex && currentVertex === endVertex) {
        break;
      }
      
      // 跳过已处理的顶点
      if (currentDistance > distances.get(currentVertex)) {
        continue;
      }
      
      const neighbors = this.graph.getNeighbors(currentVertex);
      for (const neighbor of neighbors) {
        const newDistance = currentDistance + neighbor.weight;
        
        if (newDistance < distances.get(neighbor.vertex)) {
          distances.set(neighbor.vertex, newDistance);
          previous.set(neighbor.vertex, currentVertex);
          heap.insert({ vertex: neighbor.vertex, distance: newDistance });
        }
      }
    }
    
    return { distances, previous };
  }

  // 重构路径
  reconstructPath(previous, startVertex, endVertex) {
    const path = [];
    let currentVertex = endVertex;
    
    while (currentVertex !== null) {
      path.unshift(currentVertex);
      currentVertex = previous.get(currentVertex);
    }
    
    return path[0] === startVertex ? path : null;
  }

  // 获取到所有顶点的最短路径
  getAllShortestPaths(startVertex) {
    const { distances, previous } = this.findShortestPath(startVertex);
    const paths = new Map();
    
    for (const vertex of this.graph.getAllVertices()) {
      if (vertex !== startVertex) {
        const path = this.reconstructPath(previous, startVertex, vertex);
        paths.set(vertex, {
          distance: distances.get(vertex),
          path: path
        });
      }
    }
    
    return paths;
  }
}
```

### 2. Floyd-Warshall算法

```javascript
// Floyd-Warshall全源最短路径算法
class FloydWarshall {
  constructor(graph) {
    this.graph = graph;
    this.vertices = graph.getAllVertices();
    this.n = this.vertices.length;
    this.vertexIndex = new Map();
    
    // 建立顶点到索引的映射
    this.vertices.forEach((vertex, index) => {
      this.vertexIndex.set(vertex, index);
    });
  }

  // Floyd-Warshall算法 - O(V³)
  findAllShortestPaths() {
    const dist = Array(this.n).fill().map(() => Array(this.n).fill(Infinity));
    const next = Array(this.n).fill().map(() => Array(this.n).fill(null));
    
    // 初始化距离矩阵
    for (let i = 0; i < this.n; i++) {
      dist[i][i] = 0;
    }
    
    // 设置直接边的距离
    for (const vertex of this.vertices) {
      const i = this.vertexIndex.get(vertex);
      const neighbors = this.graph.getNeighbors(vertex);
      
      for (const neighbor of neighbors) {
        const j = this.vertexIndex.get(neighbor.vertex);
        dist[i][j] = neighbor.weight;
        next[i][j] = j;
      }
    }
    
    // Floyd-Warshall核心算法
    for (let k = 0; k < this.n; k++) {
      for (let i = 0; i < this.n; i++) {
        for (let j = 0; j < this.n; j++) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            next[i][j] = next[i][k];
          }
        }
      }
    }
    
    return { distances: dist, next };
  }

  // 重构路径
  reconstructPath(next, start, end) {
    const startIndex = this.vertexIndex.get(start);
    const endIndex = this.vertexIndex.get(end);
    
    if (next[startIndex][endIndex] === null) {
      return null; // 无路径
    }
    
    const path = [start];
    let current = startIndex;
    
    while (current !== endIndex) {
      current = next[current][endIndex];
      path.push(this.vertices[current]);
    }
    
    return path;
  }

  // 获取两点间最短距离
  getShortestDistance(start, end) {
    const { distances } = this.findAllShortestPaths();
    const startIndex = this.vertexIndex.get(start);
    const endIndex = this.vertexIndex.get(end);
    
    return distances[startIndex][endIndex];
  }

  // 检测负权环
  hasNegativeCycle() {
    const { distances } = this.findAllShortestPaths();
    
    for (let i = 0; i < this.n; i++) {
      if (distances[i][i] < 0) {
        return true;
      }
    }
    
    return false;
  }

  // 打印距离矩阵
  printDistanceMatrix() {
    const { distances } = this.findAllShortestPaths();
    
    console.log('最短距离矩阵:');
    console.log('     ', this.vertices.join('   '));
    
    for (let i = 0; i < this.n; i++) {
      const row = distances[i].map(d => 
        d === Infinity ? '∞' : d.toString().padStart(3)
      ).join(' ');
      console.log(`${this.vertices[i]}: [${row}]`);
    }
  }
}
```

## 最小生成树算法

### 1. Prim算法

```javascript
// Prim最小生成树算法
class Prim {
  constructor(graph) {
    this.graph = graph;
  }

  // Prim算法 - O(V² log V)
  findMST(startVertex = null) {
    const vertices = this.graph.getAllVertices();
    if (vertices.length === 0) return { edges: [], totalWeight: 0 };
    
    const start = startVertex || vertices[0];
    const inMST = new Set([start]);
    const mstEdges = [];
    let totalWeight = 0;
    
    // 优先队列存储边
    const edgeQueue = [];
    
    // 添加起始顶点的所有边
    this.addEdgesToQueue(start, edgeQueue, inMST);
    
    while (edgeQueue.length > 0 && inMST.size < vertices.length) {
      // 找到权重最小的边
      edgeQueue.sort((a, b) => a.weight - b.weight);
      const minEdge = edgeQueue.shift();
      
      // 如果边的目标顶点不在MST中
      if (!inMST.has(minEdge.to)) {
        inMST.add(minEdge.to);
        mstEdges.push(minEdge);
        totalWeight += minEdge.weight;
        
        // 添加新顶点的边
        this.addEdgesToQueue(minEdge.to, edgeQueue, inMST);
      }
    }
    
    return {
      edges: mstEdges,
      totalWeight,
      vertices: Array.from(inMST),
      isComplete: inMST.size === vertices.length
    };
  }

  // 添加顶点的边到队列
  addEdgesToQueue(vertex, queue, inMST) {
    const neighbors = this.graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (!inMST.has(neighbor.vertex)) {
        queue.push({
          from: vertex,
          to: neighbor.vertex,
          weight: neighbor.weight
        });
      }
    }
  }

  // 使用堆优化的Prim算法
  findMSTOptimized(startVertex = null) {
    const vertices = this.graph.getAllVertices();
    if (vertices.length === 0) return { edges: [], totalWeight: 0 };
    
    const start = startVertex || vertices[0];
    const key = new Map();
    const parent = new Map();
    const inMST = new Set();
    
    // 初始化
    for (const vertex of vertices) {
      key.set(vertex, Infinity);
      parent.set(vertex, null);
    }
    key.set(start, 0);
    
    const mstEdges = [];
    let totalWeight = 0;
    
    for (let count = 0; count < vertices.length; count++) {
      // 找到最小键值的顶点
      let minKey = Infinity;
      let minVertex = null;
      
      for (const vertex of vertices) {
        if (!inMST.has(vertex) && key.get(vertex) < minKey) {
          minKey = key.get(vertex);
          minVertex = vertex;
        }
      }
      
      inMST.add(minVertex);
      
      if (parent.get(minVertex) !== null) {
        mstEdges.push({
          from: parent.get(minVertex),
          to: minVertex,
          weight: key.get(minVertex)
        });
        totalWeight += key.get(minVertex);
      }
      
      // 更新邻接顶点的键值
      const neighbors = this.graph.getNeighbors(minVertex);
      for (const neighbor of neighbors) {
        if (!inMST.has(neighbor.vertex) && neighbor.weight < key.get(neighbor.vertex)) {
          key.set(neighbor.vertex, neighbor.weight);
          parent.set(neighbor.vertex, minVertex);
        }
      }
    }
    
    return {
      edges: mstEdges,
      totalWeight,
      vertices: Array.from(inMST),
      isComplete: inMST.size === vertices.length
    };
  }

  // 可视化MST
  visualizeMST(startVertex = null) {
    const mst = this.findMST(startVertex);
    
    console.log('Prim算法 - 最小生成树:');
    console.log('边:');
    mst.edges.forEach(edge => {
      console.log(`  ${edge.from} -- ${edge.to} : ${edge.weight}`);
    });
    console.log(`总权重: ${mst.totalWeight}`);
    console.log(`是否完整: ${mst.isComplete}`);
    
    return mst;
  }
}
```

## 使用示例

```javascript
// 创建图并测试算法
function demonstrateGraphAlgorithms() {
  // 创建无向加权图
  const graph = new Graph(false);
  
  // 添加顶点和边
  graph.addEdge('A', 'B', 4);
  graph.addEdge('A', 'C', 2);
  graph.addEdge('B', 'C', 1);
  graph.addEdge('B', 'D', 5);
  graph.addEdge('C', 'D', 8);
  graph.addEdge('C', 'E', 10);
  graph.addEdge('D', 'E', 2);
  
  console.log('图结构:');
  graph.display();
  
  // DFS遍历
  const dfs = new DFS(graph);
  console.log('\nDFS遍历:', dfs.dfsRecursive('A'));
  
  // BFS遍历
  const bfs = new BFS(graph);
  console.log('BFS遍历:', bfs.bfs('A'));
  
  // 最短路径（Dijkstra）
  const dijkstra = new Dijkstra(graph);
  const shortestPaths = dijkstra.getAllShortestPaths('A');
  console.log('\n从A到各点的最短路径:');
  for (const [vertex, info] of shortestPaths) {
    console.log(`到${vertex}: 距离=${info.distance}, 路径=${info.path?.join(' -> ')}`);
  }
  
  // 最小生成树（Prim）
  const prim = new Prim(graph);
  prim.visualizeMST('A');
  
  // Floyd-Warshall全源最短路径
  const floyd = new FloydWarshall(graph);
  floyd.printDistanceMatrix();
}

// 运行演示
demonstrate GraphAlgorithms();
```

## 算法比较

| 算法 | 时间复杂度 | 空间复杂度 | 适用场景 | 特点 |
|------|-----------|-----------|----------|------|
| DFS | O(V + E) | O(V) | 路径搜索、环检测 | 递归实现简单 |
| BFS | O(V + E) | O(V) | 最短路径、层次遍历 | 队列实现 |
| Dijkstra | O((V+E)logV) | O(V) | 单源最短路径 | 不能处理负权边 |
| Floyd-Warshall | O(V³) | O(V²) | 全源最短路径 | 可处理负权边 |
| Prim | O(V²) | O(V) | 最小生成树 | 适合稠密图 |
| Kruskal | O(E log E) | O(V) | 最小生成树 | 适合稀疏图 |

## 应用场景

### 网络分析
- 社交网络分析
- 网络拓扑设计
- 路由算法
- 网络流量优化

### 路径规划
- GPS导航系统
- 游戏AI寻路
- 物流配送优化
- 交通路线规划

### 数据结构
- 依赖关系分析
- 编译器优化
- 数据库查询优化
- 任务调度

### 机器学习
- 图神经网络
- 推荐系统
- 聚类分析
- 特征选择

---

图算法是计算机科学中的重要组成部分，在现代软件开发和数据分析中有着广泛的应用。掌握这些基本的图算法对于解决复杂的网络和关系问题至关重要。