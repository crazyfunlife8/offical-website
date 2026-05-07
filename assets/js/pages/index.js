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
            // DESIGN_MODE：render 一幀後停住（太空人停在初始位置）
            if (!DESIGN_MODE) astAnim = requestAnimationFrame(animateAstronaut);
            const t = clock.getElapsedTime();

            // 浮動 + 滾動向上漂移（合併 y 軸，避免互相覆蓋）
            astronautGroup.position.y  = Math.sin(t * 0.6) * 0.12 + scrollProgress * 1.8;
            astronautGroup.rotation.y  = Math.sin(t * 0.25) * 0.18;
            astronautGroup.rotation.z  = Math.sin(t * 0.4) * 0.05;

            // 滾動：向右漂移 + 向後退 + 縮小
            astronautGroup.position.x  = scrollProgress * 3.5;
            astronautGroup.position.z  = -scrollProgress * 0.5;  // 用 = 避免累積
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
        .fromTo('.hero__astronaut',
            { opacity: 0, x: 40 },
            { opacity: IS_MOBILE ? 0.18 : 1, x: 0, duration: 1.0 },
            0.15
        )

        // ── 副標題進場序列 ──
        // 保留容器 fade-in 與文字推出（::after 暗橢圓背景靜態存在，無需動畫）

        // 副標容器先 fade-in
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
       5. ScrollTrigger — 各 Section 動畫
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
        // 不用 y/scale 因為：
        //  (1) initConstellation 用 getBoundingClientRect 計算卡片中心畫連線，
        //      若進場用 transform 偏移，初始計算位置錯位、ScrollTrigger 觸發後連線跟卡片中心對不齊
        //  (2) GSAP 動畫結束會保留 inline transform，CSS .card:hover { translateY(-4px) }
        //      無 !important 會被 inline 覆蓋、hover 時卡片不會上移
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
       6. （已退役）星座連線 — 2026-05-07 創辦人決定不要連線視覺
       ════════════════════════════════════════════════════════ */




    /* ════════════════════════════════════════════════════════
       8. 軌道環 DOM 注入（Hero 太空人外圍）
       ════════════════════════════════════════════════════════ */

    function initOrbitRings() {
        if (IS_MOBILE) return;

        const astronaut = document.querySelector('.hero__astronaut');
        if (!astronaut) return;
        if (astronaut.querySelector('.hero__orbits')) return;

        const svgNS = 'http://www.w3.org/2000/svg';

        // 建立容器
        const orbits = document.createElement('div');
        orbits.className = 'hero__orbits';
        orbits.setAttribute('aria-hidden', 'true');

        // 外環：傾斜 12°
        const outer = document.createElement('div');
        outer.className = 'hero__orbit hero__orbit--outer';
        const outerSvg = document.createElementNS(svgNS, 'svg');
        outerSvg.setAttribute('viewBox', '-100 -100 200 200');
        outerSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        const outerEllipse = document.createElementNS(svgNS, 'ellipse');
        outerEllipse.setAttribute('cx', '0');
        outerEllipse.setAttribute('cy', '0');
        outerEllipse.setAttribute('rx', '95');
        outerEllipse.setAttribute('ry', '38');
        outerEllipse.setAttribute('transform', 'rotate(12)');
        outerSvg.appendChild(outerEllipse);
        outer.appendChild(outerSvg);

        // 內環：反向 -18°，虛線
        const inner = document.createElement('div');
        inner.className = 'hero__orbit hero__orbit--inner';
        const innerSvg = document.createElementNS(svgNS, 'svg');
        innerSvg.setAttribute('viewBox', '-100 -100 200 200');
        innerSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        const innerEllipse = document.createElementNS(svgNS, 'ellipse');
        innerEllipse.setAttribute('cx', '0');
        innerEllipse.setAttribute('cy', '0');
        innerEllipse.setAttribute('rx', '72');
        innerEllipse.setAttribute('ry', '26');
        innerEllipse.setAttribute('transform', 'rotate(-18)');
        innerSvg.appendChild(innerEllipse);
        inner.appendChild(innerSvg);

        orbits.appendChild(outer);
        orbits.appendChild(inner);
        astronaut.insertBefore(orbits, astronaut.firstChild);
    }


    /* ════════════════════════════════════════════════════════
       10. 初始化
       ════════════════════════════════════════════════════════ */

    // readyState 防禦：若 DOMContentLoaded 已在 script 執行前觸發，直接執行
    function init() {
        // Three.js 未載入時移除 has-threejs class，讓 CSS 星空 fallback 正常顯示
        if (typeof THREE === 'undefined') {
            document.body.classList.remove('has-threejs');
        }

        // L1 環境動畫（設計模式保留，屬於靜態視覺一部分）
        try { initStarfield(); } catch(e) { console.warn('[index.js] initStarfield failed:', e); }
        try {
            initAstronaut();
        } catch(e) {
            console.warn('[index.js] initAstronaut failed, showing fallback:', e);
            const fallback = document.querySelector('.hero__astronaut-fallback');
            if (fallback) fallback.style.opacity = '1';
        }

        // DESIGN_MODE：凍結 L2（進場）+ L3（捲動驅動），加 body class 讓 CSS 提供救援
        if (DESIGN_MODE) {
            document.body.classList.add('design-mode');
            console.info('[index.js] DESIGN_MODE on — L2/L3 animations skipped');
            return;
        }

        initHeroEntrance();
        initScrollAnimations();

        // ─── 額外裝飾元素（2026-04-18，原「觀測儀」框架已棄用）───
        // 軌道環：2026-04-18 使用者回饋「多餘」，停用；程式保留供未來評估
        // try { initOrbitRings(); }  catch(e) { console.warn('[index.js] orbits failed:', e); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
