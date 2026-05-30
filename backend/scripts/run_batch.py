"""Simple batch runner — imports generate_article directly, avoids subprocess."""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

# Ensure backend is importable
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Load .env before any app imports
from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from scripts.generate_article import generate_article

TOPICS_PATH = BACKEND_DIR / "scripts" / "article_topics.json"
DELAY_SECONDS = 5  # extra delay between articles to avoid rate limits


def main():
    if not TOPICS_PATH.exists():
        print(f"[run_batch] ERROR: {TOPICS_PATH} not found", file=sys.stderr)
        sys.exit(1)

    with open(TOPICS_PATH, "r", encoding="utf-8") as f:
        topics = json.load(f)

    if not isinstance(topics, list):
        print(f"[run_batch] ERROR: Expected JSON array, got {type(topics).__name__}", file=sys.stderr)
        sys.exit(1)

    print(f"[run_batch] Generating {len(topics)} articles...")
    success = 0
    failure = 0

    for i, item in enumerate(topics):
        topic = item.get("topic", "")
        category = item.get("category", "bazi-guide")
        keywords = item.get("keywords", "")

        if not topic:
            print(f"[run_batch] WARNING: Skipping item {i} — no topic")
            continue

        print(f"\n{'='*60}")
        print(f"[run_batch] [{i+1}/{len(topics)}] {topic}")
        print(f"[run_batch]    Category: {category}")
        print(f"{'='*60}")

        result = generate_article(
            topic=topic,
            category=category,
            keywords=keywords,
            dry_run=False,
        )

        if result is None:
            failure += 1
        else:
            success += 1

        # Delay between articles (not after the last one)
        if i < len(topics) - 1:
            wait = DELAY_SECONDS + 2  # base + buffer
            print(f"[run_batch] Waiting {wait}s...")
            time.sleep(wait)

    print(f"\n{'='*60}")
    print(f"[run_batch] Done. {success} succeeded, {failure} failed.")
    print(f"{'='*60}")

    # Trigger sitemap regeneration
    if success > 0:
        sitemap_script = BACKEND_DIR.parent / "frontend" / "scripts" / "generate-sitemap.cjs"
        if sitemap_script.exists():
            print("[run_batch] Regenerating sitemap...")
            import subprocess
            subprocess.run(["node", str(sitemap_script)], cwd=str(sitemap_script.parent))
        else:
            print(f"[run_batch] WARNING: sitemap script not found at {sitemap_script}")


if __name__ == "__main__":
    main()
