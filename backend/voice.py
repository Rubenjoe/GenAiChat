import os
import uuid
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

load_dotenv()

class ElevenLabsVoice:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
        self.client = ElevenLabs(api_key=self.api_key)
        # Get the parent directory of the backend folder
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(backend_dir)
        self.audio_dir = os.path.join(parent_dir, "audio_outputs")
        
        # Create audio directory if it doesn't exist
        if not os.path.exists(self.audio_dir):
            os.makedirs(self.audio_dir)
    
    def generate_audio(self, text):
        """
        Generate audio from text using ElevenLabs
        Returns the audio file path
        """
        try:
            # Generate unique filename
            filename = f"{uuid.uuid4()}.mp3"
            output_path = os.path.join(self.audio_dir, filename)
            
            # Generate audio using the correct ElevenLabs API method
            audio = self.client.text_to_speech.convert(
                voice_id=self.voice_id,
                text=text,
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128"
            )
            
            # Save audio file
            with open(output_path, 'wb') as f:
                for chunk in audio:
                    if chunk:
                        f.write(chunk)
            
            return output_path
            
        except Exception as e:
            print(f"Error in ElevenLabs audio generation: {str(e)}")
            raise Exception(f"Voice generation failed: {str(e)}")
    
    def set_voice(self, voice_id):
        """Change the voice ID"""
        self.voice_id = voice_id