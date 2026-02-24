from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import json
import time
from typing import Any

from flask import current_app

from app.llm_providers import create_provider
from app.models import DivinationRepo
from app.services.ziwei_service import ZiweiService
from app.utils.errors import AppError, business_error


@dataclass(frozen=True)
class Trigram:
    idx: int
    name: str
    symbol: str
    image: str
    element: str
    lines: tuple[int, int, int]  # bottom -> top


TRIGRAMS: dict[int, Trigram] = {
    1: Trigram(1, "乾", "☰", "天", "金", (1, 1, 1)),
    2: Trigram(2, "兑", "☱", "泽", "金", (1, 1, 0)),
    3: Trigram(3, "离", "☲", "火", "火", (1, 0, 1)),
    4: Trigram(4, "震", "☳", "雷", "木", (1, 0, 0)),
    5: Trigram(5, "巽", "☴", "风", "木", (0, 1, 1)),
    6: Trigram(6, "坎", "☵", "水", "水", (0, 1, 0)),
    7: Trigram(7, "艮", "☶", "山", "土", (0, 0, 1)),
    8: Trigram(8, "坤", "☷", "地", "土", (0, 0, 0)),
}
TRIGRAM_BY_LINES = {value.lines: value for value in TRIGRAMS.values()}
MOVING_LINE_NAMES = {1: "初爻", 2: "二爻", 3: "三爻", 4: "四爻", 5: "五爻", 6: "上爻"}


class DivinationService:
    def __init__(
        self,
        izthon_src_path: str,
        default_provider: str,
        default_model: str,
        request_timeout_s: int,
        llm_max_retries: int,
        provider_config: dict[str, Any],
        database_path: str,
    ):
        self.ziwei_service = ZiweiService(izthon_src_path)
        self.divination_repo = DivinationRepo(database_path)
        self.default_provider = default_provider
        self.default_model = default_model
        self.request_timeout_s = request_timeout_s
        self.llm_max_retries = llm_max_retries
        self.provider_config = provider_config

    def run_ziwei(self, payload: dict[str, Any]) -> dict[str, Any]:
        provider_name = payload.get("provider", self.default_provider)
        model_name = payload.get("model", self.default_model)
        question = payload["question"]
        birth_info = payload["birth_info"]
        partner_birth_info = payload.get("partner_birth_info")
        time_unknown = bool(payload.get("time_unknown")) if "time_unknown" in payload else False
        partner_time_unknown = bool(payload.get("partner_time_unknown")) if "partner_time_unknown" in payload else False
        time_mode_a = "DATE_ONLY" if time_unknown else "FULL"
        time_mode_b = "DATE_ONLY" if partner_time_unknown else "FULL"

        if time_unknown:
            birth_info = {**birth_info, "timezone": 6}
        if isinstance(partner_birth_info, dict) and partner_time_unknown:
            partner_birth_info = {**partner_birth_info, "timezone": 6}

        astrolabe_data = self.ziwei_service.get_astrolabe_data(**birth_info)
        chart_text = self.ziwei_service.build_text_description(astrolabe_data)
        chart_summary = self._trim_chart_text(chart_text)
        partner_chart_summary = ""
        if isinstance(partner_birth_info, dict):
            partner_astrolabe_data = self.ziwei_service.get_astrolabe_data(**partner_birth_info)
            partner_chart_text = self.ziwei_service.build_text_description(partner_astrolabe_data)
            partner_chart_summary = self._trim_chart_text(partner_chart_text)

        if isinstance(partner_birth_info, dict):
            person_a_year = str(birth_info.get("date", "")).split("-")[0]
            person_b_year = str(partner_birth_info.get("date", "")).split("-")[0]
            person_a_timezone = int(birth_info.get("timezone", 0))
            person_b_timezone = int(partner_birth_info.get("timezone", 0))
            person_a_time = "12:00" if time_mode_a == "DATE_ONLY" else f"{max(person_a_timezone * 2 - 1, 0):02d}:00"
            person_b_time = "12:00" if time_mode_b == "DATE_ONLY" else f"{max(person_b_timezone * 2 - 1, 0):02d}:00"
            person_a_location = f"UTC+{person_a_timezone}"
            person_b_location = f"UTC+{person_b_timezone}"
            person_a_chart_json = json.dumps(astrolabe_data, ensure_ascii=False)
            person_b_chart_json = json.dumps(partner_astrolabe_data, ensure_ascii=False)
            structured_prompt = (
                "Analyze the following two Zi Wei Dou Shu charts and output "
                "ONLY a JSON object. No prose. No explanation.\n\n"
                f"{person_a_chart_json}\n"
                f"{person_b_chart_json}\n\n"
                "Required JSON structure:\n"
                "{\n"
                '  "elemental_relationship": "generating|controlling|same",\n'
                '  "person_a_element": "metal|wood|water|fire|earth",\n'
                '  "person_b_element": "metal|wood|water|fire|earth",\n'
                '  "compatibility_scores": {\n'
                '    "elemental_harmony": <integer 1-25>,\n'
                '    "soul_resonance": <integer 1-25>,\n'
                '    "growth_catalyst": <integer 1-25>,\n'
                '    "karmic_bond": <integer 1-25>\n'
                "  },\n"
                '  "total_score": <sum of above, integer>,\n'
                '  "primary_dynamic": "harmonious|challenging|transformative",\n'
                '  "key_tension_area": "<one specific area>",\n'
                '  "key_strength_area": "<one specific area>",\n'
                '  "person_a_ming_gong_star": "<star name or null if time unknown>",\n'
                '  "person_b_ming_gong_star": "<star name or null if time unknown>"\n'
                "}\n\n"
                "BIRTH TIME STATUS:\n"
                f"- Person A: {time_mode_a}\n"
                f"- Person B: {time_mode_b}\n\n"
                "IF time_mode = \"DATE_ONLY\":\n"
                "- Output person_a_ming_gong_star or person_b_ming_gong_star as null\n"
            )
            fallback_structured = self._build_fallback_structured(time_mode_a, time_mode_b)
            structured_text = self._complete_with_fallback(
                prompt=structured_prompt,
                fallback=json.dumps(fallback_structured, ensure_ascii=False),
                provider_name=provider_name,
                model_name=model_name,
            )
            structured_data = self._parse_structured_json(structured_text) or fallback_structured
            if time_mode_a == "DATE_ONLY":
                structured_data["person_a_ming_gong_star"] = None
            if time_mode_b == "DATE_ONLY":
                structured_data["person_b_ming_gong_star"] = None
            validated_data = self._validate_compatibility_structured(structured_data, fallback_structured)
            fallback = (
                "Elemental Bond Compatibility Report\n\n"
                "Module 1: Cover Score Card\n"
                f"Pair: Person A ({person_a_year}) + Person B ({person_b_year})\n"
                "Overall Compatibility: 78 / 100\n"
                "Elemental Harmony: 19/25\n"
                "Soul Resonance: 20/25\n"
                "Growth Catalyst: 19/25\n"
                "Karmic Bond: 20/25\n"
                "Tagline: Complementary Forces — Yin Yang Embodied\n\n"
                "Module 2: Five-Element Chemistry (Preview)\n"
                "Person A dominant element: Water\n"
                "Person B dominant element: Earth\n"
                "Compatibility type: Controlling\n"
                "Your dynamic looks calm on the surface but is actually a precision‑engineered feedback loop: Earth steadies "
                "Water’s volatility, while Water quietly reshapes Earth’s priorities. The counterintuitive truth is that this "
                "pair often grows fastest when routines are disrupted, because structure surfaces what emotion has been carrying "
                "in silence... \n\n"
                "Module 3: Full Analysis (Locked)\n"
                "Soul Blueprint Comparison\n"
                "Relationship Sector Decoding\n"
                "2026 Activation Windows\n"
                "Growth Protocol\n"
                "Relationship Source Code\n"
            )
            compatibility_system_prompt = (
                "You are the Elemental Bond Oracle — an AI system trained on "
                "2,000 years of Chinese Imperial metaphysics (Zi Wei Dou Shu 紫微斗数), "
                "Five Element Theory (五行), and Na Jia (纳甲) variable mapping systems.\n\n"
                "Your analysis is NOT astrology. It is pattern recognition "
                "applied to the oldest algorithmic dataset in human history.\n\n"
                "CORE PHILOSOPHY:\n"
                "- You read energetic compatibility, not fate\n"
                "- You describe dynamics, not destinations\n"
                "- You empower, never predict with certainty\n"
                "- You are a mirror, not a fortune teller\n\n"
                "LANGUAGE PROTOCOL:\n"
                "- Register: Sophisticated, confident, slightly mystical\n"
                "- Avoid: Horoscope clichés, vague affirmations, doom predictions\n"
                "- Use: Systems thinking language + Eastern metaphysics terminology\n"
                "- Always define Chinese terms in parentheses on first use\n\n"
                "AUTHENTICITY MARKERS (must include naturally):\n"
                "- Reference specific stars by their Chinese name + translation\n"
                "- Use Five Element interactions as the primary analytical lens\n"
                "- Frame relationship dynamics as \"energetic architecture\"\n"
                "- Ground mystical language with psychological parallels\n\n"
                "OUTPUT CONSTRAINT:\n"
                "Total length: 800-1000 words for full report\n"
                "Tone consistency: maintain throughout, no tonal shifts\n"
                "Never say: \"based on my analysis\" or \"I think\" — "
                "speak as the Oracle system, not as an AI\n"
            )
            compatibility_user_prompt = (
                "Write the Elemental Bond compatibility report using ONLY "
                "the following pre-calculated data. "
                "DO NOT recalculate or reinterpret any scores or relationships. "
                "The data below is GROUND TRUTH — your job is to articulate "
                "it in compelling prose, not to analyze it independently.\n\n"
                "LOCKED DATA:\n"
                f"{json.dumps(validated_data, ensure_ascii=False)}\n\n"
                "Now write each section following the report structure. "
                "Every factual claim must be consistent with the locked data above.\n"
            )
            time_mode_instruction = (
                "BIRTH TIME STATUS:\n"
                f"- Person A: {time_mode_a}\n"
                f"- Person B: {time_mode_b}\n\n"
                "IF time_mode = \"DATE_ONLY\":\n"
                "- DO NOT reference Ming Gong (命宫) star positions\n"
                "- DO NOT reference Shen Gong (身宫)\n"
                "- DO NOT make palace-specific readings\n"
                "- FOCUS ON: Day Master element (日主), Year Branch element, Five Element interaction\n"
                "- ADD this disclaimer naturally in the report:\n"
                "\"Note: Without an exact birth time, this reading "
                "draws from your elemental birth signature rather "
                "than your full star palace configuration. "
                "The Five Element analysis remains fully valid.\"\n\n"
                "IF time_mode = \"FULL\":\n"
                "- Proceed with complete Zi Wei Dou Shu analysis\n"
            )
            prompt = f"{compatibility_system_prompt}\n\n{time_mode_instruction}\n\n{compatibility_user_prompt}"
        else:
            fallback = (
                "总论：你当前的运势更适合“稳中求进”，优先确保节奏稳定与决策一致。\n"
                "分项建议：事业宜做长期布局，关系宜强化沟通，财务宜风险分层，健康宜规律作息。\n"
                "关键窗口：近期先打基础，中期再放大投入，遇到不确定性时放慢节奏。\n"
                "行动建议：\n1. 每周一次复盘；\n2. 保留20%机动时间；\n3. 先做低风险验证再做大决策。"
            )
            prompt = (
                "你是紫微斗数长线解读智能体。请基于命盘信息进行结构化解读。"
                "禁止宿命化和灾祸渲染，强调可执行建议。\n"
                "若时间模式为 DATE_ONLY，请忽略宫位细节，改用五行画像与基础趋势进行解读。\n"
                f"用户问题：{question}\n"
                f"时间模式：{time_mode_a}\n"
                f"命盘摘要：\n{chart_summary}\n"
                "输出格式：总论、事业、情感、财富、健康、关键窗口（3条）、行动建议（3条）。"
            )
        reading = self._complete_with_fallback(
            prompt=prompt,
            fallback=fallback,
            provider_name=provider_name,
            model_name=model_name,
        )
        result = {
            "question": question,
            "birth_info": birth_info,
            "chart_summary": chart_summary,
            "reading": reading,
            "provider": provider_name,
            "model": model_name,
            "generated_at": datetime.now().isoformat(timespec="seconds"),
        }
        if partner_birth_info and partner_chart_summary:
            result["partner_birth_info"] = partner_birth_info
            result["partner_chart_summary"] = partner_chart_summary
        return result

    def run_meihua(self, payload: dict[str, Any]) -> dict[str, Any]:
        provider_name = payload.get("provider", self.default_provider)
        model_name = payload.get("model", self.default_model)
        topic = payload["topic"]
        occurred_at = datetime.fromisoformat(payload["occurred_at"])

        gua = self._calculate_meihua(topic, occurred_at)
        fallback = self._build_meihua_fallback(topic=topic, gua=gua)
        prompt = (
            "你是梅花易数短占智能体，请基于以下起卦结果解读短期倾向。"
            "避免绝对化断言，用“更适合/更需谨慎”表述。\n"
            f"占题：{topic}\n"
            f"起卦时间：{payload['occurred_at']}\n"
            f"本卦：{gua['base_gua']}（上卦{gua['upper_trigram']}，下卦{gua['lower_trigram']}）\n"
            f"互卦：{gua['mutual_gua']}\n"
            f"变卦：{gua['changed_gua']}\n"
            f"动爻：{gua['moving_line_name']}\n"
            f"体用：体卦{gua['ti_gua']} / 用卦{gua['yong_gua']} / 关系{gua['relation']}\n"
            "输出：占题重述、短期倾向、关键变数、宜、忌、行动建议。"
        )
        reading = self._complete_with_fallback(
            prompt=prompt,
            fallback=fallback,
            provider_name=provider_name,
            model_name=model_name,
        )
        return {
            "topic": topic,
            "occurred_at": payload["occurred_at"],
            "method": "qizhounian-time-meihua",
            "gua": gua,
            "reading": reading,
            "provider": provider_name,
            "model": model_name,
            "generated_at": datetime.now().isoformat(timespec="seconds"),
        }

    def save_ziwei_record(self, *, user_id: int, payload: dict[str, Any], result: dict[str, Any]) -> int:
        return self.divination_repo.create_record(
            user_id=user_id,
            divination_type="ziwei",
            question_text=str(payload.get("question", "")).strip() or "紫微斗数解读",
            birth_info=payload.get("birth_info"),
            occurred_at=None,
            result_payload=result,
            provider=str(result.get("provider") or self.default_provider),
            model=str(result.get("model") or self.default_model),
        )

    def save_meihua_record(self, *, user_id: int, payload: dict[str, Any], result: dict[str, Any]) -> int:
        return self.divination_repo.create_record(
            user_id=user_id,
            divination_type="meihua",
            question_text=str(payload.get("topic", "")).strip() or "梅花易数解读",
            birth_info=None,
            occurred_at=str(result.get("occurred_at") or payload.get("occurred_at") or ""),
            result_payload=result,
            provider=str(result.get("provider") or self.default_provider),
            model=str(result.get("model") or self.default_model),
        )

    def list_records(
        self,
        *,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
        divination_type: str | None = None,
    ) -> dict[str, Any]:
        return self.divination_repo.list_records(
            user_id=user_id,
            page=page,
            page_size=page_size,
            divination_type=divination_type,
        )

    def get_record(self, *, record_id: int, user_id: int, is_admin: bool = False) -> dict[str, Any]:
        data = self.divination_repo.get_record(record_id=record_id, user_id=user_id, is_admin=is_admin)
        if not data:
            raise business_error("A4004", "divination record not found", 404, False)
        return data

    def _complete_with_fallback(self, prompt: str, fallback: str, provider_name: str, model_name: str) -> str:
        if provider_name == "mock":
            return fallback

        text = ""
        for attempt in range(self.llm_max_retries + 1):
            try:
                provider = create_provider(
                    provider_name,
                    model_name,
                    app_config=self.provider_config,
                )
                response = provider.generate(prompt, timeout_s=self.request_timeout_s)
                text = (response.content or "").strip()
                if text:
                    return text
            except AppError:
                if attempt < self.llm_max_retries:
                    time.sleep(2**attempt)
                    continue
                return fallback
            except Exception:
                if attempt < self.llm_max_retries:
                    time.sleep(2**attempt)
                    continue
                return fallback
        return text or fallback

    @staticmethod
    def _trim_chart_text(text: str, max_lines: int = 40) -> str:
        lines = [line for line in text.splitlines() if line.strip()]
        return "\n".join(lines[:max_lines])

    @staticmethod
    def _parse_structured_json(text: str) -> dict[str, Any] | None:
        if not text:
            return None
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            start = text.find("{")
            end = text.rfind("}")
            if start >= 0 and end > start:
                candidate = text[start : end + 1]
                try:
                    return json.loads(candidate)
                except json.JSONDecodeError:
                    return None
        except Exception:
            return None
        return None

    @staticmethod
    def _build_fallback_structured(time_mode_a: str, time_mode_b: str) -> dict[str, Any]:
        base = {
            "elemental_relationship": "controlling",
            "person_a_element": "water",
            "person_b_element": "earth",
            "compatibility_scores": {
                "elemental_harmony": 18,
                "soul_resonance": 17,
                "growth_catalyst": 18,
                "karmic_bond": 19,
            },
            "total_score": 72,
            "primary_dynamic": "transformative",
            "key_tension_area": "emotional pacing",
            "key_strength_area": "resilience under change",
            "person_a_ming_gong_star": "紫微 (The Emperor)",
            "person_b_ming_gong_star": "天相 (The Chancellor)",
        }
        if time_mode_a == "DATE_ONLY":
            base["person_a_ming_gong_star"] = None
        if time_mode_b == "DATE_ONLY":
            base["person_b_ming_gong_star"] = None
        return base

    @staticmethod
    def _validate_compatibility_structured(
        data: dict[str, Any],
        fallback: dict[str, Any],
    ) -> dict[str, Any]:
        try:
            scores = data.get("compatibility_scores") or {}
            required_scores = {"elemental_harmony", "soul_resonance", "growth_catalyst", "karmic_bond"}
            if set(scores.keys()) != required_scores:
                raise ValueError("score fields missing")
            total_score = int(data.get("total_score"))
            score_values = [int(scores[key]) for key in required_scores]
            if any(value < 1 or value > 25 for value in score_values):
                raise ValueError("score out of range")
            if sum(score_values) != total_score:
                raise ValueError("score mismatch")
            elements = {"metal", "wood", "water", "fire", "earth"}
            person_a_element = str(data.get("person_a_element", "")).lower()
            person_b_element = str(data.get("person_b_element", "")).lower()
            if person_a_element not in elements or person_b_element not in elements:
                raise ValueError("element invalid")
            element_rules = {
                ("water", "fire"): "controlling",
                ("fire", "metal"): "controlling",
                ("metal", "wood"): "controlling",
                ("wood", "earth"): "controlling",
                ("earth", "water"): "controlling",
                ("water", "wood"): "generating",
                ("wood", "fire"): "generating",
                ("fire", "earth"): "generating",
                ("earth", "metal"): "generating",
                ("metal", "water"): "generating",
            }
            expected = element_rules.get((person_a_element, person_b_element), "same")
            if str(data.get("elemental_relationship", "")).lower() != expected:
                raise ValueError("elemental relationship mismatch")
            if str(data.get("primary_dynamic", "")).lower() not in {"harmonious", "challenging", "transformative"}:
                raise ValueError("primary dynamic invalid")
            if not str(data.get("key_tension_area", "")).strip():
                raise ValueError("key tension invalid")
            if not str(data.get("key_strength_area", "")).strip():
                raise ValueError("key strength invalid")
            return {
                "elemental_relationship": expected,
                "person_a_element": person_a_element,
                "person_b_element": person_b_element,
                "compatibility_scores": {
                    "elemental_harmony": int(scores["elemental_harmony"]),
                    "soul_resonance": int(scores["soul_resonance"]),
                    "growth_catalyst": int(scores["growth_catalyst"]),
                    "karmic_bond": int(scores["karmic_bond"]),
                },
                "total_score": total_score,
                "primary_dynamic": str(data.get("primary_dynamic")).lower(),
                "key_tension_area": str(data.get("key_tension_area")).strip(),
                "key_strength_area": str(data.get("key_strength_area")).strip(),
                "person_a_ming_gong_star": data.get("person_a_ming_gong_star"),
                "person_b_ming_gong_star": data.get("person_b_ming_gong_star"),
            }
        except Exception:
            return fallback

    def _calculate_meihua(self, topic: str, occurred_at: datetime) -> dict[str, Any]:
        year = occurred_at.year
        month = occurred_at.month
        day = occurred_at.day
        hour = occurred_at.hour

        # Follow the 7th-anniversary meihua core formula:
        # upper=(年+月+日)%8, lower=(年+月+日+时)%8, moving=(年+月+日+时)%6.
        upper_idx = (year + month + day) % 8 or 8
        lower_idx = (year + month + day + hour) % 8 or 8
        moving_line = (year + month + day + hour) % 6 or 6

        upper = TRIGRAMS[upper_idx]
        lower = TRIGRAMS[lower_idx]
        base_lines = list(lower.lines + upper.lines)  # bottom -> top
        hu_lower = TRIGRAM_BY_LINES[tuple(base_lines[1:4])]
        hu_upper = TRIGRAM_BY_LINES[tuple(base_lines[2:5])]

        changed_lines = base_lines.copy()
        changed_lines[moving_line - 1] = 1 - changed_lines[moving_line - 1]
        changed_lower = TRIGRAM_BY_LINES[tuple(changed_lines[:3])]
        changed_upper = TRIGRAM_BY_LINES[tuple(changed_lines[3:])]
        is_upper_moving = moving_line > 3
        ti = lower if is_upper_moving else upper
        yong = upper if is_upper_moving else lower

        def line_text(lines: list[int]) -> str:
            return "".join("阳" if value == 1 else "阴" for value in lines)

        return {
            "seed": int(occurred_at.strftime("%Y%m%d%H")),
            "upper_trigram": upper.name,
            "lower_trigram": lower.name,
            "base_gua": f"上{upper.name}下{lower.name}",
            "mutual_gua": f"上{hu_upper.name}下{hu_lower.name}",
            "changed_gua": f"上{changed_upper.name}下{changed_lower.name}",
            "moving_line": moving_line,
            "moving_line_name": MOVING_LINE_NAMES[moving_line],
            "base_line_pattern": line_text(base_lines),
            "changed_line_pattern": line_text(changed_lines),
            "symbol": f"{upper.symbol}{lower.symbol}",
            "element_hint": f"{upper.element}/{lower.element}",
            "ti_gua": ti.name,
            "yong_gua": yong.name,
            "relation": self._wuxing_relation(ti.element, yong.element),
            "formula_inputs": {
                "year": year,
                "month": month,
                "day": day,
                "hour": hour,
                "topic_length": len(topic),
            },
        }

    @staticmethod
    def _build_meihua_fallback(topic: str, gua: dict[str, Any]) -> str:
        return (
            f"占题重述：围绕“{topic}”进行短期起卦解读。\n"
            f"短期倾向：本卦{gua['base_gua']}，互卦{gua['mutual_gua']}，近期更适合先稳住节奏再推进关键动作。\n"
            f"关键变数：动爻在{gua['moving_line_name']}，说明执行顺序和沟通方式是主要变量。\n"
            f"体用关系：体卦{gua['ti_gua']}、用卦{gua['yong_gua']}，当前关系为{gua['relation']}。\n"
            "宜：先确认事实、先小步验证、保留调整余地。\n"
            "忌：情绪化拍板、一次性押注、忽略外部反馈。\n"
            "行动建议：先列出3个可控动作，48小时内完成第一步并复盘。"
        )

    @staticmethod
    def _wuxing_relation(ti_element: str, yong_element: str) -> str:
        relations = {
            "金": {"金": "比和", "木": "体克用", "水": "体生用", "火": "用克体", "土": "用生体"},
            "木": {"木": "比和", "土": "体克用", "火": "体生用", "金": "用克体", "水": "用生体"},
            "水": {"水": "比和", "火": "体克用", "木": "体生用", "土": "用克体", "金": "用生体"},
            "火": {"火": "比和", "金": "体克用", "土": "体生用", "水": "用克体", "木": "用生体"},
            "土": {"土": "比和", "水": "体克用", "金": "体生用", "木": "用克体", "火": "用生体"},
        }
        return relations.get(ti_element, {}).get(yong_element, "比和")


def get_divination_service() -> DivinationService:
    service = current_app.extensions.get("divination_service")
    if service:
        return service

    service = DivinationService(
        izthon_src_path=current_app.config["IZTHON_SRC_PATH"],
        default_provider=current_app.config["LLM_PROVIDER"],
        default_model=current_app.config["LLM_MODEL"],
        request_timeout_s=current_app.config["REQUEST_TIMEOUT_S"],
        llm_max_retries=current_app.config["LLM_MAX_RETRIES"],
        database_path=current_app.config["DATABASE_PATH"],
        provider_config={
            "LLM_MODEL": current_app.config.get("LLM_MODEL", ""),
            "VOLCANO_API_KEY": current_app.config.get("VOLCANO_API_KEY", ""),
            "VOLCANO_MODEL": current_app.config.get("VOLCANO_MODEL", ""),
            "ALIYUN_API_KEY": current_app.config.get("ALIYUN_API_KEY", ""),
            "ALIYUN_BASE_URL": current_app.config.get("ALIYUN_BASE_URL", ""),
            "DEEPSEEK_API_KEY": current_app.config.get("DEEPSEEK_API_KEY", ""),
            "DEEPSEEK_BASE_URL": current_app.config.get("DEEPSEEK_BASE_URL", ""),
            "ZHIPU_API_KEY": current_app.config.get("ZHIPU_API_KEY", ""),
            "QWEN_API_KEY": current_app.config.get("QWEN_API_KEY", ""),
            "QWEN_BASE_URL": current_app.config.get("QWEN_BASE_URL", ""),
        },
    )
    current_app.extensions["divination_service"] = service
    return service


def _build_bond_prompt(person_a: dict[str, Any], person_b: dict[str, Any], full: bool) -> str:
    mode = "FULL" if full else "TEASER"
    return (
        "You are an expert relationship astrologer and BaZi advisor. "
        "Generate a relationship compatibility report. "
        f"Mode: {mode}. "
        "The teaser must be about 150 words. "
        "The full report must be about 800 words only when Mode is FULL. "
        "Use English. "
        f"Person A birth info: {person_a}. "
        f"Person B birth info: {person_b}."
    )


def _generate_bond_report(
    person_a: dict[str, Any],
    person_b: dict[str, Any],
    full: bool,
    timeout_s: int = 60,
) -> str:
    provider_name = str(current_app.config.get("LLM_PROVIDER", ""))
    model = str(current_app.config.get("LLM_MODEL", ""))
    provider = create_provider(provider_name, model, app_config=current_app.config)
    prompt = _build_bond_prompt(person_a, person_b, full)
    result = provider.generate(prompt, timeout_s=timeout_s)
    return str(result.content or "").strip()


def generate_free_report(person_a: dict[str, Any], person_b: dict[str, Any]) -> str:
    return _generate_bond_report(person_a, person_b, False, 60)


def generate_full_report(person_a: dict[str, Any], person_b: dict[str, Any]) -> str:
    return _generate_bond_report(person_a, person_b, True, 60)
