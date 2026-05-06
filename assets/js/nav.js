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
    <ul class="nav__links" role="list">
        <li><a href="about.html">關於</a></li>
        <li><a href="services.html">服務</a></li>
        <li><a href="news.html">消息</a></li>
    </ul>

    <a href="contact.html" class="nav__cta">
        <span class="nav__cta-label">聯絡我們</span>
        <span class="nav__cta-arrow" aria-hidden="true">→</span>
    </a>
</nav>

<nav class="dock-nav" role="navigation" aria-label="手機底部導覽列">
    <a href="index.html" class="dock-nav__item" aria-label="首頁">
        <i class="fas fa-home" aria-hidden="true"></i>
        <span>首頁</span>
    </a>
    <a href="services.html" class="dock-nav__item" aria-label="服務項目">
        <i class="fas fa-th-large" aria-hidden="true"></i>
        <span>服務</span>
    </a>
    <a href="about.html" class="dock-nav__item" aria-label="關於我們">
        <i class="fas fa-user-astronaut" aria-hidden="true"></i>
        <span>關於</span>
    </a>
    <a href="contact.html" class="dock-nav__item" aria-label="聯絡我們">
        <i class="fas fa-paper-plane" aria-hidden="true"></i>
        <span>聯絡</span>
    </a>
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

    // ─── 注入 body 最前端（星空在前，Nav 在後）─────────────────
    document.body.insertAdjacentHTML('afterbegin', STARFIELD_HTML + NAV_HTML);

    // ─── CSS 星空：以視窗中心為核心的輻射分布，製造深邃宇宙吸入感 ──
    function initCSSStarfield() {
        const VW = window.innerWidth  || 1440;
        const VH = window.innerHeight || 900;

        // .css-stars 元素左上角 = viewport (-15%w, -15%h)
        // → viewport 中心在 box-shadow 座標系中 = (65%VW, 65%VH)
        const CX   = Math.round(VW * 0.65);
        const CY   = Math.round(VH * 0.65);
        const RMAX = Math.round(Math.sqrt(CX * CX + CY * CY) * 1.15);

        const layers = [
            // 遠景微塵：密集在核心中環（製造銀河核心密度感，中心留空黑洞感）
            { sel: '.css-stars--s', count: 360,
              getR: () => 90 + Math.pow(Math.random(), 1.2) * (RMAX * 0.72),
              sizeMin: 0.4, sizeMax: 1.0, opMin: 0.08, opMax: 0.52, glowChance: 0.0 },
            // 中景星：均勻中環分布，帶少量冷藍色調
            { sel: '.css-stars--m', count: 110,
              getR: () => 160 + Math.pow(Math.random(), 0.85) * (RMAX * 0.85),
              sizeMin: 1.0, sizeMax: 1.8, opMin: 0.30, opMax: 0.78, glowChance: 0.06 },
            // 近景亮星：偏外圍，帶光暈，代表較近的前景恆星
            { sel: '.css-stars--l', count: 28,
              getR: () => RMAX * 0.38 + Math.random() * (RMAX * 0.68),
              sizeMin: 1.5, sizeMax: 2.8, opMin: 0.60, opMax: 1.00, glowChance: 0.45 },
        ];

        layers.forEach(({ sel, count, getR, sizeMin, sizeMax, opMin, opMax, glowChance }) => {
            const el = document.querySelector(sel);
            if (!el) return;

            // 1×1px 圓形元素，box-shadow 繼承圓形輪廓（確保真圓星點）
            el.style.cssText += 'width:1px;height:1px;border-radius:50%;background:transparent;';

            const shadows = [];
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r     = getR();
                const x     = Math.round(CX + Math.cos(angle) * r);
                const y     = Math.round(CY + Math.sin(angle) * r);

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

    // ─── Active 狀態：高亮目前頁面連結 ───────────────────────
    const currentPath = location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav__links a, .dock-nav__item').forEach((a) => {
        const href = a.getAttribute('href');
        if (href && href === currentPath) {
            a.classList.add('active');
        }
    });

})();
