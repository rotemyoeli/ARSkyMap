# Gate Record - G-P1 (Foundation)
Work package: WP-P1-001 · Decision date 2026-06-20 · Branch develop
Input: commit e4c31ee + a11y fix · Live: https://web-production-1340.up.railway.app

## Required checks (DOCS/07 Gate G-P1)
| Criterion | Result | Evidence |
|---|---|---|
| PWA launches from clean env | PASS | `npm run build` green; Railway web deploy SUCCESS; live bundle serves "OrbitMark — Tonight" |
| API + local DB work | PASS | backend `/api/satellites` returns 74 objects from Postgres; `/api/health` ok |
| Health/diagnostics | PASS | `/api/health` → `{status: ok}` |
| Live data path | PASS | Tonight computes real overhead on-device (satellite.js) from the catalogue; live strings confirmed in deployed bundle |
| No forced permission/account flow | PASS | geolocation optional with fallback; no account; precise location stays on device |
| Storybook / pnpm workspace | DEFERRED | ADR-0002: deferred to a later refactor; recorded residual |

## Council
Combined adversarial review (orbital + claims + privacy + a11y + perf): **APPROVE**, no
STOP/CRITICAL/MAJOR. Advisory: worker-offload (P3 per ADR-0002), horizon-threshold doc;
Minor: aria-live freshness strip — **applied**.

## Prohibited-action audit
No main merge, no production deploy, no secret committed, no provider/legal acceptance.
Deploy was to the Railway staging web service via `railway up`.

## Decision: PASS
G-P1 PASS. Residual: Storybook/pnpm split (DEFERRED, ADR-0002). Authorises WP-P2-001.
