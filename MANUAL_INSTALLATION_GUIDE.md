# 📦 手动安装指南

由于权限问题，某些包需要手动安装。以下是详细步骤。

---

## 任务 1：安装 Zustand（前端状态管理）

### 为什么需要？
- 简化 `Result.tsx` 200+ 行代码
- 集中管理所有模态框状态
- 提升代码可维护性

### 安装步骤

#### 方法 A：以管理员身份运行（推荐）

1. **关闭所有正在运行的终端和编辑器**

2. **以管理员身份打开 PowerShell**
   - 按 `Win + X`
   - 选择 "Windows PowerShell (管理员)" 或 "终端 (管理员)"

3. **进入项目目录**
   ```powershell
   cd "F:\MyTraeProjects\Elemental Bond\frontend"
   ```

4. **安装 zustand**
   ```powershell
   npm install zustand
   ```

5. **验证安装**
   ```powershell
   npm list zustand
   ```
   应该显示：`zustand@4.x.x`

#### 方法 B：清理缓存后安装

如果方法 A 失败，尝试清理 npm 缓存：

```powershell
# 清理缓存
npm cache clean --force

# 删除 node_modules（可选）
Remove-Item -Recurse -Force node_modules

# 重新安装
npm install

# 安装 zustand
npm install zustand
```

#### 方法 C：使用 yarn（备选）

如果 npm 一直有问题，可以尝试 yarn：

```powershell
# 安装 yarn（如果还没有）
npm install -g yarn

# 使用 yarn 安装
yarn add zustand
```

### 安装后的验证

1. **检查 package.json**
   打开 `frontend/package.json`，应该看到：
   ```json
   {
     "dependencies": {
       "zustand": "^4.x.x",
       ...
     }
   }
   ```

2. **测试导入**
   在 `frontend/src/store/reportStore.ts` 中，第一行应该不报错：
   ```typescript
   import { create } from 'zustand';
   ```

3. **运行 TypeScript 检查**
   ```powershell
   npm run typecheck
   ```
   应该没有关于 zustand 的错误。

---

## 任务 2：安装 tiktoken（后端 Token 计数）

### 为什么需要？
- 精确计算 LLM Token 使用量
- 降低 API 成本 30-50%
- 支持更长的对话历史

### 安装步骤

#### 方法 A：直接安装

1. **打开终端**
   ```powershell
   cd "F:\MyTraeProjects\Elemental Bond\backend"
   ```

2. **激活虚拟环境（如果有）**
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

3. **安装 tiktoken**
   ```powershell
   pip install tiktoken
   ```

4. **验证安装**
   ```powershell
   python -c "import tiktoken; print(tiktoken.__version__)"
   ```

#### 方法 B：更新 requirements.txt

1. **编辑 `backend/requirements.txt`**
   添加一行：
   ```
   tiktoken==0.5.2
   ```

2. **安装所有依赖**
   ```powershell
   pip install -r requirements.txt
   ```

#### 方法 C：使用国内镜像（如果网络慢）

```powershell
pip install tiktoken -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 安装后的验证

1. **测试导入**
   ```powershell
   python -c "import tiktoken; enc = tiktoken.get_encoding('cl100k_base'); print('Success!')"
   ```

2. **测试 ContextManager**
   ```powershell
   cd backend
   python -c "from app.services.context_manager import ContextManager; cm = ContextManager(); print(cm.count_tokens('Hello world'))"
   ```
   应该输出一个数字（约 2-3）。

---

## 任务 3：更新 requirements.txt

为了让 Railway 自动安装 tiktoken，需要更新 requirements.txt：

### 步骤

1. **打开 `backend/requirements.txt`**

2. **添加 tiktoken**
   在文件末尾添加：
   ```
   tiktoken==0.5.2
   ```

3. **提交到 Git**
   ```powershell
   git add backend/requirements.txt
   git commit -m "chore: Add tiktoken for token counting"
   git push
   ```

4. **Railway 会自动重新部署**
   - 进入 Railway 项目页面
   - 查看 Deployments 标签
   - 等待部署完成

---

## 常见问题

### Q1: npm install 一直报 EPERM 错误？

**A**: 这通常是权限或文件占用问题：

1. **关闭所有编辑器和终端**
2. **关闭杀毒软件（临时）**
3. **以管理员身份运行**
4. **清理缓存**：
   ```powershell
   npm cache clean --force
   ```

### Q2: pip install 报网络错误？

**A**: 使用国内镜像：

```powershell
pip install tiktoken -i https://pypi.tuna.tsinghua.edu.cn/simple
```

或者配置永久镜像：
```powershell
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### Q3: 安装后 import 还是报错？

**A**: 检查是否在正确的环境：

**前端（Zustand）**：
```powershell
cd frontend
npm list zustand  # 应该显示版本号
```

**后端（tiktoken）**：
```powershell
cd backend
python -c "import tiktoken"  # 不应该报错
```

### Q4: Railway 部署失败？

**A**: 检查 Railway 日志：

1. 进入 Railway 项目
2. 点击 Deployments
3. 查看失败的部署
4. 点击 View Logs
5. 搜索 "tiktoken" 或 "error"

如果是 tiktoken 安装失败，可能需要在 Railway 设置中添加构建命令。

---

## 安装完成检查清单

### 前端（Zustand）
- [ ] npm install zustand 成功
- [ ] package.json 中有 zustand 依赖
- [ ] TypeScript 检查通过
- [ ] 可以导入 `import { create } from 'zustand'`

### 后端（tiktoken）
- [ ] pip install tiktoken 成功
- [ ] 可以导入 `import tiktoken`
- [ ] ContextManager 可以正常使用
- [ ] requirements.txt 已更新
- [ ] Railway 部署成功

---

## 下一步

安装完成后：

1. **测试 ContextManager**
   ```powershell
   cd backend
   python app/services/context_manager_example.py
   ```

2. **使用 Zustand Store**
   在 `Result.tsx` 中替换 useState：
   ```typescript
   // 之前
   const [emailUnlocked, setEmailUnlocked] = useState(false);
   
   // 之后
   const { emailUnlocked, setEmailUnlocked } = useReportStore();
   ```

3. **提交代码**
   ```powershell
   git add .
   git commit -m "feat: Integrate Zustand and context compression"
   git push
   ```

---

## 需要帮助？

如果遇到问题：

1. **检查错误信息**
   - 复制完整的错误信息
   - 搜索错误代码（如 EPERM, EACCES）

2. **检查环境**
   - Node.js 版本：`node --version`
   - npm 版本：`npm --version`
   - Python 版本：`python --version`
   - pip 版本：`pip --version`

3. **尝试备选方案**
   - npm 有问题 → 试试 yarn
   - pip 有问题 → 试试国内镜像

---

**文档版本**：v1.0  
**创建时间**：2026-04-03  
**状态**：等待手动安装
