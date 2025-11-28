# 极简智能导航 - Minimalist Smart Navigation

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**一个现代化的网址导航系统，集成在线工具箱和 AI 智能助手**

[在线演示](https://8y.cx) | [安装文档](./INSTALL.md) | [部署指南](./DEPLOY.md)

</div>

---

## ✨ 核心特性

### 🎯 网址导航系统

- **分类管理** - 多级分类结构，支持无限层级
- **板块组织** - 每个分类下可创建多个板块
- **网站卡片** - 精美的网站卡片展示，支持图标、描述、标签
- **密码保护** - 板块级别的密码保护功能
- **标签系统** - 灵活的标签分类和筛选
- **拖拽排序** - 直观的拖拽排序功能
- **搜索功能** - 快速搜索网站和工具
- **响应式设计** - 完美适配桌面端和移动端

### 🛠️ 在线工具箱

- **工具分类** - 支持多个工具分类
- **Monaco 编辑器** - 专业的代码编辑器，支持 HTML/CSS/JavaScript
- **实时预览** - 工具代码实时预览
- **模板库** - 内置常用工具模板
- **代码管理** - 支持复制、下载、上传工具代码
- **安全检查** - 可选的代码安全验证
- **图标选择器** - 16 个分类，300+ emoji 图标
- **工具排行榜** - 基于浏览量和点赞数的排行榜
- **内置工具** - 9 个实用工具开箱即用

### 🤖 AI 智能助手

- **多提供商支持** - OpenAI、Google Gemini、Anthropic Claude、智谱 AI
- **模型管理** - 支持多个 AI 模型配置和切换
- **全局默认模型** - 设置默认 AI 模型
- **连接测试** - 一键测试 AI 模型连接
- **前端调用** - 无需认证，前端直接调用 AI 接口
- **使用指南** - 详细的 API 调用文档和示例

## 🚀 快速开始

### 安装

\`\`\`bash
# 克隆项目
git clone https://github.com/yourusername/minimalist-navigation.git
cd minimalist-navigation

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 ENCRYPTION_KEY

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
\`\`\`

访问 \`http://localhost:3000\`

### 首次使用

1. 访问 \`http://localhost:3000/admin/login\`
2. 默认账号：\`admin\` / \`admin123\`
3. **立即修改密码**：管理后台 → 修改密码
4. 配置 AI 提供商（可选）
5. 导入内置工具或创建自己的工具
6. 开始添加网站和分类

## 📚 详细文档

- [安装文档](./INSTALL.md) - 详细的安装步骤和环境配置
- [部署指南](./DEPLOY.md) - 生产环境部署指南

## 📄 许可证

本项目采用 MIT 许可证

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

Made with ❤️

</div>
