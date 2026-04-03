from flask import Flask

from .analyze import analyze_bp
from .divination import divination_bp
from .email import email_bp
from .export import export_bp
from .history import history_bp
from .insights import insights_bp
from .license import license_bp
from .oracle import oracle_bp
from .task import task_bp


def register_blueprints(app: Flask) -> None:
    """Register all API blueprints with the Flask app."""
    blueprints = [
        (divination_bp, "/api"),
        (analyze_bp, "/api/divination"),
        (task_bp, "/api"),
        (history_bp, "/api"),
        (export_bp, "/api"),
        (insights_bp, "/api"),
        (oracle_bp, "/api"),
        (license_bp, None),  # Already has /api prefix in routes
        (email_bp, None),    # Already has /api prefix in routes
    ]
    
    for blueprint, prefix in blueprints:
        if prefix:
            app.register_blueprint(blueprint, url_prefix=prefix)
        else:
            app.register_blueprint(blueprint)
