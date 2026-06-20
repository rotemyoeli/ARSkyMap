#!/usr/bin/env bash
set -euo pipefail
TIER="${1:-fast}"
FAIL=0
run(){ echo "> $*"; "$@" || FAIL=1; }
run python scripts/validate-docs.py
if [[ -f package.json ]] && command -v pnpm >/dev/null 2>&1; then
  run pnpm format:check; run pnpm lint; run pnpm typecheck; run pnpm test:unit
  if [[ "$TIER" != fast ]]; then run pnpm test:component; run pnpm test:e2e; fi
fi
if [[ -f pyproject.toml ]]; then run python -m pytest -q; fi
if [[ $FAIL -ne 0 ]]; then echo 'BLOCK'; exit 2; fi
echo 'PASS'
