# Greek Tutor

A web-based Greek language learning application with vocabulary management, quizzes, and AI-powered sentence generation.

## Features

- **Vocabulary Management** — Add English words and auto-lookup Greek translations, word types, and grammar notes via LLM. Filter by text or word type, with pagination.
- **Word Quiz** — Random vocabulary flashcards in either direction (English-to-Greek or Greek-to-English). Displays grammar notes alongside correct answers.
- **Sentence Quiz** — AI-generated sentences using your vocabulary. Answers are checked semantically, handling word order and accent variations.
- **Dashboard** — Track quiz sessions, scores, weekly activity, and vocabulary growth.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, Pydantic |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| AI | LiteLLM (supports OpenAI, Anthropic, Ollama, LMStudio, etc.) |
| Storage | CSV files (designed for easy migration to a database) |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- An LLM API key (OpenAI, Anthropic, etc.) or a local model (Ollama, LMStudio)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your LLM configuration
```

Configure your LLM provider in `.env`:

```bash
# OpenAI
LLM_MODEL=openai/gpt-4o-mini
LLM_API_KEY=sk-your-key-here

# Anthropic
LLM_MODEL=anthropic/claude-sonnet-4-5-20250929
LLM_API_KEY=sk-ant-your-key-here

# Ollama (local, no key needed)
LLM_MODEL=ollama/llama3
LLM_API_BASE=http://localhost:11434

# LMStudio (local, no key needed)
LLM_MODEL=openai/local-model
LLM_API_BASE=http://localhost:1234/v1
```

Start the server:

```bash
uvicorn main:app --reload
```

API docs available at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
backend/
  main.py                 # FastAPI app, CORS, router mounting
  config.py               # Settings from environment variables
  data/                   # CSV storage (gitignored)
  models/                 # Pydantic schemas
  routers/                # API endpoints (vocabulary, quiz, stats)
  services/               # Business logic (CSV store, quiz, LLM)

frontend/src/
  api/client.ts           # Typed API client
  components/             # Reusable UI components
  hooks/useQuiz.ts        # Quiz state machine hook
  pages/                  # Dashboard, Vocabulary, WordQuiz, SentenceQuiz
  types/index.ts          # TypeScript interfaces
```

## License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.
