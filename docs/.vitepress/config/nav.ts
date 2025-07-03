export const nav = [
  {
    text: '🎨 前端技术',
    items: [
      {
        text: '前端基础',
        items: [
          { text: 'HTML', link: '/Frontend/Core/HTML/index.md' },
          { text: 'CSS', link: '/Frontend/Core/CSS/index.md' },
          { text: 'JavaScript', link: '/Frontend/Core/JavaScript/index.md' },
          { text: 'TypeScript', link: '/Frontend/Core/TypeScript/index.md' },
          { text: 'ES6+', link: '/Frontend/Core/ES6/index.md' }
        ]
      },
      {
        text: 'Vue 生态',
        items: [
          { text: 'Vue2', link: '/Frontend/VueFrame/Vue2/index.md' },
          { text: 'Vuex', link: '/Frontend/VueFrame/Vuex/index.md' },
          { text: 'Vue3', link: '/Frontend/VueFrame/Vue3/index.md' },
          { text: 'Vue Router', link: '/Frontend/VueFrame/VueRouter/index.md' },
          { text: 'Pinia', link: '/Frontend/VueFrame/Pinia/index.md' },
          { text: 'Nuxt.js', link: '/Frontend/VueFrame/NuxtJs/index.md' }
        ]
      },
      {
        text: 'React 生态',
        items: [
          { text: 'React', link: '/Frontend/ReactFrame/React/index.md' },
          { text: 'React Router', link: '/Frontend/ReactFrame/ReactRouter/index.md' },
          { text: 'Redux Toolkit', link: '/Frontend/ReactFrame/ReduxToolkit/index.md' },
          { text: 'Next.js', link: '/Frontend/ReactFrame/NextJS/index.md' }
        ]
      },
      {
        text: '移动端开发',
        items: [
          { text: 'React Native', link: '/Frontend/MobileDevs/ReactNative/index.md' },
          { text: 'Flutter', link: '/Frontend/MobileDevs/Flutter/index.md' },
          { text: '微信小程序', link: '/Frontend/MobileDevs/MiniProgram/index.md' },
          { text: 'Uni-app', link: '/Frontend/MobileDevs/UniApp/index.md' }
        ]
      }
    ]
  },
  {
    text: '🛠️ 工程化',
    items: [
      {
        text: '开发工具',
        items: [
          { text: 'VS Code', link: '/Engineering/Tools/VSCode/index.md' },
          { text: 'Git', link: '/Engineering/Tools/Git/index.md' },
          { text: 'ESLint', link: '/Engineering/Tools/ESLint/index.md' },
          { text: 'Prettier', link: '/Engineering/Tools/Prettier/index.md' },
          { text: 'Husky', link: '/Engineering/Tools/Husky/index.md' },
          { text: 'lint-staged', link: '/Engineering/Tools/LintStaged/index.md' }
        ]
      },
      {
        text: '构建工具',
        items: [
          { text: 'Vite', link: '/Engineering/Build/Vite/index.md' },
          { text: 'Webpack', link: '/Engineering/Build/Webpack/index.md' },
          { text: 'Rollup', link: '/Engineering/Build/Rollup/index.md' },
          { text: 'ESBuild', link: '/Engineering/Build/ESBuild/index.md' },
          { text: 'Parcel', link: '/Engineering/Build/Parcel/index.md' },
          { text: 'Turbo', link: '/Engineering/Build/Turbo/index.md' }
        ]
      },
      {
        text: '性能优化',
        items: [
          { text: '代码分割', link: '/Engineering/Performance/CodeSplitting/index.md' },
          { text: '懒加载', link: '/Engineering/Performance/LazyLoading/index.md' },
          { text: '缓存策略', link: '/Engineering/Performance/Cache/index.md' },
          { text: '图片优化', link: '/Engineering/Performance/ImageOptimization/index.md' },
          { text: 'CDN优化', link: '/Engineering/Performance/CDN/index.md' },
          { text: 'Tree Shaking', link: '/Engineering/Performance/TreeShaking/index.md' }
        ]
      },
      {
      text: '测试',
      items: [
        { text: '单元测试', link: '/Engineering/Test/Unit/index.md' },
        { text: '集成测试', link: '/Engineering/Test/Integration/index.md' },
        { text: 'E2E测试', link: '/Engineering/Test/E2E/index.md' },
        { text: 'Jest', link: '/Engineering/Test/Jest/index.md' },
        { text: 'Cypress', link: '/Engineering/Test/Cypress/index.md' },
        { text: 'Playwright', link: '/Engineering/Test/Playwright/index.md' }
      ]
    },
      {
        text: '部署运维',
        items: [
          { text: 'CI/CD', link: '/Engineering/Deploy/CICD/index.md' },
          { text: 'Docker', link: '/Engineering/Deploy/Docker/index.md' },
          { text: 'Nginx', link: '/Engineering/Deploy/Nginx/index.md' },
          { text: 'PM2', link: '/Engineering/Deploy/PM2/index.md' },
          { text: '监控告警', link: '/Engineering/Deploy/Monitor/index.md' },
          { text: '日志管理', link: '/Engineering/Deploy/Logging/index.md' }
        ]
      }
    ]
  },
  {
    text: '💡 后端技术',
    items: [
      {
        text: 'Node.js',
        items: [
          { text: 'Node.js基础', link: '/Backend/Node/Basic/index.md' },
          { text: 'Express', link: '/Backend/Node/Express/index.md' },
          { text: 'Koa', link: '/Backend/Node/Koa/index.md' },
          { text: 'NestJS', link: '/Backend/Node/NestJS/index.md' }
        ]
      },
      {
        text: '数据库',
        items: [
          { text: 'MySQL', link: '/Backend/Database/MySQL/index.md' },
          { text: 'MongoDB', link: '/Backend/Database/MongoDB/index.md' },
          { text: 'Redis', link: '/Backend/Database/Redis/index.md' },
          { text: 'PostgreSQL', link: '/Backend/Database/PostgreSQL/index.md' }
        ]
      },
      {
        text: 'API设计',
        items: [
          { text: 'RESTful API', link: '/Backend/API/RESTful/index.md' },
          { text: 'GraphQL', link: '/Backend/API/GraphQL/index.md' },
          { text: 'WebSocket', link: '/Backend/API/WebSocket/index.md' },
          { text: 'gRPC', link: '/Backend/API/gRPC/index.md' }
        ]
      },
      {
        text: '微服务',
        items: [
          { text: '微服务架构', link: '/Backend/Microservice/Architecture/index.md' },
          { text: '服务发现', link: '/Backend/Microservice/Discovery/index.md' },
          { text: '负载均衡', link: '/Backend/Microservice/LoadBalance/index.md' },
          { text: '消息队列', link: '/Backend/Microservice/MessageQueue/index.md' },
          { text: '分布式事务', link: '/Backend/Microservice/Transaction/index.md' },
          { text: '服务网格', link: '/Backend/Microservice/ServiceMesh/index.md' }
        ]
      }
    ]
  },
  {
    text: '📚 计算机基础',
    items: [
      {
        text: '算法与数据结构',
        items: [
          { text: '数据结构', link: '/ComputerScience/Algorithm/DataStructure/index.md' },
          { text: '排序算法', link: '/ComputerScience/Algorithm/Sort/index.md' },
          { text: '搜索算法', link: '/ComputerScience/Algorithm/Search/index.md' },
          { text: '动态规划', link: '/ComputerScience/Algorithm/DP/index.md' },
          { text: '贪心算法', link: '/ComputerScience/Algorithm/Greedy/index.md' },
          { text: '图算法', link: '/ComputerScience/Algorithm/Graph/index.md' }
        ]
      },
      {
        text: '网络协议',
        items: [
          { text: 'HTTP/HTTPS', link: '/ComputerScience/Network/HTTP/index.md' },
          { text: 'TCP/IP', link: '/ComputerScience/Network/TCPIP/index.md' },
          { text: 'WebSocket', link: '/ComputerScience/Network/WebSocket/index.md' },
          { text: 'DNS', link: '/ComputerScience/Network/DNS/index.md' },
          { text: 'CDN', link: '/ComputerScience/Network/CDN/index.md' },
          { text: '网络安全', link: '/ComputerScience/Network/Security/index.md' }
        ]
      },
      {
        text: '操作系统',
        items: [
          { text: '进程与线程', link: '/ComputerScience/OS/Process/index.md' },
          { text: '内存管理', link: '/ComputerScience/OS/Memory/index.md' },
          { text: '文件系统', link: '/ComputerScience/OS/FileSystem/index.md' },
          { text: 'Linux基础', link: '/ComputerScience/OS/Linux/index.md' },
          { text: 'Shell脚本', link: '/ComputerScience/OS/Shell/index.md' },
          { text: '系统调用', link: '/ComputerScience/OS/SystemCall/index.md' }
        ]
      },
      {
        text: '浏览器原理',
        items: [
          { text: '渲染原理', link: '/ComputerScience/Browser/Render/index.md' },
          { text: 'JavaScript引擎', link: '/ComputerScience/Browser/JSEngine/index.md' },
          { text: '性能优化', link: '/ComputerScience/Browser/Performance/index.md' },
          { text: '安全机制', link: '/ComputerScience/Browser/Security/index.md' },
          { text: '缓存机制', link: '/ComputerScience/Browser/Cache/index.md' },
          { text: '事件循环', link: '/ComputerScience/Browser/EventLoop/index.md' }
        ]
      },
      {
        text: '设计模式',
        items: [
          { text: '创建型模式', link: '/ComputerScience/DesignPattern/Creational/index.md' },
          { text: '结构型模式', link: '/ComputerScience/DesignPattern/Structural/index.md' },
          { text: '行为型模式', link: '/ComputerScience/DesignPattern/Behavioral/index.md' },
          { text: 'MVC/MVP/MVVM', link: '/ComputerScience/DesignPattern/Architecture/index.md' },
          { text: '函数式编程', link: '/ComputerScience/DesignPattern/Functional/index.md' }
        ]
      }
    ]
  }
];
