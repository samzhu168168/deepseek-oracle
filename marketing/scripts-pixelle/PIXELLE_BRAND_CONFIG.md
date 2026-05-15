# Pixelle.AI 品牌注入配置 — 直接用于 Pixelle-Video

## Pixelle-Video Web UI 品牌设置

打开 `http://localhost:8501`，在以下位置填入品牌信息：

---

## 1. 视觉 Prompt Prefix（最重要）

位置：中间栏 → 「视觉设置」→ 「Prompt Prefix」

**每个脚本都使用这个：**

```
Dark cinematic style, high contrast, moody lighting, deep purple #7C3AED and cyan #06B6D4 color accents, minimalist composition, glitch effects, clean lines, futuristic tech aesthetic with open source warmth, 4K quality, vertical 9:16 composition
```

**各脚本可微调的变体：**

| Script | Prompt Prefix 微调 |
|--------|-------------------|
| #1 AI Took My Job | 加 `corporate decay visual metaphor, McDonald's color contrast against purple` |
| #2 7 Hours Scrolling | 加 `phone screen POV, blue light fatigue, digital detox aesthetic` |
| #3 Creator Math | 加 `receipts, price tags, money burning, liberation imagery` |
| #4 Everything Feels Fake | 加 `news chaos, glitch art, then warm sunrise color shift to hope` |
| #5 No CEO | 加 `corporate boardroom satire, then GitHub green terminal aesthetic` |
| #6 Don Dash | 加 `passport stamps, world map, travel photography, digital nomad aesthetic` |
| #7 Creator Fund | 加 `TikTok UI parody, hamster wheel metaphor, breaking chains` |
| #8 $4B Company | 加 `venture capital satire, pitch deck parody, vs GitHub green code` |
| #9 No Permission | 加 `rejection letters burning, pipeline visualization, forward momentum` |
| #10 Remix Manifesto | 加 `timeline 1995-2026, creative tool icons, converging into one light` |

---

## 2. Logo 水印 & 结尾

Pixelle-Video 支持在视频末尾添加自定义画面。创建以下结尾卡片文字：

### Outro 文字（每个视频末尾）

```
Pixelle
Open Source Omnimodal AI Creative Agent

pixelle.ai
github.com/AIDC-AI/Pixelle-MCP
```

### 如果 Pixelle-Video 支持片头 Logo

将 Pixelle logo 放入 Pixelle-Video 的 `assets/` 或 `static/` 目录（取决于版本），在模板中引用。

Logo 下载地址：`https://pixelle.ai` 或 GitHub `AIDC-AI/Pixelle-MCP` 仓库的 `assets/` 目录。

---

## 3. TTS 语音品牌一致性

| 层级 | 引擎 | 语音 | 使用场景 |
|------|------|------|---------|
| 免费起步 | Edge-TTS | `en-US-EricNeural` | 前 100 条测试 |
| 升级 | ElevenLabs | `Adam`（Stability 55%, Clarity 85%, Speed 0.95x） | 跑通后的正式版 |

**Eric** 声线：年轻(25-35)、直接、不加修饰、有一点点锋利 — 完美匹配 Pixelle 的"反叛创作者"品牌调性。

---

## 4. 背景音乐（BGM）

Pixelle-Video 的 `bgm/` 目录放入以下风格的音乐（可从 Pexels/Pixabay 免费下载）：

| 脚本类型 | BGM 风格 | 参考关键词 |
|---------|---------|-----------|
| 愤怒/觉醒类（#1, #3, #5, #7） | Low bass, building tension, dark ambient | "dark cinematic tension" |
| 内疚/觉醒类（#2, #4） | Minor piano, sparse, emotional | "melancholic piano ambient" |
| 赋能/行动类（#6, #8, #9） | Driving beat, forward momentum, warm synth | "motivational ambient electronic" |
| 品牌大片（#10） | Orchestral build, epic, emotional rise | "cinematic orchestral hopeful" |

---

## 5. 字幕风格

Pixelle-Video 使用 HTML 模板控制字幕。在 `web/templates/` 中找到你选的模板，确保：

- 字体：无衬线（Arial / Inter / system default）
- 颜色：白字 + 紫/青色高亮关键词
- 位置：屏幕下半部分，不遮挡视觉主体
- 动画：逐字出现（typewriter）或弹入

---

## 6. 品牌标签（发布时使用）

每个视频发布时附带以下标签：

```
#PixelleAI #OpenSource #AICreative #Omnimodal #CreativeTools #AIVideo #NoGatekeepers #CreatorEconomy #BuildInPublic #FreeSoftware
```

按平台加额外标签：
- TikTok: `#fyp #creatortools #aimade`
- YouTube: `#Shorts #OpenSource #AITools`
- X: `#buildinpublic #opensource #aiart`
