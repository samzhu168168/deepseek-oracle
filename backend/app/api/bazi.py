"""Individual BaZi reading — birth chart analysis for one person."""

from __future__ import annotations
import json
from datetime import datetime
from flask import Blueprint, current_app, jsonify, request

bazi_bp = Blueprint("bazi", __name__)


def _build_bazi_prompt(date: str, time_str: str, gender: str, name: str) -> str:
    return f"""You are a master BaZi astrologer. Return ONLY valid JSON.

Input: {name or 'Unknown'} | {date} | {time_str or 'unknown'} | {gender} | Year {datetime.now().year}

Calculate the Four Pillars (Year/Month/Day/Hour stems-branches). Keep each field short (1-2 sentences):

{{
  "fourPillars": {{"year":"","month":"","day":"","hour":""}},
  "dayMaster": "Day Master element and meaning (1-2 sentences)",
  "fiveElementBalance": "Element balance (1-2 sentences)",
  "personality": "Key traits (1-2 sentences)",
  "careerAndWealth": "Career (1-2 sentences)",
  "relationships": "Relationships (1-2 sentences)",
  "luckPhases": {{"currentPhase":"","currentYear":"","nextYear":""}},
  "elementRemedy": "Element tip (1 sentence)",
  "summary": "Overview (2 sentences)"
}}"""


@bazi_bp.route("/api/divination/bazi", methods=["POST", "OPTIONS"])
def read_bazi():
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}
    date = (data.get("date") or "").strip()
    time_str = (data.get("time") or "").strip()
    gender = (data.get("gender") or "").strip()
    name = (data.get("name") or "").strip()

    if not date:
        return jsonify({"success": False, "error": "Birth date is required."}), 400
    if not gender:
        return jsonify({"success": False, "error": "Gender is required."}), 400

    prompt = _build_bazi_prompt(date, time_str, gender, name)

    try:
        from app.llm_providers import create_provider
        provider_name = str(current_app.config.get("LLM_PROVIDER", "fallback"))
        model = str(current_app.config.get("LLM_MODEL", "claude-sonnet-4-6"))
        provider = create_provider(provider_name, model, app_config=current_app.config)
        result = provider.generate(prompt, timeout_s=25)
        raw_text = (result.content or "").strip()

        # Parse AI JSON
        clean = raw_text.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        reading = json.loads(clean)

        return jsonify({"success": True, "reading": reading})

    except json.JSONDecodeError:
        return jsonify({
            "success": True,
            "reading": {
                "summary": raw_text[:500],
                "fourPillars": {"year": "", "month": "", "day": "", "hour": ""},
                "dayMaster": "AI analysis generated a non-JSON response. See summary above.",
                "fiveElementBalance": "",
                "personality": "",
                "careerAndWealth": "",
                "relationships": "",
                "luckPhases": {"currentPhase": "", "currentYear": "", "nextYear": ""},
                "elementRemedy": "",
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"BaZi reading failed: {str(e)}"}), 500
