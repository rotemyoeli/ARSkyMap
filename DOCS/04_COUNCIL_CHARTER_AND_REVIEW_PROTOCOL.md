# Council Charter and Review Protocol


## 1. Purpose
The Council is a structured adversarial quality system, implemented primarily with isolated Claude Code subagents. It is not represented as external professional certification. Its job is to expose contradictions and stop weak work before integration.

## 2. Roles
| Agent | Mandate | Typical stop conditions |
|---|---|---|
| Program Director | Coordinates queue, dependencies, evidence and decisions | Missing authority, circular dependency, incomplete evidence |
| Product Strategy Reviewer | Protects annotation/curation wedge and MVP boundary | Viewer-only drift, unsupported scope, no measurable user value |
| Orbital Dynamics Reviewer | Reviews OMM, SGP4, frames, time, pass algorithms and fixtures | Wrong frame/unit/time, no independent vector, false precision |
| Data Platform Architect | Reviews ingestion, identity, immutability, packages and rollback | Overwrite history, unstable identity, non-atomic publication |
| Mobile/AR Architect | Reviews Capacitor, sensors, permissions, camera projection and performance | Sensor-only critical task, main-thread full catalog work |
| UX Design Director | Reviews information architecture, hierarchy, state completeness and visual quality | Generic design, hidden uncertainty, missing edge states |
| Accessibility Auditor | Reviews WCAG2ICT/platform semantics and non-camera parity | Critical task inaccessible, color/motion/drag dependence |
| Security & Privacy Reviewer | Reviews threat model, secrets, data flows and local-first location | Secret exposure, unnecessary precise-location transfer |
| QA & Reliability Lead | Reviews test strategy, failure injection, screenshots and reproducibility | No negative tests, non-reproducible evidence, flaky gate |
| DevOps & Release Manager | Reviews CI, environments, migrations, rollback, observability | Production-risk path, no rollback, unversioned artifact |
| Commercial Reality Reviewer | Reviews cost/complexity and business-plan consistency | Cost before evidence, feature not tied to wedge/gate |
| Red-Team Adversary | Attempts to falsify completion and product claims | Any unhandled critical failure or claim contradiction |

## 3. Quorums
- **Planning quorum:** Program Director + owning domain agent + QA + one adversarial agent.
- **Design quorum:** UX + Accessibility + Claims/Product + Frontend/Mobile.
- **G0.5 quorum:** Orbital + Data Platform + QA + Security/Privacy + Program Director.
- **Phase gate quorum:** Program Director + QA + impacted specialist agents + Red Team.
- **Beta quorum:** all roles. External legal, security, accessibility, provider-terms, and physical-device reviews remain separate gate inputs.

## 4. Review mechanics
Each reviewer receives the work-package contract, diff, evidence manifest, controlling requirements, and only the files needed. Reviewers return structured findings:
`finding_id`, `severity`, `requirement`, `evidence`, `risk`, `required_action`, `owner`, `verification`, `status`.

Severities:
- `STOP`: unsafe, false claim, requirement/gate violation, data loss, privacy/security critical, or invalid numerics.
- `CRITICAL`: release-blocking functional/a11y/reliability defect.
- `MAJOR`: substantial weakness; must be fixed before package completion.
- `MINOR`: can enter backlog only with no gate impact.
- `ADVISORY`: improvement suggestion.

## 5. Independence
The primary implementation agent cannot approve its own work. Review agents are read-only by default. Remediation is performed by the implementation agent and re-reviewed against the original finding.

## 6. Consolidation
The Program Director deduplicates findings without reducing severity, records disagreements, and applies the most conservative decision when evidence is incomplete. A disputed STOP finding remains STOP until a reproducible counter-evidence package is produced.

## 7. Automated council record
Every completed work package creates `COUNCIL_REVIEW.md` and `council-findings.json`, including agent names/models, input commit, evidence hashes, findings, remediations, rerun results, and final quorum verdict.

## 8. Experimental orchestration boundary
Named subagents are the default. Background sessions/worktrees may parallelize independent work. Agent teams or model-based agent hooks may be piloted only as `EXPERIMENTAL`; they cannot be the sole release control. Deterministic command hooks and CI remain authoritative.
