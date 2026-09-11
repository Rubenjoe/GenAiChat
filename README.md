# 🤖 Celcia AI

A premium AI chatbot with a professional dark interface, powered by **OpenRouter** and **ElevenLabs Text-to-Speech**.

Celcia AI combines generative AI with voice synthesis in a polished, ChatGPT-like interface featuring a minimalist dark aesthetic, subtle star-field background, and private, authenticated personal context.

## ✨ Features

- 💬 **Conversational AI** powered by OpenRouter (GPT-3.5 Turbo and other models)
- 🎨 **Premium dark UI** with pitch-black background and subtle star-field animation
- 🔊 **Text-to-speech** using ElevenLabs with "Listen" functionality
- 💾 **Authenticated conversation history** in Supabase
- 🧠 **Conservative long-term memory** with relevance-filtered context
- 🔐 **Supabase Auth and Row Level Security** for private data
- 📋 **Copy functionality** for AI responses
- 🔄 **Regenerate responses** for alternative answers
- ➕ **New chat** management with conversation switching
- � **Responsive design** for desktop, tablet, and mobile
- ⚡ **FastAPI backend** with modern async architecture
- 🎯 **Markdown support** for rich text responses
- 🛡️ **Secure API key management** with environment variables

## 🏗️ Architecture

```text
                   ┌──────────────────┐
                   │      User        │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  HTML/CSS/JS UI  │
                   │   (Celcia Design)│
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │   FastAPI        │
                   │   Backend        │
                   └────────┬─────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌───────────────┐      ┌───────────────┐
        │  OpenRouter   │      │  ElevenLabs   │
        │   (AI API)    │      │  (Voice API)  │
        └───────────────┘      └───────────────┘
```

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Core application logic |
| FastAPI | High-performance web framework |
| OpenRouter | Generative AI responses |
| ElevenLabs | Text-to-speech generation |
| HTML/CSS/JavaScript | Modern frontend interface |
| OpenAI SDK | OpenRouter API compatibility |
| python-dotenv | Environment variable management |

## 📁 Project Structure

```text
GenAiChat/
│
├── index.html              # Main HTML structure
├── style.css               # Celcia design styling
├── script.js               # Frontend logic
│
├── backend/
│   ├── main.py           # FastAPI application
│   ├── ai.py             # OpenRouter integration
│   └── voice.py          # ElevenLabs integration
│
├── audio_outputs/        # Generated audio files
├── .env                  # API keys (not in git)
├── .env.example          # Environment template
├── requirements.txt      # Python dependencies
├── README.md             # This file
└── .gitignore           # Git ignore rules
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

Create a `.env` file in the project root based on `.env.example`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

**⚠️ Important:** Never commit `.env` file or API keys to GitHub.

### 5. Run the application

```bash
python backend/main.py
```

The application will start on `http://localhost:8000`

### 6. Access the application

Open your browser and navigate to:
```
http://localhost:8000
```

## 🎨 Design Features

### Visual Design
- **Pitch-black background** (#020202) with subtle star-field animation
- **Minimal futuristic aesthetic** inspired by ChatGPT and Grok
- **Professional typography** using Bricolage Grotesque, Space Grotesk, and Inter fonts
- **Low-contrast UI elements** for reduced eye strain
- **Clean, spacious layout** with centered conversation content

### UI Components
- **Left sidebar** (260px) with conversation history
- **Rounded modern composer** (860px width, 76px height)
- **Minimal top navigation** with status indicators
- **Message actions** (Listen, Copy, Regenerate)
- **Responsive design** for all screen sizes

### Typography
- **Brand:** Bricolage Grotesque Bold (26px)
- **Headings:** Bricolage Grotesque (600 weight)
- **UI Labels:** Space Grotesk (400-500 weight)
- **Body Text:** Inter (400 weight, 17px)

## 💬 Usage

### Starting a Conversation
1. Type your message in the composer at the bottom
2. Press Enter to send (Shift+Enter for new line)
3. Watch the AI response appear with a typing indicator
4. Use message actions for additional functionality

### Message Actions
- **◉ Listen:** Generate and play audio using ElevenLabs
- **Copy:** Copy the AI response to clipboard
- **↻ Regenerate:** Get an alternative response for the same message

### Conversation Management
- **+ New chat:** Start a fresh conversation
- **Sidebar:** Switch between recent conversations
- **Auto-titling:** First message becomes conversation title
- **Persistence:** Conversations saved to authenticated Supabase storage

## 🔧 Configuration

### Changing AI Model
Set `OPENROUTER_MODEL` in `.env`:

```python
OPENROUTER_MODEL=openrouter/free
```

### Changing Voice
Edit your `.env` file to use a different ElevenLabs voice:

```env
ELEVENLABS_VOICE_ID=your_voice_id_here
```

Find voice IDs in the [ElevenLabs documentation](https://elevenlabs.io/docs/voices).

## 🧠 Private memory and persistence

Run `supabase/schema.sql` in the Supabase SQL editor, enable email/password Auth,
and set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and
`CELCIA_OWNER_EMAIL`. The browser stores only the short-lived Supabase access
token; conversations, memories, documents, and profile data remain server-side.
The service role key is never sent to the browser. Memory extraction ignores
credential-shaped content and only stores messages that contain clear personal
memory cues.

The login email is the Supabase Auth account configured as `CELCIA_OWNER_EMAIL`.
The password is the password chosen for that account in Supabase Auth; this
repository does not contain or generate credentials. If no account exists,
create one in Supabase Dashboard → Authentication → Users, then set the same
email in `CELCIA_OWNER_EMAIL`.

## 🔊 Voice Generation

- Click "◉ Listen" on any AI response
- Audio is generated using ElevenLabs API
- MP3 files are temporarily stored in `audio_outputs/`
- Audio plays automatically in the browser

## 🌐 API Endpoints

### POST /api/chat (authenticated)
Generate AI response

**Request:**
```json
{
    "conversation_id": "optional_id",
    "messages": [
        {"role": "user", "content": "Your message"}
    ]
}
```

**Response:**
```json
{
    "message": "AI response",
    "conversation_id": "conversation_id"
}
```

### POST /api/voice
Generate audio from text

**Request:**
```json
{
    "text": "Text to convert to speech"
}
```

**Response:** Audio file (MP3)

### GET /api/health
Health check endpoint

**Response:**
```json
{
    "status": "healthy",
    "service": "Celcia AI"
}
```

Additional authenticated endpoints:

- `POST /api/auth/login`, `GET /api/auth/session`
- `GET/PUT /api/profile`
- `GET/POST/PATCH/DELETE /api/memories`, `DELETE /api/memories`
- `GET /api/conversations`, `GET /api/conversations/{id}/messages`
- `GET/POST /api/documents`

## 📱 Responsive Design

- **Desktop:** Full sidebar, centered conversation (720px max width)
- **Tablet:** Narrower sidebar, responsive composer
- **Mobile:** Collapsible sidebar, full-width conversation

## � Security

- API keys stored in environment variables
- No secrets exposed to frontend
- CORS configured for local development
- Input sanitization for Markdown rendering
- Audio files generated in secure directory

## ⚠️ Current Limitations

- Semantic vector embeddings and web search tools are staged for the next iteration;
  current retrieval uses bounded lexical relevance scoring.
- Document ingestion stores bounded chunks but does not yet run an embedding model.
- Supabase must be configured before private endpoints can be used.

## � Future Improvements

- 🗄️ Database integration for conversation persistence
- � User authentication and separate user spaces
- 🎤 Speech-to-text input for voice commands
- 🌍 Multi-language support for voice
- 📊 Usage analytics and token tracking
- 🧪 Automated testing suite
- 🚀 Production deployment optimization
- � Push notifications for long responses
- 📎 File upload and document analysis
- 🎨 Theme customization options

## 🐛 Troubleshooting

### Application won't start
- Ensure virtual environment is activated
- Check that all dependencies are installed
- Verify `.env` file exists with valid API keys

### API errors
- Verify OpenRouter API key is valid and has credits
- Check ElevenLabs API key and voice ID
- Ensure internet connection is stable

### Audio not playing
- Check browser audio permissions
- Verify ElevenLabs API key is valid
- Check browser console for errors

### Styling issues
- Clear browser cache
- Ensure all frontend files are present
- Check browser compatibility

## 📜 License

No license is currently specified for this repository. Add a license that matches how you want others to use and distribute the project.

## 👨‍💻 Author

**Rubenjoe**

GitHub: https://github.com/Rubenjoe

---

> Celcia AI — A premium personal AI assistant with professional design and voice capabilities.