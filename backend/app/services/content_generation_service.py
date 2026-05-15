"""
内容生成服务 — 集成 Pexels 素材库和 NanoBanana AI 图片生成
为 Oracle 回答自动附加可视化内容
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any

import requests
from flask import current_app

logger = logging.getLogger(__name__)


@dataclass
class GeneratedContent:
    """生成的内容结果。"""

    type: str  # photo / video / ai_image
    url: str
    alt_text: str
    source: str
    width: int | None = None
    height: int | None = None
    duration: float | None = None  # 视频时长（秒）


class ContentGenerationService:
    """内容生成服务 — 根据回答上下文自动匹配合适的图片或生成 AI 图像。"""

    PEXELS_BASE = "https://api.pexels.com"

    def __init__(self, pexels_api_key: str = "", nanobanana_api_key: str = "", nanobanana_base: str = ""):
        self._pexels_key = pexels_api_key
        self._nanobanana_key = nanobanana_api_key
        self._nanobanana_base = nanobanana_base

    # ------------------------------------------------------------------
    # 公开接口
    # ------------------------------------------------------------------

    def generate_for_answer(self, intent: str, answer_text: str, user_query: str) -> GeneratedContent | None:
        """根据回答上下文生成匹配的视觉内容。"""
        if not self._pexels_key and not self._nanobanana_key:
            logger.debug("ContentGeneration: 无可用 API Key，跳过内容生成")
            return None

        keyword = self._extract_visual_keyword(intent, answer_text, user_query)
        if not keyword:
            return None

        content = self._try_pexels(keyword)
        if content:
            return content

        content = self._try_nanobanana(keyword, intent)
        return content

    def search_pexels_photos(self, query: str, per_page: int = 3, locale: str = "zh-CN") -> list[dict[str, Any]]:
        """搜索 Pexels 照片。"""
        if not self._pexels_key:
            return []
        try:
            resp = requests.get(
                f"{self.PEXELS_BASE}/v1/search",
                headers={"Authorization": self._pexels_key},
                params={"query": query, "per_page": per_page, "locale": locale},
                timeout=8,
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("photos", [])
        except Exception as exc:
            logger.warning("Pexels 搜索失败: %s", exc)
            return []

    def search_pexels_videos(self, query: str, per_page: int = 3) -> list[dict[str, Any]]:
        """搜索 Pexels 视频。"""
        if not self._pexels_key:
            return []
        try:
            resp = requests.get(
                f"{self.PEXELS_BASE}/videos/search",
                headers={"Authorization": self._pexels_key},
                params={"query": query, "per_page": per_page},
                timeout=8,
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("videos", [])
        except Exception as exc:
            logger.warning("Pexels 视频搜索失败: %s", exc)
            return []

    # ------------------------------------------------------------------
    # 内部方法
    # ------------------------------------------------------------------

    def _try_pexels(self, keyword: str) -> GeneratedContent | None:
        """尝试从 Pexels 获取匹配图片。"""
        if not self._pexels_key:
            return None
        photos = self.search_pexels_photos(keyword, per_page=1)
        if not photos:
            return None
        photo = photos[0]
        return GeneratedContent(
            type="photo",
            url=photo.get("src", {}).get("medium", photo.get("src", {}).get("original", "")),
            alt_text=photo.get("alt", keyword),
            source="Pexels",
            width=photo.get("width"),
            height=photo.get("height"),
        )

    def _try_nanobanana(self, keyword: str, intent: str) -> GeneratedContent | None:
        """尝试通过 NanoBanana 生成 AI 图像。"""
        if not self._nanobanana_key or not self._nanobanana_base:
            return None
        try:
            style = self._intent_to_style(intent)
            resp = requests.post(
                f"{self._nanobanana_base}/v1/images/generate",
                headers={"Authorization": f"Bearer {self._nanobanana_key}"},
                json={
                    "prompt": f"{keyword}, {style}, eastern aesthetic, serene atmosphere",
                    "size": "1024x1024",
                    "style": style,
                },
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()
            image_url = data.get("url") or data.get("data", {}).get("url", "")
            if not image_url:
                return None
            return GeneratedContent(
                type="ai_image",
                url=image_url,
                alt_text=f"AI 生成: {keyword}",
                source="NanoBanana",
                width=1024,
                height=1024,
            )
        except Exception as exc:
            logger.warning("NanoBanana 生成失败: %s", exc)
            return None

    @staticmethod
    def _extract_visual_keyword(intent: str, answer_text: str, user_query: str) -> str:
        """从回答上下文中提取可视化关键词。"""
        intent_keywords = {
            "daily_card": "宁静自然东方意境",
            "long_term": "中国山水画意境远山云雾",
            "dual_track": "山水意境中国风",
            "short_term": "东方插花禅意简约",
            "mindset": "中国书法禅修安静",
            "symbolic": "塔罗牌东方元素融合",
        }
        fallback = intent_keywords.get(intent, "东方美学禅意")

        positive_emotions = ["平静", "希望", "温暖", "力量", "光", "成长", "花开", "日出"]
        for word in positive_emotions:
            if word in answer_text:
                return f"{word} 东方意境 {fallback}"

        return fallback

    @staticmethod
    def _intent_to_style(intent: str) -> str:
        """意图映射到生成风格。"""
        styles = {
            "daily_card": "ink-wash-painting",
            "long_term": "traditional-chinese-landscape",
            "dual_track": "eastern-watercolor",
            "short_term": "zen-minimal",
            "mindset": "calligraphy-inspired",
            "symbolic": "mystical-eastern",
        }
        return styles.get(intent, "eastern-aesthetic")


def get_content_generation_service() -> ContentGenerationService:
    """获取内容生成服务单例。"""
    service = current_app.extensions.get("content_generation_service")
    if service:
        return service
    service = ContentGenerationService(
        pexels_api_key=current_app.config.get("PEXELS_API_KEY", ""),
        nanobanana_api_key=current_app.config.get("NANOBANANA_API_KEY", ""),
        nanobanana_base=current_app.config.get("NANOBANANA_BASE_URL", ""),
    )
    current_app.extensions["content_generation_service"] = service
    return service
