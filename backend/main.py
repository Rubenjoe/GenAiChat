from fastapi import FastAPI, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import sys
from pathlib import Path

# Add current directory to path for imports to work in both local and Vercel contexts
current_dir = Path(__file__).parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from ai import OpenRouterAI
from voice import ElevenLabsVoice

# Initialize AI and Voice services
ai_service = OpenRouterAI()
voice_service = ElevenLabsVoice()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events"""
    # Startup
    print("=" * 50)
    print("Celcia AI - Startup Configuration Check")
    print("=" * 50)
    
    # Check OpenRouter configuration
    if os.getenv("OPENROUTER_API_KEY"):
        print("OpenRouter API key: configured")
    else:
        print("OpenRouter API key: NOT configured")
    
    # Check ElevenLabs configuration
    print("\nElevenLabs configuration:")
    elevenlabs_validation = voice_service.validate_configuration()
    
    if elevenlabs_validation["api_key_configured"]:
        print("API key: configured")
    else:
        print("API key: NOT configured")
    
    if elevenlabs_validation["voice_id_configured"]:
        print("Voice ID: configured")
    else:
        print("Voice ID: NOT configured")
        print("  Set ELEVENLABS_VOICE_ID in your .env file")
        print("  Use GET /api/voice/voices to see available voices for your account")
    
    if elevenlabs_validation["voice_valid"]:
        if elevenlabs_validation["voice_name"]:
            print(f"Voice status: valid ({elevenlabs_validation['voice_name']})")
        else:
            print("Voice status: valid")
    else:
        if elevenlabs_validation["error"]:
            error_msg = elevenlabs_validation["error"]
            if "permission" in error_msg.lower():
                print(f"Voice status: validation skipped - {error_msg}")
                print("  TTS functionality may still work with the configured voice ID")
            else:
                print(f"Voice status: invalid - {error_msg}")
        else:
            print("Voice status: invalid")
    
    print("=" * 50)
    
    yield
    
    # Shutdown (if needed)
    print("Celcia AI - Shutting down...")

app = FastAPI(title="Celcia AI", lifespan=lifespan)

# Configure CORS - more restrictive for production
# In production (Vercel), frontend and backend share the same origin
# In local development, we need to allow localhost
is_production = os.getenv("VERCEL") == "1" or os.getenv("ENVIRONMENT") == "production"

if is_production:
    # Production: only allow same origin
    cors_origins = ["https://your-production-domain.com"]  # Replace with actual domain
else:
    # Local development: allow localhost
    cors_origins = [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins else ["*"],  # Fallback to * if empty
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the correct paths for static files
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
index_path = project_root / "index.html"

# Data models
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
    """Serve the main HTML file (fallback for local development)"""
    try:
        return FileResponse(str(index_path))
    except FileNotFoundError:
        # For Vercel deployment, the frontend is served via vercel.json routing
        return JSONResponse(
            status_code=404,
            content={"error": "Frontend not found", "message": "HTML file not accessible"}
        )

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Generate AI response using OpenRouter
    """
    try:
        # Extract the last user message
        user_message = request.messages[-1].content if request.messages else ""
        
        # Convert messages to the format expected by AI service
        conversation_history = [
            {"role": msg.role, "content": msg.content} 
            for msg in request.messages[:-1]
        ]
        
        # Generate response
        response = ai_service.generate_response(user_message, conversation_history)
        
        return ChatResponse(
            message=response,
            conversation_id=request.conversation_id or "default"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice")
async def generate_voice(request: VoiceRequest):
    """
    Generate audio from text using ElevenLabs
    Returns audio bytes or structured error JSON
    
    IMPORTANT: This endpoint never exposes the ElevenLabs API key to the frontend.
    All API calls are made server-side for security.
    Voice IDs must be from the user's own ElevenLabs account - Voice Library voices
    may not work through the API on free plans.
    """
    try:
        audio_bytes = voice_service.generate_audio(request.text)
        
        # Return audio bytes directly for serverless compatibility
        from fastapi.responses import Response
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=audio.mp3"
            }
        )
            
    except ValueError as e:
        # Handle configuration and validation errors
        error_message = str(e)
        
        if "not configured" in error_message.lower():
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "configuration_error",
                    "message": error_message
                }
            )
        elif "not found" in error_message.lower():
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={
                    "error": "voice_not_found",
                    "message": "The configured ElevenLabs voice is not available. Check ELEVENLABS_VOICE_ID in .env."
                }
            )
        elif "invalid api key" in error_message.lower():
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "error": "invalid_api_key",
                    "message": "Invalid ElevenLabs API key. Check ELEVENLABS_API_KEY in .env."
                }
            )
        elif "payment" in error_message.lower() or "quota" in error_message.lower():
            return JSONResponse(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                content={
                    "error": "payment_required",
                    "message": "The selected voice may be restricted to paid users or requires payment. Try a different voice or check your ElevenLabs account credits."
                }
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "voice_error",
                    "message": error_message
                }
            )
            
    except Exception as e:
        # Handle unexpected errors
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "internal_error",
                "message": "An unexpected error occurred during voice generation"
            }
        )

@app.get("/api/voice/voices")
async def get_available_voices():
    """
    Get list of available voices for the current ElevenLabs account
    Returns safe information without exposing secrets
    
    This endpoint helps users find voice IDs that work with their specific
    ElevenLabs account and subscription tier. Voice Library voices may not
    be accessible through the API on free plans.
    """
    try:
        voices_info = voice_service.get_available_voices()
        
        if voices_info["success"]:
            return {
                "success": True,
                "voices": voices_info["voices"],
                "total": len(voices_info["voices"])
            }
        else:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "success": False,
                    "error": "Failed to retrieve voices",
                    "message": voices_info["error"]
                }
            )
            
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "internal_error",
                "message": "Failed to retrieve available voices"
            }
        )

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Celcia AI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)