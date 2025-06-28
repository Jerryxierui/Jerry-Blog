---
outline: deep
---

# Uni-app 知识库

## Uni-app 简介

### 什么是 Uni-app？

Uni-app 是一个使用 Vue.js 开发所有前端应用的框架，开发者编写一套代码，可发布到iOS、Android、Web（响应式）、以及各种小程序（微信/支付宝/百度/头条/飞书/QQ/快手/钉钉/淘宝）、快应用等多个平台。

### 核心特性

- **一套代码，多端发布**：支持编译到10+个平台
- **Vue.js 语法**：使用熟悉的 Vue.js 开发体验
- **丰富的组件库**：内置大量跨平台组件
- **强大的插件生态**：支持原生插件和 JS 插件
- **云端一体化**：配套 uniCloud 云服务
- **性能优化**：编译时优化，运行时高效

::: tip
Uni-app 的设计理念是"Write once, run anywhere"，让开发者用一套代码覆盖所有主流平台。
:::

## 环境搭建

### 开发工具选择

**HBuilderX（推荐）：**
- 专为 uni-app 优化的 IDE
- 内置编译器，无需配置环境
- 可视化界面，操作简单
- 内置模拟器和真机运行

**CLI 方式：**
- 使用 Vue CLI 创建项目
- 适合有 Vue 开发经验的开发者
- 可以使用其他编辑器开发

### 使用 HBuilderX 创建项目

1. 下载并安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 新建项目 → uni-app
3. 选择模板（默认模板/Hello uni-app/uniCloud）
4. 填写项目名称和存储位置
5. 点击创建

### 使用 CLI 创建项目

```bash
# 安装 Vue CLI
npm install -g @vue/cli

# 创建 uni-app 项目
vue create -p dcloudio/uni-preset-vue my-project

# 进入项目目录
cd my-project

# 运行项目
npm run dev:mp-weixin  # 微信小程序
npm run dev:mp-alipay  # 支付宝小程序
npm run dev:h5         # H5
npm run dev:app-plus   # App
```

### 项目结构

```
uni-app-project/
├── pages/              # 页面目录
│   ├── index/
│   │   └── index.vue
│   └── list/
│       └── list.vue
├── components/         # 组件目录
│   └── uni-badge/
│       └── uni-badge.vue
├── static/            # 静态资源目录
│   ├── images/
│   └── fonts/
├── common/            # 公共文件目录
│   ├── common.css
│   └── util.js
├── store/             # Vuex 状态管理
│   └── index.js
├── App.vue            # 应用配置
├── main.js            # 入口文件
├── manifest.json      # 应用配置文件
├── pages.json         # 页面路由配置
└── uni.scss          # 全局样式变量
```

## 基础配置

### pages.json 页面配置

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "navigationBarBackgroundColor": "#007AFF",
        "navigationBarTextStyle": "white",
        "backgroundColor": "#f8f8f8",
        "enablePullDownRefresh": true,
        "onReachBottomDistance": 50
      }
    },
    {
      "path": "pages/list/list",
      "style": {
        "navigationBarTitleText": "列表页"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uni-app",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8",
    "app-plus": {
      "background": "#efeff4"
    }
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "static/image/icon_home.png",
        "selectedIconPath": "static/image/icon_home_active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/list/list",
        "iconPath": "static/image/icon_list.png",
        "selectedIconPath": "static/image/icon_list_active.png",
        "text": "列表"
      }
    ]
  },
  "condition": {
    "current": 0,
    "list": [
      {
        "name": "首页",
        "path": "pages/index/index",
        "query": ""
      }
    ]
  }
}
```

### manifest.json 应用配置

```json
{
  "name": "my-uni-app",
  "appid": "__UNI__XXXXXX",
  "description": "我的 uni-app 应用",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "app-plus": {
    "usingComponents": true,
    "nvueStyleCompiler": "uni-app",
    "compilerVersion": 3,
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    },
    "modules": {},
    "distribute": {
      "android": {
        "permissions": [
          "<uses-permission android:name=\"android.permission.CHANGE_NETWORK_STATE\" />",
          "<uses-permission android:name=\"android.permission.MOUNT_UNMOUNT_FILESYSTEMS\" />",
          "<uses-permission android:name=\"android.permission.VIBRATE\" />",
          "<uses-permission android:name=\"android.permission.READ_LOGS\" />",
          "<uses-permission android:name=\"android.permission.ACCESS_WIFI_STATE\" />",
          "<uses-feature android:name=\"android.hardware.camera.autofocus\" />",
          "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\" />",
          "<uses-permission android:name=\"android.permission.CAMERA\" />",
          "<uses-permission android:name=\"android.permission.GET_ACCOUNTS\" />",
          "<uses-permission android:name=\"android.permission.READ_PHONE_STATE\" />",
          "<uses-permission android:name=\"android.permission.CHANGE_WIFI_STATE\" />",
          "<uses-permission android:name=\"android.permission.WAKE_LOCK\" />",
          "<uses-permission android:name=\"android.permission.FLASHLIGHT\" />",
          "<uses-permission android:name=\"android.permission.WRITE_SETTINGS\" />"
        ]
      },
      "ios": {},
      "sdkConfigs": {}
    }
  },
  "quickapp": {},
  "mp-weixin": {
    "appid": "your-weixin-appid",
    "setting": {
      "urlCheck": false
    },
    "usingComponents": true
  },
  "mp-alipay": {
    "usingComponents": true
  },
  "mp-baidu": {
    "usingComponents": true
  },
  "mp-toutiao": {
    "usingComponents": true
  },
  "uniStatistics": {
    "enable": false
  },
  "h5": {
    "title": "my-uni-app",
    "template": "index.html"
  }
}
```

## 页面开发

### 基础页面结构

```vue
<template>
  <view class="container">
    <!-- 页面内容 -->
    <view class="header">
      <text class="title">{{title}}</text>
    </view>
    
    <view class="content">
      <!-- 列表渲染 -->
      <view 
        v-for="(item, index) in list" 
        :key="item.id" 
        class="item"
        @click="handleItemClick(item, index)"
      >
        <image :src="item.image" class="item-image"></image>
        <view class="item-content">
          <text class="item-title">{{item.title}}</text>
          <text class="item-desc">{{item.description}}</text>
        </view>
      </view>
    </view>
    
    <!-- 条件渲染 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
    
    <view v-else-if="list.length === 0" class="empty">
      <text>暂无数据</text>
    </view>
    
    <!-- 按钮 -->
    <button @click="loadMore" :disabled="loading">加载更多</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: 'Uni-app 页面',
      loading: false,
      list: [
        {
          id: 1,
          title: '标题1',
          description: '描述1',
          image: '/static/image1.jpg'
        },
        {
          id: 2,
          title: '标题2',
          description: '描述2',
          image: '/static/image2.jpg'
        }
      ]
    }
  },
  
  // 生命周期
  onLoad(options) {
    console.log('页面加载', options);
    this.initData();
  },
  
  onShow() {
    console.log('页面显示');
  },
  
  onReady() {
    console.log('页面初次渲染完成');
  },
  
  onHide() {
    console.log('页面隐藏');
  },
  
  onUnload() {
    console.log('页面卸载');
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.refreshData();
  },
  
  // 上拉加载
  onReachBottom() {
    console.log('上拉触底');
    this.loadMore();
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: '分享标题',
      path: '/pages/index/index'
    };
  },
  
  methods: {
    initData() {
      // 初始化数据
      this.fetchData();
    },
    
    async fetchData() {
      this.loading = true;
      try {
        // 模拟 API 请求
        const response = await this.$http.get('/api/data');
        this.list = response.data;
      } catch (error) {
        console.error('获取数据失败', error);
        uni.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    async refreshData() {
      await this.fetchData();
      uni.stopPullDownRefresh();
    },
    
    loadMore() {
      if (this.loading) return;
      // 加载更多逻辑
      this.fetchMoreData();
    },
    
    handleItemClick(item, index) {
      console.log('点击项目', item, index);
      uni.navigateTo({
        url: `/pages/detail/detail?id=${item.id}`
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.header {
  text-align: center;
  padding: 40rpx 0;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.content {
  .item {
    display: flex;
    padding: 20rpx;
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 10rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    
    .item-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: 10rpx;
      margin-right: 20rpx;
    }
    
    .item-content {
      flex: 1;
      
      .item-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .item-desc {
        font-size: 28rpx;
        color: #666;
        line-height: 1.5;
      }
    }
  }
}

.loading, .empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

button {
  margin: 20rpx;
  background-color: #007AFF;
  color: #fff;
  border-radius: 10rpx;
}
</style>
```

## 组件开发

### 自定义组件

```vue
<!-- components/custom-card/custom-card.vue -->
<template>
  <view class="custom-card" :class="{'custom-card--shadow': shadow}">
    <view v-if="title" class="custom-card__header">
      <text class="custom-card__title">{{title}}</text>
      <view v-if="$slots.extra" class="custom-card__extra">
        <slot name="extra"></slot>
      </view>
    </view>
    
    <view class="custom-card__body">
      <slot></slot>
    </view>
    
    <view v-if="$slots.footer" class="custom-card__footer">
      <slot name="footer"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    shadow: {
      type: Boolean,
      default: true
    }
  },
  
  methods: {
    handleClick() {
      this.$emit('click');
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-card {
  background-color: #fff;
  border-radius: 10rpx;
  overflow: hidden;
  
  &--shadow {
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
  }
  
  &__title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  &__body {
    padding: 20rpx;
  }
  
  &__footer {
    padding: 20rpx;
    border-top: 1rpx solid #f0f0f0;
    background-color: #fafafa;
  }
}
</style>
```

### 使用自定义组件

```vue
<template>
  <view>
    <!-- 注册组件后使用 -->
    <custom-card title="卡片标题" @click="handleCardClick">
      <template #extra>
        <text class="more">更多</text>
      </template>
      
      <view class="card-content">
        <text>这是卡片内容</text>
      </view>
      
      <template #footer>
        <button size="mini">操作按钮</button>
      </template>
    </custom-card>
  </view>
</template>

<script>
import CustomCard from '@/components/custom-card/custom-card.vue'

export default {
  components: {
    CustomCard
  },
  
  methods: {
    handleCardClick() {
      console.log('卡片被点击');
    }
  }
}
</script>
```

## API 调用

### 网络请求

```javascript
// utils/request.js
class Request {
  constructor() {
    this.baseURL = 'https://api.example.com';
    this.timeout = 10000;
  }
  
  // 请求拦截器
  interceptors = {
    request: (config) => {
      // 添加 token
      const token = uni.getStorageSync('token');
      if (token) {
        config.header = {
          ...config.header,
          'Authorization': `Bearer ${token}`
        };
      }
      
      // 显示加载提示
      uni.showLoading({
        title: '加载中...'
      });
      
      return config;
    },
    
    response: (response) => {
      // 隐藏加载提示
      uni.hideLoading();
      
      // 处理响应数据
      if (response.statusCode === 200) {
        return response.data;
      } else {
        throw new Error(`请求失败: ${response.statusCode}`);
      }
    },
    
    error: (error) => {
      uni.hideLoading();
      uni.showToast({
        title: '网络错误',
        icon: 'none'
      });
      throw error;
    }
  }
  
  request(options) {
    return new Promise((resolve, reject) => {
      // 应用请求拦截器
      const config = this.interceptors.request({
        url: this.baseURL + options.url,
        method: options.method || 'GET',
        data: options.data,
        header: {
          'Content-Type': 'application/json',
          ...options.header
        },
        timeout: this.timeout
      });
      
      uni.request({
        ...config,
        success: (response) => {
          try {
            const result = this.interceptors.response(response);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          this.interceptors.error(error);
          reject(error);
        }
      });
    });
  }
  
  get(url, params) {
    return this.request({
      url,
      method: 'GET',
      data: params
    });
  }
  
  post(url, data) {
    return this.request({
      url,
      method: 'POST',
      data
    });
  }
  
  put(url, data) {
    return this.request({
      url,
      method: 'PUT',
      data
    });
  }
  
  delete(url) {
    return this.request({
      url,
      method: 'DELETE'
    });
  }
}

export default new Request();

// 使用示例
import request from '@/utils/request.js';

export default {
  async mounted() {
    try {
      // GET 请求
      const users = await request.get('/users', { page: 1, limit: 10 });
      console.log('用户列表', users);
      
      // POST 请求
      const newUser = await request.post('/users', {
        name: 'John',
        email: 'john@example.com'
      });
      console.log('创建用户', newUser);
      
    } catch (error) {
      console.error('请求失败', error);
    }
  }
}
```

### 文件上传

```javascript
// 选择并上传图片
export default {
  methods: {
    async chooseAndUploadImage() {
      try {
        // 选择图片
        const chooseResult = await uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        });
        
        const tempFilePath = chooseResult.tempFilePaths[0];
        
        // 上传图片
        const uploadResult = await uni.uploadFile({
          url: 'https://api.example.com/upload',
          filePath: tempFilePath,
          name: 'file',
          formData: {
            'type': 'image'
          }
        });
        
        const response = JSON.parse(uploadResult.data);
        console.log('上传成功', response);
        
        uni.showToast({
          title: '上传成功',
          icon: 'success'
        });
        
        return response.url;
        
      } catch (error) {
        console.error('上传失败', error);
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        });
      }
    },
    
    // 下载文件
    async downloadFile(url, filename) {
      try {
        uni.showLoading({
          title: '下载中...'
        });
        
        const downloadResult = await uni.downloadFile({
          url: url
        });
        
        if (downloadResult.statusCode === 200) {
          // 保存到相册（图片）
          if (filename.includes('.jpg') || filename.includes('.png')) {
            await uni.saveImageToPhotosAlbum({
              filePath: downloadResult.tempFilePath
            });
            uni.showToast({
              title: '保存成功',
              icon: 'success'
            });
          } else {
            // 打开文档
            uni.openDocument({
              filePath: downloadResult.tempFilePath
            });
          }
        }
        
      } catch (error) {
        console.error('下载失败', error);
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    }
  }
}
```

## 状态管理

### Vuex 状态管理

```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import app from './modules/app'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    app
  },
  
  state: {
    // 全局状态
  },
  
  mutations: {
    // 全局 mutations
  },
  
  actions: {
    // 全局 actions
  }
})

export default store

// store/modules/user.js
const state = {
  userInfo: null,
  token: '',
  isLogin: false
}

const mutations = {
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
    state.isLogin = !!userInfo
  },
  
  SET_TOKEN(state, token) {
    state.token = token
    // 持久化存储
    uni.setStorageSync('token', token)
  },
  
  CLEAR_USER_DATA(state) {
    state.userInfo = null
    state.token = ''
    state.isLogin = false
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }
}

const actions = {
  // 登录
  async login({ commit }, { username, password }) {
    try {
      const response = await request.post('/auth/login', {
        username,
        password
      })
      
      const { token, userInfo } = response.data
      
      commit('SET_TOKEN', token)
      commit('SET_USER_INFO', userInfo)
      
      uni.setStorageSync('userInfo', userInfo)
      
      return response
    } catch (error) {
      throw error
    }
  },
  
  // 获取用户信息
  async getUserInfo({ commit }) {
    try {
      const response = await request.get('/user/info')
      commit('SET_USER_INFO', response.data)
      return response
    } catch (error) {
      throw error
    }
  },
  
  // 登出
  logout({ commit }) {
    commit('CLEAR_USER_DATA')
    uni.reLaunch({
      url: '/pages/login/login'
    })
  }
}

const getters = {
  isLogin: state => state.isLogin,
  userInfo: state => state.userInfo,
  userId: state => state.userInfo ? state.userInfo.id : null
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

// main.js 中注册
import store from './store'

Vue.prototype.$store = store

const app = new Vue({
  store,
  ...App
})
```

### 在页面中使用 Vuex

```vue
<template>
  <view class="container">
    <view v-if="isLogin">
      <text>欢迎，{{userInfo.name}}</text>
      <button @click="logout">退出登录</button>
    </view>
    
    <view v-else>
      <button @click="goLogin">去登录</button>
    </view>
  </view>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    // 映射 state
    ...mapState('user', ['userInfo']),
    
    // 映射 getters
    ...mapGetters('user', ['isLogin'])
  },
  
  methods: {
    // 映射 actions
    ...mapActions('user', ['logout']),
    
    goLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    }
  },
  
  async onLoad() {
    // 检查登录状态
    if (this.isLogin) {
      try {
        await this.$store.dispatch('user/getUserInfo')
      } catch (error) {
        console.error('获取用户信息失败', error)
      }
    }
  }
}
</script>
```

## 路由导航

### 页面跳转

```javascript
export default {
  methods: {
    // 保留当前页面，跳转到应用内的某个页面
    navigateToPage() {
      uni.navigateTo({
        url: '/pages/detail/detail?id=123&name=test',
        success: (res) => {
          console.log('跳转成功', res)
        },
        fail: (err) => {
          console.error('跳转失败', err)
        }
      })
    },
    
    // 关闭当前页面，跳转到应用内的某个页面
    redirectToPage() {
      uni.redirectTo({
        url: '/pages/index/index'
      })
    },
    
    // 跳转到 tabBar 页面
    switchToTab() {
      uni.switchTab({
        url: '/pages/home/home'
      })
    },
    
    // 关闭所有页面，打开到应用内的某个页面
    reLaunchToPage() {
      uni.reLaunch({
        url: '/pages/login/login'
      })
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    },
    
    // 编程式导航（带参数）
    navigateWithParams() {
      const params = {
        id: 123,
        data: { name: 'test', age: 25 }
      }
      
      uni.navigateTo({
        url: `/pages/detail/detail?params=${encodeURIComponent(JSON.stringify(params))}`
      })
    }
  }
}

// 接收参数
export default {
  onLoad(options) {
    console.log('页面参数', options)
    
    // 接收简单参数
    const id = options.id
    const name = options.name
    
    // 接收复杂参数
    if (options.params) {
      const params = JSON.parse(decodeURIComponent(options.params))
      console.log('复杂参数', params)
    }
  }
}
```

### 路由守卫

```javascript
// utils/router-guard.js
class RouterGuard {
  constructor() {
    this.beforeEach = null
    this.afterEach = null
  }
  
  // 设置全局前置守卫
  setBeforeEach(guard) {
    this.beforeEach = guard
  }
  
  // 设置全局后置守卫
  setAfterEach(guard) {
    this.afterEach = guard
  }
  
  // 拦截导航
  async navigate(type, options) {
    const to = {
      path: options.url,
      query: this.parseQuery(options.url)
    }
    
    // 执行前置守卫
    if (this.beforeEach) {
      const result = await this.beforeEach(to)
      if (result === false) {
        return // 阻止导航
      }
      if (typeof result === 'string') {
        options.url = result // 重定向
      }
    }
    
    // 执行导航
    const navigationMethods = {
      navigateTo: uni.navigateTo,
      redirectTo: uni.redirectTo,
      switchTab: uni.switchTab,
      reLaunch: uni.reLaunch
    }
    
    const navigate = navigationMethods[type]
    if (navigate) {
      navigate(options)
    }
    
    // 执行后置守卫
    if (this.afterEach) {
      this.afterEach(to)
    }
  }
  
  parseQuery(url) {
    const [path, queryString] = url.split('?')
    const query = {}
    
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=')
        query[key] = decodeURIComponent(value)
      })
    }
    
    return query
  }
}

const routerGuard = new RouterGuard()

// 设置全局前置守卫
routerGuard.setBeforeEach((to) => {
  console.log('导航到', to.path)
  
  // 检查登录状态
  const token = uni.getStorageSync('token')
  const authPages = ['/pages/profile/profile', '/pages/order/order']
  
  if (authPages.includes(to.path) && !token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return '/pages/login/login' // 重定向到登录页
  }
  
  return true // 允许导航
})

// 设置全局后置守卫
routerGuard.setAfterEach((to) => {
  console.log('导航完成', to.path)
  // 统计页面访问
})

export default routerGuard

// 在 main.js 中注册
import routerGuard from '@/utils/router-guard.js'

// 重写导航方法
const originalNavigateTo = uni.navigateTo
uni.navigateTo = function(options) {
  return routerGuard.navigate('navigateTo', options)
}

const originalRedirectTo = uni.redirectTo
uni.redirectTo = function(options) {
  return routerGuard.navigate('redirectTo', options)
}
```

## 平台差异处理

### 条件编译

```vue
<template>
  <view class="container">
    <!-- #ifdef APP-PLUS -->
    <view class="app-only">
      这段代码只在 App 中显示
    </view>
    <!-- #endif -->
    
    <!-- #ifdef MP-WEIXIN -->
    <view class="weixin-only">
      这段代码只在微信小程序中显示
    </view>
    <!-- #endif -->
    
    <!-- #ifdef H5 -->
    <view class="h5-only">
      这段代码只在 H5 中显示
    </view>
    <!-- #endif -->
    
    <!-- #ifndef MP -->
    <view class="not-mp">
      这段代码在非小程序平台显示
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      platform: ''
    }
  },
  
  onLoad() {
    // #ifdef APP-PLUS
    this.platform = 'App'
    this.initApp()
    // #endif
    
    // #ifdef MP-WEIXIN
    this.platform = '微信小程序'
    this.initWeixin()
    // #endif
    
    // #ifdef H5
    this.platform = 'H5'
    this.initH5()
    // #endif
  },
  
  methods: {
    // #ifdef APP-PLUS
    initApp() {
      console.log('App 平台初始化')
      // App 特有逻辑
    },
    // #endif
    
    // #ifdef MP-WEIXIN
    initWeixin() {
      console.log('微信小程序初始化')
      // 微信小程序特有逻辑
    },
    // #endif
    
    // #ifdef H5
    initH5() {
      console.log('H5 平台初始化')
      // H5 特有逻辑
    },
    // #endif
    
    handleClick() {
      // #ifdef APP-PLUS
      // App 平台的处理逻辑
      plus.nativeUI.alert('这是 App 平台')
      // #endif
      
      // #ifdef MP-WEIXIN
      // 微信小程序的处理逻辑
      wx.showModal({
        title: '提示',
        content: '这是微信小程序'
      })
      // #endif
      
      // #ifdef H5
      // H5 平台的处理逻辑
      alert('这是 H5 平台')
      // #endif
    }
  }
}
</script>

<style lang="scss">
.container {
  padding: 20rpx;
  
  /* #ifdef APP-PLUS */
  .app-only {
    background-color: #007AFF;
    color: white;
  }
  /* #endif */
  
  /* #ifdef MP-WEIXIN */
  .weixin-only {
    background-color: #09BB07;
    color: white;
  }
  /* #endif */
  
  /* #ifdef H5 */
  .h5-only {
    background-color: #FF6600;
    color: white;
  }
  /* #endif */
}
</style>
```

### 平台判断

```javascript
// utils/platform.js
export const platform = {
  // 获取当前平台
  get current() {
    // #ifdef APP-PLUS
    return 'app'
    // #endif
    
    // #ifdef MP-WEIXIN
    return 'mp-weixin'
    // #endif
    
    // #ifdef MP-ALIPAY
    return 'mp-alipay'
    // #endif
    
    // #ifdef H5
    return 'h5'
    // #endif
    
    return 'unknown'
  },
  
  // 判断是否为 App
  get isApp() {
    // #ifdef APP-PLUS
    return true
    // #endif
    return false
  },
  
  // 判断是否为小程序
  get isMp() {
    // #ifdef MP
    return true
    // #endif
    return false
  },
  
  // 判断是否为 H5
  get isH5() {
    // #ifdef H5
    return true
    // #endif
    return false
  },
  
  // 判断是否为微信小程序
  get isWeixin() {
    // #ifdef MP-WEIXIN
    return true
    // #endif
    return false
  }
}

// 使用示例
import { platform } from '@/utils/platform.js'

export default {
  onLoad() {
    console.log('当前平台:', platform.current)
    
    if (platform.isApp) {
      this.initAppFeatures()
    } else if (platform.isMp) {
      this.initMpFeatures()
    } else if (platform.isH5) {
      this.initH5Features()
    }
  },
  
  methods: {
    initAppFeatures() {
      // App 特有功能初始化
    },
    
    initMpFeatures() {
      // 小程序特有功能初始化
    },
    
    initH5Features() {
      // H5 特有功能初始化
    }
  }
}
```

## 性能优化

### 代码优化

```javascript
// 1. 使用计算属性
export default {
  data() {
    return {
      list: [],
      keyword: ''
    }
  },
  
  computed: {
    // 使用计算属性而不是方法
    filteredList() {
      if (!this.keyword) return this.list
      return this.list.filter(item => 
        item.name.toLowerCase().includes(this.keyword.toLowerCase())
      )
    }
  }
}

// 2. 防抖和节流
export default {
  data() {
    return {
      searchKeyword: ''
    }
  },
  
  methods: {
    // 防抖搜索
    onSearchInput: this.debounce(function(e) {
      this.searchKeyword = e.detail.value
      this.search()
    }, 300),
    
    // 节流滚动
    onScroll: this.throttle(function(e) {
      console.log('滚动位置', e.detail.scrollTop)
    }, 100),
    
    debounce(func, delay) {
      let timer = null
      return function(...args) {
        clearTimeout(timer)
        timer = setTimeout(() => {
          func.apply(this, args)
        }, delay)
      }
    },
    
    throttle(func, delay) {
      let timer = null
      return function(...args) {
        if (!timer) {
          timer = setTimeout(() => {
            func.apply(this, args)
            timer = null
          }, delay)
        }
      }
    }
  }
}

// 3. 长列表优化
export default {
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 20,
      loading: false,
      finished: false
    }
  },
  
  async onReachBottom() {
    if (this.loading || this.finished) return
    
    this.loading = true
    try {
      const newData = await this.loadMore()
      if (newData.length < this.pageSize) {
        this.finished = true
      }
      this.list = [...this.list, ...newData]
      this.page++
    } catch (error) {
      console.error('加载更多失败', error)
    } finally {
      this.loading = false
    }
  }
}
```

### 图片优化

```vue
<template>
  <view>
    <!-- 图片懒加载 -->
    <image 
      v-for="(item, index) in imageList" 
      :key="item.id"
      :src="item.url" 
      :lazy-load="true"
      :fade-show="true"
      @load="onImageLoad(index)"
      @error="onImageError(index)"
      class="lazy-image"
    ></image>
    
    <!-- 图片预加载 -->
    <image 
      v-for="url in preloadImages" 
      :key="url"
      :src="url" 
      style="display: none;"
    ></image>
  </view>
</template>

<script>
export default {
  data() {
    return {
      imageList: [],
      preloadImages: [],
      loadedImages: new Set()
    }
  },
  
  methods: {
    onImageLoad(index) {
      this.loadedImages.add(index)
      console.log(`图片 ${index} 加载完成`)
    },
    
    onImageError(index) {
      console.error(`图片 ${index} 加载失败`)
      // 使用默认图片
      this.$set(this.imageList, index, {
        ...this.imageList[index],
        url: '/static/default-image.png'
      })
    },
    
    // 预加载图片
    preloadImage(urls) {
      this.preloadImages = urls
    },
    
    // 压缩图片
    async compressImage(src) {
      return new Promise((resolve) => {
        uni.compressImage({
          src,
          quality: 80,
          success: resolve,
          fail: () => resolve({ tempFilePath: src })
        })
      })
    }
  }
}
</script>

<style>
.lazy-image {
  width: 100%;
  height: 200rpx;
  background-color: #f0f0f0;
  transition: opacity 0.3s;
}
</style>
```

## 调试和测试

### 调试技巧

```javascript
// 1. 使用 console 调试
console.log('普通日志')
console.warn('警告信息')
console.error('错误信息')
console.table(data) // 表格形式显示数据

// 2. 条件调试
if (process.env.NODE_ENV === 'development') {
  console.log('开发环境调试信息')
}

// 3. 性能监控
const startTime = Date.now()
// 执行代码
const endTime = Date.now()
console.log('执行时间:', endTime - startTime, 'ms')

// 4. 错误捕获
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue 错误:', err, info)
  // 上报错误信息
}

// 5. 全局错误处理
App({
  onError(error) {
    console.error('全局错误:', error)
    // 上报错误
  },
  
  onUnhandledRejection(event) {
    console.error('未处理的 Promise 拒绝:', event.reason)
    // 上报错误
  }
})
```

### 真机调试

```javascript
// 1. 开启调试模式
// #ifdef APP-PLUS
if (process.env.NODE_ENV === 'development') {
  // 开启调试
  plus.console.log = console.log
}
// #endif

// 2. 网络调试
const originalRequest = uni.request
uni.request = function(options) {
  console.log('请求:', options)
  
  const originalSuccess = options.success
  options.success = function(res) {
    console.log('响应:', res)
    originalSuccess && originalSuccess(res)
  }
  
  const originalFail = options.fail
  options.fail = function(err) {
    console.error('请求失败:', err)
    originalFail && originalFail(err)
  }
  
  return originalRequest(options)
}

// 3. 页面性能监控
export default {
  onLoad() {
    this.pageStartTime = Date.now()
  },
  
  onReady() {
    const loadTime = Date.now() - this.pageStartTime
    console.log('页面加载时间:', loadTime, 'ms')
  }
}
```

## 发布部署

### 打包配置

```javascript
// vue.config.js
module.exports = {
  transpileDependencies: ['uview-ui'],
  
  // H5 配置
  chainWebpack: config => {
    // 发布时删除 console
    config.optimization.minimizer('terser').tap((args) => {
      args[0].terserOptions.compress.drop_console = true
      return args
    })
  },
  
  // 开发服务器配置
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}

// 环境变量配置
// .env.development
VUE_APP_BASE_URL=http://localhost:3000
VUE_APP_ENV=development

// .env.production
VUE_APP_BASE_URL=https://api.example.com
VUE_APP_ENV=production
```

### 多端发布

```bash
# 发布到微信小程序
npm run build:mp-weixin

# 发布到支付宝小程序
npm run build:mp-alipay

# 发布到 H5
npm run build:h5

# 发布到 App
npm run build:app-plus

# 同时发布多个平台
npm run build:mp-weixin && npm run build:h5
```

## 最佳实践

### 项目规范

```javascript
// 1. 命名规范
// 页面文件：kebab-case
// pages/user-profile/user-profile.vue

// 组件文件：PascalCase
// components/UserCard/UserCard.vue

// 方法命名：camelCase
methods: {
  getUserInfo() {},
  handleButtonClick() {}
}

// 2. 代码组织
export default {
  name: 'PageName',
  
  components: {
    // 组件注册
  },
  
  mixins: [
    // 混入
  ],
  
  props: {
    // 属性定义
  },
  
  data() {
    return {
      // 数据定义
    }
  },
  
  computed: {
    // 计算属性
  },
  
  watch: {
    // 监听器
  },
  
  // 生命周期（按顺序）
  onLoad() {},
  onShow() {},
  onReady() {},
  onHide() {},
  onUnload() {},
  
  methods: {
    // 方法定义
  }
}

// 3. 样式规范
<style lang="scss" scoped>
// 使用 BEM 命名规范
.user-card {
  &__header {
    // 元素样式
  }
  
  &__title {
    // 元素样式
  }
  
  &--active {
    // 修饰符样式
  }
}
</style>
```

### 性能优化建议

```javascript
// 1. 合理使用 v-if 和 v-show
// 频繁切换使用 v-show
<view v-show="isVisible">频繁切换的内容</view>

// 条件很少改变使用 v-if
<view v-if="userType === 'admin'">管理员内容</view>

// 2. 列表渲染优化
<view 
  v-for="item in list" 
  :key="item.id"  // 使用唯一 key
>
  {{item.name}}
</view>

// 3. 图片优化
<image 
  :src="imageUrl" 
  lazy-load  // 懒加载
  mode="aspectFit"  // 合适的缩放模式
></image>

// 4. 避免内存泄漏
export default {
  data() {
    return {
      timer: null
    }
  },
  
  onUnload() {
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
```

## 参考资源

- [Uni-app 官方文档](https://uniapp.dcloud.io/)
- [HBuilderX 下载](https://www.dcloud.io/hbuilderx.html)
- [Uni-app 插件市场](https://ext.dcloud.net.cn/)
- [uniCloud 云服务](https://unicloud.dcloud.net.cn/)
- [Uni-app 社区](https://ask.dcloud.net.cn/)
- [DCloud 开发者中心](https://dev.dcloud.net.cn/)

## 总结

Uni-app 作为一个强大的跨平台开发框架，为开发者提供了"一套代码，多端发布"的能力。通过掌握 Vue.js 语法、组件开发、API 调用、状态管理、平台差异处理等核心技术，开发者可以高效地构建覆盖多个平台的应用。随着生态系统的不断完善，uni-app 将继续成为跨平台开发的重要选择。