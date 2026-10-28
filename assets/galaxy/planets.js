// 創巢星系的星球資料
// 文案全部取自 content.json（服務文案、價格、作品連結），不要自己編。
// 結構對照 galaxy.js：BASE 是中央的創巢（舊官網那隻坐月亮的太空人），PLANETS 是繞著轉的服務星球。
// 每顆星球：{ id,name,tagline,kicker,lead,quote,price,points[],ctas[],moons[],moonTitle,
//            r,pos[x,y,z],color,ground,ring,glow,props,spin }
// props: web|booking|rocket|social|ads|seo|stage|park|blog（對應 galaxy.js 的小場景）
// moons 是介紹面板裡的作品清單（星系上不畫成衛星）；icon／color／r 欄位已不使用

// 客戶：一個客戶＝首頁一隻飛行的小太空人（只代表數量，不顯示名字——照「客戶案例不放名字」）。
// 平常沒資料就隨機放 3–5 隻。接真實客戶數有兩種方式：
//   1) 直接把筆數填進這個陣列（內容不拘，放幾個元素就是幾位客戶）；
//   2) 由後端／工程師在頁面塞 window.NEST_CUSTOMERS = <陣列或數字>，優先於此。
export const CUSTOMERS = [];

// 中央：創巢本人＝舊官網那隻坐在月亮上的太空人（galaxy.js makeMascot）
export const BASE = {
  id: 'base',
  name: '創巢',
  mascot: true,
  tagline: '非常規，才是真解法',
  kicker: 'NEST BASE',
  lead: '用非常規的跳躍思維，解決習以為常卻永遠解決不了的問題。軟體開發 × 品牌行銷 × AI 應用 × 自動化，一條龍的數位成長團隊。',
  quote: '整世界都在發神經，你還在用正常思維面對？要就跟著一起發瘋。',
  points: [
    '軟體開發 × 品牌行銷',
    'AI 應用 × 自動化',
    '一條龍，從開發到行銷',
  ],
  ctas: [
    { text: '聯絡我們 →', href: '/contact' },
    { text: '加 LINE 客服', href: 'https://line.me/R/ti/p/@604vqsva' },
  ],
  r: 7.2,
  pos: [0, 0, 0],
  glow: 0x00c8ff,
  spin: 0.05,
};

export const PLANETS = [
  // 網站星：一鍵式架站
  {
    id: 'web',
    name: '網站星',
    tagline: '填完資料，看三個版型',
    kicker: '一鍵式架站',
    lead: '網頁設計的標準流程是先簽約、先付訂金，然後你開始等。我們把順序倒過來：先給你看成品，你再決定要不要付錢。',
    quote: '喜歡再付 6,000。不喜歡，一毛都不用付。',
    price: '一年 NT$6,000',
    points: [
      '填完六個欄位，AI 幫你生成三個版型',
      '版型完成會通知你，看了再決定要不要上線',
      '全程免費，喜歡了才付 6,000',
    ],
    ctas: [
      { text: '免費生成我的網站 →', href: '/quick-site' },
      { text: '看服務說明', href: '/services/website' },
    ],
    moonTitle: '做過的網站 Demo',
    moons: [
      { name: '團購網站', desc: '商品列表、團購倒數、訂單管理', href: '/demo/group-buy/', cta: '進 Demo ›', icon: 'cart', color: 0xffc94d, r: 1.1 },
      { name: '遊戲平台', desc: '遊戲介紹、排行榜、會員中心', href: '/demo/gaming/', cta: '進 Demo ›', icon: 'pad', color: 0x6b4bd8, r: 1.2 },
      { name: '旅遊網站', desc: '行程規劃、景點介紹、預訂', href: '/demo/travel/', cta: '進 Demo ›', icon: 'plane', color: 0x6fc3ff, r: 1.0 },
      { name: '全部作品', desc: '展示作品總覽', href: '/showcase', cta: '看全部 ›', icon: 'plus', color: 0x9fb0d8, r: 0.9 },
    ],
    r: 4.8,
    pos: [-44, 4, -6],
    color: 0x2f6fb0,
    ground: 0x5fc28a,
    glow: 0x8fd3ff,
    props: 'web',
    spin: 0.07,
  },

  // 快速建站：一鍵架站（填完就好）
  {
    id: 'rocket',
    name: '快速建站星',
    tagline: '填完就好，剩下交給我們',
    kicker: '一鍵架站',
    lead: '填完就好，剩下交給我們。系統會自動分析你的需求，幾分鐘內完成初步架構規劃，並把結果傳送給你。',
    price: 'NT$6,000',
    points: [
      '只要填完表單，不用來回溝通',
      '系統自動分析需求、規劃架構',
      '幾分鐘內把初步結果傳給你',
    ],
    ctas: [
      { text: '開始填 →', href: '/quick-site' },
      { text: '看一鍵式架站方案', href: '/services/website' },
    ],
    r: 3.6,
    pos: [-28, -7, 32],
    color: 0xff5d5d,
    ground: 0xffd0a0,
    glow: 0xffb26b,
    props: 'rocket',
    spin: 0.09,
  },

  // 預約星：給一個人也能開的店
  {
    id: 'booking',
    name: '預約星',
    tagline: '不用來回問，客人直接選時段',
    kicker: '預約系統',
    lead: '讓客人自己選時間，你不用守著手機。一套給「一個人也能開的店」用的預約系統——不用再靠 LINE 對話紀錄管預約。',
    price: '洽詢',
    points: [
      '客人自己挑時段，不用 LINE 來回問',
      '一個人也能開的店就能用',
    ],
    ctas: [
      { text: '聊聊我的需求 →', href: '/contact' },
      { text: '看服務說明', href: '/services/booking' },
    ],
    moonTitle: '各行業預約 Demo',
    moons: [
      { name: '美甲預約', desc: '款式、時段、設計師一次選', href: '/services/booking-demos/booking-nails', cta: '看 Demo ›', icon: 'pad', color: 0xff9ec4, r: 1.0 },
      { name: '美髮沙龍', desc: '剪燙染、指定設計師', href: '/services/booking-demos/booking-salon', cta: '看 Demo ›', icon: 'pad', color: 0xc9a2ff, r: 1.0 },
      { name: '寵物美容', desc: '體型、服務項目、到店時間', href: '/services/booking-demos/booking-pet', cta: '看 Demo ›', icon: 'pad', color: 0x7cd3b0, r: 1.0 },
      { name: '手搖飲預購', desc: '品項、數量、取餐時段', href: '/services/booking-demos/booking-drink', cta: '看 Demo ›', icon: 'pad', color: 0xffd36b, r: 0.95 },
    ],
    r: 4.4,
    pos: [8, 9, -46],
    color: 0x5d7bd8,
    ground: 0xf6e2c8,
    glow: 0x9db8ff,
    props: 'booking',
    spin: 0.06,
  },

  // 社群星：有什麼素材就從那裡開始
  {
    id: 'social',
    name: '社群星',
    tagline: '有什麼素材，我們就從那裡開始',
    kicker: '社群經營',
    lead: '卡在社群，常常不是沒內容，是不知道手上的東西能用成什麼。你手上有什麼，決定你適合哪個方案；你缺哪塊，就補哪塊。',
    price: 'NT$9,500 起',
    points: [
      '有影片：剪輯、字幕、配樂、封面做成短影片',
      '只有照片：用 AI 做成形象影片',
      '什麼都沒有：從零用 AI 生出來',
    ],
    ctas: [
      { text: '聊聊我的素材 →', href: '/contact' },
      { text: '看服務說明', href: '/services/social' },
    ],
    r: 4.2,
    pos: [42, -4, 22],
    color: 0xff6f91,
    ground: 0x7cd38f,
    glow: 0xffb0c6,
    props: 'social',
    spin: 0.07,
  },

  // 投放星：跳動E投放（TikTok 廣告）
  {
    id: 'ads',
    name: '投放星・跳動',
    tagline: '900 元就能投 TikTok 廣告',
    kicker: '跳動E投放',
    lead: 'TikTok 廣告的正常做法，要先找總代理儲值約台幣三萬才給開戶。我們直接串了 TikTok API，把門檻拉到 900：先試，跑得動再加，跑不動也只損失 900。',
    quote: '不是優惠。是本來就該這樣。',
    price: 'NT$900 起（首投折抵 200）',
    points: [
      '900 元開帳號，跑得動再加',
      '直接串 TikTok API，不用找總代理',
      '跑不動也只損失 900',
    ],
    ctas: [
      { text: '用 900 試試 →', href: 'https://ads.nest-creation.com' },
      { text: '看方案說明', href: '/services/ads' },
    ],
    moonTitle: 'TikTok 實測知識庫',
    moons: [
      { name: '廣告實測知識庫', desc: '跳動e投放 · 實際投放紀錄', href: 'https://blog.nestdigitalai.com', cta: '去看 ›', icon: 'tool', color: 0x3fd9bb, r: 1.05 },
      { name: '有機成長筆記', desc: '跳動e行銷 · 不花錢的成長實測', href: 'https://marketing.nestdigitalai.com/', cta: '去看 ›', icon: 'tool', color: 0x6fe0c8, r: 1.0 },
      { name: '成效診斷', desc: '跳動e成效 · 廣告成效怎麼看', href: 'https://results.nestdigitalai.com', cta: '去看 ›', icon: 'tool', color: 0x2bbfa2, r: 1.0 },
    ],
    r: 4.6,
    pos: [50, 6, -16],
    color: 0x26c6a8,
    ground: 0x1f9e86,
    glow: 0x6ff0d8,
    props: 'ads',
    spin: 0.07,
  },

  // 搜尋星：SEO 部落格撰寫
  {
    id: 'seo',
    name: '搜尋星',
    tagline: '一個月三篇，關鍵字到上稿',
    kicker: 'SEO 部落格撰寫',
    lead: '死的是那種「給爬蟲看」的寫法，不是 SEO。關鍵字研究、文章架構、初稿、上稿我們做，你每個月收到三篇能被搜尋到、也能被人讀完的文章。',
    quote: '內容農場死了。SEO 沒有。',
    price: '月費 NT$15,000 起',
    points: [
      '關鍵字研究、文章架構我們做',
      '初稿我們出，上稿我們處理',
      '每月三篇，搜尋得到也讀得完',
    ],
    ctas: [
      { text: '聊聊我的關鍵字 →', href: '/contact' },
      { text: '看服務說明', href: '/services/seo' },
    ],
    r: 4.0,
    pos: [-14, -8, -44],
    color: 0x6a7bb5,
    ground: 0xcfc6b0,
    glow: 0xb9c4e8,
    props: 'seo',
    spin: 0.06,
  },

  // 虛擬網紅星：AI 形象網紅
  {
    id: 'stage',
    name: '虛擬網紅星',
    tagline: '一個不會爆雷的代言人',
    kicker: 'AI 形象網紅',
    lead: '找網紅頭痛的三件事：檔期、控制感、風險。AI 網紅人設你說了算、內容你定方向、視覺我們生成、發文時間我們排。',
    quote: '不會遲到、不會漲價、不會半夜發廢文。',
    price: '月費 NT$21,000 起',
    points: [
      '人設你說了算，內容你定方向',
      '視覺我們生成，發文時間我們排',
      '不漲價、不爆雷、永遠配合',
    ],
    ctas: [
      { text: '打造我的代言人 →', href: '/contact' },
      { text: '看服務說明', href: '/services/ai-influencer' },
    ],
    r: 4.3,
    pos: [22, 10, 42],
    color: 0x6b4bd8,
    glow: 0xff6fb5,
    props: 'stage',
    spin: 0.07,
  },

  // 遊樂園星：自家遊戲 ＋ 開放投稿
  {
    id: 'park',
    name: '遊樂園星',
    tagline: '我們自己做的遊戲都放這裡',
    kicker: '遊樂園',
    lead: '這是創巢的遊樂園。我們自己做的遊戲都放在這裡，第一台機台是《加一顆蛋》。你也做了遊戲？歡迎投稿上架，一起進駐。',
    points: [
      '第一台機台：《加一顆蛋》',
      '自家新遊戲會陸續進駐',
      '開放其他創作者投稿上架',
    ],
    ctas: [
      { text: '玩《加一顆蛋》 →', href: 'https://addoneegg.pages.dev' },
      { text: '投稿你的遊戲', href: '/contact' },
    ],
    moonTitle: '機台',
    moons: [
      { name: '加一顆蛋', desc: '第一台上線機台', href: 'https://addoneegg.pages.dev', cta: '開始玩 ›', icon: 'egg', color: 0xffd84a, r: 1.2 },
      { name: '投稿你的遊戲', desc: '歡迎創作者上架', href: '/contact', cta: '我要投稿 ›', icon: 'plus', color: 0x9fb0d8, r: 1.0 },
    ],
    r: 5.0,
    pos: [-50, 2, 28],
    color: 0xff7ab8,
    ring: 0xffc94d,
    glow: 0xffd84a,
    props: 'park',
    spin: 0.08,
  },

  // 訊號塔：不正常觀點（部落格）
  {
    id: 'blog',
    name: '訊號塔',
    tagline: '把想法攤開給你看',
    kicker: '不正常觀點',
    lead: '我們怎麼想、怎麼做，攤開寫成文章。十篇觀點，外加一個三分鐘就能自測的行銷健檢小工具。',
    points: [
      '十篇不正常觀點，講我們的做法',
      '行銷健檢：七題、約三分鐘、不用留電話',
    ],
    ctas: [
      { text: '讀全部文章 →', href: '/blog' },
      { text: '先做行銷健檢', href: '/blog/check' },
    ],
    moonTitle: '工具與文章',
    moons: [
      { name: '行銷錢有沒有花對', desc: '七題情境測驗，約三分鐘', href: '/blog/check', cta: '開始測 ›', icon: 'tool', color: 0x8fd3ff, r: 1.1 },
      { name: '便宜又快又好？', desc: '為什麼我們拒絕這種案子', href: '/blog/cheap-fast-good-pick-two', cta: '讀 ›', icon: 'plus', color: 0xb9c4e8, r: 0.95 },
      { name: '為什麼叫「不正常」', desc: '公司名字的由來', href: '/blog/why-we-named-it-abnormal', cta: '讀 ›', icon: 'plus', color: 0xc6b0e8, r: 0.95 },
    ],
    r: 3.6,
    pos: [34, -10, -40],
    color: 0x4a5578,
    glow: 0x8fd3ff,
    props: 'blog',
    spin: 0.06,
  },
];
