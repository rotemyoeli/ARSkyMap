import { useEffect, useMemo, useRef, useState } from "react";
import { loadCatalog, pickSpikeTargets, type TleObject } from "./orbital/catalog";
import { lookAngle, compass, type Observer } from "./orbital/propagate";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

// Fallback observer (Tel Aviv) until the browser grants geolocation, so the spike
// renders something meaningful on first paint.
const DEFAULT_OBSERVER: Observer = {
  latitudeDeg: 32.0853,
  longitudeDeg: 34.7818,
  heightKm: 0.04,
};

export default function App() {
  const [backend, setBackend] = useState("checking…");
  const [observer, setObserver] = useState<Observer>(DEFAULT_OBSERVER);
  const [geoNote, setGeoNote] = useState("using default location (Tel Aviv)");
  const [targets, setTargets] = useState<TleObject[]>([]);
  const [catalogNote, setCatalogNote] = useState("loading catalog…");
  const [now, setNow] = useState<Date>(() => new Date());
  const tick = useRef<number | null>(null);

  // Backend health (kept from the M(-1) shell).
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then((d) => setBackend(`backend: ${d.status} (dev_mode=${d.dev_mode})`))
      .catch(() => setBackend("backend: unreachable"));
  }, []);

  // Observer location.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setObserver({
          latitudeDeg: pos.coords.latitude,
          longitudeDeg: pos.coords.longitude,
          heightKm: (pos.coords.altitude ?? 40) / 1000,
        });
        setGeoNote("using your device location");
      },
      () => setGeoNote("location denied — using default (Tel Aviv)"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  // Catalog (ISS + a debris object).
  useEffect(() => {
    loadCatalog()
      .then((cat) => {
        const picked = pickSpikeTargets(cat.objects);
        setTargets(picked);
        const fresh = cat.lastUpdated ? `, updated ${cat.lastUpdated}` : "";
        setCatalogNote(
          `source: ${cat.source} (${cat.objects.length} objects${fresh})`,
        );
      })
      .catch((e) => setCatalogNote(`catalog error: ${String(e)}`));
  }, []);

  // 1 Hz clock so Alt/Az updates live.
  useEffect(() => {
    tick.current = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, []);

  const rows = useMemo(
    () =>
      targets.map((t) => ({
        obj: t,
        look: lookAngle(t.tleLine1, t.tleLine2, observer, now),
      })),
    [targets, observer, now],
  );

  return (
    <main style={{ fontFamily: "system-ui", padding: 24, maxWidth: 760 }}>
      <h1>AR Sky-Map — M0 spike</h1>
      <p>Honest, model-based AR companion for satellites &amp; orbital debris.</p>

      <section style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
        <div>{backend}</div>
        <div>{catalogNote}</div>
        <div>{geoNote}</div>
        <div>
          observer: {observer.latitudeDeg.toFixed(4)}°,{" "}
          {observer.longitudeDeg.toFixed(4)}° · UTC {now.toISOString()}
        </div>
      </section>

      <table
        style={{ marginTop: 16, borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
            <th style={th}>Object</th>
            <th style={th}>Type</th>
            <th style={th}>Az</th>
            <th style={th}>Alt</th>
            <th style={th}>Range</th>
            <th style={th}>Visible?</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ obj, look }) => (
            <tr key={obj.noradId} style={{ borderBottom: "1px solid #eee" }}>
              <td style={td}>
                {obj.name}
                <span style={{ color: "#999" }}> #{obj.noradId}</span>
              </td>
              <td style={td}>{obj.objectType}</td>
              <td style={td}>
                {look
                  ? `${look.azimuthDeg.toFixed(1)}° ${compass(look.azimuthDeg)}`
                  : "—"}
              </td>
              <td style={td}>{look ? `${look.elevationDeg.toFixed(1)}°` : "—"}</td>
              <td style={td}>{look ? `${Math.round(look.rangeKm)} km` : "—"}</td>
              <td style={td}>
                {look ? (look.aboveHorizon ? "✅ above horizon" : "below") : "—"}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td style={td} colSpan={6}>
                no targets yet…
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p style={{ fontSize: 12, color: "#888", marginTop: 16 }}>
        GATE check: compare Az/Alt above against Heavens-Above for the same UTC
        instant and observer location.
      </p>
    </main>
  );
}

const th: React.CSSProperties = { padding: "6px 8px", fontWeight: 600 };
const td: React.CSSProperties = { padding: "6px 8px" };
