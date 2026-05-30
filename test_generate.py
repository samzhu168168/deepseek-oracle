"""
快速测试：生成前3个视频，自动挑最长素材
用法: uv run python test_generate.py
"""
import os
import sys
import asyncio
from pathlib import Path

SCRIPTS_DIR = Path(__file__).parent / "营销资料" / "Scripts"
ASSETS_DIR = Path(__file__).parent / "素材"
OUTPUT_DIR = Path(__file__).parent / "营销资料" / "产出视频"
PIXELLE_DIR = Path(r"F:\\月入10万\\Pixelle-Video-main\\Pixelle-Video-main")

SCRIPTS_CONFIG = [
    {
        "file": "Script_1_一人AI公司.md",
        "title": "10 Chinese Solo Devs $250K",
        "intent": "10 Chinese solo developers built AI products making $250K+ combined. Inspiring story for indie hackers.",
        "duration": 60,
        "assets_needed": 4,
    },
    {
        "file": "Script_2_YouTube自动化.md",
        "title": "2 AI Agents 4 Channels 1.3M Subs",
        "intent": "How a Chinese creator automated 4 YouTube channels with 2 AI agents reaching 1.3M subscribers.",
        "duration": 60,
        "assets_needed": 4,
    },
    {
        "file": "Script_3_AI代写.md",
        "title": "AI Writing Service $700 to $14K",
        "intent": "A 24-year-old scaled an AI writing service from $700 to $14K/month in 7 months through business model innovation.",
        "duration": 60,
        "assets_needed": 4,
    },
]

import subprocess
import json

def get_video_duration(path: str) -> float:
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", path],
            capture_output=True, text=True, timeout=15
        )
        return float(result.stdout.strip())
    except:
        return 0

def pick_best_assets(assets_dir: Path, count: int) -> list:
    supported = {".mp4", ".mov", ".avi", ".webm", ".jpg", ".jpeg", ".png"}
    videos = [str(f) for f in sorted(assets_dir.iterdir()) if f.suffix.lower() in supported]
    # 按时长排序，取最长的
    with_duration = [(v, get_video_duration(v)) for v in videos]
    with_duration.sort(key=lambda x: x[1], reverse=True)
    picked = with_duration[:count]
    print(f"  挑选了 {count} 个最长素材:")
    for p, d in picked:
        print(f"    {Path(p).name} ({d:.1f}s)")
    return [p[0] for p in picked]


async def generate_one(cfg, assets, index):
    script_path = SCRIPTS_DIR / cfg["file"]
    if not script_path.exists():
        print(f"[{index}] 脚本不存在: {script_path}")
        return None

    original_dir = os.getcwd()
    os.chdir(str(PIXELLE_DIR))
    sys.path.insert(0, str(PIXELLE_DIR))

    try:
        from pixelle_video import pixelle_video
        from pixelle_video.pipelines.asset_based import AssetBasedPipeline

        print(f"\n{'='*60}")
        print(f"  [{index}/3] 生成: {cfg['title']}")
        print(f"  脚本: {cfg['file']}")
        print(f"{'='*60}")

        await pixelle_video.initialize()
        pipeline = AssetBasedPipeline(pixelle_video)

        result = await pipeline(
            assets=assets,
            video_title=cfg["title"],
            intent=cfg["intent"],
            duration=cfg["duration"],
            source="selfhost",
        )

        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        if result.final_video_path:
            video_name = f"Test_{index}_{cfg['file'].replace('.md', '')}.mp4"
            final_output = OUTPUT_DIR / video_name
            import shutil
            shutil.copy(result.final_video_path, str(final_output))
            print(f"  [OK] 已保存: {final_output}")
            return str(final_output)
        else:
            print(f"  [FAIL] 没有输出文件")
            return None
    except Exception as e:
        import traceback
        traceback.print_exc()
        return None
    finally:
        os.chdir(original_dir)


async def main():
    print("=" * 60)
    print("  Pixelle-Video 快速测试 (3个视频)")
    print("=" * 60)

    total_needed = sum(c["assets_needed"] for c in SCRIPTS_CONFIG)
    print(f"\n需要 {total_needed} 个不重复素材 (3个脚本 x 4个/个)")

    # 一次性挑出最长的N个素材
    supported = {".mp4", ".mov", ".avi", ".webm", ".jpg", ".jpeg", ".png"}
    all_videos = [str(f) for f in sorted(ASSETS_DIR.iterdir()) if f.suffix.lower() in supported]
    with_duration = [(v, get_video_duration(v)) for v in all_videos]
    with_duration.sort(key=lambda x: x[1], reverse=True)
    best = with_duration[:total_needed * 2]  # 多挑一些备用
    picked = best[:total_needed]

    print(f"\n挑选了 {len(picked)} 个最长素材:")
    for p, d in picked:
        print(f"  {Path(p).name} ({d:.1f}s)")

    all_assets = [p[0] for p in picked]

    # 分配素材：每个脚本4个
    offset = 0
    for i, cfg in enumerate(SCRIPTS_CONFIG, 1):
        script_assets = all_assets[offset:offset + cfg["assets_needed"]]
        offset += cfg["assets_needed"]
        print(f"\n  视频{i} ({cfg['title']}) 分配素材:")
        for a in script_assets:
            print(f"    {Path(a).name}")
        await generate_one(cfg, script_assets, i)

    print(f"\n{'='*60}")
    print(f"  全部完成! 视频保存在: {OUTPUT_DIR}")
    print(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(main())
