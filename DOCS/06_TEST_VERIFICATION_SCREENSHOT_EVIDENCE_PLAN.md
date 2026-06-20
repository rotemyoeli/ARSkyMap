# Test, Verification, Screenshot and Evidence Plan


## 1. Test pyramid and ownership
- **Static:** TypeScript/Python typing, lint, formatting, schema validation, dependency/secret scanning.
- **Unit:** orbital adapters, transforms, identity, validation, reducers, utilities, component logic.
- **Property/fixture:** time parsing, ranges, large IDs, malformed data, immutable/dedup behavior.
- **Contract:** OpenAPI/JSON Schema, package manifest, worker messages, database migrations.
- **Integration:** ingest-to-package, package activation/rollback, API/database, client cache/worker.
- **Component/browser:** Vitest Browser Mode and Storybook interaction/render tests.
- **E2E:** Playwright across Chromium, WebKit, and Firefox for web-critical flows.
- **Visual:** Playwright `toHaveScreenshot` plus Storybook component baselines.
- **Accessibility:** axe automation, ARIA snapshots, keyboard, text scale, contrast, manual screen-reader checklist.
- **Security/privacy:** SBOM, dependency audit, secret scan, SAST, data-flow assertions, auth/API abuse tests.
- **Performance/resilience:** worker/main-thread profiling, battery/device runs, network/offline/failure injection.
- **Physical device:** iPhone and Android sensor/camera/notification tests before Camera Sky/beta gates.

## 2. Evidence directory
`artifacts/evidence/<phase>/<work-package>/<run-id>/`

Required files:
- `manifest.json` with SHA-256 hashes.
- `environment.json` and dependency versions.
- `requirements.json` mapping tests to CDR IDs.
- test logs and machine-readable reports.
- coverage reports.
- screenshots, diffs, Playwright trace/video for failed or critical flows.
- accessibility report and manual checklist.
- security/privacy reports when applicable.
- performance profile when applicable.
- `COUNCIL_REVIEW.md`, findings JSON and final gate result.

## 3. Screenshot matrix
For each screen contract: default + every material error/degraded state, at 390x844 and 1280x800 minimum. Critical flows add 360x800, 430x932, 768x1024, 1440x900; 200% text; reduced motion; offline; dark/night theme; and localized pseudo-text. Platform-native permission/camera/notification screens are captured from simulators/physical devices and stored separately from browser baselines.

## 4. Determinism rules
- Freeze clock, observer location, package/element set, locale and random seed.
- Disable non-essential animation or wait for stable state.
- Use committed fonts or verified system stacks.
- Keep visual baselines platform-specific.
- Baseline updates require an approved visual-change record and council evidence; never auto-accept all diffs.

## 5. Numerical evidence
Golden vectors cover near-Earth, deep-space, high-eccentricity, stale, decayed, malformed, large-ID and clock-skew cases. Expected values come from an independent SGP4 implementation or authoritative fixtures. The implementation records frame, units, UTC instant, observer model, package/element key, library version and tolerance.

## 6. CI tiers
- PR fast gate: format, lint, type, unit, contracts, changed-component stories, claims scan.
- PR full gate: integration, all Storybook tests, Playwright critical flows, visual diffs, axe, security scans.
- Nightly: full browsers, resilience/failure matrix, full visual matrix, package ingest fixtures, performance trends.
- Pre-beta: clean environment build, staging E2E, migration/rollback rehearsal, device matrix, penetration/a11y external evidence placeholders.

## 7. Failure policy
A failing mandatory test blocks completion. Flaky tests are quarantined only with a defect ID, owner, expiry, and unaffected-gate proof. Screenshots cannot replace behavioral assertions; automated accessibility cannot replace manual assistive-technology checks; simulator evidence cannot replace required physical-device evidence.
