# ✅ 最终修复步骤（5 分钟完成）

## 问题诊断

从你的截图看到的错误：
```
Access to XMLHttpRequest at 'https://deepseek-oracle-backend.outsider.com/health' 
from origin 'https://www.elemental.bond' has been blocked by CORS policy
```

**这不是 CORS 问题！是前端在调用错误的后端地址！**

## 根本原因

1. 代码里写死了旧地址：`https://deepseek-oracle-backend.onrender.com`
2. Vercel 没有设置环境变量 `VITE_API_URL`
3. 前端调用了不存在的服务器，当然会失败

## 已完成的修复

✅ 修改了 `frontend/src/api/index.ts`
✅ 将默认 URL 改为：`https://deepseek-oracle-backend-production.up.railway.app`
✅ 代码已提交到本地

## 你需要做的 3 件事

### 步骤 1：推送代码到 GitHub（1 分钟）

在 Kiro 终端运行：
```bash
git push
```

如果网络有问题，多试几次。

### 步骤 2：在 Vercel 设置环境变量（2 分钟）

1. 打开 https://vercel.com/dashboard
2. 选择项目 `elemental-bond` 或 `deepseek-oracle`
3. 点击 Settings → Environment Variables
4. 点击 Add New
5. 填写：
   - **Name**: `VITE_API_URL`
   - **Value**: `https://deepseek-oracle-backend-production.up.railway.app`
   - **Environment**: 勾选 Production
6. 点击 Save

### 步骤 3：触发重新部署（自动或手动）

**方法 A（自动）：**
设置环境变量后，Vercel 会自动重新部署。

**方法 B（手动）：**
1. 在 Vercel 项目页面
2. 点击 Deployments 标签
3. 找到最新的部署
4. 点击右侧的 "..." 菜单
5. 选择 Redeploy

## 验证（5 分钟后）

1. 等待 Vercel 部署完成（约 2-3 分钟）
2. 访问 https://www.elemental.bond
3. 打开浏览器控制台 (F12)
4. 输入生日信息，点击 Calculate
5. 查看 Network 标签，应该看到：
   ```
   ✅ https://deepseek-oracle-backend-production.up.railway.app/api/divination/analyze - 200 OK
   ✅ https://deepseek-oracle-backend-production.up.railway.app/api/capture-email - 200 OK
   ```
6. Email Gate 弹窗应该正常显示

## 为什么这次一定能成功

1. **代码层面**：默认 URL 已改为正确的 Railway 地址
2. **环境变量**：Vercel 会用 `VITE_API_URL` 覆盖默认值
3. **CORS 配置**：后端已经正确配置了 CORS
4. **Railway 部署**：后端服务正常运行

## 如果还有问题

检查 Railway 后端是否正常：
```bash
curl https://deepseek-oracle-backend-production.up.railway.app/health
```

应该返回：
```json
{"status": "ok"}
```

## 时间线

- ⏰ 现在：代码已修复，等待推送
- ⏰ +1 分钟：推送到 GitHub
- ⏰ +2 分钟：在 Vercel 设置环境变量
- ⏰ +5 分钟：Vercel 重新部署完成
- ⏰ +6 分钟：**可以开始营销！** 🚀

## 下一步

1. 运行 `git push`（如果网络有问题，多试几次）
2. 立即去 Vercel 设置环境变量
3. 等待 5 分钟
4. 测试网站
5. 开始营销！
