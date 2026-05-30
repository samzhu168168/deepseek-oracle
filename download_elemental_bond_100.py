"""
Elemental Bond — 精准素材下载器 v5
目标：100个与 elemental.bond 高度匹配的竖屏素材
主题：BaZi五行 × 感情模式 × 灵性觉醒 × 美国女性审美

用法：python download_elemental_bond_100.py
输出：F:\MyTraeProjects\ElementalBond\素材\elemental\
"""

import os, json, time, sys, subprocess, tempfile, urllib.parse

PEXELS_API_KEY = "6ZODECxSD2hZWiqtCuRpqFNKNkxFpals5IfVx5X9IE8P6PZ1CcXDSH1o"
BASE_DIR = r"F:\MyTraeProjects\ElementalBond"
ASSETS_DIR = os.path.join(BASE_DIR, "素材", "elemental")
TARGET_COUNT = 100
DELAY = 1.2

os.makedirs(ASSETS_DIR, exist_ok=True)

# ═══════════════════════════════════════════════════════
# 100个精准搜索词 — 按主题分组，完全为 elemental.bond 定制
# ═══════════════════════════════════════════════════════
SEARCHES = [

    # ── 主题1：五行·火 Fire（12个）──
    # 对应脚本：#01吸引错的人 #08太强烈 #14Fire元素 #29水火相克
    ("candle flame close up", 2),
    ("fire burning dark background", 2),
    ("sunset golden hour woman", 2),
    ("bonfire night sparks", 2),
    ("phoenix fire abstract", 2),
    ("red orange light bokeh", 2),

    # ── 主题2：五行·水 Water（12个）──
    # 对应脚本：#02感情冷 #10Water元素 #16蛇年运势 #21深水孤独
    ("ocean waves slow motion", 2),
    ("rain window drops", 2),
    ("woman underwater serene", 2),
    ("river forest reflection", 2),
    ("deep blue ocean", 2),
    ("tears close up emotional", 2),

    # ── 主题3：五行·木 Wood（10个）──
    # 对应脚本：#03被抛弃循环 #13太快坠入 #19Wood元素
    ("forest sunlight rays", 2),
    ("cherry blossom pink", 2),
    ("green leaves wind slow", 2),
    ("bamboo forest zen", 2),
    ("woman nature flowers", 2),

    # ── 主题4：五行·土 Earth（8个）──
    # 对应脚本：#06混乱关系 #12Earth元素 #25稳固基础
    ("mountain mist ethereal", 2),
    ("desert sand dunes sunset", 2),
    ("earth clay hands", 2),
    ("stone zen garden", 2),

    # ── 主题5：五行·金 Metal（8个）──
    # 对应脚本：#07暧昧关系 #11Metal元素 #17Metal运势
    ("crystal clear sparkle", 2),
    ("silver metallic abstract", 2),
    ("geometric shapes gold", 2),
    ("autumn leaves falling", 2),

    # ── 主题6：感情模式·吸引与循环（14个）──
    # 核心TikTok hook："Why you keep attracting the same type"
    ("couple silhouette sunset", 2),
    ("woman alone thinking window", 2),
    ("hands reaching touch", 2),
    ("two people distance apart", 2),
    ("woman looking mirror reflection", 2),
    ("lonely woman city night", 2),
    ("couple back to back", 2),

    # ── 主题7：灵性·宇宙·命运（12个）──
    # 对应 BaZi 八字/命理核心人设
    ("stars milky way timelapse", 2),
    ("moon night mystical", 2),
    ("aurora borealis night", 2),
    ("tarot cards hand", 2),
    ("zodiac stars abstract", 2),
    ("cosmic universe galaxy", 2),

    # ── 主题8：内省·疗愈·觉醒（12个）──
    # 对应产品：Pattern Breaker Workbook / 付费报告
    ("woman meditation sunrise", 2),
    ("yoga woman golden hour", 2),
    ("woman journaling writing", 2),
    ("woman reading book cozy", 2),
    ("self reflection calm", 2),
    ("morning ritual woman", 2),

    # ── 主题9：情绪·共鸣·疗愈（12个）──
    # TikTok 最高互动类型：情感共鸣画面
    ("woman crying rain emotional", 2),
    ("woman smiling free nature", 2),
    ("hug close warm embrace", 2),
    ("woman dancing alone free", 2),
    ("broken heart abstract", 2),
    ("woman walking away silhouette", 2),
]

# ═══════════════════════════════════════
# 工具函数
# ═══════════════════════════════════════

def find_portrait(video_files):
    best, best_q = None, 0
    for vf in video_files:
        w, h = vf.get("width", 0), vf.get("height", 0)
        if w >= h:
            continue
        q = w * h
        if w >= 540 and q > best_q:
            best_q, best = q, vf
    return best

def get_fname(video):
    vid_id = video["id"]
    dur = video.get("duration", 0)
    vf = find_portrait(video.get("video_files", []))
    if vf:
        return f"pexels_{vid_id}_{vf['width']}x{vf['height']}_{dur}s.mp4"
    return f"pexels_{vid_id}_{dur}s.mp4"

def already_have(fname):
    p = os.path.join(ASSETS_DIR, fname)
    return os.path.exists(p) and os.path.getsize(p) > 50_000

# ═══════════════════════════════════════
# 下载引擎（三重备用）
# ═══════════════════════════════════════

def do_search_requests(query, n):
    import requests, urllib3
    urllib3.disable_warnings()
    r = requests.get(
        "https://api.pexels.com/videos/search",
        headers={"Authorization": PEXELS_API_KEY},
        params={"query": query, "per_page": n + 5, "orientation": "portrait"},
        timeout=30, verify=False
    )
    return r.json().get("videos", []) if r.status_code == 200 else []

def do_search_curl(query, n):
    url = f"https://api.pexels.com/videos/search?{urllib.parse.urlencode({'query':query,'per_page':n+5,'orientation':'portrait'})}"
    tmp = os.path.join(tempfile.gettempdir(), f"px_{int(time.time())}.json")
    subprocess.run(["curl.exe","-s","-o",tmp,"-H",f"Authorization: {PEXELS_API_KEY}",
                    "--insecure","--max-time","30",url], timeout=35, capture_output=True)
    if not os.path.exists(tmp): return []
    with open(tmp) as f: data = json.load(f)
    os.remove(tmp)
    return data.get("videos", [])

def search_videos(query, n):
    try:
        import requests
        return do_search_requests(query, n)
    except:
        pass
    try:
        return do_search_curl(query, n)
    except:
        return []

def download_file_requests(url, fpath):
    import requests, urllib3
    urllib3.disable_warnings()
    r = requests.get(url, timeout=120, verify=False)
    if r.status_code == 200 and len(r.content) > 50_000:
        with open(fpath, "wb") as f: f.write(r.content)
        return True
    return False

def download_file_curl(url, fpath):
    subprocess.run(["curl.exe","-s","-o",fpath,"-L","--insecure","--max-time","120",url],
                   timeout=130, capture_output=True)
    return os.path.exists(fpath) and os.path.getsize(fpath) > 50_000

def download_file(url, fpath):
    try:
        import requests
        return download_file_requests(url, fpath)
    except:
        pass
    return download_file_curl(url, fpath)

# ═══════════════════════════════════════
# 主流程
# ═══════════════════════════════════════

if __name__ == "__main__":
    existing = [f for f in os.listdir(ASSETS_DIR) if f.endswith(".mp4")]
    print(f"""
╔══════════════════════════════════════════════════╗
║  Elemental Bond — 精准素材下载器 v5              ║
║  主题：BaZi五行 × 感情模式 × 灵性觉醒           ║
║  目标：{TARGET_COUNT}个新素材                              ║
║  输出：素材/elemental/ 文件夹                    ║
╚══════════════════════════════════════════════════╝

当前已有：{len(existing)} 个素材
目标新增：{TARGET_COUNT} 个
""")

    total = 0
    theme_map = {
        0: "🔥 Fire",    6: "💧 Water",  12: "🌲 Wood",
        17: "⛰️  Earth", 21: "💎 Metal", 25: "💔 感情模式",
        32: "✨ 宇宙灵性", 38: "🧘 内省疗愈", 44: "💞 情绪共鸣"
    }

    for idx, (query, want) in enumerate(SEARCHES):
        if total >= TARGET_COUNT:
            break
        need = min(want, TARGET_COUNT - total)

        if idx in theme_map:
            print(f"\n  {theme_map[idx]}")

        print(f"  [{total:3d}/{TARGET_COUNT}] {query!r:<35}", end=" ", flush=True)

        videos = search_videos(query, need)
        if not videos:
            print("× 无结果")
            time.sleep(DELAY)
            continue

        got = 0
        for video in videos:
            if got >= need: break
            if video.get("duration", 0) < 5: continue
            vf = find_portrait(video.get("video_files", []))
            if not vf: continue

            fname = get_fname(video)
            fpath = os.path.join(ASSETS_DIR, fname)

            if already_have(fname):
                got += 1; print("↩", end="", flush=True); continue

            url = vf.get("link", "")
            if not url: continue

            if download_file(url, fpath):
                got += 1; total += 1; print("✓", end="", flush=True)
            else:
                print("✗", end="", flush=True)
                if os.path.exists(fpath): os.remove(fpath)

            time.sleep(DELAY)

        print(f"  +{got}")

    # 最终报告
    final = [f for f in os.listdir(ASSETS_DIR) if f.endswith(".mp4")]
    size_mb = sum(os.path.getsize(os.path.join(ASSETS_DIR, f)) for f in final) / 1024 / 1024
    p1080 = len([f for f in final if "1080" in f])
    p2160 = len([f for f in final if "2160" in f])

    print(f"""
{'='*52}
✅ 下载完成！
   本次新增: {total} 个
   素材总计: {len(final)} 个 ({size_mb:.0f}MB)
   1080p:  {p1080} 个  |  4K: {p2160} 个
   位置: {os.path.abspath(ASSETS_DIR)}

📋 素材主题分布（用于视频生产）:
   🔥 Fire 类     → 脚本 #01 #08 #14 #29
   💧 Water 类    → 脚本 #02 #10 #16 #21
   🌲 Wood 类     → 脚本 #03 #13 #19
   ⛰️  Earth 类   → 脚本 #06 #12 #25
   💎 Metal 类    → 脚本 #07 #11 #17
   💔 感情模式类  → 脚本 #01-#05 hook画面
   ✨ 宇宙灵性类  → 脚本 #26-#30 命理背景
   🧘 内省疗愈类  → 产品购买转化前素材
   💞 情绪共鸣类  → TikTok高互动画面
{'='*52}
""")
    if total == 0:
        print("⚠️  下载失败 — 请检查代理设置")
        print("   确认 V2RayN 已开启全局模式，端口 6525")
        print("   然后重新运行此脚本")
