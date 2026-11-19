/* POWER GUARD - Firebase Cloud Messaging service worker.
   Must sit in the SAME folder as index.html on GitHub Pages.
   Receives push messages while the dashboard is closed or in the background.
   The Cloudflare Worker sends DATA-ONLY messages, so this file is the only
   place that shows the notification (this prevents double notifications). */

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Web config is public by design (same values as the dashboard). No secrets here.
firebase.initializeApp({
  apiKey: "AIzaSyDFWE5aJRr8xcsoP6T9O3xLOiBCAmxaQwY",
  authDomain: "power-guard32.firebaseapp.com",
  databaseURL: "https://power-guard32-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "power-guard32",
  storageBucket: "power-guard32.firebasestorage.app",
  messagingSenderId: "439894450296",
  appId: "1:439894450296:web:2ca9ff01527071b1428d8d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  const title = d.title || "POWER GUARD";
  const critical = d.severity === "critical";
  return self.registration.showNotification(title, {
    body: d.body || "",
    tag: d.tag || d.type || "power-guard",   // same tag = replaces, never stacks duplicates
    renotify: true,                           // still alert again for a genuinely new event
    icon: "icon-192.png",
    requireInteraction: critical,
    data: { url: d.url || self.registration.scope, type: d.type || "" }
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.startsWith(self.registration.scope) && "focus" in c) return c.focus();
      }
      return clients.openWindow(target);
    })
  );
});
