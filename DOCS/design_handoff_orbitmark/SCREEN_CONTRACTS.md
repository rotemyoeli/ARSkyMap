# OrbitMark — Screen Contracts (S-01 … S-18)

Authority: **OM-CDR-001 v1.2**, Appendix G. The CDR wins on any conflict. Every screen obeys the
non-negotiables: truth is visible, value before permission, one primary action, candidate list (never
false single-object certainty), Manual Sky + semantic lists complete every core task, non-colour status.

The bundled `OrbitMark_Design_Package.html` shows the *visual* truth for these. This file is the
*behavioural* contract. Recreate in the target codebase (React/Vite PWA → Capacitor per CDR defaults).

Data-truth that must be visible wherever a modelled position is shown:
`source` · `element epoch (UTC)` · `package version` · `calculated-for time (UTC)` · `confidence` ·
visibility split into **separate** fields: above-horizon / sunlit / observer-darkness / brightness-known / likely-visible.

Controlled failure code families (never one generic red banner):
`ING-HTTP-* · ING-PARSE-* · ING-SCHEMA-* · ID-* · PKG-* · ORB-* · TIME-* · PASS-* · SENSOR-*`

---

## S-01 Launch
- **Purpose:** Cold/warm start; bring the cached last-known-good package online.
- **Primary action:** none (auto-progresses); offer "Open Manual Sky" if activation stalls.
- **Data-truth:** cached package version, "last-known-good · ready offline".
- **States:** cached manifest loading · worker activation · first load · incompatible package · activation failure · last-known-good fallback.

## S-02 Onboarding
- **Purpose:** Communicate the wedge — save/note/tag/watch/revisit. No spectacle.
- **Primary action:** "Start with Manual Sky". Secondary: Skip.
- **Rule:** no forced account, camera, motion, notification or precise location.

## S-03 Tonight
- **Purpose:** What's overhead now + tonight's best passes for watched objects.
- **Primary action:** "Open Sky". Secondary: "See all passes".
- **Data-truth:** element age, calculated-for time, count above horizon.
- **States:** first/cached load · loading · empty (honest "nothing overhead") · offline · stale elements · stale package · clock skew · package fallback · error.

## S-04 Mode / permission primer
- **Purpose:** Explain Camera Sky before requesting camera; always offer Manual fallback.
- **Primary action:** "Allow camera". Secondary: "Keep using Manual Sky".
- **Rule:** every permission has primer → user-initiated request → denial path → equivalent fallback. Camera is **never** described as detection.

## S-05 Camera Sky (optional)
- **Purpose:** Orientation-based modelled overlay on live camera background.
- **Primary action:** tap a region → candidate list.
- **Data-truth:** "Camera background · modelled overlay, not a detector", orientation confidence, calculated-for time.
- **States:** denied · sensor unavailable · low confidence · calibrating · position unavailable · reduced motion.

## S-06 Manual Sky (first-class, no sensors)
- **Purpose:** Complete the whole loop with zero permissions — sky dome by az/el.
- **Primary action:** "List objects in this region".
- **Data-truth:** "modelled for HH:MM UTC", orientation confidence.
- **Rule:** must complete every core task identically to Camera Sky.

## S-07 Candidate list
- **Purpose:** Replace false certainty — show every object in the angular region.
- **Primary action:** select a candidate → S-08.
- **Behaviour:** spherical angular separation (not pixel distance); region = uncertainty region + touch tolerance; sort by angular separation, then priority, then stable tie-break.
- **States:** candidate count · angular ordering · identity-limited (analyst range excluded) · no candidates.

## S-08 Object detail
- **Purpose:** Full honest record for one object.
- **Primary action:** "Save & annotate". Secondary: Watch toggle.
- **Data-truth (required):** catalog ID + source · element epoch · package version · calculated-for time · geometric AZ/EL/RNG · visibility dimensions as separate fields · degradation reasons.
- **States:** geometric available/unavailable · stale · low confidence · decayed object (`ORB-*`).

## S-09 Save / annotate
- **Purpose:** Note, tag, watch. Curation is the memorable value.
- **Primary action:** "Save to catalog".
- **Data model:** references `object_key` (OrbitMark UUID), never a reusable analyst number.
- **States:** empty note · destructive confirm (remove) · large text.

## S-10 My Catalog
- **Purpose:** Revisit saved objects, tags, watch state.
- **Primary action:** open an object.
- **States:** empty · offline (cached) · large list.

## S-11 Passes
- **Purpose:** Upcoming passes for a watched object.
- **Primary action:** open a pass → S-12.
- **Data-truth:** solver version, source age, recompute time; **notification caveat** ("OS may deliver early/late").
- **Recompute triggers:** package activation, app resume, watch change, significant location change, notification-permission change.
- **States:** no passes · stale/skew suppression of precise wording · notification denied.

## S-12 Pass detail
- **Purpose:** One pass — rise / max / set, arc, direction.
- **Primary action:** set reminder / back to Tonight.
- **Data-truth:** rise & set elevation/time, max elevation/time, sunlit flag, solver tolerance.
- **States:** reminder set · notification denied · skew (approximate).

## S-13 Search / filters
- **Purpose:** Find objects by name/ID, filter by type & source lane.
- **Primary action:** open a result.
- **Rule:** analyst range 80000–89999 and provisional identities excluded from public MVP unless a lineage-safe ADR is approved.
- **States:** no matches · identity-limited · loading.

## S-14 Learn
- **Purpose:** Reviewed explainers (uncertainty, element age, sunlit-vs-visible).
- **Rule:** no unreviewed factual/educational claim ships.

## S-15 Data status
- **Purpose:** Operator/curious-user transparency on the data pipeline.
- **Data-truth:** source lane, last successful ingest, active package, element-age distribution, cached fallback, provider delay, quarantine/systemic error, support export.
- **Ingestion state machine (spine):** LOCK → FETCH → HTTP POLICY → PARSE → SCHEMA VALIDATE → NORMALIZE → IDENTITY RESOLVE → PROPAGATION SMOKE → DEDUP → IMMUTABLE STORE → PACKAGE BUILD → PACKAGE VALIDATE → ATOMIC PUBLISH → OBSERVE.
- **Failure rules:** 304 → `no_change`; 403/429 → stop + back off + alert ops; parse/schema/identity/propagation failure → quarantine or fail candidate package; any build/activation failure preserves last-known-good.

## S-16 Settings / privacy / accessibility
- **Purpose:** Control privacy + a11y.
- **Key toggles:** keep precise location local (default on; never in analytics/share cards) · larger text (to 200%) · reduce motion (honour system) · high contrast (non-colour status everywhere).

## S-17 Optional sync
- **Purpose:** Optional account to sync catalog across devices.
- **Rule:** never forced; core loop works fully local. No child accounts, public feed, classroom roster in MVP.

## S-18 Error / empty / offline patterns
- **Purpose:** Recovery library. Each error maps to a controlled code with a specific recovery that preserves Manual Sky / catalog value.
- **Rule:** a generic red banner is **not** an acceptable completion of any Appendix G state.

---

## Required state set for every applicable screen
first load · cached load · loading · empty · success · partial data · offline · permission not asked ·
denied · restricted · sensor unavailable · low confidence · calibrating · stale element set · stale package ·
clock skew · package activation failure · last-known-good fallback · propagation unavailable · no candidates ·
multiple candidates · no passes · notification denied · destructive confirmation · large text (200%) ·
reduced motion · screen-reader mode.

## Top-level navigation
Tonight · Sky (Camera / Manual) · My Catalog · Passes · Learn · Settings

## Core flow
Tonight → Open Sky → tap region → candidate list → object detail → Save / Watch → Passes → alert deep link.
