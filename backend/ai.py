import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class OpenRouterAI:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://openrouter.ai/api/v1"
        )
        self.model_name = "openai/gpt-3.5-turbo"
        self.conversation_history = []
        
    def generate_response(self, user_message, conversation_history=None):
        """
        Generate AI response using OpenRouter API
        """
        if conversation_history is None:
            conversation_history = []
        
        # Build messages array
        messages = [
            {"role": "system", "content": "You are a helpful assistant to answer user queries."}
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
            
            answer = response.choices[0].message.content
            return answer
            
        except Exception as e:
            print(f"Error in OpenRouter response: {str(e)}")
            raise Exception(f"AI response failed: {str(e)}")
    
    def set_model(self, model_name):
        """Change the AI model"""
        self.model_name = model_name