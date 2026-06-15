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

**Codebase 中過去框架隱喻的殘留（2026-05-10 大清掃後）：**

- Three.js 黑洞動態星場（`initStarfield()`）— **保留**（深黑底有力量，2026-04-21 確認完成）；2026-05-10 統一架構後 `#blackhole` 元素已退役、漸層斜帶由 `#css-starfield::before` 全站承擔
- CSS 星空 `#css-starfield`（`base.css`）— **保留**（含 `::before` 220vw 黑洞斜帶 + `::after` noise overlay + log 螺旋臂星點）
- Three.js `initStarfield()` 內部變數命名（螺旋臂 / 軌道 / starData / SPIRAL_K 等）— 現役邏輯內部命名，重命名與刪除為不同性質決定，**保留**
- `.nav__brand-star` — 已不存在於 codebase（nav 已重設計為純文字並行排版）

2026-05-10 大清掃移除：所有觀測儀框架時期殘留的死碼（`initAstronaut` Three.js 太空人、`initOrbitRings` 軌道環注入、`initMagneticButton` 磁性按鈕、`.frame-drawn` SVG 描邊、`.text-sculpted/embossed/debossed` 雕刻 + 對應 ts-* tokens、整批未使用 keyframes）。詳見 commit body。

**未來評估視覺去留時：** 不要用「是否觀測儀」「是否跳躍思維」當問題，要用「**這個元素放在深黑背景上有力量嗎？是否能讓品牌看起來俐落、有反差、有電影感**」當問題。

### 路徑
`C:\Users\user-45664\Desktop\Claude AI相關\數位印鈔機\NEW創巢官網`

### 技術棧
- **框架**：純靜態 HTML / CSS / JS（無前端框架）
- **3D 引擎**：Three.js r128（CDN），僅首頁（`body.has-threejs`）
- **動畫**：GSAP 3.12 + ScrollTrigger（CDN，全站）
- **圖示**：Font Awesome 6.4.0（CDN）
- **字型**：
  - `--f-serif-cjk`：**Chiron Sung HK WS**（港產明朝活字，jsDelivr GitHub CDN）→ 全站中文主視覺字
  - `--f-fang-cjk`：**cwTeX Q Fangsong**（繁體仿宋，OFL 授權，jsDelivr CDN）→ 副標編輯感仿宋
  - `--f-serif`：**Fraunces Variable Font**（opsz / wght / SOFT 三軸，Google Fonts）→ 英文大標/副標/引言
  - `--f-display-en`：**Italiana**（hairline serif，雜誌封面感）→ 英文 echo 副標
  - `--f-sans`：Noto Sans TC（Google Fonts，100–900）→ 內文/說明/次要中文
  - `--f-mono`：JetBrains Mono → 等寬資料讀出條、Nav 品牌名、按鈕箭頭
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
- **CSS 星空由 nav.js 注入**：避免 HTML 多頁重複；`body.has-threejs` 隱藏 `.css-stars` 子元素（保留 ::before 黑洞漸層永遠顯示、避免雙重底色）
- **`body.has-threejs`**：index.html 載入時帶此 class；**僅在 Three.js 不可用 / init 失敗時移除、回退 CSS 星空 fallback**。觸控裝置（`IS_TOUCH_DEVICE` = `(hover: none) and (pointer: coarse)`）跑降階版 Three.js（粒子 6500→2000），不再 fallback CSS 星空（2026-05-11 起）

---

## 二、禁止範圍與限制條件

1. **不使用任何前端框架**（React、Vue、jQuery 等均禁止）
2. **CSS 5 層架構載入順序不得更改**（各層有明確職責邊界）
3. **品牌名稱**：一律使用「創巢數位 Nest Digital」；禁止使用「NestX」（已廢棄舊稿稱呼）
4. **nav.js 是 Nav + site-footer 唯一來源**：禁止在各 HTML 頁面直接寫 `<nav>` 或 `<footer class="site-footer">` 標籤；nav.js 用 `insertAdjacentHTML('afterbegin', ...)` 注入 STARFIELD + NAV、`insertAdjacentHTML('beforeend', SITE_FOOTER_HTML)` 注入 footer
5. **Three.js 3D 星空**：**2026-05-12 起全站共用**（黑洞漩渦動畫所有 11 頁套用）；由 `nav.js` 動態 load `assets/js/starfield.js`、注入 `<canvas id="starfield-canvas">`、加 `body.has-threejs` class；CSS 星空僅作為 Three.js init 失敗 fallback（init 失敗時 nav.js 自動移除 has-threejs、CSS 星空顯示）
6. **不得將頁面專屬樣式寫入 components.css**（分層邊界保護）
7. **Hero 入場動畫**：`.js-hidden` class 搭配 GSAP，確保無 JS 時內容仍可見（不可用 `display:none`）
8. **效能邊界**：真實觸控裝置（`hover:none + pointer:coarse`）跑**降階版 Three.js**——COUNT 6500→2000 / DUST_N 2800→800 / BG_N 1800→600 / 暖機 6000→2000 幀 / `setPixelRatio(min(devicePixelRatio, 1.0))`；桌機保留完整參數 `setPixelRatio(min(devicePixelRatio, 1.5))`（2026-05-11 起，原「手機跳過 Three.js」紀律廢止——Why 見 commit body）

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
| f-display-en | Italiana 英文 echo 副標字型（`--f-display-en`） |
| f-fang-cjk | cwTeX Q Fangsong 仿宋字型，副標編輯感（`--f-fang-cjk`） |
| A–F | 服務六大類（A社群經營、B開發、C虛擬網紅、D顧問、E跳動E投放、F粉絲與互動買賣 *首頁退役*）；G 類自動化採集（ADSPOWER+PY）為待新增類別，**不可併入 B 類**。命名規則：A/E 用首頁卡聚焦 sub 名（規格書類名分別為「社群服務 / 自營平台」），其他 4 類用規格書類名短化 |
| B 類本質 | 軟體開發本業（網站架設 + 客製系統開發），對應「不正常人類軟體開發有限公司」核心服務；描述客製系統禁止用「流程自動化」措辭、避免與 G 類自動化採集混淆 |
| F 類首頁退役 | 2026-05-11 起 F 類「粉絲與互動買賣」服務從首頁 bento 拿掉（地下性質服務不適形象首頁主動曝光）；規格書 §F 類保留並明確化定義，未來若有獨立 landing page 再評估上線 |
| G 類待新增 | 自動化採集服務（ADSPOWER + Python）為瀏覽器指紋分流 + 腳本驅動的資料採集與帳號模擬操作；規格書 v0.2 §四 已加備註但未展開、首頁 bento 不露 |
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
| 12b | ~~7 個服務頁正式內容填充（取代 teaser）~~ | ❌ 退役（2026-06-15 20:49 IA 決策：服務不另開頁，見下方「資訊架構（IA）決策」） |
| 13 | 內容填充（作品截圖、角色圖等素材） | 🔲 待完成（等素材提供） |
| 14 | SEO / sitemap / Schema 更新 | 🔲 待完成 |
| 15 | 測試與部署上線 | 🔲 待完成 |
| 16 | 太空人角色敘事實作 | ✅ 完成（beat01-04 全上線 2026-05-10） |

---

### 服務區塊視覺探索結論（探索期 2026-05-31 ~ 2026-06-15；記錄 2026-06-15 00:55）

對應任務 11b。服務區卡片視覺做了完整探索週期，所有 POC 存檔於 `demo-liquid/`（探索集，**不上 production**；總索引 `demo-liquid/_index.html`、非液體總展示 `demo-liquid/showcase-all-cards.html`）。

- **已否決／退役方向**：液態水玻璃卡 / 3D 液體 D1–D8 / 液態金屬 fusion / 滴落變體 V / 液態卡 F / 早期 flow 批 / 星球 3D 畫廊（創辦人明確「放棄液態方向」）。**N4 捲動堆疊卡 × 程式碼流星字雨**（`service-n4rain-poc.html`）探索後退役。**水珠凝聚成形動畫**（metaball 小水流入 → snap 成卡，`service-card-water-final.html`，曾與 Codex 協作多輪）完整探索後創辦人改走簡單版，保留為探索紀錄、不上線。
- **水卡輪播已放棄（2026-06-15 19:57 探索後退役）**：WebGL 真水卡左右滑輪播（`service-card-water-carousel.html`）曾於 00:55 定案，後創辦人退一步判斷「整塊怪」→ 再判斷「水意象與軟體開發根本搭不上邊」→ 放棄。水卡探索資產（漂亮、未來若有搭水主題可重用）+ 完整技術紀錄留存於 memory [[project_nestdigital_water_card]]。
- **定案方向（2026-06-15 19:57）**：**開發區（軟體開發）= 捲動堆疊藝術卡 + 程式碼星雨**。核心原則「**形式即證明**」——每個服務區塊用形式本身證明該服務能力（數位行銷手風琴的藝術感證明設計力、軟體開發的程式碼藝術證明開發力）。藝術卡＝書法明朝超大字浮水印（凹刻浮雕）+ code 視窗列（克制點綴、非 IDE 主體）+ 實心深色卡 + 程式碼星雨打卡頂緣濺火花；3 張 sticky 捲動堆疊（下一張上來、上一張縮小退後）。原型 `demo-liquid/service-dev-stack-art.html`（程式碼雨資產源自退役的 `service-n4rain-poc.html`）；已整合 `index-rain-preview.html`（取代水卡 iframe）、**未動正式 index.html**。**社群類維持手風琴不動。** **紅線：受眾是一般大眾、非工程師——技術素材要「藝術化」不是「IDE 工具化」**（本案連犯兩次工程師向錯，見 memory [[feedback_audience_general_public]]）。
- **整合待辦（正式進 index.html 前）**：① 浮水印切字位置／浮雕深淺待創辦人用 index-rain-preview 左下調軸定數值、再寫死移面板 ② ~~服務區第三塊內容待定~~ **已定（2026-06-15 20:49）：自有產品（跳動E／一鍵架站）獨立成一塊、放開發落雨區之後**，不硬塞「服務區第三塊」（自有產品非服務，見 [[project_nestdigital_service_taxonomy]]）③ 堆疊卡內容（開發/成長/顧問）對應正確服務分類待全局對齊 ④ 進 5 層 CSS（pages/index.css + index.js）⑤ 效能（Canvas2D 程式碼雨 + GSAP 堆疊）⑥ **服務卡片改「純陳列」（移除點進服務頁的連結）+ 7 teaser 服務頁退役** —— 此步綁進本次 index.html 整合一起做（避免先刪 teaser 造成正式頁斷鏈，見「資訊架構（IA）決策」）。
  - **自有產品展示形式**：已定避開「自動無限跑馬燈 + 小圖示」（公版味 + 永遠在跑卻證明不了產品價值＝同水卡陷阱）；用真截圖／影片。具體容器（跟著捲動的橫向展開 vs 慢速大圖電影劇照）**待創辦人選**。
- **早期液態卡 morph 已清（2026-06-14 16:57）**：`index.html` + `assets/css/{animations,components,pages/index}.css` 曾有未 commit 的「液態卡 morph」實驗（`liquid-morph-a/b` 邊角晃動 + `?v=liquid2` 快取參數），已 `git restore` 全數還原、工作區乾淨；液態方向確定不上線。若日後要重看那批 keyframe，本條已記其內容、可重建。

---

### 太空人角色敘事實作（2026-05-07 21:46 構想 → 2026-05-08 實作啟動）

**創辦人原始劇本（2026-05-07）：** 沉思 → 破格 4 階段。

| 狀態 | 畫面 | 情緒 |
|---|---|---|
| 頁面初始（未滾動） | 太空人坐著托腮沉思，旁邊一句 hero 文案。極靜。 | 冷靜、高級、克制 |
| 使用者開始滾動 | 太空人突然 — 跌倒 / 滾走 / 手一滑杯子打翻 / 跑出畫面框 | 驚喜、會心一笑 |
| 後續 section | 每段他以不同「不正經姿態」出現：倒栽蔥、飄過去、踩在標題上、偷看下一段 | 陪伴、頑皮、記憶點 |
| Final CTA | 他重新坐回原位假裝沒事，但旁邊有個打翻的咖啡杯 | 收尾、幽默、留白 |

**設計核心：** 反差敘事——「冷峻電影感深空 + 搞笑陪伴太空人」具象化品牌調性，呼應 §一 設計判斷三條（俐落 / 線條 / 電影感同時主動製造衝突反差）。太空人是品牌「非常規思維」訴求的人格化角色。

**為什麼從「Hero 3D 模型」轉「全站陪伴角色」：** 2026-04-21 原 Hero Three.js 3D 太空人已從 Hero 移除（HTML 留 `<!-- 太空人暫時移除 2026-04-21 -->` 標記）。3D 模型只在 Hero 露臉一次、無敘事延續、視覺重量壓過 hero 文案。本案把太空人升級為「全站陪伴角色」、從靜態裝飾變敘事節奏。

**技術選型實際走向（2026-05-08 啟動實作後修正）：**

原規劃 SVG 多姿勢圖 + GSAP/ScrollTrigger 切換（設計師畫 6-8 張 SVG），啟動實作後改為 **AI 生成 MP4 → RIFE 偵插值 → 手動去背 → 透明 WebP 偵序列（ScrollTrigger 驅動）／透明 WebM（GSAP 漂移驅動）** 雙軌。

**為什麼改：**
- SVG 方案需設計師交付 6-8 張連續姿勢圖、產出周期長
- AI 生成（Higgsfield CLI / Kling 3.0 pro / Veo 3.1）能在當天迭代、符合「線條俐落 + 反差幽默」chibi 風格
- 偵序列解析度可達 9:16 ≥ 1024px、視覺品質高於 SVG 簡化線條
- 透明 WebM（VP9 + alpha）保持深黑底「沒有方塊邊」的乾淨合成

**紅線：**
- AI 生成片必須去背成透明（透明 WebP / 透明 WebM），禁止白底或黑底實心方塊壓在深空背景
- 偵序列方案禁止 60+ 偵未壓 WebP（檔案膨脹）
- 完整推導（為什麼不選 SVG / Lottie / Three.js 多姿態 mixer）見 git log 2026-05-08 commit body

**已實裝 Beat 進度（2026-05-09 01:17）：**

| Beat | Section / 容器 | 形式 | 偵數 / 來源 | 觸發 | 狀態 |
|---|---|---|---|---|---|
| 01 Hero idle | `.hero` | 靜態 PNG（chibi 太空人坐彎月） | 單張（Higgsfield 生圖） | 無 | ✅ 完成（早期版） |
| 02 跌落穿越 Hero→Manifesto | `.hero-astronaut` 9:16 canvas | WebP 偵序列 | 133 偵（Kling 3 + RIFE 72→144 + 手動去背 11 偵） | ScrollTrigger pin 區段 | ✅ 完成（2026-05-08 ~15:30） |
| 03 倒栽蔥懸吊 body-divider | `.manifesto-astronaut` 9:16 canvas | WebP 偵序列 | 179 偵（Kling 3 + RIFE 97→194 + 手動去背 + JS 動態對齊 body-divider via `getBoundingClientRect`） | ScrollTrigger 70/30 非線性 ease（110 偵斷點） | ✅ 完成（2026-05-08 ~18:43） |
| 04 無頭追頭盔（Final CTA 漂浮） | `.footer-astronaut` 16:9 video | 透明 WebM 影片（VP9+alpha） | HTML5 video 自動 loop + GSAP 隨機漂移 | 詳見下方 Beat 04 紀錄 | ✅ 完成（2026-05-10） |

**Beat 04 上線紀錄（2026-05-10）：**

- **影片來源**：user 後製合成 `追頭盔後製黑色背景.mp4`（蛙式追頭盔、黑底 1932×1080 15.67s）
- **後製管線**：Python imageio + ffmpeg luma-as-alpha threshold（LOW=5 / HIGH=20、RGBA stdin pipe）→ libvpx-vp9 + `alpha_mode=1` metadata → 透明 WebM 8.74 MB CRF 35（覆蓋 `assets/images/astronaut/clips/beat04-loop-transparent.webm`）
- **CSS overflow 紀律**（解 transform 元素水平捲軸 + final-cta 第 2 捲軸）：
  - `html / body { overflow-x: clip }`（不是 hidden）—— GPU 加速 transform 元素在 hidden 創 scroll container 時可能逃出，clip 是 paint-time 硬切
  - 同元素 `overflow-x` 跟 `overflow-y` 必須一致——違法組合 `-x: hidden + -y: visible` 會 promote 成 auto 出第 2 捲軸
  - `.final-cta { overflow: clip }` + `padding-top: var(--sp-w1) + 100px` + `padding-bottom: var(--sp-w1) + 180px` 給太空人 scale + rotation 擴張 buffer
- **GSAP 動畫**（`initFooterAstronautDrift`）：page load 立即 runCycle、cycle 之間無間隔、duration 15-22s 隨機、startScale 0.25-0.85 隨機、endScale = startScale × 2.2（**固定推進倍率**——太空中追頭盔角度固定）、rotation ±12° 隨機、y 偏移 -300~0px 隨機（startY/endY 各自獨立 → 斜線軌跡）、buffer = containerW × 0.3
- **Higgsfield 完整生成路線（Kling/Veo）失敗推導**：見 commit a993822 message body

**新增工具配置（2026-05-09）：**
- `~/.claude/skills/higgsfield/`：OSideMedia/higgsfield-ai-prompt-skill（20 sub-skill dispatcher）
- `~/.agents/skills/`：官方 4-skill 包（generate / soul-id / product-photoshoot / marketplace-cards）
- `~/.local/bin/higgsfield`：CLI wrapper（指向上 session 已裝的 `hf.exe`）
- `_工具參考/Higgsfield_協作快照.md`：協作技巧庫（含 15 天自動重驗紀律）
- 兩條 memory feedback：`feedback_higgsfield_collaboration.md`、`feedback_state_origin_before_destructive.md`

**手機版策略（2026-05-11 定案）：**
- **背景動畫**：手機跑降階版 Three.js（同桌機黑洞漩渦語言，粒子數縮 1/3），不再 fallback CSS 星空。CSS 星空保留為「Three.js init 失敗」最終 fallback。
- **Beat 04 影片**：HEVC+alpha .mp4（Safari/iOS 13+）+ WebM VP9+alpha（Chrome/Firefox/Android）雙 source；HEVC 放第一、`codecs=hvc1` 讓 Chrome 跳過。**HEVC mp4 檔案待補**——Windows ffmpeg 無法輸出真 alpha auxiliary stream（libx265 不支援 yuva、hevc_nvenc 輸出 RGBA 但實際存儲降回 yuv420p），須用 macOS `hevc_videotoolbox` / Apple Compressor / 線上工具（Rotato Converter / Frama / getframa.app）轉檔。HEVC mp4 上線前，iOS 看不到 Beat 04 太空人（比看到黑塊 fallback 更乾淨）。
- **ScrollTrigger Beat 02/03**：手機觸發節奏暫保持桌機規格、實機驗證後再評估降頻；`prefers-reduced-motion` 應停用所有偵序列動畫、至少保留靜態 idle 姿勢（待補）。

**完整推導**（為什麼從「手機跳過 Three.js」改成「降階版 Three.js」、為什麼不選 a 修 CSS 補漏 / c canvas 2D / WebP 偵序列、HEVC+WebM 雙 source 順序如何決定、Windows ffmpeg HEVC alpha 實測失敗紀錄）見 git log 2026-05-11 commit body。

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

### 資訊架構（IA）決策：放棄「每個服務一個頁面」（2026-06-15 20:49）

**結論：服務不另開專屬頁；自有產品保留專屬頁。** 雙引擎＝**主官網（轉換）＋部落格（獲客＋深度說明）**，服務的詳細說明交給部落格文章承載、不再為每個服務做說明頁。

**Why（防再踩、別反覆）：**
1. 服務頁一直是多餘中間層——SEO 策略早已定「形象頁是轉換頁、不是獲客頁」，獲客靠部落格長尾、轉換主頁就能做，服務頁夾中間哪邊都不靠。
2. 主頁服務區內容變厚後（手風琴／落雨堆疊卡／產品展示），服務頁＝主頁稀釋版，對 Google 是薄內容／自我競食＝SEO 負債。
3. 深度說明放部落格更強——同一篇能吃長尾關鍵字被搜到，服務頁只是躺著沒人搜。
- funnel 因此更短：部落格（抓人）→ 主頁服務區（看懂＋想問）→ 聯絡；每個服務只有一個正本（主頁那塊）。
- **誠實小代價**：少掉「服務名＋地區」中段關鍵字的網頁版面，但同詞用部落格打排名更好、薄服務頁反而互相稀釋，淨值划算。

**界線（別砍過頭）：**
- **服務**（社群經營／部落格代營運／廣告投放／AI 形象網紅／網站架設／客製系統開發／數位轉型顧問）→ 不另開頁。
- **自有產品**（跳動E／一鍵架站）→ **保留專屬頁**（本質是有自己成交漏斗的產品；`quick-site.html` 是會實際運作的功能頁、非說明頁）。

**連帶執行（綁進 index.html 整合批次、不單獨先做）：**
- 服務卡片改「**現階段純陳列、不可點**」（移除點進服務頁的連結）；等部落格起來再評估「點 → 對應部落格分類」。
- 7 個 teaser 服務頁（social/virtual/website/system/consultant/tiktok/growth）**退役**——比照 growth.html 孤兒頁處理（移除入口即孤兒化）。**紅線：先移除 index.html 入口連結、再退役 teaser 檔，順序顛倒會讓正式頁斷鏈。** contact.html 永久保留。

**nav 結構連動（2026-06-15 23:18）：**
- 部落格**顯示名定為「不正常觀點」**（接「不正常人類軟體開發」起源＋「觀點」一看就懂＋順便篩客戶），**網址路徑維持 `/blog`**（中文當顯示名、英文當路徑；nav label 對 SEO 無影響、中文網址會被編碼成亂碼故不用）。**時機**：原訂部落格上線前不放連結；2026-06-16 01:18 創辦人改主意、現已用 coming-soon teaser 接上（見下方「已執行」）。
- nav 結構**定案（2026-06-16 00:05）：`服務 · 不正常觀點 │ 聯絡我們`**（品牌字靠左、其餘靠右成一組）。「消息」「關於」**都拿掉**：消息由部落格吸收；關於現在沒料、不留空頁（避免「通往空頁」信任問題），品牌故事分流——態度走首頁宣言（已有）、起源故事（為什麼叫「不正常人類」、2020→2024 演進）當部落格第一篇文章，「是否真公司」由頁尾雙統編解決；**未來有實績／案例／團隊再做真正的關於頁**（高單價開發／顧問的信任頁）。about.html／news.html 比照 growth.html 孤兒化。「服務」維持錨點跳首頁 #services-section。
- **排版改動**：取消現行 `.nav__links` 絕對置中（`position:absolute; left:50%`，無視鄰居較脆），改靠右流式群組（`margin-left:auto`）。
- **聯絡我們主行動辨識度**：CTA 是純文字＋箭頭（描邊框 2026-05-06 已拿掉），靠右群組後會失去原本「孤立在右」的強調 → 在「不正常觀點」與「聯絡我們」之間放**一條**青色冷光分隔線，**重用 `.nav__brand-divider` 同款**（非新增設計）。一條、放 CTA 前，非每連結之間。
- **已執行（2026-06-16 01:18，改原計畫）**：創辦人要求現在就放「不正常觀點」進 nav，不等部落格。做法＝nav 連 `blog.html`（flat root teaser，比照其他 coming-soon 頁、用 `pages/coming-soon.css`；放根目錄而非 `/blog` 子目錄，因 nav.js 寫死 `assets/js/starfield.js` 等相對路徑、子目錄會 404）→ 點下去是「敬請期待」非死連結。nav 現為 `服務 · 不正常觀點 │ 聯絡我們`。真部落格做好後 teaser 換真內容；`/blog` 子目錄結構待真部落格建置時再定（屆時需把 nav.js 相對路徑改 root-relative）。commit 63dcce6。
- nav 視覺（純黑半透明＋青色底線＋純文字 CTA，電影感冷峻方向）2026-05-07 已定、本次不動。

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
- `index.html` — 4 sections 完整實作（Hero / 宣言 / Bento 服務 / 終點 CTA「先別點」），site-footer 同步重設計。Section 4 品牌故事於 2026-05-07 移除。`<section class="services-section">` 加 `id="services-section"` 作為 nav 錨點目標（2026-05-07 21:18）。Bento 2026-05-11 從 7 卡縮為 6 卡（F「粉絲與互動買賣」退役），同日重平衡視覺權重：**FEATURED C 卡升格為 row 1 hero**（grid-column `3/4` → `2/4` 跨 2 欄）、A 卡退回單欄 supporting（`1/3` → `1/2`），呼應 FEATURED 標籤的主角 narrative；下半 row 3 E 跨左 2 欄保留為自營平台 anchor、與 C 形成上下兩個 hero 的反 Z 節奏。
- `growth.html` — F 類 teaser「敬請期待」頁；2026-05-11 F 卡從首頁退役後成為 orphan page（無入口）、檔案保留待 F 類未來上線方式決定再處理。
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
| 裝飾字型（2026-05-10 收斂） | 規格書原列 Exo 2（--f-disp）+ Bebas Neue（--f-bebas）兩套裝飾字 | 視覺迭代過程未採用任一套，2026-05-10 大清掃時兩個 token 已從 tokens.css 移除。實際裝飾字角色由 `--f-display-en` Italiana 承擔（hero/manifesto/final-cta 英文 echo + footer NEST DIGITAL 大字）。 |
| 等寬字型 | IBM Plex Mono | 維持 IBM Plex Mono |
| Hero 太空人 | Three.js 3D 模型 | 2026-04-21 已從 Hero section 移除（HTML 以 `<!-- 太空人暫時移除 2026-04-21 -->` 標記保留位置） |
| 四角座標文字 | 規格書原列為裝飾 | 2026-04-18 移除（HTML `.coords` 與 CSS 規則均已刪） |
| Section 4 品牌故事預告 | 規劃為「不正常人類的故事」介紹區塊 + initPrismaticSweep 稜鏡光斑動畫 | 2026-05-07 創辦人要求拿掉。HTML `.brand-preview` 整段刪除、JS 兩段 scrollTrigger 動畫（big-label / brand-preview__right）+ `initPrismaticSweep()` 函式整段 + 其呼叫全部移除。CSS 本來就沒實作（HTML 有 brand-preview 相關 class 但 CSS 從未對應）。 |
| Hero 副標 SVG zig-zag 裂縫線 | 2026-04-26 規劃為「文字從深空撕裂的縫中炸出來」視覺，由 `initRift()` 動態注入 5 條 SVG path 疊在 `::after` 暗橢圓上 | 2026-05-05 創辦人判定 SVG zig-zag「像閃電線」設計失敗，徹底移除（HTML `.hero__rift-crack` 子層、JS `initRift()` 函式 + GSAP scaleX 動畫全部刪除）。**紅線**：禁止再回 SVG zig-zag 線條方向。 |
| Hero 副標 `::after` 暗橢圓背景 | 2026-05-05 SVG zig-zag 移除時保留 | 2026-05-06 創辦人決定一併移除。`.hero__rift::after` 規則整段刪除。`.hero__rift` 容器仍保留作為副標 flex 排版（中文 / `.hero__readout-divider` 冷光分隔線 / 英文）的右對齊定位 wrapper。**現狀**：仿宋中文 + 深藍冷光分隔線（max-width 1200、向右側射出 gradient、與 h1 主標冷光線同色系）+ Italianno 英文、`align-items: flex-end` 靠齊右側。 |
| Hero ANOMALY + Manifesto UNCONVENTIONAL 背景大字 | 2026-04-18-19 規劃為 Variable Font 軸動文字（Fraunces 三軸 opsz/wght/SOFT 由 GSAP ScrollTrigger 驅動） | 2026-05-06 創辦人要求兩處均移除。HTML `.hero__bg-text` / `.manifesto__bg-text` div、CSS 桌機與手機 media query、JS `initVariableFontAxis()` 函式整段、`@property --vf-opsz/--vf-wght/--vf-soft` 三條宣告全部刪除。**紀律**：Variable Font 軸動系統全退役；Fraunces 字型 import 仍保留（其他地方仍用於 `.lead-large` 等）。 |
| 左上 nav 品牌（NEST · DIGITAL + 暖白星點）| 2026-04-19 規劃為「等寬字 mark + 望遠鏡下的恆星星點」觀測儀框架符號 | 2026-05-06 觀測儀版整個拿掉（commit 6ce87d4）→ 2026-05-06 後續重設計為「純文字並行排版」（commit cfe5a99）：`.nav__brand-zh`（Chiron Sung HK 中文「創巢數位」16px）+ `.nav__brand-divider`（1em 高度青色冷光垂直分隔線，gradient peak 在 50% 向兩端漸隱）+ `.nav__brand-en`（JetBrains Mono「NEST DIGITAL」11.5px）。中英並列形成「主訴求 + 副標」連續閱讀節奏，與 manifesto 中英 echo 同設計語言。**架構備注**：`.nav__cta` 的 `margin-left: auto` 仍保留以避免未來 brand 改動再次破壞 flex。 |
| Section 5 終點 CTA | 規劃為「立即聯絡 + 查看所有服務」雙按鈕居右 | 2026-05-07 重設計為「先別點」反轉 CTA + 居中布局。結構：「先別點。」（Chiron Sung 大字 clamp 3.5–7.5rem 句號為視覺重音）/ "Don't click yet."（Italiana cyan echo）/ 對稱冷光線（c-blue 中央 0.85 向兩端衰減 + box-shadow 12px，與 Hero / Manifesto 的「右側單向射出」線形成設計反差呼應居中語境）/「除非你準備好不正常一次。」（cwTeX 仿宋 stellar 0.85）/ "Unless you're ready to break something."（Italiana cyan 0.75）/ 黃色按鈕「我準備好了 →」/ 背景中央 c-blue 微光暈。副標中英 text-shadow 套用全站四層紀律（見下條）。聯絡資訊移到 site-footer 統一承載。 |
| site-footer | 原一行三段（品牌 / 4 連結 / ©）| 2026-05-07 重設計為「電影片尾收束」結構（commit 0588167）：① 上方對稱冷光線（c-blue 中央 0.65 寬 240–400px，呼應 final-cta 對稱線但更克制）② 巨型 NEST DIGITAL 大字（Italiana hairline，clamp 2.5–9rem，letter-spacing 0.06em，stellar 0.92）③ 座標讀出條「桃園・中壢｜中央西路二段 268-1 號 5 樓」（mono 等寬，stellar 0.45）④ 兩欄資訊：CONTACT（LINE @604vqsva / 03-4912872）/ STUDIO（創巢數位資訊企業社 / 統編 93019200）⑤ 最底版權行（mono stellar 0.30）。砍掉重複 nav 連結（主導覽列已有）。手機版下限 2.5rem 字級 + letter-spacing 0.02em 確保 400px viewport 不撞邊。**架構備注（2026-05-12 已完成抽公用元件）**：原 11 個頁面（index + 9 teaser + contact）各自手寫 footer、造成更新不同步——5/10 加雙公司聯名 X (commit `0588167`) 只動 index、其他 10 頁仍是無聯名舊版、訪客點 teaser 看不到不正常人類軟體開發。已抽到 nav.js `SITE_FOOTER_HTML` 常數、`insertAdjacentHTML('beforeend', ...)` 注入；11 個 HTML 內 inline footer 全刪。**紅線**：禁止再在各頁手寫 footer、所有 footer 改動只在 nav.js 動。**法律備注**：目前無蒐集表單資料故暫不放隱私權政策連結；contact.html 表單實作時依個資法第 8 條補入隱私權政策頁與 footer 連結。 |
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
| 首頁全 stack 大清掃（2026-05-10） | 多輪迭代後累積觀測儀框架、磁性按鈕、軌道環、SVG 描邊、雕刻陰影 token、整批未用 keyframes 等死碼，自承「待二階段視覺評估時逐項拍板」遲未動 | 一次性徹查首頁完整 stack（`index.html` / `index.css` / `index.js` / `core.js` / `nav.js` / `tokens.css` / `base.css` / `components.css` / `animations.css`）並 grep 交叉比對，移除：**HTML** `.hero__god-rays` 空 div；**index.css** `.hero__brand-tag` / `.hero__astronaut*` 死規則；**index.js** `initAstronaut()`（158 行 Three.js 3D 太空人，已被偵序列取代）+ `initOrbitRings()`（軌道環注入）+ Hero 入場序列內 `.hero__astronaut` fromTo + 註解殘骸；**components.css** `.tag--blue` / `.tag__dot` / `.text-sculpted/embossed/debossed` / `.btn--magnetic` / `.btn-amber-dot` / `.frame-drawn`；**base.css** `.f-serif` / `.f-disp` / `.f-mono` 工具類（0 處 HTML class 使用）；**animations.css** 17 個 0 引用 keyframes（twinkle / radar-ring / scan-line / cursor-blink / glow-pulse / glow-yellow / fade-up/in / slide-in-left/right / scale-in / gear-spin(+reverse) / orbit-rotate(+reverse) / prismatic-sweep / god-rays-drift / stroke-draw / constellation-fade-in）+ `.anim-fade-*` + `.delay-1~6`；**tokens.css** `--c-accent` / `--glass-bg-hover` / `--grid-base/half` / `--bp-md/lg` / `--shadow-card/glow/yellow/inset(-strong)` / `--ts-sculpt/emboss/deboss`；**core.js** `initMagneticButton()`。**保留**：`--sp-t/m/w` 新間距系統（tokens.css 自註「新代碼以此為準」現役遷移目標）、`pulse-dot` keyframe（`maintenance.html` 仍用）、Three.js `initStarfield()` 內部變數命名（現役邏輯）、DESIGN_MODE 機制。**紅線**：本次清理依「該 class / token / 函式有無被現役程式碼引用」單一標準，不涉及視覺判斷；任何「未來可能用」的元件不在保留範圍——需要時從 git history 取回比較乾淨。 |
| 首頁 + Manifesto 全機型 RWD 收尾（2026-05-10） | 主視覺 / Manifesto / Footer 多處字級寫死 `var(--fs-*)` 或固定 rem、mobile 視窗縮放下尺寸不適、`#blackhole` 跟 `#css-starfield` 雙黑洞並存、dock-nav 浮層吃 mobile 垂直空間 | **架構統一 6 commit 收斂**：(1) `3ae4111` 死碼大清掃 −580 行；(2) `ca3f7f2` 黑洞統一到 `#css-starfield::before`（刪 `#blackhole` 元素 / 220vw + `-15deg` 斜帶 / has-threejs 改只藏 `.css-stars`）+ dock-nav 退役改右上 hamburger button + dropdown panel；(3) `1e721f9` 主視覺 cqw 修桌機 gap drift（hero__inner 加 `container-type: inline-size`、title font 跟 astronaut 尺寸/right margin 換 cqw、跨 1100-1720 viewport gap 鎖在 27-31px）；(4) `002aaef` mobile hero 重構（太空人靠右下、size 280-360 雙軸 RWD `clamp(220, min(85vw, calc(100vh - 530px)), 360)`、CTA 縮 127px、title 上移 padding-top 6rem、hero `align-items: stretch`、IS_TOUCH_DEVICE 取代 IS_MOBILE）；(5) `61be281` 副標 wrap 自適應（hero readout font `clamp(0.75rem, 2.9vw, 0.875rem)` + `letter-spacing: 0`、manifesto big-text accent stroke 改 `0.022em` 等比縮放、manifesto body 右對齊+span block 強制斷句）；(6) `3a3bbb5` manifesto RWD 全機型適配（big-text font `clamp(3.1rem, 13vw, 10.8rem)` 跨 360-1720 全部 6/3 split、body 字級 `clamp(0.875rem, 2vw, 1.375rem)`、span block 限 `≤640px` 真手機才強制 wrap、平板 641-900 inline 自然單行、GSAP 進場移除 x 偏移避免 ScrollTrigger 沒觸發時 transform 偏移）；(7) footer studio pair 加第二公司聯名 X（`grid-template-columns: 1fr 2.2fr` 擴 STUDIO 欄、entries flex 0 0 auto + `justify-content: center` 視覺貼文字之間、X 用 `::before/::after` 對角交叉冷光線手繪 + `--c-blue` 三層深藍 box-shadow 光暈、桌機水平/手機垂直自適應）。**全機型驗證通過**：360x780 / 375x812 / 390x844 / 414x896 / 430x932 / 440x956 + 768 tablet + 1400/1720 desktop。**紀律提煉**：寫死 px / rem / `<br>` 是反 RWD 紀律、優先 vw/vh/cqw/em/clamp 自適應；HTML hardcode 換行是最後手段；視窗 + 字級 + 容器三方關聯 calc 才能跨機型一致；任何 transform 初始狀態（GSAP fromTo）必須考慮 ScrollTrigger 不觸發時的視覺。完整推導見 6 個 commit body。 |

---

## 五、協作方法紀律：視覺任務預設可調沙盒

**規則：** 涉及「感覺/質感」的視覺任務（色彩、光感、動畫節奏、折射/虹彩強度、模糊、圓潤等**連續參數**），預設第一步先做「可即時拉軸調參數的 live demo 沙盒」讓 user 自己調手感，**不用文字對焦**；user 調到滿意、回報數值後，才寫死進正式碼並鋪開。

**強制觸發：** 同一視覺目標用文字來回 ≥ 2 次仍未對齊 → 立即轉沙盒，禁止繼續用嘴繞。user 喊「給我一個可調沙盒」亦立即套用。

**限制（須主動提醒、沙盒不會自己跑出來）：** 沙盒只對齊「長相」、不對齊 production 真實代價（效能、瀏覽器相容、可讀性、SEO/無障礙、WebGL 文字變貼圖等）。離散二選一決定直接問 user、不做沙盒。

**生效時刻：2026-05-31 02:37（由「服務卡片液態水玻璃」對焦過程確立——文字對焦來回 6+ 輪未果，轉成 Three.js 可調沙盒後一次對齊）**
