const CACHE_VERSION = "stockflow-v2";
const STATIC_CACHE = "stockflow-static-v2";
const DYNAMIC_CACHE = "stockflow-dynamic-v2";
const OFFLINE_PAGE = "/offline";

// Pre-cache critical assets
const PRE_CACHE_ASSETS = [
  "/",
  "/login",
  "/signup",
  "/offline",
  "/manifest.json",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install - pre-cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRE_CACHE_ASSETS).catch((err) => {
        console.log("Pre-cache failed for some assets:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Helper: check if request is for same origin
function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

// Helper: check if request is for API
function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

// Helper: check if request is for static asset
function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(url.pathname);
}

// Fetch - offline-first strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith("http")) return;

  // API requests - network first, cache fallback
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, cloned);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return JSON error for API calls
            return new Response(
              JSON.stringify({ error: "أنت أوفلاين" }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - cache first, network fallback
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const cloned = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, cloned);
              });
            }
            return response;
          })
          .catch(() => {
            // Return empty for missing static assets
            return new Response("", { status: 404 });
          });
      })
    );
    return;
  }

  // Navigation requests (HTML pages) - network first, cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, cloned);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return offline page for navigation
            return caches.match(OFFLINE_PAGE).then((offlinePage) => {
              return offlinePage || new Response("Offline", { status: 503 });
            });
          });
        })
    );
    return;
  }

  // Other requests - network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && isSameOrigin(url)) {
          const cloned = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, cloned);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SYNC_REQUEST" });
        });
      })
    );
  }
});

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {
    title: "StockFlow",
    body: "لديك إشعار جديد",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
      data: data.url || "/dashboard",
      actions: [
        { action: "open", title: "فتح" },
        { action: "dismiss", title: "تجاهل" },
      ],
    })
  );
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  event.waitUntil(
    self.clients.openWindow(event.notification.data || "/dashboard")
  );
});

// Message handler for cache invalidation
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "CACHE_URLS") {
    const urlsToCache = event.data.urls || [];
    caches.open(DYNAMIC_CACHE).then((cache) => {
      return cache.addAll(urlsToCache);
    });
  }
});
