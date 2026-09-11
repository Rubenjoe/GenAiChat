"""
Celcia AI FastAPI backend.

Routes are defined relative to the function mount point. On Vercel this file is
exposed via api/index.py, so the public paths become:
  /api/          -> Celcia frontend (Vercel also serves static root files)
  /api/health    -> health check
  /api/chat      -> OpenRouter chat completion
  /api/voice     -> ElevenLabs TTS (returns audio/mpeg bytes)
"""
from contextlib import asynccontextmanager
from pathlib import Path
import os

from fastapi import FastAPI, HTTPException
from fastapi import Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from pydantic import BaseModel
from typing import List, Optional
import logging
import requests
from .config import CELCIA_OWNER_EMAIL, SUPABASE_ANON_KEY, SUPABASE_URL
from .context import build_system_prompt
from .memory import extract_candidate
from .storage import StorageError, get_store

logger = logging.getLogger(__name__)

# Lazy AI import: only initialize when needed to prevent import-time crashes
_ai_service = None

def get_ai_service():
    global _ai_service
    if _ai_service is None:
        from .ai import OpenRouterAI
        _ai_service = OpenRouterAI()
    return _ai_service

# Lazy voice import: only needed for /voice. This lets the app boot even when
# the elevenlabs package is unavailable in a stripped verification environment.
_voice_service = None

def get_voice_service():
    global _voice_service
    if _voice_service is None:
        from .voice import ElevenLabsVoice
        _voice_service = ElevenLabsVoice()
    return _voice_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Celcia AI starting...")
    or_key = bool(os.getenv("OPENROUTER_API_KEY"))
    el_key = bool(os.getenv("ELEVENLABS_API_KEY"))
    el_voice = bool(os.getenv("ELEVENLABS_VOICE_ID"))
    print(f"OpenRouter API key: {'configured' if or_key else 'NOT configured'}")
    print(f"ElevenLabs API key: {'configured' if el_key else 'NOT configured'}")
    print(f"ElevenLabs voice ID: {'configured' if el_voice else 'NOT configured'}")
    yield
    print("Celcia AI shutting down...")


app = FastAPI(title="Celcia AI", lifespan=lifespan)


@app.exception_handler(StorageError)
async def storage_error_handler(request: Request, exc: StorageError):
    return JSONResponse(
        status_code=503,
        content={"error": "database_error", "message": "Private storage is unavailable. Check Supabase configuration."},
    )

# CORS: allow same-origin (Vercel) and local dev origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INDEX_PATH = Path(__file__).resolve().parent.parent / "index.html"

# Static root assets — served here for local dev; Vercel serves them natively in production.
static_files = {
    "style.css": "text/css",
    "script.js": "application/javascript",
    "favicon.ico": "image/x-icon",
}

for filename, media_type in static_files.items():
    file_path = Path(__file__).resolve().parent.parent / filename

    @app.get(f"/{filename}")
    async def _serve_static(file_path=file_path, media_type=media_type):
        if file_path.exists():
            return FileResponse(str(file_path), media_type=media_type)
        return JSONResponse(status_code=404, content={"error": f"{file_path.name} not found"})


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    messages: List[Message]


class ChatResponse(BaseModel):
    message: str
    conversation_id: str


class VoiceRequest(BaseModel):
    text: str


class LoginRequest(BaseModel):
    email: str
    password: str


class MemoryRequest(BaseModel):
    content: str
    category: str = "context"
    importance: float = 0.5
    confidence: float = 0.5


class DocumentRequest(BaseModel):
    name: str
    content: str


def current_user(authorization: str | None = Header(default=None)) -> dict:
    """Validate the Supabase session server-side and enforce the owner email."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail={"error": "authentication_error", "message": "Sign in to use Celcia."})
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail={"error": "configuration_error", "message": "Authentication is not configured."})
    token = authorization.split(" ", 1)[1].strip()
    try:
        response = requests.get(
            f"{SUPABASE_URL.rstrip('/')}/auth/v1/user",
            headers={"apikey": SUPABASE_ANON_KEY, "Authorization": "Bearer " + token},
            timeout=10,
        )
    except requests.RequestException as exc:
        logger.error("Supabase session validation failed: %s", exc)
        raise HTTPException(status_code=503, detail={"error": "authentication_error", "message": "Authentication service is unavailable."})
    if not response.ok:
        raise HTTPException(status_code=401, detail={"error": "authentication_error", "message": "Your session is invalid or expired."})
    user = response.json()
    if CELCIA_OWNER_EMAIL and user.get("email", "").lower() != CELCIA_OWNER_EMAIL.lower():
        raise HTTPException(status_code=403, detail={"error": "authorization_error", "message": "This account is not authorized for Celcia."})
    user["_access_token"] = token
    return user


@app.get("/")
async def serve_frontend():
    """Serve the frontend HTML (fallback for local dev and Vercel function root)."""
    if INDEX_PATH.exists():
        return FileResponse(str(INDEX_PATH))
    return JSONResponse(
        status_code=404,
        content={"error": "Frontend not found", "path": str(INDEX_PATH)},
    )


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "Celcia AI", "model": os.getenv("OPENROUTER_MODEL", "openrouter/free")}


@app.post("/api/auth/login")
async def login(request: LoginRequest):
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail={"error": "configuration_error", "message": "Authentication is not configured."})
    try:
        response = requests.post(
            f"{SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password",
            headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"},
            json=request.model_dump(), timeout=10,
        )
    except requests.RequestException as exc:
        logger.error("Supabase login failed: %s", exc)
        raise HTTPException(status_code=503, detail={"error": "authentication_error", "message": "Authentication service is unavailable."})
    if not response.ok:
        raise HTTPException(status_code=401, detail={"error": "authentication_error", "message": "Invalid email or password."})
    data = response.json()
    if CELCIA_OWNER_EMAIL and data.get("user", {}).get("email", "").lower() != CELCIA_OWNER_EMAIL.lower():
        raise HTTPException(status_code=403, detail={"error": "authorization_error", "message": "This account is not authorized for Celcia."})
    return data


@app.get("/api/auth/session")
async def session(user: dict = Depends(current_user)):
    return {"user": {"id": user.get("id"), "email": user.get("email")}}


@app.get("/api/profile")
async def get_profile(user: dict = Depends(current_user)):
    rows = get_store().select("profiles", user["id"], user_token=user["_access_token"], limit=1)
    return rows[0] if rows else {"user_id": user["id"]}


@app.put("/api/profile")
async def update_profile(profile: dict, user: dict = Depends(current_user)):
    allowed = {"name", "bio", "education", "interests", "goals", "preferences"}
    values = {key: value for key, value in profile.items() if key in allowed}
    store = get_store()
    return store.upsert("profiles", {"user_id": user["id"], **values}, user_token=user["_access_token"])


@app.get("/api/memories")
async def list_memories(user: dict = Depends(current_user)):
    return get_store().select("memories", user["id"], user_token=user["_access_token"], query={"order": "updated_at.desc"})


@app.post("/api/memories")
async def create_memory(memory: MemoryRequest, user: dict = Depends(current_user)):
    if not memory.content.strip() or extract_candidate(memory.content) is None:
        raise HTTPException(status_code=400, detail={"error": "memory_error", "message": "Only useful, non-secret personal facts can be saved."})
    return get_store().insert("memories", {"user_id": user["id"], **memory.model_dump()}, user_token=user["_access_token"])


@app.patch("/api/memories/{memory_id}")
async def update_memory(memory_id: str, memory: MemoryRequest, user: dict = Depends(current_user)):
    return get_store().update("memories", memory_id, user["id"], memory.model_dump(), user_token=user["_access_token"])


@app.delete("/api/memories/{memory_id}")
async def delete_memory(memory_id: str, user: dict = Depends(current_user)):
    get_store().delete("memories", memory_id, user["id"], user_token=user["_access_token"])
    return {"status": "deleted"}


@app.delete("/api/memories")
async def clear_memories(user: dict = Depends(current_user)):
    for memory in get_store().select("memories", user["id"], user_token=user["_access_token"], limit=500):
        get_store().delete("memories", memory["id"], user["id"], user_token=user["_access_token"])
    return {"status": "cleared"}


@app.get("/api/conversations")
async def list_conversations(user: dict = Depends(current_user)):
    return get_store().select("conversations", user["id"], user_token=user["_access_token"], query={"order": "updated_at.desc"})


@app.get("/api/conversations/{conversation_id}/messages")
async def list_messages(conversation_id: str, user: dict = Depends(current_user)):
    return get_store().select("messages", user["id"], user_token=user["_access_token"], query={"conversation_id": f"eq.{conversation_id}", "order": "created_at.asc"})


@app.get("/api/documents")
async def list_documents(user: dict = Depends(current_user)):
    return get_store().select("documents", user["id"], user_token=user["_access_token"], query={"order": "created_at.desc"})


@app.post("/api/documents")
async def create_document(document: DocumentRequest, user: dict = Depends(current_user)):
    if not document.name.strip() or not document.content.strip():
        raise HTTPException(status_code=400, detail={"error": "document_error", "message": "A document name and content are required."})
    saved = get_store().insert("documents", {"user_id": user["id"], "name": document.name.strip()}, user_token=user["_access_token"])
    # Chunking is deliberately bounded; embedding can be added without changing document ownership.
    chunks = [document.content[index:index + 2000] for index in range(0, len(document.content), 2000)]
    for chunk in chunks:
        get_store().insert("document_chunks", {"user_id": user["id"], "document_id": saved["id"], "content": chunk}, user_token=user["_access_token"])
    return saved


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, user: dict = Depends(current_user)):
    """Generate AI response using OpenRouter."""
    try:
        user_message = request.messages[-1].content if request.messages else ""
        history = [msg.model_dump() for msg in request.messages[:-1]]
        store = get_store()
        profile_rows = store.select("profiles", user["id"], user_token=user["_access_token"], limit=1)
        memories = store.select("memories", user["id"], user_token=user["_access_token"], limit=100)
        response = get_ai_service().generate_response(
            user_message, history, build_system_prompt(profile_rows[0] if profile_rows else None, memories, user_message)
        )
        conversation_id = request.conversation_id
        if not conversation_id:
            conversation = store.insert("conversations", {"user_id": user["id"], "title": user_message[:60]}, user_token=user["_access_token"])
            conversation_id = conversation["id"]
        else:
            existing = store.select("conversations", user["id"], user_token=user["_access_token"], query={"id": f"eq.{conversation_id}"}, limit=1)
            if not existing:
                conversation = store.insert("conversations", {"user_id": user["id"], "title": user_message[:60]}, user_token=user["_access_token"])
                conversation_id = conversation["id"]
        store.insert("messages", {"user_id": user["id"], "conversation_id": conversation_id, "role": "user", "content": user_message}, user_token=user["_access_token"])
        store.insert("messages", {"user_id": user["id"], "conversation_id": conversation_id, "role": "assistant", "content": response}, user_token=user["_access_token"])
        candidate = extract_candidate(user_message)
        if candidate:
            existing = store.select("memories", user["id"], user_token=user["_access_token"], query={"content": f"eq.{candidate['content']}"}, limit=1)
            if not existing:
                store.insert("memories", {"user_id": user["id"], **candidate}, user_token=user["_access_token"])
        if user_message.lower().startswith(("forget that", "forget this")):
            for memory in store.select("memories", user["id"], user_token=user["_access_token"], limit=100):
                if any(word in memory.get("content", "").lower() for word in user_message.lower().split()[2:]):
                    store.delete("memories", memory["id"], user["id"], user_token=user["_access_token"])
        return ChatResponse(
            message=response,
            conversation_id=conversation_id or "default",
        )
    except HTTPException:
        raise
    except StorageError as e:
        logger.error("Chat persistence failed: %s", e)
        raise HTTPException(status_code=503, detail={"error": "database_error", "message": "Celcia could not access private storage."})
    except Exception as e:
        logger.error("Chat request failed: %s", e)
        raise HTTPException(status_code=502, detail={"error": "model_error", "message": "Celcia could not reach the model."})


@app.post("/api/voice")
async def generate_voice(request: VoiceRequest):
    """Generate audio from text using ElevenLabs. Returns audio/mpeg bytes."""
    try:
        audio_bytes = get_voice_service().generate_audio(request.text)
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=audio.mp3"},
        )
    except ModuleNotFoundError as e:
        return JSONResponse(
            status_code=503,
            content={"error": "service_unavailable", "message": f"Voice service unavailable: {str(e)}"},
        )
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"error": "voice_error", "message": str(e)},
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": "internal_error", "message": str(e)},
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
