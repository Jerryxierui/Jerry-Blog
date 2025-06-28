# Vue2 框架详解

## 介绍

Vue2是一个渐进式JavaScript框架，专注于视图层，易于上手且灵活强大。它采用MVVM架构模式，通过简洁的API提供数据驱动的视图组件，使开发者能够构建复杂的单页应用。

::: tip 版本说明
Vue2.x系列的最后一个版本是2.7（代号：Naruto），它包含了Vue3中的部分新特性，如组合式API。本文主要基于Vue2.6版本进行讲解。
:::

## 基础概念

### Vue实例

Vue应用从创建一个Vue实例开始，实例是Vue应用的核心。

```js
const vm = new Vue({
  el: '#app',           // 挂载点
  data: {               // 数据
    message: 'Hello Vue!'
  },
  methods: {            // 方法
    greet() {
      alert(this.message)
    }
  }
})
```

### 数据与方法

Vue实例创建时，会将`data`对象中的所有属性加入到Vue的响应式系统中。当这些属性的值发生变化时，视图会自动更新。

```js
// 数据对象
const data = { count: 0 }

// 创建Vue实例
const vm = new Vue({
  data: data
})

// 获取实例上的属性
console.log(vm.count) // => 0

// 修改实例属性会影响原始数据
vm.count = 1
console.log(data.count) // => 1

// 反之亦然
data.count = 2
console.log(vm.count) // => 2
```

::: warning 注意
Vue2中只有实例创建时就存在于`data`中的属性才是响应式的。如果你需要添加新属性，应使用`Vue.set()`或`this.$set()`方法。
:::

## 模板语法

Vue使用基于HTML的模板语法，允许开发者声明式地将DOM绑定到Vue实例的数据。

### 文本插值

最基本的数据绑定形式是使用"Mustache"语法（双大括号）：

```html
<span>消息: {{ message }}</span>
```

### 指令

指令是带有`v-`前缀的特殊属性，用于在表达式的值改变时，将某些行为应用到DOM上。

#### v-bind

动态绑定一个或多个属性：

```html
<!-- 完整语法 -->
<a v-bind:href="url">链接</a>

<!-- 缩写 -->
<a :href="url">链接</a>
```

#### v-on

监听DOM事件：

```html
<!-- 完整语法 -->
<button v-on:click="doSomething">点击</button>

<!-- 缩写 -->
<button @click="doSomething">点击</button>
```

#### v-model

创建双向数据绑定：

```html
<input v-model="message">
<p>输入的内容: {{ message }}</p>
```

#### v-if / v-else / v-else-if

条件性渲染元素：

```html
<div v-if="type === 'A'">
  A
</div>
<div v-else-if="type === 'B'">
  B
</div>
<div v-else>
  Not A/B
</div>
```

#### v-for

基于数组或对象渲染列表：

```html
<ul>
  <li v-for="(item, index) in items" :key="item.id">
    {{ index }} - {{ item.name }}
  </li>
</ul>
```

::: warning 注意
使用`v-for`时，始终提供`key`属性以帮助Vue跟踪每个节点的身份，从而重用和重新排序现有元素。
:::

## 计算属性与侦听器

### 计算属性

对于任何包含响应式数据的复杂逻辑，都应该使用计算属性。

```js
const vm = new Vue({
  data: {
    firstName: 'John',
    lastName: 'Doe'
  },
  computed: {
    // 计算属性的getter
    fullName: function() {
      return this.firstName + ' ' + this.lastName
    },
    // 带有setter的计算属性
    fullName2: {
      get: function() {
        return this.firstName + ' ' + this.lastName
      },
      set: function(newValue) {
        const names = newValue.split(' ')
        this.firstName = names[0]
        this.lastName = names[names.length - 1]
      }
    }
  }
})
```

### 侦听器

当需要在数据变化时执行异步或开销较大的操作时，使用侦听器是最有用的。

```js
const vm = new Vue({
  data: {
    question: '',
    answer: 'Questions usually contain a question mark. ;-)'
  },
  watch: {
    // 如果question发生改变，这个函数就会运行
    question: function(newQuestion, oldQuestion) {
      this.answer = 'Waiting for you to stop typing...'
      this.debouncedGetAnswer()
    }
  },
  created: function() {
    // _.debounce是一个通过Lodash限制操作频率的函数
    this.debouncedGetAnswer = _.debounce(this.getAnswer, 500)
  },
  methods: {
    getAnswer: function() {
      if (this.question.indexOf('?') === -1) {
        this.answer = 'Questions usually contain a question mark. ;-)'
        return
      }
      this.answer = 'Thinking...'
      const vm = this
      axios.get('https://yesno.wtf/api')
        .then(function(response) {
          vm.answer = _.capitalize(response.data.answer)
        })
        .catch(function(error) {
          vm.answer = 'Error! Could not reach the API. ' + error
        })
    }
  }
})
```

## 组件系统

组件是Vue的重要概念，它可以扩展HTML元素，封装可重用的代码。

### 全局注册

```js
// 定义一个名为button-counter的新组件
Vue.component('button-counter', {
  data: function() {
    return {
      count: 0
    }
  },
  template: '<button @click="count++">You clicked me {{ count }} times.</button>'
})
```

### 局部注册

```js
const ComponentA = {
  /* ... */
}

const ComponentB = {
  /* ... */
}

new Vue({
  el: '#app',
  components: {
    'component-a': ComponentA,
    'component-b': ComponentB
  }
})
```

### Props传递数据

```js
Vue.component('blog-post', {
  props: ['title'],
  template: '<h3>{{ title }}</h3>'
})
```

```html
<blog-post title="My journey with Vue"></blog-post>
<blog-post title="Blogging with Vue"></blog-post>
```

### 自定义事件

子组件可以通过调用内建的`$emit`方法并传入事件名称来触发一个事件：

```js
Vue.component('custom-button', {
  template: `
    <button @click="$emit('enlarge-text', 0.1)">
      Enlarge text
    </button>
  `
})
```

父组件可以在使用子组件的地方监听这个事件：

```html
<custom-button @enlarge-text="fontSize += $event"></custom-button>
```

## 生命周期钩子

Vue实例在创建时会经历一系列的初始化过程，在这个过程中会运行一些叫做生命周期钩子的函数。

```js
new Vue({
  data: {
    message: 'Hello!'
  },
  created: function() {
    // 实例被创建后执行
    console.log('created: ' + this.message)
  },
  mounted: function() {
    // el被新创建的vm.$el替换，并挂载到实例上去之后执行
    console.log('mounted: ' + this.message)
  },
  updated: function() {
    // 数据更新导致的虚拟DOM重新渲染和打补丁之后执行
    console.log('updated')
  },
  destroyed: function() {
    // 实例销毁后执行
    console.log('destroyed')
  }
})
```

![Vue生命周期图示](https://cn.vuejs.org/images/lifecycle.png)

## 过渡与动画

Vue提供了`transition`组件，可以在以下情形中应用过渡效果：

- 条件渲染 (使用`v-if`)
- 条件展示 (使用`v-show`)
- 动态组件
- 组件根节点

```html
<div id="demo">
  <button @click="show = !show">
    Toggle
  </button>
  <transition name="fade">
    <p v-if="show">hello</p>
  </transition>
</div>
```

```js
new Vue({
  el: '#demo',
  data: {
    show: true
  }
})
```

```css
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
```

## 混入 (Mixins)

混入是一种分发Vue组件中可复用功能的非常灵活的方式。

```js
// 定义一个混入对象
const myMixin = {
  created: function() {
    this.hello()
  },
  methods: {
    hello: function() {
      console.log('hello from mixin!')
    }
  }
}

// 定义一个使用混入对象的组件
const Component = Vue.extend({
  mixins: [myMixin],
  created: function() {
    console.log('component hook called')
  }
})

const component = new Component() // => "hello from mixin!" 然后是 "component hook called"
```

## 插件

插件通常用来为Vue添加全局功能。

```js
// 定义插件
const MyPlugin = {
  install(Vue, options) {
    // 1. 添加全局方法或属性
    Vue.myGlobalMethod = function() {
      // 逻辑...
    }

    // 2. 添加全局指令
    Vue.directive('my-directive', {
      bind(el, binding, vnode, oldVnode) {
        // 逻辑...
      }
    })

    // 3. 注入组件选项
    Vue.mixin({
      created: function() {
        // 逻辑...
      }
    })

    // 4. 添加实例方法
    Vue.prototype.$myMethod = function(methodOptions) {
      // 逻辑...
    }
  }
}

// 使用插件
Vue.use(MyPlugin)
```

## 状态管理 (Vuex)

对于大型应用，我们通常使用Vuex来进行状态管理。

```js
// store.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    }
  },
  getters: {
    doubleCount: state => {
      return state.count * 2
    }
  }
})
```

```js
// 在组件中使用
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    // 从state中获取
    ...mapState([
      'count'
    ]),
    // 从getters中获取
    ...mapGetters([
      'doubleCount'
    ])
  },
  methods: {
    // 映射actions
    ...mapActions([
      'incrementAsync'
    ]),
    // 直接提交mutation
    increment() {
      this.$store.commit('increment')
    }
  }
}
```

## 路由 (Vue Router)

Vue Router是Vue.js官方的路由管理器。

```js
// router.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './components/Home.vue'
import About from './components/About.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  // 动态路径参数
  { path: '/user/:id', component: User },
  // 嵌套路由
  {
    path: '/parent',
    component: Parent,
    children: [
      { path: 'child', component: Child }
    ]
  },
  // 命名路由
  { path: '/named', name: 'named', component: Named },
  // 重定向
  { path: '/redirect', redirect: '/' },
  // 捕获所有路由
  { path: '*', component: NotFound }
]

const router = new VueRouter({
  mode: 'history', // 使用HTML5 History模式
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // ...
  next()
})

export default router
```

```js
// 在组件中使用
export default {
  // 组件内的导航守卫
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被确认前调用
    // 不能获取组件实例 `this`
    next(vm => {
      // 通过 `vm` 访问组件实例
    })
  },
  methods: {
    goToHome() {
      // 编程式导航
      this.$router.push('/')
    },
    goToNamed() {
      this.$router.push({ name: 'named' })
    },
    goToUser(id) {
      this.$router.push({ path: `/user/${id}` })
    }
  }
}
```

```html
<!-- 在模板中使用 -->
<div>
  <!-- 使用router-link组件导航 -->
  <router-link to="/">Home</router-link>
  <router-link to="/about">About</router-link>

  <!-- 路由出口 -->
  <router-view></router-view>
</div>
```

## 服务端渲染 (SSR)

Vue.js支持服务端渲染，可以使用官方的Nuxt.js框架或自行配置。

```js
// 使用Vue SSR
const Vue = require('vue')
const server = require('express')()
const renderer = require('vue-server-renderer').createRenderer()

server.get('*', (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>访问的URL是: {{ url }}</div>`
  })

  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error')
      return
    }
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vue SSR Example</title>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `)
  })
})

server.listen(8080)
```

## 性能优化

### 懒加载组件

```js
// 异步组件
Vue.component('async-example', function(resolve, reject) {
  setTimeout(function() {
    // 向resolve回调传递组件定义
    resolve({
      template: '<div>I am async!</div>'
    })
  }, 1000)
})

// 结合webpack的代码分割功能
Vue.component('async-webpack-example', () => import('./my-async-component'))

// 在路由中使用
const router = new VueRouter({
  routes: [
    { path: '/foo', component: () => import('./Foo.vue') }
  ]
})
```

### 保持组件纯净

```js
// 使用计算属性
computed: {
  normalizedData() {
    return this.data.map(item => ({
      ...item,
      normalized: true
    }))
  }
}

// 使用函数式组件
Vue.component('my-component', {
  functional: true,
  render: function(createElement, context) {
    // 无状态，无实例，无this
    return createElement('div', context.data, context.children)
  },
  props: {
    // ...
  }
})
```

## 最佳实践

### 组件命名

```js
// 组件名应该始终是多个单词的，使用kebab-case或PascalCase
Vue.component('todo-item', { /* ... */ })
Vue.component('TodoItem', { /* ... */ })
```

### Prop验证

```js
Vue.component('my-component', {
  props: {
    // 基础类型检查
    propA: Number,
    // 多种类型
    propB: [String, Number],
    // 必填字符串
    propC: {
      type: String,
      required: true
    },
    // 带有默认值的数字
    propD: {
      type: Number,
      default: 100
    },
    // 带有默认值的对象
    propE: {
      type: Object,
      default: function() {
        return { message: 'hello' }
      }
    },
    // 自定义验证函数
    propF: {
      validator: function(value) {
        return ['success', 'warning', 'danger'].indexOf(value) !== -1
      }
    }
  }
})
```

### 事件命名

```js
// 事件名应该使用kebab-case
this.$emit('my-event')
```

## 总结

Vue2是一个灵活且强大的前端框架，它提供了丰富的功能和API，使开发者能够构建各种规模的应用。本文档涵盖了Vue2的核心概念和特性，但Vue的生态系统还有更多内容值得探索。

::: tip 学习建议
1. 从小项目开始，逐步掌握Vue的基础概念
2. 深入理解响应式原理和组件通信
3. 学习Vuex和Vue Router等生态工具
4. 探索高级特性如自定义指令、混入和插件
5. 关注性能优化和最佳实践
:::

## 参考资源

- [Vue2官方文档](https://v2.cn.vuejs.org/)
- [Vue Router文档](https://v3.router.vuejs.org/zh/)
- [Vuex文档](https://v3.vuex.vuejs.org/zh/)
- [Vue CLI文档](https://cli.vuejs.org/zh/)
