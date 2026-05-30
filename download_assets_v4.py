"""
Elemental Bond — Pexels 素材下载器 v4
修复: SSL握手超时问题 + import sys缺失

运行方式: python download_assets_v4.py

如果 Python 直接连 Pexels 不通，会自动尝试:
  方案A: requests (verify=False)
  方案B: urllib (不验证SSL)
  方案C: curl.exe (Windows自带, 自动走系统代理)
"""

import os
import json
import time
import sys
import subprocess
import tempfile

PEXELS_API_KEY = "6ZODECxSD2hZWiqtCuRpqFNKNkxFpals5IfVx5X9IE8P6PZ1CcXDSH1o"
ASSETS_DIR = os.path.join(os.path.dirname(__file__), "素材")
TARGET_COUNT = 50
DELAY = 1.0

os.makedirs(ASSETS_DIR, exist_ok=True)

SEARCHES = [
    ("candle flame", 3), ("sunset golden hour", 3), ("fire flame dark", 2),
    ("ocean waves", 3), ("rain drops", 3), ("river water", 2),
    ("forest nature", 3), ("trees wind", 2), ("green leaves", 2),
    ("mountain landscape", 3), ("desert sand", 2), ("aerial nature", 2),
    ("crystals minerals", 2), ("golden sparkle", 2), ("geometric abstract", 2),
    ("stars sky night", 3), ("moon night", 2), ("aurora borealis", 2),
    ("meditation woman", 3), ("silhouette sunset", 2), ("sad woman moody", 2),
    ("lonely bench", 2), ("smoke fog dark", 2), ("twilight sky", 2),
    ("light glow bokeh", 2),
]


def find_hd_portrait(video_files):
    """从视频文件列表中找最佳竖屏HD文件"""
    best = None
    best_q = 0
    for vf in video_files:
        w = vf.get("width") or 0
        h = vf.get("height") or 0
        if w >= h:  # 跳过横屏
            continue
        q = w * h
        if w >= 640 and q > best_q:
            best_q = q
            best = vf
    return best


def get_filename(video):
    """生成标准文件名"""
    vid_id = video["id"]
    duration = video.get("duration", 0)
    best = find_hd_portrait(video.get("video_files", []))
    if best:
        w, h = best.get("width", 0), best.get("height", 0)
        return f"pexels_{vid_id}_{w}x{h}_{duration}s.mp4"
    return f"pexels_{vid_id}_{duration}s.mp4"


# ═══════════════════════════════════════
# 方案A: 用 requests (verify=False)
# ═══════════════════════════════════════

def download_with_requests():
    """用 requests 库, 关闭SSL验证 (解决代理SSL问题)"""
    try:
        import requests
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    except ImportError:
        return 0

    print("\n📦 方案A: requests + SSL verify=False")
    total = 0

    for query, want in SEARCHES:
        if total >= TARGET_COUNT:
            break
        need = min(want, TARGET_COUNT - total)

        print(f"  [{total+1}/{TARGET_COUNT}] '{query}' ...", end=" ", flush=True)

        try:
            resp = requests.get(
                "https://api.pexels.com/videos/search",
                headers={"Authorization": PEXELS_API_KEY},
                params={"query": query, "per_page": need + 5, "orientation": "portrait"},
                timeout=30,
                verify=False,
            )

            if resp.status_code != 200:
                print(f"HTTP {resp.status_code}")
                time.sleep(DELAY)
                continue

            data = resp.json()
            videos = data.get("videos", [])

            if not videos:
                print("无结果")
                time.sleep(DELAY)
                continue

            got = 0
            for video in videos:
                if got >= need:
                    break
                if video.get("duration", 0) < 5:
                    continue
                best = find_hd_portrait(video.get("video_files", []))
                if not best:
                    continue

                file_url = best.get("link")
                if not file_url:
                    continue

                fname = get_filename(video)
                fpath = os.path.join(ASSETS_DIR, fname)

                if os.path.exists(fpath) and os.path.getsize(fpath) > 50000:
                    got += 1
                    continue

                try:
                    r = requests.get(file_url, timeout=120, verify=False)
                    if r.status_code == 200 and len(r.content) > 50000:
                        with open(fpath, "wb") as f:
                            f.write(r.content)
                        got += 1
                        total += 1
                        print(f"✓", end="", flush=True)
                    else:
                        print(f"×({len(r.content)}b)", end="", flush=True)
                except:
                    print(f"✗", end="", flush=True)

                time.sleep(DELAY)

            print(f" ({got}个)")

        except Exception as e:
            print(f"失败: {str(e)[:60]}")
            time.sleep(DELAY)

    return total


# ═══════════════════════════════════════
# 方案B: 用 curl.exe (Windows自带, 走系统代理)
# ═══════════════════════════════════════

def download_with_curl():
    """用 Windows 自带的 curl.exe, 自动走系统代理"""
    print("\n📦 方案B: curl.exe (Windows原生, 自动走代理)")

    # 检查 curl 是否可用
    try:
        subprocess.run(["curl", "--version"], capture_output=True, timeout=5)
    except:
        print("  curl.exe 不可用")
        return 0

    total = 0

    for query, want in SEARCHES:
        if total >= TARGET_COUNT:
            break
        need = min(want, TARGET_COUNT - total)

        print(f"  [{total+1}/{TARGET_COUNT}] '{query}' ...", end=" ", flush=True)

        # 搜索API
        import urllib.parse
        url = f"https://api.pexels.com/videos/search?{urllib.parse.urlencode({'query': query, 'per_page': need + 5, 'orientation': 'portrait'})}"

        tmp_file = os.path.join(tempfile.gettempdir(), f"pexels_search_{int(time.time())}.json")

        try:
            subprocess.run([
                "curl.exe", "-s", "-o", tmp_file,
                "-H", f"Authorization: {PEXELS_API_KEY}",
                "--max-time", "30",
                "--insecure",  # 跳过SSL验证
                url,
            ], timeout=35, capture_output=True)

            if not os.path.exists(tmp_file) or os.path.getsize(tmp_file) < 10:
                print("无响应")
                time.sleep(DELAY)
                continue

            with open(tmp_file, "r") as f:
                data = json.load(f)

            videos = data.get("videos", [])
            if not videos:
                print("无结果")
                time.sleep(DELAY)
                continue

            got = 0
            for video in videos:
                if got >= need:
                    break
                if video.get("duration", 0) < 5:
                    continue
                best = find_hd_portrait(video.get("video_files", []))
                if not best:
                    continue

                file_url = best.get("link")
                if not file_url:
                    continue

                fname = get_filename(video)
                fpath = os.path.join(ASSETS_DIR, fname)

                if os.path.exists(fpath) and os.path.getsize(fpath) > 50000:
                    got += 1
                    continue

                # 用 curl 下载视频文件
                try:
                    subprocess.run([
                        "curl.exe", "-s", "-o", fpath,
                        "-L", "--max-time", "120",
                        "--insecure",
                        file_url,
                    ], timeout=130, capture_output=True)

                    if os.path.exists(fpath) and os.path.getsize(fpath) > 50000:
                        got += 1
                        total += 1
                        print(f"✓", end="", flush=True)
                    else:
                        sz = os.path.getsize(fpath) if os.path.exists(fpath) else 0
                        print(f"×({sz}b)", end="", flush=True)
                        if os.path.exists(fpath):
                            os.remove(fpath)
                except:
                    print(f"✗", end="", flush=True)

                time.sleep(DELAY)

            print(f" ({got}个)")

        except Exception as e:
            print(f"失败: {str(e)[:60]}")
        finally:
            if os.path.exists(tmp_file):
                os.remove(tmp_file)
            time.sleep(DELAY)

    return total


# ═══════════════════════════════════════
# 方案C: PowerShell Invoke-WebRequest
# ═══════════════════════════════════════

def download_with_powershell():
    """用 PowerShell Invoke-WebRequest, 自动走系统代理"""
    print("\n📦 方案C: PowerShell (走系统代理)")

    total = 0

    for query, want in SEARCHES:
        if total >= TARGET_COUNT:
            break
        need = min(want, TARGET_COUNT - total)

        print(f"  [{total+1}/{TARGET_COUNT}] '{query}' ...", end=" ", flush=True)

        import urllib.parse
        url = f"https://api.pexels.com/videos/search?{urllib.parse.urlencode({'query': query, 'per_page': need + 5, 'orientation': 'portrait'})}"

        tmp_file = os.path.join(tempfile.gettempdir(), f"ps_pexels_{int(time.time())}.json")

        ps_cmd = (
            f'$r = Invoke-RestMethod -Uri "{url}" '
            f'-Headers @{{"Authorization"="{PEXELS_API_KEY}"}} '
            f'-SkipCertificateCheck -TimeoutSec 30; '
            f'$r | ConvertTo-Json -Depth 10 | Out-File "{tmp_file}" -Encoding UTF8'
        )

        try:
            subprocess.run(["powershell", "-Command", ps_cmd],
                         timeout=40, capture_output=True)

            if not os.path.exists(tmp_file) or os.path.getsize(tmp_file) < 10:
                print("无响应")
                time.sleep(DELAY)
                continue

            with open(tmp_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            videos = data.get("videos", [])
            if not videos:
                print("无结果")
                time.sleep(DELAY)
                continue

            got = 0
            for video in videos:
                if got >= need:
                    break
                if video.get("duration", 0) < 5:
                    continue
                best = find_hd_portrait(video.get("video_files", []))
                if not best:
                    continue

                file_url = best.get("link")
                if not file_url:
                    continue

                fname = get_filename(video)
                fpath = os.path.join(ASSETS_DIR, fname)

                if os.path.exists(fpath) and os.path.getsize(fpath) > 50000:
                    got += 1
                    continue

                # 用 PowerShell 下载视频
                dl_cmd = (
                    f'Invoke-WebRequest -Uri "{file_url}" '
                    f'-OutFile "{fpath}" '
                    f'-SkipCertificateCheck -TimeoutSec 120'
                )
                try:
                    subprocess.run(["powershell", "-Command", dl_cmd],
                                 timeout=130, capture_output=True)
                    if os.path.exists(fpath) and os.path.getsize(fpath) > 50000:
                        got += 1
                        total += 1
                        print(f"✓", end="", flush=True)
                    else:
                        sz = os.path.getsize(fpath) if os.path.exists(fpath) else 0
                        print(f"×({sz}b)", end="", flush=True)
                        if os.path.exists(fpath):
                            os.remove(fpath)
                except:
                    print(f"✗", end="", flush=True)

                time.sleep(DELAY)

            print(f" ({got}个)")

        except Exception as e:
            print(f"失败: {str(e)[:60]}")
        finally:
            if os.path.exists(tmp_file):
                os.remove(tmp_file)
            time.sleep(DELAY)

    return total


# ═══════════════════════════════════════
# 主入口
# ═══════════════════════════════════════

if __name__ == "__main__":
    print(f"""
╔══════════════════════════════════════════╗
║  Elemental Bond — Pexels下载器 v4       ║
║  目标: 50个竖屏素材 → 素材/ 文件夹       ║
║  自动尝试: requests → curl → PowerShell  ║
╚══════════════════════════════════════════╝
""")

    # 统计现有素材
    existing = [f for f in os.listdir(ASSETS_DIR) if f.endswith('.mp4')]
    total_size = sum(os.path.getsize(os.path.join(ASSETS_DIR, f)) for f in existing) / 1024 / 1024
    # 按分辨率分类
    hd_1080 = len([f for f in existing if '1080' in f])
    hd_2160 = len([f for f in existing if '2160' in f])
    print(f"📊 当前素材: {len(existing)} 个 ({total_size:.0f}MB)")
    print(f"   HD(1080p): {hd_1080} | UHD(4K): {hd_2160} | 其他: {len(existing)-hd_1080-hd_2160}")
    print(f"   目标新增: {TARGET_COUNT} 个\n")

    # 尝试三种方案，直到有一种成功
    total = 0

    # 方案A: requests
    if total < TARGET_COUNT:
        total = download_with_requests()

    # 方案B: curl.exe
    if total < TARGET_COUNT:
        n = download_with_curl()
        total += n

    # 方案C: PowerShell
    if total < TARGET_COUNT:
        n = download_with_powershell()
        total += n

    # 最终报告
    final = len([f for f in os.listdir(ASSETS_DIR) if f.endswith('.mp4')])
    final_size = sum(os.path.getsize(os.path.join(ASSETS_DIR, f)) for f in os.listdir(ASSETS_DIR)
                     if f.endswith('.mp4')) / 1024 / 1024

    print(f"\n{'='*50}")
    print(f"📊 完成！")
    print(f"   本次新增: {total} 个")
    print(f"   素材总计: {final} 个 ({final_size:.0f}MB)")
    print(f"   位置: {os.path.abspath(ASSETS_DIR)}")

    if total == 0:
        print(f"\n⚠️  所有下载方案都失败了。")
        print(f"   原因: 你的网络环境阻止了 Python/curl 连接到 Pexels API")
        print(f"   解决方法: 手动去 Pexels.com 下载, 或换一个网络环境运行此脚本")
