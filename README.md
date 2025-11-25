# 极简智能导航 (Smart Nav)

一个基于 Next.js 14 构建的现代化、高性能、可高度定制的网址导航系统。集成了 AI 智能助手、密码保护、个性化主题等特色功能。

## ✨ 核心特性

### 🚀 极致体验
- **现代化 UI 设计**：采用 Zinc + Indigo 配色，结合毛玻璃 (Glassmorphism) 特效，视觉体验清爽大气。
- **完美深色模式**：全站支持明亮/暗黑模式无缝切换，图标背景智能适配。
- **流畅动画**：基于 Framer Motion 的页面转场和交互动画。
- **响应式布局**：完美适配桌面端、平板和移动端设备。

### 🛡️ 隐私与安全
- **板块密码保护**：支持对特定板块设置访问密码，保护私有链接或敏感内容。
- **安全后台管理**：基于 JWT 的管理员身份验证。

### 🤖 AI 智能赋能
- **AI 助手集成**：内置 Gemini AI 驱动的智能助手。
- **智能推荐**：支持自然语言对话，智能推荐相关网站。
- **Magic Fill**：(开发中) AI 自动填充站点信息。

### 📊 数据与互动
- **多维排行榜**：首页展示“站长推荐”、“热门浏览”、“最新收录”、“随机探索”四大榜单。
- **用户互动**：支持站点点赞和浏览量统计，实时反馈热门程度。
- **全局搜索**：支持对分类、板块、站点标题及描述的实时搜索。

### 🎨 高度个性化
- **背景自定义**：支持上传多张背景图片，可设置“固定”或“随机”展示模式。
- **布局配置**：后台可配置卡片网格列数、描述截断行数等。
- **站点图标**：支持自动获取 Favicon，也支持自定义上传或 SVG 代码。

## 🛠️ 技术栈

- **框架**: [Next.js 14](https://nextjs.org/) (App Router)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **数据库**: [SQLite](https://www.sqlite.org/) (via [Prisma ORM](https://www.prisma.io/))
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **图标**: [Lucide React](https://lucide.dev/)
- **AI**: Google Gemini API

## 📦 快速开始

### 1. 环境准备
确保你的环境已安装 Node.js 18+。

### 2. 安装依赖
```bash
npm install
# 或
pnpm install
```

### 3. 数据库初始化
```bash
npx prisma migrate dev --name init
npx prisma db seed # 导入初始数据
```

### 4. 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:3000 即可看到效果。

### 5. 后台管理
访问 http://localhost:3000/admin 进入后台管理系统。
- 默认账户：(请在数据库 seed 中查看或自行注册)

## 📝 部署

本项目推荐部署在 [Vercel](https://vercel.com) 或任何支持 Node.js 的服务器上。

```bash
npm run build
npm start
```

## 📄 许可证

MIT License
