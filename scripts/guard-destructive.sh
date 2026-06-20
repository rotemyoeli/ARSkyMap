#!/usr/bin/env bash
set -euo pipefail
INPUT="$(cat || true)"
CMD="$(printf '%s' "$INPUT" | python -c 'import sys,json; d=json.load(sys.stdin); print((d.get("tool_input") or {}).get("command", ""))' 2>/dev/null || true)"
LOW="${CMD,,}"
BLOCK='(^|[;&|[:space:]])(sudo[[:space:]]|rm[[:space:]]+-rf[[:space:]]+/|git[[:space:]]+reset[[:space:]]+--hard|git[[:space:]]+clean[[:space:]]+-fd|railway[[:space:]]+delete|.*production.*|git[[:space:]]+push.*(main|master))'
if [[ "$LOW" =~ $BLOCK ]]; then
  echo "OrbitMark safety gate blocked destructive/protected command: $CMD" >&2
  exit 2
fi
exit 0
