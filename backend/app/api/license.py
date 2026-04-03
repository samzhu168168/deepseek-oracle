# license_routes.py
# 放置路径: backend/license_routes.py
# 然后在 app.py 中 import: from license_routes import license_bp; app.register_blueprint(license_bp)

import os
import json
import hashlib
import requests
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

license_bp = Blueprint('license', __name__)

# ── 配置 ────────────────────────────────────────────────
GUMROAD_PRODUCT_ID = os.getenv('GUMROAD_PRODUCT_ID', 'bhpmxr')  # 从你的 Gumroad URL 取
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
ANTHROPIC_BASE_URL = os.getenv('ANTHROPIC_BASE_URL', 'https://api.laozhang.ai')  # 第三方代理

# 简单内存缓存（生产环境换成 Redis 或数据库）
_report_cache: dict[str, dict] = {}


# ── Route 1: 验证 Gumroad License Key ───────────────────
@license_bp.route('/api/verify-license', methods=['POST', 'OPTIONS'])
@cross_origin()
def verify_license():
    data = request.get_json()
    license_key = (data.get('license_key') or '').strip()

    if not license_key:
        return jsonify({'success': False, 'error': 'License key is required.'}), 400

    try:
        resp = requests.post(
            'https://api.gumroad.com/v2/licenses/verify',
            data={
                'product_id': GUMROAD_PRODUCT_ID,
                'license_key': license_key,
                'increment_uses_count': 'false',  # 不消耗使用次数
            },
            timeout=10,
        )
        result = resp.json()
    except requests.RequestException as e:
        return jsonify({'success': False, 'error': 'Could not reach Gumroad. Try again.'}), 502

    if not result.get('success'):
        return jsonify({
            'success': False,
            'error': 'License key not found. Check your Gumroad confirmation email.',
        }), 200

    # 验证通过，检查是否已退款/取消
    purchase = result.get('purchase', {})
    if purchase.get('refunded') or purchase.get('chargebacked'):
        return jsonify({'success': False, 'error': 'This purchase has been refunded.'}), 200

    return jsonify({'success': True, 'purchase_id': purchase.get('id', '')})


# ── Route 2: 生成完整报告 ─────────────────────────────────
@license_bp.route('/api/generate-full-report', methods=['POST', 'OPTIONS'])
@cross_origin()
def generate_full_report():
    data = request.get_json()
    license_key = (data.get('license_key') or '').strip()

    if not license_key:
        return jsonify({'success': False, 'error': 'License key is required.'}), 400

    # ── 检查缓存（同一个 key 不重复调用 AI）──
    cache_key = hashlib.sha256(license_key.encode()).hexdigest()
    if cache_key in _report_cache:
        return jsonify({'success': True, 'report': _report_cache[cache_key]})

    # ── 再次验证 license（防止绕过 /verify-license 直接调这个接口）──
    try:
        verify_resp = requests.post(
            'https://api.gumroad.com/v2/licenses/verify',
            data={
                'product_id': GUMROAD_PRODUCT_ID,
                'license_key': license_key,
                'increment_uses_count': 'true',  # 这里才真正标记已使用
            },
            timeout=10,
        )
        verify_result = verify_resp.json()
    except requests.RequestException:
        return jsonify({'success': False, 'error': 'Verification failed. Please try again.'}), 502

    if not verify_result.get('success'):
        return jsonify({'success': False, 'error': 'Invalid license key.'}), 200

    # ── 提取用户输入 ──
    person1 = data.get('person1', {})
    person2 = data.get('person2', {})
    score = data.get('score', 75)
    element_pair = data.get('element_pair', 'Unknown')
    current_year = datetime.now().year

    # ── 构建 AI 提示词 ──
    prompt = _build_report_prompt(person1, person2, score, element_pair, current_year)

    # ── 调用 Claude API (通过第三方代理) ──
    try:
        response = requests.post(
            f'{ANTHROPIC_BASE_URL}/v1/messages',
            headers={
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            json={
                'model': 'claude-sonnet-4-20250514',
                'max_tokens': 2000,
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt,
                    }
                ],
            },
            timeout=60,
        )
        response.raise_for_status()
        result = response.json()
        raw_text = result['content'][0]['text']
    except Exception as e:
        return jsonify({'success': False, 'error': f'Report generation failed: {str(e)}'}), 500

    # ── 解析 AI 返回的 JSON ──
    try:
        # Claude 会返回 JSON，去掉可能的 markdown fence
        clean = raw_text.strip()
        if clean.startswith('```'):
            clean = clean.split('\n', 1)[1].rsplit('```', 1)[0].strip()
        report = json.loads(clean)
    except (json.JSONDecodeError, IndexError):
        # 降级：把全文放进 fullAnalysis
        report = {
            'fullAnalysis': raw_text,
            'palaceReadings': {
                'person1': 'See full analysis above.',
                'person2': 'See full analysis above.',
                'combined': 'See full analysis above.',
            },
            'timingWindows': {
                'q2_2026': 'See full analysis above.',
                'q3_2026': 'See full analysis above.',
                'q4_2026': 'See full analysis above.',
            },
            'karmicProtocol': [raw_text],
            'elementAdvice': '',
        }

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
