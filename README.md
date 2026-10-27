# Celcia AI — Personal AI Assistant

Celcia AI is a full-stack personal AI assistant built around conversational AI, persistent chat history, long-term memory, authentication, and voice generation. It combines a browser interface with a FastAPI backend and external AI services to demonstrate the engineering involved in building a complete AI product beyond a simple LLM API call.

**Stack:** Python · FastAPI · HTML · CSS · JavaScript · OpenRouter · Supabase · ElevenLabs

> **Project status:** Personal / private assistant. Review authentication, database policies, and deployment configuration before exposing an instance publicly.

## Features

- **AI conversations:** Generate responses through OpenRouter with a configurable model.
- **Persistent chat history:** Store and retrieve conversations using Supabase.
- **Authentication and access control:** Integrate Supabase authentication and Row Level Security (RLS) for application data.
- **Long-term memory:** Store selected memories and retrieve relevant items using bounded lexical relevance.
- **Voice output:** Convert assistant responses to speech through ElevenLabs.
- **Conversation management:** Create chats, switch between conversations, and revisit saved messages.
- **Response actions:** Copy, regenerate, or listen to assistant responses.
- **Markdown rendering:** Present structured assistant responses with sanitisation before rendering.
- **Responsive interface:** Dark-themed browser UI designed for desktop and mobile.
- **Backend integrations:** Keep LLM and voice provider calls behind a FastAPI service rather than exposing provider credentials in the browser.

## Architecture

```text
┌────────────────────────────┐
│      Browser Interface     │
│    HTML / CSS / JavaScript │
└──────────────┬─────────────┘
               │ HTTP requests
               ▼
┌────────────────────────────┐
│          FastAPI           │
│ Auth · Chat · Memory       │
│ Conversations · Voice      │
└───────┬─────────┬──────────┘
        │         │
        ▼         ▼
┌────────────┐ ┌────────────────┐
│ OpenRouter │ │    Supabase    │
│ LLM calls  │ │ Auth + Postgres│
└────────────┘ └────────────────┘
        │
        ▼
┌────────────────────────────┐
│          ElevenLabs        │
│         Text-to-Speech     │
└────────────────────────────┘
```

This is a high-level view of the documented integrations. Exact behaviour depends on the active configuration and provider settings.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Python, FastAPI |
| Language-model gateway | OpenRouter |
| Authentication and persistence | Supabase |
| Database | PostgreSQL via Supabase |
| Voice generation | ElevenLabs |
| API communication | HTTP / JSON |
| Local configuration | Environment variables |

## Repository Structure

```text
GenAiChat/
├── index.html             # Browser interface
├── style.css              # Layout and visual styling
├── script.js              # Frontend interaction logic
├── backend/
│   ├── main.py            # FastAPI application and routes
│   ├── ai.py              # LLM integration
│   └── voice.py           # Voice-generation integration
├── supabase/
│   └── schema.sql         # Database schema
├── .env.example           # Environment variable template
├── requirements.txt       # Python dependencies
├── .gitignore
└── README.md
```

## Requirements

- Python 3.10 or newer
- Git
- A Supabase project with the required schema and authentication configuration
- An OpenRouter API key and a model available to that key
- An ElevenLabs API key and voice ID for text-to-speech

Voice generation requires ElevenLabs configuration. Check the backend implementation and `.env.example` for the exact variables required by your local version.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rubenjoe/GenAiChat.git
cd GenAiChat
```

### 2. Create and activate a virtual environment

**Windows PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 4. Configure environment variables

Copy `.env.example` to `.env` and use the exact variable names defined in that file. The project documentation includes variables in this general form:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CELCIA_OWNER_EMAIL=your_auth_email
```

The values above are placeholders, not working credentials. Confirm the required variables and defaults in the repository's `.env.example`.

**Security:** Never commit `.env`, provider keys, database passwords, or Supabase service-role credentials. Keep privileged credentials on the server only. If a secret is committed accidentally, revoke and rotate it with the provider.

### 5. Prepare Supabase

1. Create or select a Supabase project.
2. Review `supabase/schema.sql` and apply the schema to the intended development database.
3. Check the authentication settings and Row Level Security policies for application tables.
4. Configure the project URL and keys in the local environment.
5. Test using a non-production account before entering real data.

The presence of RLS support does not by itself guarantee secure access rules. Review the policies that are actually applied to your database.

### 6. Start the application

Run the backend from the repository root:

```bash
python backend/main.py
```

The repository documentation uses `http://localhost:8000` as the local address. Use the address and port printed by the application if they differ.

## Documented API Surface

The project documents these routes. Confirm exact request schemas, supported methods, and authentication behaviour in the current backend implementation.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/chat` | Generate an authenticated AI response |
| `POST` | `/api/voice` | Generate speech from text |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET` | `/api/auth/session` | Retrieve session information |
| `GET`, `PUT` | `/api/profile` | Read or update profile data |
| Related methods | `/api/memories` | Memory management |
| Related methods | `/api/conversations` | Conversation retrieval and management |
| Related methods | `/api/documents` | Document content and metadata operations |

## Security and Privacy

The application handles private conversations and external service credentials, so security needs to be considered before deployment.

- Keep OpenRouter, ElevenLabs, and privileged Supabase credentials on the server.
- Never commit environment files, access tokens, or passwords.
- Verify authentication and authorisation on every route that exposes private user data.
- Review RLS policies to ensure users can access only the data they are permitted to read or modify.
- Sanitise Markdown output and do not render model output as trusted HTML.
- Avoid logging private prompts, memories, tokens, or API keys.
- Define retention and deletion behaviour for conversations and memories.
- Before public deployment, review CORS, rate limits, request-size limits, timeouts, retries, HTTPS, and abuse controls.

## Current Limitations

The current project documentation notes the following limitations:

- Memory retrieval uses bounded lexical relevance rather than vector embeddings.
- Document ingestion stores chunks but does not yet implement semantic embedding-based search.
- The application is intended primarily for personal/private use rather than as a complete multi-tenant SaaS product.
- Production readiness depends on deployment-specific authentication, database policies, secret management, monitoring, and testing.

## Potential Improvements

- Add automated unit and integration tests for API routes, authentication, memory, and provider failures.
- Add semantic retrieval for memory and document search, then evaluate retrieval quality.
- Add speech-to-text input and more robust voice-interaction handling.
- Add rate limits, request-size limits, timeouts, and retries for external providers.
- Track latency, usage, and provider failures without logging private content.
- Improve document upload, parsing, and retrieval workflows.
- Add a repeatable deployment guide and continuous-integration checks.

## Troubleshooting

**AI responses fail:** Verify the OpenRouter key, selected model, provider availability, and backend logs. Never include credentials in issue reports.

**Voice generation fails:** Check the ElevenLabs key, voice ID, account limits, and backend network access.

**Authentication or data access fails:** Confirm Supabase configuration, schema setup, session handling, and the relevant RLS policies.

**Conversations or memories do not persist:** Confirm the required database tables exist, requests reach Supabase, and the active user has the intended permissions.

**The UI cannot reach the backend:** Verify the startup output, frontend API URL, browser console, and CORS settings.

## Licence

The repository currently does not specify a licence. Until a licence is added, do not assume that others are permitted to redistribute or reuse the project. Add an appropriate licence if you intend to publish it for open-source reuse.

## Author

**Ruben Joemon** — [GitHub](https://github.com/Rubenjoe)

---

A hands-on project exploring full-stack application development, LLM integration, conversation persistence, memory retrieval, authentication, and voice interfaces.
