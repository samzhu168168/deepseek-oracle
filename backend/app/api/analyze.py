import hashlib

from flask import Blueprint, jsonify, request
import requests as http_requests

analyze_bp = Blueprint("analyze", __name__)
GUMROAD_PRODUCT = "bhpmxr"


def verify_gumroad_key(license_key: str) -> bool:
    try:
        resp = http_requests.post(
            "https://api.gumroad.com/v2/licenses/verify",
            data={"product_permalink": GUMROAD_PRODUCT, "license_key": license_key},
            timeout=60,
        )
        return resp.json().get("success", False)
    except Exception:
        return False


def _build_radar_scores(person_a: dict, person_b: dict) -> dict[str, int]:
    seed_input = f"{person_a.get('date','')}-{person_a.get('time','')}-{person_a.get('gender','')}-{person_b.get('date','')}-{person_b.get('time','')}-{person_b.get('gender','')}"
    seed_hex = hashlib.sha256(seed_input.encode("utf-8")).hexdigest()[:8]
    seed = int(seed_hex, 16)
    base_values = [0, 7, 13, 19]
    scores = [55 + ((seed + offset) % 41) for offset in base_values]
    if len(set(scores)) < 4:
        scores = list(dict.fromkeys(scores))
        while len(scores) < 4:
            next_value = (scores[-1] + 3 - 55) % 41 + 55
            if next_value not in scores:
                scores.append(next_value)
    return {
        "Elemental Harmony": scores[0],
        "Soul Resonance": scores[1],
        "Growth Catalyst": scores[2],
        "Karmic Bond": scores[3],
    }


@analyze_bp.route("/analyze", methods=["POST", "OPTIONS"])
def analyze():
    print("=== 收到analyze请求 ===")
    try:
        body = request.get_json() or {}
        print(f"请求数据: {body}")
        person_a = body.get("person_a", {})
        person_b = body.get("person_b", {})
        license_key = body.get("license_key", "").strip()
        if not person_a.get("date") or not person_b.get("date"):
            return jsonify({"error": "Birth dates required"}), 400
        radar_scores = _build_radar_scores(person_a, person_b)
        if license_key:
            if not verify_gumroad_key(license_key):
                return jsonify({"error": "Invalid license key"}), 403
            from app.services.divination_service import generate_full_report

            report_text = generate_full_report(person_a, person_b)
            result = {
                "teaser": {
                    "summary": report_text,
                    "five_element_compatibility": "",
                    "radar_scores": radar_scores,
                },
                "full_report": report_text,
                "license_valid": True,
            }
        else:
            from app.services.divination_service import generate_free_report

            report_text = generate_free_report(person_a, person_b)
            result = {
                "teaser": {
                    "summary": report_text,
                    "five_element_compatibility": "",
                    "radar_scores": radar_scores,
                },
                "full_report": None,
                "license_valid": False,
            }
        print("=== analyze完成，返回结果 ===")
        return jsonify({"success": True, "data": result})
    except Exception as e:
        print(f"=== analyze报错: {str(e)} ===")
        return jsonify({"error": str(e)}), 500
