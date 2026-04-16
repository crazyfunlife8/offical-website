/* ============================================================
   core.js — GSAP 全站共用邏輯
   創巢數位 Nest Digital | 版本 redesign-v1
   ============================================================ */

(function () {
    'use strict';

    // ─── JS 可用性標記（必須最先執行）────────────────────────
    // 將 <html class="no-js"> 改為 <html class="js">
    // CSS 使用 .js [data-reveal] 與 .js .js-hidden 確保無 JS 時內容仍可見
    document.documentElement.classList.replace('no-js', 'js');

    // ─── GSAP 插件註冊 ───────────────────────────────────────
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // ─── 通用 Scroll Reveal ──────────────────────────────────
    // 偵測所有帶 [data-reveal] 屬性的元素，統一 fade-up 進場
    function initScrollReveal() {
        if (typeof gsap === 'undefined') return;

        const els = document.querySelectorAll('[data-reveal]');
        if (!els.length) return;

        els.forEach((el) => {
            const delay   = parseFloat(el.dataset.revealDelay   || 0);
            const y       = parseFloat(el.dataset.revealY       || 30);
            const dur     = parseFloat(el.dataset.revealDur     || 0.7);
            const once    = el.dataset.revealOnce !== 'false'; // 預設只觸發一次

            gsap.fromTo(el,
                { opacity: 0, y },
                {
                    opacity: 1,
                    y: 0,
                    duration: dur,
                    delay,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        toggleActions: once ? 'play none none none' : 'play none none reverse',
                    }
                }
            );
        });
    }

    // ─── Stagger Reveal（用 [data-stagger-group] 圈住子元素） ─
    function initStaggerReveal() {
        if (typeof gsap === 'undefined') return;

        const groups = document.querySelectorAll('[data-stagger-group]');
        groups.forEach((group) => {
            const children = group.children;
            const stagger  = parseFloat(group.dataset.staggerGroup || 0.12);

            gsap.fromTo(children,
                { opacity: 0, y: 24 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: group,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    }
                }
            );
        });
    }

    // ─── Nav 滾動行為 ─────────────────────────────────────────
    // 超過 100px 加深背景（class: .scrolled）
    function initNavScroll() {
        const nav = document.querySelector('.site-nav');
        if (!nav) return;

        const THRESHOLD = 100;

        function onScroll() {
            if (window.scrollY > THRESHOLD) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // 初始執行一次
    }

    // ─── 初始化 ───────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        initNavScroll();
        // Scroll reveal 延遲一幀，確保 nav.js 注入完成
        requestAnimationFrame(function () {
            initScrollReveal();
            initStaggerReveal();
        });
    });

})();
