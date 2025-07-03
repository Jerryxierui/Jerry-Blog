# DNS域名系统

DNS（Domain Name System）是互联网的基础服务之一，负责将人类可读的域名转换为计算机可理解的IP地址。它是一个分布式、分层的命名系统，为互联网上的资源提供了灵活的寻址机制。

## DNS基础概念

### 域名结构

```javascript
// 域名解析示例
class DNSResolver {
  constructor() {
    this.cache = new Map();
    this.rootServers = [
      '198.41.0.4',    // a.root-servers.net
      '199.9.14.201',  // b.root-servers.net
      '192.33.4.12',   // c.root-servers.net
      '199.7.91.13'    // d.root-servers.net
    ];
  }

  // 解析域名结构
  parseDomain(domain) {
    const parts = domain.toLowerCase().split('.');
    
    return {
      fqdn: domain,                    // 完全限定域名
      tld: parts[parts.length - 1],    // 顶级域名
      sld: parts[parts.length - 2],    // 二级域名
      subdomain: parts.slice(0, -2).join('.'), // 子域名
      labels: parts,                   // 所有标签
      depth: parts.length             // 层级深度
    };
  }

  // 域名验证
  validateDomain(domain) {
    const rules = {
      maxLength: 253,
      maxLabelLength: 63,
      validChars: /^[a-zA-Z0-9.-]+$/,
      labelPattern: /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/
    };

    // 检查总长度
    if (domain.length > rules.maxLength) {
      return { valid: false, error: '域名总长度超过253字符' };
    }

    // 检查字符
    if (!rules.validChars.test(domain)) {
      return { valid: false, error: '域名包含非法字符' };
    }

    const labels = domain.split('.');
    
    // 检查每个标签
    for (const label of labels) {
      if (label.length === 0) {
        return { valid: false, error: '域名标签不能为空' };
      }
      
      if (label.length > rules.maxLabelLength) {
        return { valid: false, error: '域名标签长度超过63字符' };
      }
      
      if (!rules.labelPattern.test(label)) {
        return { valid: false, error: '域名标签格式不正确' };
      }
    }

    return { valid: true };
  }

  // 国际化域名处理
  handleIDN(domain) {
    // 检查是否包含非ASCII字符
    if (!/^[\x00-\x7F]*$/.test(domain)) {
      // 模拟Punycode编码
      const encoded = this.punycode(domain);
      console.log(`IDN域名: ${domain} -> ${encoded}`);
      return encoded;
    }
    return domain;
  }

  // 简化的Punycode编码模拟
  punycode(domain) {
    return domain.split('.').map(label => {
      if (!/^[\x00-\x7F]*$/.test(label)) {
        return `xn--${Buffer.from(label, 'utf8').toString('hex')}`;
      }
      return label;
    }).join('.');
  }
}

// 使用示例
const resolver = new DNSResolver();
const domain = 'www.example.com';
const parsed = resolver.parseDomain(domain);
console.log('域名结构:', parsed);

const validation = resolver.validateDomain(domain);
console.log('域名验证:', validation);

// 国际化域名示例
const idnDomain = '测试.中国';
const encoded = resolver.handleIDN(idnDomain);
console.log('IDN编码:', encoded);
```

### DNS记录类型

```javascript
// DNS记录类型定义
class DNSRecord {
  constructor(name, type, ttl, data) {
    this.name = name;
    this.type = type;
    this.ttl = ttl;
    this.data = data;
    this.timestamp = Date.now();
  }

  // 检查记录是否过期
  isExpired() {
    return (Date.now() - this.timestamp) > (this.ttl * 1000);
  }

  // 获取记录的字符串表示
  toString() {
    return `${this.name} ${this.ttl} IN ${this.type} ${this.data}`;
  }
}

// DNS记录管理器
class DNSRecordManager {
  constructor() {
    this.records = new Map();
    this.recordTypes = {
      A: 'IPv4地址记录',
      AAAA: 'IPv6地址记录',
      CNAME: '别名记录',
      MX: '邮件交换记录',
      NS: '名称服务器记录',
      PTR: '反向解析记录',
      SOA: '授权开始记录',
      TXT: '文本记录',
      SRV: '服务记录',
      CAA: '证书颁发机构授权记录'
    };
  }

  // 添加A记录
  addARecord(domain, ip, ttl = 3600) {
    const record = new DNSRecord(domain, 'A', ttl, ip);
    this.addRecord(record);
    return record;
  }

  // 添加AAAA记录
  addAAAARecord(domain, ipv6, ttl = 3600) {
    const record = new DNSRecord(domain, 'AAAA', ttl, ipv6);
    this.addRecord(record);
    return record;
  }

  // 添加CNAME记录
  addCNAMERecord(alias, canonical, ttl = 3600) {
    const record = new DNSRecord(alias, 'CNAME', ttl, canonical);
    this.addRecord(record);
    return record;
  }

  // 添加MX记录
  addMXRecord(domain, priority, mailServer, ttl = 3600) {
    const record = new DNSRecord(domain, 'MX', ttl, `${priority} ${mailServer}`);
    this.addRecord(record);
    return record;
  }

  // 添加TXT记录
  addTXTRecord(domain, text, ttl = 3600) {
    const record = new DNSRecord(domain, 'TXT', ttl, `"${text}"`);
    this.addRecord(record);
    return record;
  }

  // 添加SRV记录
  addSRVRecord(service, protocol, domain, priority, weight, port, target, ttl = 3600) {
    const name = `_${service}._${protocol}.${domain}`;
    const data = `${priority} ${weight} ${port} ${target}`;
    const record = new DNSRecord(name, 'SRV', ttl, data);
    this.addRecord(record);
    return record;
  }

  // 添加记录到存储
  addRecord(record) {
    const key = `${record.name}:${record.type}`;
    if (!this.records.has(key)) {
      this.records.set(key, []);
    }
    this.records.get(key).push(record);
  }

  // 查询记录
  query(name, type = 'A') {
    const key = `${name}:${type}`;
    const records = this.records.get(key) || [];
    
    // 过滤过期记录
    const validRecords = records.filter(record => !record.isExpired());
    
    // 更新存储，移除过期记录
    if (validRecords.length !== records.length) {
      this.records.set(key, validRecords);
    }
    
    return validRecords;
  }

  // 获取所有记录类型
  getRecordTypes() {
    return this.recordTypes;
  }

  // 清理过期记录
  cleanup() {
    let cleanedCount = 0;
    
    for (const [key, records] of this.records.entries()) {
      const validRecords = records.filter(record => !record.isExpired());
      
      if (validRecords.length === 0) {
        this.records.delete(key);
        cleanedCount++;
      } else if (validRecords.length !== records.length) {
        this.records.set(key, validRecords);
        cleanedCount += records.length - validRecords.length;
      }
    }
    
    console.log(`清理了 ${cleanedCount} 条过期记录`);
    return cleanedCount;
  }

  // 显示所有记录
  displayRecords() {
    console.log('DNS记录列表:');
    for (const [key, records] of this.records.entries()) {
      console.log(`\n${key}:`);
      records.forEach(record => {
        const status = record.isExpired() ? '[已过期]' : '[有效]';
        console.log(`  ${status} ${record.toString()}`);
      });
    }
  }
}

// 使用示例
const recordManager = new DNSRecordManager();

// 添加各种类型的记录
recordManager.addARecord('example.com', '192.168.1.1');
recordManager.addAAAARecord('example.com', '2001:db8::1');
recordManager.addCNAMERecord('www.example.com', 'example.com');
recordManager.addMXRecord('example.com', 10, 'mail.example.com');
recordManager.addTXTRecord('example.com', 'v=spf1 include:_spf.google.com ~all');
recordManager.addSRVRecord('http', 'tcp', 'example.com', 0, 5, 80, 'web.example.com');

// 查询记录
const aRecords = recordManager.query('example.com', 'A');
console.log('A记录查询结果:', aRecords);

recordManager.displayRecords();
```

## DNS解析过程

### 递归查询实现

```javascript
// DNS递归解析器
class RecursiveDNSResolver {
  constructor() {
    this.cache = new Map();
    this.queryCount = 0;
    this.cacheHits = 0;
    this.rootServers = [
      { ip: '198.41.0.4', name: 'a.root-servers.net' },
      { ip: '199.9.14.201', name: 'b.root-servers.net' },
      { ip: '192.33.4.12', name: 'c.root-servers.net' }
    ];
  }

  // 递归解析域名
  async resolve(domain, type = 'A') {
    this.queryCount++;
    console.log(`\n=== 开始解析 ${domain} (${type}) ===`);
    
    // 检查缓存
    const cacheKey = `${domain}:${type}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (!this.isExpired(cached)) {
        this.cacheHits++;
        console.log(`缓存命中: ${domain} -> ${cached.data}`);
        return cached;
      } else {
        this.cache.delete(cacheKey);
        console.log('缓存已过期，重新查询');
      }
    }

    try {
      const result = await this.recursiveQuery(domain, type);
      
      // 缓存结果
      if (result) {
        this.cache.set(cacheKey, {
          ...result,
          cachedAt: Date.now()
        });
      }
      
      return result;
    } catch (error) {
      console.error(`解析失败: ${error.message}`);
      return null;
    }
  }

  // 执行递归查询
  async recursiveQuery(domain, type, currentServer = null) {
    const server = currentServer || this.selectRootServer();
    console.log(`查询服务器: ${server.name} (${server.ip})`);
    
    // 模拟DNS查询
    const response = await this.queryServer(server, domain, type);
    
    if (response.answer) {
      console.log(`找到答案: ${domain} -> ${response.answer.data}`);
      return response.answer;
    }
    
    if (response.authority && response.authority.length > 0) {
      console.log(`获得权威服务器: ${response.authority[0].data}`);
      
      // 查询权威服务器的IP地址
      const nsIP = await this.resolveNameServer(response.authority[0].data);
      if (nsIP) {
        return await this.recursiveQuery(domain, type, {
          ip: nsIP,
          name: response.authority[0].data
        });
      }
    }
    
    throw new Error(`无法解析域名: ${domain}`);
  }

  // 查询DNS服务器
  async queryServer(server, domain, type) {
    // 模拟网络延迟
    await this.sleep(Math.random() * 100 + 50);
    
    // 模拟DNS响应
    return this.simulateDNSResponse(server, domain, type);
  }

  // 模拟DNS响应
  simulateDNSResponse(server, domain, type) {
    const responses = {
      'a.root-servers.net': {
        'example.com': {
          authority: [{ name: 'example.com', type: 'NS', data: 'ns1.example.com' }]
        },
        'google.com': {
          authority: [{ name: 'google.com', type: 'NS', data: 'ns1.google.com' }]
        }
      },
      'ns1.example.com': {
        'example.com': {
          answer: { name: 'example.com', type: 'A', data: '93.184.216.34', ttl: 3600 }
        },
        'www.example.com': {
          answer: { name: 'www.example.com', type: 'CNAME', data: 'example.com', ttl: 3600 }
        }
      },
      'ns1.google.com': {
        'google.com': {
          answer: { name: 'google.com', type: 'A', data: '172.217.164.110', ttl: 300 }
        }
      }
    };

    const serverResponses = responses[server.name] || {};
    const domainResponse = serverResponses[domain] || {};
    
    return {
      answer: domainResponse.answer || null,
      authority: domainResponse.authority || [],
      additional: domainResponse.additional || []
    };
  }

  // 解析名称服务器的IP地址
  async resolveNameServer(nsName) {
    const nsIPs = {
      'ns1.example.com': '192.0.2.1',
      'ns1.google.com': '216.239.32.10'
    };
    
    return nsIPs[nsName] || null;
  }

  // 选择根服务器
  selectRootServer() {
    return this.rootServers[Math.floor(Math.random() * this.rootServers.length)];
  }

  // 检查缓存是否过期
  isExpired(cached) {
    const age = (Date.now() - cached.cachedAt) / 1000;
    return age > (cached.ttl || 3600);
  }

  // 获取统计信息
  getStats() {
    return {
      totalQueries: this.queryCount,
      cacheHits: this.cacheHits,
      cacheHitRate: this.queryCount > 0 ? (this.cacheHits / this.queryCount * 100).toFixed(2) + '%' : '0%',
      cacheSize: this.cache.size
    };
  }

  // 清空缓存
  clearCache() {
    this.cache.clear();
    console.log('DNS缓存已清空');
  }

  // 睡眠函数
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 使用示例
const resolver = new RecursiveDNSResolver();

// 解析多个域名
async function testDNSResolution() {
  const domains = ['example.com', 'google.com', 'example.com']; // 第三个用于测试缓存
  
  for (const domain of domains) {
    await resolver.resolve(domain);
  }
  
  console.log('\n=== DNS解析统计 ===');
  console.log(resolver.getStats());
}

testDNSResolution();
```

### 迭代查询实现

```javascript
// DNS迭代解析器
class IterativeDNSResolver {
  constructor() {
    this.cache = new Map();
    this.rootServers = [
      '198.41.0.4',
      '199.9.14.201',
      '192.33.4.12'
    ];
  }

  // 迭代解析域名
  async resolve(domain, type = 'A') {
    console.log(`\n=== 迭代解析 ${domain} ===`);
    
    let currentServers = [...this.rootServers];
    let queryDomain = domain;
    
    while (currentServers.length > 0) {
      const server = currentServers[0];
      console.log(`查询服务器: ${server}`);
      
      const response = await this.queryServer(server, queryDomain, type);
      
      if (response.answer) {
        console.log(`找到最终答案: ${response.answer.data}`);
        return response.answer;
      }
      
      if (response.referral && response.referral.length > 0) {
        console.log(`获得转发: ${response.referral.map(r => r.data).join(', ')}`);
        currentServers = response.referral.map(r => r.data);
        continue;
      }
      
      break;
    }
    
    throw new Error(`无法解析域名: ${domain}`);
  }

  // 查询DNS服务器
  async queryServer(serverIP, domain, type) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 25));
    
    // 模拟迭代查询响应
    if (this.rootServers.includes(serverIP)) {
      // 根服务器响应
      return {
        referral: [{ data: '192.0.2.1' }] // 权威服务器IP
      };
    } else {
      // 权威服务器响应
      return {
        answer: {
          name: domain,
          type: type,
          data: '93.184.216.34',
          ttl: 3600
        }
      };
    }
  }
}
```

## DNS安全

### DNSSEC实现

```javascript
// DNSSEC验证器
class DNSSECValidator {
  constructor() {
    this.trustAnchors = new Map();
    this.publicKeys = new Map();
    
    // 添加根密钥信任锚点
    this.addTrustAnchor('.', {
      keyTag: 20326,
      algorithm: 8, // RSA/SHA-256
      digestType: 2, // SHA-256
      digest: '0123456789ABCDEF' // 简化的摘要
    });
  }

  // 添加信任锚点
  addTrustAnchor(zone, ds) {
    this.trustAnchors.set(zone, ds);
    console.log(`添加信任锚点: ${zone}`);
  }

  // 验证DNSSEC签名
  async validateSignature(rrset, rrsig, dnskey) {
    console.log(`验证签名: ${rrset.name} (${rrset.type})`);
    
    // 检查签名有效期
    const now = Math.floor(Date.now() / 1000);
    if (now < rrsig.inception || now > rrsig.expiration) {
      throw new Error('签名已过期或尚未生效');
    }
    
    // 检查密钥标签
    if (rrsig.keyTag !== this.calculateKeyTag(dnskey)) {
      throw new Error('密钥标签不匹配');
    }
    
    // 模拟签名验证
    const isValid = await this.cryptoVerify(rrset, rrsig, dnskey);
    
    if (isValid) {
      console.log('✓ 签名验证成功');
      return true;
    } else {
      throw new Error('签名验证失败');
    }
  }

  // 验证信任链
  async validateChain(domain, rrset, rrsig, dnskey) {
    console.log(`\n=== 验证信任链: ${domain} ===`);
    
    // 1. 验证RRSIG
    await this.validateSignature(rrset, rrsig, dnskey);
    
    // 2. 验证DNSKEY
    const parentZone = this.getParentZone(domain);
    if (parentZone && this.trustAnchors.has(parentZone)) {
      const ds = this.trustAnchors.get(parentZone);
      const keyDigest = this.calculateKeyDigest(dnskey);
      
      if (keyDigest === ds.digest) {
        console.log('✓ 密钥验证成功');
        return true;
      } else {
        throw new Error('密钥验证失败');
      }
    }
    
    console.log('✓ 信任链验证完成');
    return true;
  }

  // 计算密钥标签
  calculateKeyTag(dnskey) {
    // 简化的密钥标签计算
    let tag = 0;
    const keyData = dnskey.publicKey;
    
    for (let i = 0; i < keyData.length; i++) {
      tag += keyData.charCodeAt(i) * (i + 1);
    }
    
    return tag % 65536;
  }

  // 计算密钥摘要
  calculateKeyDigest(dnskey) {
    // 简化的摘要计算
    return 'ABCDEF123456'; // 实际应使用SHA-256
  }

  // 获取父区域
  getParentZone(domain) {
    const parts = domain.split('.');
    if (parts.length > 1) {
      return parts.slice(1).join('.');
    }
    return '.';
  }

  // 模拟加密验证
  async cryptoVerify(rrset, rrsig, dnskey) {
    // 在实际实现中，这里会进行真正的加密签名验证
    await new Promise(resolve => setTimeout(resolve, 10));
    return Math.random() > 0.1; // 90%成功率
  }

  // 验证否定响应
  validateNXDOMAIN(nsec, qname, qtype) {
    console.log(`验证NXDOMAIN: ${qname}`);
    
    // 检查NSEC记录是否覆盖查询名称
    if (this.nsecCovers(nsec, qname)) {
      console.log('✓ NXDOMAIN验证成功');
      return true;
    }
    
    throw new Error('NXDOMAIN验证失败');
  }

  // 检查NSEC覆盖
  nsecCovers(nsec, qname) {
    // 简化的NSEC覆盖检查
    return qname >= nsec.owner && qname < nsec.nextDomain;
  }
}

// DNS over HTTPS (DoH) 客户端
class DoHClient {
  constructor(serverUrl = 'https://cloudflare-dns.com/dns-query') {
    this.serverUrl = serverUrl;
    this.cache = new Map();
  }

  // 发送DoH查询
  async query(domain, type = 'A') {
    const params = new URLSearchParams({
      name: domain,
      type: type,
      ct: 'application/dns-json'
    });
    
    const url = `${this.serverUrl}?${params}`;
    
    try {
      console.log(`DoH查询: ${domain} (${type})`);
      
      // 模拟HTTPS请求
      const response = await this.simulateHTTPSRequest(url);
      
      if (response.Status === 0 && response.Answer) {
        console.log(`DoH响应: ${response.Answer[0].data}`);
        return response.Answer[0];
      } else {
        throw new Error(`DoH查询失败: ${response.Status}`);
      }
    } catch (error) {
      console.error(`DoH错误: ${error.message}`);
      throw error;
    }
  }

  // 模拟HTTPS请求
  async simulateHTTPSRequest(url) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      Status: 0,
      TC: false,
      RD: true,
      RA: true,
      AD: true,
      CD: false,
      Question: [{
        name: 'example.com',
        type: 1
      }],
      Answer: [{
        name: 'example.com',
        type: 1,
        TTL: 3600,
        data: '93.184.216.34'
      }]
    };
  }

  // 批量查询
  async batchQuery(queries) {
    const results = [];
    
    for (const query of queries) {
      try {
        const result = await this.query(query.domain, query.type);
        results.push({ ...query, result, success: true });
      } catch (error) {
        results.push({ ...query, error: error.message, success: false });
      }
    }
    
    return results;
  }
}

// 使用示例
const validator = new DNSSECValidator();
const dohClient = new DoHClient();

// DNSSEC验证示例
const rrset = { name: 'example.com', type: 'A', data: '93.184.216.34' };
const rrsig = {
  keyTag: 12345,
  algorithm: 8,
  inception: Math.floor(Date.now() / 1000) - 3600,
  expiration: Math.floor(Date.now() / 1000) + 3600
};
const dnskey = {
  flags: 257,
  protocol: 3,
  algorithm: 8,
  publicKey: 'AQPJ////4Q=='
};

validator.validateChain('example.com', rrset, rrsig, dnskey)
  .then(() => console.log('DNSSEC验证完成'))
  .catch(error => console.error('DNSSEC验证失败:', error.message));

// DoH查询示例
dohClient.query('example.com')
  .then(result => console.log('DoH查询成功:', result))
  .catch(error => console.error('DoH查询失败:', error.message));
```

## DNS性能优化

### 智能DNS实现

```javascript
// 智能DNS解析器
class SmartDNSResolver {
  constructor() {
    this.geoDatabase = new Map();
    this.loadBalancers = new Map();
    this.healthCheckers = new Map();
    this.cache = new Map();
    
    this.initializeGeoDatabase();
    this.initializeLoadBalancers();
  }

  // 初始化地理位置数据库
  initializeGeoDatabase() {
    this.geoDatabase.set('192.168.1.0/24', { country: 'CN', region: 'Beijing' });
    this.geoDatabase.set('10.0.0.0/8', { country: 'US', region: 'California' });
    this.geoDatabase.set('172.16.0.0/12', { country: 'EU', region: 'London' });
  }

  // 初始化负载均衡器
  initializeLoadBalancers() {
    this.loadBalancers.set('example.com', {
      algorithm: 'weighted_round_robin',
      servers: [
        { ip: '1.1.1.1', weight: 3, region: 'US' },
        { ip: '2.2.2.2', weight: 2, region: 'EU' },
        { ip: '3.3.3.3', weight: 1, region: 'ASIA' }
      ],
      currentIndex: 0
    });
  }

  // 地理位置感知解析
  async geoResolve(domain, clientIP) {
    console.log(`地理位置解析: ${domain} for ${clientIP}`);
    
    const clientGeo = this.getClientGeo(clientIP);
    console.log(`客户端位置: ${clientGeo.country}, ${clientGeo.region}`);
    
    const servers = this.getServersForRegion(domain, clientGeo.region);
    
    if (servers.length > 0) {
      const selectedServer = this.selectBestServer(servers, clientGeo);
      console.log(`选择服务器: ${selectedServer.ip} (${selectedServer.region})`);
      return selectedServer.ip;
    }
    
    // 回退到默认解析
    return await this.defaultResolve(domain);
  }

  // 获取客户端地理位置
  getClientGeo(clientIP) {
    for (const [subnet, geo] of this.geoDatabase.entries()) {
      if (this.isIPInSubnet(clientIP, subnet)) {
        return geo;
      }
    }
    return { country: 'Unknown', region: 'Unknown' };
  }

  // 检查IP是否在子网中
  isIPInSubnet(ip, subnet) {
    // 简化的子网检查
    const [network, prefix] = subnet.split('/');
    return ip.startsWith(network.split('.').slice(0, parseInt(prefix) / 8).join('.'));
  }

  // 获取区域服务器
  getServersForRegion(domain, region) {
    const config = this.loadBalancers.get(domain);
    if (!config) return [];
    
    return config.servers.filter(server => 
      server.region === region || server.region === 'GLOBAL'
    );
  }

  // 选择最佳服务器
  selectBestServer(servers, clientGeo) {
    // 加权轮询算法
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const server of servers) {
      random -= server.weight;
      if (random <= 0) {
        return server;
      }
    }
    
    return servers[0]; // 回退
  }

  // 健康检查
  async healthCheck(serverIP) {
    console.log(`健康检查: ${serverIP}`);
    
    try {
      // 模拟健康检查
      const isHealthy = await this.pingServer(serverIP);
      
      if (isHealthy) {
        console.log(`✓ 服务器 ${serverIP} 健康`);
        return true;
      } else {
        console.log(`✗ 服务器 ${serverIP} 不健康`);
        return false;
      }
    } catch (error) {
      console.log(`✗ 服务器 ${serverIP} 检查失败: ${error.message}`);
      return false;
    }
  }

  // 模拟服务器ping
  async pingServer(serverIP) {
    await new Promise(resolve => setTimeout(resolve, 50));
    return Math.random() > 0.1; // 90%健康率
  }

  // 默认解析
  async defaultResolve(domain) {
    const defaultIPs = {
      'example.com': '93.184.216.34',
      'google.com': '172.217.164.110'
    };
    
    return defaultIPs[domain] || '127.0.0.1';
  }

  // 启动健康检查监控
  startHealthMonitoring() {
    setInterval(async () => {
      for (const [domain, config] of this.loadBalancers.entries()) {
        for (const server of config.servers) {
          const isHealthy = await this.healthCheck(server.ip);
          server.healthy = isHealthy;
        }
      }
    }, 30000); // 每30秒检查一次
  }

  // 获取统计信息
  getStats() {
    const stats = {
      totalDomains: this.loadBalancers.size,
      totalServers: 0,
      healthyServers: 0,
      cacheSize: this.cache.size
    };
    
    for (const config of this.loadBalancers.values()) {
      stats.totalServers += config.servers.length;
      stats.healthyServers += config.servers.filter(s => s.healthy !== false).length;
    }
    
    return stats;
  }
}

// DNS缓存管理器
class DNSCacheManager {
  constructor(maxSize = 10000, defaultTTL = 3600) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  // 获取缓存
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // 更新访问时间（LRU）
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    
    return entry.data;
  }

  // 设置缓存
  set(key, data, ttl = null) {
    // 检查容量
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    const entry = {
      data,
      ttl: ttl || this.defaultTTL,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    
    this.cache.set(key, entry);
  }

  // 检查是否过期
  isExpired(entry) {
    const age = (Date.now() - entry.createdAt) / 1000;
    return age > entry.ttl;
  }

  // LRU淘汰
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  // 清理过期条目
  cleanup() {
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }

  // 获取统计信息
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

// 使用示例
const smartDNS = new SmartDNSResolver();
const cacheManager = new DNSCacheManager();

// 地理位置解析测试
async function testSmartDNS() {
  const clients = [
    { ip: '192.168.1.100', location: 'Beijing' },
    { ip: '10.0.0.50', location: 'California' },
    { ip: '172.16.0.25', location: 'London' }
  ];
  
  for (const client of clients) {
    console.log(`\n=== 客户端: ${client.ip} (${client.location}) ===`);
    const result = await smartDNS.geoResolve('example.com', client.ip);
    console.log(`解析结果: ${result}`);
  }
  
  console.log('\n=== 智能DNS统计 ===');
  console.log(smartDNS.getStats());
}

testSmartDNS();

// 启动健康监控
smartDNS.startHealthMonitoring();
```

---

DNS是互联网基础设施的重要组成部分，理解其工作原理、安全机制和性能优化策略对于网络管理和Web开发都具有重要意义。随着网络安全威胁的增加，DNSSEC和DoH等安全技术变得越来越重要。