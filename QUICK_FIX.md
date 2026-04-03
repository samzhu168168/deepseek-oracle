# 🚨 快速修复指南

## 问题：生产环境 Email Gate 显示 "Network error"

### 🎯 最快的解决方案

#### 方案 1: 使用诊断工具（推荐）

1. **打开诊断工具**
   - 在浏览器中打开: `test-production-api.html`
   - 或访问: file:///你的项目路径/test-production-api.html

2. **输入后端 URL**
   - 在 Railway Dashboard 找到你的后端域名
   - 例如: `https://elemental-bond-backend.railway.app`
   - 输入并点击 "Save URL"

3. **依次测试所有 API**
   - 点击 "Test /api/health"
   - 点击 "Test /api/capture-email"
   - 点击 "Test /api/email-stats"
   - 点击 "Test /api/verify-license"

4. **查看结果**
   - ✅ 绿色 = 正常
   - ❌ 红色 = 有问题
   - 截图发给我，我会告诉你如何修复

---

#### 方案 2: 浏览器控制台测试

1. **打开生产网站**
   - 访问: https://elemental.bond

2. **打开开发者工具**
   - 按 F12
   - 切换到 "Console" 标签

3. **运行测试代码**

```javascript
// 替换为你的实际后端域名
const BACKEND = 'https://your-backend.railway.app';

// 测试 1: 健康检查
fetch(`${BACKEND}/api/health`)
  .then(r => r.json())
  .then(d => console.log('✅ Health:', d))
  .catch(e => console.error('❌ Health failed:', e));

// 测试 2: 邮件 API
fetch(`${BACKEND}/api/capture-email`, {
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
  .then(d => console.log('✅ Email API:', d))
  .catch(e => console.error('❌ Email API failed:', e));
```

4. **查看结果**
   - 如果看到 ✅ = API 正常
   - 如果看到 ❌ = API 有问题

---

#### 方案 3: 检查 Railway 部署

1. **访问 Railway Dashboard**
   - https://railway.app/dashboard

2. **选择你的项目**
   - 找到 backend 服务

3. **检查状态**
   - 确认状态是 "Active" 而不是 "Crashed"
   - 如果是 "Crashed"，点击 "Restart"

4. **查看部署日志**
   - 点击 "Deployments"
   - 点击最新的部署
   - 查看 "Deploy Logs"
   - 寻找错误信息

5. **常见错误**

```python
# 错误 A: 导入失败
ModuleNotFoundError: No module named 'email_routes'
# 解决: 确认 email_routes.py 在 backend/ 目录

# 错误 B: 数据库错误
no such table: email_captures
# 解决: 重启服务，会自动创建表

# 错误 C: 环境变量缺失
ANTHROPIC_API_KEY not found
# 解决: 在 Railway 添加环境变量
```

---

## 🔧 最可能的问题和解决方案

### 问题 1: 后端未部署新代码

**症状**: `/api/capture-email` 返回 404

**解决**:
1. Railway Dashboard → backend 服务
2. 点击 "Deployments"
3. 确认最新的 commit 是 `bd97074`
4. 如果不是，点击 "Redeploy"

### 问题 2: 环境变量缺失

**症状**: 后端启动失败或 API 返回 500

**解决**:
1. Railway Dashboard → backend 服务
2. 点击 "Variables"
3. 添加这些变量:
   ```
   GUMROAD_PRODUCT_ID=bhpmxr
   ANTHROPIC_API_KEY=sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1
   ANTHROPIC_BASE_URL=https://api.laozhang.ai
   ```
4. 点击 "Deploy" 重新部署

### 问题 3: CORS 配置

**症状**: 浏览器控制台显示 CORS 错误

**解决**: 后端 CORS 配置应该已经允许所有域名
```python
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

如果还有问题，检查 `backend/app/__init__.py`

---

## 📊 诊断检查清单

请按顺序检查：

- [ ] Railway backend 服务状态是 "Active"
- [ ] 最新部署的 commit 是 `bd97074`
- [ ] 环境变量 `GUMROAD_PRODUCT_ID` 已设置
- [ ] 环境变量 `ANTHROPIC_API_KEY` 已设置
- [ ] 环境变量 `ANTHROPIC_BASE_URL` 已设置
- [ ] `/api/health` 返回 `{"status": "ok"}`
- [ ] `/api/capture-email` 不返回 404
- [ ] 浏览器控制台没有 CORS 错误

---

## 🆘 如果还是不行

请提供以下信息：

1. **Railway 后端域名**
   - 例如: https://xxx.railway.app

2. **Railway 部署日志**
   - 最后 50 行

3. **浏览器控制台错误**
   - F12 → Console 标签
   - 截图或复制错误信息

4. **Network 请求详情**
   - F12 → Network 标签
   - 找到失败的 `/api/capture-email` 请求
   - 查看 Response

有了这些信息，我可以精确定位问题！

---

## 🎯 临时绕过方案

如果急需上线，可以临时禁用 Email Gate：

### 修改 frontend/src/pages/Result.tsx

找到这段代码：
```typescript
// 页面加载 5 秒后自动显示 Email Gate（如果还没解锁）
useEffect(() => {
  if (!emailUnlocked && normalizedReport) {
    const timer = setTimeout(() => {
      setEmailGateModalOpen(true);  // ← 临时注释掉这行
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [emailUnlocked, normalizedReport]);
```

改为：
```typescript
// 临时禁用自动弹出
useEffect(() => {
  if (!emailUnlocked && normalizedReport) {
    const timer = setTimeout(() => {
      // setEmailGateModalOpen(true);  // 临时禁用
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [emailUnlocked, normalizedReport]);
```

然后：
```bash
git add .
git commit -m "fix: Temporarily disable email gate auto-popup"
git push origin main
```

这样用户可以直接看到 Paywall，不会被 Email Gate 阻挡。

---

**现在请使用 `test-production-api.html` 工具测试你的后端 API，然后告诉我结果！** 🔍
