# TCP/IP协议

TCP/IP（Transmission Control Protocol/Internet Protocol）是互联网的基础协议栈，定义了数据在网络中如何传输、路由和处理。它是一个分层的协议族，为现代网络通信提供了可靠的基础。

## 协议栈概述

### TCP/IP四层模型

```javascript
// TCP/IP协议栈模拟
class TCPIPStack {
  constructor() {
    this.layers = {
      application: new ApplicationLayer(),
      transport: new TransportLayer(),
      internet: new InternetLayer(),
      networkAccess: new NetworkAccessLayer()
    };
  }

  // 数据发送流程
  send(data, destination) {
    console.log('=== 数据发送流程 ===');
    
    // 应用层：准备数据
    let packet = this.layers.application.prepareData(data);
    console.log('应用层：', packet);
    
    // 传输层：添加TCP/UDP头部
    packet = this.layers.transport.addHeader(packet, destination.port);
    console.log('传输层：', packet);
    
    // 网络层：添加IP头部
    packet = this.layers.internet.addHeader(packet, destination.ip);
    console.log('网络层：', packet);
    
    // 网络接入层：添加以太网头部
    packet = this.layers.networkAccess.addHeader(packet, destination.mac);
    console.log('网络接入层：', packet);
    
    return packet;
  }

  // 数据接收流程
  receive(packet) {
    console.log('=== 数据接收流程 ===');
    
    // 网络接入层：处理以太网头部
    packet = this.layers.networkAccess.processHeader(packet);
    console.log('网络接入层处理后：', packet);
    
    // 网络层：处理IP头部
    packet = this.layers.internet.processHeader(packet);
    console.log('网络层处理后：', packet);
    
    // 传输层：处理TCP/UDP头部
    packet = this.layers.transport.processHeader(packet);
    console.log('传输层处理后：', packet);
    
    // 应用层：提取数据
    const data = this.layers.application.extractData(packet);
    console.log('应用层提取的数据：', data);
    
    return data;
  }
}

// 应用层
class ApplicationLayer {
  prepareData(data) {
    return {
      type: 'APPLICATION',
      payload: data,
      timestamp: Date.now()
    };
  }

  extractData(packet) {
    return packet.payload;
  }
}

// 传输层
class TransportLayer {
  addHeader(packet, destinationPort) {
    return {
      type: 'TRANSPORT',
      protocol: 'TCP',
      sourcePort: Math.floor(Math.random() * 65535),
      destinationPort,
      sequenceNumber: Math.floor(Math.random() * 4294967295),
      acknowledgmentNumber: 0,
      flags: { SYN: false, ACK: false, FIN: false },
      windowSize: 65535,
      checksum: this.calculateChecksum(packet),
      payload: packet
    };
  }

  processHeader(packet) {
    console.log(`TCP头部信息: ${packet.sourcePort} -> ${packet.destinationPort}`);
    return packet.payload;
  }

  calculateChecksum(data) {
    // 简化的校验和计算
    return Math.floor(Math.random() * 65535);
  }
}

// 网络层
class InternetLayer {
  addHeader(packet, destinationIP) {
    return {
      type: 'INTERNET',
      version: 4,
      headerLength: 20,
      typeOfService: 0,
      totalLength: this.calculateLength(packet),
      identification: Math.floor(Math.random() * 65535),
      flags: { DF: true, MF: false },
      fragmentOffset: 0,
      timeToLive: 64,
      protocol: 6, // TCP
      headerChecksum: this.calculateChecksum(packet),
      sourceIP: this.getLocalIP(),
      destinationIP,
      payload: packet
    };
  }

  processHeader(packet) {
    console.log(`IP路由: ${packet.sourceIP} -> ${packet.destinationIP}`);
    return packet.payload;
  }

  calculateLength(packet) {
    return JSON.stringify(packet).length;
  }

  calculateChecksum(packet) {
    return Math.floor(Math.random() * 65535);
  }

  getLocalIP() {
    return '192.168.1.100';
  }
}

// 网络接入层
class NetworkAccessLayer {
  addHeader(packet, destinationMAC) {
    return {
      type: 'NETWORK_ACCESS',
      destinationMAC,
      sourceMAC: this.getLocalMAC(),
      etherType: 0x0800, // IPv4
      payload: packet,
      frameCheckSequence: this.calculateFCS(packet)
    };
  }

  processHeader(packet) {
    console.log(`以太网帧: ${packet.sourceMAC} -> ${packet.destinationMAC}`);
    return packet.payload;
  }

  getLocalMAC() {
    return '00:11:22:33:44:55';
  }

  calculateFCS(packet) {
    return Math.floor(Math.random() * 4294967295);
  }
}

// 使用示例
const stack = new TCPIPStack();
const destination = {
  ip: '192.168.1.200',
  port: 80,
  mac: '66:77:88:99:AA:BB'
};

const packet = stack.send('Hello, World!', destination);
const receivedData = stack.receive(packet);
```

## TCP协议详解

### TCP连接管理

```javascript
// TCP连接状态机
class TCPConnection {
  constructor() {
    this.state = 'CLOSED';
    this.sequenceNumber = Math.floor(Math.random() * 4294967295);
    this.acknowledgmentNumber = 0;
    this.windowSize = 65535;
    this.congestionWindow = 1;
    this.ssthresh = 65535;
    this.rtt = 100; // 往返时间（毫秒）
    this.rto = 200; // 重传超时时间
  }

  // 三次握手 - 客户端发起连接
  connect(serverIP, serverPort) {
    console.log('=== TCP三次握手 ===');
    
    // 第一次握手：发送SYN
    this.state = 'SYN_SENT';
    const synPacket = this.createPacket({
      SYN: true,
      sequenceNumber: this.sequenceNumber
    });
    console.log('1. 客户端发送SYN:', synPacket);
    
    // 模拟服务器响应SYN-ACK
    setTimeout(() => {
      const synAckPacket = {
        SYN: true,
        ACK: true,
        sequenceNumber: Math.floor(Math.random() * 4294967295),
        acknowledgmentNumber: this.sequenceNumber + 1
      };
      console.log('2. 服务器响应SYN-ACK:', synAckPacket);
      
      // 第三次握手：发送ACK
      this.acknowledgmentNumber = synAckPacket.sequenceNumber + 1;
      this.sequenceNumber++;
      this.state = 'ESTABLISHED';
      
      const ackPacket = this.createPacket({
        ACK: true,
        sequenceNumber: this.sequenceNumber,
        acknowledgmentNumber: this.acknowledgmentNumber
      });
      console.log('3. 客户端发送ACK:', ackPacket);
      console.log('连接建立成功！');
    }, 50);
  }

  // 四次挥手 - 关闭连接
  close() {
    console.log('=== TCP四次挥手 ===');
    
    // 第一次挥手：发送FIN
    this.state = 'FIN_WAIT_1';
    const finPacket = this.createPacket({
      FIN: true,
      sequenceNumber: this.sequenceNumber
    });
    console.log('1. 客户端发送FIN:', finPacket);
    
    // 模拟服务器响应
    setTimeout(() => {
      // 第二次挥手：服务器ACK
      const ackPacket = {
        ACK: true,
        acknowledgmentNumber: this.sequenceNumber + 1
      };
      console.log('2. 服务器发送ACK:', ackPacket);
      this.state = 'FIN_WAIT_2';
      
      // 第三次挥手：服务器FIN
      setTimeout(() => {
        const serverFinPacket = {
          FIN: true,
          sequenceNumber: Math.floor(Math.random() * 4294967295)
        };
        console.log('3. 服务器发送FIN:', serverFinPacket);
        
        // 第四次挥手：客户端ACK
        this.state = 'TIME_WAIT';
        const finalAckPacket = this.createPacket({
          ACK: true,
          acknowledgmentNumber: serverFinPacket.sequenceNumber + 1
        });
        console.log('4. 客户端发送ACK:', finalAckPacket);
        
        // TIME_WAIT状态等待
        setTimeout(() => {
          this.state = 'CLOSED';
          console.log('连接关闭完成！');
        }, 2000); // 2MSL等待时间
      }, 50);
    }, 50);
  }

  // 创建TCP数据包
  createPacket(options = {}) {
    return {
      sourcePort: 12345,
      destinationPort: 80,
      sequenceNumber: options.sequenceNumber || this.sequenceNumber,
      acknowledgmentNumber: options.acknowledgmentNumber || this.acknowledgmentNumber,
      headerLength: 20,
      flags: {
        URG: options.URG || false,
        ACK: options.ACK || false,
        PSH: options.PSH || false,
        RST: options.RST || false,
        SYN: options.SYN || false,
        FIN: options.FIN || false
      },
      windowSize: this.windowSize,
      checksum: 0,
      urgentPointer: 0,
      data: options.data || null
    };
  }

  // 获取当前状态
  getState() {
    return this.state;
  }
}

// TCP状态转换图
class TCPStateMachine {
  static getStateTransitions() {
    return {
      'CLOSED': {
        'active_open': 'SYN_SENT',
        'passive_open': 'LISTEN'
      },
      'LISTEN': {
        'receive_syn': 'SYN_RCVD',
        'send_syn': 'SYN_SENT',
        'close': 'CLOSED'
      },
      'SYN_SENT': {
        'receive_syn_ack': 'ESTABLISHED',
        'receive_syn': 'SYN_RCVD',
        'close': 'CLOSED'
      },
      'SYN_RCVD': {
        'receive_ack': 'ESTABLISHED',
        'close': 'FIN_WAIT_1'
      },
      'ESTABLISHED': {
        'close': 'FIN_WAIT_1',
        'receive_fin': 'CLOSE_WAIT'
      },
      'FIN_WAIT_1': {
        'receive_ack': 'FIN_WAIT_2',
        'receive_fin': 'CLOSING',
        'receive_fin_ack': 'TIME_WAIT'
      },
      'FIN_WAIT_2': {
        'receive_fin': 'TIME_WAIT'
      },
      'CLOSE_WAIT': {
        'close': 'LAST_ACK'
      },
      'CLOSING': {
        'receive_ack': 'TIME_WAIT'
      },
      'LAST_ACK': {
        'receive_ack': 'CLOSED'
      },
      'TIME_WAIT': {
        'timeout': 'CLOSED'
      }
    };
  }
}
```

### TCP流量控制

```javascript
// TCP滑动窗口实现
class TCPSlidingWindow {
  constructor(windowSize = 8) {
    this.windowSize = windowSize;
    this.sendBase = 0; // 发送窗口的左边界
    this.nextSeqNum = 0; // 下一个要发送的序列号
    this.expectedSeqNum = 0; // 期望接收的序列号
    this.buffer = new Map(); // 发送缓冲区
    this.receiveBuffer = new Map(); // 接收缓冲区
    this.timers = new Map(); // 重传定时器
    this.rtt = 100; // 往返时间
    this.timeout = 200; // 超时时间
  }

  // 发送数据
  send(data) {
    const packets = this.segmentData(data);
    
    packets.forEach(packet => {
      if (this.nextSeqNum < this.sendBase + this.windowSize) {
        this.sendPacket(packet);
      } else {
        console.log('发送窗口已满，等待ACK');
        // 在实际实现中，这里会将数据放入发送队列
      }
    });
  }

  // 发送单个数据包
  sendPacket(packet) {
    packet.sequenceNumber = this.nextSeqNum;
    packet.timestamp = Date.now();
    
    console.log(`发送数据包 SEQ=${packet.sequenceNumber}, 数据: ${packet.data}`);
    
    // 存储到发送缓冲区
    this.buffer.set(this.nextSeqNum, packet);
    
    // 启动重传定时器
    this.startTimer(this.nextSeqNum);
    
    this.nextSeqNum++;
    
    // 模拟网络传输
    this.simulateNetworkTransmission(packet);
  }

  // 接收ACK
  receiveAck(ackNumber) {
    console.log(`接收到ACK=${ackNumber}`);
    
    if (ackNumber > this.sendBase) {
      // 累积确认：确认所有小于ackNumber的数据包
      for (let seq = this.sendBase; seq < ackNumber; seq++) {
        if (this.buffer.has(seq)) {
          this.buffer.delete(seq);
          this.cancelTimer(seq);
        }
      }
      
      this.sendBase = ackNumber;
      console.log(`发送窗口滑动到 ${this.sendBase}`);
      
      // 如果还有未确认的数据包，重启定时器
      if (this.sendBase < this.nextSeqNum) {
        this.startTimer(this.sendBase);
      }
    }
  }

  // 接收数据包
  receivePacket(packet) {
    console.log(`接收到数据包 SEQ=${packet.sequenceNumber}, 数据: ${packet.data}`);
    
    if (packet.sequenceNumber === this.expectedSeqNum) {
      // 按序到达
      this.deliverData(packet.data);
      this.expectedSeqNum++;
      
      // 检查缓冲区中是否有连续的数据包
      while (this.receiveBuffer.has(this.expectedSeqNum)) {
        const bufferedPacket = this.receiveBuffer.get(this.expectedSeqNum);
        this.deliverData(bufferedPacket.data);
        this.receiveBuffer.delete(this.expectedSeqNum);
        this.expectedSeqNum++;
      }
      
      this.sendAck(this.expectedSeqNum);
    } else if (packet.sequenceNumber > this.expectedSeqNum) {
      // 失序到达，缓存数据包
      this.receiveBuffer.set(packet.sequenceNumber, packet);
      this.sendAck(this.expectedSeqNum); // 发送重复ACK
    } else {
      // 重复数据包，发送ACK
      this.sendAck(this.expectedSeqNum);
    }
  }

  // 发送ACK
  sendAck(ackNumber) {
    console.log(`发送ACK=${ackNumber}`);
    // 在实际实现中，这里会发送ACK数据包
  }

  // 交付数据给应用层
  deliverData(data) {
    console.log(`交付数据给应用层: ${data}`);
  }

  // 数据分段
  segmentData(data) {
    const maxSegmentSize = 10; // 最大段大小
    const segments = [];
    
    for (let i = 0; i < data.length; i += maxSegmentSize) {
      segments.push({
        data: data.substring(i, i + maxSegmentSize),
        sequenceNumber: 0, // 将在发送时设置
        timestamp: 0
      });
    }
    
    return segments;
  }

  // 启动重传定时器
  startTimer(sequenceNumber) {
    if (this.timers.has(sequenceNumber)) {
      clearTimeout(this.timers.get(sequenceNumber));
    }
    
    const timer = setTimeout(() => {
      this.handleTimeout(sequenceNumber);
    }, this.timeout);
    
    this.timers.set(sequenceNumber, timer);
  }

  // 取消定时器
  cancelTimer(sequenceNumber) {
    if (this.timers.has(sequenceNumber)) {
      clearTimeout(this.timers.get(sequenceNumber));
      this.timers.delete(sequenceNumber);
    }
  }

  // 处理超时
  handleTimeout(sequenceNumber) {
    console.log(`数据包 SEQ=${sequenceNumber} 超时，进行重传`);
    
    if (this.buffer.has(sequenceNumber)) {
      const packet = this.buffer.get(sequenceNumber);
      this.simulateNetworkTransmission(packet);
      this.startTimer(sequenceNumber);
    }
  }

  // 模拟网络传输
  simulateNetworkTransmission(packet) {
    // 模拟网络延迟和丢包
    const delay = Math.random() * 100;
    const lossRate = 0.1; // 10%丢包率
    
    if (Math.random() > lossRate) {
      setTimeout(() => {
        // 模拟接收方处理
        this.simulateReceiver(packet);
      }, delay);
    } else {
      console.log(`数据包 SEQ=${packet.sequenceNumber} 丢失`);
    }
  }

  // 模拟接收方
  simulateReceiver(packet) {
    // 模拟ACK延迟
    setTimeout(() => {
      this.receiveAck(packet.sequenceNumber + 1);
    }, Math.random() * 50);
  }
}

// 使用示例
const window = new TCPSlidingWindow(4);
window.send('Hello, this is a long message that will be segmented into multiple packets!');
```

### TCP拥塞控制

```javascript
// TCP拥塞控制算法
class TCPCongestionControl {
  constructor() {
    this.cwnd = 1; // 拥塞窗口
    this.ssthresh = 64; // 慢启动阈值
    this.state = 'SLOW_START'; // 状态：SLOW_START, CONGESTION_AVOIDANCE, FAST_RECOVERY
    this.duplicateAcks = 0; // 重复ACK计数
    this.lastAck = 0; // 最后收到的ACK
    this.rtt = 100; // 往返时间
    this.rttvar = 50; // RTT变化
    this.rto = 200; // 重传超时时间
  }

  // 接收到ACK时的处理
  onAckReceived(ackNumber, isNewAck = true) {
    if (isNewAck) {
      this.duplicateAcks = 0;
      this.lastAck = ackNumber;
      
      switch (this.state) {
        case 'SLOW_START':
          this.slowStart();
          break;
        case 'CONGESTION_AVOIDANCE':
          this.congestionAvoidance();
          break;
        case 'FAST_RECOVERY':
          this.fastRecovery();
          break;
      }
    } else {
      // 重复ACK
      this.duplicateAcks++;
      
      if (this.duplicateAcks === 3) {
        this.fastRetransmit();
      } else if (this.state === 'FAST_RECOVERY') {
        this.cwnd++; // 快速恢复期间增加拥塞窗口
      }
    }
    
    this.logState();
  }

  // 慢启动算法
  slowStart() {
    this.cwnd++; // 指数增长
    
    if (this.cwnd >= this.ssthresh) {
      this.state = 'CONGESTION_AVOIDANCE';
      console.log('切换到拥塞避免阶段');
    }
  }

  // 拥塞避免算法
  congestionAvoidance() {
    this.cwnd += 1 / this.cwnd; // 线性增长
  }

  // 快速重传
  fastRetransmit() {
    console.log('检测到3个重复ACK，执行快速重传');
    
    this.ssthresh = Math.max(this.cwnd / 2, 2);
    this.cwnd = this.ssthresh + 3;
    this.state = 'FAST_RECOVERY';
    
    // 重传丢失的数据包
    this.retransmitPacket(this.lastAck);
  }

  // 快速恢复
  fastRecovery() {
    this.cwnd = this.ssthresh;
    this.state = 'CONGESTION_AVOIDANCE';
    console.log('快速恢复完成，切换到拥塞避免');
  }

  // 超时处理
  onTimeout() {
    console.log('发生超时，执行拥塞控制');
    
    this.ssthresh = Math.max(this.cwnd / 2, 2);
    this.cwnd = 1;
    this.state = 'SLOW_START';
    this.duplicateAcks = 0;
    
    // 重传数据包
    this.retransmitPacket(this.lastAck);
    
    this.logState();
  }

  // RTT测量和RTO计算
  updateRTT(measuredRTT) {
    const alpha = 0.125;
    const beta = 0.25;
    
    // 平滑RTT计算
    this.rtt = (1 - alpha) * this.rtt + alpha * measuredRTT;
    
    // RTT变化计算
    this.rttvar = (1 - beta) * this.rttvar + beta * Math.abs(measuredRTT - this.rtt);
    
    // RTO计算
    this.rto = this.rtt + 4 * this.rttvar;
    
    console.log(`RTT更新: ${this.rtt.toFixed(2)}ms, RTO: ${this.rto.toFixed(2)}ms`);
  }

  // 重传数据包
  retransmitPacket(sequenceNumber) {
    console.log(`重传数据包 SEQ=${sequenceNumber}`);
    // 在实际实现中，这里会重传指定的数据包
  }

  // 获取有效窗口大小
  getEffectiveWindow(advertiseWindow) {
    return Math.min(this.cwnd, advertiseWindow);
  }

  // 记录状态
  logState() {
    console.log(`拥塞控制状态: ${this.state}, CWND: ${this.cwnd.toFixed(2)}, SSTHRESH: ${this.ssthresh}`);
  }
}

// 拥塞控制算法比较
class CongestionControlAlgorithms {
  // Reno算法
  static reno() {
    return new TCPCongestionControl();
  }

  // NewReno算法
  static newReno() {
    const control = new TCPCongestionControl();
    
    // 重写快速恢复逻辑
    control.fastRecovery = function() {
      // NewReno在快速恢复期间不立即退出
      if (this.isPartialAck()) {
        this.cwnd -= this.getRetransmittedBytes();
        this.retransmitNextPacket();
      } else {
        this.cwnd = this.ssthresh;
        this.state = 'CONGESTION_AVOIDANCE';
      }
    };
    
    return control;
  }

  // CUBIC算法
  static cubic() {
    const control = new TCPCongestionControl();
    let wMax = 0; // 上次拥塞时的窗口大小
    let k = 0; // 时间常数
    let epoch = 0; // 拥塞避免开始时间
    
    control.congestionAvoidance = function() {
      const t = Date.now() - epoch;
      const c = 0.4; // CUBIC参数
      
      // CUBIC函数
      const wCubic = c * Math.pow(t - k, 3) + wMax;
      
      if (wCubic > this.cwnd) {
        this.cwnd = wCubic;
      } else {
        // TCP友好模式
        this.cwnd += 1 / this.cwnd;
      }
    };
    
    return control;
  }

  // BBR算法
  static bbr() {
    return {
      state: 'STARTUP',
      cwnd: 1,
      pacingRate: 0,
      bottleneckBandwidth: 0,
      minRTT: Infinity,
      
      onAckReceived(deliveryRate, rtt) {
        this.updateBottleneckBandwidth(deliveryRate);
        this.updateMinRTT(rtt);
        
        switch (this.state) {
          case 'STARTUP':
            this.startup();
            break;
          case 'DRAIN':
            this.drain();
            break;
          case 'PROBE_BW':
            this.probeBandwidth();
            break;
          case 'PROBE_RTT':
            this.probeRTT();
            break;
        }
      },
      
      updateBottleneckBandwidth(deliveryRate) {
        this.bottleneckBandwidth = Math.max(this.bottleneckBandwidth, deliveryRate);
      },
      
      updateMinRTT(rtt) {
        this.minRTT = Math.min(this.minRTT, rtt);
      },
      
      startup() {
        this.cwnd *= 2; // 指数增长
        this.pacingRate = 2.89 * this.bottleneckBandwidth;
      },
      
      drain() {
        this.pacingRate = this.bottleneckBandwidth / 2.89;
      },
      
      probeBandwidth() {
        // 周期性探测带宽
        this.pacingRate = this.bottleneckBandwidth;
      },
      
      probeRTT() {
        this.cwnd = 4; // 最小窗口
      }
    };
  }
}
```

## IP协议详解

### IPv4数据包处理

```javascript
// IPv4数据包结构
class IPv4Packet {
  constructor(options = {}) {
    this.version = 4;
    this.headerLength = 5; // 20字节
    this.typeOfService = options.tos || 0;
    this.totalLength = 0; // 将在发送时计算
    this.identification = options.id || Math.floor(Math.random() * 65535);
    this.flags = {
      reserved: false,
      dontFragment: options.df || false,
      moreFragments: options.mf || false
    };
    this.fragmentOffset = options.fragmentOffset || 0;
    this.timeToLive = options.ttl || 64;
    this.protocol = options.protocol || 6; // TCP
    this.headerChecksum = 0;
    this.sourceIP = options.sourceIP || '0.0.0.0';
    this.destinationIP = options.destinationIP || '0.0.0.0';
    this.options = options.options || [];
    this.data = options.data || null;
  }

  // 计算头部校验和
  calculateChecksum() {
    // 简化的校验和计算
    const header = this.serializeHeader();
    let sum = 0;
    
    for (let i = 0; i < header.length; i += 2) {
      sum += (header[i] << 8) + (header[i + 1] || 0);
    }
    
    while (sum >> 16) {
      sum = (sum & 0xFFFF) + (sum >> 16);
    }
    
    return ~sum & 0xFFFF;
  }

  // 序列化头部
  serializeHeader() {
    const buffer = new ArrayBuffer(20);
    const view = new DataView(buffer);
    
    view.setUint8(0, (this.version << 4) | this.headerLength);
    view.setUint8(1, this.typeOfService);
    view.setUint16(2, this.totalLength);
    view.setUint16(4, this.identification);
    
    const flagsAndOffset = (this.flags.dontFragment ? 0x4000 : 0) |
                          (this.flags.moreFragments ? 0x2000 : 0) |
                          this.fragmentOffset;
    view.setUint16(6, flagsAndOffset);
    
    view.setUint8(8, this.timeToLive);
    view.setUint8(9, this.protocol);
    view.setUint16(10, this.headerChecksum);
    
    // IP地址
    const srcIP = this.ipToBytes(this.sourceIP);
    const dstIP = this.ipToBytes(this.destinationIP);
    
    view.setUint32(12, srcIP);
    view.setUint32(16, dstIP);
    
    return new Uint8Array(buffer);
  }

  // IP地址转换为字节
  ipToBytes(ip) {
    const parts = ip.split('.').map(Number);
    return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
  }

  // 字节转换为IP地址
  bytesToIP(bytes) {
    return [
      (bytes >>> 24) & 0xFF,
      (bytes >>> 16) & 0xFF,
      (bytes >>> 8) & 0xFF,
      bytes & 0xFF
    ].join('.');
  }

  // 数据包分片
  fragment(mtu = 1500) {
    const headerSize = this.headerLength * 4;
    const maxDataSize = mtu - headerSize;
    const dataSize = this.data ? this.data.length : 0;
    
    if (dataSize <= maxDataSize) {
      return [this]; // 不需要分片
    }
    
    const fragments = [];
    let offset = 0;
    
    while (offset < dataSize) {
      const fragmentSize = Math.min(maxDataSize, dataSize - offset);
      const isLastFragment = (offset + fragmentSize) >= dataSize;
      
      const fragment = new IPv4Packet({
        sourceIP: this.sourceIP,
        destinationIP: this.destinationIP,
        protocol: this.protocol,
        id: this.identification,
        mf: !isLastFragment,
        fragmentOffset: offset / 8, // 以8字节为单位
        data: this.data.slice(offset, offset + fragmentSize)
      });
      
      fragments.push(fragment);
      offset += fragmentSize;
    }
    
    return fragments;
  }

  // 重组分片
  static reassemble(fragments) {
    // 按偏移量排序
    fragments.sort((a, b) => a.fragmentOffset - b.fragmentOffset);
    
    let reassembledData = '';
    let expectedOffset = 0;
    
    for (const fragment of fragments) {
      if (fragment.fragmentOffset !== expectedOffset) {
        throw new Error('分片缺失或顺序错误');
      }
      
      reassembledData += fragment.data;
      expectedOffset += fragment.data.length / 8;
    }
    
    // 创建重组后的数据包
    const reassembled = new IPv4Packet({
      sourceIP: fragments[0].sourceIP,
      destinationIP: fragments[0].destinationIP,
      protocol: fragments[0].protocol,
      id: fragments[0].identification,
      data: reassembledData
    });
    
    return reassembled;
  }
}

// IP路由表
class RoutingTable {
  constructor() {
    this.routes = [];
  }

  // 添加路由
  addRoute(network, netmask, gateway, interface, metric = 1) {
    this.routes.push({
      network: this.ipToInt(network),
      netmask: this.ipToInt(netmask),
      gateway,
      interface,
      metric
    });
    
    // 按最长前缀匹配排序
    this.routes.sort((a, b) => {
      const aBits = this.countBits(a.netmask);
      const bBits = this.countBits(b.netmask);
      return bBits - aBits; // 降序排列
    });
  }

  // 查找路由
  findRoute(destinationIP) {
    const destInt = this.ipToInt(destinationIP);
    
    for (const route of this.routes) {
      if ((destInt & route.netmask) === route.network) {
        return route;
      }
    }
    
    return null; // 无路由
  }

  // IP地址转整数
  ipToInt(ip) {
    const parts = ip.split('.').map(Number);
    return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
  }

  // 计算网络掩码位数
  countBits(netmask) {
    let count = 0;
    while (netmask) {
      count += netmask & 1;
      netmask >>>= 1;
    }
    return count;
  }

  // 显示路由表
  display() {
    console.log('路由表:');
    console.log('目标网络\t\t网络掩码\t\t网关\t\t接口\t跃点');
    
    this.routes.forEach(route => {
      const network = this.intToIP(route.network);
      const netmask = this.intToIP(route.netmask);
      console.log(`${network}\t${netmask}\t${route.gateway}\t${route.interface}\t${route.metric}`);
    });
  }

  // 整数转IP地址
  intToIP(int) {
    return [
      (int >>> 24) & 0xFF,
      (int >>> 16) & 0xFF,
      (int >>> 8) & 0xFF,
      int & 0xFF
    ].join('.');
  }
}

// 使用示例
const routingTable = new RoutingTable();
routingTable.addRoute('192.168.1.0', '255.255.255.0', '192.168.1.1', 'eth0');
routingTable.addRoute('10.0.0.0', '255.0.0.0', '10.0.0.1', 'eth1');
routingTable.addRoute('0.0.0.0', '0.0.0.0', '192.168.1.1', 'eth0'); // 默认路由

const route = routingTable.findRoute('192.168.1.100');
console.log('找到路由:', route);
```

## 网络工具实现

### Ping工具

```javascript
// ICMP Ping实现
class PingTool {
  constructor() {
    this.sequence = 0;
    this.identifier = Math.floor(Math.random() * 65535);
  }

  // 发送Ping请求
  async ping(targetIP, count = 4, timeout = 5000) {
    console.log(`PING ${targetIP}:`);
    
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const result = await this.sendPing(targetIP, timeout);
      results.push(result);
      
      if (i < count - 1) {
        await this.sleep(1000); // 等待1秒
      }
    }
    
    this.printStatistics(targetIP, results);
    return results;
  }

  // 发送单个Ping
  async sendPing(targetIP, timeout) {
    const startTime = Date.now();
    this.sequence++;
    
    const icmpPacket = this.createICMPPacket();
    
    try {
      // 模拟网络传输
      const success = await this.simulateNetworkRequest(targetIP, timeout);
      
      if (success) {
        const endTime = Date.now();
        const rtt = endTime - startTime;
        
        console.log(`来自 ${targetIP} 的回复: 字节=32 时间=${rtt}ms TTL=64`);
        
        return {
          success: true,
          rtt,
          sequence: this.sequence,
          ttl: 64
        };
      } else {
        console.log(`请求超时`);
        return {
          success: false,
          sequence: this.sequence,
          timeout: true
        };
      }
    } catch (error) {
      console.log(`目标主机不可达`);
      return {
        success: false,
        sequence: this.sequence,
        error: error.message
      };
    }
  }

  // 创建ICMP数据包
  createICMPPacket() {
    return {
      type: 8, // Echo Request
      code: 0,
      checksum: 0,
      identifier: this.identifier,
      sequence: this.sequence,
      data: 'abcdefghijklmnopqrstuvwabcdefghi' // 32字节数据
    };
  }

  // 模拟网络请求
  async simulateNetworkRequest(targetIP, timeout) {
    return new Promise((resolve) => {
      const delay = Math.random() * 100 + 10; // 10-110ms延迟
      const success = Math.random() > 0.1; // 90%成功率
      
      setTimeout(() => {
        resolve(success);
      }, delay);
      
      // 超时处理
      setTimeout(() => {
        resolve(false);
      }, timeout);
    });
  }

  // 打印统计信息
  printStatistics(targetIP, results) {
    const sent = results.length;
    const received = results.filter(r => r.success).length;
    const lost = sent - received;
    const lossRate = (lost / sent * 100).toFixed(1);
    
    console.log(`\n${targetIP} 的 Ping 统计信息:`);
    console.log(`    数据包: 已发送 = ${sent}，已接收 = ${received}，丢失 = ${lost} (${lossRate}% 丢失)，`);
    
    if (received > 0) {
      const rtts = results.filter(r => r.success).map(r => r.rtt);
      const minRtt = Math.min(...rtts);
      const maxRtt = Math.max(...rtts);
      const avgRtt = (rtts.reduce((a, b) => a + b, 0) / rtts.length).toFixed(0);
      
      console.log(`往返行程的估计时间(以毫秒为单位):`);
      console.log(`    最短 = ${minRtt}ms，最长 = ${maxRtt}ms，平均 = ${avgRtt}ms`);
    }
  }

  // 睡眠函数
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Traceroute工具
class TracerouteTool {
  constructor() {
    this.maxHops = 30;
  }

  // 执行路由跟踪
  async traceroute(targetIP) {
    console.log(`跟踪到 ${targetIP} 的路由，最多 ${this.maxHops} 个跃点:\n`);
    
    for (let ttl = 1; ttl <= this.maxHops; ttl++) {
      const hop = await this.sendProbe(targetIP, ttl);
      
      if (hop.reached) {
        console.log(`${ttl.toString().padStart(2)} ${hop.ip.padEnd(15)} ${hop.rtt}ms`);
        break;
      } else if (hop.timeout) {
        console.log(`${ttl.toString().padStart(2)} ${'*'.padEnd(15)} 请求超时`);
      } else {
        console.log(`${ttl.toString().padStart(2)} ${hop.ip.padEnd(15)} ${hop.rtt}ms`);
      }
    }
  }

  // 发送探测包
  async sendProbe(targetIP, ttl) {
    const startTime = Date.now();
    
    // 模拟TTL递减和路由器响应
    const result = await this.simulateHop(targetIP, ttl);
    const endTime = Date.now();
    
    return {
      ...result,
      rtt: endTime - startTime
    };
  }

  // 模拟跃点
  async simulateHop(targetIP, ttl) {
    return new Promise((resolve) => {
      const delay = Math.random() * 50 + 10;
      
      setTimeout(() => {
        if (ttl >= 8) { // 模拟8跳到达目标
          resolve({
            reached: true,
            ip: targetIP
          });
        } else if (Math.random() > 0.9) { // 10%超时率
          resolve({
            timeout: true
          });
        } else {
          // 生成中间路由器IP
          const routerIP = `192.168.${ttl}.1`;
          resolve({
            reached: false,
            ip: routerIP
          });
        }
      }, delay);
    });
  }
}

// 使用示例
const ping = new PingTool();
ping.ping('8.8.8.8', 4);

const traceroute = new TracerouteTool();
traceroute.traceroute('8.8.8.8');
```

---

TCP/IP协议是现代网络通信的基石，理解其工作原理对于网络编程、系统管理和网络故障排除都具有重要意义。掌握TCP的可靠性机制、流量控制和拥塞控制算法，以及IP的路由和分片机制，是深入理解网络通信的关键。