# 創巢數位 Nest Digital 官網改版｜CLAUDE.md

---

## 一、專案架構與技術決策

### 路徑
`C:\Users\user-45664\Desktop\Claude AI相關\數位印鈔機\NEW創巢官網`

### 技術棧
- **框架**：純靜態 HTML / CSS / JS（無前端框架）
- **3D 引擎**：Three.js r128（CDN），僅首頁（`body.has-threejs`）
- **動畫**：GSAP 3.12 + ScrollTrigger（CDN，全站）
- **圖示**：Font Awesome 6.4.0（CDN）
- **字型**：
  - `--f-serif-cjk`：**Chiron Sung HK WS**（港產明朝活字，jsDelivr GitHub CDN）→ 全站中文主視覺字（Hero 標題 / Nav 連結 / 按鈕）
  - `--f-serif`：**Fraunces Variable Font**（opsz / wght / SOFT 三軸，Google Fonts）→ 英文大標/副標/引言
  - `--f-sans`：Noto Sans TC（Google Fonts，100–900）→ 內文/說明/次要中文
  - `--f-mono`：IBM Plex Mono → 等寬資料讀出條、Nav 品牌名
  - `--f-bebas`：Bebas Neue → 英文裝飾大字（`UNCONVENTIONAL` 等）
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
| pages/[page].js | 頁面專屬互動（首頁：Three.js 星空粒子、Three.js 太空人、GSAP Hero 序列、ScrollTrigger）|

### 關鍵架構決策原因
- **Nav 動態注入**：nav.js 統一維護導覽列，修改單一檔案即全站生效
- **CSS 星空由 nav.js 注入**：避免 HTML 多頁重複；`body.has-threejs` 自動隱藏（首頁改用 Three.js）
- **`body.has-threejs`**：只有 index.html 有此 class，控制 Three.js canvas 顯示
- **`--f-bebas`（Bebas Neue）**：文件規劃的 Exo 2 作裝飾字，實作改為 Bebas Neue，Exo 2 保留但未使用

### 視覺設計語言（2026-04-21 第三版）

**⚠️ 2026-04-21 第三次修正**
前版「深空漫遊（Deep Space Drift）」錯誤地把「宇宙是背景」解讀為「設計語言必須符合宇宙的物理感（無重力、無邊界、光效只能模擬自然現象）」。這是用隱喻綁死了自己的手腳。

**突破脈絡（原始推力，2026-04-21）**
創辦人原話：「博物館也是一般人在逛的，我不能在宇宙展現俐落的設計？線條的美感？極致的光線？電影般的畫面？把有質感的東西放在宇宙裡，就是要有衝突，要反差。我們設計結構跟其他任何元素幹嘛要去考慮是不是宇宙？」

這句話拆解出三個設計判斷：
1. **想要的設計品質是明確的**：俐落、線條感、極致光線、電影畫面——這些是目標，不是「符合宇宙」
2. **衝突和反差是主動選擇**，不是妥協，是美學本身
3. **「是不是宇宙」是錯誤的問題**——正確問題是「這個設計元素放在深黑背景上有沒有力量」

根本洞察：宇宙是舞台，不是設計規則集。穿著俐落的人走進荒野，美的是反差——他不需要打扮成草。衝突、反差本身就是美學，也是這個品牌的性格。

**設計定位：深空舞台（Deep Space Stage）**
背景：永遠是深黑宇宙（`#020b1e` + Three.js 星場）。
設計：帶著自己的完整視覺語言走進舞台——線條因為漂亮而存在，光因為有張力而存在，排版因為有力量而存在。不需要問「這在宇宙裡合理嗎」。
品牌 DNA「沉穩的異類」：異類不會把自己打扮成環境的樣子。

**每個視覺決策的判斷標準**
→「放在深黑背景上，這個元素美嗎？有張力嗎？令人難忘嗎？」
不是：「這個元素符合宇宙的感覺嗎？」

**設計語言特質**

| 特質 | 說明 |
|------|------|
| 俐落 | 線條清晰，結構明確，不模糊不猶豫 |
| 光感 | 光線是設計工具：強調、引導、戲劇性——不需要物理依據 |
| 電影感 | 構圖有張力，對比有層次，像一個精心設計的畫面 |
| 反差 | 深黑背景 × 高對比元素，衝突製造記憶點 |
| 克制 | 不因為可以就全放，每個強元素都有明確的設計目的 |

**顏色系統**

| 色 | Hex / token | 比例 | 用途 |
|----|------------|------|------|
| 深空黑 | `#020b1e` / `--c-black` | 90% | 主背景（首頁覆寫為更深的 `#020b1e`） |
| 星白 | `#e8f0ff` `--c-stellar` | 7% | 主要文字、高光 |
| 冷藍 | `#1736F5` `--c-blue` | 2% | 光效重音、線條結構 |
| 冷電藍 | `#00c8ff` `--c-cyan` | 1% | Hover、互動反饋 |
| 琥珀金 | `#f5a623` `--c-yellow` | <1% | **全站僅出現於單一位置**（畫龍點睛） |

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
9. **禁用賽博龐克類效果**：掃描線、Glitch、色差（Chromatic Aberration）、HUD 瞄準框、終端機啟動序列、全像箔彩虹光、六角蜂巢網格、電路板紋、像素崩解 — 這些是廉價科幻片的慣用語彙，與品牌「沉穩的異類」性格相反
10. **文字解碼動畫**：全站僅可使用單次，用於最強敘事節點，不得當作裝飾重複出現
11. **琥珀金 `#f5a623`**：全站僅可出現於單一位置（畫龍點睛用），多處使用即破壞比例
12. **金屬光澤掃光不可 loop**：偶發觸發或單次觸發，loop 會變廉價感

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
| WOW 時刻 | 規格書定義的每頁視覺亮點 |
| 深空舞台 | 2026-04-21 第三版設計定位：宇宙是舞台，設計帶自己的視覺語言走進去形成反差（取代「深空漫遊」過度依賴空間隱喻的框架） |
| 軌道環 | SVG 細線繞核心元素緩慢旋轉的結構（原設計為太空人周圍；太空人 2026-04-21 移除，此元素暫停用） |
| 星座連線 | Bento 服務卡片之間以極細線相連形成的星座圖 |
| God Rays | 體積光丁達爾效應，頂部斜射一道 +15° |
| 金屬光澤掃光 | gradient 掃過文字模擬金屬反光，偶發不 loop |
| 稜鏡折射 | Prismatic 光斑，品牌故事區塊緩慢橫越 |
| 內凹陰影 | inset box-shadow / text-shadow 凹刻效果，雕刻質感基礎 |
| 磁性按鈕 | 游標靠近時偏移 6–8px 的 CTA，僅限主 CTA 一顆 |
| 光效線 | 水平藍色漸層裝飾線；結構：`linear-gradient(90deg, transparent, var(--c-blue), transparent)`；因為好看而存在，不需要物理依據。已用位置：Nav 底緣、Hero 標題第3/4行 |

---

## 四、當前任務狀態

### 任務背景
2026-04-15 起創辦人主導官網全面改版，技術架構與共用元件已完成，首頁 HTML/CSS/JS 骨架建立完畢。

**設計定位演進脈絡（重要背景）**
- 2026-04-18 第一版：「天文觀測站質感」→ 廢棄。問題：把使用者定位成觀察者，一切設計往儀器感靠攏。
- 2026-04-21 第二版：「深空漫遊（Deep Space Drift）」→ 廢棄。問題：把「宇宙是背景」錯誤解讀為「設計語言必須符合宇宙物理感（無重力、無邊界）」，隱喻綁死了設計判斷。
- 2026-04-21 第三版：**「深空舞台（Deep Space Stage）」→ 當前定案。** 宇宙是舞台不是規則。設計帶自己完整的視覺語言走進這個舞台，反差本身是美學，也是品牌「沉穩的異類」的核心性格。

首頁目前進入視覺元素實裝階段，Hero 排版初版已完成，待 DESIGN_MODE=false 解封後驗收動畫。

### 任務清單與進度

| # | 任務 | 狀態 |
|---|------|------|
| 1–8 | 規格確認、架構設計、品牌決策 | ✅ 完成 |
| 9 | 關於我們文案撰寫 | 🔲 待完成 |
| 10 | 前端骨架（token / base / components / animations / core.js / nav.js） | ✅ 完成 |
| 11a | 首頁主視覺背景（Three.js 黑洞漩渦星場） | ✅ **確認完成** |
| 11b-0 | **視覺設計語言第三版（深空舞台）** | ✅ 完成（2026-04-21，宇宙為舞台，設計自帶視覺語言） |
| 11b-1 | 核心二元素實裝（光影雕刻 / 星座連線；軌道環已停用） | 🔲 待執行 |
| 11b-2 | 節奏點綴（God Rays / 金屬掃光 / SVG 描邊 / 稜鏡折射） | 🔲 待執行 |
| 11b-3 | 細節裝飾（磁性按鈕 / 內凹陰影） | 🔲 待執行 |
| 11b-4 | 首頁整體整合與微調 | 🔄 進行中 |
| 11b-5 | Hero 排版實裝（2026-04-21 初版完成：標題均一字級 3.8rem / letter-spacing 0.06em / line-height 1.75；第3、4行藍色冷光底線；按鈕改為訊號型+虛空型；Hero 整體上移 padding-top 5rem；太空人已移除） | ✅ 初版完成，待 DESIGN_MODE=false 解封驗收 |
| 11b-6 | 頂部導航設計（冷光線移至底緣 idle 0.55→hover 1.0；背景改透明融入主視覺；連結字型→ Chiron Sung HK WS 15px；scrolled 態 / dock-nav 待定） | 🔄 進行中 |
| 12 | services.html 骨架 | 🔄 進行中（其餘 9 頁待執行） |
| 13 | 內容填充（作品截圖、角色圖等素材） | 🔲 待完成（等素材提供） |
| 14 | SEO / sitemap / Schema 更新 | 🔲 待完成 |
| 15 | 測試與部署上線 | 🔲 待完成 |

---

### 已確認設計規格（2026-04-20 本輪）

#### 光效線語言（全站統一）
水平方向的藍色裝飾線，全站用同一結構：
```css
background: linear-gradient(90deg, transparent 0%, var(--c-blue) 50%, transparent 100%);
```
- **顏色**：`--c-blue` (#1736F5)，不用 cyan（宇宙藍，光效重音）
- **已用位置**：① `.site-nav::before`（底緣，idle opacity 0.55 → hover 1.0）、② `.hero__title .line:nth-child(3)` 和 `.line:nth-child(4)` `::after`（「卻永遠」/「解決不了的問題」底線，`opacity: 0.7`）
- **擴展原則**：未來新的水平強調線一律沿用此結構

#### 頂部導航（site-nav）已確認規格
| 項目 | 值 |
|------|----|
| 背景 | `transparent`（融入主視覺，不做玻璃毛糊） |
| scrolled 態背景 | `rgba(--c-black-rgb, 0.92)`（捲動後補回，維持可讀性） |
| 底緣冷光線 | `--c-blue` 漸層，idle 0.55，hover 1.0 |
| 連結字型 | `--f-serif-cjk`（Chiron Sung HK WS）15px `font-weight: 300` |
| CTA「聯絡我們」字型 | `--f-serif-cjk`（已確認） |
| 待完成 | scrolled 態細節、dock-nav 手機版 |

#### 按鈕（.btn）已確認規格（2026-04-21 深空舞台版）

**設計概念：訊號型（Primary）× 虛空型（Ghost）**
Primary 有形：帶邊框的精確矩形在深黑中發光，像暗房裡的按鈕。
Ghost 無形：純文字浮在深黑中，靠 opacity 對比說話。
兩者的反差本身是設計語言。

**`.btn` 基底**
| 項目 | 值 |
|------|----|
| 字型 | `--f-serif-cjk`（Chiron Sung HK WS） |
| font-weight | `700` |
| font-size | `var(--fs-base)` |
| border-radius | `6px`（基底，modifier 可覆寫） |
| letter-spacing | `0.06em` |
| padding | `0.8rem 2rem` |

**`.btn--primary`（訊號型）**
| 項目 | 值 |
|------|----|
| background | `rgba(var(--c-blue-rgb), 0.10)`（極淡藍底） |
| border | `1px solid rgba(var(--c-blue-rgb), 0.38)` |
| border-radius | `2px`（幾乎直角，俐落） |
| color | `var(--c-stellar)` |
| padding | `0.75rem 1.6rem` |
| letter-spacing | `0.08em` |
| hover background | `rgba(var(--c-blue-rgb), 0.18)` |
| hover border-color | `rgba(var(--c-blue-rgb), 0.70)` |
| hover box-shadow | `0 0 16px rgba(var(--c-blue-rgb), 0.30), 0 0 40px rgba(var(--c-blue-rgb), 0.12)` |

**`.btn--ghost`（虛空型）**
| 項目 | 值 |
|------|----|
| background | `transparent` |
| border | `none` |
| color | `rgba(var(--c-stellar-rgb), 0.40)` |
| padding | `0.75rem 0`（無側邊距，文字對齊） |
| hover color | `rgba(var(--c-stellar-rgb), 0.82)` |

**Hero 作用域覆寫（`pages/index.css`）**
| 項目 | 值 |
|------|----|
| `.hero__cta-group .btn` | `font-size: 0.9375rem` |
| `.hero__cta-group .btn--ghost` | `padding: 0.7rem 0` |
| `.hero__cta-group` gap | `1.25rem` |
| Primary 在 Hero | 保留自身 `0.75rem 1.6rem` padding（不被 Hero 覆寫） |

#### Hero 標題（.hero__title）已確認規格（2026-04-21 深空舞台版）

**HTML 結構（4行，`index.html`）**
```html
<h1 class="hero__title js-hidden" id="hero-title">
    <span class="line">用非常規的<span class="highlight">跳躍思維</span></span>
    <span class="line">解決習以為常</span>
    <span class="line">卻永遠</span>
    <span class="line">解決不了的問題</span>
</h1>
```

**CSS 規格（`pages/index.css`）**
| 項目 | 值 |
|------|----|
| 字型 | `--f-serif-cjk`（Chiron Sung HK WS） |
| font-size | `clamp(2rem, 3.8vw, 3.8rem)`（均一字級，無行間縮放） |
| font-weight | `900` |
| line-height | `1.75` |
| letter-spacing | `0.06em`（俐落，讓明朝骨架說話） |
| 第3、4行底線 | `::after` 藍色漸層線，`width: fit-content`，`bottom: 0.12em`，`opacity: 0.7`，結構 `linear-gradient(90deg, transparent, var(--c-blue), transparent)` |
| `.highlight`「跳躍思維」 | `color: var(--c-yellow)`，text-shadow 琥珀金暈光（全站唯一琥珀金位置） |
| 左欄偏移 | `.hero__content { padding-left: 1.5rem }` |

**Hero 整體位置（`.hero__inner`）**
| 項目 | 值 |
|------|----|
| padding-top | `5rem`（上移，內容浮在視口上半部） |
| padding-bottom | `7rem`（下方留深黑給星場縱深） |

---

### 主視覺背景規格（已確認，禁止改動核心數值）

**概念**：黑洞漩渦深淵，星辰以螺旋軌跡被吸入，極緩慢的閒置運動

**檔案**：`assets/js/pages/index.js` → `initStarfield()`、`assets/css/pages/index.css` → `#blackhole`

#### 粒子系統（Three.js）

| 常數 | 值 | 說明 |
|------|----|------|
| COUNT | 6500 | 主軌道粒子數 |
| R_MIN | 0.42 | 事件視界半徑 |
| SPIRAL_K | 0.42 | 螺旋臂捲曲係數 |
| TILT | π/12（+15°） | 傾斜角，與 CSS #blackhole 斜帶同向 |
| 橢圓比 | b/a = 0.38 | 強烈盤面感 |
| ROT_BY_TYPE | [0.00060, 0.00032, 0.00017, 0.000075] | 四色群開普勒差速 |
| BASE_PULL | 0.000010 | 向心拉力 |
| 暖機幀數 | 6000 | 讓差速剪切充分自然化，不可減少 |

**三層粒子結構**：
1. **主軌道粒子**（6500 顆）：逐粒子極座標軌道計算，螺旋臂 spread=0.08、臂密度 95%；A×B 亮度分層（A=軌道位置，B=本質亮度冪次分布）
2. **星際塵埃層**（2800 顆）：靜態初始化、整體 `rotation.z += 0.000022` 旋轉，spread=0.55 臂暈染，亮度 0.03–0.14，幾乎零 CPU 負擔
3. **背景星塵**（1800 顆）：球形分布，`sizeAttenuation:false`，`opacity:0.60`

**B 本質亮度分布**：58% 超暗（0.08–0.28）/ 25% 中暗（0.32–0.58）/ 14% 中等（0.62–0.85）/ 3% 亮錨點（0.88–1.0）

**黑洞視覺**（CSS）：`#blackhole` — `radial-gradient` 橢圓暗帶，`rotate(-15deg)`，`::after` SVG feTurbulence 雜訊消除色階

---

### DESIGN_MODE 靜態設計凍結開關（2026-04-19）

**目的**：避免 GSAP inline style / CSS animation / Three.js RAF 循環干擾靜態設計驗收。切回動態只需一行 boolean 翻轉，所有 `init*()` 函式原封不動保留。

**開關位置**：`assets/js/pages/index.js:13` → `const DESIGN_MODE = true;`

**true（當前）凍結範圍**

| 層 | 項目 | 凍結機制 |
|----|------|---------|
| L2 進場動畫 | `initHeroEntrance()` / `initScrollAnimations()` / `initConstellation()` / `initVariableFontAxis()` / `initPrismaticSweep()` | 條件式不呼叫（函式保留） |
| CSS animation | glow `radiate` / God Rays `god-rays-drift` / nav `star-twinkle` / CSS 星空 `stars-drift-*` | `body.design-mode * { animation-play-state: paused !important }`（`base.css:192`）；太空人 `float` 已隨太空人移除而失效 |
| Three.js RAF | 星場 `animate()` / 太空人 `animateAstronaut()` | `if (!DESIGN_MODE) requestAnimationFrame(...)` — 暖機 6000 幀後 render 單幀停住 |
| WebGL 緩衝區 | 星場 canvas 單幀保留（否則 composite 後變黑） | `preserveDrawingBuffer: DESIGN_MODE` |
| `.js-hidden` | 等待 GSAP 解放的元素 | `body.design-mode .js-hidden { opacity:1 !important; transform:none !important }`（`base.css:183`） |

**true 時保留**：Three.js 星場單幀定格（差速剪切後的自然螺旋）、CSS 星空靜止、`#blackhole` radial-gradient、所有靜態排版。（太空人已於 2026-04-21 移除，HTML 以 `<!-- 太空人暫時移除 -->` 標記）

**false 切換前檢查清單**（若靜態階段改過以下項目，解封後需重看動畫）
- Hero 左右欄 grid 比例、`.hero__inner` padding → GSAP `fromTo { y, x }` 起始位移不一定需要改，但進場節奏要重看
- `.hero__title` 已改為均一字級（無 `--line-scale`），GSAP stagger 節奏以 4 行 × 0.15s 間距為基準，解封後確認進場感
- Bento grid-template-rows 高度 → `scrollTrigger start: 'top 80%'` 觸發點可能偏移
- `.brand-preview` padding → 稜鏡 `.brand-preview__prism` left/width 比例需對齊

**未解封前不能純靜態驗收的項目**
- Fraunces VF 軸 scrub（ANOMALY / UNCONVENTIONAL 字型從 thin italic → bold condensed）：當前凍結在 scrub 起始值 thin italic，**不等於最終 rest 狀態**。需要時可臨時把 `.hero__bg-text` / `.manifesto__bg-text` 的 `--vf-opsz / --vf-wght / --vf-soft` 改成 scrub 終值（Hero 36/600/10；Manifesto 20/800/0）預覽，驗完改回
- 星座連線：凍結時 SVG 未注入，靜態預覽不存在此視覺

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
| 等寬字型 | IBM Plex Mono | 維持 IBM Plex Mono（文件稱改 JetBrains Mono，未實際變更）|
| Hero 太空人 | Three.js 3D 模型 | 2026-04-21 已從 Hero section 移除（HTML 以 `<!-- 太空人暫時移除 2026-04-21 -->` 標記保留位置）；日後若重新引入再討論 3D / PNG 方案 |
| Hero 副標題 | 規格書未明定位置 | 從 `.hero__content` 段落移出，改為 `.hero__readout` 單行置於 Hero 底部；Thin 100 基調 + Light 300 關鍵詞的雙字重排版層級，不依賴裝飾元素 |
| Hero 標題 / CTA 尺寸 | 初版偏大 | 標題最終值 `clamp(2rem, 3.8vw, 3.8rem)`；CTA 字級覆寫 `font-size: 0.9375rem`；Primary 自帶 `0.75rem 1.6rem` padding；Ghost Hero 覆寫 `padding: 0.7rem 0` |
| 四角座標文字 | 視覺語言原列為細節裝飾 | 2026-04-18 移除（使用者回饋多餘）；HTML `.coords` div 與 components.css `.coords` 規則均已刪除 |
