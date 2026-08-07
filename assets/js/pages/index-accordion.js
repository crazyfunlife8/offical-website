/* ============================================================
   pages/index-accordion.js — 服務六張卡片網格（A方案 3×2）
   月面碑刻視覺語言，靜態連結到各服務頁。
   ============================================================ */
(function(){
  const root = document.querySelector('.svc-grid');
  if (!root) return;

  const MURAL = 'assets/images/services/sixservices.png';

  // bgx/bgy 對應 sixservices.png 3×2 格位置（background-size:315% 210%，放大 5% 裁掉 panel 邊框）
  // 圖片佈局：上排 社群經營／SEO 部落格撰寫／跳動E投放；下排 AI形象網紅／一鍵式架站／預約系統
  // 位置計算：左欄 bgx≈1，中欄 bgx=50，右欄 bgx≈99；上排 bgy≈2，下排 bgy≈98
  const DATA = [
    { n:'01', cjk:'跳動E投放',     en:'TIKTOK ADS',  desc:'900 元就能投 TikTok 廣告',  price:'手續費 25% 起，首投免費', href:'services/ads.html',          bgx:99,  bgy:2   },
    { n:'02', cjk:'一鍵式架站',    en:'QUICK SITE',  desc:'填四個欄位，看三個版型',      price:'一年 NT$5,000',          href:'quick-site.html',             bgx:50,  bgy:98  },
    { n:'03', cjk:'AI形象網紅',    en:'AI TALENT',   desc:'一個不會爆雷的代言人',        price:'月費 NT$18,000 起',      href:'services/ai-influencer.html', bgx:1,   bgy:98  },
    { n:'04', cjk:'SEO 部落格撰寫', en:'SEO CONTENT', desc:'一個月四篇，關鍵字到上稿', price:'月費 NT$12,000 起',      href:'services/seo.html',           bgx:50,  bgy:2   },
    { n:'05', cjk:'社群經營',      en:'SOCIAL',      desc:'影片、文案可以只買一個',      price:'NT$8,000 起',            href:'services/social.html',        bgx:1,   bgy:2   },
    { n:'06', cjk:'預約系統',      en:'BOOKING',     desc:'還沒好。好了會說。',          price:'Coming Soon',            href:'services/booking.html',       bgx:99,  bgy:98, soon:true },
  ];

  DATA.forEach(s => {
    const a = document.createElement('a');
    a.className = 'svc-card' + (s.soon ? ' svc-card--soon' : '');
    a.href = s.href;
    a.setAttribute('aria-label', s.cjk);

    a.innerHTML = `
      <div class="svc-card__bg" style="background-image:url('${MURAL}');background-size:315% 210%;background-position:${s.bgx}% ${s.bgy}%;"></div>
      <div class="svc-card__overlay"></div>
      <div class="svc-card__top">
        <div class="svc-card__label">
          <span class="svc-card__cjk">${s.cjk}</span>
        </div>
      </div>
      <div class="svc-card__foot">
        <p class="svc-card__desc">${s.desc}</p>
        <p class="svc-card__price">${s.price}</p>
        ${s.soon ? '' : '<p class="svc-card__cta">看方案<span class="svc-card__arrow" aria-hidden="true">→</span></p>'}
      </div>`;

    root.appendChild(a);
  });
})();
