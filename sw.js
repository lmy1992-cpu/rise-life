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
// v38.96：阅读手帐「每日阅读计划」——书详情开计划（开始/结束日期+顺延重算/保留累积），自动生成每日任务「📖 《书》读到第 X 页」，卡片显示每天几页+完整计划
// v38.97：删电影手帐「正在看」——分区/状态选项/卡片按钮/统计卡全清；旧「在看」数据不迁移，在「已看」分区照常显示，编辑保存时自然落成已看
// v38.98：阅读打卡——待办里的 rdplan 任务变打卡小卡（进度条+今天该读几页+📖打卡按钮），输入今天页数+用时，打卡自动更新书进度；今日/本周统计条+开计划引导条（双外壳）
// v38.99：滴答授权失败提示人话化——invalid_grant（授权码过期/已用）时弹窗直接说明「code 几分钟寿命+只能用一次，重新授权马上换」
// v39.00：协作版修「点同步没反应」——登录弹窗不再被点空白误关；未登录点同步直接重新弹登录窗（回填云端配置），不再静默失败
// v39.01：协作版「没反应」第二弹——记住口令的设备静默自动登录失败时，登录弹窗（报错+🩺自检入口）必须打开；手动同步失败不再静默，toast 真实原因+自动开自检面板
// v39.02：自检面板被登录窗盖住（maskLogin z-index=999 > .mask 60）——showDiag 强制 zIndex 1200；「Load failed」错误附人话解释（网络请求没发出去，切换 Wi-Fi/蜂窝+等自动重试）
// v39.03：Load failed 真凶=环境 ID 拼错也会报同样的错（环境 ID 直接拼进请求网址，错一个字母=网址不存在=DNS 失败）——自检结论+登录窗提示都改成「先核对环境 ID 逐字拼写，再查网络」
// v39.04：游戏人生·商城加「🧹 清理重复」按钮（奖励商城 S.shop / 宠物商城 S.petCatalog 各一个）——dedupeShopList 按「同名+同价+同图标」判重复，保留首份删其余，删前确认+toast 报告条数
// v39.05：游戏人生·宠物玩具改成标准消耗品（跟食物/手套平行）——商店购买只入库 S.toy，不再「买即生效」；新增宠物界面「🧸 玩玩具」互动按钮（消耗玩具+亲密+心情+经验）；仓库「玩具&宠物」区新增「宠物玩具 ×N / 已玩 N 次」；migrateOld 把旧版记进 petInventory 的 toy 项移到 S.toy 库存（已加属性保留，不删数据）
// v39.06：①整体工作台游戏等级规则可查看可修改——弹窗展示升级公式（默认每级门槛=（等级-1)²×50 可改系数/改平铺模式）+ Lv1~11 门槛表 + 升级奖励金币（默认20 发进游戏人生钱包，升级瞬间自动发放）；「我的」页等级改由公式实时计算（旧字段从未维护一直显示 LV1）②协作版·AI关键词 tab 分「🏙 现代 / 🏯 古代」两段——AI 拆文整篇判断时代背景（era 字段）+ 本地词表正则兜底，判不出默认归现代；点词切换时代+跨段拖拽编辑；存量关键词自动补 era 不覆盖手动改动 ③起名库重做——AI 一键起名后新名插到最前面（不用再拖到底部找），卡片按「男主👑/女主🌸/女配🌙/男配🤵」分组显示，支持改名/改简介/删除
// v39.07：修「查看/修改升级规则」按钮够不着——v39.06 把入口放在外壳的隐藏原生页（游戏人生导航项是 iframe 类型，那页永远打不开）；现把「📖 规则」入口放进游戏人生页顶栏（连击旁边），弹窗里讲清两套等级（①左侧导航旁 Lv 徽标=工作台游戏等级，待办/签到攒经验，规则可改；②本页 ⭐人生Lv=游戏人生自己的等级，总完成数×5 达到 等级×100 升级，固定规则）；保存写回 workbench_game_v1 并 postMessage 通知外壳（gameRuleChanged）实时刷新徽标/卡片/我的页
// v39.09：修「例文选中字数徽标跨屏消失」（四份短篇文件同改：协作版/个人版/平板/手机）——根因①徽标 CSS 是 position:fixed，JS 却加了 window.scrollX/scrollY 偏移；根因②定位用整个选区的并集矩形 getBoundingClientRect()，选区一跨屏矩形顶端就跑出视口，徽标被定位到屏幕外。修复=fixed 直接用视口坐标 + 取「视口内最后一段可见行」getClientRects 定位 + 整体不可见时夹回屏内
// v39.10：修「点开例文停在中间/后面，不回到开头」（四份短篇文件同改：协作版/个人版/平板/手机）——根因=阅读面板的滚动容器 .reader-body（max-height:62vh; overflow:auto）是常驻 DOM，只靠 class/display 切显隐，浏览器把上次的 scrollTop 保留了下来。修复=新增 resetReaderScroll() 在每次打开例文后把 .reader-body/.modal/.rd-content/textarea/iframe 滚动位置全部归零，并直调+rAF+setTimeout(60) 三重兜底防 display 切换时机
// v39.11：起名库重设计（协作版+短篇工作台两份同改，平板/手机无此功能）——①删掉「一键起名/一键心死名场面」顶部按钮行，生成入口移进「💡 起名库/💔 心死名场面」大项内 ②起名库改四列纯姓名（女主/女配/男主/男配，用户指定顺序），去掉描述框（intro 数据保留在存储里只是不显示，旧数据一字不动），每个名字带 📋 一键复制 ③顶部角色选择 tab+「生成一位×名字」按钮，指定角色生成 ④心死名场面新生成的排最上（原来 push 在最下），大项头部加生成按钮 ⑤旧数据兜底：识别不出角色的名字归「未分类」照旧列出绝不丢；有 role 字段的显示时脱「（角色）」前缀，无 role 的靠文本正则归组不能破坏。坑：整函数替换时把紧挨的 nameLibRoleOf 一并切掉，e2e 测试当场抓住补回
const CACHE = 'dp-pwa-v39.11';
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
