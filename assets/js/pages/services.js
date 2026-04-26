/* ============================================================
   pages/services.js — 服務總覽頁專屬互動
   創巢數位 Nest Digital | 版本 redesign-v1
   功能：Hero 入場序列 | ScrollTrigger 區塊動畫
   ============================================================ */

(function () {
    'use strict';

    /* ════════════════════════════════════════════════════════
       1. Hero 入場序列
       ════════════════════════════════════════════════════════ */

    function initHeroEntrance() {
        if (typeof gsap === 'undefined') return;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo('.page-hero__eyebrow',
            { opacity: 0, y: -12 },
            { opacity: 1, y: 0, duration: 0.5 },
            0
        )
        .fromTo('.page-hero__title',
            { opacity: 0, y: 30, skewY: 1 },
            { opacity: 1, y: 0, skewY: 0, duration: 0.75 },
            0.12
        )
        .fromTo('.page-hero__subtitle',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.65 },
            0.45
        )
        .fromTo('.page-hero__meta',
            { opacity: 0 },
            { opacity: 1, duration: 0.5 },
            0.65
        )
        .fromTo('.letter-card',
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.55, stagger: 0.08, ease: 'back.out(1.4)' },
            0.25
        );
    }

    /* ════════════════════════════════════════════════════════
       2. ScrollTrigger 各區塊動畫
       ════════════════════════════════════════════════════════ */

    function initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // ── 服務標題 ──
        gsap.fromTo('.all-services .section-header',
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
                scrollTrigger: { trigger: '.all-services', start: 'top 80%', toggleActions: 'play none none none' }
            }
        );

        // ── 服務卡片群組：逐一錯開 ──
        const srvCards = document.querySelectorAll('.srv-card');
        if (srvCards.length) {
            gsap.fromTo(srvCards,
                { opacity: 0, y: 40, scale: 0.97 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.65,
                    stagger: 0.10,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: '.srv-grid', start: 'top 82%', toggleActions: 'play none none none' }
                }
            );
        }

        // ── 流程步驟 ──
        const steps = document.querySelectorAll('.process-step');
        if (steps.length) {
            gsap.fromTo(steps,
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: '.process', start: 'top 78%', toggleActions: 'play none none none' }
                }
            );
        }

        // ── 流程連接線 ──
        const connectors = document.querySelectorAll('.process-connector');
        if (connectors.length) {
            gsap.fromTo(connectors,
                { opacity: 0 },
                {
                    opacity: 1, duration: 0.5, stagger: 0.15, delay: 0.4,
                    scrollTrigger: { trigger: '.process', start: 'top 78%', toggleActions: 'play none none none' }
                }
            );
        }

        // ── Final CTA ──
        const ctaEls = document.querySelectorAll('.final-cta__inner > *');
        if (ctaEls.length) {
            gsap.fromTo(ctaEls,
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: 'power2.out',
                    scrollTrigger: { trigger: '.final-cta', start: 'top 80%', toggleActions: 'play none none none' }
                }
            );
        }
    }

    /* ════════════════════════════════════════════════════════
       3. 初始化
       ════════════════════════════════════════════════════════ */

    function init() {
        initHeroEntrance();
        initScrollAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
