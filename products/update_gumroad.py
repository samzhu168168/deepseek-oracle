"""
Gumroad Product Description Updater
Run: python3 products/update_gumroad.py
Requires: GUMROAD_TOKEN set in .env (already configured)
"""

import urllib.request
import urllib.parse
import json
import os
import sys

# ── Config ─────────────────────────────────────────────────────────────────────

GUMROAD_TOKEN = os.getenv("GUMROAD_TOKEN", "Fg6gfHSxxt6e0NM2s4M1Vzb4jNgsDylk2Bjz296YKeA")
BASE_URL = "https://api.gumroad.com/v2"

# Products with known IDs — add new product IDs here after creating them on Gumroad
PRODUCTS = {
    "pattern_breaker_workbook": {
        "id": "bhpmxr",
        "name": "Pattern Breaker Workbook",
        "price_cents": 1700,  # $17
        "description": """<h2>You've dated the wrong person before. You're about to do it again — unless you see the pattern first.</h2>

<p>You're not unlucky in love. You're running an elemental program you've never seen clearly enough to change.</p>

<p>The <strong>Pattern Breaker Workbook</strong> is a 30-page self-diagnostic guide built on BaZi — 3,000-year-old Chinese elemental pattern recognition — designed specifically to show you the invisible architecture beneath your relationship history.</p>

<p>This is not a book about astrology. It's a book about <em>why you keep doing the same thing.</em></p>

<hr/>

<h3>What's inside:</h3>

<ul>
<li><strong>Chapter 1 — The 5 Elemental Archetypes in Love:</strong> A full breakdown of how Wood, Fire, Earth, Metal, and Water people love — and what they do that quietly destroys relationships. Including an interaction matrix showing which elements nourish each other and which ones create tension.</li>
<li><strong>Chapter 2 — Your Pattern Diagnosis:</strong> A 20-question quiz that identifies your dominant elemental pattern in relationships — not who you are, but who you become when you fall for someone. Plus a full scoring guide and pattern profile.</li>
<li><strong>Chapter 3 — The 3 Loops You Keep Repeating:</strong> The Attraction Loop (why you're drawn to the same type), the Depletion Loop (why giving everything never feels like enough), and the Return Loop (why you can't fully let go). Named, mapped, and explained.</li>
<li><strong>Chapter 4 — Breaking the Cycle:</strong> Four structured exercises including a Relationship Timeline Map, Elemental Needs Audit, Red Flag Decoder (by element), and a New Decision Framework for future relationships.</li>
<li><strong>Chapter 5 — Your New Elemental Blueprint:</strong> Your elemental strengths, nourishment map, and a concrete 2026 action plan based on your element's Snake Year forecast.</li>
</ul>

<hr/>

<h3>This workbook is for you if:</h3>

<ul>
<li>You've done the therapy and understand your patterns intellectually — but keep repeating them anyway</li>
<li>You attract the same type of person regardless of how different they seem at first</li>
<li>You give everything in relationships and still feel like it's never enough</li>
<li>You can't fully explain why you're still thinking about someone who wasn't right for you</li>
<li>You want a framework that goes deeper than attachment theory</li>
</ul>

<hr/>

<p><strong>Format:</strong> 30-page PDF workbook, printable or fillable on screen<br/>
<strong>Includes:</strong> Full BaZi element guide + 4 exercises + 2026 Snake Year action plan<br/>
<strong>Bonus:</strong> Free BaZi element reading at elemental.bond (takes 2 minutes)</p>

<p><em>"The pattern is not your destiny. But you have to see it before you can choose differently."</em><br/>
— The Oracle</p>""",
    },

    "snake_year_forecast": {
        "id": "swpdpb",
        "name": "2026 Snake Year Love Forecast — Personalized BaZi Report",
        "price_cents": 2700,  # $27
        "description": """<h2>2026 will change your love life. The question is whether you'll understand why — or just feel it.</h2>

<p>The Fire Snake Year (2026) is one of the most significant relationship years of the decade. For some elements, it brings the love they've been waiting for. For others, it surfaces truths they've been avoiding. For all five elements — it changes things.</p>

<p>Your <strong>2026 Snake Year Love Forecast</strong> is a personalized, 10-page report based on your BaZi Day Master element — calculated from your birth date using 3,000-year-old Chinese elemental timing.</p>

<p>This is not a generic horoscope. It's your specific elemental forecast for 2026 — with quarterly breakdowns, a peak window, a challenge period, and three concrete action steps.</p>

<hr/>

<h3>Your report includes:</h3>

<ul>
<li><strong>The Snake Year Context:</strong> What Fire Snake energy means globally for relationships in 2026 — and the 4 key dates that matter for your element specifically</li>
<li><strong>Your Elemental Profile:</strong> A deep read on how your Day Master element operates in love — your core gifts, your shadow, and the pattern that's been running beneath your relationship history</li>
<li><strong>Quarterly Forecast:</strong> What Q1 through Q4 of 2026 brings for your element specifically — including your peak attraction window and your most challenging period</li>
<li><strong>3 Personalized Action Steps:</strong> Concrete, element-specific actions for navigating love in 2026 — not generic advice, but directives built around how your element actually operates</li>
<li><strong>Your 2026 Love Theme:</strong> The one word that defines your elemental challenge and opportunity this year</li>
</ul>

<hr/>

<h3>This report is for you if:</h3>

<ul>
<li>You want to understand why 2026 feels different — because it is</li>
<li>You're at a turning point in your love life and want an elemental framework for navigating it</li>
<li>You've just gone through a breakup and want to know what comes next</li>
<li>You're single and wondering when your window opens</li>
<li>You're in something uncertain and want clarity about whether it belongs in your next chapter</li>
</ul>

<hr/>

<p><strong>How it works:</strong><br/>
Enter your birth date at checkout → Your Day Master is calculated → Your personalized 10-page PDF is delivered to your email within minutes</p>

<p><strong>Format:</strong> 10-page personalized PDF<br/>
<strong>Delivery:</strong> Instant digital download<br/>
<strong>Includes:</strong> Full elemental profile + quarterly forecast + 3 action steps</p>

<p><em>"2026 is not a year that leaves things unchanged. The Oracle shows you where your element is headed — so you can meet it with your eyes open."</em></p>""",
    },

    "compatibility_guide": {
        "id": None,  # Create this product on Gumroad first, then add ID here
        "name": "BaZi Elemental Compatibility Guide",
        "price_cents": 3700,  # $37
        "description": """<h2>The reason you two keep having the same fight — mapped, explained, and given a way through.</h2>

<p>Chemistry is real. Elemental compatibility is the reason chemistry either builds into something lasting or burns itself out inside of two years.</p>

<p>The <strong>BaZi Elemental Compatibility Guide</strong> is a 25-page deep-dive into how the Five Elements interact in romantic partnership — which pairings nourish, which ones create productive tension, and which ones carry an inherent dynamic that, unaddressed, will always end the same way.</p>

<p>This guide works whether you're single (understanding what to look for), newly in something (understanding what you're working with), or years in (finally understanding why the same conflicts keep surfacing).</p>

<hr/>

<h3>What's covered:</h3>

<ul>
<li><strong>The Generating Cycle Pairings:</strong> The 5 combinations where elements naturally nourish each other — Wood-Water, Fire-Wood, Earth-Fire, Metal-Earth, Water-Metal — with a full relationship portrait of each pairing, including strengths, challenges, and long-term prognosis</li>
<li><strong>The Controlling Cycle Pairings:</strong> The 5 high-tension, high-growth pairings — Metal-Wood, Earth-Water, Water-Fire, Fire-Metal, Wood-Earth — including the attraction dynamic, the conflict pattern, and what's required to make it work</li>
<li><strong>Same-Element Relationships:</strong> What happens when two Wood people date; when two Fires meet; when Earth meets Earth — element-specific analysis of mirror relationships</li>
<li><strong>The Compatibility Score System:</strong> A simple framework for assessing any pairing on four dimensions: attraction, sustainability, growth, and friction</li>
<li><strong>The Communication Gap Guide:</strong> How each element expresses love differently — and a translation guide so partners can finally understand what the other is actually giving</li>
<li><strong>The Repair Map:</strong> For existing relationships — an element-specific guide to repairing the most common damage patterns</li>
</ul>

<hr/>

<h3>This guide is for you if:</h3>

<ul>
<li>You want to understand a current relationship at an elemental level</li>
<li>You're re-entering dating after a significant relationship and want a clearer filter</li>
<li>You and your partner keep having the same argument and don't know why</li>
<li>You want to know whether your elemental pairing has a real future — or whether you're just doing the same loop better</li>
</ul>

<hr/>

<p><strong>Format:</strong> 25-page PDF guide<br/>
<strong>Includes:</strong> All 10 pairing portraits + compatibility scoring framework + communication gap guide<br/>
<strong>Bonus:</strong> Free compatibility reading for you and one partner at elemental.bond</p>

<p><em>"It's not that you're incompatible. It's that you're running two different elemental programs and calling it a personality conflict."</em><br/>
— The Oracle</p>""",
    },

    "oracle_bundle": {
        "id": None,  # Create this product on Gumroad first, then add ID here
        "name": "The Oracle Collection — Complete BaZi Relationship System",
        "price_cents": 6700,  # $67 (vs $81 separately)
        "description": """<h2>Everything you need to see the pattern, understand the year, and choose differently. All three Oracle products — one complete system.</h2>

<p>The <strong>Oracle Collection</strong> brings together all three elemental relationship tools into one complete system — at $14 less than purchasing them separately.</p>

<p>This is the complete Oracle toolkit: from pattern diagnosis to annual forecast to compatibility analysis. It doesn't matter where you are in your love life — single, in something complicated, freshly out of a relationship, or years into a partnership — this collection meets you there.</p>

<hr/>

<h3>What's included:</h3>

<p><strong>1. Pattern Breaker Workbook ($17 value)</strong><br/>
30 pages. Identifies your elemental archetype in love, maps your 3 repeating loops, and gives you a concrete framework for choosing differently. The foundation.</p>

<p><strong>2. 2026 Snake Year Love Forecast ($27 value)</strong><br/>
Personalized 10-page report. Your elemental forecast for the Fire Snake year — quarterly breakdown, peak window, challenge period, and 3 concrete action steps. The timing layer.</p>

<p><strong>3. BaZi Elemental Compatibility Guide ($37 value)</strong><br/>
25 pages. All 10 elemental pairing portraits. The communication gap guide. The repair map. Everything you need to understand any relationship at an elemental level. The relational layer.</p>

<hr/>

<h3>Together, these three tools give you:</h3>

<ul>
<li><strong>Self-knowledge:</strong> Your elemental pattern in love — what you give, what you need, what you keep repeating</li>
<li><strong>Timing:</strong> When to move in 2026, when to wait, and what your element's window is</li>
<li><strong>Relational clarity:</strong> Whether the person you're with (or drawn to) is a generating or controlling force — and what that means long-term</li>
</ul>

<hr/>

<p><strong>Format:</strong> 3 PDFs delivered instantly (65 pages total)<br/>
<strong>Total value:</strong> $81 | <strong>Bundle price:</strong> $67 | <strong>You save:</strong> $14<br/>
<strong>Includes:</strong> Free BaZi element reading + compatibility reading at elemental.bond</p>

<p><em>"The Oracle doesn't predict your future. It reveals what's already operating — so you can finally make a different choice."</em></p>

<p><strong>This is the complete system. Everything else is a starting point.</strong></p>""",
    },
}

# ── Gumroad API calls ───────────────────────────────────────────────────────────

def list_products():
    """List all products on Gumroad account."""
    req = urllib.request.Request(
        f"{BASE_URL}/products",
        headers={"Authorization": f"Bearer {GUMROAD_TOKEN}"},
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.loads(r.read())
    return data.get("products", [])


def update_product(product_id: str, name: str, description: str, price_cents: int) -> dict:
    """Update a Gumroad product's name, description, and price."""
    payload = urllib.parse.urlencode({
        "name": name,
        "description": description,
        "price": price_cents,
    }).encode()
    req = urllib.request.Request(
        f"{BASE_URL}/products/{product_id}",
        data=payload,
        headers={
            "Authorization": f"Bearer {GUMROAD_TOKEN}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="PUT",
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())


def create_product(name: str, description: str, price_cents: int) -> dict:
    """Create a new Gumroad product."""
    payload = urllib.parse.urlencode({
        "name": name,
        "description": description,
        "price": price_cents,
    }).encode()
    req = urllib.request.Request(
        f"{BASE_URL}/products",
        data=payload,
        headers={
            "Authorization": f"Bearer {GUMROAD_TOKEN}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())


# ── Main ────────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("Gumroad Product Updater — elemental.bond")
    print("=" * 60)

    # Step 1: List existing products for verification
    print("\n[1/3] Fetching existing products...")
    try:
        existing = list_products()
        print(f"  Found {len(existing)} existing product(s):")
        for p in existing:
            print(f"  → {p['id']} | {p['name']} | ${p['price']/100:.2f}")
    except Exception as e:
        print(f"  ERROR fetching products: {e}")
        sys.exit(1)

    # Step 2: Update or create each product
    print("\n[2/3] Updating products...")
    results = {}

    for key, product in PRODUCTS.items():
        pid = product["id"]
        name = product["name"]
        desc = product["description"]
        price = product["price_cents"]

        if pid:
            # Update existing product
            print(f"\n  Updating: {name} (ID: {pid})")
            try:
                result = update_product(pid, name, desc, price)
                if result.get("success"):
                    results[key] = {"status": "updated", "id": pid, "name": name}
                    print(f"  ✓ Updated successfully")
                else:
                    print(f"  ✗ Update failed: {result}")
                    results[key] = {"status": "failed", "error": str(result)}
            except Exception as e:
                print(f"  ✗ Error: {e}")
                results[key] = {"status": "error", "error": str(e)}
        else:
            # Create new product
            print(f"\n  Creating: {name} (new product)")
            try:
                result = create_product(name, desc, price)
                if result.get("success"):
                    new_id = result["product"]["id"]
                    results[key] = {"status": "created", "id": new_id, "name": name}
                    print(f"  ✓ Created successfully — new ID: {new_id}")
                    print(f"  ⚠ Add this ID to PRODUCTS['{key}']['id'] in this script")
                    print(f"  ⚠ Add GUMROAD_PRODUCT_ID_{key.upper()}={new_id} to .env")
                else:
                    print(f"  ✗ Create failed: {result}")
                    results[key] = {"status": "failed", "error": str(result)}
            except Exception as e:
                print(f"  ✗ Error: {e}")
                results[key] = {"status": "error", "error": str(e)}

    # Step 3: Summary
    print("\n[3/3] Summary")
    print("-" * 40)
    for key, r in results.items():
        status_icon = "✓" if r["status"] in ("updated", "created") else "✗"
        print(f"  {status_icon} {r.get('name', key)}: {r['status'].upper()}")
        if r["status"] in ("updated", "created"):
            print(f"    ID: {r['id']}")

    print("\nDone. Visit https://app.gumroad.com/products to verify changes.")
    print("=" * 60)


if __name__ == "__main__":
    main()
