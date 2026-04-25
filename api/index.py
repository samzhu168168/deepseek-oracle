"""
Vercel Serverless Function - Flask App Entry Point
"""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app

# Vercel Python Runtime auto-detects the Flask WSGI app named 'app'
app = create_app()
