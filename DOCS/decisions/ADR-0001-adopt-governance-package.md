# ADR-0001 - Adopt the OrbitMark autonomous governance package as the controlling delivery layer
Status: Accepted
Date: 2026-06-20

## Context and evidence
The repository received the OrbitMark Autonomous Development Package v2.0: controlled
`DOCS/` (CDR v1.2 + plan/skills/council/UX/test/gate documents), `CLAUDE.md`, `.claude/`
(15 skills, 12 council agents, rules, settings + hooks), `scripts/` (bootstrap, gates,
guards, evidence), `.github/workflows/` (CI + safe work-package dispatch), and state/queue
files. `scripts/bootstrap_project.sh` ran clean (env report; `validate-docs.py` PASS;
registry generated 15=15; guard self-test blocked protected commands). The pre-existing M0
spike (`backend/`, `web/`, `deploy.yml`) remains on `main`.

## Decision
Adopt the package as delivered, unmodified in substance, as the authority and operating
system for OrbitMark. Commit the governance layer on feature branch
`wp/p0-001-governance-bootstrap` and gate it through G-P0. The legacy M0 spike is retained
(not deleted) and will be superseded by the greenfield monorepo in WP-P1-001, not by
in-place mutation.

## Alternatives considered
1. Rewrite/trim the package before adoption — rejected: no evidence of defects; the
   skills-strategy change-control process governs future edits.
2. Delete the M0 spike now — rejected: out of P0 scope, not authorized to destroy, and
   risks losing the working Railway reference until P1 supersedes it.
3. Operate without committing (validate only) — rejected: "a conversational statement is
   not evidence"; the governance layer must be version-controlled to be authoritative.

## Consequences
- All later phases run under enforceable gates, council review, and evidence requirements.
- `pnpm` must be installed before WP-P1-001 (recorded open item).
- Two deploy paths transiently coexist (legacy `deploy.yml`; future monorepo CI); P1
  reconciles them.

## Requirements/gates/tests affected
GOV-P0-1..7; Gate G-P0. Tests: `validate-docs.py`, `generate-skills-registry.py` diff,
`guard-destructive-selftest.sh`, `quality-gate.sh fast`.

## Rollback/change plan
Additive, branch-scoped; rollback = delete the feature branch. Future changes follow
`DOCS/03 §8` skill change-control and the ADR process.

## Reviewers
Planning quorum: Program Director, DevOps & Release Manager, QA & Reliability Lead,
Red-Team Adversary (see COUNCIL_REVIEW for WP-P0-001).
