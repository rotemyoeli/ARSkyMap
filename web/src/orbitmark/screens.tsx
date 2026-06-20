/**
 * OrbitMark manual product loop (P5 / M1) + passes (P7): Tonight, Manual Sky, Candidate
 * list, Object detail, Catalog (save/note/tag/watch), Passes, Settings. All share the
 * on-device engine (useCatalog) and the local-first store. Claims-compliant copy
 * throughout; candidate lists never assert a single certain object.
 */
import { useMemo, useState } from "react";
import { type TleObject } from "../orbital/catalog";
import { lookAngle } from "../orbital/propagate";
import { altitudeBandKm, groundTrack } from "../orbital/orbit";
import { Marker } from "./Tonight";
import { type CatalogCore } from "./useCatalog";
import { useCatalogStore, isAnalystRange, useObservations, objectKey } from "./store";

const KIND_LABEL = { active: "Active payload", inactive: "Inactive payload", rocket: "Rocket body", debris: "Catalogued debris" } as const;

export function DataTruth({ core }: { core: CatalogCore }) {
  const cached = core.source === "cache";
  const stale = cached || (core.elementAge != null && /\d+ d ago/.test(core.elementAge));
  return (
    <div className={`om-truth${stale ? " warn" : ""}`} aria-label="Data status" aria-live="polite">
      <span><span className="om-dot" role="img" aria-label={cached ? "offline, cached elements" : stale ? "stale elements" : "fresh elements"} style={{ background: stale ? "var(--om-warning)" : "var(--om-success)" }} />
        elements <b>{core.elementAge ? `updated ${core.elementAge}` : "freshness unknown"}</b></span>
      <span>source <b>{cached ? "cached (offline)" : core.source}</b></span>
      <span>calculated for <b>{core.calculatedForUtc}</b></span>
    </div>
  );
}

const CONF_COLOR = { high: "var(--om-success)", good: "var(--om-success)", degrading: "var(--om-warning)", low: "var(--om-danger)" } as const;

function Row({ core, o, onOpen, right, badge }: { core: CatalogCore; o: TleObject; onOpen: (o: TleObject) => void; right?: React.ReactNode; badge?: React.ReactNode }) {
  const store = useCatalogStore();
  const watched = store.byId(o.noradId)?.watched;
  const conf = core.confidenceFor(o);
  return (
    <button className="om-row" type="button" onClick={() => onOpen(o)}>
      <Marker kind={core.kindOf(o)} watched={watched} uncertainty={conf.u} />
      <span style={{ minWidth: 0 }}>
        <span className="name">{o.name}{badge}</span><br />
        <span className="meta">{KIND_LABEL[core.kindOf(o)]} · #{o.noradId} · <span style={{ color: CONF_COLOR[conf.level] }} aria-label={`confidence ${conf.level}: ${conf.label}`}>conf {conf.level}</span></span>
      </span>
      <span className="om-sep">{right}</span>
    </button>
  );
}

function VisibleBadge() {
  return <span style={{ marginLeft: 8, font: "600 10px/1 var(--om-font-ui)", color: "var(--om-success)", border: "1px solid var(--om-success)", borderRadius: 999, padding: "2px 6px" }}>👁 may be visible</span>;
}

type OverheadRow = { o: TleObject; look: ReturnType<CatalogCore["lookFor"]>; vis: ReturnType<CatalogCore["visibilityFor"]> };

/** Starlink-train awareness (D5): Starlink objects above the horizon now, clustered by direction.
 * Honest framing — a "possible train" is modelled, not a confirmed sighting. */
function StarlinkTrains({ rows, core, onOpen }: { rows: OverheadRow[]; core: CatalogCore; onOpen: (o: TleObject) => void }) {
  const sl = rows.filter((r) => r.look && r.o.name.toUpperCase().startsWith("STARLINK"));
  if (sl.length < 2) return null;
  const visible = sl.filter((r) => r.vis?.mayBeVisible).length;
  // Circular mean of azimuth (atan2 of summed sin/cos) — a plain mean is wrong across 0/360°.
  const sumSin = sl.reduce((a, r) => a + Math.sin((r.look!.azimuthDeg * Math.PI) / 180), 0);
  const sumCos = sl.reduce((a, r) => a + Math.cos((r.look!.azimuthDeg * Math.PI) / 180), 0);
  const meanAz = ((Math.atan2(sumSin, sumCos) * 180) / Math.PI + 360) % 360;
  return (
    <section className="om-panel" aria-labelledby="sl-h">
      <p className="om-eyebrow" id="sl-h">Starlink overhead · {sl.length} now{visible ? ` · ${visible} may be visible` : ""}</p>
      <p className="om-sub" style={{ margin: "0 0 8px" }}>
        {sl.length >= 3
          ? `Possible Starlink train — ${sl.length} satellites modelled above your horizon, generally toward the ${core.compassOf(meanAz)}. Trains are most train-like soon after a launch; this is modelled, not a confirmed sighting.`
          : `${sl.length} Starlink satellites modelled above your horizon.`}
      </p>
      {sl.slice(0, 6).map((r) => (
        <Row key={r.o.noradId} core={core} o={r.o} onOpen={onOpen} badge={r.vis?.mayBeVisible ? <VisibleBadge /> : undefined}
          right={<>{r.look!.elevationDeg.toFixed(0)}° {core.compassOf(r.look!.azimuthDeg)}</>} />
      ))}
    </section>
  );
}

export function TonightView({ core, onOpen, onTab }: { core: CatalogCore; onOpen: (o: TleObject) => void; onTab: (t: string) => void }) {
  const overhead = useMemo(() => core.objects
    .map((o) => ({ o, look: core.lookFor(o), vis: core.visibilityFor(o) }))
    .filter((x) => x.look?.aboveHorizon)
    .sort((a, b) => (b.look!.elevationDeg - a.look!.elevationDeg)), [core]);
  const visCount = overhead.filter((x) => x.vis?.mayBeVisible).length;
  const brightCount = overhead.filter((x) => x.vis?.mayBeVisible && x.vis.magnitude != null && x.vis.magnitude < 7).length;
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
          <p className="om-eyebrow">{overhead.length} of {core.objects.length} above the horizon · {visCount} may be visible now</p>
          {overhead.slice(0, 12).map(({ o, look, vis }) => (
            <Row key={o.noradId} core={core} o={o} onOpen={onOpen} badge={vis?.mayBeVisible ? <VisibleBadge /> : undefined}
              right={<>{look!.elevationDeg.toFixed(0)}° {core.compassOf(look!.azimuthDeg)}<br /><span style={{ color: "var(--om-text-muted)", fontWeight: 500 }}>{Math.round(look!.rangeKm).toLocaleString()} km</span></>} />
          ))}
          {visCount > 0 && (
            <p className="om-sub" style={{ fontSize: 12, marginTop: 12, color: brightCount ? "var(--om-warning)" : undefined }}>
              🌃 Dark-sky lens: <b>{brightCount}</b> of the {visCount} visible are modelled brighter than the
              IAU naked-eye limit (mag&nbsp;7) — the threshold above which satellites disturb a natural sky.
            </p>
          )}
          <p className="om-sub" style={{ fontSize: 12, marginTop: 8 }}>&ldquo;May be visible&rdquo; = sunlit + your sky dark enough + above horizon. Brightness is a coarse modelled estimate, so visibility is never guaranteed.</p>
        </>}
      </section>

      <StarlinkTrains rows={overhead} core={core} onOpen={onOpen} />
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
      <div role="group" aria-label="Direction to scan" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {REGIONS.map((r) => (
          <button key={r.id} type="button" aria-pressed={region.id === r.id} onClick={() => setRegion(r)} className="om-cta secondary"
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

const TYPE_FILTERS = [
  { id: "all", label: "All" }, { id: "active", label: "Payloads" },
  { id: "debris", label: "Debris" }, { id: "rocket", label: "Rockets" },
] as const;

export function CatalogScreen({ core, onOpen }: { core: CatalogCore; onOpen: (o: TleObject) => void }) {
  const store = useCatalogStore();
  const [q, setQ] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [typeF, setTypeF] = useState<string>("all");
  const list = useMemo(() => {
    const savedIds = new Set(store.entries.map((e) => e.noradId));
    return core.objects.filter((o) =>
      (!savedOnly || savedIds.has(o.noradId)) &&
      (typeF === "all" || core.kindOf(o) === typeF) &&
      (q === "" || o.name.toLowerCase().includes(q.toLowerCase()) || String(o.noradId).includes(q)));
  }, [core.objects, q, savedOnly, typeF, store.entries]);
  return (
    <>
      <p className="om-eyebrow">My Catalog</p>
      <h1 className="om-h1">Objects {savedOnly ? "you saved" : "in the catalogue"}</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or NORAD id…" aria-label="Search the catalogue by name or NORAD id"
        style={{ width: "100%", minHeight: 44, borderRadius: 12, border: "1px solid var(--om-border-strong)", background: "var(--om-bg-panel-deep)", color: "var(--om-text-primary)", padding: "0 14px", marginBottom: 12 }} />
      <div role="group" aria-label="Catalogue filter" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button type="button" className="om-cta secondary" aria-pressed={!savedOnly} style={{ margin: 0, minHeight: 40, borderColor: !savedOnly ? "var(--om-action-primary)" : undefined }} onClick={() => setSavedOnly(false)}>All ({core.objects.length})</button>
        <button type="button" className="om-cta secondary" aria-pressed={savedOnly} style={{ margin: 0, minHeight: 40, borderColor: savedOnly ? "var(--om-action-primary)" : undefined }} onClick={() => setSavedOnly(true)}>Saved ({store.entries.length})</button>
      </div>
      <div role="group" aria-label="Filter by object type" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 12 }}>
        {TYPE_FILTERS.map((t) => (
          <button key={t.id} type="button" aria-pressed={typeF === t.id} onClick={() => setTypeF(t.id)} className="om-cta secondary"
            style={{ margin: 0, minHeight: 38, fontSize: 13, borderColor: typeF === t.id ? "var(--om-action-primary)" : undefined, color: typeF === t.id ? "var(--om-action-primary)" : undefined }}>{t.label}</button>
        ))}
      </div>
      <section className="om-panel">
        {list.length === 0 && <p className="om-sub" style={{ margin: 0 }}>{savedOnly ? "No saved objects yet — open one and tap Save." : "No matches."}</p>}
        {list.slice(0, 40).map((o) => {
          const e = store.byId(o.noradId);
          return <Row key={o.noradId} core={core} o={o} onOpen={onOpen}
            right={e ? <span style={{ color: "var(--om-success)" }}>saved{e.watched ? <span aria-label="watched"> ★</span> : ""}</span> : <span style={{ color: "var(--om-text-muted)" }}>open →</span>} />;
        })}
      </section>
    </>
  );
}

function GroundTrack({ o, core }: { o: TleObject; core: CatalogCore }) {
  const u = core.confidenceFor(o).u;
  const periodMin = core.orbitFor(o)?.periodMin ?? 95;
  const pts = useMemo(() => groundTrack(o.tleLine1, o.tleLine2, core.now, periodMin), [o.noradId, core.now, periodMin]);
  if (pts.length < 2) return null;
  const X = (lon: number) => lon + 180;
  const Y = (lat: number) => 90 - lat;
  const segs: string[] = [];
  let cur = `M ${X(pts[0].lon).toFixed(1)} ${Y(pts[0].lat).toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    if (Math.abs(pts[i].lon - pts[i - 1].lon) > 180) { segs.push(cur); cur = `M ${X(pts[i].lon).toFixed(1)} ${Y(pts[i].lat).toFixed(1)}`; }
    else cur += ` L ${X(pts[i].lon).toFixed(1)} ${Y(pts[i].lat).toFixed(1)}`;
  }
  segs.push(cur);
  const tube = (1 + 5 * u).toFixed(1);
  return (
    <section className="om-panel">
      <p className="om-eyebrow">Orbit track · uncertainty widens with element age</p>
      <svg viewBox="0 0 360 180" width="100%" role="img" aria-label="Modelled ground track of the orbit over one revolution, with an along-track uncertainty band" style={{ background: "var(--om-bg-panel-deep)", borderRadius: 12, display: "block" }}>
        <rect x="0.5" y="0.5" width="359" height="179" fill="none" stroke="var(--om-border-hairline)" />
        <line x1="0" y1="90" x2="360" y2="90" stroke="var(--om-border-hairline)" />
        <line x1="180" y1="0" x2="180" y2="180" stroke="var(--om-border-hairline)" />
        {segs.map((d, i) => <path key={`t${i}`} d={d} fill="none" stroke="var(--om-action-primary)" strokeOpacity={0.18} strokeWidth={tube} strokeLinecap="round" />)}
        {segs.map((d, i) => <path key={`l${i}`} d={d} fill="none" stroke="var(--om-action-primary)" strokeOpacity={0.9} strokeWidth="0.8" />)}
        <circle cx={X(pts[0].lon)} cy={Y(pts[0].lat)} r="2.6" fill="var(--om-action-primary)" />
      </svg>
      <p className="om-sub" style={{ margin: "8px 0 0", fontSize: 12 }}>
        Modelled ground track over one orbit (equirectangular world). The faint band is the along-track position
        uncertainty — it widens as the elements age. Most maps draw a confident line; this one shows the doubt.
      </p>
    </section>
  );
}

export function ObjectDetail({ o, core, onBack }: { o: TleObject; core: CatalogCore; onBack: () => void }) {
  const store = useCatalogStore();
  const entry = store.byId(o.noradId);
  const look = core.lookFor(o);
  const [note, setNote] = useState(entry?.note ?? "");
  const [tagText, setTagText] = useState((entry?.tags ?? []).join(", "));
  const [confirmRemove, setConfirmRemove] = useState(false);
  const identityLimited = isAnalystRange(o.noradId);
  const cell = (k: string, v: string) => (
    <div className="om-passcell"><div className="k">{k}</div><div className="v">{v}</div></div>
  );
  const conf = core.confidenceFor(o);
  const epoch = core.epochFor(o);
  const vis = core.visibilityFor(o);
  const orbit = core.orbitFor(o);
  const saveAll = () => {
    store.save({ noradId: o.noradId, name: o.name, type: o.objectType });
    store.setNote(o.noradId, note);
    store.setTags(o.noradId, tagText.split(",").map((t) => t.trim()).filter(Boolean));
  };
  return (
    <>
      <button type="button" className="om-cta secondary" style={{ margin: "0 0 16px", minHeight: 40, width: "auto", padding: "0 16px" }} onClick={onBack}>← Back</button>
      <p className="om-eyebrow">{KIND_LABEL[core.kindOf(o)]}</p>
      <h1 className="om-h1" style={{ display: "flex", alignItems: "center", gap: 10 }}><Marker kind={core.kindOf(o)} watched={entry?.watched} uncertainty={conf.u} /> {o.name}</h1>
      <DataTruth core={core} />
      <section className="om-panel">
        <p className="om-eyebrow">Honest record</p>
        <div className="om-passgrid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {cell("Catalog ID", `#${o.noradId}`)}
          {cell("Source", core.source)}
          {cell("Element epoch", epoch ? epoch.toISOString().slice(0, 16).replace("T", " ") + " UTC" : "—")}
          {cell("Element age", `${conf.ageDays.toFixed(1)} d`)}
          {cell("Azimuth", look ? `${look.azimuthDeg.toFixed(1)}° ${core.compassOf(look.azimuthDeg)}` : "—")}
          {cell("Elevation", look ? `${look.elevationDeg.toFixed(1)}°` : "—")}
          {cell("Range", look ? `${Math.round(look.rangeKm).toLocaleString()} km` : "—")}
          {cell("Above horizon", look ? (look.aboveHorizon ? "yes" : "no") : "—")}
          {cell("Sunlit", vis ? (vis.sunlit ? "yes" : "in Earth's shadow") : "—")}
          {cell("Your sky", vis ? (vis.observerDark ? `dark (Sun ${vis.sunElevationDeg.toFixed(0)}°)` : `too bright (Sun ${vis.sunElevationDeg.toFixed(0)}°)`) : "—")}
          {cell("May be visible", vis ? (vis.mayBeVisible ? "yes — modelled" : "no") : "—")}
          {cell("Brightness", vis && vis.magnitude != null ? `~mag ${vis.magnitude.toFixed(1)} · ${vis.brightnessClass}` : "—")}
        </div>
        <p className="om-sub" style={{ marginTop: 12, fontSize: 12 }}>
          <span style={{ color: CONF_COLOR[conf.level] }}>Confidence: {conf.level}</span> — {conf.label}.
          Geometric, modelled for {core.calculatedForUtc}; the uncertainty ring grows with element age.
          Visibility = sunlit + your sky dark + above horizon (modelled; simplified cylindrical Earth-shadow
          test, darkness = Sun below −6°); brightness/magnitude not yet computed, so &ldquo;may be visible&rdquo;
          is never a guarantee.
        </p>
      </section>
      {orbit && (
        <section className="om-panel">
          <p className="om-eyebrow">Orbit{orbit.decaying ? " · ⚠ decaying" : ""}</p>
          <div className="om-passgrid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {cell("Perigee", `${Math.round(orbit.perigeeKm).toLocaleString()} km`)}
            {cell("Apogee", `${Math.round(orbit.apogeeKm).toLocaleString()} km`)}
            {cell("Period", Number.isFinite(orbit.periodMin) ? `${orbit.periodMin.toFixed(1)} min` : "—")}
            {cell("Inclination", `${orbit.inclinationDeg.toFixed(1)}°`)}
          </div>
          {orbit.decaying && (
            <p className="om-sub" style={{ margin: "12px 0 0", fontSize: 12, color: "var(--om-warning)" }}>
              Low perigee with drag — <b>modelled as decaying</b> and may re-enter relatively soon. This is a
              coarse estimate from the element set, not a precise re-entry time or location.
            </p>
          )}
        </section>
      )}
      <GroundTrack o={o} core={core} />
      <section className="om-panel">
        <p className="om-eyebrow">Save &amp; annotate · the wedge</p>
        {identityLimited ? (
          <p className="om-sub" style={{ margin: 0, color: "var(--om-warning)" }}>
            Identity-limited: this is an analyst/provisional object (range 80000–89999) whose number can
            be reused. It is excluded from the personal catalogue until a lineage-safe identity is approved,
            so it can&apos;t be saved or watched.
          </p>
        ) : (
          <>
            <label htmlFor="om-note" className="meta" style={{ display: "block", marginBottom: 6 }}>Note</label>
            <textarea id="om-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why you saved it…" rows={3}
              style={{ width: "100%", borderRadius: 12, border: "1px solid var(--om-border-strong)", background: "var(--om-bg-panel-deep)", color: "var(--om-text-primary)", padding: 12, marginBottom: 8, fontFamily: "var(--om-font-ui)" }} />
            <label htmlFor="om-tags" className="meta" style={{ display: "block", marginBottom: 6 }}>Tags (comma separated)</label>
            <input id="om-tags" value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="e.g. iss, watchlist"
              style={{ width: "100%", minHeight: 44, borderRadius: 12, border: "1px solid var(--om-border-strong)", background: "var(--om-bg-panel-deep)", color: "var(--om-text-primary)", padding: "0 14px", marginBottom: 12 }} />
            <button type="button" className="om-cta" onClick={saveAll}>{entry ? "Update saved object" : "Save to catalogue"}</button>
            {entry && <button type="button" className="om-cta secondary" aria-pressed={entry.watched} onClick={() => store.toggleWatch(o.noradId)}>{entry.watched ? "★ Watching — stop watching" : "☆ Watch this object"}</button>}
            {entry && !confirmRemove && <button type="button" className="om-cta secondary" style={{ borderColor: "var(--om-danger)", color: "var(--om-danger)" }} onClick={() => setConfirmRemove(true)}>Remove from catalogue</button>}
            {entry && confirmRemove && (
              <div role="alertdialog" aria-label="Confirm remove" style={{ marginTop: 8 }}>
                <p className="om-sub" style={{ margin: "0 0 8px", color: "var(--om-danger)" }}>Remove &ldquo;{o.name}&rdquo; and its note/tags from your catalogue?</p>
                <button type="button" className="om-cta" style={{ background: "var(--om-danger)", color: "#1a0606" }} onClick={() => { store.remove(o.noradId); onBack(); }}>Yes, remove</button>
                <button type="button" className="om-cta secondary" onClick={() => setConfirmRemove(false)}>Keep it</button>
              </div>
            )}
          </>
        )}
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

function PassReminder({ name, rise }: { name: string; rise: Date }) {
  const [state, setState] = useState<"idle" | "set" | "denied" | "past">("idle");
  const leadMs = 5 * 60_000;
  const fireAt = rise.getTime() - leadMs;
  const set = async () => {
    if (fireAt <= Date.now()) { setState("past"); return; }
    if (!("Notification" in window)) { setState("denied"); return; }
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm !== "granted") { setState("denied"); return; }
    window.setTimeout(() => {
      try { new Notification("OrbitMark — pass soon", { body: `${name} rises around ${rise.toISOString().slice(11, 16)} UTC (modelled). Your OS may deliver this early or late.` }); } catch { /* ignore */ }
    }, fireAt - Date.now());
    setState("set");
  };
  if (state === "set") return <p className="om-sub" style={{ margin: "8px 0 0", color: "var(--om-success)" }}>Reminder set ~5 min before (works while OrbitMark stays open).</p>;
  if (state === "denied") return <p className="om-sub" style={{ margin: "8px 0 0", color: "var(--om-warning)" }}>Notifications unavailable/blocked — enable them in your browser to get reminders.</p>;
  if (state === "past") return <p className="om-sub" style={{ margin: "8px 0 0", color: "var(--om-text-muted)" }}>This pass is too soon to remind.</p>;
  return <button type="button" className="om-cta secondary" style={{ marginTop: 8 }} onClick={set}>Remind me ~5 min before</button>;
}

function Sighting({ noradId, name, modelledUtc }: { noradId: number; name: string; modelledUtc: string }) {
  const { log, lastFor } = useObservations();
  const last = lastFor(objectKey(noradId));
  const fmtResidual = (s: number) => `${s >= 0 ? "+" : "−"}${Math.abs(s)} s vs modelled`;
  return (
    <div style={{ marginTop: 8 }}>
      <button type="button" className="om-cta secondary" style={{ margin: 0 }} onClick={() => log(objectKey(noradId), name, modelledUtc)}>👁 I saw it now</button>
      {last && <p className="om-sub" style={{ margin: "8px 0 0", fontSize: 12, color: "var(--om-success)" }}>Logged: you observed it <b>{fmtResidual(last.residualSec)}</b> max. Your sightings help calibrate confidence.</p>}
    </div>
  );
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
          <PassReminder name={p.o.name} rise={p.rise} />
          <Sighting noradId={p.o.noradId} name={p.o.name} modelledUtc={p.max.toISOString()} />
        </section>
      ))}
    </>
  );
}

function LearnCard({ title, children, source }: { title: string; children: React.ReactNode; source: string }) {
  return (
    <section className="om-panel">
      <p className="om-eyebrow">{title}</p>
      <p className="om-sub" style={{ margin: 0 }}>{children}</p>
      <p className="meta" style={{ marginTop: 8, color: "var(--om-text-muted)" }}>Source: {source}</p>
    </section>
  );
}

/** Crowded shells (Idea 4) — educational orbital-density by altitude band. NOT collision prediction. */
function CrowdedShells({ core }: { core: CatalogCore }) {
  const bands = new Map<number, number>();
  for (const o of core.objects) {
    const p = core.orbitFor(o);
    if (!p || p.perigeeKm < 0 || p.apogeeKm > 60000) continue;
    const b = altitudeBandKm(p);
    bands.set(b, (bands.get(b) ?? 0) + 1);
  }
  const rows = [...bands.entries()].filter(([b]) => b >= 200 && b <= 2000).sort((a, b) => b[0] - a[0]);
  const max = Math.max(1, ...rows.map(([, c]) => c));
  return (
    <section className="om-panel" aria-labelledby="shells-h">
      <p className="om-eyebrow" id="shells-h">Crowded shells · where the catalogue concentrates</p>
      {rows.map(([band, count]) => (
        <div key={band} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
          <span style={{ width: 72, font: "600 12px/1 var(--om-font-mono)", color: "var(--om-text-secondary)" }}>~{band} km</span>
          <span style={{ flex: 1, height: 10, background: "var(--om-bg-panel-deep)", borderRadius: 6, overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${(count / max) * 100}%`, background: "var(--om-action-primary)" }} />
          </span>
          <span style={{ width: 32, textAlign: "right", font: "600 12px/1 var(--om-font-mono)" }}>{count}</span>
        </div>
      ))}
      <p className="om-sub" style={{ margin: "12px 0 0", fontSize: 12 }}>
        How many tracked objects share each ~100 km altitude band — a teaching view of congestion (e.g. the
        Starlink shells and the debris-heavy ~800 km region). This is <b>aggregate density education only</b>,
        not a conjunction or collision prediction.
      </p>
    </section>
  );
}

/** Learn (S-14) — reviewed, sourced explainers (differentiator D3). No unreviewed claim ships. */
export function LearnScreen({ core }: { core: CatalogCore }) {
  return (
    <>
      <p className="om-eyebrow">Learn</p>
      <h1 className="om-h1">How to read the sky honestly</h1>
      <CrowdedShells core={core} />
      <LearnCard title="Modelled, not detected" source="CelesTrak GP data formats (T.S. Kelso)">
        OrbitMark computes each position with the SGP4 model from public orbital elements — it never
        senses or &ldquo;detects&rdquo; an object through your camera. What you see is a calculation, shown as a
        candidate, never a single certain object.
      </LearnCard>
      <LearnCard title="Why a position is a region, not a point" source="Oltrogge & Vallado, AMOS 2014; Vallado et al., 'Revisiting Spacetrack Report #3' (AIAA 2006-6753); corroborated by Jankovic 2026 (arXiv:2605.19850)">
        Public elements (TLEs) are accurate to roughly a kilometre near their epoch, and the error grows
        — mostly along the orbit track — to tens of kilometres within about a week. That is why our
        uncertainty ring grows as the elements age, and why we show each object&apos;s element age and confidence.
      </LearnCard>
      <LearnCard title="When a satellite may be visible" source="Fankhauser, Tyson &amp; Askari 2023, AJ 166:59 (arXiv:2305.11123)">
        A satellite is visible only when it is sunlit, your sky is dark (the Sun well below the horizon),
        and it is above your horizon — usually the hour after dusk or before dawn. Brightness depends on the
        object and is modelled, so &ldquo;may be visible&rdquo; is never a guarantee.
      </LearnCard>
      <LearnCard title="Orbital debris & a sustainable sky" source="IAU CPS (cps.iau.org); MNRAS Letters 544:L15 (2025)">
        OrbitMark tracks catalogued debris alongside active satellites. The astronomy community (IAU)
        recommends that operational satellites stay faint enough to not disturb the unaided-eye sky, and
        studies find many exceed that. Showing debris and brightness honestly is part of keeping space sustainable.
      </LearnCard>
      <p className="om-sub" style={{ fontSize: 12, color: "var(--om-text-muted)" }}>These explainers are reviewed and sourced; OrbitMark does not ship unverified factual claims.</p>
    </>
  );
}

function DataStatus({ core }: { core: CatalogCore }) {
  const ages = { high: 0, good: 0, degrading: 0, low: 0 };
  const kinds = { active: 0, inactive: 0, rocket: 0, debris: 0 };
  let decaying = 0;
  for (const o of core.objects) { ages[core.confidenceFor(o).level]++; kinds[core.kindOf(o)]++; if (core.orbitFor(o)?.decaying) decaying++; }
  const cell = (k: string, v: string) => <div className="om-passcell"><div className="k">{k}</div><div className="v">{v}</div></div>;
  return (
    <section className="om-panel" aria-labelledby="ds-h">
      <p className="om-eyebrow" id="ds-h">Data status · pipeline transparency</p>
      <div className="om-passgrid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {cell("Source lane", core.source === "cache" ? "cached (offline)" : core.source)}
        {cell("Objects", String(core.objects.length))}
        {cell("Payloads", String(kinds.active + kinds.inactive))}
        {cell("Debris", String(kinds.debris))}
        {cell("Rocket bodies", String(kinds.rocket))}
        {cell("Catalogue age", core.elementAge ? `updated ${core.elementAge}` : "unknown")}
        {cell("Decaying", `${decaying} low-perigee`)}
      </div>
      <p className="om-sub" style={{ margin: "12px 0 0", fontSize: 12 }}>
        Element freshness: <b style={{ color: "var(--om-success)" }}>{ages.high + ages.good} fresh/good</b> ·
        {" "}<b style={{ color: "var(--om-warning)" }}>{ages.degrading} degrading</b> ·
        {" "}<b style={{ color: "var(--om-danger)" }}>{ages.low} over a week old</b>.
        Public elements from CelesTrak; we never serve silently-stale data — every object shows its epoch and confidence.
      </p>
    </section>
  );
}

export function SettingsScreen({ core }: { core: CatalogCore }) {
  return (
    <>
      <p className="om-eyebrow">Settings · privacy &amp; accessibility</p>
      <h1 className="om-h1">Your data, on your device</h1>
      <DataStatus core={core} />
      <section className="om-panel">
        <p className="om-eyebrow">Our promise</p>
        <p className="om-sub" style={{ margin: 0 }}>
          <b>No ads. No account. No tracking.</b> Precise location is used only on this device to compute
          modelled positions ({core.locationLabel}) — never sent to a server, never in a share card. Your
          saved catalogue lives in this browser (local-first) and works offline once loaded.
        </p>
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
