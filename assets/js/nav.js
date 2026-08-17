/* ============================================================
   nav.js — 唯一 Nav 來源：注入全站導覽列
   創巢數位 Nest Digital | 版本 redesign-v1
   修改此檔 = 所有頁面同步生效
   ============================================================ */

/* ── 全站定價設定檔（唯一真相來源） ─────────────────────────
   調價只改這裡。meta / JSON-LD 仍需手動同步同一 HTML 檔案。
   ─────────────────────────────────────────────────────────── */
window.PRICES = {
    ads:          { start: 900,   rebate: 200 },
    aiInfluencer: { monthly: 21000 },
    social:       { entry: 9500 },
    seo:          { monthly: 15000 },
    website:      { annual: 6000 },
};

(function () {
    'use strict';

    // ─── 導覽列 HTML ──────────────────────────────────────────
    const NAV_HTML = `
<nav class="site-nav" role="navigation" aria-label="主導覽列">
    <a href="/" class="nav__brand" aria-label="創巢數位 Nest Digital 首頁">
        <span class="nav__brand-zh">創巢數位</span>
        <span class="nav__brand-divider" aria-hidden="true"></span>
        <span class="nav__brand-en">NEST DIGITAL</span>
    </a>

    <ul class="nav__links" role="list">
        <li><a href="/">首頁</a></li>
        <li><a href="/#services-section">服務</a></li>
        <li><a href="/blog">不正常觀點</a></li>
        <li class="nav__links-cta-mobile">
            <a href="/contact">聯絡我們 <span aria-hidden="true">→</span></a>
        </li>
    </ul>

    <span class="nav__divider" aria-hidden="true"></span>

    <a href="/contact" class="nav__cta">
        <span class="nav__cta-label">聯絡我們</span>
        <span class="nav__cta-arrow" aria-hidden="true">→</span>
    </a>

    <button type="button" class="nav__hamburger" aria-label="選單" aria-expanded="false" aria-controls="nav-links">
        <span class="nav__hamburger-line" aria-hidden="true"></span>
        <span class="nav__hamburger-line" aria-hidden="true"></span>
        <span class="nav__hamburger-line" aria-hidden="true"></span>
    </button>
</nav>
`;

    // ─── CSS 星空 HTML（首頁由 body.has-threejs 隱藏，Three.js 接管）────
    const STARFIELD_HTML = `
<div id="css-starfield" aria-hidden="true">
    <div class="css-stars css-stars--s"></div>
    <div class="css-stars css-stars--m"></div>
    <div class="css-stars css-stars--l"></div>
</div>
`;

    // ─── 站尾 HTML（電影片尾收束 + 雙公司聯名 X；2026-05-12 由各頁 inline 抽出統一注入）
    const SITE_FOOTER_HTML = `
<footer class="site-footer" role="contentinfo">
    <div class="site-footer__inner">

        <!-- 上方對稱冷光線（呼應 final-cta） -->
        <div class="site-footer__divider" aria-hidden="true"></div>

        <!-- 品牌大字（電影片尾收束） -->
        <div class="site-footer__brand-block">
            <h2 class="site-footer__brand-mark" aria-label="Nest Digital">NEST DIGITAL</h2>
            <p class="site-footer__location">桃園・中壢｜中央西路二段 268-1 號 5 樓</p>
        </div>

        <!-- 兩欄資訊區 -->
        <div class="site-footer__info">
            <div class="site-footer__col">
                <h3 class="site-footer__col-label">CONTACT</h3>
                <p>LINE @604vqsva</p>
                <p>03-4912872</p>
            </div>
            <div class="site-footer__col site-footer__col--studio">
                <h3 class="site-footer__col-label">STUDIO</h3>
                <div class="site-footer__studio-pair">
                    <div class="site-footer__studio-entry">
                        <p>創巢數位資訊企業社</p>
                        <p>統編 93019200</p>
                    </div>
                    <span class="site-footer__studio-x" aria-hidden="true"></span>
                    <div class="site-footer__studio-entry">
                        <p>不正常人類軟體開發有限公司</p>
                        <p>統編 83302868</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 最底版權行 -->
        <p class="site-footer__copy">
            © 2024–2026 Nest Digital. All rights reserved.
            &ensp;·&ensp;<a href="/privacy" class="site-footer__privacy-link">隱私政策</a>
            &ensp;·&ensp;<a href="/terms" class="site-footer__privacy-link">服務條款</a>
            &ensp;·&ensp;<a href="/refund" class="site-footer__privacy-link">退費政策</a>
        </p>
    </div>
</footer>
`;

    // ─── 注入：星空 + Nav 到 body 開頭、Footer 緊接 <main> 後 ─────
    // footer 注入 main afterend（同 main sibling），語意正確且 layout 跟原 inline footer 一致
    // 若無 main element 才 fallback 到 body beforeend
    document.body.insertAdjacentHTML('afterbegin', STARFIELD_HTML + NAV_HTML);
    const mainEl = document.querySelector('main');
    if (mainEl) {
        mainEl.insertAdjacentHTML('afterend', SITE_FOOTER_HTML);
    } else {
        document.body.insertAdjacentHTML('beforeend', SITE_FOOTER_HTML);
    }

    // ─── Three.js 黑洞漩渦星場全站化（2026-05-12）─────────────
    // 之前只有 index.html 跑 Three.js，其他頁用 CSS 靜態 fallback；
    // 現改為所有頁面共用 starfield.js Three.js 黑洞動畫
    // 流程：① body 加 has-threejs class（隱藏 CSS 螺旋臂，避免雙重）
    //       ② 注入 <canvas id="starfield-canvas"> 給 Three.js renderer 用
    //       ③ 動態 load Three.js CDN（已 load 跳過）→ load starfield.js
    // 開發用輕量模式：網址帶 ?lite 時關閉最耗 GPU 的 Three.js 黑洞星場，改用輕量 CSS 星空，
    // 避免本機開 F12 協作時 WebGL 連續重繪佔滿 GPU、拖累其他分頁（影片卡頓）。正式訪客不會帶 ?lite。
    const LITE = /[?&]lite\b/.test(location.search);
    if (!LITE && !document.body.classList.contains('has-threejs')) {
        document.body.classList.add('has-threejs');
    }
    if (!LITE && !document.getElementById('starfield-canvas')) {
        const sfCanvas = document.createElement('canvas');
        sfCanvas.id = 'starfield-canvas';
        sfCanvas.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(sfCanvas, document.body.firstChild);
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // 避免重複載入同一 script
            if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = () => reject(new Error(`[nav.js] failed to load ${src}`));
            document.body.appendChild(s);
        });
    }

    function bootStarfield() {
        loadScript('/assets/js/starfield.js').catch((e) => {
            console.warn(e);
            // starfield.js 載入失敗 → 拔 has-threejs，CSS 星空 fallback 接手
            document.body.classList.remove('has-threejs');
        });
    }

    if (LITE) {
        console.info('[nav.js] ?lite 模式 — 跳過 Three.js 星場（CSS 星空接手，省 GPU）');
    } else if (typeof THREE === 'undefined') {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
            .then(bootStarfield)
            .catch((e) => {
                console.warn(e);
                document.body.classList.remove('has-threejs');
            });
    } else {
        bootStarfield();
    }

    // ─── CSS 星空：log 螺旋臂 + 橢圓投影 + -15° 傾斜（呼應桌機 Three.js 黑洞邏輯）──
    // 設計：兩條螺旋臂、95% 星點貼臂、5% 漫散；中心暗域留空、外圈隨 r 衰減
    function initCSSStarfield() {
        const VW = window.innerWidth  || 1440;
        const VH = window.innerHeight || 900;

        // .css-stars 元素左上角 = viewport (-15%w, -15%h)
        // → viewport 中心在 box-shadow 座標系中 = (65%VW, 65%VH)
        const CX   = Math.round(VW * 0.65);
        const CY   = Math.round(VH * 0.65);
        const RMAX = Math.round(Math.sqrt(CX * CX + CY * CY) * 1.15);

        // 漩渦參數（呼應 index.js initStarfield 的 SPIRAL_K / TILT）
        const SPIRAL_K     = 0.42;                    // 螺旋臂捲曲係數
        const TILT         = -Math.PI / 12;           // -15°，與 #css-starfield::before 斜帶同向
        const COS_T        = Math.cos(TILT);
        const SIN_T        = Math.sin(TILT);
        const ELLIPSE_R    = 0.55;                    // 橢圓比 短/長
        const ARM_SPREAD   = 0.18;                    // 臂寬（弧度，越小越緊）
        const ARM_RATIO    = 0.92;                    // 92% 貼臂、8% 漫散
        const R_MIN        = RMAX * 0.06;             // 中心黑洞半徑（留空）

        const layers = [
            // 遠景微塵：高密度貼臂、明顯漩渦結構
            { sel: '.css-stars--s', count: 360,
              rRange: [R_MIN, RMAX * 0.55],
              sizeMin: 0.4, sizeMax: 1.0, opMin: 0.08, opMax: 0.52, glowChance: 0.0 },
            // 中景星：中環、帶冷藍色調
            { sel: '.css-stars--m', count: 110,
              rRange: [R_MIN * 1.5, RMAX * 0.65],
              sizeMin: 1.0, sizeMax: 1.8, opMin: 0.30, opMax: 0.78, glowChance: 0.06 },
            // 近景亮星：散布偏外、少量錨點、帶光暈
            { sel: '.css-stars--l', count: 28,
              rRange: [RMAX * 0.20, RMAX * 0.55],
              sizeMin: 1.5, sizeMax: 2.8, opMin: 0.60, opMax: 1.00, glowChance: 0.45 },
        ];

        layers.forEach(({ sel, count, rRange, sizeMin, sizeMax, opMin, opMax, glowChance }) => {
            const el = document.querySelector(sel);
            if (!el) return;

            // 1×1px 圓形元素，box-shadow 繼承圓形輪廓（確保真圓星點）
            el.style.cssText += 'width:1px;height:1px;border-radius:50%;background:transparent;';

            const [rMin, rMax] = rRange;
            const shadows = [];
            for (let i = 0; i < count; i++) {
                // 平方根均勻面積取樣（避免中心過密）
                const r = Math.sqrt(rMin * rMin + Math.random() * (rMax * rMax - rMin * rMin));

                // 螺旋臂角度：92% 貼兩條臂、8% 漫散
                let theta;
                if (Math.random() < ARM_RATIO) {
                    const arm    = Math.floor(Math.random() * 2) * Math.PI;
                    const spread = (Math.random() - 0.5) * ARM_SPREAD;
                    theta = arm - Math.log(r * 0.01 + 0.1) * SPIRAL_K * 3.5 + spread;
                } else {
                    theta = Math.random() * Math.PI * 2;
                }

                // 橢圓投影 + 傾斜
                const px = r * Math.cos(theta);
                const py = r * Math.sin(theta) * ELLIPSE_R;
                const x  = Math.round(CX + px * COS_T - py * SIN_T);
                const y  = Math.round(CY + px * SIN_T + py * COS_T);

                const size  = +(sizeMin + Math.random() * (sizeMax - sizeMin)).toFixed(1);
                const op    = +(opMin   + Math.random() * (opMax - opMin)).toFixed(2);

                // 色調：90% 白、7% 冷藍、3% 暖黃
                const rnd   = Math.random();
                const color = rnd < 0.03 ? `rgba(255,210,80,${op})`
                            : rnd < 0.10 ? `rgba(140,170,255,${op})`
                            : `rgba(255,255,255,${op})`;

                // 近景亮星加微光暈
                const blur  = Math.random() < glowChance ? +(1 + Math.random()).toFixed(1) : 0;

                shadows.push(`${x}px ${y}px ${blur}px ${size}px ${color}`);
            }

            el.style.boxShadow = shadows.join(',');
        });
    }

    initCSSStarfield();

    // resize 重算座標（debounce 200ms）：viewport 改變時星點分布跟著重生成
    // 避免桌機刷新後切手機尺寸看到桌機座標星點 / 手機刷新看到緊縮分布
    let starfieldResizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(starfieldResizeTimer);
        starfieldResizeTimer = setTimeout(initCSSStarfield, 200);
    });

    // ─── Active 狀態：高亮目前頁面連結 ───────────────────────
    const currentPathname = location.pathname;
    const isHomePage = currentPathname === '/' || currentPathname === '/index.html';

    document.querySelectorAll('.nav__links a').forEach((a) => {
        const href = a.getAttribute('href');
        if (!href) return;
        const hasHash = href.includes('#');
        // 錨點連結（如 /#services-section）不做 pathname 比對，避免首頁雙高亮
        if (hasHash) return;
        const hrefPath = href.split('?')[0];
        if (hrefPath === currentPathname ||
            (hrefPath === '/' && isHomePage)) {
            a.classList.add('active');
        }
    });

    // 首頁：滾入服務區時改高亮「服務」，離開時恢復「首頁」
    if (isHomePage) {
        const homeLink     = document.querySelector('.nav__links a[href="/"]');
        const servicesLink = document.querySelector('.nav__links a[href="/#services-section"]');
        const servicesSection = document.querySelector('#services-section');

        if (homeLink && servicesLink && servicesSection) {
            const observer = new IntersectionObserver((entries) => {
                const inView = entries[0].isIntersecting;
                homeLink.classList.toggle('active', !inView);
                servicesLink.classList.toggle('active', inView);
            }, { threshold: 0.15, rootMargin: '-80px 0px 0px 0px' });

            observer.observe(servicesSection);
        }
    }

    // ─── Hamburger 選單開合（mobile）──────────────────────────
    // 只在 mobile（≤900px）顯示按鈕；桌機 CSS 隱藏 .nav__hamburger
    function initHamburger() {
        const hamburger = document.querySelector('.nav__hamburger');
        const nav = document.querySelector('.site-nav');
        if (!hamburger || !nav) return;

        function setOpen(open) {
            nav.classList.toggle('is-open', open);
            hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        hamburger.addEventListener('click', () => {
            const open = nav.classList.contains('is-open');
            setOpen(!open);
        });

        // 點擊選單連結後自動關閉（提升 mobile 操作流暢）
        nav.querySelectorAll('.nav__links a').forEach((a) => {
            a.addEventListener('click', () => setOpen(false));
        });

        // ESC 鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                setOpen(false);
            }
        });
    }

    initHamburger();

    // ─── Cookie 同意橫幅 ──────────────────────────────────────
    // 順序紀律：privacy.html 先改 → 本橫幅上線 → GA4/Pixel 才能裝
    // 使用者偏好存 localStorage key "nd_cookie"
    // 值："all"（接受所有）或 "essential"（僅必要）

    function loadAnalytics() {
        // ── GA4 ──────────────────────────────────────────────
        const GA4_ID = 'G-MXV88FLJ64';
        const s = document.createElement('script');
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
        s.async = true;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', GA4_ID);
        window.gtag = gtag;

        // ── Meta Pixel ───────────────────────────────────────
        // 取得 Pixel ID 後填入：
        /*
        const META_PIXEL_ID = 'XXXXXXXXXXXXXXXXXX';
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', META_PIXEL_ID);
        fbq('track', 'PageView');
        */

        // ── TikTok Pixel ─────────────────────────────────────
        // 取得 Pixel ID 後填入：
        /*
        const TIKTOK_PIXEL_ID = 'CXXXXXXXXXXXXXXXXX';
        !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once",
        "ready","alias","group","enableCookie","disableCookie"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)
        ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._f=ttq._f||{};
        ttq._f[e]=n;var o=document.createElement("script");o.type="text/javascript";
        o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];
        a.parentNode.insertBefore(o,a)};ttq.load(TIKTOK_PIXEL_ID);ttq.page()}(window,document,'ttq');
        */
    }

    function initCookieConsent() {
        const PREF_KEY = 'nd_cookie';
        const pref = localStorage.getItem(PREF_KEY);

        if (pref === 'all') { loadAnalytics(); return; }
        if (pref === 'essential') { return; }

        // 未設定偏好：顯示橫幅
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie 同意');
        banner.innerHTML =
            '<p class="cookie-banner__text">' +
                '我們使用分析型與廣告型 Cookie 改善服務體驗。' +
                '<a href="/privacy" class="cookie-banner__link">隱私政策</a>' +
            '</p>' +
            '<div class="cookie-banner__actions">' +
                '<button class="cookie-banner__btn cookie-banner__btn--accept">接受所有</button>' +
                '<button class="cookie-banner__btn cookie-banner__btn--decline">僅必要</button>' +
            '</div>';

        document.body.appendChild(banner);

        // 用 rAF 確保 translateY(100%) 的初始態已渲染，再加 is-visible 觸發過渡
        requestAnimationFrame(() => {
            requestAnimationFrame(() => banner.classList.add('is-visible'));
        });

        function dismiss(choice) {
            localStorage.setItem(PREF_KEY, choice);
            banner.classList.remove('is-visible');
            banner.addEventListener('transitionend', () => banner.remove(), { once: true });
        }

        banner.querySelector('.cookie-banner__btn--accept').addEventListener('click', function () {
            dismiss('all');
            loadAnalytics();
        });

        banner.querySelector('.cookie-banner__btn--decline').addEventListener('click', function () {
            dismiss('essential');
        });
    }

    initCookieConsent();

})();
