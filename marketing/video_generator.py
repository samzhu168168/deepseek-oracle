"""
Elemental Bond — 完全免费短视频生成器
技术栈（零成本）：
  - edge-tts       → 微软免费 TTS，无需 API Key
  - pollinations.ai → 免费 AI 图片生成，无需注册
  - FFmpeg         → 本地合成视频，开源免费

输出: 9:16 竖版 MP4，适用于 YouTube Shorts / TikTok / Instagram Reels

安装依赖：
  pip install edge-tts requests pillow --break-system-packages
  # FFmpeg: https://ffmpeg.org/download.html (Windows 下载后加入 PATH)
"""

import asyncio
import subprocess
import requests
import os
import time
import json
import re
import textwrap
from pathlib import Path
from datetime import datetime

# ── 输出目录 ────────────────────────────────────────────────────
OUTPUT_DIR = Path(__file__).parent / "output_videos"
TEMP_DIR = Path(__file__).parent / "temp"
OUTPUT_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

# ── 视频规格（YouTube Shorts / TikTok 标准） ────────────────────
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
FPS = 30
FONT_SIZE = 52  # 字幕字号

# ── 内容脚本库（英文，15-45秒，面向美国用户） ───────────────────
VIDEO_SCRIPTS = [
    {
        "hook": "58% of Americans say no one truly knows them.",
        "body": "The loneliness epidemic is real. But what if the problem isn't finding more people — it's understanding yourself and others on a deeper level? Ancient Chinese BaZi astrology maps your personality across five elements: Wood, Fire, Earth, Metal, Water. When you understand your own elemental makeup, you know exactly why you connect with some people instantly — and clash with others no matter how hard you try.",
        "cta": "Find out your elemental compatibility at elemental dot bond. The reading is free.",
        "visual_prompt": "mystical ancient Chinese scroll with golden elemental symbols, dark background, ethereal fog, cinematic",
        "voice": "en-US-JennyNeural",  # 美式英语女声
    },
    {
        "hook": "Your birth date holds a compatibility code most people never decode.",
        "body": "In BaZi — the ancient Chinese Four Pillars system — your birth date and time create an eight-character map of your personality, your strengths, and the relationship patterns you repeat. It's not about fate. It's about understanding why you keep attracting the same type of person, why certain conversations always turn into arguments, and what your ideal partner actually looks like — beyond surface-level chemistry.",
        "cta": "Get your free BaZi compatibility reading at elemental dot bond.",
        "visual_prompt": "Chinese four pillars chart with glowing celestial symbols, deep purple and gold, mystical atmosphere",
        "voice": "en-US-JennyNeural",
    },
    {
        "hook": "Dating apps give you infinite options. BaZi gives you the right one.",
        "body": "Swipe culture is exhausting because chemistry alone doesn't predict compatibility. BaZi combines your Day Master — your core elemental identity — with your partner's chart to reveal the actual energy dynamic between you. Harmony elements create flow and ease. Clash elements create passion but also friction. Knowing this before you commit changes everything.",
        "cta": "Test your compatibility now at elemental dot bond. Takes 2 minutes.",
        "visual_prompt": "two intertwining elemental energy streams, yin yang symbolism, cosmic space background, vibrant colors",
        "voice": "en-US-AriaNeural",  # 另一种美式女声
    },
    {
        "hook": "Gemini season energy is hitting different this year.",
        "body": "Western astrology says Gemini season brings communication intensity. Chinese BaZi agrees — we're in Horse month, which carries Fire energy. Quick connections, important conversations, sudden clarity in relationships. If there's something you've been avoiding saying to someone important in your life, the next few weeks are cosmically aligned for that conversation.",
        "cta": "See how this month's energy affects your chart at elemental dot bond.",
        "visual_prompt": "gemini constellation merging with Chinese horse zodiac symbol, starfield background, electric blue and orange",
        "voice": "en-US-JennyNeural",
    },
    {
        "hook": "I analyzed 1000 couples using AI and ancient Chinese astrology. Here's what I found.",
        "body": "The number one predictor of long-term relationship success wasn't shared interests or even values — it was elemental compatibility. Couples with harmonious BaZi charts — where one partner's dominant element nourishes the other's — reported significantly higher relationship satisfaction. The clash combinations had the most intense chemistry early on, but also the highest conflict rates.",
        "cta": "Find out if you and your partner are harmonious or clash. Free reading at elemental dot bond.",
        "visual_prompt": "data visualization of relationship patterns as glowing constellation maps, scientific meets mystical aesthetic",
        "voice": "en-US-AriaNeural",
    },
]


# ── Step 1: 生成配音 (edge-tts，完全免费) ───────────────────────
async def generate_voice(text: str, voice: str, output_path: str) -> float:
    """用 edge-tts 生成 MP3 配音，返回音频时长（秒）"""
    import edge_tts

    communicate = edge_tts.Communicate(text, voice, rate="+5%")
    await communicate.save(output_path)

    # 用 ffprobe 获取音频时长
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json",
         "-show_format", output_path],
        capture_output=True, text=True
    )
    info = json.loads(result.stdout)
    duration = float(info["format"]["duration"])
    print(f"  🎙️ Voice: {duration:.1f}s — {output_path}")
    return duration


# ── Step 2: 生成背景图片 (pollinations.ai，完全免费) ────────────
def generate_image(prompt: str, output_path: str, width=1080, height=1920) -> bool:
    """调用 pollinations.ai 免费 API 生成竖版图片"""
    # 加强提示词确保竖版、适合视频的风格
    enhanced_prompt = (
        f"{prompt}, vertical 9:16 format, dark atmospheric background, "
        f"cinematic composition, no text, no watermark, high quality"
    )
    encoded = requests.utils.quote(enhanced_prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded}?width={width}&height={height}&nologo=true&seed={int(time.time())}"

    try:
        response = requests.get(url, timeout=60)
        if response.status_code == 200:
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"  🎨 Image generated: {output_path}")
            return True
        else:
            print(f"  ❌ Image API error: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Image request failed: {e}")
        return False


# ── Step 3: 生成字幕文件 (.srt) ─────────────────────────────────
def generate_srt(full_text: str, duration: float, output_path: str):
    """把脚本切成字幕块，均匀分配时间"""
    # 按句子切分
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', full_text) if s.strip()]

    chunk_duration = duration / len(sentences)

    with open(output_path, "w", encoding="utf-8") as f:
        for i, sentence in enumerate(sentences):
            start = i * chunk_duration
            end = (i + 1) * chunk_duration - 0.1

            start_ts = format_srt_time(start)
            end_ts = format_srt_time(end)

            # 每行最多40字符，自动换行
            wrapped = textwrap.fill(sentence, width=40)

            f.write(f"{i+1}\n{start_ts} --> {end_ts}\n{wrapped}\n\n")

    print(f"  📝 SRT generated: {output_path}")


def format_srt_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


# ── Step 4: FFmpeg 合成最终视频 ──────────────────────────────────
def compose_video(image_path: str, audio_path: str, srt_path: str,
                  output_path: str, duration: float) -> bool:
    """
    用 FFmpeg 把图片 + 音频 + 字幕合成为竖版 MP4
    加入轻微 Ken Burns 缩放效果让画面有动感
    """
    # 字幕样式：白字黑边，底部居中
    subtitle_style = (
        "FontName=Arial,FontSize=18,Bold=1,"
        "PrimaryColour=&HFFFFFF,OutlineColour=&H000000,"
        "Outline=3,Shadow=1,Alignment=2,"
        "MarginV=80"
    )

    cmd = [
        "ffmpeg", "-y",
        # 输入：图片循环 + 音频
        "-loop", "1", "-i", image_path,
        "-i", audio_path,
        # 视频滤镜：Ken Burns 缩放 + 字幕烧录
        "-vf", (
            f"scale={VIDEO_WIDTH}:{VIDEO_HEIGHT}:force_original_aspect_ratio=increase,"
            f"crop={VIDEO_WIDTH}:{VIDEO_HEIGHT},"
            f"zoompan=z='min(zoom+0.0005,1.08)':d={int(duration*FPS)}:"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"s={VIDEO_WIDTH}x{VIDEO_HEIGHT}:fps={FPS},"
            f"subtitles={srt_path}:force_style='{subtitle_style}'"
        ),
        # 音视频设置
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        "-t", str(duration),
        "-pix_fmt", "yuv420p",
        # 输出
        output_path,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        size_mb = os.path.getsize(output_path) / 1024 / 1024
        print(f"  🎬 Video composed: {output_path} ({size_mb:.1f} MB)")
        return True
    else:
        print(f"  ❌ FFmpeg error:\n{result.stderr[-500:]}")
        return False


# ── 主函数：生成一条完整视频 ─────────────────────────────────────
async def generate_video(script_index: int = None) -> str | None:
    """
    生成一条完整短视频
    返回输出文件路径，失败返回 None
    """
    import random
    if script_index is None:
        script_index = random.randint(0, len(VIDEO_SCRIPTS) - 1)

    script = VIDEO_SCRIPTS[script_index]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    prefix = TEMP_DIR / timestamp

    print(f"\n{'='*50}")
    print(f"🎬 Generating video #{script_index + 1}")
    print(f"   Hook: {script['hook'][:60]}...")

    # 合并完整旁白文本
    full_text = f"{script['hook']} {script['body']} {script['cta']}"

    # Step 1: 配音
    audio_path = str(prefix) + "_audio.mp3"
    print("\n[1/4] Generating voice...")
    duration = await generate_voice(full_text, script["voice"], audio_path)

    # Step 2: 背景图片
    image_path = str(prefix) + "_bg.jpg"
    print("\n[2/4] Generating background image...")
    if not generate_image(script["visual_prompt"], image_path):
        # 失败时用纯色背景
        image_path = create_fallback_image(str(prefix) + "_bg_fallback.jpg")

    # Step 3: 字幕
    srt_path = str(prefix) + "_subs.srt"
    print("\n[3/4] Generating subtitles...")
    generate_srt(full_text, duration, srt_path)

    # Step 4: 合成
    output_path = str(OUTPUT_DIR / f"elemental_bond_{timestamp}.mp4")
    print("\n[4/4] Composing final video...")
    success = compose_video(image_path, audio_path, srt_path, output_path, duration)

    if success:
        print(f"\n✅ Done! → {output_path}")
        # 清理临时文件
        for f in [audio_path, image_path, srt_path]:
            try:
                os.remove(f)
            except:
                pass
        return output_path
    return None


def create_fallback_image(output_path: str) -> str:
    """生成纯色渐变背景（当网络图片失败时的备用方案）"""
    try:
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (VIDEO_WIDTH, VIDEO_HEIGHT), color=(15, 10, 35))
        draw = ImageDraw.Draw(img)
        # 简单渐变效果
        for y in range(VIDEO_HEIGHT):
            ratio = y / VIDEO_HEIGHT
            r = int(15 + ratio * 30)
            g = int(10 + ratio * 20)
            b = int(35 + ratio * 60)
            draw.line([(0, y), (VIDEO_WIDTH, y)], fill=(r, g, b))
        img.save(output_path, "JPEG", quality=95)
        print(f"  🎨 Fallback image created: {output_path}")
    except ImportError:
        # 如果 Pillow 也没有，用 FFmpeg 生成纯色
        subprocess.run([
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", f"color=c=0x0f0a23:size={VIDEO_WIDTH}x{VIDEO_HEIGHT}:rate=1",
            "-frames:v", "1", output_path
        ], capture_output=True)
    return output_path


# ── 批量生成（每天 3-5 条） ──────────────────────────────────────
async def generate_daily_batch(count: int = 3):
    """批量生成多条视频"""
    import random
    print(f"\n🚀 Generating {count} videos for today...")
    indices = random.sample(range(len(VIDEO_SCRIPTS)), min(count, len(VIDEO_SCRIPTS)))
    results = []
    for i, idx in enumerate(indices):
        print(f"\n── Video {i+1}/{count} ──")
        path = await generate_video(idx)
        if path:
            results.append(path)
        if i < len(indices) - 1:
            print("⏳ Waiting 10s before next video...")
            await asyncio.sleep(10)
    print(f"\n🎉 Batch complete: {len(results)}/{count} videos generated")
    print("📁 Saved to:", OUTPUT_DIR)
    for p in results:
        print(f"   → {p}")
    return results


if __name__ == "__main__":
    import sys
    if "--batch" in sys.argv:
        count = int(sys.argv[sys.argv.index("--batch") + 1]) if len(sys.argv) > sys.argv.index("--batch") + 1 else 3
        asyncio.run(generate_daily_batch(count))
    else:
        # 默认：生成1条视频
        asyncio.run(generate_video())
