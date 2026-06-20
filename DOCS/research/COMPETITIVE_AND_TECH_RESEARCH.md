# OrbitMark — Competitive & Technical Research (fact-based)
Date: 2026-06-20 · Method: four parallel web-research passes (competitors, academic literature,
professional communities, GitHub/OSS), verifiable sources only, fact vs inference separated.

> This is an evidence base for differentiation. Every claim links to a source; where evidence is
> thin or secondary it is flagged. Synthesis/decisions live in `DOCS/decisions/ADR-0003-differentiation.md`.

## 1. Competitive landscape — key facts
- **No consumer app offers personal curation** (notes / tags / watchlists / annotations) as a
  first-class feature. Verified absent across Heavens-Above, ISS Detector, Star Walk/Sky Tonight,
  SkyView, Stellarium Mobile, Orbitrack, n2yo, See A Satellite Tonight. → **OrbitMark's wedge is genuine whitespace.**
- **Orbital-debris is near-absent in consumer apps.** Only KeepTrack.space, LeoLabs, Privateer
  Wayfinder engage debris seriously — all web/analyst-leaning, none consumer/curation. Consumer
  apps cap at thousands of *active* objects (Orbitrack ~4k) vs 60k+ catalogued.
- **Honesty about accuracy is rare.** Apps named "Detector"/"Tracker" predict from TLEs via SGP4 and
  mostly never disclose error growth. Only **See A Satellite Tonight** caps predictions (5 days),
  explains error growth, and keeps geolocation client-side.
- **Opaque data lineage** at Vito (Star Walk/Sky Tonight/Sat Tracker) and SkyView; transparent at
  ISS Detector (Space-Track), Orbitrack (n2yo+CelesTrak), See A Satellite Tonight (Space-Track+CelesTrak).
- **Aggressive paywalls erode trust** (Sky Tonight blurs content past 3 items; Sat Tracker gates core
  value behind subscription; a paid tier reportedly delivered "only 15 satellites").
- **Accessibility undocumented across the entire field.** Offline/local-first rare (only Heavens-Above
  local calc, Stellarium offline pack). Privacy/location handling mostly silent.
- Note: **Flightradar24 does NOT track satellites as objects** (its "satellite ADS-B" = receivers for aircraft) — excluded as non-competitor.

## 2. Academic literature — key facts
- **SGP4 error grows with TLE age, along-track-dominated.** Primary 2026 empirical study on 24,641
  Starlink TLE pairs (arXiv:2605.19850): position error ~ Δt^k (k∈[1,2]), **≈1 km at 6 h → ≈38 km at 7 days**;
  SGP4 beat high-fidelity propagation on 65–75% of cases (limiting factor is TLE data quality, not the
  propagator). Classic figures (corroborated, primary PDFs unreadable in-session): ~1 km at epoch in LEO,
  ~2–3 km/day growth, in-track dominant (Oltrogge & Vallado AMOS 2014; Levit & Marshall 2011).
- **Uncertainty visualization:** non-experts read hard "cone/ring" boundaries deterministically (false
  security outside, exaggerated inside — Ruginski 2016; Cox 2013). **Graded/continuous** encodings improve
  honest trust; the standard covariance encoding is an **error ellipse** (eigenvector-aligned), labelled with
  its confidence level.
- **AR / sky-ID sensor limits:** phone magnetometer azimuth error commonly **~10°, up to 25–55°** with
  interference/handling; practical pointing ~1–2°. → **Manual (no-sensor) mode is evidence-justified**;
  AR must be assistive (tolerance reticle), never authoritative pinpointing.
- **Visibility model (standard 3 gates):** satellite sunlit AND observer in darkness AND predicted
  magnitude ≤ sky limit (~6.5 naked-eye). Brightness from BRDF/flat-panel models; Earthshine matters in
  twilight (Fankhauser 2023 arXiv:2305.11123; Mallama 2020). Brightness is *modelled*, with its own uncertainty.
- **Public engagement:** citizen science is real (SatNOGS, open CC-BY-SA observations). Transparency framed
  as a sustainability lever; IAU "dark & quiet sky" advocacy (mag-7 research / mag-6 aesthetic limits, "never
  visible to unaided eye"). **Evidence gap:** no controlled study of a consumer debris app changing public awareness.

## 3. Professional communities — key facts
- **Top needs:** fresh near-term pass times (TLEs good ~10–30 s for 24–48 h, degrade past 3–5 days);
  **magnitude/brightness filtering** (the most-praised Heavens-Above feature); **Starlink-train** passes
  (FindStarlink exists for this); reliable well-timed alerts; offline/no-account/privacy/ad-free; flare &
  unknown-object ID & re-entry (serious observers, SeeSat-L).
- **Top frustrations:** ads/paywalls; pay-to-test friction; **stale/inactive-satellite clutter**
  ("feed is riddled with inactive satellites that should be purged"); pass times drifting when data not
  refreshed; crashes/server errors; dark-theme locator visibility nits.
- **Underserved:** honesty about modelled-vs-real + data age (CelesTrak gives no error bounds);
  debris/sustainability + per-object brightness with IAU context; classified/"working-set" tracking.

## 4. GitHub / OSS landscape — key facts
- **Permissive, reusable now (MIT/Apache):** `satellite.js` (MIT, our core), `ootk-core` (MIT, typed
  upgrade), `Skyfield` + `python-sgp4` (MIT, server-side accuracy cross-check), `Orekit` (Apache, rigorous
  frames + **covariance/uncertainty** if needed), `CesiumJS` + `react-globe.gl`/`r3f-globe` (MIT/Apache,
  optional 3D globe), reference wirings `satvis` & `dsuarezv/satellite-tracker` (MIT).
- **Avoid for reuse (copyleft):** `KeepTrack.space`, full `ootk`, `SatNOGS`, `gpredict`, `Stellarium` — all
  GPL/AGPL; excellent references only (network-copyleft risk for a hosted PWA).
- **OSS whitespace OrbitMark can own:** honest uncertainty/TLE-freshness display; curation/annotation;
  consumer debris/sustainability narrative; accessible non-3D Manual Sky; local-first privacy PWA.
- **Compliance flag:** CelesTrak data is free but bandwidth-limited and its formal license/rate terms were
  not documented on reviewed pages — cache server-side, respect Kelso's "don't over-poll" guidance, confirm
  usage policy and attribution before scaling ingest.

## 5. Synthesis — differentiation white-space (evidence-grounded)
| # | Opportunity | Evidence | Honesty/privacy guardrail |
|---|---|---|---|
| D1 | **Age-aware uncertainty** halo that grows with TLE age, elongated along-track, graded opacity, labelled confidence; TLE epoch/age surfaced | arXiv:2605.19850; Oltrogge/Vallado; Ruginski 2016 (graded > hard ring) | Never imply object size or meter precision; "~likely region" |
| D2 | **Curation wedge** (notes/tags/collections/watch) as the product core | Absent across all competitors | — |
| D3 | **Debris & sustainability lens** (debris filters, IAU brightness context, Learn) | KeepTrack/LeoLabs/Privateer only (non-consumer); IAU CPS | Cite sources; no unreviewed claims; no "all debris" |
| D4 | **Visibility + magnitude** ("may be visible" via 3-gate model + brightness) | Fankhauser 2023; Mallama; #1 demanded feature | "modelled, may be visible"; never guaranteed |
| D5 | **Starlink-train** detection & group passes | Strong mainstream demand; FindStarlink | Times modelled |
| D6 | **Data-freshness transparency** + purge/flag inactive clutter | CelesTrak gives no error bounds; clutter complaint | Show "updated X ago" + confidence |
| D7 | **Accessible Manual Sky** + AR-as-assistive | magnetometer 10–55° error | No camera/sensor-only core task |
| D8 | **Local-first privacy, no ads, no forced account** (stated promise) | Only See-A-Satellite keeps geo client-side | Keep precise location on device |
| D9 | **Independent golden-vector cross-check** (server-side Skyfield/python-sgp4 vs satellite.js in CI) | python-sgp4/Skyfield (MIT) | Grounds accuracy claims; closes G0.5 residual |

## Recommended prioritized backlog
**Quick wins (high value / low effort, evidence-strong):** D1 (uncertainty halo + TLE age), D6
(freshness + inactive filter), D8 (privacy/honesty promise surfaced), D4-lite ("may be visible" sunlit gate).
**Larger bets:** D4-full (magnitude/brightness model + pass brightness), D9 (golden-vector CI cross-check —
also closes G0.5), D3 (debris/sustainability + Learn), D5 (Starlink trains), optional 3D globe (D-companion).
**Compliance:** CelesTrak usage policy + attribution + server-side cache + rate-limit (do before scaling ingest).

## Sources (selected; full lists in agent transcripts)
Competitors: heavens-above.com; issdetector.com; vitotechnology.com; terminaleleven.com/skyview;
stellarium-labs.com; southernstars.com; n2yo.com; james.darpinian.com/satellites; keeptrack.space;
celestrak.org; platform.leolabs.space; cesium.com/blog (Wayfinder). 
Academic: arXiv:2605.19850; amostech.com/.../OLTROGGE.pdf; arXiv:1002.2277; mdpi.com/1424-8220/22/8/2902;
arXiv:2305.11123; arXiv:2003.07805; arXiv:2109.04328; Ruginski 2016 (space.ucmerced.edu); cps.iau.org.
Community: celestrak.org/NORAD/documentation/gp-data-formats.php; satobs.org (SeeSat-L FAQ); justuseapp.com
reviews; space.com app roundups; findstarlink.com; academic.oup.com/mnrasl 544/1/L15.
OSS: github.com/shashwatak/satellite-js; thkruz/ootk-core; skyfielders/python-skyfield;
brandon-rhodes/python-sgp4; CS-SI/Orekit; CesiumGS/cesium; vasturiano/react-globe.gl; Flowm/satvis.
