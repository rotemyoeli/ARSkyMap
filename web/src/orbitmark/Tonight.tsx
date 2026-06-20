/**
 * OrbitMark — Tonight (S-03), first visible UI slice.
 * Built on fixtures from the Claude Design handoff (DOCS/design_handoff_orbitmark):
 * night-field tokens, shape-first marker grammar with the signature uncertainty ring,
 * the data-truth strip, and claims-compliant product language. No live orbital data yet
 * (P2/P3); copy is honest about modelled positions and cached data.
 */
import { useState } from "react";

type MarkerKind = "active" | "inactive" | "rocket" | "debris";

/** Shape-first marker glyph (colour only reinforces) with the uncertainty ring. */
function Marker({ kind, watched = false }: { kind: MarkerKind; watched?: boolean }) {
  const color = `var(--om-marker-${kind})`;
  const c = 18; // center
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" role="img">
      {/* signature uncertainty ring — never removed on selection */}
      <circle className="om-ring" cx={c} cy={c} r="15" fill="none" stroke="var(--om-action-primary)"
        strokeOpacity="0.5" strokeWidth="1.4" strokeDasharray="3 4" />
      {watched && (
        <circle cx={c} cy={c} r="16.5" fill="none" stroke="var(--om-success)" strokeOpacity="0.7"
          strokeWidth="1.2" strokeDasharray="1 3" />
      )}
      {kind === "active" && <circle cx={c} cy={c} r="6" fill={color} />}
      {kind === "inactive" && <rect x={c - 5.5} y={c - 5.5} width="11" height="11" rx="1.5" fill={color} />}
      {kind === "rocket" && <path d={`M${c} ${c - 7} L${c + 7} ${c} L${c} ${c + 7} L${c - 7} ${c} Z`} fill={color} />}
      {kind === "debris" && <path d={`M${c} ${c - 7} L${c + 6.5} ${c + 6} L${c - 6.5} ${c + 6} Z`} fill={color} />}
    </svg>
  );
}

// ---- Fixtures (deterministic; stand-in for the P2/P3 engine) ----
const CALC_FOR_UTC = "2026-06-20 21:14 UTC";
const ELEMENT_AGE = "8 h ago";
const PACKAGE_VERSION = "pkg-2026.171.1";

const OVERHEAD = [
  { key: "om-iss", name: "ISS (ZARYA)", type: "Active payload", kind: "active" as const, sep: "12.4°", range: "612 km", watched: true },
  { key: "om-cz", name: "CZ-4C R/B", type: "Rocket body", kind: "rocket" as const, sep: "31.0°", range: "1,540 km", watched: false },
  { key: "om-deb", name: "COSMOS 2251 DEB", type: "Catalogued debris", kind: "debris" as const, sep: "44.7°", range: "1,802 km", watched: false },
  { key: "om-old", name: "METEOR 1-31", type: "Inactive payload", kind: "inactive" as const, sep: "58.2°", range: "920 km", watched: false },
];

const PASS = { object: "ISS (ZARYA)", rise: "21:38", max: "21:43", set: "21:48", dir: "SW → NE", maxEl: "61°", sunlit: true };

export default function Tonight() {
  const [tab, setTab] = useState("tonight");
  const stale = false; // element/package freshness ok in this fixture

  return (
    <div className="om-shell">
      <div className="om-statusbar">
        <span>ORBITMARK</span>
        <span>● MODELLED</span>
      </div>

      <main className="om-content">
        <p className="om-eyebrow">Tonight</p>
        <h1 className="om-h1">What&apos;s overhead now</h1>
        <p className="om-sub">Modelled positions for your location · candidates, never a single certain object.</p>

        <div className={`om-truth${stale ? " warn" : ""}`} aria-label="Data status">
          <span><span className="om-dot" style={{ background: "var(--om-success)" }} />elements <b>updated {ELEMENT_AGE}</b></span>
          <span>package <b>{PACKAGE_VERSION}</b></span>
          <span>calculated for <b>{CALC_FOR_UTC}</b></span>
        </div>

        <section className="om-panel" aria-labelledby="overhead-h">
          <p className="om-eyebrow" id="overhead-h">{OVERHEAD.length} objects above the horizon</p>
          {OVERHEAD.map((o) => (
            <button className="om-row" key={o.key} type="button">
              <Marker kind={o.kind} watched={o.watched} />
              <span>
                <span className="name">{o.name}{o.watched && <span aria-label="watched" title="watched" style={{ color: "var(--om-success)" }}> ★</span>}</span>
                <br />
                <span className="meta">{o.type}</span>
              </span>
              <span className="om-sep">{o.sep}<br /><span style={{ color: "var(--om-text-muted)", fontWeight: 500 }}>{o.range}</span></span>
            </button>
          ))}
        </section>

        <section className="om-panel" aria-labelledby="pass-h">
          <div className="om-passhead">
            <p className="om-eyebrow" id="pass-h" style={{ margin: 0 }}>Tonight&apos;s best pass · watched</p>
            <span className="meta" style={{ font: "600 12px/1 var(--om-font-mono)", color: "var(--om-action-primary)" }}>{PASS.object}</span>
          </div>
          <div className="om-passgrid">
            <div className="om-passcell"><div className="k">Rise</div><div className="v">{PASS.rise}</div></div>
            <div className="om-passcell"><div className="k">Max {PASS.maxEl}</div><div className="v" style={{ color: "var(--om-action-primary)" }}>{PASS.max}</div></div>
            <div className="om-passcell"><div className="k">Set</div><div className="v">{PASS.set}</div></div>
          </div>
          <p className="om-sub" style={{ margin: "12px 0 0", fontSize: 13 }}>
            {PASS.dir} · {PASS.sunlit ? "sunlit — may be visible" : "in shadow"}. Times are modelled; visibility is not guaranteed.
          </p>
        </section>

        <button className="om-cta" type="button">Open Sky →</button>
        <button className="om-cta secondary" type="button">See all passes</button>

        <p className="om-sub" style={{ marginTop: 24, fontSize: 12, color: "var(--om-text-muted)" }}>
          Preview slice on fixtures. Live elements, propagation and passes arrive with the orbital
          engine (P2–P3). OrbitMark shows modelled positions only — never &ldquo;detects&rdquo; objects.
        </p>
      </main>

      <nav className="om-tabs" aria-label="Primary">
        {[
          { id: "tonight", label: "Tonight" },
          { id: "sky", label: "Sky" },
          { id: "catalog", label: "Catalog" },
          { id: "passes", label: "Passes" },
          { id: "settings", label: "Settings" },
        ].map((t) => (
          <button key={t.id} className="om-tab" type="button"
            aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>
            <TabIcon id={t.id} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function TabIcon({ id }: { id: string }) {
  const s = { width: 20, height: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.8 } as const;
  switch (id) {
    case "tonight": return <svg {...s} viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>;
    case "sky": return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18" /></svg>;
    case "catalog": return <svg {...s} viewBox="0 0 24 24"><path d="M4 5h16M4 12h16M4 19h10" /></svg>;
    case "passes": return <svg {...s} viewBox="0 0 24 24"><path d="M3 17a9 9 0 0 1 18 0" /><circle cx="12" cy="17" r="1.4" fill="currentColor" /></svg>;
    default: return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></svg>;
  }
}
