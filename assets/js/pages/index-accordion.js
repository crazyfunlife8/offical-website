/* ============================================================
   pages/index-accordion.js — 數位行銷手風琴（4 卡）
   來源 index-rain-preview.html IIFE；背景圖路徑 _imgtest/ -> assets/images/services/。
   ============================================================ */
    (function(){
      const root=document.querySelector('.svc-accordion');
      if(!root) return;
      const DATA=[
        { key:'social', n:'01', cjk:'社群經營', en:'SOCIAL', echo:'Your brand, always on.',
          lead:'不只是代發文。策略、內容、發布、互動、數據，一條龍把帳號養成會自己長大的品牌資產。',
          social:true, art:'assets/images/services/social-mix-a2.png',
          acts:'<b>海巡漲粉</b> · <b>內容製作</b>（圖文/短影音）· <b>互動經營</b> · <b>數據追蹤</b>',
          plans:[
            {n:'基礎行銷', p:'NT$3,800', u:'/月', d:'4 篇圖文 · 維持品牌曝光'},
            {n:'成長推廣', p:'NT$8,500', u:'/月', d:'8 篇圖文 · 數據分析＋方向建議', feat:true},
            {n:'整合行銷', p:'NT$21,000', u:'/月', d:'12 篇圖文 · 完整數據＋活動企劃'},
          ],
        },
        { key:'blog', n:'02', cjk:'部落格代營運', en:'SEO CONTENT', echo:'Traffic that compounds.',
          lead:'用自動化內容產線，為你建立並長期經營 SEO 部落格，讓搜尋與 AI 都找得到你，把網站養成會自己長流量的引流資產。',
          art:'assets/images/services/blog4-b.png',
          flow:'<b>選題對準搜尋意圖</b> · <b>AI 輔助產文</b> · <b>SEO/GEO 結構化</b> · <b>自動發布＋收錄追蹤</b>',
          proof:[{n:'16',l:'專責 AI 代理'},{n:'60+',l:'道品質把關'},{n:'5',l:'站自有實證'}],
          price:'依規模規劃 · 訂閱式長期經營',
        },
        { key:'ads', n:'03', cjk:'廣告投放', en:'PAID ADS', echo:'Spend that performs.',
          lead:'跨 FB/IG/TikTok 代客操盤，含影片與短影音廣告，把每一塊投放預算都盯成看得見的成效。',
          art:'assets/images/services/ads2-a.png',
          flow:'<b>素材企劃</b>（含影片/短影音）· <b>帳號設定</b> · <b>出價優化</b> · <b>成效回報</b>',
          flowLabel:'操盤流程',
          proof:[{n:'3',l:'平台同步代操'},{n:'10–25%',l:'成效抽成'},{n:'4',l:'步驟全包'}],
          bgx:65,
        },
        { key:'ai', n:'04', cjk:'AI 形象網紅', en:'AI TALENT', echo:'A face that never tires.',
          lead:'為企業打造可長期經營的專屬虛擬代言人，無出鏡包袱、形象完全可控。標準只有一個：做到沒有 AI 感。',
          art:'assets/images/services/ai-particle-a-sq.png',
          flow:'<b>人設與世界觀</b> · <b>視覺形象</b> · <b>長期內容經營</b> · <b>角色版權歸品牌</b>',
          flowLabel:'角色系統',
          proof:[{n:'3',l:'倍互動率勝真人'},{n:'100%',l:'形象可控'},{n:'0',l:'真人翻車風險'}],
          price:'詢價制', bgs:400,
        },
      ];
      const MURAL='mural-j.png';
      const acc=root.querySelector('.acc');
      DATA.forEach((s,i)=>{
        const p=document.createElement('div');
        p.className='panel';
        if(s.key) p.dataset.key=s.key;
        p.tabIndex=0; p.setAttribute('role','button');
        p.setAttribute('aria-expanded','false');
        p.setAttribute('aria-label', s.cjk);
        let body='';
        if(s.social){
          body=`
            <div class="head"><span class="kicker">數位行銷 / ${s.en}</span><span class="bignum">${s.n}</span></div>
            <div class="sbody">
              <div class="copy">
                <h3 class="title">${s.cjk}</h3>
                <p class="en">${s.echo}</p>
                <p class="lead">${s.lead}</p>
              </div>
              <div class="deal">
                <div class="meta"><div class="ml">日常動作</div><div class="acts">${s.acts}</div></div>
                <div class="offer">
                  ${s.plans.map(pl=>`
                    <a class="offer-row${pl.feat?' feat':''}" href="contact.html">
                      <span class="offer-name">${pl.n}${pl.feat?'<span class="rec">推薦</span>':''}</span>
                      <span class="offer-note">${pl.d}</span>
                      <span class="offer-price">${pl.p}<small>${pl.u}</small>${pl.feat?'<span class="ar">→</span>':''}</span>
                    </a>`).join('')}
                </div>
                <a class="cta" href="contact.html">想開始經營 <span class="ar">→</span></a>
              </div>
            </div>`;
        }else if(s.flow){
          body=`
            <div class="head"><span class="kicker">數位行銷 / ${s.en}</span><span class="bignum">${s.n}</span></div>
            <div class="sbody">
              <div class="copy">
                <h3 class="title">${s.cjk}</h3>
                <p class="en">${s.echo}</p>
                <p class="lead">${s.lead}</p>
                <div class="meta"><div class="ml">${s.flowLabel||'內容產線'}</div><div class="acts">${s.flow}</div></div>
              </div>
              <div class="deal">
                <div class="proof">
                  ${s.proof.map(pf=>`<div class="stat"><b>${pf.n}</b><span>${pf.l}</span></div>`).join('')}
                </div>
                ${s.price?`<p class="priceline">${s.price}</p>`:''}
                <a class="cta" href="contact.html">想了解更多 <span class="ar">→</span></a>
              </div>
            </div>`;
        }else{
          body=`
            <div class="head"><span class="kicker">數位行銷 / ${s.en}</span><span class="bignum">${s.n}</span></div>
            <div>
              <h3 class="title">${s.cjk}</h3>
              <p class="en">${s.echo}</p>
              <p class="lead">${s.lead}</p>
              <p class="priceline">${s.price}</p>
              <a class="cta" href="contact.html">想了解更多 <span class="ar">→</span></a>
            </div>`;
        }
        const px = (s.bgx != null ? s.bgx : i/3*100);
        const bgs = (s.bgs != null ? s.bgs : 440);
        const bg = `<div class="bgimg" style="background-image:url('assets/images/services/${MURAL}'); background-size:${bgs}% 100%; background-position:${px.toFixed(2)}% center;"></div>`;
        p.innerHTML=`${bg}
          <div class="spine"><span class="num">${s.n}</span><div class="spine__cols"><span class="v">${s.cjk}</span><span class="ven">${s.en}</span></div></div>
          <div class="body"><div class="bgart" style="background-image:url('${s.art}')"></div>${body}</div>`;
        acc.appendChild(p);
      });
      const panels=[...root.querySelectorAll('.panel')];
      let deckMode=false;
      function openIdx(idx){ panels.forEach((p,j)=>{ const on=j===idx; p.classList.toggle('open',on); p.setAttribute('aria-expanded',on?'true':'false'); }); }
      function toggle(p,i){ if(p.classList.contains('open')){ p.classList.remove('open'); p.setAttribute('aria-expanded','false'); } else { openIdx(i); } }
      panels.forEach((p,i)=>{
        /* 桌機：點卡＝手風琴展開。手機（deckMode）：交給牌組控制器，這裡不處理 */
        p.addEventListener('click',()=>{ if(deckMode) return; toggle(p,i); });
        p.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault();
          if(deckMode){ if(i===deck.active) deck.expand(i); else deck.setActive(i); } else toggle(p,i); } });
      });

      const reduceMotion=window.matchMedia('(prefers-reduced-motion:reduce)').matches;

      /* ── 手機堆疊牌組（≤820px）：單卡置中、左右拖曳換卡、點焦點卡就地展開 ──
         以使用者體驗最佳為準則設計；桌機完全沿用上方手風琴邏輯、不受影響。
         牌位 transform 由 layout() 依與焦點卡距離 d 即時算出（inline style），
         CSS 只負責 .is-deck 基底定位與過渡。 */
      const deck=(function(){
        const STEP_RATIO=0.64;   /* 鄰卡距中心 = 容器寬 × 此值；平時在畫面外淡出，拖曳時才滑入（單卡顯示）*/
        let active=0, dots=null, closeBtn=null, built=false;
        let sx=0,sy=0,dragging=false,decided=false,horiz=false,moved=false;

        function build(){
          if(built) return; built=true;
          dots=document.createElement('div'); dots.className='svc-deck-dots is-hidden'; dots.setAttribute('role','tablist'); dots.setAttribute('aria-label','服務切換');
          /* 宇宙元素導引點：星／月／日／土星，取代圓點（小巧思，呼應深空＋月面碑刻主題；fill/stroke 用 currentColor 由 CSS 控亮暗）*/
          const COSMIC=[
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1 13.9 10.1 23 12 13.9 13.9 12 23 10.1 13.9 1 12 10.1 10.1Z"/></svg>',
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
            '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4.1" fill="currentColor" stroke="none"/><path d="M12 1.6V4M12 20v2.4M1.6 12H4M20 12h2.4M4.7 4.7 6.4 6.4M17.6 17.6l1.7 1.7M4.7 19.3 6.4 17.6M17.6 6.4l1.7-1.7"/></svg>',
            '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="11" r="5" fill="currentColor"/><ellipse cx="12" cy="11" rx="10" ry="3.3" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(-20 12 11)"/></svg>'
          ];
          panels.forEach((p,i)=>{
            const b=document.createElement('button'); b.type='button'; b.className='svc-deck-dot';
            b.setAttribute('aria-label', p.getAttribute('aria-label')||('服務 '+(i+1)));
            b.innerHTML=COSMIC[i % COSMIC.length];
            b.addEventListener('click',()=>{ if(acc.classList.contains('is-open')) collapse(); setActive(i); });
            dots.appendChild(b);
          });
          acc.after(dots);
          closeBtn=document.createElement('button'); closeBtn.type='button'; closeBtn.className='svc-deck-close';
          closeBtn.setAttribute('aria-label','收合服務');
          closeBtn.innerHTML='<span aria-hidden="true">✕</span>';
          closeBtn.addEventListener('click',collapse);
          dots.after(closeBtn);
        }
        function updateDots(){ if(!dots) return; [...dots.children].forEach((d,i)=>d.classList.toggle('is-active',i===active)); }

        function layout(dragPx){
          dragPx=dragPx||0;
          const STEP=(acc.clientWidth||320)*STEP_RATIO;   /* 鄰卡平移距離（px）*/
          panels.forEach((p,i)=>{
            if(p.classList.contains('open')) return;
            const d=i-active;
            const x=d*STEP+dragPx;                          /* 距畫面中心的位移 */
            const dist=Math.abs(x);
            /* 單卡：只有貼近中心的卡可見；鄰卡平時在外側淡出，拖曳滑入時才漸顯（無常駐堆疊）*/
            p.style.zIndex=String(d===0?40:30-Math.abs(d));
            p.style.opacity=String(Math.max(0, 1 - dist/(STEP*0.82)));
            p.style.filter='none';
            p.style.pointerEvents=(d===0?'auto':'none');
            p.style.transform=`translateX(calc(-50% + ${x}px))`;   /* 不縮放、不下沉：純單卡平移 */
          });
          const a=panels[active];
          if(a && !a.classList.contains('open')) acc.style.setProperty('--deck-h',(a.offsetHeight+14)+'px');
        }
        function clearInline(){ panels.forEach(p=>{ p.style.transform=''; p.style.opacity=''; p.style.zIndex=''; p.style.filter=''; p.style.pointerEvents=''; }); }

        function setActive(i){ active=Math.max(0,Math.min(panels.length-1,i)); updateDots(); layout(0); }
        function expand(i){ setActive(i); clearInline(); const p=panels[i]; p.style.animation=''; p.style.transition=''; p.style.transform=''; openIdx(i); acc.classList.add('is-open'); if(dots) dots.classList.add('is-hidden'); }
        function finishCollapse(){ panels.forEach(p=>{ p.classList.remove('open'); p.setAttribute('aria-expanded','false'); p.style.transition=''; p.style.animation=''; }); acc.classList.remove('is-open'); if(dots) dots.classList.remove('is-hidden'); layout(0); }
        function collapse(){
          const openP=panels.find(p=>p.classList.contains('open'));
          if(openP && !reduceMotion){
            openP.style.animation='none';                               /* 停掉滑入動畫 */
            openP.style.transition='transform .32s cubic-bezier(.4,0,1,1)';
            requestAnimationFrame(()=>{ openP.style.transform='translateY(100%)'; });   /* 滑下退場 */
            let done=false; const fin=()=>{ if(done)return; done=true; openP.style.transform=''; finishCollapse(); };
            openP.addEventListener('transitionend',fin,{once:true});
            setTimeout(fin,400);                                        /* fallback 防 transitionend 沒觸發 */
          } else { finishCollapse(); }
        }

        function onDown(e){ if(!deckMode||acc.classList.contains('is-open')) return; sx=e.clientX; sy=e.clientY; dragging=true; decided=false; horiz=false; moved=false; }
        function onMove(e){ if(!dragging) return; const dx=e.clientX-sx, dy=e.clientY-sy;
          if(!decided && (Math.abs(dx)>5||Math.abs(dy)>5)){ decided=true; horiz=Math.abs(dx)>Math.abs(dy)*1.2; if(horiz) acc.classList.add('is-dragging'); }
          if(decided&&horiz){ moved=true; if(e.cancelable) e.preventDefault(); layout(dx*0.9); } }
        function onUp(e){ if(!dragging) return; dragging=false; acc.classList.remove('is-dragging');
          if(decided&&horiz){ const dx=e.clientX-sx, TH=(acc.clientWidth||300)*0.16;
            if(dx<=-TH) setActive(active+1); else if(dx>=TH) setActive(active-1); else layout(0);
          } else if(!moved){
            const el=document.elementFromPoint(e.clientX,e.clientY);
            const panel=el&&el.closest?el.closest('.panel'):null;
            if(panel){ const i=panels.indexOf(panel); if(i>=0){ i===active?expand(i):setActive(i); } }
          } }
        function onCancel(){ dragging=false; acc.classList.remove('is-dragging'); layout(0); }

        function enter(){ deckMode=true; build(); acc.classList.add('is-deck');
          const o=panels.findIndex(p=>p.classList.contains('open'));
          panels.forEach(p=>{ p.classList.remove('open'); p.setAttribute('aria-expanded','false'); });
          acc.classList.remove('is-open'); if(dots) dots.classList.remove('is-hidden');
          active=o>=0?o:0; updateDots(); layout(0);
          acc.addEventListener('pointerdown',onDown);
          acc.addEventListener('pointermove',onMove,{passive:false});
          window.addEventListener('pointerup',onUp);
          acc.addEventListener('pointercancel',onCancel);
        }
        function leave(){ deckMode=false; acc.classList.remove('is-deck','is-open','is-dragging');
          if(dots) dots.classList.add('is-hidden');
          clearInline(); panels.forEach(p=>{ p.classList.remove('open'); p.setAttribute('aria-expanded','false'); });
          acc.style.removeProperty('--deck-h');
          acc.removeEventListener('pointerdown',onDown);
          acc.removeEventListener('pointermove',onMove);
          window.removeEventListener('pointerup',onUp);
          acc.removeEventListener('pointercancel',onCancel);
        }
        return { enter, leave, setActive, expand, get active(){ return active; } };
      })();

      const mqMobile=window.matchMedia('(max-width:820px)');
      function syncMode(){ if(mqMobile.matches) deck.enter(); else deck.leave(); }
      if(mqMobile.addEventListener) mqMobile.addEventListener('change',syncMode); else mqMobile.addListener(syncMode);
      syncMode();
      /* 進場滑動提示已移除：下方導引點已明確表達「多卡可切換」，無需再以動態暗示可滑（2026-06-23 創辦人定）*/
    })();
