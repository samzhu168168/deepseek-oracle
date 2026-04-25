from __future__ import annotations
from flask import Flask

from .analyze import analyze_bp
from .divination import divination_bp
from .divination_stream import divination_stream_bp
from .email import email_bp
from .export import export_bp
from .history import history_bp
from .insights import insights_bp
from .license import license_bp
from .oracle import oracle_bp
from .proxy import proxy_bp
from .task import task_bp


def register_blueprints(app: Flask) -> None:
    """Register all API blueprints with the Flask app."""
    blueprints = [
        (divination_bp, "/api"),
        (divination_stream_bp, None),  # Streaming endpoints
        (analyze_bp, "/api/divination"),
        (task_bp, "/api"),
        (history_bp, "/api"),
        (export_bp, "/api"),
        (insights_bp, "/api"),
        (oracle_bp, "/api"),
        (proxy_bp, "/api"),  # 代理接口，用于转发被封锁的外部API
        (license_bp, None),  # Already has /api prefix in routes
        (email_bp, None)     # Already has /api prefix in routes
    ]
    
    for blueprint, prefix in blueprints:
        if prefix:
            app.register_blueprint(blueprint, url_prefix=prefix)
        else:
            app.register_blueprint(blueprint)
