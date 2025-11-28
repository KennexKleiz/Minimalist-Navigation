# 极简智能导航 - 部署指南

本文档详细介绍如何将极简智能导航系统部署到生产环境。

---

## 🔧 部署前准备

### 服务器要求

| 配置项 | 最低要求 | 推荐配置 |
|--------|---------|---------|
| CPU | 1 核 | 2 核+ |
| 内存 | 512MB | 2GB+ |
| 硬盘 | 10GB | 20GB+ |
| 带宽 | 1Mbps | 5Mbps+ |
| 操作系统 | Ubuntu 20.04+ / CentOS 7+ | Ubuntu 22.04 LTS |

---

## 🖥️ 服务器环境配置

### 1. 更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. 安装 Node.js

```bash
# Ubuntu/Debian - 安装 Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v  # 应输出 v20.x.x
npm -v   # 应输出 10.x.x
```

### 3. 安装 PM2（进程管理器）

```bash
sudo npm install -g pm2
```

### 4. 安装 Git

```bash
# Ubuntu/Debian
sudo apt install git -y

# CentOS/RHEL
sudo yum install git -y
```

---

## 🚀 部署步骤

### 步骤 1: 克隆代码

```bash
# 进入项目目录
cd /var/www

# 克隆项目
git clone https://github.com/yourusername/minimalist-navigation.git
cd minimalist-navigation
```

### 步骤 2: 安装依赖

```bash
npm install --production
```

### 步骤 3: 配置环境变量

```bash
# 创建 .env 文件
nano .env
```

添加以下内容：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# 加密密钥（32 字符）
ENCRYPTION_KEY="your-32-character-encryption-key"

# 生产环境
NODE_ENV=production
```

### 步骤 4: 初始化数据库

```bash
# 同步数据库结构
npx prisma db push

# 生成 Prisma Client
npx prisma generate
```

### 步骤 5: 构建项目

```bash
npm run build
```

### 步骤 6: 使用 PM2 启动

```bash
# 启动应用
pm2 start npm --name "navigation" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs navigation

# 设置开机自启
pm2 startup
pm2 save
```

---

## 🔒 Nginx 反向代理配置

### 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 配置 Nginx

创建配置文件 `/etc/nginx/sites-available/navigation`：

```nginx
# HTTP 配置（重定向到 HTTPS）
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/your-domain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;

    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 客户端上传大小限制
    client_max_body_size 10M;

    # 反向代理配置
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

### 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/navigation /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

---

## 🔐 SSL 证书配置

### 使用 Let's Encrypt（免费，推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书并自动配置 Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

---

## 💾 备份策略

### 数据库备份

创建备份脚本 `backup.sh`：

```bash
#!/bin/bash

# 配置
BACKUP_DIR="/var/backups/navigation"
DB_FILE="/var/www/minimalist-navigation/prisma/dev.db"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp $DB_FILE $BACKUP_DIR/dev_$DATE.db

# 压缩备份
gzip $BACKUP_DIR/dev_$DATE.db

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: dev_$DATE.db.gz"
```

设置定时任务：

```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点备份
0 2 * * * /var/www/minimalist-navigation/backup.sh
```

---

## 🔄 更新部署

### 更新步骤

```bash
# 1. 进入项目目录
cd /var/www/minimalist-navigation

# 2. 备份数据库
cp prisma/dev.db prisma/dev.db.backup

# 3. 拉取最新代码
git pull origin main

# 4. 安装新依赖
npm install

# 5. 同步数据库结构
npx prisma db push

# 6. 重新构建
npm run build

# 7. 重启服务
pm2 restart navigation

# 8. 查看日志确认
pm2 logs navigation --lines 50
```

---

## ❓ 常见问题

### Q1: 部署后无法访问

**排查步骤**:

```bash
# 1. 检查应用是否运行
pm2 status

# 2. 检查端口是否监听
netstat -tlnp | grep 3000

# 3. 检查防火墙
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443

# 4. 检查 Nginx 状态
sudo systemctl status nginx
sudo nginx -t
```

### Q2: 数据库权限错误

```bash
# 修复数据库文件权限
sudo chown -R www-data:www-data /var/www/minimalist-navigation/prisma
sudo chmod 666 /var/www/minimalist-navigation/prisma/dev.db
sudo chmod 777 /var/www/minimalist-navigation/prisma
```

### Q3: 内存不足

```bash
# 增加 swap 空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久生效
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🔒 安全建议

### 1. 防火墙配置

```bash
# 启用 UFW
sudo ufw enable

# 允许 SSH
sudo ufw allow 22

# 允许 HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 查看状态
sudo ufw status
```

### 2. 定期更新

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 更新 Node.js 依赖
npm audit fix
```

---

## ✅ 部署检查清单

部署完成后，请确认：

- [ ] 应用正常运行（`pm2 status`）
- [ ] 可以通过域名访问网站
- [ ] HTTPS 证书正常
- [ ] 管理后台可以登录
- [ ] 文件上传功能正常
- [ ] AI 功能正常（如已配置）
- [ ] 数据库备份已配置
- [ ] 防火墙已配置
- [ ] PM2 开机自启已配置

---

**祝您部署顺利！**
