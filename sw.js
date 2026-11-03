// medbasha - TaskMaster Service Worker v3.5.3 (High Priority Push & Screen Unlock)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAelzQOy8KFQ5OZkctKJS2DZUaxvaLMfRE",
  authDomain: "taskmastercalendar-a779e.firebaseapp.com",
  databaseURL: "https://taskmastercalendar-a779e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "taskmastercalendar-a779e",
  storageBucket: "taskmastercalendar-a779e.firebasestorage.app",
  messagingSenderId: "628005433300",
  appId: "1:628005433300:web:b6a39ed06922a34de07041"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Aviso de TaskMaster 🔔';
  const notificationBody = payload.notification?.body || payload.data?.body || 'Tienes un evento o recordatorio pendiente.';
  
  const options = {
    body: notificationBody,
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: payload.data?.tag || ('taskmaster_alarm_' + Date.now()),
    requireInteraction: true,
    renotify: true,
    vibrate: [300, 100, 300, 100, 300],
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Ver Evento 📅' },
      { action: 'dismiss', title: 'Cerrar ✕' }
    ]
  };

  self.registration.showNotification(notificationTitle, options);
});

const CACHE_NAME = 'taskmaster-v3-5-3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
