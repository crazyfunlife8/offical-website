/* ============================================================
   pages/index.js — 首頁專屬互動
   創巢數位 Nest Digital | 版本 redesign-v1
   功能：Three.js 星空粒子 + 太空人 | Hero GSAP 入場序列 | ScrollTrigger 各區塊動畫
   ============================================================ */

(function () {
    'use strict';

    // matchMedia 取代靜態寬度快照，可響應 resize / orientation change
    const mobileQuery = window.matchMedia('(max-width: 900px)');
    const IS_MOBILE   = mobileQuery.matches;

    /* ════════════════════════════════════════════════════════
       1. Three.js 星空粒子場（全站 canvas，手機跳過）
       ════════════════════════════════════════════════════════ */

    function initStarfield() {
        if (typeof THREE === 'undefined') return;
        if (IS_MOBILE) return; // 效能邊界規則

        const canvas = document.getElementById('starfield-canvas');
        if (!canvas) return;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 800;

        // ── 星星粒子 ──
        const COUNT      = 2000;
        const geometry   = new THREE.BufferGeometry();
        const positions  = new Float32Array(COUNT * 3);
        const colors     = new Float32Array(COUNT * 3);
        const sizes      = new Float32Array(COUNT);

        // 品牌色系：白 + 品牌藍淡化 + 黃點綴
        const PALETTE = [
            new THREE.Color('#ffffff'),
            new THREE.Color('#ffffff'),
            new THREE.Color('#6b8fff'),
            new THREE.Color('#9db4ff'),
            new THREE.Color('#FFC709'),
        ];

        for (let i = 0; i < COUNT; i++) {
            const i3 = i * 3;
            positions[i3]     = (Math.random() - 0.5) * 2400;
            positions[i3 + 1] = (Math.random() - 0.5) * 1400;
            positions[i3 + 2] = (Math.random() - 0.5) * 1200;

            const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
            colors[i3]     = col.r;
            colors[i3 + 1] = col.g;
            colors[i3 + 2] = col.b;

            sizes[i] = Math.random() * 2.2 + 0.4;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

        // 圓形粒子材質
        const material = new THREE.PointsMaterial({
            size:           1.8,
            vertexColors:   true,
            transparent:    true,
            opacity:        0.85,
            sizeAttenuation: true,
            blending:       THREE.AdditiveBlending,
            depthWrite:     false,
        });

        const stars = new THREE.Points(geometry, material);
        scene.add(stars);

        // ── 動畫循環 ──
        let scrollY = 0;
        window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

        let animId;
        function animate() {
            animId = requestAnimationFrame(animate);

            stars.rotation.y += 0.00012;
            stars.rotation.x  = scrollY * 0.00004;

            // 視差：鏡頭隨滾動緩緩後退
            camera.position.z = 800 + scrollY * 0.15;

            renderer.render(scene, camera);
        }
        animate();

        // ── RWD resize ──
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // 頁面隱藏時停止渲染
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animId);
            } else {
                animate();
            }
        });
    }

    /* ════════════════════════════════════════════════════════
       2. Three.js 太空人（Floating Astronaut，手機跳過）
       ════════════════════════════════════════════════════════ */

    function initAstronaut() {
        if (typeof THREE === 'undefined') {
            // Three.js 未載入 → 顯示 PNG fallback
            const fallback = document.querySelector('.hero__astronaut-fallback');
            if (fallback) fallback.style.opacity = '1';
            return;
        }
        if (IS_MOBILE) {
            const fallback = document.querySelector('.hero__astronaut-fallback');
            if (fallback) fallback.style.opacity = '1';
            return;
        }

        const canvas = document.getElementById('astronaut-canvas');
        if (!canvas) return;

        const container = canvas.parentElement;
        const W = container.clientWidth;
        const H = container.clientHeight;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
        camera.position.set(0, 0, 5);

        // 光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0x1736F5, 1.2);
        keyLight.position.set(-3, 4, 5);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xFFC709, 0.4);
        fillLight.position.set(4, -2, 3);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(0, -4, -3);
        scene.add(rimLight);

        // 太空人幾何（簡化版：球形頭盔 + 圓柱體幹 + 四肢）
        const astronautGroup = new THREE.Group();

        // 頭盔球
        const helmetGeo  = new THREE.SphereGeometry(0.52, 24, 24);
        const helmetMat  = new THREE.MeshPhongMaterial({
            color:     0x1c2a8c,
            shininess: 80,
            specular:  0x8899ff,
        });
        const helmet = new THREE.Mesh(helmetGeo, helmetMat);
        helmet.position.set(0, 1.0, 0);
        astronautGroup.add(helmet);

        // 頭盔玻璃面罩
        const visiorGeo = new THREE.SphereGeometry(0.34, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const visiorMat = new THREE.MeshPhongMaterial({
            color:       0xaaccff,
            shininess:   120,
            transparent: true,
            opacity:     0.5,
            side:        THREE.DoubleSide,
        });
        const visor = new THREE.Mesh(visiorGeo, visiorMat);
        visor.rotation.x = Math.PI * 0.1;
        visor.position.set(0, 1.0, 0.32);
        astronautGroup.add(visor);

        // 身體
        const bodyGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.95, 16);
        const bodyMat = new THREE.MeshPhongMaterial({
            color:     0xe8eaf6,
            shininess: 40,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.set(0, 0.2, 0);
        astronautGroup.add(body);

        // 背包
        const packGeo = new THREE.BoxGeometry(0.4, 0.45, 0.18);
        const packMat = new THREE.MeshPhongMaterial({ color: 0xccccdd, shininess: 20 });
        const pack = new THREE.Mesh(packGeo, packMat);
        pack.position.set(0, 0.2, -0.36);
        astronautGroup.add(pack);

        // 左右手臂
        [-0.52, 0.52].forEach((x) => {
            const armGeo = new THREE.CapsuleGeometry(0.13, 0.48, 6, 8);
            const armMat = new THREE.MeshPhongMaterial({ color: 0xe0e4f8, shininess: 30 });
            const arm    = new THREE.Mesh(armGeo, armMat);
            arm.position.set(x, 0.22, 0);
            arm.rotation.z = x > 0 ? -0.3 : 0.3;
            astronautGroup.add(arm);
        });

        // 左右腿
        [-0.22, 0.22].forEach((x) => {
            const legGeo = new THREE.CapsuleGeometry(0.14, 0.52, 6, 8);
            const legMat = new THREE.MeshPhongMaterial({ color: 0xdde1f5, shininess: 30 });
            const leg    = new THREE.Mesh(legGeo, legMat);
            leg.position.set(x, -0.53, 0);
            astronautGroup.add(leg);
        });

        // 發光腰帶裝飾
        const beltGeo = new THREE.TorusGeometry(0.38, 0.045, 8, 28);
        const beltMat = new THREE.MeshPhongMaterial({
            color:   0xFFC709,
            emissive: 0xFFC709,
            emissiveIntensity: 0.4,
        });
        const belt = new THREE.Mesh(beltGeo, beltMat);
        belt.position.set(0, -0.06, 0);
        belt.rotation.x = Math.PI / 2;
        astronautGroup.add(belt);

        astronautGroup.scale.set(0.75, 0.75, 0.75);
        scene.add(astronautGroup);

        // ── 滾動控制太空人漂移 ──
        let scrollProgress = 0;
        window.addEventListener('scroll', () => {
            const heroH = window.innerHeight;
            scrollProgress = Math.min(window.scrollY / heroH, 1);
        }, { passive: true });

        // ── 動畫循環 ──
        const clock = new THREE.Clock();
        let astAnim;
        function animateAstronaut() {
            astAnim = requestAnimationFrame(animateAstronaut);
            const t = clock.getElapsedTime();

            // 浮動
            astronautGroup.position.y  = Math.sin(t * 0.6) * 0.12;
            astronautGroup.rotation.y  = Math.sin(t * 0.25) * 0.18;
            astronautGroup.rotation.z  = Math.sin(t * 0.4) * 0.05;

            // 滾動：向右上方漂移 + 縮小
            astronautGroup.position.x  = scrollProgress * 3.5;
            astronautGroup.position.z -= scrollProgress * 0.01;
            const scale = 0.75 * (1 - scrollProgress * 0.6);
            astronautGroup.scale.set(scale, scale, scale);

            renderer.render(scene, camera);
        }
        animateAstronaut();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(astAnim);
            else animateAstronaut();
        });
    }

    /* ════════════════════════════════════════════════════════
       3. Hero GSAP 入場序列
       ════════════════════════════════════════════════════════ */

    function initHeroEntrance() {
        if (typeof gsap === 'undefined') return;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo('.hero__brand-tag',
            { opacity: 0, y: -16 },
            { opacity: 1, y: 0, duration: 0.5 },
            0
        )
        .fromTo('.hero__title .line',
            { opacity: 0, y: 40, skewY: 2 },
            { opacity: 1, y: 0, skewY: 0, duration: 0.8, stagger: 0.15 },
            0.2
        )
        .fromTo('.hero__subtitle',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7 },
            0.65
        )
        .fromTo('.hero__cta-group',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6 },
            0.85
        )
        .fromTo('.hero__scroll-hint',
            { opacity: 0 },
            { opacity: 1, duration: 0.5 },
            1.1
        )
        .fromTo('.hero__astronaut',
            { opacity: 0, x: 40 },
            { opacity: 1, x: 0, duration: 1.0 },
            0.3
        );
    }

    /* ════════════════════════════════════════════════════════
       4. ScrollTrigger — 各 Section 動畫
       ════════════════════════════════════════════════════════ */

    function initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // ── Section 2：宣言文字滑入 ──
        gsap.fromTo('.manifesto__big-text',
            { opacity: 0, x: 80 },
            {
                opacity: 1, x: 0, duration: 1.0, ease: 'power2.out',
                scrollTrigger: { trigger: '.manifesto', start: 'top 75%', toggleActions: 'play none none none' }
            }
        );

        gsap.fromTo('.manifesto__body',
            { opacity: 0, x: 60 },
            {
                opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: 'power2.out',
                scrollTrigger: { trigger: '.manifesto', start: 'top 70%', toggleActions: 'play none none none' }
            }
        );

        // ── Section 3：Bento 卡片錯開進場 ──
        const cards = document.querySelectorAll('.bento-grid .card');
        gsap.fromTo(cards,
            { opacity: 0, y: 36, scale: 0.96 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 0.65,
                stagger: 0.10,
                ease: 'power2.out',
                scrollTrigger: { trigger: '.bento-grid', start: 'top 80%', toggleActions: 'play none none none' }
            }
        );

        // ── Section 4：品牌故事 ──
        gsap.fromTo('.brand-preview__left .big-label',
            { opacity: 0, x: -50 },
            {
                opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
                scrollTrigger: { trigger: '.brand-preview', start: 'top 78%', toggleActions: 'play none none none' }
            }
        );

        gsap.fromTo('.brand-preview__right',
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0, duration: 0.8, delay: 0.15, ease: 'power2.out',
                scrollTrigger: { trigger: '.brand-preview', start: 'top 75%', toggleActions: 'play none none none' }
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
       5. 初始化
       ════════════════════════════════════════════════════════ */

    document.addEventListener('DOMContentLoaded', function () {
        initStarfield();
        initAstronaut();
        initHeroEntrance();
        initScrollAnimations();
    });

})();
