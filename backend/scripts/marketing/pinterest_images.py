"""Generate Pinterest-optimized images from article content.

Output: 1000×1500 px PNG images for each pin type:
  - title:    Article title + hook + element badges
  - quote:    Key insight as a shareable quote card
  - tip:      Practical tips section
  - stat:     Striking fact / hook

Usage:
  from marketing.pinterest_images import generate_pin_images
  generate_pin_images(article, output_dir="output/")
"""

from __future__ import annotations

import json
import os
import re
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ── Brand palette ──
DEEP_SPACE = (10, 14, 26)
DARK_BG = (18, 21, 42)
CARD_BG = (26, 30, 56)
GOLD = (240, 179, 75)
PURPLE = (139, 111, 232)
TEAL = (78, 205, 196)
TEXT_LIGHT = (237, 237, 240)
TEXT_MUTED = (160, 160, 180)
NEON_PINK = (233, 75, 138)

# Element colors
ELEMENT_COLORS = {
    "wood": (76, 175, 80),
    "fire": (255, 107, 107),
    "earth": (205, 133, 63),
    "metal": (180, 190, 200),
    "water": (78, 205, 196),
}

PIN_WIDTH = 1000
PIN_HEIGHT = 1500

# ── Font loading ──
_FONTS_CACHED = {}


def _get_font(name: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    cache_key = f"{name}_{size}"
    if cache_key in _FONTS_CACHED:
        return _FONTS_CACHED[cache_key]
    try:
        if os.name == "nt":
            paths = {
                "bold": "C:/Windows/Fonts/arialbd.ttf",
                "regular": "C:/Windows/Fonts/arial.ttf",
                "light": "C:/Windows/Fonts/arial.ttf",
            }
            font = ImageFont.truetype(paths.get(name, paths["regular"]), size)
        else:
            paths = {
                "bold": "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "regular": "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "light": "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            }
            font = ImageFont.truetype(paths.get(name, paths["regular"]), size)
        _FONTS_CACHED[cache_key] = font
        return font
    except (OSError, IOError):
        font = ImageFont.load_default()
        _FONTS_CACHED[cache_key] = font
        return font


# ── Helper functions ──


def _draw_gradient_bg(draw: ImageDraw, width: int, height: int) -> None:
    """Draw a dark cosmic gradient background."""
    for y in range(height):
        ratio = y / height
        r = int(DARK_BG[0] * (1 - ratio) + DEEP_SPACE[0] * ratio)
        g = int(DARK_BG[1] * (1 - ratio) + DEEP_SPACE[1] * ratio)
        b = int(DARK_BG[2] * (1 - ratio) + DEEP_SPACE[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))


def _draw_accent_line(draw: ImageDraw, x: int, y: int, width: int, color=GOLD) -> None:
    """Draw a thin gold accent line."""
    draw.rectangle([x, y, x + width, y + 2], fill=color)


def _draw_logo_bar(draw: ImageDraw) -> None:
    """Small brand bar at top."""
    _draw_accent_line(draw, 60, 80, 200, GOLD)
    font_small = _get_font("bold", 22)
    draw.text((60, 90), "ELEMENTAL BOND", fill=GOLD, font=font_small)


def _draw_cta_bar(draw: ImageDraw) -> None:
    """Bottom CTA bar."""
    font_cta = _get_font("bold", 26)
    _draw_accent_line(draw, 60, PIN_HEIGHT - 100, 200, GOLD)
    draw.text((60, PIN_HEIGHT - 90), "elemental.bond", fill=GOLD, font=font_cta)
    font_small = _get_font("regular", 18)
    draw.text((60, PIN_HEIGHT - 60), "Free BaZi Compatibility Reading", fill=TEXT_MUTED, font=font_small)


def _wrap_text(text: str, font: ImageFont, max_width: int) -> list[str]:
    """Wrap text to fit within max_width pixels."""
    words = text.split()
    lines = []
    current_line = ""
    for word in words:
        test_line = f"{current_line} {word}".strip()
        bbox = font.getbbox(test_line)
        if bbox and bbox[2] <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    return lines


def _draw_centered_text(
    draw: ImageDraw,
    text: str,
    y: int,
    font: ImageFont,
    color=TEXT_LIGHT,
    max_width=PIN_WIDTH - 120,
    line_spacing: int = 8,
) -> int:
    """Draw wrapped centered text, returns y position after last line."""
    lines = _wrap_text(text, font, max_width)
    for line in lines:
        bbox = font.getbbox(line)
        line_width = bbox[2] if bbox else 0
        x = (PIN_WIDTH - line_width) // 2
        draw.text((x, y), line, fill=color, font=font)
        y += bbox[3] + line_spacing if bbox else font.size + line_spacing
    return y


def _draw_aligned_text(
    draw: ImageDraw,
    text: str,
    x: int,
    y: int,
    font: ImageFont,
    color=TEXT_LIGHT,
    max_width: int = PIN_WIDTH - 120,
    line_spacing: int = 6,
) -> int:
    """Draw wrapped left-aligned text, returns y after last line."""
    lines = _wrap_text(text, font, max_width)
    for line in lines:
        draw.text((x, y), line, fill=color, font=font)
        bbox = font.getbbox(line)
        line_height = bbox[3] if bbox else font.size
        y += line_height + line_spacing
    return y


def _detect_elements(title: str, category: str) -> list[str]:
    """Detect which elements are mentioned in the title/category."""
    title_lower = title.lower()
    elements = []
    for el in ["wood", "fire", "earth", "metal", "water"]:
        if el in title_lower or el in category.lower():
            elements.append(el)
    return elements or ["fire", "water"]  # fallback


def _draw_element_badges(draw: ImageDraw, elements: list[str], y: int) -> int:
    """Draw colored element badges."""
    font_small = _get_font("bold", 20)
    badge_h = 36
    gap = 12
    total_w = sum(len(el) * 14 + 36 for el in elements) + (len(elements) - 1) * gap
    x_start = (PIN_WIDTH - total_w) // 2

    for el in elements:
        color = ELEMENT_COLORS.get(el, PURPLE)
        text_w = len(el) * 14 + 24
        # Draw rounded rect badge
        draw.rounded_rectangle(
            [x_start, y, x_start + text_w, y + badge_h],
            radius=18,
            fill=(*color, 180),
        )
        # Element emoji + name
        emojis = {"wood": "🌿", "fire": "🔥", "earth": "🌍", "metal": "⚔️", "water": "💧"}
        label = f"{emojis.get(el, '')} {el.title()}"
        draw.text((x_start + 12, y + 8), label, fill=(255, 255, 255), font=font_small)
        x_start += text_w + gap

    return y + badge_h + 20


# ── Pin generators ──


def generate_title_pin(article: dict, output_path: str | Path) -> str:
    """Generate the main title card pin (1000×1500)."""
    img = Image.new("RGB", (PIN_WIDTH, PIN_HEIGHT))
    draw = ImageDraw.Draw(img)
    _draw_gradient_bg(draw, PIN_WIDTH, PIN_HEIGHT)

    # Decorative circle
    draw.ellipse([650, -200, 1050, 200], fill=(*PURPLE, 30))
    draw.ellipse([700, -150, 1000, 150], fill=(*GOLD, 20))

    _draw_logo_bar(draw)

    # Element badges
    elements = _detect_elements(article.get("title", ""), article.get("category", ""))
    y = 180
    y = _draw_element_badges(draw, elements, y)

    # Title
    title = article.get("title", "")
    font_title = _get_font("bold", 44)
    y = _draw_centered_text(draw, title, y + 20, font_title, GOLD, max_width=PIN_WIDTH - 120, line_spacing=12)

    # Divider
    y += 20
    _draw_accent_line(draw, PIN_WIDTH // 2 - 40, y, 80, GOLD)
    y += 30

    # Hook
    hook = article.get("content", {}).get("hook", "")
    font_hook = _get_font("regular", 28)
    y = _draw_centered_text(draw, hook, y, font_hook, TEXT_MUTED, max_width=PIN_WIDTH - 140, line_spacing=8)

    # Category label
    y = PIN_HEIGHT - 160
    font_cat = _get_font("regular", 20)
    category_labels = {
        "element-compatibility": "BaZi Element Compatibility",
        "bazi-guide": "BaZi Guide",
        "element-guide": "Element Guide",
    }
    cat_label = category_labels.get(article.get("category", ""), "BaZi Astrology")
    draw.text(((PIN_WIDTH - font_cat.getbbox(cat_label)[2]) // 2, y), cat_label, fill=PURPLE, font=font_cat)

    _draw_cta_bar(draw)
    img.save(output_path, "PNG")
    return str(output_path)


def generate_quote_pin(article: dict, output_path: str | Path) -> str:
    """Generate a quote-style pin featuring the key insight."""
    img = Image.new("RGB", (PIN_WIDTH, PIN_HEIGHT))
    draw = ImageDraw.Draw(img)
    _draw_gradient_bg(draw, PIN_WIDTH, PIN_HEIGHT)

    # Decorative circle
    draw.ellipse([-50, 900, 350, 1300], fill=(*PURPLE, 25))

    _draw_logo_bar(draw)

    # Big quote mark
    font_quote = _get_font("bold", 100)
    draw.text((80, 200), '"', fill=GOLD, font=font_quote)

    # Key insight
    insight = article.get("content", {}).get("key_insight", "")
    font_insight = _get_font("regular", 34)
    _draw_aligned_text(draw, insight, 100, 320, font_insight, TEXT_LIGHT, max_width=PIN_WIDTH - 180, line_spacing=10)

    # Closing quote
    last_line_y = 320 + (len(insight) // 30) * 44
    draw.text((PIN_WIDTH - 120, last_line_y + 20), '"', fill=GOLD, font=font_quote)

    # Attribution
    font_attr = _get_font("bold", 24)
    draw.text((100, PIN_HEIGHT - 180), f"— {article.get('author', 'Elemental Bond Oracle')}", fill=PURPLE, font=font_attr)

    _draw_cta_bar(draw)
    img.save(output_path, "PNG")
    return str(output_path)


def generate_tip_pin(article: dict, output_path: str | Path) -> str:
    """Generate a tips-style pin from body_sections."""
    img = Image.new("RGB", (PIN_WIDTH, PIN_HEIGHT))
    draw = ImageDraw.Draw(img)
    _draw_gradient_bg(draw, PIN_WIDTH, PIN_HEIGHT)

    _draw_logo_bar(draw)

    # Section heading
    sections = article.get("content", {}).get("body_sections", [])
    # Pick a practical section (prefer one with "tip" or "practical" in heading)
    tip_section = sections[0] if sections else None
    for s in sections:
        h = s.get("heading", "").lower()
        if "tip" in h or "practical" in h or "navigat" in h:
            tip_section = s
            break

    font_heading = _get_font("bold", 32)
    y = 160
    if tip_section:
        heading = tip_section.get("heading", "")
        y = _draw_centered_text(draw, heading, y, font_heading, GOLD, max_width=PIN_WIDTH - 120)
        y += 10
        _draw_accent_line(draw, PIN_WIDTH // 2 - 30, y, 60, GOLD)
        y += 30

        # Extract bullet points from body
        body = tip_section.get("body", "")
        # Find sentences that start with dashes or numbers (bullet points)
        bullets = re.findall(r"(?:^|\n)\s*[-•*]\s*(.+?)(?:\n|$)", body, re.MULTILINE) or [body]
        font_body = _get_font("regular", 26)
        for b in bullets[:4]:
            b_clean = b.strip()
            if len(b_clean) > 120:
                b_clean = b_clean[:117] + "..."
            y = _draw_aligned_text(draw, f"  •  {b_clean}", 100, y, font_body, TEXT_LIGHT, max_width=PIN_WIDTH - 180, line_spacing=8)
            y += 10
    else:
        # Fallback: use hook
        hook = article.get("content", {}).get("hook", "")
        y = _draw_centered_text(draw, hook, y, font_heading, TEXT_LIGHT, max_width=PIN_WIDTH - 120)

    _draw_cta_bar(draw)
    img.save(output_path, "PNG")
    return str(output_path)


def generate_stat_pin(article: dict, output_path: str | Path) -> str:
    """Generate a stat-style pin with a striking number or fact."""
    img = Image.new("RGB", (PIN_WIDTH, PIN_HEIGHT))
    draw = ImageDraw.Draw(img)
    _draw_gradient_bg(draw, PIN_WIDTH, PIN_HEIGHT)

    _draw_logo_bar(draw)

    # Find a sentence with a number in the body
    body_text = " ".join(
        s.get("body", "") for s in article.get("content", {}).get("body_sections", [])
    )
    number_matches = re.findall(r"(\d+\s*[A-Za-z]+[^.]*\.)", body_text)

    font_stat = _get_font("bold", 56)
    font_body = _get_font("regular", 30)

    if number_matches:
        # Highlight the number
        fact = number_matches[0]
        num_match = re.search(r"(\d+)", fact)
        if num_match:
            number = num_match.group(1)
            rest = fact.replace(number, "", 1).strip()
            y = 250
            # Big number
            draw.text(((PIN_WIDTH - font_stat.getbbox(number)[2]) // 2, y), number, fill=GOLD, font=font_stat)
            y += 80
            # Rest of fact
            y = _draw_centered_text(draw, rest, y, font_body, TEXT_LIGHT, max_width=PIN_WIDTH - 140)
    else:
        # Use hook instead
        hook = article.get("content", {}).get("hook", "")
        y = 250
        y = _draw_centered_text(draw, hook, y, font_body, TEXT_LIGHT, max_width=PIN_WIDTH - 120)

    _draw_cta_bar(draw)
    img.save(output_path, "PNG")
    return str(output_path)


# ── Main entry ──


def generate_pin_images(article: dict, output_dir: str | Path = "pins") -> dict[str, str]:
    """Generate all pin types for an article.

    Returns dict of {pin_type: file_path}.
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    slug = article.get("slug", "article")

    results = {}
    generators = {
        "title": generate_title_pin,
        "quote": generate_quote_pin,
        "tip": generate_tip_pin,
        "stat": generate_stat_pin,
    }

    for pin_type, gen_fn in generators.items():
        path = output_dir / f"{slug}_{pin_type}.png"
        try:
            gen_fn(article, path)
            results[pin_type] = str(path)
            print(f"  [OK] {pin_type} -> {path}")
        except Exception as e:
            print(f"  [FAIL] {pin_type}: {e}")

    return results


if __name__ == "__main__":
    # Test with a sample article
    import sys
    sample = {
        "slug": "test-article",
        "title": "Water and Wood BaZi Compatibility: The Nourishing Bond",
        "category": "element-compatibility",
        "author": "Elemental Bond Oracle",
        "content": {
            "hook": "This is a test hook paragraph describing what the article is about and why you should care.",
            "body_sections": [
                {"heading": "Practical Tips for Your Relationship", "body": "- Communicate openly\n- Set boundaries\n- Practice gratitude daily\n• Make time for each other\n- Grow together intentionally"},
            ],
            "key_insight": "The Five Elements teach us that balance is not static — it is a continuous dance of giving and receiving.",
            "cta": "Get your free BaZi reading today!",
        },
    }
    generate_pin_images(sample, "test_pins")
    print("Test complete! Check test_pins/ directory.")
