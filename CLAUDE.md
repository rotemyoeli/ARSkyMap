# OrbitMark Project Instructions

## Authority
Read `DOCS/00_README_AND_AUTHORITY.md`. The controlled CDR v1.2, including Appendices G-J, wins over all lower-order artifacts. Do not weaken truth, accessibility, privacy, identity, time/frame/unit, package/rollback, or release-gate contracts.

## Product contract
OrbitMark computes modelled directions for catalogued artificial objects and lets users save, annotate, watch and revisit them. Camera Sky is an optional orientation-based presentation layer, not camera detection. Manual Sky and semantic lists complete every core task. The personal catalog is the wedge.

## Stack
Greenfield monorepo: React/TypeScript/Vite PWA -> Capacitor; Flask/PostgreSQL; dedicated ingestion worker; pnpm + Python 3.12; Storybook/Vitest/Playwright; Railway staging; GitHub Actions.

## Autonomous workflow
Use `RUN_STATE.yaml` and `WORK_QUEUE.yaml`. Invoke the relevant project Skills. One work package per branch/worktree. Plan -> council -> implement -> verify running app -> screenshots/evidence -> independent council -> remediate -> gate -> PR -> state update.

## Mandatory rules
- Explicit UTC/frame/unit names at orbital boundaries; OMM-first; immutable history; stable `object_key`; analyst identities excluded unless approved.
- No full-catalog propagation, JSON parse, IndexedDB read, or catalog-wide sort in an animation frame.
- Precise location stays on-device by default and never enters analytics/share cards.
- Candidate list, never false single-object certainty.
- No generic error banner as the only recovery state.
- No color-only, motion-only, drag-only, canvas-only or camera-only core task.
- No unsupported “detect,” “exact,” “live surveillance,” “all debris,” “pinpoint,” guaranteed visibility or notification claims.
- Do not mark complete without tests, running-app verification, screenshot evidence, traceability and council record.

## Autonomy boundary
Allowed on local/feature/staging: installs, edits, disposable migrations, tests, browsers, screenshots, commits, pushes, PRs, staging deploys. Denied: main merge, production deploy/destructive data, billing, secret disclosure, provider/legal acceptance, disabling gates, protected CDR edits.

## Commands
Use scripts in `scripts/`; do not invent alternate gates. Start with `bash scripts/bootstrap_project.sh`. Use `/run-skill-generator` once the multi-service launch is stable, then `/run` and `/verify`.

## Blockers
Continue with fixtures/mocks where safe. Record blocks in `DOCS/12_BLOCKERS.md`. Stop only the blocked irreversible capability, not unrelated work.
