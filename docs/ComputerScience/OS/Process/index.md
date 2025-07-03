# 进程与线程

进程和线程是操作系统中最重要的概念之一，它们是程序执行和资源管理的基本单位。理解进程与线程的原理对于开发高性能、并发的应用程序至关重要。

## 简介

### 核心概念

- **进程（Process）**：程序在执行时的一个实例，拥有独立的内存空间
- **线程（Thread）**：进程内的执行单元，共享进程的内存空间
- **并发（Concurrency）**：多个任务在同一时间段内执行
- **并行（Parallelism）**：多个任务在同一时刻同时执行
- **同步（Synchronization）**：协调多个执行单元的执行顺序

### 进程 vs 线程

| 特性 | 进程 | 线程 |
|------|------|------|
| 内存空间 | 独立 | 共享 |
| 创建开销 | 大 | 小 |
| 通信方式 | IPC | 共享内存 |
| 安全性 | 高 | 低 |
| 崩溃影响 | 独立 | 影响整个进程 |

## 进程管理

### 1. 进程状态

```javascript
// 进程状态模拟
class ProcessState {
  static STATES = {
    NEW: 'new',           // 新建
    READY: 'ready',       // 就绪
    RUNNING: 'running',   // 运行
    WAITING: 'waiting',   // 等待
    TERMINATED: 'terminated' // 终止
  };

  constructor(pid, name) {
    this.pid = pid;
    this.name = name;
    this.state = ProcessState.STATES.NEW;
    this.priority = 0;
    this.arrivalTime = Date.now();
    this.burstTime = 0;
    this.waitingTime = 0;
    this.turnaroundTime = 0;
    this.resources = new Set();
  }

  // 状态转换
  setState(newState) {
    const validTransitions = {
      [ProcessState.STATES.NEW]: [ProcessState.STATES.READY],
      [ProcessState.STATES.READY]: [ProcessState.STATES.RUNNING, ProcessState.STATES.TERMINATED],
      [ProcessState.STATES.RUNNING]: [ProcessState.STATES.READY, ProcessState.STATES.WAITING, ProcessState.STATES.TERMINATED],
      [ProcessState.STATES.WAITING]: [ProcessState.STATES.READY, ProcessState.STATES.TERMINATED],
      [ProcessState.STATES.TERMINATED]: []
    };

    if (validTransitions[this.state].includes(newState)) {
      console.log(`进程 ${this.name} (PID: ${this.pid}) 状态从 ${this.state} 转换到 ${newState}`);
      this.state = newState;
      return true;
    } else {
      console.error(`无效的状态转换: ${this.state} -> ${newState}`);
      return false;
    }
  }

  // 分配资源
  allocateResource(resource) {
    this.resources.add(resource);
    console.log(`进程 ${this.name} 分配资源: ${resource}`);
  }

  // 释放资源
  releaseResource(resource) {
    this.resources.delete(resource);
    console.log(`进程 ${this.name} 释放资源: ${resource}`);
  }

  // 获取进程信息
  getInfo() {
    return {
      pid: this.pid,
      name: this.name,
      state: this.state,
      priority: this.priority,
      arrivalTime: this.arrivalTime,
      burstTime: this.burstTime,
      waitingTime: this.waitingTime,
      turnaroundTime: this.turnaroundTime,
      resources: Array.from(this.resources)
    };
  }
}
```

### 2. 进程调度算法

```javascript
// 进程调度器
class ProcessScheduler {
  constructor() {
    this.readyQueue = [];
    this.runningProcess = null;
    this.waitingQueue = [];
    this.completedProcesses = [];
    this.currentTime = 0;
    this.timeQuantum = 4; // 时间片
  }

  // 添加进程到就绪队列
  addProcess(process) {
    process.setState(ProcessState.STATES.READY);
    this.readyQueue.push(process);
    console.log(`进程 ${process.name} 加入就绪队列`);
  }

  // 先来先服务 (FCFS) 调度
  fcfsSchedule() {
    console.log('\n=== FCFS 调度算法 ===');
    
    // 按到达时间排序
    this.readyQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let currentTime = 0;
    
    for (const process of this.readyQueue) {
      // 等待时间 = 当前时间 - 到达时间
      process.waitingTime = Math.max(0, currentTime - process.arrivalTime);
      
      // 开始执行
      process.setState(ProcessState.STATES.RUNNING);
      console.log(`时间 ${currentTime}: 进程 ${process.name} 开始执行`);
      
      // 执行完成
      currentTime += process.burstTime;
      process.turnaroundTime = currentTime - process.arrivalTime;
      
      process.setState(ProcessState.STATES.TERMINATED);
      console.log(`时间 ${currentTime}: 进程 ${process.name} 执行完成`);
      
      this.completedProcesses.push(process);
    }
    
    this.printStatistics();
  }

  // 最短作业优先 (SJF) 调度
  sjfSchedule() {
    console.log('\n=== SJF 调度算法 ===');
    
    // 按执行时间排序
    this.readyQueue.sort((a, b) => a.burstTime - b.burstTime);
    
    let currentTime = 0;
    
    for (const process of this.readyQueue) {
      process.waitingTime = Math.max(0, currentTime - process.arrivalTime);
      
      process.setState(ProcessState.STATES.RUNNING);
      console.log(`时间 ${currentTime}: 进程 ${process.name} 开始执行 (执行时间: ${process.burstTime})`);
      
      currentTime += process.burstTime;
      process.turnaroundTime = currentTime - process.arrivalTime;
      
      process.setState(ProcessState.STATES.TERMINATED);
      console.log(`时间 ${currentTime}: 进程 ${process.name} 执行完成`);
      
      this.completedProcesses.push(process);
    }
    
    this.printStatistics();
  }

  // 优先级调度
  prioritySchedule() {
    console.log('\n=== 优先级调度算法 ===');
    
    // 按优先级排序（数值越小优先级越高）
    this.readyQueue.sort((a, b) => a.priority - b.priority);
    
    let currentTime = 0;
    
    for (const process of this.readyQueue) {
      process.waitingTime = Math.max(0, currentTime - process.arrivalTime);
      
      process.setState(ProcessState.STATES.RUNNING);
      console.log(`时间 ${currentTime}: 进程 ${process.name} 开始执行 (优先级: ${process.priority})`);
      
      currentTime += process.burstTime;
      process.turnaroundTime = currentTime - process.arrivalTime;
      
      process.setState(ProcessState.STATES.TERMINATED);
      console.log(`时间 ${currentTime}: 进程 ${process.name} 执行完成`);
      
      this.completedProcesses.push(process);
    }
    
    this.printStatistics();
  }

  // 时间片轮转 (Round Robin) 调度
  roundRobinSchedule() {
    console.log('\n=== 时间片轮转调度算法 ===');
    console.log(`时间片: ${this.timeQuantum}`);
    
    const queue = [...this.readyQueue];
    let currentTime = 0;
    
    while (queue.length > 0) {
      const process = queue.shift();
      
      if (process.burstTime <= 0) continue;
      
      process.setState(ProcessState.STATES.RUNNING);
      
      // 执行时间片或剩余时间
      const executeTime = Math.min(this.timeQuantum, process.burstTime);
      console.log(`时间 ${currentTime}: 进程 ${process.name} 执行 ${executeTime} 时间单位`);
      
      currentTime += executeTime;
      process.burstTime -= executeTime;
      
      if (process.burstTime > 0) {
        // 还有剩余时间，重新加入队列
        process.setState(ProcessState.STATES.READY);
        queue.push(process);
        console.log(`进程 ${process.name} 时间片用完，重新加入队列`);
      } else {
        // 执行完成
        process.setState(ProcessState.STATES.TERMINATED);
        process.turnaroundTime = currentTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - (process.burstTime + executeTime);
        
        console.log(`时间 ${currentTime}: 进程 ${process.name} 执行完成`);
        this.completedProcesses.push(process);
      }
    }
    
    this.printStatistics();
  }

  // 打印统计信息
  printStatistics() {
    console.log('\n=== 调度统计 ===');
    
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    
    console.log('进程\t等待时间\t周转时间');
    for (const process of this.completedProcesses) {
      console.log(`${process.name}\t${process.waitingTime}\t\t${process.turnaroundTime}`);
      totalWaitingTime += process.waitingTime;
      totalTurnaroundTime += process.turnaroundTime;
    }
    
    const avgWaitingTime = totalWaitingTime / this.completedProcesses.length;
    const avgTurnaroundTime = totalTurnaroundTime / this.completedProcesses.length;
    
    console.log(`\n平均等待时间: ${avgWaitingTime.toFixed(2)}`);
    console.log(`平均周转时间: ${avgTurnaroundTime.toFixed(2)}`);
  }

  // 重置调度器
  reset() {
    this.completedProcesses = [];
    this.currentTime = 0;
  }
}

// 使用示例
const scheduler = new ProcessScheduler();

// 创建进程
const p1 = new ProcessState(1, 'P1');
p1.burstTime = 6;
p1.priority = 2;

const p2 = new ProcessState(2, 'P2');
p2.burstTime = 8;
p2.priority = 1;

const p3 = new ProcessState(3, 'P3');
p3.burstTime = 7;
p3.priority = 3;

const p4 = new ProcessState(4, 'P4');
p4.burstTime = 3;
p4.priority = 2;

// 添加进程
scheduler.addProcess(p1);
scheduler.addProcess(p2);
scheduler.addProcess(p3);
scheduler.addProcess(p4);

// 测试不同调度算法
scheduler.fcfsSchedule();
scheduler.reset();

scheduler.sjfSchedule();
scheduler.reset();

scheduler.prioritySchedule();
```

## 线程管理

### 1. 线程实现

```javascript
// 线程模拟实现
class Thread {
  constructor(id, name, target, args = []) {
    this.id = id;
    this.name = name;
    this.target = target;
    this.args = args;
    this.state = 'NEW';
    this.result = null;
    this.error = null;
    this.startTime = null;
    this.endTime = null;
    this.priority = 5; // 默认优先级
  }

  // 启动线程
  start() {
    if (this.state !== 'NEW') {
      throw new Error(`线程 ${this.name} 已经启动`);
    }
    
    this.state = 'RUNNABLE';
    this.startTime = Date.now();
    
    console.log(`线程 ${this.name} 启动`);
    
    // 模拟异步执行
    setTimeout(() => {
      this.run();
    }, 0);
  }

  // 执行线程
  async run() {
    try {
      this.state = 'RUNNING';
      console.log(`线程 ${this.name} 开始执行`);
      
      if (this.target) {
        this.result = await this.target(...this.args);
      }
      
      this.state = 'TERMINATED';
      this.endTime = Date.now();
      console.log(`线程 ${this.name} 执行完成，耗时: ${this.endTime - this.startTime}ms`);
      
    } catch (error) {
      this.error = error;
      this.state = 'TERMINATED';
      this.endTime = Date.now();
      console.error(`线程 ${this.name} 执行失败:`, error.message);
    }
  }

  // 等待线程完成
  async join(timeout = null) {
    return new Promise((resolve, reject) => {
      const checkState = () => {
        if (this.state === 'TERMINATED') {
          if (this.error) {
            reject(this.error);
          } else {
            resolve(this.result);
          }
        } else {
          setTimeout(checkState, 10);
        }
      };
      
      if (timeout) {
        setTimeout(() => {
          reject(new Error(`线程 ${this.name} 等待超时`));
        }, timeout);
      }
      
      checkState();
    });
  }

  // 获取线程信息
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      state: this.state,
      priority: this.priority,
      startTime: this.startTime,
      endTime: this.endTime,
      executionTime: this.endTime ? this.endTime - this.startTime : null
    };
  }
}

// 线程池实现
class ThreadPool {
  constructor(maxThreads = 4) {
    this.maxThreads = maxThreads;
    this.activeThreads = new Set();
    this.taskQueue = [];
    this.threadIdCounter = 0;
  }

  // 提交任务
  submit(target, args = []) {
    return new Promise((resolve, reject) => {
      const task = {
        target,
        args,
        resolve,
        reject,
        id: ++this.threadIdCounter
      };
      
      this.taskQueue.push(task);
      this.processQueue();
    });
  }

  // 处理任务队列
  async processQueue() {
    if (this.taskQueue.length === 0 || this.activeThreads.size >= this.maxThreads) {
      return;
    }
    
    const task = this.taskQueue.shift();
    const thread = new Thread(task.id, `Thread-${task.id}`, task.target, task.args);
    
    this.activeThreads.add(thread);
    
    try {
      thread.start();
      const result = await thread.join();
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.activeThreads.delete(thread);
      // 处理下一个任务
      this.processQueue();
    }
  }

  // 关闭线程池
  async shutdown() {
    // 等待所有活跃线程完成
    const promises = Array.from(this.activeThreads).map(thread => thread.join());
    await Promise.all(promises);
    
    console.log('线程池已关闭');
  }

  // 获取线程池状态
  getStatus() {
    return {
      maxThreads: this.maxThreads,
      activeThreads: this.activeThreads.size,
      queuedTasks: this.taskQueue.length,
      threads: Array.from(this.activeThreads).map(t => t.getInfo())
    };
  }
}
```

### 2. 线程同步

```javascript
// 互斥锁实现
class Mutex {
  constructor() {
    this.locked = false;
    this.waitingQueue = [];
  }

  // 获取锁
  async acquire() {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.waitingQueue.push(resolve);
      }
    });
  }

  // 释放锁
  release() {
    if (!this.locked) {
      throw new Error('尝试释放未锁定的互斥锁');
    }
    
    if (this.waitingQueue.length > 0) {
      const nextResolve = this.waitingQueue.shift();
      nextResolve();
    } else {
      this.locked = false;
    }
  }

  // 尝试获取锁（非阻塞）
  tryAcquire() {
    if (!this.locked) {
      this.locked = true;
      return true;
    }
    return false;
  }
}

// 信号量实现
class Semaphore {
  constructor(permits) {
    this.permits = permits;
    this.waitingQueue = [];
  }

  // 获取许可
  async acquire() {
    return new Promise((resolve) => {
      if (this.permits > 0) {
        this.permits--;
        resolve();
      } else {
        this.waitingQueue.push(resolve);
      }
    });
  }

  // 释放许可
  release() {
    if (this.waitingQueue.length > 0) {
      const nextResolve = this.waitingQueue.shift();
      nextResolve();
    } else {
      this.permits++;
    }
  }

  // 获取可用许可数
  availablePermits() {
    return this.permits;
  }
}

// 条件变量实现
class Condition {
  constructor(mutex) {
    this.mutex = mutex;
    this.waitingQueue = [];
  }

  // 等待条件
  async wait() {
    return new Promise((resolve) => {
      this.waitingQueue.push(resolve);
      this.mutex.release(); // 释放锁
    });
  }

  // 通知一个等待的线程
  signal() {
    if (this.waitingQueue.length > 0) {
      const resolve = this.waitingQueue.shift();
      // 重新获取锁后通知
      this.mutex.acquire().then(() => {
        resolve();
      });
    }
  }

  // 通知所有等待的线程
  signalAll() {
    const waitingCount = this.waitingQueue.length;
    for (let i = 0; i < waitingCount; i++) {
      this.signal();
    }
  }
}

// 生产者-消费者问题示例
class ProducerConsumer {
  constructor(bufferSize = 5) {
    this.buffer = [];
    this.bufferSize = bufferSize;
    this.mutex = new Mutex();
    this.notFull = new Semaphore(bufferSize);
    this.notEmpty = new Semaphore(0);
    this.producerCount = 0;
    this.consumerCount = 0;
  }

  // 生产者
  async producer(id, items) {
    for (let i = 0; i < items; i++) {
      await this.notFull.acquire(); // 等待缓冲区不满
      await this.mutex.acquire();   // 获取互斥锁
      
      const item = `Producer-${id}-Item-${i}`;
      this.buffer.push(item);
      console.log(`生产者 ${id} 生产: ${item}, 缓冲区大小: ${this.buffer.length}`);
      
      this.mutex.release();     // 释放互斥锁
      this.notEmpty.release();  // 通知缓冲区不空
      
      // 模拟生产时间
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }
  }

  // 消费者
  async consumer(id, items) {
    for (let i = 0; i < items; i++) {
      await this.notEmpty.acquire(); // 等待缓冲区不空
      await this.mutex.acquire();    // 获取互斥锁
      
      const item = this.buffer.shift();
      console.log(`消费者 ${id} 消费: ${item}, 缓冲区大小: ${this.buffer.length}`);
      
      this.mutex.release();    // 释放互斥锁
      this.notFull.release();  // 通知缓冲区不满
      
      // 模拟消费时间
      await new Promise(resolve => setTimeout(resolve, Math.random() * 150));
    }
  }

  // 运行示例
  async runExample() {
    console.log('=== 生产者-消费者问题示例 ===');
    
    const threadPool = new ThreadPool(6);
    
    // 启动生产者和消费者
    const tasks = [
      threadPool.submit(() => this.producer(1, 5)),
      threadPool.submit(() => this.producer(2, 3)),
      threadPool.submit(() => this.consumer(1, 4)),
      threadPool.submit(() => this.consumer(2, 4))
    ];
    
    await Promise.all(tasks);
    await threadPool.shutdown();
    
    console.log('生产者-消费者示例完成');
  }
}
```

## 进程间通信 (IPC)

### 1. 管道通信

```javascript
// 管道通信模拟
class Pipe {
  constructor(size = 1024) {
    this.buffer = Buffer.alloc(size);
    this.readPos = 0;
    this.writePos = 0;
    this.size = size;
    this.closed = false;
    this.readers = [];
    this.writers = [];
  }

  // 写入数据
  async write(data) {
    if (this.closed) {
      throw new Error('管道已关闭');
    }
    
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    
    return new Promise((resolve, reject) => {
      const writeData = () => {
        const availableSpace = this.getAvailableSpace();
        
        if (availableSpace >= dataBuffer.length) {
          // 有足够空间，直接写入
          for (let i = 0; i < dataBuffer.length; i++) {
            this.buffer[this.writePos] = dataBuffer[i];
            this.writePos = (this.writePos + 1) % this.size;
          }
          
          // 通知等待的读者
          this.notifyReaders();
          resolve(dataBuffer.length);
        } else {
          // 空间不足，等待
          this.writers.push({ resolve, reject, data: dataBuffer });
        }
      };
      
      writeData();
    });
  }

  // 读取数据
  async read(length) {
    if (this.closed && this.getDataLength() === 0) {
      return null; // EOF
    }
    
    return new Promise((resolve, reject) => {
      const readData = () => {
        const dataLength = this.getDataLength();
        
        if (dataLength > 0) {
          const readLength = Math.min(length, dataLength);
          const result = Buffer.alloc(readLength);
          
          for (let i = 0; i < readLength; i++) {
            result[i] = this.buffer[this.readPos];
            this.readPos = (this.readPos + 1) % this.size;
          }
          
          // 通知等待的写者
          this.notifyWriters();
          resolve(result);
        } else if (this.closed) {
          resolve(null); // EOF
        } else {
          // 没有数据，等待
          this.readers.push({ resolve, reject, length });
        }
      };
      
      readData();
    });
  }

  // 关闭管道
  close() {
    this.closed = true;
    
    // 通知所有等待的读者
    while (this.readers.length > 0) {
      const reader = this.readers.shift();
      reader.resolve(null);
    }
    
    // 通知所有等待的写者
    while (this.writers.length > 0) {
      const writer = this.writers.shift();
      writer.reject(new Error('管道已关闭'));
    }
  }

  // 获取可用空间
  getAvailableSpace() {
    if (this.writePos >= this.readPos) {
      return this.size - (this.writePos - this.readPos) - 1;
    } else {
      return this.readPos - this.writePos - 1;
    }
  }

  // 获取数据长度
  getDataLength() {
    if (this.writePos >= this.readPos) {
      return this.writePos - this.readPos;
    } else {
      return this.size - (this.readPos - this.writePos);
    }
  }

  // 通知读者
  notifyReaders() {
    while (this.readers.length > 0 && this.getDataLength() > 0) {
      const reader = this.readers.shift();
      const dataLength = this.getDataLength();
      const readLength = Math.min(reader.length, dataLength);
      const result = Buffer.alloc(readLength);
      
      for (let i = 0; i < readLength; i++) {
        result[i] = this.buffer[this.readPos];
        this.readPos = (this.readPos + 1) % this.size;
      }
      
      reader.resolve(result);
    }
  }

  // 通知写者
  notifyWriters() {
    while (this.writers.length > 0) {
      const writer = this.writers.shift();
      const availableSpace = this.getAvailableSpace();
      
      if (availableSpace >= writer.data.length) {
        for (let i = 0; i < writer.data.length; i++) {
          this.buffer[this.writePos] = writer.data[i];
          this.writePos = (this.writePos + 1) % this.size;
        }
        writer.resolve(writer.data.length);
      } else {
        // 重新加入队列
        this.writers.unshift(writer);
        break;
      }
    }
  }
}
```

### 2. 共享内存

```javascript
// 共享内存模拟
class SharedMemory {
  constructor(size, key) {
    this.size = size;
    this.key = key;
    this.buffer = Buffer.alloc(size);
    this.attachedProcesses = new Set();
    this.mutex = new Mutex();
  }

  // 进程附加到共享内存
  attach(processId) {
    this.attachedProcesses.add(processId);
    console.log(`进程 ${processId} 附加到共享内存 ${this.key}`);
    return new SharedMemoryView(this, processId);
  }

  // 进程分离共享内存
  detach(processId) {
    this.attachedProcesses.delete(processId);
    console.log(`进程 ${processId} 从共享内存 ${this.key} 分离`);
  }

  // 销毁共享内存
  destroy() {
    console.log(`共享内存 ${this.key} 被销毁`);
    this.attachedProcesses.clear();
  }

  // 获取状态
  getStatus() {
    return {
      key: this.key,
      size: this.size,
      attachedProcesses: Array.from(this.attachedProcesses)
    };
  }
}

// 共享内存视图
class SharedMemoryView {
  constructor(sharedMemory, processId) {
    this.sharedMemory = sharedMemory;
    this.processId = processId;
  }

  // 写入数据
  async write(offset, data) {
    await this.sharedMemory.mutex.acquire();
    
    try {
      const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      
      if (offset + dataBuffer.length > this.sharedMemory.size) {
        throw new Error('写入数据超出共享内存边界');
      }
      
      dataBuffer.copy(this.sharedMemory.buffer, offset);
      console.log(`进程 ${this.processId} 写入 ${dataBuffer.length} 字节到偏移 ${offset}`);
      
    } finally {
      this.sharedMemory.mutex.release();
    }
  }

  // 读取数据
  async read(offset, length) {
    await this.sharedMemory.mutex.acquire();
    
    try {
      if (offset + length > this.sharedMemory.size) {
        throw new Error('读取数据超出共享内存边界');
      }
      
      const result = Buffer.alloc(length);
      this.sharedMemory.buffer.copy(result, 0, offset, offset + length);
      
      console.log(`进程 ${this.processId} 读取 ${length} 字节从偏移 ${offset}`);
      return result;
      
    } finally {
      this.sharedMemory.mutex.release();
    }
  }

  // 分离
  detach() {
    this.sharedMemory.detach(this.processId);
  }
}
```

### 3. 消息队列

```javascript
// 消息队列实现
class MessageQueue {
  constructor(key, maxSize = 100) {
    this.key = key;
    this.maxSize = maxSize;
    this.messages = [];
    this.waitingReceivers = [];
    this.mutex = new Mutex();
  }

  // 发送消息
  async send(message, priority = 0) {
    await this.mutex.acquire();
    
    try {
      if (this.messages.length >= this.maxSize) {
        throw new Error('消息队列已满');
      }
      
      const msg = {
        id: Date.now() + Math.random(),
        content: message,
        priority,
        timestamp: Date.now(),
        sender: null
      };
      
      // 按优先级插入
      let inserted = false;
      for (let i = 0; i < this.messages.length; i++) {
        if (this.messages[i].priority < priority) {
          this.messages.splice(i, 0, msg);
          inserted = true;
          break;
        }
      }
      
      if (!inserted) {
        this.messages.push(msg);
      }
      
      console.log(`消息发送到队列 ${this.key}: ${JSON.stringify(message)}`);
      
      // 通知等待的接收者
      if (this.waitingReceivers.length > 0) {
        const receiver = this.waitingReceivers.shift();
        const receivedMsg = this.messages.shift();
        receiver.resolve(receivedMsg);
      }
      
    } finally {
      this.mutex.release();
    }
  }

  // 接收消息
  async receive(timeout = null) {
    await this.mutex.acquire();
    
    try {
      if (this.messages.length > 0) {
        const message = this.messages.shift();
        console.log(`从队列 ${this.key} 接收消息: ${JSON.stringify(message.content)}`);
        return message;
      } else {
        // 没有消息，等待
        return new Promise((resolve, reject) => {
          this.waitingReceivers.push({ resolve, reject });
          
          if (timeout) {
            setTimeout(() => {
              const index = this.waitingReceivers.findIndex(r => r.resolve === resolve);
              if (index !== -1) {
                this.waitingReceivers.splice(index, 1);
                reject(new Error('接收消息超时'));
              }
            }, timeout);
          }
        });
      }
    } finally {
      this.mutex.release();
    }
  }

  // 获取队列状态
  getStatus() {
    return {
      key: this.key,
      messageCount: this.messages.length,
      maxSize: this.maxSize,
      waitingReceivers: this.waitingReceivers.length
    };
  }

  // 清空队列
  async clear() {
    await this.mutex.acquire();
    
    try {
      this.messages = [];
      console.log(`队列 ${this.key} 已清空`);
    } finally {
      this.mutex.release();
    }
  }
}
```

## 死锁检测与预防

### 1. 死锁检测

```javascript
// 死锁检测器
class DeadlockDetector {
  constructor() {
    this.resourceGraph = new Map(); // 资源分配图
    this.processResources = new Map(); // 进程拥有的资源
    this.resourceWaiters = new Map(); // 等待资源的进程
  }

  // 分配资源
  allocateResource(processId, resourceId) {
    if (!this.processResources.has(processId)) {
      this.processResources.set(processId, new Set());
    }
    
    this.processResources.get(processId).add(resourceId);
    
    // 更新资源图
    if (!this.resourceGraph.has(resourceId)) {
      this.resourceGraph.set(resourceId, new Set());
    }
    this.resourceGraph.get(resourceId).add(processId);
    
    console.log(`进程 ${processId} 获得资源 ${resourceId}`);
  }

  // 请求资源
  requestResource(processId, resourceId) {
    if (!this.resourceWaiters.has(resourceId)) {
      this.resourceWaiters.set(resourceId, new Set());
    }
    
    this.resourceWaiters.get(resourceId).add(processId);
    console.log(`进程 ${processId} 请求资源 ${resourceId}`);
    
    // 检测死锁
    if (this.detectDeadlock()) {
      console.warn('检测到死锁！');
      this.printDeadlockInfo();
      return false;
    }
    
    return true;
  }

  // 释放资源
  releaseResource(processId, resourceId) {
    if (this.processResources.has(processId)) {
      this.processResources.get(processId).delete(resourceId);
    }
    
    if (this.resourceGraph.has(resourceId)) {
      this.resourceGraph.get(resourceId).delete(processId);
    }
    
    console.log(`进程 ${processId} 释放资源 ${resourceId}`);
  }

  // 检测死锁（使用等待图算法）
  detectDeadlock() {
    const waitGraph = this.buildWaitGraph();
    return this.hasCycle(waitGraph);
  }

  // 构建等待图
  buildWaitGraph() {
    const waitGraph = new Map();
    
    // 初始化图
    for (const [processId] of this.processResources) {
      waitGraph.set(processId, new Set());
    }
    
    // 构建等待关系
    for (const [resourceId, waitingProcesses] of this.resourceWaiters) {
      const holdingProcesses = this.resourceGraph.get(resourceId) || new Set();
      
      for (const waitingProcess of waitingProcesses) {
        for (const holdingProcess of holdingProcesses) {
          if (waitingProcess !== holdingProcess) {
            if (!waitGraph.has(waitingProcess)) {
              waitGraph.set(waitingProcess, new Set());
            }
            waitGraph.get(waitingProcess).add(holdingProcess);
          }
        }
      }
    }
    
    return waitGraph;
  }

  // 检测环路（DFS）
  hasCycle(graph) {
    const visited = new Set();
    const recursionStack = new Set();
    
    for (const [node] of graph) {
      if (!visited.has(node)) {
        if (this.dfsHasCycle(graph, node, visited, recursionStack)) {
          return true;
        }
      }
    }
    
    return false;
  }

  // DFS 检测环路
  dfsHasCycle(graph, node, visited, recursionStack) {
    visited.add(node);
    recursionStack.add(node);
    
    const neighbors = graph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (this.dfsHasCycle(graph, neighbor, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true; // 发现环路
      }
    }
    
    recursionStack.delete(node);
    return false;
  }

  // 打印死锁信息
  printDeadlockInfo() {
    console.log('\n=== 死锁信息 ===');
    console.log('进程资源分配:');
    for (const [processId, resources] of this.processResources) {
      console.log(`进程 ${processId}: ${Array.from(resources).join(', ')}`);
    }
    
    console.log('\n资源等待情况:');
    for (const [resourceId, waiters] of this.resourceWaiters) {
      console.log(`资源 ${resourceId}: 等待进程 ${Array.from(waiters).join(', ')}`);
    }
  }
}

// 银行家算法（死锁预防）
class BankersAlgorithm {
  constructor(resources, processes) {
    this.available = [...resources]; // 可用资源
    this.max = processes.map(p => [...p.max]); // 最大需求
    this.allocation = processes.map(p => [...p.allocation]); // 已分配
    this.need = this.calculateNeed(); // 还需要的资源
    this.processCount = processes.length;
    this.resourceCount = resources.length;
  }

  // 计算需求矩阵
  calculateNeed() {
    const need = [];
    for (let i = 0; i < this.processCount; i++) {
      need[i] = [];
      for (let j = 0; j < this.resourceCount; j++) {
        need[i][j] = this.max[i][j] - this.allocation[i][j];
      }
    }
    return need;
  }

  // 检查系统是否处于安全状态
  isSafeState() {
    const work = [...this.available];
    const finish = new Array(this.processCount).fill(false);
    const safeSequence = [];
    
    let found = true;
    while (found && safeSequence.length < this.processCount) {
      found = false;
      
      for (let i = 0; i < this.processCount; i++) {
        if (!finish[i] && this.canAllocate(i, work)) {
          // 模拟进程完成，释放资源
          for (let j = 0; j < this.resourceCount; j++) {
            work[j] += this.allocation[i][j];
          }
          
          finish[i] = true;
          safeSequence.push(i);
          found = true;
          break;
        }
      }
    }
    
    if (safeSequence.length === this.processCount) {
      console.log(`系统处于安全状态，安全序列: ${safeSequence.join(' -> ')}`);
      return true;
    } else {
      console.log('系统处于不安全状态');
      return false;
    }
  }

  // 检查是否可以为进程分配资源
  canAllocate(processId, available) {
    for (let j = 0; j < this.resourceCount; j++) {
      if (this.need[processId][j] > available[j]) {
        return false;
      }
    }
    return true;
  }

  // 请求资源
  requestResources(processId, request) {
    console.log(`\n进程 ${processId} 请求资源: [${request.join(', ')}]`);
    
    // 检查请求是否超过需求
    for (let j = 0; j < this.resourceCount; j++) {
      if (request[j] > this.need[processId][j]) {
        console.log('请求超过最大需求，拒绝分配');
        return false;
      }
    }
    
    // 检查请求是否超过可用资源
    for (let j = 0; j < this.resourceCount; j++) {
      if (request[j] > this.available[j]) {
        console.log('请求超过可用资源，进程需要等待');
        return false;
      }
    }
    
    // 试探性分配
    for (let j = 0; j < this.resourceCount; j++) {
      this.available[j] -= request[j];
      this.allocation[processId][j] += request[j];
      this.need[processId][j] -= request[j];
    }
    
    // 检查安全性
    if (this.isSafeState()) {
      console.log('资源分配成功');
      return true;
    } else {
      // 回滚分配
      for (let j = 0; j < this.resourceCount; j++) {
        this.available[j] += request[j];
        this.allocation[processId][j] -= request[j];
        this.need[processId][j] += request[j];
      }
      console.log('分配会导致不安全状态，拒绝分配');
      return false;
    }
  }

  // 释放资源
  releaseResources(processId, release) {
    console.log(`\n进程 ${processId} 释放资源: [${release.join(', ')}]`);
    
    for (let j = 0; j < this.resourceCount; j++) {
      this.available[j] += release[j];
      this.allocation[processId][j] -= release[j];
      this.need[processId][j] += release[j];
    }
    
    console.log('资源释放成功');
  }

  // 打印当前状态
  printState() {
    console.log('\n=== 系统状态 ===');
    console.log('可用资源:', this.available);
    console.log('\n分配矩阵:');
    this.allocation.forEach((alloc, i) => {
      console.log(`P${i}: [${alloc.join(', ')}]`);
    });
    console.log('\n需求矩阵:');
    this.need.forEach((need, i) => {
      console.log(`P${i}: [${need.join(', ')}]`);
    });
  }
}
```

## 应用场景

### 系统编程
- 操作系统内核开发
- 设备驱动程序
- 系统服务
- 虚拟化技术

### 并发编程
- 多线程应用
- 并行计算
- 异步处理
- 实时系统

### 分布式系统
- 微服务架构
- 集群计算
- 负载均衡
- 容错处理

---

进程与线程是现代计算机系统的核心概念。通过深入理解其原理和实现机制，开发者可以设计出更高效、更可靠的并发系统。