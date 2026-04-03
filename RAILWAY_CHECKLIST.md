# ✅ Railway 配置检查清单

## 🎯 快速检查（5 分钟）

打开 Railway 控制台后，按顺序检查以下项目：

### 1️⃣ 部署状态

在 Deployments 页面：
- [ ] 最新部署显示 "Success" 绿色标记
- [ ] 服务状态显示绿色圆点（运行中）
- [ ] 如果显示 "Failed" 红色标记，点击查看详情

### 2️⃣ 根目录设置 ⭐ 最重要

在 Settings 页面：
- [ ] Root Directory = `backend`
- [ ] 如果为空或是其他值，立即修改为 `backend`

### 3️⃣ 启动命令

在 Settings 页面：
- [ ] Start Command = `python run.py`
- [ ] 或者 = `gunicorn run:app --bind 0.0.0.0:$PORT`

### 4️⃣ 环境变量

在 Variables 页面：
- [ ] `ANTHROPIC_API_KEY` 已设置
- [ ] `ANTHROPIC_BASE_URL` 已设置  
- [ ] `GUMROAD_PRODUCT_ID` 已设置
- [ ] `PORT` 自动设置（不需要手动添加）

### 5️⃣ Build Logs

点击最新部署 → Build Logs：
- [ ] 看到 "Successfully installed tiktoken-0.5.2"
- [ ] 看到 "Successfully installed Flask-2.3.2"
- [ ] 没有 "ERROR" 或 "FAILED" 字样

### 6️⃣ Deploy Logs

点击最新部署 → Deploy Logs：
- [ ] 看到 "Running on http://0.0.0.0:xxxx"
- [ ] 没有 Python 错误（ModuleNotFoundError, ImportError 等）
- [ ] 没有 "Application failed to start"

## 🔧 常见问题修复

### 问题：根目录未设置

**症状**: 所有端点返回 404

**修复**:
1. Settings → Root Directory
2. 输入：`backend`
3. 点击 Save
4. 等待自动重新部署（3-5 分钟）

### 问题：启动命令错误

**症状**: 部署成功但服务不启动

**修复**:
1. Settings → Start Command
2. 输入：`python run.py`
3. 点击 Save
4. Deployments → Redeploy

### 问题：环境变量缺失

**症状**: 应用启动但 API 调用失败

**修复**:
1. Variables → Add Variable
2. 添加缺失的变量
3. 等待自动重新部署

### 问题：依赖安装失败

**症状**: Build Logs 显示安装错误

**修复**:
1. 检查 Build Logs 中的具体错误
2. 可能需要修改 requirements.txt
3. 网络恢复后推送修复

## ✅ 修复后验证

修复配置后，等待 3-5 分钟，然后运行：

```powershell
.\quick-test.ps1
```

期望结果：
```
1. Testing backend...
   Backend OK: ok

2. Testing frontend...
   Frontend OK: Status 200
```

## 📸 截图参考

如果你看到以下内容，说明配置正确：

### Settings 页面应该显示：
```
Root Directory: backend
Start Command: python run.py
```

### Deploy Logs 应该显示：
```
* Running on http://0.0.0.0:5000
* Running on http://0.0.0.0:xxxx (Press CTRL+C to quit)
```

### Deployments 页面应该显示：
```
✓ Success (绿色)
● Running (绿色圆点)
```

## 🚀 配置正确后

一旦所有检查项都通过：

1. **等待 3-5 分钟**让服务完全启动
2. **运行测试**：`.\quick-test.ps1`
3. **如果成功**：打开网站测试功能
4. **开始营销**！

---

**现在就做**: 打开 Railway 控制台，按照这个清单逐项检查
