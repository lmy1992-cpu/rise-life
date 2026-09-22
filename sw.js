// rise-life Service Worker
// 缓存名 v33：云同步「以旧覆新」防护——每次打开页面不再无条件用云端旧快照覆盖本机（签到刷新清空的真正根因）；本机一改动 20 秒内自动推送
// v38.35：协作版双口令改单口令（取消私有保险箱，全部数据共享）+ 迁移期本机数据并集保护 + 弹窗兜底 + 诊断面板
// v38.85：结算筛选按钮（结算/日结/周结/月结 + 平台计数，点选筛选列表，统计跟随）
// v38.86：「结算」筛选语义纠正=还没选择结算周期的平台数（不是已设置的数量）
// v38.87：例文 AI 分析完可一键存拆文库 + 拆文库标题显示例文名 + AI 拆文自动提取关键词到杂项「AI关键词」
// v38.88：杂项预建「AI关键词」空大项 + 大项内按 4 组分区显示
// v38.89：AI关键词改顶部独立 tab + 左4组tab右标签墙（不再占左侧大项）
// v38.90：修复切到 AI关键词 tab 内容不切换（renderMiscKw 没清空旧内容，标签墙被追加到底部）
// v38.91：AI关键词 tab 加「📝 提取要求」——用户自定义重点提取词，拼进拆文提示词补漏
// v38.92：删「每类最多 5 个」限制（能提尽提）+「提取要求」改「提取方向」（类型偏好 + 积累词库回喂自我总结）
// v38.94：删例文「AI 分析」入口（与「AI 拆文」同套逻辑只留拆文）；聊天搬进拆文页「💬 聊这篇」；拆文顺带归纳维度进例文（喂「AI 自动归类」）
// v38.95：删掉例文卡片/阅读页残留的「🤖 已分析」徽标（AI 分析入口已删，只保留「✂️ 已拆文」标识）
const CACHE = 'dp-pwa-v38.95';
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
