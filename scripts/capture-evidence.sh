#!/usr/bin/env bash
set -euo pipefail
PHASE="${1:?phase}"; WP="${2:?work-package}"; RUN_ID="${3:-$(date -u +%Y%m%dT%H%M%SZ)}"
OUT="artifacts/evidence/$PHASE/$WP/$RUN_ID"; mkdir -p "$OUT"
git rev-parse HEAD > "$OUT/commit.txt" 2>/dev/null || echo UNCOMMITTED > "$OUT/commit.txt"
python --version > "$OUT/python-version.txt" 2>&1 || true
node --version > "$OUT/node-version.txt" 2>&1 || true
bash scripts/quality-gate.sh full | tee "$OUT/quality-gate.txt"
find "$OUT" -type f ! -name SHA256SUMS -print0 | sort -z | xargs -0 sha256sum > "$OUT/SHA256SUMS"
echo "$OUT"
