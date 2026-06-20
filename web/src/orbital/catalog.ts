// Catalog source for the spike: prefer the backend (/api/satellites), fall back to
// CelesTrak directly if the backend is empty or unreachable so the AR loop can run
// before the ingest pipeline is wired in any given environment.

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const CELESTRAK_GP = "https://celestrak.org/NORAD/elements/gp.php";

export interface TleObject {
  noradId: number;
  name: string;
  objectType: string;
  tleLine1: string;
  tleLine2: string;
}

export interface Catalog {
  source: "backend" | "celestrak" | "cache";
  lastUpdated: string | null;
  objects: TleObject[];
}

function classify(name: string): string {
  const u = name.toUpperCase();
  if (u.includes(" DEB") || u.endsWith("DEB")) return "DEBRIS";
  if (u.includes("R/B")) return "ROCKET BODY";
  return "PAYLOAD";
}

function parseTleText(text: string, objectType?: string): TleObject[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);
  const out: TleObject[] = [];
  for (let i = 0; i + 2 < lines.length + 1; i += 3) {
    const name = lines[i];
    const l1 = lines[i + 1];
    const l2 = lines[i + 2];
    if (!l1?.startsWith("1 ") || !l2?.startsWith("2 ")) continue;
    const noradId = parseInt(l1.slice(2, 7), 10);
    if (Number.isNaN(noradId)) continue;
    out.push({
      noradId,
      name: name.trim(),
      objectType: objectType ?? classify(name),
      tleLine1: l1,
      tleLine2: l2,
    });
  }
  return out;
}

async function fromBackend(): Promise<Catalog | null> {
  try {
    const r = await fetch(`${API_BASE}/satellites?limit=500`);
    if (!r.ok) return null;
    const data = await r.json();
    if (!data.items?.length) return null;
    const objects: TleObject[] = data.items
      .filter((it: any) => it.tle_line1 && it.tle_line2)
      .map((it: any) => ({
        noradId: it.norad_id,
        name: it.name,
        objectType: it.object_type,
        tleLine1: it.tle_line1,
        tleLine2: it.tle_line2,
      }));
    if (!objects.length) return null;
    return { source: "backend", lastUpdated: data.last_updated ?? null, objects };
  } catch {
    return null;
  }
}

async function fromCelestrak(group: string, objectType?: string): Promise<TleObject[]> {
  const url = `${CELESTRAK_GP}?GROUP=${encodeURIComponent(group)}&FORMAT=tle`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`CelesTrak ${group} ${r.status}`);
  return parseTleText(await r.text(), objectType);
}

const CACHE_KEY = "orbitmark.catalog.cache.v1";

/** Persist the last good catalogue for offline / local-first use (M2). */
function writeCache(cat: Catalog) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...cat, cachedAt: new Date().toISOString() })); } catch { /* quota */ }
}
function readCache(): Catalog | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c.objects?.length) return null;
    // Mark as cached so the UI can show "using cached data".
    return { source: "cache", lastUpdated: c.lastUpdated ?? c.cachedAt ?? null, objects: c.objects };
  } catch { return null; }
}

/**
 * Load the catalogue: backend first, then CelesTrak direct, then the last good local cache
 * (so the app keeps working offline / local-first). Every successful network load is cached.
 */
export async function loadCatalog(): Promise<Catalog> {
  const backend = await fromBackend();
  if (backend) { writeCache(backend); return backend; }

  try {
    const [stations, debris] = await Promise.all([
      fromCelestrak("stations"),
      fromCelestrak("cosmos-2251-debris", "DEBRIS"),
    ]);
    const cat: Catalog = { source: "celestrak", lastUpdated: null, objects: [...stations, ...debris.slice(0, 50)] };
    if (cat.objects.length) { writeCache(cat); return cat; }
  } catch { /* fall through to cache */ }

  const cached = readCache();
  if (cached) return cached;
  throw new Error("offline and no cached catalogue yet");
}

/** Pick the ISS plus the first debris object for the spike's two-object render. */
export function pickSpikeTargets(objects: TleObject[]): TleObject[] {
  const iss =
    objects.find((o) => o.noradId === 25544) ||
    objects.find((o) => /ISS|ZARYA/i.test(o.name));
  const debris = objects.find((o) => o.objectType === "DEBRIS");
  return [iss, debris].filter((o): o is TleObject => Boolean(o));
}
