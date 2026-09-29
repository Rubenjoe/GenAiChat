import os
import uuid
from elevenlabs.client import ElevenLabs
from openai import OpenAI
from .config import (
    ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID,
    NIM_API_KEY, NIM_TTS_MODEL, NIM_TTS_VOICE, NIM_BASE_URL,
    VOICE_PROVIDER
)


class ElevenLabsVoice:
    """
    ElevenLabs Text-to-Speech integration for Celcia AI.

    IMPORTANT: Voice IDs must come from the user's own ElevenLabs account.
    - Voice Library voices may not work through the API on free plans
    - Each account has access to different voices based on subscription tier
    - The API key must remain server-side for security
    - Never hard-code voice IDs from tutorials or examples
    """

    def __init__(self):
        self.api_key = ELEVENLABS_API_KEY
        self.voice_id = ELEVENLABS_VOICE_ID
        self.client = ElevenLabs(api_key=self.api_key)

        # Note: For serverless compatibility, we no longer use local filesystem
        # Audio is returned as bytes directly from the API

    def validate_configuration(self):
        """
        Validate ElevenLabs configuration at startup
        Returns a dict with validation status and messages
        """
        result = {
            "api_key_configured": bool(self.api_key),
            "voice_id_configured": bool(self.voice_id),
            "voice_valid": False,
            "voice_name": None,
            "voice_category": None,
            "error": None
        }

        if not self.api_key:
            result["error"] = "ELEVENLABS_API_KEY is not configured"
            return result

        if not self.voice_id:
            result["error"] = "ELEVENLABS_VOICE_ID is not configured"
            return result

        # Validate voice exists and is accessible
        try:
            voices = self.client.voices.get_all()
            voice_found = False

            for voice in voices.voices:
                if voice.voice_id == self.voice_id:
                    voice_found = True
                    result["voice_valid"] = True
                    result["voice_name"] = voice.name
                    result["voice_category"] = voice.category if hasattr(voice, 'category') else "standard"
                    break

            if not voice_found:
                result["error"] = f"Voice ID '{self.voice_id}' not found in your ElevenLabs account"

        except Exception as e:
            error_message = str(e).lower()
            # Handle permission errors gracefully - the key might still work for TTS
            if "permission" in error_message or "unauthorized" in error_message:
                result["error"] = "API key lacks voices_read permission. Voice validation skipped, but TTS may still work."
            else:
                result["error"] = f"Failed to validate voice: {str(e)}"

        return result

    def get_available_voices(self):
        """
        Get list of available voices for the current account
        Returns safe information without exposing secrets
        """
        try:
            voices_response = self.client.voices.get_all()
            voices = []

            for voice in voices_response.voices:
                voice_info = {
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "category": voice.category if hasattr(voice, 'category') else "standard"
                }

                # Add language information if available
                if hasattr(voice, 'labels') and voice.labels:
                    if 'accent' in voice.labels:
                        voice_info["accent"] = voice.labels['accent']
                    if 'language' in voice.labels:
                        voice_info["language"] = voice.labels['language']

                voices.append(voice_info)

            return {"success": True, "voices": voices}

        except Exception as e:
            return {"success": False, "error": str(e)}

    def generate_audio(self, text):
        """
        Generate audio from text using ElevenLabs
        Returns audio bytes for serverless compatibility
        Raises specific exceptions for different error types
        """
        if not self.api_key:
            raise ValueError("ELEVENLABS_API_KEY is not configured")

        if not self.voice_id:
            raise ValueError("ELEVENLABS_VOICE_ID is not configured")

        try:
            # Generate audio using the correct ElevenLabs API method
            # Using eleven_multilingual_v2 which is widely supported
            audio = self.client.text_to_speech.convert(
                voice_id=self.voice_id,
                text=text,
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128"
            )

            # Return audio bytes for serverless compatibility
            # instead of saving to filesystem
            audio_bytes = b""
            for chunk in audio:
                if chunk:
                    audio_bytes += chunk

            return audio_bytes

        except Exception as e:
            # Handle specific ElevenLabs API errors by parsing error messages
            error_message = str(e).lower()

            if "404" in error_message or "not found" in error_message:
                raise ValueError(f"Voice ID '{self.voice_id}' not found. Check ELEVENLABS_VOICE_ID in .env")
            elif "401" in error_message or "unauthorized" in error_message or "invalid api key" in error_message:
                raise ValueError("Invalid ElevenLabs API key. Check ELEVENLABS_API_KEY in .env")
            elif "402" in error_message or "payment required" in error_message or "quota" in error_message:
                raise ValueError("Selected voice requires payment or insufficient credits. Try a different voice or check your ElevenLabs account")
            elif "rate limit" in error_message:
                raise ValueError("ElevenLabs rate limit exceeded. Please try again later")
            elif "timeout" in error_message or "connection" in error_message:
                raise ValueError("Network error connecting to ElevenLabs. Please check your internet connection")
            else:
                raise ValueError(f"ElevenLabs API error: {str(e)}")

    def set_voice(self, voice_id):
        """Change the voice ID"""
        self.voice_id = voice_id


class NIMVoice:
    """
    NVIDIA NIM Text-to-Speech integration for Celcia AI.
    Uses NVIDIA's TTS NIM microservices.
    """

    def __init__(self):
        self.api_key = NIM_API_KEY
        self.model = NIM_TTS_MODEL
        self.voice = NIM_TTS_VOICE
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=NIM_BASE_URL,
        )

    def validate_configuration(self):
        """
        Validate NIM TTS configuration
        """
        result = {
            "api_key_configured": bool(self.api_key),
            "model_configured": bool(self.model),
            "voice_configured": bool(self.voice),
            "error": None
        }

        if not self.api_key:
            result["error"] = "NIM_API_KEY is not configured"
        elif not self.model:
            result["error"] = "NIM_TTS_MODEL is not configured"
        elif not self.voice:
            result["error"] = "NIM_TTS_VOICE is not configured"

        return result

    def generate_audio(self, text):
        """
        Generate audio from text using NVIDIA NIM TTS
        Returns audio bytes
        """
        if not self.api_key:
            raise ValueError("NIM_API_KEY is not configured")

        if not self.model:
            raise ValueError("NIM_TTS_MODEL is not configured")

        if not self.voice:
            raise ValueError("NIM_TTS_VOICE is not configured")

        try:
            # NIM TTS uses OpenAI-compatible audio.speech.create
            # Note: NIM TTS models may have different parameter names
            response = self.client.audio.speech.create(
                model=self.model,
                voice=self.voice,
                input=text,
                response_format="mp3"
            )

            # Read the audio bytes from the response
            audio_bytes = response.read() if hasattr(response, 'read') else response.content
            return audio_bytes

        except Exception as e:
            error_message = str(e).lower()

            if "401" in error_message or "unauthorized" in error_message or "invalid api key" in error_message:
                raise ValueError("Invalid NVIDIA NIM API key. Check NIM_API_KEY in .env")
            elif "404" in error_message or "not found" in error_message:
                raise ValueError(f"TTS model '{self.model}' or voice '{self.voice}' not found")
            elif "rate limit" in error_message:
                raise ValueError("NVIDIA NIM rate limit exceeded. Please try again later")
            elif "timeout" in error_message or "connection" in error_message:
                raise ValueError("Network error connecting to NVIDIA NIM. Please check your internet connection")
            else:
                raise ValueError(f"NVIDIA NIM TTS error: {str(e)}")

    def set_voice(self, voice):
        """Change the voice"""
        self.voice = voice

    def set_model(self, model):
        """Change the model"""
        self.model = model


def get_voice_provider():
    """Factory function to get the configured voice provider."""
    if VOICE_PROVIDER == "nim":
        return NIMVoice()
    return ElevenLabsVoice()