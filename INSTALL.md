# 极简智能导航网站 - 安装与部署指南

本文档将指导您从零开始搭建并运行本导航网站。

## 1. 环境要求

在开始之前，请确保您的服务器或本地开发环境满足以下要求：

*   **Node.js**: 版本 >= 18.0.0 (推荐使用 LTS 版本)
*   **包管理器**: npm (通常随 Node.js 一起安装) 或 yarn / pnpm
*   **数据库**: SQLite (默认) 或其他 Prisma 支持的数据库 (MySQL, PostgreSQL 等)

## 2. 获取代码

如果您是直接下载的源码包，请解压到您想要安装的目录。
如果是 Git 仓库，请克隆代码：

```bash
git clone <repository-url>
cd <project-directory>
```

## 3. 安装依赖

在项目根目录下打开终端，运行以下命令安装项目所需的依赖包：

```bash
npm install
# 或者
yarn install
# 或者
pnpm install
```

## 4. 配置环境变量

1.  在项目根目录下找到 `.env` 文件（如果没有，请创建一个）。
2.  参考以下内容配置您的环境变量：

```env
# 数据库连接字符串 (默认使用 SQLite 文件数据库)
DATABASE_URL="file:./dev.db"

# Google Gemini API Key (用于 AI 智能助手和自动填充功能)
# 获取地址: https://makersuite.google.com/app/apikey
GEMINI_API_KEY="your_gemini_api_key_here"

# (可选) 如果您部署在生产环境，建议设置一个随机的密钥用于加密 Cookie 等
# NEXTAUTH_SECRET="your_random_secret_string"
```

## 5. 初始化数据库

本项目使用 Prisma 作为 ORM。在运行项目之前，需要初始化数据库结构并生成 Prisma Client。

```bash
# 生成数据库迁移文件并应用到数据库
npx prisma migrate dev --name init

# (可选) 如果您想填充一些初始测试数据
npx prisma db seed
```

*注意：执行 `migrate dev` 命令后，会在 `prisma` 目录下生成一个 `dev.db` 文件，这就是您的 SQLite 数据库文件。*

## 6. 运行项目

### 开发环境 (Development)

如果您正在进行开发或调试，可以使用开发模式运行：

```bash
npm run dev
```

运行成功后，打开浏览器访问 `http://localhost:3000` 即可看到网站。

### 生产环境 (Production)

如果您要部署到服务器上正式使用，请按照以下步骤操作：

1.  **构建项目**:

    ```bash
    npm run build
    ```

2.  **启动服务**:

    ```bash
    npm start
    ```

服务启动后，默认运行在 `3000` 端口。您可以使用 Nginx 等反向代理服务器将域名指向该端口。

## 7. 后台管理

*   **后台入口**: `http://your-domain.com/admin/login`
*   **默认账号**: `admin`
*   **默认密码**: `admin123` (请在登录后立即修改密码！)

## 8. 常见问题

**Q: 数据库文件在哪里？**
A: 默认情况下，SQLite 数据库文件位于 `prisma/dev.db`。请务必定期备份该文件。

**Q: 如何修改数据库类型？**
A: 修改 `prisma/schema.prisma` 文件中的 `datasource` 块，将 `provider` 改为 `mysql` 或 `postgresql`，并更新 `.env` 中的 `DATABASE_URL`，然后重新运行 `npx prisma migrate dev`。

**Q: AI 功能无法使用？**
A: 请检查 `.env` 文件中是否正确配置了 `GEMINI_API_KEY`，并确保您的服务器网络可以访问 Google API。

**Q: 更新代码后，后台保存设置失败？**
A: 这通常是因为数据库结构没有更新。如果您在服务器上部署，请确保在更新代码后执行了数据库迁移命令：
```bash
npx prisma db push
```
或者，您可以将本地开发环境中已经更新好的 `prisma/dev.db` 文件上传到服务器覆盖旧文件（注意备份数据）。

---

祝您使用愉快！