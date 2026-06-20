/**
 * Shared catalog + observer + on-device propagation core (P3 engine wiring) used by
 * Tonight, Catalog, Manual Sky and Object detail. Loads the catalogue once, resolves the
 * observer location locally, recomputes positions every 10s, and exposes a lookFor()
 * helper. Precise location never leaves the device.
 */
import { useEffect, useMemo, useState } from "react";
import { loadCatalog, type TleObject } from "../orbital/catalog";
import { lookAngle, compass, type LookAngle, type Observer } from "../orbital/propagate";
import { markerKind, type MarkerKind } from "./useOverhead";

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
  }), [cat, observer, locationLabel, now, error]);
}
