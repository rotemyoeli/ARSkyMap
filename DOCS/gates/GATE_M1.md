# Gate Record - M1 (Honest core) + wedge progress toward M2
Work packages: WP-P5-001 (manual loop) on the live engine; passes (P7) delivered.
Decision date 2026-06-20 · Branch develop · Live: https://web-production-1340.up.railway.app

## M1 required (DOCS/07): user can launch, see value, choose Manual path, get candidates, open detail, understand model/data state
| Criterion | Result | Evidence |
|---|---|---|
| Launch + see value, no account/sensor | PASS | App boots to Tonight; live overhead; bottom-tab nav; verified live bundle |
| Manual Sky path (sensor-free) | PASS | `ManualSky` region scan → candidate LIST (never single certainty); "Scan a direction" live |
| Candidates → object detail | PASS | `ObjectDetail` honest record (id/source/az/el/range, modelled-for UTC); "Honest record" live |
| Curation wedge: save/note/tag/watch | PASS | local-first `store.ts` (localStorage, object_key); persisted across reloads; "Save & annotate" live |
| Understand model/data state | PASS | data-truth strip (element age/source/calculated-for); visibility honestly "not yet computed" |
| Claims compliance | PASS | council scan: no detect/exact/pinpoint/all-debris/guaranteed; modelled/candidate/may-be-visible used |

## Supporting phases (substantively delivered; formal gate notes)
- **P2 (ingestion, G-P2):** backend ingests CelesTrak OMM/TLE into Postgres (74 objects, `flask ingest`); identity via NORAD id namespaced as object_key; analyst range excluded from catalogue. Residual: immutable package/manifest lifecycle + quarantine formalisation.
- **P3 (engine, G0.5):** satellite.js SGP4 ECI→ECF→look-angles, single explicit UTC instant, live on-device for the whole catalogue; passes next-pass solver (12 h, on-device). Residual: independent golden-vector cross-check + Web Worker offload (ADR-0002).
- **P4 (design system, G-P4):** night-field tokens (`tokens.css` from the handoff), marker grammar + uncertainty ring, components, claims language. Residual: Storybook baselines + full S-01..S-18 buildout.

## Council
Adversarial review (product/claims/a11y/orbital/QA): APPROVE_WITH_CONDITIONS → remediated.
Cleared MAJOR: form-input labels (M1-1), analyst-range identity-limited affordance (M1-2);
MINOR: remove-confirm (M1-3). Residual MINOR: package version + confidence fields in the
data-truth strip (M1-4) → deferred to P2 package lifecycle; ADVISORY pass-max refinement.

## Prohibited-action audit
No main merge, no production deploy, no secret committed, no provider/legal acceptance.
Deploys via `railway up` to the Railway staging web service.

## Decision: PASS (M1)
M1 honest core is live and verified. M2 wedge core (save/note/tag/watch + on-device passes
for watched objects) is delivered; **residual for full M2**: OS notification scheduling for
pass alerts + offline TLE cache. Authorises continuing to M2 notification lifecycle.
