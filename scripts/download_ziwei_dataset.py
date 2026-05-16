#!/usr/bin/env python3
"""Download and extract the 518400 Zi Wei Dou Shu sample dataset (~5.5 GB)

Each "part" is a standalone zip file containing different year ranges.
Downloads with curl (resume-capable), extracts each part with 7-Zip,
then merges all into one directory.

Usage:
  python scripts/download_ziwei_dataset.py
"""

from __future__ import annotations
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent / "ziwei_dataset"
DATA_DIR.mkdir(exist_ok=True)
SAMPLES_DIR = DATA_DIR / "samples" / "ziwei-samples-toolkit" / "samples-out"

FILES: list[tuple[str, str, int]] = [
    ("ziwei-samples-v3-part1.zip.001",
     "https://github.com/Renhuai123/ziwei-doushu/releases/download/v3.0-samples/ziwei-samples-v3-part1.zip.001",
     1_900_000_000),
    ("ziwei-samples-v3-part2.zip.002",
     "https://github.com/Renhuai123/ziwei-doushu/releases/download/v3.0-samples/ziwei-samples-v3-part2.zip.002",
     1_900_000_000),
    ("ziwei-samples-v3-part3.zip.003",
     "https://github.com/Renhuai123/ziwei-doushu/releases/download/v3.0-samples/ziwei-samples-v3-part3.zip.003",
     1_900_000_000),
]

SZIP = r"C:\Program Files\7-Zip\7z.exe"


def download_with_curl(name: str, url: str, expected_size: int) -> bool:
    dest = DATA_DIR / name
    existing = dest.stat().st_size if dest.exists() else 0

    if existing >= expected_size * 0.95:
        print(f"  [SKIP] {name} ({existing / 1024 / 1024:.0f} MB, looks complete)")
        return True

    print(f"  [DOWNLOAD] {name} ({existing / 1024 / 1024:.0f} MB existing -> target ~1900 MB)")
    cmd = [
        "curl", "-L", "-o", str(dest),
        "-C", "-",
        "--retry", "5",
        "--connect-timeout", "30",
        "--max-time", "7200",
        url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=7200)
    if result.returncode not in (0, 18):  # 18 = partial transfer (acceptable)
        final_size = dest.stat().st_size if dest.exists() else 0
        if final_size > existing:
            print(f"  [PARTIAL] grew from {existing/1024/1024:.0f} MB -> {final_size/1024/1024:.0f} MB")
            return False
        print(f"  [FAIL] {name}: {result.stderr.strip()[-200:]}")
        return False
    print(f"  [DONE] {name} ({dest.stat().st_size / 1024 / 1024:.0f} MB)")
    return True


def extract_part(part_name: str) -> bool:
    """Extract one part zip into a subfolder."""
    part_path = DATA_DIR / part_name
    if not part_path.exists():
        print(f"  [SKIP] {part_name} not found")
        return False

    part_stem = part_name.replace(".zip.001", "").replace(".zip.002", "").replace(".zip.003", "")
    extract_dir = DATA_DIR / "samples" / part_stem
    extract_dir.mkdir(parents=True, exist_ok=True)

    print(f"  [EXTRACT] {part_name} -> {extract_dir.name}")
    cmd = [SZIP, "x", str(part_path), f"-o{extract_dir}", "-y"]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)

    errors = [l for l in result.stderr.splitlines() if "ERROR" in l]
    if errors:
        print(f"  [WARN] {len(errors)} CRC errors (usually 1-2 is OK)")

    return True


def merge_parts() -> int:
    """Merge all extracted parts into SAMPLES_DIR."""
    SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
    merged = 0

    for part_dir in sorted((DATA_DIR / "samples").iterdir()):
        src = part_dir / "ziwei-samples-toolkit" / "samples-out"
        if not src.exists():
            continue
        for year_dir in sorted(src.iterdir()):
            if not year_dir.is_dir():
                continue
            target = SAMPLES_DIR / year_dir.name
            target.mkdir(parents=True, exist_ok=True)
            for f in sorted(year_dir.iterdir()):
                dest = target / f.name
                if not dest.exists():
                    try:
                        f.rename(dest)
                        merged += 1
                    except OSError:
                        shutil.copy2(f, dest)
                        f.unlink()
                        merged += 1

    return merged


def main():
    print("=" * 50)
    print("Zi Wei Dou Shu 518400 Sample Dataset Downloader")
    print("=" * 50)
    print(f"Target: {DATA_DIR}")
    print()

    if not os.path.exists(SZIP):
        print(f"[ERROR] 7-Zip not found at {SZIP}")
        sys.exit(1)

    # Download all parts
    all_done = True
    for name, url, expected in FILES:
        ok = download_with_curl(name, url, expected)
        if not ok:
            all_done = False

    if not all_done:
        total = sum(
            (DATA_DIR / n).stat().st_size for n, _, _ in FILES if (DATA_DIR / n).exists()
        ) / 1024 / 1024
        print(f"\n[INFO] Downloads incomplete ({total:.0f} MB / ~5600 MB). Re-run to resume.")
        return

    # Extract each part
    print("\n[EXTRACT] Extracting each part with 7-Zip...")
    for name, _, _ in FILES:
        extract_part(name)

    # Merge all parts
    print("\n[MERGE] Merging parts into one directory...")
    count = merge_parts()
    print(f"  Merged {count} files to {SAMPLES_DIR}")

    # Count years and samples
    years = sorted(SAMPLES_DIR.iterdir()) if SAMPLES_DIR.exists() else []
    total_samples = 0
    print(f"\n[DONE] {len(years)} year directories:")
    for y in years[:5]:
        files = list(y.glob("*.jsonl.gz"))
        print(f"  {y.name}: {len(files)} files")
    if len(years) > 5:
        print(f"  ... and {len(years) - 5} more years")

    # Sample preview
    first_files = sorted(SAMPLES_DIR.glob("*/*.jsonl.gz"))
    if first_files:
        import gzip
        with gzip.open(first_files[0], "rt", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    sample = json.loads(line)
                    print(f"\nSample keys: {list(sample.keys())[:10]}")
                    print(f"Palaces: {len(sample.get('palaces', []))}")
                    break

    # Remove temp extraction dirs
    for item in (DATA_DIR / "samples").iterdir():
        if item.is_dir() and item.name.startswith("ziwei-samples-v3-part"):
            shutil.rmtree(item, ignore_errors=True)
    print("\n[INFO] Dataset ready at:", SAMPLES_DIR)


if __name__ == "__main__":
    main()
