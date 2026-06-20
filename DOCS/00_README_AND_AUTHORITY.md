# OrbitMark Autonomous Development Package v2.0


**Purpose.** This package is the executable governance and delivery layer for OrbitMark. Copy the package contents to the repository root. The `DOCS/` directory is the product and engineering authority; `CLAUDE.md`, `.claude/`, `scripts/`, and `.github/` make that authority operational.

## Controlled authority order
1. `DOCS/01_OrbitMark_Critical_Design_Review_CDR_v1.2.docx`, including Appendix G and Appendices H-J.
2. Approved requirements, data/API contracts, ADRs, and gate records.
3. `DOCS/03_PROJECT_SKILLS_STRATEGY_AND_REGISTRY.md` and the generated `DOCS/PROJECT_SKILLS.md`.
4. `DOCS/05_CLAUDE_DESIGN_UX_UI_PACKAGE.md`, design tokens, component contracts, and approved visual baselines.
5. Work-package plans and evidence packs.
6. Diagrams, PDR, business plan, and explanatory material.

A lower-order artifact cannot weaken a higher-order requirement. Conflicts are logged in `DOCS/12_BLOCKERS.md` and resolved by an ADR or controlled CDR change.

## Approved defaults
- New greenfield monorepo.
- React 18+ / TypeScript / Vite PWA, then Capacitor for iOS and Android.
- Flask API, PostgreSQL, dedicated ingestion worker, Railway staging, GitHub Actions CI.
- WSL2, Claude Code CLI, GitHub, and PyCharm.
- Claude may install dependencies, edit files, run migrations against disposable/staging databases, run browsers and tests, commit, push feature branches, open pull requests, and deploy staging.
- Claude may not merge to `main`, deploy production, delete production data, change billing, expose secrets, or accept data-provider/legal terms without a signed gate.
- Browser emulation and simulators are accepted before the physical-device gate. Camera Sky production approval remains blocked until the physical device matrix is completed.
- Claude Design produces Figma-ready specifications, design tokens, SVG/PNG assets, Storybook stories, and implementable React components.
- When blocked, Claude continues with fixtures and mocks, records the blocker, and never bypasses a gate.

## First execution
1. Copy this package to the repository root.
2. Run `bash scripts/bootstrap_project.sh`.
3. Review only the generated environment report; no product decision is required.
4. Start Claude Code from the repository root and paste `DOCS/START_HERE_PROMPT.md`.
5. Claude executes `orbitmark-bootstrap`, creates or refreshes `DOCS/PROJECT_SKILLS.md`, validates the queue, and begins the first ready work package.

## Completion semantics
A work package is complete only when code, tests, screenshots, traceability, council review, and evidence are all present. A phase is complete only when its exit gate is machine-checked and the gate record is signed by the designated automated council roles. Production is intentionally outside unattended authority.
