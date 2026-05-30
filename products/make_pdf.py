#!/usr/bin/env python
"""
Pattern Breaker Workbook — Markdown → PDF + Gumroad Upload
Usage: python products/make_pdf.py
"""

import re, os, sys, json, io, uuid, time
import urllib.request, urllib.parse
from pathlib import Path

# ── Config ───────────────────────────────────────────────────────────────────
INPUT_MD   = Path(r"F:\MyTraeProjects\ElementalBond\products\pattern_breaker_workbook.md")
OUTPUT_PDF = Path(r"F:\MyTraeProjects\ElementalBond\products\Pattern_Breaker_Workbook_v1.pdf")
GUMROAD_TOKEN = "Fg6gfHSxxt6e0NM2s4M1Vzb4jNgsDylk2Bjz296YKeA"
PRODUCT_ID    = "bhpmxr"
API_BASE      = "https://api.gumroad.com/v2"

# ── CSS (dark theme, A4) ──────────────────────────────────────────────────────
CSS = """
@page {
  size: A4;
  margin: 22mm 17mm 24mm 17mm;
  background: #0A1628;
  @top-center {
    content: "elemental.bond";
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 7.5pt;
    color: #D4A853;
    letter-spacing: 4px;
    text-transform: uppercase;
  }
  @bottom-left {
    content: "elemental.bond  —  Pattern Reading";
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 7pt;
    color: #4a5a6a;
  }
  @bottom-right {
    content: counter(page);
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 7pt;
    color: #D4A853;
    font-weight: bold;
  }
}
@page cover-page {
  margin: 0;
  background: #000000;
  @top-center  { content: none; }
  @bottom-left { content: none; }
  @bottom-right{ content: none; }
}

* { box-sizing: border-box; }
html, body {
  margin: 0; padding: 0;
  background: #0A1628;
  color: #dce6f0;
  font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
  font-size: 10.5pt;
  line-height: 1.78;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

/* ── Cover ── */
.cover-page {
  page: cover-page;
  page-break-after: always;
  background: #000000;
  height: 297mm;
  width: 210mm;
  padding: 0;
  display: block;
  text-align: center;
}
.cover-inner {
  width: 100%;
  height: 100%;
  padding: 40mm 28mm 32mm;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.cover-badge {
  font-size: 8pt;
  letter-spacing: 6px;
  color: #D4A853;
  text-transform: uppercase;
  margin-bottom: 18mm;
  font-weight: 600;
}
.cover-symbol {
  font-size: 32pt;
  color: #D4A853;
  margin-bottom: 6mm;
  line-height: 1;
}
.cover-h1 {
  font-size: 52pt;
  font-weight: 900;
  color: #D4A853;
  letter-spacing: 7px;
  text-transform: uppercase;
  line-height: 1.0;
  margin: 0 0 5mm;
  border: none;
  padding: 0;
}
.cover-rule {
  width: 70px;
  height: 2px;
  background: #D4A853;
  margin: 7mm auto;
}
.cover-subtitle {
  font-size: 13pt;
  color: #b8c8d8;
  font-style: italic;
  margin: 0 0 4mm;
  line-height: 1.4;
}
.cover-author {
  font-size: 10pt;
  color: #D4A853;
  letter-spacing: 3px;
  margin: 0;
}
.cover-brand {
  font-size: 9pt;
  color: #3a4a5a;
  letter-spacing: 5px;
  text-transform: uppercase;
  margin-top: 24mm;
}

/* ── Headings ── */
h1 {
  color: #D4A853;
  font-size: 21pt;
  font-weight: 900;
  margin: 10mm 0 3mm;
  padding-bottom: 2.5mm;
  border-bottom: 2px solid #D4A853;
  letter-spacing: 0.5px;
  page-break-after: avoid;
}
h1.chapter-start {
  page-break-before: always;
}
h2 {
  color: #D4A853;
  font-size: 14pt;
  font-weight: 700;
  margin: 7mm 0 2.5mm;
  border-bottom: 1px solid #1a2d4a;
  padding-bottom: 2mm;
  page-break-after: avoid;
}
h3 {
  color: #c8a438;
  font-size: 12pt;
  font-weight: 700;
  margin: 5mm 0 2mm;
  page-break-after: avoid;
}
h4 {
  color: #a0b0c0;
  font-size: 10.5pt;
  font-weight: 700;
  margin: 3.5mm 0 1.5mm;
}

/* ── Paragraphs ── */
p { margin: 1.5mm 0 3.5mm; color: #dce6f0; }
p.page-indicator {
  font-size: 8.5pt;
  color: #4a5a6a;
  font-style: italic;
  margin: 0 0 3mm;
}
p.oracle-quote {
  font-style: italic;
  color: #a8b8c8;
  font-size: 11pt;
  border-left: 3px solid #D4A853;
  padding: 3mm 6mm;
  background: #0d1e38;
  margin: 4mm 0;
}

strong { color: #e0cc90; font-weight: 700; }
em     { color: #a8b8c8; font-style: italic; }
code   {
  background: #0d1e38;
  color: #D4A853;
  padding: 1px 5px;
  font-size: 9.5pt;
  border-radius: 2px;
  font-family: 'Consolas', 'Courier New', monospace;
}

/* ── HR ── */
hr {
  border: none;
  border-top: 1px solid #1a2d4a;
  margin: 4mm 0;
}

/* ── Tables ── */
.table-wrap { margin: 4mm 0; width: 100%; overflow: hidden; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt;
  page-break-inside: avoid;
}
th {
  background: #1a2d4a;
  color: #D4A853;
  padding: 2.5mm 3.5mm;
  text-align: left;
  font-weight: 700;
  border: 1px solid #243d5a;
  font-size: 8.5pt;
}
td {
  padding: 2mm 3.5mm;
  border: 1px solid #162840;
  color: #c0ccd8;
  vertical-align: top;
}
tr:nth-child(even) td { background: #0b1929; }
tr:nth-child(odd)  td { background: #0A1628; }

/* ── Lists ── */
ul, ol { margin: 1.5mm 0 3mm 7mm; padding: 0; }
li { margin: 1.5mm 0; color: #dce6f0; line-height: 1.65; }
li strong { color: #D4A853; }

/* ── Blockquotes ── */
blockquote {
  background: #0d1e38;
  border-left: 3px solid #D4A853;
  padding: 3.5mm 6mm;
  margin: 4mm 0;
  border-radius: 0 3px 3px 0;
}
blockquote p { margin: 0; font-style: italic; color: #a8b8c8; }

/* ── Write-in lines ── */
.write-in {
  background: #0d1e38;
  border: 1px solid #243d5a;
  border-radius: 3px;
  height: 11mm;
  margin: 1.5mm 0;
}

/* ── TOC ── */
.toc-section { page-break-after: always; }
"""

# ── Helpers ───────────────────────────────────────────────────────────────────
def esc(s):
    return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def inline_md(s):
    s = esc(s)
    s = re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', s)
    s = re.sub(r'\*\*(.+?)\*\*',     r'<strong>\1</strong>', s)
    s = re.sub(r'\*(.+?)\*',          r'<em>\1</em>', s)
    s = re.sub(r'`(.+?)`',            r'<code>\1</code>', s)
    return s

def emit_table(rows):
    html = ['<div class="table-wrap"><table>']
    header_emitted = False
    past_sep = False
    for row in rows:
        cells = [c.strip() for c in row.strip('|').split('|')]
        # Separator row (|---|---|)
        is_sep = all(re.match(r'^[-:]+$', c.replace(' ','')) for c in cells if c.replace(' ',''))
        if is_sep:
            if not header_emitted:
                html.insert(1, '<thead>')
                html.append('</thead><tbody>')
                header_emitted = True
            past_sep = True
            continue
        tag = 'td' if past_sep else 'th'
        html.append('<tr>' + ''.join(f'<{tag}>{inline_md(c)}</{tag}>' for c in cells) + '</tr>')
    if not header_emitted:
        html.append('</tbody>')
    else:
        html.append('</tbody>')
    html.append('</table></div>')
    return '\n'.join(html)

# ── Markdown → HTML body ──────────────────────────────────────────────────────
def md_to_body(text):
    lines = text.split('\n')
    out   = []
    i     = 0
    n     = len(lines)
    toc_open = False

    while i < n:
        raw     = lines[i]
        stripped = raw.strip()

        # blank
        if not stripped:
            if toc_open:
                out.append('</div>')
                toc_open = False
            i += 1
            continue

        # HR
        if stripped == '---':
            out.append('<hr/>')
            i += 1
            continue

        # H1
        m = re.match(r'^# (.+)$', stripped)
        if m:
            title  = inline_md(m.group(1))
            is_ch  = bool(re.search(r'\bCHAPTER\b|\bINTRODUCTION\b|\bAPPENDIX\b', stripped))
            is_toc = 'TABLE OF CONTENTS' in stripped
            if is_toc:
                if toc_open: out.append('</div>')
                out.append(f'<div class="toc-section"><h1>{title}</h1>')
                toc_open = True
            else:
                cls = ' class="chapter-start"' if is_ch else ''
                out.append(f'<h1{cls}>{title}</h1>')
            i += 1
            continue

        # H2
        m = re.match(r'^## (.+)$', stripped)
        if m:
            out.append(f'<h2>{inline_md(m.group(1))}</h2>')
            i += 1
            continue

        # H3
        m = re.match(r'^### (.+)$', stripped)
        if m:
            out.append(f'<h3>{inline_md(m.group(1))}</h3>')
            i += 1
            continue

        # H4
        m = re.match(r'^#### (.+)$', stripped)
        if m:
            out.append(f'<h4>{inline_md(m.group(1))}</h4>')
            i += 1
            continue

        # Table — collect all consecutive | lines
        if stripped.startswith('|'):
            rows = []
            while i < n and lines[i].strip().startswith('|'):
                rows.append(lines[i].strip())
                i += 1
            out.append(emit_table(rows))
            continue

        # Unordered list
        if re.match(r'^[-*]\s+', stripped):
            out.append('<ul>')
            while i < n and re.match(r'^[-*]\s+', lines[i].strip()):
                item = re.sub(r'^[-*]\s+', '', lines[i].strip())
                out.append(f'<li>{inline_md(item)}</li>')
                i += 1
            out.append('</ul>')
            continue

        # Write-in line (___+)
        if re.match(r'^_{3,}$', stripped):
            out.append('<div class="write-in"></div>')
            i += 1
            continue

        # Blockquote
        if stripped.startswith('> '):
            out.append(f'<blockquote><p>{inline_md(stripped[2:])}</p></blockquote>')
            i += 1
            continue

        # Page indicator: *Pages N–M* or *Page N*
        if re.match(r'^\*Pages?\s+[\d–\-–]+\*$', stripped):
            out.append(f'<p class="page-indicator">{inline_md(stripped)}</p>')
            i += 1
            continue

        # Oracle epigraph quote (standalone italic para starting with *")
        if re.match(r'^\*"', stripped) and stripped.endswith('*'):
            out.append(f'<p class="oracle-quote">{inline_md(stripped.strip("*"))}</p>')
            i += 1
            continue

        # Paragraph — collect continuation lines
        para = []
        while i < n:
            l = lines[i].strip()
            if (not l or l == '---'
                    or re.match(r'^#{1,4}\s', l)
                    or l.startswith('|')
                    or re.match(r'^[-*]\s', l)
                    or re.match(r'^_{3,}$', l)
                    or l.startswith('> ')):
                break
            para.append(inline_md(l))
            i += 1
        if para:
            out.append(f'<p>{" ".join(para)}</p>')
        continue

    if toc_open:
        out.append('</div>')

    return '\n'.join(out)

# ── Cover page HTML ───────────────────────────────────────────────────────────
def build_cover(cover_lines):
    h1 = h2 = author = ''
    for line in cover_lines:
        s = line.strip()
        if re.match(r'^# [^#]', s):
            h1 = re.sub(r'^# ', '', s)
        elif re.match(r'^## [^#]', s):
            h2 = re.sub(r'^## ', '', s)
        elif re.match(r'^### ', s):
            author = re.sub(r'^### \*?', '', s).rstrip('*')
    return f'''<div class="cover-page">
  <div class="cover-inner">
    <div class="cover-badge">The Oracle Series</div>
    <div class="cover-symbol">◈</div>
    <div class="cover-h1">{esc(h1)}</div>
    <div class="cover-rule"></div>
    <p class="cover-subtitle">{esc(h2)}</p>
    <p class="cover-author">{esc(author)}</p>
    <div class="cover-brand">elemental.bond</div>
  </div>
</div>'''

# ── Build full HTML ───────────────────────────────────────────────────────────
def build_html(md_text):
    lines = md_text.split('\n')
    # Find first --- to split cover from body
    cover_end = next((i for i, l in enumerate(lines) if l.strip() == '---'), 0)
    cover_html = build_cover(lines[:cover_end])
    body_html  = md_to_body('\n'.join(lines[cover_end + 1:]))

    return (
        '<!DOCTYPE html>\n<html lang="en">\n<head>'
        '<meta charset="utf-8"/>'
        '<title>Pattern Breaker Workbook — elemental.bond</title>'
        f'<style>{CSS}</style>'
        '</head>\n<body>\n'
        + cover_html + '\n'
        + body_html + '\n'
        '</body>\n</html>'
    )

# ── Step 1: Generate PDF ──────────────────────────────────────────────────────
def generate_pdf():
    print('[1/4] Reading markdown...')
    md_text = INPUT_MD.read_text(encoding='utf-8')
    print(f'      {len(md_text):,} chars, {md_text.count(chr(10))} lines')

    print('[2/4] Building HTML...')
    html = build_html(md_text)

    # Sanity: save HTML for inspection
    html_path = OUTPUT_PDF.with_suffix('.html')
    html_path.write_text(html, encoding='utf-8')
    print(f'      HTML preview saved → {html_path.name}')

    print('[3/4] Rendering PDF with WeasyPrint...')
    from weasyprint import HTML, CSS as WCSS
    doc = HTML(string=html, base_url=str(OUTPUT_PDF.parent))
    doc.write_pdf(str(OUTPUT_PDF))

    size_kb = OUTPUT_PDF.stat().st_size // 1024
    print(f'      ✓ PDF saved → {OUTPUT_PDF.name}  ({size_kb} KB)')
    return True

# ── Gumroad helpers ───────────────────────────────────────────────────────────
def _gumroad_request(method, path, data=None, files=None):
    """Make a Gumroad API request. Returns (success, response_dict)."""
    url = f'{API_BASE}{path}'
    headers = {'Authorization': f'Bearer {GUMROAD_TOKEN}'}

    if files:
        # Build multipart/form-data
        boundary = uuid.uuid4().hex
        body = b''
        if data:
            for k, v in data.items():
                body += (
                    f'--{boundary}\r\n'
                    f'Content-Disposition: form-data; name="{k}"\r\n\r\n'
                    f'{v}\r\n'
                ).encode()
        for field, (fname, fdata, ctype) in files.items():
            body += (
                f'--{boundary}\r\n'
                f'Content-Disposition: form-data; name="{field}"; filename="{fname}"\r\n'
                f'Content-Type: {ctype}\r\n\r\n'
            ).encode() + fdata + b'\r\n'
        body += f'--{boundary}--\r\n'.encode()
        headers['Content-Type'] = f'multipart/form-data; boundary={boundary}'
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
    elif data is not None:
        encoded = urllib.parse.urlencode(data).encode()
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        req = urllib.request.Request(url, data=encoded, headers=headers, method=method)
    else:
        req = urllib.request.Request(url, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            resp = json.loads(r.read())
        return resp.get('success', False), resp
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors='replace')
        print(f'      HTTP {e.code}: {body[:300]}')
        return False, {}
    except Exception as ex:
        print(f'      Request error: {ex}')
        return False, {}

# ── Step 2: Upload PDF to Gumroad ─────────────────────────────────────────────
def upload_to_gumroad():
    print('\n[4/4] Uploading PDF to Gumroad...')
    pdf_bytes = OUTPUT_PDF.read_bytes()
    fname     = OUTPUT_PDF.name

    # Try product_files endpoint
    ok, resp = _gumroad_request(
        'POST',
        f'/products/{PRODUCT_ID}/product_files',
        files={'file': (fname, pdf_bytes, 'application/pdf')},
    )
    if ok:
        fid = resp.get('product_file', {}).get('id', '?')
        print(f'      ✓ File uploaded via /product_files  (file_id: {fid})')
        return True

    print('      /product_files failed — trying PUT /products/{id}...')
    ok, resp = _gumroad_request(
        'PUT',
        f'/products/{PRODUCT_ID}',
        files={'file': (fname, pdf_bytes, 'application/pdf')},
    )
    if ok:
        print('      ✓ File uploaded via PUT /products/{id}')
        return True

    print('      ⚠ Both upload endpoints failed.')
    print('        Upload manually at: https://app.gumroad.com/products/' + PRODUCT_ID + '/edit')
    print(f'        File ready at: {OUTPUT_PDF}')
    return False

# ── Step 3: Verify product status ─────────────────────────────────────────────
def verify_product():
    print('\n[✓]  Verifying product status...')
    ok, resp = _gumroad_request('GET', f'/products/{PRODUCT_ID}')
    if not ok:
        print('     Could not fetch product status.')
        return

    p = resp.get('product', {})
    published  = p.get('published', False)
    name       = p.get('name', '?')
    price      = p.get('price', 0)
    files_cnt  = len(p.get('product_files', []))

    status_icon = '✓' if published else '✗'
    print(f'     {status_icon} Name:      {name}')
    print(f'       Published: {published}')
    print(f'       Price:     ${price/100:.2f}')
    print(f'       Files:     {files_cnt}')
    print(f'       URL:       https://app.gumroad.com/l/{PRODUCT_ID}')

    if not published:
        print('\n     Product not published — publishing now...')
        ok2, _ = _gumroad_request('PUT', f'/products/{PRODUCT_ID}', data={'published': 'true'})
        if ok2:
            print('     ✓ Published.')
        else:
            print('     ✗ Could not publish via API — do it at:')
            print(f'       https://app.gumroad.com/products/{PRODUCT_ID}/edit')

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print('=' * 55)
    print('Pattern Breaker Workbook — PDF Builder')
    print('=' * 55)
    t0 = time.time()

    generate_pdf()
    upload_to_gumroad()
    verify_product()

    elapsed = time.time() - t0
    print(f'\nDone in {elapsed:.1f}s')
    print('=' * 55)

if __name__ == '__main__':
    main()
