/* ============================================================
   pages/index-glass-stack.js — 軟體開發 · 程式碼隧道（CSS 3D，無 WebGL）
   2026-06-24 WebGL 落雨退場 → CSS 3D 多層 DOM 落雨（demo-liquid/dev-rain-css3d-sandbox.html 定版）。
   保留：3 服務卡切換（左右滑 / 鍵盤 / 導引點）、卡片透視傾斜、ghost/grain/codebar/knum/L2 襯底。
   移除：整套 Three.js（renderer/scene/camera/glassGroup/drawInnerRain/render loop/QA_MODE）。
   雨參數（persp/layers/gap/comp/fog/dof/fall/parallax/density）由 .dev-glass-stack CSS 變數帶入。
   WebGL 玻璃/落雨版還原點：git commit 442b261 / 93e3db4 / 65582e4 / a7414dc。
   type=module 載入：保留模組作用域，避免 top-level const 與 index.js 全域衝突（如 scene）。
   ============================================================ */
    const cssRoot=document.getElementById('devGlassStack');
    const devStage=document.getElementById('devCardStage');
    const rainScene=document.getElementById('devRainScene');
    const prevBtn=document.getElementById('devCardPrev');
    const nextBtn=document.getElementById('devCardNext');
    const dotsWrap=document.getElementById('devCardDots');
    const deck=document.getElementById('devStackDeck');

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

    /* 落雨碼字庫（沿用 #dev-rain / n4rain 血統） */
    const CODE=[
      'const nest = createStudio()','export default function App() {','<section class="services">',
      'router.get("/api/orders", fn)','await db.clients.findMany()','npm run build && deploy',
      'return <Card {...props} />','useEffect(() => render(), [])','if (user.ready) launch()',
      'SELECT * FROM orders;','transform: translateY(-4px)','git commit -m "ship it"'
    ];

    const hash=(a,b)=>{ const x=Math.sin(a*127.1+b*311.7)*43758.5453; return x-Math.floor(x); };
    const getNum=(k)=>parseFloat(getComputedStyle(cssRoot).getPropertyValue(k))||0;

    /* ===== 建 3 張服務卡（ghost 浮水印 / grain / codebar / content：knum + lead + svccol）===== */
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

    /* ===== CSS 3D 多層程式碼隧道：旋轉直條 bar 在 z 軸多層墜落 ===== */
    function buildRain(){
      rainScene.innerHTML='';
      const N=Math.round(getNum('--layers'));
      const gap=getNum('--gap');
      const persp=getNum('--persp');
      const comp=getNum('--comp');
      const fog=getNum('--fog');
      const dof=getNum('--dof');
      const fall=getNum('--fall');
      const par=getNum('--parallax');
      const breadth=getNum('--breadth')||1.5;
      const isMobile=window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
      let dens=Math.round(getNum('--density'));
      if(isMobile) dens=Math.max(5, Math.round(dens*0.6));   // 手機降密度省效能
      const barsPerCol=Math.max(1, Math.round(getNum('--barsPerCol'))||2);
      for(let i=0;i<N;i++){
        const t = N>1 ? i/(N-1) : 0;                          // 0=近 1=遠
        const z = -gap*i;
        const fullComp=(persp+gap*i)/persp;                   // 完全補償=填滿(會變平)
        const scl=1+(fullComp-1)*comp;                        // 部分補償=遠層真縮小=隧道縱深
        const layer=document.createElement('div');
        layer.className='dev-rain-layer';
        const bright=1-fog*t*0.82, sat=1-t*0.3, blur=dof*t;   // 遠層：暗(fog)+偏藍+模糊(dof)
        layer.style.transform=`translateZ(${z}px) scale(${scl.toFixed(3)})`;
        layer.style.opacity=(1-t*0.18).toFixed(2);
        layer.style.filter=`brightness(${bright.toFixed(2)}) saturate(${sat.toFixed(2)}) blur(${blur.toFixed(2)}px)`;
        layer.style.zIndex=String(100-i);
        const fontPx=(15-t*3).toFixed(1);
        const dur=fall*(1+par*i);                             // 遠層更慢=視差
        /* 落雨廣度：遠層透視下縮小→橫向覆蓋變窄，依視覺縮放反向加寬 own-space 鋪設，
           讓每層在畫面上都覆蓋 breadth×視窗寬（>1 留邊，傾斜時兩側仍有遠景雨、不空）*/
        const apparentScale=scl*(persp/(persp+gap*i));        // ≤1，遠層更小
        const spanPct=100*breadth/apparentScale;              // own-space 鋪設寬（遠層更寬）
        const cols=Math.max(4, Math.round(dens*breadth));     // 柱數定值＝維持各層視覺密度一致、遠層不再變稀
        for(let c=0;c<cols;c++){
          const x=50 - spanPct/2 + (c+0.5)/cols*spanPct + (hash(i*7+c,3)-0.5)*(spanPct/cols*0.6);
          const r=hash(i*13+c,9);
          const base = r<0.12 ? '255,199,9' : r<0.34 ? '0,200,255' : '150,180,235';
          for(let b=0;b<barsPerCol;b++){
            const wrap=document.createElement('div');
            wrap.className='bar-wrap';
            wrap.style.left=x.toFixed(2)+'%';
            wrap.style.animationDuration=dur.toFixed(1)+'s';
            wrap.style.animationDelay=(-(hash(i*5+c,11+b))*dur).toFixed(1)+'s';
            const bar=document.createElement('div');
            bar.className='bar';
            bar.style.fontSize=fontPx+'px';
            bar.style.setProperty('--bc',base);
            bar.textContent=CODE[(c*3+b*5+i*2)%CODE.length];
            wrap.appendChild(bar);
            layer.appendChild(wrap);
          }
        }
        rainScene.appendChild(layer);
      }
    }

    /* ===== 單卡左右滑：HTML 內容層 slide/fade（卡片透視傾斜沿用原 cardTransform）===== */
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
      return activeCardIndex;
    }
    function goPrev(){ return goToCard(activeCardIndex-1, -1); }
    function goNext(){ return goToCard(activeCardIndex+1, 1); }
    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);

    /* ===== 拖曳切卡 ===== */
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

    /* ===== 鍵盤切卡（僅 #dev 在視窗內時）===== */
    let sectionInView=true;
    window.addEventListener('keydown', e=>{
      if(!sectionInView || e.altKey || e.ctrlKey || e.metaKey) return;
      if(e.key==='ArrowLeft'){ e.preventDefault(); goPrev(); }
      if(e.key==='ArrowRight'){ e.preventDefault(); goNext(); }
    });

    /* ===== 初始化 ===== */
    buildRain();
    updateDevCardState();
    cardEls.forEach((el,idx)=>{
      el.style.transform=cardTransform(0);
      el.style.opacity=idx===activeCardIndex ? '1' : '0';
      el.setAttribute('aria-hidden', idx===activeCardIndex ? 'false' : 'true');
    });

    /* #dev 離開視窗：暫停雨動畫（效能閘）＋ 關閉鍵盤切卡 */
    new IntersectionObserver(es=>{
      sectionInView=es[0].isIntersecting;
      rainScene.classList.toggle('dev-rain-paused', !sectionInView);
    }, {threshold:0, rootMargin:'120px 0px'}).observe(document.getElementById('dev'));

    /* resize：debounce 重建雨（跨手機/桌機斷點時密度才需變）*/
    let resizeTimer=0;
    window.addEventListener('resize', ()=>{
      clearTimeout(resizeTimer);
      resizeTimer=window.setTimeout(buildRain, 250);
    });
