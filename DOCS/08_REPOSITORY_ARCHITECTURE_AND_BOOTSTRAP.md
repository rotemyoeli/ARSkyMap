# Repository Architecture and Bootstrap


## Target monorepo
```text
OrbitMark/
  apps/mobile-web/              React + TypeScript + Vite PWA + Capacitor shell
  services/api/                 Flask API and admin/diagnostic endpoints
  services/ingest/              Dedicated orbital ingestion job/worker
  packages/orbit-engine/        OMM adapter, SGP4, frames, look angles, passes
  packages/contracts/           JSON Schema/OpenAPI/worker message contracts
  packages/ui/                  Tokens, semantic components, Storybook
  packages/config/              Shared lint/type/test/build configuration
  tests/e2e/                    Playwright flows and visual baselines
  tests/fixtures/orbital/       Golden OMM and independent expected outputs
  migrations/                   Versioned database migrations
  DOCS/                         Controlled documentation and evidence templates
  .claude/                      Skills, agents, rules, settings and hooks
  scripts/                      Bootstrap, quality, evidence and guard scripts
  artifacts/evidence/           Generated, mostly CI-retained evidence
  .github/workflows/            CI and safe Claude automation
```

## Baseline toolchain
- Node current LTS supported by chosen Vite/Capacitor versions; pnpm workspaces.
- Python 3.12, `uv` or locked pip environment, Flask, SQLAlchemy/Alembic, PostgreSQL.
- Vitest for TS unit/browser/component tests; Pytest for Python.
- Storybook for component/state development.
- Playwright for E2E, screenshots, traces and cross-browser execution.
- axe-core integration for automated accessibility findings.
- Ruff, mypy/pyright as selected by bootstrap; ESLint/Prettier/TypeScript strict.
- Docker Compose for local PostgreSQL and service integration; Railway staging.

Versions are pinned by lockfiles after compatibility checks. The documentation intentionally does not invent package versions before bootstrap resolves current supported releases.

## Bootstrap order
1. Validate WSL/Linux tools, Git, GitHub CLI, Claude Code and credentials without printing secrets.
2. Initialize Git and protected branch conventions.
3. Create pnpm/Python workspaces and clean launch scripts.
4. Scaffold app/API/ingest/packages/tests, but do not implement product features.
5. Create local environment templates and disposable database.
6. Configure lint/type/test/build/Storybook/Playwright.
7. Generate `/run` recipe with `/run-skill-generator` when the standard launch becomes multi-service.
8. Run clean install/build/test and save P0 evidence.
9. Open the first PR and mark G-P0 only after council/gate pass.

## Environment separation
- Local: fixtures and disposable data.
- CI: ephemeral services and no production credentials.
- Staging: Railway service/API/worker/PostgreSQL with staging-only secrets and test accounts.
- Production: absent from unattended credentials and workflows.
