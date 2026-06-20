/**
 * Local-first catalog store (P5 wedge). Save / note / tag / watch, keyed by object_key
 * (OrbitMark identity; here the NORAD id namespaced as `om:<id>` until a lineage-safe
 * identity ADR introduces UUIDs). Persisted in localStorage — no account, fully offline.
 * Per the design contract, analyst-range identities (80000-89999) are excluded from save.
 */
import { useCallback, useSyncExternalStore } from "react";

export interface SavedEntry {
  objectKey: string;
  noradId: number;
  name: string;
  type: string;
  note: string;
  tags: string[];
  watched: boolean;
  savedAtUtc: string;
}

const KEY = "orbitmark.catalog.v1";
const listeners = new Set<() => void>();

function read(): Record<string, SavedEntry> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function write(data: Record<string, SavedEntry>) {
  localStorage.setItem(KEY, JSON.stringify(data));
  listeners.forEach((l) => l());
}

export function objectKey(noradId: number): string { return `om:${noradId}`; }
export function isAnalystRange(noradId: number): boolean { return noradId >= 80000 && noradId <= 89999; }

function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }
let cache = read();
function snapshot() { return cache; }
function refresh() { cache = read(); }

// ---- Observations (Idea 2: observed vs modelled) ----
export interface Observation {
  objectKey: string;
  name: string;
  modelledUtc: string;   // modelled reference instant (e.g. pass max)
  observedUtc: string;   // when the user said "I saw it"
  residualSec: number;   // observed - modelled, seconds (the honesty feedback)
}
const OBS_KEY = "orbitmark.observations.v1";
function readObs(): Observation[] { try { return JSON.parse(localStorage.getItem(OBS_KEY) || "[]"); } catch { return []; } }
function writeObs(arr: Observation[]) { localStorage.setItem(OBS_KEY, JSON.stringify(arr)); listeners.forEach((l) => l()); }
let obsCache = readObs();
function obsSnapshot() { return obsCache; }
function refreshObs() { obsCache = readObs(); }

export function useObservations() {
  const observations = useSyncExternalStore(subscribe, obsSnapshot);
  const log = useCallback((objectKey: string, name: string, modelledUtc: string) => {
    const observedUtc = new Date().toISOString();
    const residualSec = Math.round((Date.now() - new Date(modelledUtc).getTime()) / 1000);
    const all = [{ objectKey, name, modelledUtc, observedUtc, residualSec }, ...readObs()].slice(0, 100);
    writeObs(all); refreshObs();
  }, []);
  const lastFor = (objectKey: string) => observations.find((o) => o.objectKey === objectKey) ?? null;
  return { observations, log, lastFor };
}

export function useCatalogStore() {
  const data = useSyncExternalStore(subscribe, snapshot);

  const save = useCallback((o: { noradId: number; name: string; type: string }) => {
    if (isAnalystRange(o.noradId)) return; // excluded from the public MVP package
    const all = read();
    const key = objectKey(o.noradId);
    if (!all[key]) {
      all[key] = { objectKey: key, noradId: o.noradId, name: o.name, type: o.type, note: "", tags: [], watched: false, savedAtUtc: new Date().toISOString() };
      write(all); refresh();
    }
  }, []);

  const remove = useCallback((noradId: number) => { const all = read(); delete all[objectKey(noradId)]; write(all); refresh(); }, []);
  const toggleWatch = useCallback((noradId: number) => { const all = read(); const e = all[objectKey(noradId)]; if (e) { e.watched = !e.watched; write(all); refresh(); } }, []);
  const setNote = useCallback((noradId: number, note: string) => { const all = read(); const e = all[objectKey(noradId)]; if (e) { e.note = note; write(all); refresh(); } }, []);
  const setTags = useCallback((noradId: number, tags: string[]) => { const all = read(); const e = all[objectKey(noradId)]; if (e) { e.tags = tags; write(all); refresh(); } }, []);

  return { entries: Object.values(data), byId: (n: number) => data[objectKey(n)], save, remove, toggleWatch, setNote, setTags };
}
