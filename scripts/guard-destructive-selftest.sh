#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
block(){ local c="$1"; if printf '{"tool_input":{"command":"%s"}}' "$c" | bash "$ROOT/scripts/guard-destructive.sh" >/dev/null 2>&1; then echo "FAIL allowed: $c"; exit 2; else echo "PASS blocked: $c"; fi; }
allow(){ local c="$1"; if printf '{"tool_input":{"command":"%s"}}' "$c" | bash "$ROOT/scripts/guard-destructive.sh" >/dev/null 2>&1; then echo "PASS allowed: $c"; else echo "FAIL blocked: $c"; exit 2; fi; }
block 'git push origin main'
block 'rm -rf /'
block 'railway delete service'
allow 'git status'
allow 'pnpm test'
