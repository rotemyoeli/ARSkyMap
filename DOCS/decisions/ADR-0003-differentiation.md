# ADR-0003 - Differentiation strategy from competitive/technical research
Status: Accepted
Date: 2026-06-20

## Context and evidence
Four fact-based research passes (`DOCS/research/COMPETITIVE_AND_TECH_RESEARCH.md`) found clear
white-space: no consumer app offers curation; debris is analyst-only; honesty about SGP4 error is
rare; magnitude/visibility and Starlink-trains are in demand; accessibility/privacy are undocumented
across the field; permissive OSS (satellite.js, Skyfield/python-sgp4, Orekit, Cesium/globe libs) is
reusable while the best consumer-adjacent tools (KeepTrack, ootk-full, SatNOGS) are AGPL.

## Decision
Anchor OrbitMark's uniqueness on five evidence-backed pillars and weave them into the existing
roadmap rather than adding a separate track:
1. **Honest age-aware uncertainty** (D1) — the uncertainty ring grows with TLE age, elongated
   along-track, graded opacity, labelled confidence; TLE epoch surfaced. Signature motif → enhances M1/M2.
2. **Curation wedge** (D2) — keep as the product core; deepen (collections, tonight's picks).
3. **Visibility & magnitude honesty** (D4/D6) — 3-gate "may be visible" model + freshness/confidence +
   inactive-clutter filter → P3 engine + M1.
4. **Debris & sustainability lens** (D3) — debris filters + IAU brightness context + reviewed Learn → P2/P8.
5. **Verified accuracy** (D9) — server-side Skyfield/python-sgp4 golden-vector cross-check of satellite.js
   in CI → closes G0.5 residual and grounds accuracy claims.
Plus standing guardrails: local-first privacy/no-ads/no-forced-account (D8); Manual Sky first-class,
AR assistive only (D7). Use only MIT/Apache OSS; treat AGPL projects as references.

## Alternatives considered
- Chase feature parity (more satellites/AR polish) — rejected: crowded, not differentiated.
- Build a 3D globe first — deferred: visually impressive but not the wedge; optional companion (Cesium/globe.gl).

## Consequences
- New backlog items D1, D3, D4, D5, D6, D9 enter `WORK_QUEUE.yaml`, slotted into M2/P2/P3/P8.
- **Compliance action (new, BLK-004):** confirm CelesTrak usage policy + attribution + server-side cache +
  rate limiting before scaling ingest (Kelso warns against over-polling; formal terms undocumented on reviewed pages).
- Honesty risk controlled by guardrails: brightness/visibility always "modelled/may be visible";
  uncertainty never implies object size or meter precision.

## Requirements/gates/tests affected
M1/M2 (uncertainty + visibility + freshness), G0.5 (golden vectors), P2 (debris/Starlink groups, CelesTrak
compliance), P8 (Learn/sustainability). Tests: golden-vector cross-check; claims-gate on new copy.

## Rollback/change plan
Additive on develop; each item is its own work package, reversible. No production/data change.

## Reviewers
Program Director (self, authorised). Research evidence: DOCS/research/COMPETITIVE_AND_TECH_RESEARCH.md.
