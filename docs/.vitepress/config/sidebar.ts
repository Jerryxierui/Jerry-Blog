export const sidebar = {
  // 前端开发
  '/Frontend/': [
    {
      text: '核心技术',
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
  ],

  // 后端开发
  '/Backend/': [
    {
      text: 'Node.js 生态',
      items: [
        { text: 'Node.js', link: '/Backend/NodeJS/index.md' },
        { text: 'Express', link: '/Backend/Express/index.md' },
        { text: 'Koa', link: '/Backend/Koa/index.md' },
        { text: 'NestJS', link: '/Backend/NestJS/index.md' }
      ]
    },
    {
      text: 'Python 生态',
      items: [
        { text: 'Python', link: '/Backend/Python/index.md' },
        { text: 'Django', link: '/Backend/Django/index.md' },
        { text: 'FastAPI', link: '/Backend/FastAPI/index.md' },
        { text: 'Flask', link: '/Backend/Flask/index.md' }
      ]
    }
  ],

  // 数据库与存储
  '/Database/': [
    {
      text: '关系型数据库',
      items: [
        { text: 'MySQL', link: '/Database/MySQL/index.md' },
        { text: 'PostgreSQL', link: '/Database/PostgreSQL/index.md' },
        { text: 'SQL Server', link: '/Database/SQLServer/index.md' },
        { text: 'Oracle', link: '/Database/Oracle/index.md' }
      ]
    },
    {
      text: 'NoSQL 数据库',
      items: [
        { text: 'MongoDB', link: '/Database/MongoDB/index.md' },
        { text: 'Redis', link: '/Database/Redis/index.md' },
        { text: 'Elasticsearch', link: '/Database/Elasticsearch/index.md' },
        { text: 'Cassandra', link: '/Database/Cassandra/index.md' }
      ]
    },
    {
      text: '数据处理',
      items: [
        { text: 'SQL 优化', link: '/Database/SQLOptimization/index.md' },
        { text: '数据建模', link: '/Database/DataModeling/index.md' },
        { text: '数据迁移', link: '/Database/DataMigration/index.md' },
        { text: '备份恢复', link: '/Database/BackupRestore/index.md' }
      ]
    }
  ],

  // DevOps与运维
  '/DevOps/': [
    {
      text: '容器化技术',
      items: [
        { text: 'Docker', link: '/DevOps/Docker/index.md' },
        { text: 'Kubernetes', link: '/DevOps/Kubernetes/index.md' },
        { text: 'Docker Compose', link: '/DevOps/DockerCompose/index.md' },
        { text: 'Helm', link: '/DevOps/Helm/index.md' }
      ]
    },
    {
      text: '云服务平台',
      items: [
        { text: 'AWS', link: '/DevOps/AWS/index.md' },
        { text: 'Azure', link: '/DevOps/Azure/index.md' },
        { text: '阿里云', link: '/DevOps/Aliyun/index.md' },
        { text: '腾讯云', link: '/DevOps/TencentCloud/index.md' }
      ]
    },
    {
      text: 'CI/CD',
      items: [
        { text: 'GitHub Actions', link: '/DevOps/GitHubActions/index.md' },
        { text: 'GitLab CI', link: '/DevOps/GitLabCI/index.md' },
        { text: 'Jenkins', link: '/DevOps/Jenkins/index.md' },
        { text: 'Azure DevOps', link: '/DevOps/AzureDevOps/index.md' }
      ]
    },
    {
      text: '监控与日志',
      items: [
        { text: 'Prometheus', link: '/DevOps/Prometheus/index.md' },
        { text: 'Grafana', link: '/DevOps/Grafana/index.md' },
        { text: 'ELK Stack', link: '/DevOps/ELK/index.md' },
        { text: 'Nginx', link: '/DevOps/Nginx/index.md' }
      ]
    }
  ],

  // 工程化与工具
  '/Engineering/': [
    {
      text: '构建工具',
      items: [
        { text: 'Vite', link: '/Engineering/Vite/index.md' },
        { text: 'Webpack', link: '/Engineering/Webpack/index.md' },
        { text: 'Rollup', link: '/Engineering/Rollup/index.md' },
        { text: 'Turbo', link: '/Engineering/Turbo/index.md' }
      ]
    },
    {
      text: '代码质量',
      items: [
        { text: 'ESLint', link: '/Engineering/ESLint/index.md' },
        { text: 'Prettier', link: '/Engineering/Prettier/index.md' },
        { text: 'Husky', link: '/Engineering/Husky/index.md' },
        { text: 'SonarQube', link: '/Engineering/SonarQube/index.md' }
      ]
    },
    {
      text: '测试框架',
      items: [
        { text: 'Jest', link: '/Engineering/Jest/index.md' },
        { text: 'Vitest', link: '/Engineering/Vitest/index.md' },
        { text: 'Cypress', link: '/Engineering/Cypress/index.md' },
        { text: 'Playwright', link: '/Engineering/Playwright/index.md' }
      ]
    },
    {
      text: '版本控制',
      items: [
        { text: 'Git', link: '/Engineering/Git/index.md' },
        { text: 'GitHub', link: '/Engineering/GitHub/index.md' },
        { text: 'GitLab', link: '/Engineering/GitLab/index.md' },
        { text: '语义化版本', link: '/Engineering/SemanticVersioning/index.md' }
      ]
    }
  ]
};
