// 內頁共用 JS：導覽列捲動、手機選單、Cookie 同意（GA4 只在「接受所有」後載入）。
(function () {
  var GA4_ID = 'G-MXV88FLJ64';
  var KEY = 'nd_cookie';

  // 導覽列捲動變色
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 20); };
    onScroll(); addEventListener('scroll', onScroll, { passive: true });
  }
  // 手機選單
  var burger = document.querySelector('.nav__burger'), links = document.querySelector('.nav__links');
  if (burger && links) burger.addEventListener('click', function () { links.classList.toggle('open'); });

  // GA4：同意後才載入
  function loadGA() {
    if (window.__ga_loaded) return; window.__ga_loaded = true;
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', GA4_ID);
  }

  // Cookie 橫幅
  var banner = document.querySelector('.cookie');
  var choice = null; try { choice = localStorage.getItem(KEY); } catch (e) {}
  if (choice === 'all') loadGA();
  else if (!choice && banner) {
    banner.classList.add('show');
    var set = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} banner.classList.remove('show'); if (v === 'all') loadGA(); };
    var a = banner.querySelector('.accept'), d = banner.querySelector('.decline');
    if (a) a.addEventListener('click', function () { set('all'); });
    if (d) d.addEventListener('click', function () { set('essential'); });
  }
})();
