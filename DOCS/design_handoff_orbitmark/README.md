# Handoff: OrbitMark — Design Package (night-field instrument)

> Drop this whole folder into your OrbitMark repo (e.g. alongside `DOCS/` or under `DOCS/design/`).
> It is self-contained and offline — Claude Code can read it directly in PyCharm and implement from it.

## Overview
OrbitMark is an honest, model-based orbital-object companion. The memorable value is the **personal
catalog** — save / note / tag / watch / revisit objects — not AR spectacle. Camera Sky is an *optional*
camera background with orientation-based modelled overlays; it is **not** a detector. Manual Sky and
semantic lists must complete every core task without any sensor, account or precise location.

This package is the design half of that product: a full token system, the marker grammar with the
signature **uncertainty ring**, component patterns, the 18-screen contract, a clickable core-flow
prototype, an interactive state matrix, and the desktop/ops Data-Status view.

## About the design files
The HTML in this bundle is a **design reference** — a high-fidelity prototype showing intended look,
copy, data-truth and behaviour. It is **not production code to copy**. The task is to **recreate these
designs in the OrbitMark codebase's environment** — per the CDR defaults that means a **React + TypeScript
+ Vite PWA**, later wrapped with Capacitor — using its established patterns, component library, state
management and the orbital Web Worker contracts. Use `tokens.css` / `design-tokens.json` as the token
layer; do not hand-copy hex values into components.

`OrbitMark_Design_Package.html` opens in any browser straight from disk (double-click in PyCharm →
*Open in Browser*). It is a single self-contained file — no server, no network needed.

## Fidelity
**High-fidelity.** Final colours, typography, spacing, marker grammar, copy and interactions are
intentional and match OM-CDR-001 v1.2 tokens. Recreate the UI faithfully using the codebase's libraries;
where this prototype and the CDR / Appendix G disagree, **the CDR wins**.

## Files in this bundle
| File | What it is |
|---|---|
| `OrbitMark_Design_Package.html` | The full interactive design reference (open in browser). |
| `design-tokens.json` | Machine-readable tokens — colour, space, radius, motion, type, marker grammar. |
| `tokens.css` | The same tokens as CSS custom properties + reduced-motion + iOS input rule. Import once. |
| `SCREEN_CONTRACTS.md` | Behavioural contract for S-01…S-18: purpose, primary action, data-truth, states, codes. |
| `README.md` | This file. |

## Visual thesis (hold the line)
Calm, trustworthy night instrument. Deep navy canvas, layered blue-gray surfaces, **one** orbital-cyan
primary action, amber caution, red only for destructive/critical failure, green for verified success.
**Avoid:** generic neon sci-fi, purple "AI/space" gradients, game-HUD overload, heavy glassmorphism,
decorative orbital clutter, tiny technical labels, and universal pill shapes.

## Design tokens (summary — authoritative values in `tokens.css` / `design-tokens.json`)
- **Surfaces:** canvas `#07131F` · surface `#0E2233` · panel `#132C40` · panel-deep `#0A1A28`
- **Text:** primary `#F4F7FA` · secondary `#A9BBC9` · muted `#7E96A8`
- **Action:** primary `#43C6D9` (ink `#062028`) · focus `#74A7FF`
- **Status:** warning `#FFB454` · danger `#FF6B6B` · success `#53D49A`
- **Spacing:** 4 · 8 · 12 · 16 · 24 · 32
- **Radius:** control 12 · panel 16 · sheet 20 · pill 9999
- **Motion:** fast 150ms · standard 220ms · `cubic-bezier(.4,0,.2,1)` · honour `prefers-reduced-motion`
- **Min touch target:** 44px
- **Type:** Space Grotesk (display 24–78px) · Inter (UI 13–20px) · **JetBrains Mono for every data-truth string** (coords, epochs, IDs, codes, package versions)

## Marker grammar (shape first, colour only reinforces — never colour alone)
| Object | Shape | Colour |
|---|---|---|
| Active payload | circle | cyan `#43C6D9` |
| Inactive payload | square | muted blue `#5B7C99` |
| Rocket body | diamond | amber `#FFB454` |
| Debris | triangle | blue `#74A7FF` |
| Watched | outer dashed halo + accessible state | — |
| **Uncertainty** | **dashed ring** | cyan — signature motif; **never removed on selection** |

## Components seen in the prototype
- **Data-truth strip** — mono row: element age (+ status dot) · package version · calculated-for time. Warning variant for stale/cached.
- **Buttons** — one primary per screen (cyan, ink text, 12px radius, 44–52px tall, optional trailing →); secondary outline; destructive outline in danger. Press `scale(0.97)`.
- **Candidate row** — marker glyph + name + type + angular separation + range; selected state uses accent border.
- **Object detail block** — 2-col mono grid of catalog/source, epoch, package, calc-for; visibility split into separate labelled fields (above-horizon / sunlit / observer-darkness / brightness).
- **Pass card / pass arc** — rise→max→set times (mono), direction, sunlit flag; arc SVG with rise (success) / max (cyan) / set (danger) nodes.
- **Status banners** — recoverable states with a controlled code (`TIME-SKEW-02`, `PKG-CHK-04`, …) and a real recovery, never one generic red banner.
- **Mobile shell** — 44px status bar, scrolling content, 64px bottom tab bar (Tonight · Sky · Catalog · Passes · Settings) with a sliding cyan indicator.
- **Desktop/ops shell** — 200px left rail · ingest tables + KPI tiles · 260px right inspector showing the ingestion pipeline. Layout restructures to the bottom-tab mobile shell ≤768px.

## Interactions & behaviour
- **Core-flow prototype** (section 04) is clickable: each screen's primary action advances Tonight → Manual Sky → Candidates → Object → Save → Passes → Pass detail. A step rail jumps directly.
- **State matrix** (section 06) — tabs swap the Tonight screen between default / loading / empty / offline / stale / clock-skew / package-fail.
- **Candidate selection** — spherical angular separation (clamp cosine to [-1,1] before acos); region = uncertainty region + touch tolerance; return *every* candidate; sort by separation → priority → stable tie-break. Never silently pick "nearest as certain".
- **Animation** — slow ring rotation, marker pulse, skeleton shimmer; all dial to ~0 under reduced motion.
- **Accessibility** — visible focus, status announced semantically (not colour-only), text scales to 200% without clipping, no core interaction depends on camera/motion/colour/drag/fine-pointing.

## State management (per screen — see SCREEN_CONTRACTS.md)
Needed state spans: package activation (staging/checksum/last-known-good), worker readiness, working-set
scheduler band (A immediate / B visible / C background), source & element freshness, clock-skew status,
orientation confidence, candidate set, watch/save state (keyed by `object_key`), pass solver results, and
permission states. Time authority is **UTC** for propagation & pass windows; local time is display only.

## Data semantics the UI must respect
- User data references `object_key` (OrbitMark UUID), never a reusable analyst number.
- Analyst range `80000–89999` and provisional identities are excluded from the public MVP package and from Save/Note/Tag/Watch unless a lineage-safe identity ADR is approved.
- Default source: CelesTrak GP (OMM JSON). Space-Track / SupGP are separate, labelled lanes — never silently mixed.
- Show source / package / element age, calculated-for time, clock state and orientation confidence wherever a modelled position appears.

## Product language (enforce in copy & components)
**Say:** modelled position · objects in this area · catalogued debris · may be visible · visibility unknown ·
elements updated … ago · calculated for … · using cached data.
**Never:** detect through the camera · scan debris · exact fragment · live surveillance · all debris ·
pinpoint accuracy · live location of the satellite · guaranteed visibility/notification timing.

## Assets
No external image assets. All marks/markers are inline SVG in the prototype (uncertainty ring, object
glyphs, nav icons, pass arc). Fonts are Space Grotesk / Inter / JetBrains Mono (Google Fonts; the bundled
HTML inlines them for offline use — in the app, self-host or load via your existing font pipeline).

## How Claude Code should use this in the repo
1. Place this folder in the repo and reference it from your design skill / `DESIGN.md`.
2. Generate the token layer from `tokens.css` / `design-tokens.json` (CSS vars or a TS token module) — single source of truth, no inline hex.
3. Build tokens → primitives → components → screens, per `SCREEN_CONTRACTS.md`, before page polish.
4. For each screen implement the **full state set** (not just the happy path) with controlled codes.
5. Verify the running app against the prototype, capture the screenshot matrix, then run the claims /
   accessibility / Appendix-G state gates. Do not call a screen complete until those pass.
