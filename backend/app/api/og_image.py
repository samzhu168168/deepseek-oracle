"""Dynamic OG image generation endpoint.
Returns a 1200x630 PNG for social sharing with element pair, score, and label.
Uses Pillow to render styled text on a gradient background.
"""
from __future__ import annotations

import io
from flask import Blueprint, request, send_file

og_image_bp = Blueprint("og_image", __name__)

# ── Colour palette ───────────────────────────────────────
BG_TOP = (13, 27, 75)         # #0d1b4b
BG_BOTTOM = (26, 10, 61)      # #1a0a3d
ACCENT = (187, 143, 255)      # #bb8fff
WHITE = (247, 242, 255)       # #f7f2ff
MUTED = (148, 163, 184)       # #94a3b8
SCORE_COLOR = (249, 115, 22)  # #f97316

ELEMENT_EMOJI: dict[str, str] = {
    "water": "Water",
    "wood": "Wood",
    "fire": "Fire",
    "earth": "Earth",
    "metal": "Metal",
}


@og_image_bp.get("/api/og-image")
def og_image():
    e1 = request.args.get("e1", "Water").strip()
    e2 = request.args.get("e2", "Wood").strip()
    score = request.args.get("score", "72").strip()
    label = request.args.get("label", "Balanced Harmony").strip()

    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        return _svg_fallback(e1, e2, score, label)

    img = Image.new("RGB", (1200, 630))
    _draw_gradient(img)
    draw = ImageDraw.Draw(img)

    # ── Try to load a system font; fall back to default ──
    font_title = _load_font(48)
    font_score = _load_font(96, bold=True)
    font_label = _load_font(32)
    font_brand = _load_font(20)

    display_e1 = ELEMENT_EMOJI.get(e1.lower(), e1)
    display_e2 = ELEMENT_EMOJI.get(e2.lower(), e2)

    # ── Layout ──
    cy = 630 // 2
    cx = 1200 // 2

    # Brand line
    _draw_centered(draw, "THE ORACLE · ELEMENTAL BOND", font_brand, MUTED, cx, 60)

    # Element pair
    pair_text = f"{display_e1}  meets  {display_e2}"
    _draw_centered(draw, pair_text, font_title, WHITE, cx, cy - 60)

    # Score
    _draw_centered(draw, f"{score} / 100", font_score, SCORE_COLOR, cx, cy + 30)

    # Label
    _draw_centered(draw, label, font_label, WHITE, cx, cy + 90)

    # Footer
    _draw_centered(draw, "elemental.bond  —  Ancient wisdom. Modern clarity.", font_brand, MUTED, cx, 590)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png", max_age=86400)


def _draw_gradient(img: "Image.Image") -> None:
    """Draw a vertical gradient from BG_TOP to BG_BOTTOM."""
    w, h = img.size
    for y in range(h):
        ratio = y / h
        r = int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * ratio)
        g = int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * ratio)
        b = int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * ratio)
        for x in range(w):
            img.putpixel((x, y), (r, g, b))


def _draw_centered(
    draw: "ImageDraw.ImageDraw",
    text: str,
    font: "ImageFont.FreeTypeFont | ImageFont.ImageFont",
    color: tuple[int, int, int],
    cx: int,
    y: int,
) -> None:
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw // 2, y), text, fill=color, font=font)


def _load_font(size: int, bold: bool = False) -> "ImageFont.FreeTypeFont | ImageFont.ImageFont":
    """Try common system font paths; fall back to default bitmap font."""
    from PIL import ImageFont
    import sys

    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
    ]

    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def _svg_fallback(e1: str, e2: str, score: str, label: str):
    """Pure SVG fallback when Pillow is unavailable."""
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0d1b4b"/>
      <stop offset="100%" stop-color="#1a0a3d"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="80" text-anchor="middle" fill="#94a3b8" font-size="20" font-family="serif" letter-spacing="4">
    THE ORACLE · ELEMENTAL BOND
  </text>
  <text x="600" y="260" text-anchor="middle" fill="#f7f2ff" font-size="48" font-family="serif" font-weight="bold">
    {e1}  meets  {e2}
  </text>
  <text x="600" y="360" text-anchor="middle" fill="#f97316" font-size="96" font-family="serif" font-weight="bold">
    {score} / 100
  </text>
  <text x="600" y="420" text-anchor="middle" fill="#f7f2ff" font-size="32" font-family="serif">
    {label}
  </text>
  <text x="600" y="590" text-anchor="middle" fill="#94a3b8" font-size="20" font-family="serif">
    elemental.bond — Ancient wisdom. Modern clarity.
  </text>
</svg>"""
    from flask import Response
    return Response(svg, mimetype="image/svg+xml", headers={"Cache-Control": "public, max-age=86400"})
