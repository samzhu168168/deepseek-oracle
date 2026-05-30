"""
Elemental Bond — 爆款素材批量下载器 v2
目标：下载50个精选竖屏素材，匹配BaZi五行×情感觉醒×占星内容

用法：
  1. 确保已安装 Python
  2. 直接运行: python download_new_assets.py
  3. 素材自动下载到当前目录下的 素材/ 文件夹

注意：本环境有网络限制无法直接运行，请在你能联网的电脑上执行
"""

import os
import json
import time
import urllib.request
import urllib.parse
import ssl

# ===== 你的 Pexels API Key =====
PEXELS_API_KEY = "6ZODECxSD2hZWiqtCuRpqFNKNkxFpals5IfVx5X9IE8P6PZ1CcXDSH1o"

# ===== 素材存放位置 =====
ASSETS_DIR = os.path.join(os.path.dirname(__file__), "素材")

# ===== 下载配置 =====
# 同时下载数（Pexels免费版限200请求/小时，200视频/小时）
BATCH_SIZE = 5
SLEEP_BETWEEN = 1.5  # 请求间隔（秒）

os.makedirs(ASSETS_DIR, exist_ok=True)

# ──────────────────────────────────────────────
# 爆款素材策略：按五行元素 + 情绪场景分类
# 每个分类搜2-3组关键词，每组下载2-5个
# 总计目标：50个
# ──────────────────────────────────────────────

SEARCH_PLAN = [
    # ═══════════════ 五行元素 ═══════════════

    # 🔥 Fire（火）— 激情、热烈、毁灭重生
    # 匹配脚本：#01吸引错的人 #04修复型 #08太强烈 #14烧完
    ("fire flame dark", 3),
    ("candle flame woman portrait", 3),
    ("sunset golden hour sky", 3),
    ("volcano lava flow", 2),  # 强烈情绪隐喻

    # 💧 Water（水）— 深度、情绪、流动、淹没
    # 匹配脚本：#02感情冷 #10Water元素 #16运势 #29水火
    ("ocean waves crashing rocks", 3),
    ("rain window glass moody", 3),
    ("river stream forest", 2),
    ("woman underwater swimming", 2),  # 情绪淹没感
    ("deep blue ocean aerial", 2),

    # 🌲 Wood（木）— 成长、扩张、被滋养
    # 匹配脚本：#03被抛弃 #13太快坠入 #19Wood
    ("forest sun rays trees", 3),
    ("leaves wind blow", 2),
    ("nature green landscape aerial", 2),
    ("plants growing time lapse", 2),

    # ⛰️ Earth（土）— 稳定、滋养、承载
    # 匹配脚本：#06混乱关系 #12Earth #19Wood
    ("mountain mist fog landscape", 3),
    ("desert sand dunes", 2),
    ("aerial view green fields", 2),

    # 🔮 Metal（金）— 边界、精致、孤独
    # 匹配脚本：#07暧昧 #11Metal #17Metal
    ("crystals gemstones", 2),
    ("geometric shapes abstract", 2),
    ("golden light sparkle bokeh", 2),

    # ═══════════════ 灵性 × 情绪 ═══════════════

    # 🌙 星空/宇宙 — 神秘感、命运感
    ("night sky stars timelapse", 3),
    ("moon cloudy night", 2),
    ("aurora borealis", 2),

    # 🧘 冥想/内省 — 自我觉察、疗愈
    ("woman meditation silhouette", 3),
    ("yoga meditation sunset", 2),
    ("alone contemplation nature", 2),

    # 💔 关系/情绪 — 亲密、分离、孤独
    # 匹配脚本：#05创伤 #20-24分手复盘
    ("couple silhouette sunset", 2),
    ("woman sad window rain", 2),
    ("lonely bench autumn leaves", 2),
    ("hands reaching touch", 2),

    # ✨ 抽象/氛围 — 通用过渡背景
    ("light leaks abstract", 2),
    ("smoke fog dark atmosphere", 2),
    ("twilight purple sky", 3),
    ("bokeh lights dark", 2),
]


def download_video(url, filepath, max_retries=2):
    """下载单个视频，带重试"""
    for attempt in range(max_retries):
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
            )
            with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
                with open(filepath, "wb") as f:
                    f.write(resp.read())
            return True
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"    重试 {attempt+1}: {str(e)[:60]}")
                time.sleep(3)
            else:
                print(f"    失败: {str(e)[:60]}")
    return False


def search_pexels(query, per_page=5):
    """搜索 Pexels 竖屏高清视频"""
    params = urllib.parse.urlencode({
        "query": query,
        "per_page": per_page,
        "orientation": "portrait",
        "min_width": 1080,
        "min_height": 1920,
    })
    url = f"https://api.pexels.com/videos/search?{params}"

    req = urllib.request.Request(
        url,
        headers={
            "Authorization": PEXELS_API_KEY,
            "User-Agent": "Mozilla/5.0",
        },
    )

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        resp = urllib.request.urlopen(req, context=ctx, timeout=30)
        return json.loads(resp.read())
    except Exception as e:
        print(f"  搜索失败 '{query[:20]}': {str(e)[:80]}")
        return None


def download_batch(query, target_count):
    """搜索并下载一组视频"""
    print(f"\n🔍 搜索: '{query}' (目标 {target_count} 个)")

    data = search_pexels(query, per_page=target_count + 5)
    if not data or "videos" not in data:
        return 0

    videos = data.get("videos", [])
    if not videos:
        print(f"  ⚠ 无结果")
        return 0

    downloaded = 0
    for video in videos:
        if downloaded >= target_count:
            break

        vid_id = video["id"]
        duration = video.get("duration", 0)
        if duration < 5:
            continue  # 太短的跳过

        # 找最高质量的竖屏视频文件（优先 HD, 优先大分辨率）
        best_file = None
        best_quality = 0
        for vf in video.get("video_files", []):
            w, h = vf.get("width", 0), vf.get("height", 0)
            quality = w * h
            # 只选竖屏（宽 < 高）且不低于 720p
            if w < h and w >= 720 and quality > best_quality:
                best_quality = quality
                best_file = vf

        if not best_file:
            continue

        file_url = best_file.get("link")
        if not file_url:
            continue

        # 文件名：pexels_{id}_{w}x{h}_{duration}s.mp4
        w = best_file.get("width", 0)
        h = best_file.get("height", 0)
        filename = f"pexels_{vid_id}_{w}x{h}_{duration}s.mp4"
        filepath = os.path.join(ASSETS_DIR, filename)

        if os.path.exists(filepath) and os.path.getsize(filepath) > 100000:
            print(f"  ✓ 已存在: {filename}")
            downloaded += 1
            continue

        print(f"  ↓ 下载 [{downloaded+1}/{target_count}]: {w}x{h} {duration}s", end=" ")
        sys.stdout.flush()

        success = download_video(file_url, filepath)
        if success and os.path.getsize(filepath) > 100000:
            size_mb = os.path.getsize(filepath) / 1024 / 1024
            print(f"→ {size_mb:.1f}MB ✅")
            downloaded += 1
        else:
            print("→ 文件太小或失败，跳过")
            if os.path.exists(filepath):
                os.remove(filepath)

        time.sleep(SLEEP_BETWEEN)  # 避免限流

    return downloaded


def analyze_existing():
    """分析现有素材"""
    files = [f for f in os.listdir(ASSETS_DIR) if f.lower().endswith(('.mp4', '.mov'))]

    total_size = sum(os.path.getsize(os.path.join(ASSETS_DIR, f)) for f in files) / 1024 / 1024
    hd_count = len([f for f in files if '1080' in f or '2160' in f])
    hd_1080 = len([f for f in files if '1080' in f])
    hd_2160 = len([f for f in files if '2160' in f])

    print(f"\n{'='*55}")
    print(f"📊 素材库现状分析")
    print(f"{'='*55}")
    print(f"  总数: {len(files)} 个视频")
    print(f"  总大小: {total_size:.0f} MB")
    print(f"  HD (1080p): {hd_1080} 个")
    print(f"  UHD (2160p/4K): {hd_2160} 个")

    # 按来源分类
    pexels = len([f for f in files if f.startswith('pexels_')])
    others = len(files) - pexels
    if pexels:
        print(f"  新下载(Pexels): {pexels} 个")
    if others:
        print(f"  已有素材: {others} 个")

    return len(files)


def main():
    import sys

    print(f"""
╔══════════════════════════════════════════════╗
║   Elemental Bond — 爆款素材批量下载器 v2      ║
║   目标: 50个精选竖屏素材                       ║
║   目录: {os.path.abspath(ASSETS_DIR):<30} ║
╚══════════════════════════════════════════════╝
""")

    # 1. 分析现有素材
    current_count = analyze_existing()
    print(f"\n当前素材: {current_count} 个, 目标新增 50 个")

    # 2. Pexels API Key 检查
    if PEXELS_API_KEY == "YOUR_PEXELS_API_KEY_HERE":
        print("\n❌ 请先在脚本中填写 PEXELS_API_KEY")
        return

    # 3. 开始批量下载
    print(f"\n{'='*55}")
    print(f"📥 开始批量下载 (按五行×情绪分类)")
    print(f"{'='*55}")

    total_downloaded = 0
    total_target = 50

    for query, count in SEARCH_PLAN:
        if total_downloaded >= total_target:
            break

        # 计算本批还能下载多少
        remaining = total_target - total_downloaded
        batch_target = min(count, remaining)

        n = download_batch(query, batch_target)
        total_downloaded += n
        print(f"  本批: {n} 个 | 累计: {total_downloaded}/{total_target}")

        # 每10个进度提示
        if total_downloaded % 10 == 0 and total_downloaded > 0:
            print(f"\n📈 进度: {total_downloaded}/{total_target}")

    # 4. 完成报告
    final_count = len([f for f in os.listdir(ASSETS_DIR) if f.lower().endswith(('.mp4', '.mov'))])
    total_size = sum(
        os.path.getsize(os.path.join(ASSETS_DIR, f)) / 1024 / 1024
        for f in os.listdir(ASSETS_DIR)
        if f.lower().endswith(('.mp4', '.mov'))
    )

    print(f"\n{'='*55}")
    print(f"🎉 下载完成!")
    print(f"{'='*55}")
    print(f"  新增下载: {total_downloaded} 个")
    print(f"  素材库总计: {final_count} 个视频")
    print(f"  总大小: {total_size:.0f} MB")
    print(f"  位置: {os.path.abspath(ASSETS_DIR)}")
    print(f"\n💡 提示: Pixelle-Video 会优先使用 素材/ 文件夹内的视频")
    print(f"   你可以在 Pixelle 的 visual settings 中启用本地素材模式\n")


if __name__ == "__main__":
    main()
