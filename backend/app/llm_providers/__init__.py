from __future__ import annotations
from collections.abc import Mapping
from typing import Any

from flask import current_app

from app.utils.errors import business_error

from .base import BaseLLMProvider
from .fallback import FallbackProvider
from .mock import MockProvider

# Conditional imports for providers that may have missing dependencies
try:
    from .aliyun import AliyunProvider
    ALIYUN_AVAILABLE = True
except ImportError:
    ALIYUN_AVAILABLE = False
    AliyunProvider = None

try:
    from .deepseek import DeepSeekProvider
    DEEPSEEK_AVAILABLE = True
except ImportError:
    DEEPSEEK_AVAILABLE = False
    DeepSeekProvider = None

try:
    from .glm import GLMProvider
    GLM_AVAILABLE = True
except ImportError:
    GLM_AVAILABLE = False
    GLMProvider = None

try:
    from .qwen import QwenProvider
    QWEN_AVAILABLE = True
except ImportError:
    QWEN_AVAILABLE = False
    QwenProvider = None

try:
    from .volcano import VolcanoProvider
    VOLCANO_AVAILABLE = True
except ImportError:
    VOLCANO_AVAILABLE = False
    VolcanoProvider = None

try:
    from .anthropic import AnthropicProvider
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    AnthropicProvider = None

try:
    from .nvidia import NvidiaProvider
    NVIDIA_AVAILABLE = True
except ImportError:
    NVIDIA_AVAILABLE = False
    NvidiaProvider = None


def create_provider(
    provider_name: str,
    model: str | None = None,
    app_config: Mapping[str, Any] | None = None,
) -> BaseLLMProvider:
    provider_name = (provider_name or "").strip().lower()
    resolved_config: Mapping[str, Any]
    if app_config is not None:
        resolved_config = app_config
    else:
        resolved_config = current_app.config

    model = model or str(resolved_config.get("LLM_MODEL", ""))

    if provider_name == "volcano":
        if not VOLCANO_AVAILABLE or VolcanoProvider is None:
            print("WARNING: Volcano provider not available, falling back to mock")
            return MockProvider(model=model)
        api_key = str(resolved_config.get("VOLCANO_API_KEY", ""))
        if not api_key:
            raise business_error("A3002", "volcano api key is not configured", 502, True)
        provider_model = str(resolved_config.get("VOLCANO_MODEL") or model)
        return VolcanoProvider(api_key=api_key, model=provider_model)

    if provider_name == "aliyun":
        if not ALIYUN_AVAILABLE or AliyunProvider is None:
            print("WARNING: Aliyun provider not available, falling back to mock")
            return MockProvider(model=model)
        api_key = str(resolved_config.get("ALIYUN_API_KEY", ""))
        if not api_key:
            raise business_error("A3002", "aliyun api key is not configured", 502, True)
        return AliyunProvider(
            api_key=api_key,
            base_url=str(resolved_config.get("ALIYUN_BASE_URL", "")),
            model=model,
        )

    if provider_name == "deepseek":
        if not DEEPSEEK_AVAILABLE or DeepSeekProvider is None:
            print("WARNING: DeepSeek provider not available, falling back to mock")
            return MockProvider(model=model)
        api_key = str(resolved_config.get("DEEPSEEK_API_KEY", ""))
        if not api_key:
            raise business_error("A3002", "deepseek api key is not configured", 502, True)
        return DeepSeekProvider(
            api_key=api_key,
            base_url=str(resolved_config.get("DEEPSEEK_BASE_URL", "")),
            model=model,
        )

    if provider_name == "glm":
        if not GLM_AVAILABLE or GLMProvider is None:
            print("WARNING: GLM provider not available, falling back to mock")
            return MockProvider(model=model)
        api_key = str(resolved_config.get("ZHIPU_API_KEY", ""))
        if not api_key:
            raise business_error("A3002", "zhipu api key is not configured", 502, True)
        return GLMProvider(api_key=api_key, model=model)

    if provider_name == "qwen":
        if not QWEN_AVAILABLE or QwenProvider is None:
            print("WARNING: Qwen provider not available, falling back to mock")
            return MockProvider(model=model)
        api_key = str(resolved_config.get("QWEN_API_KEY", ""))
        if not api_key:
            raise business_error("A3002", "qwen api key is not configured", 502, True)
        return QwenProvider(
            api_key=api_key,
            base_url=str(resolved_config.get("QWEN_BASE_URL", "")),
            model=model,
        )

    if provider_name == "anthropic":
        if not ANTHROPIC_AVAILABLE or AnthropicProvider is None:
            print("WARNING: Anthropic provider not available, falling back to mock")
            return MockProvider(model=model)
        api_key = str(resolved_config.get("ANTHROPIC_API_KEY", ""))
        if not api_key:
            raise business_error("A3002", "anthropic api key is not configured", 502, True)
        return AnthropicProvider(
            api_key=api_key,
            base_url=str(resolved_config.get("ANTHROPIC_BASE_URL", "https://api.b.ai/v1")),
            model=str(resolved_config.get("ANTHROPIC_MODEL") or model),
        )

    if provider_name == "nvidia":
        if not NVIDIA_AVAILABLE or NvidiaProvider is None:
            print("WARNING: NVIDIA provider not available, falling back to mock")
            return MockProvider(model=model)
        api_key = str(resolved_config.get("NVIDIA_API_KEY", ""))
        if not api_key:
            raise business_error("A3002", "nvidia api key is not configured", 502, True)
        return NvidiaProvider(
            api_key=api_key,
            base_url=str(resolved_config.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")),
            model=str(resolved_config.get("NVIDIA_MODEL") or model),
        )

    if provider_name == "fallback":
        # ── Dual-model: primary → fallback on failure ──────────────
        primary_name = str(resolved_config.get("LLM_PRIMARY_PROVIDER", "anthropic"))
        primary_model = str(resolved_config.get("LLM_PRIMARY_MODEL", model))
        fallback_name = str(resolved_config.get("LLM_FALLBACK_PROVIDER", "deepseek"))
        fallback_model = str(resolved_config.get("LLM_FALLBACK_MODEL", "deepseek-v4-pro"))

        primary = create_provider(primary_name, primary_model, resolved_config)
        fb = create_provider(fallback_name, fallback_model, resolved_config)
        return FallbackProvider(primary=primary, fallback=fb)

    if provider_name == "mock":
        return MockProvider(model=model)

    raise business_error("A1002", f"unknown provider: {provider_name}", 422, False)
