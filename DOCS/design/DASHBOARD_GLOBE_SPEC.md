# OrbitMark — 3D Globe Dashboard ("Mission View", S-19) — Specification
Status: **PROPOSED — awaiting approval before development.** Date 2026-06-20.
Grounded in fact-based research (see `DOCS/research/` + the two research passes summarised below).

## 0. Principle (non-negotiable)
The 3D globe is an **impressive enhancement, not a new source of false certainty**. OrbitMark's
honesty + accessibility rules still bind: positions are **modelled** (labelled), uncertainty is shown,
imagery is honest (most objects have **no** real image), and **Manual Sky remains the accessible,
sensor-free path** — the globe must have an accessible equivalent and a non-WebGL fallback.

## 1. Tech decision (research-backed)
- **Renderer: `react-globe.gl` (MIT)** on three.js. Its own repo demonstrates the exact pipeline we
  need — satellite.js SGP4 → a single particle layer, with built-in OrbitControls (rotate/zoom/pan),
  `pointOfView()` fly-to, and `onPointClick` raycasting. Best impressiveness/effort ratio for our
  React + Vite + TS + satellite.js stack. (CesiumJS/Apache is the 4D-accuracy champion but ~23 MB and
  can stutter with many dynamic positions; deck.gl GlobeView is experimental — no rotation. Both rejected
  for v1.) All candidates are permissive (MIT/Apache).
- **Performance core (mandatory):** never propagate the full catalogue on the main thread per frame.
  Run SGP4 in a **Web Worker**, post back one transferable `Float32Array` of ECI/geodetic positions,
  update a **single points/instanced buffer**, interpolate between samples; throttle propagation (~5 Hz);
  working-set/LOD (cap rendered set, always include watched + near-camera). satellite.js WASM bulk API
  (3–12× faster) is an option for scale. (Our catalogue is ~323 today; design scales to thousands.)
- **New deps:** `react-globe.gl` + `three` (bundle grows; lazy-load the globe route so the core PWA stays light).

## 2. Layout (mobile-first, expands on desktop)
```
┌───────────────────────────── KPI / status bar ──────────────────────────────┐
│ tracked 323 · above horizon 41 · may-be-visible 6 · decaying 3 · data 8h ago │
├──────────────┬───────────────────────────────────────────┬──────────────────┤
│  Filters     │                                           │   Inspector       │
│  (type,      │            3D EARTH GLOBE (hero)          │  selected object  │
│  altitude,   │   day/night + atmosphere + terminator     │  honest record +  │
│  visible-now │   animated objects · orbit · uncertainty  │  IMAGE popup +    │
│  watched,    │   rotate / zoom / pan / fly-to            │  save/watch       │
│  decaying)   │                                           │                  │
├──────────────┴───────────────────────────────────────────┴──────────────────┤
│  ◀ ▶ ⏸  Time scrubber: now ── +6h    speed 1× 60× 600×    [Tonight] [Reset]   │
└──────────────────────────────────────────────────────────────────────────────┘
```
On phones: globe is full-bleed; KPIs collapse to a strip; Filters/Inspector become bottom sheets;
time scrubber is a slim bar. New 7th destination or a prominent "Globe" entry from Tonight.

## 3. The globe
- **Earth:** textured day map + **night-lights** on the dark side, thin **atmosphere glow**, and a live
  **day/night terminator** driven by the Sun position (we already compute Sun ECI in `visibility.ts`).
- **Objects:** one points/instanced layer; **shape-first marker grammar reused** (cyan payload, blue
  debris, amber rocket, Starlink) with **sunlit objects brighter, eclipsed dimmer** (ties to the
  visibility model). Point size/halo encodes **uncertainty** (older elements = larger, fainter — our D1).
- **Selected object:** draw its **orbit ring** + **ground track** + the **along-track uncertainty tube**
  (reuse Idea 5), and a **footprint** circle on the surface.
- **Camera:** smooth rotate/zoom/pan; gentle **auto-rotate when idle** (off under reduced-motion);
  **fly-to** on selection.

## 4. Interaction & zoom-to-object → image
- **Zoom/LOD:** far out → see global distribution + **debris-shell glow** (Idea 4 in 3D: altitude rings
  glowing by density); zoom in → individual points resolve, **labels** fade in (LOD); click/tap → fly-to
  + open Inspector.
- **Click → Inspector → IMAGE popup** (the requested feature), honest sourcing (research-backed):
  1. **Primary:** Wikidata SPARQL by **NORAD id (P377)** → fallback **COSPAR (P247)** → returns the
     Wikidata item, Wikipedia article, and a **Commons image** via `Special:FilePath/<file>?width=400`
     (hotlinkable, with **author + license attribution** shown).
  2. **Fallback (name):** Wikipedia `pageimages` by object name.
  3. **No image (most debris/rocket bodies):** show **"No verified image available"** + reference links
     to `n2yo.com/satellite/?s={id}` and `heavens-above.com/SatInfo.aspx?satid={id}`.
  4. **Class image** (e.g. a generic Starlink) only if explicitly labelled **"Illustrative — not this
     specific object."** Never imply a class/illustrative image is the exact object.
  - Images are **fetched live from the internet (Wikidata/Commons), cached in memory, never stored in our
    DB** — exactly as requested. Gunter's Space Page is **link-only** (copyrighted, no hotlink).

## 5. Additional "wow" elements (creative, on-brand, honest)
1. **Time machine / scrubber** — play/pause, speed 1×…600×, jump to a watched-object pass; terminator,
   sunlit shading and positions all animate with the clock.
2. **"Tonight" mode** — a cone/halo from your location highlighting objects above your horizon and the
   "may be visible" subset (ties the globe to the Tonight screen).
3. **Debris-density shells in 3D** — translucent altitude rings glowing by object count (the crowded-shells
   idea made spatial); a teaching view of congestion — **aggregate density, never collision prediction.**
4. **Watchlist constellation** — your watched objects pulse; their next-pass arcs draw over your location.
5. **Decay/re-entry layer** — decaying objects flagged and shown "falling" toward Earth (Idea 3), honest
   "modelled, not a precise re-entry."
6. **Sunlit/eclipse glow** — objects in sunlight glow gold, in Earth's shadow go cold/blue (visibility model).
7. **Cinematic idle** — slow auto-rotate, ambient star field (off under reduced-motion).
8. **Honest-uncertainty rendering** — selected-object uncertainty tube + per-point uncertainty halo; the
   globe that *shows the doubt* instead of a confident pretty line.

## 6. Honesty, accessibility & resilience guardrails
- **Modelled label** persistent; positions never implied exact; uncertainty always visible.
- **Accessible equivalent:** the globe (a `<canvas>`) is not screen-reader operable, so the screen ships
  with an **equivalent accessible object list + the same Inspector** and a "skip the globe" control; all
  core tasks remain doable without the globe (Manual Sky parity preserved).
- **Reduced motion:** disable auto-rotate + animation; allow manual stepping.
- **No-WebGL / low-end fallback:** detect WebGL; if unavailable, render the existing 2D screens (the app
  must not depend on the globe).
- **Performance honesty:** if we cap the rendered set (working-set), say so ("showing N of M").
- **Images:** attribution shown; no copyrighted hotlinks; honest "no image" state; class images labelled.

## 7. Data & dependencies
- Positions: existing `/api/satellites` + on-device SGP4 (now in a worker). Sun/terminator: `visibility.ts`.
- Images: client-side fetch to `query.wikidata.org/sparql`, `*.wikipedia.org/w/api.php`,
  `commons.wikimedia.org` (all CORS-enabled). Reference links to n2yo/Heavens-Above/Wikipedia/Gunter's.
- New: `react-globe.gl`, `three`. Lazy-loaded route to protect core bundle.

## 8. Phased build plan (each = our controlled cycle: plan→council→implement→verify→evidence→gate→deploy)
- **G-A — Globe MVP:** Earth + worker-driven animated points + rotate/zoom/pan + reduced-motion + WebGL fallback.
- **G-B — Select → Inspector → Image popup:** raycast click, fly-to, honest Wikidata/Commons image with attribution + fallbacks.
- **G-C — Time & light:** time scrubber, day/night terminator, sunlit/eclipse glow.
- **G-D — Overlays:** Tonight cone, debris-density shells, watchlist arcs, decay layer, uncertainty tube/halo.
- **G-E — Hardening:** performance/working-set/LOD, accessibility equivalent + audit, bundle budget, council + gate.

## 9. Risks (honest)
Bundle growth (three/three-globe) → lazy-load + budget. WebGL absent on some devices → fallback. Image
coverage is **sparse** (most objects have none) → honest empty state is essential. Wikimedia rate/UA
policy → descriptive User-Agent + memory cache. Canvas accessibility → mandatory accessible equivalent.

## Decision requested
Approve this spec (or adjust scope) and I will build it in the phased cycles above — starting with G-A
(globe MVP) — under the same model: council-reviewed, tested, deployed to Railway staging, pushed per phase.
