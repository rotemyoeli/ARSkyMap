#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p artifacts/evidence/P0/bootstrap DOCS/work-packages .worktrees
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="artifacts/evidence/P0/bootstrap/$RUN_ID"
mkdir -p "$OUT"
{
  echo "run_id=$RUN_ID"
  echo "pwd=$PWD"
  echo "os=$(uname -a)"
  command -v git >/dev/null && git --version || true
  command -v node >/dev/null && node --version || true
  command -v pnpm >/dev/null && pnpm --version || true
  command -v python >/dev/null && python --version || true
  command -v claude >/dev/null && claude --version || true
  command -v gh >/dev/null && gh --version | head -1 || true
  command -v docker >/dev/null && docker --version || true
  command -v railway >/dev/null && railway --version || true
} | tee "$OUT/environment.txt"
python scripts/validate-docs.py | tee "$OUT/validate-docs.txt"
python scripts/generate-skills-registry.py | tee "$OUT/generate-skills.txt"
python -m json.tool .claude/settings.json >/dev/null
bash scripts/guard-destructive-selftest.sh | tee "$OUT/guard-selftest.txt"
sha256sum "$OUT"/* > "$OUT/SHA256SUMS"
echo "Bootstrap evidence: $OUT"
