const CACHE_NAME = "construction-manager-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/main.css",
    "./css/variables.css",
    "./css/reset.css",
    "./css/typography.css",
    "./css/layout.css",
    "./css/components.css",
    "./css/dashboard.css",
    "./css/tables.css",
    "./css/forms.css",
    "./css/modal.css",
    "./css/utilities.css",
    "./css/themes.css",
    "./js/app.js",
    "./js/router.js",
    "./js/store.js",
    "./js/database.js",
    "./js/config.js",
    "./js/constants.js",
    "./icons/app-icon.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            });
        })
    );
});
