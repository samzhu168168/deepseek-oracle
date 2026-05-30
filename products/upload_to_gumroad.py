"""
Upload Pattern_Breaker_Workbook_v1.pdf to Gumroad product bhpmxr
and confirm the product is published with a downloadable file.
"""

import os
import json
import requests

TOKEN   = "Fg6gfHSxxt6e0NM2s4M1Vzb4jNgsDylk2Bjz296YKeA"
PRODUCT_PERMALINK = "bhpmxr"
PDF_PATH = os.path.join(os.path.dirname(__file__), "Pattern_Breaker_Workbook_v1.pdf")

HEADERS = {"Authorization": f"Bearer {TOKEN}"}

def get_product():
    r = requests.get(
        f"https://api.gumroad.com/v2/products/{PRODUCT_PERMALINK}",
        headers=HEADERS,
    )
    r.raise_for_status()
    return r.json()

def try_upload_product_file(product_id: str):
    """Try POST /v2/products/{id}/product_files with the internal ID."""
    url = f"https://api.gumroad.com/v2/products/{product_id}/product_files"
    with open(PDF_PATH, "rb") as f:
        files = {"file": ("Pattern_Breaker_Workbook_v1.pdf", f, "application/pdf")}
        r = requests.post(url, headers=HEADERS, files=files)
    print(f"[product_files with internal id] status={r.status_code}")
    try:
        print(json.dumps(r.json(), indent=2))
    except Exception:
        print(r.text[:500])
    return r

def try_upload_permalink_file():
    """Try POST /v2/products/{permalink}/product_files."""
    url = f"https://api.gumroad.com/v2/products/{PRODUCT_PERMALINK}/product_files"
    with open(PDF_PATH, "rb") as f:
        files = {"file": ("Pattern_Breaker_Workbook_v1.pdf", f, "application/pdf")}
        r = requests.post(url, headers=HEADERS, files=files)
    print(f"[product_files with permalink] status={r.status_code}")
    try:
        print(json.dumps(r.json(), indent=2))
    except Exception:
        print(r.text[:500])
    return r

def check_product_files(product_id: str):
    """GET /v2/products/{id}/product_files."""
    r = requests.get(
        f"https://api.gumroad.com/v2/products/{product_id}/product_files",
        headers=HEADERS,
    )
    print(f"[GET product_files] status={r.status_code}")
    try:
        print(json.dumps(r.json(), indent=2))
    except Exception:
        print(r.text[:300])

if __name__ == "__main__":
    print("=" * 60)
    print("Step 1: Get product info")
    info = get_product()
    if not info.get("success"):
        print("ERROR:", info)
        exit(1)
    product = info["product"]
    internal_id = product["id"]
    print(f"  Name:      {product['name']}")
    print(f"  Internal ID: {internal_id}")
    print(f"  Published: {product['published']}")
    print(f"  Files:     {product.get('files', [])}")

    print()
    print("=" * 60)
    print("Step 2: Upload PDF (trying internal ID path)")
    r1 = try_upload_product_file(internal_id)

    if r1.status_code not in (200, 201):
        print()
        print("Retrying with permalink path...")
        r2 = try_upload_permalink_file()

    print()
    print("=" * 60)
    print("Step 3: Verify product files")
    check_product_files(internal_id)

    print()
    print("=" * 60)
    print("Step 4: Final product status")
    final = get_product()
    p = final["product"]
    print(f"  Published: {p['published']}")
    print(f"  Files count: {len(p.get('files', []))}")
    for f in p.get("files", []):
        print(f"    - {f.get('name')} ({f.get('size')} bytes)")
    if p["published"] and p.get("files"):
        print("\n✓ Product is published with downloadable file.")
    elif p["published"]:
        print("\n⚠  Product is published but no file attached — check Gumroad dashboard.")
    else:
        print("\n✗ Product is NOT published.")
