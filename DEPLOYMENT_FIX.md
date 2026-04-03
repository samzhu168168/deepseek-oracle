# 🔧 Railway 后端 404 问题修复

## 当前状态

- ✅ **前端 (Vercel)**: 正常运行 (200 OK)
- ❌ **后端 (Railway)**: 404 错误
- ✅ **Git**: 所有提交已推送

## 问题诊断

Railway 后端返回 404 可能的原因：

### 1. 部署还在进行中
Railway 需要 3-5 分钟完成部署：
- 拉取代码
- 安装依赖 (pip install)
- 启动服务

### 2. 启动命令配置错误
Railway 可能没有正确的启动命令。

### 3. 端口配置问题
Flask 应用可能没有监听 Railway 提供的 PORT 环境变量。

### 4. 健康检查路径错误
Railway 可能在检查错误的健康检查路径。

## 立即修复步骤

### 步骤 1: 等待部署完成 (推荐)

```powershell
# 运行自动监控脚本
.\monitor-deploy.ps1

# 或手动等待 5 分钟后测试
Start-Sleep -Seconds 300
.\quick-test.ps1
```

### 步骤 2: 检查 Railway 配置

访问 https://railway.app/dashboard，检查：

#### A. 启动命令 (Start Command)
应该设置为：
```
python run.py
```

或者：
```
gunicorn run:app --bind 0.0.0.0:$PORT
```

#### B. 环境变量
确认以下变量已设置：
- `PORT`: (Railway 自动设置)
- `ANTHROPIC_API_KEY`: `sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1`
- `ANTHROPIC_BASE_URL`: `https://api.laozhang.ai`
- `GUMROAD_PRODUCT_ID`: `bhpmxr`

#### C. 根目录 (Root Directory)
应该设置为：
```
backend
```

#### D. 构建命令 (Build Command)
应该为空或：
```
pip install -r requirements.txt
```

### 步骤 3: 查看部署日志

在 Railway 项目页面：

1. 点击 **Deployments**
2. 点击最新的部署
3. 查看 **Build Logs**:
   - 检查是否有 `Successfully installed tiktoken-0.5.2`
   - 检查是否有错误信息

4. 查看 **Deploy Logs**:
   - 检查是否有 `Running on http://0.0.0.0:xxxx`
   - 检查是否有错误信息

### 步骤 4: 手动触发重新部署

如果部署失败：

1. 在 Railway 项目页面
2. 点击 **Deployments**
3. 点击 **Redeploy** 按钮

或者推送一个空提交：
```powershell
git commit --allow-empty -m "chore: Trigger Railway redeploy"
git push
```

## 常见错误和解决方案

### 错误 1: ModuleNotFoundError

**症状**: Build Logs 显示 `ModuleNotFoundError: No module named 'xxx'`

**解决**:
```powershell
# 检查 requirements.txt
cat backend/requirements.txt

# 确保包含所有依赖
# 如果缺少，添加后重新部署
```

### 错误 2: Port already in use

**症状**: Deploy Logs 显示 `Address already in use`

**解决**: Railway 会自动重启，等待 1-2 分钟

### 错误 3: Application timeout

**症状**: 部署超时，服务无法启动

**解决**:
1. 检查 `run.py` 是否正确
2. 检查是否有阻塞的代码
3. 增加 Railway 的超时设置

### 错误 4: 404 on all routes

**症状**: 所有路由都返回 404

**可能原因**:
- Flask 应用没有正确启动
- 路由注册失败
- WSGI 配置错误

**解决**:
```python
# 检查 backend/run.py
if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)
```

## 验证修复

### 测试健康检查端点

```powershell
# 测试 /health
Invoke-RestMethod -Uri "https://deepseek-oracle-backend-production.up.railway.app/health"

# 应该返回
# status
# ------
# ok

# 测试 /api/health
Invoke-RestMethod -Uri "https://deepseek-oracle-backend-production.up.railway.app/api/health"

# 测试 /healthz
Invoke-RestMethod -Uri "https://deepseek-oracle-backend-production.up.railway.app/healthz"
```

### 测试完整流程

```powershell
# 运行快速测试
.\quick-test.ps1

# 或运行监控脚本
.\monitor-deploy.ps1
```

## 备用方案

### 方案 A: 使用 Gunicorn (生产推荐)

1. 添加到 `backend/requirements.txt`:
```
gunicorn==21.2.0
```

2. 在 Railway 设置启动命令:
```
gunicorn run:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

3. 提交并推送:
```powershell
git add backend/requirements.txt
git commit -m "feat: Add gunicorn for production"
git push
```

### 方案 B: 添加 Procfile

创建 `backend/Procfile`:
```
web: python run.py
```

提交并推送:
```powershell
git add backend/Procfile
git commit -m "feat: Add Procfile for Railway"
git push
```

### 方案 C: 使用 Railway CLI 调试

```powershell
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 链接项目
railway link

# 查看日志
railway logs

# 运行命令
railway run python run.py
```

## 时间线

- **0-3 分钟**: 代码推送，触发部署
- **3-5 分钟**: 安装依赖，构建应用
- **5-7 分钟**: 启动服务，健康检查
- **7+ 分钟**: 如果还没成功，需要手动检查

## 下一步

### 立即执行

```powershell
# 1. 运行监控脚本，等待部署完成
.\monitor-deploy.ps1

# 2. 如果 10 分钟后还是失败，检查 Railway 日志
# 访问: https://railway.app/dashboard

# 3. 根据日志错误信息，应用上述解决方案
```

### 如果一切正常

```powershell
# 测试完整功能
.\quick-test.ps1

# 访问网站测试
Start-Process "https://www.elemental.bond"
```

## 联系支持

如果以上方法都无法解决：

1. **Railway 支持**: https://railway.app/help
2. **查看文档**: https://docs.railway.app/
3. **社区论坛**: https://discord.gg/railway

---

**当前时间**: 刚推送完代码  
**预计修复时间**: 5-10 分钟  
**建议**: 先运行 `.\monitor-deploy.ps1` 等待自动部署完成
