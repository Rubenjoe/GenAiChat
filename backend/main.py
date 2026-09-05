from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from pathlib import Path
from ai import OpenRouterAI
from voice import ElevenLabsVoice

app = FastAPI(title="Celcia AI")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI and Voice services
ai_service = OpenRouterAI()
voice_service = ElevenLabsVoice()

# Get the correct paths for static files
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
frontend_dir = project_root / "frontend"

# Mount static files for frontend
app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")

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
    """Serve the main HTML file"""
    return FileResponse(str(frontend_dir / "index.html"))

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
    """
    try:
        audio_path = voice_service.generate_audio(request.text)
        
        # Return the audio file
        if os.path.exists(audio_path):
            return FileResponse(audio_path, media_type="audio/mpeg")
        else:
            raise HTTPException(status_code=404, detail="Audio file not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Celcia AI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)