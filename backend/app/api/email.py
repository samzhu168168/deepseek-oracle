from __future__ import annotations
from flask import Blueprint, current_app, request, jsonify

email_bp = Blueprint('email', __name__)


def _save_email(email: str, source: str, score: int | None, element_pair: str | None) -> None:
    """Persist email lead to SQLite. Fails silently so capture never blocks the response."""
    try:
        db_path = current_app.config.get('DATABASE_PATH', '')
        if not db_path:
            return
        from app.models.database import db_cursor
        with db_cursor(db_path) as cursor:
            cursor.execute(
                """INSERT OR IGNORE INTO email_leads (email, source, score, element_pair)
                   VALUES (?, ?, ?, ?)""",
                (email, source, score, element_pair),
            )
    except Exception as exc:
        print(f"[email] DB save failed: {exc}")


@email_bp.route('/api/capture-email', methods=['POST'])
@email_bp.route('/api/email-capture', methods=['POST'])
def capture_email():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip()
    source = data.get('source', 'unknown')
    score = data.get('score')
    element_pair = data.get('element_pair')

    if not email or '@' not in email:
        return jsonify({'error': 'Invalid email'}), 400

    print(f"[email] captured email={email} source={source}")
    _save_email(email, source, score, element_pair)
    return jsonify({'success': True}), 200


@email_bp.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200
