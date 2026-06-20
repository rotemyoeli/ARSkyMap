# OrbitMark — Production Decision Package (prepared by the autonomous system)
Date 2026-06-20 · Status: **AWAITING HUMAN DECISION** (autonomous authority ends here, BLK-002)

The autonomous program prepared everything up to the production boundary. The production deploy,
provider/legal acceptance, and billing are intentionally **outside** unattended authority and require
the Product Owner + applicable external approvals.

## What is built, live, and verified (Railway staging)
- **Web (PWA):** https://web-production-1340.up.railway.app — Tonight · Manual Sky · Catalog ·
  Object detail (save/note/tag/watch) · Passes (+ reminders) · Learn · Settings/Data-Status. Installable,
  offline-capable, claims-compliant.
- **Backend + Postgres:** 323 real catalogued objects (payloads, Starlink, multi debris clouds);
  `/api/health` ok; type-allowlisted read API; SECRET_KEY-enforced; scoped CORS.
- **Gates passed (staging):** G-P0, G-P1, M1, M2, M3, G0.5 (independent golden vectors), Beta hardening.
- **Differentiators live (evidence-grounded, ADR-0003):** honest age-aware uncertainty (D1); visibility
  "may be visible" 3-gate model (D4); type de-clutter (D6); privacy promise (D8); golden-vector verified
  accuracy (D9); debris/sustainability Learn (D3); Starlink-train awareness (D5).

## Recommendation
**Proceed to a controlled production/beta release** once the residual items below are cleared by the
appropriate human/external owners. The product is functionally complete for its MVP wedge and hardened.

## Residual risk list (must be owned before production)
| Item | Type | Owner | Action |
|---|---|---|---|
| BLK-002 | Legal/Product | Product Owner | Approve production deploy; accept any provider/legal terms |
| BLK-004 | Data terms | Product Owner / Legal | Confirm CelesTrak usage policy + attribution; set server cache + rate-limit before scaling ingest |
| BLK-001 | Device | QA / Product | Physical iOS/Android matrix for Camera Sky + native background notifications (not in MVP) |
| Security adv. | Eng | Eng | Self-host fonts (SRI); set production `DEV_MODE` unset, real `SECRET_KEY`, `CORS_ORIGINS` for the prod domain |
| Usability | Product | Product | 5-user usability evidence (external) for the wedge |
| Coverage | Eng | Eng | Expand golden-vector matrix (deep-space/high-ecc/decayed); Web Worker propagation offload; full S-01..S-18 + Storybook visual baselines |

## Explicit non-actions by the autonomous system
No merge to `main`; no production deploy; no production data change; no secret disclosure; no billing;
no provider/legal acceptance; no gate weakened. All work is on `develop`, pushed, and reversible.
