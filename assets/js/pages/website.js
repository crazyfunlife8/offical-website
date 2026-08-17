/* ============================================================
   pages/website.js — Demo carousel for services/website.html
   ============================================================ */
(function () {
    const carousel = document.querySelector('.svc-demo__carousel');
    if (!carousel) return;

    const panels  = Array.from(carousel.querySelectorAll('.svc-demo__panel'));
    const prevBtn = carousel.querySelector('.svc-demo__arrow--prev');
    const nextBtn = carousel.querySelector('.svc-demo__arrow--next');
    const counter = document.querySelector('.svc-demo__counter');
    const total   = panels.length;
    let   current = 0;

    // 動態注入 dot 導引點，插在 carousel 之後
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'svc-demo__dots';
    dotsWrap.setAttribute('aria-hidden', 'true');
    panels.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'svc-demo__dot';
        dot.type = 'button';
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });
    carousel.insertAdjacentElement('afterend', dotsWrap);
    const dots = dotsWrap.querySelectorAll('.svc-demo__dot');

    function goTo(n) {
        panels[current].classList.remove('is-active');
        dots[current].classList.remove('is-active');
        current = ((n % total) + total) % total;
        panels[current].classList.add('is-active');
        dots[current].classList.add('is-active');
        if (counter) counter.textContent = `${current + 1} / ${total}`;
    }

    goTo(0);

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));
})();
