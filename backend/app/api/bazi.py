"""Individual BaZi reading — birth chart analysis for one person."""

from __future__ import annotations
import json
from datetime import datetime
from flask import Blueprint, current_app, jsonify, request

bazi_bp = Blueprint("bazi", __name__)


def _build_bazi_prompt(date: str, time_str: str, gender: str, name: str) -> str:
    return f"""You are a master BaZi (Chinese Four Pillars) astrologer with 30 years of experience.

Generate a complete, personalized BaZi reading for this person. Return ONLY valid JSON, no markdown, no preamble.

Input data:
- Name: {name or 'Unknown'}
- Birth Date: {date}
- Birth Time: {time_str or 'unknown'}
- Gender: {gender}
- Current Year: {datetime.now().year}

First calculate the Four Pillars (Year, Month, Day, Hour) based on the Chinese calendar.
Then analyze the Five Element balance, Day Master strength, and the Ten Gods relationships.

Return this exact JSON structure (all fields required, minimum 50 words per field):

{{
  "fourPillars": {{
    "year": "Heavenly Stem-Earthly Branch (e.g. 甲辰)",
    "month": "Heavenly Stem-Earthly Branch (e.g. 丙午)",
    "day": "Heavenly Stem-Earthly Branch (e.g. 戊戌) — THIS IS THE DAY MASTER",
    "hour": "Heavenly Stem-Earthly Branch (e.g. 壬子)"
  }},
  "dayMaster": "The Day Master element and its meaning for this person's core nature (80 words)",
  "fiveElementBalance": "Analysis of the Five Elements: which are strong/weak/missing and what this means (100 words)",
  "personality": "Key personality traits based on the BaZi chart (100 words)",
  "careerAndWealth": "Career direction, wealth potential, and best industries based on element preference (80 words)",
  "relationships": "Relationship patterns — what they attract, what they need, what they repeat (80 words)",
  "luckPhases": {{
    "currentPhase": "Their current decade luck phase and what it means for their life right now (60 words)",
    "currentYear": "Key opportunities and cautions for {datetime.now().year} specifically (60 words)",
    "nextYear": "What to prepare for in the coming year (40 words)"
  }},
  "elementRemedy": "Practical advice based on their element balance — colors, directions, activities that support their energy (60 words)",
  "summary": "One-paragraph overview of this person's destiny pattern (80 words)"
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
