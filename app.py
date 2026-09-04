import os
import re
import requests
import json
import gradio as gr
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# OpenRouter/OpenAI imports
from openai import OpenAI
from langchain_core.prompts import PromptTemplate

# legacy chains + memory now live in langchain_classic
from langchain_classic.chains import LLMChain
from langchain_classic.memory import ConversationBufferMemory

# ElevenLabs imports
from elevenlabs.client import ElevenLabs
from elevenlabs import save

# OpenRouter API Key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ElevenLabs API Key
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# ElevenLabs Voice ID (Rachel voice by default)
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")

# Configure OpenRouter
openai_client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

# Initialize ElevenLabs client
elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

print("API keys configured successfully!")

template = """You are a helpful assistant to answer user queries.
{chat_history}
User: {user_message}
Chatbot:"""

prompt = PromptTemplate(
    input_variables=["chat_history", "user_message"],
    template=template
)

memory = ConversationBufferMemory(memory_key="chat_history")

print("Prompt template created!")

# Create a custom LLM wrapper for OpenRouter API
class OpenRouterLLM:
    def __init__(self, client, model_name="anthropic/claude-3.5-sonnet"):
        self.client = client
        self.model_name = model_name
        self.memory_history = []

    def predict(self, user_message):
        # Build conversation context
        messages = [
            {"role": "system", "content": "You are a helpful assistant to answer user queries."}
        ]
        
        # Add conversation history
        for i in range(0, len(self.memory_history), 2):
            if i + 1 < len(self.memory_history):
                messages.append({"role": "user", "content": self.memory_history[i]})
                messages.append({"role": "assistant", "content": self.memory_history[i + 1]})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})

        # Generate response using OpenRouter
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            answer = response.choices[0].message.content

            # Update memory
            self.memory_history.append(user_message)
            self.memory_history.append(answer)

            # Keep only last 10 exchanges to avoid token limits
            if len(self.memory_history) > 20:
                self.memory_history = self.memory_history[-20:]

            return answer
        except Exception as e:
            error_msg = f"Error in OpenRouter response: {str(e)}"
            print(error_msg)
            return f"Sorry, I encountered an error: {str(e)}"

# Initialize the custom LLM with OpenRouter
# You can change the model to any OpenRouter supported model
llm_chain = OpenRouterLLM(openai_client, model_name="openai/gpt-3.5-turbo")

print("OpenRouter LLM initialized successfully!")

def generate_audio_elevenlabs(text):
    """
    Generate audio using ElevenLabs API
    Returns audio file path or error message
    """
    try:
        # Generate audio
        audio = elevenlabs_client.generate(
            text=text,
            voice=ELEVENLABS_VOICE_ID,
            model="eleven_monolingual_v1"  # or "eleven_multilingual_v2"
        )

        # Save audio to file
        output_path = f"output_audio_{hash(text) % 10000}.mp3"
        save(audio, output_path)

        return {
            "type": "SUCCESS",
            "response": output_path,
            "message": "Audio generated successfully"
        }
    except Exception as e:
        return {
            "type": "ERROR",
            "response": str(e),
            "message": f"Audio generation failed: {str(e)}"
        }

def generate_audio_elevenlabs_http(text):
    """
    Alternative method using direct HTTP API calls
    More reliable for some use cases
    """
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"

    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }

    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5,
            "style": 0.5,
            "use_speaker_boost": True
        }
    }

    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()

        # Save audio file
        output_path = f"output_audio_{hash(text) % 10000}.mp3"
        with open(output_path, 'wb') as f:
            f.write(response.content)

        return {
            "type": "SUCCESS",
            "response": output_path,
            "message": "Audio generated successfully"
        }
    except requests.exceptions.RequestException as e:
        return {
            "type": "ERROR",
            "response": str(e),
            "message": f"Audio generation failed: {str(e)}"
        }

print("ElevenLabs audio functions defined!")

def get_audio_reply_for_question(text):
    """
    Generate audio for the chatbot response
    """
    generated_audio_event = generate_audio_elevenlabs(text)

    final_response = {
        "audio_path": '',
        "message": ''
    }

    if generated_audio_event["type"] == "SUCCESS":
        audio_path = generated_audio_event["response"]
        final_response['audio_path'] = audio_path
        final_response['message'] = "Audio generated successfully"
    else:
        final_response['message'] = generated_audio_event['message']

    return final_response

print("Audio reply function defined!")

def get_text_response(user_message):
    """
    Get text response from OpenRouter
    """
    try:
        response = llm_chain.predict(user_message=user_message)
        return response
    except Exception as e:
        error_msg = f"Error in OpenRouter response: {str(e)}"
        print(error_msg)
        return f"Sorry, I encountered an error: {str(e)}"

print("Text response function defined!")

def get_text_response_and_audio_response(user_message):
    """
    Get both text response from OpenRouter and audio from ElevenLabs
    """
    # Get text response from OpenRouter
    text_response = get_text_response(user_message)

    # Generate audio for the response
    audio_reply = get_audio_reply_for_question(text_response)

    final_response = {
        'text': text_response,
        'audio_path': audio_reply.get('audio_path', ''),
        'message': audio_reply.get('message', '')
    }

    return final_response

print("Combined response function defined!")

def chat_bot_response(message, history):
    """
    Main chatbot function for Gradio interface
    Returns tuple of (text_response, audio_file_path)
    """
    try:
        # Get text and audio response
        response = get_text_response_and_audio_response(message)

        text_response = response['text']
        audio_path = response['audio_path']

        if audio_path and os.path.exists(audio_path):
            # Return both text and audio
            return text_response
        else:
            # Return only text if audio fails
            return text_response

    except Exception as e:
        error_msg = f"Error: {str(e)}"
        print(error_msg)
        return error_msg

print("Chatbot response handler defined!")

demo = gr.ChatInterface(
    fn=chat_bot_response,
    title="🤖 OpenRouter + ElevenLabs Chatbot",
    description="Chat with OpenRouter AI models with voice responses from ElevenLabs",
    examples=[
        "How are you doing?",
        "What are your interests?",
        "Tell me a short story",
        "What's the weather like today?",
        "Explain quantum computing in simple terms"
    ],
    #theme=gr.themes.Soft()
)

print("Gradio interface created!")

if __name__ == "__main__":
    # Launch with public link
    demo.launch(
        share=True,  # Creates public link
        debug=True   # Shows errors and logs
    )

