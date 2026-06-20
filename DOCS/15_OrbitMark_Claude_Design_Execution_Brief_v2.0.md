# OrbitMark - Claude Design & Autonomous Development Execution Brief v2.0

**Authoritative source:** `DOCS/01_OrbitMark_Critical_Design_Review_CDR_v1.2.docx` (OM-CDR-001). The CDR, Appendix G, and Appendices H-J win if any conflict exists.

## Autonomous operating authority
All approved defaults are locked: greenfield monorepo; React/TypeScript/Vite PWA then Capacitor; Flask/PostgreSQL/Railway staging; WSL2/GitHub/PyCharm; autonomous edits/tests/commits/PRs/staging; no main merge/production/destructive data/billing/provider/legal acceptance; simulator-first with a blocked physical-device gate; complete Claude Design output bundle; safe continuation with fixtures and blockers.

Before product implementation, Claude must run `/orbitmark-bootstrap`, regenerate `DOCS/PROJECT_SKILLS.md`, validate agents/hooks/queue/state, and complete G-P0. Thereafter `/orbitmark-autopilot` executes one bounded work-package cycle. Every completion requires running-app verification, screenshots and an immutable evidence pack.

## Skills and Council
Use the project skills in `.claude/skills/` and specialist agents in `.claude/agents/`. `CLAUDE.md` carries concise facts; Skills carry procedures; subagents carry independent specialist review; command hooks and CI enforce deterministic safety. The implementing agent cannot approve its own work.

## Product contract
OrbitMark is an honest, model-based orbital-object companion centred on saving, annotating, watching and revisiting personal objects. Camera Sky is an optional camera background with orientation-based model overlays. It is **not** a camera detector. Manual Sky and semantic lists must complete every core task.

## Release-control change in v1.1
Appendix G is binding for every team that touches providers, object identity, orbital data, package delivery, Web Workers, sky projection, pass prediction, notifications, data-status UX, testing or operations.

**Gate G0.5 is mandatory before Camera Sky, pass alerts or public orbital-data refresh are production-capable.** Teams may prototype against fixtures before G0.5, but must not treat a prototype as an approved implementation.

## Non-negotiable product principles
1. Truth is visible: modelled position, element epoch, source/package age, calculation time, confidence and visibility uncertainty are primary UI.
2. Value before permission: no forced account, camera, motion, notifications or precise location.
3. Curation over spectacle: Save / Note / Tag / Watch / Passes is the main loop.
4. Candidate list, never false single-object certainty.
5. Manual Sky and Overhead lists are first-class and accessible.
6. One primary action per screen; plain verb-first copy.
7. No colour-only, drag-only, motion-only or canvas-only core interaction.
8. Precise location stays local by default and never enters analytics/share cards.
9. No unreviewed factual or educational claim.
10. No child accounts, public social feed or classroom roster in MVP.
11. No full-catalog propagation, IndexedDB reads or JSON parsing in the visual animation frame.
12. No generic `eci`, `x/y/z` or time values at orbital module boundaries: frame, units and UTC semantics must be explicit.

## Binding orbital-data contract

### Source precedence
- **Default MVP source:** CelesTrak GP in OMM-compatible JSON.
- **Secondary/history:** Space-Track GP / GP_History only after credentials, terms and legal review. Credentials remain server-side.
- **SupGP:** future, separate and explicitly labelled source lane; never silently mixed with GP.
- No scraping or unofficial mirror without a new source review and ADR.

### Object identity
- `object_key` is OrbitMark’s stable internal UUID.
- Provider catalog IDs are source identities, not the primary key for user data.
- Analyst range `80000–89999` and temporary/provisional launch identities are excluded from the public MVP package and from Save / Note / Tag / Watch unless a lineage-safe identity ADR is approved.
- User data references `object_key`, never a reusable analyst number.

### Ingestion state machine
Implement this exact lifecycle:

`LOCK -> FETCH -> HTTP POLICY -> PARSE -> SCHEMA VALIDATE -> NORMALIZE -> IDENTITY RESOLVE -> PROPAGATION SMOKE TEST -> DEDUP -> IMMUTABLE STORE -> PACKAGE BUILD -> PACKAGE VALIDATE -> ATOMIC PUBLISH -> OBSERVE`

Failure rules:
- `304`: finish as `no_change`.
- `403/429`: stop the run, back off and alert operations. Do not retry aggressively.
- Parse/schema/identity/propagation failure: quarantine the record or fail the candidate package according to the systemic-error rule.
- Any package-build or activation failure preserves the last-known-good package.

### Canonical OMM fields
At minimum preserve and normalize:
- `NORAD_CAT_ID`
- `EPOCH` as a strict UTC instant
- `MEAN_MOTION`
- `ECCENTRICITY`
- `INCLINATION`
- `RA_OF_ASC_NODE`
- `ARG_OF_PERICENTER`
- `MEAN_ANOMALY`
- `BSTAR`
- `MEAN_MOTION_DOT`
- `MEAN_MOTION_DDOT`
- `OBJECT_NAME` and `OBJECT_ID` when present
- source, fetch time, raw payload, canonical checksum and parser version

Do not silently guess units or timezone. Reject ambiguous timestamps.

### Immutable storage and package publication
Required stores/entities:
- `object_identities`
- `raw_source_records`
- `element_sets`
- `current_element_selection`
- `ingest_runs`
- `quarantine_records`
- `package_manifests`

Each element set is immutable. Deduplicate with a key equivalent to:

`source_namespace + source_record_id_if_available + catalog_id + epoch + canonical_checksum`

Package requirements:
- immutable version
- `format_version`
- `required_client_version`
- explicit `source_set`
- `generated_at`
- object/record counts
- epoch distribution
- checksum, compression and size
- optional delta base
- attribution reference

Write and verify the immutable package first. Move the current pointer atomically only after all checks pass.

### Client activation
1. Read the last-known-good package metadata from IndexedDB.
2. Parse/decompress in the orbital Web Worker.
3. Fetch manifest metadata in the background.
4. Stage the new package.
5. Verify checksum and compatibility.
6. Parse in the worker.
7. Activate only after worker acceptance.
8. Preserve the prior active package on every failure.

## Binding calculation pipeline

### Position pipeline
Use one adapter around `satellite.js`:

1. `satrec = json2satrec(normalized_omm)`
2. `state = propagate(satrec, utc_time)`
3. Adapter output names:
   - `position_teme_km`
   - `velocity_teme_km_s`
4. `gmst = gstime(utc_time)`
5. `object_ecf_km = eciToEcf(position_teme_km, gmst)` under the approved library adapter contract
6. Observer input:
   - longitude radians
   - latitude radians
   - height kilometres
7. `look = ecfToLookAngles(observer_gd, object_ecf_km)`
8. `look` returns azimuth, elevation and range; convert to UI degrees only at presentation boundaries.

Never turn a propagation error into zero coordinates or an empty successful result. Return a controlled `ORB-*` code.

### Time authority
- Propagation and pass windows use UTC instants.
- Local time is display formatting only.
- Check device time against a trusted HTTPS/API timestamp when online.
- Use a monotonic clock for animation intervals.
- Material skew produces a visible degraded state and prevents precise alert wording.

### Working-set scheduler
Use three priority bands:

- **A — immediate:** selected object, watched objects with imminent passes, current candidates, explicitly searched IDs.
- **B — visible context:** above/near-horizon and current viewport/overhead candidates.
- **C — background eligibility:** remaining publishable catalog, processed in staggered low-frequency batches.

Rules:
- Counts and cadences are configuration outputs from M0.5 profiling.
- Watched/selected objects are protected before background density.
- Interpolate between worker updates only inside the approved time limit.
- Use hysteresis to avoid rapid band promotion/demotion.
- Send bounded typed messages to the main thread.

### Candidate selection
- Use spherical angular separation, not flat pixel distance.
- Clamp cosine to `[-1, 1]` before `acos`.
- Candidate region = uncertainty region + touch-selection tolerance.
- Return every candidate in the angular region.
- Sort by angular separation, then explicit priority and stable tie-breaker.
- Do not silently choose the nearest candidate as certain.

### Pass solver
For each watched object:

`f(t) = elevation(t) - horizon_mask`

1. Starting coarse step: `clamp(period_seconds / 360, 10s, 120s)`; this is a project starting rule and must be benchmarked.
2. Detect sign changes for rise/set brackets.
3. Refine rise/set with bisection to the approved tolerance; initial fixture target is <=1 second internal bracket and <=2 seconds cross-engine event difference.
4. Find maximum elevation with a bounded derivative-free search such as golden-section search.
5. Attach element-set key, epoch, package, solver version, tolerance and degradation codes.
6. Keep geometric state, sunlight, brightness knowledge, observer darkness and freshness separate.
7. Recompute after package activation, app resume, watch change, significant location change and notification-permission change.
8. Do not guarantee OS notification delivery time.

## Controlled failure codes
Design and engineering must use specific recoverable states, not one generic error.

- `ING-HTTP-*`: provider transport/policy
- `ING-PARSE-*`: body/format parsing
- `ING-SCHEMA-*`: field/type/epoch/range
- `ID-*`: analyst, temporary or identity conflict
- `PKG-*`: count, checksum, compatibility, activation
- `ORB-*`: parse, decayed, non-finite, library error
- `TIME-*`: skew, ambiguous input, stale trusted time
- `PASS-*`: no bracket, no maximum, numeric failure
- `SENSOR-*`: denied, unavailable or low confidence

## Required data-engine UI states
Claude Design must explicitly design these states for the specified screens:

- **S-01 Launch:** cached manifest loading, worker activation, first load, incompatible package, activation failure and last-known-good fallback.
- **S-03 Tonight:** source/package age, element-age summary, observer/time state and honest empty state.
- **S-05/S-06 Sky:** modelled-for time, freshness, clock skew, orientation confidence, position unavailable and candidate-region state.
- **S-07 Candidates:** candidate count, angular ordering and identity-limited state.
- **S-08 Object Detail:** catalog ID/source, element epoch, package version, calculated-for time, geometric state, visibility dimensions and degradation reasons.
- **S-11/S-12 Passes:** source age, solver/recompute state, stale/skew suppression and notification caveat.
- **S-15 Data Status:** source lane, last successful ingest, active package, age distribution, cached fallback, provider delay, quarantine/systemic error and support export.
- **S-18 Error/Offline:** error-specific recovery that preserves Manual Sky/catalog value where possible.

A generic red banner is not an acceptable completion of these states.

## Visual thesis
A calm, trustworthy night field instrument. Deep navy surfaces, high-contrast text, orbital cyan primary action, amber caution and the uncertainty ring as the signature honesty motif. Avoid generic neon sci-fi, purple gradients, game HUDs, excessive glassmorphism and universal pill shapes.

## Tokens
```json
{
  "color": {
    "bg": {
      "canvas": "#07131F",
      "surface": "#0E2233",
      "panel": "#132C40"
    },
    "text": {
      "primary": "#F4F7FA",
      "secondary": "#A9BBC9"
    },
    "action": {
      "primary": "#43C6D9",
      "focus": "#74A7FF"
    },
    "status": {
      "warning": "#FFB454",
      "danger": "#FF6B6B",
      "success": "#53D49A"
    }
  },
  "space": {"1":4,"2":8,"3":12,"4":16,"6":24,"8":32},
  "radius": {"control":12,"panel":16,"sheet":20},
  "motion": {"fast":150,"standard":220},
  "target": {"minimum":44}
}
```

## Top-level navigation
- Tonight
- Sky (Camera / Manual)
- My Catalog
- Passes
- Learn
- Settings

## Core flow
Tonight -> Open Sky -> tap region -> candidate list -> object detail -> Save / Watch -> Passes -> alert deep link.

## Required screens
S-01 Launch; S-02 Onboarding; S-03 Tonight; S-04 Mode/permission primer; S-05 Camera Sky; S-06 Manual Sky; S-07 Candidate list; S-08 Object detail; S-09 Save/annotate; S-10 Catalog; S-11 Passes; S-12 Pass detail; S-13 Search/filters; S-14 Learn; S-15 Data status; S-16 Settings/privacy/accessibility; S-17 Optional sync; S-18 Error/empty/offline patterns.

## Required states for every applicable screen
Default, loading, empty, offline, permission denied, low confidence, aging/stale data, clock skew, package fallback, position unavailable, error, success, destructive confirmation, large text, reduced motion, VoiceOver/TalkBack and keyboard/focus.

## Approved object markers
- Active payload: circle / cyan
- Inactive payload: square / muted blue
- Rocket body: diamond / amber
- Debris: triangle / blue
- Watched: outer halo + accessible state
- Uncertainty: dashed ring

Meaning must never depend on colour alone.

## Required development sequence
1. Implement schemas, source adapter, identity rules and fixtures.
2. Implement immutable storage, quarantine, manifests and atomic package publication.
3. Implement client staging/checksum/last-known-good activation.
4. Implement the single frame/unit/time adapter around `satellite.js`.
5. Pass reference vectors and controlled failures.
6. Implement and profile working-set scheduling.
7. Implement pass solver and notification recomputation.
8. Design all Appendix G states.
9. Integrate Camera/Manual Sky and Passes.
10. Complete G0.5 evidence pack and approval.

## Required Claude workflow
1. List controlling requirement IDs, ADRs, Appendix G sections and screen contract.
2. State unresolved assumptions; do not invent scope, accuracy, freshness or performance thresholds.
3. Create low-fidelity structural alternatives when needed.
4. Build high fidelity with real OrbitMark copy/data and controlled error states.
5. Include all edge/accessibility states.
6. Run the design scorecard (minimum 85/100; no truth, accessibility, privacy or core-task critical defect).
7. Run claims, accessibility and Appendix G state gates.
8. Implement semantically and verify the running app with screenshots/device evidence.
9. Update `DESIGN.md`, schemas, worker message contracts, ADR traceability and test evidence.

## Prohibited product language
Do not use: “detect through the camera,” “scan debris,” “exact fragment,” “live surveillance,” “all debris,” “pinpoint accuracy,” “live location of the satellite,” or guaranteed visibility/notification timing.

Use: “modelled position,” “objects in this area,” “catalogued debris,” “may be visible,” “visibility unknown,” “elements updated … ago,” “calculated for …,” and “using cached data.”

## Master prompt
You are implementing OrbitMark under OM-CDR-001 v1.1. The CDR and Appendix G are controlling. OrbitMark is an honest, model-based orbital-object companion centred on saving, annotating, watching and revisiting personal objects. Camera Sky is optional and never described as camera detection. Manual Sky and semantic lists must complete every core task.

For the requested architecture, feature, screen or flow:
1. List the controlling FR/NFR/T/ADR IDs, Appendix G sections and screen contract.
2. State unresolved assumptions; do not invent scope, accuracy, freshness, source rights, device performance or numeric thresholds.
3. Preserve the source-precedence, object-key, analyst-exclusion, immutable-package, last-known-good, UTC, TEME/unit naming, working-set and pass-solver contracts.
4. Use the approved night-instrument visual thesis and token system. The uncertainty ring is the signature honesty motif. Avoid generic neon sci-fi, purple gradients, game HUDs and excessive pills.
5. Show real content, source/package/element age, calculated-for time, model wording, confidence, clock and visibility unknowns.
6. Specify default, loading, empty, offline, denied, stale, skewed, package-fallback, position-unavailable, error, success, large-text, reduced-motion and screen-reader behaviour.
7. Ensure one primary action, plain verb-first copy, visible focus, non-colour status, target size and non-drag alternatives.
8. Produce tests and evidence for provider errors, malformed records, analyst reuse, package rollback, numerical parity, working-set performance and pass timing.
9. Do not call the work complete until the claims, accessibility, privacy and Gate G0.5 obligations pass.


## Autonomous phase sequence
P0 governance -> P1 foundation -> P2 ingestion -> P3 orbital engine/G0.5 -> P4 design system -> P5 Manual Sky/catalog -> P6 Camera Sky -> P7 passes/notifications -> P8 trust/education/settings -> P9 hardening -> P10 staging beta.

At each phase Claude reads `DOCS/07_RELEASE_GATES_AND_DEFINITION_OF_DONE.md`. Only `/orbitmark-release-gate` may mark the phase passed. Production remains a human decision.

## Evidence and screenshots
Use `DOCS/06_TEST_VERIFICATION_SCREENSHOT_EVIDENCE_PLAN.md`. Every screen/state capture uses deterministic fixtures and a metadata sidecar. Playwright/Storybook visual baseline changes are reviewed, never blanket-accepted. Simulator evidence is not physical-device evidence.

## Unattended master instruction
Read `DOCS/START_HERE_PROMPT.md`, execute the current queue, and continue through every READY work package. When blocked, update `DOCS/12_BLOCKERS.md`, keep the affected gate closed, and continue unrelated packages. Do not ask the Product Owner routine implementation questions that are answered by the CDR, defaults, fixtures or safe conservative behavior.
