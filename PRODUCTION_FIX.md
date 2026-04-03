# 🔧 生产环境问题修复

## 🔍 问题诊断

### 当前状况
- **环境**: 生产环境 (elemental.bond)
- **错误**: "⚠ Network error. Please check your connection."
- **时间**: 已经过了一天
- **问题**: 前端无法调用后端 `/api/capture-email` API

### 可能的原因

#### 1. Railway 后端未部署成功
- 构建失败
- 服务未启动
- 环境变量缺失

#### 2. API 路由未注册
- `email_routes.py` 未正确导入
- Blueprint 未注册

#### 3. CORS 配置问题
- 前端域名被阻止
- CORS 头配置错误

#### 4. 数据库初始化失败
- `email_captures` 表未创建
- 数据库权限问题

---

## 🎯 快速修复方案

### 方案 A: 检查 Railway 部署状态

1. **访问 Railway Dashboard**
   - https://railway.app/dashboard
   - 选择你的项目
   - 查看 backend 服务状态

2. **检查部署日志**
   - 点击最新的 Deployment
   - 查看 "Build Logs"
   - 查看 "Deploy Logs"
   - 寻找错误信息

3. **检查服务状态**
   - 确认服务是 "Active"
   - 确认没有 "Crashed" 或 "Failed"

### 方案 B: 验证环境变量

在 Railway Dashboard 中检查这些环境变量是否存在：

```bash
# 必需的新变量
GUMROAD_PRODUCT_ID=bhpmxr
ANTHROPIC_API_KEY=sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1
ANTHROPIC_BASE_URL=https://api.laozhang.ai

# 已有的变量（确认存在）
DEBUG=false
SECRET_KEY=your-secret-key
DATABASE_PATH=./data.db
DEEPSEEK_API_KEY=sk-...
```

**如果缺失，添加后重新部署**

### 方案 C: 测试后端 API

```bash
# 替换为你的实际后端域名
BACKEND_URL="https://your-backend.railway.app"

# 1. 健康检查
curl $BACKEND_URL/api/health

# 2. 测试邮件 API
curl -X POST $BACKEND_URL/api/capture-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"email_gate","score":80,"element_pair":"Water-Wood"}'
```

---

## 🚨 最可能的问题

### 问题 1: email_routes.py 导入失败

**症状**: 后端启动成功，但 `/api/capture-email` 返回 404

**原因**: `backend/app/api/__init__.py` 中的导入路径可能有问题

**解决方案**: 检查导入代码

### 问题 2: 数据库表未创建

**症状**: API 返回 500 错误，日志显示 "no such table: email_captures"

**原因**: `init_email_table()` 未执行

**解决方案**: 重启 Railway 服务

---

## 🔧 立即修复步骤

### Step 1: 检查后端日志

1. Railway Dashboard → backend 服务
2. 点击 "Deployments"
3. 点击最新的部署
4. 查看 "Deploy Logs"

**寻找这些错误**:
- `ModuleNotFoundError: No module named 'email_routes'`
- `ImportError: cannot import name 'email_bp'`
- `no such table: email_captures`
- `ANTHROPIC_API_KEY not found`

### Step 2: 根据错误修复

#### 错误 A: 导入失败
```python
# 检查 backend/app/api/__init__.py
# 确认这行代码存在：
from email_routes import email_bp
app.register_blueprint(email_bp)
```

#### 错误 B: 环境变量缺失
```
在 Railway Dashboard 添加缺失的环境变量
然后点击 "Deploy" 重新部署
```

#### 错误 C: 数据库表不存在
```
重启 Railway 服务
email_routes.py 会自动创建表
```

### Step 3: 强制重新部署

如果看不到明显错误：

1. Railway Dashboard → backend 服务
2. 点击 "Settings"
3. 滚动到底部
4. 点击 "Restart"
5. 等待 3-5 分钟

---

## 🧪 验证修复

### 1. 测试后端 API

打开浏览器开发者工具 (F12)，在 Console 中执行：

```javascript
// 替换为你的实际后端域名
const BACKEND_URL = 'https://your-backend.railway.app';

// 测试健康检查
fetch(`${BACKEND_URL}/api/health`)
  .then(r => r.json())
  .then(console.log);

// 测试邮件 API
fetch(`${BACKEND_URL}/api/capture-email`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'test@example.com',
    source: 'email_gate',
    score: 80,
    element_pair: 'Water-Wood'
  })
})
  .then(r => r.json())
  .then(console.log);
```

### 2. 测试前端

1. 访问 https://elemental.bond
2. 生成报告
3. 等待 Email Gate 弹出
4. 输入邮件
5. 点击 "Unlock My Preview →"
6. 应该成功！✅

---

## 📊 调试信息收集

如果还是不行，请提供以下信息：

### 1. Railway 部署日志
```
Railway Dashboard → backend → Deployments → 最新部署 → Deploy Logs
复制最后 50 行
```

### 2. 浏览器控制台错误
```
F12 → Console 标签
复制所有红色错误信息
```

### 3. 网络请求详情
```
F12 → Network 标签
找到失败的 /api/capture-email 请求
查看 Response 内容
```

---

## 🎯 临时解决方案

如果无法立即修复后端，可以临时禁用 Email Gate：

### 修改 Result.tsx

```typescript
// 临时禁用自动弹出
useEffect(() => {
  if (!emailUnlocked && normalizedReport) {
    const timer = setTimeout(() => {
      // setEmailGateModalOpen(true); // 临时注释掉
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [emailUnlocked, normalizedReport]);
```

这样用户可以直接看到 Paywall，不会被 Email Gate 阻挡。

---

## 📞 需要帮助

如果你能提供：
1. Railway 后端的域名
2. Railway 部署日志
3. 浏览器控制台的错误信息

我可以更精确地诊断问题。

---

## 🚀 预防措施

### 未来避免此类问题

1. **本地测试**
   - 在本地完整测试所有功能
   - 确认 API 正常工作

2. **环境变量检查**
   - 部署前确认所有环境变量已设置
   - 使用 .env.example 作为模板

3. **部署验证**
   - 部署后立即测试
   - 不要等一天才发现问题

4. **监控和告警**
   - 设置 Railway 告警
   - 监控 API 错误率

---

**现在请按照上面的步骤检查 Railway 部署状态，然后告诉我你看到了什么错误！** 🔍
