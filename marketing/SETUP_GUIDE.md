# 自动化视频生成 — 完整部署指南

## 需要申请几个 API Key？

**一共 3 个必须 + 1 个可选：**

| # | 平台 | 用途 | 费用 | 申请时间 |
|---|------|------|------|---------|
| 1 | **Anthropic** | AI写脚本 | 充$10 | 5分钟 |
| 2 | **Pexels** | 背景视频素材 | **免费** | 2分钟 |
| 3 | **Telegram Bot** | 视频审核→手机确认 | **免费** | 3分钟 |
| 4 | **ElevenLabs**（可选）| 高质量英文配音 | 免费10条/月 | 2分钟 |

**3 个必须的 Key 就能跑，申请总共 10 分钟。**

---

## 每个 Key 具体怎么申请

### 1. Anthropic API Key（今晚回家用VPN申请）

```
网址：https://console.anthropic.com/
步骤：
  1. 注册账号（用 Google 登录最快）
  2. 左侧菜单 → API Keys
  3. 点击 Create Key
  4. 复制 sk-ant-api03-... 开头的 Key
  5. 充值：Billing → Add credits → $10
```

### 2. Pexels API Key（免费，不需要VPN）

```
网址：https://www.pexels.com/api/
步骤：
  1. 注册账号
  2. 进入 API 页面 → 申请新 Key
  3. 填写用途："AI video generation for social media content"
  4. 即时获得 Key，无需审核
```

### 3. Telegram Bot（免费，手机操作）

```
步骤：
  1. 手机打开 Telegram
  2. 搜索 @BotFather
  3. 发送 /newbot
  4. 输入 bot 名称：The Oracle Video Bot
  5. 输入 bot 用户名：oracle_video_bot
  6. 获得 BOT_TOKEN（一串数字:字母）
  7. 搜索 @userinfobot → 发送 /start → 获得你的 CHAT_ID
```

### 4. ElevenLabs（可选，免费层够起步）

```
网址：https://elevenlabs.io/
步骤：
  1. 注册账号
  2. 进入 Profile → API Key
  3. 复制 Key
  4. 免费层：每月10,000字符 ≈ 10-15条视频
```

---

## 填入开源项目

拿到所有 Key 后，在 Agent Content Kit 的 `.env` 文件里填写：

```bash
# —— 必须填的 ——
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx    # 今晚申请
PEXELS_API_KEY=xxxxxxxxxxxxx                     # 2分钟免费拿
TELEGRAM_BOT_TOKEN=123456:xxxxxxx                # 3分钟免费拿
TELEGRAM_CHAT_ID=123456789                       # 你的Telegram ID

# —— 可选的 ——
ELEVENLABS_API_KEY=xxxxxxxxxxxxx                 # 想更好听的声音再填
```

填好 → `docker-compose up -d` → 启动完成。

---

## 一条视频的真实成本测算

### 30秒视频（TikTok/Reels 最佳长度）

| 环节 | 用什么 | 消耗量 | 费用 |
|------|--------|--------|------|
| AI写脚本 | Claude Sonnet 4.6 | 800输入+300输出 tokens | **$0.007** |
| 配音 | ElevenLabs Starter | ~400字符语音 | **$0.068** |
| 背景素材 | Pexels | 3-5段视频 | **$0** |
| 字幕 | 内置生成 | 自动 | **$0** |
| 音乐 | Pexels 免费 | 1段 | **$0** |
| 合成导出 | FFmpeg本地 | 本地CPU | **$0** |
| 发布TikTok | 浏览器自动化 | — | **$0** |
| **一条合计** | | | **$0.075** |

> **$10 = 约 130 条 30 秒视频**

### 60秒视频（YouTube Shorts）

| 环节 | 消耗量 | 费用 |
|------|--------|------|
| AI写脚本 | 800输入+600输出 tokens | **$0.011** |
| 配音 | ~800字符 | **$0.136** |
| 其余同上 | | **$0** |
| **一条合计** | | **$0.147** |

> **$10 = 约 68 条 60 秒视频**

---

## 省钱方案：配音用免费的 edge-tts

大多数 TikTok 爆款视频用的是机器配音，观众根本不在乎。先用免费方案：

| 视频长度 | 用 edge-tts（免费） | 用 ElevenLabs（付费） |
|----------|-------------------|----------------------|
| 30秒 | **$0.007** | **$0.075** |
| 60秒 | **$0.011** | **$0.147** |
| $10能出多少 | **~1,400条** | **~130条** |

**建议：前100条用免费的 edge-tts 跑通流程 + 测试内容。跑出播放量高的视频后，再用 ElevenLabs 给爆款视频重新配音发布。**

---

## 要不要付费产品？

你说得对，免费的一般不够好。但这里的情况是：

| 组件 | 免费方案 | 付费方案 | 要不要花钱 |
|------|---------|---------|-----------|
| Agent Content Kit | ✅ 开源 | 不需要 | **开源就是完整的** |
| LLM 脚本生成 | ❌ | Claude API $10 | **必须花** |
| 配音 | edge-tts | ElevenLabs $5/月 | 先用免费，跑通再买 |
| 素材 | Pexels 免费 | 不需要 | **Pexels 免费就够** |

**真正需要花钱的只有一个：Anthropic API Key。充 $10。** 其他都免费，或者先免费跑通再升级。

---

## 起步三步走

```
今晚：
  □ 申请 Anthropic API Key（VPN → console.anthropic.com → 充$10）
  □ 申请 Pexels API Key（2分钟，免费）
  □ 申请 Telegram Bot（3分钟，手机操作）

明早：
  □ git clone Agent Content Kit
  □ 填好 .env 文件的3个Key
  □ docker-compose up -d
  □ 输入第一个主题 → 等待第一条视频 → 手机Telegram收到预览
  □ 点击"发布" → TikTok上线

以后每天：
  □ 打开Telegram → 看到自动生成的视频 → 点通过 → 发布
  □ 或者设好cron → 完全不用管，每天自动发
```
