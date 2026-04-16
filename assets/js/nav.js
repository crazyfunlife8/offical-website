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
        <span class="nav__brand-dot" aria-hidden="true"></span>
        <span>創巢數位</span>
        <span style="color:var(--c-muted);font-weight:400;margin:0 2px;">/</span>
        <span style="font-weight:700;letter-spacing:0.06em;">Nest Digital</span>
    </a>

    <ul class="nav__links" role="list">
        <li><a href="about.html">關於我們</a></li>
        <li><a href="services.html">服務項目</a></li>
        <li><a href="news.html">最新消息</a></li>
        <li><a href="contact.html" class="nav__cta">聯絡我們</a></li>
    </ul>
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

    // ─── Active 狀態：高亮目前頁面連結 ───────────────────────
    const currentPath = location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav__links a, .dock-nav__item').forEach((a) => {
        const href = a.getAttribute('href');
        if (href && href === currentPath) {
            a.classList.add('active');
        }
    });

})();
