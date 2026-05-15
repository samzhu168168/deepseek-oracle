from __future__ import annotations

import logging

from .base import BaseLLMProvider, LLMResult, ToolChatResult

logger = logging.getLogger(__name__)


class FallbackProvider(BaseLLMProvider):
    """Wraps a primary provider with an automatic fallback.

    Every call first tries *primary*. If it raises any Exception, the
    call is retried against *fallback*.

    If the fallback also fails the exception propagates to the caller
    (where the service-layer retry loop can pick it up).

    Usage
    -----
    primary  = create_provider("anthropic", "claude-sonnet-4-6")
    fallback = create_provider("deepseek", "deepseek-v4-pro")
    oracle   = FallbackProvider(primary=primary, fallback=fallback)
    result   = oracle.generate("...")
    """

    def __init__(self, primary: BaseLLMProvider, fallback: BaseLLMProvider):
        # Surface the primary model name so observability logs read naturally.
        super().__init__(model=primary.model)
        self._primary = primary
        self._fallback = fallback

    # ------------------------------------------------------------------
    # generate
    # ------------------------------------------------------------------

    def generate(self, user_message: str, timeout_s: int = 60) -> LLMResult:
        try:
            return self._primary.generate(user_message, timeout_s)
        except Exception as exc:
            logger.warning(
                "Primary provider (%s/%s) failed — falling back to %s/%s.  Error: %s",
                self._primary.__class__.__name__,
                self._primary.model,
                self._fallback.__class__.__name__,
                self._fallback.model,
                exc,
            )
        try:
            result = self._fallback.generate(user_message, timeout_s)
            # Mark the result so callers can tell a fallback was used.
            result.fallback_used = True
            return result
        except Exception:
            logger.exception("Fallback provider also failed — giving up.")
            raise

    # ------------------------------------------------------------------
    # chat_with_tools
    # ------------------------------------------------------------------

    def chat_with_tools(
        self,
        messages: list[dict],
        tools: list[dict],
        timeout_s: int = 60,
    ) -> ToolChatResult:
        try:
            return self._primary.chat_with_tools(messages, tools, timeout_s)
        except Exception as exc:
            logger.warning(
                "Primary provider (%s/%s) tool-call failed — falling back to %s/%s.  Error: %s",
                self._primary.__class__.__name__,
                self._primary.model,
                self._fallback.__class__.__name__,
                self._fallback.model,
                exc,
            )
        try:
            result = self._fallback.chat_with_tools(messages, tools, timeout_s)
            result.fallback_used = True
            return result
        except Exception:
            logger.exception("Fallback provider tool-call also failed — giving up.")
            raise
