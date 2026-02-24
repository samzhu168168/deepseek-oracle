import uuid
import time

from flask import Flask, g, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from redis import Redis
from rq import Queue

from .api import register_blueprints
from .config import Config
from .models import SystemLogRepo
from .models.database import init_db
from .schemas import validate_analyze_payload
from .services import get_analysis_service
from .utils.errors import AppError
from .utils.logging import setup_logging
from .utils.response import error_response, success_response


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    setup_logging(app)
    CORS(
        app,
        resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=False,
    )

    init_db(app.config["DATABASE_PATH"])
    app.extensions["system_log_repo"] = SystemLogRepo(app.config["DATABASE_PATH"])

    redis_conn = None
    redis_available = False
    try:
        redis_conn = Redis.from_url(
            app.config["REDIS_URL"],
            socket_connect_timeout=60,
        )
        redis_conn.ping()
        redis_available = True
    except Exception:
        print("WARNING: Redis unavailable, running in no-queue mode")

    app.extensions["redis"] = redis_conn
    app.extensions["redis_available"] = redis_available
    app.extensions["analysis_queue"] = (
        Queue(app.config["ANALYSIS_QUEUE"], connection=redis_conn)
        if redis_available
        else None
    )

    @app.before_request
    def attach_request_id() -> None:
        g.request_id = f"req_{uuid.uuid4().hex}"
        g.request_started_at = time.perf_counter()

    @app.after_request
    def set_request_id_header(response):
        request_id = getattr(g, "request_id", None)
        if request_id:
            response.headers["X-Request-Id"] = request_id

        if request.path.startswith("/api/") or request.path in {"/check_cache"}:
            try:
                started_at = getattr(g, "request_started_at", None)
                duration_ms = int((time.perf_counter() - started_at) * 1000) if started_at else None
                log_level = "error" if int(response.status_code) >= 500 else "info"

                app.extensions["system_log_repo"].create_log(
                    request_id=request_id,
                    method=request.method,
                    path=request.path,
                    status_code=int(response.status_code),
                    duration_ms=duration_ms,
                    level=log_level,
                    message=response.status,
                    ip=request.headers.get("X-Forwarded-For") or request.remote_addr,
                    user_agent=request.headers.get("User-Agent"),
                )
            except Exception as exc:  # pragma: no cover
                app.logger.warning("write system log failed: %s", exc)

        return response

    register_blueprints(app)

    @app.errorhandler(AppError)
    def handle_app_error(exc: AppError):
        return error_response(
            code=exc.code,
            message=exc.message,
            status=exc.http_status,
            details=exc.details,
            retryable=exc.retryable,
        )

    @app.errorhandler(HTTPException)
    def handle_http_exception(exc: HTTPException):
        return error_response(
            code=f"HTTP_{exc.code}",
            message=exc.description or exc.name,
            status=exc.code or 500,
            retryable=False,
        )

    @app.errorhandler(Exception)
    def handle_unexpected_error(exc: Exception):
        app.logger.exception("unhandled exception: %s", exc)
        return error_response(
            code="A5000",
            message="internal server error",
            status=500,
            retryable=False,
        )

    @app.get("/healthz")
    def healthz():
        return success_response(data={"status": "ok"})

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    @app.get("/readyz")
    def readyz():
        if not app.extensions.get("redis_available"):
            return success_response(data={"status": "ready", "redis": False})
        redis_conn = app.extensions["redis"]
        redis_conn.ping()
        return success_response(data={"status": "ready", "redis": True})

    @app.post("/check_cache")
    def legacy_check_cache():
        payload = request.get_json(silent=True) or {}
        normalized = validate_analyze_payload(payload)
        normalized["user_id"] = 0
        data = get_analysis_service().check_cache(normalized)
        return jsonify({"cached_results": data.get("cached_results")})

    return app
