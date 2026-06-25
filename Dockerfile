# ---- Build Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# 只复制依赖文件，利用 Docker 缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# 复制源码并编译
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN pnpm build

# 复制 seeder 等运行时需要的资产
COPY src/seeders ./seeders

# ---- Production Stage ----
FROM node:22-alpine

WORKDIR /app

# 从 builder 复制编译产物和 node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/seeders ./seeders

# 注意：mikro-orm.config.ts 中 entities 配置指向 dist/**/*.entity.js，所以 dist 下就已经包含了 entity，无需额外配置

EXPOSE 3001

CMD ["node", "dist/main.js"]
