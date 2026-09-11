import os
from openai import OpenAI
from .config import OPENROUTER_MODEL
from .context import PERSONA

class OpenRouterAI:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://openrouter.ai/api/v1",
            default_headers={"HTTP-Referer": os.getenv("APP_URL", "https://celcia-ai.vercel.app"), "X-Title": "Celcia AI"},
        )
        self.model_name = OPENROUTER_MODEL
        
    def generate_response(self, user_message, conversation_history=None, system_prompt=None):
        """
        Generate AI response using OpenRouter API
        """
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured")
            
        if conversation_history is None:
            conversation_history = []
        
        # Build messages array
        messages = [
            {"role": "system", "content": system_prompt or PERSONA}
        ]
        
        # Add conversation history
        for msg in conversation_history:
            messages.append(msg)
        
        # Add current user message
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
        """Change the AI model"""
        self.model_name = model_name