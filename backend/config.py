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


OPENROUTER_MODEL = env("OPENROUTER_MODEL", "openrouter/free")
OPENROUTER_API_KEY = env("OPENROUTER_API_KEY")
SUPABASE_URL = env("SUPABASE_URL")
SUPABASE_ANON_KEY = env("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = env("SUPABASE_SERVICE_ROLE_KEY")
CELCIA_OWNER_EMAIL = env("CELCIA_OWNER_EMAIL")
