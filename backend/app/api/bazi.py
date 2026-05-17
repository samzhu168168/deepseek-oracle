"""Individual BaZi reading — birth chart analysis for one person."""

from __future__ import annotations
import json
from datetime import datetime
from flask import Blueprint, current_app, jsonify, request

bazi_bp = Blueprint("bazi", __name__)


def _build_bazi_prompt(date: str, time_str: str, gender: str, name: str) -> str:
    return f"""You are a master BaZi astrologer. Return ONLY valid JSON — no markdown, no code fences, no extra text.

Input: {name or 'Unknown'} | {date} | {time_str or 'unknown'} | {gender} | Year {datetime.now().year}

Generate a personal birth chart reading. Each field must be clean English text with NO special Unicode characters (no emoji, no Chinese characters, no non-ASCII symbols). Use plain ASCII text only.

{{
  "fourPillars": {{"year":"Heavenly Stem-Earthly Branch pair","month":"","day":"","hour":""}},
  "dayMaster": "Day Master element and its meaning (1-2 sentences)",
  "fiveElementBalance": "Which elements are strong/weak and what this means (1-2 sentences)",
  "personality": "Key personality traits from the chart (1-2 sentences)",
  "careerAndWealth": "Career tendencies and wealth potential (1-2 sentences)",
  "relationships": "Relationship patterns and preferences (1-2 sentences)",
  "luckPhases": {{"currentPhase":"Current decade luck phase (1 sentence)","currentYear":"This year's outlook (1 sentence)","nextYear":"Coming year outlook (1 sentence)"}},
  "elementRemedy": "Which element to strengthen and how (1 sentence)",
  "summary": "Overall reading summary (2 sentences)"
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
