# 🚀 启动服务测试指南

## 余额确认 ✅
- 当前余额: $8-9 USD
- 可生成报告数: ~200-300 份
- 单次成本: ~$0.029
- 状态: 充足，无需立即充值

---

## 启动步骤

### 方式一：分别启动（推荐用于测试）

#### 1. 启动后端服务

打开第一个终端窗口：

```bash
cd backend
python run.py
```

**预期输出：**
```
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
Press CTRL+C to quit
```

✅ 看到这个输出说明后端启动成功！

⚠️ 如果看到 "WARNING: Redis unavailable" - 这是正常的，不影响 license 功能

#### 2. 启动前端服务

打开第二个终端窗口：

```bash
cd frontend
npm run dev
```

**预期输出：**
```
VITE v6.0.5  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

✅ 看到这个输出说明前端启动成功！

---

## 快速测试流程

### 第 1 步：访问网站

在浏览器中打开：`http://localhost:5173`

### 第 2 步：生成测试报告

1. 填写两个人的生日信息（随便填测试数据）
   - Person 1: 1990-01-01, 12:00, Male
   - Person 2: 1992-05-15, 14:30, Female

2. 点击生成报告按钮

3. 等待跳转到结果页面

### 第 3 步：测试 License Key 弹窗

在结果页面：

1. 向下滚动，找到 "Already purchased?" 部分
2. 点击 **"Enter License Key →"** 按钮
3. 应该弹出一个精美的弹窗

✅ 如果弹窗正常显示，说明前端集成成功！

### 第 4 步：测试验证流程（使用假 key）

1. 在弹窗中输入：`test-1234-5678-abcd`
2. 点击 "Unlock My Full Blueprint →"
3. 应该看到 "Verifying your access..." 动画
4. 几秒后显示错误：❌ "License key not found..."

✅ 这是正常的！说明验证流程工作正常

### 第 5 步：测试真实 Gumroad Key（如果有）

如果你有真实的 Gumroad 购买记录：

1. 从 Gumroad 邮件中复制 license key
2. 在弹窗中输入真实的 key
3. 观察完整流程：
   - 🔮 "Verifying your access..." (2-3秒)
   - ✨ "Reading your elemental bond..." (15-20秒)
   - 🎉 完整报告展示！

---

## 验证检查清单

在浏览器开发者工具 (F12) 中检查：

### Console 标签
- ❌ 不应该有红色错误
- ⚠️ 黄色警告可以忽略

### Network 标签

当点击 "Enter License Key" 按钮后，应该看到：

1. **POST** `/api/verify-license`
   - Status: 200
   - Response: `{"success": false, "error": "..."}`（假 key 的情况）

2. **POST** `/api/generate-full-report`（只有真实 key 才会触发）
   - Status: 200
   - Response: `{"success": true, "report": {...}}`

---

## 常见问题排查

### ❌ 后端启动失败

**错误**: `ModuleNotFoundError: No module named 'flask'`

**解决**:
```bash
cd backend
pip install -r requirements.txt
```

### ❌ 前端启动失败

**错误**: `Cannot find module 'vite'`

**解决**:
```bash
cd frontend
npm install
npm run dev
```

### ❌ 弹窗不显示

**检查**:
1. 打开浏览器控制台 (F12)
2. 查看是否有红色错误
3. 确认文件存在：
   ```bash
   ls frontend/src/components/LicenseKeyModal.tsx
   ls frontend/src/components/FullReport.tsx
   ```

### ❌ API 调用 404

**错误**: `POST http://localhost:5173/api/verify-license 404`

**原因**: 前端代理配置问题

**检查**: `frontend/vite.config.ts` 中的 proxy 配置

### ❌ CORS 错误

**错误**: "Access-Control-Allow-Origin"

**解决**: 确认后端 CORS 配置正确（已在 `backend/app/__init__.py` 中配置）

---

## 成功标志 ✅

- [x] 后端在 5000 端口运行
- [x] 前端在 5173 端口运行
- [x] 可以访问首页
- [x] 可以生成测试报告
- [x] 点击 "Enter License Key" 弹出弹窗
- [x] 弹窗样式正常，可以输入文字
- [x] 输入假 key 显示错误提示
- [x] 可以关闭弹窗

---

## 下一步

测试通过后：

1. **获取真实 Gumroad Key 测试**
   - 自己购买一次（$24.90）
   - 或使用 Gumroad 的测试模式

2. **验证完整报告生成**
   - 确认 AI 生成的报告质量
   - 检查所有字段是否完整
   - 验证格式是否正确

3. **监控 API 使用**
   - 访问: https://api.laozhang.ai/token
   - 查看余额变化
   - 确认每次调用扣费正确

4. **准备上线**
   - 部署到生产环境
   - 配置域名和 HTTPS
   - 设置监控和告警

---

## 快捷命令

### 停止服务
- 后端: 在终端按 `Ctrl + C`
- 前端: 在终端按 `Ctrl + C`

### 重启服务
```bash
# 后端
cd backend
python run.py

# 前端
cd frontend
npm run dev
```

### 查看日志
- 后端: 直接在终端查看输出
- 前端: 浏览器 F12 → Console

---

## 需要帮助？

如果遇到问题：
1. 检查终端输出的错误信息
2. 查看浏览器控制台 (F12)
3. 确认所有文件都已保存
4. 尝试重启服务

**准备好了吗？开始测试吧！** 🚀
