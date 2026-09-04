# 🤖 GenAiChat

A conversational AI chatbot built with **Google Gemini**, **ElevenLabs Text-to-Speech**, and **Gradio**.

GenAiChat combines a generative AI model with voice synthesis to create a simple conversational assistant that can understand user prompts, maintain short-term conversation context, and generate spoken responses.

## ✨ Features

- 💬 Conversational AI powered by **Google Gemini**
- 🧠 Short-term conversation memory
- 🔊 Text-to-speech generation using **ElevenLabs**
- 🌐 Interactive web interface using **Gradio**
- ⚡ Lightweight Python implementation
- 🚀 Designed for local use and Hugging Face Spaces deployment
- 🧩 Separate text-generation and voice-generation components

## 🏗️ Architecture

```text
                   ┌──────────────────┐
                   │      User        │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │   Gradio Chat    │
                   │       UI         │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │   Google Gemini  │
                   │  Generative AI   │
                   └────────┬─────────┘
                            │
                     Generated Text
                            │
                            ▼
                   ┌──────────────────┐
                   │    ElevenLabs    │
                   │  Text-to-Speech  │
                   └────────┬─────────┘
                            │
                       Audio Output
                            │
                            ▼
                   ┌──────────────────┐
                   │      User        │
                   └──────────────────┘
```

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Core application logic |
| Google Gemini | Generative AI responses |
| ElevenLabs | Text-to-speech generation |
| Gradio | Web-based chatbot interface |
| LangChain | Prompt and memory components used in the original implementation |
| Requests | Direct HTTP API communication |

## 📁 Project Structure

```text
GenAiChat/
│
├── app.py
├── requirements.txt
├── README.md
└── .gitattributes
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rubenjoe/GenAiChat.git
cd GenAiChat
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Activate it on macOS/Linux:

```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure API credentials

The application requires credentials for Google Gemini and ElevenLabs.

For local development, use environment variables rather than hard-coding credentials in source code:

```env
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id
```

**Never commit API keys or secrets to GitHub.**

### 5. Run the application

```bash
python app.py
```

Gradio will start the application and provide a local web interface.

## 💬 Example Prompts

Try prompts such as:

```text
How are you doing?

Tell me a short story.

Explain quantum computing in simple terms.

What are some interesting facts about space?

Explain machine learning to me like I'm a beginner.
```

## 🧠 Conversation Memory

The chatbot maintains a lightweight in-memory conversation history. Previous user and assistant messages are incorporated into subsequent prompts so the model can maintain context across multiple turns.

The original implementation limits stored conversation history to recent messages to reduce prompt size and avoid excessive token usage.

## 🔊 Voice Generation

After Gemini generates a text response, the application sends that text to ElevenLabs and generates an MP3 audio response.

The project contains two ElevenLabs approaches:

- ElevenLabs Python SDK integration
- Direct ElevenLabs HTTP API integration

The HTTP implementation is kept as an alternative approach when direct API requests are preferred.

## 🌐 Hugging Face Spaces

The repository is configured for **Gradio-based Hugging Face Spaces** deployment.

When deploying publicly, configure your credentials through **Hugging Face Secrets** rather than placing API keys in `app.py`.

Recommended secrets:

```text
GEMINI_API_KEY
ELEVENLABS_API_KEY
ELEVENLABS_VOICE_ID
```

## ⚠️ Current Limitations

This project was created as an experimental AI chatbot and still has areas that can be improved:

- Conversation memory is stored only in application memory and is not persistent.
- There is no user authentication.
- There is no database for storing conversations.
- API usage and rate limits are not tracked.
- Error handling for external services can be made more granular.
- The current voice-generation pipeline creates an audio file but the main Gradio callback currently returns the text response rather than exposing the generated audio as a dedicated UI output.
- Some LangChain imports/components remain from the original implementation even though the current Gemini response path uses a custom wrapper around the Google SDK.

## 🔮 Future Improvements

Potential next steps include:

- 🎙️ Return generated ElevenLabs audio directly in the Gradio interface
- 🎤 Add speech-to-text input
- 🧠 Add persistent conversation history
- 👤 Add user authentication and separate chat sessions
- 💾 Store conversations in a database
- ⚙️ Make Gemini and ElevenLabs models configurable
- 🌍 Add multilingual voice support
- 📱 Improve the UI and responsiveness
- 🛡️ Move all configuration to secure environment variables/secrets
- 📊 Add API/token usage monitoring
- 🧪 Add automated tests
- 🚀 Improve production deployment and observability

## 🔐 Security

API credentials should never be hard-coded into application source code.

Use environment variables for local development and platform-managed secrets for cloud deployments.

If credentials have previously been committed to a public repository, revoke/rotate them and replace them with new credentials.

## 📜 License

No license is currently specified for this repository. Add a license that matches how you want others to use and distribute the project.

## 👨‍💻 Author

**Rubenjoe**

GitHub: https://github.com/Rubenjoe

---

> A lightweight experiment combining generative AI and voice synthesis into a conversational interface.
