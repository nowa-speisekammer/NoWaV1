// Automatisch generiert - Aenderungen werden beim naechsten Build ueberschrieben.
const CACHE_NAME = "nowa-cache-858f448fe3";
const APP_SHELL = [
    "./index.html",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png",
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js",
    "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                APP_SHELL.map((url) =>
                    fetch(url).then((res) => cache.put(url, res)).catch(() => {})
                )
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// HTML: "network first" - online immer die aktuelle Version holen (und
// nebenbei den Cache auffrischen), offline auf die zuletzt gecachte Version
// zurueckfallen. Alles andere (Firebase/jsQR/QRCode-Skripte, Icons): "cache
// first", da sich diese so gut wie nie aendern - spart bei jedem Start
// unnoetige Netzwerk-Requests.
self.addEventListener("fetch", (event) => {
    let req = event.request;
    if (req.mode === "navigate") {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    let copy = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
                    return res;
                })
                .catch(() => caches.match("./index.html"))
        );
        return;
    }
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((res) => {
                let copy = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                return res;
            }).catch(() => cached);
        })
    );
});
