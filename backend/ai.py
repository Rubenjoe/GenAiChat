import os
from openai import OpenAI
from .config import (
    OPENROUTER_MODEL, OPENROUTER_API_KEY,
    NIM_API_KEY, NIM_CHAT_MODEL, NIM_BASE_URL,
    AI_PROVIDER
)
from .context import PERSONA


class OpenRouterAI:
    """OpenRouter AI provider (original implementation)."""
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": os.getenv("APP_URL", "https://celcia-ai.vercel.app"),
                "X-Title": "Celcia AI"
            },
        )
        self.model_name = OPENROUTER_MODEL

    def generate_response(self, user_message, conversation_history=None, system_prompt=None):
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured")

        if conversation_history is None:
            conversation_history = []

        messages = [
            {"role": "system", "content": system_prompt or PERSONA}
        ]

        for msg in conversation_history:
            messages.append(msg)

        messages.append({"role": "user", "content": user_message})

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            return response.choices[0].message.content or "I couldn't produce a response."
        except Exception as e:
            raise RuntimeError("OpenRouter response failed") from e

    def set_model(self, model_name):
        self.model_name = model_name


class NIMAI:
    """NVIDIA NIM AI provider."""
    def __init__(self):
        self.api_key = NIM_API_KEY
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=NIM_BASE_URL,
        )
        self.model_name = NIM_CHAT_MODEL

    def generate_response(self, user_message, conversation_history=None, system_prompt=None):
        if not self.api_key:
            raise ValueError("NIM_API_KEY is not configured")

        if conversation_history is None:
            conversation_history = []

        messages = [
            {"role": "system", "content": system_prompt or PERSONA}
        ]

        for msg in conversation_history:
            messages.append(msg)

        messages.append({"role": "user", "content": user_message})

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            return response.choices[0].message.content or "I couldn't produce a response."
        except Exception as e:
            raise RuntimeError("NIM response failed") from e

    def set_model(self, model_name):
        self.model_name = model_name


def get_ai_provider():
    """Factory function to get the configured AI provider."""
    if AI_PROVIDER == "nim":
        return NIMAI()
    return OpenRouterAI()