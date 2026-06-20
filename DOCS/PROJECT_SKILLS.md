# Project Skills Registry (Generated)

Generated from 15 on-disk project skills.

| Skill | Status | Description |
|---|---|---|
| `orbitmark-accessibility-gate` | ACTIVE | Evaluate OrbitMark critical tasks and UI states for WCAG 2.2/WCAG2ICT and platform accessibility, including non-camera parity. |
| `orbitmark-autopilot` | ACTIVE | Execute one bounded autonomous OrbitMark work-package cycle from queue selection through planning, implementation, verification, council review, evidence, PR and state update. |
| `orbitmark-bootstrap` | ACTIVE | Initialize or validate the OrbitMark repository, environment, autonomous controls, state, work queue, and generated skills registry. Use at first setup and after changing skills or repository structure. |
| `orbitmark-claims-gate` | ACTIVE | Scan OrbitMark UI, documentation, tests and marketing copy for prohibited or unsupported detection, accuracy, freshness, visibility, debris and notification claims. |
| `orbitmark-council-review` | ACTIVE | Run the appropriate independent OrbitMark council quorum and consolidate structured findings without allowing implementers to approve their own work. |
| `orbitmark-docs-sync` | ACTIVE | Synchronize OrbitMark requirements, ADRs, contracts, diagrams, APIs, screenshots and runbooks after implementation changes. |
| `orbitmark-frontend-implementation` | ACTIVE | Implement approved OrbitMark React/TypeScript UI contracts as semantic, responsive, accessible components with Storybook and browser tests. |
| `orbitmark-orbital-data` | ACTIVE | Implement or review OrbitMark orbital ingestion, identity, immutable packages, SGP4/SDP4 propagation, frames, look angles, working sets and pass calculations under Appendix G. |
| `orbitmark-plan-work-package` | ACTIVE | Create a controlled work-package plan binding requirements, files, tests, screenshots, risks, council roles, evidence and rollback before implementation. |
| `orbitmark-release-gate` | ACTIVE | Evaluate an OrbitMark work-package, phase or release gate strictly from required evidence and issue a machine-readable PASS/BLOCK/EXTERNAL_BLOCK/STOP_SHIP record. |
| `orbitmark-requirements-traceability` | ACTIVE | Maintain bidirectional traceability among CDR requirements, decisions, work packages, code, tests, screens, evidence and release gates. |
| `orbitmark-screenshot-matrix` | ACTIVE | Capture deterministic OrbitMark screen and component screenshots across required states, viewports, text scales and themes, and compare them to approved baselines. |
| `orbitmark-security-privacy-gate` | ACTIVE | Review OrbitMark code, architecture and evidence for secrets, dependency risk, auth/API abuse, local-first location, data minimization and release security. |
| `orbitmark-test-and-evidence` | ACTIVE | Run the required OrbitMark test layers and create an immutable, hashed evidence pack tied to requirements and a commit. |
| `orbitmark-ux-design-authority` | ACTIVE | Design OrbitMark screens, states, components and visual system for Claude Design while enforcing truth, curation, accessibility, Manual Sky parity and data-engine states. |

## Validation
- Source of truth: `.claude/skills/**/SKILL.md`.
- Regenerate after every skill change.
- CI fails on missing/duplicate skill names.
