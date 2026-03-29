"""
Universal AI Service that can switch between Gemini and OpenAI
"""
from __future__ import annotations

import logging
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)

def get_ai_service():
    """Get the current AI service based on settings."""
    ai_provider = getattr(settings, 'AI_PROVIDER', 'gemini').lower()
    
    if ai_provider == 'openai':
        try:
            from .openai_service import generate_json as openai_json, generate_text as openai_text
            return {
                'provider': 'openai',
                'generate_json': openai_json,
                'generate_text': openai_text,
            }
        except ImportError:
            logger.error("OpenAI service not available, falling back to Gemini")
    
    # Default to Gemini
    try:
        from .gemini_service import generate_json as gemini_json, generate_text as gemini_text
        return {
            'provider': 'gemini',
            'generate_json': gemini_json,
            'generate_text': gemini_text,
        }
    except ImportError:
        logger.error("Gemini service not available")
        return None

def generate_json(prompt: str, system_instruction: str | None = None) -> Any | None:
    """Generate JSON using the current AI service."""
    service = get_ai_service()
    if not service:
        return None
    
    try:
        return service['generate_json'](prompt, system_instruction)
    except Exception as e:
        logger.error(f"AI service {service['provider']} failed: {e}")
        
        # Try fallback service
        fallback_provider = 'openai' if service['provider'] == 'gemini' else 'gemini'
        logger.info(f"Trying fallback service: {fallback_provider}")
        
        if fallback_provider == 'openai':
            try:
                from .openai_service import generate_json as openai_json
                return openai_json(prompt, system_instruction)
            except ImportError:
                pass
        else:
            try:
                from .gemini_service import generate_json as gemini_json
                return gemini_json(prompt, system_instruction)
            except ImportError:
                pass
        
        return None

def generate_text(prompt: str, system_instruction: str | None = None) -> str | None:
    """Generate text using the current AI service."""
    service = get_ai_service()
    if not service:
        return None
    
    try:
        return service['generate_text'](prompt, system_instruction)
    except Exception as e:
        logger.error(f"AI service {service['provider']} failed: {e}")
        
        # Try fallback service
        fallback_provider = 'openai' if service['provider'] == 'gemini' else 'gemini'
        logger.info(f"Trying fallback service: {fallback_provider}")
        
        if fallback_provider == 'openai':
            try:
                from .openai_service import generate_text as openai_text
                return openai_text(prompt, system_instruction)
            except ImportError:
                pass
        else:
            try:
                from .gemini_service import generate_text as gemini_text
                return gemini_text(prompt, system_instruction)
            except ImportError:
                pass
        
        return None
