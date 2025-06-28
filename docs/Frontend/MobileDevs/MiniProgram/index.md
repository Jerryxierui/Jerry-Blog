---
outline: deep
---

# 微信小程序知识库

## 小程序简介

### 什么是微信小程序？

微信小程序是一种不需要下载安装即可使用的应用，它实现了应用"触手可及"的梦想，用户扫一扫或搜一下即可打开应用。小程序基于微信平台，具有体积小、加载快、功能丰富的特点。

### 核心特性

- **无需安装**：即用即走，不占用手机内存
- **体验流畅**：接近原生应用的使用体验
- **功能丰富**：可调用微信提供的丰富能力
- **开发简单**：基于 Web 技术栈，学习成本低
- **分享便捷**：可以分享给好友或群聊

::: tip
小程序的设计理念是"用完即走"，为用户提供轻量级的服务体验。
:::

## 开发环境搭建

### 注册小程序账号

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 点击"立即注册" > "小程序"
3. 填写账号信息并完成注册
4. 登录后获取 AppID

### 下载开发工具

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 安装并启动开发工具
3. 使用微信扫码登录
4. 创建新项目，填入 AppID

### 项目结构

```
miniprogram/
├── app.js          # 小程序逻辑
├── app.json        # 小程序公共配置
├── app.wxss        # 小程序公共样式表
├── pages/          # 页面目录
│   ├── index/      # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── logs/       # 日志页
│       ├── logs.js
│       ├── logs.json
│       ├── logs.wxml
│       └── logs.wxss
├── utils/          # 工具函数
│   └── util.js
└── components/     # 自定义组件
    └── custom/
        ├── custom.js
        ├── custom.json
        ├── custom.wxml
        └── custom.wxss
```

## 基础配置

### app.json 全局配置

```json
{
  "pages": [
    "pages/index/index",
    "pages/logs/logs",
    "pages/profile/profile"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "我的小程序",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f8f8f8",
    "enablePullDownRefresh": true,
    "onReachBottomDistance": 50
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "images/icon_home.png",
        "selectedIconPath": "images/icon_home_active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/profile/profile",
        "iconPath": "images/icon_profile.png",
        "selectedIconPath": "images/icon_profile_active.png",
        "text": "我的"
      }
    ]
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": true,
  "sitemapLocation": "sitemap.json"
}
```

### 页面配置 page.json

```json
{
  "navigationBarTitleText": "页面标题",
  "navigationBarBackgroundColor": "#ffffff",
  "navigationBarTextStyle": "black",
  "backgroundColor": "#eeeeee",
  "backgroundTextStyle": "light",
  "enablePullDownRefresh": true,
  "onReachBottomDistance": 50,
  "pageOrientation": "portrait",
  "disableScroll": false,
  "usingComponents": {
    "custom-component": "/components/custom/custom"
  }
}
```

## 页面开发

### WXML 模板语法

```xml
<!-- 数据绑定 -->
<view>{{message}}</view>
<view>{{userInfo.name}}</view>
<view>{{a + b}}</view>

<!-- 条件渲染 -->
<view wx:if="{{condition}}">条件为真时显示</view>
<view wx:elif="{{condition2}}">条件2为真时显示</view>
<view wx:else>其他情况显示</view>

<!-- 列表渲染 -->
<view wx:for="{{array}}" wx:key="id">
  {{index}}: {{item.name}}
</view>

<view wx:for="{{array}}" wx:for-index="idx" wx:for-item="itemName" wx:key="id">
  {{idx}}: {{itemName.name}}
</view>

<!-- 模板 -->
<template name="msgItem">
  <view>
    <text>{{index}}: {{msg}}</text>
    <text>Time: {{time}}</text>
  </view>
</template>

<template is="msgItem" data="{{...item}}"/>

<!-- 事件绑定 -->
<button bindtap="clickHandler">点击按钮</button>
<button catchtap="clickHandler">阻止冒泡</button>
<button bind:tap="clickHandler" data-id="{{item.id}}">传递数据</button>

<!-- 表单组件 -->
<form bindsubmit="formSubmit">
  <input name="username" placeholder="请输入用户名" />
  <textarea name="content" placeholder="请输入内容"></textarea>
  <switch name="switch" checked="{{false}}"/>
  <slider name="slider" show-value />
  <button form-type="submit">提交</button>
</form>
```

### WXSS 样式

```css
/* 尺寸单位 rpx */
.container {
  width: 750rpx; /* 750rpx = 100vw */
  height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
}

/* 样式导入 */
@import "common.wxss";

/* Flex 布局 */
.flex-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

/* 选择器 */
.class-selector { color: red; }
#id-selector { color: blue; }
element { color: green; }
.class1, .class2 { color: yellow; }
.class1 .class2 { color: purple; }

/* 伪类 */
.button:active {
  background-color: #ccc;
}

/* 媒体查询 */
@media (max-width: 600rpx) {
  .responsive {
    font-size: 24rpx;
  }
}
```

### JavaScript 逻辑

```javascript
// pages/index/index.js
Page({
  // 页面的初始数据
  data: {
    message: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    array: [
      { id: 1, name: '项目1' },
      { id: 2, name: '项目2' },
      { id: 3, name: '项目3' }
    ]
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    console.log('页面加载', options);
    this.getUserInfo();
  },

  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {
    console.log('页面初次渲染完成');
  },

  // 生命周期函数--监听页面显示
  onShow: function () {
    console.log('页面显示');
  },

  // 生命周期函数--监听页面隐藏
  onHide: function () {
    console.log('页面隐藏');
  },

  // 生命周期函数--监听页面卸载
  onUnload: function () {
    console.log('页面卸载');
  },

  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
    console.log('下拉刷新');
    // 模拟数据刷新
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 页面上拉触底事件的处理函数
  onReachBottom: function () {
    console.log('上拉触底');
    this.loadMore();
  },

  // 用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: '分享标题',
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg'
    };
  },

  // 自定义方法
  clickHandler: function(e) {
    console.log('按钮被点击', e);
    const id = e.currentTarget.dataset.id;
    
    this.setData({
      message: '按钮被点击了'
    });
  },

  getUserInfo: function() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      }
    });
  },

  loadMore: function() {
    // 加载更多数据
    const newItems = [
      { id: Date.now(), name: '新项目' }
    ];
    
    this.setData({
      array: this.data.array.concat(newItems)
    });
  },

  formSubmit: function(e) {
    console.log('表单提交', e.detail.value);
  }
});
```

## 组件开发

### 自定义组件

```javascript
// components/custom/custom.js
Component({
  // 组件的属性列表
  properties: {
    title: {
      type: String,
      value: '默认标题'
    },
    count: {
      type: Number,
      value: 0
    },
    items: {
      type: Array,
      value: []
    }
  },

  // 组件的初始数据
  data: {
    innerText: '组件内部数据'
  },

  // 组件的方法列表
  methods: {
    onTap: function() {
      // 触发自定义事件
      this.triggerEvent('customEvent', {
        value: this.data.count
      });
      
      // 修改数据
      this.setData({
        count: this.data.count + 1
      });
    },
    
    _privateMethod: function() {
      // 私有方法
    }
  },

  // 组件生命周期
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  // 组件所在页面的生命周期
  pageLifetimes: {
    show: function() {
      // 页面被展示
    },
    hide: function() {
      // 页面被隐藏
    },
    resize: function(size) {
      // 页面尺寸变化
    }
  }
});
```

```xml
<!-- components/custom/custom.wxml -->
<view class="custom-component">
  <view class="header">{{title}}</view>
  <view class="content">
    <text>计数: {{count}}</text>
    <button bindtap="onTap">点击增加</button>
  </view>
  <view class="footer">
    <slot></slot> <!-- 插槽 -->
  </view>
</view>
```

```json
{
  "component": true,
  "usingComponents": {}
}
```

### 使用自定义组件

```json
{
  "usingComponents": {
    "custom-component": "/components/custom/custom"
  }
}
```

```xml
<custom-component 
  title="自定义标题" 
  count="{{count}}"
  bind:customEvent="handleCustomEvent">
  <text>这是插槽内容</text>
</custom-component>
```

## API 调用

### 网络请求

```javascript
// 发起网络请求
wx.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  data: {
    page: 1,
    limit: 10
  },
  header: {
    'content-type': 'application/json',
    'Authorization': 'Bearer token'
  },
  success: function(res) {
    console.log('请求成功', res.data);
  },
  fail: function(err) {
    console.error('请求失败', err);
    wx.showToast({
      title: '网络错误',
      icon: 'none'
    });
  },
  complete: function() {
    console.log('请求完成');
  }
});

// 上传文件
wx.uploadFile({
  url: 'https://api.example.com/upload',
  filePath: tempFilePath,
  name: 'file',
  formData: {
    'user': 'test'
  },
  success: function(res) {
    console.log('上传成功', res);
  }
});

// 下载文件
wx.downloadFile({
  url: 'https://example.com/file.pdf',
  success: function(res) {
    if (res.statusCode === 200) {
      wx.openDocument({
        filePath: res.tempFilePath
      });
    }
  }
});
```

### 数据存储

```javascript
// 同步存储
try {
  wx.setStorageSync('key', 'value');
  const value = wx.getStorageSync('key');
  wx.removeStorageSync('key');
  wx.clearStorageSync();
} catch (e) {
  console.error('存储操作失败', e);
}

// 异步存储
wx.setStorage({
  key: 'userInfo',
  data: {
    name: 'John',
    age: 25
  },
  success: function() {
    console.log('存储成功');
  }
});

wx.getStorage({
  key: 'userInfo',
  success: function(res) {
    console.log('获取数据', res.data);
  },
  fail: function() {
    console.log('获取数据失败');
  }
});

// 获取存储信息
wx.getStorageInfo({
  success: function(res) {
    console.log('存储信息', res.keys, res.currentSize, res.limitSize);
  }
});
```

### 界面交互

```javascript
// 显示消息提示框
wx.showToast({
  title: '成功',
  icon: 'success',
  duration: 2000
});

wx.showToast({
  title: '加载中',
  icon: 'loading',
  duration: 2000
});

// 显示模态对话框
wx.showModal({
  title: '提示',
  content: '这是一个模态弹窗',
  showCancel: true,
  cancelText: '取消',
  confirmText: '确定',
  success: function(res) {
    if (res.confirm) {
      console.log('用户点击确定');
    } else if (res.cancel) {
      console.log('用户点击取消');
    }
  }
});

// 显示操作菜单
wx.showActionSheet({
  itemList: ['A', 'B', 'C'],
  success: function(res) {
    console.log('选择了第' + (res.tapIndex + 1) + '个按钮');
  },
  fail: function(res) {
    console.log('取消选择');
  }
});

// 显示加载提示
wx.showLoading({
  title: '加载中',
  mask: true
});

setTimeout(() => {
  wx.hideLoading();
}, 2000);
```

### 导航跳转

```javascript
// 保留当前页面，跳转到应用内的某个页面
wx.navigateTo({
  url: '/pages/detail/detail?id=123&name=test'
});

// 关闭当前页面，跳转到应用内的某个页面
wx.redirectTo({
  url: '/pages/index/index'
});

// 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
wx.switchTab({
  url: '/pages/index/index'
});

// 关闭所有页面，打开到应用内的某个页面
wx.reLaunch({
  url: '/pages/index/index'
});

// 关闭当前页面，返回上一页面或多级页面
wx.navigateBack({
  delta: 1 // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
});
```

### 媒体功能

```javascript
// 拍照或从手机相册中选图
wx.chooseImage({
  count: 1,
  sizeType: ['original', 'compressed'],
  sourceType: ['album', 'camera'],
  success: function(res) {
    const tempFilePaths = res.tempFilePaths;
    // 预览图片
    wx.previewImage({
      current: tempFilePaths[0],
      urls: tempFilePaths
    });
  }
});

// 录音
const recorderManager = wx.getRecorderManager();

recorderManager.onStart(() => {
  console.log('录音开始');
});

recorderManager.onStop((res) => {
  console.log('录音停止', res);
  const { tempFilePath } = res;
});

// 开始录音
recorderManager.start({
  duration: 10000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3',
  frameSize: 50
});

// 停止录音
recorderManager.stop();

// 音频播放
const audioContext = wx.createAudioContext('myAudio');
audioContext.play();
audioContext.pause();
audioContext.seek(30);
```

### 设备功能

```javascript
// 获取系统信息
wx.getSystemInfo({
  success: function(res) {
    console.log('设备信息', {
      brand: res.brand,
      model: res.model,
      system: res.system,
      platform: res.platform,
      screenWidth: res.screenWidth,
      screenHeight: res.screenHeight,
      windowWidth: res.windowWidth,
      windowHeight: res.windowHeight
    });
  }
});

// 获取网络类型
wx.getNetworkType({
  success: function(res) {
    console.log('网络类型', res.networkType);
  }
});

// 监听网络状态变化
wx.onNetworkStatusChange(function(res) {
  console.log('网络状态变化', res.isConnected, res.networkType);
});

// 获取位置信息
wx.getLocation({
  type: 'gcj02',
  success: function(res) {
    const latitude = res.latitude;
    const longitude = res.longitude;
    const speed = res.speed;
    const accuracy = res.accuracy;
    console.log('位置信息', { latitude, longitude, speed, accuracy });
  }
});

// 扫码
wx.scanCode({
  onlyFromCamera: true,
  success: function(res) {
    console.log('扫码结果', res.result);
  }
});

// 振动
wx.vibrateLong(); // 长振动
wx.vibrateShort(); // 短振动
```

## 云开发

### 初始化云开发

```javascript
// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'your-env-id', // 环境 ID
        traceUser: true,
      });
    }
  }
});
```

### 云数据库

```javascript
// 获取数据库引用
const db = wx.cloud.database();
const collection = db.collection('todos');

// 添加数据
const addTodo = async (title, content) => {
  try {
    const result = await collection.add({
      data: {
        title,
        content,
        done: false,
        createTime: new Date()
      }
    });
    console.log('添加成功', result);
    return result;
  } catch (error) {
    console.error('添加失败', error);
  }
};

// 查询数据
const getTodos = async () => {
  try {
    const result = await collection
      .where({
        done: false
      })
      .orderBy('createTime', 'desc')
      .limit(20)
      .get();
    console.log('查询成功', result.data);
    return result.data;
  } catch (error) {
    console.error('查询失败', error);
  }
};

// 更新数据
const updateTodo = async (id, updates) => {
  try {
    const result = await collection.doc(id).update({
      data: updates
    });
    console.log('更新成功', result);
    return result;
  } catch (error) {
    console.error('更新失败', error);
  }
};

// 删除数据
const deleteTodo = async (id) => {
  try {
    const result = await collection.doc(id).remove();
    console.log('删除成功', result);
    return result;
  } catch (error) {
    console.error('删除失败', error);
  }
};
```

### 云函数

```javascript
// 云函数 login/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

// 小程序端调用云函数
const callCloudFunction = async () => {
  try {
    const result = await wx.cloud.callFunction({
      name: 'login',
      data: {
        a: 1,
        b: 2,
      }
    });
    console.log('云函数调用成功', result);
    return result;
  } catch (error) {
    console.error('云函数调用失败', error);
  }
};
```

### 云存储

```javascript
// 上传文件
const uploadFile = async (filePath) => {
  try {
    const result = await wx.cloud.uploadFile({
      cloudPath: `images/${Date.now()}.jpg`,
      filePath: filePath,
    });
    console.log('上传成功', result.fileID);
    return result.fileID;
  } catch (error) {
    console.error('上传失败', error);
  }
};

// 下载文件
const downloadFile = async (fileID) => {
  try {
    const result = await wx.cloud.downloadFile({
      fileID: fileID,
    });
    console.log('下载成功', result.tempFilePath);
    return result.tempFilePath;
  } catch (error) {
    console.error('下载失败', error);
  }
};

// 删除文件
const deleteFile = async (fileIDs) => {
  try {
    const result = await wx.cloud.deleteFile({
      fileList: fileIDs
    });
    console.log('删除成功', result);
    return result;
  } catch (error) {
    console.error('删除失败', error);
  }
};

// 获取临时链接
const getTempFileURL = async (fileIDs) => {
  try {
    const result = await wx.cloud.getTempFileURL({
      fileList: fileIDs
    });
    console.log('获取临时链接成功', result);
    return result;
  } catch (error) {
    console.error('获取临时链接失败', error);
  }
};
```

## 性能优化

### 代码优化

```javascript
// 1. 合理使用 setData
// 不好的做法
this.setData({
  'array[0].name': 'newName',
  'array[1].age': 25,
  'object.property': 'newValue'
});

// 好的做法
const array = this.data.array;
array[0].name = 'newName';
array[1].age = 25;
const object = this.data.object;
object.property = 'newValue';

this.setData({
  array,
  object
});

// 2. 避免频繁的 setData
// 不好的做法
for (let i = 0; i < 100; i++) {
  this.setData({
    [`list[${i}]`]: newData[i]
  });
}

// 好的做法
const updates = {};
for (let i = 0; i < 100; i++) {
  updates[`list[${i}]`] = newData[i];
}
this.setData(updates);

// 3. 使用节流和防抖
const throttle = (func, delay) => {
  let timer = null;
  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        func.apply(this, args);
        timer = null;
      }, delay);
    }
  };
};

const debounce = (func, delay) => {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};
```

### 渲染优化

```xml
<!-- 1. 使用 hidden 而不是 wx:if（频繁切换时） -->
<view hidden="{{!showContent}}">内容</view>

<!-- 2. 合理使用 wx:key -->
<view wx:for="{{list}}" wx:key="id">
  {{item.name}}
</view>

<!-- 3. 避免深层嵌套 -->
<!-- 不好的做法 -->
<view>
  <view>
    <view>
      <view>
        <text>深层嵌套</text>
      </view>
    </view>
  </view>
</view>

<!-- 好的做法 -->
<view class="container">
  <text>扁平结构</text>
</view>
```

### 图片优化

```javascript
// 图片懒加载
Page({
  data: {
    imageList: [],
    loadedImages: new Set()
  },
  
  onImageLoad: function(e) {
    const index = e.currentTarget.dataset.index;
    const loadedImages = this.data.loadedImages;
    loadedImages.add(index);
    
    this.setData({
      loadedImages
    });
  },
  
  // 图片压缩
  compressImage: function(src) {
    return new Promise((resolve) => {
      wx.compressImage({
        src,
        quality: 80,
        success: resolve
      });
    });
  }
});
```

## 调试和测试

### 调试技巧

```javascript
// 1. 使用 console 调试
console.log('普通日志');
console.warn('警告信息');
console.error('错误信息');
console.group('分组开始');
console.log('分组内容');
console.groupEnd();

// 2. 使用 wx.getLogManager
const logger = wx.getLogManager({level: 1});
logger.log('自定义日志');
logger.warn('自定义警告');
logger.error('自定义错误');

// 3. 性能监控
const performanceObserver = wx.createPerformanceObserver((entryList) => {
  console.log('性能数据', entryList.getEntries());
});
performanceObserver.observe({entryTypes: ['render', 'script']});

// 4. 错误监控
App({
  onError: function(error) {
    console.error('全局错误', error);
    // 上报错误信息
  }
});
```

### 真机调试

1. 在开发者工具中点击"真机调试"
2. 使用手机微信扫描二维码
3. 在手机上进行调试
4. 查看 vConsole 面板

### 性能分析

```javascript
// 使用 Performance 面板
// 1. 在开发者工具中打开 Performance 面板
// 2. 点击录制按钮
// 3. 操作小程序
// 4. 停止录制并分析结果

// 代码中的性能监控
const startTime = Date.now();
// 执行代码
const endTime = Date.now();
console.log('执行时间:', endTime - startTime, 'ms');
```

## 发布上线

### 版本管理

```json
// app.json
{
  "version": "1.0.0",
  "description": "版本描述"
}
```

### 提交审核

1. 在开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 上传代码到微信后台
4. 在微信公众平台提交审核
5. 等待审核通过后发布

### 灰度发布

```javascript
// 版本控制
const version = wx.getAccountInfoSync().miniProgram.version;
if (version === '1.0.0') {
  // 旧版本逻辑
} else {
  // 新版本逻辑
}

// 用户分组
const openid = wx.getStorageSync('openid');
const hash = this.hashCode(openid);
if (hash % 100 < 10) {
  // 10% 用户使用新功能
}
```

## 最佳实践

### 代码规范

```javascript
// 1. 使用 ES6+ 语法
const { data } = this;
const newArray = [...oldArray, newItem];
const newObject = { ...oldObject, newProperty: value };

// 2. 错误处理
const apiCall = async () => {
  try {
    const result = await wx.request({
      url: 'https://api.example.com/data'
    });
    return result.data;
  } catch (error) {
    console.error('API 调用失败', error);
    wx.showToast({
      title: '网络错误',
      icon: 'none'
    });
    throw error;
  }
};

// 3. 模块化
// utils/api.js
module.exports = {
  request: (options) => {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: resolve,
        fail: reject
      });
    });
  }
};

// 4. 常量管理
// constants/index.js
module.exports = {
  API_BASE_URL: 'https://api.example.com',
  STORAGE_KEYS: {
    USER_INFO: 'userInfo',
    TOKEN: 'token'
  },
  PAGE_SIZE: 20
};
```

### 用户体验优化

```javascript
// 1. 加载状态
Page({
  data: {
    loading: false,
    list: []
  },
  
  async loadData() {
    this.setData({ loading: true });
    try {
      const data = await api.getData();
      this.setData({ list: data });
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});

// 2. 骨架屏
// skeleton.wxml
<view class="skeleton" wx:if="{{loading}}">
  <view class="skeleton-item"></view>
  <view class="skeleton-item"></view>
  <view class="skeleton-item"></view>
</view>

// 3. 下拉刷新和上拉加载
Page({
  data: {
    list: [],
    page: 1,
    hasMore: true
  },
  
  async onPullDownRefresh() {
    this.setData({ page: 1, list: [] });
    await this.loadData();
    wx.stopPullDownRefresh();
  },
  
  async onReachBottom() {
    if (this.data.hasMore) {
      await this.loadMore();
    }
  }
});
```

## 常见问题

### 1. 页面跳转参数传递

```javascript
// 传递参数
wx.navigateTo({
  url: '/pages/detail/detail?id=123&name=test'
});

// 接收参数
Page({
  onLoad: function(options) {
    console.log(options.id); // 123
    console.log(options.name); // test
  }
});

// 传递复杂数据
const data = { id: 123, list: [1, 2, 3] };
wx.navigateTo({
  url: `/pages/detail/detail?data=${encodeURIComponent(JSON.stringify(data))}`
});

// 接收复杂数据
Page({
  onLoad: function(options) {
    const data = JSON.parse(decodeURIComponent(options.data));
    console.log(data);
  }
});
```

### 2. 组件通信

```javascript
// 父组件向子组件传递数据
// parent.wxml
<child-component data="{{parentData}}" bind:childEvent="handleChildEvent"></child-component>

// child.js
Component({
  properties: {
    data: Object
  },
  methods: {
    notifyParent() {
      this.triggerEvent('childEvent', { value: 'from child' });
    }
  }
});

// parent.js
Page({
  handleChildEvent(e) {
    console.log('收到子组件事件', e.detail);
  }
});
```

### 3. 异步处理

```javascript
// Promise 化 API
const promisify = (api) => {
  return (options = {}) => {
    return new Promise((resolve, reject) => {
      api({
        ...options,
        success: resolve,
        fail: reject
      });
    });
  };
};

const request = promisify(wx.request);
const getStorage = promisify(wx.getStorage);

// 使用
const fetchData = async () => {
  try {
    const token = await getStorage({ key: 'token' });
    const result = await request({
      url: 'https://api.example.com/data',
      header: {
        'Authorization': `Bearer ${token.data}`
      }
    });
    return result.data;
  } catch (error) {
    console.error('请求失败', error);
  }
};
```

## 参考资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- [小程序云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [微信小程序设计指南](https://developers.weixin.qq.com/miniprogram/design/)
- [小程序社区](https://developers.weixin.qq.com/community/minihome)

## 总结

微信小程序作为一种轻量级的应用形态，为开发者提供了快速构建移动应用的能力。通过掌握小程序的基础语法、组件系统、API 调用、云开发等核心技术，开发者可以高效地构建功能丰富的小程序应用。随着微信生态的不断发展，小程序将继续成为移动应用开发的重要选择。