# 🚀 Render.com 部署完整指南

## 准备工作 ✅

已完成：
- ✅ 添加 gunicorn 到 requirements.txt
- ✅ Flask 应用配置正确
- ✅ 环境变量清单准备好

## 部署步骤（40 分钟）

### 步骤 1: 推送代码到 GitHub (5 分钟)

```powershell
# 提交 gunicorn 更改
git add backend/requirements.txt
git commit -m "feat: Add gunicorn for Render deployment"

# 推送到 GitHub（如果网络稳定）
git push

# 如果网络不稳定，使用重试脚本
.\push-with-retry.ps1
```

### 步骤 2: 注册 Render (5 分钟)

1. 访问 https://render.com
2. 点击 "Get Started for Free"
3. 选择 "Sign up with GitHub"
4. 授权 Render 访问你的 GitHub 账号
5. 授权访问 `deepseek-oracle` 仓库

### 步骤 3: 创建 Web Service (10 分钟)

1. 在 Render 控制台，点击 "New +" 按钮
2. 选择 "Web Service"
3. 找到并选择 `deepseek-oracle` 仓库
4. 点击 "Connect"

### 步骤 4: 配置 Web Service (10 分钟)

在配置页面填写：

#### Basic Settings
```
Name: deepseek-oracle-backend
Region: Singapore (或选择离你最近的)
Branch: main
```

#### Build & Deploy
```
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn run:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

#### Instance Type
```
选择: Free
```

### 步骤 5: 添加环境变量 (5 分钟)

点击 "Advanced" → "Add Environment Variable"，添加以下变量：

```
ANTHROPIC_API_KEY=sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1
ANTHROPIC_BASE_URL=https://api.laozhang.ai
GUMROAD_PRODUCT_ID=bhpmxr
FLASK_ENV=production
PYTHON_VERSION=3.11.0
```

### 步骤 6: 创建服务 (10 分钟)

1. 检查所有配置是否正确
2. 点击 "Create Web Service"
3. 等待部署完成（5-10 分钟）
4. 观察部署日志

### 步骤 7: 获取 Render URL (1 分钟)

部署成功后，你会看到：
```
Your service is live at https://deepseek-oracle-backend.onrender.com
```

复制这个 URL！

### 步骤 8: 更新 Vercel 环境变量 (5 分钟)

1. 访问 https://vercel.com/dashboard
2. 进入 `deepseek-oracle` 项目
3. 点击 "Settings" → "Environment Variables"
4. 找到 `VITE_API_URL`
5. 编辑值为：`https://deepseek-oracle-backend.onrender.com`
6. 点击 "Save"
7. 点击 "Redeploy" 重新部署前端

### 步骤 9: 测试部署 (5 分钟)

等待 Vercel 重新部署完成后：

```powershell
# 测试 Render 后端
Invoke-RestMethod -Uri "https://deepseek-oracle-backend.onrender.com/health"

# 应该返回
# status
# ------
# ok

# 测试前端
Start-Process "https://www.elemental.bond"
```

---

## 配置检查清单

### Render 配置
- [ ] Name: deepseek-oracle-backend
- [ ] Region: Singapore
- [ ] Branch: main
- [ ] Root Directory: backend
- [ ] Runtime: Python 3
- [ ] Build Command: pip install -r requirements.txt
- [ ] Start Command: gunicorn run:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
- [ ] Instance Type: Free

### 环境变量
- [ ] ANTHROPIC_API_KEY
- [ ] ANTHROPIC_BASE_URL
- [ ] GUMROAD_PRODUCT_ID
- [ ] FLASK_ENV
- [ ] PYTHON_VERSION

### Vercel 更新
- [ ] VITE_API_URL 更新为 Render URL
- [ ] 前端重新部署

---

## 常见问题

### Q: 部署失败，显示 "Build failed"
**A**: 检查 Build Logs，通常是依赖安装失败。确保 requirements.txt 格式正确。

### Q: 服务启动失败
**A**: 检查 Deploy Logs，确认：
- gunicorn 命令正确
- run.py 文件存在
- 端口配置正确（使用 $PORT）

### Q: 健康检查失败
**A**: 确认：
- Start Command 使用了 `--bind 0.0.0.0:$PORT`
- Flask 应用正确监听 PORT 环境变量

### Q: 首次访问很慢
**A**: 这是正常的！Render 免费计划会在 15 分钟无活动后休眠。首次访问需要 30-60 秒唤醒。

---

## Render 免费计划限制

### 优点
- ✅ 750 小时/月免费
- ✅ 自动 HTTPS
- ✅ 自动部署（Git push 触发）
- ✅ 环境变量管理
- ✅ 日志查看

### 限制
- ⚠️ 15 分钟无活动后休眠
- ⚠️ 冷启动需要 30-60 秒
- ⚠️ 512MB RAM
- ⚠️ 0.1 CPU

### 适用场景
- ✅ 初期测试和验证
- ✅ 低流量应用（< 1000 访问/天）
- ✅ 非实时应用
- ❌ 不适合需要即时响应的场景

---

## 优化建议

### 减少冷启动影响

1. **使用 Uptime Monitor**
   - 使用 UptimeRobot 等服务
   - 每 5 分钟 ping 一次你的后端
   - 保持服务唤醒状态

2. **前端添加加载提示**
   ```typescript
   // 首次 API 调用时显示
   "正在唤醒服务器，请稍候..."
   ```

3. **考虑升级到付费计划**
   - Starter: $7/月（无休眠）
   - 等有收入后再升级

---

## 成本规划

### 免费阶段（0-100 用户/天）
- Render Free: $0
- Vercel Free: $0
- **总成本: $0/月**

### 增长阶段（100-1000 用户/天）
- Render Starter: $7/月（无休眠）
- Vercel Free: $0
- **总成本: $7/月**

### 扩展阶段（1000+ 用户/天）
- Render Standard: $25/月
- Vercel Pro: $20/月
- **总成本: $45/月**

---

## 下一步

### 立即执行
1. 推送代码（包含 gunicorn）
2. 注册 Render
3. 按照步骤配置和部署
4. 更新 Vercel 环境变量
5. 测试完整功能

### 部署成功后
1. 测试完整用户流程
2. 开始营销推广
3. 监控服务状态
4. 收集用户反馈

---

**预计完成时间**: 40 分钟  
**成本**: $0  
**下一步**: 推送代码到 GitHub
