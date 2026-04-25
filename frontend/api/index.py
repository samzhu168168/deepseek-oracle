"""
Vercel Serverless Function - Flask App Entry Point (for frontend/ root)
"""
import sys
import os

# Add backend directory to Python path (works for both root configurations)
_current_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.join(_current_dir, '..', '..', 'backend')
if not os.path.isdir(_backend_dir):
    _backend_dir = os.path.join(_current_dir, '..', 'backend')
sys.path.insert(0, _backend_dir)

from app import create_app

app = create_app()
