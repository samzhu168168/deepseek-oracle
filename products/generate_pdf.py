"""
Convert pattern_breaker_workbook.md to a styled PDF using ReportLab.
Design: dark background #0A1628, gold titles, white body text, cover page.
"""

import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
    Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)
from reportlab.platypus.flowables import Flowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ── Colours ─────────────────────────────────────────────────────────────────
BG       = colors.HexColor("#0A1628")
GOLD     = colors.HexColor("#C9A84C")
GOLD_LT  = colors.HexColor("#E8C97A")
WHITE    = colors.white
GREY     = colors.HexColor("#8899BB")
DARK_BG  = colors.HexColor("#06101E")   # cover page
LINE_CLR = colors.HexColor("#1E2E48")   # subtle dividers

PAGE_W, PAGE_H = A4                     # 595.27 × 841.89 pts
MARGIN = 18 * mm

# ── Background Canvas Helper ─────────────────────────────────────────────────
def draw_bg(canvas, doc, is_cover=False):
    canvas.saveState()
    bg = DARK_BG if is_cover else BG
    canvas.setFillColor(bg)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.restoreState()

def draw_header_footer(canvas, doc):
    draw_bg(canvas, doc, is_cover=False)
    canvas.saveState()
    # Header
    canvas.setFont("Helvetica-Bold", 7)
    canvas.setFillColor(GOLD)
    canvas.drawString(MARGIN, PAGE_H - 12 * mm, "elemental.bond")
    canvas.setFillColor(LINE_CLR)
    canvas.setStrokeColor(LINE_CLR)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, PAGE_H - 13.5 * mm, PAGE_W - MARGIN, PAGE_H - 13.5 * mm)
    # Footer
    canvas.setStrokeColor(LINE_CLR)
    canvas.line(MARGIN, 13 * mm, PAGE_W - MARGIN, 13 * mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(GREY)
    footer = "elemental.bond — Pattern Reading"
    canvas.drawString(MARGIN, 8 * mm, footer)
    page_num = str(doc.page)
    canvas.drawRightString(PAGE_W - MARGIN, 8 * mm, page_num)
    canvas.restoreState()

def draw_cover_bg(canvas, doc):
    draw_bg(canvas, doc, is_cover=True)
    canvas.saveState()
    # Decorative gold rectangle strip at top
    canvas.setFillColor(GOLD)
    canvas.rect(0, PAGE_H - 4 * mm, PAGE_W, 4 * mm, fill=1, stroke=0)
    # Subtle bottom strip
    canvas.rect(0, 0, PAGE_W, 4 * mm, fill=1, stroke=0)
    canvas.restoreState()

# ── Styles ───────────────────────────────────────────────────────────────────
def make_styles():
    base = dict(
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=WHITE,
        backColor=None,
        spaceAfter=6,
    )
    S = {}
    S['body']    = ParagraphStyle('body',    **base)
    S['italic']  = ParagraphStyle('italic',  fontName="Helvetica-Oblique",
                                  fontSize=10, leading=15, textColor=WHITE,
                                  spaceAfter=8)
    S['bold']    = ParagraphStyle('bold',    fontName="Helvetica-Bold",
                                  fontSize=10, leading=15, textColor=WHITE,
                                  spaceAfter=6)
    S['h1']      = ParagraphStyle('h1',      fontName="Helvetica-Bold",
                                  fontSize=20, leading=26, textColor=GOLD,
                                  spaceBefore=14, spaceAfter=8)
    S['h2']      = ParagraphStyle('h2',      fontName="Helvetica-Bold",
                                  fontSize=15, leading=20, textColor=GOLD_LT,
                                  spaceBefore=12, spaceAfter=6)
    S['h3']      = ParagraphStyle('h3',      fontName="Helvetica-Bold",
                                  fontSize=11, leading=16, textColor=GOLD,
                                  spaceBefore=8, spaceAfter=4)
    S['quote']   = ParagraphStyle('quote',   fontName="Helvetica-Oblique",
                                  fontSize=11, leading=17, textColor=GOLD_LT,
                                  leftIndent=12, spaceAfter=10)
    S['bullet']  = ParagraphStyle('bullet',  fontName="Helvetica",
                                  fontSize=10, leading=15, textColor=WHITE,
                                  leftIndent=14, firstLineIndent=-8,
                                  spaceAfter=3)
    S['label']   = ParagraphStyle('label',   fontName="Helvetica-Bold",
                                  fontSize=10, leading=14, textColor=GOLD,
                                  spaceAfter=2)
    S['grey']    = ParagraphStyle('grey',    fontName="Helvetica",
                                  fontSize=9, leading=13, textColor=GREY,
                                  spaceAfter=4)
    # Cover page styles
    S['cover_title'] = ParagraphStyle('cover_title', fontName="Helvetica-Bold",
                                       fontSize=52, leading=56, textColor=GOLD,
                                       alignment=TA_CENTER)
    S['cover_sub']   = ParagraphStyle('cover_sub',   fontName="Helvetica",
                                       fontSize=14, leading=20, textColor=WHITE,
                                       alignment=TA_CENTER, spaceAfter=10)
    S['cover_brand'] = ParagraphStyle('cover_brand', fontName="Helvetica-Bold",
                                       fontSize=11, leading=16, textColor=GOLD,
                                       alignment=TA_CENTER)
    S['cover_tag']   = ParagraphStyle('cover_tag',   fontName="Helvetica-Oblique",
                                       fontSize=10, leading=15, textColor=GREY,
                                       alignment=TA_CENTER)
    return S

# ── Table styling helper ─────────────────────────────────────────────────────
THEAD_BG   = colors.HexColor("#0F1E38")
TROW_BG    = colors.HexColor("#0D1A30")
TROW_ALT   = colors.HexColor("#0A1628")

def make_table(rows, col_widths=None, col_count=None):
    """Build a styled ReportLab Table from list-of-list rows (strings or Paragraphs)."""
    S = make_styles()
    content = PAGE_W - 2 * MARGIN

    if col_widths is None:
        n = col_count or (len(rows[0]) if rows else 2)
        col_widths = [content / n] * n

    # Convert plain strings to Paragraph objects
    styled_rows = []
    for r_idx, row in enumerate(rows):
        styled_row = []
        for c_idx, cell in enumerate(row):
            if isinstance(cell, str):
                style = S['bold'] if r_idx == 0 else S['body']
                # Gold header text
                if r_idx == 0:
                    style = ParagraphStyle('th', fontName="Helvetica-Bold",
                                           fontSize=9, leading=13,
                                           textColor=GOLD, backColor=None)
                else:
                    style = ParagraphStyle('td', fontName="Helvetica",
                                           fontSize=9, leading=13,
                                           textColor=WHITE, backColor=None)
                styled_row.append(Paragraph(cell, style))
            else:
                styled_row.append(cell)
        styled_rows.append(styled_row)

    table = Table(styled_rows, colWidths=col_widths, repeatRows=1)
    n_rows = len(styled_rows)
    ts = TableStyle([
        ('BACKGROUND',  (0,0), (-1,0),     THEAD_BG),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [TROW_BG, TROW_ALT]),
        ('GRID',        (0,0), (-1,-1),    0.3, LINE_CLR),
        ('TOPPADDING',  (0,0), (-1,-1),    4),
        ('BOTTOMPADDING',(0,0),(-1,-1),    4),
        ('LEFTPADDING', (0,0), (-1,-1),    5),
        ('RIGHTPADDING',(0,0), (-1,-1),    5),
        ('VALIGN',      (0,0), (-1,-1),    'TOP'),
    ])
    table.setStyle(ts)
    return table

# ── Cover page ───────────────────────────────────────────────────────────────
def build_cover(S):
    story = []
    story.append(Spacer(1, 70 * mm))
    story.append(Paragraph("PATTERN", S['cover_title']))
    story.append(Paragraph("BREAKER", S['cover_title']))
    story.append(Spacer(1, 6 * mm))
    story.append(HRFlowable(width="60%", thickness=1, color=GOLD,
                             spaceAfter=6 * mm, hAlign='CENTER'))
    story.append(Paragraph(
        "A BaZi Elemental Workbook for<br/>Breaking Your Relationship Loops",
        S['cover_sub']))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(
        "<i>\"The pattern isn't happening to you. It's happening through you.<br/>"
        "This workbook teaches you to see it — and finally, to choose differently.\"</i>",
        S['cover_tag']))
    story.append(Spacer(1, 40 * mm))
    story.append(Paragraph("elemental.bond", S['cover_brand']))
    story.append(Paragraph("The Oracle", S['cover_tag']))
    story.append(PageBreak())
    return story

# ── Markdown → ReportLab flowables ──────────────────────────────────────────
def md_inline(text):
    """Convert inline **bold** and *italic* to ReportLab XML."""
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    return text

def parse_md(md_text, S):
    """Parse markdown and return a list of ReportLab flowables."""
    story = []
    lines = md_text.split('\n')
    i = 0
    content_w = PAGE_W - 2 * MARGIN
    first_page_break = True  # skip the very first --- (after cover metadata lines)

    while i < len(lines):
        line = lines[i]

        # ── Page break on --- (horizontal rules)
        if line.strip() == '---':
            # Use a thin line instead of full page break, except at chapter starts
            story.append(HRFlowable(width="100%", thickness=0.5,
                                    color=LINE_CLR, spaceBefore=8, spaceAfter=8))
            i += 1
            continue

        # ── Chapter / H1 heading → force a page break before
        if line.startswith('# ') and not line.startswith('## '):
            heading = line[2:].strip()
            if heading in ("TABLE OF CONTENTS",):
                story.append(Paragraph(md_inline(heading), S['h1']))
                i += 1
                continue
            story.append(PageBreak())
            story.append(Paragraph(md_inline(heading), S['h1']))
            i += 1
            continue

        # ── H2
        if line.startswith('## '):
            story.append(Paragraph(md_inline(line[3:].strip()), S['h2']))
            i += 1
            continue

        # ── H3
        if line.startswith('### '):
            story.append(Paragraph(md_inline(line[4:].strip()), S['h3']))
            i += 1
            continue

        # ── Table: collect all pipe-separated rows
        if line.strip().startswith('|') and '|' in line:
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                table_lines.append(lines[i])
                i += 1
            rows = []
            for tl in table_lines:
                cells = [c.strip() for c in tl.strip().strip('|').split('|')]
                # skip separator row (|---|---|)
                if all(re.match(r'^[-: ]+$', c) for c in cells):
                    continue
                rows.append(cells)
            if rows:
                n = len(rows[0])
                story.append(make_table(rows, col_count=n))
                story.append(Spacer(1, 4 * mm))
            continue

        # ── Bullet list
        if line.startswith('- '):
            bullet_text = md_inline(line[2:].strip())
            story.append(Paragraph(f"• {bullet_text}", S['bullet']))
            i += 1
            continue

        # ── Numbered list
        if re.match(r'^\d+\. ', line):
            text = re.sub(r'^\d+\. ', '', line)
            story.append(Paragraph(f"• {md_inline(text)}", S['bullet']))
            i += 1
            continue

        # ── Italic/quote line (wrapped in *)
        if line.startswith('*') and line.endswith('*') and len(line) > 2:
            inner = line[1:-1]
            story.append(Paragraph(f"<i>{md_inline(inner)}</i>", S['quote']))
            i += 1
            continue

        # ── Page reference lines like "*Pages 4–11*" — skip silently
        if re.match(r'^\*Pages? \d', line):
            i += 1
            continue

        # ── Bold standalone line (**text**)
        if line.startswith('**') and line.endswith('**') and len(line) > 4:
            inner = line[2:-2]
            story.append(Paragraph(md_inline(inner), S['label']))
            i += 1
            continue

        # ── Fill-in lines (underscores)
        if re.match(r'^_+$', line.strip()):
            story.append(HRFlowable(width="80%", thickness=0.5,
                                    color=GREY, spaceBefore=2, spaceAfter=6,
                                    hAlign='LEFT'))
            i += 1
            continue

        # ── Empty line
        if line.strip() == '':
            story.append(Spacer(1, 2 * mm))
            i += 1
            continue

        # ── Normal paragraph
        story.append(Paragraph(md_inline(line.strip()), S['body']))
        i += 1

    return story

# ── Document assembly ────────────────────────────────────────────────────────
def build_doc(md_path, out_path):
    S = make_styles()

    # Page templates
    cover_frame  = Frame(MARGIN, MARGIN, PAGE_W - 2*MARGIN, PAGE_H - 2*MARGIN,
                         id='cover', showBoundary=0)
    inner_frame  = Frame(MARGIN, 18*mm, PAGE_W - 2*MARGIN,
                         PAGE_H - 32*mm, id='inner', showBoundary=0)

    cover_tpl  = PageTemplate(id='Cover', frames=[cover_frame],
                               onPage=draw_cover_bg)
    inner_tpl  = PageTemplate(id='Inner', frames=[inner_frame],
                               onPage=draw_header_footer)

    doc = BaseDocTemplate(
        out_path,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN,  bottomMargin=18*mm,
        title="Pattern Breaker Workbook",
        author="The Oracle — elemental.bond",
    )
    doc.addPageTemplates([cover_tpl, inner_tpl])

    # Build story
    story = []
    story.extend(build_cover(S))

    # Switch to inner template after cover
    from reportlab.platypus import NextPageTemplate
    story.append(NextPageTemplate('Inner'))

    with open(md_path, 'r', encoding='utf-8') as f:
        md = f.read()

    # Strip front-matter metadata lines (title / subtitle / brand header)
    # They start from line 1 through the first blank line block
    story.extend(parse_md(md, S))

    doc.build(story)
    print(f"PDF written → {out_path}")


if __name__ == "__main__":
    base = os.path.dirname(os.path.abspath(__file__))
    md_path  = os.path.join(base, "pattern_breaker_workbook.md")
    out_path = os.path.join(base, "Pattern_Breaker_Workbook_v1.pdf")
    build_doc(md_path, out_path)
