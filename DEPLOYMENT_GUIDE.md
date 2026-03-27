# 🚀 自动化部署指南

## 📊 当前部署架构

### 前端
- **平台**: Vercel
- **配置**: `frontend/vercel.json`
- **构建命令**: `npm run build`
- **输出目录**: `dist`

### 后端
- **平台**: Railway
- **配置**: `railway.toml`
- **服务**:
  - backend (主服务)
  - scheduler (定时任务)
  - worker (队列处理)

---

## ✅ 自动化部署方案

### 方案 A: 使用现有平台（推荐，最快）

#### 1. Vercel 自动部署（前端）

**已有配置**: ✅ `frontend/vercel.json`

**自动化步骤**:
1. Vercel 已连接到你的 GitHub 仓库
2. 每次 push 到 main 分支自动触发部署
3. 无需手动操作

**验证**:
- 访问 Vercel Dashboard
- 检查是否已连接 GitHub
- 查看最新部署状态

#### 2. Railway 自动部署（后端）

**已有配置**: ✅ `railway.toml`

**自动化步骤**:
1. Railway 已连接到你的 GitHub 仓库
2. 每次 push 到 main 分支自动触发部署
3. 无需手动操作

**验证**:
- 访问 Railway Dashboard
- 检查是否已连接 GitHub
- 查看最新部署状态

---

## 🎯 快速部署（5 分钟）

### Step 1: 确认 Git 提交

```bash
# 查看当前状态
git status

# 如果有未提交的文件
git add .
git commit -m "feat: add email gate and optimize conversion funnel"
git push origin main
```

### Step 2: 等待自动部署

**Vercel（前端）**:
- 自动检测到 push
- 开始构建（约 2-3 分钟）
- 自动部署到生产环境

**Railway（后端）**:
- 自动检测到 push
- 开始构建（约 3-5 分钟）
- 自动部署到生产环境

### Step 3: 验证部署

**前端**:
```bash
# 访问你的域名
https://elemental.bond

# 或 Vercel 提供的域名
https://your-project.vercel.app
```

**后端**:
```bash
# 测试 API
curl https://your-backend.railway.app/api/health

# 测试新的邮件 API
curl https://your-backend.railway.app/api/email-stats
```

---

## 🔧 环境变量配置

### Vercel（前端）

需要在 Vercel Dashboard 设置：

```bash
VITE_SITE_URL=https://elemental.bond
VITE_API_URL=https://your-backend.railway.app
```

### Railway（后端）

需要在 Railway Dashboard 设置：

```bash
# 已有的环境变量
DEBUG=false
SECRET_KEY=your-secret-key
DATABASE_PATH=./data.db
REDIS_URL=redis://...
DEEPSEEK_API_KEY=sk-...

# 新增的环境变量
GUMROAD_PRODUCT_ID=bhpmxr
ANTHROPIC_API_KEY=sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1
ANTHROPIC_BASE_URL=https://api.laozhang.ai
```

---

## 📋 部署检查清单

### 部署前
- [x] 代码已提交到 GitHub
- [x] 本地测试通过
- [ ] 环境变量已配置
- [ ] 数据库迁移已准备

### 部署中
- [ ] Vercel 构建成功
- [ ] Railway 构建成功
- [ ] 所有服务启动正常

### 部署后
- [ ] 前端可以访问
- [ ] 后端 API 正常
- [ ] Email Gate 正常工作
- [ ] License Key 验证正常
- [ ] 数据库连接正常

---

## 🚨 重要：数据库迁移

### 问题
新增了 `email_captures` 表，需要在生产环境创建。

### 解决方案

#### 方案 1: 自动初始化（推荐）
代码已包含自动初始化：
```python
# email_routes.py
def init_email_table():
    """初始化邮件存储表"""
    # 自动创建表和索引
```

**优点**: 无需手动操作，首次启动自动创建

#### 方案 2: 手动执行
如果需要手动创建：

```bash
# SSH 到 Railway 容器
railway shell

# 进入 Python
python

# 执行初始化
from email_routes import init_email_table
init_email_table()
```

---

## 🎬 立即部署

### 选项 A: 一键部署（推荐）

如果 Vercel 和 Railway 已连接 GitHub：

```bash
# 1. 提交代码
git add .
git commit -m "feat: add email gate conversion funnel"
git push origin main

# 2. 等待 5-8 分钟
# Vercel 和 Railway 会自动部署

# 3. 验证
# 访问你的网站测试
```

### 选项 B: 手动触发

如果需要手动触发：

**Vercel**:
1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 点击 "Redeploy"

**Railway**:
1. 访问 https://railway.app/dashboard
2. 选择你的项目
3. 点击 "Deploy"

---

## 📊 部署监控

### Vercel 监控
```
Dashboard → Your Project → Deployments
- 查看构建日志
- 查看部署状态
- 查看错误信息
```

### Railway 监控
```
Dashboard → Your Project → Deployments
- 查看构建日志
- 查看运行日志
- 查看资源使用
```

---

## 🐛 常见问题

### 问题 1: 前端构建失败

**错误**: TypeScript 类型错误

**解决**:
```bash
cd frontend
npm run typecheck
# 修复类型错误后重新提交
```

### 问题 2: 后端启动失败

**错误**: 缺少环境变量

**解决**:
1. 检查 Railway Dashboard 环境变量
2. 确保所有必需的变量都已设置
3. 重新部署

### 问题 3: 数据库表不存在

**错误**: `no such table: email_captures`

**解决**:
```python
# 代码会自动创建表
# 如果没有，手动执行：
from email_routes import init_email_table
init_email_table()
```

### 问题 4: API 跨域错误

**错误**: CORS error

**解决**:
检查后端 CORS 配置：
```python
# backend/app/__init__.py
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    # 或指定前端域名
    # resources={r"/api/*": {"origins": "https://elemental.bond"}},
)
```

---

## 🎯 部署后验证

### 1. 前端验证
```bash
# 访问网站
https://elemental.bond

# 检查功能
- 生成报告
- Email Gate 弹出
- 输入邮件
- 解锁内容
- Upsell 显示
- License Key 验证
```

### 2. 后端验证
```bash
# 健康检查
curl https://your-backend.railway.app/api/health

# 邮件统计
curl https://your-backend.railway.app/api/email-stats

# License 验证
curl -X POST https://your-backend.railway.app/api/verify-license \
  -H "Content-Type: application/json" \
  -d '{"license_key": "test"}'
```

### 3. 数据库验证
```bash
# 在 Railway Dashboard 查看日志
# 确认表已创建
# 确认邮件可以存储
```

---

## 📈 部署后监控

### 关键指标
- 前端访问量
- Email Gate 弹出率
- 邮件收集率
- 转化率
- API 响应时间
- 错误率

### 监控工具
- Vercel Analytics（前端）
- Railway Metrics（后端）
- Google Analytics（用户行为）
- Sentry（错误追踪，可选）

---

## 🎉 部署完成后

### 1. 测试完整流程
- 生成报告
- Email Gate
- 邮件存储
- License Key
- 完整报告

### 2. 监控数据
- 查看邮件统计
- 查看转化率
- 查看错误日志

### 3. 优化调整
- 根据数据调整文案
- 优化触发时机
- A/B 测试

---

## 🚀 快速命令

### 一键部署
```bash
# 提交并推送
git add . && git commit -m "feat: email gate" && git push origin main
```

### 查看部署状态
```bash
# Vercel CLI（如果安装）
vercel --prod

# Railway CLI（如果安装）
railway status
```

### 回滚（如果需要）
```bash
# Vercel: 在 Dashboard 选择之前的部署
# Railway: 在 Dashboard 选择之前的部署
```

---

## 📞 需要帮助？

### Vercel 文档
https://vercel.com/docs

### Railway 文档
https://docs.railway.app

### 紧急回滚
如果部署出现严重问题：
1. 在 Vercel/Railway Dashboard 回滚到上一个版本
2. 修复问题
3. 重新部署

---

**准备好了吗？执行 `git push` 开始自动部署！** 🚀
