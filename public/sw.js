// YONNE Service Worker — PWA offline cache + Web Push notifications
const CACHE = "yonne-v1";
const OFFLINE = "/driver/carte";

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll([OFFLINE, "/"]))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch — network-first, offline fallback ────────────────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const { pathname } = new URL(event.request.url);
  // Never intercept API calls or Supabase realtime
  if (pathname.startsWith("/api/") || event.request.url.includes("supabase")) return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((r) => r ?? caches.match(OFFLINE))
    )
  );
});

// ── Push — display notification to driver ──────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const title = payload.title ?? "YONNE";
  const body  = payload.body  ?? "Nouvelle commande disponible";
  const data  = payload.data  ?? {};

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:      "/icon.svg",
      badge:     "/icon.svg",
      data,
      tag:       "yonne-order",
      renotify:  true,
      vibrate:   [200, 100, 200],
    })
  );
});

// ── Notification click — focus or open driver map ──────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find((c) => c.url.includes("/driver"));
        if (existing) return existing.focus();
        return clients.openWindow(OFFLINE);
      })
  );
});
