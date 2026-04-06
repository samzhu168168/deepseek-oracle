# 🚂 Railway 部署修复指南

## 问题现状
❌ Railway 返回 404 错误："Application not found"
❌ 后端 API 无法访问
✅ 代码已推送到 GitHub (commit: 16f2c41)

## 可能的原因

### 1. Railway 项目配置问题
- Railway 可能没有正确连接到 GitHub 仓库
- 自动部署可能被禁用
- 服务可能被暂停或删除

### 2. 部署失败
- 构建过程中出现错误
- 依赖安装失败
- 启动命令执行失败

### 3. 域名配置问题
- 自定义域名没有正确配置
- Railway 生成的域名已过期

## 立即修复步骤

### 方案 A: 通过 Railway 控制台手动部署（推荐）

#### 步骤 1: 登录 Railway
1. 访问 https://railway.app
2. 登录你的账户
3. 找到 `deepseek-oracle-backend-production` 项目

#### 步骤 2: 检查服务状态
1. 点击进入项目
2. 查看 "backend" 服务
3. 检查状态：
   - 如果显示 "Crashed" 或 "Failed" → 查看日志
   - 如果显示 "Sleeping" → 点击 "Wake Up"
   - 如果显示 "Building" → 等待完成

#### 步骤 3: 查看部署日志
1. 点击 "Deployments" 标签
2. 选择最新的部署
3. 查看 "Build Logs" 和 "Deploy Logs"
4. 查找错误信息

#### 步骤 4: 手动触发重新部署
1. 在项目页面，点击 "Deploy" 按钮
2. 或者点击 "Settings" → "Redeploy"
3. 等待 2-3 分钟让部署完成

#### 步骤 5: 检查环境变量
确保以下环境变量已设置：
```
PORT=5000
DATABASE_PATH=./data.db
REDIS_URL=<your-redis-url>
ANTHROPIC_API_KEY=sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1
ANTHROPIC_BASE_URL=https://api.laozhang.ai
GUMROAD_PRODUCT_ID=bhpmxr
```

#### 步骤 6: 获取正确的域名
1. 在 Railway 项目页面，找到 "Settings" → "Domains"
2. 复制 Railway 生成的域名（格式：`xxx.up.railway.app`）
3. 如果没有域名，点击 "Generate Domain"

### 方案 B: 使用 Railway CLI 部署

#### 步骤 1: 安装 Railway CLI
```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# 或使用 npm
npm install -g @railway/cli
```

#### 步骤 2: 登录
```bash
railway login
```

#### 步骤 3: 链接项目
```bash
cd backend
railway link
```

#### 步骤 4: 部署
```bash
railway up
```

#### 步骤 5: 查看日志
```bash
railway logs
```

### 方案 C: 重新创建 Railway 项目（最后手段）

如果以上方法都失败，可能需要重新创建项目：

#### 步骤 1: 在 Railway 创建新项目
1. 访问 https://railway.app/new
2. 选择 "Deploy from GitHub repo"
3. 选择 `samzhu168168/deepseek-oracle` 仓库
4. 选择 `backend` 目录

#### 步骤 2: 配置环境变量
添加所有必需的环境变量（见方案 A 步骤 5）

#### 步骤 3: 配置启动命令
在 Settings → Deploy 中设置：
- Build Command: `pip install -r requirements.txt`
- Start Command: `python run.py`
- Root Directory: `backend`

#### 步骤 4: 生成域名
在 Settings → Domains 中点击 "Generate Domain"

#### 步骤 5: 更新前端配置
将新的 Railway 域名更新到 `frontend/.env.production`：
```
VITE_API_BASE_URL=https://your-new-domain.up.railway.app
```

然后提交并推送：
```bash
git add frontend/.env.production
git commit -m "fix: Update Railway backend URL"
git push origin main
```

## 验证部署成功

### 测试 1: 健康检查
```bash
curl https://your-railway-domain.up.railway.app/health
```
应该返回：
```json
{"status": "ok"}
```

### 测试 2: API 健康检查
```bash
curl https://your-railway-domain.up.railway.app/api/health
```
应该返回：
```json
{"status": "ok"}
```

### 测试 3: CORS 预检
```bash
curl -X OPTIONS https://your-railway-domain.up.railway.app/api/capture-email \
  -H "Origin: https://www.elemental.bond" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i
```
应该返回 204 或 200，并包含 CORS 头

### 测试 4: 实际 API 调用
```bash
curl -X POST https://your-railway-domain.up.railway.app/api/capture-email \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.elemental.bond" \
  -d '{"email":"test@example.com","source":"email_gate","score":79,"element_pair":"Earth-Metal"}'
```
应该返回：
```json
{"success": true, "message": "Email captured successfully"}
```

## 常见错误和解决方案

### 错误 1: "Application not found"
**原因**: Railway 服务未运行或域名配置错误
**解决**: 检查 Railway 控制台中的服务状态，确保服务正在运行

### 错误 2: "502 Bad Gateway"
**原因**: 应用启动失败或崩溃
**解决**: 查看 Railway 部署日志，检查 Python 依赖和启动命令

### 错误 3: "Module not found"
**原因**: Python 依赖未正确安装
**解决**: 检查 `requirements.txt`，确保所有依赖都列出

### 错误 4: "Port already in use"
**原因**: PORT 环境变量配置错误
**解决**: 确保使用 Railway 提供的 PORT 环境变量

## 紧急联系方式

如果所有方法都失败：
1. 检查 Railway 状态页面：https://railway.app/status
2. 查看 Railway 文档：https://docs.railway.app
3. 联系 Railway 支持：https://railway.app/help

## 临时解决方案：使用本地后端

如果 Railway 无法立即修复，可以临时在本地运行后端：

```bash
cd backend
pip install -r requirements.txt
python run.py
```

然后使用 ngrok 或 localtunnel 暴露到公网：
```bash
# 使用 ngrok
ngrok http 5000

# 或使用 localtunnel
npx localtunnel --port 5000
```

将生成的公网 URL 更新到 `frontend/.env.production`

---

**最后更新**: 2026-04-06
**状态**: 等待 Railway 部署修复
**优先级**: P0 - 紧急
