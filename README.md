<div align="center">

# Celcia AI

### Personal AI Assistant with Memory, Chat History, and Voice

A full-stack AI assistant built with FastAPI and a responsive browser interface. Chat with configurable language models, persist conversations, retrieve relevant memories, and generate spoken responses.

![Status](https://img.shields.io/badge/status-active%20development-blue)
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![AI Providers](https://img.shields.io/badge/AI-OpenRouter%20%7C%20NVIDIA%20NIM-purple)
![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E)
![License](https://img.shields.io/badge/license-MIT-green)

[Features](#-features) · [Architecture](#-architecture) · [Setup](#-getting-started) · [Configuration](#-configuration) · [API](#-api-overview)

`</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Using Celcia AI](#-using-celcia-ai)
- [API Overview](#-api-overview)
- [Security and Privacy](#-security-and-privacy)
- [Current Limitations](#-current-limitations)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Author](#-author)

---

## 🧭 Overview

**Celcia AI** is a personal AI assistant that combines conversational AI with the application features needed for a usable product: authentication, saved conversations, long-term memory, document handling, and voice output.

Instead of putting provider calls directly in the browser, the app uses a **FastAPI backend** to coordinate chat requests and integrations. The AI provider can be configured to use **NVIDIA NIM** or **OpenRouter**, while voice generation can use **ElevenLabs** or the configured NVIDIA NIM text-to-speech model.

The project is intended primarily for personal/private use and as a full-stack AI application project. Deployment security and hosted provider/database flows should be verified for the environment in which it is run.

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **AI conversations** | Send messages to a configurable LLM provider through the backend. |
| 🧠 **Long-term memory** | Store selected memories and retrieve relevant context using bounded relevance-based matching. |
| 🗂️ **Persistent chat history** | Save and revisit conversations using Supabase-backed persistence. |
| 🔐 **Authentication** | Provide authenticated access and owner-oriented configuration for private use. |
| 🔊 **Voice output** | Generate speech from assistant responses through ElevenLabs or supported NVIDIA NIM TTS configuration. |
| 📄 **Document handling** | Support document-related workflows and text extraction utilities for PDF and DOCX formats. |
| 🔁 **Conversation controls** | Switch between conversations, create new chats, copy responses, regenerate, and listen. |
| 📝 **Markdown responses** | Display structured assistant answers with sanitisation before rendering. |
| 📱 **Responsive interface** | Dark-themed browser UI designed for desktop and mobile. |
| 🔌 **Provider configuration** | Choose supported AI and voice providers through environment settings. |

## 🏗️ Architecture

### High-Level System Diagram

```text
┌──────────────────────────────────────┐
│           Browser UI                 │
│      HTML / CSS / JavaScript         │
│ Chat · History · Memory · Voice      │
└──────────────────┬───────────────────┘
                   │ HTTP / JSON
                   ▼
┌──────────────────────────────────────┐
│             FastAPI                  │
│ Auth · Chat · Context · Documents    │
│ Conversations · Memory · Voice       │
└─────────┬─────────────┬──────────────┘
          │             │
          ▼             ▼
┌────────────────┐  ┌──────────────────┐
│ AI Provider    │  │ Supabase         │
│ OpenRouter or  │  │ Auth + Postgres  │
│ NVIDIA NIM     │  │ persistent data  │
└────────────────┘  └──────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│ Voice provider: ElevenLabs or NIM TTS│
└──────────────────────────────────────┘
```

### Request flow

1. The browser sends a request to the FastAPI backend.
2. The backend validates the request and authentication context.
3. Chat context and relevant saved memory are assembled where applicable.
4. The selected AI provider generates a response.
5. The application returns the response and persists supported conversation data through its configured storage.
6. When requested, the voice route sends text to the selected text-to-speech provider.

The diagram is a conceptual overview. Exact behaviour depends on environment settings, configured providers, and the backend implementation.

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend API | Python, FastAPI, Uvicorn |
| LLM provider integration | OpenRouter, NVIDIA NIM through OpenAI-compatible APIs |
| Authentication and persistence | Supabase |
| Data storage | PostgreSQL through Supabase |
| Voice generation | ElevenLabs, NVIDIA NIM TTS configuration |
| Document utilities | pypdf, python-docx |
| Configuration | python-dotenv |

## 🧩 Repository Structure

```text
GenAiChat/
├── index.html              # Browser application
├── style.css               # UI layout and themes
├── script.js               # Frontend behaviour
├── backend/
│   ├── main.py             # FastAPI routes and request orchestration
│   ├── ai.py               # LLM provider integration
│   ├── config.py           # Environment and provider configuration
│   ├── context.py          # Context preparation
│   ├── documents.py        # Document-related helpers
│   ├── memory.py           # Long-term memory logic
│   ├── storage.py          # Persistence helpers
│   └── voice.py            # Text-to-speech integration
├── api/
│   └── index.py            # Deployment entry point
├── supabase/
│   └── schema.sql          # Database schema
├── .env.example            # Safe configuration template
├── requirements.txt        # Python dependencies
├── LICENSE                 # MIT license
└── README.md
```

## ✅ Prerequisites

Before starting, make sure you have:

- **Python 3.10 or newer**
- **Git**
- A Supabase project for authentication and persistent data
- An **OpenRouter API key** or **NVIDIA NIM API key**
- An **ElevenLabs API key and voice ID** if using ElevenLabs voice output
- A compatible NVIDIA NIM TTS configuration if using NIM for voice generation

You only need credentials for the providers selected in your environment configuration.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rubenjoe/GenAiChat.git
cd GenAiChat
```

### 2. Create a virtual environment

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

### 4. Create your environment file

Copy `.env.example` to `.env` and set the required values.

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux**

```bash
cp .env.example .env
```

### 5. Configure Supabase

1. Create or select a Supabase project.
2. Review `supabase/schema.sql` and apply the schema to the intended development project.
3. Verify authentication configuration and Row Level Security policies for the tables used by the app.
4. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY` in `.env`.
5. Set `CELCIA_OWNER_EMAIL` and `APP_URL` according to your environment.
6. Test authentication and persistence with a non-production account before using private data.

Never expose the service-role key in browser code or a public variable.

### 6. Start the application

Run from the repository root:

```bash
python backend/main.py
```

Open the local URL printed by the backend. The documented development URL is:

```text
http://localhost:8000
```

If the application reports a different host or port, use that address.

## ⚙️ Configuration

The exact required variables are documented in `.env.example`. The main settings include:

### AI provider

| Variable | Purpose |
|---|---|
| `AI_PROVIDER` | Selects `nim` or `openrouter` according to the project configuration. |
| `NIM_API_KEY` | NVIDIA NIM API key when using NIM. |
| `NIM_CHAT_MODEL` | NVIDIA NIM chat model identifier. |
| `NIM_BASE_URL` | NVIDIA NIM OpenAI-compatible API base URL. |
| `OPENROUTER_API_KEY` | OpenRouter API key when using OpenRouter. |
| `OPENROUTER_MODEL` | Model identifier requested from OpenRouter. |

### Voice provider

| Variable | Purpose |
|---|---|
| `VOICE_PROVIDER` | Selects the configured voice provider. |
| `ELEVENLABS_API_KEY` | API key for ElevenLabs voice generation. |
| `ELEVENLABS_VOICE_ID` | Voice identifier used by ElevenLabs. |
| `NIM_TTS_MODEL` | NVIDIA NIM text-to-speech model. |
| `NIM_TTS_VOICE` | Voice setting for NIM TTS. |

### Supabase and application

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_ANON_KEY` | Public/anonymous Supabase key used by the application configuration. |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server-side key; keep secret and never send to the browser. |
| `CELCIA_OWNER_EMAIL` | Configured owner email used by the application. |
| `APP_URL` | Canonical application URL used by the app configuration. |

Use the precise names and comments in `.env.example` as the source of truth. Values shown in that template are placeholders, not credentials.

## 🧪 Using Celcia AI

1. Start the backend and open the application in your browser.
2. Sign in using the account and configuration for your environment.
3. Start a conversation and send a prompt.
4. Switch between saved conversations or create a new chat.
5. Use response actions such as copy, regenerate, or listen where available.
6. Configure a supported provider and credentials to enable its AI or voice features.
7. Try document and memory workflows using non-sensitive sample content before using private files.

Feature availability depends on valid provider credentials, Supabase configuration, and the deployed application settings.

## 📝 API Overview

The project exposes backend functionality for chat, voice, authentication, profile/session, conversation, memory, and document workflows. Documented endpoints include:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/chat` | Generate an authenticated AI response. |
| `POST` | `/api/voice` | Generate speech from text. |
| `GET` | `/api/health` | Health check. |
| `POST` | `/api/auth/login` | Authenticate a user. |
| `GET` | `/api/auth/session` | Retrieve the current session. |
| `GET` / `PUT` | `/api/profile` | Read or update profile data. |
| `/api/memories` | Memory-related operations. |
| `/api/conversations` | Conversation retrieval and management. |
| `/api/documents` | Document content and metadata operations. |

For exact request schemas and supported HTTP methods, use the current route definitions in `backend/main.py` and related backend modules as the source of truth.

## 🔐 Security and Privacy

- Keep all provider keys and privileged Supabase credentials on the server.
- Never commit `.env`, access tokens, passwords, or database secrets.
- Review and test Supabase Row Level Security policies; do not assume the presence of RLS alone guarantees correct permissions.
- Ensure every private-data route performs authentication and authorisation checks.
- Sanitise Markdown before rendering and do not treat model-generated text as trusted HTML.
- Avoid logging API keys, authentication tokens, private prompts, or stored memories.
- Use non-sensitive test documents when evaluating extraction and memory features.
- Before public deployment, review HTTPS, CORS, rate limiting, request validation, error handling, retention, and deletion workflows.

## ⚠️ Current Limitations

- Memory retrieval uses bounded lexical relevance rather than vector embeddings.
- Document chunks may be stored, but the current project documentation does not describe semantic embedding-based retrieval as implemented.
- The app is designed primarily for personal/private use rather than a complete multi-tenant SaaS deployment.
- Successful local startup does not establish that hosted authentication, data persistence, provider credentials, or deployment security are correctly configured.

## 🩹 Troubleshooting

| Problem | Checks |
|---|---|
| AI responses fail | Verify the selected provider, API key, model identifier, network access, and backend logs. |
| Voice generation fails | Check `VOICE_PROVIDER`, provider credentials, voice ID/model, and account limits. |
| Login or session errors | Check Supabase URL/key, schema, authentication configuration, and owner email settings. |
| Chats or memories do not persist | Verify schema, database access, user permissions, and backend errors. |
| UI cannot reach the API | Confirm backend startup, local URL, browser console, and CORS configuration. |
| Document processing fails | Check file type, package installation, file size, and supported format. |

Never include real credentials in logs, screenshots, issue reports, or chat messages.

## 🗺️ Roadmap

Possible next steps include:

- Semantic memory and document retrieval with evaluated embeddings.
- Speech-to-text input and improved voice conversation handling.
- Automated tests for authentication, persistence, provider errors, and document parsing.
- Better rate limits, provider timeouts, retries, and usage metrics.
- A deployment guide with environment-specific security checks.
- Clearer data export and deletion workflows.

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

The MIT license applies to project code owned by this repository's copyright holder. Third-party services, dependencies, datasets, and external assets remain subject to their respective terms and licences.

## 👤 Author

**Ruben Joemon** · [GitHub](https://github.com/Rubenjoe)

---

Built as a hands-on project exploring full-stack development, LLM integration, persistent conversations, memory retrieval, authentication, document workflows, and voice interfaces.
