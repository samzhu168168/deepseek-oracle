"""
Pixelle-Video 批量短视频生成脚本
用法: uv run python batch_generate.py
"""

import os
import sys
import asyncio
from pathlib import Path

# ===== 配置区（你只需要改这里）=====
SCRIPTS_DIR = Path(__file__).parent / "营销资料" / "Scripts"
ASSETS_DIR = Path(__file__).parent / "素材"  # 你的pexels素材放这里
OUTPUT_DIR = Path(__file__).parent / "营销资料" / "产出视频"
PIXELLE_DIR = Path(r"F:\月入10万\Pixelle-Video-main\Pixelle-Video-main")

# 精选高质量素材池（画面通用+时长>=15s+分辨率高）
CURATED_ASSETS = [
    "10536728-uhd_2160_4096_25fps.mp4",
    "11986239_2160_3840_60fps.mp4",
    "12295479_2160_3840_30fps.mp4",
    "12692030-uhd_2160_3840_60fps.mp4",
    "12893570-uhd_2160_3840_24fps.mp4",
    "13324114-uhd_2160_3840_24fps.mp4",
    "15280328_2160_3840_30fps.mp4",
    "15958613_2160_3840_30fps.mp4",
    "5082599-uhd_2160_4096_25fps.mp4",
    "5159097-uhd_2160_4096_25fps.mp4",
    "6557704-uhd_2160_3840_25fps.mp4",
    "6781918-uhd_2160_3840_30fps.mp4",
    "6803592-uhd_2160_4096_25fps.mp4",
    "7279202-uhd_2160_4096_24fps.mp4",
    "7279554-uhd_2160_4096_24fps.mp4",
    "7293682-uhd_2160_3840_30fps.mp4",
    "7774948-uhd_2160_3840_30fps.mp4",
    "7872722-uhd_2160_4096_25fps.mp4",
    "8108844-uhd_2160_4096_25fps.mp4",
    "8134382-uhd_2160_4096_25fps.mp4",
    "8348917-uhd_2160_3840_25fps.mp4",
    "8631883-uhd_2160_3840_25fps.mp4",
    "8691683-uhd_2160_4096_25fps.mp4",
    "8888808-uhd_2160_4096_25fps.mp4",
    "9244094-uhd_2160_4096_25fps.mp4",
]

# 音频增强配置
AUDIO_LOUDNORM = "loudnorm=I=-16:LRA=11:TP=-1.5"  # 响度标准化
AUDIO_SAMPLE_RATE = "44100"  # 升采样到44.1kHz
TTS_SPEED = 1.0  # 正常语速
BGM_VOLUME = 0.15  # BGM音量
# ===================================

# 脚本文件与素材数量的对应配置
SCRIPTS_CONFIG = [
    {
        "file": "Script_1_一人AI公司.md",
        "title": "10 Chinese Solo Devs $250K",
        "intent": "10 Chinese solo developers built AI products making $250K+ combined. Inspiring story for indie hackers.",
        "duration": 60,
        "assets_needed": 4,
        "keywords": ["business", "laptop", "coding", "success"]
    },
    {
        "file": "Script_2_YouTube自动化.md",
        "title": "2 AI Agents 4 Channels 1.3M Subs",
        "intent": "How a Chinese creator automated 4 YouTube channels with 2 AI agents reaching 1.3M subscribers.",
        "duration": 60,
        "assets_needed": 4,
        "keywords": ["youtube", "automation", "technology", "data"]
    },
    {
        "file": "Script_3_AI代写.md",
        "title": "AI Writing Service $700 to $14K",
        "intent": "A 24-year-old scaled an AI writing service from $700 to $14K/month in 7 months through business model innovation.",
        "duration": 60,
        "assets_needed": 4,
        "keywords": ["writing", "office", "money", "growth"]
    },
    {
        "file": "Script_4_出海Web.md",
        "title": "Solo Dev $40K Month Web Products",
        "intent": "A Chinese solo developer's framework for building web products that earn $40K/month with zero employees.",
        "duration": 60,
        "assets_needed": 4,
        "keywords": ["developer", "website", "dashboard", "travel"]
    },
    {
        "file": "Script_5_50%25转化率.md",
        "title": "100 Followers 50 Percent Conversion",
        "intent": "A Chinese creator achieved 50% conversion rate with 100 followers using a simple $1.40 filter strategy.",
        "duration": 60,
        "assets_needed": 4,
        "keywords": ["social media", "community", "funnel", "money"]
    },
]


def list_available_assets(assets_dir: Path) -> list:
    """列出素材文件夹内的所有视频/图片文件"""
    if not assets_dir.exists():
        return []
    supported = {".mp4", ".mov", ".avi", ".webm", ".jpg", ".jpeg", ".png"}
    files = []
    for f in sorted(assets_dir.iterdir()):
        if f.suffix.lower() in supported:
            files.append(str(f))
    return files


def print_status(message: str, emoji: str = "→"):
    print(f"\n{emoji} {message}")
    sys.stdout.flush()


def enhance_audio(input_video: str, output_video: str) -> str:
    """使用FFmpeg做音频后处理：响度标准化 + 升采样到44.1kHz + 视频重编码保证质量"""
    import subprocess
    try:
        cmd = [
            "ffmpeg", "-y",
            "-i", input_video,
            "-af", f"{AUDIO_LOUDNORM}",
            "-c:v", "copy",
            "-c:a", "aac",
            "-ar", AUDIO_SAMPLE_RATE,
            "-b:a", "192k",
            output_video
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            print_status(f"音频增强完成: {output_video}")
            return output_video
        else:
            print_status(f"音频增强失败: {result.stderr[:200]}")
            return input_video
    except Exception as e:
        print_status(f"音频增强出错: {e}")
        return input_video


def preprocess_asset(asset_path: str, temp_dir: str) -> str:
    """将素材缩放到 1080x1920 + yuv420p，避免 FFmpeg OOM / 编码错误"""
    import subprocess

    fname = os.path.basename(asset_path)
    output_path = os.path.join(temp_dir, f"pre_{fname}")

    # 跳过已处理文件（防止嵌套处理）
    if fname.startswith("pre_"):
        return asset_path

    # 缩放到 1080x1920 + yuv420p + 25fps
    cmd = [
        "ffmpeg", "-y",
        "-i", asset_path,
        "-vf", "scale='min(1080,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease,"
               "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
        "-r", "25",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "copy",
        output_path
    ]
    try:
        subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return output_path
    except:
        pass
    return asset_path


async def generate_single_video(
    pixelle_path: Path,
    script_name: str,
    title: str,
    intent: str,
    duration: int,
    assets: list,
    output_path: Path,
):
    """生成一条视频（含音频后处理）"""
    # 切换到 Pixelle-Video 目录
    original_dir = os.getcwd()
    preprocess_dir = None
    os.chdir(str(pixelle_path))

    try:
        # 动态导入（必须在Pixelle-Video目录下）
        sys.path.insert(0, str(pixelle_path))
        # 添加 Pixelle-Video 的 .venv 依赖路径
        venv_site = pixelle_path / ".venv" / "Lib" / "site-packages"
        if venv_site.exists():
            sys.path.insert(0, str(venv_site))

        # 先切换为英文模式
        config_path = pixelle_path / "config.yaml"
        en_config_path = pixelle_path / "config_en.yaml"
        if en_config_path.exists():
            import shutil
            shutil.copy(str(en_config_path), str(config_path))
            print_status("已切换为英文模式", "🔊")

        from pixelle_video import pixelle_video
        from pixelle_video.pipelines.asset_based import AssetBasedPipeline

        print_status(f"初始化引擎...", "⚙️")
        await pixelle_video.initialize()

        # 素材预处理：统一转为 yuv420p，避免 FFmpeg overlay 编码错误
        import tempfile
        preprocess_dir = tempfile.mkdtemp(prefix="asset_pre_")
        preprocessed = [preprocess_asset(a, preprocess_dir) for a in assets]
        print_status(f"素材预处理完成 ({len(preprocessed)} 个)", "🖼️")

        print_status(f"正在生成: {title}", "🎬")
        print_status(f"脚本: {script_name}", "📝")
        print_status(f"素材数量: {len(assets)} 个", "🖼️")

        pipeline = AssetBasedPipeline(pixelle_video)

        result = await pipeline(
            assets=preprocessed,
            video_title=title,
            intent=intent,
            duration=duration,
            source="selfhost",
            voice_id="en-US-GuyNeural",
            tts_speed=TTS_SPEED,
            bgm_path="default.mp3",
            bgm_volume=BGM_VOLUME,
        )

        # 复制到输出目录 + 音频后处理
        import shutil
        import tempfile
        output_dir = Path(output_path)
        output_dir.mkdir(parents=True, exist_ok=True)

        if result.final_video_path:
            video_name = f"{script_name.replace('.md', '')}.mp4"
            final_output = output_dir / video_name

            # 音频增强（响度标准化 + 44.1kHz升采样）
            temp_enhanced = os.path.join(tempfile.gettempdir(), f"enhanced_{video_name}")
            enhanced = enhance_audio(result.final_video_path, temp_enhanced)
            if enhanced == temp_enhanced:
                shutil.copy(enhanced, str(final_output))
                os.remove(temp_enhanced)  # 清理临时文件
            else:
                shutil.copy(result.final_video_path, str(final_output))

            print_status(f"✅ 视频已保存: {final_output}", "✅")
            return str(final_output)
        else:
            print_status(f"❌ 生成失败，没有输出文件", "❌")
            return None

    except Exception as e:
        print_status(f"❌ 生成失败: {e}", "❌")
        import traceback
        traceback.print_exc()
        return None
    finally:
        os.chdir(original_dir)
        # 清理预处理临时目录
        try:
            import shutil
            shutil.rmtree(preprocess_dir, ignore_errors=True)
        except:
            pass


async def main():
    print("=" * 60)
    print("  Pixelle-Video 批量短视频生成器")
    print("=" * 60)

    # 1. 检查素材文件夹
    assets_dir = ASSETS_DIR
    assets = list_available_assets(assets_dir)

    if not assets:
        print(f"\n⚠️  素材文件夹不存在或为空: {assets_dir}")
        print(f"\n请先完成以下步骤:")
        print(f"  1. 在浏览器打开 https://www.pexels.com")
        print(f"  2. 搜索以下关键词，各下载4-5个视频:")
        for i, cfg in enumerate(SCRIPTS_CONFIG, 1):
            print(f"     {i}. {cfg['file']}: 搜索 {', '.join(cfg['keywords'])}")
        print(f"  3. 将所有素材文件放入: {assets_dir}")
        print(f"\n完成后重新运行: uv run python batch_generate.py")
        return

    print(f"\n✅ 素材文件夹: {assets_dir}")
    print(f"   共找到 {len(assets)} 个素材文件")

    # 2. 选择要生成的脚本
    print(f"\n可生成的脚本:")
    for i, cfg in enumerate(SCRIPTS_CONFIG, 1):
        print(f"  {i}. {cfg['file']}  (需{cfg['assets_needed']}个素材)")
    print(f"  0. 全部生成")

    # 支持命令行参数:
    #   python batch_generate.py --first 3  (生成前3个)
    #   python batch_generate.py 1,3,5      (生成指定编号)
    #   python batch_generate.py 1          (生成第1个)
    #   python batch_generate.py            (交互模式)
    import argparse
    parser = argparse.ArgumentParser(description="批量生成视频")
    parser.add_argument("choice", nargs="?", default=None,
                        help="脚本编号: 逗号分隔(如1,3,5), 0=全部, 留空=交互模式")
    parser.add_argument("--first", type=int, default=0,
                        help="生成前N个脚本 (如 --first 3)")
    args = parser.parse_args()

    indices = []
    if args.first > 0:
        indices = list(range(min(args.first, len(SCRIPTS_CONFIG))))
    elif args.choice is not None:
        choice = args.choice
        if choice == "0":
            indices = list(range(len(SCRIPTS_CONFIG)))
        elif choice.isdigit():
            n = int(choice)
            if 1 <= n <= len(SCRIPTS_CONFIG):
                indices = [n - 1]
        elif "," in choice:
            parts = [int(x.strip()) for x in choice.split(",") if x.strip().isdigit()]
            indices = [i - 1 for i in parts if 1 <= i <= len(SCRIPTS_CONFIG)]
        else:
            print(f"无效输入: {choice}")
            return
    else:
        choice = input(f"\n请输入编号 (1-5 或 0=全部) [默认: 1]: ").strip() or "1"
        if choice == "0":
            indices = list(range(len(SCRIPTS_CONFIG)))
        elif choice.isdigit() and 1 <= int(choice) <= len(SCRIPTS_CONFIG):
            indices = [int(choice) - 1]
        else:
            print("无效输入，默认生成第1个")
            indices = [0]

    # 3. 逐条生成
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for idx in indices:
        cfg = SCRIPTS_CONFIG[idx]
        script_path = SCRIPTS_DIR / cfg["file"]

        if not script_path.exists():
            print_status(f"脚本文件不存在: {script_path}", "⚠️")
            continue

        if len(assets) < cfg["assets_needed"]:
            print_status(f"素材不足 (需要{cfg['assets_needed']}个，只有{len(assets)}个)", "⚠️")
            continue

        # 从精选素材池中随机选N个（不重复）
        import random
        # 找到素材池中实际存在的文件
        available = []
        for fname in CURATED_ASSETS:
            full_path = ASSETS_DIR / fname
            if full_path.exists():
                available.append(str(full_path))
        # 如果精选池不够，用全部素材补
        if len(available) < cfg["assets_needed"]:
            available = assets
            print_status(f"精选素材不足，使用全部{len(available)}个素材")
        random.shuffle(available)
        video_assets = available[:cfg["assets_needed"]]

        await generate_single_video(
            pixelle_path=PIXELLE_DIR,
            script_name=cfg["file"],
            title=cfg["title"],
            intent=cfg["intent"],
            duration=cfg["duration"],
            assets=video_assets,
            output_path=OUTPUT_DIR,
        )

        print(f"\n   {'='*50}")

    print(f"\n✅ 全部完成！视频保存在: {OUTPUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
