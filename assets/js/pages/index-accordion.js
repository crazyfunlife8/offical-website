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
      function openIdx(idx){ panels.forEach((p,j)=>{ const on=j===idx; p.classList.toggle('open',on); p.setAttribute('aria-expanded',on?'true':'false'); }); }
      function toggle(p,i){ if(p.classList.contains('open')){ p.classList.remove('open'); p.setAttribute('aria-expanded','false'); } else { openIdx(i); } }
      panels.forEach((p,i)=>{
        p.addEventListener('click',()=>toggle(p,i));
        p.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(p,i); } });
      });

      /* 可左右滑訊號：手機進場時整排輕推一下再彈回，露出下一張石碑（最直覺的滑動教學）。
         IntersectionObserver 只觸發一次；尊重 prefers-reduced-motion。 */
      const isMobile = window.matchMedia('(max-width:820px)').matches;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
      if(isMobile && !reduceMotion){
        let nudged=false;
        const io=new IntersectionObserver(es=>{
          if(es[0].isIntersecting && !nudged){
            nudged=true; io.disconnect();
            setTimeout(()=>{
              acc.scrollTo({left:Math.round(acc.clientWidth*0.34), behavior:'smooth'});
              setTimeout(()=>acc.scrollTo({left:0, behavior:'smooth'}), 620);
            }, 650);
          }
        }, {threshold:0.35});
        io.observe(root);
      }
    })();
