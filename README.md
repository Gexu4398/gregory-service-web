# Gregory Service Web

Gregory Service 前端管理系统，基于 Vue 3 + TypeScript + Element Plus 构建的现代化管理后台。

## 🚀 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的类型化超集
- **Vite** - 下一代前端构建工具
- **Element Plus** - 基于 Vue 3 的组件库
- **Pinia** - Vue 的状态管理库
- **Vue Router** - Vue.js 官方路由
- **Axios** - HTTP 客户端
- **SCSS** - CSS 预处理器
- **Keycloak** - 身份认证和授权

## 📋 功能特性

- 🔐 **Keycloak 集成** - OAuth2/OIDC 身份认证
- 👥 **用户管理** - 用户增删改查、启用禁用、密码重置
- 🏢 **用户组管理** - 组织架构管理
- 🎭 **角色管理** - 角色权限配置
- 📊 **仪表板** - 系统概览和统计
- 📝 **日志管理** - 操作日志查看
- 🔔 **通知系统** - 系统消息通知
- 📱 **响应式设计** - 适配桌面和移动端
- 🌙 **暗色主题** - 支持主题切换

## 🛠️ 开发环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

## 📦 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 设置环境配置

```bash
# 运行环境配置脚本
./setup-env.sh

# 或者手动创建环境配置文件
cp env.example ..env.development
cp .env.development .env
```

### 3. 修改环境配置

编辑 `.env.development` 文件，根据你的实际环境修改配置：

```env
# API 基础地址
VITE_API_URL=http://localhost:8081/api/v1

# Keycloak 配置
VITE_KEYCLOAK_URL=http://localhost:8080/auth
VITE_KEYCLOAK_REALM=console-app
VITE_KEYCLOAK_CLIENT_ID=console-cli

# 应用标题
VITE_APP_TITLE=Gregory Service 管理系统
```

### 4. 启动开发服务器

```bash
# 使用 npm 命令
npm run dev

# 或者使用便捷脚本
./start-dev.sh
```

访问 http://localhost:3000

## 🔧 环境配置文件说明

项目包含以下环境配置文件：

- `env.example` - 环境配置示例文件
- `env.development` - 开发环境配置模板
- `env.production` - 生产环境配置模板
- `.env.development` - 开发环境实际配置（需要创建）
- `.env.production` - 生产环境实际配置（需要创建）
- `.env` - 当前使用的环境配置（需要创建）

**注意**：`.env*` 文件已添加到 `.gitignore` 中，不会被提交到版本控制系统。

## 🏗️ 构建生产版本

```bash
npm run build
```

## 🔍 代码检查

```bash
npm run lint
```

## 📁 项目结构

```
src/
├── api/              # API 请求封装
│   ├── auth.ts      # 认证相关 API
│   ├── user.ts      # 用户管理 API
│   ├── group.ts     # 用户组 API
│   ├── role.ts      # 角色 API
│   └── request.ts   # HTTP 请求配置
├── components/       # 公共组件
├── layouts/         # 布局组件
│   └── AdminLayout.vue
├── router/          # 路由配置
│   └── index.ts
├── stores/          # 状态管理
│   ├── auth.ts      # 认证状态
│   └── user.ts      # 用户状态
├── styles/          # 全局样式
│   └── index.scss
├── types/           # TypeScript 类型定义
│   └── index.ts
├── utils/           # 工具函数
│   └── index.ts
├── views/           # 页面组件
│   ├── Dashboard.vue
│   ├── Login.vue
│   ├── AuthCallback.vue
│   ├── Profile.vue
│   ├── user/        # 用户管理
│   ├── group/       # 用户组管理
│   ├── role/        # 角色管理
│   └── log/         # 日志管理
├── App.vue          # 根组件
└── main.ts          # 入口文件
```

## 🔐 认证流程

本系统使用 Keycloak 进行身份认证，采用 OAuth2 授权码流程：

1. 用户访问需要认证的页面
2. 系统重定向到 Keycloak 登录页面
3. 用户在 Keycloak 完成登录
4. Keycloak 重定向回应用并带上授权码
5. 前端使用授权码换取 access_token
6. 使用 access_token 调用后端 API

## 🎯 权限控制

系统基于角色的权限控制（RBAC）：

- **角色（Role）**：定义用户的权限集合
- **权限（Permission）**：具体的操作权限，如 `user:crud`、`role:crud` 等
- **用户组（Group）**：用户的组织归属

权限检查在以下层面进行：
- 路由级别：通过路由守卫检查页面访问权限
- 组件级别：在组件中动态检查功能权限
- API 级别：后端接口进行权限验证

## 🔄 状态管理

使用 Pinia 进行状态管理：

- `authStore`：用户认证状态、权限信息
- `userStore`：用户管理相关状态

## 📡 API 集成

所有 API 请求通过 axios 进行，已配置：

- 请求拦截：自动添加 Authorization header
- 响应拦截：统一错误处理和 token 刷新
- 代理配置：开发环境代理到后端服务

## 🎨 UI 设计

- 基于 Element Plus 组件库
- 响应式设计，支持移动端
- 自定义 SCSS 样式
- 支持暗色主题

## 🚀 部署

### Docker 部署

```bash
# 构建镜像
docker build -t gregory-service-web:latest .

# 运行容器
docker run -p 3000:80 gregory-service-web:latest

# 或者使用 docker-compose
docker-compose up -d
```

### 使用部署脚本

```bash
# 普通构建
./deploy.sh

# Docker 部署
./deploy.sh docker

# Nginx 部署
./deploy.sh nginx
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # 处理 Vue Router 的 history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend-server:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持

如有问题或建议，请提交 Issue 或联系开发团队。 