"""Generate a single SEO article using LLM, targeting gaps in the content library.

Usage:
  python backend/scripts/generate_article.py \\
    --topic "Wood and Water compatibility in BaZi" \\
    --category element-compatibility \\
    --keywords "wood, water, bazi"

  # Dry-run (preview without saving):
  python backend/scripts/generate_article.py \\
    --topic "..." --category bazi-guide --dry-run
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import date
from pathlib import Path

# Ensure backend is importable
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Load .env before any app imports
try:
    from dotenv import load_dotenv
    load_dotenv(BACKEND_DIR / ".env")
except ImportError:
    pass

# Backend imports
from app.config import Config
from app.llm_providers import create_provider
from app.llm_providers.deepseek import DeepSeekProvider

ARTICLES_DIR = BACKEND_DIR / "app" / "data" / "articles"
METADATA_PATH = ARTICLES_DIR / "metadata.json"

PROMPT_TEMPLATE = """You are an expert SEO content writer for Elemental Bond, a BaZi (Chinese Four Pillar) astrology compatibility website. Your audience is US adults interested in relationship patterns, self-discovery, and Chinese metaphysics.

Generate a complete article in JSON format. The output MUST be ONLY valid JSON — no markdown fences, no explanation before or after.

## Output JSON Schema
{{
  "id": "kebab-case-slug",
  "slug": "kebab-case-slug",
  "title": "Article title (max 60 chars)",
  "description": "Meta description (max 160 chars)",
  "category": "{category}",
  "tags": ["3-5", "relevant", "tags"],
  "published": "{today}",
  "updated": "{today}",
  "author": "Elemental Bond Oracle",
  "reading_time_minutes": 7,
  "meta": {{
    "title": "SEO title (max 60 chars, include | Elemental Bond)",
    "description": "SEO description (max 160 chars)",
    "keywords": "comma, separated, keywords, 5-8"
  }},
  "content": {{
    "hook": "One compelling opening paragraph that hooks the reader. 2-3 sentences.",
    "body_sections": [
      {{"heading": "Section Heading", "body": "Section body in markdown. Use **bold** for emphasis. 2-4 paragraphs. Include specific BaZi terminology and practical insights."}},
      {{"heading": "Next Section", "body": "..."}}
    ],
    "key_insight": "One powerful closing insight. 1-2 sentences.",
    "cta": "Call to action inviting the reader to get their free BaZi reading. 1 sentence."
  }},
  "related_articles": []
}}

## Article Content Rules
- Tone: Authoritative but warm. Like a knowledgeable mentor, not a salesman.
- Include specific BaZi terminology: Day Master, Heavenly Stems, Five Elements, generative/controlling cycles where relevant.
- Body: 4-6 sections covering different angles of the topic.
- Each section should be 2-4 paragraphs in markdown.
- If mentioning a year, use 2026.
- keywords field: 5-8 comma-separated phrases.

## Now generate an article for this topic:
Topic: {topic}
Category: {category}
Keywords hint: {keywords}
"""


def _slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    slug = text.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug


def _load_metadata() -> list[dict]:
    if METADATA_PATH.exists():
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def _save_metadata(metadata: list[dict]) -> None:
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)


def _extract_json(text: str) -> dict:
    """Extract JSON from LLM response (handles markdown fences if present)."""
    # Try to extract from code fence
    m = re.search(r"```(?:json)?\s*\n(.+?)\n```", text, re.DOTALL)
    if m:
        text = m.group(1)

    # Find first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in LLM response")

    return json.loads(text[start : end + 1])


def generate_article(
    topic: str,
    category: str,
    keywords: str = "",
    dry_run: bool = False,
) -> dict | None:
    """Generate a single article using LLM and save to disk."""
    today = date.today().isoformat()

    prompt = PROMPT_TEMPLATE.format(
        topic=topic,
        category=category,
        keywords=keywords or topic,
        today=today,
    )

    print(f"[generate] Calling LLM for: {topic}")

    try:
        api_key = os.environ.get("DEEPSEEK_API_KEY", "")
        if not api_key:
            print("[generate] ERROR: DEEPSEEK_API_KEY not set", file=sys.stderr)
            return None
        provider = DeepSeekProvider(
            api_key=api_key,
            base_url=os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1"),
            model="deepseek-chat",
        )
        result = provider.generate(prompt, timeout_s=120)
        article = _extract_json(result.content)

        # Validate required fields
        required = ["id", "slug", "title", "description", "category", "content"]
        for field in required:
            if field not in article:
                raise ValueError(f"Missing required field: {field}")

        if "hook" not in article.get("content", {}):
            raise ValueError("Missing content.hook")

        if not article.get("slug"):
            article["slug"] = _slugify(article.get("title", topic))
            article["id"] = article["slug"]

        if dry_run:
            print("[generate] DRY RUN — would save:")
            print(json.dumps(article, ensure_ascii=False, indent=2))
            return article

        # Save article file
        ARTICLES_DIR.mkdir(parents=True, exist_ok=True)
        article_path = ARTICLES_DIR / f"{article['slug']}.json"
        with open(article_path, "w", encoding="utf-8") as f:
            json.dump(article, f, ensure_ascii=False, indent=2)
        print(f"[generate] Saved → {article_path}")

        # Update metadata
        metadata = _load_metadata()
        existing = [m for m in metadata if m.get("slug") != article["slug"]]
        existing.append({
            "id": article["id"],
            "slug": article["slug"],
            "title": article["title"],
            "description": article["description"],
            "category": article["category"],
            "tags": article.get("tags", []),
            "published": article.get("published", today),
            "updated": article.get("updated", today),
            "reading_time_minutes": article.get("reading_time_minutes", 7),
        })
        _save_metadata(existing)
        print(f"[generate] Updated metadata.json ({len(existing)} articles)")

        return article

    except Exception as e:
        print(f"[generate] ERROR: {e}", file=sys.stderr)
        if dry_run:
            raise
        return None


def main():
    parser = argparse.ArgumentParser(description="Generate an SEO article using LLM")
    parser.add_argument("--topic", required=True, help="Article topic")
    parser.add_argument("--category", default="bazi-guide", choices=["bazi-guide", "element-compatibility", "element-guide"])
    parser.add_argument("--keywords", default="", help="Comma-separated keywords hint")
    parser.add_argument("--dry-run", action="store_true", help="Preview output without saving")
    args = parser.parse_args()

    result = generate_article(
        topic=args.topic,
        category=args.category,
        keywords=args.keywords,
        dry_run=args.dry_run,
    )

    if result is None:
        sys.exit(1)

    if args.dry_run:
        print(f"\n[generate] DRY RUN complete. Pass without --dry-run to save.")
    else:
        print(f"\n[generate] Successfully created: {result.get('slug')}")
        print(f"[generate] Title: {result.get('title')}")


if __name__ == "__main__":
    main()
