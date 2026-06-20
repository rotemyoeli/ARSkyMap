# Claude Design UX/UI Production Package

> **Binding design handoff:** the concrete, authoritative design deliverable is
> `DOCS/design_handoff_orbitmark/` — `design-tokens.json` + `tokens.css` (single token
> source, no inline hex), `SCREEN_CONTRACTS.md` (S-01…S-18 purpose/action/data-truth/
> states/codes), and `OrbitMark_Design_Package.html` (high-fidelity reference). It binds
> WP-P4-001 (design system) and all P5+ UI. Order: **CDR v1.2 / Appendix G wins on any
> conflict.** Generate the token layer from the JSON/CSS; build tokens → primitives →
> components → screens; implement every screen's full state set with controlled codes;
> enforce the product-language claims list; verify the running app against the prototype
> + screenshot matrix before any screen is "done".


## 1. Design mission
Create a calm, trustworthy night-field instrument that makes model status and uncertainty understandable while keeping the personal catalog - not AR spectacle - as the memorable value. The design must work as a PWA, adapt to Capacitor iOS/Android shells, and preserve complete Manual Sky and semantic list alternatives.

## 2. Required inputs
- CDR chapters 3, 4, 7-10, 12-15 and Appendices A-D, G-J.
- `OrbitMark_Claude_Design_Execution_Brief_v2.0.md`.
- `DOCS/PROJECT_SKILLS.md`.
- Screen/state inventory and copy/claims register.
- Realistic object, package, epoch, time, pass and failure fixtures.

## 3. Required deliverable bundle
1. **Experience strategy:** personas, JTBD, critical journeys, service blueprint, permission strategy, trust model, accessibility risks.
2. **Information architecture:** sitemap, navigation, deep links, object/pass/catalog relationships, state transitions.
3. **Screen contracts:** S-01 through S-18; every screen includes purpose, hierarchy, data, primary/secondary actions, transitions, states, a11y semantics, analytics, requirements, and acceptance tests.
4. **Design system:** tokens, typography, spacing, grids, elevation, shape language, marker grammar, icon policy, motion, focus, data-density rules.
5. **Components:** semantic React-ready contracts, responsive variants, keyboard/screen-reader behavior, error/loading/empty/stale/offline states.
6. **High-fidelity assets:** Figma-ready frames/specifications, SVG icons/markers, PNG presentation assets, light/night contrast evidence.
7. **Storybook:** one story per material state, interactions, a11y parameters, visual baselines and responsive viewports.
8. **Prototype evidence:** critical paths in desktop/mobile web, iOS and Android simulator frames, with annotated screenshots.
9. **Handoff:** design decisions, component map, token export, copy deck, state matrix, implementation notes, known limitations.

## 4. Visual thesis
- Deep navy canvas and layered blue-gray surfaces.
- Orbital cyan for the dominant action; amber for caution; red only for destructive/critical failure; green for verified success.
- Space Grotesk or an approved display face paired with a highly readable UI face.
- Uncertainty ring is the signature honesty motif.
- Object meaning uses shape + label + optional color: active payload circle, inactive square, rocket body diamond, debris triangle, watched halo.
- Avoid purple-gradient “AI/space” clichés, game HUD overload, excessive glow, glassmorphism, decorative orbital clutter, tiny technical labels, and universal pills.

## 5. Interaction rules
- Show value before permissions. Each permission has a primer, user-initiated request, denial path, and equivalent fallback.
- One primary action per screen.
- Candidate list replaces false single-object certainty.
- Source/package/element age, calculated-for time, clock state and orientation confidence are visible where relevant.
- “Above horizon,” “sunlit,” “brightness known,” “observer darkness,” and “likely visible” are separate fields.
- No critical action depends on camera, motion, color, drag, fine pointing, or animation.
- Text scales without clipping; status is announced semantically; focus is visible; motion respects reduced-motion settings.

## 6. Responsive specification
Design and test at minimum:
- Mobile compact: 360x800 and 390x844.
- Mobile large: 430x932.
- Tablet: 768x1024.
- Desktop: 1280x800 and 1440x900.
- Dynamic text: 100%, 150%, and 200% where platform-supported.
- Reduced motion; high contrast; keyboard-only; screen-reader landmarks.

## 7. State matrix
Every applicable screen includes: first load, cached load, loading, empty, success, partial data, offline, permission not asked, denied, restricted, sensor unavailable, low confidence, calibrating, stale element set, stale package, clock skew, package activation failure, last-known-good fallback, propagation unavailable, no candidates, multiple candidates, no passes, notification denied, destructive confirmation, large text, reduced motion, and screen-reader mode.

## 8. Claude Design workflow
1. Invoke `orbitmark-ux-design-authority` and list controlling requirements.
2. Audit existing assets and do not inherit weak PDR wireframes blindly.
3. Produce two structurally distinct low-fidelity alternatives for unfixed flows.
4. Council selects based on task clarity, truth, accessibility, wedge strength, and implementation feasibility.
5. Produce high fidelity with real copy/data and the full state matrix.
6. Build tokens/components/Storybook before page-by-page polish.
7. Run component tests, Storybook a11y, visual baselines, keyboard and text-scale checks.
8. Implement one vertical flow and verify it in the running app.
9. Capture the screenshot matrix and run design council review.
10. Fix all STOP/CRITICAL/MAJOR findings and freeze approved baselines.

## 9. Screenshot naming and metadata
`<screen-id>__<state>__<viewport>__<theme>__<text-scale>__<locale>__<commit>.png`

Each capture has a JSON sidecar with route, fixture, package version, browser/device, OS, pixel ratio, timestamp, commit, test ID, and requirement IDs. Screenshots without metadata are presentation material, not evidence.

## 10. Design acceptance scorecard
Minimum 85/100 and no critical defect:
- Product wedge and task clarity 20.
- Truth/uncertainty/data state 20.
- Accessibility/non-camera parity 20.
- Visual hierarchy/distinctiveness 15.
- State completeness/recovery 10.
- Responsive/platform fit 10.
- Performance/implementation feasibility 5.

## 11. Handoff authority
Claude Design can propose novel visual solutions but cannot introduce product scope, hide uncertainty, change data semantics, weaken accessibility, or alter a gate. Any such need becomes an ADR/change request, not a silent design decision.
