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
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

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
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Generate AI response using OpenRouter."""
    try:
        user_message = request.messages[-1].content if request.messages else ""
        history = [msg.model_dump() for msg in request.messages[:-1]]
        response = get_ai_service().generate_response(user_message, history)
        return ChatResponse(
            message=response,
            conversation_id=request.conversation_id or "default",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
