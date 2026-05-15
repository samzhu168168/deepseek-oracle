# Elemental Bond Agent 自动化流水线 — 配置指南

## 已完成配置

### 1. 环境变量 (`/.env`)

已将所有 API 密钥和服务端点配置到统一的 `.env` 文件中：

| 配置项 | 说明 | 状态 |
|--------|------|------|
| `LLM_PROVIDER` | 默认LLM提供商 (deepseek) | ✅ 已配置 |
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | ⚠️ 需填写完整密钥 |
| `ARK_API_KEY` | 火山引擎Ark密钥 | ⚠️ 需填写 |
| `PEXELS_API_KEY` | Pexels素材库密钥 | ✅ 已配置 |
| `NANOBANANA_API_KEY` | NanoBanana AI绘图密钥 | ⚠️ 需填写 |

### 2. Agent 流水线配置 (`/.codex/agent-pipeline.config.json`)

定义了7个流水线阶段：

```
用户输入
  → [安全预检] oracle-safety-guardian
  → [意图路由] oracle-agent-team-orchestrator
  → [专家分析] 紫微/梅花/塔罗/每日卡片/心法解读
  → [行动化] oracle-actionizer
  → [内容生成] Pexels素材 / NanoBanana AI绘图
  → [安全后检] oracle-safety-guardian
  → [一致性审计] oracle-consistency-auditor (定期)
```

### 3. 调度引擎规则 (`/.codex/orchestrator-rules.config.json`)

| 规则类型 | 配置内容 |
|----------|----------|
| 并发控制 | 最多2个专家并行，操作器在专家之后执行 |
| 熔断器 | 失败5次后熔断60秒 |
| 重试策略 | 最多重试2次，指数退避 |
| 兜底策略 | 工具调用失败→关键词路由；专家失败→使用预设兜底文本 |
| 关键词路由 | 长期(紫微)、短期(梅花)、情绪(心法)、日常(日卡)、塔罗 |

### 4. 内容生成服务 (`/backend/app/services/content_generation_service.py`)

新增 `ContentGenerationService`：
- **Pexels 集成** — 根据回答上下文搜索匹配的东方美学图片
- **NanoBanana 集成** — 根据意图类型自动生成 AI 水墨画风图像
- **触发条件** — 每日卡片、长期分析、心态疏导时自动附加图片

### 5. 定时任务

| 任务 | 调度 | 说明 |
|------|------|------|
| 每日运势卡片 | 每天 8:00 AM (Asia/Shanghai) | 自动生成当日运势卡片 |
| 一致性审计 | 每周一 2:00 AM | 审计长期结论一致性 |
| 部署后安全审查 | 部署后触发 | 代码变更后安全检查 |
| 内容缓存刷新 | 每6小时 | Pexels素材缓存刷新 |

## 下一步操作

### 1. 填写缺失的 API 密钥

编辑 `/.env` 文件，将以下密钥填写完整：

```
DEEPSEEK_API_KEY=sk-你的完整密钥
ARK_API_KEY=你的火山引擎密钥
NANOBANANA_API_KEY=你的NanoBanana密钥
NANOBANANA_BASE_URL=你的NanoBanana服务地址
```

### 2. 启动后端服务

```bash
cd backend
python run.py
```

### 3. 测试流水线

```bash
curl -X POST http://localhost:5000/api/oracle/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_query": "今天适合做什么？",
    "selected_school": "east",
    "enabled_schools": ["daily_card", "actionizer"]
  }'
```

## Agent Content Kit 技能清单

位于 `/.codex/skills/` 的10个智能体技能：

| 技能 | 用途 | 触发词 |
|------|------|--------|
| oracle-agent-team-orchestrator | 中央调度器 | 所有请求 |
| oracle-ziwei-agent | 紫微斗数长线分析 | 人生/未来/走势/格局 |
| oracle-meihua-agent | 梅花易数短期占断 | 今天/本周/要不要 |
| oracle-tarot-agent | 塔罗象征解读 | 塔罗/牌阵 |
| oracle-daily-card-composer | 每日运势卡片 | 每日/日卡/今日运势 |
| oracle-philosophy-rag-agent | 心法解读与情绪疏导 | 焦虑/内耗/修心 |
| oracle-actionizer | 行动清单生成 | 自动调用 |
| oracle-safety-guardian | 安全审查 | 前后自动调用 |
| oracle-consistency-auditor | 一致性审计 | 定期运行 |
| post-dev-security-review | 代码安全审查 | 部署后 |
