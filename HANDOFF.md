# HANDOFF — AR Sky-Map for Orbital Debris & Satellites

> **Rule #1 — This file is the single source of truth.** Read it first. Keep it
> current at the end of every work session. If code and HANDOFF disagree, fix the
> disagreement before doing anything else.

## Standing conventions (carry-over)
- **English only** in code, comments, commits, and identifiers.
- **PowerShell-compatible** commands in all docs (Windows dev host).
- **`DEV_MODE`** env flag bypasses auth pre-launch. Never `true` in production.
- **Versioned per-sprint zip** with preserved directory structure on each handoff.

## What we are building
An honest, model-based AR sky companion for satellites and orbital debris. The
**wedge** (the moat) is a personal, curatable catalog: tap an object → save with
tag + note + watch → get pass alerts. Debris/sustainability is a first-class lens.
Explicitly **out of scope**: conjunction/collision prediction, "surveillance",
pinpoint fragment ID. See the PDR for full rationale.

## Stack & decisions
- **Backend:** Flask + PostgreSQL on Railway. Nightly TLE ingest + python-sgp4
  precompute; SATCAT metadata; catalog/auth/sync API.
- **Client:** Vite + React, wrapped to native iOS/Android via **Capacitor** (PWA-first).
  Decision §15.2 resolved: **Capacitor-PWA**.
- **On-device:** satellite.js propagation, sensor fusion, AR render.
- **Companion (v1.x):** CesiumJS 3D orbit globe.

## Repo layout (monorepo)
```
backend/   Flask app (app factory, models, api/, ingest/), gunicorn, railway.toml
web/       Vite + React + Capacitor, railway.toml
docker-compose.yml   local Postgres
.env.example         all env vars (copy to .env, never commit .env)
```

## Environments
| Layer    | Local                                   | Railway (prod)                    |
|----------|-----------------------------------------|-----------------------------------|
| Backend  | `python wsgi.py` (port 8000)            | service root `/backend`, gunicorn |
| Web      | `npm run dev` (port 5173)               | service root `/web`, vite preview |
| Postgres | `docker compose up -d` (port 5432)      | managed Postgres plugin           |

## Run locally (PowerShell)
```powershell
# Postgres
docker compose up -d
# Backend
cd backend; ..\.venv\Scripts\Activate.ps1; pip install -r requirements.txt; python wsgi.py
# Frontend (new terminal)
cd web; npm install; npm run dev
```
Health check: `GET http://localhost:8000/api/health`.

## Git → Railway
- GitHub repo: `rotemyoeli/ARSkyMap` (auto-deploy on push to `main`).
- Railway project has **3 components**: Postgres plugin, `backend` service
  (root `/backend`), `web` service (root `/web`). `DATABASE_URL` is injected into
  the backend automatically; set `DEV_MODE`, `SECRET_KEY` as service variables.

## Current state
- M(-1) **Infra scaffold** — DONE: monorepo, Flask factory + `/api/health` +
  `/api/catalog` (DEV_MODE stub), models (Satellite, CatalogItem), Vite/React shell
  calling the health endpoint, git + GitHub + Railway wiring.
- M0 **Spike** — CODE DONE, GATE PENDING (manual browser check):
  - Backend ingest: `app/ingest/tle.py` `run_ingest()` pulls CelesTrak GP groups
    (`stations` + `cosmos-2251-debris`, TLE format), classifies object_type, parses
    epoch, upserts into `satellites`. CLI: `flask ingest` (and `flask init-db`).
    Verified live: 74 objects (ISS #25544 + 50 debris), epoch fresh.
  - Read API: `GET /api/satellites?type=&limit=` serves TLEs + `last_updated`.
  - Client: `web/src/orbital/propagate.ts` (satellite.js SGP4 → Alt/Az/range) and
    `catalog.ts` (backend-first, CelesTrak direct fallback). `App.tsx` shows a live
    1 Hz Alt/Az table for ISS + a debris object with observer lat/lon + UTC for the
    GATE comparison. `npm run build` passes.

## In flight (uncommitted)
- **`web` deploy hardening:** Railway's Nixpacks auto-detect was flaky on the
  `/web` monorepo subdir, so the web build is being switched to a committed
  `Dockerfile` (`node:20-alpine`, `npm ci` → `vite build` → `npm run preview`).
  Files: `web/Dockerfile` (new), `web/railway.toml` (`builder = "DOCKERFILE"`).
  `vite.config.ts` already has `preview.allowedHosts: true` for the Railway host.
  Not yet committed/pushed — needs a Railway deploy to confirm green.

## Next (verify-gated roadmap)
- **M0 GATE (do this next):** run web + backend locally, open the app, allow
  geolocation, and compare the rendered Az/Alt for ISS against Heavens-Above for the
  same UTC instant + location. Close the GATE in HANDOFF when within tolerance.
- **M1 AR core:** sensor fusion, manual offset, smoothing, uncertainty radius,
  tap-to-candidate-list, offline TLE cache w/ "last updated".
- **M2 Wedge:** mark/annotate/watch, "overhead now", pass alerts, real auth.
- **M3 Trust:** object cards, debris framing, cloud sync, CesiumJS globe.
  GATE: data-terms legal sign-off (Space-Track/CelesTrak before mirroring).

## Open items
1. Education channel for the M4 pilot.
2. Legal read of Space-Track/CelesTrak redistribution terms before any mirroring.
