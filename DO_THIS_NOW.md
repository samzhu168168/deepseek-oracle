# 🚨 立即操作（2 分钟）

## ✅ 已完成
- 代码已修复
- 已推送到 GitHub (commit `9c9888d`)
- Vercel 正在自动部署

## ⚠️ 你必须做这一件事

### 在 Vercel 设置环境变量

1. 打开 https://vercel.com/dashboard
2. 选择你的项目
3. Settings → Environment Variables
4. Add New:
   - Name: `VITE_API_URL`
   - Value: `https://deepseek-oracle-backend-production.up.railway.app`
   - Environment: Production ✓
5. Save

**不设置这个变量，网站还是会失败！**

## 等待 5 分钟后测试

访问 https://www.elemental.bond

应该看到：
- ✅ Email Gate 正常弹出
- ✅ 没有 CORS 错误
- ✅ 可以输入邮箱解锁

## 问题根源

你的前端一直在调用错误的后端地址：
- ❌ `https://deepseek-oracle-backend.onrender.com` (不存在)
- ✅ `https://deepseek-oracle-backend-production.up.railway.app` (正确)

现在已经修复了！
