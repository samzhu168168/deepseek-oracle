from __future__ import annotations
from flask import Blueprint, request, jsonify
import sqlite3
import os
from datetime import datetime

email_bp = Blueprint('email', __name__)

@email_bp.route('/api/capture-email', methods=['POST'])
def capture_email():
    """Capture email for newsletter or waitlist"""
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip()
    
    if not email or '@' not in email:
        return jsonify({'error': 'Invalid email'}), 400
    
    # Simple validation - just accept the email
    # In production, you'd want to store it in a database
    print(f"Email captured: {email}")
    
    return jsonify({'success': True, 'message': 'Email captured'}), 200

@email_bp.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200
