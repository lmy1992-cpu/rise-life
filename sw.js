// rise-life Service Worker
// 缓存名 v33：云同步「以旧覆新」防护——每次打开页面不再无条件用云端旧快照覆盖本机（签到刷新清空的真正根因）；本机一改动 20 秒内自动推送
const CACHE = 'dp-pwa-v38.28';
const ASSETS = [
  './',
  './index.html',
  './zh-shell.html',
  './duanpian.html',
  './duanpian-collab.html',
  './duanpian-pad.html',
  './duanpian-mobile.html',
  './movie.html',
  './reading.html',
  './weight.html',
  './health.html',
  './game.html',
  './mammoth.browser.min.js',
  './crawl-data.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  // 升级缓存：装好后立即跳过等待，让新 SW 接管
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // 清掉旧版本缓存
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // 跳过跨域请求（Supabase、AI 之类的请求别拦截）
  try {
    const reqUrl = new URL(e.request.url);
    if (reqUrl.origin !== self.location.origin) return;
  } catch (_) { return; }

  // 网络优先：有网就用最新文件，离线才回退缓存。
  // 解决了旧 SW 缓存导致改完代码页面不更新的问题。
  e.respondWith(
    fetch(e.request, {cache:'no-cache'})
      .then((resp) => {
        // 仅缓存 GET 成功响应
        if (e.request.method === 'GET' && resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
