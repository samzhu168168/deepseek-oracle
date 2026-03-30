# 🚨 紧急修复：后端 URL 错误

## 问题根源

你的前端在调用 **错误的后端地址**：
- ❌ 错误：`https://deepseek-oracle-backend.onrender.com` (不存在)
- ❌ 错误：`https://deepseek-oracle-backend.outsider.com` (不存在)
- ✅ 正确：`https://deepseek-oracle-backend-production.up.railway.app`

## 已修复

### 1. 代码修复
修改了 `frontend/src/api/index.ts`，将默认后端 URL 改为 Railway 地址。

### 2. 需要在 Vercel 设置环境变量

**立即操作（2 分钟）：**

1. 打开 https://vercel.com/dashboard
2. 选择你的项目 `elemental-bond`
3. 进入 Settings → Environment Variables
4. 添加新变量：
   - Name: `VITE_API_URL`
   - Value: `https://deepseek-oracle-backend-production.up.railway.app`
   - Environment: Production (勾选)
5. 点击 Save

### 3. 重新部署

设置完环境变量后，Vercel 会自动触发重新部署。

或者手动触发：
```bash
git add frontend/src/api/index.ts
git commit -m "fix: Update backend URL to Railway production"
git push
```

## 为什么会出现这个问题

1. 代码里写死了旧的 Render.com 地址
2. Vercel 没有设置 `VITE_API_URL` 环境变量
3. 所以前端一直在调用不存在的服务器

## 验证步骤（5 分钟后）

1. 等待 Vercel 重新部署完成（约 2-3 分钟）
2. 访问 https://www.elemental.bond
3. 打开浏览器控制台 (F12)
4. 输入生日信息，查看结果
5. 检查 Network 标签，应该看到：
   - ✅ `https://deepseek-oracle-backend-production.up.railway.app/api/capture-email` - 200 OK
   - ✅ Email Gate 弹窗正常显示

## 时间线

- ⏰ 现在：代码已修复，准备提交
- ⏰ +2 分钟：在 Vercel 设置环境变量
- ⏰ +5 分钟：Vercel 重新部署完成
- ⏰ +6 分钟：可以开始营销！

## 下一步

提交代码后，立即去 Vercel 设置环境变量。这是最后一步！
