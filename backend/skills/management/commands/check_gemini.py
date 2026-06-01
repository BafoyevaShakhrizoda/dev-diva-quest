"""Diagnose Gemini: key from backend/.env, model name, one test request."""

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Tekshiruv: GOOGLE_AI_API_KEY va GEMINI_MODEL (bitta qisqa so‘rov)"

    def handle(self, *args, **options):
        key = (settings.GOOGLE_AI_API_KEY or "").strip()
        model_id = (settings.GEMINI_MODEL or "gemini-2.5-flash").strip()

        if not key:
            self.stderr.write(
                self.style.ERROR(
                    "GOOGLE_AI_API_KEY bo‘sh. Kalitni backend/.env fayliga yozing (loyiha ildizidagi .env emas!)."
                )
            )
            return

        tail = key[-6:] if len(key) >= 6 else key
        self.stdout.write(f"Kalit yuklandi (oxirgi belgilar): …{tail}  (uzunlik: {len(key)})")
        self.stdout.write(f"Model: {model_id}")

        try:
            import google.generativeai as genai

            genai.configure(api_key=key)
            model = genai.GenerativeModel(model_id)
            response = model.generate_content('Reply with exactly one word: ok')
            text = (response.text or "").strip()
            self.stdout.write(self.style.SUCCESS(f"Javob: {text!r}"))
        except Exception as e:
            msg = str(e)
            self.stdout.write(self.style.ERROR(f"Gemini xatosi: {msg}"))
            if "api key expired" in msg.lower() or "api_key_invalid" in msg.lower():
                self.stdout.write(
                    self.style.WARNING(
                        "\n→ Kalit muddati tugagan yoki noto‘g‘ri. Yangi kalit: https://aistudio.google.com/apikey\n"
                        "  backend/.env ichida GOOGLE_AI_API_KEY=... ni yangilang va serverni qayta ishga tushiring.\n"
                    )
                )
            else:
                self.stdout.write(
                    "\nKo‘p uchraydigan sabablar:\n"
                    "  • 404 / model not found — GEMINI_MODEL=gemini-2.0-flash sinab ko‘ring.\n"
                    "  • Kalit noto‘g‘ri — Google AI Studio dan yangi API key.\n"
                    "  • Kalit frontend .env da — Django faqat backend/.env ni o‘qiydi.\n"
                )
