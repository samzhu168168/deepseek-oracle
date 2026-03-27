# 快速测试指南 🧪

## 前置条件检查

✅ API Key 已集成: `sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1`
✅ 前端组件已就位: `LicenseKeyModal.tsx`, `FullReport.tsx`
✅ 后端路由已注册: `license_routes.py`
✅ 环境变量已配置: `backend/.env`

## 测试步骤

### 1. 启动后端服务

```bash
cd backend
python run.py
```

预期输出：
```
* Running on http://127.0.0.1:5000
* WARNING: Redis unavailable, running in no-queue mode (这个警告可以忽略)
```

### 2. 启动前端服务

```bash
cd frontend
npm run dev
```

预期输出：
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 3. 测试 API 连接

在浏览器或 Postman 中测试：

#### 测试 1: 健康检查
```bash
curl http://localhost:5000/api/health
```

预期响应：
```json
{"status": "ok"}
```

#### 测试 2: License 验证 (使用测试 key)
```bash
curl -X POST http://localhost:5000/api/verify-license \
  -H "Content-Type: application/json" \
  -d '{"license_key": "test-key-12345"}'
```

预期响应（失败是正常的，因为这不是真实的 Gumroad key）：
```json
{
  "success": false,
  "error": "License key not found. Check your Gumroad confirmation email."
}
```

### 4. 前端完整流程测试

1. 打开浏览器访问: `http://localhost:5173`
2. 填写两个人的生日信息
3. 点击生成报告
4. 在结果页面，找到 "Already purchased?" 部分
5. 点击 "Enter License Key →" 按钮
6. 应该弹出 `LicenseKeyModal` 弹窗
7. 输入一个测试 key（会失败，但可以验证 UI 流程）

### 5. 使用真实 Gumroad Key 测试

如果你有真实的 Gumroad 购买记录：

1. 从 Gumroad 获取真实的 license key
2. 在弹窗中输入
3. 观察流程：
   - ✅ "Verifying your access..." (验证中)
   - ✅ "Reading your elemental bond..." (生成报告中)
   - ✅ 完整报告展示

### 6. 检查 API 调用

在生成报告时，打开浏览器开发者工具 (F12)，查看 Network 标签：

应该看到两个请求：
1. `POST /api/verify-license` - 状态码 200
2. `POST /api/generate-full-report` - 状态码 200

### 7. 检查老张 API 余额

访问: https://api.laozhang.ai/token

查看你的余额是否减少（每次成功生成报告会扣费 ~$0.029）

## 常见问题排查

### 问题 1: 后端启动失败

**错误**: `ModuleNotFoundError: No module named 'anthropic'`

**解决**: 
```bash
cd backend
pip install requests  # anthropic 库已经不需要了
```

### 问题 2: API 调用失败

**错误**: "Report generation failed: 401 Unauthorized"

**原因**: API Key 无效或过期

**解决**: 
1. 检查 `backend/.env` 中的 API Key
2. 访问 https://api.laozhang.ai/token 验证 key 是否有效
3. 检查余额是否充足

### 问题 3: 前端弹窗不显示

**原因**: 组件导入路径错误

**解决**: 
```bash
# 检查文件是否存在
ls frontend/src/components/LicenseKeyModal.tsx
ls frontend/src/components/FullReport.tsx
```

### 问题 4: CORS 错误

**错误**: "Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS"

**解决**: 检查 `backend/app/__init__.py` 中的 CORS 配置

### 问题 5: 缓存问题

如果修改了代码但没有生效：

**前端**:
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

**后端**:
```bash
cd backend
rm -rf __pycache__
rm -rf app/__pycache__
python run.py
```

## 成功标志

✅ 后端启动无错误
✅ 前端启动无错误
✅ 弹窗可以正常打开和关闭
✅ 输入 license key 后有加载动画
✅ 验证失败时显示错误信息
✅ 验证成功后显示完整报告

## 下一步

测试通过后：
1. 部署到生产环境
2. 配置真实的 Gumroad Product ID
3. 监控 API 使用情况
4. 收集用户反馈

## 紧急联系

如果遇到无法解决的问题：
- 检查后端日志
- 检查浏览器控制台
- 检查网络请求详情
- 验证 API Key 状态

---

**提示**: 第一次测试建议使用小额充值（$10-20），确认流程完全正常后再大额充值。
