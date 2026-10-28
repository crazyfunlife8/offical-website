// 創巢星系：Q 版太空人風格的 3D 首頁
// 服務＝星球、作品＝衛星、中央是創巢基地。點星球 → 鏡頭飛過去、左邊面板顯示介紹
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PLANETS, BASE, CUSTOMERS } from './planets.js';

const $ = (id) => document.getElementById(id);
const isTouch = matchMedia('(pointer: coarse)').matches;
const small = Math.min(innerWidth, innerHeight) < 700;

// ---------- 沒有 3D 就退回清單 ----------
function webglOK() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
if (!webglOK()) { document.body.classList.add('no3d'); throw new Error('no webgl'); }

// ---------- 基本盤 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
if (isTouch) renderer.capabilities.maxTextureSize = Math.min(renderer.capabilities.maxTextureSize, 1024);
$('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050d2e, 0.006);
const camera = new THREE.PerspectiveCamera(small ? 52 : 42, innerWidth / innerHeight, 0.1, 900);
const HOME_POS = new THREE.Vector3(0, small ? 70 : 52, small ? 118 : 96);
camera.position.copy(HOME_POS);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.07;
controls.minDistance = 8; controls.maxDistance = 190;
controls.maxPolarAngle = Math.PI * 0.82; controls.enablePan = false;
controls.autoRotate = true; controls.autoRotateSpeed = 0.25;
controls.target.set(0, 0, 0);

// 燈：柔和的星光＋一盞暖色主光
scene.add(new THREE.HemisphereLight(0xbfd2ff, 0x0b1a4a, 1.25));
const sun = new THREE.DirectionalLight(0xffe2c4, 2.4); sun.position.set(40, 60, 30); scene.add(sun);
const rim = new THREE.DirectionalLight(0x8fb6ff, 1.1); rim.position.set(-50, 20, -40); scene.add(rim);

// ---------- 背景：漸層夜空、星星、星雲 ----------
{
  const c = document.createElement('canvas'); c.width = 16; c.height = 512;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#02040f'); gr.addColorStop(0.45, '#050d2e'); gr.addColorStop(0.75, '#0a1550'); gr.addColorStop(1, '#12235e');
  g.fillStyle = gr; g.fillRect(0, 0, 16, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false }));
  scene.add(sky);
}
const STAR_N = isTouch ? 1400 : 2600;
{
  const p = new Float32Array(STAR_N * 3), col = new Float32Array(STAR_N * 3), cl = new THREE.Color();
  for (let i = 0; i < STAR_N; i++) {
    const r = 250 + Math.random() * 300, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    p[i * 3] = r * Math.sin(ph) * Math.cos(th); p[i * 3 + 1] = r * Math.cos(ph); p[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    cl.setHSL(Math.random() < 0.78 ? 0.56 : 0.13, 0.55, 0.78 + Math.random() * 0.22); col.set([cl.r, cl.g, cl.b], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const dot = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, '#fff'); gr.addColorStop(0.3, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 2.6, map: dot, vertexColors: true, transparent: true, depthWrite: false, fog: false, sizeAttenuation: true })));
  // 星雲：幾片大的柔光
  const neb = (hex) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, hex + 'aa'); gr.addColorStop(0.5, hex + '33'); gr.addColorStop(1, hex + '00'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); };
  for (const [hex, x, y, z, s] of [['#1736F5', -220, 60, -260, 340], ['#00c8ff', 260, -40, -200, 360], ['#ffc709', 60, 140, -320, 240], ['#1f3acc', -260, -90, 120, 300]]) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: neb(hex), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0.55 }));
    sp.position.set(x, y, z); sp.scale.setScalar(s); scene.add(sp);
  }
}

// ---------- 小積木 ----------
const MAT = {};
const mat = (hex, o = {}) => { const k = hex + JSON.stringify(o); if (!MAT[k]) MAT[k] = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.75, metalness: 0.05, flatShading: true, ...o }); return MAT[k]; };
const glow = (hex, i = 2) => mat(hex, { emissive: hex, emissiveIntensity: i, roughness: 0.4 });
function mesh(geo, m, x = 0, y = 0, z = 0, parent) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (parent) parent.add(o); return o; }
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const C = (rt, rb, h, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
const S = (r, w = 14, h = 10) => new THREE.SphereGeometry(r, w, h);
// 把東西擺到星球表面（lat、lon 用度）
function onSurface(planet, obj, lat, lon, lift = 0) {
  const r = planet.userData.r, la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon);
  const n = new THREE.Vector3(Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo));
  obj.position.copy(n).multiplyScalar(r * 0.97 + lift);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
  planet.userData.top.add(obj); return obj;
}

// ---------- Q 版太空人 ----------
function astronaut(scale = 1, accent = 0xffc709) {
  const g = new THREE.Group();
  const white = mat(0xf4f1ea, { roughness: 0.55 }), grey = mat(0xb9bfca), acc = mat(accent);
  mesh(S(0.62, 18, 14), white, 0, 1.25, 0, g); // 大頭盔
  const visor = mesh(S(0.48, 18, 14), mat(0x1a2a55, { roughness: 0.15, metalness: 0.6, flatShading: false }), 0, 1.25, 0.2, g); visor.scale.set(1, 0.78, 0.7);
  mesh(S(0.09, 8, 6), mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.5 }), -0.16, 1.4, 0.52, g); // 反光
  mesh(C(0.05, 0.05, 0.28, 6), grey, 0.32, 1.85, 0, g).rotation.z = -0.4; // 天線
  mesh(S(0.08, 8, 6), glow(accent, 1.6), 0.4, 2.0, 0, g);
  const body = mesh(new THREE.CapsuleGeometry(0.38, 0.32, 6, 12), white, 0, 0.45, 0, g);
  mesh(B(0.4, 0.12, 0.05), acc, 0, 0.55, 0.37, g); // 胸前橘條
  mesh(B(0.6, 0.62, 0.3), grey, 0, 0.55, -0.4, g); // 背包
  for (const sx of [-1, 1]) {
    const arm = mesh(new THREE.CapsuleGeometry(0.13, 0.28, 4, 8), white, sx * 0.48, 0.5, 0, g); arm.rotation.z = sx * 0.5;
    mesh(S(0.14, 8, 6), acc, sx * 0.62, 0.3, 0, g); // 手套
    mesh(new THREE.CapsuleGeometry(0.15, 0.14, 4, 8), white, sx * 0.2, -0.05, 0, g);
    mesh(B(0.26, 0.12, 0.34), grey, sx * 0.2, -0.22, 0.04, g); // 靴子
  }
  g.scale.setScalar(scale); g.userData.body = body;
  return g;
}

// ---------- 創巢：舊官網那隻坐在月亮上的太空人（逐格 WebP，已去背，跟線上同一批檔） ----------
// 進場播一次「思考 → 眼睛冒出來 → 揮手」，之後在揮手那段來回循環；後段跌倒的格數不用。手機隔一格載，省流量
const MASCOT = { last: 104, loopFrom: 66, fps: 22, step: isTouch ? 2 : 1 };
const mascotSrc = (n) => `/assets/images/astronaut/clips/beat02-frames/frame_${String(n).padStart(3, '0')}.webp`;
function makeMascot(def) {
  const g = new THREE.Group(); g.userData = { def, r: def.r, moons: [] };
  const cv = document.createElement('canvas'); cv.width = cv.height = 512;
  const ctx = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.08, fog: false, toneMapped: false }));
  sp.scale.setScalar(def.r * 2.2); sp.userData.planet = g; g.add(sp);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: def.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.3 }));
  halo.scale.setScalar(def.r * 3.2); halo.position.z = -0.5; g.add(halo); g.userData.halo = halo;
  g.userData.top = new THREE.Group(); g.add(g.userData.top);
  const nums = []; for (let n = 1; n <= MASCOT.last; n += MASCOT.step) nums.push(n);
  const imgs = [], loopFrom = nums.findIndex((n) => n >= MASCOT.loopFrom);
  let shown = -1;
  const draw = (k) => { if (k === shown || !imgs[k]) return; ctx.clearRect(0, 0, 512, 512); ctx.drawImage(imgs[k], 0, 0, 512, 512); tex.needsUpdate = true; shown = k; };
  nums.forEach((n, k) => { const im = new Image(); im.decoding = 'async'; im.onload = () => { imgs[k] = im; if (k === 0) draw(0); }; im.src = mascotSrc(n); });
  // 依時間算出現在該播第幾格；下一格還沒載到就停在原地等
  g.userData.mascotAnim = { t: 0, tick(dt) {
    const last = nums.length - 1, span = last - loopFrom, f = this.t * (MASCOT.fps / MASCOT.step);
    let k; if (f <= last) k = Math.floor(f); else { const q = (f - last) % (2 * span); k = q < span ? last - Math.floor(q) : loopFrom + Math.floor(q - span); }
    if (imgs[k]) { this.t += dt; draw(k); }
  } };
  g.position.set(...def.pos); scene.add(g); return g;
}

// ---------- 星球 ----------
function makePlanet(def) {
  if (def.mascot) return makeMascot(def);
  const g = new THREE.Group(); g.userData = { def, r: def.r };
  const geo = new THREE.IcosahedronGeometry(def.r, def.r > 6 ? 3 : 2);
  // 表面高低起伏，比較像小星球
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const n = 1 + (Math.sin(v.x * 1.7) * Math.cos(v.z * 1.3) + Math.sin(v.y * 2.1)) * 0.025; v.multiplyScalar(n); pos.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals();
  const body = mesh(geo, mat(def.color, { roughness: 0.85 }), 0, 0, 0, g);
  body.userData.planet = g;
  // 上半球一層草皮／地表色
  if (def.ground) { const cap = mesh(new THREE.SphereGeometry(def.r * 1.004, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), mat(def.ground, { roughness: 0.9 }), 0, 0, 0, g); cap.userData.planet = g; }
  // 星環
  if (def.ring) { const ring = mesh(new THREE.TorusGeometry(def.r * 1.55, def.r * 0.07, 6, 48), mat(def.ring, { roughness: 0.4 }), 0, 0, 0, g); ring.rotation.x = Math.PI / 2 - 0.35; ring.rotation.y = 0.3; }
  // 光暈
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: def.glow || def.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 }));
  halo.scale.setScalar(def.r * 3.6); g.add(halo); g.userData.halo = halo;
  const top = new THREE.Group(); g.add(top); g.userData.top = top;
  g.position.set(...def.pos);
  if (PROPS[def.props]) PROPS[def.props](g, def);
  // 繞著星球飄的小太空人（遊樂園兩隻），點到等於點這顆星球。沒抱包裹，跟「一隻＝一位客戶」的送貨太空人分開
  const n = def.id === 'park' ? 2 : 1;
  g.userData.moons = Array.from({ length: n }, (_, i) => {
    const mg = new THREE.Group(), a = astronaut(0.75, def.glow || 0xffc709); mg.add(a);
    a.traverse((o) => { if (o.isMesh) o.userData.moon = { planet: g, idx: i }; });
    mg.userData = { a: (i / n) * Math.PI * 2 + def.pos[0] * 0.1, d: def.r * 1.7 + 2.4, sp: 0.16 + i * 0.05, tilt: 0.3 + i * 0.15, body: a };
    g.add(mg); return mg;
  });
  scene.add(g); return g;
}
let _halo; function haloTex() { if (_halo) return _halo; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(0.45, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return (_halo = new THREE.CanvasTexture(c)); }

// 小招牌（畫在 canvas 上的字）
function sign(text, bg = '#ff7a3d', fg = '#fff', w = 2.4, h = 0.8) {
  const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256 * h / w);
  const x = c.getContext('2d'); x.fillStyle = bg; x.beginPath(); x.roundRect(4, 4, c.width - 8, c.height - 8, 18); x.fill();
  x.fillStyle = fg; x.font = `900 ${Math.round(c.height * 0.5)}px "Noto Sans TC","Microsoft JhengHei",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, c.width / 2, c.height / 2 + 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide }));
}
function tree(s = 1) { const g = new THREE.Group(); mesh(C(0.08 * s, 0.1 * s, 0.4 * s, 6), mat(0x8a5a3c), 0, 0.2 * s, 0, g); mesh(new THREE.ConeGeometry(0.42 * s, 0.9 * s, 7), mat(0x5fc28a), 0, 0.75 * s, 0, g); return g; }

// ---------- 每顆星球上的小場景 ----------
const PROPS = {
  web(p) { // 網站星：小店面＋大螢幕
    const shop = new THREE.Group();
    mesh(B(2.4, 1.6, 1.6), mat(0xfff3e6), 0, 0.8, 0, shop); mesh(B(2.6, 0.25, 1.9), mat(0xff7a3d), 0, 1.7, 0.1, shop);
    mesh(B(0.8, 0.9, 0.05), mat(0x6fb7ff, { emissive: 0x2a6fbf, emissiveIntensity: 0.6 }), 0.5, 0.75, 0.81, shop);
    onSurface(p, shop, 75, 20);
    const scr = new THREE.Group(); mesh(B(3.2, 2.1, 0.2), mat(0x2b2f45), 0, 2.4, 0, scr); mesh(B(2.9, 1.8, 0.05), glow(0x8fd3ff, 0.9), 0, 2.4, 0.12, scr); mesh(C(0.1, 0.1, 1.4, 6), mat(0x8a90a0), 0, 0.7, 0, scr);
    for (let i = 0; i < 3; i++) mesh(B(2.2 - i * 0.5, 0.18, 0.06), mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.8 }), -0.2, 2.9 - i * 0.45, 0.16, scr);
    onSurface(p, scr, 55, 140); onSurface(p, tree(), 60, 260); onSurface(p, tree(0.8), 45, 300);
  },
  booking(p) { // 預約星：鐘塔＋月曆
    const t = new THREE.Group(); mesh(B(1.3, 3.2, 1.3), mat(0xf6e2c8), 0, 1.6, 0, t); mesh(new THREE.ConeGeometry(1.1, 1.2, 4), mat(0x5d7bd8), 0, 3.8, 0, t).rotation.y = Math.PI / 4;
    const face = mesh(C(0.5, 0.5, 0.08, 20), mat(0xffffff), 0, 2.6, 0.68, t); face.rotation.x = Math.PI / 2;
    const h1 = mesh(B(0.06, 0.38, 0.03), mat(0x222222), 0, 2.75, 0.74, t); p.userData.hand = h1;
    onSurface(p, t, 80, 0);
    const cal = new THREE.Group(); mesh(B(1.8, 1.6, 0.15), mat(0xffffff), 0, 0.9, 0, cal); mesh(B(1.8, 0.4, 0.17), mat(0xff6b6b), 0, 1.55, 0, cal);
    for (let i = 0; i < 6; i++) mesh(B(0.32, 0.25, 0.17), mat(i === 3 ? 0x7cd38f : 0xe6e8f0), -0.55 + (i % 3) * 0.55, 1.05 - Math.floor(i / 3) * 0.4, 0.01, cal);
    onSurface(p, cal, 55, 120); onSurface(p, tree(), 50, 230);
  },
  rocket(p) { // 快速建站：小火箭
    const r = new THREE.Group(); mesh(C(0.5, 0.6, 2.4, 12), mat(0xffffff), 0, 1.6, 0, r); mesh(new THREE.ConeGeometry(0.5, 0.9, 12), mat(0xff5d5d), 0, 3.25, 0, r);
    mesh(S(0.22, 10, 8), mat(0x6fb7ff, { emissive: 0x2a6fbf, emissiveIntensity: 0.5 }), 0, 2.1, 0.45, r);
    for (let i = 0; i < 3; i++) { const f = mesh(B(0.08, 0.7, 0.6), mat(0xff5d5d), 0, 0.55, 0, r); f.rotation.y = i * Math.PI * 2 / 3; f.translateZ(0.55); }
    const fl = mesh(new THREE.ConeGeometry(0.35, 0.9, 8), glow(0xffb03a, 2.5), 0, -0.1, 0, r); fl.rotation.x = Math.PI; p.userData.flame = fl;
    onSurface(p, r, 90, 0, 0.6); p.userData.rocket = r;
    mesh(C(1.2, 1.4, 0.3, 10), mat(0x8a90a0), 0, 0, 0, onSurface(p, new THREE.Group(), 90, 0));
  },
  social(p) { // 社群星：衛星天線＋愛心對話框
    const d = new THREE.Group(); mesh(C(0.12, 0.15, 1.2, 6), mat(0x9aa3b5), 0, 0.6, 0, d);
    const dish = mesh(new THREE.SphereGeometry(1.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.6), mat(0xf2f2f2, { side: THREE.DoubleSide }), 0, 1.5, 0, d); dish.rotation.x = Math.PI * 0.7;
    onSurface(p, d, 70, 30); p.userData.dish = dish;
    const bubbles = [];
    for (const [la, lo, c] of [[50, 140, 0xff6f91], [45, 220, 0x6fc3ff], [60, 300, 0xffc94d]]) {
      const b = new THREE.Group(); mesh(new THREE.CapsuleGeometry(0.45, 0.5, 4, 10), mat(c), 0, 1.6, 0, b).rotation.z = Math.PI / 2;
      mesh(new THREE.ConeGeometry(0.18, 0.4, 4), mat(c), -0.3, 1.1, 0, b).rotation.z = 0.5;
      onSurface(p, b, la, lo); bubbles.push(b);
    }
    p.userData.bubbles = bubbles;
  },
  ads(p) { // 投放星（跳動）：看板＋雷達
    const bb = new THREE.Group(); mesh(C(0.1, 0.1, 1.6, 6), mat(0x8a90a0), -0.8, 0.8, 0, bb); mesh(C(0.1, 0.1, 1.6, 6), mat(0x8a90a0), 0.8, 0.8, 0, bb);
    mesh(B(2.6, 1.4, 0.15), mat(0x26c6a8), 0, 2.2, 0, bb); const s = sign('跳動', '#26c6a8', '#fff', 2.3, 1.1); s.position.set(0, 2.2, 0.09); bb.add(s);
    onSurface(p, bb, 70, 10);
    const radar = new THREE.Group(); mesh(C(0.5, 0.7, 0.4, 10), mat(0x9aa3b5), 0, 0.2, 0, radar);
    const arm = mesh(B(0.12, 0.12, 1.4), glow(0x26c6a8, 1.5), 0, 0.5, 0.6, radar); p.userData.radar = radar;
    onSurface(p, radar, 50, 160); onSurface(p, tree(), 45, 250);
  },
  seo(p) { // 搜尋星：天文台
    const o = new THREE.Group(); mesh(C(1.1, 1.2, 1.4, 12), mat(0xf3efe6), 0, 0.7, 0, o);
    mesh(new THREE.SphereGeometry(1.1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x9aa8c8, { metalness: 0.4 }), 0, 1.4, 0, o);
    const tel = mesh(C(0.25, 0.35, 1.8, 10), mat(0x4a5578), 0.3, 2.1, 0, o); tel.rotation.z = -0.7; p.userData.tel = tel;
    onSurface(p, o, 75, 40);
    const mg = new THREE.Group(); mesh(new THREE.TorusGeometry(0.5, 0.12, 8, 16), mat(0xffc94d), 0, 1.2, 0, mg); mesh(C(0.1, 0.1, 0.8, 6), mat(0x8a5a3c), 0.45, 0.6, 0, mg).rotation.z = 0.6;
    onSurface(p, mg, 45, 200);
  },
  stage(p) { // 虛擬網紅星：舞台＋聚光燈＋攝影機
    const st = new THREE.Group(); mesh(C(1.6, 1.7, 0.4, 16), mat(0x6b4bd8), 0, 0.2, 0, st);
    const star = astronaut(0.7, 0xff6fb5); star.position.y = 0.4; st.add(star); p.userData.dancer = star;
    onSurface(p, st, 85, 0);
    for (const lo of [120, 240]) { const l = new THREE.Group(); mesh(C(0.08, 0.08, 2, 6), mat(0x444a5a), 0, 1, 0, l); const hd = mesh(C(0.2, 0.35, 0.5, 8), glow(0xfff1a8, 1.8), 0, 2.1, 0.2, l); hd.rotation.x = 0.9; onSurface(p, l, 50, lo); }
    const cam = new THREE.Group(); mesh(B(0.7, 0.5, 0.9), mat(0x2b2f45), 0, 1.3, 0, cam); mesh(C(0.2, 0.25, 0.4, 10), mat(0x111111), 0, 1.3, 0.6, cam).rotation.x = Math.PI / 2; mesh(C(0.05, 0.05, 1.1, 6), mat(0x8a90a0), 0, 0.55, 0, cam);
    onSurface(p, cam, 45, 0);
  },
  park(p) { // 遊樂園星：摩天輪＋遊戲機台
    const fw = new THREE.Group(); mesh(B(0.15, 2.6, 0.15), mat(0x8a90a0), -0.6, 1.3, 0, fw).rotation.z = 0.25; mesh(B(0.15, 2.6, 0.15), mat(0x8a90a0), 0.6, 1.3, 0, fw).rotation.z = -0.25;
    const wheel = new THREE.Group(); wheel.position.y = 2.6; fw.add(wheel);
    mesh(new THREE.TorusGeometry(1.6, 0.07, 6, 30), mat(0xff7ab8), 0, 0, 0, wheel);
    const cols = [0xff6b6b, 0xffc94d, 0x6fc3ff, 0x7cd38f, 0xb48bff, 0xff9f5a];
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mesh(B(0.05, 1.6, 0.05), mat(0xffffff), Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0, wheel).rotation.z = a + Math.PI / 2; mesh(B(0.45, 0.4, 0.4), mat(cols[i]), Math.cos(a) * 1.6, Math.sin(a) * 1.6, 0, wheel); }
    onSurface(p, fw, 65, 330); p.userData.wheel = wheel;
    // 機台：第一台是《加一顆蛋》，其他是「你的遊戲」
    const arc = (main) => { const a = new THREE.Group(); mesh(B(0.9, 1.7, 0.8), mat(main ? 0x2b2f45 : 0x4a4f66), 0, 0.85, 0, a); mesh(B(0.7, 0.5, 0.05), main ? glow(0xffd84a, 1.2) : glow(0x8fa0c8, 0.35), 0, 1.25, 0.41, a); mesh(B(0.9, 0.25, 0.5), mat(main ? 0xff7a3d : 0x6a6f86), 0, 0.75, 0.55, a); if (main) { const s = sign('加一顆蛋', '#ffd84a', '#111', 1.1, 0.3); s.position.set(0, 1.85, 0.41); a.add(s); } return a; };
    onSurface(p, arc(true), 70, 120); onSurface(p, arc(false), 58, 150); onSurface(p, arc(false), 58, 95);
    const s = sign('遊樂園', '#ff7ab8', '#fff', 2.4, 0.8); onSurface(p, s, 52, 210, 1.2);
  },
  blog(p) { // 訊號塔：部落格
    const t = new THREE.Group(); mesh(C(0.15, 0.5, 3.4, 6), mat(0xd9dde8), 0, 1.7, 0, t);
    for (let i = 0; i < 3; i++) mesh(new THREE.TorusGeometry(0.5 + i * 0.35, 0.05, 6, 20), glow(0x8fd3ff, 0.8), 0, 3.4, 0, t).rotation.x = Math.PI / 2;
    mesh(S(0.22, 10, 8), glow(0xff6b6b, 2), 0, 3.5, 0, t); p.userData.beacon = t;
    onSurface(p, t, 85, 0); onSurface(p, tree(0.8), 40, 100);
  },
};
// ---------- 擺出來 ----------
const ALL = [BASE, ...PLANETS];
const planets = ALL.map(makePlanet);
const pickables = [];
planets.forEach((p) => p.traverse((o) => { if ((o.isMesh || o.isSprite) && (o.userData.planet || o.userData.moon)) pickables.push(o); }));

// 軌道線（虛線圓，讓畫面有星系感）
for (const p of planets.slice(1)) {
  const r = Math.hypot(p.position.x, p.position.z), pts = [];
  for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, p.position.y * 0.3, Math.sin(a) * r)); }
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0x00c8ff, dashSize: 1.2, gapSize: 1.6, transparent: true, opacity: 0.2 }));
  l.computeLineDistances(); scene.add(l);
}

// ---------- 送貨的小太空人（一隻＝一位客戶；沒資料就隨機 3–5 隻） ----------
// 客戶數來源優先序：window.NEST_CUSTOMERS（工程師接後端）→ planets.js 的 CUSTOMERS → 隨機 3–5。
// 只代表數量、不顯示名字（照「客戶案例不放名字」）。為效能設上限。
function customerCount() {
  const src = window.NEST_CUSTOMERS;
  let n = Array.isArray(src) ? src.length : (typeof src === 'number' ? src : (CUSTOMERS ? CUSTOMERS.length : 0));
  if (!n || n < 1) n = 3 + Math.floor(Math.random() * 3); // 隨機 3–5
  return Math.max(1, Math.min(n, isTouch ? 6 : 16)); // 上限：手機 6、桌機 16
}
const COURIER_N = customerCount(), couriers = [];
for (let i = 0; i < COURIER_N; i++) {
  const a = astronaut(0.38, [0xffc709, 0x00c8ff, 0x1736F5, 0xe8f0ff][i % 4]);
  mesh(B(0.7, 0.55, 0.55), mat(0xc8935c), 0, 0.5, 0.75, a); // 抱著包裹
  scene.add(a); couriers.push({ a, t: Math.random(), from: null, to: null, sp: 0.05 + Math.random() * 0.03 });
}
function newTrip(c) { const ps = planets; c.from = c.to || ps[0]; do { c.to = ps[(Math.random() * ps.length) | 0]; } while (c.to === c.from); c.t = 0; }
couriers.forEach(newTrip);

// ---------- 標籤（HTML，跟著星球跑） ----------
const labels = ALL.map((d, i) => {
  const el = document.createElement('button'); el.className = 'plabel' + (d.id === 'park' ? ' hot' : '');
  el.innerHTML = `<i>${String(i).padStart(2, '0')}</i>${d.name}`; el.addEventListener('click', () => focusPlanet(i));
  $('labels').appendChild(el); return el;
});

// ---------- 右側清單 ----------
{
  const ul = $('index');
  ALL.forEach((d, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button><em>${String(i).padStart(2, '0')}</em><span><b>${d.name}</b><small>${d.tagline || ''}</small></span><i>›</i></button>`;
    li.querySelector('button').addEventListener('click', () => { focusPlanet(i); if (small) setList(false); });
    ul.appendChild(li);
  });
}

// ---------- 點星球：鏡頭飛過去＋面板 ----------
let focus = -1, fly = null;
const tmp = new THREE.Vector3();
// hover 狀態屬於「星球」（只看滑鼠指到的星球本體，名牌自己不是 hover 對象）：名牌亮起、星球光暈變亮都看這個值。
// 滑進星球的那一刻，名牌播一次「衝向左上角再彈回」；dash[i] = 該名牌已播放秒數（-1 = 沒在播）。
// 播放中不重播，避免滑鼠在星球邊緣來回時名牌跳位或卡在角落。
const DASH_DUR = 0.6, dash = planets.map(() => -1);
let hov = -1;
function setHover(i) {
  if (i === hov) return; hov = i;
  labels.forEach((l, k) => l.classList.toggle('hov', k === i));
  if (i >= 0 && dash[i] < 0) dash[i] = 0;
}
function focusPlanet(i) {
  focus = i; const p = planets[i], d = ALL[i];
  controls.autoRotate = false;
  const dist = d.r * (small ? 5.2 : 4.2) + 6;
  const dir = tmp.copy(camera.position).sub(p.position).setY(0).normalize();
  if (!isFinite(dir.x)) dir.set(0, 0, 1);
  const to = p.position.clone().add(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, d.r * 1.6 + 3, 0));
  // 面板在左邊，把星球往右推一點（目標點往左偏）
  const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize().multiplyScalar(small ? 0 : -d.r * 1.1);
  fly = { t: 0, fromP: camera.position.clone(), toP: to, fromT: controls.target.clone(), toT: p.position.clone().add(side) };
  showPanel(d, i);
  document.querySelectorAll('#index li').forEach((li, k) => li.classList.toggle('on', k === i));
  labels.forEach((l, k) => l.classList.toggle('on', k === i));
  track('planet_open', { planet: d.id });
}
function goHome() {
  focus = -1; fly = { t: 0, fromP: camera.position.clone(), toP: HOME_POS.clone(), fromT: controls.target.clone(), toT: new THREE.Vector3() };
  $('panel').classList.remove('open'); controls.autoRotate = true;
  document.querySelectorAll('#index li').forEach((li) => li.classList.remove('on')); labels.forEach((l) => l.classList.remove('on'));
}
function showPanel(d, i) {
  const P = $('panel');
  const moons = (d.moons || []).map((m) => `<a class="moon" href="${m.href || '#'}" ${m.href && /^http/.test(m.href) ? 'target="_blank" rel="noopener"' : ''}><b>${m.name}</b><small>${m.desc || ''}</small><i>${m.cta || '看看 ›'}</i></a>`).join('');
  P.innerHTML = `<button class="pclose" aria-label="關閉">×</button>
    <div class="pkicker">PLANET ${String(i).padStart(2, '0')}${d.kicker ? ' · ' + d.kicker : ''}</div>
    <h2>${d.name}</h2>
    <p class="plead">${d.lead || ''}</p>
    ${d.quote ? `<blockquote>${d.quote}</blockquote>` : ''}
    ${d.price ? `<div class="pprice"><span>起價</span><b>${d.price}</b></div>` : ''}
    ${d.points ? `<ul class="ppoints">${d.points.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}
    ${moons ? `<div class="pmoons-t">${d.moonTitle || '作品與範例'}</div><div class="pmoons">${moons}</div>` : ''}
    <div class="pcta">${(d.ctas || []).map((c, k) => `<a class="${k ? 'ghost' : ''}" href="${c.href}" ${/^http/.test(c.href) ? 'target="_blank" rel="noopener"' : ''}>${c.text}</a>`).join('')}</div>`;
  P.classList.add('open'); P.scrollTop = 0;
  P.querySelector('.pclose').addEventListener('click', goHome);
}
$('btnHome').addEventListener('click', goHome);
// 右側清單開關：按鈕亮起並改字「收起清單」，讓人知道再按一次會收回
function setList(open) {
  document.body.classList.toggle('list-open', open);
  $('btnList').textContent = open ? '收起清單' : '服務清單';
  $('btnList').setAttribute('aria-expanded', open);
}
$('btnList').addEventListener('click', () => setList(!document.body.classList.contains('list-open')));

// 點 3D 物件
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
let downAt = null;
renderer.domElement.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; controls.autoRotate = false; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  mouse.set(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1); ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(pickables, false)[0]; if (!hit) return;
  const u = hit.object.userData, pl = u.planet || (u.moon && u.moon.planet); const i = planets.indexOf(pl); if (i >= 0) focusPlanet(i);
});
renderer.domElement.addEventListener('pointermove', (e) => {
  if (isTouch) return; mouse.set(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1); ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(pickables, false)[0];
  renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
  const u = hit && hit.object.userData;
  setHover(e.buttons || !u ? -1 : planets.indexOf(u.planet || (u.moon && u.moon.planet))); // 拖曳轉星系時不亮
});
renderer.domElement.addEventListener('pointerleave', () => setHover(-1));
addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (document.body.classList.contains('list-open')) setList(false); else goHome(); });

// ---------- 導覽卡（第一次來才出現） ----------
{
  const steps = [
    ['HELLO, 太空人 / 01', '每顆星球是一項服務', '拖曳畫面轉動星系，點任何一顆星球，飛過去看它能幫你做什麼。'],
    ['HELLO, 太空人 / 02', '每顆星球都附了做過的作品', '點星球之後，介紹裡會列出範例和 Demo，可以直接點進去玩。'],
    ['HELLO, 太空人 / 03', '粉紅色那顆是遊樂園', '我們自己做的遊戲都放在那裡。你也做了遊戲？歡迎投稿上架。'],
  ];
  let seen = false; try { seen = localStorage.getItem('nest-intro') === '1'; } catch (e) {}
  if (!seen) {
    const el = $('intro'); let k = 0;
    const draw = () => { const [a, b, c] = steps[k]; el.querySelector('.ik').textContent = a; el.querySelector('h3').textContent = b; el.querySelector('p').textContent = c; el.querySelector('.inext').textContent = k < steps.length - 1 ? '下一步 →' : '出發 →'; };
    const close = () => { el.classList.remove('show'); try { localStorage.setItem('nest-intro', '1'); } catch (e) {} };
    el.querySelector('.inext').addEventListener('click', () => { if (++k >= steps.length) close(); else draw(); });
    el.querySelector('.iskip').addEventListener('click', close);
    draw(); setTimeout(() => el.classList.add('show'), 900);
  }
}

// ---------- GA4 事件（有裝 gtag 才送） ----------
function track(name, params) { try { if (window.gtag) window.gtag('event', name, params); } catch (e) {} }

// ---------- 主迴圈 ----------
const clock = new THREE.Clock(), v3 = new THREE.Vector3();
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function loop() {
  const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
  planets.forEach((p, i) => {
    const d = ALL[i];
    p.userData.top.rotation.y += dt * (d.spin ?? 0.06); // 星球慢慢自轉（地表＋小場景一起轉）
    p.children[0].rotation.y = p.userData.top.rotation.y; if (p.children[1] && d.ground) p.children[1].rotation.y = p.userData.top.rotation.y;
    p.position.y = d.pos[1] + Math.sin(t * 0.5 + i) * 0.35; // 微微上下漂
    const hl = p.userData.halo, hk = (p.userData.hk = (p.userData.hk || 0) + ((hov === i ? 1 : 0) - (p.userData.hk || 0)) * Math.min(1, dt * 10)); // hover 平滑 0→1
    hl.userData.base = hl.userData.base || hl.scale.x;
    hl.material.opacity = (focus === i ? 0.6 : 0.3) + hk * 0.25 + Math.sin(t * 1.5 + i) * 0.05;
    hl.scale.setScalar(hl.userData.base * (1 + hk * 0.18));
    for (const m of p.userData.moons) { const u = m.userData; u.a += dt * u.sp; m.position.set(Math.cos(u.a) * u.d, Math.sin(u.a * 1.3) * u.tilt * u.d * 0.3, Math.sin(u.a) * u.d); u.body.rotation.y += dt * 0.8; }
    const U = p.userData;
    if (U.mascotAnim) U.mascotAnim.tick(dt);
    if (U.hand) U.hand.rotation.z = -t * 0.8;
    if (U.flame) U.flame.scale.set(1 + Math.sin(t * 20) * 0.15, 1 + Math.sin(t * 17) * 0.25, 1);
    if (U.rocket) U.rocket.position.y += Math.sin(t * 3) * 0.003;
    if (U.dish) U.dish.rotation.z = Math.sin(t * 0.7) * 0.4;
    if (U.bubbles) U.bubbles.forEach((b, k) => { b.children.forEach((c) => (c.position.y += Math.sin(t * 2 + k) * 0.003)); });
    if (U.radar) U.radar.rotation.y = t * 1.6;
    if (U.tel) U.tel.rotation.z = -0.7 + Math.sin(t * 0.5) * 0.2;
    if (U.dancer) { U.dancer.rotation.y = t * 1.5; U.dancer.position.y = 0.4 + Math.abs(Math.sin(t * 4)) * 0.25; }
    if (U.wheel) U.wheel.rotation.z = t * 0.4;
    if (U.beacon) U.beacon.children.forEach((c, k) => { if (k >= 1 && k <= 3) c.scale.setScalar(1 + ((t * 0.8 + k * 0.33) % 1) * 0.6); });
  });
  // 送貨小太空人：沿弧線飛
  for (const c of couriers) {
    c.t += dt * c.sp; if (c.t >= 1) newTrip(c);
    const a = c.from.position, b = c.to.position, k = ease(c.t);
    v3.lerpVectors(a, b, k); v3.y += Math.sin(k * Math.PI) * (8 + a.distanceTo(b) * 0.12);
    const prev = c.a.position.clone(); c.a.position.copy(v3);
    const dir = v3.clone().sub(prev); if (dir.lengthSq() > 1e-6) c.a.lookAt(v3.clone().add(dir));
    c.a.rotateX(-0.6); c.a.visible = c.t > 0.03 && c.t < 0.97;
  }
  // 鏡頭飛行
  if (fly) { fly.t = Math.min(1, fly.t + dt / 1.4); const k = ease(fly.t); camera.position.lerpVectors(fly.fromP, fly.toP, k); controls.target.lerpVectors(fly.fromT, fly.toT, k); if (fly.t >= 1) fly = null; }
  controls.update();
  // 標籤位置
  const W = innerWidth, H = innerHeight;
  planets.forEach((p, i) => {
    v3.copy(p.position); v3.y += ALL[i].r + 1.2; v3.project(camera);
    const el = labels[i], vis = v3.z < 1 && Math.abs(v3.x) < 1.1 && Math.abs(v3.y) < 1.1;
    if (dash[i] >= 0 && (dash[i] += dt) >= DASH_DUR) dash[i] = -1;
    el.style.display = vis ? '' : 'none'; if (!vis) return;
    let sx = (v3.x * 0.5 + 0.5) * W, sy = (-v3.y * 0.5 + 0.5) * H;
    if (dash[i] >= 0) { // 衝向左上角（前 22% 時間快速到達）再緩緩彈回原位；目標點在 logo 下方、畫面內，不會飛出去
      const u = dash[i] / DASH_DUR, r = u < 0.22 ? 1 - Math.pow(1 - u / 0.22, 3) : 1 - ease((u - 0.22) / 0.78);
      sx += (Math.min(90, W * 0.25) - sx) * r; sy += (100 - sy) * r;
    }
    // scale 放最後＝先以名牌自己為中心放大、再移到位置（位置不會被一起放大）；hk 是 hover 平滑值 0→1
    el.style.transform = `translate(-50%,-100%) translate(${sx}px,${sy}px) scale(${1 + 0.06 * (p.userData.hk || 0)})`;
    el.style.opacity = focus >= 0 && focus !== i ? 0.35 : 1;
  });
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
document.body.classList.add('ready');
loop();
