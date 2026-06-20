#!/usr/bin/env bash
set -euo pipefail
# Prevent “done” from being accepted when state claims verification but no evidence exists.
if [[ -f RUN_STATE.yaml ]] && grep -q 'status: EVIDENCE_COMPLETE\|status: DONE' RUN_STATE.yaml; then
  find artifacts/evidence -name manifest.json -type f | grep -q . || { echo 'Missing evidence manifest for completed state' >&2; exit 2; }
fi
exit 0
