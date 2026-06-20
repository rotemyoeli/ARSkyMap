# Release Gates and Definition of Done


## Universal work-package Definition of Done
- Scope and controlling requirements are listed and unchanged.
- Code is formatted, typed, reviewed and free of prohibited shortcuts.
- Required unit/contract/integration/component/E2E tests pass.
- Running-app verification and screenshot matrix are complete.
- Applicable a11y, security/privacy, claims, performance and failure-injection gates pass.
- Documentation, diagrams, API/schema, ADRs and traceability are updated.
- Evidence manifest hashes every artifact.
- Council quorum has no unresolved STOP/CRITICAL/MAJOR finding.
- Rollback is documented and tested where state/data changed.

## Gate G-P0 - Governance ready
Pass when: repo structure exists; settings/permissions/hooks validate; all mandatory skills/agents exist; `PROJECT_SKILLS.md` matches disk; queue/state parse; CI skeleton runs; destructive-command test is blocked.

## Gate G-P1 - Foundation
Pass when: PWA and API launch from a clean environment; Storybook runs; local PostgreSQL fixtures/migrations work; health/diagnostics work; CI artifacts are uploaded; no forced permission/account flow.

## Gate G-P2 - Data lifecycle
Pass when: conditional fetch, OMM parse/normalize, identity rules, quarantine, immutable history, dedup, manifest/checksum, atomic publication and rollback pass positive/negative fixtures.

## Gate G0.5 - Orbital authority
Pass when: source/provider policy evidence, stable identity, package lifecycle, client rollback, independent SGP4 vectors, explicit frames/units, working-set profiling, pass solver parity, clock-skew behavior, observability and Appendix G UI states all pass. Until then Camera Sky, public refresh and pass alerts are prototype-only.

## Gate G-P4 - Design authority
Pass when: S-01 to S-18 contracts and required states exist; tokens/components/story coverage are complete; score >=85; visual, keyboard, text-scale, axe and claims gates pass; Manual Sky path is equivalent.

## Gate M1 - Honest core
Pass when: user can launch, see value, choose Manual or Camera path, receive candidates, open detail, and understand model/data state; Camera conditional evidence is separated from Manual core evidence.

## Gate M2 - Curation wedge
Pass when: save/note/tag/watch/pass/alert deep-link loop works offline/local-first; five-user usability criterion remains an external/human evidence item if no participants are available.

## Gate M3 - Trust and depth
Pass when: Data Status, education claims, settings/privacy/a11y, diagnostics, optional sync boundaries and operational failure states are complete.

## Beta gate
Pass when: clean build, staging deployment, migration and rollback rehearsal, supported browser/device matrix, performance, privacy/security, accessibility, provider terms, claims, support and incident runbooks are complete. External sign-offs are attached or explicitly block release.

## Production decision
Never autonomous. Requires Product Owner and applicable external approvals. The system prepares a signed recommendation and exact residual risk list but does not merge/deploy production.
