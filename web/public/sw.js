/* OrbitMark service worker (M2 offline shell). Network-first with cache fallback so the
   app keeps loading offline; orbital data also has a localStorage cache in the app. */
const CACHE = "orbitmark-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.protocol !== "https:") return;
  // Don't SW-cache dynamic orbital data — it has its own freshness-aware localStorage cache,
  // and SW-caching it risks serving silently-stale TLEs (security review SP-3).
  if (url.pathname.includes("/api/") || url.hostname.includes("celestrak")) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("/")))
  );
});
