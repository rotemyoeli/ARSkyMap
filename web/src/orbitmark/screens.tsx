/**
 * OrbitMark manual product loop (P5 / M1) + passes (P7): Tonight, Manual Sky, Candidate
 * list, Object detail, Catalog (save/note/tag/watch), Passes, Settings. All share the
 * on-device engine (useCatalog) and the local-first store. Claims-compliant copy
 * throughout; candidate lists never assert a single certain object.
 */
import { useMemo, useState } from "react";
import { type TleObject } from "../orbital/catalog";
import { lookAngle } from "../orbital/propagate";
import { Marker } from "./Tonight";
import { type CatalogCore } from "./useCatalog";
import { useCatalogStore } from "./store";

const KIND_LABEL = { active: "Active payload", inactive: "Inactive payload", rocket: "Rocket body", debris: "Catalogued debris" } as const;

export function DataTruth({ core }: { core: CatalogCore }) {
  const stale = core.elementAge != null && /\d+ d ago/.test(core.elementAge);
  return (
    <div className={`om-truth${stale ? " warn" : ""}`} aria-label="Data status" aria-live="polite">
      <span><span className="om-dot" style={{ background: stale ? "var(--om-warning)" : "var(--om-success)" }} />
        elements <b>{core.elementAge ? `updated ${core.elementAge}` : "freshness unknown"}</b></span>
      <span>source <b>{core.source}</b></span>
      <span>calculated for <b>{core.calculatedForUtc}</b></span>
    </div>
  );
}

function Row({ core, o, onOpen, right }: { core: CatalogCore; o: TleObject; onOpen: (o: TleObject) => void; right?: React.ReactNode }) {
  const store = useCatalogStore();
  const watched = store.byId(o.noradId)?.watched;
  return (
    <button className="om-row" type="button" onClick={() => onOpen(o)}>
      <Marker kind={core.kindOf(o)} watched={watched} />
      <span style={{ minWidth: 0 }}>
        <span className="name">{o.name}</span><br />
        <span className="meta">{KIND_LABEL[core.kindOf(o)]} · #{o.noradId}</span>
      </span>
      <span className="om-sep">{right}</span>
    </button>
  );
}

export function TonightView({ core, onOpen, onTab }: { core: CatalogCore; onOpen: (o: TleObject) => void; onTab: (t: string) => void }) {
  const overhead = useMemo(() => core.objects
    .map((o) => ({ o, look: core.lookFor(o) }))
    .filter((x) => x.look?.aboveHorizon)
    .sort((a, b) => (b.look!.elevationDeg - a.look!.elevationDeg)), [core]);
  return (
    <>
      <p className="om-eyebrow">Tonight</p>
      <h1 className="om-h1">What&apos;s overhead now</h1>
      <p className="om-sub">Modelled positions for {core.locationLabel} · candidates, never a single certain object.</p>
      <DataTruth core={core} />
      <section className="om-panel">
        {core.status === "loading" && <p className="om-sub" style={{ margin: 0 }}>Loading catalogue and computing positions…</p>}
        {core.status === "error" && <p className="om-sub" style={{ margin: 0, color: "var(--om-warning)" }}>Catalogue unavailable — Manual Sky still works once cached.</p>}
        {core.status === "ready" && overhead.length === 0 && <p className="om-sub" style={{ margin: 0 }}>Nothing of {core.objects.length} tracked objects is above your horizon this moment.</p>}
        {overhead.length > 0 && <>
          <p className="om-eyebrow">{overhead.length} of {core.objects.length} above the horizon</p>
          {overhead.slice(0, 12).map(({ o, look }) => (
            <Row key={o.noradId} core={core} o={o} onOpen={onOpen}
              right={<>{look!.elevationDeg.toFixed(0)}° {core.compassOf(look!.azimuthDeg)}<br /><span style={{ color: "var(--om-text-muted)", fontWeight: 500 }}>{Math.round(look!.rangeKm).toLocaleString()} km</span></>} />
          ))}
        </>}
      </section>
      <button className="om-cta" type="button" onClick={() => onTab("sky")}>Open Sky →</button>
      <button className="om-cta secondary" type="button" onClick={() => onTab("catalog")}>Browse the catalogue</button>
    </>
  );
}

const REGIONS = [
  { id: "N", label: "North", az: 0 }, { id: "E", label: "East", az: 90 },
  { id: "S", label: "South", az: 180 }, { id: "W", label: "West", az: 270 },
];

export function ManualSky({ core, onOpen }: { core: CatalogCore; onOpen: (o: TleObject) => void }) {
  const [region, setRegion] = useState(REGIONS[0]);
  const candidates = useMemo(() => {
    const half = 45;
    return core.objects
      .map((o) => ({ o, look: core.lookFor(o) }))
      .filter((x) => x.look?.aboveHorizon && Math.abs(((x.look!.azimuthDeg - region.az + 540) % 360) - 180) <= half)
      .sort((a, b) => b.look!.elevationDeg - a.look!.elevationDeg);
  }, [core, region]);
  return (
    <>
      <p className="om-eyebrow">Manual Sky · no sensors</p>
      <h1 className="om-h1">Scan a direction</h1>
      <p className="om-sub">Modelled for {core.calculatedForUtc}. Pick where you&apos;re looking — we list every candidate in that region.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {REGIONS.map((r) => (
          <button key={r.id} type="button" onClick={() => setRegion(r)} className="om-cta secondary"
            style={{ minHeight: 44, margin: 0, borderColor: region.id === r.id ? "var(--om-action-primary)" : undefined, color: region.id === r.id ? "var(--om-action-primary)" : undefined }}>{r.label}</button>
        ))}
      </div>
      <section className="om-panel">
        <p className="om-eyebrow">{candidates.length} candidate{candidates.length === 1 ? "" : "s"} looking {region.label.toLowerCase()}</p>
        {candidates.length === 0 && <p className="om-sub" style={{ margin: 0 }}>No modelled objects above the horizon in this region right now.</p>}
        {candidates.slice(0, 20).map(({ o, look }) => (
          <Row key={o.noradId} core={core} o={o} onOpen={onOpen}
            right={<>{look!.elevationDeg.toFixed(0)}° {core.compassOf(look!.azimuthDeg)}<br /><span style={{ color: "var(--om-text-muted)", fontWeight: 500 }}>{Math.round(look!.rangeKm).toLocaleString()} km</span></>} />
        ))}
      </section>
    </>
  );
}

export function CatalogScreen({ core, onOpen }: { core: CatalogCore; onOpen: (o: TleObject) => void }) {
  const store = useCatalogStore();
  const [q, setQ] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const list = useMemo(() => {
    const savedIds = new Set(store.entries.map((e) => e.noradId));
    return core.objects.filter((o) =>
      (!savedOnly || savedIds.has(o.noradId)) &&
      (q === "" || o.name.toLowerCase().includes(q.toLowerCase()) || String(o.noradId).includes(q)));
  }, [core.objects, q, savedOnly, store.entries]);
  return (
    <>
      <p className="om-eyebrow">My Catalog</p>
      <h1 className="om-h1">Objects {savedOnly ? "you saved" : "in the catalogue"}</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or NORAD id…"
        style={{ width: "100%", minHeight: 44, borderRadius: 12, border: "1px solid var(--om-border-strong)", background: "var(--om-bg-panel-deep)", color: "var(--om-text-primary)", padding: "0 14px", marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button type="button" className="om-cta secondary" style={{ margin: 0, minHeight: 40, borderColor: !savedOnly ? "var(--om-action-primary)" : undefined }} onClick={() => setSavedOnly(false)}>All ({core.objects.length})</button>
        <button type="button" className="om-cta secondary" style={{ margin: 0, minHeight: 40, borderColor: savedOnly ? "var(--om-action-primary)" : undefined }} onClick={() => setSavedOnly(true)}>Saved ({store.entries.length})</button>
      </div>
      <section className="om-panel">
        {list.length === 0 && <p className="om-sub" style={{ margin: 0 }}>{savedOnly ? "No saved objects yet — open one and tap Save." : "No matches."}</p>}
        {list.slice(0, 40).map((o) => {
          const e = store.byId(o.noradId);
          return <Row key={o.noradId} core={core} o={o} onOpen={onOpen}
            right={e ? <span style={{ color: "var(--om-success)" }}>saved{e.watched ? " ★" : ""}</span> : <span style={{ color: "var(--om-text-muted)" }}>open →</span>} />;
        })}
      </section>
    </>
  );
}

export function ObjectDetail({ o, core, onBack }: { o: TleObject; core: CatalogCore; onBack: () => void }) {
  const store = useCatalogStore();
  const entry = store.byId(o.noradId);
  const look = core.lookFor(o);
  const [note, setNote] = useState(entry?.note ?? "");
  const [tagText, setTagText] = useState((entry?.tags ?? []).join(", "));
  const cell = (k: string, v: string) => (
    <div className="om-passcell"><div className="k">{k}</div><div className="v">{v}</div></div>
  );
  const saveAll = () => {
    store.save({ noradId: o.noradId, name: o.name, type: o.objectType });
    store.setNote(o.noradId, note);
    store.setTags(o.noradId, tagText.split(",").map((t) => t.trim()).filter(Boolean));
  };
  return (
    <>
      <button type="button" className="om-cta secondary" style={{ margin: "0 0 16px", minHeight: 40, width: "auto", padding: "0 16px" }} onClick={onBack}>← Back</button>
      <p className="om-eyebrow">{KIND_LABEL[core.kindOf(o)]}</p>
      <h1 className="om-h1" style={{ display: "flex", alignItems: "center", gap: 10 }}><Marker kind={core.kindOf(o)} watched={entry?.watched} /> {o.name}</h1>
      <DataTruth core={core} />
      <section className="om-panel">
        <p className="om-eyebrow">Honest record</p>
        <div className="om-passgrid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {cell("Catalog ID", `#${o.noradId}`)}
          {cell("Source", core.source)}
          {cell("Azimuth", look ? `${look.azimuthDeg.toFixed(1)}° ${core.compassOf(look.azimuthDeg)}` : "—")}
          {cell("Elevation", look ? `${look.elevationDeg.toFixed(1)}°` : "—")}
          {cell("Range", look ? `${Math.round(look.rangeKm).toLocaleString()} km` : "—")}
          {cell("Above horizon", look ? (look.aboveHorizon ? "yes" : "no") : "—")}
        </div>
        <p className="om-sub" style={{ marginTop: 12, fontSize: 12 }}>Geometric, modelled for {core.calculatedForUtc}. Visibility (sunlit / darkness / brightness) is a separate model — not yet computed.</p>
      </section>
      <section className="om-panel">
        <p className="om-eyebrow">Save &amp; annotate · the wedge</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Your note (why you saved it)…" rows={3}
          style={{ width: "100%", borderRadius: 12, border: "1px solid var(--om-border-strong)", background: "var(--om-bg-panel-deep)", color: "var(--om-text-primary)", padding: 12, marginBottom: 8, fontFamily: "var(--om-font-ui)" }} />
        <input value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="tags, comma separated"
          style={{ width: "100%", minHeight: 44, borderRadius: 12, border: "1px solid var(--om-border-strong)", background: "var(--om-bg-panel-deep)", color: "var(--om-text-primary)", padding: "0 14px", marginBottom: 12 }} />
        <button type="button" className="om-cta" onClick={saveAll}>{entry ? "Update saved object" : "Save to catalogue"}</button>
        {entry && <button type="button" className="om-cta secondary" onClick={() => store.toggleWatch(o.noradId)}>{entry.watched ? "★ Watching — stop watching" : "☆ Watch this object"}</button>}
        {entry && <button type="button" className="om-cta secondary" style={{ borderColor: "var(--om-danger)", color: "var(--om-danger)" }} onClick={() => { store.remove(o.noradId); onBack(); }}>Remove from catalogue</button>}
      </section>
    </>
  );
}

interface PassResult { o: TleObject; rise: Date; max: Date; set: Date; maxEl: number; }
function nextPass(o: TleObject, observer: CatalogCore["observer"], from: Date): PassResult | null {
  const stepS = 60, horizonH = 12;
  let rise: Date | null = null, maxEl = -90, maxAt: Date | null = null;
  for (let s = 0; s < horizonH * 3600; s += stepS) {
    const when = new Date(from.getTime() + s * 1000);
    const look = lookAngle(o.tleLine1, o.tleLine2, observer, when);
    if (!look) continue;
    if (look.aboveHorizon) {
      if (!rise) rise = when;
      if (look.elevationDeg > maxEl) { maxEl = look.elevationDeg; maxAt = when; }
    } else if (rise && maxAt) {
      return { o, rise, max: maxAt, set: when, maxEl };
    }
  }
  return null;
}

export function PassesScreen({ core }: { core: CatalogCore }) {
  const store = useCatalogStore();
  const watched = store.entries.filter((e) => e.watched);
  const passes = useMemo(() => {
    if (core.status !== "ready") return [];
    return watched
      .map((e) => core.objects.find((o) => o.noradId === e.noradId))
      .filter((o): o is TleObject => Boolean(o))
      .map((o) => nextPass(o, core.observer, core.now))
      .filter((p): p is PassResult => Boolean(p))
      .sort((a, b) => a.rise.getTime() - b.rise.getTime());
  }, [watched.map((w) => w.noradId).join(","), core.status, core.now]);
  const t = (d: Date) => d.toISOString().slice(11, 16);
  return (
    <>
      <p className="om-eyebrow">Passes</p>
      <h1 className="om-h1">Watched objects</h1>
      <p className="om-sub">Modelled next pass within 12 h, computed on-device. Times are modelled; your OS may deliver any alert early or late, and visibility is never guaranteed.</p>
      {watched.length === 0 && <section className="om-panel"><p className="om-sub" style={{ margin: 0 }}>You&apos;re not watching anything yet. Open an object and tap Watch to track its passes here.</p></section>}
      {watched.length > 0 && passes.length === 0 && <section className="om-panel"><p className="om-sub" style={{ margin: 0 }}>No modelled passes in the next 12 h for your watched objects.</p></section>}
      {passes.map((p) => (
        <section className="om-panel" key={p.o.noradId}>
          <div className="om-passhead"><p className="om-eyebrow" style={{ margin: 0 }}>{p.o.name}</p><span style={{ font: "600 12px/1 var(--om-font-mono)", color: "var(--om-action-primary)" }}>max {p.maxEl.toFixed(0)}°</span></div>
          <div className="om-passgrid">
            <div className="om-passcell"><div className="k">Rise</div><div className="v">{t(p.rise)}</div></div>
            <div className="om-passcell"><div className="k">Max</div><div className="v" style={{ color: "var(--om-action-primary)" }}>{t(p.max)}</div></div>
            <div className="om-passcell"><div className="k">Set</div><div className="v">{t(p.set)}</div></div>
          </div>
        </section>
      ))}
    </>
  );
}

export function SettingsScreen({ core }: { core: CatalogCore }) {
  return (
    <>
      <p className="om-eyebrow">Settings · privacy &amp; accessibility</p>
      <h1 className="om-h1">Your data, on your device</h1>
      <section className="om-panel">
        <p className="om-eyebrow">Privacy</p>
        <p className="om-sub" style={{ margin: 0 }}>Precise location is used only on this device to compute modelled positions ({core.locationLabel}). It is never sent to a server and never appears in any share card. Your saved catalogue lives in this browser (local-first) — no account required.</p>
      </section>
      <section className="om-panel">
        <p className="om-eyebrow">Accessibility</p>
        <p className="om-sub" style={{ margin: 0 }}>Status is shown by shape and text, not colour alone. Motion honours your system reduced-motion setting. Every core task — find, inspect, save, watch — works in Manual Sky with no camera, sensor or account.</p>
      </section>
      <section className="om-panel">
        <p className="om-eyebrow">Honesty</p>
        <p className="om-sub" style={{ margin: 0 }}>OrbitMark shows modelled positions from public elements ({core.source}). It does not detect objects through a camera, claim exact positions, or guarantee visibility.</p>
      </section>
    </>
  );
}
