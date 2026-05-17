"""Individual BaZi reading — birth chart analysis for one person."""

from __future__ import annotations
import json
from datetime import datetime
from flask import Blueprint, current_app, jsonify, request

bazi_bp = Blueprint("bazi", __name__)


def _build_bazi_prompt(date: str, time_str: str, gender: str, name: str) -> str:
    return f"""You are a master BaZi (Chinese Four Pillars) astrologer with 30 years of experience.

Generate a concise, personalized BaZi reading. Return ONLY valid JSON, no markdown, no preamble.

Input data:
- Name: {name or 'Unknown'}
- Birth Date: {date}
- Birth Time: {time_str or 'unknown'}
- Gender: {gender}
- Current Year: {datetime.now().year}

Calculate the Four Pillars and analyze the chart. Keep outputs VERY concise (2-3 sentences per field).

Return this exact JSON structure:

{{
  "fourPillars": {{
    "year": "Heavenly Stem-Earthly Branch (e.g. 甲辰)",
    "month": "Heavenly Stem-Earthly Branch (e.g. 丙午)",
    "day": "Heavenly Stem-Earthly Branch (e.g. 戊戌) — THE DAY MASTER",
    "hour": "Heavenly Stem-Earthly Branch (e.g. 壬子)"
  }},
  "dayMaster": "Day Master element and core nature (2-3 sentences)",
  "fiveElementBalance": "Element strengths and meaning (2-3 sentences)",
  "personality": "Key traits from chart (2-3 sentences)",
  "careerAndWealth": "Career direction and wealth potential (2-3 sentences)",
  "relationships": "Relationship patterns and needs (2-3 sentences)",
  "luckPhases": {{
    "currentPhase": "Current decade luck phase meaning (2 sentences)",
    "currentYear": "{datetime.now().year} opportunities and cautions (2 sentences)",
    "nextYear": "What to prepare for (1-2 sentences)"
  }},
  "elementRemedy": "Colors, directions, activities to support energy (2 sentences)",
  "summary": "One-paragraph destiny pattern overview (2-3 sentences)"
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
