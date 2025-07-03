# 微服务分布式事务

## 简介

分布式事务是微服务架构中的核心挑战之一。当一个业务操作需要跨越多个服务时，如何保证数据的一致性和完整性成为关键问题。本文档介绍了微服务环境下分布式事务的各种解决方案和实现模式。

### 核心特性

- **ACID 特性保证**：原子性、一致性、隔离性、持久性
- **跨服务协调**：多个微服务间的事务协调
- **故障恢复**：异常情况下的数据恢复机制
- **性能优化**：减少分布式事务的性能开销
- **最终一致性**：在可用性和一致性间的平衡

### 适用场景

- 电商订单处理（订单、库存、支付）
- 金融转账操作
- 用户注册流程（用户信息、权限分配）
- 数据同步和备份
- 跨系统的业务流程

## 分布式事务模式

### 1. Two-Phase Commit (2PC)

```javascript
// 2PC 协调器实现
class TwoPhaseCommitCoordinator {
  constructor() {
    this.participants = new Map();
    this.transactions = new Map();
  }
  
  // 注册参与者
  registerParticipant(participantId, participant) {
    this.participants.set(participantId, participant);
    console.log(`Participant ${participantId} registered`);
  }
  
  // 开始分布式事务
  async beginTransaction(transactionId, operations) {
    const transaction = {
      id: transactionId,
      operations,
      status: 'PREPARING',
      participants: new Set(),
      startTime: Date.now()
    };
    
    this.transactions.set(transactionId, transaction);
    
    try {
      // Phase 1: Prepare
      const prepareResults = await this.preparePhase(transaction);
      
      if (prepareResults.every(result => result.vote === 'YES')) {
        // Phase 2: Commit
        transaction.status = 'COMMITTING';
        await this.commitPhase(transaction);
        transaction.status = 'COMMITTED';
        console.log(`Transaction ${transactionId} committed successfully`);
        return { success: true, transactionId };
      } else {
        // Phase 2: Abort
        transaction.status = 'ABORTING';
        await this.abortPhase(transaction);
        transaction.status = 'ABORTED';
        console.log(`Transaction ${transactionId} aborted`);
        return { success: false, reason: 'Prepare phase failed' };
      }
    } catch (error) {
      transaction.status = 'FAILED';
      console.error(`Transaction ${transactionId} failed:`, error);
      await this.abortPhase(transaction);
      return { success: false, error: error.message };
    } finally {
      // 清理事务记录
      setTimeout(() => {
        this.transactions.delete(transactionId);
      }, 300000); // 5分钟后清理
    }
  }
  
  // 准备阶段
  async preparePhase(transaction) {
    const preparePromises = [];
    
    for (const operation of transaction.operations) {
      const participant = this.participants.get(operation.participantId);
      if (!participant) {
        throw new Error(`Participant ${operation.participantId} not found`);
      }
      
      transaction.participants.add(operation.participantId);
      
      preparePromises.push(
        this.prepareParticipant(participant, transaction.id, operation)
      );
    }
    
    const results = await Promise.allSettled(preparePromises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Prepare failed for operation ${index}:`, result.reason);
        return { vote: 'NO', reason: result.reason.message };
      }
    });
  }
  
  // 准备单个参与者
  async prepareParticipant(participant, transactionId, operation) {
    try {
      const result = await participant.prepare(transactionId, operation);
      console.log(`Participant prepared: ${operation.participantId}`);
      return { vote: 'YES', participantId: operation.participantId, result };
    } catch (error) {
      console.error(`Prepare failed for ${operation.participantId}:`, error);
      return { vote: 'NO', participantId: operation.participantId, reason: error.message };
    }
  }
  
  // 提交阶段
  async commitPhase(transaction) {
    const commitPromises = [];
    
    for (const participantId of transaction.participants) {
      const participant = this.participants.get(participantId);
      commitPromises.push(
        this.commitParticipant(participant, transaction.id, participantId)
      );
    }
    
    const results = await Promise.allSettled(commitPromises);
    
    // 记录提交失败的参与者
    const failedCommits = results
      .map((result, index) => ({ result, participantId: Array.from(transaction.participants)[index] }))
      .filter(({ result }) => result.status === 'rejected');
    
    if (failedCommits.length > 0) {
      console.error('Some participants failed to commit:', failedCommits);
      // 在实际系统中，这里需要重试机制或人工干预
    }
  }
  
  // 提交单个参与者
  async commitParticipant(participant, transactionId, participantId) {
    try {
      await participant.commit(transactionId);
      console.log(`Participant committed: ${participantId}`);
    } catch (error) {
      console.error(`Commit failed for ${participantId}:`, error);
      throw error;
    }
  }
  
  // 中止阶段
  async abortPhase(transaction) {
    const abortPromises = [];
    
    for (const participantId of transaction.participants) {
      const participant = this.participants.get(participantId);
      abortPromises.push(
        this.abortParticipant(participant, transaction.id, participantId)
      );
    }
    
    await Promise.allSettled(abortPromises);
  }
  
  // 中止单个参与者
  async abortParticipant(participant, transactionId, participantId) {
    try {
      await participant.abort(transactionId);
      console.log(`Participant aborted: ${participantId}`);
    } catch (error) {
      console.error(`Abort failed for ${participantId}:`, error);
    }
  }
  
  // 获取事务状态
  getTransactionStatus(transactionId) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return null;
    }
    
    return {
      id: transaction.id,
      status: transaction.status,
      participants: Array.from(transaction.participants),
      duration: Date.now() - transaction.startTime
    };
  }
}

// 参与者实现示例
class TransactionParticipant {
  constructor(name, database) {
    this.name = name;
    this.database = database;
    this.preparedTransactions = new Map();
  }
  
  // 准备阶段
  async prepare(transactionId, operation) {
    try {
      console.log(`${this.name} preparing transaction ${transactionId}`);
      
      // 验证操作的有效性
      await this.validateOperation(operation);
      
      // 锁定资源
      const lockedResources = await this.lockResources(operation);
      
      // 记录准备状态
      this.preparedTransactions.set(transactionId, {
        operation,
        lockedResources,
        preparedAt: Date.now()
      });
      
      console.log(`${this.name} prepared transaction ${transactionId}`);
      return { prepared: true };
    } catch (error) {
      console.error(`${this.name} prepare failed:`, error);
      throw error;
    }
  }
  
  // 提交阶段
  async commit(transactionId) {
    const preparedTx = this.preparedTransactions.get(transactionId);
    if (!preparedTx) {
      throw new Error(`Transaction ${transactionId} not prepared`);
    }
    
    try {
      console.log(`${this.name} committing transaction ${transactionId}`);
      
      // 执行实际操作
      await this.executeOperation(preparedTx.operation);
      
      // 释放锁定的资源
      await this.releaseResources(preparedTx.lockedResources);
      
      // 清理准备状态
      this.preparedTransactions.delete(transactionId);
      
      console.log(`${this.name} committed transaction ${transactionId}`);
    } catch (error) {
      console.error(`${this.name} commit failed:`, error);
      throw error;
    }
  }
  
  // 中止阶段
  async abort(transactionId) {
    const preparedTx = this.preparedTransactions.get(transactionId);
    if (!preparedTx) {
      console.log(`${this.name} transaction ${transactionId} not prepared, nothing to abort`);
      return;
    }
    
    try {
      console.log(`${this.name} aborting transaction ${transactionId}`);
      
      // 释放锁定的资源
      await this.releaseResources(preparedTx.lockedResources);
      
      // 清理准备状态
      this.preparedTransactions.delete(transactionId);
      
      console.log(`${this.name} aborted transaction ${transactionId}`);
    } catch (error) {
      console.error(`${this.name} abort failed:`, error);
    }
  }
  
  // 验证操作
  async validateOperation(operation) {
    // 模拟验证逻辑
    if (!operation.data || !operation.type) {
      throw new Error('Invalid operation data');
    }
    
    // 检查业务规则
    if (operation.type === 'transfer' && operation.data.amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }
    
    // 模拟异步验证
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 锁定资源
  async lockResources(operation) {
    // 模拟资源锁定
    const resources = operation.data.resources || [];
    const lockedResources = [];
    
    for (const resource of resources) {
      // 模拟锁定逻辑
      console.log(`${this.name} locking resource: ${resource}`);
      lockedResources.push(resource);
    }
    
    return lockedResources;
  }
  
  // 执行操作
  async executeOperation(operation) {
    // 模拟数据库操作
    console.log(`${this.name} executing operation:`, operation.type);
    
    switch (operation.type) {
      case 'create_order':
        await this.database.orders.create(operation.data);
        break;
      case 'update_inventory':
        await this.database.inventory.update(operation.data);
        break;
      case 'process_payment':
        await this.database.payments.create(operation.data);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
    
    // 模拟执行时间
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // 释放资源
  async releaseResources(lockedResources) {
    for (const resource of lockedResources) {
      console.log(`${this.name} releasing resource: ${resource}`);
    }
  }
}

// 使用示例
async function twoPhaseCommitExample() {
  // 模拟数据库
  const mockDatabase = {
    orders: {
      create: async (data) => console.log('Order created:', data)
    },
    inventory: {
      update: async (data) => console.log('Inventory updated:', data)
    },
    payments: {
      create: async (data) => console.log('Payment processed:', data)
    }
  };
  
  // 创建协调器和参与者
  const coordinator = new TwoPhaseCommitCoordinator();
  
  const orderService = new TransactionParticipant('OrderService', mockDatabase);
  const inventoryService = new TransactionParticipant('InventoryService', mockDatabase);
  const paymentService = new TransactionParticipant('PaymentService', mockDatabase);
  
  // 注册参与者
  coordinator.registerParticipant('order-service', orderService);
  coordinator.registerParticipant('inventory-service', inventoryService);
  coordinator.registerParticipant('payment-service', paymentService);
  
  // 执行分布式事务
  const transactionId = 'tx_' + Date.now();
  const operations = [
    {
      participantId: 'order-service',
      type: 'create_order',
      data: {
        orderId: 'order_123',
        userId: 'user_456',
        items: [{ productId: 'prod_789', quantity: 2 }],
        resources: ['order_123']
      }
    },
    {
      participantId: 'inventory-service',
      type: 'update_inventory',
      data: {
        productId: 'prod_789',
        quantity: -2,
        resources: ['prod_789']
      }
    },
    {
      participantId: 'payment-service',
      type: 'process_payment',
      data: {
        orderId: 'order_123',
        amount: 99.99,
        paymentMethod: 'credit_card',
        resources: ['payment_123']
      }
    }
  ];
  
  const result = await coordinator.beginTransaction(transactionId, operations);
  console.log('Transaction result:', result);
  
  // 监控事务状态
  const status = coordinator.getTransactionStatus(transactionId);
  console.log('Transaction status:', status);
}

// twoPhaseCommitExample();
```

### 2. Saga 模式

```javascript
// Saga 编排器实现
class SagaOrchestrator {
  constructor() {
    this.sagas = new Map();
    this.stepHandlers = new Map();
    this.compensationHandlers = new Map();
  }
  
  // 注册步骤处理器
  registerStepHandler(stepName, handler) {
    this.stepHandlers.set(stepName, handler);
  }
  
  // 注册补偿处理器
  registerCompensationHandler(stepName, handler) {
    this.compensationHandlers.set(stepName, handler);
  }
  
  // 开始 Saga
  async startSaga(sagaId, steps) {
    const saga = {
      id: sagaId,
      steps,
      currentStep: 0,
      completedSteps: [],
      status: 'RUNNING',
      startTime: Date.now(),
      context: {}
    };
    
    this.sagas.set(sagaId, saga);
    
    try {
      await this.executeSaga(saga);
      saga.status = 'COMPLETED';
      console.log(`Saga ${sagaId} completed successfully`);
      return { success: true, sagaId };
    } catch (error) {
      saga.status = 'COMPENSATING';
      console.error(`Saga ${sagaId} failed, starting compensation:`, error);
      await this.compensateSaga(saga);
      saga.status = 'COMPENSATED';
      return { success: false, error: error.message };
    }
  }
  
  // 执行 Saga
  async executeSaga(saga) {
    for (let i = saga.currentStep; i < saga.steps.length; i++) {
      const step = saga.steps[i];
      saga.currentStep = i;
      
      console.log(`Executing step ${i + 1}/${saga.steps.length}: ${step.name}`);
      
      try {
        const handler = this.stepHandlers.get(step.name);
        if (!handler) {
          throw new Error(`No handler found for step: ${step.name}`);
        }
        
        const result = await handler.execute(step.data, saga.context);
        
        saga.completedSteps.push({
          step,
          result,
          completedAt: Date.now()
        });
        
        // 更新上下文
        if (result && typeof result === 'object') {
          Object.assign(saga.context, result);
        }
        
        console.log(`Step ${step.name} completed successfully`);
      } catch (error) {
        console.error(`Step ${step.name} failed:`, error);
        throw error;
      }
    }
  }
  
  // 补偿 Saga
  async compensateSaga(saga) {
    console.log(`Starting compensation for saga ${saga.id}`);
    
    // 按相反顺序执行补偿
    for (let i = saga.completedSteps.length - 1; i >= 0; i--) {
      const completedStep = saga.completedSteps[i];
      const step = completedStep.step;
      
      console.log(`Compensating step: ${step.name}`);
      
      try {
        const compensationHandler = this.compensationHandlers.get(step.name);
        if (compensationHandler) {
          await compensationHandler.compensate(
            completedStep.result,
            saga.context
          );
          console.log(`Step ${step.name} compensated successfully`);
        } else {
          console.warn(`No compensation handler for step: ${step.name}`);
        }
      } catch (error) {
        console.error(`Compensation failed for step ${step.name}:`, error);
        // 继续补偿其他步骤
      }
    }
    
    console.log(`Compensation completed for saga ${saga.id}`);
  }
  
  // 获取 Saga 状态
  getSagaStatus(sagaId) {
    const saga = this.sagas.get(sagaId);
    if (!saga) {
      return null;
    }
    
    return {
      id: saga.id,
      status: saga.status,
      currentStep: saga.currentStep,
      totalSteps: saga.steps.length,
      completedSteps: saga.completedSteps.length,
      duration: Date.now() - saga.startTime
    };
  }
}

// 步骤处理器基类
class SagaStepHandler {
  constructor(name) {
    this.name = name;
  }
  
  async execute(data, context) {
    throw new Error('Execute method must be implemented');
  }
  
  async compensate(result, context) {
    throw new Error('Compensate method must be implemented');
  }
}

// 订单创建步骤
class CreateOrderStepHandler extends SagaStepHandler {
  constructor(orderService) {
    super('create_order');
    this.orderService = orderService;
  }
  
  async execute(data, context) {
    console.log('Creating order:', data);
    
    const order = await this.orderService.createOrder({
      userId: data.userId,
      items: data.items,
      totalAmount: data.totalAmount
    });
    
    return { orderId: order.id, orderData: order };
  }
  
  async compensate(result, context) {
    console.log('Cancelling order:', result.orderId);
    await this.orderService.cancelOrder(result.orderId);
  }
}

// 库存扣减步骤
class ReserveInventoryStepHandler extends SagaStepHandler {
  constructor(inventoryService) {
    super('reserve_inventory');
    this.inventoryService = inventoryService;
  }
  
  async execute(data, context) {
    console.log('Reserving inventory for order:', context.orderId);
    
    const reservations = [];
    
    for (const item of data.items) {
      const reservation = await this.inventoryService.reserveInventory(
        item.productId,
        item.quantity
      );
      reservations.push(reservation);
    }
    
    return { reservations };
  }
  
  async compensate(result, context) {
    console.log('Releasing inventory reservations');
    
    for (const reservation of result.reservations) {
      await this.inventoryService.releaseReservation(reservation.id);
    }
  }
}

// 支付处理步骤
class ProcessPaymentStepHandler extends SagaStepHandler {
  constructor(paymentService) {
    super('process_payment');
    this.paymentService = paymentService;
  }
  
  async execute(data, context) {
    console.log('Processing payment for order:', context.orderId);
    
    const payment = await this.paymentService.processPayment({
      orderId: context.orderId,
      amount: data.totalAmount,
      paymentMethod: data.paymentMethod
    });
    
    return { paymentId: payment.id, paymentData: payment };
  }
  
  async compensate(result, context) {
    console.log('Refunding payment:', result.paymentId);
    await this.paymentService.refundPayment(result.paymentId);
  }
}

// 订单确认步骤
class ConfirmOrderStepHandler extends SagaStepHandler {
  constructor(orderService) {
    super('confirm_order');
    this.orderService = orderService;
  }
  
  async execute(data, context) {
    console.log('Confirming order:', context.orderId);
    
    await this.orderService.confirmOrder(context.orderId, {
      paymentId: context.paymentId,
      reservations: context.reservations
    });
    
    return { confirmed: true };
  }
  
  async compensate(result, context) {
    console.log('Order confirmation compensation not needed');
    // 订单确认的补偿通常由前面的步骤处理
  }
}

// 模拟服务
class MockOrderService {
  constructor() {
    this.orders = new Map();
  }
  
  async createOrder(orderData) {
    const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const order = {
      id: orderId,
      ...orderData,
      status: 'PENDING',
      createdAt: Date.now()
    };
    
    this.orders.set(orderId, order);
    
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return order;
  }
  
  async confirmOrder(orderId, confirmationData) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    order.status = 'CONFIRMED';
    order.confirmedAt = Date.now();
    order.confirmationData = confirmationData;
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  async cancelOrder(orderId) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    order.status = 'CANCELLED';
    order.cancelledAt = Date.now();
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

class MockInventoryService {
  constructor() {
    this.inventory = new Map([
      ['prod_1', { productId: 'prod_1', available: 100 }],
      ['prod_2', { productId: 'prod_2', available: 50 }]
    ]);
    this.reservations = new Map();
  }
  
  async reserveInventory(productId, quantity) {
    const product = this.inventory.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    
    if (product.available < quantity) {
      throw new Error(`Insufficient inventory for product ${productId}`);
    }
    
    const reservationId = 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const reservation = {
      id: reservationId,
      productId,
      quantity,
      reservedAt: Date.now()
    };
    
    product.available -= quantity;
    this.reservations.set(reservationId, reservation);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return reservation;
  }
  
  async releaseReservation(reservationId) {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) {
      throw new Error(`Reservation ${reservationId} not found`);
    }
    
    const product = this.inventory.get(reservation.productId);
    if (product) {
      product.available += reservation.quantity;
    }
    
    this.reservations.delete(reservationId);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

class MockPaymentService {
  constructor() {
    this.payments = new Map();
  }
  
  async processPayment(paymentData) {
    // 模拟支付失败（10% 概率）
    if (Math.random() < 0.1) {
      throw new Error('Payment processing failed');
    }
    
    const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const payment = {
      id: paymentId,
      ...paymentData,
      status: 'COMPLETED',
      processedAt: Date.now()
    };
    
    this.payments.set(paymentId, payment);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return payment;
  }
  
  async refundPayment(paymentId) {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }
    
    payment.status = 'REFUNDED';
    payment.refundedAt = Date.now();
    
    await new Promise(resolve => setTimeout(resolve, 150));
  }
}

// 使用示例
async function sagaExample() {
  // 创建服务实例
  const orderService = new MockOrderService();
  const inventoryService = new MockInventoryService();
  const paymentService = new MockPaymentService();
  
  // 创建 Saga 编排器
  const orchestrator = new SagaOrchestrator();
  
  // 注册步骤处理器
  const createOrderHandler = new CreateOrderStepHandler(orderService);
  const reserveInventoryHandler = new ReserveInventoryStepHandler(inventoryService);
  const processPaymentHandler = new ProcessPaymentStepHandler(paymentService);
  const confirmOrderHandler = new ConfirmOrderStepHandler(orderService);
  
  orchestrator.registerStepHandler('create_order', createOrderHandler);
  orchestrator.registerStepHandler('reserve_inventory', reserveInventoryHandler);
  orchestrator.registerStepHandler('process_payment', processPaymentHandler);
  orchestrator.registerStepHandler('confirm_order', confirmOrderHandler);
  
  // 注册补偿处理器
  orchestrator.registerCompensationHandler('create_order', createOrderHandler);
  orchestrator.registerCompensationHandler('reserve_inventory', reserveInventoryHandler);
  orchestrator.registerCompensationHandler('process_payment', processPaymentHandler);
  orchestrator.registerCompensationHandler('confirm_order', confirmOrderHandler);
  
  // 定义 Saga 步骤
  const sagaSteps = [
    {
      name: 'create_order',
      data: {
        userId: 'user_123',
        items: [
          { productId: 'prod_1', quantity: 2 },
          { productId: 'prod_2', quantity: 1 }
        ],
        totalAmount: 299.99
      }
    },
    {
      name: 'reserve_inventory',
      data: {
        items: [
          { productId: 'prod_1', quantity: 2 },
          { productId: 'prod_2', quantity: 1 }
        ]
      }
    },
    {
      name: 'process_payment',
      data: {
        totalAmount: 299.99,
        paymentMethod: 'credit_card'
      }
    },
    {
      name: 'confirm_order',
      data: {}
    }
  ];
  
  // 执行 Saga
  const sagaId = 'saga_' + Date.now();
  const result = await orchestrator.startSaga(sagaId, sagaSteps);
  
  console.log('Saga result:', result);
  
  // 监控 Saga 状态
  const status = orchestrator.getSagaStatus(sagaId);
  console.log('Saga status:', status);
}

// sagaExample();
```

### 3. 事件溯源模式

```javascript
// 事件存储
class EventStore {
  constructor() {
    this.events = [];
    this.snapshots = new Map();
    this.eventHandlers = new Map();
  }
  
  // 保存事件
  async saveEvent(aggregateId, event) {
    const eventWithMetadata = {
      ...event,
      aggregateId,
      eventId: this.generateEventId(),
      timestamp: Date.now(),
      version: await this.getNextVersion(aggregateId)
    };
    
    this.events.push(eventWithMetadata);
    
    // 触发事件处理器
    await this.publishEvent(eventWithMetadata);
    
    console.log(`Event saved: ${event.type} for aggregate ${aggregateId}`);
    return eventWithMetadata;
  }
  
  // 获取聚合的事件
  async getEvents(aggregateId, fromVersion = 0) {
    return this.events.filter(event => 
      event.aggregateId === aggregateId && event.version > fromVersion
    );
  }
  
  // 获取所有事件
  async getAllEvents(fromTimestamp = 0) {
    return this.events.filter(event => event.timestamp >= fromTimestamp);
  }
  
  // 保存快照
  async saveSnapshot(aggregateId, snapshot) {
    const snapshotWithMetadata = {
      ...snapshot,
      aggregateId,
      snapshotId: this.generateSnapshotId(),
      timestamp: Date.now()
    };
    
    this.snapshots.set(aggregateId, snapshotWithMetadata);
    console.log(`Snapshot saved for aggregate ${aggregateId}`);
  }
  
  // 获取快照
  async getSnapshot(aggregateId) {
    return this.snapshots.get(aggregateId);
  }
  
  // 注册事件处理器
  registerEventHandler(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }
  
  // 发布事件
  async publishEvent(event) {
    const handlers = this.eventHandlers.get(event.type) || [];
    
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Event handler failed for ${event.type}:`, error);
      }
    }
  }
  
  // 获取下一个版本号
  async getNextVersion(aggregateId) {
    const events = await this.getEvents(aggregateId);
    return events.length;
  }
  
  generateEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  generateSnapshotId() {
    return 'snap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// 聚合根基类
class AggregateRoot {
  constructor(id) {
    this.id = id;
    this.version = 0;
    this.uncommittedEvents = [];
  }
  
  // 应用事件
  applyEvent(event) {
    this.handleEvent(event);
    this.version++;
  }
  
  // 添加事件
  addEvent(event) {
    this.applyEvent(event);
    this.uncommittedEvents.push(event);
  }
  
  // 获取未提交的事件
  getUncommittedEvents() {
    return [...this.uncommittedEvents];
  }
  
  // 标记事件已提交
  markEventsAsCommitted() {
    this.uncommittedEvents = [];
  }
  
  // 从事件重建聚合
  static fromEvents(id, events) {
    const aggregate = new this(id);
    
    for (const event of events) {
      aggregate.applyEvent(event);
    }
    
    return aggregate;
  }
  
  // 处理事件（子类实现）
  handleEvent(event) {
    throw new Error('handleEvent must be implemented by subclass');
  }
}

// 订单聚合
class OrderAggregate extends AggregateRoot {
  constructor(id) {
    super(id);
    this.userId = null;
    this.items = [];
    this.totalAmount = 0;
    this.status = 'PENDING';
    this.paymentId = null;
    this.createdAt = null;
  }
  
  // 创建订单
  createOrder(userId, items, totalAmount) {
    if (this.status !== 'PENDING') {
      throw new Error('Order already exists');
    }
    
    this.addEvent({
      type: 'OrderCreated',
      data: {
        userId,
        items,
        totalAmount,
        createdAt: Date.now()
      }
    });
  }
  
  // 确认订单
  confirmOrder(paymentId) {
    if (this.status !== 'PENDING') {
      throw new Error('Order cannot be confirmed');
    }
    
    this.addEvent({
      type: 'OrderConfirmed',
      data: {
        paymentId,
        confirmedAt: Date.now()
      }
    });
  }
  
  // 取消订单
  cancelOrder(reason) {
    if (this.status === 'CANCELLED') {
      throw new Error('Order already cancelled');
    }
    
    this.addEvent({
      type: 'OrderCancelled',
      data: {
        reason,
        cancelledAt: Date.now()
      }
    });
  }
  
  // 处理事件
  handleEvent(event) {
    switch (event.type) {
      case 'OrderCreated':
        this.userId = event.data.userId;
        this.items = event.data.items;
        this.totalAmount = event.data.totalAmount;
        this.status = 'PENDING';
        this.createdAt = event.data.createdAt;
        break;
        
      case 'OrderConfirmed':
        this.status = 'CONFIRMED';
        this.paymentId = event.data.paymentId;
        break;
        
      case 'OrderCancelled':
        this.status = 'CANCELLED';
        break;
        
      default:
        console.warn(`Unknown event type: ${event.type}`);
    }
  }
}

// 仓储模式
class OrderRepository {
  constructor(eventStore) {
    this.eventStore = eventStore;
  }
  
  // 保存聚合
  async save(aggregate) {
    const uncommittedEvents = aggregate.getUncommittedEvents();
    
    for (const event of uncommittedEvents) {
      await this.eventStore.saveEvent(aggregate.id, event);
    }
    
    aggregate.markEventsAsCommitted();
    
    // 定期保存快照
    if (aggregate.version % 10 === 0) {
      await this.saveSnapshot(aggregate);
    }
  }
  
  // 获取聚合
  async getById(id) {
    // 尝试从快照恢复
    const snapshot = await this.eventStore.getSnapshot(id);
    let fromVersion = 0;
    let aggregate;
    
    if (snapshot) {
      aggregate = this.fromSnapshot(id, snapshot);
      fromVersion = snapshot.version;
    } else {
      aggregate = new OrderAggregate(id);
    }
    
    // 应用快照之后的事件
    const events = await this.eventStore.getEvents(id, fromVersion);
    
    for (const event of events) {
      aggregate.applyEvent(event);
    }
    
    return aggregate;
  }
  
  // 保存快照
  async saveSnapshot(aggregate) {
    const snapshot = {
      version: aggregate.version,
      data: {
        userId: aggregate.userId,
        items: aggregate.items,
        totalAmount: aggregate.totalAmount,
        status: aggregate.status,
        paymentId: aggregate.paymentId,
        createdAt: aggregate.createdAt
      }
    };
    
    await this.eventStore.saveSnapshot(aggregate.id, snapshot);
  }
  
  // 从快照恢复
  fromSnapshot(id, snapshot) {
    const aggregate = new OrderAggregate(id);
    aggregate.version = snapshot.version;
    
    const data = snapshot.data;
    aggregate.userId = data.userId;
    aggregate.items = data.items;
    aggregate.totalAmount = data.totalAmount;
    aggregate.status = data.status;
    aggregate.paymentId = data.paymentId;
    aggregate.createdAt = data.createdAt;
    
    return aggregate;
  }
}

// 投影构建器
class OrderProjectionBuilder {
  constructor(eventStore) {
    this.eventStore = eventStore;
    this.projections = new Map();
    
    // 注册事件处理器
    this.eventStore.registerEventHandler('OrderCreated', this.handleOrderCreated.bind(this));
    this.eventStore.registerEventHandler('OrderConfirmed', this.handleOrderConfirmed.bind(this));
    this.eventStore.registerEventHandler('OrderCancelled', this.handleOrderCancelled.bind(this));
  }
  
  // 处理订单创建事件
  async handleOrderCreated(event) {
    const projection = {
      orderId: event.aggregateId,
      userId: event.data.userId,
      items: event.data.items,
      totalAmount: event.data.totalAmount,
      status: 'PENDING',
      createdAt: event.data.createdAt,
      updatedAt: event.timestamp
    };
    
    this.projections.set(event.aggregateId, projection);
    console.log(`Order projection created: ${event.aggregateId}`);
  }
  
  // 处理订单确认事件
  async handleOrderConfirmed(event) {
    const projection = this.projections.get(event.aggregateId);
    if (projection) {
      projection.status = 'CONFIRMED';
      projection.paymentId = event.data.paymentId;
      projection.updatedAt = event.timestamp;
      console.log(`Order projection updated: ${event.aggregateId}`);
    }
  }
  
  // 处理订单取消事件
  async handleOrderCancelled(event) {
    const projection = this.projections.get(event.aggregateId);
    if (projection) {
      projection.status = 'CANCELLED';
      projection.updatedAt = event.timestamp;
      console.log(`Order projection updated: ${event.aggregateId}`);
    }
  }
  
  // 获取投影
  getProjection(orderId) {
    return this.projections.get(orderId);
  }
  
  // 获取所有投影
  getAllProjections() {
    return Array.from(this.projections.values());
  }
  
  // 重建投影
  async rebuildProjections() {
    this.projections.clear();
    
    const events = await this.eventStore.getAllEvents();
    
    for (const event of events) {
      await this.eventStore.publishEvent(event);
    }
    
    console.log('Projections rebuilt successfully');
  }
}

// 使用示例
async function eventSourcingExample() {
  // 创建事件存储
  const eventStore = new EventStore();
  
  // 创建仓储和投影构建器
  const orderRepository = new OrderRepository(eventStore);
  const projectionBuilder = new OrderProjectionBuilder(eventStore);
  
  // 创建订单
  const orderId = 'order_' + Date.now();
  const order = new OrderAggregate(orderId);
  
  order.createOrder('user_123', [
    { productId: 'prod_1', quantity: 2, price: 99.99 },
    { productId: 'prod_2', quantity: 1, price: 149.99 }
  ], 349.97);
  
  // 保存订单
  await orderRepository.save(order);
  
  // 确认订单
  order.confirmOrder('payment_456');
  await orderRepository.save(order);
  
  // 从事件存储重建订单
  const rebuiltOrder = await orderRepository.getById(orderId);
  console.log('Rebuilt order:', {
    id: rebuiltOrder.id,
    status: rebuiltOrder.status,
    totalAmount: rebuiltOrder.totalAmount,
    version: rebuiltOrder.version
  });
  
  // 查看投影
  const projection = projectionBuilder.getProjection(orderId);
  console.log('Order projection:', projection);
  
  // 模拟取消订单
  const anotherOrderId = 'order_' + (Date.now() + 1000);
  const anotherOrder = new OrderAggregate(anotherOrderId);
  
  anotherOrder.createOrder('user_456', [
    { productId: 'prod_3', quantity: 1, price: 199.99 }
  ], 199.99);
  
  await orderRepository.save(anotherOrder);
  
  anotherOrder.cancelOrder('Customer requested cancellation');
  await orderRepository.save(anotherOrder);
  
  // 查看所有投影
  const allProjections = projectionBuilder.getAllProjections();
  console.log('All order projections:', allProjections);
}

// eventSourcingExample();
```

## 最佳实践

### 设计原则

1. **选择合适的模式**
   - 2PC：强一致性要求，参与者较少
   - Saga：长时间运行的业务流程
   - 事件溯源：需要完整的审计日志

2. **幂等性设计**
   - 确保操作的幂等性
   - 使用唯一标识符防止重复执行
   - 实现去重机制

3. **错误处理**
   - 实现完善的补偿机制
   - 设计重试策略
   - 记录详细的错误日志

4. **性能优化**
   - 减少分布式事务的使用
   - 优化事务的粒度
   - 使用异步处理提高性能

### 运维实践

1. **监控和告警**
   - 监控事务的成功率和延迟
   - 设置关键指标的告警
   - 实现分布式追踪

2. **数据一致性检查**
   - 定期检查数据一致性
   - 实现数据修复机制
   - 建立数据对账流程

3. **容灾和恢复**
   - 设计故障恢复策略
   - 实现数据备份和恢复
   - 建立应急响应流程

## 参考资源

- [分布式事务模式](https://microservices.io/patterns/data/distributed-transactions.html)
- [Saga 模式详解](https://microservices.io/patterns/data/saga.html)
- [事件溯源模式](https://martinfowler.com/eaaDev/EventSourcing.html)
- [两阶段提交协议](https://en.wikipedia.org/wiki/Two-phase_commit_protocol)
- [最终一致性](https://en.wikipedia.org/wiki/Eventual_consistency)

---

本指南涵盖了微服务分布式事务的核心概念、实现模式和最佳实践，为构建可靠的分布式系统提供了全面的技术指导。