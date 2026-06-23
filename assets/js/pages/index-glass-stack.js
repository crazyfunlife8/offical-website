/* ============================================================
   pages/index-glass-stack.js — 軟體開發開放程式碼空間（WebGL r0.160 module）
   來源 index-rain-preview.html module（commit 442b261 引擎）。
   2026-06-24 玻璃時代死碼整批移除：只留「程式碼落雨（2D canvas → WebGL 平面 innerRain）
   + HTML 卡片切換（左右滑 / 鍵盤 / 導引點）」。玻璃版還原點見 git commit 442b261/93e3db4/65582e4。
   保留 QA_MODE（URL gated、production 永為 false）。r0.160 走 importmap module、不碰 window.THREE。
   ============================================================ */
    import * as THREE from 'three';

    const urlParams=new URLSearchParams(window.location.search);
    const QA_MODE=urlParams.get('qa')==='1';
    /* 卡片傾角（CSS --tiltX/--tiltY 與 WebGL 落雨平面群組共用） */
    const state={ tiltX:9, tiltY:-12 };
    const cssRoot=document.getElementById('devGlassStack');
    const htmlCard=document.getElementById('devStackSlot');
    const devStage=document.getElementById('devCardStage');
    const prevBtn=document.getElementById('devCardPrev');
    const nextBtn=document.getElementById('devCardNext');
    const dotsWrap=document.getElementById('devCardDots');
    const GRAIN=['const nest = createStudio()','export default function App(){','return <Section/>','await build(idea)','if(ready) ship()','render(art, code)','while(true){ create() }'].join('\n').repeat(8);

    /* 三服務內容（取自服務知識庫定稿；客製系統避用「流程自動化」措辭，免與 G 類採集混淆） */
    const CARDS=[
      { i:'01', cpath:'WEB ARCHITECTURE', klab:'// WEB DEVELOPMENT', title:'網站架設', en:'Your digital front door.',
        sub:'從一頁式門面到企業電商，依需求量身打造，不套公版。', ghost:'網',
        svc:[['形象 / 一頁式官網','乾淨俐落的數位門面'],['電商 / 會員整合','線上販售與會員經營'],['客製整合站','特殊流程、活動、訂閱']] },
      { i:'02', cpath:'CUSTOM SYSTEM', klab:'// SYSTEM DEVELOPMENT', title:'客製化系統開發', en:'Built around how you work.',
        sub:'現成軟體框不住的需求，從零打造只屬於你的系統。', ghost:'系',
        svc:[['內部管理後台','訂單、客戶、庫存一站管理'],['系統串接整合','打通既有工具與金流物流'],['資料庫 / 報表系統','數據集中、決策看得見']] },
      { i:'03', cpath:'DIGITAL STRATEGY', klab:'// TRANSFORMATION', title:'數位轉型顧問', en:'Strategy before tooling.',
        sub:'不急著買工具，先把數位這條路怎麼走想清楚。', ghost:'轉',
        svc:[['數位策略診斷','盤點現況、找出卡點'],['工具導入規劃','選對工具、不花冤枉錢'],['團隊數位賦能','讓人跟得上系統']] }
    ];
    const deck=document.getElementById('devStackDeck');
    const cardEls=CARDS.map((c,idx)=>{
      const el=document.createElement('article');
      el.className='html-card';
      el.dataset.i=idx;
      el.innerHTML=
        '<div class="ghost">'+c.ghost+'</div>'+
        '<div class="grain"></div>'+
        '<div class="codebar"><span class="cpath">'+c.cpath+'</span></div>'+
        '<div class="content">'+
          '<span class="knum">'+c.i+'</span>'+
          '<div class="lead">'+
            '<p class="klab">'+c.klab+'</p>'+
            '<h3 class="ztitle">'+c.title+'</h3>'+
            '<p class="zen">'+c.en+'</p>'+
            '<p class="zsub">'+c.sub+'</p>'+
          '</div>'+
          '<div class="svccol">'+
            '<p class="svc-head">服務範疇</p>'+
            '<ul class="svc">'+c.svc.map(s=>'<li><span class="sn">'+s[0]+'</span><span class="sd">'+s[1]+'</span></li>').join('')+'</ul>'+
          '</div>'+
        '</div>';
      el.querySelector('.grain').textContent=GRAIN;
      deck.appendChild(el);
      return el;
    });
    let activeCardIndex=0;
    const dotEls=CARDS.map((card,idx)=>{
      const btn=document.createElement('button');
      btn.className='dev-card-dot';
      btn.type='button';
      btn.setAttribute('aria-label','切換到'+card.title);
      btn.setAttribute('aria-controls','devStackDeck');
      btn.addEventListener('click',()=>goToCard(idx));
      dotsWrap.appendChild(btn);
      return btn;
    });

    const canvas=document.getElementById('devStackWebgl');
    const renderer=new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=0.62;
    renderer.useLegacyLights=false;
    renderer.setClearColor(0x000000,0);
    renderer.setClearAlpha(0);
    const TARGET_FRAME_MS=1000/30;
    const IS_MOBILE=window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
    const PREFERS_REDUCED_MOTION=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FX={
      codeScale:IS_MOBILE ? 0.58 : 1,
      codeFrameMs:IS_MOBILE ? 1000/14 : TARGET_FRAME_MS,
      pixelRatioMax:IS_MOBILE ? 1.5 : 2
    };

    const scene=new THREE.Scene();
    scene.background=null;
    const camera=new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0,0,8.1);

    /* 落雨平面群組（玻璃退場後保留：承載 innerRain 平面、套用卡片傾角） */
    const glassDeckGroup=new THREE.Group();
    scene.add(glassDeckGroup);
    const glassGroup=new THREE.Group();
    glassDeckGroup.add(glassGroup);

    const hash=(a,b)=>{ const x=Math.sin(a*127.1+b*311.7)*43758.5453; return x-Math.floor(x); };

    const CODE=[
      'const nest = createStudio()','export default function App() {','<section class="services">',
      'router.get("/api/orders", fn)','await db.clients.findMany()','npm run build && deploy',
      'return <Card {...props} />','useEffect(() => render(), [])','if (user.ready) launch()',
      'SELECT * FROM orders;','transform: translateY(-4px)','git commit -m "ship it"'
    ];
    /* ===== 卡內程式碼落雨：雨在深色空間流動（不透明深底+落雨碼 plane）
       參數沿用既有程式碼落雨：spd 0.085–0.195（慢）、字級 18–26px、cyc/1.8、白頭+藍/青/金尾漸層（#dev-rain / n4rain 血統）。 */
    const RAIN={ glow:0.84, density:40, speed:0.62, depth:0.78, spread:0.92, lead:0.04, pocket:0.52, pocketR:0.19, bleedX:1.4 };
    const rainCanvas=document.createElement('canvas');
    rainCanvas.width=1792; rainCanvas.height=600;
    const rainCtx=rainCanvas.getContext('2d');
    const rainTexture=new THREE.CanvasTexture(rainCanvas);
    rainTexture.colorSpace=THREE.SRGBColorSpace;
    rainTexture.minFilter=THREE.LinearFilter; rainTexture.magFilter=THREE.LinearFilter;
    const rainCols=Array.from({length:96},(_,i)=>({
      spd:0.085+hash(i,21)*0.11, ph:hash(i,22)*1.8, fs:18+(hash(i,23)*8|0), cyan:hash(i,24)<0.30, ye:hash(i,25)<0.12
    }));
    function drawInnerRain(time){
      const W=rainCanvas.width, H=rainCanvas.height, ctx=rainCtx;
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,W,H);
      const bg=ctx.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,'#040a1e'); bg.addColorStop(0.52,'#050d2a'); bg.addColorStop(1,'#02060f');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      const glow=THREE.MathUtils.clamp(RAIN.glow,0,1.6);
      const cols=Math.max(6, Math.round(RAIN.density * (W/1024)));
      ctx.textBaseline='middle';
      for(let c=0;c<cols;c++){
        const col=rainCols[c % rainCols.length];
        const codeInset=0;
        const codeW=W;
        const x=codeInset + codeW*(RAIN.lead + ((c+0.5)/cols)*RAIN.spread);
        const raw=time*col.spd*RAIN.speed + col.ph;
        const cyc=Math.floor(raw/1.8);
        const prog=raw%1.8-0.25;
        if(prog<0) continue;
        const code=CODE[(c*5+cyc)%CODE.length];
        ctx.font=col.fs+'px "JetBrains Mono",monospace';
        const w=ctx.measureText(code).width;
        const tipY=prog*H;
        ctx.save();
        ctx.translate(x,tipY);
        ctx.rotate(-Math.PI/2);
        ctx.textAlign='left';
        const base=col.ye?'255,199,9':col.cyan?'0,200,255':'150,180,235';
        const g=ctx.createLinearGradient(0,0,w,0);
        g.addColorStop(0,'rgba(232,244,255,'+(0.92*glow*0.62)+')');
        g.addColorStop(0.12,'rgba('+base+','+(0.78*glow*0.58)+')');
        g.addColorStop(1,'rgba('+base+',0)');
        ctx.fillStyle=g;
        ctx.fillText(code,0,0);
        ctx.restore();
      }
      /* 文字後方壓一塊暗 pocket，讓雨退到深處、前景文字坐在安靜深底上 */
      ctx.save();
      ctx.globalCompositeOperation='source-over';
      const pk=RAIN.pocket, pkR=RAIN.pocketR;
      const pocket=ctx.createRadialGradient(W*0.50,H*0.50,0,W*0.50,H*0.50,W*pkR);
      pocket.addColorStop(0,'rgba(0,3,12,'+pk+')');
      pocket.addColorStop(0.46,'rgba(1,7,22,'+(pk*0.66)+')');
      pocket.addColorStop(0.78,'rgba(2,10,30,'+(pk*0.21)+')');
      pocket.addColorStop(1,'rgba(2,10,30,0)');
      ctx.fillStyle=pocket;
      ctx.fillRect(0,0,W,H);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation='destination-in';
      const featherY=H*0.052;
      /* 左右出血：不做水平羽化，讓程式碼流出畫面左右緣（仍保留上下羽化） */
      const verticalMask=ctx.createLinearGradient(0,0,0,H);
      verticalMask.addColorStop(0,'rgba(0,0,0,0)');
      verticalMask.addColorStop(featherY/H,'rgba(0,0,0,1)');
      verticalMask.addColorStop(1-featherY/H,'rgba(0,0,0,1)');
      verticalMask.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=verticalMask;
      ctx.fillRect(0,0,W,H);
      ctx.restore();
      rainTexture.needsUpdate=true;
    }
    function sizeInnerRain(card,w,h,depth){
      if(!card.innerRain) return;
      card.innerRain.geometry.dispose();
      const rainDepth=THREE.MathUtils.clamp(RAIN.depth,0,0.98);
      const z=-rainDepth*depth*0.86;
      let planeW=w*1.08, planeH=h*1.08;
      /* 左右延伸超過畫面邊界：依平面實際 z 算可視寬度再乘 bleedX；高度維持卡片高（只往左右延） */
      const camDist=Math.abs(camera.position.z - z);
      const fovRad=THREE.MathUtils.degToRad(camera.fov);
      const visW=2*Math.tan(fovRad/2)*camDist*camera.aspect;
      planeW=visW*(RAIN.bleedX||1.4);
      card.innerRain.geometry=new THREE.PlaneGeometry(planeW,planeH,1,1);
      card.innerRain.position.set(0,0,z);
    }
    const glassCards=[
      { group:glassGroup, innerRain:null }
    ];
    for(const card of glassCards){
      const mat=new THREE.MeshBasicMaterial({ map:rainTexture, toneMapped:false, transparent:true, depthWrite:true });
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1,1,1), mat);
      mesh.renderOrder=-1; mesh.visible=false;
      card.group.add(mesh);
      card.innerRain=mesh;
    }
    let viewW=1, viewH=1;
    let rafId=0;
    let lastFrameTime=0;
    let lastCodeFrameTime=0;
    let needsRender=true;
    let qaFramesRemaining=QA_MODE ? 8 : 0;
    let sectionInView=true;

    function renderActive(){ return QA_MODE || (!document.hidden && sectionInView); }
    function requestSceneRender(){
      needsRender=true;
      if(renderActive() && !rafId){
        rafId=requestAnimationFrame(loop);
      }
    }

    function activeCardRect(){
      const card=cardEls[activeCardIndex];
      const rect=card ? card.getBoundingClientRect() : htmlCard.getBoundingClientRect();
      if(rect.width && rect.height) return rect;
      return htmlCard.getBoundingClientRect();
    }

    /* 依現役卡片尺寸重算落雨平面（玻璃幾何已退場，只留落雨 sizing） */
    function rebuildRainGeometry(){
      const rect=activeCardRect();
      if(!rect.width || !rect.height || !viewH) return;
      const cameraDist=Math.abs(camera.position.z-glassGroup.position.z);
      const fovRad=THREE.MathUtils.degToRad(camera.fov);
      const unitsPerPx=(2*cameraDist*Math.tan(fovRad/2))/viewH;
      const w=rect.width*unitsPerPx;
      const h=rect.height*unitsPerPx;
      const d=112*unitsPerPx;
      sizeInnerRain(glassCards[0], w, h, d);
    }

    function resize(){
      const dpr=Math.min(window.devicePixelRatio || 1, FX.pixelRatioMax);
      viewW=window.innerWidth;
      viewH=window.innerHeight;
      renderer.setPixelRatio(dpr);
      renderer.setSize(viewW, viewH, false);
      camera.aspect=viewW/viewH;
      camera.updateProjectionMatrix();
      rebuildRainGeometry();
      requestSceneRender();
    }
    window.addEventListener('resize', resize);

    function applyState(){
      cssRoot.style.setProperty('--tiltX', state.tiltX);
      cssRoot.style.setProperty('--tiltY', state.tiltY);
      glassGroup.rotation.x=THREE.MathUtils.degToRad(-state.tiltX);
      glassGroup.rotation.y=THREE.MathUtils.degToRad(state.tiltY);
      requestSceneRender();
    }


    /* ===== 單卡左右滑：HTML 內容層 slide/fade，WebGL 落雨維持穩定 ===== */
    let transitionSerial=0;
    const CARD_TRANSITION_MS=360;
    function cardTransform(x){
      return 'perspective(1700px) translateX('+x+'px) scale(1) rotateX(calc(var(--tiltX)*1deg)) rotateY(calc(var(--tiltY)*1deg))';
    }
    function syncCardControls(){
      for(let idx=0; idx<dotEls.length; idx++){
        const isActive=idx===activeCardIndex;
        dotEls[idx].classList.toggle('is-active', isActive);
        dotEls[idx].setAttribute('aria-current', isActive ? 'true' : 'false');
        dotEls[idx].setAttribute('aria-pressed', isActive ? 'true' : 'false');
      }
      prevBtn.disabled=activeCardIndex===0;
      nextBtn.disabled=activeCardIndex===CARDS.length-1;
    }
    function updateDevCardState(){
      for(let idx=0; idx<cardEls.length; idx++){
        const isActive=idx===activeCardIndex;
        cardEls[idx].classList.toggle('is-active', isActive);
        cardEls[idx].classList.toggle('is-front', isActive);
        cardEls[idx].style.zIndex=String(isActive ? 230 : 210);
        cardEls[idx].setAttribute('aria-hidden', isActive ? 'false' : 'true');
      }
      syncCardControls();
      const card=glassCards[0];
      card.group.position.set(0,0,0);
      card.group.scale.setScalar(1);
      card.group.rotation.x=THREE.MathUtils.degToRad(-state.tiltX);
      card.group.rotation.y=THREE.MathUtils.degToRad(state.tiltY);
      card.group.visible=true;
      if(card.innerRain) card.innerRain.visible=true;
      requestSceneRender();
    }
    function goToCard(target, direction){
      const nextIndex=Math.max(0, Math.min(CARDS.length-1, Number(target)));
      if(!Number.isFinite(nextIndex) || nextIndex===activeCardIndex) return activeCardIndex;
      const fromIndex=activeCardIndex;
      const dir=direction || (nextIndex>fromIndex ? 1 : -1);
      const serial=++transitionSerial;
      const outgoing=cardEls[fromIndex];
      const incoming=cardEls[nextIndex];
      activeCardIndex=nextIndex;
      incoming.classList.add('is-active');
      incoming.setAttribute('aria-hidden','false');
      incoming.style.zIndex='230';
      outgoing.style.zIndex='220';
      incoming.style.transition='none';
      incoming.style.opacity='0';
      incoming.style.visibility='visible';
      incoming.style.transform=cardTransform(dir*74);
      outgoing.style.transition='transform '+CARD_TRANSITION_MS+'ms ease-out, opacity '+CARD_TRANSITION_MS+'ms ease-out';
      syncCardControls();
      requestAnimationFrame(()=>{
        incoming.style.transition='transform '+CARD_TRANSITION_MS+'ms ease-out, opacity '+CARD_TRANSITION_MS+'ms ease-out';
        outgoing.style.transform=cardTransform(-dir*74);
        outgoing.style.opacity='0';
        incoming.style.transform=cardTransform(0);
        incoming.style.opacity='1';
      });
      window.setTimeout(()=>{
        if(serial!==transitionSerial) return;
        outgoing.classList.remove('is-active','is-front');
        outgoing.setAttribute('aria-hidden','true');
        outgoing.style.transition='';
        outgoing.style.opacity='0';
        outgoing.style.transform=cardTransform(0);
        incoming.style.transition='';
        updateDevCardState();
      }, CARD_TRANSITION_MS+30);
      requestSceneRender();
      applyState();
      return activeCardIndex;
    }
    function goPrev(){ return goToCard(activeCardIndex-1, -1); }
    function goNext(){ return goToCard(activeCardIndex+1, 1); }
    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);

    let dragState=null;
    devStage.addEventListener('pointerdown', e=>{
      if(e.button!==undefined && e.button!==0) return;
      if(e.target.closest('button')) return;
      dragState={ id:e.pointerId, x:e.clientX, y:e.clientY, locked:false };
      devStage.setPointerCapture(e.pointerId);
    });
    devStage.addEventListener('pointermove', e=>{
      if(!dragState || dragState.id!==e.pointerId) return;
      const dx=e.clientX-dragState.x;
      const dy=e.clientY-dragState.y;
      if(!dragState.locked && Math.abs(dx)>12 && Math.abs(dx)>Math.abs(dy)*1.2) dragState.locked=true;
      if(dragState.locked) e.preventDefault();
    });
    function finishDrag(e){
      if(!dragState || dragState.id!==e.pointerId) return;
      const dx=e.clientX-dragState.x;
      const dy=e.clientY-dragState.y;
      const horizontal=Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.25;
      if(horizontal){
        if(dx<0) goNext();
        else goPrev();
      }
      dragState=null;
    }
    devStage.addEventListener('pointerup', finishDrag);
    devStage.addEventListener('pointercancel', ()=>{ dragState=null; });
    window.addEventListener('keydown', e=>{
      if(!sectionInView || e.altKey || e.ctrlKey || e.metaKey) return;
      if(e.key==='ArrowLeft'){ e.preventDefault(); goPrev(); }
      if(e.key==='ArrowRight'){ e.preventDefault(); goNext(); }
    });
    window.addEventListener('resize', updateDevCardState);

    resize();
    applyState();
    updateDevCardState();
    cardEls.forEach((el,idx)=>{
      el.style.transform=cardTransform(0);
      el.style.opacity=idx===activeCardIndex ? '1' : '0';
      el.setAttribute('aria-hidden', idx===activeCardIndex ? 'false' : 'true');
    });


    /* #dev 進出視窗才 render（IntersectionObserver 效能閘） */
    new IntersectionObserver(es=>{
      sectionInView=es[0].isIntersecting;
      if(sectionInView){ lastFrameTime=0; requestSceneRender(); }
    }, {threshold:0, rootMargin:'120px 0px'}).observe(document.getElementById('dev'));

    const t0=performance.now();
    function loop(now){
      rafId=requestAnimationFrame(loop);
      if(!QA_MODE && !renderActive()){
        cancelAnimationFrame(rafId);
        rafId=0;
        return;
      }
      const elapsed=now-lastFrameTime;
      const forceQaFrame=QA_MODE && qaFramesRemaining>0;
      if(elapsed<TARGET_FRAME_MS && !needsRender && !forceQaFrame) return;
      lastFrameTime=now-(elapsed%TARGET_FRAME_MS);
      const t=QA_MODE ? 0.75 : (performance.now()-t0)/1000;
      if(forceQaFrame || now-lastCodeFrameTime>=FX.codeFrameMs){
        drawInnerRain(t);
        lastCodeFrameTime=now;
      }
      renderer.render(scene, camera);
      needsRender=false;
      if(forceQaFrame){
        qaFramesRemaining--;
        needsRender=qaFramesRemaining>0;
      }
    }
    document.addEventListener('visibilitychange',()=>{
      if(!QA_MODE && document.hidden){
        if(rafId){
          cancelAnimationFrame(rafId);
          rafId=0;
        }
      }else{
        lastFrameTime=0;
        requestSceneRender();
      }
    });
    requestSceneRender();
