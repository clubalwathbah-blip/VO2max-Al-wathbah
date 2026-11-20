/* MR WATHBA PERFORMANCE · BY OKBA — mode hors ligne
 * Les fichiers de l'app sont gardés sur l'appareil : l'app s'ouvre au bord du bassin sans internet
 * (il faut l'avoir ouverte une fois avec internet). Les données passent toujours par le serveur ;
 * hors ligne, les enregistrements attendent dans l'appareil et partent seuls au retour du réseau.
 * Changer VERSION à chaque mise à jour des fichiers.
 */
var VERSION = 'mrwp-v5-8';
var CORE = ['./', './index.html', './app.js', './battery.js', './calc.js', './logo.png', './ptbold.woff',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(CORE.map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;                       // le serveur (POST) n'est jamais mis en cache
  var url = new URL(req.url);
  if (/script\.google|googleusercontent|polar/.test(url.hostname)) return;
  if (url.origin === self.location.origin) {
    // fichiers de l'app : réseau d'abord (mises à jour), sinon la copie gardée
    // cache:'no-cache' = يسقسي GitHub كل مرة واش كاين جديد (ما ياخذش نسخة قديمة من ذاكرة المتصفح)
    e.respondWith(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(function (res) {
      if (res && res.ok) { var cp = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, cp); }); }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match('./index.html'); });
    }));
  } else {
    // bibliothèques et polices : la copie gardée d'abord
    e.respondWith(caches.match(req).then(function (r) {
      return r || fetch(req).then(function (res) {
        var cp = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, cp); }); return res;
      });
    }));
  }
});
