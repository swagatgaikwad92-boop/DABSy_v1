/* =========================================================
   D.A.B.S.y SERVICE WORKER
   ========================================================= */

const CACHE_NAME =
  "dabsy-v1-shell";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./vision.js",
  "./ai.js",
  "./voice.js",
  "./manifest.json",
  "./assets/icon.svg"
];

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches.open(
        CACHE_NAME
      ).then(
        cache =>
          cache.addAll(
            APP_FILES
          )
      )

    );

    self.skipWaiting();
  }
);

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches.keys().then(
        keys =>
          Promise.all(
            keys
              .filter(
                key =>
                  key !== CACHE_NAME
              )
              .map(
                key =>
                  caches.delete(key)
              )
          )
      )

    );

    self.clients.claim();
  }
);

self.addEventListener(
  "fetch",
  event => {

    /*
      Network-first for normal requests.

      If offline, fall back to cached shell.
    */

    event.respondWith(

      fetch(event.request)
        .then(response => {

          return response;

        })
        .catch(() => {

          return caches.match(
            event.request
          );

        })

    );
  }
);
