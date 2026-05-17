from __future__ import annotations
import os
import re
from pathlib import Path

# Conditional import for dotenv
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    # If dotenv is not available, just use system environment variables
    print("WARNING: python-dotenv not installed, using system environment variables only")
    pass


BASE_DIR = Path(__file__).resolve().parent.parent


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def _to_bool(value: str, default: bool = False) -> bool:
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _normalize_origins(value: str) -> list[object]:
    origins = _split_csv(value)
    normalized: list[object] = []
    for origin in origins:
        if "*" in origin:
            escaped = re.escape(origin).replace("\\*", ".*")
            normalized.append(re.compile(f"^{escaped}$"))
        else:
            normalized.append(origin)
    return normalized


class Config:
    DEBUG = _to_bool(os.getenv("DEBUG", "false"))
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    if SECRET_KEY == "dev-secret-change-me" and not DEBUG:
        import warnings
        warnings.warn("SECRET_KEY is still the default value — generate a real key for production")

    CORS_ORIGINS = _normalize_origins(
        os.getenv(
            "CORS_ORIGINS",
            "https://elemental.bond,https://*.vercel.app,http://localhost:5173,http://localhost:3000",
        )
    )

    DATABASE_PATH = os.getenv("DATABASE_PATH", str(BASE_DIR / "data.db"))
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    ANALYSIS_QUEUE = os.getenv("ANALYSIS_QUEUE", "analysis")

    IZTHON_SRC_PATH = os.getenv("IZTHON_SRC_PATH", "")
    REQUEST_TIMEOUT_S = int(os.getenv("REQUEST_TIMEOUT_S", "60"))
    MAX_TASK_RETRY = int(os.getenv("MAX_TASK_RETRY", "2"))
    LLM_MAX_RETRIES = int(os.getenv("LLM_MAX_RETRIES", "2"))
    ORACLE_EAST_ONLY_MVP = _to_bool(os.getenv("ORACLE_EAST_ONLY_MVP", "true"))

    AUTH_TOKEN_EXPIRE_HOURS = int(os.getenv("AUTH_TOKEN_EXPIRE_HOURS", "72"))
    INVITE_ONLY = _to_bool(os.getenv("INVITE_ONLY", "false"))
    INVITE_CODES = _split_csv(os.getenv("INVITE_CODES", ""))
    ADMIN_EMAILS = _split_csv(os.getenv("ADMIN_EMAILS", ""))
    SPECIAL_ADMIN_EMAIL = os.getenv("SPECIAL_ADMIN_EMAIL", "bald0wang@qq.com").strip().lower()
    EMAIL_VERIFY_REQUIRED = _to_bool(os.getenv("EMAIL_VERIFY_REQUIRED", "true"), True)
    EMAIL_CODE_EXPIRE_MINUTES = int(os.getenv("EMAIL_CODE_EXPIRE_MINUTES", "10"))

    SMTP_HOST = os.getenv("SMTP_HOST", "")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
    SMTP_USE_SSL = _to_bool(os.getenv("SMTP_USE_SSL", "true"), True)
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "")
    SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Elemental Bond")
    SMTP_TIMEOUT_S = int(os.getenv("SMTP_TIMEOUT_S", "60"))

    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "fallback")
    LLM_MODEL = os.getenv("LLM_MODEL", "claude-sonnet-4-6")
    PROMPT_VERSION = os.getenv("PROMPT_VERSION", "v1")

    # ── Dual-model fallback config (used when LLM_PROVIDER=fallback) ──
    LLM_PRIMARY_PROVIDER = os.getenv("LLM_PRIMARY_PROVIDER", "anthropic")
    LLM_PRIMARY_MODEL = os.getenv("LLM_PRIMARY_MODEL", "claude-sonnet-4-6")
    LLM_FALLBACK_PROVIDER = os.getenv("LLM_FALLBACK_PROVIDER", "deepseek")
    LLM_FALLBACK_MODEL = os.getenv("LLM_FALLBACK_MODEL", "deepseek-v4-pro")

    VOLCANO_API_KEY = os.getenv("ARK_API_KEY", "")
    VOLCANO_MODEL = os.getenv("ARK_API_MODEL", os.getenv("ARK_API_model", ""))

    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")

    ALIYUN_API_KEY = os.getenv("ALIYUN_API_KEY", "")
    ALIYUN_BASE_URL = os.getenv(
        "ALIYUN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1"
    )

    ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY", "")

    QWEN_API_KEY = os.getenv("QWEN_API_KEY", "")
    QWEN_BASE_URL = os.getenv(
        "QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1"
    )

    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_BASE_URL = os.getenv("ANTHROPIC_BASE_URL", "https://api.b.ai/v1")
    ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

    NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "nvidia/gpt-oss-120b")

    # ── PayPal ──
    PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
    PAYPAL_SECRET = os.getenv("PAYPAL_SECRET", "")
    PAYPAL_SANDBOX = _to_bool(os.getenv("PAYPAL_SANDBOX", "false"))

    CALENDAR_PRECOMPUTE_DAY = int(os.getenv("CALENDAR_PRECOMPUTE_DAY", "15"))
    SCHEDULER_POLL_SECONDS = int(os.getenv("SCHEDULER_POLL_SECONDS", "3600"))

    # ---------------------------------------------------------------
    # 内容生成 (Pexels + NanoBanana)
    # ---------------------------------------------------------------
    PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")
    NANOBANANA_API_KEY = os.getenv("NANOBANANA_API_KEY", "")
    NANOBANANA_BASE_URL = os.getenv("NANOBANANA_BASE_URL", "")
