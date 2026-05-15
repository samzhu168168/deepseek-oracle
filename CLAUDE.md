# CLAUDE.md

## Project: Elemental Bond (deepseek-oracle)

www.elemental.bond — Eastern divination (BaZi/ZiWei/IChing) meets AI. US-market relationship compatibility SaaS.

## Architecture

```
Vercel (full-stack)
├── frontend/          React 19 + Vite 6 + TypeScript
│   └── src/
│       ├── api/       API client (axios, no mock)
│       ├── components/ UI components
│       ├── pages/     Home, Compatibility, Result
│       └── utils/     Tokenizer, helpers
├── api/               Vercel serverless entry (index.py → backend/)
└── backend/           Flask API (app/)
    ├── llm_providers/ DeepSeek, Volcano, Aliyun, GLM, Qwen
    ├── services/      Divination, Analysis, Oracle orchestrator
    ├── prompts/       Oracle system prompts
    └── models/        SQLite database models
```

- `vercel.json` at root — builds `api/` (Python) + `frontend/` (static)
- Flask app created via `backend/app/__init__.py:create_app()`
- Default LLM: DeepSeek (`LLM_PROVIDER=deepseek`), considering switch to Anthropic for US market

## Key Commands

```bash
cd frontend && npm run dev        # Dev server on :5173
cd backend && python run.py       # Flask API on :5000
```

## Environment

- `backend/.env` — local dev (gitignored)
- `.env.production` — reference for Vercel env vars
- Vercel dashboard — actual production env vars

## Important

- LLM provider config: `backend/.env` → `LLM_PROVIDER` (currently `deepseek`)
- CORS via `flask-cors` in `create_app()`
- All API keys in `backend/.env` (gitignored, never committed)
- Plan: switch from DeepSeek to Anthropic Claude for US market
