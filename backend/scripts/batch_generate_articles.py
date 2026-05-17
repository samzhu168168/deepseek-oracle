"""Batch generation of SEO articles from a topics JSON file.

Usage:
  python backend/scripts/batch_generate_articles.py --input article_topics.json

The input JSON should be an array of objects:
  [{"topic": "...", "category": "...", "keywords": "..."}, ...]
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Batch generate SEO articles from topics JSON")
    parser.add_argument("--input", required=True, help="Path to JSON file with article topics")
    parser.add_argument("--delay", type=int, default=3, help="Seconds between API calls (default: 3)")
    parser.add_argument("--dry-run", action="store_true", help="Preview without saving")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"[batch] ERROR: Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        topics = json.load(f)

    if not isinstance(topics, list):
        print(f"[batch] ERROR: Input must be a JSON array, got {type(topics).__name__}", file=sys.stderr)
        sys.exit(1)

    script_dir = Path(__file__).resolve().parent
    generator = script_dir / "generate_article.py"

    print(f"[batch] Generating {len(topics)} articles...")
    success = 0
    failure = 0

    for i, item in enumerate(topics):
        topic = item.get("topic", "")
        category = item.get("category", "bazi-guide")
        keywords = item.get("keywords", "")

        if not topic:
            print(f"[batch] WARNING: Skipping item {i} — no topic")
            continue

        print(f"\n[batch] [{i + 1}/{len(topics)}] {topic}")
        print(f"[batch]    Category: {category}")

        cmd = [
            sys.executable,
            str(generator),
            "--topic", topic,
            "--category", category,
        ]
        if keywords:
            cmd.extend(["--keywords", keywords])
        if args.dry_run:
            cmd.append("--dry-run")

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            print(result.stdout)
            if result.returncode != 0:
                print(f"[batch] ERROR: {result.stderr}", file=sys.stderr)
                failure += 1
            else:
                success += 1
        except subprocess.TimeoutExpired:
            print(f"[batch] ERROR: Timed out after 120s for: {topic}", file=sys.stderr)
            failure += 1
        except Exception as e:
            print(f"[batch] ERROR: {e}", file=sys.stderr)
            failure += 1

        if i < len(topics) - 1 and not args.dry_run:
            print(f"[batch] Waiting {args.delay}s before next request...")
            time.sleep(args.delay)

    print(f"\n[batch] Done. {success} succeeded, {failure} failed.")

    # Trigger sitemap regeneration if any articles were created
    if success > 0 and not args.dry_run:
        repo_root = Path(__file__).resolve().parent.parent.parent
        sitemap_script = repo_root / "frontend" / "scripts" / "generate-sitemap.cjs"
        if sitemap_script.exists():
            print("[batch] Regenerating sitemap...")
            subprocess.run(["node", str(sitemap_script)], cwd=repo_root / "frontend")
        else:
            print(f"[batch] WARNING: sitemap script not found at {sitemap_script}")


if __name__ == "__main__":
    main()
