#!/usr/bin/env bash
set -euo pipefail
# Fast deterministic post-edit checks only; full gates run through quality-gate.sh.
if [[ -f package.json ]] && command -v pnpm >/dev/null 2>&1; then pnpm -s format:check >/dev/null 2>&1 || true; fi
exit 0
