// Automatisch generiert von generate_app.py - nicht manuell bearbeiten.
// Bei jedem Skriptlauf aendert sich CACHE_VERSION, wodurch alte Caches
// beim naechsten Seitenaufruf automatisch ersetzt werden.
const CACHE_VERSION = "20260906-151124";
const CACHE_NAME = "nowa-cache-" + CACHE_VERSION;

// Alles, was fuer die Offline-Nutzung vorab gecacht werden soll.
const PRECACHE_URLS = [
  "./",
  "icons/icon-16.png",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-32.png",
  "icons/icon-512-maskable.png",
  "icons/icon-512.png",
  "index.html",
  "manifest.json",
  "pics/pimg_ananas.webp",
  "pics/pimg_apfel.webp",
  "pics/pimg_aubergine.webp",
  "pics/pimg_avocado_reif.webp",
  "pics/pimg_ayran.webp",
  "pics/pimg_banane.webp",
  "pics/pimg_birne.webp",
  "pics/pimg_brokkoli.webp",
  "pics/pimg_brombeere.webp",
  "pics/pimg_brot.webp",
  "pics/pimg_champignons.webp",
  "pics/pimg_ei_gekocht.webp",
  "pics/pimg_ei_roh.webp",
  "pics/pimg_erdbeere.webp",
  "pics/pimg_feta.webp",
  "pics/pimg_fr_hlingszwiebel.webp",
  "pics/pimg_frischk_se.webp",
  "pics/pimg_garam_masala.webp",
  "pics/pimg_gurke.webp",
  "pics/pimg_h_milch.webp",
  "pics/pimg_hartk_se.webp",
  "pics/pimg_himbeere.webp",
  "pics/pimg_honig.webp",
  "pics/pimg_ingwer.webp",
  "pics/pimg_joghurt.webp",
  "pics/pimg_karotte.webp",
  "pics/pimg_kartoffel.webp",
  "pics/pimg_kichererbsen.webp",
  "pics/pimg_kichererbsen_dose.webp",
  "pics/pimg_kidneybohnen.webp",
  "pics/pimg_kidneybohnen_dose.webp",
  "pics/pimg_kiwi.webp",
  "pics/pimg_knoblauch.webp",
  "pics/pimg_lauch.webp",
  "pics/pimg_linsen.webp",
  "pics/pimg_mais_dose.webp",
  "pics/pimg_mandarine.webp",
  "pics/pimg_mango.webp",
  "pics/pimg_milch.webp",
  "pics/pimg_nudeln.webp",
  "pics/pimg_oliven_l.webp",
  "pics/pimg_orange.webp",
  "pics/pimg_orangensaft.webp",
  "pics/pimg_oregano.webp",
  "pics/pimg_paprika.webp",
  "pics/pimg_paprika_edels.webp",
  "pics/pimg_quark.webp",
  "pics/pimg_r_uchertofu.webp",
  "pics/pimg_reis.webp",
  "pics/pimg_rotkohl.webp",
  "pics/pimg_s_kartoffel.webp",
  "pics/pimg_salami.webp",
  "pics/pimg_salat.webp",
  "pics/pimg_schnittk_se.webp",
  "pics/pimg_schokolade.webp",
  "pics/pimg_skyr.webp",
  "pics/pimg_sojajoghurt.webp",
  "pics/pimg_sojamilch.webp",
  "pics/pimg_spinat.webp",
  "pics/pimg_tk_pizza.webp",
  "pics/pimg_tofu.webp",
  "pics/pimg_tomate.webp",
  "pics/pimg_tomate_dose.webp",
  "pics/pimg_traube.webp",
  "pics/pimg_weichk_se.webp",
  "pics/pimg_zucchini.webp",
  "pics/pimg_zwiebel.webp"
];

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // addAll bricht komplett ab, wenn eine einzelne Datei fehlschlaegt (z.B.
            // eine externe CDN-Datei ohne CORS) - deshalb pro Datei einzeln absichern,
            // damit ein einzelner Fehler nicht das gesamte Offline-Caching verhindert.
            return Promise.all(
                PRECACHE_URLS.map((url) =>
                    cache.add(url).catch((err) => console.warn("Precache fehlgeschlagen:", url, err))
                )
            );
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Strategie:
// - Navigation (HTML-Aufruf der App): "Network falling back to cache" - online
//   gibt es immer die aktuellste Version, offline die zuletzt gecachte.
// - Alles andere (Bilder, Icons, externe Skripte/Fonts): "Cache falling back to
//   network" - einmal geladene Dateien aendern sich praktisch nie, werden also
//   bevorzugt aus dem Cache bedient (schnell + offline-faehig) und im Hintergrund
//   trotzdem aktualisiert, falls online eine neuere Version verfuegbar ist.
self.addEventListener("fetch", (event) => {
    const req = event.request;

    // Web-Share-Target: Android schickt hier per POST das, was aus einer
    // anderen App (z.B. TikTok) "geteilt" wurde - inkl. der ECHTEN Videodatei,
    // falls die Quell-App eine mitgeschickt hat (TikTok tut das beim Teilen
    // an Drittanbieter-Apps automatisch). Da es keinen echten Server gibt,
    // der diese POST-Anfrage sonst beantworten würde, fangen wir sie hier ab,
    // legen Video + Text/Link kurz in einem eigenen Cache ab und leiten dann
    // per normalem GET auf die App weiter, die das beim Start abholt (siehe
    // checkForSharedVideoOnLoad() im Haupt-Skript).
    if (req.method === "POST") {
        event.respondWith((async () => {
            try {
                const formData = await req.clone().formData();
                const cache = await caches.open("nowa-share-target");
                const video = formData.get("sharedVideo");
                if (video && video.size > 0) {
                    await cache.put("shared-video", new Response(video, { headers: { "Content-Type": video.type || "video/mp4" } }));
                }
                const sharedUrl = formData.get("sharedUrl") || "";
                const sharedText = formData.get("sharedText") || "";
                await cache.put("shared-meta", new Response(JSON.stringify({ url: sharedUrl, text: sharedText })));
            } catch (err) {
                console.error("Share-Target: Verarbeiten der geteilten Daten fehlgeschlagen:", err);
            }
            return Response.redirect("./index.html?shared=1", 303);
        })());
        return;
    }

    if (req.method !== "GET") return;

    if (req.mode === "navigate") {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
                    return res;
                })
                .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
        );
        return;
    }

    event.respondWith(
        caches.match(req).then((cached) => {
            const networkFetch = fetch(req)
                .then((res) => {
                    if (res && res.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || networkFetch;
        })
    );
});
