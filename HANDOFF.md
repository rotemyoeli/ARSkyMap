# HANDOFF — AR Sky-Map for Orbital Debris & Satellites

> **Rule #1 — This file is the single source of truth.** Read it first. Keep it
> current at the end of every work session. If code and HANDOFF disagree, fix the
> disagreement before doing anything else.

> **⚑ OrbitMark governance program (2026-06-20).** The repo is now driven by the
> controlled OrbitMark autonomous-development package. **Authority order:** `CLAUDE.md`
> → `DOCS/00_README_AND_AUTHORITY.md` → CDR v1.2 → `DOCS/02..07` → `DOCS/PROJECT_SKILLS.md`
> → `DOCS/design_handoff_orbitmark/` (binding UX/UI). State lives in `RUN_STATE.yaml` +
> `WORK_QUEUE.yaml`; cycle = plan→council→implement→verify→evidence→council→gate→PR.
> **Status:** P0 **WP-P0-001 DONE, Gate G-P0 PASS** (PR #1 → `develop`, CI green; evidence
> `artifacts/evidence/P0/WP-P0-001/`). **Next ready: WP-P1-001** (greenfield monorepo
> foundation) — install `pnpm` first; reconcile `deploy.yml`/CI (BLK-003, main now
> branch-protected). The M0 spike below (`backend/`,`web/`) is legacy, superseded by the
> P1 monorepo (not deleted). Boundaries: never merge `main`, deploy prod, expose secrets,
> accept provider terms, or weaken a gate.

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

**Live prod URLs (verified 2026-06-20):**
- Backend: https://backend-production-f7c19.up.railway.app — `/api/health` → `ok`
- Web:     https://web-production-1340.up.railway.app — serves the AR Sky-Map PWA

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

## Git → Railway (push-to-deploy — WORKING)
- GitHub repo: `rotemyoeli/ARSkyMap`. **Push to `main` auto-deploys both services**
  (the exact pushed commit). Verified end-to-end 2026-06-20 (commit `fc62c4b`).
- **Mechanism:** `.github/workflows/deploy.yml` runs on push to `main` and calls
  Railway's API (`serviceInstanceDeployV2` with `commitSha: github.sha`) for each
  service, building the pushed commit from the connected source. We use Actions
  (not Railway's native push trigger) because creating a Railway deployment trigger
  requires a Railway *user account* with its GitHub identity linked to the repo —
  a browser OAuth step that can't be done headlessly. Repo secret
  `RAILWAY_API_TOKEN` (Railway project token) authenticates the workflow.
  - **IMPORTANT:** always pass `commitSha`. Without it, Railway rebuilds its stale
    cached source HEAD instead of the new code.
- Both services are also GitHub-connected at the source level (`serviceConnect`,
  root dirs `web`→`/web`, `backend`→`/backend`), so each builds from its subdir and
  reads that subdir's `railway.toml`. Railway GitHub App is installed on `rotemyoeli`.
- Railway project has **3 services** (all live 2026-06-20):
  - **Postgres** (`postgres-ssl:18`, svc `f08d7aa6-d504-4c30-b3ed-83135c2da650`,
    volume `postgres-volume` at `/var/lib/postgresql/data`). Public TCP proxy
    available via its `DATABASE_PUBLIC_URL` for external `psql`/ingest.
  - **backend** (root `/backend`, NIXPACKS, healthcheck `/api/health`).
    `DATABASE_URL` references `${{Postgres.DATABASE_URL}}` (private net). Other vars:
    `DEV_MODE=false`, `SECRET_KEY` set. `preDeployCommand = "flask init-db"` creates
    tables on each deploy (idempotent).
  - **web** (root `/web`, DOCKERFILE). Build-time `VITE_API_BASE` =
    `https://backend-production-f7c19.up.railway.app/api`, baked into the bundle via
    `ARG VITE_API_BASE` in `web/Dockerfile` (without the ARG it falls back to
    localhost and silently uses the CelesTrak fallback instead of the backend).
- **Data:** backend serves 74 objects (ISS #25544 + Cosmos-2251 debris) from
  Postgres. To (re)seed: temporarily set backend `preDeployCommand = "flask ingest"`,
  redeploy, then restore to `flask init-db`. (Future: nightly ingest cron.)
- **CORS:** flask-cors is open (`CORS(app)`); verified web origin → backend GET/OPTIONS
  return 200 with matching `Access-Control-Allow-Origin`.
- Manual deploy still possible via `railway up` from a service subdir (CLI linked:
  project `ARSkyMap`, env `production`). Key IDs: project
  `9b32c7de-c358-49ed-9be6-22f7caa05c0a`, env(production)
  `1afb53a6-a7bb-4cbf-8c1e-2cfa9a47d1af`, web svc
  `00beac61-34f6-46db-8b1c-06a7ab12efbd`, backend svc
  `cea73519-0995-4702-b146-1cf12b7a6f08`.

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

## Deploy environment — DONE (2026-06-20)
- **Full working Railway environment is live and push-deployed.** Both services
  build green from the connected repo on push to `main` (see "Git → Railway").
- `web` builds via committed `Dockerfile` (`node:20-alpine`, `npm ci` →
  `vite build` → `npm run preview`); `vite.config.ts` has
  `preview.allowedHosts: true`. `backend` builds via NIXPACKS.
- Earlier `railway up` "scheduling build on Metal builder" failures were transient
  Railway builder-infra flakes; current builds are green.

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
