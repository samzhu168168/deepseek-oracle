"""Zi Wei Dou Shu sample dataset loader for few-shot enhancement.

Reads the 518,400-sample ZWDS dataset (JSONL.GZ files organized by year)
and provides relevant samples for few-shot prompting.

Dataset structure (after extraction):
  scripts/ziwei_dataset/samples/ziwei-samples-toolkit/samples-out/
    year-YYYY/
      YYYY-MM.jsonl.gz   (one JSON sample per line)

Each sample has:
  {birthInfo: {year, month, day, hour, gender, longitude},
   chart: {mingGongBranch, shenGongBranch, wuxingJu, palaces: [...]},
   topics: [...],
   system: "ziweidoushu"}

Usage:
  from app.services.zwds_dataset import find_samples
  samples = find_samples(year=1990, month=5, limit=3)
"""

from __future__ import annotations
import gzip
import json
from pathlib import Path
from typing import Any

_cache: dict[str, list[dict[str, Any]]] = {}  # "year-YYYY" or "YYYY-MM" -> samples

# Try to locate samples dir at import time
_SAMPLES_OUT: Path | None = None
_for_candidates = [
    Path(__file__).parents[4] / "scripts" / "ziwei_dataset" / "samples" / "ziwei-samples-toolkit" / "samples-out",
    Path.cwd() / "scripts" / "ziwei_dataset" / "samples" / "ziwei-samples-toolkit" / "samples-out",
    Path(__file__).parents[3] / "scripts" / "ziwei_dataset" / "samples" / "ziwei-samples-toolkit" / "samples-out",
]
for _p in _for_candidates:
    if _p.exists():
        _SAMPLES_OUT = _p
        break


def _get_year_files() -> dict[str, list[Path]]:
    """Map year-YYYY -> sorted list of jsonl.gz file paths."""
    result: dict[str, list[Path]] = {}
    if not _SAMPLES_OUT or not _SAMPLES_OUT.exists():
        return result
    for year_dir in sorted(_SAMPLES_OUT.iterdir()):
        if not year_dir.is_dir() or not year_dir.name.startswith("year-"):
            continue
        files = sorted(year_dir.glob("*.jsonl.gz"))
        if files:
            result[year_dir.name] = files
    return result


def find_samples(
    year: int,
    month: int | None = None,
    limit: int = 2,
) -> list[dict[str, Any]]:
    """Find sample charts matching the given birth year (and optionally month).

    Dataset samples are stored in YYYY-MM.jsonl.gz files. This function
    loads matching files and returns random-ish samples from the first
    matching file.

    Args:
        year: Birth year (1924-2024)
        month: Optional month (1-12) for more precise matching
        limit: Max samples to return

    Returns:
        List of sample dicts, each with {birthInfo, chart, topics, system}
    """
    cache_key = f"{year:04d}-{month:02d}" if month else f"year-{year}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached[:limit]

    year_files = _get_year_files()
    files = year_files.get(f"year-{year}", [])

    # Narrow to specific month file if requested
    target: list[Path] = []
    if month and files:
        target = [f for f in files if f.stem == f"{year:04d}-{month:02d}"]
    if not target and files:
        target = files[:1]

    samples: list[dict[str, Any]] = []
    for f in target:
        try:
            with gzip.open(f, "rt", encoding="utf-8") as gz:
                for line in gz:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        samples.append(json.loads(line))
                        if len(samples) >= limit:
                            break
                    except json.JSONDecodeError:
                        continue
        except (OSError, EOFError, gzip.BadGzipFile):
            continue

    _cache[cache_key] = samples
    return samples[:limit]


def format_few_shot(sample: dict[str, Any]) -> str:
    """Format a dataset sample as few-shot prompt text.

    Extracts the chart structure in a format the LLM can reference.
    """
    chart = sample.get("chart", {})
    birth = sample.get("birthInfo", {})

    parts = [
        f"Birth: {birth.get('year', '?')}-{birth.get('month', '?'):02d}-{birth.get('day', '?'):02d} "
        f"Hour {birth.get('hour', '?')}, {birth.get('gender', '?')}",
        f"Ming Gong (命宫) Branch: {chart.get('mingGongBranch', '?')}",
        f"Shen Gong (身宫) Branch: {chart.get('shenGongBranch', '?')}",
        f"Wu Xing Ju (五行局): {chart.get('wuxingJu', '?')} ({chart.get('wuxingJuName', '')})",
    ]

    palaces = chart.get("palaces", [])
    for p in palaces[:6]:  # First 6 palaces is enough for few-shot
        stars = ", ".join(
            f"{s['name']}" + (f"({s['brightness']})" if s.get("brightness") else "")
            + (f"[{s['siHua']}]" if s.get("siHua") else "")
            for s in p.get("stars", []) if s.get("type") == "major"
        )
        minor = ", ".join(
            s["name"] for s in p.get("stars", [])
            if s.get("type") in ("lucky", "minor")
        )
        parts.append(
            f"  {p.get('name', '?')} (Branch {p.get('branch', '?')}): "
            f"Major: [{stars}] | Minor: [{minor}]"
        )

    return "\n".join(parts)

