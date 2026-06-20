# Blockers


## Active blockers
| ID | Type | Capability | Safe continuation | Required authority/evidence | Status |
|---|---|---|---|---|---|
| BLK-001 | External | Physical iOS/Android Camera Sky validation | Use browser/simulators and keep device gate blocked | Named device matrix and physical evidence | OPEN |
| BLK-002 | External | Production deployment | Prepare staging release only | Product Owner + required external approvals | OPEN |
| BLK-003 | Technical/Ops | Legacy `.github/workflows/deploy.yml` auto-deploys both Railway services on push to `main`, and `ci.yml` has no `main` trigger, so a merge to `main` would deploy an unverified commit with no CI gate | P0/feature PRs target `develop` (deploy.yml fires only on `main`); main is human-merge-only; do not merge to `main` while deploy.yml is armed. Local guard hook + settings deny block Claude's own pushes to main, but cannot stop a GitHub-side merge | Enable GitHub branch protection on `main` (required `docs-and-guards` status check, required review) and reconcile the two deploy paths in WP-P1-001 (add `main` to CI as a pre-deploy gate or move deploy behind a protected environment). Raised by planning council DRM-1/RT-1/DRM-2 | OPEN |
