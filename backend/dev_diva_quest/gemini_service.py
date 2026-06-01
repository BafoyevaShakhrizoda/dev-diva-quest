from __future__ import annotations

import json
import logging
import re
from typing import Any

import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)

_configured = False

# Tried in order when the configured model fails (404 / unavailable).
MODEL_FALLBACKS = (
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
)


class GeminiError(Exception):
    """Raised when Gemini cannot complete a request (config, auth, model, network)."""

    def __init__(self, message: str, *, code: str = "GEMINI_ERROR"):
        super().__init__(message)
        self.code = code


def _ensure_configured() -> None:
    global _configured
    if not settings.GOOGLE_AI_API_KEY:
        raise GeminiError(
            "GOOGLE_AI_API_KEY is not set in backend/.env. "
            "Create a free key at https://aistudio.google.com/apikey",
            code="NO_API_KEY",
        )
    if not _configured:
        genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
        _configured = True


def _friendly_error(exc: Exception) -> GeminiError:
    msg = str(exc)
    lower = msg.lower()
    if "api key expired" in lower or "api_key_invalid" in lower:
        return GeminiError(
            "Google AI API key is expired or invalid. "
            "Generate a new key at https://aistudio.google.com/apikey and set GOOGLE_AI_API_KEY in backend/.env",
            code="API_KEY_INVALID",
        )
    if "not found" in lower and "model" in lower:
        return GeminiError(
            f"Gemini model not available ({settings.GEMINI_MODEL}). "
            "Try GEMINI_MODEL=gemini-2.0-flash in backend/.env",
            code="MODEL_NOT_FOUND",
        )
    if "quota" in lower or "rate limit" in lower or "resource_exhausted" in lower:
        return GeminiError(
            "Gemini API quota exceeded. Wait a few minutes or check your Google AI Studio usage.",
            code="QUOTA_EXCEEDED",
        )
    if "permission" in lower or "403" in lower:
        return GeminiError(
            "Gemini API access denied. Check that Generative Language API is enabled for your key.",
            code="PERMISSION_DENIED",
        )
    return GeminiError(f"Gemini error: {msg}", code="GEMINI_ERROR")


def _model_candidates() -> list[str]:
    primary = (settings.GEMINI_MODEL or "gemini-2.5-flash").strip()
    seen: set[str] = set()
    out: list[str] = []
    for name in [primary, *MODEL_FALLBACKS]:
        if name and name not in seen:
            seen.add(name)
            out.append(name)
    return out


def _generate_with_model(
    model_name: str,
    prompt: str,
    *,
    system_instruction: str | None = None,
    json_mode: bool = False,
):
    model = genai.GenerativeModel(
        model_name,
        system_instruction=system_instruction,
    )
    kwargs: dict[str, Any] = {}
    if json_mode:
        kwargs["generation_config"] = genai.GenerationConfig(
            response_mime_type="application/json",
        )
    return model.generate_content(prompt, **kwargs)


def generate_json(
    prompt: str,
    system_instruction: str | None = None,
) -> Any | None:
    _ensure_configured()
    last_error: GeminiError | None = None

    for model_name in _model_candidates():
        try:
            response = _generate_with_model(
                model_name,
                prompt,
                system_instruction=system_instruction,
                json_mode=True,
            )
            if not response.text:
                continue
            return json.loads(response.text.strip())
        except GeminiError:
            raise
        except json.JSONDecodeError as exc:
            logger.warning("Gemini JSON parse failed for model %s: %s", model_name, exc)
            last_error = GeminiError("Gemini returned invalid JSON.", code="BAD_JSON")
        except Exception as exc:
            err = _friendly_error(exc)
            logger.warning("Gemini JSON failed for model %s: %s", model_name, err)
            last_error = err
            if err.code == "API_KEY_INVALID":
                raise err

    if last_error:
        raise last_error
    raise GeminiError(
        "Gemini returned no usable JSON. Check GOOGLE_AI_API_KEY and GEMINI_MODEL.",
        code="EMPTY_RESPONSE",
    )


def generate_text(prompt: str, system_instruction: str | None = None) -> str:
    _ensure_configured()
    last_error: GeminiError | None = None

    for model_name in _model_candidates():
        try:
            response = _generate_with_model(
                model_name,
                prompt,
                system_instruction=system_instruction,
                json_mode=False,
            )
            text = (response.text or "").strip()
            if text:
                if model_name != _model_candidates()[0]:
                    logger.info("Gemini text succeeded with fallback model %s", model_name)
                return re.sub(r"^```[\w]*\n?|\n?```$", "", text).strip()
        except GeminiError:
            raise
        except Exception as exc:
            err = _friendly_error(exc)
            logger.warning("Gemini text failed for model %s: %s", model_name, err)
            last_error = err
            if err.code == "API_KEY_INVALID":
                raise err

    if last_error:
        raise last_error
    raise GeminiError(
        "Gemini returned an empty response. Check GOOGLE_AI_API_KEY and GEMINI_MODEL.",
        code="EMPTY_RESPONSE",
    )
