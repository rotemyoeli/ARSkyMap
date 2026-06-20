# Autonomous Development Master Plan


## 1. Objective
Run OrbitMark from repository bootstrap through a production-candidate staging build with minimal founder intervention. The operating model is autonomous inside reversible development boundaries and conservative at irreversible, legal, provider, security, financial, or production boundaries.

## 2. Delivery principles
- **Evidence before progression.** Every phase has explicit entry criteria, automated exit criteria, stop conditions, and a durable evidence pack.
- **One controlled work package at a time per worktree.** Parallelism is allowed only for independent packages with disjoint file ownership.
- **No hidden assumptions.** Unknown thresholds remain configuration/open items until measured.
- **Truth and accessibility are architecture.** Claims, non-camera parity, location minimization, and accessibility are merge gates.
- **Tests are layered.** Static checks, unit tests, contract tests, integration tests, browser/component tests, E2E, visual regression, accessibility, security, performance, and manual/physical-device evidence are separate layers.
- **Recovery is designed.** Each iteration updates `RUN_STATE.yaml`, commits reversible changes, and preserves the last known-good branch, package, database fixture, and visual baseline.

## 3. Autonomous control loop
1. Read `RUN_STATE.yaml`, `WORK_QUEUE.yaml`, CDR control clauses, and current blockers.
2. Select the highest-priority `READY` work package whose dependencies and entry gate are satisfied.
3. Create a branch and optional Git worktree using `wp/<phase>-<id>-<slug>`.
4. Invoke `/orbitmark-plan-work-package`; bind requirements, ADRs, risks, tests, screenshots, files, and evidence.
5. Ask the Council planning quorum to challenge the plan. Resolve all STOP findings.
6. Implement the smallest coherent vertical slice.
7. Run fast checks after each material edit; run the full package gate before review.
8. Launch the real app using the recorded `/run` recipe, execute `/verify`, E2E flows, accessibility checks, and screenshot capture.
9. Run the independent review quorum. Reviewers do not edit the implementation branch.
10. Fix findings and repeat until no STOP/CRITICAL finding remains.
11. Generate an evidence pack, update traceability and decision logs, commit, push, and open/update a pull request.
12. Mark the work package `DONE`; evaluate the phase gate; continue to the next ready package.

## 4. Branch and worktree policy
- `main`: protected production history; unattended processes cannot merge.
- `develop`: staging integration; a package may be auto-merged only when every required check passes and no protected-path or gate condition applies.
- `wp/*`: implementation branches, one work package per branch.
- `review/*`: optional read-only council reproductions.
- Use worktrees for parallel packages; never run two writers in one working directory.
- Rebase/merge conflicts are resolved only after rerunning the full package gate.

## 5. Work-package contract
Every `WP-*.md` contains: purpose; controlling requirement IDs; owner agent; file ownership; dependencies; assumptions; acceptance criteria; test matrix; screenshot matrix; evidence list; rollback; prohibited actions; estimated risk; and phase gate impact.

Status state machine:
`BACKLOG -> READY -> PLANNING -> IMPLEMENTING -> VERIFYING -> COUNCIL_REVIEW -> REMEDIATION -> EVIDENCE_COMPLETE -> DONE`

Exceptional states:
- `BLOCKED_EXTERNAL`: credential, legal/provider, physical device, or Product Owner authority.
- `BLOCKED_TECHNICAL`: reproducible technical failure after the retry budget.
- `FAILED_SAFE`: branch preserved; no integration; incident/evidence created.
- `WAIVER_REQUIRED`: only a human-signed, time-bounded waiver can continue.

## 6. Phase roadmap
| Phase | Scope | Primary outputs | Exit gate |
|---|---|---|---|
| P0 Governance and bootstrap | Monorepo, tools, docs, skills, agents, hooks, CI skeleton | Clean builds, `PROJECT_SKILLS.md`, queue, rules, environment report | G-P0 Governance ready |
| P1 Foundation | React/Vite/Capacitor shell, Flask API, PostgreSQL fixtures, contracts package | Launchable PWA, health API, local DB, Storybook | G-P1 Foundation |
| P2 Orbital ingestion | CelesTrak OMM adapter, validation, identity, immutable storage, quarantine, package manifest | Deterministic ingest and last-known-good package | G-P2 Data lifecycle |
| P3 Orbital engine | satellite.js adapter, explicit frames/units, golden vectors, working-set scheduler, package activation | Verified look angles and diagnostics | **G0.5** orbital authority |
| P4 UX/design system | Tokens, typography, components, all screen/state specs, Storybook | Approved UI baselines and accessible components | G-P4 Design authority |
| P5 Manual product loop | Tonight, Manual Sky, candidates, object detail, catalog, notes/tags/watch | End-to-end non-camera curation loop | M1 manual core |
| P6 Camera Sky | Permissions, orientation abstraction, calibration, uncertainty, candidate overlay | Device/simulator evidence; safe fallback | M1 Camera conditional |
| P7 Passes and alerts | Local pass solver, watch recompute, notification rolling schedule | Cross-engine pass fixtures and E2E alert flow | M2 wedge |
| P8 Trust and education | Data Status, Learn, settings/privacy/a11y, optional sync scaffolding | Claims registry, operational states | M3 trust |
| P9 Hardening | Security, privacy, a11y, localization, performance, resilience | Release candidate evidence pack | Beta gate |
| P10 Staging beta | Railway staging, signed artifacts, pilot scripts, support/rollback | Production-candidate staging release | Human production decision |

## 7. Gate logic
A gate passes only when every mandatory check returns PASS and the evidence manifest contains hashes for all required artifacts. “Tests passed” without logs, screenshots, versions, inputs, and requirement mapping is not sufficient.

Automated gate results:
- `PASS`: continue automatically.
- `PASS_WITH_ADVISORY`: continue; advisory enters backlog.
- `BLOCK`: remediate automatically within retry budget.
- `EXTERNAL_BLOCK`: continue independent work; do not enter the blocked capability.
- `STOP_SHIP`: freeze integration and open a high-severity incident record.

## 8. Retry and escalation
- Test/transient infrastructure: three attempts with captured logs and exponential delay.
- Deterministic code failure: one diagnosis cycle, then targeted remediation cycles until the work-package budget is reached.
- Same failure signature three times: invoke debugger and red-team agents; if unresolved, mark `BLOCKED_TECHNICAL`.
- Provider 403/429: stop the ingest run immediately, back off, preserve last-known-good data, and create an operations blocker.
- Security/privacy/claims critical: no waiver by the autonomous system.

## 9. Autonomous permissions
Allowed: source edits, dependency installation, disposable database creation, local/staging migrations, fixture generation, test execution, browser automation, screenshots, documentation, commits, feature-branch pushes, PRs, staging deployment.

Denied: production deployment; main merge; production destructive migrations; secret disclosure; billing/purchase; accepting provider terms; disabling mandatory tests; rewriting protected CDR clauses; deleting evidence; bypassing branch protection.

## 10. State files
- `RUN_STATE.yaml`: current phase, package, branch, last result, next action, retry counts, current evidence path.
- `WORK_QUEUE.yaml`: dependency graph and package status.
- `DOCS/12_BLOCKERS.md`: active external/technical blocks and safe continuation.
- `DOCS/11_DECISION_LOG.md`: ADR/RFC links and material decisions.
- `artifacts/evidence/<phase>/<wp>/<run-id>/manifest.json`: immutable evidence index.

## 11. Definition of autonomous completion
The unattended program is complete when P0-P10 have produced a production-candidate staging build, all machine-verifiable gates pass, all external-only blocks are clearly listed, and the only remaining action is the deliberately human production approval and any mandatory external professional sign-off.
