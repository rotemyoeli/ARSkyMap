# Claude Skills Strategy and Registry


## 1. Strategy
Use `CLAUDE.md` for concise, always-loaded project facts and boundaries; use project Skills for repeatable procedures; use custom subagents for isolated specialist review; use deterministic command hooks and CI for enforcement. This split prevents a giant instruction file, keeps specialist context focused, and makes gates reproducible.

## 2. Official platform model adopted
- Project skills live in `.claude/skills/<skill-name>/SKILL.md` and load when relevant or by explicit invocation.
- Project subagents live in `.claude/agents/`; each has a focused prompt, tool set, permissions, and optional preloaded skills.
- Shared project settings and hooks live in `.claude/settings.json`.
- `CLAUDE.md` remains under 200 lines and points to controlled documents instead of duplicating procedures.
- Production controls use command hooks and CI. Model-based/agent hooks are advisory because agent hooks are experimental.
- Built-in `/run`, `/verify`, `/run-skill-generator`, `/debug`, `/code-review`, `/batch`, and `/loop` are used where available. Minimum Claude Code version for the run/verify workflow is 2.1.145; the bootstrap script checks the installed version and records it.

## 3. Mandatory generated file: `DOCS/PROJECT_SKILLS.md`
At bootstrap and after any skill change, Claude must execute `/orbitmark-bootstrap` and regenerate `DOCS/PROJECT_SKILLS.md`. The file is a human-readable registry generated from `.claude/skills/**/SKILL.md` and must contain:
- skill name, purpose, trigger phrases, owner agent, tools, input/output contract;
- controlling CDR clauses and requirements;
- preconditions, prohibited operations, evidence produced, downstream gates;
- dependencies on other skills and bundled skills;
- evaluation fixtures and last evaluation result;
- status: `ACTIVE`, `EXPERIMENTAL`, `DEPRECATED`, or `BLOCKED`.

The registry is checked in CI. A skill directory without a registry entry, or a registry entry without a skill, fails the documentation gate.

## 4. Project skill portfolio
| Skill | Role | Required output |
|---|---|---|
| `orbitmark-bootstrap` | Inspect environment, scaffold/validate repo, generate skills registry, initialize queue/state | Environment report, `PROJECT_SKILLS.md`, validated state |
| `orbitmark-autopilot` | Run one safe autonomous control-loop iteration | Updated state, branch/PR/evidence or blocker |
| `orbitmark-plan-work-package` | Bind scope to requirements, tests, files and evidence | `WP-*.md` approved by planning quorum |
| `orbitmark-requirements-traceability` | Maintain bidirectional requirement-code-test-screen-evidence links | Traceability CSV/MD with no orphan P0 item |
| `orbitmark-orbital-data` | Implement/review Appendix G ingestion, identity, package and propagation contracts | Code, fixtures, numeric evidence, typed failures |
| `orbitmark-ux-design-authority` | Produce screen/state/component contracts and high-fidelity direction | Design spec, tokens, Storybook, assets |
| `orbitmark-frontend-implementation` | Implement semantic accessible React UI from approved contracts | Components, stories, tests, screenshots |
| `orbitmark-test-and-evidence` | Execute layered verification and build immutable evidence manifests | Logs, reports, traces, screenshots, hashes |
| `orbitmark-screenshot-matrix` | Capture named viewport/state/theme/text-scale baselines | PNGs, metadata JSON, visual-diff report |
| `orbitmark-accessibility-gate` | Automated and manual accessibility review | Axe/ARIA/keyboard/screen-reader checklist |
| `orbitmark-security-privacy-gate` | Threat/data-flow/dependency/secret/auth review | Findings, SBOM, scans, privacy evidence |
| `orbitmark-claims-gate` | Detect prohibited or unsupported product/education claims | Claims report; merge-blocking failures |
| `orbitmark-council-review` | Run specialist review quorum and consolidate findings | Signed council record with severity/owners |
| `orbitmark-release-gate` | Evaluate phase/release criteria from evidence only | Machine-readable gate result and narrative |
| `orbitmark-docs-sync` | Keep CDR references, ADRs, API docs, diagrams and runbooks synchronized | Doc diff and integrity report |

## 5. Skill authoring standard
Every skill must:
1. Have a narrow, action-oriented name and description that identifies when Claude should use it.
2. Declare authority and conflicts; never restate the entire CDR.
3. Define inputs, outputs, preconditions, step sequence, failure handling, and completion criteria.
4. Use scripts for deterministic operations rather than asking the model to “remember” a check.
5. Produce durable files rather than only conversational conclusions.
6. Include at least one positive fixture, one edge fixture, and one prohibited-action fixture.
7. Be evaluated after material edits. Evaluation results are stored under `.claude/skills/<name>/evals/`.
8. Never grant itself production authority.

## 6. Selection and invocation policy
- The coordinator explicitly invokes critical gate skills; automatic discovery is supplementary.
- Domain skills are preloaded into their matching council agents.
- A work-package plan lists required skills before implementation begins.
- `orbitmark-test-and-evidence`, `orbitmark-claims-gate`, and applicable a11y/security skills run before council review.
- `orbitmark-release-gate` is the only skill allowed to change a phase status to passed.

## 7. External/community skills
The official Anthropic `frontend-design` skill may be installed as an advisory creative input. Community skills are quarantined until source, license, prompt-injection risk, tool permissions, and evaluation results are reviewed. No third-party skill can override the CDR, hooks, permissions, or gate logic.

## 8. Skill change control
Changes require: reason; affected gates; evaluation delta; reviewer; and registry refresh. A skill that unexpectedly triggers, modifies protected files, weakens tests, or requests unsafe tools is disabled and marked `BLOCKED` until reviewed.
