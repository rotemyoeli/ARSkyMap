#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
command -v claude >/dev/null || { echo 'Claude Code CLI not found'; exit 2; }
CYCLES="${ORBITMARK_MAX_CYCLES:-1}"
TURNS="${CLAUDE_MAX_TURNS:-80}"
BUDGET="${CLAUDE_MAX_BUDGET_USD:-20}"
PROMPT=$(cat <<'EOF'
Execute exactly one `/orbitmark-autopilot` cycle under the controlled OrbitMark DOCS. Read repository state, choose one READY work package, plan with council, implement, verify the running app, capture screenshots/evidence, remediate findings, update state and open/update a feature-branch PR. Never merge main or deploy production. End with a concise structured status and next safe action.
EOF
)
for ((i=1;i<=CYCLES;i++)); do
  echo "=== OrbitMark autonomous cycle $i/$CYCLES ==="
  claude -p --permission-mode acceptEdits --max-turns "$TURNS" --max-budget-usd "$BUDGET" --output-format stream-json --verbose "$PROMPT" | tee "artifacts/autopilot-cycle-${i}.jsonl"
  grep -q 'status: READY\|status: PLANNING\|status: IMPLEMENTING\|status: VERIFYING\|status: COUNCIL_REVIEW\|status: REMEDIATION' RUN_STATE.yaml || break
done
