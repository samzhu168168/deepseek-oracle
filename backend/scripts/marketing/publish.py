#!/usr/bin/env python3
"""Publish article content to Pinterest.

Usage:
  # Full workflow: generate images + publish all pins
  python -m marketing.publish --slug water-wood-bazi-compatibility

  # Dry-run (generate images only, skip API posting)
  python -m marketing.publish --slug water-wood-bazi-compatibility --dry-run

  # List available articles
  python -m marketing.publish --list-articles

  # List Pinterest boards (for initial setup)
  python -m marketing.publish --list-boards

  # Batch publish all new articles
  python -m marketing.publish --batch --dry-run

Setup:
  Add to backend/.env:
    PINTEREST_ACCESS_TOKEN=your_token
    PINTEREST_BOARD_ID=your_board_id
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
import time
from pathlib import Path

# Ensure backend is importable
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from marketing.pinterest_images import generate_pin_images
from marketing.pinterest_api import PinterestClient, PinterestError

ARTICLES_DIR = BACKEND_DIR / "app" / "data" / "articles"
METADATA_PATH = ARTICLES_DIR / "metadata.json"

SITE_URL = "https://elemental.bond"


def _load_metadata() -> list[dict]:
    if METADATA_PATH.exists():
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def _load_article(slug: str) -> dict | None:
    path = ARTICLES_DIR / f"{slug}.json"
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def list_articles():
    """List all available articles."""
    metadata = _load_metadata()
    print(f"\n{len(metadata)} articles available:\n")
    for a in metadata:
        print(f"  {a['slug']:<50} {a['title'][:50]}")
    print()


def publish_article(
    slug: str,
    board_id: str | None = None,
    client: PinterestClient | None = None,
    dry_run: bool = False,
) -> int:
    """Generate pins and publish to Pinterest.

    Returns number of pins published (or would publish).
    """
    article = _load_article(slug)
    if not article:
        print(f"✗ Article not found: {slug}")
        return 0

    title = article.get("title", slug)
    print(f"\n{'='*60}")
    print(f"Publishing: {title}")
    print(f"{'='*60}")

    # Generate images
    with tempfile.TemporaryDirectory(prefix="pinterest_") as tmpdir:
        print("\n[1/3] Generating pin images...")
        pins = generate_pin_images(article, output_dir=tmpdir)

        if not pins:
            print("✗ No pins generated")
            return 0

        if dry_run:
            print(f"\n[2/3] DRY RUN — would publish {len(pins)} pins:")
            for pin_type, img_path in pins.items():
                size = Path(img_path).stat().st_size
                print(f"  • {pin_type}: {img_path} ({size/1024:.0f} KB)")
            print(f"\n[3/3] DRY RUN — skipping API call")
            return len(pins)

        # Publish pins
        if client is None:
            token = os.getenv("PINTEREST_ACCESS_TOKEN", "")
            if not token:
                print("✗ PINTEREST_ACCESS_TOKEN not set")
                return 0
            client = PinterestClient(token)

        if not board_id:
            board_id = os.getenv("PINTEREST_BOARD_ID", "")
        if not board_id:
            print("✗ PINTEREST_BOARD_ID not set")
            return 0

        print(f"\n[2/3] Publishing {len(pins)} pins to board {board_id}...")
        success = 0
        for pin_type, img_path in pins.items():
            try:
                # Build description with SEO keywords
                tags = article.get("tags", [])
                tag_str = " ".join(f"#{t.lower().replace(' ', '')}" for t in tags[:5])
                description = (
                    f"{article.get('description', '')}\n\n"
                    f"{tag_str}\n\n"
                    f"Read the full guide at Elemental Bond 🔮✨"
                )
                alt = f"{title} — {article.get('description', '')[:120]}"

                result = client.create_pin(
                    board_id=board_id,
                    title=title[:100],
                    description=description[:500],
                    image_path=img_path,
                    alt_text=alt[:500],
                    link=f"{SITE_URL}/articles/{slug}",
                )
                print(f"  ✓ {pin_type} → pin ID: {result.get('id', 'unknown')}")
                success += 1
                time.sleep(1)  # Rate limit safety
            except PinterestError as e:
                print(f"  [FAIL] {pin_type}: {e}")
            except Exception as e:
                print(f"  [FAIL] {pin_type}: Unexpected error: {e}")

        print(f"\n[3/3] Done: {success}/{len(pins)} pins published")
        return success


def publish_batch(dry_run: bool = False):
    """Publish pins for all articles that don't have recent pins."""
    metadata = _load_metadata()
    print(f"\nBatch publishing {len(metadata)} articles...")

    # Load config
    token = os.getenv("PINTEREST_ACCESS_TOKEN", "")
    board_id = os.getenv("PINTEREST_BOARD_ID", "")
    if not token or not board_id:
        print("✗ PINTEREST_ACCESS_TOKEN or PINTEREST_BOARD_ID not set")
        return

    client = PinterestClient(token) if not dry_run else None
    total = 0

    for i, meta in enumerate(metadata):
        slug = meta.get("slug", "")
        if not slug:
            continue
        print(f"\n[{i+1}/{len(metadata)}] {slug}")
        count = publish_article(
            slug=slug,
            board_id=board_id,
            client=client,
            dry_run=dry_run,
        )
        total += count
        # Delay between articles (avoid rate limits)
        if i < len(metadata) - 1 and count > 0 and not dry_run:
            delay = 3
            print(f"  Waiting {delay}s...")
            time.sleep(delay)

    print(f"\n{'='*60}")
    print(f"Batch complete: {total} pins processed.")
    if dry_run:
        print("Run without --dry-run to actually publish.")


def main():
    parser = argparse.ArgumentParser(description="Publish articles to Pinterest")
    parser.add_argument("--slug", help="Article slug to publish")
    parser.add_argument("--dry-run", action="store_true", help="Generate images only, skip API")
    parser.add_argument("--list-articles", action="store_true", help="List available articles")
    parser.add_argument("--list-boards", action="store_true", help="List Pinterest boards")
    parser.add_argument("--batch", action="store_true", help="Publish all articles")
    args = parser.parse_args()

    if args.list_articles:
        list_articles()
        return

    if args.list_boards:
        from marketing.pinterest_api import cli_list_boards
        cli_list_boards()
        return

    if args.slug:
        publish_article(slug=args.slug, dry_run=args.dry_run)
        return

    if args.batch:
        publish_batch(dry_run=args.dry_run)
        return

    parser.print_help()


if __name__ == "__main__":
    main()
