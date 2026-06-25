# Docker 部署指南

## 前置条件

- Docker Desktop 已安装并运行
- 本项目使用 **pnpm**（Docker 内用 corepack 自动管理）

## 环境变量

项目依赖 `.env` 文件，docker-compose 会自动读取。确保 `.env` 包含以下配置：

```env
# 端口
PORT=3001

# JWT 密钥
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# 数据库连接（示例：Neon PostgreSQL）
ORM_HOST=your-db-host
ORM_PORT=5432
ORM_NAME=your-db-name
ORM_USER=your-db-user
ORM_PASSWORD=your-db-password
```

> `.env` 中的 `NODE_ENV` 会被 docker-compose 里显式设置的 `NODE_ENV=production` 覆盖。

## 快速启动

```bash
# 构建并启动
docker compose up --build -d

# 查看日志
docker compose logs -f

# 查看容器状态
docker compose ps

# 停止
docker compose down

# 停止并清除数据卷
docker compose down -v
```

## 完整流程

### 1. 首次构建

```bash
docker compose up --build -d
```

构建过程：
1. `builder` 阶段：安装依赖 → 编译 TypeScript → 输出到 `dist/`
2. `production` 阶段：复制 `dist/`、`node_modules`、`seeders` → 启动 `node dist/main.js`

### 2. 启动后验证

```bash
# 注册新用户
curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 获取用户信息
curl -s http://localhost:3001/users/me \
  -H "Authorization: Bearer <access_token>"

# 查看文章列表（无需登录）
curl -s "http://localhost:3001/articles/public?page=1&limit=10"
```

### 3. 更新后重新构建

代码变更后，重新构建并启动：

```bash
docker compose up --build -d
```

### 4. 清理

清理容器、镜像、数据卷：

```bash
# 停止并移除容器
docker compose down

# 移除镜像
docker rmi aedium-nest-app

# 清理孤儿容器（如果改动过 docker-compose.yml）
docker compose down --remove-orphans

# 彻底清理（包括数据卷）
docker compose down -v
```

## 目录结构说明

```
.
├── Dockerfile          # 多阶段构建：builder → production
├── docker-compose.yml  # 服务编排（仅 app 服务）
├── .env                # 环境变量（docker-compose 自动读取）
├── pnpm-workspace.yaml # pnpm 构建许可配置
├── dist/               # 构建产物
└── src/                # TypeScript 源码
```

## Dockerfile 说明

多阶段构建：

- **builder 阶段**：安装全部依赖 → 编译 TS → 产出 `dist/`
- **production 阶段**：仅复制运行时需要的文件，减小镜像体积

镜像只包含 `dist/`、`node_modules`、`seeders`，不包含源码。

## 常见问题

### 1. 镜像加速器失效

如果 `docker build` 拉取镜像失败，检查 `~/.docker/daemon.json`，移除失效的 `registry-mirrors`：

```json
{
  "experimental": false
}
```

然后重启 Docker Desktop。

### 2. pnpm 构建报错

docker-compose 会自动读取 `pnpm-workspace.yaml` 中的 `allowBuilds` 配置。如果新增了需要编译原生模块的依赖，需要在 `pnpm-workspace.yaml` 中添加：

```yaml
allowBuilds:
  '新依赖包名': true
```

### 3. 查看应用日志

默认 production 模式只输出 `error` 和 `warn` 级别日志。如需完整日志（调试用）：

```bash
# 临时方案：修改 docker-compose.yml，将 NODE_ENV 改为 development
# 然后重新构建启动
```

## API 接口一览

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/auth/register` | 公开 | 注册 `{email, password}` |
| POST | `/auth/login` | 公开 | 登录 `{email, password}` |
| GET | `/auth/refresh` | 公开 | 刷新 token |
| GET | `/auth/logout` | Bearer | 退出登录 |
| GET | `/users/me` | Bearer | 当前用户信息 |
| GET/POST | `/users` | Admin | 用户管理 |
| GET | `/articles/public` | 公开 | 已发布的文章列表 |
| GET | `/articles/public/:id` | 公开 | 文章详情 |
| GET/POST | `/articles/me` | Bearer | 自己的文章 |
| PATCH/DELETE | `/articles/me/:id` | Bearer | 编辑/删除自己的文章 |
