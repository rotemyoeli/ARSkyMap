# Blockers


## Active blockers
| ID | Type | Capability | Safe continuation | Required authority/evidence | Status |
|---|---|---|---|---|---|
| BLK-001 | External | Physical iOS/Android Camera Sky validation | Use browser/simulators and keep device gate blocked | Named device matrix and physical evidence | OPEN |
| BLK-002 | External | Production deployment | Prepare staging release only | Product Owner + required external approvals | OPEN |
| BLK-003 | Technical/Ops | Legacy `.github/workflows/deploy.yml` auto-deploys both Railway services on push to `main`, and `ci.yml` has no `main` trigger, so a merge to `main` would deploy an unverified commit with no CI gate | P0/feature PRs target `develop` (deploy.yml fires only on `main`); main is human-merge-only. **MITIGATED 2026-06-20:** GitHub branch protection enabled on `main` (required status check `docs-and-guards`, required PR review, no force-push/deletion) — a merge to main now requires passing CI + review. | Residual: `enforce_admins=false` (admins can still bypass) and the two deploy paths still need reconciliation in WP-P1-001 (move deploy behind a protected GitHub environment, or add `main` to `ci.yml` as a blocking pre-deploy gate). Raised by planning council DRM-1/RT-1/DRM-2; independent RT-4. | MITIGATED |
