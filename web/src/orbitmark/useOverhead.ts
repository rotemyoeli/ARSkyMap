/**
 * Live "overhead now" data for the Tonight screen (P1 foundation + P3 engine wiring).
 * Loads the catalog (backend-first, CelesTrak fallback), resolves the observer location
 * (device geolocation, Tel Aviv fallback), propagates every object on-device with
 * satellite.js, and returns those currently above the horizon, sorted by elevation.
 * Local-first: precise location stays on device and is never sent anywhere.
 */
import { useEffect, useState } from "react";
import { loadCatalog, type TleObject } from "../orbital/catalog";
import { lookAngle, compass, type Observer } from "../orbital/propagate";

export type MarkerKind = "active" | "inactive" | "rocket" | "debris";

export interface OverheadObject {
  key: string;
  noradId: number;
  name: string;
  type: string;
  kind: MarkerKind;
  elevationDeg: number;
  azimuthDeg: number;
  compass: string;
  rangeKm: number;
}

export interface OverheadState {
  status: "loading" | "ready" | "empty" | "error";
  objects: OverheadObject[];
  totalTracked: number;
  source: string;
  elementAge: string | null;
  calculatedForUtc: string;
  locationLabel: string;
  error?: string;
}

const DEFAULT_OBSERVER: Observer = { latitudeDeg: 32.0853, longitudeDeg: 34.7818, heightKm: 0.04 };

export function markerKind(objectType: string): MarkerKind {
  const t = objectType.toUpperCase();
  if (t.includes("DEB")) return "debris";
  if (t.includes("R/B") || t.includes("ROCKET")) return "rocket";
  if (t.includes("INACTIVE")) return "inactive";
  return "active"; // payload
}

function fmtUtc(d: Date): string {
  return d.toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

function ageLabel(iso: string | null): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return null;
  const h = Math.floor(ms / 3.6e6);
  if (h < 1) return "under 1 h ago";
  if (h < 48) return `${h} h ago`;
  return `${Math.floor(h / 24)} d ago`;
}

export function useOverhead(): OverheadState {
  const [observer, setObserver] = useState<Observer>(DEFAULT_OBSERVER);
  const [locationLabel, setLocationLabel] = useState("default location (Tel Aviv)");
  const [catalog, setCatalog] = useState<{ objects: TleObject[]; source: string; lastUpdated: string | null } | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [now, setNow] = useState(() => new Date());

  // Observer location (precise location stays on device).
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setObserver({ latitudeDeg: pos.coords.latitude, longitudeDeg: pos.coords.longitude, heightKm: (pos.coords.altitude ?? 40) / 1000 });
        setLocationLabel("your device location");
      },
      () => setLocationLabel("default location (Tel Aviv) — location not shared"),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    let alive = true;
    loadCatalog()
      .then((c) => { if (alive) setCatalog({ objects: c.objects, source: c.source, lastUpdated: c.lastUpdated }); })
      .catch((e) => { if (alive) setError(String(e)); });
    return () => { alive = false; };
  }, []);

  // Recompute positions every 10s (light; far from a per-frame full-catalog sweep).
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(id);
  }, []);

  if (error) {
    return { status: "error", objects: [], totalTracked: 0, source: "—", elementAge: null, calculatedForUtc: fmtUtc(now), locationLabel, error };
  }
  if (!catalog) {
    return { status: "loading", objects: [], totalTracked: 0, source: "—", elementAge: null, calculatedForUtc: fmtUtc(now), locationLabel };
  }

  const overhead: OverheadObject[] = [];
  for (const o of catalog.objects) {
    const look = lookAngle(o.tleLine1, o.tleLine2, observer, now);
    if (!look || !look.aboveHorizon) continue;
    overhead.push({
      key: `om-${o.noradId}`, noradId: o.noradId, name: o.name, type: o.objectType,
      kind: markerKind(o.objectType), elevationDeg: look.elevationDeg, azimuthDeg: look.azimuthDeg,
      compass: compass(look.azimuthDeg), rangeKm: look.rangeKm,
    });
  }
  overhead.sort((a, b) => b.elevationDeg - a.elevationDeg);

  return {
    status: overhead.length ? "ready" : "empty",
    objects: overhead,
    totalTracked: catalog.objects.length,
    source: catalog.source,
    elementAge: ageLabel(catalog.lastUpdated),
    calculatedForUtc: fmtUtc(now),
    locationLabel,
  };
}
