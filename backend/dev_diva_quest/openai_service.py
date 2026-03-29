"""
OpenAI Service for Dev Diva Quest
Fallback AI service when Gemini quota is exhausted
"""
from __future__ import annotations

import json
import logging
from typing import Any

from openai import OpenAI
from django.conf import settings

logger = logging.getLogger(__name__)

_client = None

def _get_client() -> OpenAI | None:
    """Get OpenAI client or return None if not configured."""
    global _client
    if not settings.OPENAI_API_KEY:
        return None
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client

def generate_json(
    prompt: str,
    system_instruction: str | None = None,
) -> Any | None:
    """
    Generate JSON response using OpenAI.
    Returns parsed JSON or None on missing key / error.
    """
    client = _get_client()
    if not client:
        return None
    
    try:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        if not response.choices:
            return None
            
        content = response.choices[0].message.content
        if not content:
            return None
            
        return json.loads(content.strip())
    except Exception:
        logger.exception("OpenAI JSON generation failed")
        return None

def generate_text(prompt: str, system_instruction: str | None = None) -> str | None:
    """Generate text response using OpenAI."""
    client = _get_client()
    if not client:
        return None
    
    try:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
        )
        
        if not response.choices:
            return None
            
        content = response.choices[0].message.content
        return (content or "").strip() or None
    except Exception:
        logger.exception("OpenAI text generation failed")
        return None
