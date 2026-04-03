"""
Vercel Serverless Function - Main Flask App Entry Point
This wraps the entire Flask application as a single Serverless Function
"""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app

# Create Flask app
app = create_app()

# Vercel serverless handler
def handler(request, context):
    """Vercel serverless handler that wraps Flask app"""
    return app(request.environ, context)

# For local testing
if __name__ == "__main__":
    app.run(debug=True)
