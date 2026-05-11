/* ============================================================
   pages/index.js — 首頁專屬互動
   創巢數位 Nest Digital | 版本 redesign-v1
   功能：Three.js 星空粒子 + 太空人 | Hero GSAP 入場序列 | ScrollTrigger 各區塊動畫
   ============================================================ */

(function () {
    'use strict';

    /* ════════════════════════════════════════════════════════
       DESIGN_MODE（2026-04-19 靜態設計凍結開關）
       true  → 關閉所有進場 / 捲動驅動動畫（L2 + L3），
               保留 L1 環境（Three.js 星場 / 太空人 / 黑洞）
               讓 CSS 改動不被 GSAP inline style 蓋掉，純靜態驗收。
       false → 正常全部動畫啟用。
       ════════════════════════════════════════════════════════ */
    const DESIGN_MODE = false;

    /* ════════════════════════════════════════════════════════
       1. Three.js 星空粒子場（2026-05-12 抽到 assets/js/starfield.js 全站共用）
       —— nav.js 動態 load starfield.js、所有頁面共用黑洞漩渦動畫
       —— IS_TOUCH_DEVICE 偵測 + 降階參數 + initStarfield 函式整段已移到 starfield.js
       ════════════════════════════════════════════════════════ */


    /* ════════════════════════════════════════════════════════
       2. Hero GSAP 入場序列
       ════════════════════════════════════════════════════════ */

    function initHeroEntrance() {
        if (typeof gsap === 'undefined') return;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // h1 有 .js-hidden（opacity:0），先讓容器可見，再由 .line 子元素做 stagger
        tl.set('.hero__title', { opacity: 1 }, 0)
        .fromTo('.hero__title .line',
            { opacity: 0, y: 40, skewY: 2 },
            { opacity: 1, y: 0, skewY: 0, duration: 0.8, stagger: 0.15 },
            0
        )
        .fromTo('.hero__cta-group',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6 },
            0.70
        )
        .fromTo('.hero__scroll-hint',
            { opacity: 0 },
            { opacity: 1, duration: 0.5 },
            1.0
        )

        // ── 副標題進場序列 ──
        .fromTo('.hero__rift',
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.out' },
            0.75
        )

        // 文字從下方推出（保留原本的 y/blur 進場語彙）
        .fromTo('.hero__readout',
            { opacity: 0, y: 22, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power2.out' },
            1.0
        );
    }

    /* ════════════════════════════════════════════════════════
       3. ScrollTrigger — 各 Section 動畫
       ════════════════════════════════════════════════════════ */

    function initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // ── Section 2：宣言文字滑入 ──
        gsap.fromTo('.manifesto__big-text',
            { opacity: 0 },
            {
                opacity: 1, duration: 1.0, ease: 'power2.out',
                scrollTrigger: { trigger: '.manifesto', start: 'top 75%', toggleActions: 'play none none none' }
            }
        );

        gsap.fromTo('.manifesto__body',
            { opacity: 0 },
            {
                opacity: 1, duration: 0.8, delay: 0.2, ease: 'power2.out',
                scrollTrigger: { trigger: '.manifesto', start: 'top 70%', toggleActions: 'play none none none' }
            }
        );

        // ── Section 3：Bento 卡片錯開進場（純 opacity stagger，避免 transform inline 衝突）──
        // GSAP fromTo 的 transform inline 會被 .card:hover translateY 撞掉，hover 不上移；故只動 opacity
        const cards = document.querySelectorAll('.bento-grid .card');
        gsap.fromTo(cards,
            { opacity: 0 },
            {
                opacity: 1,
                duration: 0.65,
                stagger: 0.12,
                ease: 'power2.out',
                scrollTrigger: { trigger: '.bento-grid', start: 'top 80%', toggleActions: 'play none none none' }
            }
        );

        // ── Section 5：終點 CTA ──
        const ctaEls = document.querySelectorAll('.final-cta__inner > *');
        gsap.fromTo(ctaEls,
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: 'power2.out',
                scrollTrigger: { trigger: '.final-cta', start: 'top 80%', toggleActions: 'play none none none' }
            }
        );
    }

    /* ════════════════════════════════════════════════════════
       4. 初始化
       ════════════════════════════════════════════════════════ */

    function init() {
        // L1 環境動畫（Three.js 黑洞星場）已由 assets/js/starfield.js 接管、全站共用
        // has-threejs class / canvas / Three.js load 由 nav.js 處理；index.js 不再管 L1

        // DESIGN_MODE：凍結 L2（進場）+ L3（捲動驅動），加 body class 讓 CSS 提供救援
        if (DESIGN_MODE) {
            document.body.classList.add('design-mode');
            console.info('[index.js] DESIGN_MODE on — L2/L3 animations skipped');
            return;
        }

        initHeroEntrance();
        initScrollAnimations();

        // 太空人 ScrollTrigger 偵序列（Beat 02）
        try { initAstronautScroll(); } catch(e) { console.warn('[index.js] astronaut scroll failed:', e); }

        // 太空人 ScrollTrigger 偵序列（Beat 03）
        try { initManifestoAstronautScroll(); } catch(e) { console.warn('[index.js] manifesto astronaut failed:', e); }

        // 太空人 Beat 04 WebP 偵序列繪製（取代 video 標籤、全平台真透明）
        try { initFooterAstronautFrameLoop(); } catch(e) { console.warn('[index.js] footer astronaut frame loop failed:', e); }

        // 太空人隨機漂移（Beat 04）—— 漂移 transform 由 GSAP 控制 wrapper、與 frame loop 並行
        try { initFooterAstronautDrift(); } catch(e) { console.warn('[index.js] footer astronaut drift failed:', e); }
    }

    // ═══════════════════════════════════════════════════════════
    // Beat 02 太空人 ScrollTrigger 偵序列（Hero → Manifesto 跌落）
    // ─────────────────────────────────────────────────────────
    // 預載 133 張透明 WebP → 捲動 Hero 上半段驅動 canvas drawImage 切偵
    // 來源：72 Kling 真實偵 → RIFE v4.6 補偵 144 → 手動逐張去背 → 截尾刪 134-144 → 512px WebP
    // ═══════════════════════════════════════════════════════════
    function initAstronautScroll() {
        const TOTAL_FRAMES = 133;
        const FRAME_PATH = (i) =>
            `assets/images/astronaut/clips/beat02-frames/frame_${String(i).padStart(3, '0')}.webp`;

        const wrapper = document.querySelector('.hero-astronaut');
        const canvas = document.getElementById('hero-astronaut-canvas');
        if (!wrapper || !canvas) return;
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('[index.js] GSAP/ScrollTrigger 未載入，太空人 scroll 動畫停用');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.warn('[index.js] 太空人 canvas 2d context 取得失敗');
            return;
        }

        const images = [];
        let loadedCount = 0;

        function onAllLoaded() {
            wrapper.classList.add('loaded');
            render();
            attachScrollTrigger();
        }

        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = FRAME_PATH(i);
            img.onload = () => {
                loadedCount++;
                if (loadedCount === TOTAL_FRAMES) onAllLoaded();
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === TOTAL_FRAMES) onAllLoaded();
            };
            images[i - 1] = img;
        }

        const sequence = { frame: 0 };
        function render() {
            const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(sequence.frame)));
            const img = images[idx];
            if (img && img.complete && img.naturalWidth > 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
        }

        function attachScrollTrigger() {
            // 動畫範圍 = Hero 上半段（'center top' = Hero 中心捲到 viewport 頂端時動畫完成）
            // 比 'bottom top' 範圍縮一半 → 每偵的滑動距離 ×0.5、整體節奏更快。
            // scrub 0.2 比 0.5 更即時、比 true 仍保留少量平滑緩衝。
            gsap.to(sequence, {
                frame: TOTAL_FRAMES - 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'center top',
                    scrub: 0.2,
                },
                onUpdate: render
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // Beat 03 太空人 ScrollTrigger 偵序列（2026-05-08）
    // ─────────────────────────────────────────────────────────
    // 預載 179 張透明 WebP → 捲動 Manifesto 期間驅動 canvas 切偵
    // 動畫：懸線揮手 → 掙扎 → 掉下消失
    //
    // 動態定位：canvas 的 image 內線條對齊 .manifesto__body-divider
    // 不寫死 top %，而是 runtime 抓 body-divider 實際位置 + 視窗 resize
    // 重算，保證所有螢幕尺寸／字型載入時序都精準對齊。
    // ═══════════════════════════════════════════════════════════
    function initManifestoAstronautScroll() {
        const TOTAL_FRAMES = 179;
        const FRAME_PATH = (i) =>
            `assets/images/astronaut/clips/beat03-frames/frame_${String(i).padStart(3, '0')}.webp`;
        // image 內冷光線在 canvas 由上往下的位置比例（目測 ~20%）
        // 視覺微調這個值對齊 body-divider 即可
        const IMAGE_LINE_Y_RATIO = 0.20;

        const wrapper = document.querySelector('.manifesto-astronaut');
        const canvas = document.getElementById('manifesto-astronaut-canvas');
        const divider = document.querySelector('.manifesto__body-divider');
        const manifesto = document.querySelector('.manifesto');
        if (!wrapper || !canvas) return;
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // 動態對齊：把 canvas 推到 image 內線跟 body-divider 重疊
        function alignToBodyDivider() {
            if (!divider || !manifesto) return;
            const dRect = divider.getBoundingClientRect();
            const mRect = manifesto.getBoundingClientRect();
            const dividerYInManifesto = dRect.top - mRect.top;
            // canvas 高度（width × 16/9）
            const canvasH = wrapper.offsetHeight;
            // 把 canvas 上推 (image-line-position) 高度，讓 image 內線剛好落在 dividerY
            const canvasTopPx = dividerYInManifesto - canvasH * IMAGE_LINE_Y_RATIO;
            wrapper.style.top = `${canvasTopPx}px`;
        }
        alignToBodyDivider();
        window.addEventListener('resize', alignToBodyDivider);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(alignToBodyDivider);
        }
        // ScrollTrigger 啟動後可能也會改 layout，refresh 時也對齊一次
        ScrollTrigger.addEventListener('refresh', alignToBodyDivider);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const images = [];
        let loadedCount = 0;

        function onAllLoaded() {
            wrapper.classList.add('loaded');
            render();
            attachScrollTrigger();
        }

        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = FRAME_PATH(i);
            img.onload = () => {
                loadedCount++;
                if (loadedCount === TOTAL_FRAMES) onAllLoaded();
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === TOTAL_FRAMES) onAllLoaded();
            };
            images[i - 1] = img;
        }

        const sequence = { frame: 0 };
        function render() {
            const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(sequence.frame)));
            const img = images[idx];
            if (img && img.complete && img.naturalWidth > 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
        }

        function attachScrollTrigger() {
            // 非線性節奏：偵 1-110 佔 70% scroll、偵 110+ 壓縮在後 30% scroll
            // 結果：後段（掉下消失）每偵間距較短、滾動快速完成
            const BREAKPOINT_FRAME = 110;
            const BEFORE_SCROLL_RATIO = 0.70;
            const FRAME_THRESHOLD = BREAKPOINT_FRAME / (TOTAL_FRAMES - 1);

            // 動畫範圍 = Manifesto scroll 期間
            gsap.to(sequence, {
                frame: TOTAL_FRAMES - 1,
                ease: function(t) {
                    if (t <= BEFORE_SCROLL_RATIO) {
                        return (t / BEFORE_SCROLL_RATIO) * FRAME_THRESHOLD;
                    } else {
                        return FRAME_THRESHOLD +
                            ((t - BEFORE_SCROLL_RATIO) / (1 - BEFORE_SCROLL_RATIO)) *
                            (1 - FRAME_THRESHOLD);
                    }
                },
                scrollTrigger: {
                    trigger: '.manifesto',
                    start: 'top center',
                    end: 'bottom top',
                    scrub: 0.2,
                },
                onUpdate: render
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // Beat 04 太空人 WebP 偵序列繪製（2026-05-11 取代 video 標籤）
    // ─────────────────────────────────────────────────────────
    // 原 video 方案 iOS Safari 對 VP9+alpha 不渲染 alpha → 看到黑塊；
    // Windows ffmpeg 又無法產 HEVC+alpha mp4。改用 WebP 偵序列（同
    // beat02/03 管線、所有平台 PNG-style alpha 100% 真透明）。
    // 預載 N 偵 WebP → RAF 30fps 切偵 → 自動 loop（不依賴 scroll）
    // ═══════════════════════════════════════════════════════════
    function initFooterAstronautFrameLoop() {
        const TOTAL_FRAMES = 470;                // 15.67s × 30fps（由 beat04_to_webp_frames.py 產出）
        const FPS = 30;
        const FRAME_INTERVAL = 1000 / FPS;       // 33.33ms / 偵
        const FRAME_PATH = (i) =>
            `assets/images/astronaut/clips/beat04-frames/frame_${String(i).padStart(3, '0')}.webp`;

        const canvas = document.getElementById('footer-astronaut-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 並行 preload 全 470 偵，但**不等全部到齊**——page load 立即啟動 tick；
        // 個別偵未 ready 時 skip 不 draw、保留 canvas 上一偵 buffer（避免閃爍/空白）
        const images = [];
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = FRAME_PATH(i);
            images[i - 1] = img;
        }

        let frameIdx = 0;
        let lastFrameTime = 0;

        function tick(now) {
            if (now - lastFrameTime >= FRAME_INTERVAL) {
                const img = images[frameIdx];
                if (img && img.complete && img.naturalWidth > 0) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                // 未 ready 偵跳過、保留上一偵在 buffer（不 clearRect、不 draw）
                frameIdx = (frameIdx + 1) % TOTAL_FRAMES;
                lastFrameTime = now;
            }
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // ═══════════════════════════════════════════════════════════
    // Beat 04 太空人隨機漂移（2026-05-08）
    // ─────────────────────────────────────────────────────────
    // 從畫面外左 / 右隨機進入、慢速漂移到對側、loop。從左進入時水平
    // 翻轉影片，讓頭盔永遠處於前進方向的前方（領頭追逐感）。
    // 漂移 transform 由 GSAP 控制 .footer-astronaut wrapper；canvas 內容由
    // initFooterAstronautFrameLoop 獨立繪製、兩者並行不衝突。
    // ═══════════════════════════════════════════════════════════
    function initFooterAstronautDrift() {
        const wrapper = document.querySelector('.footer-astronaut');
        if (!wrapper || typeof gsap === 'undefined') return;

        // 漂移時長範圍（單個 cycle 從畫面外漂到另一側畫面外的秒數）
        const MIN_DURATION = 15;
        const MAX_DURATION = 22;

        // 固定推進倍率：太空人朝鏡頭推進的視覺角度固定，不依起始大小變化
        const SCALE_MULTIPLIER = 2.2;

        // y 軸偏移範圍：startY/endY 各自獨立隨機，差距產生「斜上或斜下」漂移軌跡
        // 範圍 -300 ~ 0（只往上偏移，避免往下撞到 site-footer 邊界）
        // startY/endY 都在這範圍內、差距最大 300px → 明顯斜線軌跡
        const Y_OFFSET_MIN = -300;
        const Y_OFFSET_MAX = 0;

        let cycleTween = null;

        function runCycle() {
            const containerW = wrapper.offsetWidth || 400;
            const viewportW = window.innerWidth;
            // 影片原始視角：頭盔在 image 左側、身體在右側、身體往左追頭盔。
            // → 從畫面右進入（往左移）→ 影片頭盔正好在前進方向前方，無需翻轉
            // → 從畫面左進入（往右移）→ 需要 scaleX(-1) 翻轉、頭盔換到 image 右側 = 前進方向前方
            const enterFromRight = Math.random() < 0.5;
            const flipDir = enterFromRight ? 1 : -1;

            // 隨機傾斜角度：-12° 到 +12°（每輪一個固定角度、不在漂移期間改變）
            const rotation = (Math.random() * 24) - 12;

            // 隨機初始尺寸：原尺寸的 25%-85%（拓寬下限、更可能出現很遠很小的太空人）
            const startScale = 0.25 + Math.random() * 0.60;
            // 終點尺寸：固定推進倍率 1.8 倍（無論起始多少、推進角度一致）
            const endScale = startScale * SCALE_MULTIPLIER;

            // y 軸隨機偏移：startY 跟 endY 各自獨立隨機 -150~+50px
            // 兩者差距產生「斜上或斜下」漂移軌跡（每 cycle 軌跡不同）
            const startY = Y_OFFSET_MIN + Math.random() * (Y_OFFSET_MAX - Y_OFFSET_MIN);
            const endY = Y_OFFSET_MIN + Math.random() * (Y_OFFSET_MAX - Y_OFFSET_MIN);

            // 漂移範圍 buffer = containerW × 0.3
            const buffer = containerW * 0.3;
            const startX = enterFromRight
                ? viewportW + buffer       // 右側畫面外（足夠遠）
                : -containerW - buffer;    // 左側畫面外（足夠遠）
            const endX = enterFromRight
                ? -containerW - buffer     // 終點：左側畫面外
                : viewportW + buffer;      // 終點：右側畫面外

            // 設定起點（瞬間定位）：位置 + y 偏移 + 傾斜 + 起始尺寸 + 翻轉
            gsap.set(wrapper, {
                x: startX,
                y: startY,
                scaleX: flipDir * startScale,
                scaleY: startScale,
                rotation: rotation,
                opacity: 0.9,
            });

            // 漂移期間：x 跨畫面 + y 緩慢偏移 + scale 線性放大（推進角度固定）
            const duration = MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION);
            cycleTween = gsap.to(wrapper, {
                x: endX,
                y: endY,
                scaleX: flipDir * endScale,
                scaleY: endScale,
                duration: duration,
                ease: 'none',
                onComplete: runCycle,  // cycle 之間無間隔：離場後立即從另一邊進場
            });
        }

        // page load 立即開始：太空人一直在 final-cta 內漂浮（不依 ScrollTrigger）
        // user 滾到 final-cta 時看到的是動畫某個隨機 phase（剛進場 / 中段 / 快離場）
        runCycle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
