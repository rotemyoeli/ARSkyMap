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
