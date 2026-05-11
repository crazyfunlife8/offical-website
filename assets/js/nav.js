/* ============================================================
   nav.js — 唯一 Nav 來源：注入全站導覽列
   創巢數位 Nest Digital | 版本 redesign-v1
   修改此檔 = 所有頁面同步生效
   ============================================================ */

(function () {
    'use strict';

    // ─── 導覽列 HTML ──────────────────────────────────────────
    const NAV_HTML = `
<nav class="site-nav" role="navigation" aria-label="主導覽列">
    <a href="index.html" class="nav__brand" aria-label="創巢數位 Nest Digital 首頁">
        <span class="nav__brand-zh">創巢數位</span>
        <span class="nav__brand-divider" aria-hidden="true"></span>
        <span class="nav__brand-en">NEST DIGITAL</span>
    </a>

    <ul class="nav__links" role="list">
        <li><a href="about.html">關於</a></li>
        <li><a href="index.html#services-section">服務</a></li>
        <li><a href="news.html">消息</a></li>
        <li class="nav__links-cta-mobile">
            <a href="contact.html">聯絡我們 <span aria-hidden="true">→</span></a>
        </li>
    </ul>

    <a href="contact.html" class="nav__cta">
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
        </p>
    </div>
</footer>
`;

    // ─── 注入：星空 + Nav 到 body 開頭、Footer 到 body 結尾 ─────
    document.body.insertAdjacentHTML('afterbegin', STARFIELD_HTML + NAV_HTML);
    document.body.insertAdjacentHTML('beforeend', SITE_FOOTER_HTML);

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
    const currentPath = location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav__links a').forEach((a) => {
        const href = a.getAttribute('href');
        if (href && href === currentPath) {
            a.classList.add('active');
        }
    });

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

})();
