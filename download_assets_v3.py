"""
Elemental Bond — Pexels 素材下载器 v3
完全重写，更健壮的错误处理，解决 SSL 和 API 兼容问题

用法: python download_assets_v3.py

如果提示缺少 requests 库：
  pip install requests
"""

import os
import json
import time
import sys

# ===== 配置 =====
PEXELS_API_KEY = "6ZODECxSD2hZWiqtCuRpqFNKNkxFpals5IfVx5X9IE8P6PZ1CcXDSH1o"
ASSETS_DIR = os.path.join(os.path.dirname(__file__), "素材")
TARGET_COUNT = 50
DELAY_SEC = 1.0

os.makedirs(ASSETS_DIR, exist_ok=True)

# ===== 五类爆款搜索词（按五行×情绪分类）=====
SEARCHES = [
    # --- Fire 火 ---
    ("candle flame", 3),
    ("sunset golden", 3),
    ("fire dancing", 2),
    # --- Water 水 ---
    ("ocean waves", 3),
    ("rain drops", 3),
    ("river water", 2),
    # --- Wood 木 ---
    ("forest nature", 3),
    ("trees wind", 2),
    ("green leaves", 2),
    # --- Earth 土 ---
    ("mountain landscape", 3),
    ("desert sand", 2),
    ("aerial nature", 2),
    # --- Metal 金 ---
    ("crystals minerals", 2),
    ("golden sparkle bokeh", 2),
    ("geometric shapes", 2),
    # --- 灵性/宇宙 ---
    ("stars sky night", 3),
    ("moon night", 2),
    ("aurora borealis", 2),
    # --- 冥想/情绪 ---
    ("meditation woman", 3),
    ("silhouette sunset", 2),
    ("sad woman moody", 2),
    ("lonely bench", 2),
    # --- 抽象氛围 ---
    ("smoke fog dark", 2),
    ("twilight sky", 2),
    ("light glow bokeh", 2),
]

# ──────────────────────────────────────
# 方案 A：用 requests（推荐）
# ──────────────────────────────────────

def try_requests_download():
    """用 requests 库下载（需要 pip install requests）"""
    try:
        import requests
    except ImportError:
        return False

    print("📦 使用 requests 库\n")
    total = 0

    for query, want in SEARCHES:
        if total >= TARGET_COUNT:
            break
        need = min(want, TARGET_COUNT - total)

        print(f"\n🔍 [{total+1}/{TARGET_COUNT}] 搜索: '{query}' (想要{need}个)")

        try:
            url = f"https://api.pexels.com/videos/search"
            params = {
                "query": query,
                "per_page": need + 5,
                "orientation": "portrait",
            }

            resp = requests.get(
                url,
                headers={"Authorization": PEXELS_API_KEY},
                params=params,
                timeout=30,
            )

            if resp.status_code != 200:
                print(f"  ❌ API 返回 {resp.status_code}: {resp.text[:100]}")
                time.sleep(DELAY_SEC)
                continue

            data = resp.json()
            videos = data.get("videos", [])

            if not videos:
                print(f"  ⚠ 无结果")
                continue

            got = 0
            for video in videos:
                if got >= need:
                    break

                vid_id = video["id"]
                duration = video.get("duration", 0)
                if duration < 5:
                    continue

                # 找最佳竖屏视频文件
                best = None
                best_q = 0
                for vf in video.get("video_files", []):
                    w = vf.get("width", 0) or 0
                    h = vf.get("height", 0) or 0
                    if w >= h:  # 跳过横屏
                        continue
                    q = w * h
                    if w >= 640 and q > best_q:
                        best_q = q
                        best = vf

                if not best:
                    continue

                file_url = best.get("link")
                if not file_url:
                    continue

                w = best.get("width", 0)
                h = best.get("height", 0)
                fname = f"pexels_{vid_id}_{w}x{h}_{duration}s.mp4"
                fpath = os.path.join(ASSETS_DIR, fname)

                if os.path.exists(fpath) and os.path.getsize(fpath) > 50000:
                    print(f"  ✓ 已有: {fname}")
                    got += 1
                    continue

                print(f"  ↓ 下载 {w}x{h} {duration}s ...", end=" ", flush=True)
                try:
                    r = requests.get(file_url, timeout=120)
                    if r.status_code == 200 and len(r.content) > 50000:
                        with open(fpath, "wb") as f:
                            f.write(r.content)
                        mb = len(r.content) / 1024 / 1024
                        print(f"{mb:.1f}MB ✅")
                        got += 1
                        total += 1
                    else:
                        print(f"失败(大小{len(r.content)}B)")
                except Exception as e:
                    print(f"失败: {str(e)[:40]}")

                time.sleep(DELAY_SEC)

        except Exception as e:
            print(f"  错误: {str(e)[:80]}")
            time.sleep(DELAY_SEC)

    print(f"\n{'='*50}")
    print(f"📊 完成！共下载 {total} 个新素材")
    print(f"素材位置: {os.path.abspath(ASSETS_DIR)}")
    return True


# ──────────────────────────────────────
# 方案 B：用 urllib（无需额外安装）
# ──────────────────────────────────────

def try_urllib_download():
    """用 Python 内置 urllib（不依赖外部包）"""
    import urllib.request
    import urllib.parse
    import ssl

    # 创建不验证 SSL 的上下文
    ctx = ssl._create_unverified_context()

    print("📦 使用 urllib（内置库）\n")
    total = 0

    for query, want in SEARCHES:
        if total >= TARGET_COUNT:
            break
        need = min(want, TARGET_COUNT - total)

        print(f"\n🔍 [{total+1}/{TARGET_COUNT}] 搜索: '{query}' (想要{need}个)")

        try:
            params = urllib.parse.urlencode({
                "query": query,
                "per_page": need + 5,
                "orientation": "portrait",
            })
            url = f"https://api.pexels.com/videos/search?{params}"

            req = urllib.request.Request(
                url,
                headers={"Authorization": PEXELS_API_KEY, "User-Agent": "Mozilla/5.0"},
            )

            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                data = json.loads(resp.read().decode())

            videos = data.get("videos", [])
            if not videos:
                print(f"  ⚠ 无结果")
                time.sleep(DELAY_SEC)
                continue

            got = 0
            for video in videos:
                if got >= need:
                    break

                vid_id = video["id"]
                duration = video.get("duration", 0)
                if duration < 5:
                    continue

                best = None
                best_q = 0
                for vf in video.get("video_files", []):
                    w = vf.get("width", 0) or 0
                    h = vf.get("height", 0) or 0
                    if w >= h:
                        continue
                    q = w * h
                    if w >= 640 and q > best_q:
                        best_q = q
                        best = vf

                if not best:
                    continue

                file_url = best.get("link")
                if not file_url:
                    continue

                w = best.get("width", 0)
                h = best.get("height", 0)
                fname = f"pexels_{vid_id}_{w}x{h}_{duration}s.mp4"
                fpath = os.path.join(ASSETS_DIR, fname)

                if os.path.exists(fpath) and os.path.getsize(fpath) > 50000:
                    print(f"  ✓ 已有: {fname}")
                    got += 1
                    continue

                print(f"  ↓ 下载 {w}x{h} {duration}s ...", end=" ", flush=True)
                try:
                    file_req = urllib.request.Request(
                        file_url,
                        headers={"User-Agent": "Mozilla/5.0"},
                    )
                    with urllib.request.urlopen(file_req, context=ctx, timeout=120) as fr:
                        data = fr.read()
                    if len(data) > 50000:
                        with open(fpath, "wb") as f:
                            f.write(data)
                        mb = len(data) / 1024 / 1024
                        print(f"{mb:.1f}MB ✅")
                        got += 1
                        total += 1
                    else:
                        print(f"太小({len(data)}B)")
                except Exception as e:
                    print(f"失败: {str(e)[:60]}")

                time.sleep(DELAY_SEC)

        except urllib.error.HTTPError as e:
            print(f"  ❌ HTTP {e.code}: {e.reason}")
            body = e.read().decode() if hasattr(e, 'read') else ""
            if body:
                print(f"     响应: {body[:200]}")
        except Exception as e:
            print(f"  错误: {str(e)[:80]}")

        time.sleep(DELAY_SEC)

    print(f"\n{'='*50}")
    print(f"📊 完成！共下载 {total} 个新素材")
    return True


# ──────────────────────────────────────
# 主入口
# ──────────────────────────────────────

if __name__ == "__main__":
    print(f"""
╔══════════════════════════════════════════╗
║  Elemental Bond — Pexels 素材批量下载器  ║
║  目标: 50 个竖屏素材到 素材/ 文件夹       ║
╚══════════════════════════════════════════╝
""")

    # 检查现有素材
    existing = [f for f in os.listdir(ASSETS_DIR) if f.endswith('.mp4')]
    total_size = sum(os.path.getsize(os.path.join(ASSETS_DIR, f)) for f in existing) / 1024 / 1024
    print(f"📊 当前素材: {len(existing)} 个, 共 {total_size:.0f} MB\n")

    # 先试 requests，不行再用 urllib
    success = try_requests_download()
    if not success:
        print("\n⚠  requests 不可用，改用内置 urllib...\n")
        try_urllib_download()
