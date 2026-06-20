/**
 * OrbitMark — Tonight (S-03). Now wired to LIVE data: real catalogue + on-device
 * propagation (useOverhead) showing what is actually above the horizon for the
 * observer right now. Night-field tokens + shape-first marker grammar + uncertainty
 * ring + data-truth strip + claims-compliant copy. Passes (P7) are an honest stub.
 */
import { useState } from "react";
import { useOverhead, type MarkerKind, type OverheadObject } from "./useOverhead";

/** Shape-first marker glyph (colour only reinforces) with the uncertainty ring. */
export function Marker({ kind, watched = false }: { kind: MarkerKind; watched?: boolean }) {
  const color = `var(--om-marker-${kind})`;
  const c = 18;
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
      <circle className="om-ring" cx={c} cy={c} r="15" fill="none" stroke="var(--om-action-primary)" strokeOpacity="0.5" strokeWidth="1.4" strokeDasharray="3 4" />
      {watched && <circle cx={c} cy={c} r="16.5" fill="none" stroke="var(--om-success)" strokeOpacity="0.7" strokeWidth="1.2" strokeDasharray="1 3" />}
      {kind === "active" && <circle cx={c} cy={c} r="6" fill={color} />}
      {kind === "inactive" && <rect x={c - 5.5} y={c - 5.5} width="11" height="11" rx="1.5" fill={color} />}
      {kind === "rocket" && <path d={`M${c} ${c - 7} L${c + 7} ${c} L${c} ${c + 7} L${c - 7} ${c} Z`} fill={color} />}
      {kind === "debris" && <path d={`M${c} ${c - 7} L${c + 6.5} ${c + 6} L${c - 6.5} ${c + 6} Z`} fill={color} />}
    </svg>
  );
}

function typeLabel(kind: MarkerKind): string {
  return { active: "Active payload", inactive: "Inactive payload", rocket: "Rocket body", debris: "Catalogued debris" }[kind];
}

function OverheadRow({ o }: { o: OverheadObject }) {
  return (
    <button className="om-row" type="button">
      <Marker kind={o.kind} />
      <span>
        <span className="name">{o.name}</span>
        <br />
        <span className="meta">{typeLabel(o.kind)} · #{o.noradId}</span>
      </span>
      <span className="om-sep">
        {o.elevationDeg.toFixed(0)}° {o.compass}
        <br />
        <span style={{ color: "var(--om-text-muted)", fontWeight: 500 }}>{Math.round(o.rangeKm).toLocaleString()} km</span>
      </span>
    </button>
  );
}

export default function Tonight() {
  const [tab, setTab] = useState("tonight");
  const d = useOverhead();
  const stale = d.elementAge != null && /\d+ d ago/.test(d.elementAge);

  return (
    <div className="om-shell">
      <div className="om-statusbar">
        <span>ORBITMARK</span>
        <span>● MODELLED</span>
      </div>

      <main className="om-content">
        <p className="om-eyebrow">Tonight</p>
        <h1 className="om-h1">What&apos;s overhead now</h1>
        <p className="om-sub">Modelled positions for {d.locationLabel} · candidates, never a single certain object.</p>

        <div className={`om-truth${stale ? " warn" : ""}`} aria-label="Data status">
          <span><span className="om-dot" style={{ background: stale ? "var(--om-warning)" : "var(--om-success)" }} />
            elements <b>{d.elementAge ? `updated ${d.elementAge}` : "freshness unknown"}</b></span>
          <span>source <b>{d.source}</b></span>
          <span>calculated for <b>{d.calculatedForUtc}</b></span>
        </div>

        <section className="om-panel" aria-labelledby="overhead-h">
          {d.status === "loading" && <p className="om-sub" id="overhead-h" style={{ margin: 0 }}>Loading catalogue and computing positions…</p>}
          {d.status === "error" && (
            <div>
              <p className="om-eyebrow" id="overhead-h" style={{ color: "var(--om-warning)" }}>Catalogue unavailable</p>
              <p className="om-sub" style={{ margin: 0 }}>Could not load elements. Manual Sky still works offline once cached. ({d.error})</p>
            </div>
          )}
          {d.status === "empty" && (
            <div>
              <p className="om-eyebrow" id="overhead-h">Nothing overhead right now</p>
              <p className="om-sub" style={{ margin: 0 }}>None of {d.totalTracked} tracked objects are above your horizon this moment. Check back, or open Sky to scan a direction.</p>
            </div>
          )}
          {d.status === "ready" && (
            <>
              <p className="om-eyebrow" id="overhead-h">{d.objects.length} of {d.totalTracked} objects above the horizon</p>
              {d.objects.slice(0, 12).map((o) => <OverheadRow key={o.key} o={o} />)}
            </>
          )}
        </section>

        <section className="om-panel" aria-labelledby="pass-h">
          <p className="om-eyebrow" id="pass-h">Tonight&apos;s passes · watched</p>
          <p className="om-sub" style={{ margin: 0 }}>
            Pass predictions (rise / max / set) arrive with the pass solver. Save and watch an
            object to track it here. Times will be modelled — visibility is never guaranteed.
          </p>
        </section>

        <button className="om-cta" type="button">Open Sky →</button>
        <button className="om-cta secondary" type="button">Browse the catalogue</button>

        <p className="om-sub" style={{ marginTop: 24, fontSize: 12, color: "var(--om-text-muted)" }}>
          Live: positions are modelled on-device from {d.source} elements. OrbitMark shows modelled
          positions only — it never &ldquo;detects&rdquo; objects, and your precise location stays on your device.
        </p>
      </main>

      <nav className="om-tabs" aria-label="Primary">
        {[{ id: "tonight", label: "Tonight" }, { id: "sky", label: "Sky" }, { id: "catalog", label: "Catalog" }, { id: "passes", label: "Passes" }, { id: "settings", label: "Settings" }].map((t) => (
          <button key={t.id} className="om-tab" type="button" aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>
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
