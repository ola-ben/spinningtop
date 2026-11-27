/* Spinning Top service worker — team notifications only.
   Shows "New booking" / "New paid order" pushes sent by /api/order-mail.php,
   and opens the right admin page when one is tapped. It does not cache pages. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Spinning Top", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Spinning Top";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icon.png",
      badge: "/icon.png",
      tag: data.tag || undefined,
      renotify: true,
      requireInteraction: false,
      data: { url: data.url || "/admin/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || "/admin/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      // Reuse an open admin tab if there is one.
      for (const client of list) {
        if (client.url.includes("/admin") && "focus" in client) {
          client.navigate(url).catch(() => {});
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
