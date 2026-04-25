from __future__ import annotations
"""
Email Capture Tool
Declarative tool for capturing user emails
"""
import os
import sqlite3
from typing import Any, Dict


class EmailCaptureTool:
    """Tool for capturing user emails in the marketing funnel"""
    
    name = "email_capture"
    description = "Capture user email for marketing funnel and lead generation"
    schema = {
        "email": str,
        "source": str,
        "score": int,
        "element_pair": str,
    }
    
    def __init__(self):
        self.database_path = os.getenv('DATABASE_PATH', './data.db')
    
    def execute(self, email: str, source: str = 'unknown', score: int = None, element_pair: str = None, **kwargs) -> Dict[str, Any]:
        """
        Execute email capture
        
        Args:
            email: User's email address
            source: Source of capture (email_gate, forecast, purchase)
            score: Soul resonance score
            element_pair: Element pair (e.g., "Water-Wood")
        
        Returns:
            Dict with success status and message
        """
        email = email.strip().lower()
        
        if not email:
            return {'success': False, 'error': 'Email is required'}
        
        if '@' not in email or '.' not in email.split('@')[1]:
            return {'success': False, 'error': 'Invalid email format'}
        
        try:
            conn = sqlite3.connect(self.database_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO email_captures (email, source, score, element_pair)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(email, source) DO UPDATE SET
                    score = excluded.score,
                    element_pair = excluded.element_pair,
                    captured_at = CURRENT_TIMESTAMP
            ''', (email, source, score, element_pair))
            
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'message': 'Email captured successfully',
                'email': email,
                'source': source,
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Database error: {str(e)}'
            }


# Auto-register the tool
from . import register_tool
register_tool(EmailCaptureTool())
