/**
 * Shared catalog + observer + on-device propagation core (P3 engine wiring) used by
 * Tonight, Catalog, Manual Sky and Object detail. Loads the catalogue once, resolves the
 * observer location locally, recomputes positions every 10s, and exposes a lookFor()
 * helper. Precise location never leaves the device.
 */
import { useEffect, useMemo, useState } from "react";
import { loadCatalog, type TleObject } from "../orbital/catalog";
import { lookAngle, compass, type LookAngle, type Observer } from "../orbital/propagate";
import { satVisibility, type Visibility } from "../orbital/visibility";
import { markerKind, type MarkerKind } from "./useOverhead";

export interface Confidence {
  ageDays: number;       // TLE element age in days
  u: number;             // 0..1 uncertainty scale (older = higher)
  level: "high" | "good" | "degrading" | "low";
  label: string;         // honest, human-readable
}

export interface CatalogCore {
  status: "loading" | "ready" | "error";
  objects: TleObject[];
  observer: Observer;
  source: string;
  elementAge: string | null;
  calculatedForUtc: string;
  locationLabel: string;
  now: Date;
  error?: string;
  lookFor: (o: TleObject) => LookAngle | null;
  kindOf: (o: TleObject) => MarkerKind;
  compassOf: (az: number) => string;
  epochFor: (o: TleObject) => Date | null;
  confidenceFor: (o: TleObject) => Confidence;
  visibilityFor: (o: TleObject) => Visibility | null;
}

/** Parse the epoch (UTC) from TLE line 1 columns 19-32 (2-digit year + day-of-year.fraction). */
export function tleEpoch(line1: string): Date | null {
  if (!line1 || line1.length < 32) return null;
  const y2 = parseInt(line1.slice(18, 20), 10);
  const doy = parseFloat(line1.slice(20, 32));
  if (Number.isNaN(y2) || Number.isNaN(doy)) return null;
  const year = y2 < 57 ? 2000 + y2 : 1900 + y2;
  return new Date(Date.UTC(year, 0, 1) + (doy - 1) * 86_400_000);
}

/**
 * Honest confidence from TLE age. Grounded in arXiv:2605.19850 / Vallado: SGP4 position error is
 * ~1 km near epoch and grows along-track to tens of km within a week. We do NOT show meter precision.
 */
export function confidenceFromAge(ageDays: number): Confidence {
  const u = Math.max(0.12, Math.min(1, ageDays / 7));
  if (ageDays < 1) return { ageDays, u, level: "high", label: "fresh elements (~1 km near epoch)" };
  if (ageDays < 3) return { ageDays, u, level: "good", label: "good — error grows along-track with age" };
  if (ageDays < 7) return { ageDays, u, level: "degrading", label: "degrading — elements days old, expect several km" };
  return { ageDays, u, level: "low", label: "low — elements over a week old, error can be tens of km" };
}

const DEFAULT_OBSERVER: Observer = { latitudeDeg: 32.0853, longitudeDeg: 34.7818, heightKm: 0.04 };

function fmtUtc(d: Date) { return d.toISOString().slice(0, 16).replace("T", " ") + " UTC"; }
function ageLabel(iso: string | null): string | null {
  if (!iso) return null;
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3.6e6);
  if (Number.isNaN(h)) return null;
  if (h < 1) return "under 1 h ago";
  if (h < 48) return `${h} h ago`;
  return `${Math.floor(h / 24)} d ago`;
}

export function useCatalog(): CatalogCore {
  const [observer, setObserver] = useState<Observer>(DEFAULT_OBSERVER);
  const [locationLabel, setLocationLabel] = useState("default location (Tel Aviv)");
  const [cat, setCat] = useState<{ objects: TleObject[]; source: string; lastUpdated: string | null } | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => { setObserver({ latitudeDeg: p.coords.latitude, longitudeDeg: p.coords.longitude, heightKm: (p.coords.altitude ?? 40) / 1000 }); setLocationLabel("your device location"); },
      () => setLocationLabel("default location (Tel Aviv) — location not shared"),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    let alive = true;
    loadCatalog().then((c) => alive && setCat({ objects: c.objects, source: c.source, lastUpdated: c.lastUpdated })).catch((e) => alive && setError(String(e)));
    return () => { alive = false; };
  }, []);

  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 10_000); return () => window.clearInterval(id); }, []);

  return useMemo<CatalogCore>(() => ({
    status: error ? "error" : cat ? "ready" : "loading",
    objects: cat?.objects ?? [],
    observer,
    source: cat?.source ?? "—",
    elementAge: ageLabel(cat?.lastUpdated ?? null),
    calculatedForUtc: fmtUtc(now),
    locationLabel,
    now,
    error,
    lookFor: (o) => lookAngle(o.tleLine1, o.tleLine2, observer, now),
    kindOf: (o) => markerKind(o.objectType),
    compassOf: compass,
    epochFor: (o) => tleEpoch(o.tleLine1),
    visibilityFor: (o) => satVisibility(o.tleLine1, o.tleLine2, observer, now),
    confidenceFor: (o) => {
      const ep = tleEpoch(o.tleLine1);
      const ageDays = ep ? (now.getTime() - ep.getTime()) / 86_400_000 : 3;
      return confidenceFromAge(Math.max(0, ageDays));
    },
  }), [cat, observer, locationLabel, now, error]);
}
