"""PayPal payment integration — create & capture orders, generate full reports."""

from __future__ import annotations
import base64
import hashlib
import json
from datetime import datetime, timezone
from flask import Blueprint, current_app, jsonify, request

import requests

paypal_bp = Blueprint("paypal", __name__)

# In-memory report cache (same pattern as license.py)
_report_cache: dict[str, dict] = {}


def _paypal_headers(app) -> dict:
    """Build Authorization header for PayPal REST API."""
    client_id = app.config.get("PAYPAL_CLIENT_ID", "")
    secret = app.config.get("PAYPAL_SECRET", "")
    if not client_id or not secret:
        raise ValueError("PayPal credentials not configured")
    encoded = base64.b64encode(f"{client_id}:{secret}".encode()).decode()
    return {
        "Authorization": f"Basic {encoded}",
        "Content-Type": "application/json",
    }


def _paypal_base(app) -> str:
    """Return sandbox or live base URL."""
    if app.config.get("PAYPAL_SANDBOX", False):
        return "https://api-m.sandbox.paypal.com"
    return "https://api-m.paypal.com"


# ── Route 1: Create Order ────────────────────────────────


@paypal_bp.route("/api/paypal/create-order", methods=["POST", "OPTIONS"])
def create_order():
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}
    price = data.get("price", "24.90")
    currency = data.get("currency", "USD")

    try:
        headers = _paypal_headers(current_app)
        base = _paypal_base(current_app)
        resp = requests.post(
            f"{base}/v2/checkout/orders",
            headers=headers,
            json={
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "amount": {
                            "currency_code": currency,
                            "value": price,
                        },
                        "description": "Elemental Bond — Full BaZi Compatibility Report",
                    }
                ],
                "application_context": {
                    "brand_name": "Elemental Bond",
                    "shipping_preference": "NO_SHIPPING",
                },
            },
            timeout=15,
        )
        result = resp.json()
        if resp.status_code not in (200, 201):
            return jsonify({"success": False, "error": result.get("message", "PayPal error")}), 502

        return jsonify({"success": True, "order_id": result["id"]})

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 503
    except requests.RequestException as e:
        return jsonify({"success": False, "error": f"PayPal API error: {str(e)}"}), 502


# ── Route 2: Capture Order + Generate Report ─────────────


@paypal_bp.route("/api/paypal/capture-order", methods=["POST", "OPTIONS"])
def capture_order():
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}
    order_id = (data.get("order_id") or "").strip()
    person1 = data.get("person1", {})
    person2 = data.get("person2", {})
    score = data.get("score", 75)
    element_pair = data.get("element_pair", "Unknown")

    if not order_id:
        return jsonify({"success": False, "error": "order_id is required."}), 400

    try:
        headers = _paypal_headers(current_app)
        base = _paypal_base(current_app)

        # Step 1: Capture the PayPal order
        capture_resp = requests.post(
            f"{base}/v2/checkout/orders/{order_id}/capture",
            headers=headers,
            timeout=15,
        )
        capture_result = capture_resp.json()

        if capture_resp.status_code not in (200, 201):
            return jsonify({
                "success": False,
                "error": capture_result.get("message", "Payment capture failed"),
            }), 502

        # Verify payment completed
        status = capture_result.get("status", "")
        if status != "COMPLETED":
            return jsonify({
                "success": False,
                "error": f"Payment not completed (status: {status})",
            }), 400

        # Extract payer info for reference
        payer = capture_result.get("payer", {})
        purchase_id = capture_result.get("id", order_id)

        # Step 2: Generate report (same logic as license.py)
        cache_key = hashlib.sha256(order_id.encode()).hexdigest()
        if cache_key in _report_cache:
            return jsonify({"success": True, "report": _report_cache[cache_key], "purchase_id": purchase_id})

        prompt = _build_report_prompt(person1, person2, score, element_pair, datetime.now().year)

        from app.llm_providers import create_provider

        provider_name = str(current_app.config.get("LLM_PROVIDER", "fallback"))
        model = str(current_app.config.get("LLM_MODEL", "claude-sonnet-4-6"))
        provider = create_provider(provider_name, model, app_config=current_app.config)
        result = provider.generate(prompt, timeout_s=60)
        raw_text = (result.content or "").strip()

        # Parse AI JSON
        try:
            clean = raw_text.strip()
            if clean.startswith("```"):
                clean = clean.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            report = json.loads(clean)
        except (json.JSONDecodeError, IndexError):
            report = {
                "fullAnalysis": raw_text,
                "palaceReadings": {
                    "person1": "See full analysis above.",
                    "person2": "See full analysis above.",
                    "combined": "See full analysis above.",
                },
                "timingWindows": {
                    "q2_2026": "See full analysis above.",
                    "q3_2026": "See full analysis above.",
                    "q4_2026": "See full analysis above.",
                },
                "karmicProtocol": [raw_text],
                "elementAdvice": "",
            }

        _report_cache[cache_key] = report
        return jsonify({"success": True, "report": report, "purchase_id": purchase_id})

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 503
    except requests.RequestException as e:
        return jsonify({"success": False, "error": f"PayPal API error: {str(e)}"}), 502


# ── Report prompt (shared with license.py logic) ─────────


def _build_report_prompt(person1: dict, person2: dict, score: int, element_pair: str, year: int) -> str:
    return f"""You are a master BaZi (Chinese Four Pillars) astrologer with 30 years of experience.

Generate a complete, personalized compatibility report for this couple. Return ONLY valid JSON, no markdown, no preamble.

Input data:
- Person 1: Born {person1.get('date', 'unknown')} at {person1.get('time', 'unknown')}, {person1.get('gender', 'unknown')}
- Person 2: Born {person2.get('date', 'unknown')} at {person2.get('time', 'unknown')}, {person2.get('gender', 'unknown')}
- Element Pair: {element_pair}
- Soul Resonance Score: {score}/100
- Current Year: {year}

Return this exact JSON structure (all fields required, write substantively — minimum 60 words per field):

{{
  "fullAnalysis": "800-word deep analysis of their BaZi compatibility, covering Day Masters, hidden elements, elemental interactions, relationship strengths and growth areas. Use **bold** for key terms. Be specific and personal.",
  "palaceReadings": {{
    "person1": "Analysis of Person 1's Day Master palace, dominant element, and how it shows up in relationships (80 words)",
    "person2": "Analysis of Person 2's Day Master palace, dominant element, and how it shows up in relationships (80 words)",
    "combined": "How their two palaces interact — clashes, harmonies, transformation cycles (100 words)"
  }},
  "timingWindows": {{
    "q2_2026": "Specific astrological window for April–June {year}: what energies are activated, best actions to take together (60 words)",
    "q3_2026": "Specific astrological window for July–September {year}: what to watch for, opportunities or caution points (60 words)",
    "q4_2026": "Specific astrological window for October–December {year}: closing cycle, what to consolidate (60 words)"
  }},
  "karmicProtocol": [
    "Action step 1: specific practice for this element pair (30 words)",
    "Action step 2: communication technique based on their Day Masters (30 words)",
    "Action step 3: timing ritual or seasonal practice (30 words)",
    "Action step 4: challenge to navigate together (30 words)",
    "Action step 5: long-term growth direction (30 words)"
  ],
  "elementAdvice": "150-word section on the unique advantages of their specific element combination — what makes {element_pair} pairings rare and powerful, practical ways to amplify this energy"
}}"""
