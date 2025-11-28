# 极简智能导航 - 安装文档

本文档将详细指导您从零开始安装和配置极简智能导航系统。

---

## 🔧 环境要求

### 必需环境

| 软件 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | >= 18.17.0 | 推荐使用 LTS 版本 (20.x) |
| npm | >= 9.0.0 | 通常随 Node.js 一起安装 |
| 操作系统 | Windows/Linux/macOS | 支持所有主流操作系统 |

### 检查环境

```bash
# 检查 Node.js 版本
node -v
# 应输出: v18.17.0 或更高

# 检查 npm 版本
npm -v
# 应输出: 9.0.0 或更高
```

---

## 📦 安装步骤

### 步骤 1：获取代码

```bash
# 克隆项目
git clone https://github.com/yourusername/minimalist-navigation.git

# 进入项目目录
cd minimalist-navigation
```

### 步骤 2：安装依赖

```bash
# 使用 npm 安装
npm install
```

**安装时间**: 首次安装大约需要 3-5 分钟，取决于网络速度。

### 步骤 3：配置环境变量

创建 `.env` 文件：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# 加密密钥（32 字符，用于加密 AI API Key）
ENCRYPTION_KEY="your-32-character-encryption-key"

# Next.js 环境
NODE_ENV=development
```

#### 生成加密密钥

**重要**: `ENCRYPTION_KEY` 必须是 32 字符的随机字符串。

**生成方法**:

```bash
# 方法 1：使用 Node.js
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# 方法 2：使用 OpenSSL
openssl rand -hex 16
```

### 步骤 4：初始化数据库

```bash
# 生成 Prisma Client 并同步数据库结构
npx prisma db push
```

### 步骤 5：启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`

---

## 🔐 首次登录

### 访问管理后台

1. 打开浏览器访问：`http://localhost:3000/admin/login`

2. 使用默认账号登录：
   - **用户名**: `admin`
   - **密码**: `admin123`

3. **立即修改密码**（重要）：
   - 登录后点击左侧菜单 "修改密码"
   - 输入旧密码：`admin123`
   - 输入新密码（至少 6 个字符）
   - 确认新密码
   - 点击 "修改密码" 按钮

### 初始化配置

#### 1. 全局设置

进入 "全局设置" 配置网站基本信息：

- **网站标题**: 您的网站名称
- **副标题**: 网站描述
- **分类页每行显示数量**: 3/4/5 个
- **Favicon**: 上传网站图标
- **Logo**: 上传网站 Logo
- **背景图片**: 上传背景图或设置随机背景

#### 2. 导入内置工具（可选）

进入 "工具管理"：

1. 点击右上角 "导入内置工具" 按钮
2. 确认导入
3. 等待导入完成

**内置工具包括**:
- 文本去重
- 汉字转拼音
- 文本对比工具
- JSON 格式化工具
- Base64 编码/解码
- 英文大小写转换
- URL 提取器
- 特殊符号表情大全
- 密码生成器

#### 3. 添加网站分类

进入 "内容管理"：

1. 点击 "新建分类" 按钮
2. 输入分类名称（如：常用工具、开发资源等）
3. 设置排序权重（可选）
4. 点击 "保存"

---

## 🤖 AI 配置

### 配置步骤

#### 1. 进入 AI 配置

管理后台 → AI 配置

#### 2. 添加 AI 提供商

点击 "添加提供商" 按钮，填写信息：

**OpenAI 示例**:
```
名称: My OpenAI
类型: OpenAI
API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
启用: ✓
设为默认: ✓
```

**Google Gemini 示例**:
```
名称: My Gemini
类型: Google Gemini
API Key: AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
启用: ✓
设为默认: ✓
```

**OpenAI 兼容接口示例**:
```
名称: 自建中转
类型: OpenAI 兼容接口
API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Base URL: https://api.example.com/v1
启用: ✓
设为默认: ✓
```

#### 3. 获取模型列表

1. 添加提供商后，点击 "获取模型" 按钮
2. 等待获取完成
3. 查看已配置的模型列表

#### 4. 设置默认模型

在 "全局默认模型" 下拉框中选择默认模型

#### 5. 测试连接

点击 "测试默认模型连接" 按钮，确认显示：

```
✅ 模型测试成功！
模型：自建中转 - gemini-2.5-pro
响应：连接成功，这是一个测试响应。
```

---

## ❓ 常见问题

### Q1: 端口 3000 被占用

**解决方法**:

```bash
# 方法 1: 修改端口
# 在 package.json 中修改启动命令
"dev": "next dev -p 3001"

# 方法 2: 杀死占用端口的进程
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

### Q2: AI 功能无法使用

**排查步骤**:

1. 检查是否配置了 AI 提供商
2. 确认提供商状态为 "已启用" 和 "默认"
3. 点击 "测试默认模型连接" 查看错误信息
4. 确认 API Key 正确且有足够配额

### Q3: 忘记管理员密码

**解决方法**:

```bash
# 重置密码为 admin123
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

bcrypt.hash('admin123', 10).then(hash => {
  return prisma.user.update({
    where: { username: 'admin' },
    data: { password: hash }
  });
}).then(() => {
  console.log('密码已重置为: admin123');
  process.exit(0);
});
"
```

---

## ✅ 安装检查清单

安装完成后，请确认以下项目：

- [ ] Node.js 版本 >= 18.17.0
- [ ] 依赖安装成功（`node_modules` 目录存在）
- [ ] `.env` 文件已创建并配置
- [ ] `ENCRYPTION_KEY` 已设置（32 字符）
- [ ] 数据库已初始化（`prisma/dev.db` 存在）
- [ ] 开发服务器可以正常启动
- [ ] 可以访问 `http://localhost:3000`
- [ ] 可以登录管理后台
- [ ] 已修改默认密码
- [ ] AI 提供商已配置（可选）
- [ ] 内置工具已导入（可选）

---

**祝您使用愉快！**
