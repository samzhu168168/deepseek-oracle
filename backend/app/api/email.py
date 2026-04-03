# email_routes.py
# 邮件捕获和存储 API

import os
import sqlite3
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

email_bp = Blueprint('email', __name__)

DATABASE_PATH = os.getenv('DATABASE_PATH', './data.db')


def init_email_table():
    """初始化邮件存储表"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS email_captures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            source TEXT NOT NULL,
            score INTEGER,
            element_pair TEXT,
            report_data TEXT,
            captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            converted BOOLEAN DEFAULT 0,
            conversion_date TIMESTAMP,
            UNIQUE(email, source)
        )
    ''')
    
    # 创建索引
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_email ON email_captures(email)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_captured_at ON email_captures(captured_at)
    ''')
    
    conn.commit()
    conn.close()


# 启动时初始化表
init_email_table()


@email_bp.route('/api/capture-email', methods=['POST', 'OPTIONS'])
@cross_origin()
def capture_email():
    """捕获邮件地址"""
    data = request.get_json()
    
    email = (data.get('email') or '').strip().lower()
    source = data.get('source', 'unknown')  # 'email_gate', 'forecast', 'purchase'
    score = data.get('score')
    element_pair = data.get('element_pair')
    
    if not email:
        return jsonify({'success': False, 'error': 'Email is required'}), 400
    
    # 简单的邮件格式验证
    if '@' not in email or '.' not in email.split('@')[1]:
        return jsonify({'success': False, 'error': 'Invalid email format'}), 400
    
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # 尝试插入，如果已存在则更新
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
        
        return jsonify({
            'success': True,
            'message': 'Email captured successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Database error: {str(e)}'
        }), 500


@email_bp.route('/api/mark-conversion', methods=['POST', 'OPTIONS'])
@cross_origin()
def mark_conversion():
    """标记邮件已转化（购买）"""
    data = request.get_json()
    
    email = (data.get('email') or '').strip().lower()
    
    if not email:
        return jsonify({'success': False, 'error': 'Email is required'}), 400
    
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE email_captures
            SET converted = 1, conversion_date = CURRENT_TIMESTAMP
            WHERE email = ?
        ''', (email,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Database error: {str(e)}'
        }), 500


@email_bp.route('/api/export-emails', methods=['GET', 'OPTIONS'])
@cross_origin()
def export_emails():
    """导出邮件列表（管理员功能）"""
    # TODO: 添加管理员认证
    
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                email,
                source,
                score,
                element_pair,
                captured_at,
                converted,
                conversion_date
            FROM email_captures
            ORDER BY captured_at DESC
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        emails = []
        for row in rows:
            emails.append({
                'email': row[0],
                'source': row[1],
                'score': row[2],
                'element_pair': row[3],
                'captured_at': row[4],
                'converted': bool(row[5]),
                'conversion_date': row[6],
            })
        
        return jsonify({
            'success': True,
            'count': len(emails),
            'emails': emails
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Database error: {str(e)}'
        }), 500


@email_bp.route('/api/email-stats', methods=['GET', 'OPTIONS'])
@cross_origin()
def email_stats():
    """邮件统计（管理员功能）"""
    # TODO: 添加管理员认证
    
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # 总邮件数
        cursor.execute('SELECT COUNT(*) FROM email_captures')
        total = cursor.fetchone()[0]
        
        # 按来源统计
        cursor.execute('''
            SELECT source, COUNT(*) 
            FROM email_captures 
            GROUP BY source
        ''')
        by_source = dict(cursor.fetchall())
        
        # 转化统计
        cursor.execute('SELECT COUNT(*) FROM email_captures WHERE converted = 1')
        converted = cursor.fetchone()[0]
        
        # 今日新增
        cursor.execute('''
            SELECT COUNT(*) 
            FROM email_captures 
            WHERE DATE(captured_at) = DATE('now')
        ''')
        today = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'by_source': by_source,
                'converted': converted,
                'conversion_rate': round(converted / total * 100, 2) if total > 0 else 0,
                'today': today,
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Database error: {str(e)}'
        }), 500
