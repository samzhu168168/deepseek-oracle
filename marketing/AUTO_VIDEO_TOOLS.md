# Automated Video Tools — 无需手动制作，脚本直接生成视频

## 你的痛点

- 英文不流利，没法自己配音
- 手动剪辑耗时，一条视频要做很久
- 需要持续产出（每天至少1条）

下面三个项目可以做到：**你给一句主题 → AI自动写脚本 → 自动配音 → 自动加字幕 → 生成视频**，你只需要审核发布。

---

## 终极推荐：Agent Content Kit

> GitHub: `github.com/vovuhuydeveloper/agent-content-kit`

**最完整的全自动方案。最适合你。**

### 它做什么

```
你输入一句话主题
    ↓
Agent 1: 网络爬虫抓取热点素材
Agent 2: AI分析内容方向
Agent 3: 生成脚本（可以用The Oracle风格）
Agent 4: A/B测试两个版本
Agent 5: 生成配音（edge-tts，免费）
Agent 6: 合成视频 + 字幕
Agent 7: 生成封面缩略图
Agent 8: 推送到Telegram让你审核
Agent 9: 你点"通过" → 自动发布到TikTok + YouTube + Facebook
Agent 10: 数据分析仪表盘
```

### 为什么选它

| 优势 | 说明 |
|------|------|
| **你不需要说英文** | 脚本全自动生成，配音全自动 |
| **Telegram审核** | 视频生成后发到你手机，你看着OK点一下才发布 |
| **定时发布** | 设好cron，每天自动生产+发布 |
| **一键部署** | Docker一行命令 |
| **多平台** | YouTube + TikTok + Facebook 同时发 |
| **Oracle品牌兼容** | 你可以自定义System Prompt，让AI用Oracle的语气写脚本 |

### 部署方式（5分钟）

```bash
# 1. 克隆
git clone https://github.com/vovuhuydeveloper/agent-content-kit.git
cd agent-content-kit

# 2. 配置环境变量（API keys等）
cp .env.example .env
nano .env  # 填入你的 Anthropic API Key

# 3. 一键启动
docker-compose up -d

# 4. 打开浏览器 → http://localhost:3000 → 配置内容策略 → 开始自动生产
```

### Oracle 品牌适配配置

在 Agent Content Kit 的 System Prompt 设置中填入：

```
You are The Oracle's content strategist. All scripts must follow this voice:

- Opening must hook in first 3 seconds: "Your relationship has a pattern..."
- Use direct, confident language. No therapy-speak. No AI tone.
- Every video ends with: "Read your blueprint. elemental.bond"
- Topics rotate between: elemental compatibility, pattern recognition, 
  relationship truth, 2026 predictions, AI vs ancient wisdom
- Target audience: US women 25-38, spiritually curious
- Never mention: BaZi, Chinese, fortune-telling, "based on analysis"
- Always mention: The Oracle, pattern, element, blueprint, ancient wisdom
```

---

## 备选方案

### 方案2：MoneyPrinterV2（最流行，15.7K星）

> GitHub: `github.com/FujiMakoto/MoneyPrinterV2`（搜索 MoneyPrinterV2）

**优势：** 15,700+ 星，经过大量验证，成熟稳定。2026年3月更新了**完全本地化**（Ollama + KittenTTS），零API费用。

**劣势：** 
- 界面是中文的（对你反而是优势）
- 视频风格偏向中文短视频（" brainrot "风格）
- 不太适合 The Oracle 的暗黑神秘美学
- 需要手动调整模板才能匹配品牌调性

**适合：** 如果你不在乎品牌统一性，只想批量生产流量视频。

---

### 方案3：Automated Video Generator（MIT协议，最开放）

> GitHub: `github.com/itsPremkumar/Automated-Video-Generator`

**独特优势：** 
- **内置 MCP Server** — 意味着我可以（Claude Code）直接操控它生成视频！
- Remotion 渲染 — React 编程式视频，画质专业
- 有 Web 面板，手动操作也方便
- MIT 协议，完全自由

**劣势：**
- 没有自动发布功能
- 需要自己写一点配置代码
- Remotion 渲染比 FFmpeg 慢

**适合：** 想要最高画质 + 跟我配合（Claude Code 直接操控 MCP）批量生产。

---

### 方案4：ffmpeg-ai（最简单，零成本）

> GitHub: `github.com/numbpill3d/ffmpeg-ai`

**优势：** 一个 Python 文件，550 行代码。零依赖。完全免费。

**劣势：** 
- 只能命令行用，没有界面
- 没有自动发布
- 视频效果比较基础（Ken Burns 缩放效果）
- 配音是 Edge TTS（免费的，声音还行但不如 ElevenLabs）

**适合：** 先试水，快速验证。一条命令出一支视频。

---

## 横向对比

| 维度 | Agent Content Kit | MoneyPrinterV2 | Automated Video Gen | ffmpeg-ai |
|------|-------------------|----------------|---------------------|-----------|
| GitHub Stars | 新项目 | 15.7K ⭐ | ~500 ⭐ | 新项目 |
| 部署难度 | ⭐ 一键Docker | ⭐⭐ 需要配置 | ⭐⭐ 需要Node+Python | ⭐ pip install |
| 自动发TikTok | ✅ | ✅ | ❌ | ❌ |
| 自动发YouTube | ✅ | ✅ | ❌ | ❌ |
| Telegram审核 | ✅ | ❌ | ❌ | ❌ |
| 定时调度 | ✅ cron | ✅ | ❌ | ❌ |
| 免费配音 | ✅ edge-tts | ✅ KittenTTS | ✅ edge-tts | ✅ edge-tts |
| 自定义品牌风格 | ✅ System Prompt | ⚠️ 需改模板 | ✅ Remotion | ⚠️ 有限 |
| MCP/Agent操控 | ❌ | ❌ | ✅ **我能操控** | ❌ |
| 界面语言 | 英文 | 中文 | 英文 | 命令行 |
| 费用 | API key即可 | 免费（本地模型） | 免费 | 免费 |
| 视频画质 | 中上 | 中等 | 专业级 | 基础 |

---

## 我的建议

### 最佳路径：Agent Content Kit（主力） + Automated Video Generator（辅助）

```
Agent Content Kit → 日常自动化生产 + 自动发布
    ↓ （你只需要在Telegram点"通过"）
    
Automated Video Generator → 品牌大片
    ↓ （我通过MCP直接操控，做The Oracle专属风格视频）
```

### 今晚就能开始的最简路径

如果今晚就想试试，先装 **ffmpeg-ai**：

```bash
git clone https://github.com/numbpill3d/ffmpeg-ai.git
cd ffmpeg-ai
pip install -r requirements.txt

# 用我们写好的Oracle脚本生成第一条视频
python main.py --topic "Your relationship has a hidden pattern written in your birth chart. Fire meets Water. Discover your blueprint at elemental.bond" --style dark --resolution 1080x1920
```

10 分钟后你就有第一条视频了。效果好再升级到 Agent Content Kit 做全自动。
