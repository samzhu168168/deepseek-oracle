from flask import Blueprint, jsonify, request
import logging
import requests as http_requests

analyze_bp = Blueprint("analyze", __name__)
logger = logging.getLogger(__name__)
GUMROAD_PRODUCT = "bhpmxr"


def verify_gumroad_key(license_key: str) -> bool:
    try:
        resp = http_requests.post(
            "https://api.gumroad.com/v2/licenses/verify",
            data={"product_permalink": GUMROAD_PRODUCT, "license_key": license_key},
            timeout=10,
        )
        return resp.json().get("success", False)
    except Exception:
        return False


@analyze_bp.route("/analyze", methods=["POST", "OPTIONS"])
def analyze():
    logger.info("received analyze request")
    body = request.get_json() or {}
    try:
        logger.info("analyze payload: %s", body)
    except Exception:
        pass
    person_a = body.get("person_a", {})
    person_b = body.get("person_b", {})
    license_key = body.get("license_key", "").strip()
    if not person_a.get("date") or not person_b.get("date"):
        return jsonify({"error": "Birth dates required"}), 400
    if license_key:
        if not verify_gumroad_key(license_key):
            return jsonify({"error": "Invalid license key"}), 403
        from app.services.divination_service import generate_full_report

        result = {"type": "full", "report": generate_full_report(person_a, person_b)}
        logger.info("analyze completed (full)")
        return jsonify(result)
    from app.services.divination_service import generate_free_report

    result = {"type": "free", "report": generate_free_report(person_a, person_b)}
    logger.info("analyze completed (free)")
    return jsonify(result)
