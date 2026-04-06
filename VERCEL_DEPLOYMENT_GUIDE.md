# 🚀 Vercel 全栈部署指南（免费方案）

## ✅ 为什么选择 Vercel？

- ✅ 完全免费（Hobby 计划）
- ✅ 自动从 GitHub 部署
- ✅ 前端 + 后端一起部署
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 无需信用卡

## 📋 已完成的配置

### 1. Vercel 配置文件 (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.py" },
    { "src": "/health", "dest": "/api/index.py" },
    { "src": "/(.*)", "dest": "/frontend/$1" }
  ],
  "env": {
    "ANTHROPIC_API_KEY": "sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1",
    "ANTHROPIC_BASE_URL": "https://api.laozhang.ai",
    "GUMROAD_PRODUCT_ID": "bhpmxr",
    "DATABASE_PATH": "/tmp/data.db"
  }
}
```

### 2. API 入口文件 (`api/index.py`)
✅ 已配置，将 Flask 应用包装为 Serverless Function

### 3. 前端环境变量 (`frontend/.env.production`)
```
VITE_API_BASE_URL=
```
留空表示使用相同域名（前后端在同一个 Vercel 项目）

## 🚀 部署步骤（5 分钟）

### 方案 A: 通过 Vercel 网站部署（推荐）

#### 步骤 1: 访问 Vercel
```
🌐 打开: https://vercel.com
🔑 使用 GitHub 账号登录
```

#### 步骤 2: 导入项目
```
1. 点击 "Add New..." → "Project"
2. 选择 "Import Git Repository"
3. 找到并选择: samzhu168168/deepseek-oracle
4. 点击 "Import"
```

#### 步骤 3: 配置项目
```
Project Name: elemental-bond (或保持默认)
Framework Preset: Vite (应该自动检测)
Root Directory: ./ (保持默认)
Build Command: 保持默认
Output Directory: 保持默认
```

#### 步骤 4: 环境变量（可选）
```
Vercel 会自动读取 vercel.json 中的环境变量
如果需要修改，可以在 Settings → Environment Variables 中添加
```

#### 步骤 5: 部署
```
点击 "Deploy" 按钮
等待 2-3 分钟
✅ 部署完成！
```

#### 步骤 6: 获取域名
```
部署完成后，Vercel 会显示：
- Production: https://elemental-bond.vercel.app
- 或你的自定义域名: https://www.elemental.bond

这个域名同时服务前端和后端 API！
```

### 方案 B: 通过 Vercel CLI 部署

#### 步骤 1: 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 步骤 2: 登录
```bash
vercel login
```

#### 步骤 3: 部署
```bash
# 在项目根目录
vercel

# 首次部署会询问：
# Set up and deploy? Y
# Which scope? 选择你的账户
# Link to existing project? N
# What's your project's name? elemental-bond
# In which directory is your code located? ./
```

#### 步骤 4: 生产部署
```bash
vercel --prod
```

## 🔧 配置自定义域名（可选）

### 如果你已经有 elemental.bond 域名：

#### 步骤 1: 在 Vercel 添加域名
```
1. 进入项目 Settings → Domains
2. 添加: www.elemental.bond
3. 添加: elemental.bond
```

#### 步骤 2: 配置 DNS
```
在你的域名提供商（如 Cloudflare）添加：

A 记录:
  Name: @
  Value: 76.76.21.21

CNAME 记录:
  Name: www
  Value: cname.vercel-dns.com
```

#### 步骤 3: 等待生效
```
DNS 传播通常需要 5-30 分钟
Vercel 会自动配置 HTTPS 证书
```

## ✅ 验证部署

### 测试 1: 前端
```
访问: https://your-project.vercel.app
或: https://www.elemental.bond
应该看到你的网站
```

### 测试 2: 后端健康检查
```
访问: https://your-project.vercel.app/health
应该返回: {"status": "ok"}
```

### 测试 3: API 端点
```bash
curl -X POST https://your-project.vercel.app/api/capture-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"email_gate","score":79,"element_pair":"Earth-Metal"}'

应该返回: {"success": true, "message": "Email captured successfully"}
```

### 测试 4: Email Gate 功能
```
1. 访问网站
2. 填写表单并提交
3. 等待 3 秒
4. Email Gate 弹窗出现
5. 输入邮箱并解锁
6. ✅ 应该没有 CORS 错误！
```

## 🎯 Vercel 的优势

### 1. 统一域名
```
前端: https://elemental.bond/
后端: https://elemental.bond/api/
同源，不需要 CORS！
```

### 2. 自动部署
```
每次 git push 到 main 分支
Vercel 自动部署
2-3 分钟后生效
```

### 3. 预览部署
```
每个 Pull Request 都有独立的预览 URL
可以在合并前测试
```

### 4. 实时日志
```
Vercel Dashboard → 项目 → Functions
可以查看每个 API 调用的日志
```

## ⚠️ Vercel 限制（免费计划）

### 1. Serverless Function 限制
```
- 执行时间: 10 秒（Hobby）/ 60 秒（Pro）
- 内存: 1024 MB
- 部署大小: 100 MB
```

### 2. 数据库
```
⚠️ Vercel Serverless 是无状态的
SQLite 数据库会在每次部署后重置
需要使用外部数据库（如 Supabase、PlanetScale）
```

### 3. 解决方案：使用 Vercel KV（免费）
```
Vercel 提供免费的 Redis 兼容 KV 存储
可以用来存储邮件地址
```

## 🔄 自动部署设置

### 在 Vercel Dashboard:
```
1. 进入项目 Settings → Git
2. 确认 "Production Branch" 是 main
3. 启用 "Automatically deploy all branches"
4. 每次 git push 都会自动部署
```

## 📊 监控和日志

### 查看部署状态
```
Vercel Dashboard → 项目 → Deployments
可以看到所有部署历史
点击查看构建日志
```

### 查看 API 日志
```
Vercel Dashboard → 项目 → Functions
选择一个 Function
查看实时日志和错误
```

## 🆘 常见问题

### 问题 1: 构建失败
```
查看 Build Logs
常见原因：
- Node.js 版本不匹配
- 依赖安装失败
- 环境变量缺失
```

### 问题 2: API 返回 500
```
查看 Function Logs
常见原因：
- Python 依赖缺失
- 环境变量未设置
- 代码错误
```

### 问题 3: 数据库不持久
```
Vercel Serverless 是无状态的
解决方案：
1. 使用 Vercel KV (Redis)
2. 使用 Supabase (PostgreSQL)
3. 使用 PlanetScale (MySQL)
```

## 🎉 完成后

一旦部署成功：

- ✅ 前端和后端在同一域名
- ✅ 不需要 CORS 配置
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 自动部署
- ✅ 完全免费

## 📞 需要帮助？

- Vercel 文档: https://vercel.com/docs
- Vercel 支持: https://vercel.com/support
- Vercel 状态: https://www.vercel-status.com

---

**创建时间**: 2026-04-06
**状态**: 准备部署
**预计时间**: 5 分钟
