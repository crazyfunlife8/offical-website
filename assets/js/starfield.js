/* ============================================================
   starfield.js — Three.js 黑洞漩渦星場（全站共用）
   創巢數位 Nest Digital | 2026-05-12 從 pages/index.js initStarfield 抽出
   功能：所有頁面共用黑洞動畫；手機降階參數（粒子 6500→2000、pixelRatio 1.5→1.0）
   依賴：Three.js（CDN，由 nav.js 動態 load）、<canvas id="starfield-canvas">
        （由 nav.js 注入）、body.has-threejs class（由 nav.js 加）
   ============================================================ */

(function () {
    'use strict';

    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;

    // DESIGN_MODE 從 pages/index.js 繼承固定 false（現役紀律：星場永遠動態）
    const DESIGN_MODE = false;

    // 真實手機裝置檢測（page-load 一次性拍板）
    // hover:none + pointer:coarse = 觸控主導裝置（手機 / 平板）；桌機縮窗不會誤觸發
    // 2026-05-11 起手機跑「降階版 Three.js」（粒子 6500→2000、pixelRatio 1.5→1.0）
    // 而非 fallback 到 CSS 星空——手機與桌機共用同一套黑洞漩渦動態語言
    const IS_TOUCH_DEVICE = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    /* ── 黑洞漩渦星場 ──────────────────────────────────────────
       概念：主視覺中心是黑洞深淵，所有星辰以螺旋軌跡被吸入
       技術：極座標系 (r, θ) 每幀更新 → 轉為 XY 位置
             sizeAttenuation：近心熾熱大星 / 遠處細密小星
    ═════════════════════════════════════════════════════════ */

    // DESIGN_MODE：preserveDrawingBuffer: true，讓單幀星場永久保留在緩衝區
    // （否則 WebGL 在 composite 後清空 buffer，畫面會變全黑）
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        preserveDrawingBuffer: DESIGN_MODE,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_TOUCH_DEVICE ? 1.0 : 1.5));
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

    // 黑洞虛空斜帶由 #css-starfield::before 統一處理（base.css，全站共用）

    // ── 動態螺旋星場（ShaderMaterial → per-vertex 可變大小）──

    const COUNT    = IS_TOUCH_DEVICE ? 2000 : 6500;
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
        starData[i4 + 2] = (Math.random() - 0.5) * 0.22;
        const u = Math.random();
        const sz = u < 0.55 ? 0.002 + Math.random() * 0.003
                 : u < 0.82 ? 0.005 + Math.random() * 0.007
                 : u < 0.96 ? 0.013 + Math.random() * 0.010
                 :            0.026 + Math.random() * 0.014;
        starData[i4 + 3] = sz;
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

    const BG_N  = IS_TOUCH_DEVICE ? 600 : 1800;
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

    // ── 星際塵埃暗霧層 ──

    const DUST_N   = IS_TOUCH_DEVICE ? 800 : 2800;
    const dustGeo  = new THREE.BufferGeometry();
    const dustPos  = new Float32Array(DUST_N * 3);
    const dustCol  = new Float32Array(DUST_N * 3);
    const dustSize = new Float32Array(DUST_N);

    for (let d = 0; d < DUST_N; d++) {
        const d3 = d * 3;
        const rD = Math.sqrt(R_MIN*R_MIN + Math.random() * (5.2*5.2 - R_MIN*R_MIN));
        const armD   = Math.floor(Math.random() * 2) * Math.PI + TILT;
        const sprdD  = (Math.random() - 0.5) * (Math.random() < 0.7 ? 0.55 : Math.PI * 2);
        const thetaD = armD - Math.log(rD + 0.1) * SPIRAL_K * 3.5 + sprdD;

        const aD = rD, bD = rD * 0.38;
        const pxD = aD * Math.cos(thetaD);
        const pyD = bD * Math.sin(thetaD);
        dustPos[d3]   = pxD * COS_T - pyD * SIN_T;
        dustPos[d3+1] = pxD * SIN_T + pyD * COS_T;
        dustPos[d3+2] = (Math.random() - 0.5) * 0.55;

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

    // ── 動畫循環 ──

    // 四色群角速度（開普勒差速，內圈 ~20s 一圈，外圈 ~6min）
    const ROT_BY_TYPE = [0.00060, 0.00032, 0.00017, 0.000075];
    const BASE_PULL   = 0.000010;

    // 預熱模擬：快轉讓差速旋轉充分剪切成自然形態（手機減半避免阻塞）
    const WARMUP_FRAMES = IS_TOUCH_DEVICE ? 2000 : 6000;
    (function warmup() {
        for (let w = 0; w < WARMUP_FRAMES; w++) {
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

    let animId = 0;
    let running = false;

    function stopLoop() {
        if (animId) {
            cancelAnimationFrame(animId);
            animId = 0;
        }
        running = false;
    }

    function animate() {
        if (!running) return;
        if (!DESIGN_MODE) animId = requestAnimationFrame(animate);
        const t = Date.now() * 0.001;

        for (let i = 0; i < COUNT; i++) {
            const i3 = i * 3, i4 = i * 4;
            let r     = starData[i4];
            let theta = starData[i4 + 1];
            const zOff = starData[i4 + 2];
            const bSz  = starData[i4 + 3];

            const gravBoost = r < 1.0 ? 1 + Math.pow(1 - r, 2) * 3.0 : 1.0;

            theta += ROT_BY_TYPE[starType[i]] / Math.sqrt(r + 0.04) * gravBoost;
            r     -= BASE_PULL / (r * r + 0.06) * gravBoost;

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

            const a  = r, b = r * 0.38;
            const fa = 0.005 * Math.sqrt(r);
            const px = a*Math.cos(theta) + Math.sin(t*0.18 + i*0.19)*fa;
            const py = b*Math.sin(theta) + Math.cos(t*0.13 + i*0.25)*fa;
            positions[i3]   = px*COS_T - py*SIN_T;
            positions[i3+1] = px*SIN_T + py*COS_T;
            positions[i3+2] = zOff;

            const heatCore = r < 1.2 ? Math.max(0, (1.2 - r) / 0.78) : 0;
            const normR    = Math.max(0, Math.min(1, (r - 0.42) / 5.08));
            let cr, cg, cb;
            if (normR < 0.20) {
                cr = 0.75 + normR * 1.25;
                cg = 0.85 + normR * 0.75;
                cb = 1.00;
            } else if (normR < 0.50) {
                const f = (normR - 0.20) / 0.30;
                cr = 1.00; cg = 1.00 - f * 0.12; cb = 1.00 - f * 0.45;
            } else {
                const f = (normR - 0.50) / 0.50;
                cr = 1.00 - f * 0.35;
                cg = 0.88 - f * 0.23;
                cb = 0.55 + f * 0.45;
            }
            cr = Math.min(1, cr + heatCore * (1 - cr) * 0.85);
            cg = Math.min(1, cg + heatCore * (1 - cg) * 0.85);
            cb = Math.min(1, cb + heatCore * (1 - cb) * 0.55);
            const depthDim = 0.88 + 0.12 * ((zOff + 0.11) / 0.22);
            cr *= depthDim; cg *= depthDim; cb *= depthDim;

            const orbitalBright = normR < 0.30 ? 1.0 : 1.0 - (normR - 0.30) * 0.55;
            const bright = orbitalBright * starBright[i];
            cr *= bright; cg *= bright; cb *= bright;

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
        dustPoints.rotation.z += 0.000022;

        renderer.render(scene, camera);
    }

    function startLoop() {
        if (running || document.hidden) return;
        running = true;
        animate();
    }

    startLoop();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopLoop();
        else startLoop();
    });
})();
