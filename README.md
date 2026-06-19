# AR Sky-Map

Honest, model-based AR companion for satellites and orbital debris. Mark, annotate,
watch, and share specific orbital objects — with a debris/sustainability lens.

Monorepo: **`backend/`** (Flask + PostgreSQL) · **`web/`** (Vite + React + Capacitor).

See **[HANDOFF.md](./HANDOFF.md)** — the single source of truth for setup,
conventions, architecture, and the verify-gated roadmap.

## Quick start (PowerShell)
```powershell
docker compose up -d
cd backend; ..\.venv\Scripts\Activate.ps1; pip install -r requirements.txt; python wsgi.py
cd web; npm install; npm run dev
```
