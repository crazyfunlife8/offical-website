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

    // matchMedia 取代靜態寬度快照，let 允許 resize 時更新
    const mobileQuery = window.matchMedia('(max-width: 900px)');
    let IS_MOBILE     = mobileQuery.matches;
    mobileQuery.addEventListener('change', (e) => { IS_MOBILE = e.matches; });

    /* ════════════════════════════════════════════════════════
       1. Three.js 星空粒子場（全站 canvas，手機跳過）
       ════════════════════════════════════════════════════════ */

    function initStarfield() {
        if (typeof THREE === 'undefined') return;
        if (IS_MOBILE) return;
        /* ── 黑洞漩渦星場 ──────────────────────────────────────────
           概念：主視覺中心是黑洞深淵，所有星辰以螺旋軌跡被吸入
           技術：極座標系 (r, θ) 每幀更新 → 轉為 XY 位置
                 sizeAttenuation：近心熾熱大星 / 遠處細密小星
                 滾動加速：旋轉 ×17、拉力 ×60
        ═════════════════════════════════════════════════════════ */

        const canvas = document.getElementById('starfield-canvas');
        if (!canvas) return;

        // DESIGN_MODE：preserveDrawingBuffer: true，讓單幀星場永久保留在緩衝區
        // （否則 WebGL 在 composite 後清空 buffer，畫面會變全黑）
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false,
            preserveDrawingBuffer: DESIGN_MODE,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.sortObjects = false;

        const scene  = new THREE.Scene();
        // 鏡頭正面朝向 z=0 平面（黑洞所在面），FOV 50°
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 4;

        // ── 紋理工具 ──────────────────────────────────────────────

        function makeStarTex() {
            const sz = 32, cv = document.createElement('canvas');
            cv.width = cv.height = sz;
            const ctx = cv.getContext('2d');
            const g = ctx.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);
            g.addColorStop(0,    'rgba(255,255,255,1.0)');
            g.addColorStop(0.12, 'rgba(255,255,255,0.85)');
            g.addColorStop(0.45, 'rgba(255,255,255,0.12)');
            g.addColorStop(1.0,  'rgba(255,255,255,0.0)');
            ctx.fillStyle = g; ctx.fillRect(0,0,sz,sz);
            return new THREE.CanvasTexture(cv);
        }

        // 黑洞虛空已改由 CSS #blackhole 處理（radial-gradient，無色階問題）

        // ── 動態螺旋星場（ShaderMaterial → per-vertex 可變大小）──

        const COUNT    = 6500;
        const R_MIN    = 0.42;         // 事件視界半徑
        const SPIRAL_K = 0.42;
        const TILT     = Math.PI / 12;  // +15°，與 CSS 斜帶同向
        const COS_T = Math.cos(TILT), SIN_T = Math.sin(TILT); // 預先計算，全函式共用

        // 四色群各自的軌道帶 [rMin, rMax]
        // 內圈熾熱金 → 外圈冷白，色彩即深度語言
        const ORBITAL_BANDS = [
            [0.42, 2.0],  // 琥珀金 15%：最近深淵
            [1.2,  3.0],  // 青藍   15%：中內層
            [1.8,  4.0],  // 紫羅蘭 30%：中層
            [2.5,  5.5],  // 純白   40%：最遠外圍
        ];

        // starData[i*4] = [ r, theta, zOffset, baseSize ]
        const starData  = new Float32Array(COUNT * 4);
        // starType: 0=琥珀金 1=青藍 2=紫羅蘭 3=純白
        const starType   = new Uint8Array(COUNT);
        // starBright：每顆星的本質亮度係數（冪次分布，固定不變）
        const starBright = new Float32Array(COUNT);
        const positions = new Float32Array(COUNT * 3);
        const aColors   = new Float32Array(COUNT * 3);
        const aSizes    = new Float32Array(COUNT);

        function spawnStar(i) {
            const i4 = i * 4;
            // 先定色群，再從該群的軌道帶取 r（色彩 = 軌道位置）
            const tr   = Math.random();
            const type = tr < 0.15 ? 0 : tr < 0.30 ? 1 : tr < 0.60 ? 2 : 3;
            starType[i] = type;
            const [rMin, rMax] = ORBITAL_BANDS[type];
            const r = Math.sqrt(rMin*rMin + Math.random()*(rMax*rMax - rMin*rMin));

            // 螺旋臂：95% 緊貼臂線（清晰光流），5% 漫散星際塵
            let theta;
            if (Math.random() < 0.95) {
                const arm    = Math.floor(Math.random() * 2) * Math.PI + TILT;
                const spread = (Math.random() - 0.5) * 0.08; // 極窄臂寬 → 清晰光流線
                theta = arm - Math.log(r + 0.1) * SPIRAL_K * 3.5 + spread;
            } else {
                theta = Math.random() * Math.PI * 2;
            }
            starData[i4]     = r;
            starData[i4 + 1] = theta;
            starData[i4 + 2] = (Math.random() - 0.5) * 0.22;  // z 微深度（保留臂結構）
            // 冪次分布：55% 微塵 / 27% 小星 / 14% 中星 / 4% 亮星錨點
            const u = Math.random();
            const sz = u < 0.55 ? 0.002 + Math.random() * 0.003
                     : u < 0.82 ? 0.005 + Math.random() * 0.007
                     : u < 0.96 ? 0.013 + Math.random() * 0.010
                     :            0.026 + Math.random() * 0.014;
            starData[i4 + 3] = sz;
            // B：本質亮度（固定冪次分布，決定這顆星的自身發光強度）
            // 58% 超暗微塵 → 25% 中暗 → 14% 中等 → 3% 亮錨點
            const bv = Math.random();
            starBright[i] = bv < 0.58 ? 0.08 + Math.random() * 0.20
                          : bv < 0.83 ? 0.32 + Math.random() * 0.26
                          : bv < 0.97 ? 0.62 + Math.random() * 0.23
                          :              0.88 + Math.random() * 0.12;
        }
        for (let i = 0; i < COUNT; i++) spawnStar(i);

        const geo      = new THREE.BufferGeometry();
        const posAttr  = new THREE.BufferAttribute(positions, 3);
        const colAttr  = new THREE.BufferAttribute(aColors,   3);
        const szAttr   = new THREE.BufferAttribute(aSizes,    1);
        posAttr.setUsage(THREE.DynamicDrawUsage);
        colAttr.setUsage(THREE.DynamicDrawUsage);
        szAttr.setUsage(THREE.DynamicDrawUsage);
        geo.setAttribute('position', posAttr);
        geo.setAttribute('aColor',   colAttr);
        geo.setAttribute('aSize',    szAttr);

        // ShaderMaterial：vertex 讀取 aSize → gl_PointSize（px）
        // 320.0 / abs(mvPos.z) ≈ 320/4 = 80，world 0.05 ≈ 4px
        const starMat = new THREE.ShaderMaterial({
            uniforms: { uTex: { value: makeStarTex() } },
            vertexShader: `
                attribute float aSize;
                attribute vec3  aColor;
                varying   vec3  vColor;
                void main() {
                    vColor = aColor;
                    vec4 mv = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = aSize * (320.0 / -mv.z);
                    gl_Position  = projectionMatrix * mv;
                }
            `,
            fragmentShader: `
                uniform sampler2D uTex;
                varying vec3 vColor;
                void main() {
                    vec4 t = texture2D(uTex, gl_PointCoord);
                    gl_FragColor = vec4(vColor, t.r * 0.93);
                }
            `,
            transparent: true,
            blending:    THREE.AdditiveBlending,
            depthTest:   false,
            depthWrite:  false,
        });

        const starPoints = new THREE.Points(geo, starMat);
        starPoints.renderOrder = 1;
        scene.add(starPoints);

        // ── 靜態背景星塵（固定像素大小，提供全畫面深邃基底）──

        const BG_N  = 1800;
        const bgGeo = new THREE.BufferGeometry();
        const bgPos = new Float32Array(BG_N * 3);
        const bgCol = new Float32Array(BG_N * 3);
        for (let i = 0; i < BG_N; i++) {
            const i3 = i * 3;
            const t2 = Math.random() * Math.PI * 2;
            const ph = Math.acos(2*Math.random()-1);
            const r  = 4 + Math.random() * 10;
            bgPos[i3]   = r*Math.sin(ph)*Math.cos(t2);
            bgPos[i3+1] = r*Math.sin(ph)*Math.sin(t2);
            bgPos[i3+2] = r*Math.cos(ph);
            const rnd = Math.random();
            if      (rnd < 0.06)  { bgCol[i3]=1.0; bgCol[i3+1]=0.88; bgCol[i3+2]=0.5;  }
            else if (rnd < 0.16)  { bgCol[i3]=0.5; bgCol[i3+1]=0.65; bgCol[i3+2]=1.0;  }
            else { const b=0.55+Math.random()*0.45; bgCol[i3]=b; bgCol[i3+1]=b; bgCol[i3+2]=b; }
        }
        bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
        bgGeo.setAttribute('color',    new THREE.BufferAttribute(bgCol, 3));
        const bgStars = new THREE.Points(bgGeo, new THREE.PointsMaterial({
            size: 0.45, map: makeStarTex(), vertexColors: true,
            transparent: true, opacity: 0.60,
            sizeAttenuation: false,
            blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false,
        }));
        bgStars.renderOrder = 0;
        scene.add(bgStars);

        // ── 星際塵埃暗霧層（獨立 Points，整體旋轉，幾乎零 CPU 額外負擔）──
        // 與主粒子相同螺旋臂結構，但 spread 更寬（霧感）、亮度極低（0.03–0.14）
        // 不做逐粒子軌道計算，用 group.rotation 慢轉，視覺上暈染臂的厚度

        const DUST_N   = 2800;
        const dustGeo  = new THREE.BufferGeometry();
        const dustPos  = new Float32Array(DUST_N * 3);
        const dustCol  = new Float32Array(DUST_N * 3);
        const dustSize = new Float32Array(DUST_N);

        for (let d = 0; d < DUST_N; d++) {
            const d3 = d * 3;
            // 與主粒子相同的 r 全域分布（平方根均勻取樣）
            const rD = Math.sqrt(R_MIN*R_MIN + Math.random() * (5.2*5.2 - R_MIN*R_MIN));
            // 臂走向相同，但 spread 更寬 → 臂暈染
            const armD   = Math.floor(Math.random() * 2) * Math.PI + TILT;
            const sprdD  = (Math.random() - 0.5) * (Math.random() < 0.7 ? 0.55 : Math.PI * 2);
            const thetaD = armD - Math.log(rD + 0.1) * SPIRAL_K * 3.5 + sprdD;

            // 橢圓投影（與主粒子一致）
            const aD = rD, bD = rD * 0.38;
            const pxD = aD * Math.cos(thetaD);
            const pyD = bD * Math.sin(thetaD);
            dustPos[d3]   = pxD * COS_T - pyD * SIN_T;
            dustPos[d3+1] = pxD * SIN_T + pyD * COS_T;
            dustPos[d3+2] = (Math.random() - 0.5) * 0.55;  // z 比主粒子寬，增加立體厚度

            // 極暗色彩（同色溫但亮度壓到 0.03–0.14）
            const bright = 0.03 + Math.random() * 0.11;
            const nrD = Math.max(0, Math.min(1, (rD - 0.42) / 5.08));
            let dr, dg, db;
            if (nrD < 0.20) {
                dr = 0.75 + nrD * 1.25; dg = 0.85 + nrD * 0.75; db = 1.00;
            } else if (nrD < 0.50) {
                const f = (nrD - 0.20) / 0.30;
                dr = 1.00; dg = 1.00 - f * 0.12; db = 1.00 - f * 0.45;
            } else {
                const f = (nrD - 0.50) / 0.50;
                dr = 1.00 - f * 0.35; dg = 0.88 - f * 0.23; db = 0.55 + f * 0.45;
            }
            dustCol[d3]   = dr * bright;
            dustCol[d3+1] = dg * bright;
            dustCol[d3+2] = db * bright;

            // 大小：比最小主粒子略大（霧感光暈），尺寸隨機以避免一致感
            dustSize[d] = 0.004 + Math.random() * 0.012;
        }

        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        dustGeo.setAttribute('aColor',   new THREE.BufferAttribute(dustCol, 3));
        dustGeo.setAttribute('aSize',    new THREE.BufferAttribute(dustSize, 1));

        const dustMat = new THREE.ShaderMaterial({
            uniforms: { uTex: { value: makeStarTex() } },
            vertexShader: `
                attribute float aSize;
                attribute vec3  aColor;
                varying   vec3  vColor;
                void main() {
                    vColor = aColor;
                    vec4 mv = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = aSize * (320.0 / -mv.z);
                    gl_Position  = projectionMatrix * mv;
                }
            `,
            fragmentShader: `
                uniform sampler2D uTex;
                varying vec3 vColor;
                void main() {
                    vec4 t = texture2D(uTex, gl_PointCoord);
                    gl_FragColor = vec4(vColor, t.r * 0.80);
                }
            `,
            transparent: true,
            blending:  THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
        });

        const dustPoints = new THREE.Points(dustGeo, dustMat);
        dustPoints.renderOrder = 0;
        scene.add(dustPoints);

        // ── 動畫循環 ──────────────────────────────────────────────

        // 四色群角速度（開普勒差速，內圈 ~20s 一圈，外圈 ~6min）
        const ROT_BY_TYPE = [0.00060, 0.00032, 0.00017, 0.000075];
        const BASE_PULL   = 0.000010;

        // 預熱模擬：快轉 6000 幀讓差速旋轉充分剪切成自然形態
        (function warmup() {
            for (let w = 0; w < 6000; w++) {
                for (let i = 0; i < COUNT; i++) {
                    const i4 = i * 4;
                    let r = starData[i4], theta = starData[i4 + 1];
                    const gravBoost = r < 1.0 ? 1 + Math.pow(1 - r, 2) * 3.0 : 1.0;
                    theta += ROT_BY_TYPE[starType[i]] / Math.sqrt(r + 0.04) * gravBoost;
                    r     -= BASE_PULL / (r * r + 0.06) * gravBoost;
                    if (r <= R_MIN) { spawnStar(i); continue; }
                    starData[i4]     = r;
                    starData[i4 + 1] = theta;
                }
            }
        })();

        let animId;
        function animate() {
            // DESIGN_MODE：warmup 後只 render 一幀（星場位置 = 差速剪切後的定格），不進 RAF
            if (!DESIGN_MODE) animId = requestAnimationFrame(animate);
            const t = Date.now() * 0.001;

            for (let i = 0; i < COUNT; i++) {
                const i3 = i * 3, i4 = i * 4;
                let r     = starData[i4];
                let theta = starData[i4 + 1];
                const zOff = starData[i4 + 2];
                const bSz  = starData[i4 + 3];

                // 臨界加速：r < 1.0 時引力急速增強，製造被吞噬前的最後衝刺
                const gravBoost = r < 1.0 ? 1 + Math.pow(1 - r, 2) * 3.0 : 1.0;

                // 開普勒差速（ω ∝ 1/√r）+ 臨界加速
                theta += ROT_BY_TYPE[starType[i]] / Math.sqrt(r + 0.04) * gravBoost;
                r     -= BASE_PULL / (r * r + 0.06) * gravBoost;

                // 超過事件視界 → 重生在自己的軌道帶
                if (r <= R_MIN) {
                    spawnStar(i);
                    const nr = starData[i4], nt = starData[i4+1];
                    const ea = nr, eb = nr * 0.38;
                    const px = ea*Math.cos(nt), py = eb*Math.sin(nt);
                    positions[i3]   = px*COS_T - py*SIN_T;
                    positions[i3+1] = px*SIN_T + py*COS_T;
                    positions[i3+2] = starData[i4+2];
                    continue;
                }
                starData[i4]     = r;
                starData[i4 + 1] = theta;

                // 橢圓軌道投影（長軸:短軸 = 2.6:1，傾斜 TILT = -15°，強烈盤面感）
                const a  = r, b = r * 0.38;
                const fa = 0.005 * Math.sqrt(r); // 極緩微飄
                const px = a*Math.cos(theta) + Math.sin(t*0.18 + i*0.19)*fa;
                const py = b*Math.sin(theta) + Math.cos(t*0.13 + i*0.25)*fa;
                positions[i3]   = px*COS_T - py*SIN_T;
                positions[i3+1] = px*SIN_T + py*COS_T;
                positions[i3+2] = zOff;

                // 連續色溫：依實際 r 決定，由暖到冷的線性插值
                const heatCore = r < 1.2 ? Math.max(0, (1.2 - r) / 0.78) : 0;
                const normR    = Math.max(0, Math.min(1, (r - 0.42) / 5.08));
                let cr, cg, cb;
                if (normR < 0.20) {
                    // 超熱核區：藍白（r ≈ 0.42 ~ 1.4）
                    cr = 0.75 + normR * 1.25;
                    cg = 0.85 + normR * 0.75;
                    cb = 1.00;
                } else if (normR < 0.50) {
                    // 過渡：純白 → 暖白（r ≈ 1.4 ~ 3.0）
                    const f = (normR - 0.20) / 0.30;
                    cr = 1.00; cg = 1.00 - f * 0.12; cb = 1.00 - f * 0.45;
                } else {
                    // 外圈：琥珀金 → 冷藍白（r ≈ 3.0 ~ 5.5）
                    const f = (normR - 0.50) / 0.50;
                    cr = 1.00 - f * 0.35;
                    cg = 0.88 - f * 0.23;
                    cb = 0.55 + f * 0.45;
                }
                // 事件視界白熾（近心強推向純白）
                cr = Math.min(1, cr + heatCore * (1 - cr) * 0.85);
                cg = Math.min(1, cg + heatCore * (1 - cg) * 0.85);
                cb = Math.min(1, cb + heatCore * (1 - cb) * 0.55);
                // 深度亮度：前景星（zOff > 0）略亮，背景星略暗
                const depthDim = 0.88 + 0.12 * ((zOff + 0.11) / 0.22);
                cr *= depthDim; cg *= depthDim; cb *= depthDim;

                // A×B 亮度系統：軌道亮度（A）× 本質亮度（B）→ 層次感
                // A：外圈漸暗（normR > 0.30 開始衰減），內圈維持全亮
                const orbitalBright = normR < 0.30 ? 1.0 : 1.0 - (normR - 0.30) * 0.55;
                // B：本質亮度（spawnStar 賦值，每顆固定）
                const bright = orbitalBright * starBright[i];
                cr *= bright; cg *= bright; cb *= bright;

                // 中等以上亮星微閃爍（正弦呼吸，讓星辰有「活著」的質感）
                const twinkle = bSz > 0.013
                    ? 0.72 + 0.28 * Math.sin(t * (1.1 + i * 0.006) + i * 2.3)
                    : 1.0;
                aColors[i3]   = cr * twinkle;
                aColors[i3+1] = cg * twinkle;
                aColors[i3+2] = cb * twinkle;
                aSizes[i] = bSz * (0.75 + heatCore * 2.5);
            }

            posAttr.needsUpdate = true;
            colAttr.needsUpdate = true;
            szAttr.needsUpdate  = true;

            bgStars.rotation.y  += 0.000009;
            // 塵埃層整體緩轉（比最外圈主粒子稍慢，製造細微視差）
            dustPoints.rotation.z += 0.000022;

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(animId);
            else animate();
        });
    }

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
        // Three.js 未載入時移除 has-threejs class，讓 CSS 星空 fallback 正常顯示
        if (typeof THREE === 'undefined') {
            document.body.classList.remove('has-threejs');
        }

        // L1 環境動畫（設計模式保留，屬於靜態視覺一部分）
        try { initStarfield(); } catch(e) { console.warn('[index.js] initStarfield failed:', e); }

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

        // 太空人隨機漂移（Beat 04）
        try { initFooterAstronautDrift(); } catch(e) { console.warn('[index.js] footer astronaut drift failed:', e); }
    }

    // ═══════════════════════════════════════════════════════════
    // 太空人 ScrollTrigger 偵序列（2026-05-07 PoC）
    // ─────────────────────────────────────────────────────────
    // 預載 72 張 raw PNG 偵到 Image 物件 → 捲動 Hero → Manifesto
    // 期間驅動 canvas drawImage 切偵 → Manifesto 結束後淡出。
    // ═══════════════════════════════════════════════════════════
    function initAstronautScroll() {
        // 來源：72 Kling 真實偵 → RIFE v4.6 補偵 144 → 使用者手動逐張去背 → 截尾刪除 134-144（角色已離場無內容）→ 512px WebP
        // 邊緣品質：手工精修勝過所有 AI 自動工具
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
    // Beat 04 太空人隨機漂移（2026-05-08）
    // ─────────────────────────────────────────────────────────
    // 從畫面外左 / 右隨機進入、慢速漂移到對側、loop。從左進入時水平
    // 翻轉影片，讓頭盔永遠處於前進方向的前方（領頭追逐感）。
    // ═══════════════════════════════════════════════════════════
    function initFooterAstronautDrift() {
        const wrapper = document.querySelector('.footer-astronaut');
        if (!wrapper || typeof gsap === 'undefined') return;

        // 影片播放速度：1.0 = user 後製影片本身的原速
        const video = wrapper.querySelector('video');
        if (video) {
            video.playbackRate = 1.0;
            video.addEventListener('loadedmetadata', () => {
                video.playbackRate = 1.0;
            });
        }

        // 漂移時長範圍（單個 cycle 從畫面外漂到另一側畫面外的秒數）
        const MIN_DURATION = 15;
        const MAX_DURATION = 22;

        // 出現間隔範圍：cycle 之間的延遲（0 = 離場後立即從另一邊進場、無間隔）
        const MIN_INTERVAL = 0;
        const MAX_INTERVAL = 0;

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
                onComplete: () => {
                    // cycle 之間隨機間隔 2-5 秒：太空人在畫面外、製造「停留後才出現」感
                    const interval = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
                    setTimeout(runCycle, interval * 1000);
                },
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
