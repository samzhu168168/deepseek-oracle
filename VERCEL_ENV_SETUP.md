# 🚀 Vercel 环境变量设置指南

## 为什么需要设置这个变量？

你的前端代码在 `frontend/src/api/index.ts` 中有这样的配置：

```typescript
const apiBaseUrl = import.meta.env.VITE_API_URL || "https://deepseek-oracle-backend-production.up.railway.app";
```

虽然我们已经修改了默认值，但最佳实践是通过环境变量配置，这样：
- ✅ 可以在不修改代码的情况下切换后端
- ✅ 开发环境和生产环境可以使用不同的后端
- ✅ 更安全，不会把 URL 硬编码在代码里

---

## 设置步骤（5 分钟）

### 步骤 1：登录 Vercel

1. 打开浏览器，访问 https://vercel.com/login
2. 使用你的 GitHub 账号登录

### 步骤 2：找到你的项目

1. 登录后，你会看到项目列表
2. 找到 `elemental-bond` 或 `deepseek-oracle` 项目
3. 点击项目名称进入项目详情页

### 步骤 3：进入设置页面

1. 在项目页面顶部，点击 **Settings** 标签
2. 在左侧菜单中，点击 **Environment Variables**

### 步骤 4：添加环境变量

1. 点击 **Add New** 按钮
2. 填写以下信息：

   **Name（变量名）**：
   ```
   VITE_API_URL
   ```

   **Value（变量值）**：
   ```
   https://deepseek-oracle-backend-production.up.railway.app
   ```

   **Environment（环境）**：
   - ✅ 勾选 **Production**
   - ✅ 勾选 **Preview**（可选）
   - ⬜ Development（本地开发不需要）

3. 点击 **Save** 按钮

### 步骤 5：触发重新部署

设置环境变量后，Vercel 会自动触发重新部署。

你也可以手动触发：
1. 点击顶部的 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的 **...** 菜单
4. 选择 **Redeploy**

---

## 验证设置是否成功

### 方法 1：检查部署日志

1. 在 Vercel 项目页面，点击 **Deployments**
2. 点击最新的部署
3. 查看 **Build Logs**
4. 搜索 `VITE_API_URL`，应该能看到你设置的值

### 方法 2：测试生产网站

1. 等待部署完成（约 2-3 分钟）
2. 访问 https://www.elemental.bond
3. 打开浏览器开发者工具（F12）
4. 切换到 **Network** 标签
5. 输入生日信息，点击 Calculate
6. 查看网络请求，应该看到：
   ```
   https://deepseek-oracle-backend-production.up.railway.app/api/divination/analyze
   ```

### 方法 3：检查控制台

1. 在网站上打开浏览器控制台（F12）
2. 在 Console 标签输入：
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
3. 应该显示你设置的 URL

---

## 常见问题

### Q1: 设置后网站还是报错？

**A**: 等待 2-3 分钟让 Vercel 完成重新部署。可以在 Deployments 页面查看部署状态。

### Q2: 如何修改环境变量？

**A**: 
1. 进入 Settings → Environment Variables
2. 找到 `VITE_API_URL`
3. 点击右侧的 **Edit** 按钮
4. 修改值后点击 Save
5. Vercel 会自动重新部署

### Q3: 可以设置多个环境的不同值吗？

**A**: 可以！在添加环境变量时：
- Production: 生产环境（www.elemental.bond）
- Preview: 预览环境（PR 部署）
- Development: 本地开发

每个环境可以设置不同的值。

### Q4: 本地开发需要设置吗？

**A**: 本地开发可以创建 `frontend/.env.local` 文件：
```
VITE_API_URL=http://localhost:5000
```

这个文件不会提交到 Git（已在 .gitignore 中）。

---

## 其他可能需要的环境变量

如果未来需要，可以添加这些：

### 前端环境变量

```
VITE_SITE_URL=https://www.elemental.bond
VITE_GUMROAD_PRODUCT_ID=bhpmxr
VITE_ENABLE_ANALYTICS=true
```

### 后端环境变量（在 Railway 设置）

```
GUMROAD_PRODUCT_ID=bhpmxr
ANTHROPIC_API_KEY=sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1
ANTHROPIC_BASE_URL=https://api.laozhang.ai
DATABASE_PATH=/app/data.db
REDIS_URL=redis://...
```

---

## 截图参考

### 1. Vercel 项目页面
```
┌─────────────────────────────────────┐
│ elemental-bond                      │
│ ┌─────────────────────────────────┐ │
│ │ Overview  Deployments  Settings │ │  ← 点击 Settings
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2. Environment Variables 页面
```
┌─────────────────────────────────────┐
│ Settings                            │
│ ├─ General                          │
│ ├─ Domains                          │
│ ├─ Environment Variables  ← 点击这里 │
│ ├─ Git                              │
│ └─ ...                              │
└─────────────────────────────────────┘
```

### 3. 添加变量表单
```
┌─────────────────────────────────────┐
│ Add New Environment Variable        │
│                                     │
│ Name:                               │
│ ┌─────────────────────────────────┐ │
│ │ VITE_API_URL                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Value:                              │
│ ┌─────────────────────────────────┐ │
│ │ https://deepseek-oracle-backe...│ │
│ └─────────────────────────────────┘ │
│                                     │
│ Environment:                        │
│ ☑ Production                        │
│ ☑ Preview                           │
│ ☐ Development                       │
│                                     │
│ [Cancel]  [Save]  ← 点击 Save       │
└─────────────────────────────────────┘
```

---

## 完成后的检查清单

- [ ] 已登录 Vercel
- [ ] 找到 elemental-bond 项目
- [ ] 进入 Settings → Environment Variables
- [ ] 添加 `VITE_API_URL` 变量
- [ ] 值设置为 Railway 后端 URL
- [ ] 勾选 Production 环境
- [ ] 点击 Save
- [ ] 等待自动重新部署完成
- [ ] 测试生产网站是否正常

---

## 下一步

设置完成后：

1. ✅ 测试 Email Gate 功能
2. ✅ 测试 License Key 验证
3. ✅ 检查流式 API 是否工作
4. ✅ 开始营销推广！

---

**需要帮助？**

如果遇到问题，检查：
1. Vercel 部署日志（Deployments → 最新部署 → Build Logs）
2. Railway 后端日志（Railway 项目 → Deployments → Logs）
3. 浏览器控制台错误信息（F12 → Console）

**文档版本**：v1.0  
**创建时间**：2026-04-03  
**适用于**：Vercel 前端部署
