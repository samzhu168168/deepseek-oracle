#!/usr/bin/env python3
"""Download and extract the 518400 Zi Wei Dou Shu sample dataset (~5.5 GB)"""

import os
import sys
import json
import zipfile
from pathlib import Path
from urllib.request import urlretrieve
from concurrent.futures import ThreadPoolExecutor, as_completed

DATA_DIR = Path(__file__).parent / "ziwei_dataset"
DATA_DIR.mkdir(exist_ok=True)

FILES = [
    ("ziwei-samples-v3-part1.zip.001", "https://github.com/Renhuai123/ziwei-doushu/releases/download/v3.0-samples/ziwei-samples-v3-part1.zip.001", "1900 MB"),
    ("ziwei-samples-v3-part2.zip.002", "https://github.com/Renhuai123/ziwei-doushu/releases/download/v3.0-samples/ziwei-samples-v3-part2.zip.002", "1900 MB"),
    ("ziwei-samples-v3-part3.zip.003", "https://github.com/Renhuai123/ziwei-doushu/releases/download/v3.0-samples/ziwei-samples-v3-part3.zip.003", "1805 MB"),
]

def download_file(name, url, size_label):
    dest = DATA_DIR / name
    if dest.exists() and dest.stat().st_size > 1_000_000:
        print(f"  [SKIP] {name} exists ({dest.stat().st_size / 1024 / 1024:.0f} MB)")
        return True
    print(f"  [DOWNLOAD] {name} ({size_label})...")
    try:
        urlretrieve(url, dest)
        print(f"  [DONE] {name}")
        return True
    except Exception as e:
        print(f"  [FAIL] {name}: {e}")
        return False

def combine_and_extract():
    combined = DATA_DIR / "combined.zip"
    print("\n[COMBINE] Merging split zip files...")
    with open(combined, "wb") as out:
        for part_name, _, _ in FILES:
            path = DATA_DIR / part_name
            if not path.exists():
                print(f"  [FAIL] Missing {path}")
                return False
            out.write(path.read_bytes())
    print(f"  Combined: {combined.stat().st_size / 1024 / 1024:.0f} MB")

    print("\n[EXTRACT] Unzipping...")
    extract_dir = DATA_DIR / "samples"
    with zipfile.ZipFile(combined, "r") as zf:
        zf.extractall(extract_dir)

    json_files = list(extract_dir.rglob("*.json"))
    print(f"\n[DONE] Extracted {len(json_files)} JSON files to {extract_dir}")

    if json_files:
        with open(json_files[0], "r", encoding="utf-8") as f:
            sample = json.load(f)
        print(f"\nSample preview:")
        print(f"  Keys: {list(sample.keys())[:10]}")
        print(f"  Palaces count: {len(sample.get('palaces', []))}")

    combined.unlink()
    print(f"\n[INFO] Dataset ready at: {extract_dir}")
    return True

def main():
    print("=" * 50)
    print("Zi Wei Dou Shu 518400 Sample Dataset Downloader")
    print("=" * 50)
    print(f"Target: {DATA_DIR}")
    print("Total: ~5.5 GB (3 parallel downloads)")
    print()

    print("[DOWNLOAD] Starting...")
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {executor.submit(download_file, n, u, s): n for n, u, s in FILES}
        for future in as_completed(futures):
            future.result()

    combine_and_extract()

if __name__ == "__main__":
    main()
