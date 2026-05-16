"""Generate static OG image and PWA icons for Elemental Bond.

Run from repo root:
  python scripts/generate_assets.py

Requires: Pillow (PIL)
  pip install Pillow
"""
from __future__ import annotations

import io
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC = REPO_ROOT / "frontend" / "public"
ICONS_DIR = PUBLIC / "icons"

# ── Colour palette (matches og_image.py) ──
BG_TOP = (13, 27, 75)
BG_BOTTOM = (26, 10, 61)
ACCENT = (187, 143, 255)
WHITE = (247, 242, 255)
MUTED = (148, 163, 184)
SCORE_COLOR = (249, 115, 22)


def _load_font(size: int, bold: bool = False):
    from PIL import ImageFont
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "",
        "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in paths:
        if not path:
            continue
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def _draw_gradient(img):
    w, h = img.size
    for y in range(h):
        ratio = y / h
        r = int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * ratio)
        g = int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * ratio)
        b = int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * ratio)
        for x in range(w):
            img.putpixel((x, y), (r, g, b))


def _draw_centered(draw, text, font, color, cx, y):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw // 2, y), text, fill=color, font=font)


def generate_og_image():
    """1200x630 static fallback OG image."""
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (1200, 630))
    _draw_gradient(img)
    draw = ImageDraw.Draw(img)

    font_title = _load_font(48)
    font_score = _load_font(96, bold=True)
    font_brand = _load_font(20)

    cy, cx = 630 // 2, 1200 // 2

    _draw_centered(draw, "THE ORACLE · ELEMENTAL BOND", font_brand, MUTED, cx, 60)
    _draw_centered(draw, "Decode Your Connection", font_title, WHITE, cx, cy - 40)
    _draw_centered(draw, "Elemental Bond", font_score, SCORE_COLOR, cx, cy + 30)
    _draw_centered(draw, "Ancient wisdom. Modern clarity.", font_brand, MUTED, cx, 590)

    dest = PUBLIC / "og-image.png"
    img.save(dest, format="PNG")
    print(f"  [OK] {dest} ({img.size[0]}x{img.size[1]})")


def generate_icons():
    """Generate PWA icons at 192x192 and 512x512."""
    from PIL import Image, ImageDraw

    ICONS_DIR.mkdir(parents=True, exist_ok=True)

    for size in (192, 512):
        img = Image.new("RGB", (size, size))
        _draw_gradient(img)
        draw = ImageDraw.Draw(img)

        # Draw a stylized diamond symbol
        c = size // 2
        r = size * 0.3
        pts = [(c, c - r), (c + r, c), (c, c + r), (c - r, c)]
        draw.polygon(pts, fill=ACCENT, outline=None)

        font = _load_font(int(size * 0.08))
        label = "BOND" if size >= 192 else ""
        if label:
            _draw_centered(draw, label, font, WHITE, c, int(c + r + size * 0.06))

        dest = ICONS_DIR / f"icon-{size}x{size}.png"
        img.save(dest, format="PNG")
        print(f"  [OK] {dest} ({img.size[0]}x{img.size[1]})")


def main():
    print("Generating static assets for Elemental Bond...")
    try:
        from PIL import Image, ImageDraw, ImageFont  # noqa: F401
    except ImportError:
        print("[ERROR] Pillow not installed. Run: pip install Pillow")
        return

    print("\n[OG Image]")
    generate_og_image()

    print("\n[PWA Icons]")
    generate_icons()

    print("\n[Done] All assets generated.")


if __name__ == "__main__":
    main()
