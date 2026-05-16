"""Content API — serves pre-generated SEO articles as JSON.

Articles are stored as JSON files in backend/app/data/articles/.
A metadata.json file provides the listing index.
"""
from __future__ import annotations

import json
from pathlib import Path
from flask import Blueprint, jsonify, request

content_bp = Blueprint("content", __name__)

ARTICLES_DIR = Path(__file__).resolve().parent.parent / "data" / "articles"
METADATA_PATH = ARTICLES_DIR / "metadata.json"


def _load_metadata() -> list[dict]:
    try:
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _load_article(slug: str) -> dict | None:
    path = ARTICLES_DIR / f"{slug}.json"
    if not path.exists():
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


@content_bp.get("/api/content/articles")
def list_articles():
    """Return article metadata list, optionally filtered by category."""
    category = request.args.get("category")
    metadata = _load_metadata()
    if category:
        metadata = [a for a in metadata if a.get("category") == category]
    return jsonify({"success": True, "articles": metadata})


@content_bp.get("/api/content/articles/<slug>")
def get_article(slug: str):
    """Return full article content for a given slug."""
    article = _load_article(slug)
    if article is None:
        return jsonify({"success": False, "error": "Article not found"}), 404
    return jsonify({"success": True, "article": article})


@content_bp.get("/api/content/search")
def search_articles():
    """Simple linear search across article titles and tags."""
    q = request.args.get("q", "").strip().lower()
    if not q:
        return jsonify({"success": True, "articles": _load_metadata()})
    metadata = _load_metadata()
    results = [
        a for a in metadata
        if q in a.get("title", "").lower()
        or q in a.get("description", "").lower()
        or any(q in t.lower() for t in a.get("tags", []))
    ]
    return jsonify({"success": True, "articles": results})
