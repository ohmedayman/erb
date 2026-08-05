const CACHE_NAME = "stockflow-v1";
const STATIC_CACHE = "stockflow-static-v1";
const DYNAMIC_CACHE = "stockflow-dynamic-v1";

const STATIC_ASSETS = [
  "/",
  "/login",
  "/signup",
  "/dashboard",
  "/dashboard/pos",
  "/dashboard/products",
  "/dashboard/orders",
  "/dashboard/invoices",
  "/dashboard/customers",
  "/dashboard/inventory",
  "/dashboard/expenses",
  "/dashboard/employees",
  "/dashboard/shipping",
  "/dashboard/installments",
  "/dashboard/accounts",
  "/dashboard/journal",
  "/dashboard/purchase-orders",
  "/dashboard/warehouses",
  "/dashboard/suppliers",
  "/dashboard/stock-movements",
  "/dashboard/returns",
  "/dashboard/analytics",
  "/dashboard/reports",
  "/dashboard/reports/profit-loss",
  "/dashboard/activity-log",
  "/dashboard/notifications",
  "/dashboard/team",
  "/dashboard/settings",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

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

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/api/")) {
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
          return caches.match(request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
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
          if (cached) return cached;
          if (request.destination === "document") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503 });
        });

      return cached || fetchPromise;
    })
  );
});

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

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {
    title: "StockFlow",
    body: " لديك إشعار جديد",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
      data: data.url || "/dashboard",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data || "/dashboard")
  );
});
