# 🔍 生产环境调试指南

## 📊 当前状况

### 你遇到的问题
- **环境**: 生产环境 (elemental.bond)
- **错误**: Network error. Please check your connection.
- **URL**: elemental.bond/result
- **API 调用**: /api/capture-email 失败

---

## 🎯 问题根源

### 1. 前端已部署 ✅
- Vercel 已经部署了新的前端代码
- Email Gate 组件正常显示
- 说明前端部署成功

### 2. 后端可能有问题 ❌
可能的原因：
- Railway 还在部署中
- 环境变量没有设置
- email_routes.py 没有正确注册
- 后端部署失败

---

## 🔧 解决步骤

### Step 1: 检查 Railway 部署状态

1. **访问 Railway Dashboard**
   ```
   https://railway.app/dashboard
   ```

2. **选择你的项目**
   - 找到 "backend" 服务

3. **查看部署状态**
   - 点击 "Deployments" 标签
   - 查看最新部署的状态
   - 应该显示：
     - 🔄 Building（构建中）
     - 🔄 Deploying（部署中）
     - ✅ Success（成功）
     - ❌ Failed（失败）

4. **查看日志**
   - 点击最新的部署
   - 点击 "View Logs"
   - 查看是否有错误信息

---

### Step 2: 检查环境变量

1. **在 Railway Dashboard**
   - 选择 backend 服务
   - 点击 "Variables" 标签

2. **确认这些变量存在**
   ```bash
   # 已有的变量
   DEBUG=false
   SECRET_KEY=...
   DATABASE_PATH=./data.db
   DEEPSEEK_API_KEY=...
   
   # 新增的变量（必须）
   GUMROAD_PRODUCT_ID=bhpmxr
   ANTHROPIC_API_KEY=sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1
   ANTHROPIC_BASE_URL=https://api.laozhang.ai
   ```

3. **如果缺少变量**
   - 点击 "New Variable"
   - 添加缺少的变量
   - 点击 "Deploy" 重新部署

---

### Step 3: 测试后端 API

1. **获取后端 URL**
   - 在 Railway Dashboard 找到 backend 服务
   - 复制 "Public Domain" URL
   - 例如: `https://your-backend.railway.app`

2. **测试健康检查**
   ```bash
   curl https://your-backend.railway.app/api/health
   ```
   
   预期响应:
   ```json
   {"status": "ok"}
   ```

3. **测试邮件 API**
   ```bash
   curl -X POST https://your-backend.railway.app/api/capture-email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","source":"email_gate","score":72,"element_pair":"Water-Wood"}'
   ```
   
   预期响应:
   ```json
   {"success": true, "message": "Email captured successfully"}
   ```

4. **如果 404 错误**
   - 说明 email_routes.py 没有正确注册
   - 需要检查代码是否正确推送
   - 需要重新部署

---

### Step 4: 检查前端 API 配置

1. **检查 Vercel 环境变量**
   - 访问: https://vercel.com/dashboard
   - 选择你的项目
   - 点击 "Settings" → "Environment Variables"

2. **确认后端 URL 配置**
   - 如果有 `VITE_API_URL` 变量
   - 确保指向正确的 Railway 后端 URL

3. **如果没有配置**
   - 前端会使用相对路径 `/api/*`
   - 需要确保 Vercel 的 rewrites 配置正确

---

## 🚨 常见问题和解决方案

### 问题 1: Railway 部署失败

**症状**: 部署状态显示 "Failed"

**解决**:
1. 查看部署日志
2. 查找错误信息
3. 常见错误：
   - Python 依赖安装失败
   - 环境变量缺失
   - 代码语法错误

**修复**:
```bash
# 如果是依赖问题
cd backend
pip freeze > requirements.txt
git add requirements.txt
git commit -m "fix: update requirements"
git push origin main
```

---

### 问题 2: API 返回 404

**症状**: `/api/capture-email` 返回 404

**原因**: email_routes.py 没有正确注册

**解决**:
1. 检查 `backend/app/api/__init__.py`
2. 确认有这行代码:
   ```python
   from email_routes import email_bp
   app.register_blueprint(email_bp)
   ```
3. 如果没有，需要重新推送代码

---

### 问题 3: CORS 错误

**症状**: 浏览器控制台显示 CORS 错误

**解决**:
1. 检查后端 CORS 配置
2. 在 `backend/app/__init__.py` 中:
   ```python
   CORS(
       app,
       resources={r"/api/*": {"origins": "*"}},
   )
   ```

---

### 问题 4: 数据库表不存在

**症状**: API 返回 "no such table: email_captures"

**解决**:
- email_routes.py 会自动创建表
- 重启 Railway 服务
- 或手动执行初始化

---

## 🎯 快速修复方案

### 方案 A: 等待部署完成（5-10 分钟）

1. 检查 Railway 部署状态
2. 等待变为 "Success"
3. 刷新 elemental.bond
4. 重新测试

### 方案 B: 手动重新部署

1. 在 Railway Dashboard
2. 选择 backend 服务
3. 点击 "Deploy" 按钮
4. 等待部署完成
5. 测试

### 方案 C: 使用本地环境测试

1. 访问 http://localhost:5173
2. 立即可以测试
3. 确认功能正常
4. 等待生产环境部署完成

---

## 📋 检查清单

### Railway 后端
- [ ] 部署状态是 "Success"
- [ ] 环境变量已设置（3 个新变量）
- [ ] API 健康检查通过
- [ ] 邮件 API 测试通过
- [ ] 日志没有错误

### Vercel 前端
- [ ] 部署状态是 "Ready"
- [ ] 网站可以访问
- [ ] Email Gate 显示正常
- [ ] 控制台没有错误

### 功能测试
- [ ] Email Gate 弹出正常
- [ ] 可以输入邮件
- [ ] 提交后没有网络错误
- [ ] 解锁成功
- [ ] Upsell 弹窗显示

---

## 🔍 调试命令

### 查看 Railway 后端 URL
```bash
# 在 Railway Dashboard 复制 Public Domain
# 例如: https://backend-production-xxxx.up.railway.app
```

### 测试后端 API
```bash
# 替换为你的实际 URL
BACKEND_URL="https://your-backend.railway.app"

# 健康检查
curl $BACKEND_URL/api/health

# 邮件统计
curl $BACKEND_URL/api/email-stats

# 邮件捕获
curl -X POST $BACKEND_URL/api/capture-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"email_gate","score":72,"element_pair":"Water-Wood"}'
```

### 查看浏览器控制台
```
1. 按 F12 打开开发者工具
2. 点击 "Console" 标签
3. 查看错误信息
4. 点击 "Network" 标签
5. 查看 API 请求详情
```

---

## 💡 建议

### 立即行动
1. **检查 Railway 部署状态**
2. **添加缺失的环境变量**
3. **等待部署完成**
4. **测试 API**

### 临时方案
- 使用本地环境测试: http://localhost:5173
- 确认功能正常
- 等待生产环境修复

---

## 📞 需要帮助？

### 提供以下信息
1. Railway 部署状态截图
2. Railway 部署日志
3. 浏览器控制台错误信息
4. Network 标签的 API 请求详情

---

**下一步**: 请访问 Railway Dashboard 检查部署状态，并告诉我你看到了什么！
