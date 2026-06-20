# Gate Record — M2 (wedge) · M3 (trust) · Beta (hardening)
Date 2026-06-20 · Branch develop · Live: https://web-production-1340.up.railway.app
Backend: https://backend-production-f7c19.up.railway.app · DB: managed Postgres (323 objects)

## M2 — Curation wedge (PASS, staging)
Save/note/tag/watch (local-first, `store.ts`, object_key, analyst-range excluded) → Passes
(on-device next-pass within 12 h) → **pass reminders** (Notification API; honest "works while
open / OS may deliver early or late") → **offline** catalogue cache + installable PWA
(manifest + service worker). Verified live. Residual: native background push (Capacitor/Web Push)
is a post-staging item.

## M3 — Trust & depth (PASS, staging)
Data Status (S-15: source lane, counts by type, element-age distribution, cached/offline state) ·
Learn (S-14: reviewed, sourced explainers — modelled-not-detected, uncertainty, visibility, debris
& sustainability) · Settings/privacy (no ads/account/tracking; precise location on device). Verified live.

## Beta — Hardening (PASS_WITH_ADVISORY, staging)
Independent P9 Council (red-team + accessibility + security/privacy): APPROVE_WITH_CONDITIONS;
all CRITICAL/MAJOR remediated and verified:
- **A11y (CRITICAL×2, MAJOR×4):** colour-only status fixed (om-dot role+aria-label, confidence
  aria-label, watched-star label); reduced-motion stops the ring; dead standalone Tonight removed;
  All/Saved group label; nav label; tab min-height. Native buttons, :focus-visible, shape-first
  markers already in place.
- **Security/privacy (MAJOR×2):** SECRET_KEY mandatory in production (no insecure default);
  `/api/health` no longer discloses dev_mode (verified); CORS scoped to known origins; `/api/satellites`
  type allowlist (invalid→400, verified). Precise location confirmed on-device only; no secrets committed.
- **Honesty (MINOR):** Starlink heading circular mean; cylindrical-umbra/civil-twilight disclosed;
  TLE-error citation corroborated (Vallado/Oltrogge).
Evidence: `artifacts/evidence/P9/council-findings.json`. Backend tests pass (golden vector + health).

## Residual external/ops items (block full production, not staging)
- BLK-001 physical iOS/Android device matrix (Camera Sky / native notifications). OPEN — external.
- BLK-002 production deployment + provider/legal acceptance. OPEN — human-only.
- BLK-004 CelesTrak usage policy/attribution + cache/rate-limit confirmation before scaling. OPEN.
- Advisory backlog: self-host fonts (SRI), SW cache TTL, full S-01..S-18 + Storybook visual baselines,
  Web Worker propagation offload, 5-user usability evidence, golden-vector matrix expansion.

## Decision: PASS (staging) — production gate is human-only
M1+M2+M3 and a hardened beta are live and verified on Railway **staging**. Per the master plan the
production decision is never autonomous: see `DOCS/PRODUCTION_RECOMMENDATION.md` for the signed
recommendation + residual-risk list. The system stops here at the production boundary (BLK-002).
