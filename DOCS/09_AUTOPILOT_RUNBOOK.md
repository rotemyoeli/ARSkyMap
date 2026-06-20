# Claude Autopilot Runbook


## Start command
Run from the repository root:
```bash
bash scripts/claude-autopilot.sh
```
The script performs one bounded autonomous cycle by default. Set `ORBITMARK_MAX_CYCLES` for multiple cycles and `CLAUDE_MAX_BUDGET_USD` / `CLAUDE_MAX_TURNS` to bound cost and turns.

## Cycle prompt contract
Claude must:
1. Load `CLAUDE.md`, the current state/queue, CDR authority and current blockers.
2. Choose exactly one ready work package.
3. Never edit a package already owned by another active worktree.
4. Plan, council-review, implement, verify, capture evidence, remediate and update state.
5. End with a structured JSON status: `completed`, `blocked_external`, `blocked_technical`, `failed_safe`, or `no_ready_work`.
6. Never claim a gate passed unless `scripts/quality-gate.sh` produced a PASS record.

## Safe continuation when blocked
- Missing provider credentials: use committed fixtures; do not add credential-dependent public refresh.
- Missing physical device: complete simulator/browser work; mark Camera/device gate blocked.
- Missing legal/provider approval: implement interfaces behind disabled flags and fixtures; no production provider use.
- Missing product decision: choose no new scope; preserve the narrow MVP and record options.
- Failing external service: retain last-known-good, use mocks, and continue independent packages.

## Recovery
If interrupted, next cycle reads `RUN_STATE.yaml`, checks branch/worktree state, verifies the last evidence/commit, and either resumes the current package or marks it failed-safe. It never assumes conversational memory is the source of truth.

## Operator intervention points
Only: authentication, funding/billing, provider/legal acceptance, physical device availability, irreversible production/data actions, material scope change, or final production release.
