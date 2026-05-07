# 創巢數位 Nest Digital 官網改版｜CLAUDE.md

---

## 一、專案架構與技術決策

### 設計判斷原則：不被任何框架綁住

**創辦人原話（2026-04-21）：**

> 「博物館也是一般人在逛的，我不能在宇宙展現俐落的設計？線條的美感？極致的光線？電影般的畫面？把有質感的東西放在宇宙裡，就是要有衝突，要反差。**我們設計結構跟其他任何元素幹嘛要去考慮是不是宇宙？**」

**三條設計判斷：**

1. **想要的設計品質是明確的**：俐落、線條感、極致光線、電影畫面——這些是目標，不是「符合某個隱喻」
2. **衝突和反差是主動選擇**，不是妥協，是美學本身
3. **「符不符合某個隱喻」是錯誤的問題**——正確問題是「**這個元素放在深黑背景上有沒有力量？美嗎？有張力嗎？令人難忘嗎？**」

**根本洞察：宇宙是舞台，不是設計規則集。** 穿著俐落的人走進荒野，美的是反差——他不需要打扮成草。衝突、反差本身就是美學，也是這個品牌的性格。

**過去誤用、已棄用的框架隱喻：**

| 框架 | 棄用原因 |
|---|---|
| 天文觀測站 / 觀測儀（2026-04-18） | 把使用者定位成觀察者，一切設計往儀器感靠攏 |
| 深空漫遊 Deep Space Drift（2026-04-21 短暫過渡） | 把「宇宙是背景」誤讀為「設計必須符合宇宙物理感」 |
| 深空舞台 Deep Space Stage（2026-04-21 第三版） | 仍是隱喻名，雖更接近本意，但仍會被當作框架使用 |
| 跳躍思維（2026-05-06 一度被主 session 誤記為新框架） | 「跳躍思維」是 h1 主標的訴求**文案**，不是設計方法論。把它當作框架仍是同一錯誤的另一形式 |

**對 AI session 的警示：**

不要用任何單一隱喻名稱（觀測儀／舞台／跳躍思維……）綁住設計判斷。永遠回到三條判斷標準與「深黑底有力量嗎」這一個檢驗問題。

「跳躍思維」「非常規」這些字眼如果出現在程式碼或文件裡，正確的角色是**訴求文案的內容**（h1、文案稿、品牌訊息），不是「設計風格規則」。

**Codebase 中過去框架隱喻的殘留（待二階段視覺評估時逐項拍板）：**

- Three.js 黑洞星場（`#blackhole` + `initStarfield()`）
- CSS 星空 `#css-starfield`（`base.css`）
- `.nav__brand-star` 暖白光點 + 圍繞光暈（命名來自「望遠鏡下的恆星」隱喻）
- 各種「螺旋臂 / 軌道 / 星辰 / stellar」相關 token / 註解 / class 名稱

第一階段（2026-05-06）已完成純註解清理，第二階段（視覺實作的去留）待逐項評估。**評估時不要用「是否觀測儀」「是否跳躍思維」當問題**，要用「**這個元素放在深黑背景上有力量嗎？是否能讓品牌看起來俐落、有反差、有電影感**」當問題。

### 路徑
`C:\Users\user-45664\Desktop\Claude AI相關\數位印鈔機\NEW創巢官網`

### 技術棧
- **框架**：純靜態 HTML / CSS / JS（無前端框架）
- **3D 引擎**：Three.js r128（CDN），僅首頁（`body.has-threejs`）
- **動畫**：GSAP 3.12 + ScrollTrigger（CDN，全站）
- **圖示**：Font Awesome 6.4.0（CDN）
- **字型**：
  - `--f-serif-cjk`：**Chiron Sung HK WS**（港產明朝活字，jsDelivr GitHub CDN）→ 全站中文主視覺字
  - `--f-serif`：**Fraunces Variable Font**（opsz / wght / SOFT 三軸，Google Fonts）→ 英文大標/副標/引言
  - `--f-sans`：Noto Sans TC（Google Fonts，100–900）→ 內文/說明/次要中文
  - `--f-mono`：IBM Plex Mono → 等寬資料讀出條、Nav 品牌名
  - `--f-bebas`：Bebas Neue → 英文裝飾大字
  - `--f-disp`：Exo 2（保留但幾乎未使用）
- **部署**：GitHub Pages（CNAME: nestxmedia.com）

### CSS 5 層架構（載入順序不得更改）
```
tokens.css → base.css → components.css → animations.css → pages/[page].css
```

| 層 | 職責 |
|----|------|
| tokens.css | 所有 CSS 變數（色彩、字型、間距、陰影、Z-index） |
| base.css | Reset、全站排版、body 背景漸層、container、CSS 星空規則 |
| components.css | 可重用元件：Nav、Glass Card、Button、Tag、Section Header、Service Card、Footer |
| animations.css | 所有 @keyframes 統一存放 |
| pages/[page].css | 頁面專屬樣式（不可寫入 components 層） |

### JS 3 層架構（載入順序不得更改）
```
Three.js (首頁) → GSAP + ScrollTrigger → core.js → nav.js → pages/[page].js
```

| 檔案 | 職責 |
|------|------|
| core.js | JS 可用性標記（.no-js→.js）、GSAP 插件註冊、Nav scroll、data-reveal / data-stagger-group |
| nav.js | 動態注入 Nav HTML + CSS 星空 HTML、initCSSStarfield()、active 狀態高亮 |
| pages/[page].js | 頁面專屬互動 |

### 關鍵架構決策原因
- **Nav 動態注入**：nav.js 統一維護導覽列，修改單一檔案即全站生效
- **CSS 星空由 nav.js 注入**：避免 HTML 多頁重複；`body.has-threejs` 自動隱藏（首頁改用 Three.js）
- **`body.has-threejs`**：只有 index.html 有此 class，控制 Three.js canvas 顯示

---

## 二、禁止範圍與限制條件

1. **不使用任何前端框架**（React、Vue、jQuery 等均禁止）
2. **CSS 5 層架構載入順序不得更改**（各層有明確職責邊界）
3. **品牌名稱**：一律使用「創巢數位 Nest Digital」；禁止使用「NestX」（已廢棄舊稿稱呼）
4. **nav.js 是 Nav 唯一來源**：禁止在各 HTML 頁面直接寫 `<nav>` 標籤
5. **Three.js 3D 星空**：僅限 index.html（`body.has-threejs`）；其他頁面用 CSS 星空
6. **不得將頁面專屬樣式寫入 components.css**（分層邊界保護）
7. **Hero 入場動畫**：`.js-hidden` class 搭配 GSAP，確保無 JS 時內容仍可見（不可用 `display:none`）
8. **效能邊界**：手機（≤900px）跳過 Three.js；`renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))`

---

## 三、術語對照表

| 術語 | 說明 |
|------|------|
| Glass Card | 玻璃擬態卡片（`backdrop-filter: blur`，`.card` class） |
| Bento Grid | 非對稱格線布局，用於首頁服務星圖（Section 3） |
| has-threejs | `<body>` class，控制 Three.js canvas 顯示 / CSS 星空隱藏 |
| js / no-js | `<html>` class，JS 可用性標記（core.js 切換） |
| js-hidden | 入場動畫前預隱藏 class（GSAP 負責顯示） |
| data-reveal | 通用 ScrollTrigger 進場屬性（core.js 處理） |
| data-stagger-group | 子元素 stagger 進場屬性（core.js 處理） |
| f-bebas | Bebas Neue 字型，英文裝飾大字專用（`--f-bebas`） |
| f-disp | Exo 2 字型，英文標題（`--f-disp`，實際使用較少）|
| A–F | 服務六大類（A社群、B開發、C虛擬網紅、D顧問、E跳動E投放、F社群增長）|
| FEATURED | bento--c 卡片右上角裝飾標籤（CSS ::after 生成） |

---

## 四、當前任務狀態

### 任務背景
2026-04-15 起創辦人主導官網全面改版，技術架構與共用元件已完成，首頁 HTML/CSS/JS 骨架建立完畢。首頁目前進入視覺元素實裝階段，待 DESIGN_MODE=false 解封後驗收動畫。

### 任務清單與進度

| # | 任務 | 狀態 |
|---|------|------|
| 1–8 | 規格確認、架構設計、品牌決策 | ✅ 完成 |
| 9 | 關於我們文案撰寫 | 🔲 待完成 |
| 10 | 前端骨架（token / base / components / animations / core.js / nav.js） | ✅ 完成 |
| 11a | 首頁主視覺背景（Three.js 黑洞漩渦星場） | ✅ 確認完成 |
| 11b | 首頁視覺元素實裝與微調 | 🔄 進行中 |
| 12 | 服務頁 IA 重構：services.html 退役、nav「服務」改錨點 | ✅ 完成（2026-05-07 21:18） |
| 12a | 9 個 teaser 頁（7 服務 + about + news）共用 coming-soon 模板 + contact.html 極簡聯絡頁 | ✅ 完成（2026-05-07 21:38） |
| 12b | 7 個服務頁正式內容填充（取代 teaser） | 🔲 待執行（依素材與文案進度逐頁升級） |
| 13 | 內容填充（作品截圖、角色圖等素材） | 🔲 待完成（等素材提供） |
| 14 | SEO / sitemap / Schema 更新 | 🔲 待完成 |
| 15 | 測試與部署上線 | 🔲 待完成 |
| 16 | 太空人 ScrollTrigger 角色敘事（見下方設計構想 backlog） | 🔲 構想階段（未啟動實作） |

---

### 設計構想 backlog（2026-05-07 21:46 創辦人提出）

#### 太空人 ScrollTrigger 角色敘事「沉思 → 破格」

**創辦人原始劇本（2026-05-07）：**

| 狀態 | 畫面 | 情緒 |
|---|---|---|
| 頁面初始（未滾動） | 太空人坐著托腮沉思，旁邊一句 hero 文案。極靜。 | 冷靜、高級、克制 |
| 使用者開始滾動 | 太空人突然 — 跌倒 / 滾走 / 手一滑杯子打翻 / 跑出畫面框 | 驚喜、會心一笑、「欸這公司有趣」 |
| 後續 section | 每段他以不同「不正經姿態」出現：倒栽蔥、飄過去、踩在標題上、偷看下一段 | 陪伴、頑皮、記憶點 |
| Final CTA | 他重新坐回原位假裝沒事，但旁邊有個打翻的咖啡杯 | 收尾、幽默、留白 |

**設計核心：** 反差敘事——「冷峻電影感深空 + 一個搞笑陪伴的太空人」是品牌調性的具象化（呼應 §一 設計判斷三條：俐落、線條、電影感的同時，主動製造衝突反差是美學本身，不是妥協）。太空人是品牌「非常規思維」訴求的人格化角色。

**為什麼從「Hero 太空人 3D 模型」轉到「ScrollTrigger 全站角色敘事」：**

- 2026-04-21 原規劃 Hero Three.js 3D 太空人已從 Hero section 移除（CLAUDE.md 偏差表既存紀錄），HTML 以 `<!-- 太空人暫時移除 2026-04-21 -->` 標記保留位置
- 移除原因：3D 模型只在 Hero 露臉一次、無敘事延續性、視覺重量壓過 hero 文案
- 本構想把太空人從「Hero 一次性視覺物件」升級為「全站陪伴角色」，從靜態裝飾變成敘事節奏一部分，這是更有意義的角色設計

**技術選型評估：**

| 方案 | 適合度 | 說明 |
|---|---|---|
| Three.js 3D 模型 + ScrollTrigger 驅動 | ❌ 過重 | 3D 真實感與「跌倒/打翻杯子」卡通敘事衝突；多姿態切換需 mixer / morph target，工程量大 |
| Lottie + ScrollTrigger 控制進度 | ⚠️ 可行 | 動畫師做完整時間軸，ScrollTrigger 控 lottie.goToAndStop。但 Lottie 檔案大、需要動畫師產出；風格易偏 SaaS 卡通 |
| **SVG 多姿勢圖 + GSAP/ScrollTrigger 切換**（建議） | ✅ 最適合 | 設計師畫 6-8 張姿勢 SVG（沉思 / 跌倒中 / 倒栽蔥 / 飄過 / 踩標題 / 偷看 / 坐回 + 咖啡），ScrollTrigger 控位置 / rotation / opacity 切換。檔案小、品質可縮放、跟整站線條極簡風一致 |
| PNG 序列幀 + GSAP | ⚠️ 備選 | 簡單但縮放會糊、檔案多 |

**ScrollTrigger 是技術骨幹（GSAP 全站已載入、core.js 已註冊 plugin），但主要工作量在角色設計／插畫產出，不在程式碼。**

**初步架構草案（SVG 方案）：**

```
<!-- HTML：全頁固定容器 -->
<div class="astronaut" data-pose="contemplating" aria-hidden="true">
  <svg>...當前姿勢...</svg>
</div>

<!-- JS：各 section 觸發姿勢 + 位置動畫 -->
ScrollTrigger.create({
  trigger: '.manifesto',
  start: 'top 90%',
  onEnter: () => {
    swapPose('falling');                    // 切 SVG
    gsap.to('.astronaut', {
      x: '+=200', rotation: 360, duration: 1
    });
  }
});
```

**素材清單（待設計師產出）：**
1. Hero idle — 坐姿托腮沉思
2. Transition — 跌倒中（旋轉模糊）
3. Manifesto — 倒栽蔥
4. Bento services — 飄過畫面 / 踩在卡片上 / 偷看下一張卡
5. Final CTA — 坐回原位 + 旁邊打翻的咖啡杯（含咖啡漬光暈）

**待決事項：**
- 太空人視覺風格（線條極簡 vs. 平塗色塊 vs. 半寫實插畫）—— 需配合整站冷峻電影感調性
- 手機版策略——縮小 / 隱藏 / 簡化（ScrollTrigger 在小螢幕觸發節奏可能太密集）
- 無障礙——`prefers-reduced-motion` 應停用所有姿勢切換動畫，至少保留靜態 idle 姿勢

**啟動條件：** 設計師交付 6-8 張 SVG 姿勢圖 + 風格一致性確認後啟動實作。實作本身（ScrollTrigger 編排）約 0.5 天工作量。

---

### SEO 策略（2026-05-07 13:09 確立方向）

**核心判斷：形象頁是轉換頁、不是獲客頁。** 未來主流量來自內容頁（吸 Google 長尾關鍵字）→ 內鏈導流至形象頁 → 詢問轉換。形象頁主要承接品牌詞搜尋（自家品牌不爭排名），長尾關鍵字需要文章頁承接。

**階段 1（UI 設計定案後執行）形象頁基礎 SEO 埋設**：
- 每頁獨立 `<title>` / `<meta description>`
- Open Graph 標籤（`og:title` / `og:description` / `og:image`）
- 結構化資料 Schema.org `LocalBusiness`（地址、營業時間、聯絡方式）
- `sitemap.xml` + `robots.txt`
- H1 / H2 語意層級確認

埋在 HTML metadata、不影響視覺，設計收尾後一次補完。對應任務清單 #14。

**階段 2（未來開內容頁時執行）內容 SEO 主戰場**：
- 關鍵字研究 + 內容主題規劃（產業洞察／設計教學／案例拆解／FAQ）
- 內部連結策略（文章自然連回形象頁服務區塊）
- E-E-A-T 作者背景（Google 看重作者專業度）
- 部署位置：主站 `/blog` 子目錄（權重集中），**不另開子網域**

**紅線**：禁止為 SEO 把長尾關鍵字塞進形象頁文案破壞設計節奏；長尾流量靠內容頁，不靠形象頁。

**待辦觸發**：UI 設計定案 → 啟動階段 1。階段 2 待創辦人決定內容生產時機。

---

### 主視覺背景技術規格（已確認，禁止改動核心數值）

**檔案**：`assets/js/pages/index.js` → `initStarfield()`、`assets/css/pages/index.css` → `#blackhole`

#### 粒子系統（Three.js）

| 常數 | 值 | 說明 |
|------|----|------|
| COUNT | 6500 | 主軌道粒子數 |
| R_MIN | 0.42 | 事件視界半徑 |
| SPIRAL_K | 0.42 | 螺旋臂捲曲係數 |
| TILT | π/12（+15°） | 傾斜角，與 CSS #blackhole 斜帶同向 |
| 橢圓比 | b/a = 0.38 | 盤面比例 |
| ROT_BY_TYPE | [0.00060, 0.00032, 0.00017, 0.000075] | 四色群開普勒差速 |
| BASE_PULL | 0.000010 | 向心拉力 |
| 暖機幀數 | 6000 | 讓差速剪切充分自然化，不可減少 |

**三層粒子結構**：
1. **主軌道粒子**（6500 顆）：逐粒子極座標軌道計算，螺旋臂 spread=0.08、臂密度 95%；A×B 亮度分層
2. **星際塵埃層**（2800 顆）：靜態初始化、整體 `rotation.z += 0.000022` 旋轉，spread=0.55 臂暈染，亮度 0.03–0.14
3. **背景星塵**（1800 顆）：球形分布，`sizeAttenuation:false`，`opacity:0.60`

**B 本質亮度分布**：58% 超暗（0.08–0.28）/ 25% 中暗（0.32–0.58）/ 14% 中等（0.62–0.85）/ 3% 亮錨點（0.88–1.0）

---

### DESIGN_MODE 靜態凍結開關（2026-04-19）

**目的**：避免 GSAP inline style / CSS animation / Three.js RAF 循環干擾靜態驗收。切回動態只需翻轉 boolean，所有 `init*()` 函式原封保留。

**開關位置**：`assets/js/pages/index.js:13` → `const DESIGN_MODE = true;`

**true（當前）凍結範圍**

| 層 | 項目 | 凍結機制 |
|----|------|---------|
| L2 進場動畫 | `initHeroEntrance()` / `initScrollAnimations()` / `initConstellation()` | 條件式不呼叫（函式保留） |
| CSS animation | 全站 keyframes | `body.design-mode * { animation-play-state: paused !important }`（`base.css:192`） |
| Three.js RAF | 星場 `animate()` | `if (!DESIGN_MODE) requestAnimationFrame(...)` — 暖機 6000 幀後 render 單幀停住 |
| WebGL 緩衝區 | 星場 canvas 單幀保留 | `preserveDrawingBuffer: DESIGN_MODE` |
| `.js-hidden` | 等待 GSAP 解放的元素 | `body.design-mode .js-hidden { opacity:1 !important; transform:none !important }`（`base.css:183`） |

**true 時保留**：Three.js 星場單幀定格、CSS 星空靜止、`#blackhole` radial-gradient、所有靜態排版。

---

### 已存在的頁面檔案
- `index.html` — 4 sections 完整實作（Hero / 宣言 / Bento 服務 / 終點 CTA「先別點」），site-footer 同步重設計。Section 4 品牌故事於 2026-05-07 移除。`<section class="services-section">` 加 `id="services-section"` 作為 nav 錨點目標（2026-05-07 21:18）。
- `social.html` / `virtual.html` / `website.html` / `system.html` / `consultant.html` / `tiktok.html` / `growth.html` / `about.html` / `news.html` — 9 頁 teaser「敬請期待」共用 `pages/coming-soon.css`（2026-05-07 21:38）
- `contact.html` — 極簡聯絡頁（LINE/電話 Liquid Glass 卡片連結 + 地址統編 mono），使用 `pages/coming-soon.css` 大架構 + `pages/contact.css` 補充（2026-05-07 21:38）
- `maintenance.html` — 真維護備用頁（與 teaser「敬請期待」分開）

### 已退役的頁面檔案（2026-05-07 21:18）
- `services.html` + `pages/services.css` + `pages/services.js` — 服務總覽中間頁，IA 重構後退役

### 實作偏差備注
| 項目 | 文件規劃 | 實際實作 |
|------|---------|---------|
| 服務頁 IA 結構（2026-05-07 21:18） | nav「服務」→ services.html 總覽中間頁 → 個別服務頁（雙層導覽） | 改為錨點滾動：nav「服務」→ `index.html#services-section` 直接捲到首頁 bento 服務星圖 → 個別服務頁（單層主線）。services.html / pages/services.css / pages/services.js 整批刪除。Hero CTA「探索服務」同步改 `#services-section`。`.services-section` 加 `scroll-margin-top: 80px` 補償 fixed nav。**紅線**：禁止再造服務總覽中間頁；首頁 bento 是唯一服務陳列點。完整推導（為什麼不選 hover 下拉 / 為什麼不選深度服務地圖）見 commit body。 |
| 個別服務頁 / 子頁實作策略（2026-05-07 21:38） | bento 卡點進去的個別服務頁從零撰寫完整內容後上線 | 改為先做 teaser「敬請期待」共用模板（`pages/coming-soon.css`），再依素材進度逐頁升級為正式內容。9 個 teaser（7 服務 + about + news）共用 5 段結構：eyebrow（mono uppercase + 黃色冷光 border-top）/ Chiron Sung HK 中文 title（4-layer text-shadow §十七 紀律）/ 對稱 cyan 冷光 divider（呼應 final-cta__divider）/ Noto Sans TC lead（沿用 bento desc 文案）/ mono pill status「內容準備中 · Coming Soon」/ btn--primary「想先聊聊」CTA → contact.html / 「← 回服務星圖」隱性出口（about/news 改「← 回首頁」）。virtual.html / about.html 有 Italiana 英文 echo（呼應 bento C 雙語對位）。**為什麼選 teaser 不選「全部導 maintenance」**：訪客點 AI 虛擬網紅卻看到「全站維護」會懷疑點錯；teaser 顯示服務名稱可確認 + 個別 OG meta 為長尾 SEO 預備（呼應 SEO 階段 1 紀律）。**紅線**：teaser 升級為正式頁時保留同一 URL（不換 slug），維持已埋 OG / canonical 連續性；contact.html 永久留作正式聯絡頁、不被 teaser 化。 |
| contact.html 極簡聯絡頁（2026-05-07 21:38） | 規劃為含表單的完整 contact 頁（依個資法第 8 條配隱私權政策連結） | 表單實作前先做極簡版：沿用 coming-soon 大架構（eyebrow / 中文 title / Italiana en echo「Get in Touch.」/ divider / lead）+ `.contact__channels` Liquid Glass 卡片連結（LINE 連 line.me / 電話 tel:）+ `.contact__studio` mono 小字（地址 + 統編）。資料來源全部沿用 site-footer 已有資訊不另蒐集。**紀律**：未實作表單前不放隱私權政策連結（無蒐集行為不觸法第 8 條）；正式表單上線時補回隱私權政策頁與 footer 連結（CLAUDE.md site-footer 偏差表已紀錄此承諾）。 |
| 裝飾字型 | Exo 2（--f-disp） | Bebas Neue（--f-bebas）為主要裝飾字 |
| 等寬字型 | IBM Plex Mono | 維持 IBM Plex Mono |
| Hero 太空人 | Three.js 3D 模型 | 2026-04-21 已從 Hero section 移除（HTML 以 `<!-- 太空人暫時移除 2026-04-21 -->` 標記保留位置） |
| 四角座標文字 | 規格書原列為裝飾 | 2026-04-18 移除（HTML `.coords` 與 CSS 規則均已刪） |
| Section 4 品牌故事預告 | 規劃為「不正常人類的故事」介紹區塊 + initPrismaticSweep 稜鏡光斑動畫 | 2026-05-07 創辦人要求拿掉。HTML `.brand-preview` 整段刪除、JS 兩段 scrollTrigger 動畫（big-label / brand-preview__right）+ `initPrismaticSweep()` 函式整段 + 其呼叫全部移除。CSS 本來就沒實作（HTML 有 brand-preview 相關 class 但 CSS 從未對應）。 |
| Hero 副標 SVG zig-zag 裂縫線 | 2026-04-26 規劃為「文字從深空撕裂的縫中炸出來」視覺，由 `initRift()` 動態注入 5 條 SVG path 疊在 `::after` 暗橢圓上 | 2026-05-05 創辦人判定 SVG zig-zag「像閃電線」設計失敗，徹底移除（HTML `.hero__rift-crack` 子層、JS `initRift()` 函式 + GSAP scaleX 動畫全部刪除）。**紅線**：禁止再回 SVG zig-zag 線條方向。 |
| Hero 副標 `::after` 暗橢圓背景 | 2026-05-05 SVG zig-zag 移除時保留 | 2026-05-06 創辦人決定一併移除。`.hero__rift::after` 規則整段刪除。`.hero__rift` 容器仍保留作為副標 flex 排版（中文 / `.hero__readout-divider` 冷光分隔線 / 英文）的右對齊定位 wrapper。**現狀**：仿宋中文 + 深藍冷光分隔線（max-width 1200、向右側射出 gradient、與 h1 主標冷光線同色系）+ Italianno 英文、`align-items: flex-end` 靠齊右側。 |
| Hero ANOMALY + Manifesto UNCONVENTIONAL 背景大字 | 2026-04-18-19 規劃為 Variable Font 軸動文字（Fraunces 三軸 opsz/wght/SOFT 由 GSAP ScrollTrigger 驅動） | 2026-05-06 創辦人要求兩處均移除。HTML `.hero__bg-text` / `.manifesto__bg-text` div、CSS 桌機與手機 media query、JS `initVariableFontAxis()` 函式整段、`@property --vf-opsz/--vf-wght/--vf-soft` 三條宣告全部刪除。**紀律**：Variable Font 軸動系統全退役；Fraunces 字型 import 仍保留（其他地方仍用於 `.lead-large` 等）。 |
| 左上 nav 品牌（NEST · DIGITAL + 暖白星點）| 2026-04-19 規劃為「等寬字 mark + 望遠鏡下的恆星星點」觀測儀框架符號 | 2026-05-06 觀測儀版整個拿掉（commit 6ce87d4）→ 2026-05-06 後續重設計為「純文字並行排版」（commit cfe5a99）：`.nav__brand-zh`（Chiron Sung HK 中文「創巢數位」16px）+ `.nav__brand-divider`（1em 高度青色冷光垂直分隔線，gradient peak 在 50% 向兩端漸隱）+ `.nav__brand-en`（JetBrains Mono「NEST DIGITAL」11.5px）。中英並列形成「主訴求 + 副標」連續閱讀節奏，與 manifesto 中英 echo 同設計語言。**架構備注**：`.nav__cta` 的 `margin-left: auto` 仍保留以避免未來 brand 改動再次破壞 flex。 |
| Section 5 終點 CTA | 規劃為「立即聯絡 + 查看所有服務」雙按鈕居右 | 2026-05-07 重設計為「先別點」反轉 CTA + 居中布局。結構：「先別點。」（Chiron Sung 大字 clamp 3.5–7.5rem 句號為視覺重音）/ "Don't click yet."（Italiana cyan echo）/ 對稱冷光線（c-blue 中央 0.85 向兩端衰減 + box-shadow 12px，與 Hero / Manifesto 的「右側單向射出」線形成設計反差呼應居中語境）/「除非你準備好不正常一次。」（cwTeX 仿宋 stellar 0.85）/ "Unless you're ready to break something."（Italiana cyan 0.75）/ 黃色按鈕「我準備好了 →」/ 背景中央 c-blue 微光暈。副標中英 text-shadow 套用全站四層紀律（見下條）。聯絡資訊移到 site-footer 統一承載。 |
| site-footer | 原一行三段（品牌 / 4 連結 / ©）| 2026-05-07 重設計為「電影片尾收束」結構（commit 0588167）：① 上方對稱冷光線（c-blue 中央 0.65 寬 240–400px，呼應 final-cta 對稱線但更克制）② 巨型 NEST DIGITAL 大字（Italiana hairline，clamp 2.5–9rem，letter-spacing 0.06em，stellar 0.92）③ 座標讀出條「桃園・中壢｜中央西路二段 268-1 號 5 樓」（mono 等寬，stellar 0.45）④ 兩欄資訊：CONTACT（LINE @604vqsva / 03-4912872）/ STUDIO（創巢數位資訊企業社 / 統編 93019200）⑤ 最底版權行（mono stellar 0.30）。砍掉重複 nav 連結（主導覽列已有）。手機版下限 2.5rem 字級 + letter-spacing 0.02em 確保 400px viewport 不撞邊。**架構備注**：index.html / services.html 目前各自手寫一份；後續頁面數變多需評估抽到 nav.js 注入。**法律備注**：目前無蒐集表單資料故暫不放隱私權政策連結；contact.html 表單實作時依個資法第 8 條補入隱私權政策頁與 footer 連結。 |
| 全站副標 text-shadow 與英文 echo 字型系統（2026-05-07）| 各副標獨立樣式：Hero 中文有冷藍光暈（背面光源感）/ 其他副標無陰影 / final-cta 多輪 text-shadow 探索 | 2026-05-07 收斂為兩條穩定紀律：**(1) 所有副標中文** 套用四層 text-shadow（`1px 1px 0` 純黑 + `2px 2px 3px` 黑 0.85 + `0 0 12px` 純黑 + `0 0 24px` 黑 0.5），做跨背景 legibility shadow + 偏移層次感。selector：`.hero__readout` / `.manifesto__body p` / `.final-cta__subtitle`。Hero 中文原冷藍光暈（`0 0 40px c-blue 0.18 + 0 2px 60px c-blue 0.08`）已替換為四層黑陰影（commit fb78c16）。**(2) 所有副標英文 echo** 維持裸字 Italiana（`var(--f-display-en)`）+ 無陰影。selector：`.hero__readout-en` / `.manifesto__body-en` / `.final-cta__title-en` / `.final-cta__subtitle-en`。**字型紀律**：偏移陰影（≥ 1px 偏移）與 hairline serif 衝突 — Italiana 最細筆畫 0.5-1px 會被 1px 偏移陰影完全覆蓋吃字；hairline 系列字型不可配偏移陰影，穩定筆畫 serif（Fraunces 等）可以。**設計判斷紀律**：中英不對稱（中文有陰影／英文裸字）是設計選擇而非疏失，強化「中文訊息主體／英文 echo 雜誌風註腳」雙語層級對比。**探索脈絡**（光暈擴散 vs 描邊 vs 偏移陰影概念釐清、字型衝突診斷、internal high-alpha 階梯延伸實驗）見 git log 2026-05-07 一系列 commit body。 |
| 服務卡片 Liquid Glass 水狀玻璃（2026-05-07） | 原一般 Glassmorphism（c-blue 0.12 半透明 + blur 16）+ 右上角 radial 光點裝飾 | 借用 Apple Liquid Glass 三技法升級：**① 邊緣折射光**（雙 background gradient：padding-box 玻璃底 + border-box cyan 折射光環取代 1px solid border）**② 內部水面反光**（多層 inset：頂邊 cyan 0.18 細亮線 + 底邊黑 0.35 + 上方 40px cyan 0.10 內陷光暈 + 外部 0 8px 32px 黑投影）**③ Hover 整片折射**（`::after` radial cyan 0.20 中心浮現）。backdrop-filter blur 16→24 + saturate 1.4。`.service-card > * { z-index: 1 }` 把內容推到 `::before` / `::after` 折射層之上。bento--c / bento--e 原 background override 移除統一質感。Hover 加強：inset cyan 0.32/0.20 + 外部 cyan 0.18 浮光 + 黃 0.12 微量 CTA 訊號。**紀律**：`transparent` border + 雙 background gradient 是水狀視覺關鍵、禁止改回 1px solid border。 |
| 服務卡片極簡編輯陳列（2026-05-07） | 原 7 張卡片 icon 圓圈 44px（Font Awesome SaaS 公版）+ 中文 label + title fs-xl 900 黑體 + desc + 「了解更多 →」標準結構 | 重設計為 head (label) + body (title / desc / tag) + arrow 三段：**① 移除 icon 圈圈 + 編號排版**（曾試 Italiana A./B¹./C./D./E./F. 後決定整個拿掉）**② label** 改英文 mono uppercase + 上方 1px 黃色冷光分隔線（border-top + align-self: flex-start 限制寬度）**③ title** 改 Chiron Sung HK 中文 fs-xl 500（呼應 Hero h1 主標）**④ arrow** 改 Italiana italic「Read more」+ `.service-card__arrow-line` 1px 線條 hover 28→56px 寬度 + cyan→yellow 變色 **⑤ D 卡** tag-row「詢價制」移入 body 內 **⑥ E 卡** 取消 `.bento--e__layout` 雙欄、改回標準堆疊（雙欄左欄無編號後浪費）。**設計判斷**：服務區塊角色是「陳列、選擇」非視覺爆破點（Hero 已是），靠 Liquid Glass 質感 + 字型對位 + 留白建立識別、不需編號 / icon / 大字等視覺主錨。**紅線**：服務卡片禁止再加 SaaS 公版圖示圈圈或大號 Italiana 編號。完整探索脈絡（編號排版 → 移除 → 文案優化）見 commit body。 |
| C 卡 FEATURED 雙語對位（2026-05-07） | title「THE 2ND LIFE OF BRAND」純英文 Italiana 36px + desc 業界術語「角色系統 / 情緒穩定 / 形象可控 / 精準導流」 | 改為中英對位 + 文案張力：**① title** 改中文「永遠不下班的代言人」（Chiron Sung HK 28px 跟其他卡統一）**② 新增 `.service-card__title-en`** Italiana 英文 echo「The 2nd Life of Brand.」（fs-md / stellar 0.55 / letter-spacing 0.03em）保留意境又不影響中文易讀性 **③ desc** 改「為品牌打造一個只屬於你的虛擬代言人。不會出包、不會漲價、不會休假——只跟你站同一邊。」三段反差呼應 final-cta「先別點」反轉風格、結尾切入真人網紅跑單痛點。FEATURED 卡差異化三層：FEATURED mono 標籤（右上）+ 雙語 title 對位（全站只有 hero / manifesto / final-cta / C 卡有此待遇）+ 文案張力。原 `.bento--c .service-card__title` 純英文 Italiana 規則 + `sup` 規則一併移除。 |
| 服務卡片進場動畫純 opacity（2026-05-07） | 原 GSAP `gsap.fromTo(cards, {opacity:0, y:36, scale:0.96}, {opacity:1, y:0, scale:1, ...})` 三軸動（fade + 上升 + 縮放） | 改為純 `{opacity:0} → {opacity:1, stagger:0.12}` 純淡入。**為什麼**：**①** GSAP `immediateRender:true` 立即把 cards 設成 transform 偏移狀態 → `getBoundingClientRect()` 受 transform 影響、後續 SVG overlay 計算卡片中心會錯位 **②** GSAP fromTo 動畫結束保留 inline transform → CSS `.card:hover { translateY(-4px) }` 無 `!important` 被 inline 覆蓋 → hover 時卡片不上移。**紀律**：服務卡片進場禁止再用 y / scale transform、純 opacity stagger 為設計選擇也是 bug 防線。 |
| initConstellation 卡片連線退役（2026-05-07） | 規劃為 Bento 卡片之間 SVG line 串接星座（每張卡中心圓點 + 連線） | 創辦人決定不要連線視覺，`function initConstellation()` 整段從 `index.js` 移除（保留章節 6 標記「已退役」），`init()` 內呼叫已刪除。**根因暴露**：DESIGN_MODE = false 動態打開後 SVG inline width 撐爆 `.bento-grid` 第 1 欄（A 卡撐全寬、F C 卡擠出畫面），連線 CSS 從未設計、是長期隱性 bug 動態打開才暴露。**紀律**：未來若要恢復卡片之間連線視覺，需先設計 `.bento-constellation` CSS（absolute 定位 + line stroke + circle fill + .is-visible 淡入）才能啟用 JS 注入；`initConstellation` 函式已不存在、需重寫。 |
| DESIGN_MODE 動態打開（2026-05-07） | 2026-04-19 啟用為 `true` 凍結所有動畫驗收靜態 | 2026-05-07 翻轉為 `false` 動態打開（`assets/js/pages/index.js:17`）。Three.js 黑洞星場 RAF 持續、Hero `initHeroEntrance` / `initScrollAnimations` / 服務卡 ScrollTrigger 全部啟用、CSS keyframes 解封、`.js-hidden` 由 GSAP 接管。**紀律**：DESIGN_MODE = false 動態打開後若需臨時凍結動畫驗收靜態（如改字級 / 排版），翻回 `true` 即可，所有 `init*()` 函式原封保留。 |
| Hero CTA 單按鈕聚焦（2026-05-07 19:02） | 原 Hero「探索服務」(.btn--primary) +「了解我們」(.btn--ghost) 雙按鈕並排 | 移除「了解我們」整段 HTML + `.hero__cta-group .btn--ghost` 死碼 CSS。**理由**：① about.html 未實作 = 死連結 ② nav 已有「關於」入口、Hero 重複放等於浪費 attention ③ 跟「先別點」反轉風的「單一行動」哲學一致 ④ ghost 按鈕用 `fa-arrow-up-right-from-square` 外連結 icon 暗示「會跳走」、但 about.html 是站內頁、icon 行為矛盾。**紀律**：未來 about.html 完成後若要恢復按鈕、需重評估視覺重量是否仍適合雙按鈕或維持單按鈕聚焦。 |
| 按鈕系統 Apple Liquid Glass 重設計（2026-05-07 19:02） | 原一般 Glassmorphism + Material Design 殘留（`.btn` radius 6px + Chiron Sung HK 700；`.btn--primary` 1px solid blue border；`.btn--yellow` 純黃 + 黑字 900 SaaS Banner 風） | 升級為 Apple Liquid Glass 質感（呼應服務卡片同設計語言）：**① `.btn` 主規則** 字型 Noto Sans TC 500（按鈕用 sans 不用宋）+ radius 10px + letter-spacing 0.04em + Apple ease-out-expo `cubic-bezier(0.16, 1, 0.3, 1)` + `:active scale(0.97)` 點擊回饋 **② `.btn--primary`** 雙 background gradient（padding-box 玻璃底 + border-box cyan 折射光環）+ backdrop blur 12px + inset 多層光影 **③ `.btn--yellow`** 液態金按鈕（黃→琥珀漸層 + 邊緣 white→yellow→amber 折射 + 頂邊白 0.55 高光 + 底邊黑 0.20 陰影 + 外部黃光暈）+ `::after` 點擊光暈擴散（Apple visualEffect 風） **④ `.btn--ghost`** 保留純文字極簡風（加 `:active { transform: none }` 不繼承 scale）。**過程紀錄**：曾反思「過度 Apple 風」、一度 revert 回電影感版（radius 4px / Chiron Sung HK / 純黃實心）、隨即發現範圍越界（用戶擔憂範圍是 nav 不是按鈕、按鈕 Apple 化是用戶最初認可的）、再 revert 回此版。**紀律**：服務卡片 + 按鈕兩處 Apple Liquid Glass 化是「有意設計選擇」、非框架性全站套用；其他元件評估時仍回到「俐落、線條、電影感」三條判斷、不因「Apple 化某處」就全站套用。 |
| nav 視覺優化（電影感方向、不走 Apple 毛玻璃）（2026-05-07 19:02） | ① `.nav__links a` letter-spacing 0.35em（字拉散像散字、不像詞）② `.nav__links a` idle `text-shadow: 0 0 14px blue 0.5`（永遠像 hover 狀態、層次消失）③ `.nav__brand-zh` 16px / `.nav__brand-en` 11.5px（中英比例失衡、中文主訴求視覺重量不足） | **① `.nav__brand-zh` 16→17px**（中英比例平衡）**② `.nav__links a` letter-spacing 0.35em→0.1em**（字距收斂、字像詞不像散字）**③ `.nav__links a` idle blue text-shadow 拿掉**（保留 hover 才有 cyan 暈光、idle/hover 對比層次回來）。**不做**：`.site-nav.scrolled` 維持純黑半透明 `rgba(black, 0.92)`（**不走 Apple 毛玻璃方向**）+ `.nav__cta` 維持純文字 + 箭頭極簡風（**不轉按鈕**）。**設計判斷**：nav 走「電影感冷峻」方向（純黑半透明 + cyan 底邊 + 排版紀律）、跟服務卡片 + 按鈕的 Apple Liquid Glass 質感「有意分流」——每個元件依其角色決定是否套 Apple 化、不全站同步。 |
