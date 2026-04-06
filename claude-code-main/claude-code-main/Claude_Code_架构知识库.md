# Claude Code 架构知识库

## 一、项目总览

Claude Code 是 Anthropic 开发的命令行 AI 编程助手，采用 Bun + TypeScript + React/Ink 技术栈。架构核心思想是**工具驱动的 Agent 系统**：通过 50+ 内置工具（文件操作、Shell、搜索、LSP、MCP）+ 可扩展的 Skills/Plugins 体系，实现从简单代码编辑到多 Agent 协同的复杂任务。

设计亮点：
1. **分层解耦**：Assistant（会话管理）→ Coordinator（多 Agent 编排）→ Services（外部集成）→ Tools（原子能力）
2. **流式优先**：AsyncGenerator 实现 API 流式响应，支持实时输出和中断
3. **权限隔离**：每个工具调用都经过权限检查，支持自动/手动/计划模式
4. **上下文管理**：三层压缩策略（动态窗口 + 自动压缩 + 微压缩）保持对话连贯性
5. **可扩展性**：通过 Skills（Markdown 模板）、Plugins（代码插件）、MCP（外部服务）三种方式扩展能力

## 二、核心模块速查表

| 模块 | 路径 | 核心职责 | 关键设计点 |
|------|------|----------|------------|
| **Assistant** | `src/assistant/` | 会话历史管理、API 通信 | 分页加载历史、流式响应、上下文预算管理 |
| **Coordinator** | `src/coordinator/` | 多 Agent 编排调度 | LLM 驱动调度、AgentTool 异步注册、失败重试 |
| **Commands** | `src/commands/` | 用户命令路由执行 | 90+ 斜杠命令、三种参数解析、权限分层控制 |
| **Server** | `src/server/` | WebSocket 客户端管理 | 连接 CCR 容器、NDJSON 消息、Bearer 认证 |
| **State** | `src/state/` | 全局状态管理 | 自研 Store（useSyncExternalStore）、选择器订阅、分层持久化 |
| **Services** | `src/services/` | 外部服务集成 | 20+ 服务（API/MCP/LSP/OAuth）、函数式设计、依赖注入 |
| **Skills** | `src/skills/` | 可复用 Prompt 模板 | Markdown + Frontmatter、多来源加载、条件启用 |
| **Tools** | `src/tools/` | Agent 原子能力 | 40+ 工具、Zod 校验、权限模型、进度状态 |
| **Bridge** | `src/bridge/` | IDE 扩展通信 | 双向消息协议、JWT 认证、权限回调 |
| **QueryEngine** | `src/QueryEngine.ts` | LLM 调用引擎 | 流式响应、工具调用循环、重试逻辑、Token 计数 |

## 三、数据流全链路

### 典型单轮对话流程

```
用户输入 "/commit 修复登录 bug"
    ↓
[1] Commands 模块解析
    - 识别 /commit 命令
    - 提取参数 "修复登录 bug"
    - 检查命令可用性和权限
    ↓
[2] Assistant 模块处理
    - fetchLatestEvents() 加载最近会话历史
    - autoCompactIfNeeded() 检查上下文预算（13K tokens 阈值）
    - 构建系统 Prompt + 用户消息 + 工具定义
    ↓
[3] QueryEngine 发起 API 调用
    - queryModelWithStreaming() 创建 AsyncGenerator
    - 流式接收 Claude API 响应
    - 解析 tool_use 块（如 BashTool、FileReadTool）
    ↓
[4] Tools 执行
    - 权限检查（toolPermission hook）
    - 执行工具逻辑（如 git diff、读取文件）
    - 返回 tool_result
    ↓
[5] 多轮工具调用循环
    - 将 tool_result 追加到消息历史
    - 再次调用 API（携带工具结果）
    - 直到模型输出 stop_reason: "end_turn"
    ↓
[6] State 模块更新
    - setState() 更新消息历史
    - 触发订阅者通知（UI 重渲染）
    - 持久化到 .claude/{sessionId}/messages.jsonl
    ↓
[7] 输出渲染
    - Ink 组件渲染 Markdown 输出
    - 显示 git commit 命令建议
```

### 多 Agent 协同流程（Coordinator 模式）

```
用户输入 "/coordinate 重构支付模块"
    ↓
[1] Coordinator 模式激活
    - coordinatorMode.ts 注入编排系统 Prompt
    - 主 Agent 转变为 Orchestrator 角色
    ↓
[2] 任务分解（LLM 驱动）
    - 模型分析任务，决定拆分策略
    - 通过 AgentTool 创建子 Agent
    - XML 格式通知：<agent id="worker-1" task="分析现有代码" />
    ↓
[3] 并行执行
    - 每个 Worker Agent 独立运行
    - 拥有独立的工具权限和上下文
    - 通过 SendMessageTool 向 Coordinator 报告进度
    ↓
[4] 结果聚合
    - Coordinator 收集各 Worker 的输出
    - 检测失败任务（status: failed）
    - 决定是否重试或调整策略
    ↓
[5] 最终输出
    - 合并所有 Worker 结果
    - 生成统一的重构报告
```

## 四、可复用设计模式

### 1. 流式 + 降级模式（Streaming with Fallback）

**场景**：API 调用可能因网络或服务端问题失败

**实现**：
```typescript
async function* queryModelWithStreaming() {
  try {
    // 优先使用流式 API
    for await (const chunk of streamAPI()) {
      yield chunk
    }
  } catch (error) {
    // 降级到非流式 API
    const result = await nonStreamAPI()
    yield result
  }
}
```

**价值**：
- 用户体验优先（实时反馈）
- 容错性强（自动降级）
- 适用于所有需要长时间等待的操作

### 2. 选择器订阅模式（Selector Subscription）

**场景**：全局状态变化时，只有部分组件需要重渲染

**实现**：
```typescript
// 细粒度订阅，只在 messages 变化时重渲染
const messages = useAppState(state => state.messages)

// 而不是订阅整个 state
const state = useAppState(state => state) // ❌ 任何变化都重渲染
```

**价值**：
- 性能优化（减少不必要的渲染）
- 代码清晰（明确依赖关系）
- 类似 Zustand/Recoil 的最佳实践

### 3. 三层上下文压缩策略

**场景**：长对话导致 Token 超限

**实现**：
```
Layer 1: 动态窗口（最近 N 条消息全保留）
    ↓ 超过 13K tokens
Layer 2: 自动压缩（调用 compact API 总结历史）
    ↓ 仍然超限
Layer 3: 微压缩（删除工具调用细节，保留结果）
```

**价值**：
- 平衡上下文完整性和成本
- 渐进式压缩，避免信息丢失
- 适用于所有需要长期记忆的 AI 应用

### 4. 声明式工具注册（Declarative Tool Registry）

**场景**：新增工具需要修改多处代码

**实现**：
```typescript
// 工具自包含定义
export const BashTool = {
  name: 'bash',
  inputSchema: z.object({ command: z.string() }),
  execute: async (input) => { /* ... */ },
  permissions: { requiresApproval: true }
}

// 自动注册
registerTool(BashTool)
```

**价值**：
- 低耦合（工具独立开发）
- 易扩展（新增工具无需改核心代码）
- 类似插件系统的设计思路

### 5. LLM 驱动的调度（LLM-Driven Scheduling）

**场景**：多任务调度逻辑复杂，硬编码难以维护

**实现**：
```typescript
// 不是传统的任务队列，而是让 LLM 决定
const coordinatorPrompt = `
你是任务编排者，可以通过 AgentTool 创建子任务。
根据用户需求，决定：
1. 需要几个 Worker
2. 每个 Worker 的职责
3. 执行顺序（并行/串行）
`
```

**价值**：
- 灵活性极高（适应各种任务类型）
- 减少硬编码逻辑
- 利用 LLM 的推理能力

## 五、对我自己项目的应用建议

### 背景：独立开发者 + AI 工具产品

#### 建议 1：优先实现流式输出

**为什么**：用户对 AI 工具的核心期待是"快速反馈"，流式输出能显著提升体验。

**如何做**：
- 使用 AsyncGenerator 封装 API 调用
- 前端用 Server-Sent Events (SSE) 或 WebSocket 接收
- 参考 `queryModelWithStreaming` 的实现

**投入产出比**：⭐⭐⭐⭐⭐（高优先级）

#### 建议 2：采用轻量级状态管理

**为什么**：Redux 对小团队来说过于重量级，自研 Store 只需 200 行。

**如何做**：
- 使用 React 18 的 `useSyncExternalStore`
- 实现 `getState/setState/subscribe` 三个 API
- 通过 selector 函数优化性能

**投入产出比**：⭐⭐⭐⭐（中高优先级）

#### 建议 3：设计可扩展的工具系统

**为什么**：AI 工具的核心竞争力在于"能做什么"，工具系统决定了扩展性。

**如何做**：
- 每个工具独立文件，包含 schema + execute + permissions
- 使用 Zod 做参数校验
- 通过注册表统一管理

**投入产出比**：⭐⭐⭐⭐⭐（高优先级，长期价值）

#### 建议 4：实现上下文压缩机制

**为什么**：长对话是刚需，但 Token 成本不可忽视。

**如何做**：
- 第一阶段：简单截断（保留最近 N 条）
- 第二阶段：调用 Claude API 的 summarize 功能
- 第三阶段：删除工具调用细节

**投入产出比**：⭐⭐⭐（中优先级，成本敏感时必做）

#### 建议 5：用 Markdown 实现 Skills 系统

**为什么**：非技术用户也能贡献 Prompt 模板，降低扩展门槛。

**如何做**：
- 定义 Frontmatter 格式（name/description/whenToUse）
- 扫描指定目录加载 .md 文件
- 通过命令触发（如 `/myskill`）

**投入产出比**：⭐⭐⭐⭐（中高优先级，社区驱动的关键）

#### 不建议立即做的事

❌ **多 Agent 协同**：复杂度高，调试困难，适合团队而非独立开发者
❌ **完整的权限系统**：早期用户信任度高，可以简化为"全部允许"
❌ **Bridge 系统**：除非要做 IDE 插件，否则 CLI 足够

## 六、关键术语词汇表

| 术语 | 含义 | 出现位置 |
|------|------|----------|
| **Assistant** | 会话管理模块，负责历史加载和 API 通信 | `src/assistant/` |
| **Coordinator** | 多 Agent 编排器，将主 Agent 转为 Orchestrator 角色 | `src/coordinator/` |
| **Tool** | Agent 可调用的原子能力（如文件读写、Shell 执行） | `src/tools/` |
| **Skill** | 可复用的 Prompt 模板，通过 Markdown + Frontmatter 定义 | `src/skills/` |
| **Command** | 用户通过 `/` 前缀调用的命令（如 `/commit`、`/review`） | `src/commands/` |
| **MCP (Model Context Protocol)** | 外部服务集成协议，允许第三方提供工具 | `src/services/mcp/` |
| **LSP (Language Server Protocol)** | 语言服务器协议，提供代码补全、跳转等能力 | `src/services/lsp/` |
| **Bridge** | IDE 扩展与 CLI 的双向通信层 | `src/bridge/` |
| **CCR (Claude Code Remote)** | 远程容器服务，用于隔离执行环境 | `src/server/` |
| **Compact** | 上下文压缩，通过 API 总结历史对话 | `src/services/compact/` |
| **Auto-memory** | 自动提取的记忆，存储在 `.claude/` 目录 | `src/memdir/` |
| **CLAUDE.md** | 项目级别的 Claude 指令文件 | 项目根目录 |
| **CLAUDE.local.md** | 用户级别的 Claude 指令文件（不提交到 Git） | 项目根目录 |
| **AgentTool** | 创建子 Agent 的工具，用于多 Agent 协同 | `src/tools/AgentTool/` |
| **SendMessageTool** | Agent 间通信工具，用于报告进度或请求帮助 | `src/tools/SendMessageTool/` |
| **TeamCreateTool** | 创建 Agent 团队，支持并行工作 | `src/tools/TeamCreateTool/` |
| **QueryEngine** | LLM 调用引擎，处理流式响应和工具调用循环 | `src/QueryEngine.ts` |
| **useSyncExternalStore** | React 18 API，用于订阅外部状态 | `src/state/store.ts` |
| **Selector** | 状态选择器函数，用于细粒度订阅 | `src/state/AppState.tsx` |
| **Feature Flag** | 特性开关，通过 `bun:bundle` 实现死代码消除 | 全局 |
| **Permission Mode** | 权限模式（default/plan/auto/bypassPermissions） | `src/hooks/toolPermission/` |
| **Streaming** | 流式输出，通过 AsyncGenerator 实现 | `src/assistant/sessionHistory.ts` |
| **Fallback** | 降级策略，流式失败时切换到非流式 | `src/assistant/sessionHistory.ts` |
| **Context Budget** | 上下文预算，通常为 13K tokens | `src/utils/context.ts` |
| **Micro-compact** | 微压缩，删除工具调用细节保留结果 | `src/services/compact/` |
| **Bundled Skill** | 内置 Skill，编译到二进制中 | `src/skills/bundled/` |
| **Plugin** | 代码插件，通过 npm 包或本地目录加载 | `src/plugins/` |
| **Ink** | React 的终端 UI 渲染器 | `src/components/` |
| **Zod** | TypeScript 优先的 schema 校验库 | 全局 |
| **NDJSON** | 换行分隔的 JSON 格式，用于流式消息 | `src/server/` |
| **Bearer Token** | HTTP 认证方式，用于 WebSocket 连接 | `src/server/` |
| **JWT** | JSON Web Token，用于 Bridge 认证 | `src/bridge/jwtUtils.ts` |
| **AsyncLocalStorage** | Node.js API，用于隔离并发请求的上下文 | `src/state/` |
| **DeepImmutable** | TypeScript 类型，防止意外修改状态 | `src/state/AppState.tsx` |
| **Frontmatter** | Markdown 文件头部的 YAML 元数据 | `src/skills/` |
| **Pagination Cursor** | 分页游标，用于加载历史消息 | `src/assistant/sessionHistory.ts` |
| **Tool Use Block** | Claude API 返回的工具调用块 | `src/QueryEngine.ts` |
| **Tool Result Block** | 工具执行结果块，返回给 Claude API | `src/QueryEngine.ts` |
| **Stop Reason** | API 响应的停止原因（end_turn/max_tokens/tool_use） | `src/QueryEngine.ts` |

---

## 附录：快速上手指南

### 如何阅读源码

1. **入口文件**：`src/main.tsx`（CLI 启动）
2. **核心引擎**：`src/QueryEngine.ts`（理解 LLM 调用循环）
3. **工具系统**：`src/tools/BashTool/`（理解工具结构）
4. **状态管理**：`src/state/store.ts`（理解状态订阅）
5. **命令系统**：`src/commands/commit/`（理解命令实现）

### 如何调试

```bash
# 启动开发模式
bun run dev

# 查看详细日志
DEBUG=* claude-code

# 查看特定模块日志
DEBUG=assistant,coordinator claude-code
```

### 如何扩展

```bash
# 添加自定义 Skill
echo "---
name: myskill
description: 我的自定义技能
---
# Prompt 内容
" > .claude/skills/myskill.md

# 添加自定义 Plugin
mkdir -p .claude/plugins/myplugin
# 实现 plugin.ts

# 添加 MCP Server
# 编辑 ~/.kiro/settings/mcp.json
```

---

**文档版本**：v1.0
**最后更新**：2026-04-03
**适用于**：Claude Code 源码快照（2026-03-31）
