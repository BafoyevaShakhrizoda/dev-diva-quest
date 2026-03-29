"""
Shared Gemini helpers: JSON responses, single configure point, model from settings.
"""
from __future__ import annotations

import json
import logging
from typing import Any

import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)

_configured = False


def _ensure_configured() -> bool:
    global _configured
    if not settings.GOOGLE_AI_API_KEY:
        return False
    if not _configured:
        genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
        _configured = True
    return True


def generate_json(
    prompt: str,
    system_instruction: str | None = None,
) -> Any | None:
    """
    Returns parsed JSON (dict or list) or None on missing key / error.
    Uses response_mime_type=application/json for reliable parsing.
    """
    if not _ensure_configured():
        return None
    try:
        model = genai.GenerativeModel(
            settings.GEMINI_MODEL,
            system_instruction=system_instruction,
        )
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            ),
        )
        if not response.text:
            return None
        return json.loads(response.text.strip())
    except Exception:
        logger.exception("Gemini JSON generation failed")
        return None


def generate_text(prompt: str, system_instruction: str | None = None) -> str | None:
    """Plain text response (for legacy flows)."""
    if not _ensure_configured():
        return None
    try:
        model = genai.GenerativeModel(
            settings.GEMINI_MODEL,
            system_instruction=system_instruction,
        )
        response = model.generate_content(prompt)
        return (response.text or "").strip() or None
    except Exception:
        logger.exception("Gemini text generation failed")
        return None
