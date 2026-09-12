# Celcia AI 🤖

> A personal AI assistant built from scratch with a dark, ChatGPT/Grok-inspired interface, persistent conversations, long-term memory, authentication, and voice output.

**Stack:** Python · FastAPI · HTML/CSS/JavaScript · OpenRouter · Supabase · ElevenLabs

## Why this project

Celcia AI started as a chatbot experiment and evolved into a small full-stack AI application. The goal was not just to call an LLM API, but to build the surrounding product: authentication, conversation persistence, memory, voice output, API boundaries, and a usable interface.

## What it does

- **AI conversations** through OpenRouter with configurable models
- **Persistent chats** stored in Supabase
- **Authentication + Row Level Security** for private data
- **Long-term memory** with bounded relevance-based retrieval
- **Voice output** through ElevenLabs
- **Regenerate / copy / listen** actions for responses
- **Conversation switching** and new-chat management
- **Markdown rendering** for richer responses
- **Responsive dark UI** for desktop and mobile
- **FastAPI backend** separating frontend behaviour from external API credentials

## Architecture

```text
┌──────────────┐
│    Browser   │
│ HTML/CSS/JS  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   FastAPI    │
│   Backend    │
└──────┬───────┘
       │
 ┌─────┴───────────────┐
 ▼                     ▼
OpenRouter           Supabase
LLM responses        Auth + data
 │
 ▼
ElevenLabs
Voice output
```

## Project structure

```text
GenAiChat/
├── index.html
├── style.css
├── script.js
├── backend/
│   ├── main.py
│   ├── ai.py
│   └── voice.py
├── supabase/
│   └── schema.sql
├── .env.example
├── requirements.txt
├── .gitignore
└── README.md
```

## Running locally

### Requirements

- Python 3.10+
- A Supabase project
- An OpenRouter API key
- An ElevenLabs API key for voice output

### Setup

```bash
git clone https://github.com/Rubenjoe/GenAiChat.git
cd GenAiChat
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env` from `.env.example` and provide the required credentials.

Start the backend:

```bash
python backend/main.py
```

Then open `http://localhost:8000`.

## Environment variables

Use the variable names documented in `.env.example`. Typical values include:

```env
OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL=openrouter/free
ELEVENLABS_API_KEY=your_key
ELEVENLABS_VOICE_ID=your_voice_id
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CELCIA_OWNER_EMAIL=your_auth_email
```

**Never commit `.env`, service-role keys, database passwords, or access tokens.** The service-role credential is intended for the backend only.

## API surface

| Endpoint | Purpose |
|---|---|
| `POST /api/chat` | Generate an authenticated AI response |
| `POST /api/voice` | Generate speech from text |
| `GET /api/health` | Service health check |
| `POST /api/auth/login` | Authenticate the user |
| `GET /api/auth/session` | Retrieve the current session |
| `GET/PUT /api/profile` | Read/update profile data |
| `/api/memories` | Manage stored memories |
| `/api/conversations` | List and retrieve conversations |
| `/api/documents` | Store document content/metadata |

## Security decisions

- External API credentials stay server-side.
- Supabase Row Level Security protects private application data.
- The browser receives only a short-lived auth token.
- Markdown output is sanitized before rendering.
- Memory extraction is conservative and avoids credential-shaped content.

## Current limitations

- Memory retrieval currently uses bounded lexical relevance rather than vector embeddings.
- Document ingestion stores chunks but does not yet perform semantic embedding/search.
- The application is designed primarily as a personal/private assistant rather than a multi-tenant SaaS product.

## Roadmap

- Semantic retrieval with embeddings
- Speech-to-text input
- Better document analysis and file uploads
- Automated tests and CI
- Usage/token analytics
- Production deployment hardening

## License

No license is currently specified. Add one before distributing the project for reuse.

## Author

**Ruben Joemon** — [@Rubenjoe](https://github.com/Rubenjoe)
