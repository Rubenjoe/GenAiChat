"""Environment-backed configuration for Celcia."""
import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else default


# OpenRouter configuration
OPENROUTER_MODEL = env("OPENROUTER_MODEL", "openrouter/free")
OPENROUTER_API_KEY = env("OPENROUTER_API_KEY")

# NVIDIA NIM configuration
NIM_API_KEY = env("NIM_API_KEY")
NIM_CHAT_MODEL = env("NIM_CHAT_MODEL", "meta/llama-3.1-70b-instruct")
NIM_BASE_URL = env("NIM_BASE_URL", "https://integrate.api.nvidia.com/v1")
NIM_TTS_MODEL = env("NIM_TTS_MODEL", "nvidia/tts-hifigan")
NIM_TTS_VOICE = env("NIM_TTS_VOICE", "female")

# AI Provider selection: "openrouter" or "nim"
AI_PROVIDER = env("AI_PROVIDER", "openrouter")

# Voice Provider selection: "elevenlabs" or "nim"
VOICE_PROVIDER = env("VOICE_PROVIDER", "elevenlabs")

# ElevenLabs configuration
ELEVENLABS_API_KEY = env("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = env("ELEVENLABS_VOICE_ID")

# Supabase Auth and private persistence
SUPABASE_URL = env("SUPABASE_URL")
SUPABASE_ANON_KEY = env("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = env("SUPABASE_SERVICE_ROLE_KEY")
CELCIA_OWNER_EMAIL = env("CELCIA_OWNER_EMAIL")