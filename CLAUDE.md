# 創巢數位 Nest Digital 官網改版｜CLAUDE.md

---

## 一、專案架構與技術決策

### 設計判斷原則：不被任何框架綁住（2026-04-21 創辦人定調 → 2026-05-04 commit 551cf89 誤刪 → 2026-05-06 還原 + 釐清）

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
| 12 | services.html 骨架 | 🔄 進行中（其餘 9 頁待執行） |
| 13 | 內容填充（作品截圖、角色圖等素材） | 🔲 待完成（等素材提供） |
| 14 | SEO / sitemap / Schema 更新 | 🔲 待完成 |
| 15 | 測試與部署上線 | 🔲 待完成 |

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
- `index.html` — 5 sections 完整實作（Hero / 宣言 / Bento服務 / 品牌故事 / CTA）
- `services.html` + `assets/css/pages/services.css` + `assets/js/pages/services.js` — 骨架
- `maintenance.html`

### 未實作的頁面（nav 已有連結）
about.html、contact.html、news.html、social.html、website.html、system.html、virtual.html、consultant.html、tiktok.html、growth.html

### 實作偏差備注
| 項目 | 文件規劃 | 實際實作 |
|------|---------|---------|
| 裝飾字型 | Exo 2（--f-disp） | Bebas Neue（--f-bebas）為主要裝飾字 |
| 等寬字型 | IBM Plex Mono | 維持 IBM Plex Mono |
| Hero 太空人 | Three.js 3D 模型 | 2026-04-21 已從 Hero section 移除（HTML 以 `<!-- 太空人暫時移除 2026-04-21 -->` 標記保留位置） |
| 四角座標文字 | 規格書原列為裝飾 | 2026-04-18 移除（HTML `.coords` div 與 components.css `.coords` 規則均已刪除） |
| Section 4 品牌故事預告 | 規劃為「不正常人類的故事」介紹區塊 + initPrismaticSweep 稜鏡光斑動畫 | 2026-05-07 創辦人要求拿掉。HTML `.brand-preview` 整段刪除、JS 兩段 scrollTrigger 動畫（big-label / brand-preview__right）+ `initPrismaticSweep()` 函式整段 + 其呼叫全部移除。CSS 本來就沒實作（HTML 有 brand-preview 相關 class 但 CSS 從未對應）。 |
| Hero 副標 SVG zig-zag 裂縫線 | 2026-04-26 規劃為「文字從深空撕裂的縫中炸出來」視覺，由 `initRift()` 動態注入 5 條 SVG path（glow/main/branch×2/core）疊在 `::after` 暗橢圓上 | 2026-05-05 創辦人判定 SVG zig-zag「像閃電線」設計失敗，徹底移除：HTML 的 `.hero__rift-crack` 子層、JS 的 `initRift()` 函式與其呼叫、`initHeroEntrance()` 中針對 `.hero__rift-crack` 的 GSAP scaleX 動畫全部刪除。當時保留 `.hero__rift::after` 暗橢圓背景與文字冷藍光暈（創辦人當下要保留）。**警示**：清理當下主 session 一度誤判用戶意圖把整個裂縫設計一起移除，被糾正後 revert 並改精確切除。SVG 注入殘骸源自更早一輪「只刪 CSS 留下 JS+HTML」的不徹底清理。後續若需重新設計副標題視覺，禁止再回 SVG zig-zag 線條方向。 |
| Hero 副標 `::after` 暗橢圓背景 | 2026-05-05 SVG zig-zag 移除時保留 | 2026-05-06 創辦人決定一併移除（覺得「黑色裂縫」已不再需要）。`.hero__rift::after` 規則整段刪除。`.hero__rift` 容器仍保留作為副標 flex 排版（中文 / `.hero__readout-divider` 冷光分隔線 / 英文）的右對齊定位 wrapper。Hero 副標目前的設計演化：仿宋中文 + 深藍冷光分隔線（max-width 1200，向右側射出 gradient）+ Italianno 英文，全部 `align-items: flex-end` 靠齊畫面右側。後續演化：分隔線色由 cyan 換深電藍 c-blue 與 h1 主標冷光線同色系（commit a76a887）；中文字級縮 2px 底部靠近冷光線（commit ed79b07）；中文顏色改回與英文一致 0.85 alpha（commit 7f7eeb9）。 |
| Hero ANOMALY 背景大字 | 2026-04-19 規劃為 Variable Font 軸動文字（Fraunces 三軸 opsz/wght/SOFT 由 GSAP ScrollTrigger 驅動） | 2026-05-06 創辦人要求移除（commit d7c4913）。HTML `.hero__bg-text` div、CSS 桌機規則與手機 media query、JS `initVariableFontAxis()` 中針對 hero 的 GSAP scrollTrigger 區塊全部刪除。當時保留 `@property --vf-*` 與 `initVariableFontAxis()` 函式（供 `.manifesto__bg-text` UNCONVENTIONAL 用）；2026-05-06 後續 UNCONVENTIONAL 也移除（見下一行），整套 Variable Font 軸動系統全退役。 |
| Manifesto UNCONVENTIONAL 背景大字 | 2026-04-18 規劃為左側超大描邊裝飾字 + Variable Font 軸動（與 Hero ANOMALY 同系統） | 2026-05-06 創辦人要求移除。HTML `.manifesto__bg-text` div、CSS 桌機規則與手機 media query、JS `initVariableFontAxis()` 函式整段、其呼叫、`@property --vf-opsz/--vf-wght/--vf-soft` 三條宣告、Variable Font 系統頂部註解全部刪除。整套 Variable Font 軸動退役。Fraunces 字型 import 仍保留（其他地方仍有使用，如 `.lead-large`、bento 卡片字級等）。 |
| 左上 nav 品牌（NEST · DIGITAL + 暖白星點）| 2026-04-19 規劃為「等寬字 mark + 望遠鏡下的恆星星點」觀測儀框架符號 | 2026-05-06 創辦人要求整個拿掉（commit 6ce87d4）。`nav.js` 的 `<a class="nav__brand">` 整段、`components.css` 的 `.nav__brand / -star / -mark / -sep` 四條規則、`animations.css` 的 `@keyframes star-twinkle` 全部刪除。Nav 現狀：左側空缺、中央 `.nav__links` 絕對定位、右側 CTA。**側效應修正**（commit ae421a0）：`.site-nav` 原 `justify-content: space-between` 依賴左右兩個 in-flow flex 子元素分散兩端；拿掉 brand 後只剩 CTA 一個 in-flow 元素被推到 flex-start（左）。修法：`.nav__cta` 加 `margin-left: auto` 強制推右，未來 brand 重設計回來也不破。**警示**：刪 brand 前未先預想 flex 行為退化，需事先模擬。**待重設計**：左上品牌新方向待創辦人決定，當前狀態為左上空缺。 |
