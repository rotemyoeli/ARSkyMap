# ADR-0002 - Evolve the existing web/backend into the OrbitMark foundation (P1)
Status: Accepted
Date: 2026-06-20

## Context and evidence
The repo already has a working `web/` (Vite + React PWA), `backend/` (Flask + SQLAlchemy)
and a managed Railway Postgres serving 74 real catalogue objects, all deployed and green.
The master plan's P1 ideal is a fresh pnpm monorepo (`apps/`, `services/`, `packages/`).
A full greenfield restructure now would discard working, deployed code and risk breaking
the live staging deploy mid-flight, slowing the path to a visible MVP.

## Decision
For P1, **evolve the existing structure** into the OrbitMark foundation rather than
restructure: keep `web/` + `backend/` + Postgres, add the OrbitMark product layer
(`web/src/orbitmark/*`: design tokens, screens, on-device engine wiring), and treat the
M0 spike modules (`web/src/orbital/*`) as the engine substrate (P3). Defer the formal
pnpm-workspace split and Storybook to a later refactor when they add net value; record as
residual. This honours the G-P1 intent — launchable PWA + API + Postgres + live data —
while keeping every push deployable.

## Alternatives considered
1. Full greenfield monorepo now — rejected: high risk to the live deploy, large time cost,
   no user-visible benefit before MVP.
2. Parallel new app alongside the spike — rejected: duplicate deploys/confusion.

## Consequences
- Fast, continuous, always-deployable progress toward MVP.
- Residual (tracked): pnpm workspace split, Storybook component baselines, and the
  `packages/contracts` extraction are deferred (revisit in a hardening pass / P4).
- The on-device engine (satellite.js) is the P3 substrate; P2/P3 work formalises frames,
  units, identity and packages around it.

## Requirements/gates/tests affected
G-P1 (Foundation). Tests: `web` build passes; live deploy serves real overhead data.

## Rollback/change plan
Additive on `develop`; revert commits to roll back. No production/data change.

## Reviewers
Program Director (self, authorised by Product Owner for autonomous phase transitions).
