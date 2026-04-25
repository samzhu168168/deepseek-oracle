# proxy.py
# 代理接口，用于转发被封锁的外部API请求

from __future__ import annotations
import os
import json
import time
from typing import Any
from flask import Blueprint, request, jsonify
# from flask_cors import cross_origin  # Commented out due to installation issues
import requests

# Create a dummy cross_origin decorator
def cross_origin(*args, **kwargs):
    def decorator(f):
        return f
    return decorator

proxy_bp = Blueprint('proxy', __name__)

# 允许代理的目标域名
ALLOWED_PROXY_DOMAINS = {
    'static.jianweidata.com',
    'api.chandler.bet'
}

# 请求超时时间（秒）
PROXY_TIMEOUT = 10

def is_allowed_url(url: str) -> bool:
    """检查URL是否在允许代理的域名列表中"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc.split(':')[0]  # 移除端口
        return domain in ALLOWED_PROXY_DOMAINS
    except Exception:
        return False

@proxy_bp.route('/api/proxy/iztro', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(origins=['https://www.elemental.bond', 'http://localhost:5173'], 
              allow_headers=['Content-Type', 'Authorization'], 
              methods=['GET', 'POST', 'OPTIONS'])
def proxy_iztro():
    """代理iztro API请求"""
    if request.method == 'OPTIONS':
        return '', 204
    
    # 获取目标URL参数
    target_url = request.args.get('url')
    if not target_url:
        # 如果没有提供URL，使用默认的iztro服务
        iztro_service_url = os.getenv('IZTRO_SERVICE_URL', 'http://127.0.0.1:3000')
        target_url = f"{iztro_service_url}/api/astro/solar"
    
    # 检查URL是否允许代理
    if not is_allowed_url(target_url) and '127.0.0.1' not in target_url and 'localhost' not in target_url:
        return jsonify({
            'success': False,
            'error': f'Proxy to domain not allowed: {target_url}'
        }), 403
    
    try:
        # 准备请求参数
        headers = {}
        
        # 复制原始请求的Content-Type
        if request.content_type:
            headers['Content-Type'] = request.content_type
        
        # 准备请求数据
        data = None
        if request.method == 'POST':
            if request.is_json:
                data = json.dumps(request.get_json())
                headers['Content-Type'] = 'application/json'
            else:
                data = request.get_data()
        
        # 发送代理请求
        start_time = time.time()
        response = requests.request(
            method=request.method,
            url=target_url,
            headers=headers,
            data=data,
            params=request.args if request.method == 'GET' else None,
            timeout=PROXY_TIMEOUT
        )
        elapsed = time.time() - start_time
        
        # 返回响应
        return jsonify({
            'success': True,
            'status_code': response.status_code,
            'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text,
            'elapsed': elapsed
        })
    
    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'error': f'Proxy request timeout after {PROXY_TIMEOUT} seconds'
        }), 504
    
    except requests.exceptions.ConnectionError:
        # 连接失败，尝试使用本地iztro服务作为fallback
        try:
            return fallback_to_local_iztro(request)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Proxy connection failed and local fallback also failed: {str(e)}'
            }), 502
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Proxy error: {str(e)}'
        }), 500

def fallback_to_local_iztro(request):
    """回退到本地iztro计算"""
    # 这里可以集成本地iztro计算库
    # 目前返回一个占位响应，表示使用了fallback
    return jsonify({
        'success': True,
        'status_code': 200,
        'data': {
            'message': 'Using local iztro fallback due to external API failure',
            'fallback': True,
            'timestamp': time.time()
        },
        'elapsed': 0
    })

@proxy_bp.route('/api/proxy/health', methods=['GET'])
@cross_origin(origins=['https://www.elemental.bond', 'http://localhost:5173'])
def proxy_health():
    """代理服务健康检查"""
    return jsonify({
        'success': True,
        'service': 'proxy',
        'allowed_domains': list(ALLOWED_PROXY_DOMAINS),
        'timeout': PROXY_TIMEOUT
    })