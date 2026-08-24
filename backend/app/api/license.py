# license_routes.py
# 放置路径: backend/license_routes.py
# 然后在 app.py 中 import: from license_routes import license_bp; app.register_blueprint(license_bp)

from __future__ import annotations
import os
import json
import hashlib
import requests
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
# from flask_cors import cross_origin  # Commented out due to installation issues

# Create a dummy cross_origin decorator
def cross_origin(*args, **kwargs):
    def decorator(f):
        return f
    return decorator

license_bp = Blueprint('license', __name__)

# ── 配置 ────────────────────────────────────────────────
GUMROAD_PRODUCT_ID = os.getenv('GUMROAD_PRODUCT_ID', '').strip()
GUMROAD_PRODUCT_ID_BAZI = os.getenv('GUMROAD_PRODUCT_ID_BAZI', 'swpdpb')  # BaZi personal reading

# 简单内存缓存（生产环境换成 Redis 或数据库）
_report_cache: dict[str, dict] = {}


def _verify_gumroad_license(license_key: str) -> tuple[bool, str, dict]:
    """Verify entitlement with Gumroad without consuming a license use."""
    if not GUMROAD_PRODUCT_ID:
        return False, 'configuration_error', {}

    try:
        response = requests.post(
            'https://api.gumroad.com/v2/licenses/verify',
            data={
                'product_id': GUMROAD_PRODUCT_ID,
                'license_key': license_key,
                'increment_uses_count': 'false',
            },
            timeout=10,
        )
        response.raise_for_status()
        result = response.json()
    except (requests.RequestException, ValueError):
        return False, 'verification_unavailable', {}

    if not result.get('success'):
        return False, 'invalid_license', {}

    purchase = result.get('purchase') or {}
    if str(purchase.get('product_id') or '') != GUMROAD_PRODUCT_ID:
        return False, 'invalid_license', {}
    if purchase.get('refunded') or purchase.get('disputed') or purchase.get('chargebacked'):
        return False, 'purchase_revoked', {}

    return True, '', purchase


def _license_error_response(error_code: str):
    messages = {
        'configuration_error': 'Purchase verification is not configured yet.',
        'invalid_license': 'Invalid license key.',
        'purchase_revoked': 'This purchase has been refunded or disputed.',
        'verification_unavailable': 'Unable to verify right now. Please try again.',
    }
    status = 503 if error_code in {'configuration_error', 'verification_unavailable'} else 200
    return jsonify({
        'success': False,
        'error_code': error_code,
        'error': messages[error_code],
    }), status


def _generate_report_text(prompt: str) -> str:
    from app.llm_providers import create_provider

    provider_name = str(current_app.config.get("LLM_PROVIDER", "fallback"))
    model = str(current_app.config.get("LLM_MODEL", "claude-sonnet-4-6"))
    provider = create_provider(provider_name, model, app_config=current_app.config)
    result = provider.generate(prompt, timeout_s=60)
    return (result.content or "").strip()


def _provider_error_response(error: Exception):
    status_code = getattr(error, 'status_code', None)
    if status_code is None:
        response = getattr(error, 'response', None)
        status_code = getattr(response, 'status_code', None)

    error_name = error.__class__.__name__.lower()
    if isinstance(error, TimeoutError) or 'timeout' in error_name:
        error_code, http_status = 'provider_timeout', 504
    elif status_code == 429:
        error_code, http_status = 'provider_rate_limited', 503
    elif status_code in {401, 403}:
        error_code, http_status = 'provider_authentication_failed', 502
    else:
        error_code, http_status = 'provider_unavailable', 502

    return jsonify({
        'success': False,
        'error_code': error_code,
        'error': 'Unable to generate the report right now. Please try again.',
    }), http_status


def _parse_report(raw_text: str) -> dict:
    if not raw_text:
        raise ValueError('empty provider response')

    clean = raw_text.strip()
    if clean.startswith('```'):
        lines = clean.splitlines()
        if len(lines) < 3 or not lines[-1].strip().startswith('```'):
            raise ValueError('malformed fenced response')
        clean = '\n'.join(lines[1:-1]).strip()

    report = json.loads(clean)
    if not isinstance(report, dict):
        raise ValueError('report must be an object')

    required_strings = ('fullAnalysis', 'elementAdvice')
    if any(not isinstance(report.get(field), str) or not report[field].strip() for field in required_strings):
        raise ValueError('required report text is missing')

    nested_fields = {
        'palaceReadings': ('person1', 'person2', 'combined'),
        'timingWindows': ('q2_2026', 'q3_2026', 'q4_2026'),
    }
    for field, children in nested_fields.items():
        value = report.get(field)
        if not isinstance(value, dict):
            raise ValueError(f'{field} must be an object')
        if any(not isinstance(value.get(child), str) or not value[child].strip() for child in children):
            raise ValueError(f'{field} is incomplete')

    protocol = report.get('karmicProtocol')
    if not isinstance(protocol, list) or not protocol or any(not isinstance(item, str) or not item.strip() for item in protocol):
        raise ValueError('karmicProtocol is incomplete')

    return report


# ── Route 1: 验证 Gumroad License Key ───────────────────
@license_bp.route('/api/verify-license', methods=['POST', 'OPTIONS'])
@cross_origin(origins='*', allow_headers=['Content-Type'], methods=['POST', 'OPTIONS'])
def verify_license():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    license_key = (data.get('license_key') or '').strip()

    if not license_key:
        return jsonify({'success': False, 'error': 'License key is required.'}), 400

    valid, error_code, purchase = _verify_gumroad_license(license_key)
    if not valid:
        return _license_error_response(error_code)

    return jsonify({'success': True, 'purchase_id': purchase.get('id', '')})


# ── Route 2: 生成完整报告 ─────────────────────────────────
@license_bp.route('/api/generate-full-report', methods=['POST', 'OPTIONS'])
@cross_origin(origins='*', allow_headers=['Content-Type'], methods=['POST', 'OPTIONS'])
def generate_full_report():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    license_key = (data.get('license_key') or '').strip()

    if not license_key:
        return jsonify({'success': False, 'error': 'License key is required.'}), 400

    # ── 再次验证 license（防止绕过 /verify-license 直接调这个接口）──
    valid, error_code, _purchase = _verify_gumroad_license(license_key)
    if not valid:
        return _license_error_response(error_code)

    # ── 验证通过后检查缓存（同一个 key 不重复调用 AI）──
    cache_key = hashlib.sha256(license_key.encode()).hexdigest()
    if cache_key in _report_cache:
        return jsonify({'success': True, 'report': _report_cache[cache_key]})

    # ── 提取用户输入 ──
    person1 = data.get('person1', {})
    person2 = data.get('person2', {})
    score = data.get('score', 75)
    element_pair = data.get('element_pair', 'Unknown')
    current_year = datetime.now().year

    # ── 构建 AI 提示词 ──
    prompt = _build_report_prompt(person1, person2, score, element_pair, current_year)

    # ── 调用 LLM (通过统一的 provider 系统，自动享受 fallback) ──
    try:
        raw_text = _generate_report_text(prompt)
    except Exception as error:
        return _provider_error_response(error)

    # ── 解析 AI 返回的 JSON ──
    try:
        report = _parse_report(raw_text)
    except (json.JSONDecodeError, ValueError):
        return jsonify({
            'success': False,
            'error_code': 'invalid_provider_response',
            'error': 'Unable to generate the report right now. Please try again.',
        }), 502

    # ── 写入缓存 ──
    _report_cache[cache_key] = report

    return jsonify({'success': True, 'report': report})


# ── 报告提示词 ────────────────────────────────────────────
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
