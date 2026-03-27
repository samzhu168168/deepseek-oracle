from flask import Flask

from .analyze import analyze_bp
from .divination import divination_bp
from .export import export_bp
from .history import history_bp
from .insights import insights_bp
from .oracle import oracle_bp
from .task import task_bp

# Import license and email routes from backend root
import sys
from pathlib import Path
backend_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_root))
from license_routes import license_bp
from email_routes import email_bp


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(divination_bp, url_prefix="/api")
    app.register_blueprint(analyze_bp, url_prefix="/api/divination")
    app.register_blueprint(task_bp, url_prefix="/api")
    app.register_blueprint(history_bp, url_prefix="/api")
    app.register_blueprint(export_bp, url_prefix="/api")
    app.register_blueprint(insights_bp, url_prefix="/api")
    app.register_blueprint(oracle_bp, url_prefix="/api")
    app.register_blueprint(license_bp)
    app.register_blueprint(email_bp)
