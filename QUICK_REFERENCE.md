# 🚀 快速参考指南

## 已完成的优化（3/5）

### ✅ 1. 路由统一管理
**位置**：`backend/app/api/__init__.py`

**使用方法**：
```python
# 添加新路由只需两步：
# 1. 在 backend/app/api/ 创建新文件
# 2. 在 __init__.py 导入并添加到列表

from .my_new_route import my_bp

blueprints = [
    # ... 其他路由
    (my_bp, "/api"),
]
```

---

### ✅ 2. 流式 API
**位置**：`backend/app/api/divination_stream.py`

**后端使用**：
```python
@bp.route('/api/my-stream', methods=['POST'])
def my_stream():
    def generate():
        yield f"data: {json.dumps({'status': 'processing'})}\n\n"
        # 处理逻辑
        yield f"data: {json.dumps({'status': 'complete'})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')
```

**前端使用**：
```typescript
import { analyzeBondStreaming } from '@/api/streaming';

// 在组件中
for await (const event of analyzeBondStreaming(data)) {
  console.log(event.status, event.progress);
}
```

---

### ✅ 3. 工具注册系统
**位置**：`backend/app/tools/`

**创建新工具**：
```python
# backend/app/tools/my_tool.py
class MyTool:
    name = "my_tool"
    description = "What this tool does"
    schema = {"param1": str, "param2": int}
    
    def execute(self, param1: str, param2: int, **kwargs):
        # 工具逻辑
        return {"success": True, "result": "..."}

# 自动注册
from . import register_tool
register_tool(MyTool())
```

**使用工具**：
```python
from app.tools import execute_tool

result = execute_tool('my_tool', param1='value', param2=123)
```

---

## 待完成的优化（2/5）

### ⏳ 4. Zustand 状态管理

**安装**：
```bash
cd frontend
npm install zustand
```

**使用**：
```typescript
// 在组件中
import { useReportStore } from '@/store/reportStore';

function MyComponent() {
  const { emailUnlocked, setEmailUnlocked } = useReportStore();
  
  return (
    <button onClick={() => setEmailUnlocked(true)}>
      Unlock
    </button>
  );
}
```

---

### ⏳ 5. 上下文压缩

**安装**：
```bash
pip install tiktoken
```

**使用**：
```python
from app.services.context_manager import ContextManager

manager = ContextManager()
compressed = manager.compress_messages(messages)
```

---

## 常用命令

### 开发
```bash
# 后端
cd backend
python run.py

# 前端
cd frontend
npm run dev
```

### 测试
```bash
# 后端测试
cd backend
pytest

# 前端测试
cd frontend
npm run test
```

### 部署
```bash
# 提交代码
git add .
git commit -m "feat: Your message"
git push

# Vercel 和 Railway 会自动部署
```

---

## 环境变量

### Vercel（前端）
```
VITE_API_URL=https://deepseek-oracle-backend-production.up.railway.app
```

### Railway（后端）
```
GUMROAD_PRODUCT_ID=bhpmxr
ANTHROPIC_API_KEY=sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1
ANTHROPIC_BASE_URL=https://api.laozhang.ai
```

---

## 故障排查

### CORS 错误
✅ 已修复 - 所有路由统一管理

### 流式 API 不工作
检查：
1. Railway 是否禁用了缓冲
2. 前端是否正确解析 SSE

### 工具注册失败
检查：
1. 工具类是否实现了 `name`, `description`, `schema`, `execute`
2. 是否调用了 `register_tool()`

---

## 下一步

1. ⏳ 在 Vercel 设置 `VITE_API_URL`
2. ⏳ 测试生产环境
3. ⏳ 安装 zustand
4. ⏳ 实现更多工具

---

**快速链接**：
- [完整优化报告](./OPTIMIZATION_COMPLETE.md)
- [架构对比分析](./CLAUDE_CODE_架构对比与优化方案.md)
- [Claude Code 知识库](./Claude_Code_架构知识库.md)
